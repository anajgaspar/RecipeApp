import { addComment, getRecipeComments, updateComment, deleteComment, Comment } from "@/src/services/commentsService";
import { Recipe } from "@/src/services/recipeService";
import { PublicAuthorProfile, getPublicUserProfile } from "@/src/services/authService";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "@/src/modules/auth/context/AuthContext";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import UploadImage from "./UploadImage";

type CommentsProps = {
    recipe: Recipe;
};

type RecipeComment = Comment;
type AuthorProfilesMap = Record<string, PublicAuthorProfile>;

export default function RecipeComments({ recipe }: CommentsProps) {
    const { user } = useAuth();
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState("");
    const [selectedRating, setSelectedRating] = useState(0);
    const [editCommentText, setEditCommentText] = useState("");
    const [editSelectedRating, setEditSelectedRating] = useState(0);
    const [editImageUrl, setEditImageUrl] = useState("");
    const [comments, setComments] = useState<RecipeComment[]>([]);
    const [authorProfiles, setAuthorProfiles] = useState<AuthorProfilesMap>({});
    const [imageUrl, setImageUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!recipe || !recipe.id) {
            return;
        }

        let mounted = true;

        async function loadComments() {
            try {
                setIsLoading(true);
                const data = await getRecipeComments(recipe.id);
                if (mounted) {
                    setComments(data ?? []);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : "Não foi possível carregar os comentários.";
                Alert.alert(message);
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        loadComments();

        return () => {
            mounted = false;
        };
    }, [recipe]);

    useEffect(() => {
        if (!recipe || !recipe.id) {
            return;
        }

        let mounted = true;
        async function hydrateAuthorProfiles() {
            if (!comments.length) {
                if (mounted) {
                    setAuthorProfiles({});
                }
                return;
            }

            const uniqueAuthorIds = Array.from(new Set(comments.map((comment) => comment.authorId).filter(Boolean)));
            const idsToFetch = uniqueAuthorIds.filter((authorId) => authorId !== user?.id);

            if (!idsToFetch.length) {
                if (mounted) {
                    setAuthorProfiles({});
                }
                return;
            }

            const results = await Promise.allSettled(
                idsToFetch.map(async (authorId) => {
                    const profile = await getPublicUserProfile(authorId);
                    return [authorId, profile] as const;
                })
            );

            if (!mounted) {
                return;
            }

            const nextProfiles: AuthorProfilesMap = {};
            results.forEach((result) => {
                if (result.status === "fulfilled") {
                    const [authorId, profile] = result.value;
                    nextProfiles[authorId] = profile;
                }
            });

            setAuthorProfiles(nextProfiles);
        }

        void hydrateAuthorProfiles();

        return () => {
            mounted = false;
        };
    }, [comments, user?.id, recipe]);

    const handleSubmit = async () => {
        if (!commentText.trim()) {
            Alert.alert("A mensagem não pode estar em branco!");
            return;
        }

        const payload = {
            recipeId: recipe.id,
            text: commentText.trim(),
            rating: selectedRating || 0,
            imageUrl: imageUrl || undefined,
        };

        try {
            setIsSaving(true);
            if (editingCommentId) {
                await updateComment(editingCommentId, payload);
                setEditingCommentId(null);
                Alert.alert("Comentário atualizado");
            } else {
                await addComment(payload);
                Alert.alert("Comentário adicionado");
            }

            setCommentText("");
            setSelectedRating(0);
            setImageUrl("");
            setIsLoading(true);
            const data = await getRecipeComments(recipe.id);
            setComments(data ?? []);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível salvar o comentário.";
            Alert.alert(message);
        } finally {
            setIsSaving(false);
            setIsLoading(false);
        }
    };

    const averageRating = comments.length
        ? comments.reduce((acc, item) => acc + item.rating, 0) / comments.length
        : 0;

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function handleEditComment(comment: RecipeComment) {
        setEditingCommentId(comment.id);
        setEditCommentText(comment.text);
        setEditSelectedRating(comment.rating);
        setEditImageUrl(comment.imageUrl ?? "");
    }

    async function handleSaveInlineEdit() {
        if (!editCommentText.trim()) {
            Alert.alert("A mensagem não pode estar em branco!");
            return;
        }

        const payload = {
            recipeId: recipe.id,
            text: editCommentText.trim(),
            rating: editSelectedRating || 0,
            imageUrl: editImageUrl || undefined,
        };

        try {
            setIsSaving(true);
            await updateComment(editingCommentId!, payload);
            setEditingCommentId(null);
            Alert.alert("Comentário atualizado");
            const data = await getRecipeComments(recipe.id);
            setComments(data ?? []);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível salvar o comentário.";
            Alert.alert(message);
        } finally {
            setIsSaving(false);
        }
    }

    function handleCancelEdit() {
        setEditingCommentId(null);
        setEditCommentText("");
        setEditSelectedRating(0);
        setEditImageUrl("");
    }

    function handleImageUpload(uri: string | null) {
        setImageUrl(uri ?? "");
    }

    function handleEditImageUpload(uri: string | null) {
        setEditImageUrl(uri ?? "");
    }

    function getAuthorName(comment: RecipeComment): string {
        if (comment.authorId === user?.id) {
            const name = user?.name;
            return name ? `${name} (Você)` : "Você";
        }

        return comment.authorName ?? authorProfiles[comment.authorId]?.name ?? "Usuário";
    }

    function getAuthorAvatar(comment: RecipeComment): string | null {
        if (comment.authorId === user?.id) {
            return user?.avatarDataUrl ?? null;
        }

        return comment.authorAvatarDataUrl ?? authorProfiles[comment.authorId]?.avatarDataUrl ?? null;
    }

    return (
        !recipe || !recipe.id ? (
            <View className="w-full p-4">
                <Text className="text-sm text-gray-500">Carregando comentários...</Text>
            </View>
        ) : (
            <KeyboardAvoidingView
                className="flex-1 bg-white"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
            >
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
                        <UploadImage onChange={handleImageUpload} value={imageUrl} />
                        <Pressable
                            onPress={handleSubmit}
                            className="self-end bg-[#f97316] p-2 rounded-full"
                        >
                            {isSaving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Ionicons name="play-outline" size={16} color="white" />
                            )}
                        </Pressable>
                    </View>
                    <View className="gap-3">
                        {isLoading ? (
                            <Text className="text-sm text-gray-500">Carregando comentários...</Text>
                        ) : (
                            comments.map((comment) => (
                                <View key={comment.id} className="bg-gray-100 rounded-md p-3 gap-2">
                                    {editingCommentId === comment.id ? (
                                        <View className="gap-3">
                                            <View className="flex-row gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Pressable
                                                        key={`edit-${comment.id}-${star}`}
                                                        onPress={() => setEditSelectedRating(star)}
                                                        hitSlop={6}
                                                    >
                                                        <Ionicons
                                                            name={star <= editSelectedRating ? "star" : "star-outline"}
                                                            size={20}
                                                            color="#f59e0b"
                                                        />
                                                    </Pressable>
                                                ))}
                                            </View>
                                            <TextInput
                                                className="w-full text-sm py-2 px-3 border border-gray-300 rounded-md"
                                                placeholder="Editar comentário..."
                                                placeholderTextColor="#9ca3af"
                                                multiline={true}
                                                numberOfLines={3}
                                                value={editCommentText}
                                                onChangeText={setEditCommentText}
                                            />
                                            <UploadImage onChange={handleEditImageUpload} value={editImageUrl} />
                                            <View className="flex-row gap-2 justify-end">
                                                <Pressable onPress={handleCancelEdit} className="bg-gray-400 px-3 py-2 rounded-md">
                                                    <Text className="text-white font-semibold">Cancelar</Text>
                                                </Pressable>
                                                <Pressable onPress={handleSaveInlineEdit} className="bg-[#f97316] px-3 py-2 rounded-md">
                                                    {isSaving ? (
                                                        <ActivityIndicator color="white" />
                                                    ) : (
                                                        <Text className="text-white font-semibold">Salvar</Text>
                                                    )}
                                                </Pressable>
                                            </View>
                                        </View>
                                    ) : (
                                        <View className="flex-row items-start justify-between">
                                            <View className="flex-1 gap-2">
                                                <View className="flex-row gap-2">
                                                    {getAuthorAvatar(comment) ? (
                                                        <Image source={{ uri: getAuthorAvatar(comment)! }} className="rounded-full w-14 h-14" />
                                                    ) : (
                                                        <View className="rounded-full w-14 h-14 bg-[#9ca3af]/20 items-center justify-center">
                                                            <FontAwesome6 name="user" size={18} color="#6b7280" />
                                                        </View>
                                                    )}
                                                    <View className="flex-1 gap-2">
                                                        <View className="flex-row items-center gap-2">
                                                            <Text className="font-semibold">{getAuthorName(comment)}</Text>
                                                            <Text className="text-xs text-gray-500">{formatDate(comment.createdAt)}</Text>
                                                        </View>
                                                        <View className="flex-row">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Ionicons
                                                                    key={`${comment.id}-${star}`}
                                                                    name={star <= comment.rating ? "star" : "star-outline"}
                                                                    size={20}
                                                                    color="#f59e0b"
                                                                />
                                                            ))}
                                                        </View>
                                                        <Text className="text-gray-700">{comment.text}</Text>
                                                    </View>
                                                </View>
                                                {comment.imageUrl && (
                                                    <Image
                                                        source={{ uri: comment.imageUrl }}
                                                        className="w-full rounded-md"
                                                        style={{ aspectRatio: 4 / 3 }}
                                                        resizeMode="cover"
                                                    />
                                                )}
                                            </View>
                                            {comment.authorId === user?.id && (
                                                <Pressable
                                                    onPress={() => {
                                                        Alert.alert("Opções", undefined, [
                                                            {
                                                                text: "Editar",
                                                                onPress: () => handleEditComment(comment),
                                                            },
                                                            {
                                                                text: "Excluir",
                                                                style: "destructive",
                                                                onPress: () => {
                                                                    Alert.alert(
                                                                        "Confirmar exclusão",
                                                                        "Deseja realmente excluir este comentário?",
                                                                        [
                                                                            { text: "Cancelar", style: "cancel" },
                                                                            {
                                                                                text: "Excluir",
                                                                                style: "destructive",
                                                                                onPress: async () => {
                                                                                    try {
                                                                                        setIsLoading(true);
                                                                                        await deleteComment(comment.id);
                                                                                        const data = await getRecipeComments(recipe.id);
                                                                                        setComments(data ?? []);
                                                                                    } catch (e) {
                                                                                        const message = e instanceof Error ? e.message : "Não foi possível excluir o comentário.";
                                                                                        Alert.alert(message);
                                                                                    } finally {
                                                                                        setIsLoading(false);
                                                                                    }
                                                                                },
                                                                            },
                                                                        ]
                                                                    );
                                                                },
                                                            },
                                                            { text: "Fechar", style: "cancel" },
                                                        ]);
                                                    }}
                                                >
                                                    <Ionicons name="ellipsis-vertical" size={18} color="#374151" />
                                                </Pressable>
                                            )}
                                        </View>
                                    )}
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        )
    );
}