import { Router } from "express";
import { FavoriteController } from "../controllers/favoriteController";
import { RecipeController } from "../controllers/recipeController";
import { SearchHistoryController } from "../controllers/searchHistoryController";
import { UserPreferencesController } from "../controllers/userPreferencesController";
import { AuthMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/recipes/feed/suggested", AuthMiddleware.authenticateUser, RecipeController.getSuggestedFeed);
router.get("/recipes/search", RecipeController.searchRecipes);
router.get("/recipes/:recipeId", RecipeController.getRecipeById);

router.post("/recipes", AuthMiddleware.authenticateUser, RecipeController.createRecipe);

router.post("/favorites/:recipeId/toggle", AuthMiddleware.authenticateUser, FavoriteController.toggleFavorite);
router.get("/favorites", AuthMiddleware.authenticateUser, FavoriteController.listFavorites);

router.post("/search-history", AuthMiddleware.authenticateUser, SearchHistoryController.create);
router.get("/search-history", AuthMiddleware.authenticateUser, SearchHistoryController.list);
router.delete("/search-history", AuthMiddleware.authenticateUser, SearchHistoryController.clear);

router.get("/preferences", AuthMiddleware.authenticateUser, UserPreferencesController.getByUser);
router.put("/preferences", AuthMiddleware.authenticateUser, UserPreferencesController.upsert);

export default router;
