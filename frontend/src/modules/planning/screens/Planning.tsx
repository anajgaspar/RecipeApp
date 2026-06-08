import { View } from "react-native";
import TopBar from "../components/TopBar";
import MealPlanning from "../components/Planner";
import { useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import MealPlanExporter, { MealPlanExporterRef } from "../components/MealPlanExporter";

export default function Planning() {
    const navigation = useNavigation<any>();
    const [sharePlanningHandler, setSharePlanningHandler] = useState<(() => void) | undefined>();
    const exporterRef = useRef<MealPlanExporterRef>(null);

    return (
        <View className="flex-1 bg-white">
            <TopBar onPressShare={sharePlanningHandler} />
            <MealPlanning
                navigation={navigation}
                exporterRef={exporterRef}
                onSharePlanningReady={(handler) => {
                    setSharePlanningHandler(() => handler);
                }}
            />
            <MealPlanExporter ref={exporterRef} />
        </View>
    )
}
