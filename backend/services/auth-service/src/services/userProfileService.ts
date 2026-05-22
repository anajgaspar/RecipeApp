import { UserRepository } from "../repositories/userRepository";
import { UserProfileRepository } from "../repositories/userProfileRepository";
import { CreateUserProfileSchema, UpdateUserProfileSchema } from "../schemas/userProfileSchema";
import { z } from "zod";

function buildFallbackProfileName(userName: string, profileCount: number): string {
    if (profileCount <= 0) {
        return userName;
    }

    return `Perfil ${profileCount + 1}`;
}

export const UserProfileService = {
    async ensureDefaultProfileForUser(userId: string) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        return UserProfileRepository.ensureDefaultProfile({
            id: user.id,
            name: user.name,
            avatarDataUrl: user.avatarDataUrl,
        });
    },

    async listProfiles(userId: string) {
        await this.ensureDefaultProfileForUser(userId).catch(() => null);
        return UserProfileRepository.listByUserId(userId);
    },

    async createProfile(userId: string, data: z.infer<typeof CreateUserProfileSchema>) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const profiles = await UserProfileRepository.listByUserId(userId);
        return UserProfileRepository.create({
            userId,
            name: data.name?.trim() || buildFallbackProfileName(user.name, profiles.length),
            avatarDataUrl: data.avatarDataUrl ?? null,
        });
    },

    async updateProfile(userId: string, profileId: string, data: z.infer<typeof UpdateUserProfileSchema>) {
        const profile = await UserProfileRepository.findById(profileId);

        if (!profile || profile.userId !== userId) {
            throw new Error("Perfil não encontrado");
        }

        if (profile.isDefault) {
            throw new Error("Perfil padrão não pode ser editado por aqui");
        }

        const updatedProfile = await UserProfileRepository.update(profileId, {
            name: data.name,
            avatarDataUrl: data.avatarDataUrl,
        });

        if (!updatedProfile) {
            throw new Error("Perfil não encontrado");
        }

        return updatedProfile;
    },

    async deleteProfile(userId: string, profileId: string) {
        const profile = await UserProfileRepository.findById(profileId);

        if (!profile || profile.userId !== userId) {
            throw new Error("Perfil não encontrado");
        }

        if (profile.isDefault) {
            throw new Error("Perfil padrão não pode ser excluído");
        }

        await UserProfileRepository.deleteById(profileId);
        return profile;
    },
};