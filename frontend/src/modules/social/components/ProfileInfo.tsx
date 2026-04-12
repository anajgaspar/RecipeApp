import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { useAuth } from "../../auth/context/AuthContext";
import { getMyRecipes } from "@/src/services/recipeService";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function ProfileInfo() {
    const { user } = useAuth();
    const avatarSource = user?.avatarDataUrl ? { uri: user.avatarDataUrl } : null;
    const [recipeCount, setRecipeCount] = useState<number | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadCount() {
            try {
                const recipes = await getMyRecipes(100);
                if (isMounted) {
                    setRecipeCount(recipes.length);
                }
            } catch {
                if (isMounted) {
                    setRecipeCount(null);
                }
            }
        }

        loadCount();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <View className="w-full flex flex-col items-center gap-2 px-4 py-6">
            {avatarSource ? (
                <Image source={avatarSource} className="rounded-full border-4 border-orange-50 w-28 h-28" />
            ) : (
                <View className="rounded-full border-4 border-orange-50 w-28 h-28 bg-[#fdfbf7] items-center justify-center">
                    <FontAwesome6 name="user" size={18} color="#6b7280" />
                </View>
            )}
            <Text className="text-lg font-semibold">
                {user?.name ?? "Usuário"}
            </Text>
            <Text className="text-sm text-[#9ca3af]">
                {user?.email ?? "Sem e-mail"}
            </Text>
            <View className="w-full flex flex-row justify-between p-4">
                <View className="flex flex-col items-center justify-center bg-[#9ca3af]/10 w-32 h-20 rounded-md">
                    <Text className="font-semibold text-[#f97316] text-lg">{recipeCount ?? "-"}</Text>
                    <Text className="text-[#9ca3af] text-sm">Receitas</Text>
                </View>
                <View className="flex flex-col items-center justify-center bg-[#9ca3af]/10 w-32 h-20 rounded-md">
                    <Text className="font-semibold text-[#f97316] text-lg">156</Text>
                    <Text className="text-[#9ca3af] text-sm">Seguidores</Text>
                </View>
                <View className="flex flex-col items-center justify-center bg-[#9ca3af]/10 w-32 h-20 rounded-md">
                    <Text className="font-semibold text-[#f97316] text-lg">89</Text>
                    <Text className="text-[#9ca3af] text-sm">Seguindo</Text>
                </View>
            </View>
        </View>
    )
}