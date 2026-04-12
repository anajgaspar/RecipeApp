import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect } from "@react-navigation/native";
import { FavoriteRecord, listFavoriteRecipes, Recipe, toggleFavorite } from "@/src/services/recipeService";
import MyFavoritesCard from "../components/MyFavoritesCard";
import LoadingState from "@/src/components/LoadingState";
import InlineError from "@/src/components/InlineError";

export default function MyFavoritesList({ navigation }: { navigation: any }) {
    const [favorites, setFavorites] = useState<{ favorite: FavoriteRecord; recipe: Recipe }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadFavorites = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);
            const data = await listFavoriteRecipes();
            setFavorites(data.flatMap((item) => (item.recipe ? [{ favorite: item.favorite, recipe: item.recipe }] : [])));

        } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível carregar seus favoritos.";
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [loadFavorites])
    );

    async function handleFavorite(recipeId: string) {
        try {
            await toggleFavorite(recipeId);
            setFavorites((current) => current.filter((item) => item.recipe?.id !== recipeId));
        } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível atualizar o favorito.";
            Alert.alert("Falha ao atualizar favorito", message);
        }
    }

    return (
        <View className="flex-1 bg-white">
            <View className="pt-16 px-4 flex flex-row items-center gap-6">
                <Pressable onPress={() => navigation.goBack()}>
                    <FontAwesome6 name="arrow-left" size={24} color="black" />
                </Pressable>
                <Text className="font-robotoSemibold text-xl">Meus Favoritos</Text>
            </View>

            <ScrollView className="flex-1 p-4" contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
                {isLoading ? <LoadingState label="Carregando favoritos..." compact /> : null}
                {errorMessage ? <InlineError message={errorMessage} title="Falha ao carregar seus favoritos" /> : null}
                {!isLoading && !errorMessage && favorites.length === 0 ? (
                    <Text>Você ainda não favoritou nenhuma receita.</Text>
                ) : null}

                {favorites.map(({ recipe, favorite }) => (
                    <MyFavoritesCard
                        key={favorite.id}
                        recipe={recipe}
                        onOpen={() => navigation.navigate("RecipeDetails", { recipeId: recipe.id, recipe })}
                        onFavorite={() => void handleFavorite(recipe.id)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}
