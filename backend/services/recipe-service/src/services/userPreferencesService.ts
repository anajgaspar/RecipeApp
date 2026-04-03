import { UserPreferencesRepository } from "../repositories/userPreferencesRepository";

export const UserPreferencesService = {
    async getPreferences(userId: string) {
        return UserPreferencesRepository.findByUserId(userId);
    },

    async upsertPreferences(userId: string, preferredCategories: string[], preferredTags: string[]) {
        return UserPreferencesRepository.upsertByUserId({
            userId,
            preferredCategories,
            preferredTags,
        });
    },
};
