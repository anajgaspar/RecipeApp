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

const RecipeDifficultyReadSchema = z
    .enum(["Fácil", "Médio", "Difícil", "fácil", "médio", "difícil"])
    .transform((value) => {
        const normalized = value.toLowerCase();

        if (normalized === "fácil") return "Fácil" as const;
        if (normalized === "médio") return "Médio" as const;
        return "Difícil" as const;
    });

const RecipeCategoryReadSchema = z.union([
    z.array(z.string().trim().min(1)),
    z.string().trim().min(1),
    z.null(),
    z.undefined(),
]).transform((value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
});

export const RecipeDocumentSchema = z.object({
    id: z.string(),
    authorId: z.string(),
    authorName: z.string().trim().optional(),
    authorAvatarDataUrl: z.string().nullable().optional(),
    title: z.string().trim().min(1),
    imageUrl: z.string().url(),
    prepTimeMinutes: z.number().int(),
    servings: z.number().int().optional(),
    difficulty: RecipeDifficultyReadSchema,
    category: RecipeCategoryReadSchema,
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

export const RecipeDocumentLightSchema = RecipeDocumentSchema.extend({
    ingredients: z.array(z.any()).default([]),
    steps: z.array(z.any()).default([]),
});

export const CreateRecipeSchema = z.object({
    authorName: z.string().trim().optional(),
    authorAvatarDataUrl: z.string().nullable().optional(),
    title: z.string().trim().min(1),
    imageUrl: z.string().url(),
    prepTimeMinutes: z.number().int(),
    servings: z.number().int().optional(),
    difficulty: z.enum(RecipeDifficultyOptions),
    category: z.array(z.string().trim().min(1)).default([]),
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
