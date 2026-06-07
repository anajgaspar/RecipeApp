import { Pressable, View, Text } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from "@/src/modules/auth/context/AuthContext";

export default function TopBar() {
    const { signOut } = useAuth();

    async function handleLogout() {
        try {
            await signOut();
        } catch (err) {
            console.error("Erro ao deslogar:", err);
        }
    }

    return (
        <View className="w-full flex flex-row justify-between items-center bg-orange-50 px-8 pt-12 pb-6">
            <Text className="font-robotoSemibold text-xl">Receita Na Mão</Text>
            <View className="flex flex-row items-center gap-5">
                <Pressable onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={22} color="black" />
                </Pressable>
            </View>
        </View>
    )
}