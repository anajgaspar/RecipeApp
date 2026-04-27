import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AuthUser,
  FirebaseLoginPayload,
  getProfile as getProfileRequest,
  LoginPayload,
  RegisterPayload,
  login as loginRequest,
  loginWithFirebase as loginWithFirebaseRequest,
  logout as logoutRequest,
  register as registerRequest,
  updateProfile as updateProfileRequest,
  UpdateProfilePayload,
} from "@/src/services/authService";
import { setAuthToken } from "@/src/services/api";
import {
  clearSessionStorage,
  getAccessToken,
  getStoredUser,
  saveAccessToken,
  saveStoredUser,
} from "@/src/services/tokenStorage";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signInWithGoogle: (payload: FirebaseLoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthUser>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

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
            const freshUser = await getProfileRequest();
            setUser(freshUser);
            await saveStoredUser(freshUser);
          } catch {
          }
          return;
        }

        if (storedUser) {
          setUser(storedUser);
        }
      } finally {
        setIsLoadingSession(false);
      }
    }

    hydrateSession();
  }, []);

  const signIn = useCallback(async (payload: LoginPayload) => {
    const { token: receivedToken, user: receivedUser } = await loginRequest(payload);

    await Promise.all([saveAccessToken(receivedToken), saveStoredUser(receivedUser)]);

    setAuthToken(receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
  }, []);

  const signInWithGoogle = useCallback(async (payload: FirebaseLoginPayload) => {
    const { token: receivedToken, user: receivedUser } = await loginWithFirebaseRequest(payload);

    await Promise.all([saveAccessToken(receivedToken), saveStoredUser(receivedUser)]);

    setAuthToken(receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
  }, []);

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
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updatedUser = await updateProfileRequest(payload);

    await saveStoredUser(updatedUser);
    setUser(updatedUser);

    return updatedUser;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoadingSession,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      updateProfile,
    }),
    [isLoadingSession, signIn, signInWithGoogle, signOut, signUp, token, updateProfile, user],
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
