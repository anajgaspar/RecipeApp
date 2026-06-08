import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "auth.accessToken";
const USER_KEY = "auth.user";
const ACTIVE_PROFILE_KEY = "auth.activeProfileId";
const SOCIAL_NOTIFICATIONS_SEEN_AT_KEY = "social.notificationsSeenAt";
const BIOMETRIC_EMAIL_KEY = "biometric_email";
const BIOMETRIC_PASSWORD_KEY = "biometric_password";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  avatarDataUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type PersistedUser = StoredUser;

export async function saveAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function clearAccessToken(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function saveStoredUser(user: StoredUser): Promise<void> {
  const persistedUser: PersistedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarDataUrl: user.avatarDataUrl ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(persistedUser));
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const rawValue = await SecureStore.getItemAsync(USER_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredUser;
  } catch {
    return null;
  }
}

export async function clearStoredUser(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function saveActiveProfileId(profileId: string): Promise<void> {
  await SecureStore.setItemAsync(ACTIVE_PROFILE_KEY, profileId);
}

export async function getActiveProfileId(): Promise<string | null> {
  return SecureStore.getItemAsync(ACTIVE_PROFILE_KEY);
}

export async function clearActiveProfileId(): Promise<void> {
  await SecureStore.deleteItemAsync(ACTIVE_PROFILE_KEY);
}

export async function saveSocialNotificationsSeenAt(seenAtIso: string): Promise<void> {
  await SecureStore.setItemAsync(SOCIAL_NOTIFICATIONS_SEEN_AT_KEY, seenAtIso);
}

export async function getSocialNotificationsSeenAt(): Promise<string | null> {
  return SecureStore.getItemAsync(SOCIAL_NOTIFICATIONS_SEEN_AT_KEY);
}

export async function clearSocialNotificationsSeenAt(): Promise<void> {
  await SecureStore.deleteItemAsync(SOCIAL_NOTIFICATIONS_SEEN_AT_KEY);
}

export async function clearSessionStorage(): Promise<void> {
  await Promise.all([clearAccessToken(), clearStoredUser(), clearActiveProfileId(), clearSocialNotificationsSeenAt()]);
}

export async function saveBiometricCredentials(email: string, password: string): Promise<void> {
    await SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, email);
    await SecureStore.setItemAsync(BIOMETRIC_PASSWORD_KEY, password);
}

export async function getBiometricCredentials(): Promise<{ email: string; password: string } | null> {
    const email = await SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY);
    const password = await SecureStore.getItemAsync(BIOMETRIC_PASSWORD_KEY);
    if (email && password) return { email, password };
    return null;
}

export async function clearBiometricCredentials(): Promise<void> {
    await SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_PASSWORD_KEY);
}
