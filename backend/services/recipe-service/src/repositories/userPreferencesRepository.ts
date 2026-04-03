import { db } from "../config/firebase";
import { UserPreferencesSchema } from "../schemas/userPreferencesSchema";
import { z } from "zod";

type UserPreferencesDocument = z.infer<typeof UserPreferencesSchema>;
type UpsertUserPreferencesParams = {
    userId: string;
    preferredCategories: string[];
    preferredTags: string[];
};

const userPreferencesCollection = "user_preferences";

export const UserPreferencesRepository = {
    async findByUserId(userId: string): Promise<UserPreferencesDocument | null> {
        const document = await db.collection(userPreferencesCollection).doc(userId).get();
        if (!document.exists) {
            return null;
        }

        const parsedPreference = UserPreferencesSchema.safeParse(document.data());
        return parsedPreference.success ? parsedPreference.data : null;
    },

    async upsertByUserId(params: UpsertUserPreferencesParams): Promise<UserPreferencesDocument> {
        const timestamp = new Date().toISOString();
        const document: UserPreferencesDocument = {
            id: params.userId,
            preferences: {
                userId: params.userId,
                preferredCategories: params.preferredCategories,
                preferredTags: params.preferredTags,
                updatedAt: timestamp,
            },
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        const existing = await db.collection(userPreferencesCollection).doc(params.userId).get();
        if (existing.exists) {
            const previous = UserPreferencesSchema.safeParse(existing.data());
            if (previous.success) {
                document.createdAt = previous.data.createdAt;
            }
        }

        await db.collection(userPreferencesCollection).doc(params.userId).set(document, { merge: true });
        return document;
    },
};
