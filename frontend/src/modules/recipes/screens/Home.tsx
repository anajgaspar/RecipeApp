import { View, Text, ScrollView, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import TopBar from "../components/TopBar";
import RecipeCard from "../components/RecipeCard";
import { getSuggestedRecipes, Recipe } from "@/src/services/recipeService";
import LoadingState from "@/src/components/LoadingState";
import InlineError from "@/src/components/InlineError";

export default function Home({ navigation }: { navigation: any }) {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            async function loadRecipes() {
                try {
                    setIsLoading(true);
                    setErrorMessage(null);
                    const data = await getSuggestedRecipes(20);

                    if (isActive) {
                        setRecipes(data);
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Não foi possível carregar as receitas.";

                    if (isActive) {
                        setErrorMessage(message);
                    }
                } finally {
                    if (isActive) {
                        setIsLoading(false);
                    }
                }
            }

            loadRecipes();

            return () => {
                isActive = false;
            };
        }, [])
    );

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
                        {isLoading ? <LoadingState label="Carregando receitas..." compact /> : null}
                        {errorMessage ? <InlineError message={errorMessage} title="Não conseguimos carregar o feed" /> : null}
                        {!isLoading && !errorMessage && recipes.length === 0 ? <Text>Nenhuma receita encontrada.</Text> : null}
                        <View className="gap-4">
                            {recipes.map((recipe, index) => (
                                <Pressable key={`${recipe.id}-${index}`} onPress={() => navigation.navigate("RecipeDetails", { recipeId: recipe.id, recipe })}>
                                    <RecipeCard recipe={recipe} />
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
            <Pressable
                onPress={() => navigation.navigate("RecipeRegister")}
                className="absolute bottom-6 right-4 bg-[#f97316] px-4 h-14 rounded-full flex flex-row items-center justify-center gap-2"
            >
                <Text className="text-white text-xl font-bold">+</Text>
                <Text className="text-white font-semibold">Nova receita</Text>
            </Pressable>
        </View>
    );
}
