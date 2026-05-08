import { z } from "zod";

export const ShoppingListItemSchema = z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    quantity: z.string().optional(),
    checked: z.boolean().default(false),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
});

export type ShoppingListItem = z.infer<typeof ShoppingListItemSchema>;
