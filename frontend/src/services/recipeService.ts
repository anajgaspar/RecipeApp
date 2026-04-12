import { isAxiosError } from "axios";
import api from "@/src/services/api";

const AUTH_API_URL = process.env.EXPO_PUBLIC_API_AUTH_URL;
const RECIPE_API_URL =
  process.env.EXPO_PUBLIC_API_RECIPE_URL ??
  (AUTH_API_URL ? AUTH_API_URL.replace(":3001", ":3002") : "http://localhost:3002");

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
  if (isAxiosError(error)) {
    if (!error.response) {
      return "Não foi possível conectar ao recipe-service. Verifique se ele está rodando e se EXPO_PUBLIC_API_RECIPE_URL está correto.";
    }

    const responseMessage =
      (error.response?.data as { error?: string } | undefined)?.error ??
      (error.response?.data as { message?: string } | undefined)?.message;

    if (responseMessage) {
      return responseMessage;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível criar a receita.";
}

type CreateRecipeResponse = {
  message: string;
  recipe: unknown;
};

type UpdateRecipeResponse = {
  message: string;
  recipe: unknown;
};

type DeleteRecipeResponse = {
  message: string;
};

type ListRecipesResponse = {
  recipes: Recipe[];
};

type GetRecipeResponse = {
  recipe: Recipe;
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
    await api.post<CreateRecipeResponse>(`${RECIPE_API_URL}/api/recipes`, payload);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getSuggestedRecipes(limit = 20): Promise<Recipe[]> {
  try {
    const { data } = await api.get<ListRecipesResponse>(`${RECIPE_API_URL}/api/recipes/feed/suggested`, {
      params: { limit },
    });

    return data.recipes;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getRecipeById(recipeId: string): Promise<Recipe> {
  try {
    const { data } = await api.get<GetRecipeResponse>(`${RECIPE_API_URL}/api/recipes/${recipeId}`);
    return data.recipe;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getMyRecipes(limit = 50): Promise<Recipe[]> {
  try {
    const { data } = await api.get<ListRecipesResponse>(`${RECIPE_API_URL}/api/recipes/me`, {
      params: { limit },
    });

    return data.recipes;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateRecipe(recipeId: string, payload: CreateRecipePayload): Promise<void> {
  try {
    await api.put<UpdateRecipeResponse>(`${RECIPE_API_URL}/api/recipes/${recipeId}`, payload);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  try {
    await api.delete<DeleteRecipeResponse>(`${RECIPE_API_URL}/api/recipes/${recipeId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function searchRecipes(params: SearchRecipesParams): Promise<Recipe[]> {
  try {
    const { data } = await api.get<ListRecipesResponse>(`${RECIPE_API_URL}/api/recipes/search`, {
      params: buildSearchParams(params),
    });

    return data.recipes;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}