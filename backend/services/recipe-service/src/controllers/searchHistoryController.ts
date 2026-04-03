import { Request, Response } from "express";
import { z } from "zod";
import { SearchHistoryService } from "../services/searchHistoryService";
import { getUserIdFromRequest } from "../utils/requestContext";

const createSearchHistorySchema = z.object({
    queryText: z.string().trim().min(1).max(120),
    source: z.enum(["text", "voice"]).optional().default("text"),
});

const listSearchHistoryQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
});

export const SearchHistoryController = {
    async create(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const validated = createSearchHistorySchema.safeParse(req.body);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: validated.error.issues,
                });
            }

            const history = await SearchHistoryService.addSearchHistory(
                userId,
                validated.data.queryText,
                validated.data.source
            );

            return res.status(201).json({
                message: "Busca registrada com sucesso.",
                history,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async list(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const validated = listSearchHistoryQuerySchema.safeParse(req.query);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Query inválida",
                    details: validated.error.issues,
                });
            }

            const histories = await SearchHistoryService.listSearchHistory(userId, validated.data.limit ?? 20);
            return res.status(200).json({ histories });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async clear(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            await SearchHistoryService.clearSearchHistory(userId);
            return res.status(200).json({ message: "Histórico limpo com sucesso." });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },
};
