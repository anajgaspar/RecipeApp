import { Router } from "express";
import { FavoriteController } from "../controllers/favoriteController";
import { RecipeCompletionController } from "../controllers/recipeCompletionController";
import { RecipeController } from "../controllers/recipeController";
import { SearchHistoryController } from "../controllers/searchHistoryController";
import { UserPreferencesController } from "../controllers/userPreferencesController";
import { PantryController } from "../controllers/pantryController";
import { ShoppingListController } from "../controllers/shoppingListController";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { CommentsController } from "../controllers/commentsController";

const router = Router();

router.get("/recipes/feed/suggested", AuthMiddleware.authenticateUser, RecipeController.getSuggestedFeed);
router.get("/recipes/search", RecipeController.searchRecipes);
router.get("/recipes/me", AuthMiddleware.authenticateUser, RecipeController.getMyRecipes);
router.get("/recipes/badges/me", AuthMiddleware.authenticateUser, RecipeController.getMyBadgeProgress);
router.get("/recipes/completions", AuthMiddleware.authenticateUser, RecipeCompletionController.listCompleted);

router.get("/recipes/:recipeId", RecipeController.getRecipeById);
router.get("/recipes/:recipeId/completion-status", AuthMiddleware.authenticateUser, RecipeCompletionController.getStatus);
router.post("/recipes/:recipeId/complete", AuthMiddleware.authenticateUser, RecipeCompletionController.markCompleted);

router.post("/recipes", AuthMiddleware.authenticateUser, RecipeController.createRecipe);
router.put("/recipes/:recipeId", AuthMiddleware.authenticateUser, RecipeController.updateRecipe);
router.delete("/recipes/:recipeId", AuthMiddleware.authenticateUser, RecipeController.deleteRecipe);

router.post("/comments", AuthMiddleware.authenticateUser, CommentsController.addComment);
router.get("/comments/:recipeId", AuthMiddleware.authenticateUser, CommentsController.getRecipeComments);
router.put("/comments/:commentId", AuthMiddleware.authenticateUser, CommentsController.updateComment);
router.delete("/comments/:commentId", AuthMiddleware.authenticateUser, CommentsController.deleteComment);

router.post("/favorites/:recipeId/toggle", AuthMiddleware.authenticateUser, FavoriteController.toggleFavorite);
router.get("/favorites", AuthMiddleware.authenticateUser, FavoriteController.listFavorites);

router.post("/search-history", AuthMiddleware.authenticateUser, SearchHistoryController.create);
router.get("/search-history", AuthMiddleware.authenticateUser, SearchHistoryController.list);
router.delete("/search-history", AuthMiddleware.authenticateUser, SearchHistoryController.clear);

router.post("/pantry", AuthMiddleware.authenticateUser, PantryController.addItem);
router.get("/pantry", AuthMiddleware.authenticateUser, PantryController.list);
router.put("/pantry/:itemId", AuthMiddleware.authenticateUser, PantryController.update);
router.delete("/pantry/:itemId", AuthMiddleware.authenticateUser, PantryController.remove);
router.delete("/pantry", AuthMiddleware.authenticateUser, PantryController.clear);

router.post("/shopping-list", AuthMiddleware.authenticateUser, ShoppingListController.addItem);
router.get("/shopping-list", AuthMiddleware.authenticateUser, ShoppingListController.list);
router.put("/shopping-list/:itemId", AuthMiddleware.authenticateUser, ShoppingListController.update);
router.delete("/shopping-list/:itemId", AuthMiddleware.authenticateUser, ShoppingListController.remove);
router.delete("/shopping-list", AuthMiddleware.authenticateUser, ShoppingListController.clear);

router.get("/preferences", AuthMiddleware.authenticateUser, UserPreferencesController.getByUser);
router.put("/preferences", AuthMiddleware.authenticateUser, UserPreferencesController.upsert);

export default router;