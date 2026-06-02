import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Alert, Share } from 'react-native';

interface ShareProgressProps {
    recipeTitle: string;
    imageUrl?: string | null;
}

export async function shareRecipeProgress({ recipeTitle, imageUrl }: ShareProgressProps) {
    const isSharingAvailable = await Sharing.isAvailableAsync();
    
    if (!isSharingAvailable) {
        Alert.alert("Erro", "O compartilhamento não está disponível neste dispositivo.");
        return;
    }

    try {
        const message = `Acabei de concluir a receita "${recipeTitle}"! 🎉`;

        if (imageUrl && imageUrl.startsWith('data:image')) {
            const base64Code = imageUrl.split(';base64,').pop();

            if (!base64Code) {
                throw new Error("Formato Base64 inválido.");
            }

            const filename = `progress-${Date.now()}.jpg`;
            
            const cacheDir = (FileSystem as any).cacheDirectory;
            const localUri = `${cacheDir}${filename}`;

            await (FileSystem as any).writeAsStringAsync(localUri, base64Code, {
                encoding: 'base64',
            });

            await Sharing.shareAsync(localUri, {
                dialogTitle: 'Compartilhar meu progresso!',
                mimeType: 'image/jpeg',
            });
        } 
        else if (imageUrl && imageUrl.startsWith('file://')) {
            await Sharing.shareAsync(imageUrl, {
                dialogTitle: 'Compartilhar meu progresso!',
                mimeType: 'image/jpeg',
            });
        } 
        else {
            await Share.share({ message });
        }
    } catch (error) {
        console.error("Erro ao compartilhar progresso:", error);
        
        try {
            const message = `Acabei de concluir a receita "${recipeTitle}"! 🎉🍳`;
            await Share.share({ message });
        } catch {
            Alert.alert("Compartilhamento", "Não foi possível abrir as opções de compartilhamento.");
        }
    }
}