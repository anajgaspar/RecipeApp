import { View, Text, Pressable } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

type IngredientCardProps = {
    name: string;
    quantity?: string;
    expirationDate?: string;
    onEdit?: () => void;
    onDelete?: () => void;
};

export default function IngredientCard({ name, quantity, expirationDate, onEdit, onDelete }: IngredientCardProps) {
    return (
        <View className="flex flex-col gap-2 rounded-lg p-4 border border-[#9ca3af]">
            <View className="flex flex-row justify-between">
                <View className="gap-2 flex-1">
                    <View className="flex flex-row">
                        <View className="flex flex-row items-center gap-4">
                            <Text className="text-lg font-bold flex-wrap" numberOfLines={1}>{name}</Text>
                            {quantity && (
                                <>
                                    <Text className="text-lg font-bold">&#8226;</Text>
                                    <Text className="text-md text-black/60">{quantity}</Text>
                                </>
                            )}
                        </View>
                    </View>
                    {expirationDate && (
                        <View className="flex flex-row items-center gap-2">
                            <FontAwesome5 name="calendar" size={14} color="black" />
                            <Text className="text-sm">Vence em: {expirationDate}</Text>
                        </View>
                    )}
                </View>
                <View className="flex flex-col items-center justify-between gap-2">
                    {onEdit && (
                        <Pressable onPress={onEdit} className="flex flex-row items-center gap-1">
                            <FontAwesome6 name="pen-to-square" size={16} color="black" />
                        </Pressable>
                    )}
                    {onDelete && (
                        <Pressable onPress={onDelete} className="flex flex-row items-center gap-1">
                            <FontAwesome6 name="trash-can" size={16} color="#dc2626" />
                        </Pressable>
                    )}
                </View>
            </View>
        </View>
    )
}