export function extractImage(article, platformIcons, platform) {
  return (
    article["media:content"]?.url ||
    article.enclosure?.link ||
    (() => {
      const matchDesc = article.description?.match(
        /<img[^>]+src=["']([^"'>]+)["']/i
      );
      if (matchDesc?.[1]) return matchDesc[1];

      const bgMatch = article.description?.match(
        /background-image:\s*url\(["']?([^"')]+)["']?\)/i
      );
      if (bgMatch?.[1]) return bgMatch[1];

      return platformIcons[platform];
    })()
  );
}
