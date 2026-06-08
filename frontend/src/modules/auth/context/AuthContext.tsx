import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AuthUser,
  FamilyProfile,
  FirebaseLoginPayload,
  createFamilyProfile as createFamilyProfileRequest,
  updateFamilyProfile as updateFamilyProfileRequest,
  deleteFamilyProfile as deleteFamilyProfileRequest,
  getProfileWithProfiles as getProfileRequest,
  LoginPayload,
  RegisterPayload,
  login as loginRequest,
  loginWithFirebase as loginWithFirebaseRequest,
  logout as logoutRequest,
  register as registerRequest,
  updateProfile as updateProfileRequest,
  UpdateProfilePayload,
} from "@/src/services/authService";
import { setAuthToken, setProfileId } from "@/src/services/api";
import {
  clearSessionStorage,
  getAccessToken,
  getActiveProfileId,
  getStoredUser,
  clearActiveProfileId,
  saveAccessToken,
  saveActiveProfileId,
  saveStoredUser,
} from "@/src/services/tokenStorage";
import { saveBiometricCredentials, getBiometricCredentials } from "@/src/services/tokenStorage";
import * as LocalAuthentication from "expo-local-authentication";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  profiles: FamilyProfile[];
  activeProfileId: string | null;
  signIn: (payload: LoginPayload) => Promise<void>;
  signInWithGoogle: (payload: FirebaseLoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthUser>;
  createProfile: (payload: { name?: string; avatarDataUrl?: string | null }) => Promise<FamilyProfile>;
  updateFamilyProfile: (profileId: string, payload: { name?: string; avatarDataUrl?: string | null }) => Promise<FamilyProfile>;
  deleteFamilyProfile: (profileId: string) => Promise<void>;
  setActiveProfile: (profileId: string) => Promise<void>;
  signInWithBiometrics: () => Promise<void>;
  hasBiometricCredentials: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [hasBiometricCredentials, setHasBiometricCredentials] = useState(false);

  const syncProfileContext = useCallback(async (nextProfiles: FamilyProfile[], fallbackProfileId: string | null = null) => {
    const storedActiveProfileId = await getActiveProfileId();
    const candidateProfileId = storedActiveProfileId ?? fallbackProfileId;
    const resolvedProfileId =
      candidateProfileId && nextProfiles.some((profile) => profile.id === candidateProfileId)
        ? candidateProfileId
        : nextProfiles[0]?.id ?? fallbackProfileId;

    setProfiles(nextProfiles);
    setActiveProfileId(resolvedProfileId ?? null);
    setProfileId(resolvedProfileId ?? null);

    if (resolvedProfileId) {
      await saveActiveProfileId(resolvedProfileId);
    } else {
      await clearActiveProfileId();
    }

    return resolvedProfileId ?? null;
  }, []);

  useEffect(() => {
    async function hydrateSession() {
      try {
        const [storedToken, storedUser] = await Promise.all([getAccessToken(), getStoredUser()]);

        if (storedToken) {
          setAuthToken(storedToken);
          setToken(storedToken);

          if (storedUser) {
            setUser(storedUser);
          }

          try {
            const freshSession = await getProfileRequest();
            setUser(freshSession.user);
            await saveStoredUser(freshSession.user);
            await syncProfileContext(freshSession.profiles ?? [], freshSession.user.id);
          } catch {
            await syncProfileContext([], storedUser?.id ?? null);
          }
          return;
        }

        if (storedUser) {
          setUser(storedUser);
          await syncProfileContext([], storedUser.id);
        }
      } finally {
        setIsLoadingSession(false);
      }
    }

    hydrateSession();
  }, [syncProfileContext]);

  const signIn = useCallback(async (payload: LoginPayload) => {
    const { token: receivedToken, user: receivedUser } = await loginRequest(payload);

    await Promise.all([saveAccessToken(receivedToken), saveStoredUser(receivedUser)]);
    await saveBiometricCredentials(payload.email, payload.password);
    setHasBiometricCredentials(true);

    setAuthToken(receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);

    try {
      const session = await getProfileRequest();
      setUser(session.user);
      await saveStoredUser(session.user);
      await syncProfileContext(session.profiles ?? [], session.user.id);
    } catch {
      await syncProfileContext([], receivedUser.id);
    }
  }, [syncProfileContext]);

  const signInWithGoogle = useCallback(async (payload: FirebaseLoginPayload) => {
    const { token: receivedToken, user: receivedUser } = await loginWithFirebaseRequest(payload);

    await Promise.all([saveAccessToken(receivedToken), saveStoredUser(receivedUser)]);

    setAuthToken(receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);

    try {
      const session = await getProfileRequest();
      setUser(session.user);
      await saveStoredUser(session.user);
      await syncProfileContext(session.profiles ?? [], session.user.id);
    } catch {
      await syncProfileContext([], receivedUser.id);
    }
  }, [syncProfileContext]);

  const signUp = useCallback(async (payload: RegisterPayload) => {
    return registerRequest(payload);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
    }

    await clearSessionStorage();

    setAuthToken(null);
    setProfileId(null);
    setToken(null);
    setUser(null);
    setProfiles([]);
    setActiveProfileId(null);
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updatedUser = await updateProfileRequest(payload);

    await saveStoredUser(updatedUser);
    setUser(updatedUser);

    return updatedUser;
  }, []);

  const createProfile = useCallback(async (payload: { name?: string; avatarDataUrl?: string | null }) => {
    const result = await createFamilyProfileRequest(payload);

    setProfiles(result.profiles);
    setActiveProfileId(result.profile.id);
    setProfileId(result.profile.id);
    await saveActiveProfileId(result.profile.id);

    return result.profile;
  }, []);

  const updateFamilyProfile = useCallback(async (profileId: string, payload: { name?: string; avatarDataUrl?: string | null }) => {
    const result = await updateFamilyProfileRequest(profileId, payload);

    setProfiles(result.profiles);

    if (result.profile.id === activeProfileId) {
      setActiveProfileId(result.profile.id);
      setProfileId(result.profile.id);
      await saveActiveProfileId(result.profile.id);
    }

    return result.profile;
  }, [activeProfileId]);

  const deleteFamilyProfile = useCallback(async (profileId: string) => {
    const result = await deleteFamilyProfileRequest(profileId);
    setProfiles(result.profiles);

    if (activeProfileId === result.deletedProfileId) {
      const fallbackProfileId = result.profiles[0]?.id ?? null;
      setActiveProfileId(fallbackProfileId);
      setProfileId(fallbackProfileId);

      if (fallbackProfileId) {
        await saveActiveProfileId(fallbackProfileId);
      } else {
        await clearActiveProfileId();
      }
    }
  }, [activeProfileId]);

  const setActiveProfile = useCallback(async (profileId: string) => {
    setActiveProfileId(profileId);
    setProfileId(profileId);
    await saveActiveProfileId(profileId);
  }, []);

  useEffect(() => {
    getBiometricCredentials().then((creds) => {
      setHasBiometricCredentials(Boolean(creds));
    });
  }, []);

  const signInWithBiometrics = useCallback(async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) throw new Error("Dispositivo não suporta biometria.");

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) throw new Error("Nenhuma biometria cadastrada no dispositivo.");

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Use sua impressão digital para entrar",
      cancelLabel: "Cancelar",
      disableDeviceFallback: true,
    });

    if (!result.success) throw new Error("Autenticação biométrica cancelada.");

    const credentials = await getBiometricCredentials();
    if (!credentials) throw new Error("Nenhuma credencial salva. Faça login com e-mail primeiro.");

    await signIn(credentials);
  }, [signIn]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoadingSession,
      profiles,
      activeProfileId,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      updateProfile,
      createProfile,
      updateFamilyProfile,
      deleteFamilyProfile,
      setActiveProfile,
      signInWithBiometrics,
      hasBiometricCredentials,
    }),
    [activeProfileId, createProfile, deleteFamilyProfile, isLoadingSession, profiles, setActiveProfile, signIn, signInWithGoogle, signOut, signUp, token, updateFamilyProfile, updateProfile, user, signInWithBiometrics, hasBiometricCredentials],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro do AuthProvider.");
  }

  return context;
}
