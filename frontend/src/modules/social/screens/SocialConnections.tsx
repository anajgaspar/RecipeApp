import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Image, Pressable, Text, View } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useAuth } from "@/src/modules/auth/context/AuthContext";
import { getMyFollowers, getMyFollowing, SocialConnectionItem, toggleFollow } from "@/src/services/authService";
import LoadingState from "@/src/components/LoadingState";
import InlineError from "@/src/components/InlineError";

type SocialConnectionsRouteParams = {
    initialTab?: "followers" | "following";
};

type SocialConnectionsProps = {
    navigation: any;
    route: {
        params?: SocialConnectionsRouteParams;
    };
};

export default function SocialConnections({ navigation, route }: SocialConnectionsProps) {
    const { user } = useAuth();
    const initialTab = route.params?.initialTab ?? "followers";
    const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
    const [followers, setFollowers] = useState<SocialConnectionItem[]>([]);
    const [following, setFollowing] = useState<SocialConnectionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        let isMounted = true;

        async function loadConnections() {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const [followersData, followingData] = await Promise.all([
                    getMyFollowers(),
                    getMyFollowing(),
                ]);

                if (!isMounted) {
                    return;
                }

                setFollowers(followersData);
                setFollowing(followingData);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                const message = error instanceof Error ? error.message : "Não foi possível carregar as conexões.";
                setErrorMessage(message);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadConnections();

        return () => {
            isMounted = false;
        };
    }, []);

    const items = useMemo(() => activeTab === "followers" ? followers : following, [activeTab, followers, following]);

    async function handleToggleFollow(userId: string) {
        try {
            const result = await toggleFollow(userId);
            setFollowers((current) => current.map((item) => item.user.id === userId ? { ...item, isFollowingBack: result.isFollowing } : item));
            setFollowing((current) => current.filter((item) => item.user.id !== userId || result.isFollowing));
        } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível atualizar a conexão.";
            Alert.alert("Seguidores", message);
        }
    }

    function getActionLabel(item: SocialConnectionItem): string {
        if (activeTab === "followers") {
            return item.isFollowingBack ? "Deixar de seguir" : "Seguir de volta";
        }

        return "Deixar de seguir";
    }

    return (
        <View className="flex-1 bg-white">
            <View className="pt-16 px-4 flex flex-row items-center gap-6">
                <Pressable onPress={() => navigation.goBack()}>
                    <FontAwesome6 name="arrow-left" size={24} color="black" />
                </Pressable>
                <Text className="font-robotoSemibold text-xl">Seguidores e seguindo</Text>
            </View>

            <View className="px-4 pt-4 flex-row gap-3">
                <Pressable
                    onPress={() => setActiveTab("followers")}
                    className={`flex-1 rounded-full py-3 items-center ${activeTab === "followers" ? "bg-[#f97316]" : "bg-gray-100"}`}
                >
                    <Text className={activeTab === "followers" ? "text-white font-semibold" : "text-gray-700"}>Seguidores</Text>
                </Pressable>
                <Pressable
                    onPress={() => setActiveTab("following")}
                    className={`flex-1 rounded-full py-3 items-center ${activeTab === "following" ? "bg-[#f97316]" : "bg-gray-100"}`}
                >
                    <Text className={activeTab === "following" ? "text-white font-semibold" : "text-gray-700"}>Seguindo</Text>
                </Pressable>
            </View>

            <View className="flex-1 p-4">
                {isLoading ? <LoadingState label="Carregando conexões..." compact /> : null}
                {errorMessage ? <InlineError message={errorMessage} title="Falha ao carregar conexões" /> : null}
                {!isLoading && !errorMessage && items.length === 0 ? (
                    <View className="flex-1 items-center justify-center gap-2">
                        <Text className="text-lg font-semibold text-gray-800">
                            {activeTab === "followers" ? "Você ainda não tem seguidores." : "Você ainda não segue ninguém."}
                        </Text>
                        <Text className="text-sm text-gray-500 text-center">
                            {activeTab === "followers"
                                ? "Quando alguém começar a te seguir, a lista vai aparecer aqui."
                                : "Quando você seguir alguém, a lista vai aparecer aqui."}
                        </Text>
                    </View>
                ) : null}

                <FlatList
                    data={items}
                    keyExtractor={(item) => item.user.id}
                    contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                    renderItem={({ item }) => (
                        <View className="flex-row items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
                            <View className="flex-row items-center gap-3 flex-1">
                                {item.user.avatarDataUrl ? (
                                    <Image source={{ uri: item.user.avatarDataUrl }} className="w-12 h-12 rounded-full" />
                                ) : (
                                    <View className="w-12 h-12 rounded-full bg-[#fdfbf7] items-center justify-center">
                                        <FontAwesome6 name="user" size={16} color="#6b7280" />
                                    </View>
                                )}
                                <View className="flex-1">
                                    <Text className="font-semibold text-gray-900">{item.user.name}</Text>
                                    <Text className="text-xs text-gray-500">
                                        {activeTab === "followers" && item.isFollowingBack
                                            ? "Você já segue de volta"
                                            : activeTab === "followers"
                                                ? "Seguiu você"
                                                : item.isFollowingBack
                                                    ? "Segue você também"
                                                    : "Você segue este perfil"}
                                    </Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={() => void handleToggleFollow(item.user.id)}
                                className={`ml-3 rounded-full px-4 py-2 ${activeTab === "followers" && !item.isFollowingBack ? "bg-[#f97316]" : "bg-gray-100"}`}
                            >
                                <Text className={`text-sm font-semibold ${activeTab === "followers" && !item.isFollowingBack ? "text-white" : "text-gray-800"}`}>
                                    {getActionLabel(item)}
                                </Text>
                            </Pressable>
                        </View>
                    )}
                />
            </View>
        </View>
    );
}