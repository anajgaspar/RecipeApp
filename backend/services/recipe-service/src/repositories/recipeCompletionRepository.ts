import crypto from "crypto";
import { db } from "../config/firebase";
import { RecipeCompletionSchema } from "../schemas/recipeCompletionSchema";
import { z } from "zod";

type RecipeCompletionDocument = z.infer<typeof RecipeCompletionSchema>;

type CreateRecipeCompletionParams = {
    userId: string;
    profileId: string;
    recipeId: string;
};

const completionsCollection = "recipe_completions";

function parseCompletionDocument(data: unknown): RecipeCompletionDocument | null {
    const parsedCompletion = RecipeCompletionSchema.safeParse(data);
    return parsedCompletion.success ? parsedCompletion.data : null;
}

export const RecipeCompletionRepository = {
    async findByProfileAndRecipe(profileId: string, recipeId: string): Promise<RecipeCompletionDocument | null> {
        const documents = await db
            .collection(completionsCollection)
            .where("profileId", "==", profileId)
            .where("recipeId", "==", recipeId)
            .limit(1)
            .get();

        if (documents.empty) {
            return null;
        }

        return parseCompletionDocument(documents.docs[0].data());
    },

    async create(params: CreateRecipeCompletionParams): Promise<RecipeCompletionDocument> {
        const timestamp = new Date().toISOString();
        const document: RecipeCompletionDocument = {
            id: crypto.randomUUID(),
            userId: params.userId,
            profileId: params.profileId,
            recipeId: params.recipeId,
            completedAt: timestamp,
            createdAt: timestamp,
        };

        await db.collection(completionsCollection).doc(document.id).set(document);
        return document;
    },

    async listByProfileId(profileId: string): Promise<RecipeCompletionDocument[]> {
        const documents = await db
            .collection(completionsCollection)
            .where("profileId", "==", profileId)
            .orderBy("createdAt", "desc")
            .get();

        return documents.docs
            .map((doc) => parseCompletionDocument(doc.data()))
            .filter((item): item is RecipeCompletionDocument => Boolean(item));
    },
};