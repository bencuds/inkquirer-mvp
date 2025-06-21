export function stripHtml(html) {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  return doc.body.textContent || "";
}

export function extractChapters(text, videoUrl) {
  const lines = text.split(/\r?\n/).map(l => l.trim());
  const chapters = lines.filter(l => /\d{1,2}:\d{2}/.test(l)).map(line => {
    const match = line.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    const [_, min, sec] = match;
    const seconds = parseInt(min) * 60 + parseInt(sec);
    const label = line.replace(match[0], "").replace(/[-–—•]*\s*/, "").trim();
    return `<li><a href="${videoUrl}&t=${seconds}s" target="_blank">${match[0]}</a> – ${label}</li>`;
  }).filter(Boolean).join("");

  return chapters ? `<h4>Video Chapters:</h4><ul>${chapters}</ul>` : "";
}