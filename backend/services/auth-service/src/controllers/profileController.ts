import { Request, Response } from "express";
import { CreateUserProfileSchema } from "../schemas/userProfileSchema";
import { UserProfileService } from "../services/userProfileService";

type AuthenticatedRequest = Request & {
    userId?: string;
};

export const ProfileController = {
    async list(req: Request, res: Response) {
        const userId = (req as AuthenticatedRequest).userId;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        try {
            const profiles = await UserProfileService.listProfiles(userId);
            return res.status(200).json({ profiles });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async create(req: Request, res: Response) {
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

            const profile = await UserProfileService.createProfile(userId, validated.data);
            const profiles = await UserProfileService.listProfiles(userId);

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
};