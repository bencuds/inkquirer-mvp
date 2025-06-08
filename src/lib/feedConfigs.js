import { supabase } from "./supabaseClient";
export async function fetchUserConfigs(userId) {
  const { data, error } = await supabase
    .from("feeds")
    .select("*")
    .eq("user_id", userId)
    .order("inserted_at", { ascending: false });

  console.log("📡 Fetch result from Supabase:", { data, error });

  if (error) {
    console.error("❌ Error loading configs:", error.message);
    return [];
  }

  return data;
}

export async function saveFeedConfig({ userId, name, feeds, keywords, summaryType }) {
  const insertData = {
    user_id: userId,
    name,
    sources: feeds.map(f => f.url),
    keywords: keywords.map(k => k.value),
    summary_format: summaryType
  };

  console.log("📤 Insert data:", insertData);

  const { error } = await supabase.from("feeds").insert(insertData);

  if (error) {
    console.error("❌ Save failed:", error.message);
    alert("Failed to save config.");
  } else {
    alert("✅ Config saved!");
  }
}
