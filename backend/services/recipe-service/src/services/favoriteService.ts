import { FavoritesRepository } from "../repositories/favoriteRepository";
import { RecipeRepository } from "../repositories/recipeRepository";

export const FavoriteService = {
    async toggleFavorite(userId: string, profileId: string, recipeId: string) {
        const existingFavorite = await FavoritesRepository.findByUserAndRecipe(userId, profileId, recipeId);

        if (existingFavorite) {
            await FavoritesRepository.deleteByUserAndRecipe(userId, profileId, recipeId);
            return {
                favorited: false,
            };
        }

        const favorite = await FavoritesRepository.create({ userId, profileId, recipeId });
        return {
            favorited: true,
            favorite,
        };
    },

    async listFavoriteRecipes(userId: string, profileId: string) {
        const favorites = await FavoritesRepository.listByUserId(userId, profileId);

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
