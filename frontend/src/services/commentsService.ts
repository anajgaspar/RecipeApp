import api from "@/src/services/api";
import { getFriendlyHttpErrorMessage } from "@/src/services/httpError";
import { ApiEntityResponse, ApiMessageResponse } from "./apiTypes";

const AUTH_API_URL = process.env.EXPO_PUBLIC_API_AUTH_URL;
const RECIPE_API_URL =
    process.env.EXPO_PUBLIC_API_RECIPE_URL ??
    (AUTH_API_URL ? AUTH_API_URL.replace(":3001", ":3002") : "http://localhost:3002");

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
        await api.post<AddCommentResponse>(`${RECIPE_API_URL}/api/comments`, payload);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function getRecipeComments(recipeId: string): Promise<Comment[]> {
    try {
        const { data } = await api.get<GetCommentsResponse>(`${RECIPE_API_URL}/api/comments/${recipeId}`);
        return data.comments;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function updateComment(commentId: string, payload: AddCommentPayload): Promise<void> {
    try {
        await api.put<UpdateCommentResponse>(`${RECIPE_API_URL}/api/comments/${commentId}`, payload);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export async function deleteComment(commentId: string): Promise<void> {
    try {
        await api.delete<DeleteCommentResponse>(`${RECIPE_API_URL}/api/comments/${commentId}`);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}