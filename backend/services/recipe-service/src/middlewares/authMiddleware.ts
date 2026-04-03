import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type AuthenticatedRequest = Request & {
    userId?: string;
};

const jwtSecret = process.env.JWT_SECRET as string;

function getJwtSecret(): string {
    if (!jwtSecret) {
        throw new Error("JWT_SECRET ausente.");
    }

    return jwtSecret;
}

export const AuthMiddleware = {
    authenticateUser: (req: Request, res: Response, next: NextFunction) => {
        if (!jwtSecret) {
            return res.status(500).json({ message: "Configuração JWT inválida no servidor." });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token não fornecido." });
        }

        const [scheme, token] = authHeader.split(" ");
        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({ message: "Formato de token inválido." });
        }

        try {
            const decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
            (req as AuthenticatedRequest).userId = decoded.userId;
            return next();
        } catch (_error) {
            return res.status(401).json({ message: "Token inválido ou expirado." });
        }
    },
};