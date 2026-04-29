import { z } from "zod";

export const CommentContentSchema = z.object({
    text: z.string().trim().min(1),
    rating: z.number().int().min(0).max(5),
    imageUrl: z.string().url().optional(),
});

export const AddCommentSchema = CommentContentSchema.extend({
    recipeId: z.string().min(1),
});

export const CommentsSchema = AddCommentSchema.extend({
    id: z.string(),
    authorId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const UpdateCommentSchema = CommentContentSchema;

export const RecipeCommentsParamsSchema = z.object({
    recipeId: z.string().min(1),
});

export const CommentIdParamsSchema = z.object({
    commentId: z.string().min(1),
});