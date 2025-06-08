import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import octopusLogo from "./assets/octopus.png";
import rssIcon from "./assets/rss.png";
import twitterIcon from "./assets/x.png";
import youtubeIcon from "./assets/youtube.png";
import substackIcon from "./assets/substack.png";
import mediumIcon from "./assets/medium.png";

const summaryFormats = [
  { label: "3 Bullets", value: "bullets" },
  { label: "Single Paragraph", value: "paragraph" },
  { label: "Explain like I'm a 5 year old", value: "simple" },
  { label: "TL;DR", value: "tldr" },
  { label: "Market Impact", value: "market" },
  { label: "GPT's Opinion", value: "opinion" }
];

const keywordOptions = [
  "Altcoin", "Bitcoin", "DeFi", "Depeg", "ETH", "Ethereum", "Exchange",
  "Hack", "Layer 2", "Mining", "NFT", "On-chain", "Regulation",
  "Security", "Stablecoin", "Staking", "Tokenomics", "Wallet", "Web3"
].map(k => ({ label: k, value: k })).sort((a, b) => a.label.localeCompare(b.label));

const customKeywordStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#f9f9f9",
    fontSize: "0.9rem",
    borderRadius: "6px",
    borderColor: "#ccc",
    boxShadow: "none",
    minHeight: "38px"
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#0070f3",
    color: "white",
    borderRadius: "4px"
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "white",
    fontSize: "0.8rem"
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "white",
    ':hover': { backgroundColor: "#005bb5", color: "white" }
  }),
  menu: (base) => ({ ...base, fontSize: "0.9rem", zIndex: 9999 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#e0e7ff" : "white",
    color: "#333",
    fontSize: "0.9rem",
    cursor: "pointer"
  })
};

const platformIcons = {
  rss: rssIcon,
  twitter: twitterIcon,
  youtube: youtubeIcon,
  substack: substackIcon,
  medium: mediumIcon
};

export default function App() {
  const [feeds, setFeeds] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [summaryType, setSummaryType] = useState("bullets");
  const [articles, setArticles] = useState([]);
  const [errorMessages, setErrorMessages] = useState({});
  const [hasFetched, setHasFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chapterToggles, setChapterToggles] = useState({});

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleAddFeed = (platform) => {
    if (feeds.length >= 5) return;
    setFeeds([...feeds, { platform, url: "", valid: null, name: "" }]);
  };

  const handleRemoveFeed = (index) => {
    setFeeds(feeds.filter((_, i) => i !== index));
  };

  const handleFeedUrlChange = async (url, index) => {
    const duplicate = feeds.some((f, i) => i !== index && f.url === url);
    const newFeeds = [...feeds];
    newFeeds[index].url = url;
    setErrorMessages((prev) => ({
      ...prev,
      [index]: duplicate ? "This URL has already been added." : ""
    }));
    if (duplicate) return;

    try {
      const encoded = encodeURIComponent(url);
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encoded}`);
      const data = await res.json();
      if (!data.items?.length) throw new Error();
      newFeeds[index].valid = true;
      newFeeds[index].name = data.feed?.title || new URL(url).hostname;
    } catch {
      newFeeds[index].valid = false;
      setErrorMessages((prev) => ({ ...prev, [index]: "Invalid feed or no content found." }));
    }
    setFeeds(newFeeds);
  };

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html || "", "text/html");
    return doc.body.textContent || "";
  };

  const extractChapters = (text, videoUrl) => {
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
  };

  const summarizeWithOpenAI = async (content, style) => {
  const promptMap = {
    bullets: "Summarize this in 3 bullet points:",
    paragraph: "Summarize this as a concise paragraph:",
    simple: "Summarize this so a 5-year-old could understand it:",
    tldr: "TL;DR:",
    market: "What is the potential market impact of this news?",
    opinion: "What is your opinion about this news?"
  };
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `${promptMap[style]}\n\n${content}` }],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("OpenAI response:", res.data); // 🚨 Check full response
    return res.data.choices[0].message.content.trim();
    console.log("Returned summary:", res.data.choices[0].message.content.trim());
  } catch (error) {
    console.error("OpenAI error:", error.response?.data || error.message);
    return "⚠️ Summary unavailable.";
  }
};



  const fetchYoutubeDescription = async (videoId) => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data.items?.[0]?.snippet?.description || "";
    } catch {
      return "";
    }
  };

  const fetchArticles = async () => {
    setHasFetched(true);
    setIsLoading(true);
    setArticles([]);
    setChapterToggles({});

    const keywordList = selectedKeywords.map(k => k.value.toLowerCase());
    const newArticles = [];

    for (const feed of feeds) {
  if (!feed.url || feed.valid === false) continue;
  try {
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
    const data = await res.json();
    const matched = data.items.filter(item =>
      keywordList.length === 0 || keywordList.some(kw =>
        item.title.toLowerCase().includes(kw) || item.description.toLowerCase().includes(kw)
      )
    );

    if (matched.length === 0) continue;

    const article = matched[0];
    console.log("Raw Article:", article); // 🚨 Check article fields

    let raw = stripHtml(article.description);
    let chaptersHtml = "";

    if (feed.platform === "youtube") {
      const videoId = new URL(article.link).searchParams.get("v") || article.link.split("/").pop();
      raw = await fetchYoutubeDescription(videoId);
      chaptersHtml = extractChapters(raw, article.link);
    }

    let image =
      article["media:content"]?.url ||
      article.enclosure?.link ||
      (() => {
        const matchDesc = article.description?.match(/<img[^>]+src=["']([^"'>]+)["']/i);
        if (matchDesc?.[1]) return matchDesc[1];
        const bgMatch = article.description?.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
        if (bgMatch?.[1]) return bgMatch[1];
        return platformIcons[feed.platform];
      })();

    const fullText = `${article.title}. ${raw}`;
    console.log("OpenAI prompt:", `${summaryType}: ${fullText}`); // 🚨 Check OpenAI input

    const summary = await summarizeWithOpenAI(fullText, summaryType);
    newArticles.push({ ...article, summary, feed, image, chaptersHtml });
    console.log("Final article pushed:", { ...article, summary });
  } catch (err) {
    console.warn("Feed failed:", feed.url, err);
  }
}


    setArticles(newArticles);
    setIsLoading(false);
  };

  const cleanTitle = (text) => {
    return text
      .replace(/https?:\/\/\S+/g, "")
      .replace(/(?:^|\s)decrypt\.co\/\S+/gi, "")
      .replace(/\bDecrypt\b[.:]?\s*/gi, "")
      .replace(/[.…]+$/, "")
      .trim();
  };
  return (
    <div style={{ fontFamily: "system-ui", maxWidth: "720px", margin: "0 auto", padding: "1rem", backgroundColor: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <img src={octopusLogo} alt="Logo" style={{ width: "50px", height: "50px" }} />
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "#111" }}>The InkQuirer</h1>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontWeight: "bold", color: "#111" }}>Select Feeds (5 max)</label>
        {feeds.map((feed, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <img src={platformIcons[feed.platform]} alt={feed.platform} style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: "0.9rem", color: "#333", minWidth: "100px" }}>{feed.name}</span>
            <input
  placeholder={`Feed URL ${i + 1}`}
  value={feed.url}
  onChange={(e) => handleFeedUrlChange(e.target.value, i)}
  style={{ flex: 1, padding: "0.5rem", backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px", color: "#111" }}
/>
            <button onClick={() => handleRemoveFeed(i)} style={{ background: "#fee", color: "#a00", border: "none", cursor: "pointer", padding: "0.3rem 0.6rem" }}>x</button>
            {errorMessages[i] && <div style={{ color: "red", marginLeft: "0.5rem" }}>{errorMessages[i]}</div>}
          </div>
        ))}
        {feeds.length < 5 && (
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            {["rss", "twitter", "youtube", "substack", "medium"].map(p => (
  <button
    key={p}
    onClick={() => handleAddFeed(p)}
    title={p}
    style={{
      padding: "0.5rem",
      border: "1px solid #ccc",
      background: "white",
      cursor: "pointer",
      width: "60px",
      minHeight: "60px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <img src={platformIcons[p]} alt={p} style={{ width: 20, height: 20 }} />
    <span
      style={{
        fontSize: "0.7rem",
        marginTop: "0.3rem",
        textAlign: "center",
        color: "#333",
        lineHeight: "1rem",
      }}
    >
      {p === "rss" ? "RSS" : p.charAt(0).toUpperCase() + p.slice(1)}
    </span>
  </button>
))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontWeight: "bold", color: "#111" }}>Select Keywords:</label>
        <Select
          isMulti
          options={keywordOptions}
          value={selectedKeywords}
          onChange={setSelectedKeywords}
          styles={customKeywordStyles}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontWeight: "bold", color: "#111" }}>Summary Format:</label>
        <select
  value={summaryType}
  onChange={e => setSummaryType(e.target.value)}
  style={{ width: "100%", padding: "0.5rem", backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px", color: "#111" }}
>
  {summaryFormats.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
</select>
      </div>

      <button onClick={fetchArticles} style={{ padding: "0.6rem 1rem", background: "#0070f3", color: "white", border: "none", cursor: "pointer" }}>
        Get My News
      </button>

      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}>
          <div style={{
            width: "32px",
            height: "32px",
            border: "4px solid #ccc",
            borderTop: "4px solid #0070f3",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        {hasFetched && !isLoading && articles.length === 0 && <p>No articles found. Try different feeds or keywords.</p>}
       {articles.map((article, i) => {
   console.log("Rendering article:", article.title, article.summary);
  console.log("Cleaned title:", cleanTitle(article.title));
  console.log("Summary content:", article.summary);
  return (
    <div key={i} style={{ backgroundColor: "#fff", color: "#000", marginBottom: "2rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h3>{cleanTitle(article.title)}</h3>
      {article.image && (
        <img
          src={article.image}
          alt="Preview"
          style={{
            width: "100%",
            height: "180px",
            objectFit: "cover",
            borderRadius: "8px",
            marginBottom: "0.75rem",
            backgroundColor: "#f0f0f0"
          }}
        />
      )}
      {summaryType === "bullets" ? (
        <ul>
          {article.summary.split(/\n|•/).map((s, j) =>
            s.trim() ? <li key={j}>{s.replace(/^[-–•]\s*/, "").trim()}</li> : null
          )}
        </ul>
      ) : (
        <p>{article.summary}</p>
      )}
      {article.chaptersHtml && (
        <>
          <button
            onClick={() => setChapterToggles(prev => ({ ...prev, [i]: !prev[i] }))}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 0.9rem",
              backgroundColor: "#f3f4f6",
              color: "#1f2937",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            {chapterToggles[i] ? "Hide Chapters" : "Show Chapters"}
          </button>
          {chapterToggles[i] && (
            <div dangerouslySetInnerHTML={{ __html: article.chaptersHtml }} style={{ marginTop: "1rem" }} />
          )}
        </>
      )}
      <div
        style={{
          fontSize: "0.9rem",
          color: "#666",
          marginTop: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}
      >
        Source: {article.feed.name}
        <img
          src={platformIcons[article.feed.platform]}
          alt={article.feed.platform}
          style={{ width: 16, height: 16 }}
        />
        |{" "}
        <a href={article.link} target="_blank" rel="noopener noreferrer">
          {article.feed.platform === "youtube" ? "Watch Video" : "Read Original"}
        </a>
      </div>
    </div>
  );
})}
</div>
</div>
);
}
