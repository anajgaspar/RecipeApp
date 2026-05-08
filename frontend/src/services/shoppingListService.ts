import api from "@/src/services/api";
import { getFriendlyHttpErrorMessage } from "@/src/services/httpError";

const AUTH_API_URL = process.env.EXPO_PUBLIC_API_AUTH_URL;
const RECIPE_API_URL =
  process.env.EXPO_PUBLIC_API_RECIPE_URL ?? (AUTH_API_URL ? AUTH_API_URL.replace(":3001", ":3002") : "http://localhost:3002");

export type ShoppingListItem = {
  id: string;
  userId: string;
  name: string;
  quantity?: string;
  checked: boolean;
  createdAt: string;
  updatedAt?: string;
};

function getErrorMessage(error: unknown): string {
  return getFriendlyHttpErrorMessage(error, "Não foi possível concluir a operação com a lista de compras.");
}

export async function listShoppingItems(): Promise<ShoppingListItem[]> {
  try {
    const { data } = await api.get<{ items: ShoppingListItem[] }>(`${RECIPE_API_URL}/api/shopping-list`);
    return data.items;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function addShoppingItem(payload: { name: string; quantity?: string }): Promise<ShoppingListItem> {
  try {
    const { data } = await api.post<{ item: ShoppingListItem }>(`${RECIPE_API_URL}/api/shopping-list`, payload);
    return data.item;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateShoppingItem(itemId: string, updates: Partial<ShoppingListItem>): Promise<ShoppingListItem> {
  try {
    const { data } = await api.put<{ item: ShoppingListItem }>(`${RECIPE_API_URL}/api/shopping-list/${itemId}`, updates);
    return data.item;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function removeShoppingItem(itemId: string): Promise<void> {
  try {
    await api.delete(`${RECIPE_API_URL}/api/shopping-list/${itemId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function clearShoppingList(): Promise<void> {
  try {
    await api.delete(`${RECIPE_API_URL}/api/shopping-list`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
