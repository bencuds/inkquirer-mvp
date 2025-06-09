export async function fetchYoutubeDescription(videoId, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.items?.[0]?.snippet?.description || "";
  } catch {
    return "";
  }
}

