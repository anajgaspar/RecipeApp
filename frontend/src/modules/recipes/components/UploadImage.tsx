import { View, Pressable, Text, Image, ActivityIndicator } from "react-native";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

type UploadImageProps = {
    onChange?: (uri: string | null) => void;
};

export default function UploadImage({ onChange }: UploadImageProps) {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
                quality: 0.8,
            });

            if (!result.canceled) {
                updateImage(result.assets[0].uri);
            }
        } finally {
            setLoading(false);
        }
    };

    const takePhoto = async () => {
        setLoading(true);
        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                updateImage(result.assets[0].uri);
            }
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