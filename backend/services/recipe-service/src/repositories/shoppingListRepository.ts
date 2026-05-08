import { db } from "../config/firebase";
import { ShoppingListItemSchema } from "../schemas/shoppingListSchema";
import { z } from "zod";
import crypto from "crypto";

type ShoppingListItem = z.infer<typeof ShoppingListItemSchema>;

const shoppingCollection = "shopping_list";

export const ShoppingListRepository = {
    async listByUserId(userId: string): Promise<ShoppingListItem[]> {
        const documents = await db
            .collection(shoppingCollection)
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        return documents.docs
            .map((doc) => ShoppingListItemSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data);
    },

    async create(params: Omit<ShoppingListItem, "id" | "createdAt">): Promise<ShoppingListItem> {
        const now = new Date().toISOString();
        const document: ShoppingListItem = {
            id: crypto.randomUUID(),
            userId: params.userId,
            name: params.name,
            quantity: params.quantity ?? undefined,
            checked: params.checked ?? false,
            createdAt: now,
            updatedAt: undefined,
        };

        await db.collection(shoppingCollection).doc(document.id).set(document);
        return document;
    },

    async update(id: string, updates: Partial<ShoppingListItem>): Promise<ShoppingListItem | null> {
        const ref = db.collection(shoppingCollection).doc(id);
        const snap = await ref.get();

        if (!snap.exists) return null;

        const data = snap.data() as any;
        const merged = {
            ...data,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        await ref.set(merged);
        const parsed = ShoppingListItemSchema.safeParse(merged);
        return parsed.success ? parsed.data : null;
    },

    async deleteById(id: string): Promise<void> {
        await db.collection(shoppingCollection).doc(id).delete();
    },

    async clearByUserId(userId: string): Promise<void> {
        const documents = await db.collection(shoppingCollection).where("userId", "==", userId).get();

        if (documents.empty) return;

        const batch = db.batch();
        documents.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
    },
};
