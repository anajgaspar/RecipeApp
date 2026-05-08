import { View, Text, Pressable, Modal } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from "react";
import IngredientRegister from "./IngredientRegister";

export default function TopBar() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    function openModal() {
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    return (
        <>
            <View className="w-full flex flex-row justify-between items-center bg-orange-50 px-8 pt-12 pb-6" />
            <View className="flex flex-row justify-between p-4 gap-4">
                <Text className="text-2xl font-bold mb-4">Despensa</Text>
                <View className="flex flex-row gap-4">
                    <Pressable
                        // onPress={openModal}
                        className="bg-[#f97316] rounded-full w-10 h-10 items-center justify-center"
                    >
                        <AntDesign name="scan" size={20} color="white" />
                    </Pressable>
                    <Pressable
                        onPress={openModal}
                        className="bg-[#f97316] rounded-full w-10 h-10 items-center justify-center"
                    >
                        <Text className="text-white text-xl font-bold">+</Text>
                    </Pressable>
                </View>
            </View>
            <IngredientRegister visible={isModalOpen} onClose={closeModal} />
        </>
    )
}