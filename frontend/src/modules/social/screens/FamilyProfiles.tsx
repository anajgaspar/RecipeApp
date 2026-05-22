import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Pressable, View, Text, Alert, FlatList, Image } from "react-native";
import { useAuth } from "../../auth/context/AuthContext";
import { useMemo } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import { getProfileAvatarPreset } from "../constants/profileAvatars";

export default function FamilyProfiles({ navigation }: { navigation: any }) {
    const { profiles, activeProfileId, setActiveProfile } = useAuth();

    const activeProfile = useMemo(
        () => profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0] ?? null,
        [activeProfileId, profiles],
    );

    async function handleCreateProfile() {
        navigation.navigate("EditFamilyProfile");
    }

    async function handleEditActiveProfile() {
        if (!activeProfile) {
            Alert.alert("Perfis", "Nenhum perfil selecionado para editar.");
            return;
        }

        if (activeProfile.isDefault) {
            navigation.navigate("EditProfile");
            return;
        }

        navigation.navigate("EditFamilyProfile", { profileId: activeProfile.id });
    }

    return (
        <View className="flex-1 bg-white">
            <View className="flex-row justify-between pt-16 px-4">
                <View className="flex flex-row items-center gap-6">
                    <Pressable onPress={() => navigation.goBack()}>
                        <FontAwesome6 name="arrow-left" size={24} color="black" />
                    </Pressable>
                    <Text className="font-robotoSemibold text-xl">Perfis da Família</Text>
                </View>
                <View className="flex flex-row items-center gap-6">
                    <Pressable onPress={() => void handleEditActiveProfile()} className="bg-[#f97316] rounded-full p-2">
                        <Ionicons name="pencil-outline" size={18} color="white" />
                    </Pressable>
                    <Pressable onPress={() => void handleCreateProfile()} className="w-9 h-9 flex justify-center items-center bg-[#f97316] rounded-full">
                        <Text className="text-white text-xl font-bold">+</Text>
                    </Pressable>
                </View>
            </View>
            <FlatList
                data={profiles}
                numColumns={2}
                contentContainerStyle={{ gap: 24, paddingHorizontal: 16, paddingVertical: 24 }}
                columnWrapperStyle={{ gap: 24 }}
                keyExtractor={(profile) => profile.id}
                renderItem={({ item: profile }) => {
                    const isActive = profile.id === (activeProfile?.id ?? activeProfileId);
                    const presetAvatar = getProfileAvatarPreset(profile.avatarDataUrl);

                    return (
                        <Pressable
                            onPress={() => void setActiveProfile(profile.id)}
                            className="flex-1 items-center"
                        >
                            {presetAvatar ? (
                                <Image
                                    source={presetAvatar.url}
                                    className={`rounded-2xl w-32 h-32 mb-3 items-center justify-center ${isActive ? "border-4 border-orange-500" : ""}`}
                                >
                                </Image>
                            ) : profile.avatarDataUrl?.startsWith("data:") ? (
                                <Image
                                    source={{ uri: profile.avatarDataUrl }}
                                    className={`rounded-2xl w-32 h-32 mb-3 ${isActive ? "border-4 border-orange-500" : ""}`}
                                />
                            ) : (
                                <View
                                    className={`rounded-2xl w-32 h-32 mb-3 bg-[#fdfbf7] items-center justify-center ${isActive ? "border-4 border-orange-500" : ""}`}
                                >
                                    <FontAwesome6 name="user" size={24} color="#6b7280" />
                                </View>
                            )}
                            <Text className={`font-semibold text-center ${isActive ? "text-orange-500" : "text-gray-700"}`}>
                                {profile.name}
                            </Text>
                        </Pressable>
                    );
                }}
            />
        </View>
    )
}