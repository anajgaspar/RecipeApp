import { Request, Response } from "express";
import { z } from "zod";
import { FollowService } from "../services/followService";

type AuthenticatedRequest = Request & {
    userId?: string;
};

const targetUserParamSchema = z.object({
    userId: z.string().min(1),
});

export const FollowController = {
    async toggle(req: Request, res: Response) {
        const followerUserId = (req as AuthenticatedRequest).userId;

        if (!followerUserId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        const validated = targetUserParamSchema.safeParse(req.params);
        if (!validated.success) {
            return res.status(400).json({
                error: "Parâmetro inválido",
                details: validated.error.issues,
            });
        }

        try {
            const result = await FollowService.toggleFollow(followerUserId, validated.data.userId);
            return res.status(200).json({
                message: result.isFollowing ? "Agora você segue este usuário." : "Você deixou de seguir este usuário.",
                ...result,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro desconhecido";

            if (message === "Usuário não encontrado") {
                return res.status(404).json({ error: message });
            }

            if (message === "Você não pode seguir a si mesmo.") {
                return res.status(400).json({ error: message });
            }

            return res.status(500).json({ error: message });
        }
    },

    async status(req: Request, res: Response) {
        const followerUserId = (req as AuthenticatedRequest).userId;

        if (!followerUserId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        const validated = targetUserParamSchema.safeParse(req.params);
        if (!validated.success) {
            return res.status(400).json({
                error: "Parâmetro inválido",
                details: validated.error.issues,
            });
        }

        try {
            const result = await FollowService.getFollowStatus(followerUserId, validated.data.userId);
            return res.status(200).json(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async summary(req: Request, res: Response) {
        const userId = (req as AuthenticatedRequest).userId;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        try {
            const summary = await FollowService.getSocialSummary(userId);
            return res.status(200).json(summary);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async followers(req: Request, res: Response) {
        const userId = (req as AuthenticatedRequest).userId;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        try {
            const items = await FollowService.listFollowers(userId);
            return res.status(200).json({ items });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async following(req: Request, res: Response) {
        const userId = (req as AuthenticatedRequest).userId;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        try {
            const items = await FollowService.listFollowing(userId);
            return res.status(200).json({ items });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },
};