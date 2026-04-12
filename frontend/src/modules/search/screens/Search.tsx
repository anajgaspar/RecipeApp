import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Constants from "expo-constants";
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import TopBar from "../components/TopBar";
import RecipeCard from "@/src/modules/recipes/components/RecipeCard";
import { Recipe, RecipeCategory, RecipeDifficulty, searchRecipes } from "@/src/services/recipeService";
import { recordSearchHistory } from "@/src/services/searchHistoryService";
import ActionButton from "@/src/components/ActionButton";
import LoadingState from "@/src/components/LoadingState";
import InlineError from "@/src/components/InlineError";

const difficultyOptions: (RecipeDifficulty | "")[] = ["", "Fácil", "Médio", "Difícil"];
const categoryOptions: RecipeCategory[] = [
    "Low Carb",
    "Cetogênica",
    "Mediterrânea",
    "Paleolítica",
    "Vegetariana",
    "Vegana",
    "Sem Lactose",
];

export default function Search({ navigation }: { navigation: any }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [voiceSearchAvailable, setVoiceSearchAvailable] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [difficulty, setDifficulty] = useState<RecipeDifficulty | "">("");
    const [category, setCategory] = useState<RecipeCategory | "">("");
    const speechModuleRef = useRef<any>(null);

    const handleSearch = useCallback(async (
        source: "text" | "voice" = "text",
        overrides?: {
            query?: string;
            difficulty?: RecipeDifficulty | "";
            category?: RecipeCategory | "";
        },
    ) => {
        const effectiveQuery = (overrides?.query ?? query).trim();
        const effectiveDifficulty = overrides?.difficulty ?? difficulty;
        const effectiveCategory = overrides?.category ?? category;

        try {
            setIsLoading(true);
            setErrorMessage(null);

            const data = await searchRecipes({
                query: effectiveQuery || undefined,
                difficulty: effectiveDifficulty || undefined,
                category: effectiveCategory || undefined,
                servingsMax: undefined,
                limit: 30,
            });

            setResults(data);

            const historyText = effectiveQuery
                || [
                    effectiveDifficulty ? `dificuldade ${effectiveDifficulty}` : null,
                    effectiveCategory ? `categoria ${effectiveCategory}` : null,
                ]
                    .filter(Boolean)
                    .join(", ");

            if (historyText) {
                try {
                    await recordSearchHistory(historyText, source);
                } catch {
                }
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível realizar a busca.";
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }, [category, difficulty, query]);

    const handleSearchRef = useRef(handleSearch);

    useEffect(() => {
        handleSearchRef.current = handleSearch;
    }, [handleSearch]);

    useEffect(() => {
        void handleSearch();
    }, [handleSearch]);

    useEffect(() => {
        let isMounted = true;
        let listeners: { remove: () => void }[] = [];

        if (Constants.executionEnvironment === "storeClient") {
            setVoiceSearchAvailable(false);
            return () => {
                isMounted = false;
            };
        }

        async function loadSpeechRecognition() {
            try {
                const module = await import("expo-speech-recognition");
                const speechModule = module.ExpoSpeechRecognitionModule;

                if (!isMounted) {
                    return;
                }

                speechModuleRef.current = speechModule;
                setVoiceSearchAvailable(true);

                listeners = [
                    speechModule.addListener("start", () => setIsListening(true)),
                    speechModule.addListener("end", () => setIsListening(false)),
                    speechModule.addListener("error", (event: { error: string; message?: string }) => {
                        setIsListening(false);
                        if (event.error !== "aborted") {
                            Alert.alert("Busca por voz", event.message || "Não foi possível reconhecer sua fala.");
                        }
                    }),
                    speechModule.addListener("result", (event: { results: { transcript?: string }[]; isFinal: boolean }) => {
                        const transcript = event.results[0]?.transcript?.trim() ?? "";

                        if (transcript) {
                            setQuery(transcript);
                        }

                        if (event.isFinal && transcript) {
                            void handleSearchRef.current("voice", { query: transcript });
                        }
                    }),
                ];
            } catch {
                if (isMounted) {
                    speechModuleRef.current = null;
                    setVoiceSearchAvailable(false);
                }
            }
        }

        void loadSpeechRecognition();

        return () => {
            isMounted = false;
            listeners.forEach((listener) => listener.remove());
        };
    }, []);

    async function handleVoiceSearch() {
        const speechModule = speechModuleRef.current;

        if (!voiceSearchAvailable || !speechModule) {
            Alert.alert(
                "Busca por voz",
                "A busca por voz exige um build nativo com o módulo instalado. No Expo Go/Code Scanner isso não está disponível."
            );
            return;
        }

        if (isListening) {
            speechModule.stop();
            return;
        }

        if (!speechModule.isRecognitionAvailable()) {
            Alert.alert("Busca por voz", "O reconhecimento de voz não está disponível neste dispositivo.");
            return;
        }

        try {
            const permission = await speechModule.requestPermissionsAsync();

            if (!permission.granted) {
                Alert.alert("Permissão necessária", "Permita o uso do microfone e do reconhecimento de fala para buscar por voz.");
                return;
            }

            speechModule.start({
                lang: "pt-BR",
                interimResults: true,
                continuous: false,
                iosTaskHint: "search",
                androidIntentOptions: {
                    EXTRA_LANGUAGE_MODEL: "web_search",
                },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível iniciar a busca por voz.";
            Alert.alert("Busca por voz", message);
        }
    }

    function clearFilters() {
        setQuery("");
        setDifficulty("");
        setCategory("");
        void handleSearch("text", {
            query: "",
            difficulty: "",
            category: "",
        });
    }

    return (
        <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
            <TopBar />
            <View className="p-4 gap-4">
                <View className="flex flex-row items-center gap-3">
                    <View className="flex-1 relative">
                        <View className="absolute left-4 top-3 z-10">
                            <Ionicons name="search-outline" size={20} color="#9ca3af" />
                        </View>
                        {query ? (
                            <Pressable
                                onPress={() => {
                                    setQuery("");
                                    void handleSearch("text", { query: "" });
                                }}
                                className="absolute right-3 top-2.5 z-10 rounded-full bg-[#9ca3af]/15 p-1"
                            >
                                <Ionicons name="close" size={16} color="#6b7280" />
                            </Pressable>
                        ) : null}
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={() => void handleSearch()}
                            placeholder="Busque por receitas ou ingredientes..."
                            placeholderTextColor="#9ca3af"
                            className="w-full border border-[#9ca3af] py-3 pl-11 pr-11 rounded-full bg-white"
                        />
                    </View>
                    <Pressable
                        onPress={() => void handleVoiceSearch()}
                        disabled={!voiceSearchAvailable}
                        className={`rounded-full p-3 border ${isListening ? "border-[#f97316] bg-[#f97316]/10" : "border-[#9ca3af]"} ${!voiceSearchAvailable ? "opacity-40" : ""}`}
                    >
                        <Ionicons name={isListening ? "mic" : "mic-outline"} size={20} color={isListening ? "#f97316" : "black"} />
                    </Pressable>
                    <Pressable
                        onPress={() => setShowFilters((current) => !current)}
                        className="rounded-full p-3 border border-[#9ca3af]"
                    >
                        <Ionicons name="options-outline" size={20} color="black" />
                    </Pressable>
                </View>

                {showFilters ? (
                    <View className="gap-4 rounded-2xl border border-[#9ca3af]/30 bg-[#fdfbf7] p-4">
                        <View className="flex flex-row items-center justify-between">
                            <Text className="font-robotoSemibold text-base">Filtros avançados</Text>
                            <Pressable onPress={clearFilters} className="flex flex-row items-center gap-1">
                                <FontAwesome6 name="trash-can" size={14} color="#ef4444" />
                                <Text className="text-red-500 text-sm">Limpar</Text>
                            </Pressable>
                        </View>

                        <View className="gap-2">
                            <Text className="text-xs text-[#6b7280]">Dificuldade</Text>
                            <View className="flex flex-row flex-wrap gap-2">
                                {difficultyOptions.map((option) => {
                                    const isSelected = difficulty === option;

                                    return (
                                        <Pressable
                                            key={option || "all"}
                                            onPress={() => setDifficulty(option)}
                                            className={`rounded-full px-4 py-2 border ${isSelected ? "bg-[#f97316] border-[#f97316]" : "border-[#9ca3af]/40 bg-white"}`}
                                        >
                                            <Text className={`${isSelected ? "text-white" : "text-black"}`}>{option || "Todas"}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        <View className="gap-2">
                            <Text className="text-xs text-[#6b7280]">Categorias</Text>
                            <View className="flex flex-row flex-wrap gap-2">
                                {categoryOptions.map((option) => {
                                    const isSelected = category === option;

                                    return (
                                        <Pressable
                                            key={option}
                                            onPress={() => setCategory(option)}
                                            className={`rounded-full px-4 py-2 border ${isSelected ? "bg-[#f97316] border-[#f97316]" : "border-[#9ca3af]/40 bg-white"}`}
                                        >
                                            <Text className={`${isSelected ? "text-white" : "text-black"}`}>{option}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        <ActionButton
                            label="Buscar"
                            loadingLabel="Buscando..."
                            loading={isLoading}
                            onPress={() => void handleSearch()}
                            className="rounded-xl"
                        />
                    </View>
                ) : null}

                {errorMessage ? <InlineError message={errorMessage} title="Falha ao buscar receitas" /> : null}

                <View className="flex flex-row items-center justify-between">
                    <Text className="font-robotoSemibold text-lg">Resultados</Text>
                    <Text className="text-[#6b7280] text-sm">{results.length} receita(s)</Text>
                </View>

                {isLoading ? <LoadingState label="Buscando receitas..." compact /> : null}

                {!isLoading && results.length === 0 && !errorMessage ? (
                    <View className="rounded-2xl border border-dashed border-[#9ca3af]/40 p-6">
                        <Text className="text-center text-[#6b7280]">
                            Nenhuma receita encontrada com esses filtros.
                        </Text>
                    </View>
                ) : null}

                <View className="gap-4 pb-8">
                    {results.map((recipe) => (
                        <Pressable
                            key={recipe.id}
                            onPress={() => navigation.navigate("RecipeDetails", { recipeId: recipe.id, recipe })}
                        >
                            <RecipeCard recipe={recipe} />
                        </Pressable>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}
