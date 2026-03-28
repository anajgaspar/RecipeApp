import { Request, Response } from "express";
import { UserService } from "../services/userService";

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
    }
};