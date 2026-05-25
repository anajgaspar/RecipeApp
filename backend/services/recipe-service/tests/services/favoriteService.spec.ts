import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../src/repositories/favoriteRepository", () => ({
    FavoritesRepository: {
        findById: jest.fn(),
        findByUserAndRecipe: jest.fn(),
        listByUserId: jest.fn(),
        create: jest.fn(),
        deleteByUserAndRecipe: jest.fn(),
    },
}));

jest.mock("../../src/repositories/recipeRepository", () => ({
    RecipeRepository: {
        findById: jest.fn(),
    },
}));

import { FavoriteService } from "../../src/services/favoriteService";
import { FavoritesRepository } from "../../src/repositories/favoriteRepository";
import { RecipeRepository } from "../../src/repositories/recipeRepository";

const mockFavoritesRepository = FavoritesRepository as jest.Mocked<typeof FavoritesRepository>;
const mockRecipeRepository = RecipeRepository as jest.Mocked<typeof RecipeRepository>;

describe("Serviço de favoritos", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve remover dos favoritos quando a receita já estiver favoritada", async () => {
        mockFavoritesRepository.findByUserAndRecipe.mockResolvedValueOnce({
            id: "fav-1",
            userId: "user-1",
            recipeId: "recipe-1",
            createdAt: "2026-04-03T00:00:00.000Z",
        });

        const result = await FavoriteService.toggleFavorite("user-1", "profile-1", "recipe-1");

        expect(mockFavoritesRepository.deleteByUserAndRecipe).toHaveBeenCalledWith("user-1", "profile-1", "recipe-1");
        expect(result).toEqual({ favorited: false });
    });

    it("deve criar favorito quando a receita ainda não estiver favoritada", async () => {
        mockFavoritesRepository.findByUserAndRecipe.mockResolvedValueOnce(null);
        mockFavoritesRepository.create.mockResolvedValueOnce({
            id: "fav-2",
            userId: "user-1",
            recipeId: "recipe-2",
            createdAt: "2026-04-03T00:00:00.000Z",
        });

        const result = await FavoriteService.toggleFavorite("user-1", "profile-1", "recipe-2");

        expect(mockFavoritesRepository.create).toHaveBeenCalledWith({ userId: "user-1", profileId: "profile-1", recipeId: "recipe-2" });
        expect(result.favorited).toBe(true);
    });

    it("deve listar apenas receitas encontradas nos favoritos", async () => {
        mockFavoritesRepository.listByUserId.mockResolvedValueOnce([
            {
                id: "fav-1",
                userId: "user-1",
                recipeId: "recipe-1",
                createdAt: "2026-04-03T00:00:00.000Z",
            },
            {
                id: "fav-2",
                userId: "user-1",
                recipeId: "recipe-2",
                createdAt: "2026-04-03T00:00:00.000Z",
            },
        ]);
        mockRecipeRepository.findById
            .mockResolvedValueOnce({
                id: "recipe-1",
                authorId: "user-a",
                title: "Bolo",
                imageUrl: "https://example.com/bolo.jpg",
                prepTimeMinutes: 30,
                difficulty: "Fácil",
                category: ["Low Carb"],
                ingredients: [{ id: "i1", name: "Farinha", quantityValue: "2", quantityUnit: "xícaras", position: 1 }],
                steps: [{ id: "s1", stepNumber: 1, instruction: "Misture", timerSeconds: 10 }],
                createdAt: "2026-04-03T00:00:00.000Z",
                updatedAt: "2026-04-03T00:00:00.000Z",
            })
            .mockResolvedValueOnce(null);

        const result = await FavoriteService.listFavoriteRecipes("user-1", "profile-1");

        expect(result).toHaveLength(1);
        expect(result[0].recipe?.id).toBe("recipe-1");
    });
});
