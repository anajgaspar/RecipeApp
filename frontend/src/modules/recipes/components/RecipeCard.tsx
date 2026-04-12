import { View, Image, Text } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Recipe } from "@/src/services/recipeService";

type RecipeCardProps = {
    recipe: Recipe;
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
    const firstCategory = recipe.category[0] ?? "Sem categoria";

    return (
        <View className="w-full">
            <View className="w-full flex flex-col">
                <View className="relative">
                    <Image
                        source={{ uri: recipe.imageUrl }}
                        className="w-full h-56 rounded-t-xl"
                        resizeMode="cover"
                    />
                    <View className="absolute top-2 right-2 bg-white rounded-full p-2">
                        <FontAwesome6 name="heart" size={24} color="black" />
                    </View>
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