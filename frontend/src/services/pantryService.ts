import api from "@/src/services/api";
import { getFriendlyHttpErrorMessage } from "@/src/services/httpError";

const AUTH_API_URL = process.env.EXPO_PUBLIC_API_AUTH_URL;
const RECIPE_API_URL =
  process.env.EXPO_PUBLIC_API_RECIPE_URL ?? (AUTH_API_URL ? AUTH_API_URL.replace(":3001", ":3002") : "http://localhost:3002");

export type PantryItem = {
  id: string;
  userId: string;
  name: string;
  quantity?: string;
  expirationDate?: string;
  createdAt: string;
  updatedAt?: string;
};

function getErrorMessage(error: unknown): string {
  return getFriendlyHttpErrorMessage(error, "Não foi possível concluir a operação com a despensa.");
}

export async function listPantryItems(): Promise<PantryItem[]> {
  try {
    const { data } = await api.get<{ items: PantryItem[] }>(`${RECIPE_API_URL}/api/pantry`);
    return data.items;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function addPantryItem(payload: { name: string; quantity?: string; expirationDate?: string }): Promise<PantryItem> {
  try {
    const { data } = await api.post<{ item: PantryItem }>(`${RECIPE_API_URL}/api/pantry`, payload);
    return data.item;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updatePantryItem(itemId: string, updates: Partial<PantryItem>): Promise<PantryItem> {
  try {
    const { data } = await api.put<{ item: PantryItem }>(`${RECIPE_API_URL}/api/pantry/${itemId}`, updates);
    return data.item;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function removePantryItem(itemId: string): Promise<void> {
  try {
    await api.delete(`${RECIPE_API_URL}/api/pantry/${itemId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function clearPantry(): Promise<void> {
  try {
    await api.delete(`${RECIPE_API_URL}/api/pantry`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
