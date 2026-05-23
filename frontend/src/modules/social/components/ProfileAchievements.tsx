import { useMemo, useState } from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Pressable, Text, View } from "react-native";

export type ProfileAchievementStatus = {
    firstRecipe: boolean;
    firstHighRating: boolean;
    recipeSavedByAnotherUser: boolean;
    firstFollower: boolean;
    gastronomicConnections: boolean;
};

type AchievementCard = {
    key: keyof ProfileAchievementStatus;
    title: string;
    description: string;
    icon: string;
};

const ACHIEVEMENTS: AchievementCard[] = [
    {
        key: "firstRecipe",
        title: "Primeira Receita",
        description: "Adicionou sua primeira receita.",
        icon: "book-open",
    },
    {
        key: "firstHighRating",
        title: "Primeiro Gostei",
        description: "Recebeu sua primeira avaliação >= 4.",
        icon: "star",
    },
    {
        key: "recipeSavedByAnotherUser",
        title: "Receita Favorita",
        description: "Uma receita sua foi salva por outro usuário.",
        icon: "bookmark",
    },
    {
        key: "firstFollower",
        title: "Primeiro Seguidor",
        description: "Ganhou seu primeiro seguidor.",
        icon: "user-plus",
    },
    {
        key: "gastronomicConnections",
        title: "Conexões Gastronômicas",
        description: "Seguiu 10 usuários.",
        icon: "users",
    },
];

type ProfileAchievementsProps = {
    badges: ProfileAchievementStatus;
};

export default function ProfileAchievements({ badges }: ProfileAchievementsProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const unlockedCount = useMemo(() => Object.values(badges).filter(Boolean).length, [badges]);

    return (
        <View className="w-full">
            <Pressable
                onPress={() => setIsExpanded((current) => !current)}
                className="flex-row items-center justify-between p-4 mx-2 border border-gray-200 rounded-md"
            >
                <View className="flex flex-row items-center gap-2">
                    <Text className="font-semibold">Conquistas</Text>
                    <Text className="mt-1 text-sm text-gray-500">({unlockedCount}/{ACHIEVEMENTS.length} conquistas)</Text>
                </View>

                <FontAwesome6
                    name="chevron-down"
                    size={16}
                    color="#6b7280"
                    style={{ transform: [{ rotate: isExpanded ? "180deg" : "0deg" }] }}
                />
            </Pressable>

            {isExpanded ? (
                <View className="mt-3 flex-row flex-wrap justify-between">
                    {ACHIEVEMENTS.map((achievement) => {
                        const isUnlocked = badges[achievement.key];

                        return (
                            <View
                                key={achievement.key}
                                className={`mb-3 w-[31%] rounded-2xl border p-2 items-center justify-start ${isUnlocked ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-gray-100"}`}
                            >
                                <View className={`h-14 w-14 rounded-full items-center justify-center ${isUnlocked ? "bg-white" : "bg-gray-200"}`}>
                                    {isUnlocked ? (
                                        <FontAwesome6 name={achievement.icon as any} size={20} color="#f97316" />
                                    ) : (
                                        <Text className="text-2xl font-black text-gray-400">?</Text>
                                    )}
                                </View>

                                {isUnlocked ? (
                                    <>
                                        <Text className="mt-2 text-center text-[11px] font-semibold leading-4 text-gray-900">
                                            {achievement.title}
                                        </Text>
                                        <Text className="mt-1 text-center text-[10px] leading-3 text-gray-600">
                                            {achievement.description}
                                        </Text>
                                    </>
                                ) : (
                                    <Text className="mt-3 text-center text-xl font-bold text-gray-400">?</Text>
                                )}
                            </View>
                        );
                    })}
                </View>
            ) : null}
        </View>
    );
}