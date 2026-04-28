import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import Constants from "expo-constants";

function getEnv(name: string): string | undefined {
	const fromProcess = process.env[name];
	const fromExtra = (Constants.expoConfig && (Constants.expoConfig as any).extra && (Constants.expoConfig as any).extra[name]) || undefined;
	const value = fromProcess ?? fromExtra;
	if (!value) {
		console.warn(`Variável de ambiente ausente (fallback vazio): ${name}`);
	}
	return value;
}

const firebaseConfig = {
	apiKey: getEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
	authDomain: getEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
	projectId: getEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
	storageBucket: getEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
	messagingSenderId: getEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
	appId: getEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
};

const hasRequiredFirebase = !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

let firebaseApp;
if (hasRequiredFirebase) {
	try {
		firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig as any);
	} catch (e) {
		console.warn("Falha ao inicializar Firebase:", e);
	}
} else {
	console.warn("Firebase não inicializado — chaves ausentes. Defina EXPO_PUBLIC_FIREBASE_* no build (EAS ou app.json.extra).");
}

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : undefined;
