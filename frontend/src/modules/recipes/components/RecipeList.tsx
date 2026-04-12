import { TouchableOpacity, Text, View, ScrollView } from "react-native";
import { useState } from "react";
import { Recipe } from "@/src/services/recipeService";

type RecipeListProps = {
    ingredients: Recipe["ingredients"];
    steps: Recipe["steps"];
};

export default function RecipeList({ ingredients, steps }: RecipeListProps) {
    const [activeTab, setActiveTab] = useState("Ingredientes");
    const options = ["Ingredientes", "Instruções"];

    return (
        <View className="flex-1">
            <View className="flex flex-row gap-2 p-4">
                {options.map((item) => (
                    <TouchableOpacity
                        onPress={() => setActiveTab(item)}
                        className={`px-4 py-2 rounded-md flex-1 items-center ${
                            activeTab === item
                                ? "bg-[#f97316]"
                                : "bg-[#9ca3af]/20"
                        }`}
                        key={item}
                    >
                        <Text className={activeTab === item ? "text-white font-semibold" : "text-gray-600"}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <ScrollView className="flex-1 px-4">
                {activeTab === "Ingredientes" ? (
                    <View>
                        {ingredients.map((ingredient) => (
                            <View key={ingredient.id} className="flex flex-row items-center gap-2 py-2">
                                <View className="w-full bg-[#9ca3af]/10 flex flex-row justify-between p-2 rounded-md">
                                    <Text className="text-gray-700">{ingredient.name}</Text>
                                    <Text className="text-gray-700">{ingredient.quantityValue} {ingredient.quantityUnit}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="gap-3">
                        {steps.map((step) => (
                            <View key={step.id} className="flex flex-row gap-3 py-2">
                                <View className="w-6 h-6 rounded-full bg-[#f97316] items-center justify-center">
                                    <Text className="text-white text-sm font-bold">{step.stepNumber}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-700">{step.instruction}</Text>
                                    {step.timerSeconds ? (
                                        <Text className="text-xs text-[#9ca3af] mt-1">Timer: {Math.ceil(step.timerSeconds / 60)} min</Text>
                                    ) : null}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    )
}