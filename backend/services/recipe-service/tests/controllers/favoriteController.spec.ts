import { beforeEach, describe, expect, it, jest } from "@jest/globals";


jest.mock("../../src/services/favoriteService", () => ({
    FavoriteService: {
        toggleFavorite: jest.fn(),
        listFavoriteRecipes: jest.fn(),
    },
}));

import { FavoriteController } from "../../src/controllers/favoriteController";
import { FavoriteService } from "../../src/services/favoriteService";

const mockFavoriteService = FavoriteService as jest.Mocked<typeof FavoriteService>;

function createResponse() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("Controlador de favoritos", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve negar acesso sem usuário autenticado", async () => {
        const req: any = { params: { recipeId: "recipe-1" }, body: {}, query: {} };
        const res = createResponse();

        await FavoriteController.toggleFavorite(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("deve alternar favorito com sucesso", async () => {
        mockFavoriteService.toggleFavorite.mockResolvedValueOnce({ favorited: true, favorite: { id: "fav-1" } as any });
        const req: any = { userId: "user-1", params: { recipeId: "recipe-1" }, body: {}, query: {} };
        const res = createResponse();

        await FavoriteController.toggleFavorite(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockFavoriteService.toggleFavorite).toHaveBeenCalledWith("user-1", "recipe-1");
    });

    it("deve listar favoritos do usuário", async () => {
        mockFavoriteService.listFavoriteRecipes.mockResolvedValueOnce([]);
        const req: any = { userId: "user-1", params: {}, body: {}, query: {} };
        const res = createResponse();

        await FavoriteController.listFavorites(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ favorites: [] });
    });
});
