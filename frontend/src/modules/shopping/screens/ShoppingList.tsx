import { View, ScrollView, ActivityIndicator, Alert, Text } from "react-native";
import TopBar from "../components/TopBar";
import IngredientCard from "../components/IngredientCard";
import IngredientRegister from "../components/IngredientRegister";
import BarcodeScanner from "@/src/components/BarcodeScanner";
import { useCallback, useEffect, useState } from "react";
import { listShoppingItems, addShoppingItem, updateShoppingItem, removeShoppingItem, ShoppingListItem } from "@/src/services/shoppingListService";

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
        try {
            await updateShoppingItem(item.id, { checked: !item.checked });
            await load();
        } catch (err) {
            console.warn(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove(item: ShoppingListItem) {
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
                            await removeShoppingItem(item.id);
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

    function handleScanDetected(barcode: string, productName?: string) {
        setScannerVisible(false);
        setRegisterInitial({ name: productName || '' });
        setRegisterVisible(true);
    }

    const checkedCount = items.filter((it) => it.checked).length;
    const allChecked = items.length > 0 && checkedCount === items.length;

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1 bg-white">
                <TopBar onPressAdd={() => setRegisterVisible(true)} onPressScan={() => setScannerVisible(true)} />
                <View className="p-4 gap-4">
                    {loading ? (
                        <ActivityIndicator size="large" color="#f97316" />
                    ) : items.length === 0 ? (
                        <View className="items-center justify-center gap-2">
                            <Text className="text-lg font-semibold text-center">
                                Sua lista de compras está vazia!
                            </Text>
                            <Text className="text-gray-400 text-center px-8">
                                Adicione um ingrediente tocando no{" "}
                                <Text className="text-orange-400 font-semibold">+</Text>{" "}
                                ou escaneando um produto.
                            </Text>
                        </View>
                    ) : (
                        <>
                            {allChecked && (
                                <View className="flex-row items-center gap-2 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
                                    <Text className="text-xl">🎉</Text>
                                    <Text className="text-sm text-green-700 font-medium flex-1">
                                        Tudo comprado!
                                    </Text>
                                </View>
                            )}

                            <View className="flex flex-col gap-3">
                                {items.map((it) => (
                                    <IngredientCard
                                        key={it.id}
                                        name={it.name}
                                        quantity={it.quantity}
                                        checked={it.checked}
                                        onToggle={() => handleToggle(it)}
                                        onDelete={() => handleRemove(it)}
                                    />
                                ))}
                            </View>
                        </>
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

