export function generateEmailHTML(articles) {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>The InkQuirer - Your Daily Digest</h2>
      ${articles.map(article => `
        <div style="margin-bottom: 20px; padding: 10px; border-bottom: 1px solid #ccc;">
          <h3><a href="${article.link}" target="_blank" style="color: #0070f3;">${article.title}</a></h3>
          <p><strong>Source:</strong> ${article.feed.name}</p>
          <p>${article.summary}</p>
        </div>
      `).join('')}
    </div>
  `;
}
