import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../src/repositories/searchHistoryRepository", () => ({
    SearchHistoryRepository: {
        listByUserId: jest.fn(),
        create: jest.fn(),
        deleteById: jest.fn(),
        clearByUserId: jest.fn(),
    },
}));

import { SearchHistoryService } from "../../src/services/searchHistoryService";
import { SearchHistoryRepository } from "../../src/repositories/searchHistoryRepository";

const mockSearchHistoryRepository = SearchHistoryRepository as jest.Mocked<typeof SearchHistoryRepository>;

describe("Serviço de histórico de busca", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve registrar uma busca", async () => {
        mockSearchHistoryRepository.create.mockResolvedValueOnce({
            id: "history-1",
            userId: "user-1",
            queryText: "bolo de chocolate",
            source: "text",
            createdAt: "2026-04-03T00:00:00.000Z",
        });

        const result = await SearchHistoryService.addSearchHistory("user-1", "bolo de chocolate");

        expect(mockSearchHistoryRepository.create).toHaveBeenCalledWith({
            userId: "user-1",
            queryText: "bolo de chocolate",
            source: "text",
        });
        expect(result.id).toBe("history-1");
    });

    it("deve listar o histórico por usuário", async () => {
        mockSearchHistoryRepository.listByUserId.mockResolvedValueOnce([
            {
                id: "history-1",
                userId: "user-1",
                queryText: "bolo",
                source: "text",
                createdAt: "2026-04-03T00:00:00.000Z",
            },
        ]);

        const result = await SearchHistoryService.listSearchHistory("user-1", 10);

        expect(mockSearchHistoryRepository.listByUserId).toHaveBeenCalledWith("user-1", 10);
        expect(result).toHaveLength(1);
    });

    it("deve limpar o histórico do usuário", async () => {
        await SearchHistoryService.clearSearchHistory("user-1");

        expect(mockSearchHistoryRepository.clearByUserId).toHaveBeenCalledWith("user-1");
    });
});
