import { ShoppingListRepository } from "../repositories/shoppingListRepository";
import { ShoppingListItemSchema } from "../schemas/shoppingListSchema";
import { z } from "zod";

type ShoppingListItem = z.infer<typeof ShoppingListItemSchema>;

export const ShoppingListService = {
    async addItem(userId: string, payload: { name: string; quantityValue?: string; quantityUnit?: string; checked?: boolean; }) {
        const toCreate = {
            userId,
            name: payload.name,
            quantity: payload.quantityValue && payload.quantityUnit ? `${payload.quantityValue} ${payload.quantityUnit}` : undefined,
            checked: payload.checked ?? false,
        } as any;

        return ShoppingListRepository.create(toCreate);
    },

    async listItems(userId: string) {
        return ShoppingListRepository.listByUserId(userId);
    },

    async updateItem(itemId: string, updates: Partial<ShoppingListItem>) {
        return ShoppingListRepository.update(itemId, updates as Partial<ShoppingListItem>);
    },

    async removeItem(itemId: string) {
        await ShoppingListRepository.deleteById(itemId);
        return { removed: true };
    },

    async clearList(userId: string) {
        await ShoppingListRepository.clearByUserId(userId);
        return { cleared: true };
    },
};
