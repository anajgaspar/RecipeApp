import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { getMyFollowers, SocialConnectionItem } from "@/src/services/authService";
import { getSocialNotificationsSeenAt, saveSocialNotificationsSeenAt } from "@/src/services/tokenStorage";
import LoadingState from "@/src/components/LoadingState";
import InlineError from "@/src/components/InlineError";

export default function Notifications({ navigation }: { navigation: any }) {
    const [items, setItems] = useState<SocialConnectionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const [followers, seenAt] = await Promise.all([
                getMyFollowers(),
                getSocialNotificationsSeenAt(),
            ]);

            const seenAtDate = seenAt ? new Date(seenAt) : null;
            const newFollowers = seenAtDate
                ? followers.filter((item) => new Date(item.followedAt) > seenAtDate)
                : followers;

            setItems(newFollowers);
            await saveSocialNotificationsSeenAt(new Date().toISOString());
        } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível carregar as notificações.";
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [loadNotifications])
    );

    return (
        <View className="flex-1 bg-white">
            <View className="pt-16 px-4 flex flex-row items-center gap-6">
                <Pressable onPress={() => navigation.goBack()}>
                    <FontAwesome6 name="arrow-left" size={24} color="black" />
                </Pressable>
                <Text className="font-robotoSemibold text-xl">Novos seguidores</Text>
            </View>

            <View className="flex-1 p-4">
                {isLoading ? <LoadingState label="Carregando notificações..." compact /> : null}
                {errorMessage ? <InlineError message={errorMessage} title="Falha ao carregar notificações" /> : null}
                {!isLoading && !errorMessage && items.length === 0 ? (
                    <View className="flex-1 items-center justify-center gap-2">
                        <Text className="text-lg font-semibold text-gray-800">Nenhum novo seguidor</Text>
                        <Text className="text-sm text-gray-500 text-center">
                            Quando alguém começar a te seguir, a notificação vai aparecer aqui.
                        </Text>
                    </View>
                ) : null}

                <FlatList
                    data={items}
                    keyExtractor={(item) => `${item.user.id}-${item.followedAt}`}
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
                                    <Text className="text-xs text-gray-500">Começou a te seguir</Text>
                                </View>
                            </View>
                        </View>
                    )}
                />
            </View>
        </View>
    );
}