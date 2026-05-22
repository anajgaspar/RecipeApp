import crypto from "crypto";
import { db } from "../config/firebase";
import { UserProfileSchema } from "../schemas/userProfileSchema";
import { z } from "zod";

type UserProfileDocument = z.infer<typeof UserProfileSchema>;

type CreateUserProfileParams = {
    userId: string;
    name: string;
    avatarDataUrl?: string | null;
    isDefault?: boolean;
    id?: string;
};

type UpdateUserProfileParams = {
    name?: string;
    avatarDataUrl?: string | null;
};

const userProfilesCollection = "user_profiles";

function buildProfileDocument(params: CreateUserProfileParams): UserProfileDocument {
    const timestamp = new Date().toISOString();

    return {
        id: params.id ?? (params.isDefault ? params.userId : crypto.randomUUID()),
        userId: params.userId,
        name: params.name,
        avatarDataUrl: params.avatarDataUrl ?? null,
        isDefault: params.isDefault ?? false,
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}

export const UserProfileRepository = {
    async findById(id: string): Promise<UserProfileDocument | null> {
        const document = await db.collection(userProfilesCollection).doc(id).get();
        if (!document.exists) {
            return null;
        }

        const parsedProfile = UserProfileSchema.safeParse(document.data());
        return parsedProfile.success ? parsedProfile.data : null;
    },

    async listByUserId(userId: string): Promise<UserProfileDocument[]> {
        const documents = await db
            .collection(userProfilesCollection)
            .where("userId", "==", userId)
            .get();

        return documents.docs
            .map((doc) => UserProfileSchema.safeParse(doc.data()))
            .filter((result) => result.success)
            .map((result) => result.data)
            .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    },

    async ensureDefaultProfile(user: { id: string; name: string; avatarDataUrl?: string | null; }): Promise<UserProfileDocument> {
        const existingProfiles = await this.listByUserId(user.id);
        const defaultProfile = existingProfiles.find((profile) => profile.isDefault);

        if (defaultProfile) {
            return defaultProfile;
        }

        const document = buildProfileDocument({
            userId: user.id,
            name: user.name,
            avatarDataUrl: user.avatarDataUrl ?? null,
            isDefault: true,
            id: user.id,
        });

        await db.collection(userProfilesCollection).doc(document.id).set(document);
        return document;
    },

    async create(params: CreateUserProfileParams): Promise<UserProfileDocument> {
        const document = buildProfileDocument(params);

        await db.collection(userProfilesCollection).doc(document.id).set(document);
        return document;
    },

    async update(id: string, data: UpdateUserProfileParams): Promise<UserProfileDocument | null> {
        const existingProfile = await this.findById(id);

        if (!existingProfile) {
            return null;
        }

        const updatedProfile: UserProfileDocument = {
            ...existingProfile,
            name: data.name?.trim() || existingProfile.name,
            avatarDataUrl: data.avatarDataUrl === undefined ? existingProfile.avatarDataUrl ?? null : data.avatarDataUrl,
            updatedAt: new Date().toISOString(),
        };

        await db.collection(userProfilesCollection).doc(id).set(updatedProfile);
        return updatedProfile;
    },

    async deleteById(id: string): Promise<void> {
        await db.collection(userProfilesCollection).doc(id).delete();
    },
};