import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../src/repositories/userPreferencesRepository", () => ({
    UserPreferencesRepository: {
        findByUserId: jest.fn(),
        upsertByUserId: jest.fn(),
    },
}));

import { UserPreferencesService } from "../../src/services/userPreferencesService";
import { UserPreferencesRepository } from "../../src/repositories/userPreferencesRepository";

const mockUserPreferencesRepository = UserPreferencesRepository as jest.Mocked<typeof UserPreferencesRepository>;

describe("Serviço de preferências do usuário", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve buscar as preferências do usuário", async () => {
        mockUserPreferencesRepository.findByUserId.mockResolvedValueOnce({
            id: "user-1",
            preferences: {
                userId: "user-1",
                preferredCategories: ["doce"],
                preferredTags: ["chocolate"],
                updatedAt: "2026-04-03T00:00:00.000Z",
            },
            createdAt: "2026-04-03T00:00:00.000Z",
            updatedAt: "2026-04-03T00:00:00.000Z",
        });

        const result = await UserPreferencesService.getPreferences("user-1");

        expect(mockUserPreferencesRepository.findByUserId).toHaveBeenCalledWith("user-1");
        expect(result?.id).toBe("user-1");
    });

    it("deve atualizar as preferências do usuário", async () => {
        mockUserPreferencesRepository.upsertByUserId.mockResolvedValueOnce({
            id: "user-1",
            preferences: {
                userId: "user-1",
                preferredCategories: ["doce"],
                preferredTags: ["chocolate"],
                updatedAt: "2026-04-03T00:00:00.000Z",
            },
            createdAt: "2026-04-03T00:00:00.000Z",
            updatedAt: "2026-04-03T00:00:00.000Z",
        });

        const result = await UserPreferencesService.upsertPreferences("user-1", ["doce"], ["chocolate"]);

        expect(mockUserPreferencesRepository.upsertByUserId).toHaveBeenCalledWith({
            userId: "user-1",
            preferredCategories: ["doce"],
            preferredTags: ["chocolate"],
        });
        expect(result.id).toBe("user-1");
    });
});
