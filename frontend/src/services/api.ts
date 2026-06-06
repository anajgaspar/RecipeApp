import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_AUTH_PORT = 3001;
const DEFAULT_RECIPE_PORT = 3002;

function getExpoHost(): string | null {
    const expoConfigHost = Constants.expoConfig?.hostUri;
    const expoGoDebuggerHost = (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;
    const hostUri = expoConfigHost || expoGoDebuggerHost;

    if (!hostUri) return null;
    return hostUri.split(":")[0] || null;
}

function resolveAuthUrl(): string {
    const envUrl = process.env.EXPO_PUBLIC_API_AUTH_URL?.trim();

    if (envUrl && (envUrl.startsWith("https://") || envUrl.startsWith("http://") && !envUrl.includes("localhost"))) {
        return envUrl;
    }

    const expoHost = getExpoHost();
    if (expoHost) return `http://${expoHost}:${DEFAULT_AUTH_PORT}`;

    if (Platform.OS === "android") {
        return `http://10.0.2.2:${DEFAULT_AUTH_PORT}`;
    }

    return `http://localhost:${DEFAULT_AUTH_PORT}`;
}

function resolveRecipeUrl(): string {
    const envUrl = process.env.EXPO_PUBLIC_API_RECIPE_URL?.trim();

    if (envUrl && (envUrl.startsWith("https://") || envUrl.startsWith("http://") && !envUrl.includes("localhost"))) {
        return envUrl;
    }

    const expoHost = getExpoHost();
    if (expoHost) return `http://${expoHost}:${DEFAULT_RECIPE_PORT}`;

    if (Platform.OS === "android") {
        return `http://10.0.2.2:${DEFAULT_RECIPE_PORT}`;
    }

    return `http://localhost:${DEFAULT_RECIPE_PORT}`;
}

export const apiAuth = axios.create({
    baseURL: resolveAuthUrl(),
    timeout: 25000,
    headers: { "Content-Type": "application/json" },
});

export const apiRecipe = axios.create({
    baseURL: resolveRecipeUrl(),
    timeout: 25000,
    headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token: string | null): void {
    if (token) {
        apiAuth.defaults.headers.common.Authorization = `Bearer ${token}`;
        apiRecipe.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete apiAuth.defaults.headers.common.Authorization;
        delete apiRecipe.defaults.headers.common.Authorization;
    }
}

export function setProfileId(profileId: string | null): void {
    if (profileId) {
        apiAuth.defaults.headers.common["X-Profile-Id"] = profileId;
        apiRecipe.defaults.headers.common["X-Profile-Id"] = profileId;
    } else {
        delete apiAuth.defaults.headers.common["X-Profile-Id"];
        delete apiRecipe.defaults.headers.common["X-Profile-Id"];
    }
}

const api = apiAuth;
export default api;