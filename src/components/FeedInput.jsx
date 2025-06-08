export default function FeedInput({ feeds, onAdd, onRemove, onChange, errorMessages, platformIcons }) {
  return (
    <>
      <label style={{ fontWeight: "bold", color: "#111" }}>Select Feeds (5 max)</label>
      {feeds.map((feed, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <img src={platformIcons[feed.platform]} alt={feed.platform} style={{ width: 20, height: 20 }} />
          <span style={{ fontSize: "0.9rem", color: "#333", minWidth: "100px" }}>{feed.name}</span>
          <input
            placeholder={`Feed URL ${i + 1}`}
            value={feed.url}
            onChange={(e) => onChange(e.target.value, i)}
            style={{ flex: 1, padding: "0.5rem", backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px", color: "#111" }}
          />
          <button onClick={() => onRemove(i)} style={{ background: "#fee", color: "#a00", border: "none", cursor: "pointer", padding: "0.3rem 0.6rem" }}>x</button>
          {errorMessages[i] && <div style={{ color: "red", marginLeft: "0.5rem" }}>{errorMessages[i]}</div>}
        </div>
      ))}
      {feeds.length < 5 && (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          {["rss", "twitter", "youtube", "substack", "medium"].map(p => (
            <button key={p} onClick={() => onAdd(p)} title={p} style={{
              padding: "0.5rem", border: "1px solid #ccc", background: "white",
              cursor: "pointer", width: "60px", minHeight: "60px",
              display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
            }}>
              <img src={platformIcons[p]} alt={p} style={{ width: 20, height: 20 }} />
              <span style={{
                fontSize: "0.7rem", marginTop: "0.3rem", textAlign: "center", color: "#333", lineHeight: "1rem"
              }}>
                {p === "rss" ? "RSS" : p.charAt(0).toUpperCase() + p.slice(1)}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}