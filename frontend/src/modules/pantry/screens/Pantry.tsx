import { View, ScrollView } from "react-native";
import TopBar from "../components/TopBar";
import ExpirationAlert from "../components/ExpirationAlert";
import IngredientCard from "../components/IngredientCard";
export default function Pantry() {
    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1 bg-white">
                <TopBar />
                <View className="p-4 gap-4">
                    <ExpirationAlert />
                    <IngredientCard />
                </View>
            </ScrollView>
        </View>
    )
}
