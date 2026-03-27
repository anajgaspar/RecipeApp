import { Image, View, Text, TextInput, Pressable} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function LoginPage({ navigation }: { navigation: any }) {
    return (
        <LinearGradient
            colors={["#fff7ed", "#fdfbf7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <Image source={require('@/src/assets/logo.png')} className="w-32 h-32" />
            <View className="w-96 p-8 m-8 flex flex-col gap-8 bg-white rounded-md">
                <Text className="font-robotoSemibold text-lg">Bem-vindo de volta!</Text>
                <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2">
                    <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                        Email
                    </Text>
                    <TextInput className="w-full text-sm py-1"
                    placeholder="seu@email.com"
                    placeholderTextColor="#9ca3af"
                    />
                </View>
                <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2">
                    <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                        Senha
                    </Text>
                    <TextInput className="w-full text-sm py-1"
                    placeholder="Insira sua senha"
                    placeholderTextColor="#9ca3af"
                    />
                    <FontAwesome6 name="eye" size={16} color="#9ca3af" className="absolute right-3 top-3"/>
                </View>
                <Pressable onPress={() => navigation.replace('Feed')} className="w-full bg-[#f97316] py-3 rounded-md">
                    <Text className="text-center text-white font-semibold">Entrar</Text>
                </Pressable>
                <View className="w-full flex-row items-center gap-3">
                    <View className="flex-1 h-px bg-gray-200" />
                    <Text className="text-xs text-gray-400">OU</Text>
                    <View className="flex-1 h-px bg-gray-200" />
                </View>
                <Pressable className="w-full flex flex-row justify-center items-center gap-2 py-3 bg-[#fdfbf7] rounded-md">
                    <FontAwesome6 name="chrome" size={20} color="black" />
                    <Text className="">Faça login com Google</Text>
                </Pressable>
                <Pressable className="w-full flex flex-row justify-center items-center gap-2 py-3 bg-[#fdfbf7] rounded-md">
                    <FontAwesome6 name="fingerprint" size={20} color="black" />
                    <Text className="text-center">Use login biométrico</Text>
                </Pressable>
                <Pressable onPress={() => navigation.replace('Signup')}>
                    <Text className="self-center">Não tem uma conta? <Text className="text-[#f97316]">Registre-se</Text></Text>
                </Pressable>
            </View>
        </LinearGradient>
    )
}
