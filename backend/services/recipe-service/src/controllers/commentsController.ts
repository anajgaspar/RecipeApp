import { Request, Response } from "express";
import { getUserIdFromRequest } from "../utils/requestContext";
import { AddCommentSchema, CommentIdParamsSchema, RecipeCommentsParamsSchema, UpdateCommentSchema } from "../schemas/commentsSchema";
import { CommentsService } from "../services/commentsService";

export const CommentsController = {
    async addComment(req: Request, res: Response) {
        try {
            const authorId = getUserIdFromRequest(req);
            if (!authorId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const validated = AddCommentSchema.safeParse(req.body);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: validated.error.issues,
                });
            }

            const comment = await CommentsService.addComment(authorId, validated.data.recipeId, validated.data);
            return res.status(201).json({
                message: "Comentário criado com sucesso.",
                comment,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async getRecipeComments(req: Request, res: Response) {
        try {
            const validated = RecipeCommentsParamsSchema.safeParse(req.params);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Parâmetro inválido",
                    details: validated.error.issues,
                });
            }

            const comments = await CommentsService.getRecipeComments(validated.data.recipeId);
            return res.status(200).json({ comments });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async updateComment(req: Request, res: Response) {
        try {
            const validatedParams = CommentIdParamsSchema.safeParse(req.params);
            if (!validatedParams.success) {
                return res.status(400).json({
                    error: "Parâmetro inválido",
                    details: validatedParams.error.issues,
                });
            }

            const authorId = getUserIdFromRequest(req);
            if (!authorId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const validatedBody = UpdateCommentSchema.safeParse(req.body);
            if (!validatedBody.success) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: validatedBody.error.issues,
                });
            }

            const comment = await CommentsService.updateComment(validatedParams.data.commentId, authorId, validatedBody.data);
            return res.status(200).json({
                message: "Comentário atualizado com sucesso.",
                comment,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    },

    async deleteComment(req: Request, res: Response) {
        try {
            const validatedParams = CommentIdParamsSchema.safeParse(req.params);
            if (!validatedParams.success) {
                return res.status(400).json({
                    error: "Parâmetro inválido",
                    details: validatedParams.error.issues,
                });
            }

            const authorId = getUserIdFromRequest(req);
            if (!authorId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            await CommentsService.deleteComment(validatedParams.data.commentId, authorId);
            return res.status(200).json({ message: "Comentário excluído com sucesso." });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            return res.status(500).json({ error: message });
        }
    }
};