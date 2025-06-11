// lib/handlers/feedHandlers.js

import { validateFeedUrl } from "../validateFeedUrl";

export const handleAddFeed = (feeds, setFeeds) => {
  if (feeds.length >= 5) return;
  setFeeds([...feeds, { platform: "rss", url: "", valid: null, name: "" }]);
};

export const handleRemoveFeed = (index, feeds, setFeeds) => {
  setFeeds(feeds.filter((_, i) => i !== index));
};

export const handleFeedUrlChange = async (url, index, feeds, setFeeds, setErrorMessages) => {
  const duplicate = feeds.some((f, i) => i !== index && f.url === url);
  const newFeeds = [...feeds];
  newFeeds[index].url = url;

  setErrorMessages(prev => ({
    ...prev,
    [index]: duplicate ? "This URL has already been added." : ""
  }));

  if (duplicate) return;

  const { valid, name } = await validateFeedUrl(url);
  newFeeds[index].valid = valid;
  newFeeds[index].name = name;

  if (!valid) {
    setErrorMessages(prev => ({
      ...prev,
      [index]: "Invalid feed or no content found."
    }));
  }

  setFeeds(newFeeds);
};
