import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    passwordHash: z.string().min(6),
    createdAt: z.string(),
    updatedAt: z.string(),
})