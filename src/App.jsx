import { supabase } from "./lib/supabaseClient";
import { summarizeWithOpenAI } from "./lib/summarizer";
import { fetchYoutubeDescription } from "./lib/fetchFeeds";
import { stripHtml, extractChapters } from "./lib/utils";
import { fetchArticles } from "./lib/fetchArticles";
import { saveFeedToSupabase } from "./lib/feedStorage";
import { validateFeedUrl } from "./lib/validateFeedUrl";
import { cleanTitle } from "./lib/cleanTitle";
import { generateEmailHTML } from "./lib/formatEmailHTML";
import { handleAddFeed, handleRemoveFeed, handleFeedUrlChange } from "./lib/handlers/feedHandlers";
import { handleFetchArticles } from "./lib/handlers/articleHandlers";
import { handleSendEmail } from "./lib/handlers/emailHandlers";
import { handleSaveConfig } from "./lib/handlers/configHandlers";
import { handleLoadConfig } from "./lib/handlers/loadConfigHandler";
import { useSupabaseAuth } from "./hooks/useSupabaseAuth";
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
  "Security", "Solana", "Stablecoin", "Staking", "Tokenomics", "Wallet", "Web3"
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
  const { user, loading, savedConfigs, setUser, setSavedConfigs } = useSupabaseAuth();
  const [newSetupName, setNewSetupName] = useState("");

console.log("Feed platforms:", feeds.map(f => f.platform));

console.log("🚦 App render: loading =", loading, "user =", user);


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

  const { valid, name } = await validateFeedUrl(url);
  newFeeds[index].valid = valid;
  newFeeds[index].name = name;

  if (!valid) {
    setErrorMessages((prev) => ({
      ...prev,
      [index]: "Invalid feed or no content found."
    }));
  }

  setFeeds(newFeeds);
};


// inside your component
const handleFetchArticles = async () => {
  setHasFetched(true);
  setIsLoading(true);
  setArticles([]);
  setChapterToggles({});

  const { articles: newArticles, chapterToggles: newToggles } = await fetchArticles({
    feeds,
    selectedKeywords,
    summaryType,
    user,
    saveFeedToSupabase,
    platformIcons
  });

  setArticles(newArticles);
  setChapterToggles(newToggles);
  setIsLoading(false);
};


if (loading) {
  return <p style={{ textAlign: "center", marginTop: "2rem" }}>⏳ Loading session...</p>;
}

if (!user) {
  return <Auth />;
}


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
  onRemove={(index) => handleRemoveFeed(index, feeds, setFeeds)}
  onChange={(url, index) => handleFeedUrlChange(url, index, feeds, setFeeds, setErrorMessages)}
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

<div style={{
  marginBottom: "1rem",
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  alignItems: "center"
}}>
  <select
  onChange={e => handleLoadConfig(e.target.value, savedConfigs, setFeeds, setSelectedKeywords, setSummaryType)}
  defaultValue=""
  style={{
    flex: "1 1 150px",
    padding: "0.5rem",
    backgroundColor: "#fff",
    color: "#111",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "0.9rem"
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
      flex: "1 1 150px",
      padding: "0.5rem",
      backgroundColor: "#fff",
      color: "#111",
      border: "1px solid #ccc",
      borderRadius: "4px"
    }}
  />

  <button
  onClick={() =>
    handleSaveConfig({
      user,
      feeds,
      selectedKeywords,
      summaryType,
      newSetupName,
      savedConfigs,
      setSavedConfigs,
      setNewSetupName
    })
  }
  style={{
    flex: "0 0 auto",
    padding: "0.5rem 0.75rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.9rem"
  }}
>
  Save
</button>


  <button
    onClick={() =>
      handleFetchArticles({
        feeds,
        selectedKeywords,
        summaryType,
        user,
        setIsLoading,
        setArticles,
        setHasFetched,
        setChapterToggles,
        platformIcons
      })
    }
    style={{
      flex: "0 0 auto",
      padding: "0.6rem 1rem",
      background: "#0070f3",
      color: "white",
      border: "none",
      borderRadius: "4px",
      fontSize: "0.9rem",
      cursor: "pointer"
    }}
  >
    Get My News
  </button>

  <button
  onClick={() => handleSendEmail({ user, articles })}
  style={{
    flex: "0 0 auto",
    padding: "0.5rem 0.75rem",
    backgroundColor: "#6c63ff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.9rem"
  }}
>
  Email
</button>
</div>


     

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
