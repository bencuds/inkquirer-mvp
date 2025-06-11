import { saveFeedConfig } from "../feedConfigs";
import { fetchUserConfigs } from "../feedConfigs";

export async function handleSaveConfig({
  user,
  feeds,
  selectedKeywords,
  summaryType,
  newSetupName,
  savedConfigs,
  setSavedConfigs,
  setNewSetupName
}) {
  const trimmedName = newSetupName.trim();

  if (!trimmedName) {
    alert("Please enter a name");
    return;
  }

  const existingNames = savedConfigs.map(c => c.name.toLowerCase());
  if (existingNames.includes(trimmedName.toLowerCase())) {
    alert("You already have a feed with this name. Please choose a different one.");
    return;
  }

  const payload = {
    userId: user.id,
    name: trimmedName,
    feeds,
    keywords: selectedKeywords,
    summaryType
  };

  await saveFeedConfig(payload);
  const updated = await fetchUserConfigs(user.id);
  setSavedConfigs(updated);
  setNewSetupName(""); // Clear input
}
