import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { TokenBlacklistRepository } from "../repositories/tokenBlacklistRepository";

type AuthenticatedRequest = Request & {
    userId?: string;
};

export interface DecodedToken {
    userId: string;
}

const jwtSecret = process.env.JWT_SECRET as string;

function getJwtSecret(): string {
    if (!jwtSecret) {
        throw new Error("JWT_SECRET ausente.");
    }
    return jwtSecret;
}

export class AuthMiddleware {
    static authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
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
            const isRevoked = await TokenBlacklistRepository.isTokenRevoked(token);
            if (isRevoked) {
                return res.status(401).json({ message: "Token inválido ou expirado." });
            }

            const decoded = jwt.verify(token, getJwtSecret()) as DecodedToken;
            (req as AuthenticatedRequest).userId = decoded.userId;
            return next();
        } catch (err) {
            return res.status(401).json({ message: "Token inválido ou expirado." });
        }
    };
}