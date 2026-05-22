import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/userRepository";
import { UpdateProfileSchema } from "../schemas/authSchema";
import { z } from "zod";
import { UserProfileRepository } from "../repositories/userProfileRepository";
import { UserProfileService } from "./userProfileService";

type AvatarInput = string | null | undefined;

function resolveAvatarDataUrl(input: AvatarInput): AvatarInput {
    if (input === undefined) {
        return undefined;
    }

    if (input === null || input.trim() === "") {
        return null;
    }

    if (!input.startsWith("data:")) {
        return input;
    }

    const match = input.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        throw new Error("Imagem inválida");
    }

    const contentType = match[1];
    const base64Content = match[2];
    const buffer = Buffer.from(base64Content, "base64");

    if (!contentType.startsWith("image/")) {
        throw new Error("Imagem inválida");
    }

    if (buffer.length > 850 * 1024) {
        throw new Error("Imagem muito grande");
    }

    return input;
}

function toPublicUser(user: {
    id: string;
    name: string;
    email: string;
    avatarDataUrl: string | null;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarDataUrl: user.avatarDataUrl,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

export const UserService = {
    async getUser(userId: string) {
        const user = await UserRepository.findById(userId)
        if (!user) {
            throw new Error('Usuário não encontrado')
        }

        await UserProfileService.ensureDefaultProfileForUser(userId).catch(() => null);
        const profiles = await UserProfileRepository.listByUserId(userId);

        return {
            user: toPublicUser(user),
            profiles,
        }
    },

    async listProfiles(userId: string) {
        await UserProfileService.ensureDefaultProfileForUser(userId).catch(() => null);
        return UserProfileRepository.listByUserId(userId);
    },

    async createProfile(userId: string, name?: string, avatarDataUrl?: string | null) {
        return UserProfileService.createProfile(userId, {
            name,
            avatarDataUrl,
        });
    },

    async updateFamilyProfile(userId: string, profileId: string, data: { name?: string; avatarDataUrl?: string | null }) {
        return UserProfileService.updateProfile(userId, profileId, data);
    },

    async deleteFamilyProfile(userId: string, profileId: string) {
        return UserProfileService.deleteProfile(userId, profileId);
    },

    async updateProfile(userId: string, data: z.infer<typeof UpdateProfileSchema>) {
        const user = await UserRepository.findById(userId);

        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        if (data.email && data.email !== user.email) {
            const existingUser = await UserRepository.findByEmail(data.email);
            if (existingUser && existingUser.id !== user.id) {
                throw new Error("Email já em uso");
            }
        }

        let passwordHash = user.passwordHash;
        const resolvedAvatarDataUrl = resolveAvatarDataUrl(data.avatarDataUrl);

        if (data.newPassword) {
            if (!data.currentPassword) {
                throw new Error("Senha atual obrigatória");
            }

            const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
            if (!isCurrentPasswordValid) {
                throw new Error("Senha atual inválida");
            }

            passwordHash = await bcrypt.hash(data.newPassword, 10);
        }

        await UserRepository.updateById(user.id, {
            name: data.name?.trim() || user.name,
            email: data.email?.trim().toLowerCase() || user.email,
            avatarDataUrl: resolvedAvatarDataUrl === undefined ? user.avatarDataUrl : resolvedAvatarDataUrl,
            passwordHash,
            updatedAt: new Date().toISOString(),
        });

        const updatedUser = await UserRepository.findById(user.id);
        if (!updatedUser) {
            throw new Error("Usuário não encontrado");
        }

        return {
            user: toPublicUser(updatedUser),
        };
    },

    async getPublicUserById(userId: string) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        return {
            user: {
                id: user.id,
                name: user.name,
                avatarDataUrl: user.avatarDataUrl,
            },
        };
    }
}