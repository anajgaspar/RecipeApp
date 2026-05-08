import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../src/services/shoppingListService", () => ({
    ShoppingListService: {
        addItem: jest.fn(),
        listItems: jest.fn(),
        updateItem: jest.fn(),
        removeItem: jest.fn(),
        clearList: jest.fn(),
    },
}));

import { ShoppingListController } from "../../src/controllers/shoppingListController";
import { ShoppingListService } from "../../src/services/shoppingListService";

const mockService = ShoppingListService as jest.Mocked<typeof ShoppingListService>;

function createResponse() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("Controlador de lista de compras", () => {
    beforeEach(() => { jest.clearAllMocks(); });

    it("deve adicionar item", async () => {
        mockService.addItem.mockResolvedValueOnce({ id: "s1", userId: "user-1", name: "Leite", createdAt: "2026-04-03T00:00:00.000Z" } as any);

        const req: any = { userId: "user-1", body: { name: "Leite" }, params: {}, query: {} };
        const res = createResponse();

        await ShoppingListController.addItem(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(mockService.addItem).toHaveBeenCalledWith("user-1", { name: "Leite" });
    });

    it("deve listar itens", async () => {
        mockService.listItems.mockResolvedValueOnce([]);
        const req: any = { userId: "user-1", body: {}, params: {}, query: {} };
        const res = createResponse();

        await ShoppingListController.list(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ items: [] });
    });
});
