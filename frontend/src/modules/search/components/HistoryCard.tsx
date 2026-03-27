import { View, Image, Text } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HistoryCard() {
    return (
        <View className="flex flex-row gap-4 bg-white rounded-xl border border-[#9ca3af] p-4">
            <Image
                source={{ uri: 'https://guiadacozinha.com.br/wp-content/uploads/2019/10/lasanha-bolonhesa.jpg' }}
                className="w-28 h-28 rounded-xl"
                resizeMode="cover"
            />
            <View className="flex flex-col gap-4">
                <Text className="font-semibold text-lg">Lasanha Bolonhesa</Text>
                <View className="flex flex-col gap-4">
                    <View className="flex flex-row items-center gap-1">
                        <Ionicons name="star" size={22} color="#FFD700" />
                        <Text className="text-xl">4.5</Text>
                    </View>
                    <View className="flex flex-row justify-between">
                        <View className="flex flex-row items-center gap-1">
                            <FontAwesome6 name="clock" size={16} color="#9ca3af" />
                            <Text className="text-[#9ca3af]">30min</Text>
                        </View>
                        <View className="flex flex-row items-center gap-1">
                            <FontAwesome6 name="arrow-trend-up" size={16} color="#9ca3af" />
                            <Text className="text-[#9ca3af]">Fácil</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View className="absolute right-4 top-4">
                <Ionicons name="close-outline" size={24} color="black" />
            </View>
        </View>
    )
}