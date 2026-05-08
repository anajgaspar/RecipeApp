import { PantryRepository } from "../repositories/pantryRepository";
import { PantryItemSchema } from "../schemas/pantrySchema";
import { z } from "zod";

type PantryItem = z.infer<typeof PantryItemSchema>;

export const PantryService = {
    async addItem(userId: string, payload: { name: string; quantityValue?: string; quantityUnit?: string; notes?: string; expirationDate?: string; }) {
        return PantryRepository.create({ userId, ...payload });
    },

    async listItems(userId: string) {
        return PantryRepository.listByUserId(userId);
    },

    async updateItem(itemId: string, updates: Partial<PantryItem>) {
        return PantryRepository.update(itemId, updates as Partial<PantryItem>);
    },

    async removeItem(itemId: string) {
        await PantryRepository.deleteById(itemId);
        return { removed: true };
    },

    async clearPantry(userId: string) {
        await PantryRepository.clearByUserId(userId);
        return { cleared: true };
    },
};
