jest.mock("../../src/repositories/recipeRepository", () => ({
    RecipeRepository: {
        create: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        findSuggested: jest.fn(),
        updateById: jest.fn(),
        findByAuthorId: jest.fn(),
    },
}));

jest.mock("../../src/repositories/userPreferencesRepository", () => ({
    UserPreferencesRepository: {
        findByUserId: jest.fn(),
        upsertByUserId: jest.fn(),
    },
}));

import crypto from "crypto";
import { RecipeService } from "../../src/services/recipeService";
import { RecipeRepository } from "../../src/repositories/recipeRepository";
import { UserPreferencesRepository } from "../../src/repositories/userPreferencesRepository";

const mockRecipeRepository = RecipeRepository as jest.Mocked<typeof RecipeRepository>;
const mockUserPreferencesRepository = UserPreferencesRepository as jest.Mocked<typeof UserPreferencesRepository>;

describe("Serviço de receitas", () => {
    beforeEach(() => {
        jest.spyOn(crypto, "randomUUID").mockImplementation(() => "recipe-id-123" as ReturnType<typeof crypto.randomUUID>);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("deve criar uma receita com o authorId autenticado", async () => {
        mockRecipeRepository.create.mockResolvedValueOnce({
            id: "recipe-id-123",
            authorId: "user-1",
            title: "Bolo",
            imageUrl: "https://example.com/image.jpg",
            prepTimeMinutes: 40,
            difficulty: "fácil",
            category: "doce",
            ingredients: [
                {
                    id: "ingredient-1",
                    name: "Farinha",
                    quantityValue: "2",
                    quantityUnit: "xícaras",
                    position: 1,
                },
            ],
            steps: [
                {
                    id: "step-1",
                    stepNumber: 1,
                    instruction: "Misture tudo",
                    timerSeconds: 10,
                },
            ],
            createdAt: "2026-04-03T00:00:00.000Z",
            updatedAt: "2026-04-03T00:00:00.000Z",
        });

        const result = await RecipeService.createRecipe("user-1", {
            title: "Bolo",
            imageUrl: "https://example.com/image.jpg",
            prepTimeMinutes: 40,
            difficulty: "fácil",
            category: "doce",
            ingredients: [
                {
                    name: "Farinha",
                    quantityValue: "2",
                    quantityUnit: "xícaras",
                    position: 1,
                },
            ],
            steps: [
                {
                    stepNumber: 1,
                    instruction: "Misture tudo",
                    timerSeconds: 10,
                },
            ],
        });

        expect(mockRecipeRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "recipe-id-123",
                authorId: "user-1",
                title: "Bolo",
            })
        );
        expect(result.id).toBe("recipe-id-123");
    });

    it("deve priorizar receitas que combinam com as preferências do usuário", async () => {
        mockRecipeRepository.findAll.mockResolvedValueOnce([
            {
                id: "1",
                authorId: "a",
                title: "Salada simples",
                imageUrl: "https://example.com/1.jpg",
                prepTimeMinutes: 10,
                difficulty: "fácil",
                category: "fit",
                ingredients: [{ id: "i1", name: "Alface", quantityValue: "1", quantityUnit: "un", position: 1 }],
                steps: [{ id: "s1", stepNumber: 1, instruction: "Misture", timerSeconds: 5 }],
                createdAt: "2026-04-03T10:00:00.000Z",
                updatedAt: "2026-04-03T10:00:00.000Z",
            },
            {
                id: "2",
                authorId: "b",
                title: "Bolo de chocolate",
                imageUrl: "https://example.com/2.jpg",
                prepTimeMinutes: 50,
                difficulty: "médio",
                category: "doce",
                ingredients: [{ id: "i2", name: "Chocolate", quantityValue: "200", quantityUnit: "g", position: 1 }],
                steps: [{ id: "s2", stepNumber: 1, instruction: "Asse", timerSeconds: 20 }],
                createdAt: "2026-04-03T11:00:00.000Z",
                updatedAt: "2026-04-03T11:00:00.000Z",
            },
        ]);

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

        const result = await RecipeService.getSuggestedFeed("user-1", 10);

        expect(result[0].id).toBe("2");
    });

    it("deve buscar receitas pelo texto informado", async () => {
        mockRecipeRepository.findAll.mockResolvedValueOnce([
            {
                id: "1",
                authorId: "a",
                title: "Bolo de cenoura",
                imageUrl: "https://example.com/1.jpg",
                prepTimeMinutes: 30,
                difficulty: "fácil",
                category: "doce",
                ingredients: [{ id: "i1", name: "Cenoura", quantityValue: "2", quantityUnit: "un", position: 1 }],
                steps: [{ id: "s1", stepNumber: 1, instruction: "Misture a cenoura", timerSeconds: 5 }],
                createdAt: "2026-04-03T10:00:00.000Z",
                updatedAt: "2026-04-03T10:00:00.000Z",
            },
            {
                id: "2",
                authorId: "b",
                title: "Sopa de legumes",
                imageUrl: "https://example.com/2.jpg",
                prepTimeMinutes: 20,
                difficulty: "fácil",
                category: "salgado",
                ingredients: [{ id: "i2", name: "Batata", quantityValue: "1", quantityUnit: "un", position: 1 }],
                steps: [{ id: "s2", stepNumber: 1, instruction: "Cozinhe", timerSeconds: 10 }],
                createdAt: "2026-04-03T11:00:00.000Z",
                updatedAt: "2026-04-03T11:00:00.000Z",
            },
        ]);

        const result = await RecipeService.searchRecipes({ query: "cenoura", limit: 10 });

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("1");
    });
});