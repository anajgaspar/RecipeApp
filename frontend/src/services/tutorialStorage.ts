import * as SecureStore from "expo-secure-store";

function getTutorialKey(userId: string): string {
  return `app.tutorial.completed.${userId}`;
}

export async function hasSeenAppTutorial(userId: string): Promise<boolean> {
  const value = await SecureStore.getItemAsync(getTutorialKey(userId));
  return value === "true";
}

export async function markAppTutorialAsSeen(userId: string): Promise<void> {
  await SecureStore.setItemAsync(getTutorialKey(userId), "true");
}