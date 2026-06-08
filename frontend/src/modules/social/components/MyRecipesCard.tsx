import { Recipe } from "@/src/services/recipeService";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useEffect, useState } from "react";
import { View, Image, Text, Pressable } from "react-native";

type MyRecipesCardProps = {
    recipe: Recipe;
    onOpen: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function MyRecipesCard({ recipe, onOpen, onEdit, onDelete }: MyRecipesCardProps) {
    const [isImageError, setIsImageError] = useState(false);

    useEffect(() => {
        setIsImageError(false);
    }, [recipe.imageUrl]);

    return (
        <Pressable onPress={onOpen} className="flex flex-row gap-4 bg-white rounded-xl border border-[#9ca3af] p-4">
            {!isImageError && recipe.imageUrl ? (
                <Image
                    source={{ uri: recipe.imageUrl }}
                    className="w-28 h-28 rounded-xl"
                    resizeMode="cover"
                    onError={() => setIsImageError(true)}
                />
            ) : (
                <View className="w-28 h-28 rounded-xl bg-[#f3f4f6] items-center justify-center">
                    <FontAwesome6 name="image" size={18} color="#9ca3af" />
                </View>
            )}
            <View className="flex-1 flex-col gap-2">
                <Text className="font-semibold text-lg" numberOfLines={1}>{recipe.title}</Text>
                <View className="flex flex-col justify-between gap-2">
                    <View className="flex flex-row items-center gap-1">
                        <FontAwesome6 name="clock" size={16} color="#9ca3af" />
                        <Text className="text-[#9ca3af]">{recipe.prepTimeMinutes}min</Text>
                    </View>
                    <View className="flex flex-row items-center gap-1">
                        <FontAwesome6 name="arrow-trend-up" size={16} color="#9ca3af" />
                        <Text className="text-[#9ca3af]">{recipe.difficulty}</Text>
                    </View>
                </View>
            </View>
            <View className="absolute right-4 flex justify-center self-center gap-2">
                <Pressable
                    onPress={(event) => {
                        event.stopPropagation();
                        onEdit();
                    }}
                    hitSlop={8}
                >
                    <FontAwesome6 name="pen-to-square" size={20} color="black" />
                </Pressable>
                <Pressable
                    onPress={(event) => {
                        event.stopPropagation();
                        onDelete();
                    }}
                    hitSlop={8}
                >
                    <FontAwesome6 name="trash-can" size={20} color="black" />
                </Pressable>
            </View>
        </Pressable>
    )
}

