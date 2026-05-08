import { View, Text } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function IngredientCard() {
    return (
        <View className="flex flex-col gap-2 rounded-lg p-4 border border-[#9ca3af]">
            <View className="flex flex-row justify-between">
                <View className="gap-2">
                    <View className="flex flex-row">
                        <View className="flex flex-row items-center gap-4">
                            <Text className="text-lg font-bold">Ingrediente</Text>
                            <Text className="text-lg font-bold">&#8226;</Text>
                            <Text className="text-md text-black/60">Quantidade</Text>
                        </View>
                    </View>
                    <View className="flex flex-row items-center gap-2">
                        <FontAwesome5 name="calendar" size={14} color="black" />
                        <Text className="text-sm">Vence em: DD/MM/AAAA</Text>
                    </View>
                </View>
                <View className="flex flex-col items-center justify-between gap-2">
                    <View className="flex flex-row items-center gap-1">
                        <FontAwesome6 name="pen-to-square" size={16} color="black" />
                        <Text className="text-[#9ca3af]"></Text>
                    </View>
                    <View className="flex flex-row items-center gap-1">
                        <FontAwesome6 name="trash-can" size={16} color="black" />
                        <Text className="text-[#9ca3af]"></Text>
                    </View>
                </View>
            </View>
        </View>
    )
}