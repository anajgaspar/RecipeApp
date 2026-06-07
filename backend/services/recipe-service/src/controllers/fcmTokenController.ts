import { Request, Response } from "express";
import { z } from "zod";
import { NotificationService } from "../services/notificationService";
import { getUserIdFromRequest } from "../utils/requestContext";

const tokenBodySchema = z.object({
    token: z.string().min(1, "Token FCM é obrigatório"),
});

export const FcmTokenController = {
    async saveToken(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const validated = tokenBodySchema.safeParse(req.body);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: validated.error.issues,
                });
            }

            await NotificationService.saveToken(userId, validated.data.token);
            return res.status(200).json({ message: "Token FCM registrado com sucesso." });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async removeToken(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const validated = tokenBodySchema.safeParse(req.body);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: validated.error.issues,
                });
            }

            await NotificationService.removeToken(userId, validated.data.token);
            return res.status(200).json({ message: "Token FCM removido com sucesso." });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },
};