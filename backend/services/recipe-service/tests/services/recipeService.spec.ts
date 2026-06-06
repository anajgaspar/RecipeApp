import { beforeEach, afterEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../src/repositories/recipeRepository", () => ({
    RecipeRepository: {
        create: jest.fn(),
        findById: jest.fn(),
        findAllLight: jest.fn(),
        findAll: jest.fn(),
        findSuggested: jest.fn(),
        updateById: jest.fn(),
        deleteById: jest.fn(),
        findByAuthorId: jest.fn(),
    },
}));

jest.mock("../../src/repositories/favoriteRepository", () => ({
    FavoritesRepository: {
        listByUserId: jest.fn(),
        findAll: jest.fn(),
    },
}));

jest.mock("../../src/repositories/commentsRepository", () => ({
    CommentsRepository: {
        findAll: jest.fn(),
    },
}));

import crypto from "crypto";
import { RecipeService } from "../../src/services/recipeService";
import { RecipeRepository } from "../../src/repositories/recipeRepository";
import { FavoritesRepository } from "../../src/repositories/favoriteRepository";
import { CommentsRepository } from "../../src/repositories/commentsRepository";

const mockRecipeRepository = RecipeRepository as jest.Mocked<typeof RecipeRepository>;
const mockFavoritesRepository = FavoritesRepository as jest.Mocked<typeof FavoritesRepository>;
const mockCommentsRepository = CommentsRepository as jest.Mocked<typeof CommentsRepository>;

describe("Serviço de receitas", () => {
    beforeEach(() => {
        jest.spyOn(crypto, "randomUUID").mockImplementation(() => "recipe-id-123" as ReturnType<typeof crypto.randomUUID>);
        mockCommentsRepository.findAll.mockResolvedValue([]);
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
            difficulty: "Fácil",
            category: ["Doce"],
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
            difficulty: "Fácil",
            category: ["Doce"],
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

    it("deve recomendar receitas similares com base nas receitas favoritadas", async () => {
        mockFavoritesRepository.listByUserId.mockResolvedValueOnce([
            {
                id: "fav-1",
                userId: "user-1",
                recipeId: "fav-recipe",
                createdAt: "2026-04-03T09:00:00.000Z",
            },
        ]);

        mockRecipeRepository.findById.mockResolvedValueOnce({
            id: "fav-recipe",
            authorId: "a",
            title: "Bolo de cenoura",
            imageUrl: "https://example.com/fav.jpg",
            prepTimeMinutes: 30,
            difficulty: "Fácil",
            category: ["Doce"],
            ingredients: [{ id: "fi1", name: "Cenoura", quantityValue: "2", quantityUnit: "un", position: 1 }],
            steps: [{ id: "fs1", stepNumber: 1, instruction: "Misture", timerSeconds: 10 }],
            createdAt: "2026-04-03T08:00:00.000Z",
            updatedAt: "2026-04-03T08:00:00.000Z",
        });

        mockRecipeRepository.findAll.mockResolvedValueOnce([
            {
                id: "fav-recipe",
                authorId: "a",
                title: "Bolo de cenoura",
                imageUrl: "https://example.com/fav.jpg",
                prepTimeMinutes: 30,
                difficulty: "Fácil",
                category: ["Doce"],
                ingredients: [{ id: "fi1", name: "Cenoura", quantityValue: "2", quantityUnit: "un", position: 1 }],
                steps: [{ id: "fs1", stepNumber: 1, instruction: "Misture", timerSeconds: 10 }],
                createdAt: "2026-04-03T08:00:00.000Z",
                updatedAt: "2026-04-03T08:00:00.000Z",
            },
            {
                id: "2",
                authorId: "b",
                title: "Bolo de cenoura com cobertura",
                imageUrl: "https://example.com/2.jpg",
                prepTimeMinutes: 40,
                difficulty: "Médio",
                category: ["Doce"],
                ingredients: [{ id: "i2", name: "Cenoura", quantityValue: "200", quantityUnit: "g", position: 1 }],
                steps: [{ id: "s2", stepNumber: 1, instruction: "Asse", timerSeconds: 20 }],
                createdAt: "2026-04-03T11:00:00.000Z",
                updatedAt: "2026-04-03T11:00:00.000Z",
            },
            {
                id: "3",
                authorId: "c",
                title: "Sopa de legumes",
                imageUrl: "https://example.com/3.jpg",
                prepTimeMinutes: 25,
                difficulty: "Fácil",
                category: ["Salgado"],
                ingredients: [{ id: "i3", name: "Batata", quantityValue: "2", quantityUnit: "un", position: 1 }],
                steps: [{ id: "s3", stepNumber: 1, instruction: "Cozinhe", timerSeconds: 20 }],
                createdAt: "2026-04-03T12:00:00.000Z",
                updatedAt: "2026-04-03T12:00:00.000Z",
            },
        ]);
        // `getSuggestedFeed` uses `findAllLight` — ensure the mock provides the same dataset
        mockRecipeRepository.findAllLight.mockResolvedValueOnce([
            {
                id: "fav-recipe",
                authorId: "a",
                title: "Bolo de cenoura",
                imageUrl: "https://example.com/fav.jpg",
                prepTimeMinutes: 30,
                difficulty: "Fácil",
                category: ["Doce"],
                ingredients: [{ id: "fi1", name: "Cenoura", quantityValue: "2", quantityUnit: "un", position: 1 }],
                steps: [{ id: "fs1", stepNumber: 1, instruction: "Misture", timerSeconds: 10 }],
                createdAt: "2026-04-03T08:00:00.000Z",
                updatedAt: "2026-04-03T08:00:00.000Z",
            },
            {
                id: "2",
                authorId: "b",
                title: "Bolo de cenoura com cobertura",
                imageUrl: "https://example.com/2.jpg",
                prepTimeMinutes: 40,
                difficulty: "Médio",
                category: ["Doce"],
                ingredients: [{ id: "i2", name: "Cenoura", quantityValue: "200", quantityUnit: "g", position: 1 }],
                steps: [{ id: "s2", stepNumber: 1, instruction: "Asse", timerSeconds: 20 }],
                createdAt: "2026-04-03T11:00:00.000Z",
                updatedAt: "2026-04-03T11:00:00.000Z",
            },
            {
                id: "3",
                authorId: "c",
                title: "Sopa de legumes",
                imageUrl: "https://example.com/3.jpg",
                prepTimeMinutes: 25,
                difficulty: "Fácil",
                category: ["Salgado"],
                ingredients: [{ id: "i3", name: "Batata", quantityValue: "2", quantityUnit: "un", position: 1 }],
                steps: [{ id: "s3", stepNumber: 1, instruction: "Cozinhe", timerSeconds: 20 }],
                createdAt: "2026-04-03T12:00:00.000Z",
                updatedAt: "2026-04-03T12:00:00.000Z",
            },
        ]);

        const result = await RecipeService.getSuggestedFeed("user-1", "user-1", 10);

        expect(mockFavoritesRepository.listByUserId).toHaveBeenCalledWith("user-1", "user-1");

        expect(result[0].id).toBe("2");
        expect(result.some((recipe) => recipe.id === "fav-recipe")).toBe(true);
    });

    it("deve buscar receitas pelo texto informado", async () => {
        mockRecipeRepository.findAll.mockResolvedValueOnce([
            {
                id: "1",
                authorId: "a",
                title: "Bolo de cenoura",
                imageUrl: "https://example.com/1.jpg",
                prepTimeMinutes: 30,
                difficulty: "Fácil",
                category: ["Doce"],
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
                difficulty: "Fácil",
                category: ["Salgado"],
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

    it("retorna erro ao buscar receita inexistente", async () => {
        mockRecipeRepository.findById.mockResolvedValueOnce(null);

        await expect(RecipeService.getRecipeById("nope")).rejects.toThrow("Receita não encontrada");
    });

    it("impede atualização por usuário não autor", async () => {
        mockRecipeRepository.findById.mockResolvedValueOnce({
            id: "r1",
            authorId: "other",
            title: "X",
            imageUrl: "u",
            prepTimeMinutes: 10,
            difficulty: "Fácil",
            category: ["Doce"],
            ingredients: [],
            steps: [],
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
        });

        await expect(RecipeService.updateRecipe("user-1", "r1", {
            title: "Y",
            imageUrl: "u",
            prepTimeMinutes: 5,
            difficulty: "Fácil",
            category: ["Doce"],
            ingredients: [],
            steps: [],
        })).rejects.toThrow("Você não tem permissão para editar esta receita.");
    });

    it("atualiza receita quando autor é válido", async () => {
        mockRecipeRepository.findById.mockResolvedValueOnce({
            id: "r3",
            authorId: "user-1",
            title: "Old",
            imageUrl: "u",
            prepTimeMinutes: 10,
            difficulty: "Fácil",
            category: ["X"],
            ingredients: [{ id: "ing1", name: "A", quantityValue: "1", quantityUnit: "un", position: 1 }],
            steps: [{ id: "st1", stepNumber: 1, instruction: "Do", timerSeconds: 5 }],
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
        });

        mockRecipeRepository.updateById.mockResolvedValueOnce(undefined);

        const updated = await RecipeService.updateRecipe("user-1", "r3", {
            title: "New",
            imageUrl: "u2",
            prepTimeMinutes: 12,
            difficulty: "Fácil",
            category: ["Y"],
            ingredients: [{ name: "B", quantityValue: "2", quantityUnit: "un", position: 1 }],
            steps: [{ stepNumber: 1, instruction: "Do more", timerSeconds: 6 }],
        });

        expect(mockRecipeRepository.updateById).toHaveBeenCalledWith("r3", expect.any(Object));
        expect(updated.title).toBe("New");
        expect(updated.imageUrl).toBe("u2");
    });

    it("permite excluir receita pelo autor", async () => {
        mockRecipeRepository.findById.mockResolvedValueOnce({
            id: "r2",
            authorId: "user-1",
            title: "Del",
            imageUrl: "u",
            prepTimeMinutes: 5,
            difficulty: "Fácil",
            category: ["Doce"],
            ingredients: [],
            steps: [],
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
        });

        mockRecipeRepository.deleteById.mockResolvedValueOnce(undefined as unknown as void);

        await expect(RecipeService.deleteRecipe("user-1", "r2")).resolves.toBeUndefined();
    });

    it("calcula progresso de badge do autor", async () => {
        mockRecipeRepository.findByAuthorId.mockResolvedValueOnce([
            { id: "a1", authorId: "user-1", title: "T", imageUrl: "u", prepTimeMinutes: 1, difficulty: "Fácil", category: ["X"], ingredients: [], steps: [], createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
        ]);

        mockCommentsRepository.findAll.mockResolvedValueOnce([
            { id: "c1", recipeId: "a1", authorId: "other", rating: 5, text: "ok", createdAt: "2026-01-02T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z" },
        ]);

        mockFavoritesRepository.findAll.mockResolvedValueOnce([
            { id: "f1", userId: "other", recipeId: "a1", createdAt: "2026-01-03T00:00:00.000Z", profileId: undefined },
        ]);

        const progress = await RecipeService.getMyBadgeProgress("user-1");
        expect(progress.firstHighRating).toBe(true);
        expect(progress.recipeSavedByAnotherUser).toBe(true);
    });
});