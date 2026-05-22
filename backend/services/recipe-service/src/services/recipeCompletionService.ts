import { RecipeCompletionRepository } from "../repositories/recipeCompletionRepository";

export const RecipeCompletionService = {
    async getCompletionStatus(profileId: string, recipeId: string) {
        const completion = await RecipeCompletionRepository.findByProfileAndRecipe(profileId, recipeId);

        return {
            completed: Boolean(completion),
            completion,
        };
    },

    async markCompleted(userId: string, profileId: string, recipeId: string) {
        const existingCompletion = await RecipeCompletionRepository.findByProfileAndRecipe(profileId, recipeId);

        if (existingCompletion) {
            return {
                completed: true,
                alreadyCompleted: true,
                completion: existingCompletion,
            };
        }

        const completion = await RecipeCompletionRepository.create({
            userId,
            profileId,
            recipeId,
        });

        return {
            completed: true,
            alreadyCompleted: false,
            completion,
        };
    },

    async listCompletedRecipes(profileId: string) {
        const completions = await RecipeCompletionRepository.listByProfileId(profileId);
        return {
            completions,
            completedRecipeIds: completions.map((item) => item.recipeId),
        };
    },
};