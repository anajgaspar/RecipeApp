jest.mock("../../src/services/userPreferencesService", () => ({
    UserPreferencesService: {
        getPreferences: jest.fn(),
        upsertPreferences: jest.fn(),
    },
}));

import { UserPreferencesController } from "../../src/controllers/userPreferencesController";
import { UserPreferencesService } from "../../src/services/userPreferencesService";

const mockUserPreferencesService = UserPreferencesService as jest.Mocked<typeof UserPreferencesService>;

function createResponse() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("Controlador de preferências do usuário", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve buscar as preferências do usuário", async () => {
        mockUserPreferencesService.getPreferences.mockResolvedValueOnce({
            id: "user-1",
            preferences: {
                userId: "user-1",
                preferredCategories: ["doce"],
                preferredTags: ["chocolate"],
                updatedAt: "2026-04-03T00:00:00.000Z",
            },
            createdAt: "2026-04-03T00:00:00.000Z",
            updatedAt: "2026-04-03T00:00:00.000Z",
        });

        const req: any = { userId: "user-1", body: {}, query: {}, params: {} };
        const res = createResponse();

        await UserPreferencesController.getByUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ preferences: expect.any(Object) }));
    });

    it("deve atualizar as preferências do usuário", async () => {
        mockUserPreferencesService.upsertPreferences.mockResolvedValueOnce({
            id: "user-1",
            preferences: {
                userId: "user-1",
                preferredCategories: ["doce"],
                preferredTags: ["chocolate"],
                updatedAt: "2026-04-03T00:00:00.000Z",
            },
            createdAt: "2026-04-03T00:00:00.000Z",
            updatedAt: "2026-04-03T00:00:00.000Z",
        });

        const req: any = {
            userId: "user-1",
            body: { preferredCategories: ["doce"], preferredTags: ["chocolate"] },
            query: {},
            params: {},
        };
        const res = createResponse();

        await UserPreferencesController.upsert(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockUserPreferencesService.upsertPreferences).toHaveBeenCalledWith("user-1", ["doce"], ["chocolate"]);
    });
});
