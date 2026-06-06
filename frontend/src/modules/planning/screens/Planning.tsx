import { View } from "react-native";
import TopBar from "../components/TopBar";
import MealPlanning from "../components/Planner";
import { useState } from "react";

export default function Planning() {
    const [sharePlanningHandler, setSharePlanningHandler] = useState<(() => void) | undefined>();

    return (
        <View className="flex-1 bg-white">
            <TopBar onPressShare={sharePlanningHandler} />
            <MealPlanning
                onSharePlanningReady={(handler) => {
                    setSharePlanningHandler(() => handler);
                }}
            />
        </View>
    )
}
