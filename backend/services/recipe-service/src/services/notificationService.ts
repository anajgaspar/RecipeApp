import { getMessaging, MulticastMessage } from "firebase-admin/messaging";
import { db } from "../../../recipe-service/src/config/firebase";

const FCM_COLLECTION = "fcm_tokens";

export const NotificationService = {
    async saveToken(userId: string, token: string): Promise<void> {
        const ref = db.collection(FCM_COLLECTION).doc(userId);
        const snap = await ref.get();

        if (!snap.exists) {
            await ref.set({ tokens: [token] });
            return;
        }

        const existing: string[] = snap.data()?.tokens ?? [];
        if (!existing.includes(token)) {
            await ref.update({ tokens: [...existing, token] });
        }
    },

    async removeToken(userId: string, token: string): Promise<void> {
        const ref = db.collection(FCM_COLLECTION).doc(userId);
        const snap = await ref.get();
        if (!snap.exists) return;

        const existing: string[] = snap.data()?.tokens ?? [];
        await ref.update({ tokens: existing.filter((t) => t !== token) });
    },

    async getTokensForUsers(userIds: string[]): Promise<string[]> {
        if (userIds.length === 0) return [];

        const chunks: string[][] = [];
        for (let i = 0; i < userIds.length; i += 30) {
            chunks.push(userIds.slice(i, i + 30));
        }

        const tokens: string[] = [];
        for (const chunk of chunks) {
            const snaps = await db
                .collection(FCM_COLLECTION)
                .where("__name__", "in", chunk)
                .get();
            snaps.forEach((doc) => {
                const docTokens: string[] = doc.data()?.tokens ?? [];
                tokens.push(...docTokens);
            });
        }

        return [...new Set(tokens)];
    },

    async sendMulticast(
        tokens: string[],
        payload: { title: string; body: string; data?: Record<string, string> }
    ): Promise<void> {
        if (tokens.length === 0) return;

        const BATCH = 500;
        for (let i = 0; i < tokens.length; i += BATCH) {
            const batch = tokens.slice(i, i + BATCH);

            const message: MulticastMessage = {
                tokens: batch,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data ?? {},
                android: {
                    priority: "high",
                    notification: { sound: "default" },
                },
                apns: {
                    payload: { aps: { sound: "default" } },
                },
            };

            const response = await getMessaging().sendEachForMulticast(message);

            const invalidTokens: string[] = [];
            response.responses.forEach((res, idx) => {
                if (
                    !res.success &&
                    (res.error?.code === "messaging/registration-token-not-registered" ||
                        res.error?.code === "messaging/invalid-registration-token")
                ) {
                    invalidTokens.push(batch[idx]);
                }
            });

            if (invalidTokens.length > 0) {
                await this._purgeInvalidTokens(invalidTokens);
            }
        }
    },

    async _purgeInvalidTokens(invalidTokens: string[]): Promise<void> {
        const invalidSet = new Set(invalidTokens);
        const allDocs = await db.collection(FCM_COLLECTION).get();
        const writes = db.batch();
        let dirty = false;

        allDocs.forEach((doc) => {
            const tokens: string[] = doc.data()?.tokens ?? [];
            const cleaned = tokens.filter((t) => !invalidSet.has(t));
            if (cleaned.length !== tokens.length) {
                writes.update(doc.ref, { tokens: cleaned });
                dirty = true;
            }
        });

        if (dirty) await writes.commit();
    },

    async notifyFollowersNewRecipe(params: {
        followerUserIds: string[];
        authorName: string;
        recipeTitle: string;
        recipeId: string;
    }): Promise<void> {
        const { followerUserIds, authorName, recipeTitle, recipeId } = params;
        const tokens = await this.getTokensForUsers(followerUserIds);

        await this.sendMulticast(tokens, {
            title: `${authorName} publicou uma nova receita 🍽️`,
            body: recipeTitle,
            data: {
                type: "new_recipe",
                recipeId,
            },
        });
    },
};