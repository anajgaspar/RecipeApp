import { Request, Response } from "express";
import { z } from "zod";
import { UserPreferencesService } from "../services/userPreferencesService";
import { getUserIdFromRequest } from "../utils/requestContext";

const upsertPreferencesSchema = z.object({
    preferredCategories: z.array(z.string().trim().min(1)).default([]),
    preferredTags: z.array(z.string().trim().min(1)).default([]),
});

export const UserPreferencesController = {
    async getByUser(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const preferences = await UserPreferencesService.getPreferences(userId);
            return res.status(200).json({ preferences });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async upsert(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const validated = upsertPreferencesSchema.safeParse(req.body);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: validated.error.issues,
                });
            }

            const preferences = await UserPreferencesService.upsertPreferences(
                userId,
                validated.data.preferredCategories,
                validated.data.preferredTags
            );

            return res.status(200).json({
                message: "Preferências atualizadas com sucesso.",
                preferences,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },
};
