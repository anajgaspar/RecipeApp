import { z } from "zod";

export const RecipeCompletionSchema = z.object({
    id: z.string(),
    userId: z.string(),
    profileId: z.string(),
    recipeId: z.string(),
    completedAt: z.string(),
    createdAt: z.string(),
});