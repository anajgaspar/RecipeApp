import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAuth } from "@/src/modules/auth/context/AuthContext";
import ActionButton from "@/src/components/ActionButton";
import InlineError from "@/src/components/InlineError";
import { getProfileAvatarPreset, PROFILE_AVATAR_PRESETS, toProfileAvatarDataUrl } from "../constants/profileAvatars";

type EditFamilyProfileRouteParams = {
    profileId?: string;
};

type EditFamilyProfileProps = {
    navigation: any;
    route: {
        params?: EditFamilyProfileRouteParams;
    };
};

export default function EditFamilyProfile({ navigation, route }: EditFamilyProfileProps) {
    const { profiles, createProfile, updateFamilyProfile, deleteFamilyProfile } = useAuth();
    const profileId = route.params?.profileId;
    const profile = useMemo(
        () => profiles.find((item) => item.id === profileId) ?? null,
        [profileId, profiles],
    );
    const isEditing = Boolean(profile);

    const [name, setName] = useState("");
    const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!profile) {
            setName("");
            setAvatarDataUrl(null);
            return;
        }

        setName(profile.name);
        setAvatarDataUrl(profile.avatarDataUrl ?? null);
    }, [profile]);

    async function handleSaveProfile() {
        setErrorMessage(null);

        if (!name.trim()) {
            setErrorMessage("Informe um nome para o perfil.");
            return;
        }

        try {
            setIsSaving(true);

            if (isEditing && profile) {
                await updateFamilyProfile(profile.id, {
                    name: name.trim(),
                    avatarDataUrl,
                });
            } else {
                await createProfile({
                    name: name.trim(),
                    avatarDataUrl,
                });
            }

            navigation.goBack();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Não foi possível salvar o perfil.");
        } finally {
            setIsSaving(false);
        }
    }

    function handleConfirmDeleteProfile() {
        if (!profile) {
            return;
        }

        Alert.alert(
            "Excluir perfil",
            `Deseja excluir o perfil ${profile.name}? Esta ação não pode ser desfeita.`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () => {
                        void handleDeleteProfile();
                    },
                },
            ],
        );
    }

    async function handleDeleteProfile() {
        if (!profile) {
            return;
        }

        try {
            setIsSaving(true);
            setErrorMessage(null);
            await deleteFamilyProfile(profile.id);
            navigation.goBack();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Não foi possível excluir o perfil.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <View className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 pt-16 pb-4">
                <View className="flex-row items-center gap-4">
                    <Pressable onPress={() => navigation.goBack()}>
                        <FontAwesome6 name="arrow-left" size={22} color="#111827" />
                    </Pressable>
                    <View>
                        <Text className="font-robotoSemibold text-xl text-gray-900">
                            {isEditing ? "Editar perfil-filho" : "Novo perfil-filho"}
                        </Text>
                        <Text className="text-sm text-gray-500">
                            Escolha nome e avatar para o perfil
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
                <View className="rounded-3xl bg-[#fff7ed] p-5 mb-6">
                    <Text className="text-xs uppercase tracking-[2px] text-[#c2410c] mb-3">
                        Pré-visualização
                    </Text>
                    <View className="items-center">
                        {avatarDataUrl ? (
                            getProfileAvatarPreset(avatarDataUrl) ? (
                                <View
                                    className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white items-center justify-center"
                                    style={{ backgroundColor: getProfileAvatarPreset(avatarDataUrl)?.backgroundColor }}
                                >
                                    <Image
                                        source={getProfileAvatarPreset(avatarDataUrl)?.url}
                                        className="w-28 h-28 rounded-3xl"
                                    />
                                </View>
                            ) : avatarDataUrl.startsWith("data:") ? (
                                <Image source={{ uri: avatarDataUrl }} className="w-28 h-28 rounded-3xl border-4 border-white" />
                            ) : (
                                <View className="w-28 h-28 rounded-3xl bg-white items-center justify-center border-4 border-white">
                                    <Text className="text-sm text-gray-600">Avatar selecionado</Text>
                                </View>
                            )
                        ) : (
                            <View className="w-28 h-28 rounded-3xl bg-white items-center justify-center border-4 border-white">
                                <FontAwesome6 name="user" size={28} color="#6b7280" />
                            </View>
                        )}
                        <Text className="mt-4 text-lg font-semibold text-gray-900">
                            {name.trim() || "Nome do perfil"}
                        </Text>
                        <Text className="text-sm text-gray-500">
                            {avatarDataUrl ? "Avatar personalizado" : "Sem avatar selecionado"}
                        </Text>
                    </View>
                </View>

                <View className="mb-5">
                    <Text className="mb-2 text-sm font-semibold text-gray-700">Nome do perfil</Text>
                    <View className="rounded-2xl bg-[#fdfbf7] px-4 py-3 border border-gray-200">
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Ex.: Jane Doe"
                            placeholderTextColor="#9ca3af"
                            className="text-base text-gray-900"
                        />
                    </View>
                </View>

                <View>
                    <Text className="mb-3 text-sm font-semibold text-gray-700">Avatar</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {PROFILE_AVATAR_PRESETS.map((preset) => {
                            const presetDataUrl = toProfileAvatarDataUrl(preset.id);
                            const isSelected = avatarDataUrl === presetDataUrl;

                            return (
                                <Pressable
                                    key={preset.id}
                                    onPress={() => setAvatarDataUrl(presetDataUrl)}
                                    className={`w-[31%] rounded-2xl border p-3 items-center ${isSelected ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white"}`}
                                >
                                    <Image
                                        source={preset.url}
                                        className="w-24 h-24 rounded-2xl items-center justify-center mb-3"
                                    >
                                    </Image>
                                </Pressable>
                            );
                        })}
                    </View>

                    <Pressable
                        onPress={() => setAvatarDataUrl(null)}
                        className="mt-3 rounded-2xl border border-dashed border-gray-300 px-4 py-3 items-center"
                    >
                        <Text className="text-sm font-medium text-gray-600">Usar sem avatar</Text>
                    </Pressable>
                </View>

                {errorMessage ? <InlineError message={errorMessage} title="Não foi possível salvar o perfil" /> : null}

                <ActionButton
                    label={isEditing ? "Salvar alterações" : "Criar perfil"}
                    loadingLabel="Salvando..."
                    loading={isSaving}
                    onPress={() => void handleSaveProfile()}
                    className="mt-6"
                />

                {isEditing ? (
                    <Pressable
                        onPress={handleConfirmDeleteProfile}
                        disabled={isSaving}
                        className={`mt-4 rounded-2xl border px-4 py-3 items-center ${isSaving ? "border-red-200" : "border-red-400"}`}
                    >
                        <Text className={`font-semibold ${isSaving ? "text-red-300" : "text-red-500"}`}>
                            Excluir perfil
                        </Text>
                    </Pressable>
                ) : null}
            </ScrollView>
        </View>
    );
}