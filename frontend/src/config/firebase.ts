import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

function getRequiredEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Variável de ambiente ausente: ${name}`);
	}

	return value;
}

const firebaseConfig = {
	apiKey: getRequiredEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
	authDomain: getRequiredEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
	projectId: getRequiredEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
	storageBucket: getRequiredEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
	messagingSenderId: getRequiredEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
	appId: getRequiredEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);
