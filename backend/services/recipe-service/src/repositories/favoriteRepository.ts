import { db } from "../config/firebase";
import { UserFavoritesSchema } from "../schemas/userFavoritesSchema";
import { z } from "zod";
import crypto from "crypto";

type FavoritesDocument = z.infer<typeof UserFavoritesSchema>;
type CreateFavoritesParams = {
    userId: string;
    profileId: string;
    recipeId: string;
};

const favoritesCollection = "favorites";

export const FavoritesRepository = {
    async findAll(): Promise<FavoritesDocument[]> {
        const documents = await db.collection(favoritesCollection).orderBy("createdAt", "desc").get();

        return documents.docs
            .map((doc) => UserFavoritesSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data);
    },

    async findById(id: string): Promise<FavoritesDocument | null> {
        const document = await db.collection(favoritesCollection).doc(id).get();
        if (!document.exists) {
            return null;
        }

        const parsedFavorite = UserFavoritesSchema.safeParse(document.data());
        return parsedFavorite.success ? parsedFavorite.data : null;
    },

    async findByUserAndRecipe(userId: string, profileId: string, recipeId: string): Promise<FavoritesDocument | null> {
        const documents = await db
            .collection(favoritesCollection)
            .where("userId", "==", userId)
            .get();

        const matchingFavorite = documents.docs
            .map((doc) => UserFavoritesSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data)
            .find((favorite) => (favorite.profileId ?? favorite.userId) === profileId && favorite.recipeId === recipeId);

        return matchingFavorite ?? null;
    },

    async listByUserId(userId: string, profileId = userId): Promise<FavoritesDocument[]> {
        const documents = await db
            .collection(favoritesCollection)
            .where("userId", "==", userId)
            .get();

        return documents.docs
            .map((doc) => UserFavoritesSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data)
            .filter((favorite) => (favorite.profileId ?? favorite.userId) === profileId)
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    },

    async create(params: CreateFavoritesParams): Promise<FavoritesDocument> {
        const document: FavoritesDocument = {
            id: crypto.randomUUID(),
            userId: params.userId,
            profileId: params.profileId,
            recipeId: params.recipeId,
            createdAt: new Date().toISOString(),
        };

        await db.collection(favoritesCollection).doc(document.id).set(document);
        return document;
    },

    async deleteByUserAndRecipe(userId: string, profileId: string, recipeId: string): Promise<void> {
        const documents = await db
            .collection(favoritesCollection)
            .where("userId", "==", userId)
            .get();

        if (documents.empty) {
            return;
        }

        const batch = db.batch();
        documents.docs.forEach((doc) => {
            const data = UserFavoritesSchema.safeParse(doc.data());
            if (!data.success) {
                return;
            }

            if ((data.data.profileId ?? data.data.userId) === profileId && data.data.recipeId === recipeId) {
                batch.delete(doc.ref);
            }
        });
        await batch.commit();
    },
};
