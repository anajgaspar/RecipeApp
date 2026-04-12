import crypto from "crypto";
import { z } from "zod";
import { RecipeRepository } from "../repositories/recipeRepository";
import { CreateRecipeSchema, RecipeDocumentSchema } from "../schemas/recipeSchema";

type RecipeDocument = z.infer<typeof RecipeDocumentSchema>;
type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>;

type SearchRecipesParams = {
    query?: string;
    category?: string;
    difficulty?: RecipeDocument["difficulty"];
    limit?: number;
};

function normalizeText(value: string): string {
    return value.trim().toLowerCase();
}

function buildSearchableText(recipe: RecipeDocument): string {
    return [
        recipe.title,
        ...recipe.category,
        ...recipe.ingredients.map((ingredient) => ingredient.name),
        ...recipe.steps.map((step) => step.instruction),
    ]
        .join(" ")
        .toLowerCase();
}

export const RecipeService = {
    async createRecipe(authorId: string, data: CreateRecipeInput): Promise<RecipeDocument> {
        const createdRecipe = await RecipeRepository.create({
            id: crypto.randomUUID(),
            authorId,
            ...data,
        });

        if (!createdRecipe) {
            throw new Error("Falha ao criar receita.");
        }

        return createdRecipe;
    },

    async getRecipeById(recipeId: string): Promise<RecipeDocument> {
        const recipe = await RecipeRepository.findById(recipeId);
        if (!recipe) {
            throw new Error("Receita não encontrada");
        }

        return recipe;
    },

    async updateRecipe(authorId: string, recipeId: string, data: CreateRecipeInput): Promise<RecipeDocument> {
        const existingRecipe = await RecipeRepository.findById(recipeId);

        if (!existingRecipe) {
            throw new Error("Receita não encontrada");
        }

        if (existingRecipe.authorId !== authorId) {
            throw new Error("Você não tem permissão para editar esta receita.");
        }

        const nextRecipe: RecipeDocument = {
            ...existingRecipe,
            ...data,
            authorId,
            updatedAt: new Date().toISOString(),
            ingredients: data.ingredients.map((ingredient, index) => ({
                id: existingRecipe.ingredients[index]?.id ?? crypto.randomUUID(),
                name: ingredient.name,
                quantityValue: ingredient.quantityValue,
                quantityUnit: ingredient.quantityUnit,
                ...(ingredient.price !== undefined ? { price: ingredient.price } : {}),
                position: ingredient.position ?? index + 1,
            })),
            steps: data.steps.map((step, index) => ({
                id: existingRecipe.steps[index]?.id ?? crypto.randomUUID(),
                stepNumber: step.stepNumber ?? index + 1,
                instruction: step.instruction,
                ...(step.timerSeconds !== undefined ? { timerSeconds: step.timerSeconds } : {}),
            })),
        };

        await RecipeRepository.updateById(recipeId, nextRecipe);
        return nextRecipe;
    },

    async deleteRecipe(authorId: string, recipeId: string): Promise<void> {
        const existingRecipe = await RecipeRepository.findById(recipeId);

        if (!existingRecipe) {
            throw new Error("Receita não encontrada");
        }

        if (existingRecipe.authorId !== authorId) {
            throw new Error("Você não tem permissão para excluir esta receita.");
        }

        await RecipeRepository.deleteById(recipeId);
    },

    async getMyRecipes(authorId: string, limit = 50): Promise<RecipeDocument[]> {
        return RecipeRepository.findByAuthorId(authorId, limit);
    },

    async getSuggestedFeed(userId?: string, limit = 20): Promise<RecipeDocument[]> {
        const _userId = userId;
        return RecipeRepository.findAll(limit);
    },

    async searchRecipes(params: SearchRecipesParams): Promise<RecipeDocument[]> {
        const recipes = await RecipeRepository.findAll(params.limit ?? 50);

        return recipes.filter((recipe) => {
            if (params.category && !recipe.category.some((category) => normalizeText(category) === normalizeText(params.category!))) {
                return false;
            }

            if (params.difficulty && recipe.difficulty !== params.difficulty) {
                return false;
            }

            if (params.query) {
                const query = normalizeText(params.query);
                const searchableText = buildSearchableText(recipe);

                if (!searchableText.includes(query)) {
                    return false;
                }
            }

            return true;
        });
    },
};
