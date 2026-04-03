import { z } from 'zod';

export const SearchHistorySchema = z.object({
    id: z.string(),
    userId: z.string(),
    queryText: z.string().trim().max(120).min(1),
    source: z.enum(["text", "voice"]),
    createdAt: z.string(),
})