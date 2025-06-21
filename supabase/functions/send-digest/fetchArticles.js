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
