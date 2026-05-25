import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_AUTH_PORT = 3001;
const DEFAULT_RECIPE_PORT = 3002;

function getExpoHost(): string | null {
    const expoConfigHost = Constants.expoConfig?.hostUri;
    const expoGoDebuggerHost = (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;
    const hostUri = expoConfigHost || expoGoDebuggerHost;

    if (!hostUri) {
        return null;
    }

    return hostUri.split(":")[0] || null;
}

function resolveAuthUrl(): string {
    const envUrl = process.env.EXPO_PUBLIC_API_AUTH_URL?.trim();

    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("172.") && !envUrl.includes("192.")) {
        return `${envUrl}/auth`;
    }

    const expoHost = getExpoHost();
    if (expoHost) {
        return `http://${expoHost}:${DEFAULT_AUTH_PORT}/auth`;
    }

    if (Platform.OS === "android") {
        if (envUrl?.includes("localhost") && Constants.isDevice) {
            console.warn(
                "EXPO_PUBLIC_API_AUTH_URL aponta para localhost no Android físico. Use o IP da sua máquina.",
            );
        }

        if (!envUrl) {
            return `http://10.0.2.2:${DEFAULT_AUTH_PORT}/auth`;
        }
    }

    return envUrl ? `${envUrl}/auth` : `http://localhost:${DEFAULT_AUTH_PORT}/auth`;
}

function resolveRecipeUrl(): string {
    const envUrl = process.env.EXPO_PUBLIC_API_RECIPE_URL?.trim();

    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("172.") && !envUrl.includes("192.")) {
        return `${envUrl}/recipes`;
    }

    const expoHost = getExpoHost();
    if (expoHost) {
        return `http://${expoHost}:${DEFAULT_RECIPE_PORT}/recipes`;
    }

    if (Platform.OS === "android") {
        if (!envUrl) {
            return `http://10.0.2.2:${DEFAULT_RECIPE_PORT}/recipes`;
        }
    }

    return envUrl ? `${envUrl}/recipes` : `http://localhost:${DEFAULT_RECIPE_PORT}/recipes`;
}

const AUTH_URL = resolveAuthUrl();
const RECIPE_URL = resolveRecipeUrl();

if (__DEV__) {
    console.log("Mapeamento de Rotas - Auth:", AUTH_URL);
    console.log("Mapeamento de Rotas - Recipes:", RECIPE_URL);
}

export const apiAuth = axios.create({
    baseURL: AUTH_URL,
    timeout: 25000,
    headers: {
        "Content-Type": "application/json",
    },
});

export const apiRecipe = axios.create({
    baseURL: RECIPE_URL,
    timeout: 25000,
    headers: {
        "Content-Type": "application/json",
    },
});

export function setAuthToken(token: string | null): void {
    if (token) {
        apiAuth.defaults.headers.common.Authorization = `Bearer ${token}`;
        apiRecipe.defaults.headers.common.Authorization = `Bearer ${token}`;
        return;
    }

    delete apiAuth.defaults.headers.common.Authorization;
    delete apiRecipe.defaults.headers.common.Authorization;
}

export function setProfileId(profileId: string | null): void {
    if (profileId) {
        apiAuth.defaults.headers.common["X-Profile-Id"] = profileId;
        apiRecipe.defaults.headers.common["X-Profile-Id"] = profileId;
        return;
    }

    delete apiAuth.defaults.headers.common["X-Profile-Id"];
    delete apiRecipe.defaults.headers.common["X-Profile-Id"];
}

const api = apiAuth;
export default api;