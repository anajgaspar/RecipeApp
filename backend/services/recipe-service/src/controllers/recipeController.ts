import { Request, Response } from "express";
import { z } from "zod";
import { CreateRecipeSchema, RecipeDifficultyOptions } from "../schemas/recipeSchema";
import { RecipeService } from "../services/recipeService";
import { getProfileIdFromRequest, getUserIdFromRequest } from "../utils/requestContext";

const listQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
});

const searchQuerySchema = z.object({
    q: z.string().trim().optional(),
    category: z.string().trim().optional(),
    difficulty: z.enum(RecipeDifficultyOptions).optional(),
    servingsMin: z.coerce.number().int().nonnegative().optional(),
    servingsMax: z.coerce.number().int().nonnegative().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
});

const recipeIdParamSchema = z.object({
    recipeId: z.string().min(1),
});

export const RecipeController = {
    async createRecipe(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const validated = CreateRecipeSchema.safeParse(req.body);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: validated.error.issues,
                });
            }

            const recipe = await RecipeService.createRecipe(userId, validated.data);
            return res.status(201).json({
                message: "Receita criada com sucesso.",
                recipe,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async getRecipeById(req: Request, res: Response) {
        try {
            const validated = recipeIdParamSchema.safeParse(req.params);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Parâmetro inválido",
                    details: validated.error.issues,
                });
            }

            const recipe = await RecipeService.getRecipeById(validated.data.recipeId);
            return res.status(200).json({ recipe });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            if (message === "Receita não encontrada") {
                return res.status(404).json({ error: message });
            }

            return res.status(500).json({ error: message });
        }
    },

    async updateRecipe(req: Request, res: Response) {
        try {
            const validatedParams = recipeIdParamSchema.safeParse(req.params);
            if (!validatedParams.success) {
                return res.status(400).json({
                    error: "Parâmetro inválido",
                    details: validatedParams.error.issues,
                });
            }

            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const validatedBody = CreateRecipeSchema.safeParse(req.body);
            if (!validatedBody.success) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: validatedBody.error.issues,
                });
            }

            const recipe = await RecipeService.updateRecipe(userId, validatedParams.data.recipeId, validatedBody.data);
            return res.status(200).json({
                message: "Receita atualizada com sucesso.",
                recipe,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";

            if (message === "Receita não encontrada") {
                return res.status(404).json({ error: message });
            }

            if (message.includes("não tem permissão")) {
                return res.status(403).json({ error: message });
            }

            return res.status(500).json({ error: message });
        }
    },

    async deleteRecipe(req: Request, res: Response) {
        try {
            const validatedParams = recipeIdParamSchema.safeParse(req.params);
            if (!validatedParams.success) {
                return res.status(400).json({
                    error: "Parâmetro inválido",
                    details: validatedParams.error.issues,
                });
            }

            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            await RecipeService.deleteRecipe(userId, validatedParams.data.recipeId);
            return res.status(200).json({ message: "Receita excluída com sucesso." });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";

            if (message === "Receita não encontrada") {
                return res.status(404).json({ error: message });
            }

            if (message.includes("não tem permissão")) {
                return res.status(403).json({ error: message });
            }

            return res.status(500).json({ error: message });
        }
    },

    async getMyRecipes(req: Request, res: Response) {
        try {
            const validated = listQuerySchema.safeParse(req.query);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Query inválida",
                    details: validated.error.issues,
                });
            }

            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const recipes = await RecipeService.getMyRecipes(userId, validated.data.limit ?? 50);
            return res.status(200).json({ recipes });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async getSuggestedFeed(req: Request, res: Response) {
        try {
            const validated = listQuerySchema.safeParse(req.query);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Query inválida",
                    details: validated.error.issues,
                });
            }

            const userId = getUserIdFromRequest(req) ?? undefined;
            const profileId = getProfileIdFromRequest(req) ?? undefined;
            const recipes = await RecipeService.getSuggestedFeed(userId, profileId, validated.data.limit ?? 20);
            return res.status(200).json({ recipes });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async searchRecipes(req: Request, res: Response) {
        try {
            const validated = searchQuerySchema.safeParse(req.query);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Query inválida",
                    details: validated.error.issues,
                });
            }

            const recipes = await RecipeService.searchRecipes({
                query: validated.data.q,
                category: validated.data.category,
                difficulty: validated.data.difficulty,
                servingsMin: validated.data.servingsMin,
                servingsMax: validated.data.servingsMax,
                limit: validated.data.limit,
            });

            return res.status(200).json({ recipes });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },
};
