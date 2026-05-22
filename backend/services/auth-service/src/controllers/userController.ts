import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { UpdateProfileSchema } from "../schemas/authSchema";
import { z } from "zod";
import { CreateUserProfileSchema, UpdateUserProfileSchema } from "../schemas/userProfileSchema";

type AuthenticatedRequest = Request & {
    userId?: string;
};

const publicUserParamSchema = z.object({
    userId: z.string().min(1),
});

const profileParamSchema = z.object({
    profileId: z.string().min(1),
});

export const UserController = {
    async getPublicProfile(req: Request, res: Response) {
        try {
            const validated = publicUserParamSchema.safeParse(req.params);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Parâmetro inválido",
                    details: validated.error.issues,
                });
            }

            const user = await UserService.getPublicUserById(validated.data.userId);
            return res.status(200).json(user);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro desconhecido";
            if (message === "Usuário não encontrado") {
                return res.status(404).json({ error: message });
            }

            return res.status(500).json({ error: message });
        }
    },

    async getProfile(req: Request, res: Response) {
        const userId = (req as AuthenticatedRequest).userId;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        try {
            const user = await UserService.getUser(userId);

            return res.status(200).json(user);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro desconhecido";

            if (message === "Usuário não encontrado") {
                return res.status(404).json({ error: message });
            }

            return res.status(500).json({ error: message });
        }
    },

    async listProfiles(req: Request, res: Response) {
        const userId = (req as AuthenticatedRequest).userId;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        try {
            const profiles = await UserService.listProfiles(userId);
            return res.status(200).json({ profiles });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async createProfile(req: Request, res: Response) {
        const userId = (req as AuthenticatedRequest).userId;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        try {
            const validated = CreateUserProfileSchema.safeParse(req.body);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: validated.error.issues,
                });
            }

            const profile = await UserService.createProfile(userId, validated.data.name, validated.data.avatarDataUrl ?? null);
            const profiles = await UserService.listProfiles(userId);

            return res.status(201).json({
                message: "Perfil criado com sucesso.",
                profile,
                profiles,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async updateFamilyProfile(req: Request, res: Response) {
        const userId = (req as AuthenticatedRequest).userId;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        try {
            const validatedParams = profileParamSchema.safeParse(req.params);
            if (!validatedParams.success) {
                return res.status(400).json({
                    error: "Parâmetro inválido",
                    details: validatedParams.error.issues,
                });
            }

            const validated = UpdateUserProfileSchema.safeParse(req.body);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: validated.error.issues,
                });
            }

            const profile = await UserService.updateFamilyProfile(userId, validatedParams.data.profileId, validated.data);
            const profiles = await UserService.listProfiles(userId);

            return res.status(200).json({
                message: "Perfil atualizado com sucesso.",
                profile,
                profiles,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro desconhecido";

            if (message === "Perfil não encontrado") {
                return res.status(404).json({ error: message });
            }

            if (message === "Perfil padrão não pode ser editado por aqui") {
                return res.status(400).json({ error: message });
            }

            return res.status(500).json({ error: message });
        }
    },

    async deleteFamilyProfile(req: Request, res: Response) {
        const userId = (req as AuthenticatedRequest).userId;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        try {
            const validatedParams = profileParamSchema.safeParse(req.params);
            if (!validatedParams.success) {
                return res.status(400).json({
                    error: "Parâmetro inválido",
                    details: validatedParams.error.issues,
                });
            }

            const deletedProfile = await UserService.deleteFamilyProfile(userId, validatedParams.data.profileId);
            const profiles = await UserService.listProfiles(userId);

            return res.status(200).json({
                message: "Perfil excluído com sucesso.",
                deletedProfileId: deletedProfile.id,
                profiles,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro desconhecido";

            if (message === "Perfil não encontrado") {
                return res.status(404).json({ error: message });
            }

            if (message === "Perfil padrão não pode ser excluído") {
                return res.status(400).json({ error: message });
            }

            return res.status(500).json({ error: message });
        }
    },

    async updateProfile(req: Request, res: Response) {
        const userId = (req as AuthenticatedRequest).userId;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        try {
            const validated = UpdateProfileSchema.safeParse(req.body);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: validated.error.issues,
                });
            }

            const result = await UserService.updateProfile(userId, validated.data);
            return res.status(200).json({
                message: "Perfil atualizado com sucesso",
                user: result.user,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro desconhecido";

            if (message === "Usuário não encontrado") {
                return res.status(404).json({ error: message });
            }

            if (message === "Email já em uso") {
                return res.status(409).json({ error: message });
            }

            if (message === "Senha atual inválida") {
                return res.status(400).json({ error: message });
            }

            if (message === "Imagem inválida" || message === "Imagem muito grande") {
                return res.status(400).json({ error: message });
            }

            return res.status(500).json({ error: message });
        }
    }
};