import { View, Text, ScrollView, Pressable } from "react-native";
import TopBar from "../components/TopBar";
import RecipeCard from "../components/RecipeCard";

export default function Home({ navigation }: { navigation: any }) {
    return (
        <ScrollView className="h-full flex bg-white">
            <TopBar />
            <View className="flex flex-col gap-6 p-4">
                <View className="flex flex-row items-center gap-2">
                    <Pressable>
                        <Text className="text-white bg-[#f97316] p-2 rounded-full">Todas as receitas</Text>
                    </Pressable>
                    <Pressable>
                        <Text className="bg-white border border-[#9ca3af] p-2 rounded-full">Minha despensa</Text>
                    </Pressable>
                    <Pressable>
                        <Text className="bg-white border border-[#9ca3af] p-2 rounded-full">Sazonais</Text>
                    </Pressable>
                </View>
                <View className="flex flex-col">
                    <Text className="text-2xl font-bold mb-4">Sugerido para você</Text>
                    <Pressable onPress={() => navigation.replace('RecipeDetails')}>
                        <RecipeCard></RecipeCard>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    )
}
