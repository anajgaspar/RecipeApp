import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import TopBar from "../components/TopBar";
import Ionicons from '@expo/vector-icons/Ionicons';
import HistoryCard from "../components/HistoryCard";

export default function Search() {
    return (
        <ScrollView className="flex bg-white">
            <TopBar></TopBar>
            <View className="flex flex-row items-center">
                <View className="flex flex-row items-center p-4">
                    <View className="absolute left-7">
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
            <View className="flex-1 h-px bg-gray-200" />
            <View className="p-4">
                <HistoryCard></HistoryCard>
            </View>
        </ScrollView>
    )
}
