import { apiRecipe } from "@/src/services/api";
import { getFriendlyHttpErrorMessage } from "@/src/services/httpError";

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
    const { data } = await apiRecipe.get<{ items: PantryItem[] }>("/api/pantry");
    return data.items;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function addPantryItem(payload: { name: string; quantity?: string; expirationDate?: string }): Promise<PantryItem> {
  try {
    const { data } = await apiRecipe.post<{ item: PantryItem }>("/api/pantry", payload);
    return data.item;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updatePantryItem(itemId: string, updates: Partial<PantryItem>): Promise<PantryItem> {
  try {
    const { data } = await apiRecipe.put<{ item: PantryItem }>(`/api/pantry/${itemId}`, updates);
    return data.item;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function removePantryItem(itemId: string): Promise<void> {
  try {
    await apiRecipe.delete(`/api/pantry/${itemId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function clearPantry(): Promise<void> {
  try {
    await apiRecipe.delete("/api/pantry");
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}