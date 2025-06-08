import { supabase } from "./lib/supabaseClient";
import Auth from "./components/Auth";
import { fetchUserConfigs, saveFeedConfig } from "./lib/feedConfigs";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import octopusLogo from "./assets/octopus.png";
import rssIcon from "./assets/rss.png";
import twitterIcon from "./assets/x.png";
import youtubeIcon from "./assets/youtube.png";
import substackIcon from "./assets/substack.png";
import mediumIcon from "./assets/medium.png";
import Header from "./components/Header";
import FeedInput from "./components/FeedInput";
import KeywordSelector from "./components/KeywordSelector";
import SummaryCard from "./components/SummaryCard";


async function saveFeedToSupabase({ userId, name, feeds, keywords, summaryType }) {
  const { error } = await supabase.from("feeds").insert({
    user_id: userId,
    name,
    sources: feeds.map(f => f.url),
    keywords: keywords.map(k => k.value),
    summary_format: summaryType
  });

  if (error) {
    console.error("❌ Feed save failed:", error.message);
    alert("Error saving feed.");
  } else {
    console.log("✅ Feed saved to Supabase");
  }
}


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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [newSetupName, setNewSetupName] = useState("");


console.log("🚦 App render: loading =", loading, "user =", user);


useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user || null);
    setLoading(false);

    if (session?.user) {
      console.log("🧑 Current user ID:", session.user.id); // 👈 add this
      fetchUserConfigs(session.user.id).then(setSavedConfigs);
    }
  });

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user || null);
    setLoading(false);

    if (session?.user) {
      console.log("🧑 Current user ID (listener):", session.user.id); // 👈 add this
      fetchUserConfigs(session.user.id).then(setSavedConfigs);
    }
  });

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);




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
    if (user) {
  await saveFeedToSupabase({
    userId: user.id,
    name: "My Feed",
    feeds,
    keywords: selectedKeywords,
    summaryType
  });
}

  };

  const cleanTitle = (text) => {
    return text
      .replace(/https?:\/\/\S+/g, "")
      .replace(/(?:^|\s)decrypt\.co\/\S+/gi, "")
      .replace(/\bDecrypt\b[.:]?\s*/gi, "")
      .replace(/[.…]+$/, "")
      .trim();
  };
  if (loading) return <p>Loading...</p>;
if (!user) return <Auth />;


console.log("✅ Logged in — rendering main app");
  return (
     <>
   <Header
  user={user}
  onLogout={async () => {
    await supabase.auth.signOut();
    setUser(null);
  }}
/>


    
    <div style={{ fontFamily: "system-ui", maxWidth: "720px", margin: "0 auto", padding: "1rem", backgroundColor: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <img src={octopusLogo} alt="Logo" style={{ width: "50px", height: "50px" }} />
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "#111" }}>The InkQuirer</h1>
      </div>
      <div style={{ marginBottom: "1rem" }}>
       <FeedInput
  feeds={feeds}
  onAdd={handleAddFeed}
  onRemove={handleRemoveFeed}
  onChange={handleFeedUrlChange}
  errorMessages={errorMessages}
  platformIcons={platformIcons}
/>

      </div>

      <div style={{ marginBottom: "1rem" }}>
  <KeywordSelector
    selectedKeywords={selectedKeywords}
    setSelectedKeywords={setSelectedKeywords}
    options={keywordOptions}
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
<div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
  <select
  onChange={e => {
    const selected = savedConfigs.find(c => c.id === e.target.value);
    if (!selected) return;
    setFeeds(selected.sources.map(url => ({
      platform: "rss",
      url,
      valid: true,
      name: new URL(url).hostname
    })));
    setSelectedKeywords(selected.keywords.map(k => ({ label: k, value: k })));
    setSummaryType(selected.summary_format);
  }}
  defaultValue=""
  style={{
    flex: 1,
    padding: "0.5rem",
    backgroundColor: "#fff",
    color: "#111",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "0.9rem",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none"
  }}
>
  <option value="" disabled>Load Custom Feeds...</option>
  {savedConfigs.map(config => (
    <option key={config.id} value={config.id}>{config.name}</option>
  ))}
</select>


  <input
  type="text"
  placeholder="Name your custom feeds"
  value={newSetupName}
  onChange={e => setNewSetupName(e.target.value)}
  style={{
    flex: 1,
    padding: "0.5rem",
    backgroundColor: "#fff",
    color: "#111",
    border: "1px solid #ccc",
    borderRadius: "4px"
  }}
/>


<button
  onClick={async () => {
    if (!newSetupName.trim()) {
      alert("Please enter a name");
      return;
    }

    const payload = {
      userId: user.id,
      name: newSetupName.trim(),
      feeds,
      keywords: selectedKeywords,
      summaryType
    };

    console.log("🧠 Saving feeds:", payload);

    await saveFeedConfig(payload);

    const updated = await fetchUserConfigs(user.id);
    setSavedConfigs(updated);
    console.log("📥 Saved configs now:", updated);
    setNewSetupName(""); // clear input
  }}
  style={{
    padding: "0.5rem 1rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px"
  }}
>
  Save Custom Feeds
</button>


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
       {articles.map((article, i) => (
  <SummaryCard
    key={i}
    article={{ ...article, index: i }}
    summaryType={summaryType}
    platformIcons={platformIcons}
    chapterToggles={chapterToggles}
    setChapterToggles={setChapterToggles}
    cleanTitle={cleanTitle}
  />
))}
</div>
</div>
</>
);
}
