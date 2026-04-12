import { z } from 'zod';

export const RecipeDifficultyOptions = ["Fácil", "Médio", "Difícil"] as const;
export const RecipeCategoryOptions = [
    "Low Carb",
    "Cetogênica",
    "Mediterrânea",
    "Paleolítica",
    "Vegetariana",
    "Vegana",
    "Sem Lactose",
] as const;

export const RecipeDocumentSchema = z.object({
    id: z.string(),
    authorId: z.string(),
    title: z.string().trim().min(1),
    imageUrl: z.string().url(),
    prepTimeMinutes: z.number().int(),
    servings: z.number().int().optional(),
    difficulty: z.enum(RecipeDifficultyOptions),
    category: z.array(z.enum(RecipeCategoryOptions)).default([]),
    ingredients: z.array(
        z.object({
            id: z.string(),
            name: z.string().trim().min(1),
            quantityValue: z.string(),
            quantityUnit: z.string(),
            price: z.number().optional(),
            position: z.number().int(),
        })
    ).min(1),
    steps: z.array(
        z.object({
            id: z.string(),
            stepNumber: z.number().int(),
            instruction: z.string().trim().min(1),
            timerSeconds: z.number().optional()
        })
    ).min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export const CreateRecipeSchema = z.object({
    title: z.string().trim().min(1),
    imageUrl: z.string().url(),
    prepTimeMinutes: z.number().int(),
    servings: z.number().int().optional(),
    difficulty: z.enum(RecipeDifficultyOptions),
    category: z.array(z.enum(RecipeCategoryOptions)).default([]),
    ingredients: z.array(
        z.object({
            name: z.string().trim().min(1),
            quantityValue: z.string(),
            quantityUnit: z.string(),
            price: z.number().optional(),
            position: z.number().int(),
        })
    ).min(1),
    steps: z.array(
        z.object({
            stepNumber: z.number().int(),
            instruction: z.string().trim().min(1),
            timerSeconds: z.number().optional()
        })
    ).min(1),
})
