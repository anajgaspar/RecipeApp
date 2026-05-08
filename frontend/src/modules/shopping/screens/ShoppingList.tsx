import { View, ScrollView, ActivityIndicator } from "react-native";
import TopBar from "../components/TopBar";
import IngredientCard from "../components/IngredientCard";
import IngredientRegister from "../components/IngredientRegister";
import BarcodeScanner from "@/src/components/BarcodeScanner";
import { useCallback, useEffect, useState } from "react";
import ActionButton from "@/src/components/ActionButton";
import { listShoppingItems, addShoppingItem, updateShoppingItem, removeShoppingItem, ShoppingListItem, clearShoppingList } from "@/src/services/shoppingListService";

export default function ShoppingList() {
    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [registerVisible, setRegisterVisible] = useState(false);
    const [scannerVisible, setScannerVisible] = useState(false);
    const [registerInitial, setRegisterInitial] = useState<{ name?: string; quantity?: string } | undefined>(undefined);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listShoppingItems();
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

    async function handleRegisterSubmit(data: { name: string; quantity?: string }) {
        setLoading(true);
        try {
            await addShoppingItem(data);
            setRegisterVisible(false);
            setRegisterInitial(undefined);
            await load();
        } catch (err) {
            console.warn(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleToggle(item: ShoppingListItem) {
        setLoading(true);
        try {
            await updateShoppingItem(item.id, { checked: !item.checked });
            await load();
        } catch (err) {
            console.warn(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove(itemId: string) {
        setLoading(true);
        try {
            await removeShoppingItem(itemId);
            await load();
        } catch (err) {
            console.warn(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleClear() {
        setLoading(true);
        try {
            await clearShoppingList();
            await load();
        } catch (err) {
            console.warn(err);
        } finally {
            setLoading(false);
        }
    }

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
                    {loading ? (
                        <ActivityIndicator size="large" color="#f97316" />
                    ) : (
                        <View className="flex flex-col gap-3">
                            {items.map((it) => (
                                <IngredientCard
                                    key={it.id}
                                    name={it.name}
                                    quantity={it.quantity}
                                    checked={it.checked}
                                    onToggle={() => handleToggle(it)}
                                    onDelete={() => handleRemove(it.id)}
                                />
                            ))}
                        </View>
                    )}

                    {items.length > 0 && (
                        <ActionButton
                            label="Limpar lista de compras"
                            onPress={handleClear}
                            variant="outline"
                        />
                    )}
                </View>
            </ScrollView>

            <IngredientRegister
                visible={registerVisible}
                onClose={() => setRegisterVisible(false)}
                onSubmit={handleRegisterSubmit}
                initial={registerInitial}
            />

            <BarcodeScanner visible={scannerVisible} onClose={() => setScannerVisible(false)} onDetected={handleScanDetected} />
        </View>
    );
}

