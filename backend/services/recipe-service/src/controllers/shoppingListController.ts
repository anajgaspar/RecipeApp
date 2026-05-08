import { Request, Response } from "express";
import { z } from "zod";
import { ShoppingListService } from "../services/shoppingListService";
import { getUserIdFromRequest } from "../utils/requestContext";

const createSchema = z.object({
    name: z.string().min(1).max(180),
    quantity: z.string().optional(),
    checked: z.boolean().optional(),
});

const updateSchema = z.object({
    name: z.string().min(1).max(180).optional(),
    quantity: z.string().optional(),
    checked: z.boolean().optional(),
});

export const ShoppingListController = {
    async addItem(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

            const validated = createSchema.safeParse(req.body);
            if (!validated.success) return res.status(400).json({ error: "Dados inválidos", details: validated.error.issues });

            const item = await ShoppingListService.addItem(userId, validated.data);
            return res.status(201).json({ message: "Item adicionado.", item });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async list(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

            const items = await ShoppingListService.listItems(userId);
            return res.status(200).json({ items });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

            const validated = updateSchema.safeParse(req.body);
            if (!validated.success) return res.status(400).json({ error: "Dados inválidos", details: validated.error.issues });

            const itemId = String(req.params.itemId);
            const item = await ShoppingListService.updateItem(itemId, validated.data as any);

            if (!item) return res.status(404).json({ error: "Item não encontrado." });
            return res.status(200).json({ item });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async remove(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

            const itemId = String(req.params.itemId);
            await ShoppingListService.removeItem(itemId);
            return res.status(200).json({ message: "Item removido." });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async clear(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

            await ShoppingListService.clearList(userId);
            return res.status(200).json({ message: "Lista de compras limpa." });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },
};
