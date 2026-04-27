import crypto from "crypto";
import { FavoritesRepository } from "../repositories/favoriteRepository";
import { z } from "zod";
import { RecipeRepository } from "../repositories/recipeRepository";
import { CreateRecipeSchema, RecipeDocumentSchema } from "../schemas/recipeSchema";

type RecipeDocument = z.infer<typeof RecipeDocumentSchema>;
type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>;

type SearchRecipesParams = {
    query?: string;
    category?: string;
    difficulty?: RecipeDocument["difficulty"];
    servingsMin?: number;
    servingsMax?: number;
    limit?: number;
};

function normalizeText(value: string): string {
    return value.trim().toLowerCase();
}

function buildSearchableText(recipe: RecipeDocument): string {
    return [
        recipe.title,
        recipe.authorName ?? "",
        ...recipe.category,
        ...recipe.ingredients.map((ingredient) => ingredient.name),
        ...recipe.steps.map((step) => step.instruction),
    ]
        .join(" ")
        .toLowerCase();
}

type RecommendationProfile = {
    categoryWeights: Map<string, number>;
    ingredientWeights: Map<string, number>;
};

function buildRecommendationProfile(recipes: RecipeDocument[]): RecommendationProfile {
    const categoryWeights = new Map<string, number>();
    const ingredientWeights = new Map<string, number>();

    recipes.forEach((recipe) => {
        recipe.category.forEach((category) => {
            const normalizedCategory = normalizeText(category);
            categoryWeights.set(normalizedCategory, (categoryWeights.get(normalizedCategory) ?? 0) + 1);
        });

        recipe.ingredients.forEach((ingredient) => {
            const normalizedIngredient = normalizeText(ingredient.name);
            ingredientWeights.set(normalizedIngredient, (ingredientWeights.get(normalizedIngredient) ?? 0) + 1);
        });
    });

    return {
        categoryWeights,
        ingredientWeights,
    };
}

function scoreRecipeForRecommendation(recipe: RecipeDocument, profile: RecommendationProfile): number {
    const categoryScore = recipe.category.reduce((sum, category) => {
        const normalizedCategory = normalizeText(category);
        return sum + (profile.categoryWeights.get(normalizedCategory) ?? 0) * 3;
    }, 0);

    const ingredientScore = recipe.ingredients.reduce((sum, ingredient) => {
        const normalizedIngredient = normalizeText(ingredient.name);
        return sum + (profile.ingredientWeights.get(normalizedIngredient) ?? 0);
    }, 0);

    return categoryScore + ingredientScore;
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
        const fetchLimit = Math.max(limit * 6, 120);
        const allRecipes = await RecipeRepository.findAll(fetchLimit);

        if (!userId) {
            return allRecipes.slice(0, limit);
        }

        const favorites = await FavoritesRepository.listByUserId(userId);
        if (favorites.length === 0) {
            return allRecipes.slice(0, limit);
        }

        const favoriteRecipes = await Promise.all(
            favorites.map((favorite) => RecipeRepository.findById(favorite.recipeId))
        );

        const validFavoriteRecipes = favoriteRecipes.filter((recipe): recipe is RecipeDocument => recipe !== null);
        if (validFavoriteRecipes.length === 0) {
            return allRecipes.slice(0, limit);
        }

        const profile = buildRecommendationProfile(validFavoriteRecipes);

        const favoritedIds = new Set(favorites.map((f) => f.recipeId));

        const rankedRecipes = allRecipes
            .filter((recipe) => !favoritedIds.has(recipe.id))
            .map((recipe) => ({
                recipe,
                score: scoreRecipeForRecommendation(recipe, profile),
            }))
            .sort((left, right) => {
                if (right.score !== left.score) {
                    return right.score - left.score;
                }

                return right.recipe.createdAt.localeCompare(left.recipe.createdAt);
            });

        const recommendations = rankedRecipes
            .filter((item) => item.score > 0)
            .map((item) => item.recipe);

        if (recommendations.length >= limit) {
            return recommendations.slice(0, limit);
        }

        const fallbackRecipes = rankedRecipes
            .filter((item) => item.score === 0)
            .map((item) => item.recipe);

        return [...recommendations, ...fallbackRecipes].slice(0, limit);
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

            if (params.servingsMin !== undefined) {
                if (recipe.servings === undefined || recipe.servings < params.servingsMin) {
                    return false;
                }
            }

            if (params.servingsMax !== undefined) {
                if (recipe.servings === undefined || recipe.servings > params.servingsMax) {
                    return false;
                }
            }

            if (params.query) {
                const query = normalizeText(params.query);
                const searchableText = buildSearchableText(recipe);

                const queryTokens = query.split(/\s+/).filter(Boolean);
                if (queryTokens.some((token) => !searchableText.includes(token))) {
                    return false;
                }
            }

            return true;
        });
    },
};
