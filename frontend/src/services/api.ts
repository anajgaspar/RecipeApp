import axios from "axios";

const AUTH_URL = process.env.EXPO_PUBLIC_API_AUTH_URL ?? "http://localhost:3001";

const api = axios.create({
	baseURL: AUTH_URL,
	timeout: 10000,
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

export default api;