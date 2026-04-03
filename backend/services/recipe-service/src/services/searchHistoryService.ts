import { SearchHistoryRepository } from "../repositories/searchHistoryRepository";
import { SearchHistorySchema } from "../schemas/searchHistorySchema";
import { z } from "zod";

type SearchHistoryDocument = z.infer<typeof SearchHistorySchema>;

export const SearchHistoryService = {
    async addSearchHistory(userId: string, queryText: string, source: SearchHistoryDocument["source"] = "text") {
        return SearchHistoryRepository.create({
            userId,
            queryText,
            source,
        });
    },

    async listSearchHistory(userId: string, limit = 20) {
        return SearchHistoryRepository.listByUserId(userId, limit);
    },

    async clearSearchHistory(userId: string) {
        await SearchHistoryRepository.clearByUserId(userId);
        return { cleared: true };
    },
};
