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
        icon: "🏆",
    },
    {
        key: "firstHighRating",
        title: "Primeiro Gostei",
        description: "Recebeu sua primeira avaliação >= 4.",
        icon: "⭐",
    },
    {
        key: "recipeSavedByAnotherUser",
        title: "Receita Favorita",
        description: "Uma receita sua foi salva por outro usuário.",
        icon: "🔖",
    },
    {
        key: "firstFollower",
        title: "Primeiro Seguidor",
        description: "Ganhou seu primeiro seguidor.",
        icon: "🙋",
    },
    {
        key: "gastronomicConnections",
        title: "Conexões Gastronômicas",
        description: "Seguiu 10 usuários.",
        icon: "👨‍🍳",
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
                className="flex-row items-center justify-between"
            >
                <View className="flex flex-row items-center gap-2 mt-2">
                    <Text className="font-semibold">Conquistas</Text>
                    <Text className="text-sm bg-orange-50 p-2 rounded-full">{unlockedCount}/{ACHIEVEMENTS.length}</Text>
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
                                className={`mb-3 w-[31%] rounded-2xl border p-2 items-center justify-start ${isUnlocked ? "border-orange-200 bg-orange-50" : "border-0 opacity-25"}`}
                            >
                                <View className="h-14 w-14 rounded-full items-center justify-center">
                                    <Text className="text-3xl">{achievement.icon}</Text>
                                </View>
                                <>
                                    <Text className="mt-1 text-center text-[11px] font-semibold text-gray-900">
                                        {achievement.title}
                                    </Text>
                                    <Text className="mt-1 text-center text-[10px] text-gray-600">
                                        {achievement.description}
                                    </Text>
                                </>
                            </View>
                        );
                    })}
                </View>
            ) : null}
        </View>
    );
}