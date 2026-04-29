import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Pressable, View, Text, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Recipe } from "@/src/services/recipeService";
import { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useStepNotes } from "@/src/hooks/useStepNotes";

type RecipeStepsProps = {
    navigation: any;
    recipe: Recipe;
    steps: Recipe["steps"];
    onClose: () => void;
};

export default function RecipeSteps({ recipe, steps, onClose }: RecipeStepsProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const isFirst = currentStep === 0;
    const isLast = currentStep === steps.length - 1;
    const step = steps[currentStep];

    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const [isNoteOpen, setIsNoteOpen] = useState(false);
    const [noteInput, setNoteInput] = useState("");
    const { notes, saveNote, deleteNote } = useStepNotes(recipe.id);
    const currentNote = notes[step.stepNumber];

    useEffect(() => {
        setIsRunning(false);
        setTimeLeft(step.timerSeconds ?? null);
    }, [currentStep]);

    useEffect(() => {
        if (!isRunning || timeLeft === null || timeLeft <= 0) {
            if (timeLeft === 0) setIsRunning(false);
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    function formatTime(seconds: number) {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    function openNoteModal() {
        setNoteInput(currentNote ?? "");
        setIsNoteOpen(true);
    }

    async function handleSaveNote() {
        if (noteInput.trim()) {
            await saveNote(step.stepNumber, noteInput.trim());
        } else {
            await deleteNote(step.stepNumber);
        }
        setIsNoteOpen(false);
    }

    return (
        <View className="w-full bg-white flex-1 px-4 gap-4">
            <View className="flex flex-row items-center mt-12">
                <Pressable onPress={onClose} className="bg-white rounded-full p-2 ml-2">
                    <FontAwesome6 name="arrow-left" size={24} color="black" />
                </Pressable>
                <Text pointerEvents="none" className="absolute inset-x-0 text-center font-semibold text-xl">
                    {recipe?.title}
                </Text>
                <Pressable onPress={openNoteModal} className="ml-auto bg-white rounded-full p-2">
                    <FontAwesome
                        name={currentNote ? "sticky-note" : "sticky-note-o"}
                        size={24}
                        color={currentNote ? "#f97316" : "black"}
                    />
                </Pressable>
            </View>
            <View className="flex flex-col gap-2">
                <Text className="text-gray-400">
                    Passo {currentStep + 1} de {steps.length}
                </Text>
                <View className="flex flex-row gap-1 mb-8">
                    {steps.map((_, index) => (
                        <View
                            key={index}
                            className={`h-1 flex-1 rounded-full ${index <= currentStep ? "bg-[#f97316]" : "bg-gray-200"}`}
                        />
                    ))}
                </View>
            </View>
            <View className="absolute inset-0 items-center justify-center px-4 gap-4">
                <Text className="text-center text-gray-600 text-xl">
                    {step.instruction}
                </Text>
                {timeLeft !== null && (
                    <View className="mt-8 items-center gap-3 pointer-events-auto">
                        <Text className={`text-5xl font-bold tabular-nums ${timeLeft === 0 ? "text-green-500" : "text-[#f97316]"}`}>
                            {formatTime(timeLeft)}
                        </Text>
                        <View className="flex flex-row gap-3">
                            <Pressable
                                onPress={() => {
                                    setIsRunning(false);
                                    setTimeLeft(step.timerSeconds!);
                                }}
                                className="bg-gray-100 rounded-full p-3"
                            >
                                <Ionicons name="refresh-outline" size={22} color="#6b7280" />
                            </Pressable>
                            <Pressable
                                onPress={() => setIsRunning(prev => !prev)}
                                disabled={timeLeft === 0}
                                className={`rounded-full p-3 ${timeLeft === 0 ? "bg-gray-100" : "bg-[#f97316]"}`}
                            >
                                <Ionicons
                                    name={isRunning ? "pause-outline" : "play-outline"}
                                    size={22}
                                    color={timeLeft === 0 ? "#9ca3af" : "white"}
                                />
                            </Pressable>
                        </View>
                        {timeLeft === 0 && (
                            <Text className="text-green-500 font-semibold">Pronto!</Text>
                        )}
                    </View>
                )}
                {currentNote && (
                    <Pressable
                        onPress={openNoteModal}
                        className="mt-4 flex flex-row gap-2 bg-orange-50 border border-orange-200 rounded-md px-3 py-2"
                    >
                        <Ionicons name="document-text" size={16} color="#f97316" />
                        <Text className="text-orange-700 text-sm flex-1">{currentNote}</Text>
                    </Pressable>
                )}
            </View>
            <View className="absolute bottom-6 left-4 right-4 flex flex-row gap-3">
                {!isFirst && (
                    <Pressable
                        onPress={() => setCurrentStep(prev => prev - 1)}
                        className="flex-1 border border-gray-200 py-4 rounded-md items-center"
                    >
                        <Text className="font-semibold text-gray-600">Anterior</Text>
                    </Pressable>
                )}
                <Pressable
                    onPress={() => isLast ? onClose() : setCurrentStep(prev => prev + 1)}
                    className="flex-1 bg-[#f97316] py-4 rounded-md items-center"
                >
                    <Text className="text-white font-semibold">
                        {isLast ? "Concluir" : "Próximo"}
                    </Text>
                </Pressable>
            </View>
            <Modal visible={isNoteOpen} transparent animationType="slide">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1 bg-black/40 justify-end"
                >
                    <Pressable
                        className="absolute inset-0"
                        onPress={() => setIsNoteOpen(false)}
                    />
                    <View className="bg-white rounded-t-2xl px-4 pt-4 pb-10">
                        <View className="flex flex-row justify-between items-center mb-4">
                            <Text className="font-bold text-lg">Minha anotação</Text>
                            {currentNote && (
                                <Pressable onPress={() => { deleteNote(step.stepNumber); setIsNoteOpen(false); }}>
                                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                </Pressable>
                            )}
                        </View>
                        <TextInput
                            value={noteInput}
                            onChangeText={setNoteInput}
                            placeholder="Ex: Substituir açúcar por adoçante..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            className="border border-gray-200 rounded-md p-3 text-base min-h-24 text-gray-700"
                            autoFocus
                        />
                        <Pressable
                            onPress={handleSaveNote}
                            className="mt-4 bg-[#f97316] py-4 rounded-md items-center"
                        >
                            <Text className="text-white font-semibold">Salvar</Text>
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    )
}