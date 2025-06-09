export function formatSummaryBlock({ title, url, date, source, tags, summary, summaryType, marketImpact }) {
  const typeIcons = {
    "TL;DR": "💡",
    "ELI5": "🧠",
    "Opinion": "🗣️",
    "3 Bullets": "•",
    "Single Paragraph": "✍️",
    "Market Impact": "📈"
  };

  const icon = typeIcons[summaryType] || "📰";
  const formattedTags = tags.join(", ");

  let summaryContent = "";

  if (summaryType === "3 Bullets" && Array.isArray(summary)) {
    summaryContent = summary.map(line => `• ${line}`).join("\n");
  } else if (summaryType === "Market Impact" && typeof summary === "string" && marketImpact) {
    summaryContent = `${icon} ${summary}\n\n📊 _Market Impact:_ ${marketImpact}`;
  } else {
    summaryContent = `${icon} ${summary}`;
  }

  return `
📰 **[${title}](${url})**  
📅 ${date} | 🏷️ ${source} | 🔗 ${formattedTags}

**${icon} ${summaryType}:**  
${summaryContent}

💬 _Type: ${summaryType}_
`.trim();
}
