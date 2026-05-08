import { View, ScrollView } from "react-native";
import TopBar from "../components/TopBar";
import IngredientCard from "../../pantry/components/IngredientCard";

export default function ShoppingList() {
    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1 bg-white">
                <TopBar />
                <View className="p-4 gap-4">
                    <IngredientCard />
                </View>
            </ScrollView>
        </View>
    );
}