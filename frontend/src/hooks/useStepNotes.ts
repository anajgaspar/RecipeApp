import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export function useStepNotes(recipeId: string) {
    const storageKey = `step_notes:${recipeId}`;
    const [notes, setNotes] = useState<Record<number, string>>({});

    useEffect(() => {
        AsyncStorage.getItem(storageKey).then(raw => {
            if (raw) setNotes(JSON.parse(raw));
        });
    }, [recipeId]);

    async function saveNote(stepNumber: number, text: string) {
        const updated = { ...notes, [stepNumber]: text };
        setNotes(updated);
        await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    }

    async function deleteNote(stepNumber: number) {
        const updated = { ...notes };
        delete updated[stepNumber];
        setNotes(updated);
        await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    }

    return { notes, saveNote, deleteNote };
}