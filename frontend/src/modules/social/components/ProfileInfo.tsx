import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../auth/context/AuthContext";
import { getMySocialSummary } from "@/src/services/authService";
import { getMyRecipes } from "@/src/services/recipeService";

export default function ProfileInfo() {
    const { user, profiles, activeProfileId, setActiveProfile, createProfile } = useAuth();
    const navigation = useNavigation<any>();
    const avatarSource = user?.avatarDataUrl ? { uri: user.avatarDataUrl } : null;
    const [recipeCount, setRecipeCount] = useState<number | null>(null);
    const [followersCount, setFollowersCount] = useState<number | null>(null);
    const [followingCount, setFollowingCount] = useState<number | null>(null);

    const activeProfile = useMemo(
        () => profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0] ?? null,
        [activeProfileId, profiles],
    );

    useEffect(() => {
        let isMounted = true;

        async function loadCount() {
            try {
                const recipes = await getMyRecipes(100);
                if (isMounted) {
                    setRecipeCount(recipes.length);
                }
            } catch {
                if (isMounted) {
                    setRecipeCount(null);
                }
            }
        }

        loadCount();

        return () => {
            isMounted = false;
        };
    }, [activeProfileId]);

    useEffect(() => {
        let isMounted = true;

        async function loadSummary() {
            try {
                const [socialSummary] = await Promise.all([
                    getMySocialSummary(),
                ]);

                if (!isMounted) {
                    return;
                }

                setFollowersCount(socialSummary.followersCount);
                setFollowingCount(socialSummary.followingCount);
            } catch {
                if (!isMounted) {
                    return;
                }

                setFollowersCount(null);
                setFollowingCount(null);
            }
        }

        loadSummary();

        return () => {
            isMounted = false;
        };
    }, [activeProfileId]);

    async function handleCreateProfile() {
        try {
            await createProfile({});
        } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível criar o perfil.";
            Alert.alert("Perfis", message);
        }
    }

    return (
        <View className="w-full flex flex-col items-center gap-4 px-4 py-6">
            {avatarSource ? (
                <Image source={avatarSource} className="rounded-full border-4 border-orange-50 w-28 h-28" />
            ) : (
                <View className="rounded-full border-4 border-orange-50 w-28 h-28 bg-[#fdfbf7] items-center justify-center">
                    <FontAwesome6 name="user" size={18} color="#6b7280" />
                </View>
            )}

            <View className="items-center gap-1">
                <Text className="text-lg font-semibold">{user?.name ?? "Usuário"}</Text>
                {activeProfile && !activeProfile.isDefault ? (
                    <Text className="bg-[#f97316]/20 text-sm text-[#f97316] font-bold rounded-full p-1">● {activeProfile.name} ativo</Text>
                ) : null}
                <Text className="text-sm text-[#9ca3af]">{user?.email ?? "Sem e-mail"}</Text>
            </View>
            <View className="w-full flex flex-row justify-between gap-3">
                <View className="flex-1 flex flex-col items-center justify-center bg-[#9ca3af]/10 h-20 rounded-md">
                    <Text className="font-semibold text-[#f97316] text-lg">{recipeCount ?? "-"}</Text>
                    <Text className="text-[#9ca3af] text-sm">Receitas</Text>
                </View>
                <Pressable
                    onPress={() => navigation.navigate("SocialConnections", { initialTab: "followers" })}
                    className="flex-1 flex flex-col items-center justify-center bg-[#9ca3af]/10 h-20 rounded-md"
                >
                    <Text className="font-semibold text-[#f97316] text-lg">{followersCount ?? "-"}</Text>
                    <Text className="text-[#9ca3af] text-sm">Seguidores</Text>
                </Pressable>
                <Pressable
                    onPress={() => navigation.navigate("SocialConnections", { initialTab: "following" })}
                    className="flex-1 flex flex-col items-center justify-center bg-[#9ca3af]/10 h-20 rounded-md"
                >
                    <Text className="font-semibold text-[#f97316] text-lg">{followingCount ?? "-"}</Text>
                    <Text className="text-[#9ca3af] text-sm">Seguindo</Text>
                </Pressable>
            </View>
        </View>
    )
}