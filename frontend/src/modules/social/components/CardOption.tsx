import Feather from "@expo/vector-icons/Feather";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { View, Text, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { listFavoriteRecipes, getMyRecipes } from "@/src/services/recipeService";
import { useAuth } from "@/src/modules/auth/context/AuthContext";

export default function CardOption() {
    const navigation = useNavigation<any>();

    const { profiles } = useAuth();
    const [favoritesCount, setFavoritesCount] = useState<number | null>(null);
    const [recipesCount, setRecipesCount] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            listFavoriteRecipes()
                .then((data) => setFavoritesCount(data.filter((item) => item.recipe).length))
                .catch(() => setFavoritesCount(null));

            getMyRecipes(50)
                .then((data) => setRecipesCount(data.length))
                .catch(() => setRecipesCount(null));
        }, [])
    );

    const options = [
        {
            icon: "heart",
            title: "Meus Favoritos",
            route: "MyFavorites",
            count: favoritesCount,
        },
        {
            icon: "book-open",
            title: "Minhas Receitas",
            route: "MyRecipes",
            count: recipesCount,
        },
        {
            icon: "users",
            title: "Membros da Família",
            route: "FamilyProfiles",
            count: profiles.length
        },
        {
            icon: "bar-chart",
            title: "Relatórios",
            route: "MyReports",
            count: null
        },
        {
            icon: "settings",
            title: "Editar perfil",
            route: "EditProfile",
            count: null
        }
    ]

    function handleOptionPress(route: string | null) {
        if (!route) {
            return;
        }

        navigation.navigate(route);
    }

    return (
        <View className="w-full flex gap-1 px-4 py-6">
            {options.map((option) => (
                <Pressable onPress={() => handleOptionPress(option.route)} key={option.title} className="flex flex-row justify-between p-4  border border-gray-200 rounded-md">
                    <View className="flex flex-row items-center gap-2">
                        <Feather name={option.icon as any} size={22} color="black" />
                        <Text>{option.title}</Text>
                    </View>
                    <View className="flex flex-row items-center gap-2">
                        {option.count !== null && (
                            <Text className="text-sm bg-orange-50 p-2 rounded-full">
                                {option.count}
                            </Text>
                        )}
                        <Feather name="chevron-right" size={22} color="#9ca3af" />
                    </View>
                </Pressable>
            ))}
        </View>
    )
}