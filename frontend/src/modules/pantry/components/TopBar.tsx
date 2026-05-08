import { View, Text, Pressable } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';

type TopBarProps = {
    onPressAdd?: () => void;
    onPressScan?: () => void;
};

export default function TopBar({ onPressAdd, onPressScan }: TopBarProps) {
    return (
        <>
            <View className="w-full flex flex-row justify-between items-center bg-orange-50 px-8 pt-12 pb-6" />
            <View className="flex flex-row justify-between p-4 gap-4">
                <Text className="text-2xl font-bold mb-4">Despensa</Text>
                <View className="flex flex-row gap-4">
                    <Pressable
                        onPress={typeof onPressScan === 'function' ? onPressScan : undefined}
                        className="bg-[#f97316] rounded-full w-10 h-10 items-center justify-center"
                    >
                        <AntDesign name="scan" size={20} color="white" />
                    </Pressable>
                    <Pressable
                        onPress={onPressAdd}
                        className="bg-[#f97316] rounded-full w-10 h-10 items-center justify-center"
                    >
                        <Text className="text-white text-xl font-bold">+</Text>
                    </Pressable>
                </View>
            </View>
        </>
    )
}
