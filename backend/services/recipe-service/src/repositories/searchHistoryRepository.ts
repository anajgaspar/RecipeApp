import { db } from "../config/firebase";
import { SearchHistorySchema } from "../schemas/searchHistorySchema";
import { z } from "zod";
import crypto from "crypto";

type SearchHistoryDocument = z.infer<typeof SearchHistorySchema>;
type CreateSearchHistoryParams = {
    userId: string;
    queryText: string;
    source: SearchHistoryDocument["source"];
};

const searchHistoryCollection = "search_history";

export const SearchHistoryRepository = {
    async listByUserId(userId: string, limit = 20): Promise<SearchHistoryDocument[]> {
        const documents = await db
            .collection(searchHistoryCollection)
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();

        return documents.docs
            .map((doc) => SearchHistorySchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data);
    },

    async create(params: CreateSearchHistoryParams): Promise<SearchHistoryDocument> {
        const document: SearchHistoryDocument = {
            id: crypto.randomUUID(),
            userId: params.userId,
            queryText: params.queryText,
            source: params.source,
            createdAt: new Date().toISOString(),
        };

        await db.collection(searchHistoryCollection).doc(document.id).set(document);
        return document;
    },

    async deleteById(id: string): Promise<void> {
        await db.collection(searchHistoryCollection).doc(id).delete();
    },

    async clearByUserId(userId: string): Promise<void> {
        const documents = await db.collection(searchHistoryCollection).where("userId", "==", userId).get();

        if (documents.empty) {
            return;
        }

        const batch = db.batch();
        documents.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
    },
};
