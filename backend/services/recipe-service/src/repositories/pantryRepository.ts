import { db } from "../config/firebase";
import { PantryItemSchema } from "../schemas/pantrySchema";
import { z } from "zod";
import crypto from "crypto";

type PantryItem = z.infer<typeof PantryItemSchema>;

const pantryCollection = "pantry";

export const PantryRepository = {
    async listByUserId(userId: string): Promise<PantryItem[]> {
        const documents = await db
            .collection(pantryCollection)
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        return documents.docs
            .map((doc) => PantryItemSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data);
    },

    async create(params: Omit<PantryItem, "id" | "createdAt">): Promise<PantryItem> {
        const now = new Date().toISOString();
        const document: PantryItem = {
            id: crypto.randomUUID(),
            userId: params.userId,
            name: params.name,
            quantity: params.quantity ?? undefined,
            expirationDate: params.expirationDate ?? undefined,
            createdAt: now,
            updatedAt: undefined,
        };

        await db.collection(pantryCollection).doc(document.id).set(document);
        return document;
    },

    async update(id: string, updates: Partial<PantryItem>): Promise<PantryItem | null> {
        const ref = db.collection(pantryCollection).doc(id);
        const snap = await ref.get();

        if (!snap.exists) return null;

        const data = snap.data() as any;
        const merged = {
            ...data,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        await ref.set(merged);
        const parsed = PantryItemSchema.safeParse(merged);
        return parsed.success ? parsed.data : null;
    },

    async deleteById(id: string): Promise<void> {
        await db.collection(pantryCollection).doc(id).delete();
    },

    async clearByUserId(userId: string): Promise<void> {
        const documents = await db.collection(pantryCollection).where("userId", "==", userId).get();

        if (documents.empty) return;

        const batch = db.batch();
        documents.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
    },
};
