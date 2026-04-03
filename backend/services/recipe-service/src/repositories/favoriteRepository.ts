import { db } from "../config/firebase";
import { UserFavoritesSchema } from "../schemas/userFavoritesSchema";
import { z } from "zod";
import crypto from "crypto";

type FavoritesDocument = z.infer<typeof UserFavoritesSchema>;
type CreateFavoritesParams = {
    userId: string;
    recipeId: string;
};

const favoritesCollection = "favorites";

export const FavoritesRepository = {
    async findById(id: string): Promise<FavoritesDocument | null> {
        const document = await db.collection(favoritesCollection).doc(id).get();
        if (!document.exists) {
            return null;
        }

        const parsedFavorite = UserFavoritesSchema.safeParse(document.data());
        return parsedFavorite.success ? parsedFavorite.data : null;
    },

    async findByUserAndRecipe(userId: string, recipeId: string): Promise<FavoritesDocument | null> {
        const documents = await db
            .collection(favoritesCollection)
            .where("userId", "==", userId)
            .where("recipeId", "==", recipeId)
            .limit(1)
            .get();

        if (documents.empty) {
            return null;
        }

        const parsedFavorite = UserFavoritesSchema.safeParse(documents.docs[0].data());
        return parsedFavorite.success ? parsedFavorite.data : null;
    },

    async listByUserId(userId: string): Promise<FavoritesDocument[]> {
        const documents = await db
            .collection(favoritesCollection)
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        return documents.docs
            .map((doc) => UserFavoritesSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data);
    },

    async create(params: CreateFavoritesParams): Promise<FavoritesDocument> {
        const document: FavoritesDocument = {
            id: crypto.randomUUID(),
            userId: params.userId,
            recipeId: params.recipeId,
            createdAt: new Date().toISOString(),
        };

        await db.collection(favoritesCollection).doc(document.id).set(document);
        return document;
    },

    async deleteByUserAndRecipe(userId: string, recipeId: string): Promise<void> {
        const documents = await db
            .collection(favoritesCollection)
            .where("userId", "==", userId)
            .where("recipeId", "==", recipeId)
            .get();

        if (documents.empty) {
            return;
        }

        const batch = db.batch();
        documents.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
    },
};
