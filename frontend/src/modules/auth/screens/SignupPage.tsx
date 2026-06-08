import { useState } from "react";
import { Image, View, Text, TextInput, Pressable } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/src/modules/auth/context/AuthContext";
import ActionButton from "@/src/components/ActionButton";
import InlineError from "@/src/components/InlineError";

export default function SignupPage({ navigation }: { navigation: any }) {
    const { signUp } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const MIN_PASSWORD_LENGTH = 8;

    async function handleSignUp() {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setErrorMessage("Preencha nome, e-mail e senha.");
            return;
        }

        if (password.trim().length < MIN_PASSWORD_LENGTH) {
            setErrorMessage(`A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
            return;
        }

        setErrorMessage("");
        setIsLoading(true);

        try {
            await signUp({
                name: name.trim(),
                email: email.trim(),
                password,
            });

            navigation.replace("ConfirmEmail", { email: email.trim() });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha ao registrar.";
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
            <Image source={require('@/src/assets/splash-icon.png')} className="w-32 h-32" />
            <View className="w-96 p-8 m-8 flex flex-col gap-8 bg-white rounded-md">
                <Text className="font-robotoSemibold text-lg">Crie sua conta</Text>
                <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2">
                    <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                        Nome completo
                    </Text>
                    <TextInput className="w-full text-sm py-1"
                        value={name}
                        onChangeText={setName}
                        placeholder="Jane Doe"
                        placeholderTextColor="#9ca3af"
                    />
                </View>
                <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2">
                    <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                        Email
                    </Text>
                    <TextInput className="w-full text-sm py-1"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="seu@email.com"
                        placeholderTextColor="#9ca3af"
                    />
                </View>
                <View className="flex flex-col gap-2">
                    <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2">
                        <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Senha
                        </Text>
                        <TextInput className="w-full text-sm py-1"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            placeholder="Crie uma senha forte"
                            placeholderTextColor="#9ca3af"
                        />
                        <Pressable onPress={() => setShowPassword((current) => !current)} className="absolute right-3 top-3">
                            <FontAwesome6 name={showPassword ? "eye-slash" : "eye"} size={16} color="#9ca3af" />
                        </Pressable>
                    </View>
                    <Text className="text-xs text-[#9ca3af]">* Mínimo de {MIN_PASSWORD_LENGTH} caracteres</Text>
                </View>
                {errorMessage ? <InlineError message={errorMessage} title="Falha ao criar conta" /> : null}
                <ActionButton
                    label="Registrar"
                    loadingLabel="Registrando..."
                    loading={isLoading}
                    onPress={() => void handleSignUp()}
                />
                <Pressable onPress={() => navigation.replace('Login')}>
                    <Text className="self-center">Já tem uma conta? <Text className="text-[#f97316]">Faça login</Text></Text>
                </Pressable>
            </View>
        </LinearGradient>
    )
}