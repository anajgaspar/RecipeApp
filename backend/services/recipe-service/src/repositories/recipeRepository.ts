import { db } from "../config/firebase";
import { CreateRecipeSchema, RecipeDocumentSchema } from "../schemas/recipeSchema";
import { z } from "zod";
import crypto from "crypto";

type RecipeDocument = z.infer<typeof RecipeDocumentSchema>;
type CreateRecipeParams = z.infer<typeof CreateRecipeSchema> & {
    id: string;
    authorId: string;
};
type UpdateRecipeParams = Partial<Omit<RecipeDocument, "id" | "authorId" | "createdAt">>;

type SearchRecipeFilters = {
    category?: string;
    difficulty?: RecipeDocument["difficulty"];
    query?: string;
    limit?: number;
};

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

    async findAll(limit = 50): Promise<RecipeDocument[]> {
        const documents = await db.collection(recipesCollection).orderBy("createdAt", "desc").limit(limit).get();

        return documents.docs
            .map((doc) => RecipeDocumentSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data);
    },

    async findByAuthorId(authorId: string, limit = 50): Promise<RecipeDocument[]> {
        const documents = await db
            .collection(recipesCollection)
            .where("authorId", "==", authorId)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();

        return documents.docs
            .map((doc) => RecipeDocumentSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data);
    },

    async create(params: CreateRecipeParams): Promise<RecipeDocument | null> {
        const document: RecipeDocument = {
            id: params.id,
            authorId: params.authorId,
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
        await db.collection(recipesCollection).doc(id).set(
            {
                ...params,
                updatedAt: new Date().toISOString(),
            },
            { merge: true }
        );
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

            if (filters.query) {
                const query = filters.query.toLowerCase();
                const searchableText = [
                    recipe.title,
                    ...recipe.category,
                    ...recipe.ingredients.map((ingredient) => ingredient.name),
                    ...recipe.steps.map((step) => step.instruction),
                ]
                    .join(" ")
                    .toLowerCase();

                if (!searchableText.includes(query)) {
                    return false;
                }
            }

            return true;
        });
    },
};
