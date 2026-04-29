import { View, Pressable, Text, Image, ActivityIndicator, Alert } from "react-native";
import { useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from "expo-image-manipulator";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

type UploadImageProps = {
    onChange?: (uri: string | null) => void;
    value?: string | null;
};

export default function UploadImage({ onChange, value = null }: UploadImageProps) {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function compressImageToDataUrl(uri: string, width?: number, height?: number): Promise<string> {
        const canResize = Boolean(width && height);
        const maxDimension = 1400;
        const resizeRatio = canResize ? Math.min(1, maxDimension / Math.max(width!, height!)) : 1;
        const resizeAction = canResize && resizeRatio < 1
            ? [{ resize: { width: Math.round(width! * resizeRatio), height: Math.round(height! * resizeRatio) } }]
            : [];

        let result = await ImageManipulator.manipulateAsync(uri, resizeAction, {
            format: ImageManipulator.SaveFormat.JPEG,
            compress: 0.84,
            base64: true,
        });

        if (!result.base64) {
            throw new Error("Não foi possível processar a imagem.");
        }

        let estimatedBytes = Math.ceil((result.base64.length * 3) / 4);

        if (estimatedBytes > 2 * 1024 * 1024) {
            result = await ImageManipulator.manipulateAsync(result.uri, [], {
                format: ImageManipulator.SaveFormat.JPEG,
                compress: 0.72,
                base64: true,
            });

            if (!result.base64) {
                throw new Error("Não foi possível processar a imagem.");
            }

            estimatedBytes = Math.ceil((result.base64.length * 3) / 4);
        }

        if (estimatedBytes > 2 * 1024 * 1024) {
            throw new Error("Imagem muito grande");
        }

        return `data:image/jpeg;base64,${result.base64}`;
    }

    useEffect(() => {
        setImageUri(value);
    }, [value]);

    const updateImage = (uri: string | null) => {
        setImageUri(uri);
        onChange?.(uri);
    };

    const pickImage = async () => {
        setLoading(true);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                base64: false,
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                const compressedDataUrl = await compressImageToDataUrl(asset.uri, asset.width, asset.height);
                updateImage(compressedDataUrl);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível processar a imagem selecionada.";
            Alert.alert(
                "Não foi possível usar esta foto",
                message === "Imagem muito grande"
                    ? "A imagem escolhida ultrapassa o tamanho permitido. Selecione uma imagem menor."
                    : message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="w-full bg-[#fdfbf7]">
            {imageUri ? (
                <View className="w-full items-center gap-4">
                    <Image
                        source={{ uri: imageUri }}
                        className="w-48 h-48 rounded-lg"
                        resizeMode="cover"
                    />
                    <Pressable onPress={() => updateImage(null)}>
                        <FontAwesome6 name="trash-can" size={22} color="#f97316" />
                    </Pressable>
                </View>
            ) : (
                <Pressable
                    onPress={pickImage}
                    className="w-full border-2 border-dashed border-[#9ca3af] rounded-lg py-12 flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <ActivityIndicator size="large" color="#f97316" />
                    ) : (
                        <>
                            <FontAwesome6 name="image" size={40} color="#f97316" />
                            <Text className="text-center text-gray-600 font-semibold">
                                Enviar uma imagem
                            </Text>
                            <Text className="text-center text-gray-500 text-xs">
                                JPG, PNG até 10MB
                            </Text>
                        </>
                    )}
                </Pressable>
            )}
        </View>
    )
}