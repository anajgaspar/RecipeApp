import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../src/services/pantryService", () => ({
    PantryService: {
        addItem: jest.fn(),
        listItems: jest.fn(),
        updateItem: jest.fn(),
        removeItem: jest.fn(),
        clearPantry: jest.fn(),
    },
}));

import { PantryController } from "../../src/controllers/pantryController";
import { PantryService } from "../../src/services/pantryService";

const mockPantryService = PantryService as jest.Mocked<typeof PantryService>;

function createResponse() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("Controlador de despensa", () => {
    beforeEach(() => { jest.clearAllMocks(); });

    it("deve adicionar item com sucesso", async () => {
        mockPantryService.addItem.mockResolvedValueOnce({ id: "p1", userId: "user-1", name: "Arroz", createdAt: "2026-04-03T00:00:00.000Z" } as any);

        const req: any = { userId: "user-1", body: { name: "Arroz" }, params: {}, query: {} };
        const res = createResponse();

        await PantryController.addItem(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(mockPantryService.addItem).toHaveBeenCalledWith("user-1", { name: "Arroz" });
    });

    it("deve listar itens", async () => {
        mockPantryService.listItems.mockResolvedValueOnce([]);
        const req: any = { userId: "user-1", body: {}, params: {}, query: {} };
        const res = createResponse();

        await PantryController.list(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ items: [] });
    });
});
