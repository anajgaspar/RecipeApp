import { apiRecipe } from "@/src/services/api";
import { getFriendlyHttpErrorMessage } from "@/src/services/httpError";
import { ApiEntityResponse, ApiMessageResponse } from "./apiTypes";

export type RecipeDifficulty = "Fácil" | "Médio" | "Difícil";

export type RecipeCategory =
  | "Low Carb"
  | "Cetogênica"
  | "Mediterrânea"
  | "Paleolítica"
  | "Vegetariana"
  | "Vegana"
  | "Sem Lactose";

export type CreateRecipeIngredient = {
  name: string;
  quantityValue: string;
  quantityUnit: string;
  price?: number;
  position: number;
};

export type CreateRecipeStep = {
  stepNumber: number;
  instruction: string;
  timerSeconds?: number;
};

export type CreateRecipePayload = {
  authorName?: string;
  authorAvatarDataUrl?: string | null;
  title: string;
  imageUrl: string;
  prepTimeMinutes: number;
  servings?: number;
  difficulty: RecipeDifficulty;
  category: RecipeCategory[];
  ingredients: CreateRecipeIngredient[];
  steps: CreateRecipeStep[];
};

export type Recipe = {
  id: string;
  authorId: string;
  authorName?: string;
  authorAvatarDataUrl?: string | null;
  title: string;
  imageUrl: string;
  prepTimeMinutes: number;
  servings?: number;
  difficulty: RecipeDifficulty;
  category: RecipeCategory[];
  ingredients: (CreateRecipeIngredient & {
    id: string;
  })[];
  steps: (CreateRecipeStep & {
    id: string;
  })[];
  createdAt: string;
  updatedAt: string;
};

function getErrorMessage(error: unknown): string {
  return getFriendlyHttpErrorMessage(error, "Não foi possível concluir a operação com receitas.");
}

function normalizeIngredientName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

type CreateRecipeResponse = ApiEntityResponse<"recipe", Recipe>;
type UpdateRecipeResponse = ApiEntityResponse<"recipe", Recipe>;
type DeleteRecipeResponse = ApiMessageResponse;

type ListRecipesResponse = {
  recipes: Recipe[];
};

type GetRecipeResponse = {
  recipe: Recipe;
};

export type FavoriteRecord = {
  id: string;
  userId: string;
  profileId?: string;
  recipeId: string;
  createdAt: string;
};

export type FavoriteRecipeEntry = {
  favorite: FavoriteRecord;
  recipe: Recipe | null;
};

type ToggleFavoriteResponse = {
  message: string;
  favorited: boolean;
  favorite?: FavoriteRecord;
};

type ListFavoritesResponse = {
  favorites: FavoriteRecipeEntry[];
};

export type RecipeCompletionRecord = {
  id: string;
  userId: string;
  profileId: string;
  recipeId: string;
  completedAt: string;
  createdAt: string;
};

type CompletionStatusResponse = {
  completed: boolean;
  completion: RecipeCompletionRecord | null;
};

type ListCompletionsResponse = {
  completions: RecipeCompletionRecord[];
  completedRecipeIds: string[];
};

export type MyRecipeBadgeProgress = {
  firstHighRating: boolean;
  recipeSavedByAnotherUser: boolean;
};

export type SearchRecipesParams = {
  query?: string;
  category?: RecipeCategory;
  difficulty?: RecipeDifficulty;
  servingsMin?: number;
  servingsMax?: number;
  limit?: number;
};

function buildSearchParams(params: SearchRecipesParams): Record<string, string | number> {
  return {
    ...(params.query ? { q: params.query } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(params.difficulty ? { difficulty: params.difficulty } : {}),
    ...(params.servingsMin !== undefined ? { servingsMin: params.servingsMin } : {}),
    ...(params.servingsMax !== undefined ? { servingsMax: params.servingsMax } : {}),
    ...(params.limit !== undefined ? { limit: params.limit } : {}),
  };
}

export async function createRecipe(payload: CreateRecipePayload): Promise<void> {
  try {
    await apiRecipe.post<CreateRecipeResponse>("/api/recipes", payload);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getSuggestedRecipes(limit = 20): Promise<Recipe[]> {
  try {
    const { data } = await apiRecipe.get<ListRecipesResponse>("/api/recipes/feed/suggested", {
      params: { limit },
    });

    return data.recipes;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getRecipeById(recipeId: string): Promise<Recipe> {
  try {
    const { data } = await apiRecipe.get<GetRecipeResponse>(`/api/recipes/${recipeId}`);
    return data.recipe;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getMyRecipes(limit = 50): Promise<Recipe[]> {
  try {
    const { data } = await apiRecipe.get<ListRecipesResponse>("/api/recipes/me", {
      params: { limit },
    });

    return data.recipes;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateRecipe(recipeId: string, payload: CreateRecipePayload): Promise<void> {
  try {
    await apiRecipe.put<UpdateRecipeResponse>(`/api/recipes/${recipeId}`, payload);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  try {
    await apiRecipe.delete<DeleteRecipeResponse>(`/api/recipes/${recipeId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function listFavoriteRecipes(): Promise<FavoriteRecipeEntry[]> {
  try {
    const { data } = await apiRecipe.get<ListFavoritesResponse>("/api/favorites");
    return data.favorites;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function toggleFavorite(recipeId: string): Promise<ToggleFavoriteResponse> {
  try {
    const { data } = await apiRecipe.post<ToggleFavoriteResponse>(`/api/favorites/${recipeId}/toggle`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getRecipeCompletionStatus(recipeId: string): Promise<CompletionStatusResponse> {
  try {
    const { data } = await apiRecipe.get<CompletionStatusResponse>(`/api/recipes/${recipeId}/completion-status`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function markRecipeCompleted(recipeId: string): Promise<CompletionStatusResponse> {
  try {
    const { data } = await apiRecipe.post<CompletionStatusResponse>(`/api/recipes/${recipeId}/complete`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function listCompletedRecipes(): Promise<ListCompletionsResponse> {
  try {
    const { data } = await apiRecipe.get<ListCompletionsResponse>("/api/recipes/completions");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getMyBadgeProgress(): Promise<MyRecipeBadgeProgress> {
  try {
    const { data } = await apiRecipe.get<{ badges: MyRecipeBadgeProgress }>("/api/recipes/badges/me");
    return data.badges;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
  try {
    const normalizedIngredients = ingredients
      .map(normalizeIngredientName)
      .filter(Boolean);

    if (normalizedIngredients.length === 0) return [];

    const recipeById = new Map<string, Recipe>();

    await Promise.all(
      normalizedIngredients.map(async (ingredient) => {
        const { data } = await apiRecipe.get<ListRecipesResponse>("/api/recipes/search", {
          params: { q: ingredient, limit: 100 },
        });

        data.recipes.forEach((recipe) => {
          recipeById.set(recipe.id, recipe);
        });
      })
    );

    return Array.from(recipeById.values()).filter((recipe) =>
      recipe.ingredients.some((ingredient) => normalizedIngredients.includes(normalizeIngredientName(ingredient.name)))
    );
  } catch (error) {
    console.warn("Erro ao buscar receitas por ingredientes:", error);
    return [];
  }
}

export async function searchRecipes(params: SearchRecipesParams): Promise<Recipe[]> {
  try {
    const { data } = await apiRecipe.get<ListRecipesResponse>("/api/recipes/search", {
      params: buildSearchParams(params),
    });

    return data.recipes;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}