// src/lib/fetchArticles.js
import { summarizeWithOpenAI } from "./summarizer";
import { fetchYoutubeDescription } from "./fetchFeeds";
import { stripHtml, extractChapters } from "./utils";
import { extractImage } from "./imageExtractor";


export async function fetchArticles({
  feeds,
  selectedKeywords,
  summaryType,
  user,
  saveFeedToSupabase,
  platformIcons,
}) {
  console.log("📡 fetchArticles called with:", {
    feeds,
    selectedKeywords,
    summaryType,
    user,
  });

  const keywordList = selectedKeywords.map((k) => k.value.toLowerCase());
  const newArticles = [];
  const chapterToggles = {};

  console.log("🔬 Raw feeds passed in:", feeds);

  for (const feed of feeds) {
    console.log("🔍 Checking feed:", feed);

    if (!feed.url || feed.valid === false) {
      console.log("⛔ Skipping invalid feed:", feed.url);
      continue;
    }

    try {
      const res = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
          feed.url
        )}`
      );
      const data = await res.json();

      console.log(`📥 Got ${data.items.length} items from ${feed.url}`);
      console.log("📦 Full feed items:", data.items);
      console.log("🔎 First article sample:", data.items[0]);


      if (Array.isArray(data.items)) {
  console.log("📰 Article titles from feed:");
  data.items.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.title}`);
  });
} else {
  console.warn("⚠️ Unexpected feed response format:", data);
}


      const matched = data.items.filter((item) =>
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

      if (matched.length === 0) continue;

      const article = matched[0];
      let raw = stripHtml(article.description);
      let chaptersHtml = "";

      if (feed.platform === "youtube") {
        const videoId =
          new URL(article.link).searchParams.get("v") ||
          article.link.split("/").pop();
        raw = await fetchYoutubeDescription(
          videoId,
          import.meta.env.VITE_YOUTUBE_API_KEY
        );
        chaptersHtml = extractChapters(raw, article.link);
      }

      const image = extractImage(article, platformIcons, feed.platform);


      const fullText = `${article.title}. ${raw}`;
      console.log("🧠 Sending to OpenAI:", fullText.slice(0, 200), "...");

      const summary = await summarizeWithOpenAI(fullText, summaryType);

      newArticles.push({ ...article, summary, feed, image, chaptersHtml });
      console.log("✅ Article added:", article.title);
    } catch (err) {
      console.warn("❌ Feed failed:", feed.url, err);
    }
  }

  if (user) {
    await saveFeedToSupabase({
      userId: user.id,
      name: "My Feed",
      feeds,
      keywords: selectedKeywords,
      summaryType,
    });
  }

  console.log("✅ Returning articles:", newArticles.length);
  return { articles: newArticles, chapterToggles };
}
