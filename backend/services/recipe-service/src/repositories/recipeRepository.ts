import { db } from "../config/firebase";
import { CreateRecipeSchema, RecipeDocumentLightSchema, RecipeDocumentSchema } from "../schemas/recipeSchema";
import { z } from "zod";
import crypto from "crypto";

type RecipeDocument = z.infer<typeof RecipeDocumentSchema>;
type CreateRecipeParams = z.infer<typeof CreateRecipeSchema> & {
    id: string;
    authorId: string;
};
type UpdateRecipeParams = Partial<Omit<RecipeDocument, "id" | "authorId" | "createdAt">>;

type SearchRecipeFilters = {
    query?: string;
    category?: string;
    difficulty?: RecipeDocument["difficulty"];
    servingsMin?: number;
    servingsMax?: number;
    limit?: number;
};

function removeUndefinedDeep<T>(value: T): T {
    if (Array.isArray(value)) {
        return value.map((item) => removeUndefinedDeep(item)) as T;
    }

    if (value !== null && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
            .filter(([, item]) => item !== undefined)
            .map(([key, item]) => [key, removeUndefinedDeep(item)]);

        return Object.fromEntries(entries) as T;
    }

    return value;
}

const recipesCollection = "recipes";

export const RecipeRepository = {
    async findById(id: string): Promise<RecipeDocument | null> {
        const document = await db.collection(recipesCollection).doc(id).get();
        if (!document.exists) {
            return null;
        }

        const parsedRecipe = RecipeDocumentSchema.safeParse(document.data());
        return parsedRecipe.success ? parsedRecipe.data : null;
    },

    async findByAuthorIds(authorIds: string[], limit = 20): Promise<RecipeDocument[]> {
        if (authorIds.length === 0) return [];

        const snap = await db
            .collection(recipesCollection)
            .where("authorId", "in", authorIds)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();

        return snap.docs
            .map((doc) => RecipeDocumentSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data)
    },

    async findAll(limit = 50): Promise<RecipeDocument[]> {
        const documents = await db.collection(recipesCollection).orderBy("createdAt", "desc").limit(limit).get();

        return documents.docs
            .map((doc) => RecipeDocumentSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data);
    },

    async findAllLight(limit = 50): Promise<RecipeDocument[]> {
        const documents = await db
            .collection(recipesCollection)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .select(
                "id",
                "authorId",
                "authorName",
                "title",
                "imageUrl",
                "prepTimeMinutes",
                "difficulty",
                "category",
                "servings",
                "createdAt",
                "updatedAt",
            )
            .get();

        return documents.docs
            .map((doc) => RecipeDocumentLightSchema.safeParse({
                ...doc.data(),
                ingredients: [],
                steps: [],
            }))
            .filter((result) => result.success)
            .map((result) => result.data);
    },

    async findByAuthorId(authorId: string, limit?: number): Promise<RecipeDocument[]> {
        let query = db
            .collection(recipesCollection)
            .where("authorId", "==", authorId);

        if (limit !== undefined) {
            query = query.limit(limit);
        }

        const documents = await query.get();

        return documents.docs
            .map((doc) => RecipeDocumentSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data)
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    },

    async create(params: CreateRecipeParams): Promise<RecipeDocument | null> {
        const document: RecipeDocument = {
            id: params.id,
            authorId: params.authorId,
            ...(params.authorName ? { authorName: params.authorName } : {}),
            ...(params.authorAvatarDataUrl ? { authorAvatarDataUrl: params.authorAvatarDataUrl } : {}),
            title: params.title,
            imageUrl: params.imageUrl,
            prepTimeMinutes: params.prepTimeMinutes,
            difficulty: params.difficulty,
            category: params.category,
            ingredients: params.ingredients.map((ingredient, index) => ({
                id: crypto.randomUUID(),
                name: ingredient.name,
                quantityValue: ingredient.quantityValue,
                quantityUnit: ingredient.quantityUnit,
                ...(ingredient.price !== undefined ? { price: ingredient.price } : {}),
                position: ingredient.position ?? index + 1,
            })),
            steps: params.steps.map((step, index) => ({
                id: crypto.randomUUID(),
                stepNumber: step.stepNumber ?? index + 1,
                instruction: step.instruction,
                ...(step.timerSeconds !== undefined ? { timerSeconds: step.timerSeconds } : {}),
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...(params.servings !== undefined ? { servings: params.servings } : {}),
        };

        await db.collection(recipesCollection).doc(document.id).set(document);
        return document;
    },

    async updateById(id: string, params: UpdateRecipeParams): Promise<void> {
        const sanitizedParams = removeUndefinedDeep(params);

        await db.collection(recipesCollection).doc(id).set(
            {
                ...sanitizedParams,
                updatedAt: new Date().toISOString(),
            },
            { merge: true }
        );
    },

    async deleteById(id: string): Promise<void> {
        await db.collection(recipesCollection).doc(id).delete();
    },

    async findSuggested(filters: SearchRecipeFilters = {}): Promise<RecipeDocument[]> {
        const maxResults = filters.limit ?? 20;
        const documents = await db.collection(recipesCollection).orderBy("createdAt", "desc").limit(maxResults).get();

        const parsedRecipes = documents.docs
            .map((doc) => RecipeDocumentSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data);

        return parsedRecipes.filter((recipe) => {
            if (filters.category && !recipe.category.some((category) => category.toLowerCase() === filters.category!.toLowerCase())) {
                return false;
            }

            if (filters.difficulty && recipe.difficulty !== filters.difficulty) {
                return false;
            }

            if (filters.servingsMin !== undefined) {
                if (recipe.servings === undefined || recipe.servings < filters.servingsMin) {
                    return false;
                }
            }

            if (filters.servingsMax !== undefined) {
                if (recipe.servings === undefined || recipe.servings > filters.servingsMax) {
                    return false;
                }
            }

            if (filters.query) {
                const searchableText = [
                    recipe.title,
                    recipe.authorName ?? "",
                    ...recipe.category,
                    ...recipe.ingredients.map((ingredient) => ingredient.name),
                    ...recipe.steps.map((step) => step.instruction),
                ]
                    .join(" ")
                    .toLowerCase();

                const normalizedTokens = filters.query
                    .toLowerCase()
                    .split(/\s+/)
                    .map((token) => token.trim())
                    .filter(Boolean);

                if (normalizedTokens.some((token) => !searchableText.includes(token))) {
                    return false;
                }
            }

            return true;
        });
    },
};
