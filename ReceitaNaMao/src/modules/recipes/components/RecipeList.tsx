import { TouchableOpacity, Text, View, ScrollView } from "react-native";
import { useState } from "react";

export default function RecipeList() {
    const [activeTab, setActiveTab] = useState("Ingredientes");
    const options = ["Ingredientes", "Instruções"];

    const ingredientes = 
    [{
        ingrediente: "Farinha de trigo",
        quantidade: "2 xícaras"
    }, 
    {
        ingrediente: "Ovo",
        quantidade: 1
    }, 
    {
        ingrediente: "Leite",
        quantidade: "1 xícara"
    }, 
    {
        ingrediente: "Sal",
        quantidade: "A gosto"
    }];
    const instrucoes = ["1. Misture os secos", "2. Adicione os líquidos", "3. Mexa bem", "4. Cozinhe por 30 min"];

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
                        {ingredientes.map((ingrediente, index) => (
                            <View key={index} className="flex flex-row items-center gap-2 py-2">
                                <View className="w-full bg-[#9ca3af]/10 flex flex-row justify-between p-2 rounded-md">
                                    <Text className="text-gray-700">{ingrediente.ingrediente}</Text>
                                    <Text className="text-gray-700">{ingrediente.quantidade}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="gap-3">
                        {instrucoes.map((instrucao, index) => (
                            <View key={index} className="flex flex-row gap-3 py-2">
                                <View className="w-6 h-6 rounded-full bg-[#f97316] items-center justify-center">
                                    <Text className="text-white text-sm font-bold">{index + 1}</Text>
                                </View>
                                <Text className="text-gray-700 flex-1">{instrucao}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    )
}