import { View, Text, ScrollView, Pressable } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import TopBar from "../components/TopBar";
import RecipeCard from "../components/RecipeCard";
import { getSuggestedRecipes, listFavoriteRecipes, Recipe, toggleFavorite } from "@/src/services/recipeService";
import LoadingState from "@/src/components/LoadingState";
import InlineError from "@/src/components/InlineError";
import { useAuth } from "@/src/modules/auth/context/AuthContext";
import BasicTutorialModal, { TutorialStep } from "@/src/modules/onboarding/components/BasicTutorialModal";
import { hasSeenAppTutorial, markAppTutorialAsSeen } from "@/src/services/tutorialStorage";

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
            "Na aba Busca, você pode filtrar por categoria, dificuldade e até usar reconhecimento de voz para procurar por ingredientes.",
        tip: "Se você já sabe o que quer cozinhar, a busca reduz bastante o tempo para achar a receita certa.",
        actionLabel: "Abrir Busca",
        actionHint: "Leva você para a aba de pesquisa agora.",
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
    const [isTutorialVisible, setIsTutorialVisible] = useState(false);
    const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
    const [isCheckingTutorial, setIsCheckingTutorial] = useState(true);

    const currentTutorialStep = useMemo(() => tutorialSteps[tutorialStepIndex], [tutorialStepIndex]);

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
            navigation.navigate("Search");
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
