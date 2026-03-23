import { View, Text, ScrollView } from "react-native";

export default function Search() {
    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-4">
                <Text className="text-2xl font-bold mb-4">Busca</Text>
            </View>
        </ScrollView>
    )
}
