import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../src/repositories/shoppingListRepository", () => ({
    ShoppingListRepository: {
        listByUserId: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteById: jest.fn(),
        clearByUserId: jest.fn(),
    },
}));

import { ShoppingListService } from "../../src/services/shoppingListService";
import { ShoppingListRepository } from "../../src/repositories/shoppingListRepository";

const mockShoppingRepository = ShoppingListRepository as jest.Mocked<typeof ShoppingListRepository>;

describe("Serviço de lista de compras", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve adicionar item à lista", async () => {
        mockShoppingRepository.create.mockResolvedValueOnce({ id: "s1", userId: "user-1", name: "Leite", checked: false, createdAt: "2026-04-03T00:00:00.000Z" } as any);

        const result = await ShoppingListService.addItem("user-1", { name: "Leite" });

        expect(mockShoppingRepository.create).toHaveBeenCalledWith(expect.objectContaining({ userId: "user-1", name: "Leite" }));
        expect(result.id).toBe("s1");
    });

    it("deve listar itens", async () => {
        mockShoppingRepository.listByUserId.mockResolvedValueOnce([{ id: "s1", userId: "user-1", name: "Leite", createdAt: "2026-04-03T00:00:00.000Z" } as any]);

        const result = await ShoppingListService.listItems("user-1");

        expect(mockShoppingRepository.listByUserId).toHaveBeenCalledWith("user-1");
        expect(result).toHaveLength(1);
    });
});
