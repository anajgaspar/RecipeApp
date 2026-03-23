import { View, Image, Text } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function RecipeCard() {
    return (
        <View className="h-full flex">
            <View className="w-full flex flex-col">
                <View className="relative">
                    <Image
                        source={{ uri: 'https://guiadacozinha.com.br/wp-content/uploads/2019/10/lasanha-bolonhesa.jpg' }}
                        className="w-full h-56 rounded-t-xl"
                        resizeMode="cover"
                    />
                    <View className="absolute top-2 right-2 bg-white rounded-full p-2">
                        <FontAwesome6 name="heart" size={24} color="black" />
                    </View>
                </View>
                <View className="flex flex-row">
                    <Text className="absolute bottom-2 left-2 bg-white py-1 px-2 rounded-full">Cetogênica</Text>
                </View>
            </View>
            <View className="w-full flex flex-col gap-2 rounded-b-xl border border-t-[0px] border-[#9ca3af] p-4">
                <Text className="font-semibold text-xl">Lasanha Bolonhesa</Text>
                <View className="flex flex-row justify-between">
                    <View className="flex flex-row gap-4">
                        <View className="flex flex-row items-center gap-1">
                            <FontAwesome6 name="clock" size={16} color="#9ca3af" />
                            <Text className="text-[#9ca3af]">30min</Text>
                        </View>
                        <View className="flex flex-row items-center gap-1">
                            <FontAwesome6 name="arrow-trend-up" size={16} color="#9ca3af" />
                            <Text className="text-[#9ca3af]">Fácil</Text>
                        </View>
                    </View>
                    <View className="flex flex-row items-center gap-1">
                        <Ionicons name="star" size={22} color="#FFD700" />
                        <Text className="text-[#9ca3af] text-xl">4.5</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}