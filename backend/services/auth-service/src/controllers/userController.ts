import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { UpdateProfileSchema } from "../schemas/authSchema";

type AuthenticatedRequest = Request & {
    userId?: string;
};

export const UserController = {
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