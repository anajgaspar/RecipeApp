import { z } from 'zod';

export const UserPreferencesSchema = z.object({
    id: z.string(),
    preferences: z.object({
        userId: z.string(),
        preferredCategories: z.array(z.string()),
        preferredTags: z.array(z.string()),
        updatedAt: z.string(),
    }),
    createdAt: z.string(),
    updatedAt: z.string(),
})