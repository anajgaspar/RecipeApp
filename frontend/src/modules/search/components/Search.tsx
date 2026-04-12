import { View, TextInput, Pressable } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Search() {
    return (
        <View className="flex flex-row justify-center items-center gap-2">
            <View className="flex flex-row items-center">
                <View className="absolute left-3">
                    <Ionicons name="search-outline" size={20} color="#9ca3af" />
                </View>
                <TextInput placeholder="Busque por receitas..."
                    placeholderTextColor="#9ca3af"
                    className="w-[275px] border border-[#9ca3af] p-3 pl-10 rounded-full shrink"
                />
            </View>
            <View className="flex flex-row gap-4">
                <Pressable className="border border-[#9ca3af] p-3 rounded-full">
                    <Ionicons name="mic-outline" size={20} color="black" />
                </Pressable>
                <Pressable className="border border-[#9ca3af] p-3 rounded-full">
                    <Ionicons name="options-outline" size={20} color="black" />
                </Pressable>
            </View>
        </View>
    )
}
