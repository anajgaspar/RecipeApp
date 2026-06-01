import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';

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

        if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            const filename = imageUrl.split('/').pop()?.split('?')[0] || 'recipe-progress.jpg';
            const cacheDirectory = FileSystem.cacheDirectory;

            if (!cacheDirectory) {
                throw new Error("Diretório de cache indisponível.");
            }

            const localUri = `${cacheDirectory}${filename}`;

            const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);

            if (downloadResult.status === 200) {
                await Sharing.shareAsync(downloadResult.uri, {
                    dialogTitle: 'Compartilhar meu progresso!',
                    mimeType: 'image/jpeg',
                });
            } else {
                throw new Error("Falha ao baixar imagem para compartilhamento.");
            }
        } else {
            Alert.alert("Compartilhar", message);
        }
    } catch (error) {
        console.error("Erro ao compartilhar progresso:", error);
        Alert.alert("Compartilhamento", "Não foi possível abrir as opções de compartilhamento.");
    }
}