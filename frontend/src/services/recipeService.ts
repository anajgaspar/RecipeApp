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
  title: string;
  imageUrl: string;
  prepTimeMinutes: number;
  difficulty: RecipeDifficulty;
  category: RecipeCategory[];
  ingredients: CreateRecipeIngredient[];
  steps: CreateRecipeStep[];
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

export async function createRecipe(payload: CreateRecipePayload): Promise<void> {
  try {
    await api.post<CreateRecipeResponse>(`${RECIPE_API_URL}/api/recipes`, payload);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}