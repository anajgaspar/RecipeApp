import crypto from "crypto";
import { db } from "../config/firebase";

const revokedTokensCollection = "revoked_tokens";

function hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export const TokenBlacklistRepository = {
    async revokeToken(token: string, expiresAtIso: string): Promise<void> {
        const tokenHash = hashToken(token);

        await db.collection(revokedTokensCollection).doc(tokenHash).set({
            tokenHash,
            revokedAt: new Date().toISOString(),
            expiresAt: expiresAtIso,
        });
    },

    async isTokenRevoked(token: string): Promise<boolean> {
        const tokenHash = hashToken(token);
        const snapshot = await db.collection(revokedTokensCollection).doc(tokenHash).get();

        if (!snapshot.exists) {
            return false;
        }

        const data = snapshot.data() as { expiresAt?: string } | undefined;
        if (!data?.expiresAt) {
            return true;
        }

        const isExpired = new Date(data.expiresAt).getTime() <= Date.now();
        if (isExpired) {
            await snapshot.ref.delete();
            return false;
        }

        return true;
    },
};