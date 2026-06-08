import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, ScrollView, Pressable, Modal, FlatList, Image, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Recipe, searchRecipes } from "@/src/services/recipeService";
import LoadingState from "@/src/components/LoadingState";
import {
    DAY_LABELS,
    MEAL_TYPES,
    type MealPlan,
    buildMealPlanDeepLink,
    buildSharedMealPlanPayload,
} from "../utils/mealPlanSharing";
import { MealPlanExporterRef } from "./MealPlanExporter";

type SlimRecipe = {
    id: string;
    title: string;
    prepTimeMinutes?: number;
    difficulty?: string;
};

type SlimMealPlan = {
    [mealType: string]: {
        [dateKey: string]: SlimRecipe | null;
    };
};

const STORAGE_KEY = "meal_plan_v1";

type MealPlanningProps = {
    onSharePlanningReady?: (handler: () => void) => void;
    navigation: any;
    exporterRef: React.RefObject<MealPlanExporterRef | null>;
};

function getWeekDays(offset: number): Date[] {
    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function dateKey(date: Date) {
    return date.toISOString().split("T")[0];
}

export default function MealPlanning({ onSharePlanningReady, navigation, exporterRef }: MealPlanningProps) {
    const [weekOffset, setWeekOffset] = useState(0);
    const [plan, setPlan] = useState<MealPlan>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMealType, setModalMealType] = useState<string | null>(null);
    const [modalDate, setModalDate] = useState<Date | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const days = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
    const monday = days[0];
    const sunday = days[6];

    const monthLabel = monday.toLocaleString("pt-BR", { month: "long", year: "numeric" });
    const rangeLabel = `${DAY_LABELS[0]}, ${monday.toLocaleDateString("pt-BR", { month: "short", day: "numeric" })} - ${DAY_LABELS[6]}, ${sunday.toLocaleDateString("pt-BR", { month: "short", day: "numeric" })}`;


    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then((raw) => {
                if (raw) setPlan(JSON.parse(raw));
            })
            .catch((err) => console.warn("Erro ao carregar plano:", err));
    }, []);

    function slimPlan(plan: MealPlan): SlimMealPlan {
        return Object.fromEntries(
            Object.entries(plan).map(([meal, days]) => [
                meal,
                Object.fromEntries(
                    Object.entries(days ?? {}).map(([date, recipe]) => [
                        date,
                        recipe ? {
                            id: recipe.id,
                            title: recipe.title,
                            prepTimeMinutes: recipe.prepTimeMinutes,
                            difficulty: recipe.difficulty,
                        } : null,
                    ])
                ),
            ])
        );
    }

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(slimPlan(plan))).catch((err) =>
            console.warn("Erro ao salvar plano:", err)
        );
    }, [plan]);

    function handleAddMeal(mealType: string, date: Date) {
        setModalMealType(mealType);
        setModalDate(date);
        setModalVisible(true);
        if (recipes.length === 0) {
            setIsLoading(true);
            searchRecipes({ limit: 30 })
                .then((recipesArray) => {
                    setRecipes(Array.isArray(recipesArray) ? recipesArray : []);
                })
                .catch((err) => console.error("Erro ao carregar receitas:", err))
                .finally(() => setIsLoading(false));
        }
    }

    function handleSelectRecipe(recipe: Recipe) {
        if (!modalMealType || !modalDate) return;
        const key = dateKey(modalDate);
        setPlan((prev) => ({
            ...prev,
            [modalMealType]: { ...prev[modalMealType], [key]: recipe },
        }));
        setModalVisible(false);
    }

    function handleRemoveMeal(mealType: string, date: Date) {
        const key = dateKey(date);
        setPlan((prev) => ({
            ...prev,
            [mealType]: { ...prev[mealType], [key]: null },
        }));
    }

    const handleSharePlanning = useCallback(async () => {
        const payload = buildSharedMealPlanPayload(slimPlan(plan), days);
        const deepLink = buildMealPlanDeepLink(payload);

        if (deepLink.length > 2200) {
            Alert.alert(
                "Planejamento muito grande",
                "Este planejamento passou do tamanho confortável para um link. Use a opção de imagem para compartilhar a semana inteira.",
                [{ text: "OK" }]
            );
            return;
        }

        Alert.alert("Compartilhar planejamento", "", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Imagem",
                onPress: () => {
                    void exporterRef.current?.share(payload);
                },
            },
        ]);
    }, [days, plan, exporterRef]);

    useEffect(() => {
        onSharePlanningReady?.(handleSharePlanning);
    }, [onSharePlanningReady, handleSharePlanning]);

    return (
        <View className="flex-1 bg-white">
            <View className="px-4 pb-4 border-b border-gray-100">
                <View className="flex-row items-center justify-center gap-4">
                    <Pressable
                        onPress={() => setWeekOffset((o) => o - 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 items-center justify-center"
                    >
                        <FontAwesome6 name="chevron-left" size={12} color="#6b7280" />
                    </Pressable>
                    <View className="items-center">
                        <Text className="text-lg font-semibold">{monthLabel}</Text>
                        <Text className="text-gray-400">{rangeLabel}</Text>
                    </View>
                    <Pressable
                        onPress={() => setWeekOffset((o) => o + 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 items-center justify-center"
                    >
                        <FontAwesome6 name="chevron-right" size={12} color="#6b7280" />
                    </Pressable>
                </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    <View className="flex-row border-b border-gray-100">
                        <View className="w-24" />
                        {days.map((day, i) => (
                            <View key={i} className="w-28 items-center py-3">
                                <Text className="text-gray-400">{DAY_LABELS[i]}</Text>
                                <Text className="text-lg font-semibold">{day.getDate()}</Text>
                            </View>
                        ))}
                    </View>
                    {MEAL_TYPES.map((meal) => (
                        <View key={meal.key} className="flex-row border-b border-gray-100">
                            <View className="w-24 items-center justify-center p-2">
                                <Text className="text-2xl">{meal.emoji}</Text>
                                <Text className="text-center text-xs">{meal.label}</Text>
                            </View>
                            {days.map((day, i) => {
                                const key = dateKey(day);
                                const recipe = plan[meal.key]?.[key];
                                return (
                                    <Pressable
                                        key={i}
                                        onPress={() => !recipe && handleAddMeal(meal.key, day)}
                                        className="w-28 h-28 border-l border-gray-100 items-center justify-center p-1 overflow-hidden"
                                    >
                                        {recipe ? (
                                            <View className="w-full h-full rounded-lg overflow-hidden">
                                                <View className="flex-1 items-center justify-between p-2">
                                                    <Text
                                                        className="text-xs text-center text-gray-700 font-medium"
                                                        numberOfLines={2}
                                                    >
                                                        {recipe.title}
                                                    </Text>
                                                    <View className="w-full flex-row justify-between">
                                                        <Pressable
                                                            onPress={() => handleRemoveMeal(meal.key, day)}
                                                            className="bg-white/80 rounded-full p-1"
                                                        >
                                                            <FontAwesome6 name="trash-can" size={16} color="#ef4444" />
                                                        </Pressable>
                                                        <Pressable
                                                            onPress={() => navigation.navigate("RecipeDetails", { recipeId: recipe.id })}
                                                            className="bg-white/80 rounded-full p-1"
                                                        >
                                                            <FontAwesome6 name="arrow-up-right-from-square" size={16} color="#f97316" />
                                                        </Pressable>
                                                    </View>
                                                </View>

                                            </View>
                                        ) : (
                                            <View className="w-8 h-8 rounded-full border border-dashed border-gray-300 items-center justify-center">
                                                <Text className="text-gray-400 text-xl leading-none">+</Text>
                                            </View>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </ScrollView>
            <Modal
                visible={modalVisible}
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center">
                    <Pressable
                        className="absolute inset-0 bg-black/40"
                        onPress={() => setModalVisible(false)}
                    />
                    <View className="bg-white rounded-t-3xl p-4 max-h-[70%]">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="font-robotoSemibold text-lg">Escolha uma receita</Text>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <FontAwesome6 name="xmark" size={18} color="#6b7280" />
                            </Pressable>
                        </View>
                        {isLoading ? (
                            <LoadingState label="Carregando receitas..." compact />
                        ) : recipes.length === 0 ? (
                            <Text className="text-center text-gray-400 py-6">
                                Nenhuma receita encontrada.
                            </Text>
                        ) : (
                            <FlatList
                                data={recipes}
                                keyExtractor={(r) => r.id}
                                style={{ flexShrink: 1 }}
                                contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => handleSelectRecipe(item)}
                                        className="flex-row items-center gap-3 p-2 rounded-xl border border-gray-100"
                                    >
                                        {item.imageUrl ? (
                                            <Image
                                                source={{ uri: item.imageUrl }}
                                                className="w-14 h-14 rounded-lg"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View className="w-14 h-14 rounded-lg bg-gray-100 items-center justify-center">
                                                <Text className="text-2xl">🍽️</Text>
                                            </View>
                                        )}
                                        <View className="flex-1">
                                            <Text className="font-medium text-sm" numberOfLines={2}>
                                                {item.title}
                                            </Text>
                                            {item.prepTimeMinutes && item.difficulty ? (
                                                <Text className="text-xs text-gray-400 mt-0.5">
                                                    {item.prepTimeMinutes} min | {item.difficulty}
                                                </Text>
                                            ) : null}
                                        </View>
                                        <FontAwesome6 name="plus" size={14} color="#f97316" />
                                    </Pressable>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}