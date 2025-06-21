export async function fetchArticles({
  feeds,
  selectedKeywords,
  summaryType,
  user,
  saveFeedToSupabase,
  platformIcons,
}) {

  const keywordList = selectedKeywords.map((k) => k.value.toLowerCase());
  const newArticles = [];
  const chapterToggles = {};

  for (const feed of feeds) {
    console.log("🔍 Checking feed:", feed);

    if (!feed.url || feed.valid === false) {
      console.log("⛔ Skipping invalid feed:", feed.url);
      continue;
    }

    try {
      const res = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`
      );
      const data = await res.json();

      const items = Array.isArray(data.items) ? data.items : [];

      console.log(`📥 Got ${items.length} items from ${feed.url}`);

      if (items.length) {
        console.log("📰 Article titles from feed:");
        items.forEach((item, i) => {
          console.log(`  ${i + 1}. ${item.title}`);
        });
      }

      const matched = items.filter((item) =>
        keywordList.length === 0 ||
        keywordList.some(
          (kw) =>
            item.title.toLowerCase().includes(kw) ||
            item.description.toLowerCase().includes(kw)
        )
      );

      console.log(
        `🎯 ${matched.length} matched articles with keywords:`,
        keywordList
      );

      // If articles matched, you would continue to summarize + push to newArticles[]
      // For now, this is the basic structure.

    } catch (err) {
      console.warn("❌ Feed failed:", feed.url, err);
    }
  }

  console.log("✅ Returning articles:", newArticles.length);
  return { articles: newArticles, chapterToggles };
}
