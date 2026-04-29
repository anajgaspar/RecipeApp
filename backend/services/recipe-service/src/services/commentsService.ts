import z from "zod";
import { AddCommentSchema, CommentsSchema, UpdateCommentSchema } from "../schemas/commentsSchema";
import { CommentsRepository } from "../repositories/commentsRepository";

type CommentsDocument = z.infer<typeof CommentsSchema>;
type AddCommentInput = z.infer<typeof AddCommentSchema>;
type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;

export const CommentsService = {
    async addComment(authorId: string, recipeId: string, data: AddCommentInput) {
        const { recipeId: _recipeIdFromBody, ...commentData } = data;

        const addedComment = await CommentsRepository.add({
            authorId,
            recipeId,
            ...commentData,
        });

        if (!addedComment) {
            throw new Error("Falha ao adicionar comentário.");
        }

        return addedComment;
    },

    async getRecipeComments(recipeId: string) {
        return CommentsRepository.findByRecipe(recipeId);
    },

    async updateComment(id: string, authorId: string, data: UpdateCommentInput) {
        const existingComment = await CommentsRepository.findById(id);

        if (!existingComment) {
            throw new Error("Comentário não encontrado.");
        }

        if (existingComment.authorId !== authorId) {
            throw new Error("Você não tem permissão para editar este comentário.");
        }

        const updatedComment: CommentsDocument = {
            ...existingComment,
            ...data,
            authorId,
            updatedAt: new Date().toISOString(),
        };

        await CommentsRepository.updateById(id, {
            text: updatedComment.text,
            rating: updatedComment.rating,
            ...(updatedComment.imageUrl ? { imageUrl: updatedComment.imageUrl } : {}),
        });
        return updatedComment;
    },

    async deleteComment(id: string, authorId: string) {
        const existingComment = await CommentsRepository.findById(id);

        if (!existingComment) {
            throw new Error("Comentário não encontrado.");
        }

        if (existingComment.authorId !== authorId) {
            throw new Error("Você não tem permissão para excluir este comentário.");
        }

        await CommentsRepository.deleteById(id);
    }
};