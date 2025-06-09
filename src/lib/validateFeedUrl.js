// src/lib/validateFeedUrl.js
export async function validateFeedUrl(url) {
  try {
    const encoded = encodeURIComponent(url);
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encoded}`);
    const data = await res.json();

    if (!data.items?.length) throw new Error("No items found");

    return {
      valid: true,
      name: data.feed?.title || new URL(url).hostname
    };
  } catch {
    return { valid: false, name: "" };
  }
}
