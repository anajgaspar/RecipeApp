import { apiRecipe } from "@/src/services/api";
import { getFriendlyHttpErrorMessage } from "@/src/services/httpError";

export type SearchSource = "text" | "voice";

function getErrorMessage(error: unknown): string {
  return getFriendlyHttpErrorMessage(error, "Não foi possível registrar a busca.");
}

export async function recordSearchHistory(queryText: string, source: SearchSource = "text"): Promise<void> {
  try {
    await apiRecipe.post("/api/search-history", {
      queryText,
      source,
    });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}