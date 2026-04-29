import { View, Image, Text, Pressable } from "react-native";
import { useEffect, useState } from "react";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Recipe } from "@/src/services/recipeService";

type RecipeCardProps = {
    recipe: Recipe;
    isFavorited?: boolean;
    onFavorite?: () => void;
};

export default function RecipeCard({ recipe, isFavorited = false, onFavorite }: RecipeCardProps) {
    const firstCategory = recipe.category[0] ?? "Sem categoria";
    const [isImageError, setIsImageError] = useState(false);

    useEffect(() => {
        setIsImageError(false);
    }, [recipe.imageUrl]);

    return (
        <View className="w-full">
            <View className="w-full flex flex-col">
                <View className="relative">
                    {!isImageError && recipe.imageUrl ? (
                        <Image
                            source={{ uri: recipe.imageUrl }}
                            className="w-full h-56 rounded-t-xl"
                            resizeMode="cover"
                            onError={() => setIsImageError(true)}
                        />
                    ) : (
                        <View className="w-full h-56 rounded-t-xl bg-[#f3f4f6] items-center justify-center">
                            <FontAwesome6 name="image" size={24} color="#9ca3af" />
                            <Text className="text-[#9ca3af] mt-2">Imagem indisponível</Text>
                        </View>
                    )}
                    {onFavorite ? (
                        <Pressable onPress={onFavorite} className="absolute top-2 right-2 bg-white rounded-full p-2">
                            <Ionicons name={isFavorited ? "heart" : "heart-outline"} size={24} color={isFavorited ? "#ef4444" : "black"} />
                        </Pressable>
                    ) : (
                        <View className="absolute top-2 right-2 bg-white rounded-full p-2">
                            <Ionicons name={isFavorited ? "heart" : "heart-outline"} size={24} color={isFavorited ? "#ef4444" : "black"} />
                        </View>
                    )}
                </View>
                <View className="flex flex-row">
                    <Text className="absolute bottom-2 left-2 bg-white py-1 px-2 rounded-full">{firstCategory}</Text>
                </View>
            </View>
            <View className="w-full flex flex-col gap-2 rounded-b-xl border border-t-[0px] border-[#9ca3af]/80 p-4">
                <Text className="font-semibold text-xl">{recipe.title}</Text>
                <View className="flex flex-row justify-between">
                    <View className="flex flex-row gap-4">
                        <View className="flex flex-row items-center gap-1">
                            <FontAwesome6 name="clock" size={16} color="#9ca3af" />
                            <Text className="text-[#9ca3af]">{recipe.prepTimeMinutes}min</Text>
                        </View>
                        <View className="flex flex-row items-center gap-1">
                            <FontAwesome6 name="arrow-trend-up" size={16} color="#9ca3af" />
                            <Text className="text-[#9ca3af]">{recipe.difficulty}</Text>
                        </View>
                    </View>
                    {/* <View className="flex flex-row items-center gap-1">
                        <Ionicons name="star" size={22} color="#FFD700" />
                        <Text className="text-[#9ca3af] text-xl">4.5</Text>
                    </View> */}
                </View>
            </View>
        </View>
    )
}