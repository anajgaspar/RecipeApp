import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../src/repositories/commentsRepository", () => ({
    CommentsRepository: {
        add: jest.fn(),
        findByRecipe: jest.fn(),
        findById: jest.fn(),
        updateById: jest.fn(),
        deleteById: jest.fn(),
    },
}));

import { CommentsRepository } from "../../src/repositories/commentsRepository";
import { CommentsService } from "../../src/services/commentsService";

const mockCommentsRepository = CommentsRepository as jest.Mocked<typeof CommentsRepository>;

describe("Serviço de comentários", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve criar comentário com autor autenticado", async () => {
        mockCommentsRepository.add.mockResolvedValueOnce({
            id: "comment-1",
            authorId: "user-1",
            recipeId: "recipe-1",
            text: "Muito bom",
            rating: 5,
            imageUrl: "https://example.com/comment.jpg",
            createdAt: "2026-04-03T00:00:00.000Z",
            updatedAt: "2026-04-03T00:00:00.000Z",
        });

        const result = await CommentsService.addComment("user-1", "recipe-1", {
            recipeId: "recipe-1",
            text: "Muito bom",
            rating: 5,
            imageUrl: "https://example.com/comment.jpg",
        });

        expect(mockCommentsRepository.add).toHaveBeenCalledWith(
            expect.objectContaining({
                authorId: "user-1",
                recipeId: "recipe-1",
                text: "Muito bom",
                rating: 5,
            })
        );
        expect(result.id).toBe("comment-1");
    });

    it("deve listar comentários de uma receita", async () => {
        mockCommentsRepository.findByRecipe.mockResolvedValueOnce([
            {
                id: "comment-2",
                authorId: "user-2",
                recipeId: "recipe-1",
                text: "Primeiro",
                rating: 4,
                imageUrl: "https://example.com/1.jpg",
                createdAt: "2026-04-03T02:00:00.000Z",
                updatedAt: "2026-04-03T02:00:00.000Z",
            },
            {
                id: "comment-1",
                authorId: "user-1",
                recipeId: "recipe-1",
                text: "Mais recente",
                rating: 5,
                imageUrl: "https://example.com/2.jpg",
                createdAt: "2026-04-03T03:00:00.000Z",
                updatedAt: "2026-04-03T03:00:00.000Z",
            },
        ]);

        const result = await CommentsService.getRecipeComments("recipe-1");

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("comment-2");
    });

    it("deve impedir atualização por autor diferente", async () => {
        mockCommentsRepository.findById.mockResolvedValueOnce({
            id: "comment-1",
            authorId: "user-1",
            recipeId: "recipe-1",
            text: "Original",
            rating: 3,
            imageUrl: "https://example.com/comment.jpg",
            createdAt: "2026-04-03T00:00:00.000Z",
            updatedAt: "2026-04-03T00:00:00.000Z",
        });

        await expect(
            CommentsService.updateComment("comment-1", "user-2", {
                text: "Atualizado",
                rating: 4,
                imageUrl: "https://example.com/comment-2.jpg",
            })
        ).rejects.toThrow("Você não tem permissão para editar este comentário.");
    });

    it("deve atualizar comentário do autor", async () => {
        mockCommentsRepository.findById.mockResolvedValueOnce({
            id: "comment-1",
            authorId: "user-1",
            recipeId: "recipe-1",
            text: "Original",
            rating: 3,
            imageUrl: "https://example.com/comment.jpg",
            createdAt: "2026-04-03T00:00:00.000Z",
            updatedAt: "2026-04-03T00:00:00.000Z",
        });

        mockCommentsRepository.updateById.mockResolvedValueOnce(undefined);

        const result = await CommentsService.updateComment("comment-1", "user-1", {
            text: "Atualizado",
            rating: 4,
            imageUrl: "https://example.com/comment-2.jpg",
        });

        expect(mockCommentsRepository.updateById).toHaveBeenCalledWith(
            "comment-1",
            expect.objectContaining({ text: "Atualizado", rating: 4, imageUrl: "https://example.com/comment-2.jpg" })
        );
        expect(result.text).toBe("Atualizado");
    });

    it("deve excluir comentário do autor", async () => {
        mockCommentsRepository.findById.mockResolvedValueOnce({
            id: "comment-1",
            authorId: "user-1",
            recipeId: "recipe-1",
            text: "Original",
            rating: 3,
            imageUrl: "https://example.com/comment.jpg",
            createdAt: "2026-04-03T00:00:00.000Z",
            updatedAt: "2026-04-03T00:00:00.000Z",
        });

        mockCommentsRepository.deleteById.mockResolvedValueOnce(undefined);

        await CommentsService.deleteComment("comment-1", "user-1");

        expect(mockCommentsRepository.deleteById).toHaveBeenCalledWith("comment-1");
    });
});