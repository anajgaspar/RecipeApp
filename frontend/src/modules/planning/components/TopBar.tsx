import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Text, Pressable } from "react-native";

type TopBarProps = {
    onPressShare?: () => void;
};

export default function TopBar({ onPressShare }: TopBarProps) {
    return (
        <>
            <View className="w-full flex flex-row justify-end items-center bg-orange-50 px-8 pt-12 pb-6" >
                <Pressable
                    onPress={onPressShare}
                >
                    <Ionicons name="share-social-outline" size={24} color="black" />
                </Pressable>
            </View>
            <View className="flex flex-row justify-between p-4 gap-4">
                <Text className="text-2xl font-bold mb-4">Planejamento de refeições</Text>
            </View>
        </>
    )
}