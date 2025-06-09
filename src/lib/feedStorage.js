// src/lib/feedStorage.js
import { supabase } from "./supabaseClient";

export async function saveFeedToSupabase({ userId, name, feeds, keywords, summaryType }) {
  const payload = {
    user_id: userId,
    name,
    sources: feeds,
    keywords,
    summary_format: summaryType,
  };

  const { data, error } = await supabase.from("feeds").insert([payload]);

  if (error) {
    console.error("❌ Feed save failed:", error.message);
  } else {
    console.log("✅ Feed saved to Supabase:", data);
  }

  return { data, error };
}
