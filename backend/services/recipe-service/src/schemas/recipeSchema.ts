import { z } from 'zod';

export const RecipeDocumentSchema = z.object({
    id: z.string(),
    authorId: z.string(),
    title: z.string().trim().min(1),
    imageUrl: z.string().url(),
    prepTimeMinutes: z.number().int(),
    difficulty: z.enum(["fácil", "médio", "difícil"]),
    category: z.string().trim().min(1),
    ingredients: z.array(
        z.object({
            id: z.string(),
            name: z.string().trim().min(1),
            quantityValue: z.string(),
            quantityUnit: z.string(),
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
    difficulty: z.enum(["fácil", "médio", "difícil"]),
    category: z.string().trim().min(1),
    ingredients: z.array(
        z.object({
            name: z.string().trim().min(1),
            quantityValue: z.string(),
            quantityUnit: z.string(),
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
