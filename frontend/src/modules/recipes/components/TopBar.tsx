import { View, Text } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation } from "@react-navigation/native";

export default function TopBar() {
    return (
        <View className="w-full flex flex-row justify-between items-center bg-orange-50 px-8 pt-12 pb-6">
            <Text className="font-robotoSemibold text-xl">Receita Na Mão</Text>
            <View className="flex flex-row items-center gap-5">
                <FontAwesome6 name="bell" size={24} color="black" />
            </View>
        </View>
    )
}