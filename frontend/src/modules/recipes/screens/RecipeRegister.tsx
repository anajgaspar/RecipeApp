import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useEffect, useMemo, useState } from "react";
import { Modal, FlatList, View, Pressable, Text, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import UploadImage from "../components/UploadImage";
import { useAuth } from "@/src/modules/auth/context/AuthContext";
import { createRecipe, Recipe, RecipeCategory, RecipeDifficulty, updateRecipe } from "@/src/services/recipeService";
import ActionButton from "@/src/components/ActionButton";

const difficultyOptions = ["Fácil", "Médio", "Difícil"] as const;
const categoryOptions = [
    "Low Carb",
    "Cetogênica",
    "Mediterrânea",
    "Paleolítica",
    "Vegetariana",
    "Vegana",
    "Sem Lactose",
] as const;

type RecipeRegisterRouteParams = {
    mode?: "create" | "edit";
    recipe?: Recipe;
};

export default function RecipeRegister({ navigation, route }: { navigation: any; route?: { params?: RecipeRegisterRouteParams } }) {
    const { token, user } = useAuth();
    const mode = route?.params?.mode ?? "create";
    const recipeToEdit = route?.params?.recipe;
    const isEditMode = mode === "edit" && !!recipeToEdit?.id;
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [prepTimeMinutes, setPrepTimeMinutes] = useState("");
    const [servings, setServings] = useState("");
    const [difficulty, setDifficulty] = useState<(typeof difficultyOptions)[number] | null>(null);
    const [categories, setCategories] = useState<RecipeCategory[]>([]);
    const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [ingredientRows, setIngredientRows] = useState([
        { name: "", quantityValue: "", quantityUnit: "", price: "" },
    ]);
    const [instructionRows, setInstructionRows] = useState([
        { instruction: "", timerMinutes: "" },
    ]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isEditMode || !recipeToEdit) {
            return;
        }

        setImageUri(recipeToEdit.imageUrl);
        setTitle(recipeToEdit.title);
        setPrepTimeMinutes(String(recipeToEdit.prepTimeMinutes));
        setServings(recipeToEdit.servings ? String(recipeToEdit.servings) : "");
        setDifficulty(recipeToEdit.difficulty);
        setCategories(recipeToEdit.category);
        setIngredientRows(
            recipeToEdit.ingredients.map((ingredient) => ({
                name: ingredient.name,
                quantityValue: ingredient.quantityValue,
                quantityUnit: ingredient.quantityUnit,
                price: ingredient.price !== undefined ? String(ingredient.price) : "",
            }))
        );
        setInstructionRows(
            recipeToEdit.steps.map((step) => ({
                instruction: step.instruction,
                timerMinutes: step.timerSeconds ? String(step.timerSeconds / 60) : "",
            }))
        );
    }, [isEditMode, recipeToEdit]);

    const selectedCategoriesLabel = useMemo(() => {
        if (categories.length === 0) {
            return "Sem categoria";
        }

        return categories.join(", ");
    }, [categories]);

    const toggleCategory = (value: RecipeCategory) => {
        setCategories((current) => {
            if (current.includes(value)) {
                return current.filter((item) => item !== value);
            }

            return [...current, value];
        });
    };

    const addIngredientRow = () => {
        setIngredientRows((current) => [...current, { name: "", quantityValue: "", quantityUnit: "", price: "" }]);
    };

    const updateIngredientRow = (index: number, field: keyof (typeof ingredientRows)[number], value: string) => {
        setIngredientRows((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index ? { ...row, [field]: value } : row
            )
        );
    };

    const addInstructionRow = () => {
        setInstructionRows((current) => [...current, { instruction: "", timerMinutes: "" }]);
    };

    const updateInstructionRow = (
        index: number,
        field: keyof (typeof instructionRows)[number],
        value: string
    ) => {
        setInstructionRows((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index ? { ...row, [field]: value } : row
            )
        );
    };

    const handleSubmit = async () => {
        if (!token) {
            Alert.alert("Sessão expirada", "Faça login novamente para salvar a receita.");
            return;
        }

        if (!imageUri) {
            Alert.alert("Imagem obrigatória", "Selecione uma imagem para a receita.");
            return;
        }

        if (!title.trim()) {
            Alert.alert("Título obrigatório", "Informe o título da receita.");
            return;
        }

        if (!difficulty) {
            Alert.alert("Dificuldade obrigatória", "Selecione a dificuldade da receita.");
            return;
        }

        const normalizedIngredients = ingredientRows
            .map((row, index) => ({
                name: row.name.trim(),
                quantityValue: row.quantityValue.trim(),
                quantityUnit: row.quantityUnit.trim(),
                price: row.price.trim() ? Number.parseFloat(row.price.replace(",", ".")) : undefined,
                position: index + 1,
            }))
            .filter((row) => row.name.length > 0 && row.quantityValue.length > 0 && row.quantityUnit.length > 0);

        const normalizedSteps = instructionRows
            .map((step, index) => {
                const normalizedTimer = step.timerMinutes.replace(",", ".").trim();
                const timerMinutesValue = normalizedTimer ? Number.parseFloat(normalizedTimer) : Number.NaN;

                return {
                    stepNumber: index + 1,
                    instruction: step.instruction.trim(),
                    timerSeconds: Number.isNaN(timerMinutesValue) || timerMinutesValue <= 0
                        ? undefined
                        : Math.round(timerMinutesValue * 60),
                };
            })
            .filter((step) => step.instruction.length > 0);

        if (normalizedIngredients.length === 0) {
            Alert.alert("Ingredientes obrigatórios", "Adicione pelo menos um ingrediente válido.");
            return;
        }

        if (normalizedSteps.length === 0) {
            Alert.alert("Passos obrigatórios", "Adicione pelo menos uma instrução válida.");
            return;
        }

        const parsedPrepTime = Number.parseInt(prepTimeMinutes, 10);
        const parsedServings = Number.parseInt(servings, 10);

        if (Number.isNaN(parsedPrepTime) || parsedPrepTime <= 0) {
            Alert.alert("Tempo inválido", "Informe o tempo de preparo em minutos.");
            return;
        }

        if (Number.isNaN(parsedServings) || parsedServings <= 0) {
            Alert.alert("Porções inválidas", "Informe quantas porções a receita rende.");
            return;
        }

        const payload = {
            authorName: user?.name,
            authorAvatarDataUrl: user?.avatarDataUrl ?? null,
            title: title.trim(),
            imageUrl: imageUri,
            prepTimeMinutes: parsedPrepTime,
            servings: parsedServings,
            difficulty: difficulty as RecipeDifficulty,
            category: categories,
            ingredients: normalizedIngredients,
            steps: normalizedSteps,
        };

        try {
            setIsSaving(true);

            if (isEditMode && recipeToEdit?.id) {
                await updateRecipe(recipeToEdit.id, payload);
                Alert.alert("Receita atualizada");
            } else {
                await createRecipe(payload);
                Alert.alert("Receita criada");
            }

            navigation.goBack();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível salvar a receita.";
            Alert.alert("Erro ao salvar", message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-white"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
        >
            <View className="w-full flex-1 gap-6">
            <View className="pt-16 pl-8 flex flex-row items-center gap-6">
                <Pressable onPress={() => navigation.goBack()}>
                    <FontAwesome6 name="arrow-left" size={24} color="black" />
                </Pressable>
                <Text className="font-robotoSemibold text-xl">{isEditMode ? "Editar Receita" : "Nova Receita"}</Text>
            </View>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 24 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            >
                <View>
                    <Text className="left-2 bottom-1 bg-white px-1 text-xs">
                        Imagem
                    </Text>
                    <UploadImage onChange={setImageUri} value={imageUri} />
                </View>
                <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2">
                    <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                        Título
                    </Text>
                    <TextInput
                        className="w-full text-sm py-1"
                        placeholder="Ex: Torta de Maçã"
                        placeholderTextColor="#9ca3af"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>
                <View className="flex flex-row flex-wrap justify-between gap-4">
                    <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2 w-[48%]">
                        <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Tempo de Preparo (min)
                        </Text>
                        <TextInput
                            className="w-full text-sm py-1"
                            placeholder="30"
                            keyboardType="numeric"
                            placeholderTextColor="#9ca3af"
                            value={prepTimeMinutes}
                            onChangeText={setPrepTimeMinutes}
                        />
                    </View>
                    <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2 w-[48%]">
                        <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Porções
                        </Text>
                        <TextInput
                            className="w-full text-sm py-1"
                            placeholder="4"
                            keyboardType="numeric"
                            placeholderTextColor="#9ca3af"
                            value={servings}
                            onChangeText={setServings}
                        />
                    </View>
                    <Pressable onPress={() => setIsDifficultyOpen(true)} className="relative bg-[#fdfbf7] rounded-md px-3 py-2 w-[48%]">
                        <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Dificuldade
                        </Text>
                        <Text className={`w-full text-sm py-1 ${difficulty ? "text-black" : "text-[#9ca3af]"}`}>
                            {difficulty ?? "Selecione a dificuldade"}
                        </Text>
                    </Pressable>
                    <Pressable onPress={() => setIsCategoryOpen(true)} className="relative bg-[#fdfbf7] rounded-md px-3 py-2 w-[48%]">
                        <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Categoria
                        </Text>
                        <Text className={`w-full text-sm py-1 ${categories.length > 0 ? "text-black" : "text-[#9ca3af]"}`} numberOfLines={2}>
                            {selectedCategoriesLabel}
                        </Text>
                    </Pressable>
                </View>
                <View>
                    <View className="flex flex-row items-center justify-between mb-3">
                        <Text className="text-base font-semibold">Ingredientes</Text>
                        <Pressable onPress={addIngredientRow} className="flex flex-row items-center gap-2 rounded-full border border-[#f97316] px-3 py-1">
                            <FontAwesome6 name="plus" size={12} color="#f97316" />
                            <Text className="text-[#f97316] text-sm font-semibold">Adicionar</Text>
                        </Pressable>
                    </View>
                    <View className="flex flex-row justify-between px-1 mb-2">
                        <Text className="text-xs text-gray-500">Ingrediente</Text>
                    </View>
                    <View className="gap-3">
                        {ingredientRows.map((row, index) => (
                            <View key={index} className="bg-[#fdfbf7] rounded-md px-3 py-3 gap-3">
                                <View className="flex flex-row gap-3">
                                    <View className="flex-1 relative bg-white rounded-md px-3 py-2">
                                        <Text className="absolute -top-2 left-2 bg-[#fdfbf7] px-1 text-xs">Nome</Text>
                                        <TextInput
                                            className="w-full text-sm py-1"
                                            placeholder="Ex: Farinha de trigo"
                                            placeholderTextColor="#9ca3af"
                                            value={row.name}
                                            onChangeText={(value) => updateIngredientRow(index, "name", value)}
                                        />
                                    </View>
                                    <View className="w-28 relative bg-white rounded-md px-3 py-2">
                                        <Text className="absolute -top-2 left-2 bg-[#fdfbf7] px-1 text-xs">Qtd.</Text>
                                        <TextInput
                                            className="w-full text-sm py-1"
                                            placeholder="2"
                                            keyboardType="numeric"
                                            placeholderTextColor="#9ca3af"
                                            value={row.quantityValue}
                                            onChangeText={(value) => updateIngredientRow(index, "quantityValue", value)}
                                        />
                                    </View>
                                </View>
                                <View className="flex flex-row gap-3">
                                    <View className="w-28 relative bg-white rounded-md px-3 py-2">
                                        <Text className="absolute -top-2 left-2 bg-[#fdfbf7] px-1 text-xs">Unid.</Text>
                                        <TextInput
                                            className="w-full text-sm py-1"
                                            placeholder="Xícara"
                                            placeholderTextColor="#9ca3af"
                                            value={row.quantityUnit}
                                            onChangeText={(value) => updateIngredientRow(index, "quantityUnit", value)}
                                        />
                                    </View>
                                    <View className="flex-1 relative bg-white rounded-md px-3 py-2">
                                        <Text className="absolute -top-2 left-2 bg-[#fdfbf7] px-1 text-xs">Preço aprox.</Text>
                                        <TextInput
                                            className="w-full text-sm py-1"
                                            placeholder="R$ 8,90"
                                            keyboardType="decimal-pad"
                                            placeholderTextColor="#9ca3af"
                                            value={row.price}
                                            onChangeText={(value) => updateIngredientRow(index, "price", value)}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
                <View className="flex flex-row items-center justify-between mb-3">
                    <Text className="text-base font-semibold">Instruções</Text>
                    <Pressable onPress={addInstructionRow} className="flex flex-row items-center gap-2 rounded-full border border-[#f97316] px-3 py-1">
                        <FontAwesome6 name="plus" size={12} color="#f97316" />
                        <Text className="text-[#f97316] text-sm font-semibold">Adicionar</Text>
                    </Pressable>
                </View>
                <View className="gap-3">
                    {instructionRows.map((step, index) => (
                        <View key={index} className="flex flex-row gap-3 items-start">
                            <View className="w-8 h-8 rounded-full bg-[#f97316] items-center justify-center mt-2">
                                <Text className="text-white font-bold text-sm">{index + 1}</Text>
                            </View>
                            <View className="flex-1 gap-2">
                                <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2">
                                    <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">Passo {index + 1}</Text>
                                    <TextInput
                                        className="w-full text-sm py-1 min-h-16"
                                        placeholder="Ex: Leve ao forno médio-alto (200°C)."
                                        placeholderTextColor="#9ca3af"
                                        multiline
                                        value={step.instruction}
                                        onChangeText={(value) => updateInstructionRow(index, "instruction", value)}
                                    />
                                </View>
                                <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2">
                                    <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">Timer (min, opcional)</Text>
                                    <TextInput
                                        className="w-full text-sm py-1"
                                        placeholder="Ex: 10"
                                        keyboardType="decimal-pad"
                                        placeholderTextColor="#9ca3af"
                                        value={step.timerMinutes}
                                        onChangeText={(value) => updateInstructionRow(index, "timerMinutes", value)}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
                <ActionButton
                    label={isEditMode ? "Atualizar" : "Salvar"}
                    loadingLabel="Salvando..."
                    loading={isSaving}
                    onPress={() => void handleSubmit()}
                />
            </ScrollView>
            <Modal visible={isDifficultyOpen} transparent animationType="fade" onRequestClose={() => setIsDifficultyOpen(false)}>
                <Pressable onPress={() => setIsDifficultyOpen(false)} className="flex-1 bg-black/40 items-center justify-center px-6">
                    <Pressable className="w-full bg-white rounded-2xl p-4" onPress={() => { }}>
                        <Text className="text-lg font-semibold mb-4">Selecione a dificuldade</Text>
                        <FlatList
                            data={difficultyOptions}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        setDifficulty(item);
                                        setIsDifficultyOpen(false);
                                    }}
                                    className="py-3 border-b border-gray-200"
                                >
                                    <Text className="text-base">{item}</Text>
                                </Pressable>
                            )}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
            <Modal visible={isCategoryOpen} transparent animationType="fade" onRequestClose={() => setIsCategoryOpen(false)}>
                <Pressable onPress={() => setIsCategoryOpen(false)} className="flex-1 bg-black/40 items-center justify-center px-6">
                    <Pressable className="w-full bg-white rounded-2xl p-4" onPress={() => { }}>
                        <Text className="text-lg font-semibold mb-2">Selecione as categorias</Text>
                        <Text className="text-sm text-gray-500 mb-4">Você pode escolher mais de uma opção.</Text>
                        <FlatList
                            data={categoryOptions}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => {
                                const isSelected = categories.includes(item);

                                return (
                                    <Pressable
                                        onPress={() => toggleCategory(item)}
                                        className="py-3 border-b border-gray-200 flex flex-row items-center justify-between"
                                    >
                                        <Text className="text-base">{item}</Text>
                                        <Text className={`text-lg font-semibold ${isSelected ? "text-[#f97316]" : "text-gray-300"}`}>
                                            {isSelected ? "✓" : ""}
                                        </Text>
                                    </Pressable>
                                );
                            }}
                        />
                        <Pressable
                            onPress={() => setIsCategoryOpen(false)}
                            className="mt-4 bg-[#f97316] rounded-md py-3 items-center"
                        >
                            <Text className="text-white font-semibold">Confirmar</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
            </View>
        </KeyboardAvoidingView>
    )
}