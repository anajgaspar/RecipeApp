import { z } from 'zod';

export const RegisterSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8)
})

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export const FirebaseLoginSchema = z.object({
    firebaseIdToken: z.string().min(10),
})

export const VerifyEmailSchema = z.object({
    email: z.string().email(),
    token: z.string().length(6)
})

export const ResendVerificationSchema = z.object({
    email: z.string().email()
})

export const UpdateProfileSchema = z.object({
    name: z.string().trim().min(1).optional(),
    email: z.string().email().optional(),
    avatarDataUrl: z.string().nullable().optional(),
    currentPassword: z.string().min(6).optional(),
    newPassword: z.string().min(8).optional(),
}).refine(
    (data) => Boolean(data.name || data.email || data.newPassword || data.avatarDataUrl !== undefined),
    { message: "Informe pelo menos um campo para atualizar." }
).refine(
    (data) => {
        if (data.newPassword && !data.currentPassword) {
            return false;
        }

        if (data.currentPassword && !data.newPassword) {
            return false;
        }

        return true;
    },
    { message: "Informe a senha atual e a nova senha para alterar a senha." }
);