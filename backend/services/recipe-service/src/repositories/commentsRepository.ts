import z from "zod";
import crypto from "crypto";
import { db } from "../config/firebase";
import { CommentsSchema, AddCommentSchema } from "../schemas/commentsSchema";

type CommentsDocument = z.infer<typeof CommentsSchema>;
type AddCommentParams = z.infer<typeof AddCommentSchema> & {
    authorId: string;
};
type UpdateCommentParams = Partial<Omit<CommentsDocument, "id" | "authorId" | "recipeId" | "createdAt">>;

const commentsCollection = "comments";

export const CommentsRepository = {
    async findById(id: string): Promise<CommentsDocument | null> {
        const document = await db.collection(commentsCollection).doc(id).get();
        if (!document.exists) {
            return null;
        }

        const parsedComment = CommentsSchema.safeParse(document.data());
        return parsedComment.success ? parsedComment.data : null;
    },

    async findAll(): Promise<CommentsDocument[]> {
        const documents = await db.collection(commentsCollection).orderBy("createdAt", "desc").get();

        return documents.docs
            .map((doc) => CommentsSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data);
    },

    async findByRecipe(recipeId: string): Promise<CommentsDocument[]> {
        const documents = await db
            .collection(commentsCollection)
            .where("recipeId", "==", recipeId)
            .get();

        return documents.docs
            .map((doc) => CommentsSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data)
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    },

    async add(params: AddCommentParams): Promise<CommentsDocument> {
        const document: CommentsDocument = {
            id: crypto.randomUUID(),
            authorId: params.authorId,
            recipeId: params.recipeId,
            text: params.text,
            rating: params.rating,
            ...(params.imageUrl ? { imageUrl: params.imageUrl } : {}),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await db.collection(commentsCollection).doc(document.id).set(document);
        return document;
    },

    async updateById(id: string, params: UpdateCommentParams): Promise<void> {
        await db.collection(commentsCollection).doc(id).set(
            {
                ...params,
                updatedAt: new Date().toISOString(),
            },
            { merge: true }
        );
    },

    async deleteById(id: string): Promise<void> {
        await db.collection(commentsCollection).doc(id).delete();
    },
}