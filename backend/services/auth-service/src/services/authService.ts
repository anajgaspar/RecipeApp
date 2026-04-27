import { UserRepository } from "../repositories/userRepository";
import {
    RegisterSchema,
    LoginSchema,
    VerifyEmailSchema,
    ResendVerificationSchema,
} from "../schemas/authSchema";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { EmailService } from "./emailService";
import { TokenBlacklistRepository } from "../repositories/tokenBlacklistRepository";
import { adminAuth } from "../config/firebase";

const jwtSecret = process.env.JWT_SECRET as string;
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? "1h") as jwt.SignOptions["expiresIn"];
const tokenTtlMinutes = Number(process.env.EMAIL_VERIFICATION_TTL_MINUTES ?? "60");

function getJwtSecret(): string {
    if (!jwtSecret) {
        throw new Error("JWT_SECRET ausente.");
    }
    return jwtSecret;
}

function signAccessToken(userId: string): string {
    return jwt.sign(
        { userId },
        getJwtSecret(),
        { expiresIn: jwtExpiresIn }
    );
}

function deriveDisplayNameFromEmail(email: string): string {
    const [localPart] = email.split("@");
    return localPart || "Usuário";
}

function hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function generateVerificationData() {
    const token = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + tokenTtlMinutes * 60 * 1000).toISOString();

    return {
        rawToken: token,
        tokenHash: hashToken(token),
        expiresAt,
    };
}

export const AuthService = {
    async register(data: z.infer<typeof RegisterSchema>) {
        const exists = await UserRepository.findByEmail(data.email);
        if (exists) {
            throw new Error("Email já em uso");
        }

        const passwordHash = await bcrypt.hash(data.password, 10);
        const verification = generateVerificationData();

        const newUser = await UserRepository.create({
            id: crypto.randomUUID(),
            name: data.name,
            email: data.email,
            avatarDataUrl: null,
            passwordHash,
            emailVerified: false,
            emailVerificationTokenHash: verification.tokenHash,
            emailVerificationExpiresAt: verification.expiresAt,
        });

        if (!newUser) {
            throw new Error("Falha ao criar usuário.");
        }

        let emailVerificationSent = true;
        try {
            await EmailService.sendEmailVerification({
                to: newUser.email,
                name: newUser.name,
                verificationToken: verification.rawToken,
            });
        } catch (_err) {
            emailVerificationSent = false;
        }

        return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            avatarDataUrl: newUser.avatarDataUrl,
            emailVerified: newUser.emailVerified,
            emailVerificationSent,
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

        if (!user.emailVerified) {
            throw new Error("Email não verificado");
        }

        const token = signAccessToken(user.id);

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarDataUrl: user.avatarDataUrl,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        };
    },

    async firebaseLogin(firebaseIdToken: string) {
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);
        } catch {
            throw new Error("Token Firebase inválido");
        }

        const email = decodedToken.email?.toLowerCase();
        if (!email) {
            throw new Error("Token Firebase inválido");
        }

        let user = await UserRepository.findByEmail(email);

        if (!user) {
            const generatedPasswordHash = await bcrypt.hash(crypto.randomUUID(), 10);
            user = await UserRepository.create({
                id: crypto.randomUUID(),
                name: decodedToken.name || deriveDisplayNameFromEmail(email),
                email,
                avatarDataUrl: null,
                passwordHash: generatedPasswordHash,
                emailVerified: true,
                emailVerificationTokenHash: null,
                emailVerificationExpiresAt: null,
            });
        }

        if (!user) {
            throw new Error("Falha ao criar usuário.");
        }

        if (!user.emailVerified) {
            await UserRepository.updateById(user.id, {
                emailVerified: true,
                emailVerificationTokenHash: null,
                emailVerificationExpiresAt: null,
                updatedAt: new Date().toISOString(),
            });

            user = {
                ...user,
                emailVerified: true,
                emailVerificationTokenHash: null,
                emailVerificationExpiresAt: null,
                updatedAt: new Date().toISOString(),
            };
        }

        const token = signAccessToken(user.id);

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarDataUrl: user.avatarDataUrl,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    },

    async verifyEmail(data: z.infer<typeof VerifyEmailSchema>) {
        const user = await UserRepository.findByEmail(data.email);
        if (!user) {
            throw new Error("Token inválido ou expirado");
        }

        if (user.emailVerified) {
            return {
                id: user.id,
                email: user.email,
                emailVerified: true,
            };
        }

        const isExpired =
            !user.emailVerificationExpiresAt ||
            new Date(user.emailVerificationExpiresAt).getTime() < Date.now();
        const incomingTokenHash = hashToken(data.token);

        if (
            !user.emailVerificationTokenHash ||
            user.emailVerificationTokenHash !== incomingTokenHash ||
            isExpired
        ) {
            throw new Error("Token inválido ou expirado");
        }

        await UserRepository.updateById(user.id, {
            emailVerified: true,
            emailVerificationTokenHash: null,
            emailVerificationExpiresAt: null,
            updatedAt: new Date().toISOString(),
        });

        return {
            id: user.id,
            email: user.email,
            emailVerified: true,
        };
    },

    async resendEmailVerification(data: z.infer<typeof ResendVerificationSchema>) {
        const user = await UserRepository.findByEmail(data.email);

        if (!user || user.emailVerified) {
            return { sent: true };
        }

        const verification = generateVerificationData();
        await UserRepository.updateById(user.id, {
            emailVerificationTokenHash: verification.tokenHash,
            emailVerificationExpiresAt: verification.expiresAt,
            updatedAt: new Date().toISOString(),
        });

        await EmailService.sendEmailVerification({
            to: user.email,
            name: user.name,
            verificationToken: verification.rawToken,
        });

        return { sent: true };
    },

    async logout(token: string) {
        const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
        const exp = decoded.exp;

        if (!exp) {
            throw new Error("Token inválido ou expirado.");
        }

        const expiresAtIso = new Date(exp * 1000).toISOString();
        await TokenBlacklistRepository.revokeToken(token, expiresAtIso);

        return { success: true };
    }
};