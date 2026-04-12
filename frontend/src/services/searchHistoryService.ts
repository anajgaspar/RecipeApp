import { isAxiosError } from "axios";
import api from "@/src/services/api";

export type SearchSource = "text" | "voice";

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const responseMessage =
      (error.response?.data as { error?: string } | undefined)?.error ??
      (error.response?.data as { message?: string } | undefined)?.message;

    if (responseMessage) {
      return responseMessage;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível registrar a busca.";
}

export async function recordSearchHistory(queryText: string, source: SearchSource = "text"): Promise<void> {
  try {
    await api.post("/api/search-history", {
      queryText,
      source,
    });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}