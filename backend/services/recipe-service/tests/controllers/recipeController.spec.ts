import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../src/services/recipeService", () => ({
    RecipeService: {
        createRecipe: jest.fn(),
        getRecipeById: jest.fn(),
        getSuggestedFeed: jest.fn(),
        searchRecipes: jest.fn(),
    },
}));

import { RecipeController } from "../../src/controllers/recipeController";
import { RecipeService } from "../../src/services/recipeService";

const mockRecipeService = RecipeService as jest.Mocked<typeof RecipeService>;

function createResponse() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("Controlador de receitas", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve retornar 401 quando o usuário não estiver autenticado", async () => {
        const req: any = { body: {}, params: {}, query: {} };
        const res = createResponse();

        await RecipeController.createRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("deve criar uma receita com sucesso", async () => {
        mockRecipeService.createRecipe.mockResolvedValueOnce({
            id: "recipe-1",
            authorId: "user-1",
            title: "Bolo",
            imageUrl: "https://example.com/bolo.jpg",
            prepTimeMinutes: 30,
            difficulty: "Fácil",
            category: ["Low Carb"],
            ingredients: [{ id: "i1", name: "Farinha", quantityValue: "2", quantityUnit: "xícaras", position: 1 }],
            steps: [{ id: "s1", stepNumber: 1, instruction: "Misture", timerSeconds: 10 }],
            createdAt: "2026-04-03T00:00:00.000Z",
            updatedAt: "2026-04-03T00:00:00.000Z",
        });

        const req: any = {
            userId: "user-1",
            body: {
                title: "Bolo",
                imageUrl: "https://example.com/bolo.jpg",
                prepTimeMinutes: 30,
                difficulty: "fácil",
                category: "doce",
                ingredients: [{ name: "Farinha", quantityValue: "2", quantityUnit: "xícaras", position: 1 }],
                steps: [{ stepNumber: 1, instruction: "Misture", timerSeconds: 10 }],
            },
            params: {},
            query: {},
            header: jest.fn(),
        };
        const res = createResponse();

        await RecipeController.createRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(mockRecipeService.createRecipe).toHaveBeenCalledWith("user-1", expect.objectContaining({ title: "Bolo" }));
    });

    it("deve retornar 404 quando a receita não existir", async () => {
        mockRecipeService.getRecipeById.mockRejectedValueOnce(new Error("Receita não encontrada"));
        const req: any = { params: { recipeId: "invalid" }, query: {}, body: {} };
        const res = createResponse();

        await RecipeController.getRecipeById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("deve retornar o feed sugerido", async () => {
        mockRecipeService.getSuggestedFeed.mockResolvedValueOnce([]);
        const req: any = { userId: "user-1", query: {}, body: {}, params: {} };
        const res = createResponse();

        await RecipeController.getSuggestedFeed(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ recipes: [] });
    });

    it("deve buscar receitas por texto", async () => {
        mockRecipeService.searchRecipes.mockResolvedValueOnce([]);
        const req: any = { query: { q: "bolo" }, body: {}, params: {} };
        const res = createResponse();

        await RecipeController.searchRecipes(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });
});
