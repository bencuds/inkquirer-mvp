export default function SummaryCard({ article, summaryType, platformIcons, chapterToggles, setChapterToggles, cleanTitle }) {
  const i = article.index;

  return (
    <div style={{
      backgroundColor: "#fff", color: "#000", marginBottom: "2rem",
      padding: "1rem", border: "1px solid #ddd", borderRadius: "8px"
    }}>
      <h3>{cleanTitle(article.title)}</h3>
      {article.image && (
        <img src={article.image} alt="Preview" style={{
          width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px",
          marginBottom: "0.75rem", backgroundColor: "#f0f0f0"
        }} />
      )}
      {summaryType === "bullets" ? (
        <ul>{article.summary.split(/\n|•/).map((s, j) =>
          s.trim() ? <li key={j}>{s.replace(/^[-–•]\s*/, "").trim()}</li> : null
        )}</ul>
      ) : (
        <p>{article.summary}</p>
      )}
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
      <div style={{
        fontSize: "0.9rem", color: "#666", marginTop: "0.5rem",
        display: "flex", alignItems: "center", gap: "0.5rem"
      }}>
        Source: {article.feed.name}
        <img src={platformIcons[article.feed.platform]} alt={article.feed.platform} style={{ width: 16, height: 16 }} /> |
        <a href={article.link} target="_blank" rel="noopener noreferrer">
          {article.feed.platform === "youtube" ? "Watch Video" : "Read Original"}
        </a>
      </div>
    </div>
  );
}