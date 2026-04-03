import { FavoritesRepository } from "../repositories/favoriteRepository";
import { RecipeRepository } from "../repositories/recipeRepository";

export const FavoriteService = {
    async toggleFavorite(userId: string, recipeId: string) {
        const existingFavorite = await FavoritesRepository.findByUserAndRecipe(userId, recipeId);

        if (existingFavorite) {
            await FavoritesRepository.deleteByUserAndRecipe(userId, recipeId);
            return {
                favorited: false,
            };
        }

        const favorite = await FavoritesRepository.create({ userId, recipeId });
        return {
            favorited: true,
            favorite,
        };
    },

    async listFavoriteRecipes(userId: string) {
        const favorites = await FavoritesRepository.listByUserId(userId);

        const recipes = await Promise.all(
            favorites.map(async (favorite) => {
                const recipe = await RecipeRepository.findById(favorite.recipeId);
                return {
                    favorite,
                    recipe,
                };
            })
        );

        return recipes.filter((item) => item.recipe !== null);
    },
};
