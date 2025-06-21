import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { generateEmailHTML } from "../../../src/lib/formatEmailHTML.js";

// Set up Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);
console.log("🔐 SENDGRID_API_KEY prefix:", (Deno.env.get("SENDGRID_API_KEY") || "undefined").slice(0, 5));
console.log("📬 Target email:", profile?.email);

console.log("🔐 SENDGRID_API_KEY prefix:", Deno.env.get("SENDGRID_API_KEY")?.slice(0, 5));

serve(async (req) => {
  // 🔁 Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // 🔒 Parse JSON body
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response("Invalid JSON", {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const { user, articles } = body;

  if (!user?.email || !articles?.length) {
    return new Response("Missing data", {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const html = generateEmailHTML(articles);

  const sendRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("SENDGRID_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: user.email }] }],
      from: { email: "noreply@feediant.com", name: "Feediant" },
      subject: "🧠 Your Crypto Digest",
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!sendRes.ok) {
    const errorText = await sendRes.text();
    return new Response(`Sendgrid error: ${errorText}`, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return new Response("Email sent", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
});
