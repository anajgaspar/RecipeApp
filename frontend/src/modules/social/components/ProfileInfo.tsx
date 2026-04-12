import { Image, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAuth } from "../../auth/context/AuthContext";

export default function ProfileInfo() {
    const { user } = useAuth();
    const avatarSource = user?.avatarDataUrl ? { uri: user.avatarDataUrl } : null;

    return (
        <View className="w-full flex flex-col items-center gap-2 px-4 py-6">
            {avatarSource ? (
                <Image source={avatarSource} className="rounded-full border-4 border-orange-50 w-28 h-28" />
            ) : (
                <View className="w-28 h-28 rounded-full border-4 border-orange-50 bg-[#fdfbf7] items-center justify-center">
                    <MaterialCommunityIcons name="account-circle-outline" size={88} color="#9ca3af" />
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
                    <Text className="font-semibold text-[#f97316] text-lg">24</Text>
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