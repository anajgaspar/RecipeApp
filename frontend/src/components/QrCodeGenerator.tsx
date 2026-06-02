import { View, Text, } from "react-native";
import QRCode from 'react-native-qrcode-svg';

type GenerateQrCodeProps = {
    recipeId: string;
    recipeTitle: string;
};

export default function QrCodeGenerator({ recipeId, recipeTitle }: GenerateQrCodeProps) {
    const qrCodeValue = `receitanamao://recipe/${recipeId}`;

    return (
        <View>
            <Text>Compartilhar Receita</Text>
            <Text>Escaneie o código abaixo para abrir {recipeTitle}!</Text>
            <View>
                <QRCode
                    value={qrCodeValue}
                    size={220}
                    backgroundColor="white"
                    color="black"
                />
            </View>
        </View>
    )
}