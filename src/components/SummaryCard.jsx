export default function SummaryCard({
  article,
  summaryType,
  platformIcons,
  chapterToggles,
  setChapterToggles,
  cleanTitle
}) {
  const i = article.index;
  const platform = article.feed.platform;
  const platformLabel = platform || "unknown";
  const date = article.date || article.pubDate || article.published || "Unknown Date";
  const keywords = article.keywords || article.tags || [];
  const keywordText = keywords.length ? keywords.join(", ") : "None";

  const summaryTypeLabels = {
    bullets: { label: "3 Bullets", icon: "•" },
    paragraph: { label: "Single Paragraph", icon: "✍️" },
    simple: { label: "ELI5", icon: "🧠" },
    tldr: { label: "TL;DR", icon: "💡" },
    market: { label: "Market Impact", icon: "📈" },
    opinion: { label: "GPT's Opinion", icon: "🗣️" }
  };

  const { label, icon } = summaryTypeLabels[summaryType] || { label: "Summary", icon: "📰" };

  const renderSummaryContent = () => {
    if (summaryType === "bullets") {
      return (
        <ul style={{ paddingLeft: "1.2rem" }}>
          {article.summary.split(/\n|•/).map((s, j) =>
            s.trim() ? <li key={j}>{s.replace(/^[-–•]\s*/, "").trim()}</li> : null
          )}
        </ul>
      );
    }

    if (summaryType === "market" && article.marketImpact) {
      return (
        <>
          <p>{article.summary}</p>
          <p style={{ fontStyle: "italic", color: "#444" }}>
            📊 <strong>Market Impact:</strong> {article.marketImpact}
          </p>
        </>
      );
    }

    return <p>{article.summary}</p>;
  };

  return (
    <div style={{
      backgroundColor: "#fff", color: "#000", marginBottom: "2rem",
      padding: "1rem", border: "1px solid #ddd", borderRadius: "8px"
    }}>
      <h3 style={{ marginBottom: "0.5rem" }}>
        <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#0070f3" }}>
          <strong>{cleanTitle(article.title)}</strong>
        </a>
      </h3>

      <div style={{
  fontSize: "0.85rem",
  color: "#555",
  marginBottom: "0.75rem",
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.4rem",
  lineHeight: "1.4"
}}>
  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
    <img src={platformIcons[platform]} alt={platformLabel} style={{ width: 16, height: 16 }} />
    {platformLabel}
  </span>
  <span>|</span>
  <span>📅 {date}</span>
  <span>|</span>
  <span>🏷️ {article.feed.name}</span>
  <span>|</span>
  <span>🔗 {keywordText}</span>
  <span>|</span>
  <span>💬 {label}</span>
</div>



      {article.image && (
        <img src={article.image} alt="Preview" style={{
          width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px",
          marginBottom: "0.75rem", backgroundColor: "#f0f0f0"
        }} />
      )}

      <div style={{ marginBottom: "0.25rem", fontWeight: "bold" }}>Summary:</div>
      {renderSummaryContent()}

      {article.chaptersHtml && (
        <>
          <button onClick={() => setChapterToggles(prev => ({ ...prev, [i]: !prev[i] }))} style={{
            marginTop: "1rem", padding: "0.5rem 0.9rem", backgroundColor: "#f3f4f6",
            color: "#1f2937", border: "none", borderRadius: "6px",
            fontSize: "0.95rem", fontWeight: 500, cursor: "pointer"
          }}>
            {chapterToggles[i] ? "Hide Chapters" : "Show Chapters"}
          </button>
          {chapterToggles[i] && (
            <div dangerouslySetInnerHTML={{ __html: article.chaptersHtml }} style={{ marginTop: "1rem" }} />
          )}
        </>
      )}
    </div>
  );
}
