import { apiRecipe } from "@/src/services/api";
import { getFriendlyHttpErrorMessage } from "@/src/services/httpError";

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
    const { data } = await apiRecipe.get<{ items: ShoppingListItem[] }>("/api/shopping-list");
    return data.items;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function addShoppingItem(payload: { name: string; quantity?: string }): Promise<ShoppingListItem> {
  try {
    const { data } = await apiRecipe.post<{ item: ShoppingListItem }>("/api/shopping-list", payload);
    return data.item;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateShoppingItem(itemId: string, updates: Partial<ShoppingListItem>): Promise<ShoppingListItem> {
  try {
    const { data } = await apiRecipe.put<{ item: ShoppingListItem }>(`/api/shopping-list/${itemId}`, updates);
    return data.item;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function removeShoppingItem(itemId: string): Promise<void> {
  try {
    await apiRecipe.delete(`/api/shopping-list/${itemId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function clearShoppingList(): Promise<void> {
  try {
    await apiRecipe.delete("/api/shopping-list");
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}