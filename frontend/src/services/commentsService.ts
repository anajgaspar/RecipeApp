import { apiRecipe } from "@/src/services/api";
import { getFriendlyHttpErrorMessage } from "@/src/services/httpError";
import { ApiEntityResponse, ApiMessageResponse } from "./apiTypes";

export type AddCommentPayload = {
    text: string;
    recipeId: string;
    rating: number;
    imageUrl?: string;
};

export type Comment = {
    id: string;
    authorId: string;
    authorName?: string;
    authorAvatarDataUrl?: string | null;
    recipeId: string;
    text: string;
    rating: number;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
};

type AddCommentResponse = ApiEntityResponse<"comment", Comment>;
type UpdateCommentResponse = ApiEntityResponse<"comment", Comment>;
type DeleteCommentResponse = ApiMessageResponse;
type GetCommentsResponse = {
    comments: Comment[];
};

function getErrorMessage(error: unknown): string {
    return getFriendlyHttpErrorMessage(error, "Não foi possível concluir a operação com comentários.");
}

export async function addComment(payload: AddCommentPayload): Promise<void> {
    try {
        await apiRecipe.post<AddCommentResponse>("/api/comments", payload);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getRecipeComments(recipeId: string): Promise<Comment[]> {
    try {
        const { data } = await apiRecipe.get<GetCommentsResponse>(`/api/comments/${recipeId}`);
        return data.comments;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function updateComment(commentId: string, payload: AddCommentPayload): Promise<void> {
    try {
        await apiRecipe.put<UpdateCommentResponse>(`/api/comments/${commentId}`, payload);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function deleteComment(commentId: string): Promise<void> {
    try {
        await apiRecipe.delete<DeleteCommentResponse>(`/api/comments/${commentId}`);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}