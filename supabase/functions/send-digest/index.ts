import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { summarizeWithOpenAI } from "./summarizer.js";
import { fetchArticles } from "./fetchArticles.js";
import { generateEmailHTML } from "./formatEmailHTML.js";

// Set up Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);

console.log("🔐 SENDGRID_API_KEY prefix:", (Deno.env.get("SENDGRID_API_KEY") || "undefined").slice(0, 5));

serve(async () => {
  const { data: feedConfigs, error } = await supabase
    .from("feeds")
    .select("*")
    .eq("frequency", "daily");

  if (error) {
    console.error("❌ Error fetching feeds:", error.message);
    return new Response("Failed to fetch feeds", { status: 500 });
  }

  for (const config of feedConfigs) {
    const { user_id, sources, keywords, summary_format } = config;

    const { data: profile } = await supabase
      .from("profile")
      .select("email")
      .eq("id", user_id)
      .single();

    if (!profile?.email) {
      console.warn("⚠️ No email found for user:", user_id);
      continue;
    }

    console.log(`📬 Target email: ${profile.email}`);

    const { articles } = await fetchArticles({
      feeds: sources.map((url) => ({ url, platform: "rss", valid: true })),
      selectedKeywords: (keywords || []).map((k) => ({ value: k })),
      summaryType: summary_format,
      user: { id: user_id },
      saveFeedToSupabase: () => {}, // skip DB logging
      platformIcons: {}, // optional
    });

    if (!articles.length) {
      console.log(`🛑 No articles for ${profile.email}`);
      continue;
    }

    const html = generateEmailHTML(articles);

    const sendRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("SENDGRID_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: profile.email }] }],
        from: { email: "noreply@feediant.com", name: "Feediant" },
        subject: "🧠 Your Daily Crypto Digest",
        content: [{ type: "text/html", value: html }],
      }),
    });

    if (!sendRes.ok) {
      const errorText = await sendRes.text();
      console.error(`❌ Failed to send to ${profile.email}:`, errorText);
    } else {
      console.log(`✅ Email sent to ${profile.email}`);
    }
  }

  return new Response("Digest processed", { status: 200 });
});
