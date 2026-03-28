import { z } from 'zod';

export const RegisterSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6)
})

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export const VerifyEmailSchema = z.object({
    email: z.string().email(),
    token: z.string().length(6)
})

export const ResendVerificationSchema = z.object({
    email: z.string().email()
})