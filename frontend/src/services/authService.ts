import api from "@/src/services/api";
import { getFriendlyHttpErrorMessage } from "@/src/services/httpError";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarDataUrl?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type FamilyProfile = {
  id: string;
  userId: string;
  name: string;
  avatarDataUrl?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type FirebaseLoginPayload = {
  firebaseIdToken: string;
};

type RegisterResponse = {
  message: string;
  user: AuthUser;
};

type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

type VerifyEmailPayload = {
  email: string;
  token: string;
};

type ResendVerificationPayload = {
  email: string;
};

type VerifyEmailResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
};

type ResendVerificationResponse = {
  message: string;
};

type LogoutResponse = {
  message: string;
};

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  avatarDataUrl?: string | null;
  currentPassword?: string;
  newPassword?: string;
};

export type UpdateFamilyProfilePayload = {
  name?: string;
  avatarDataUrl?: string | null;
};

type UpdateProfileResponse = {
  message: string;
  user: AuthUser;
};

type GetProfileResponse = {
  user: AuthUser;
  profiles: FamilyProfile[];
};

type CreateProfileResponse = {
  message: string;
  profile: FamilyProfile;
  profiles: FamilyProfile[];
};

type UpdateFamilyProfileResponse = {
  message: string;
  profile: FamilyProfile;
  profiles: FamilyProfile[];
};

type DeleteFamilyProfileResponse = {
  message: string;
  deletedProfileId: string;
  profiles: FamilyProfile[];
};

type SocialSummaryResponse = {
  followersCount: number;
  followingCount: number;
};

type FollowStatusResponse = {
  isFollowing: boolean;
};

type ToggleFollowResponse = {
  message: string;
  isFollowing: boolean;
};

export type PublicAuthorProfile = {
  id: string;
  name: string;
  avatarDataUrl?: string | null;
};

export type SocialConnectionUser = PublicAuthorProfile;

export type SocialConnectionItem = {
  user: SocialConnectionUser;
  followedAt: string;
  isFollowingBack: boolean;
};

type GetPublicProfileResponse = {
  user: PublicAuthorProfile;
};

type GetSocialConnectionsResponse = {
  items: SocialConnectionItem[];
};

function getErrorMessage(error: unknown): string {
  return getFriendlyHttpErrorMessage(error, "Não foi possível completar a operação de autenticação.");
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  try {
    const { data } = await api.post<RegisterResponse>("/auth/register", payload);
    return data.user;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function login(payload: LoginPayload): Promise<{ token: string; user: AuthUser }> {
  try {
    const { data } = await api.post<LoginResponse>("/auth/login", payload);
    return {
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function loginWithFirebase(payload: FirebaseLoginPayload): Promise<{ token: string; user: AuthUser }> {
  try {
    const { data } = await api.post<LoginResponse>("/auth/firebase-login", payload);
    return {
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function verifyEmail(payload: VerifyEmailPayload): Promise<VerifyEmailResponse["user"]> {
  try {
    const { data } = await api.post<VerifyEmailResponse>("/auth/verify-email", payload);
    return data.user;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function resendVerification(payload: ResendVerificationPayload): Promise<string> {
  try {
    const { data } = await api.post<ResendVerificationResponse>("/auth/resend-verification", payload);
    return data.message;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function logout(): Promise<string> {
  try {
    const { data } = await api.post<LogoutResponse>("/auth/logout");
    return data.message;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  try {
    const { data } = await api.put<UpdateProfileResponse>("/user", payload);
    return data.user;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getProfile(): Promise<AuthUser> {
  try {
    const { data } = await api.get<GetProfileResponse>("/user");
    return data.user;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getProfileWithProfiles(): Promise<GetProfileResponse> {
  try {
    const { data } = await api.get<GetProfileResponse>("/user");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createFamilyProfile(payload: { name?: string; avatarDataUrl?: string | null }): Promise<CreateProfileResponse> {
  try {
    const { data } = await api.post<CreateProfileResponse>("/user/profiles", payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateFamilyProfile(profileId: string, payload: UpdateFamilyProfilePayload): Promise<UpdateFamilyProfileResponse> {
  try {
    const { data } = await api.put<UpdateFamilyProfileResponse>(`/user/profiles/${profileId}`, payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteFamilyProfile(profileId: string): Promise<DeleteFamilyProfileResponse> {
  try {
    const { data } = await api.delete<DeleteFamilyProfileResponse>(`/user/profiles/${profileId}`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getMySocialSummary(): Promise<SocialSummaryResponse> {
  try {
    const { data } = await api.get<SocialSummaryResponse>("/user/social/me");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getMyFollowers(): Promise<SocialConnectionItem[]> {
  try {
    const { data } = await api.get<GetSocialConnectionsResponse>("/user/social/followers");
    return data.items;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getMyFollowing(): Promise<SocialConnectionItem[]> {
  try {
    const { data } = await api.get<GetSocialConnectionsResponse>("/user/social/following");
    return data.items;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getFollowStatus(userId: string): Promise<FollowStatusResponse> {
  try {
    const { data } = await api.get<FollowStatusResponse>(`/user/social/${userId}/status`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function toggleFollow(userId: string): Promise<ToggleFollowResponse> {
  try {
    const { data } = await api.post<ToggleFollowResponse>(`/user/social/${userId}/toggle`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getPublicUserProfile(userId: string): Promise<PublicAuthorProfile> {
  try {
    const { data } = await api.get<GetPublicProfileResponse>(`/user/public/${userId}`);
    return data.user;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
