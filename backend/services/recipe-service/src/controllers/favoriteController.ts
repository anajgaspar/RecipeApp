import { Request, Response } from "express";
import { z } from "zod";
import { FavoriteService } from "../services/favoriteService";
import { getUserIdFromRequest } from "../utils/requestContext";

const recipeIdParamSchema = z.object({
    recipeId: z.string().min(1),
});

export const FavoriteController = {
    async toggleFavorite(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const validated = recipeIdParamSchema.safeParse(req.params);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Parâmetro inválido",
                    details: validated.error.issues,
                });
            }

            const result = await FavoriteService.toggleFavorite(userId, validated.data.recipeId);
            return res.status(200).json({
                message: result.favorited ? "Receita favoritada." : "Receita removida dos favoritos.",
                ...result,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async listFavorites(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const favorites = await FavoriteService.listFavoriteRecipes(userId);
            return res.status(200).json({ favorites });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },
};
