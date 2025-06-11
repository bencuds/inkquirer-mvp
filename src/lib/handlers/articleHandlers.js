// lib/handlers/articleHandlers.js

import { fetchArticles } from "../fetchArticles";
import { saveFeedToSupabase } from "../feedStorage";

export const handleFetchArticles = async ({
  feeds,
  selectedKeywords,
  summaryType,
  user,
  setIsLoading,
  setArticles,
  setHasFetched,
  setChapterToggles,
  platformIcons
}) => {
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
