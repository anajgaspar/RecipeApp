import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_AUTH_PORT = 3001;

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

	if (envUrl && !envUrl.includes("localhost")) {
		return envUrl;
	}

	const expoHost = getExpoHost();
	if (expoHost) {
		return `http://${expoHost}:${DEFAULT_AUTH_PORT}`;
	}

	if (Platform.OS === "android") {
		if (envUrl?.includes("localhost") && Constants.isDevice) {
			console.warn(
				"EXPO_PUBLIC_API_AUTH_URL aponta para localhost no Android físico. Use o IP da sua máquina (ex: http://192.168.x.x:3001).",
			);
		}

		if (!envUrl) {
			return "http://10.0.2.2:3001";
		}
	}

	return envUrl || "http://localhost:3001";
}

const AUTH_URL = resolveAuthUrl();

const api = axios.create({
	baseURL: AUTH_URL,
	timeout: 25000,
	headers: {
		"Content-Type": "application/json",
	},
});

export function setAuthToken(token: string | null): void {
	if (token) {
		api.defaults.headers.common.Authorization = `Bearer ${token}`;
		return;
	}

	delete api.defaults.headers.common.Authorization;
}

export function setProfileId(profileId: string | null): void {
	if (profileId) {
		api.defaults.headers.common["X-Profile-Id"] = profileId;
		return;
	}

	delete api.defaults.headers.common["X-Profile-Id"];
}

export default api;