import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
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
  signUp: (payload: RegisterPayload) => Promise<AuthUser>;
  signOut: () => Promise<void>;
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

  async function signIn(payload: LoginPayload) {
    const { token: receivedToken, user: receivedUser } = await loginRequest(payload);

    await Promise.all([saveAccessToken(receivedToken), saveStoredUser(receivedUser)]);

    setAuthToken(receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
  }

  async function signUp(payload: RegisterPayload) {
    return registerRequest(payload);
  }

  async function signOut() {
    try {
      await logoutRequest();
    } catch (_error) {
    }

    await clearSessionStorage();

    setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoadingSession,
      signIn,
      signUp,
      signOut,
    }),
    [isLoadingSession, token, user],
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
