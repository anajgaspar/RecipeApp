import { db } from "../config/firebase";
import { UserSchema } from "../schemas/userSchema";
import { z } from "zod";

type CreateUserParams = {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    emailVerified?: boolean;
    emailVerificationTokenHash?: string | null;
    emailVerificationExpiresAt?: string | null;
};

type UpdateUserParams = Partial<Omit<z.infer<typeof UserSchema>, "id">>;

const users_collection = "users";

export const UserRepository = {
    async findById(id: string): Promise<z.infer<typeof UserSchema> | null> {
        const document = await db.collection(users_collection).doc(id).get();
        if (!document.exists) {
            return null;
        }

        const parsedUser = UserSchema.safeParse(document.data());
        return parsedUser.success ? parsedUser.data : null;
    },

    async findByEmail(email: string): Promise<z.infer<typeof UserSchema> | null> {
        const document = await db.collection(users_collection).where("email", "==", email).limit(1).get();
        if (document.empty) {
            return null;
        }

        const parsedUser = UserSchema.safeParse(document.docs[0].data());
        return parsedUser.success ? parsedUser.data : null;
    },

    async create(params: CreateUserParams): Promise<z.infer<typeof UserSchema> | null> {
        const document: z.infer<typeof UserSchema> = {
            id: params.id,
            name: params.name,
            email: params.email,
            passwordHash: params.passwordHash,
            emailVerified: params.emailVerified ?? false,
            emailVerificationTokenHash: params.emailVerificationTokenHash ?? null,
            emailVerificationExpiresAt: params.emailVerificationExpiresAt ?? null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await db.collection(users_collection).doc(document.id).set(document);
        return document;
    },

    async updateById(id: string, params: UpdateUserParams): Promise<void> {
        await db.collection(users_collection).doc(id).set(params, { merge: true });
    }
};