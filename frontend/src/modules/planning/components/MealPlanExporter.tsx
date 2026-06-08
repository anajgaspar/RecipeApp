import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { WebView } from "react-native-webview";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { SharedMealPlanPayload, buildMealPlanSvg } from "../utils/mealPlanSharing";

export type MealPlanExporterRef = {
    share: (payload: SharedMealPlanPayload) => Promise<void>;
};

const WIDTH = 1440;
const HEIGHT = 900;

const MealPlanExporter = forwardRef<MealPlanExporterRef>((_, ref) => {
    const viewShotRef = useRef<ViewShot>(null);
    const resolveRef = useRef<(() => void) | null>(null);
    const [html, setHtml] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
        share: async (payload) => {
            const svg = buildMealPlanSvg(payload);
            setHtml(`<html><body style="margin:0;padding:0;background:white;">${svg}</body></html>`);

            await new Promise<void>((resolve) => {
                resolveRef.current = resolve;
            });

            try {
                const uri = await (viewShotRef.current as any).capture();
                setHtml(null);
                await Sharing.shareAsync(uri, {
                    mimeType: "image/png",
                    dialogTitle: "Compartilhar planejamento semanal",
                });
            } catch {
                setHtml(null);
                Alert.alert("Erro", "Não foi possível gerar a imagem.");
            }
        },
    }));

    MealPlanExporter.displayName = "MealPlanExporter";

    if (!html) return null;

    return (
        <View style={{ position: "absolute", opacity: 0.01, top: 0, left: 0, width: WIDTH, height: HEIGHT }}>
            <ViewShot
                ref={viewShotRef}
                style={{ width: WIDTH, height: HEIGHT }}
                options={{ format: "png", quality: 1, width: WIDTH, height: HEIGHT }}
            >
                <WebView
                    source={{ html }}
                    style={{ width: WIDTH, height: HEIGHT }}
                    scrollEnabled={false}
                    onLoadEnd={() => {
                        setTimeout(() => resolveRef.current?.(), 1500);
                    }}
                />
            </ViewShot>
        </View>
    );
});

export default MealPlanExporter;