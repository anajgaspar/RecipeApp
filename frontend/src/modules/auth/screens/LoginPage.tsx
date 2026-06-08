import { useEffect, useState } from "react";
import { Image, View, Text, TextInput, Pressable, ScrollView } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useAuth } from "@/src/modules/auth/context/AuthContext";
import ActionButton from "@/src/components/ActionButton";
import InlineError from "@/src/components/InlineError";
import { firebaseAuth } from "@/src/config/firebase";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

WebBrowser.maybeCompleteAuthSession();

export default function LoginPage({ navigation }: { navigation: any }) {
    const { signIn, signInWithGoogle } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        scopes: ["openid", "profile", "email"],
    });

    useEffect(() => {
        async function handleGoogleAuthResponse() {
            if (response?.type !== "success") {
                if (response?.type === "error") {
                    setErrorMessage("Falha ao autenticar com o Google.");
                }
                return;
            }

            const googleIdToken = response.authentication?.idToken;
            if (!googleIdToken) {
                setErrorMessage("Não foi possível obter o token do Google.");
                return;
            }

            setErrorMessage("");
            setIsGoogleLoading(true);

            try {
                if (!firebaseAuth) {
                    throw new Error("Firebase não inicializado. Verifique as variáveis EXPO_PUBLIC_FIREBASE_*.");
                }

                const credential = GoogleAuthProvider.credential(googleIdToken);
                const credentialResult = await signInWithCredential(firebaseAuth, credential);
                const firebaseIdToken = await credentialResult.user.getIdToken();

                await signInWithGoogle({ firebaseIdToken });
            } catch (error) {
                const message = error instanceof Error ? error.message : "Falha ao entrar com Google.";
                setErrorMessage(message);
            } finally {
                setIsGoogleLoading(false);
            }
        }

        void handleGoogleAuthResponse();
    }, [response, signInWithGoogle]);

    async function handleSignIn() {
        if (!email.trim() || !password.trim()) {
            setErrorMessage("Preencha e-mail e senha.");
            return;
        }

        setErrorMessage("");
        setIsLoading(true);

        try {
            await signIn({
                email: email.trim(),
                password,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha ao entrar.";

            if (message === "Email não verificado") {
                navigation.replace("ConfirmEmail", { email: email.trim() });
                return;
            }

            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <LinearGradient
            colors={["#fff7ed", "#fdfbf7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <Image source={require('@/src/assets/splash-icon.png')} className="w-32 h-32" />
                <View className="w-full max-w-md p-8 flex flex-col gap-8 bg-white rounded-md" >
                    <Text className="font-robotoSemibold text-lg">Bem-vindo de volta!</Text>
                    <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2">
                        <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Email
                        </Text>
                        <TextInput
                            className="w-full text-sm py-1 text-gray-900"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            placeholder="seu@email.com"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                    <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2">
                        <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Senha
                        </Text>
                        <TextInput
                            className="w-full text-sm py-1 text-gray-900"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            placeholder="Insira sua senha"
                            placeholderTextColor="#9ca3af"
                        />
                        <Pressable onPress={() => setShowPassword((current) => !current)} className="absolute right-3 top-3">
                            <FontAwesome6 name={showPassword ? "eye-slash" : "eye"} size={16} color="#9ca3af" />
                        </Pressable>
                    </View>
                    {errorMessage ? <InlineError message={errorMessage} title="Falha ao entrar" /> : null}
                    <ActionButton
                        label="Entrar"
                        loadingLabel="Entrando..."
                        loading={isLoading}
                        onPress={() => void handleSignIn()}
                    />
                    <View className="w-full flex-row items-center gap-3">
                        <View className="flex-1 h-px bg-gray-200" />
                        <Text className="text-xs text-gray-400">OU</Text>
                        <View className="flex-1 h-px bg-gray-200" />
                    </View>
                    <Pressable
                        className="w-full flex flex-row justify-center items-center gap-2 py-3 bg-[#fdfbf7] rounded-md"
                        disabled={isGoogleLoading || !request}
                        onPress={() => void promptAsync()}
                    >
                        <FontAwesome6 name="chrome" size={20} color="black" />
                        <Text className="">{isGoogleLoading ? "Conectando ao Google..." : "Faça login com Google"}</Text>
                    </Pressable>
                    <Pressable className="w-full flex flex-row justify-center items-center gap-2 py-3 bg-[#fdfbf7] rounded-md">
                        <FontAwesome6 name="fingerprint" size={20} color="black" />
                        <Text className="text-center">Use login biométrico</Text>
                    </Pressable>
                    <Pressable onPress={() => navigation.replace('Signup')}>
                        <Text className="self-center">Não tem uma conta? <Text className="text-[#f97316]">Registre-se</Text></Text>
                    </Pressable>
                </View>
            </ScrollView>
        </LinearGradient>
    )
}
