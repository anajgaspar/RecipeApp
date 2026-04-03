import { z } from "zod";

export const UserFavoritesSchema = z.object({
    id: z.string(),
    userId: z.string(),
    recipeId: z.string(),
    createdAt: z.string(),
});