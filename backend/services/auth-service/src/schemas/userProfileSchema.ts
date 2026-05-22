import { z } from "zod";

export const UserProfileSchema = z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string().trim().min(1),
    avatarDataUrl: z.string().nullable().optional(),
    isDefault: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const CreateUserProfileSchema = z.object({
    name: z.string().trim().min(1).optional(),
    avatarDataUrl: z.string().nullable().optional(),
});

export const UpdateUserProfileSchema = z.object({
    name: z.string().trim().min(1).optional(),
    avatarDataUrl: z.string().nullable().optional(),
}).refine(
    (data) => Boolean(data.name || data.avatarDataUrl !== undefined),
    { message: "Informe pelo menos um campo para atualizar." }
);