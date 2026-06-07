import { db } from "../config/firebase";

type FollowDocument = {
    id: string;
    followerUserId: string;
    followingUserId: string;
    createdAt: string;
};

const FOLLOWS_COLLECTION = "user_follows";

function parseFollow(data: unknown): FollowDocument | null {
    if (
        typeof data !== "object" ||
        data === null ||
        typeof (data as any).id !== "string" ||
        typeof (data as any).followerUserId !== "string" ||
        typeof (data as any).followingUserId !== "string" ||
        typeof (data as any).createdAt !== "string"
    ) {
        return null;
    }
    return data as FollowDocument;
}

export const FollowRepository = {
    async listFollowing(userId: string): Promise<FollowDocument[]> {
        const snap = await db
            .collection(FOLLOWS_COLLECTION)
            .where("followerUserId", "==", userId)
            .get();

        return snap.docs
            .map((doc) => parseFollow(doc.data()))
            .filter((item): item is FollowDocument => item !== null);
    },

    async listFollowers(userId: string): Promise<FollowDocument[]> {
        const snap = await db
            .collection(FOLLOWS_COLLECTION)
            .where("followingUserId", "==", userId)
            .get();

        return snap.docs
            .map((doc) => parseFollow(doc.data()))
            .filter((item): item is FollowDocument => item !== null);
    },
};