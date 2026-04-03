import crypto from "crypto";
import { z } from "zod";
import { RecipeRepository } from "../repositories/recipeRepository";
import { UserPreferencesRepository } from "../repositories/userPreferencesRepository";
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
        recipe.category,
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

    async getSuggestedFeed(userId?: string, limit = 20): Promise<RecipeDocument[]> {
        const allRecipes = await RecipeRepository.findAll(Math.max(limit * 4, limit));

        if (!userId) {
            return allRecipes.slice(0, limit);
        }

        const preferences = await UserPreferencesRepository.findByUserId(userId);
        if (!preferences) {
            return allRecipes.slice(0, limit);
        }

        const preferredCategories = preferences.preferences.preferredCategories.map(normalizeText);
        const preferredTags = preferences.preferences.preferredTags.map(normalizeText);

        const scoredRecipes = allRecipes
            .map((recipe) => {
                let score = 0;
                const searchableText = buildSearchableText(recipe);
                const normalizedCategory = normalizeText(recipe.category);

                if (preferredCategories.includes(normalizedCategory)) {
                    score += 3;
                }

                preferredTags.forEach((tag) => {
                    if (searchableText.includes(tag)) {
                        score += 1;
                    }
                });

                return { recipe, score };
            })
            .sort((left, right) => {
                if (right.score !== left.score) {
                    return right.score - left.score;
                }

                return right.recipe.createdAt.localeCompare(left.recipe.createdAt);
            });

        const preferredRecipes = scoredRecipes
            .filter((item) => item.score > 0)
            .map((item) => item.recipe);

        if (preferredRecipes.length > 0) {
            return preferredRecipes.slice(0, limit);
        }

        return allRecipes.slice(0, limit);
    },

    async searchRecipes(params: SearchRecipesParams): Promise<RecipeDocument[]> {
        const recipes = await RecipeRepository.findAll(params.limit ?? 50);

        return recipes.filter((recipe) => {
            if (params.category && recipe.category !== params.category) {
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
