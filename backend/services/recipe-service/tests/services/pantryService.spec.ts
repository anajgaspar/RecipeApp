import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../src/repositories/pantryRepository", () => ({
    PantryRepository: {
        listByUserId: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteById: jest.fn(),
        clearByUserId: jest.fn(),
    },
}));

import { PantryService } from "../../src/services/pantryService";
import { PantryRepository } from "../../src/repositories/pantryRepository";

const mockPantryRepository = PantryRepository as jest.Mocked<typeof PantryRepository>;

describe("Serviço de despensa", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve adicionar um item à despensa", async () => {
        mockPantryRepository.create.mockResolvedValueOnce({
            id: "p1",
            userId: "user-1",
            name: "Arroz",
            quantityValue: "1",
            quantityUnit: "kg",
            createdAt: "2026-04-03T00:00:00.000Z",
        } as any);

        const result = await PantryService.addItem("user-1", { name: "Arroz", quantityValue: "1", quantityUnit: "kg" });

        expect(mockPantryRepository.create).toHaveBeenCalledWith(expect.objectContaining({ userId: "user-1", name: "Arroz" }));
        expect(result.id).toBe("p1");
    });

    it("deve listar itens por usuário", async () => {
        mockPantryRepository.listByUserId.mockResolvedValueOnce([
            { id: "p1", userId: "user-1", name: "Feijão", createdAt: "2026-04-03T00:00:00.000Z" } as any,
        ]);

        const result = await PantryService.listItems("user-1");

        expect(mockPantryRepository.listByUserId).toHaveBeenCalledWith("user-1");
        expect(result).toHaveLength(1);
    });

    it("deve remover item", async () => {
        mockPantryRepository.deleteById.mockResolvedValueOnce();

        const result = await PantryService.removeItem("p1");

        expect(mockPantryRepository.deleteById).toHaveBeenCalledWith("p1");
        expect(result).toEqual({ removed: true });
    });
});
