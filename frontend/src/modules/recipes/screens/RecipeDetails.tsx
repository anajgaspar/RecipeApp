import { ScrollView, View, Image, Text, Pressable } from "react-native";
import { useEffect, useMemo, useState } from "react";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import RecipeList from "../components/RecipeList";
import RecipeComments from "../components/RecipeComments";
import { getRecipeById, Recipe } from "@/src/services/recipeService";
import { useAuth } from "@/src/modules/auth/context/AuthContext";
import { getPublicUserProfile } from "@/src/services/authService";
import LoadingState from "@/src/components/LoadingState";
import InlineError from "@/src/components/InlineError";

export default function RecipeDetails({ navigation, route }: { navigation: any; route: any }) {
    const { user } = useAuth();
    const recipeId = route?.params?.recipeId as string | undefined;
    const routeRecipe = route?.params?.recipe as Recipe | undefined;
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(!routeRecipe);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [authorProfileName, setAuthorProfileName] = useState<string | null>(null);
    const [authorProfileAvatar, setAuthorProfileAvatar] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadRecipe() {
            if (routeRecipe) {
                setRecipe(routeRecipe);
                setIsLoading(false);
                return;
            }

            if (!recipeId) {
                setErrorMessage("Receita inválida.");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setErrorMessage(null);
                const data = await getRecipeById(recipeId);
                if (isMounted) {
                    setRecipe(data);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : "Não foi possível carregar a receita.";
                if (isMounted) {
                    setErrorMessage(message);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadRecipe();

        return () => {
            isMounted = false;
        };
    }, [recipeId, routeRecipe]);

    useEffect(() => {
        let isMounted = true;

        async function loadAuthorProfileFallback() {
            if (!recipe) {
                return;
            }

            if (recipe.authorId === user?.id) {
                setAuthorProfileName(null);
                setAuthorProfileAvatar(null);
                return;
            }

            const needsNameFallback = !recipe.authorName;
            const needsAvatarFallback = !recipe.authorAvatarDataUrl;

            if (!needsNameFallback && !needsAvatarFallback) {
                setAuthorProfileName(null);
                setAuthorProfileAvatar(null);
                return;
            }

            try {
                const publicProfile = await getPublicUserProfile(recipe.authorId);
                if (!isMounted) {
                    return;
                }

                setAuthorProfileName(publicProfile.name ?? null);
                setAuthorProfileAvatar(publicProfile.avatarDataUrl ?? null);
            } catch {
                if (!isMounted) {
                    return;
                }

                setAuthorProfileName(null);
                setAuthorProfileAvatar(null);
            }
        }

        loadAuthorProfileFallback();

        return () => {
            isMounted = false;
        };
    }, [recipe, user?.id]);

    const recipeCost = useMemo(() => {
        if (!recipe) {
            return null;
        }

        const total = recipe.ingredients.reduce((sum, ingredient) => {
            if (ingredient.price === undefined) {
                return sum;
            }

            return sum + ingredient.price;
        }, 0);

        return total > 0 ? total.toFixed(2) : null;
    }, [recipe]);

    if (isLoading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <LoadingState label="Carregando receita..." />
            </View>
        );
    }

    if (errorMessage || !recipe) {
        return (
            <View className="flex-1 bg-white items-center justify-center px-4 gap-4">
                <InlineError
                    message={errorMessage ?? "Receita não encontrada. Tente voltar e abrir novamente."}
                    title="Não foi possível abrir esta receita"
                />
                <Pressable onPress={() => navigation.goBack()} className="bg-[#f97316] px-4 py-2 rounded-md">
                    <Text className="text-white font-semibold">Voltar</Text>
                </Pressable>
            </View>
        );
    }

    const firstCategory = recipe.category[0] ?? "Sem categoria";
    const authorName = recipe.authorName
        ?? (recipe.authorId === user?.id ? user?.name : authorProfileName)
        ?? "Autor da receita";
    const authorAvatar = recipe.authorAvatarDataUrl
        ?? (recipe.authorId === user?.id ? user?.avatarDataUrl : authorProfileAvatar);

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="w-full" contentContainerStyle={{ paddingBottom: 96 }}>
                <View className="w-full flex flex-col">
                    <View className="relative">
                        <Image
                            source={{ uri: recipe.imageUrl }}
                            className="w-full h-80 rounded-t-xl"
                            resizeMode="cover"
                        />
                        <View className="absolute top-12 right-20 bg-white rounded-full p-2">
                            <FontAwesome6 name="heart" size={24} color="black" />
                        </View>
                        <View className="absolute top-12 right-6 bg-white rounded-full p-2">
                            <Ionicons name="share-social-outline" size={24} color="black" />
                        </View>
                        <Pressable onPress={() => navigation.goBack()} className="absolute top-12 left-6 bg-white rounded-full p-2">
                            <FontAwesome6 name="arrow-left" size={24} color="black" />
                        </Pressable>
                    </View>
                    <View className="flex flex-row ">
                        <View className="absolute bottom-12 left-6 right-6 flex flex-row flex-wrap gap-2">
                            <Text className="bg-white/40 font-semibold text-white py-1 px-2 rounded-full self-start">
                                {firstCategory}
                            </Text>
                            <Text className="bg-white/40 font-semibold text-white py-1 px-2 rounded-full self-start">
                                {recipe.difficulty}
                            </Text>
                        </View>
                    </View>
                    <View className="flex flex-row">
                        <Text className="absolute bottom-2 left-6 font-bold text-2xl text-white">{recipe.title}</Text>
                    </View>
                </View>
                <View className="flex flex-row justify-between p-4">
                    <View className="flex flex-col items-center justify-center bg-[#9ca3af]/10 w-24 h-20 rounded-md gap-2">
                        <FontAwesome6 name="clock" size={16} color="#f97316" />
                        <Text>{recipe.prepTimeMinutes}min</Text>
                    </View>
                    <View className="flex flex-col items-center justify-center bg-[#9ca3af]/10 w-24 h-20 rounded-md gap-2">
                        <FontAwesome6 name="arrow-trend-up" size={16} color="#f97316" />
                        <Text>{recipe.difficulty}</Text>
                    </View>
                    <View className="flex flex-col items-center justify-center bg-[#9ca3af]/10 w-24 h-20 rounded-md gap-2">
                        <Ionicons name="people-outline" size={16} color="#f97316" />
                        <Text>{recipe.servings ?? "-"} porções</Text>
                    </View>
                    <View className="flex flex-col items-center justify-center bg-[#9ca3af]/10 w-24 h-20 rounded-md gap-2">
                        <Ionicons name="cash-outline" size={16} color="#f97316" />
                        <Text>{recipeCost ? `R$${recipeCost}` : "-"}</Text>
                    </View>
                </View>
                <View className="flex flex-row justify-between items-center p-4">
                    <View className="flex flex-row gap-2">
                        {authorAvatar ? (
                            <Image source={{ uri: authorAvatar }} className="rounded-full w-14 h-14" />
                        ) : (
                            <View className="rounded-full w-14 h-14 bg-[#9ca3af]/20 items-center justify-center">
                                <FontAwesome6 name="user" size={18} color="#6b7280" />
                            </View>
                        )}
                        <Text className="pt-2">{authorName}</Text>
                    </View>
                    {/* <Pressable className="flex justify-center border border-[#9ca3af]/80 rounded-md h-10 px-2">
                        <Text>Seguir</Text>
                    </Pressable> */}
                </View>
                <View className="flex-1 h-px bg-gray-200" />
                <RecipeList ingredients={recipe.ingredients} steps={recipe.steps} />
                <View className="flex-1 h-px mt-2 bg-gray-200" />
                <RecipeComments />
            </ScrollView>
            <Pressable className="absolute bottom-6 left-4 right-4 flex flex-row justify-center items-center gap-4 bg-[#f97316] p-4 rounded-md">
                <Ionicons name="play-outline" size={16} color="white" />
                <Text className="text-white font-semibold">Iniciar Modo de Preparo</Text>
            </Pressable>
        </View>
    )
}