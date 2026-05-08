import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import TopBar from "../components/TopBar";
import RecipeCard from "../components/RecipeCard";
import { getSuggestedRecipes, listFavoriteRecipes, Recipe, searchRecipes, toggleFavorite } from "@/src/services/recipeService";
import LoadingState from "@/src/components/LoadingState";
import InlineError from "@/src/components/InlineError";
import { useAuth } from "@/src/modules/auth/context/AuthContext";
import BasicTutorialModal, { TutorialStep } from "@/src/modules/onboarding/components/BasicTutorialModal";
import { hasSeenAppTutorial, markAppTutorialAsSeen } from "@/src/services/tutorialStorage";
import Ionicons from '@expo/vector-icons/Ionicons';

const tutorialSteps: TutorialStep[] = [
    {
        title: "Sua tela inicial",
        highlight: "Aqui você encontra receitas recomendadas e os atalhos principais.",
        description:
            "Comece por esta tela para ver sugestões personalizadas, favoritar receitas e abrir os detalhes de cada prato.",
        tip: "Toque em um card para ver a receita completa ou use o coração para salvar nos favoritos.",
    },
    {
        title: "Busque do seu jeito",
        highlight: "Use texto para encontrar receitas rapidamente.",
        description:
            "Na home, a barra de busca fica acima dos filtros. Quando você digita algo, o feed some e aparecem só os resultados.",
        tip: "Se você já sabe o que quer cozinhar, basta digitar e a lista se ajusta sozinha.",
        actionLabel: "Buscar na home",
        actionHint: "Foca a barra de busca na tela inicial.",
    },
    {
        title: "Cadastre sua receita",
        highlight: "Salve suas próprias receitas com imagem, ingredientes e passos.",
        description:
            "O botão Nova receita abre o cadastro completo para você adicionar foto, tempo de preparo, porções e instruções.",
        tip: "Se a imagem for grande demais, o app agora mostra uma mensagem clara para você ajustar antes de enviar.",
        actionLabel: "Abrir cadastro",
        actionHint: "Você pode testar a tela de criação sem perder este tutorial.",
    },
    // {
    //     title: "Organize sua rotina",
    //     highlight: "Despensa e planejamento ajudam a usar melhor o que você já tem.",
    //     description:
    //         "As abas Despensa e Planejamento servem para acompanhar ingredientes e montar o dia a dia das refeições.",
    //     tip: "Essas telas são úteis para evitar desperdício e planejar melhor as compras.",
    //     actionLabel: "Abrir despensa",
    //     actionHint: "Depois você também pode voltar e ver o planejamento.",
    // },
    {
        title: "Seu perfil e favoritos",
        highlight: "Ali ficam seus dados, receitas criadas e favoritos.",
        description:
            "No Perfil você encontra edição de dados e, dentro da área social, consegue acessar suas receitas criadas e os itens favoritos.",
        tip: "Use esta área para revisar seus favoritos e ajustar seu perfil sempre que precisar.",
        actionLabel: "Abrir perfil",
        actionHint: "Última parada antes de encerrar o tour.",
    },
];

export default function Home({ navigation }: { navigation: any }) {
    const { user } = useAuth();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Recipe[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isTutorialVisible, setIsTutorialVisible] = useState(false);
    const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
    const [isCheckingTutorial, setIsCheckingTutorial] = useState(true);
    const searchInputRef = useRef<TextInput>(null);

    const currentTutorialStep = useMemo(() => tutorialSteps[tutorialStepIndex], [tutorialStepIndex]);
    const trimmedQuery = query.trim();
    const isSearching = trimmedQuery.length > 0;

    const visibleRecipes = isSearching ? searchResults : recipes;
    const visibleLoading = isSearching ? searchLoading : isLoading;
    const visibleError = isSearching ? searchError : errorMessage;

    useEffect(() => {
        if (!isSearching) {
            setSearchResults([]);
            setSearchError(null);
            setSearchLoading(false);
            return;
        }

        let isActive = true;
        const timeout = setTimeout(() => {
            async function runSearch() {
                try {
                    setSearchLoading(true);
                    setSearchError(null);

                    const data = await searchRecipes({
                        query: trimmedQuery,
                        limit: 30,
                    });

                    if (isActive) {
                        setSearchResults(data);
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Não foi possível realizar a busca.";

                    if (isActive) {
                        setSearchResults([]);
                        setSearchError(message);
                    }
                } finally {
                    if (isActive) {
                        setSearchLoading(false);
                    }
                }
            }

            void runSearch();
        }, 300);

        return () => {
            isActive = false;
            clearTimeout(timeout);
        };
    }, [isSearching, trimmedQuery]);

    useEffect(() => {
        let isActive = true;

        async function loadTutorialState() {
            if (!user?.id) {
                if (isActive) {
                    setIsCheckingTutorial(false);
                }
                return;
            }

            try {
                const seen = await hasSeenAppTutorial(user.id);

                if (isActive && !seen) {
                    setTutorialStepIndex(0);
                    setIsTutorialVisible(true);
                }
            } finally {
                if (isActive) {
                    setIsCheckingTutorial(false);
                }
            }
        }

        void loadTutorialState();

        return () => {
            isActive = false;
        };
    }, [user?.id]);

    const completeTutorial = useCallback(async () => {
        if (user?.id) {
            await markAppTutorialAsSeen(user.id);
        }

        setIsTutorialVisible(false);
    }, [user?.id]);

    const handleTutorialAction = useCallback(() => {
        const step = tutorialSteps[tutorialStepIndex];

        if (step.actionLabel?.includes("Busca")) {
            searchInputRef.current?.focus();
        } else if (step.actionLabel?.includes("cadastro")) {
            navigation.navigate("RecipeRegister");
            // } else if (step.actionLabel?.includes("despensa")) {
            //     navigation.navigate("Pantry");
        } else if (step.actionLabel?.includes("perfil")) {
            navigation.navigate("Social");
        }

        setTutorialStepIndex((current) => Math.min(current + 1, tutorialSteps.length - 1));
    }, [navigation, tutorialStepIndex]);

    useFocusEffect(
        useCallback(() => {
            if (isSearching) {
                return;
            }

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
        }, [isSearching])
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
                        <View className="flex-1 relative">
                            <View className="absolute left-4 top-3 z-10">
                                <Ionicons name="search-outline" size={18} color="#9ca3af" />
                            </View>
                            {query ? (
                                <Pressable
                                    onPress={() => setQuery("")}
                                    className="absolute right-3 top-2.5 z-10 rounded-full bg-[#9ca3af]/15 p-1"
                                >
                                    <Ionicons name="close" size={16} color="#6b7280" />
                                </Pressable>
                            ) : null}
                            <TextInput
                                ref={searchInputRef}
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Busque por receitas ou ingredientes..."
                                placeholderTextColor="#9ca3af"
                                className="w-full border border-[#9ca3af] py-3 pl-11 pr-11 rounded-full bg-white"
                            />
                        </View>
                    </View>

                    {!isSearching ? (
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
                    ) : null}

                    {isSearching ? (
                        <View className="flex flex-col">
                            <Text className="text-2xl font-bold mb-4">Resultados da busca</Text>
                            {searchLoading ? <LoadingState label="Buscando receitas..." compact /> : null}
                            {searchError ? <InlineError message={searchError} title="Falha ao buscar receitas" /> : null}
                            {!searchLoading && !searchError && searchResults.length === 0 ? <Text>Nenhuma receita encontrada.</Text> : null}
                            <View className="gap-4">
                                {searchResults.map((recipe) => (
                                    <Pressable key={recipe.id} onPress={() => navigation.navigate("RecipeDetails", { recipeId: recipe.id, recipe })}>
                                        <RecipeCard recipe={recipe} />
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    ) : (
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
                    )}
                </View>
            </ScrollView>
            <Pressable
                onPress={() => navigation.navigate("RecipeRegister")}
                className="absolute bottom-6 right-4 bg-[#f97316] px-4 h-14 rounded-full flex flex-row items-center justify-center gap-2"
            >
                <Text className="text-white text-xl font-bold">+</Text>
                <Text className="text-white font-semibold">Nova receita</Text>
            </Pressable>
            <BasicTutorialModal
                visible={isTutorialVisible && !isCheckingTutorial}
                step={currentTutorialStep}
                stepIndex={tutorialStepIndex}
                totalSteps={tutorialSteps.length}
                canGoBack={tutorialStepIndex > 0}
                onBack={() => setTutorialStepIndex((current) => Math.max(current - 1, 0))}
                onNext={() => setTutorialStepIndex((current) => Math.min(current + 1, tutorialSteps.length - 1))}
                onSkip={() => void completeTutorial()}
                onFinish={() => void completeTutorial()}
                onAction={() => handleTutorialAction()}
            />
        </View>
    );
}
