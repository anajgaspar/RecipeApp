import { Pressable, View, Text } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

type IngredientCardProps = {
    name: string;
    quantity?: string;
    checked: boolean;
    onToggle: () => void;
};

export default function IngredientCard({ name, quantity, checked, onToggle }: IngredientCardProps) {
    const displayQuantity = quantity?.trim();

    return (
        <View className="flex flex-col gap-2 rounded-lg p-4 border border-[#9ca3af]">
            <View className="flex flex-row justify-between items-center">
                <View className="flex flex-row items-center flex-1 min-w-0">
                    <View className="flex flex-row items-center gap-3 flex-1 min-w-0">
                        <Text className={`text-lg font-bold flex-shrink ${checked ? "line-through text-gray-400" : ""}`} numberOfLines={1}>
                            {name}
                        </Text>
                        <Text className={`text-lg font-bold ${checked ? "text-gray-400" : ""}`}>&#8226;</Text>
                        <Text className={`text-md text-black/60 ${checked ? "line-through text-gray-400" : ""}`} flex-shrink numberOfLines={1}>
                            {displayQuantity || "Sem quantidade"}
                        </Text>
                    </View>
                </View>
                <View className="flex flex-row items-center gap-2">
                    <Pressable
                        onPress={onToggle}
                        className={`h-7 w-7 items-center justify-center rounded-full border ${checked ? "border-[#f97316] bg-[#f97316]" : "border-[#9ca3af] bg-white"
                            }`}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked }}
                    >
                        {checked ? (
                            <Ionicons name="checkmark" size={18} color="white" />
                        ) : null}
                    </Pressable>
                </View>
            </View>
        </View>
    )
}
