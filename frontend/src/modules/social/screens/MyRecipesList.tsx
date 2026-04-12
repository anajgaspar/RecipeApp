import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect } from "@react-navigation/native";
import { deleteRecipe, getMyRecipes, getSuggestedRecipes, Recipe } from "@/src/services/recipeService";
import { useAuth } from "@/src/modules/auth/context/AuthContext";
import MyRecipesCard from "../components/MyRecipesCard";

export default function MyRecipesList({ navigation }: { navigation: any }) {
    const { user } = useAuth();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadMyRecipes = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);
            const data = await getMyRecipes(50);

            if (data.length > 0) {
                setRecipes(data);
                return;
            }

            const fallbackData = await getSuggestedRecipes(100);
            const filteredData = fallbackData.filter((recipe) => {
                if (user?.id && recipe.authorId === user.id) {
                    return true;
                }

                if (user?.name && recipe.authorName === user.name) {
                    return true;
                }

                return false;
            });

            setRecipes(filteredData);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível carregar suas receitas.";
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, user?.name]);

    useFocusEffect(
        useCallback(() => {
            loadMyRecipes();
        }, [loadMyRecipes])
    );

    const handleEdit = (recipe: Recipe) => {
        navigation.navigate("RecipeRegister", {
            mode: "edit",
            recipe,
        });
    };

    const handleDelete = (recipe: Recipe) => {
        Alert.alert(
            "Excluir receita",
            `Tem certeza que deseja excluir \"${recipe.title}\"? Esta ação não pode ser desfeita.`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteRecipe(recipe.id);
                            setRecipes((current) => current.filter((item) => item.id !== recipe.id));
                            Alert.alert("Receita excluída", "Sua receita foi removida com sucesso.");
                        } catch (error) {
                            const message = error instanceof Error ? error.message : "Não foi possível excluir a receita.";
                            Alert.alert("Erro ao excluir", message);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View className="flex-1 bg-white">
            <View className="pt-16 px-4 flex flex-row items-center gap-6">
                <Pressable onPress={() => navigation.goBack()}>
                    <FontAwesome6 name="arrow-left" size={24} color="black" />
                </Pressable>
                <Text className="font-robotoSemibold text-xl">Minhas Receitas</Text>
            </View>

            <ScrollView className="flex-1 p-4" contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
                {isLoading ? <Text>Carregando receitas...</Text> : null}
                {errorMessage ? <Text className="text-red-500">{errorMessage}</Text> : null}
                {!isLoading && !errorMessage && recipes.length === 0 ? (
                    <Text>Você ainda não cadastrou nenhuma receita.</Text>
                ) : null}

                {recipes.map((recipe) => (
                    <MyRecipesCard
                        key={recipe.id}
                        recipe={recipe}
                        onOpen={() => navigation.navigate("RecipeDetails", { recipeId: recipe.id, recipe })}
                        onEdit={() => handleEdit(recipe)}
                        onDelete={() => handleDelete(recipe)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}
