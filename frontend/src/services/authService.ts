import { isAxiosError } from "axios";
import api from "@/src/services/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarDataUrl?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
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

type UpdateProfileResponse = {
  message: string;
  user: AuthUser;
};

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const responseMessage =
      (error.response?.data as { error?: string } | undefined)?.error ??
      (error.response?.data as { message?: string } | undefined)?.message;

    if (responseMessage) {
      return responseMessage;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível completar a operação.";
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
