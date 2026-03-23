import { View, Text, ScrollView, Pressable } from "react-native";
import TopBar from "../components/TopBar";
import RecipeCard from "../components/RecipeCard";

export default function Home() {
    return (
        <ScrollView className="h-full flex bg-white">
            <TopBar/>
            <View className="p-4">
                <View>
                    <Pressable></Pressable>
                </View>
                <Text className="text-2xl font-bold mb-4">Sugerido para você</Text>
                <RecipeCard></RecipeCard>
            </View>
        </ScrollView>
    )
}
