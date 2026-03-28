import { UserRepository } from "../repositories/userRepository";
import { RegisterSchema, LoginSchema } from "../schemas/authSchema";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const jwtSecret = process.env.JWT_SECRET as string;
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? "1h") as jwt.SignOptions["expiresIn"];

function getJwtSecret(): string {
    if (!jwtSecret) {
        throw new Error("JWT_SECRET ausente.");
    }
    return jwtSecret;
}

export const AuthService = {
    async register(data: z.infer<typeof RegisterSchema>) {
        const exists = await UserRepository.findByEmail(data.email);
        if (exists) {
            throw new Error("Email já em uso");
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        const newUser = await UserRepository.create({
            id: crypto.randomUUID(),
            name: data.name,
            email: data.email,
            passwordHash
        });

        if (!newUser) {
            throw new Error("Falha ao criar usuário.");
        }

        return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt
        };
    },

    async login(data: z.infer<typeof LoginSchema>) {
        const user = await UserRepository.findByEmail(data.email);
        if (!user) {
            throw new Error("Credenciais inválidas!");
        }

        const valid = await bcrypt.compare(data.password, user.passwordHash);
        if (!valid) {
            throw new Error("Credenciais inválidas!");
        }

        const token = jwt.sign(
            {userId: user.id},
            getJwtSecret(),
            {expiresIn: jwtExpiresIn}
        );

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        };
    }
};