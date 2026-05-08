import { useState } from "react";
import { View, Text } from "react-native";
import Feather from '@expo/vector-icons/Feather';

export default function ExpirationAlert() {
    const [items, setItems] = useState(0); 
    
    return (
        <View className="flex flex-row gap-4 rounded-lg p-4 border border-[#f97316] bg-[#f97316]/5">
            <Feather className="bg-[#f97316]/10 p-2 rounded-full" name="alert-circle" size={24} color="#f97316" />
            <View className="flex flex-col">
                <Text className="text-lg font-bold">Alerta de Vencimento</Text>
                <Text className="text-md text-black/60">{items} itens irão vencer em breve.</Text>
            </View>
        </View>
    )
}
