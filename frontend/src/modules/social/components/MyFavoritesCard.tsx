import { Recipe } from "@/src/services/recipeService";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Image, Text, Pressable } from "react-native";

type MyFavoritesCardProps = {
    recipe: Recipe;
    onOpen: () => void;
    onFavorite: () => void;
};

export default function MyFavoritesCard({ recipe, onOpen, onFavorite }: MyFavoritesCardProps) {
    return (
        <Pressable onPress={onOpen} className="flex flex-row gap-4 bg-white rounded-xl border border-[#9ca3af] p-4">
            <Image
                source={{ uri: recipe.imageUrl }}
                className="w-28 h-28 rounded-xl"
                resizeMode="cover"
            />
            <View className="flex flex-col gap-2">
                <Text className="font-semibold text-lg">{recipe.title}</Text>
                <View className="flex flex-row justify-between gap-2">
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
            <View className="absolute right-4 flex justify-center self-center">
                <Pressable
                    onPress={(event) => {
                        event.stopPropagation();
                        onFavorite();
                    }}
                    hitSlop={8}
                >
                    <Ionicons name="heart" size={20} color="#ef4444" />
                </Pressable>
            </View>
        </Pressable>
    )
}

