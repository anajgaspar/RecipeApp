import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

type IngredientRegisterProps = {
    visible: boolean;
    onClose: () => void;
    onSubmit?: (data: { name: string; quantity?: string; expirationDate?: string }) => void;
    initial?: { name?: string; quantity?: string; expirationDate?: string };
};

export default function IngredientRegister({ visible, onClose, onSubmit, initial }: IngredientRegisterProps) {
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const formattedDate = date.toLocaleDateString("pt-BR");

    function parseDateFromBR(dateStr?: string) {
        if (!dateStr) return null;
        const parts = dateStr.split('/').map((p) => Number(p));
        if (parts.length !== 3) return null;
        const [day, month, year] = parts;
        return new Date(year, month - 1, day);
    }

    // initialize from `initial` when dialog opens or when initial changes
    useEffect(() => {
        if (!visible) return;
        if (initial?.name) setName(initial.name);
        else setName("");

        if (initial?.quantity) setQuantity(initial.quantity);
        else setQuantity("");

        if (initial?.expirationDate) {
            const parsed = parseDateFromBR(initial.expirationDate);
            if (parsed) setDate(parsed);
            else setDate(new Date());
        } else {
            setDate(new Date());
        }
    }, [visible, initial]);

    function handleSubmit() {
        if (!name.trim()) return;
        onSubmit?.({
            name: name.trim(),
            quantity: quantity.trim() || undefined,
            expirationDate: formattedDate,
        });
        setName("");
        setQuantity("");
        setDate(new Date());
    }

    function handleDateChange(event: any, selectedDate?: Date) {
        if (Platform.OS !== "ios") {
            setShowDatePicker(false);
        }

        if (event?.type === "dismissed") {
            return;
        }

        if (selectedDate) {
            setDate(selectedDate);
        }
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
                                <View className="bg-[#fdfbf7] rounded-md px-3 py-2">
                                    <Text className="mb-1 text-xs">
                                        Data de vencimento
                                    </Text>
                                    <Pressable
                                        onPress={() => setShowDatePicker(true)}
                                        className="flex-row items-center justify-between rounded-md border border-orange-100 bg-white px-3 py-3"
                                    >
                                        <Text className="text-sm text-slate-700">
                                            {formattedDate}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={18} color="#f97316" />
                                    </Pressable>
                                    {showDatePicker && (
                                        <View className="mt-3 overflow-hidden rounded-xl border border-orange-100 bg-white">
                                            <DateTimePicker
                                                value={date}
                                                mode="date"
                                                display={Platform.OS === "ios" ? "spinner" : "default"}
                                                themeVariant="light"
                                                accentColor="#f97316"
                                                onChange={handleDateChange}
                                            />
                                        </View>
                                    )}
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