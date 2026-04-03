import { Request } from "express";

export function getUserIdFromRequest(req: Request): string | null {
    const authenticatedRequest = req as Request & { userId?: string };
    if (authenticatedRequest.userId) {
        return authenticatedRequest.userId;
    }

    if (typeof req.header !== "function") {
        return null;
    }

    const headerValue = req.header("x-user-id");
    if (!headerValue) {
        return null;
    }

    return headerValue.trim() || null;
}
