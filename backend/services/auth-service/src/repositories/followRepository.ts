import crypto from "crypto";
import { db } from "../config/firebase";
import { UserFollowSchema } from "../schemas/followSchema";
import { z } from "zod";

type FollowDocument = z.infer<typeof UserFollowSchema>;

const followsCollection = "user_follows";

function parseFollowDocument(data: unknown): FollowDocument | null {
    const parsedFollow = UserFollowSchema.safeParse(data);
    return parsedFollow.success ? parsedFollow.data : null;
}

export const FollowRepository = {
    async findByUsers(followerUserId: string, followingUserId: string): Promise<FollowDocument | null> {
        const documents = await db
            .collection(followsCollection)
            .where("followerUserId", "==", followerUserId)
            .where("followingUserId", "==", followingUserId)
            .limit(1)
            .get();

        if (documents.empty) {
            return null;
        }

        return parseFollowDocument(documents.docs[0].data());
    },

    async create(followerUserId: string, followingUserId: string): Promise<FollowDocument> {
        const document: FollowDocument = {
            id: crypto.randomUUID(),
            followerUserId,
            followingUserId,
            createdAt: new Date().toISOString(),
        };

        await db.collection(followsCollection).doc(document.id).set(document);
        return document;
    },

    async deleteByUsers(followerUserId: string, followingUserId: string): Promise<void> {
        const documents = await db
            .collection(followsCollection)
            .where("followerUserId", "==", followerUserId)
            .where("followingUserId", "==", followingUserId)
            .get();

        if (documents.empty) {
            return;
        }

        const batch = db.batch();
        documents.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
    },

    async listFollowers(userId: string): Promise<FollowDocument[]> {
        const documents = await db.collection(followsCollection).where("followingUserId", "==", userId).get();
        return documents.docs.map((doc) => parseFollowDocument(doc.data())).filter((item): item is FollowDocument => Boolean(item));
    },

    async listFollowing(userId: string): Promise<FollowDocument[]> {
        const documents = await db.collection(followsCollection).where("followerUserId", "==", userId).get();
        return documents.docs.map((doc) => parseFollowDocument(doc.data())).filter((item): item is FollowDocument => Boolean(item));
    },
};