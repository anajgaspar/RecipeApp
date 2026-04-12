import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    avatarDataUrl: z.string().nullable().default(null),
    passwordHash: z.string().min(6),
    emailVerified: z.boolean().default(false),
    emailVerificationTokenHash: z.string().nullable().default(null),
    emailVerificationExpiresAt: z.string().nullable().default(null),
    createdAt: z.string(),
    updatedAt: z.string(),
})