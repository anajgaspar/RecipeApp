import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, View, Text } from 'react-native';

export default function ConfirmEmail({ navigation }: { navigation: any }) {
    return (
        <View className="h-full flex flex-col justify-center items-center">
            <Pressable onPress={() => navigation.replace('Signup')} className='absolute top-16 left-8'>
                <FontAwesome6 name="arrow-left" size={24} color="black" />
            </Pressable>
            <View className="w-full h-full flex flex-col justify-center items-center gap-4 m-8 p-8">
                <MaterialCommunityIcons name="email-check-outline" size={80} color="black" />
                <Text className="font-robotoSemibold text-lg">Confirmação de e-mail</Text>
                <Text className="text-center">Por favor, clique no botão abaixo para validar seu endereço de e-mail.</Text>
                <Pressable className="w-full bg-[#f97316] p-3 rounded-md">
                    <Text className="text-center text-white font-semibold">Validar e-mail</Text>
                </Pressable>
            </View>
        </View>
    )
}