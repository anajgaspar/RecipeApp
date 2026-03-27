import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, TextInput, View, Image } from "react-native";

type RecipeComment = {
    text: string;
    rating: number;
    image?: string;
};

export default function RecipeComments() {
    const [commentText, setCommentText] = useState("");
    const [selectedRating, setSelectedRating] = useState(0);
    const [comments, setComments] = useState<RecipeComment[]>([
        { text: "Fiz ontem e ficou muito boa!", rating: 5, image: "https://guiadacozinha.com.br/wp-content/uploads/2019/10/lasanha-bolonhesa.jpg" },
        { text: "Substitui a carne por soja e funcionou super bem.", rating: 4 },
    ]);

    const addComment = () => {
        const normalized = commentText.trim();
        if (!normalized || selectedRating === 0) return;

        setComments((prev) => [{ text: normalized, rating: selectedRating }, ...prev]);
        setCommentText("");
        setSelectedRating(0);
    };

    const averageRating = comments.length
        ? comments.reduce((acc, item) => acc + item.rating, 0) / comments.length
        : 0;

    return (
        <View className="w-full p-4 gap-4">
            <Text className="text-lg font-semibold">Comentários</Text>
            <View className="flex-row items-center gap-2">
                <Text className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</Text>
                <View className="flex-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                            key={`avg-${star}`}
                            name={star <= Math.round(averageRating) ? "star" : "star-outline"}
                            size={16}
                            color="#f59e0b"
                        />
                    ))}
                </View>
                <Text className="text-sm text-gray-500">({comments.length} avaliações)</Text>
            </View>

            <View className="gap-2">
                <Text className="text-sm text-gray-700">Sua nota</Text>
                <View className="flex-row gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Pressable
                            key={`input-${star}`}
                            onPress={() => setSelectedRating(star)}
                            hitSlop={6}
                        >
                            <Ionicons
                                name={star <= selectedRating ? "star" : "star-outline"}
                                size={24}
                                color="#f59e0b"
                            />
                        </Pressable>
                    ))}
                </View>
                <TextInput
                    className="w-full text-sm py-3 px-3 border border-gray-300 rounded-md"
                    placeholder="Escreva uma avaliação..."
                    placeholderTextColor="#9ca3af"
                    multiline={true}
                    numberOfLines={4}
                    value={commentText}
                    onChangeText={setCommentText}
                />
                <Pressable
                    onPress={addComment}
                    className="self-end bg-[#f97316] p-2 rounded-full"
                >
                    <Ionicons name="play-outline" size={16} color="white" />
                </Pressable>
                {selectedRating === 0 ? (
                    <Text className="text-xs text-gray-500">Selecione de 1 a 5 estrelas para enviar.</Text>
                ) : null}
            </View>
            <View className="gap-3">
                {comments.map((comment, index) => (
                    <View key={`${comment.text}-${index}`} className="bg-gray-100 rounded-md p-3 gap-2">
                        <View className="flex-row">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons
                                    key={`${comment.text}-${index}-${star}`}
                                    name={star <= comment.rating ? "star" : "star-outline"}
                                    size={14}
                                    color="#f59e0b"
                                />
                            ))}
                        </View>
                        <View className="h-32 flex flex-row justify-between">
                            <View className="flex flex-col gap-6">
                                <View className="flex flex-row gap-2">
                                    <Image
                                        source={{ uri: 'https://icon-icons.com/download-file?file=https%3A%2F%2Fimages.icon-icons.com%2F3708%2FPNG%2F512%2Fgirl_female_woman_person_people_avatar_icon_230018.png&id=230018&pack_or_individual=pack' }}
                                        className="w-14 h-14"
                                    />
                                    <Text className="pt-2 font-semibold">Jane Doe</Text>
                                </View>
                                <View>
                                    <Text className="text-gray-700">{comment.text}</Text>
                                </View>
                            </View>
                            {comment.image && (
                                <Image
                                    source={{ uri: comment.image }}
                                    className="absolute right-2 w-32 h-32 rounded-md"
                                    resizeMode="cover"
                                />
                            )}
                        </View>

                    </View>
                ))}
            </View>
        </View>
    )
}