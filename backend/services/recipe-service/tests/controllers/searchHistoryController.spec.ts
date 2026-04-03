jest.mock("../../src/services/searchHistoryService", () => ({
    SearchHistoryService: {
        addSearchHistory: jest.fn(),
        listSearchHistory: jest.fn(),
        clearSearchHistory: jest.fn(),
    },
}));

import { SearchHistoryController } from "../../src/controllers/searchHistoryController";
import { SearchHistoryService } from "../../src/services/searchHistoryService";

const mockSearchHistoryService = SearchHistoryService as jest.Mocked<typeof SearchHistoryService>;

function createResponse() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("Controlador de histórico de busca", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve registrar uma busca com sucesso", async () => {
        mockSearchHistoryService.addSearchHistory.mockResolvedValueOnce({
            id: "history-1",
            userId: "user-1",
            queryText: "bolo",
            source: "text",
            createdAt: "2026-04-03T00:00:00.000Z",
        });

        const req: any = { userId: "user-1", body: { queryText: "bolo", source: "text" }, params: {}, query: {} };
        const res = createResponse();

        await SearchHistoryController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(mockSearchHistoryService.addSearchHistory).toHaveBeenCalledWith("user-1", "bolo", "text");
    });

    it("deve listar o histórico do usuário", async () => {
        mockSearchHistoryService.listSearchHistory.mockResolvedValueOnce([]);
        const req: any = { userId: "user-1", query: {}, body: {}, params: {} };
        const res = createResponse();

        await SearchHistoryController.list(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ histories: [] });
    });

    it("deve limpar o histórico do usuário", async () => {
        const req: any = { userId: "user-1", query: {}, body: {}, params: {} };
        const res = createResponse();

        await SearchHistoryController.clear(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockSearchHistoryService.clearSearchHistory).toHaveBeenCalledWith("user-1");
    });
});
