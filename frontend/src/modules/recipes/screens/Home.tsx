import { View, Text, ScrollView, Pressable } from "react-native";
import TopBar from "../components/TopBar";
import RecipeCard from "../components/RecipeCard";

export default function Home({ navigation }: { navigation: any }) {
    return (
        <View className="flex-1 bg-white">
            <ScrollView className="h-full flex" contentContainerStyle={{ paddingBottom: 96 }}>
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
            <Pressable
                onPress={() => navigation.navigate('RecipeRegister')}
                className="absolute bottom-6 right-4 bg-[#f97316] px-4 h-14 rounded-full flex flex-row items-center justify-center gap-2"
            >
                <Text className="text-white text-xl font-bold">+</Text>
                <Text className="text-white font-semibold">Nova receita</Text>
            </Pressable>
        </View>
    )
}
