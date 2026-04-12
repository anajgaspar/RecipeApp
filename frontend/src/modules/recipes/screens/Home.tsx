import { View, Text, ScrollView, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import TopBar from "../components/TopBar";
import RecipeCard from "../components/RecipeCard";
import { getSuggestedRecipes, listFavoriteRecipes, Recipe, toggleFavorite } from "@/src/services/recipeService";
import LoadingState from "@/src/components/LoadingState";
import InlineError from "@/src/components/InlineError";

export default function Home({ navigation }: { navigation: any }) {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            async function loadRecipes() {
                try {
                    setIsLoading(true);
                    setErrorMessage(null);
                    const [suggestedRecipes, favorites] = await Promise.all([
                        getSuggestedRecipes(20),
                        listFavoriteRecipes(),
                    ]);

                    if (isActive) {
                        setRecipes(suggestedRecipes);
                        setFavoriteIds(favorites.map((item) => item.recipe?.id).filter((recipeId): recipeId is string => Boolean(recipeId)));
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

    async function handleFavorite(recipeId: string) {
        try {
            const result = await toggleFavorite(recipeId);
            setFavoriteIds((current) => {
                if (result.favorited) {
                    return current.includes(recipeId) ? current : [...current, recipeId];
                }

                return current.filter((currentId) => currentId !== recipeId);
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível atualizar os favoritos.";
            setErrorMessage(message);
        }
    }

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
                        <Text className="text-2xl font-bold mb-4">Recomendado para você</Text>
                        {isLoading ? <LoadingState label="Carregando receitas..." compact /> : null}
                        {errorMessage ? <InlineError message={errorMessage} title="Não conseguimos carregar o feed" /> : null}
                        {!isLoading && !errorMessage && recipes.length === 0 ? <Text>Nenhuma receita encontrada.</Text> : null}
                        <View className="gap-4">
                            {recipes.map((recipe, index) => (
                                <Pressable key={`${recipe.id}-${index}`} onPress={() => navigation.navigate("RecipeDetails", { recipeId: recipe.id, recipe })}>
                                    <RecipeCard
                                        recipe={recipe}
                                        isFavorited={favoriteIds.includes(recipe.id)}
                                        onFavorite={() => void handleFavorite(recipe.id)}
                                    />
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
