import { Pressable, View, Text } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/src/modules/auth/context/AuthContext";

export default function TopBar() {
    const navigation = useNavigation<any>();
    const { signOut } = useAuth();

    async function handleLogout() {
        await signOut();
        navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
        });
    }

    return (
        <View className="w-full flex flex-row justify-between items-center bg-orange-50 px-8 pt-12 pb-6">
            <Text className="font-robotoSemibold text-xl">Receita Na Mão</Text>
            <View className="flex flex-row items-center gap-5">
                <FontAwesome6 name="bell" size={24} color="black" />
                <Pressable onPress={handleLogout}>
                    <FontAwesome6 name="right-from-bracket" size={22} color="black" />
                </Pressable>
            </View>
        </View>
    )   
}