import { View, Image, Text, TextInput, Pressable, Alert, AlertButton } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useAuth } from "@/src/modules/auth/context/AuthContext";
import ActionButton from "@/src/components/ActionButton";
import InlineError from "@/src/components/InlineError";

const MAX_AVATAR_BYTES = 850 * 1024;
const MAX_DIMENSION = 1024;

async function compressAvatarToDataUrl(uri: string, width?: number, height?: number): Promise<string> {
    const canResize = Boolean(width && height);
    const resizeRatio = canResize ? Math.min(1, MAX_DIMENSION / Math.max(width!, height!)) : 1;
    const resizeAction = canResize && resizeRatio < 1
        ? [{ resize: { width: Math.round(width! * resizeRatio), height: Math.round(height! * resizeRatio) } }]
        : [];

    let result = await ImageManipulator.manipulateAsync(uri, resizeAction, {
        format: ImageManipulator.SaveFormat.JPEG,
        compress: 0.88,
        base64: true,
    });

    if (!result.base64) {
        throw new Error("Não foi possível processar a imagem.");
    }

    let estimatedBytes = Math.ceil((result.base64.length * 3) / 4);

    if (estimatedBytes > MAX_AVATAR_BYTES) {
        result = await ImageManipulator.manipulateAsync(result.uri, [], {
            format: ImageManipulator.SaveFormat.JPEG,
            compress: 0.76,
            base64: true,
        });

        if (!result.base64) {
            throw new Error("Não foi possível processar a imagem.");
        }

        estimatedBytes = Math.ceil((result.base64.length * 3) / 4);
    }

    if (estimatedBytes > MAX_AVATAR_BYTES) {
        throw new Error("Imagem muito grande");
    }

    return `data:image/jpeg;base64,${result.base64}`;
}

export default function EditProfileForm({ navigation }: { navigation: any }) {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);

    useEffect(() => {
        setName(user?.name ?? "");
        setEmail(user?.email ?? "");
        setAvatarDataUrl(user?.avatarDataUrl ?? null);
    }, [user]);

    async function handlePickAvatar() {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert("Permissão necessária", "Permita o acesso à galeria para selecionar uma foto.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64: false,
        });

        if (result.canceled) {
            return;
        }

        const asset = result.assets[0];
        try {
            const compressedDataUrl = await compressAvatarToDataUrl(asset.uri, asset.width, asset.height);
            setAvatarDataUrl(compressedDataUrl);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível processar a imagem selecionada.";
            Alert.alert(
                "Não foi possível usar esta foto",
                message === "Imagem muito grande"
                    ? "A imagem escolhida ultrapassa o tamanho permitido. Selecione uma imagem menor."
                    : message
            );
        }
    }

    function handleRemoveAvatarConfirm() {
        Alert.alert(
            "Remover foto",
            "Tem certeza que deseja remover sua foto de perfil? Esta ação não pode ser desfeita.",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Remover",
                    style: "destructive",
                    onPress: () => {
                        setAvatarDataUrl(null);
                    },
                },
            ]
        );
    }

    function handleAvatarOptions() {
        const options: AlertButton[] = [
            {
                text: "Fazer upload de foto",
                onPress: () => {
                    void handlePickAvatar();
                },
            },
        ];

        if (avatarDataUrl) {
            options.push({
                text: "Remover foto",
                style: "destructive",
                onPress: handleRemoveAvatarConfirm,
            });
        }

        options.push({
            text: "Cancelar",
            style: "cancel",
        });

        Alert.alert("Foto de perfil", "Escolha uma opção:", options);
    }

    async function handleSaveProfile() {
        setErrorMessage(null);

        if (!name.trim() || !email.trim()) {
            setErrorMessage("Nome e e-mail são obrigatórios.");
            return;
        }

        if ((currentPassword && !password) || (!currentPassword && password)) {
            setErrorMessage("Informe a senha atual e a nova senha para alterar a senha.");
            return;
        }

        try {
            setIsSaving(true);

            await updateProfile({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                avatarDataUrl,
                ...(currentPassword && password ? {
                    currentPassword,
                    newPassword: password,
                } : {}),
            });

            navigation.goBack();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Não foi possível atualizar o perfil.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <View className="flex-1 relative w-full flex flex-col gap-4 bg-white">
            <View className="absolute top-16 left-8 flex flex-row items-center gap-6">
                <Pressable onPress={() => navigation.goBack()}>
                    <FontAwesome6 name="arrow-left" size={24} color="black" />
                </Pressable>
                <Text className="font-robotoSemibold text-xl">Editar Perfil</Text>
            </View>
            <View className="flex flex-col p-4 gap-4 bg-white rounded-md mx-4 my-24">
                <View className="relative my-6">
                    {avatarDataUrl ? (
                        <Image source={{ uri: avatarDataUrl }} className="self-center rounded-full border-4 border-orange-50 w-28 h-28" />
                    ) : (
                        <View className="self-center rounded-full border-4 border-orange-50 w-28 h-28 bg-[#fdfbf7] items-center justify-center">
                            <FontAwesome6 name="user" size={18} color="#6b7280" />
                        </View>
                    )}
                    <Pressable onPress={handleAvatarOptions} className="self-center absolute bottom-0 right-40 bg-orange-50 rounded-full p-1">
                        <MaterialCommunityIcons name="pencil" size={22} color="black" />
                    </Pressable>
                </View>
                <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2">
                    <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                        Nome completo
                    </Text>
                    <TextInput className="w-full text-sm py-1"
                        value={name}
                        onChangeText={setName}
                        placeholder="Jane Doe"
                        placeholderTextColor="#9ca3af"
                    />
                </View>
                <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2">
                    <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                        Email
                    </Text>
                    <TextInput className="w-full text-sm py-1"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="seu@email.com"
                        placeholderTextColor="#9ca3af"
                    />
                </View>
                <View className="flex flex-col gap-2">
                    <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2">
                        <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Senha atual
                        </Text>
                        <TextInput className="w-full text-sm py-1"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry={!showPassword}
                            placeholder="Digite sua senha atual"
                            placeholderTextColor="#9ca3af"
                        />
                        <Pressable onPress={() => setShowPassword((current) => !current)} className="absolute right-3 top-3">
                            <FontAwesome6 name={showPassword ? "eye-slash" : "eye"} size={16} color="#9ca3af" />
                        </Pressable>
                    </View>
                </View>
                <View className="flex flex-col gap-2">
                    <View className="relative bg-[#fdfbf7] rounded-md px-3 py-2">
                        <Text className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Nova senha
                        </Text>
                        <TextInput className="w-full text-sm py-1"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            placeholder="Crie uma senha forte"
                            placeholderTextColor="#9ca3af"
                        />
                        <Pressable onPress={() => setShowPassword((current) => !current)} className="absolute right-3 top-3">
                            <FontAwesome6 name={showPassword ? "eye-slash" : "eye"} size={16} color="#9ca3af" />
                        </Pressable>
                    </View>
                    <Text className="text-xs text-[#9ca3af]">* Pelo menos 8 caracteres</Text>
                </View>
                {errorMessage ? <InlineError message={errorMessage} title="Não foi possível salvar seu perfil" /> : null}
                <ActionButton
                    label="Salvar Alterações"
                    loadingLabel="Salvando..."
                    loading={isSaving}
                    onPress={() => void handleSaveProfile()}
                    className="my-4"
                />
            </View>
        </View>

    )
}