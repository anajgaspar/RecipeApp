import { Request, Response } from "express";
import { z } from "zod";
import { RecipeCompletionService } from "../services/recipeCompletionService";
import { getProfileIdFromRequest, getUserIdFromRequest } from "../utils/requestContext";

const recipeIdParamSchema = z.object({
    recipeId: z.string().min(1),
});

export const RecipeCompletionController = {
    async getStatus(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const profileId = getProfileIdFromRequest(req) ?? userId;
            const validated = recipeIdParamSchema.safeParse(req.params);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Parâmetro inválido",
                    details: validated.error.issues,
                });
            }

            const result = await RecipeCompletionService.getCompletionStatus(profileId, validated.data.recipeId);
            return res.status(200).json(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async markCompleted(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const profileId = getProfileIdFromRequest(req) ?? userId;
            const validated = recipeIdParamSchema.safeParse(req.params);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Parâmetro inválido",
                    details: validated.error.issues,
                });
            }

            const result = await RecipeCompletionService.markCompleted(userId, profileId, validated.data.recipeId);
            return res.status(200).json({
                message: result.alreadyCompleted ? "Receita já registrada como concluída." : "Receita marcada como concluída.",
                ...result,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async listCompleted(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const profileId = getProfileIdFromRequest(req) ?? userId;
            const result = await RecipeCompletionService.listCompletedRecipes(profileId);
            return res.status(200).json(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },
};