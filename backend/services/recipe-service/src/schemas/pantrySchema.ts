import { z } from "zod";

export const PantryItemSchema = z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    quantity: z.string().optional(),
    expirationDate: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
});

export type PantryItem = z.infer<typeof PantryItemSchema>;
