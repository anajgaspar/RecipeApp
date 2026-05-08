import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from "react";

type IngredientRegisterProps = {
    visible: boolean;
    onClose: () => void;
    onSubmit?: (data: { name: string; quantity?: string }) => void;
    initial?: { name?: string; quantity?: string };
};

export default function IngredientRegister({ visible, onClose, onSubmit, initial }: IngredientRegisterProps) {
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("");

    useEffect(() => {
        if (!visible) return;
        setName(initial?.name ?? "");
        setQuantity(initial?.quantity ?? "");
    }, [visible, initial]);

    function handleSubmit() {
        if (!name.trim()) return;
        onSubmit?.({
            name: name.trim(),
            quantity: quantity.trim() || undefined,
        });
        setName("");
        setQuantity("");
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 justify-center bg-black/40"
            >
                <Pressable className="flex-1 justify-center" onPress={onClose}>
                    <View
                        className="bg-white rounded-t-2xl px-4 pt-4 pb-10"
                        onStartShouldSetResponder={() => true}
                    >
                        <View className="flex flex-col gap-4">
                            <View className="flex flex-row justify-between">
                                <Text className="font-robotoSemibold text-xl">Novo ingrediente</Text>
                                <Pressable onPress={onClose}>
                                    <Ionicons name="close" size={20} color="black" />
                                </Pressable>
                            </View>
                            <View className="flex flex-col gap-3">
                                <View className="bg-[#fdfbf7] rounded-md px-3 py-2">
                                    <Text className="mb-1 text-xs">
                                        Nome
                                    </Text>
                                    <TextInput
                                        className="w-full text-sm py-1"
                                        placeholder="Ex: Arroz"
                                        placeholderTextColor="#9ca3af"
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                                <View className="bg-[#fdfbf7] rounded-md px-3 py-2">
                                    <Text className="mb-1 text-xs">
                                        Quantidade
                                    </Text>
                                    <TextInput
                                        className="w-full text-sm py-1"
                                        placeholder="Ex: 2kg"
                                        placeholderTextColor="#9ca3af"
                                        value={quantity}
                                        onChangeText={setQuantity}
                                    />
                                </View>
                            </View>
                            <Pressable
                                onPress={handleSubmit}
                                className="bg-[#f97316] py-4 rounded-md items-center"
                            >
                                <Text className="text-white font-semibold">Salvar</Text>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
}
