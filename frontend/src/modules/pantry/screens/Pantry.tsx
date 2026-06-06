import { View, ScrollView, ActivityIndicator, Alert } from "react-native";
import TopBar from "../components/TopBar";
import ExpirationAlert from "../components/ExpirationAlert";
import IngredientCard from "../components/IngredientCard";
import IngredientRegister from "../components/IngredientRegister";
import BarcodeScanner from "@/src/components/BarcodeScanner";
import { useCallback, useEffect, useState } from "react";
import { listPantryItems, addPantryItem, removePantryItem, PantryItem } from "@/src/services/pantryService";

export default function Pantry() {
    const [items, setItems] = useState<PantryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [registerVisible, setRegisterVisible] = useState(false);
    const [scannerVisible, setScannerVisible] = useState(false);
    const [registerInitial, setRegisterInitial] = useState<{ name?: string; quantity?: string; expirationDate?: string } | undefined>(undefined);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listPantryItems();
            setItems(data);
        } catch (err) {
            console.warn(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    async function handleRegisterSubmit(data: { name: string; quantity?: string; expirationDate?: string }) {
        setLoading(true);
        try {
            await addPantryItem(data);
            setRegisterVisible(false);
            setRegisterInitial(undefined);
            await load();
        } catch (err) {
            console.warn(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove(item: PantryItem) {
        Alert.alert(
            "Excluir item",
            `Tem certeza que deseja excluir \"${item.name}\"? Esta ação não pode ser desfeita.`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removePantryItem(item.id);
                            await load();
                            Alert.alert("Item excluído", "O item foi removido com sucesso.");
                        } catch (error) {
                            const message = error instanceof Error ? error.message : "Não foi possível excluir o item.";
                            Alert.alert("Erro ao excluir", message);
                        }
                    },
                },
            ]
        );
    }

    function parseDateFromBR(dateStr?: string) {
        if (!dateStr) return null;
        const parts = dateStr.split('/').map((p) => Number(p));
        if (parts.length !== 3) return null;
        const [day, month, year] = parts;
        return new Date(year, month - 1, day);
    }

    function isDateInCurrentWeek(dateStr?: string) {
        const d = parseDateFromBR(dateStr);
        if (!d) return false;

        const today = new Date();
        const dayOfWeek = (today.getDay() + 6) % 7;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return d >= startOfWeek && d <= endOfWeek;
    }

    const expiringCount = items.filter((it) => it.expirationDate && isDateInCurrentWeek(it.expirationDate)).length;

    function handleScanDetected(barcode: string, productName?: string) {
        setScannerVisible(false);
        setRegisterInitial({ name: productName || '' });
        setRegisterVisible(true);
    }

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1 bg-white">
                <TopBar onPressAdd={() => setRegisterVisible(true)} onPressScan={() => setScannerVisible(true)} />
                <View className="p-4 gap-4">
                    <ExpirationAlert itemsExpiring={expiringCount} />

                    {loading ? (
                        <ActivityIndicator size="large" color="#f97316" />
                    ) : (
                        <View className="flex flex-col gap-3">
                            {items.map((it) => (
                                <IngredientCard
                                    key={it.id}
                                    name={it.name}
                                    quantity={it.quantity}
                                    expirationDate={it.expirationDate}
                                    onDelete={() => handleRemove(it)}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
            <IngredientRegister
                visible={registerVisible}
                onClose={() => { setRegisterVisible(false); setRegisterInitial(undefined); }}
                onSubmit={handleRegisterSubmit}
                initial={registerInitial}
            />
            <BarcodeScanner visible={scannerVisible} onClose={() => setScannerVisible(false)} onDetected={handleScanDetected} />
        </View>
    );
}

