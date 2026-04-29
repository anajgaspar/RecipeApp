import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../src/services/commentsService", () => ({
    CommentsService: {
        addComment: jest.fn(),
        getRecipeComments: jest.fn(),
        updateComment: jest.fn(),
        deleteComment: jest.fn(),
    },
}));

import { CommentsController } from "../../src/controllers/commentsController";
import { CommentsService } from "../../src/services/commentsService";

const mockCommentsService = CommentsService as jest.Mocked<typeof CommentsService>;

function createResponse() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("Controlador de comentários", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve retornar 401 quando o usuário não estiver autenticado ao criar comentário", async () => {
        const req: any = { body: { recipeId: "recipe-1", text: "Muito bom", rating: 5 }, params: {}, query: {} };
        const res = createResponse();

        await CommentsController.addComment(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("deve criar comentário com sucesso", async () => {
        mockCommentsService.addComment.mockResolvedValueOnce({
            id: "comment-1",
            authorId: "user-1",
            recipeId: "recipe-1",
            text: "Muito bom",
            rating: 5,
            imageUrl: "https://example.com/comment.jpg",
            createdAt: "2026-04-03T00:00:00.000Z",
            updatedAt: "2026-04-03T00:00:00.000Z",
        });

        const req: any = {
            userId: "user-1",
            body: {
                recipeId: "recipe-1",
                text: "Muito bom",
                rating: 5,
                imageUrl: "https://example.com/comment.jpg",
            },
            params: {},
            query: {},
        };
        const res = createResponse();

        await CommentsController.addComment(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(mockCommentsService.addComment).toHaveBeenCalledWith(
            "user-1",
            "recipe-1",
            expect.objectContaining({ text: "Muito bom", rating: 5 })
        );
    });

    it("deve listar comentários de uma receita", async () => {
        mockCommentsService.getRecipeComments.mockResolvedValueOnce([]);
        const req: any = { userId: "user-1", params: { recipeId: "recipe-1" }, body: {}, query: {} };
        const res = createResponse();

        await CommentsController.getRecipeComments(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ comments: [] });
    });

    it("deve atualizar comentário com sucesso", async () => {
        mockCommentsService.updateComment.mockResolvedValueOnce({
            id: "comment-1",
            authorId: "user-1",
            recipeId: "recipe-1",
            text: "Atualizado",
            rating: 4,
            imageUrl: "https://example.com/comment.jpg",
            createdAt: "2026-04-03T00:00:00.000Z",
            updatedAt: "2026-04-03T01:00:00.000Z",
        });

        const req: any = {
            userId: "user-1",
            params: { commentId: "comment-1" },
            body: { text: "Atualizado", rating: 4, imageUrl: "https://example.com/comment.jpg" },
            query: {},
        };
        const res = createResponse();

        await CommentsController.updateComment(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockCommentsService.updateComment).toHaveBeenCalledWith("comment-1", "user-1", expect.any(Object));
    });

    it("deve excluir comentário com sucesso", async () => {
        mockCommentsService.deleteComment.mockResolvedValueOnce(undefined);
        const req: any = { userId: "user-1", params: { commentId: "comment-1" }, body: {}, query: {} };
        const res = createResponse();

        await CommentsController.deleteComment(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockCommentsService.deleteComment).toHaveBeenCalledWith("comment-1", "user-1");
    });
});