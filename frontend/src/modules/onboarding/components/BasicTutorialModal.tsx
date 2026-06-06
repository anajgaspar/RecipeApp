import { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

export type TutorialStep = {
  title: string;
  description: string;
  highlight: string;
  tip: string;
  actionLabel?: string;
  actionHint?: string;
};

type BasicTutorialModalProps = {
  visible: boolean;
  step: TutorialStep;
  stepIndex: number;
  totalSteps: number;
  canGoBack: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onFinish: () => void;
};

function TutorialPill({ children }: { children: ReactNode }) {
  return (
    <View className="self-start rounded-full bg-white/15 px-3 py-1">
      <Text className="text-xs font-semibold text-white">{children}</Text>
    </View>
  );
}

export default function BasicTutorialModal({
  visible,
  step,
  stepIndex,
  totalSteps,
  canGoBack,
  onBack,
  onNext,
  onSkip,
  onFinish,
}: BasicTutorialModalProps) {
  return (
    <Modal visible={visible} transparent statusBarTranslucent>
      <BlurView intensity={18} tint="dark" style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24, backgroundColor: "rgba(0,0,0,0.60)" }}>
        <LinearGradient
          colors={["rgba(249,115,22,0.16)", "rgba(0,0,0,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View className="flex-1 justify-between">
          <View className="flex-row items-center justify-between pt-8">
            <View>
              <Text className="text-white text-2xl font-robotoSemibold">Tour rápido</Text>
            </View>
            <TutorialPill>{stepIndex + 1}/{totalSteps}</TutorialPill>
          </View>
          <View className="rounded-[28px] border border-white/10 bg-[#111827]/92 p-5 shadow-2xl">
            <View className="mb-4 flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#f97316]">
                <FontAwesome6 name="face-grin-stars" size={18} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-xl font-robotoSemibold">{step.title}</Text>
                <Text className="text-white/65 text-sm">{step.highlight}</Text>
              </View>
            </View>
            <Text className="text-white/90 text-base leading-6">{step.description}</Text>
            <View className="mt-4 rounded-2xl bg-white/6 px-4 py-3">
              <Text className="text-[#fdba74] text-xs font-semibold uppercase tracking-[1.2px]">Dica prática</Text>
              <Text className="mt-1 text-white/80 text-sm leading-5">{step.tip}</Text>
            </View>
            <View className="mt-5 flex-row items-center justify-between gap-3">
              <Pressable onPress={onSkip} className="flex rounded-2xl bg-white/8">
                <Text className="text-center text-sm font-semibold text-white">Pular</Text>
              </Pressable>
              <View className="flex-1 flex-row gap-3">
                <Pressable
                  onPress={onBack}
                  disabled={!canGoBack}
                  className={`flex-1 rounded-2xl px-4 py-3 ${canGoBack ? "bg-white/8" : "bg-white/5 opacity-40"}`}
                >
                  <Text className="text-center text-sm font-semibold text-white">Voltar</Text>
                </Pressable>
                {stepIndex === totalSteps - 1 ? (
                  <Pressable onPress={onFinish} className="flex-1 rounded-2xl bg-[#f97316] px-4 py-3">
                    <Text className="text-center text-sm font-semibold text-white">Finalizar</Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={onNext} className="flex-1 rounded-2xl bg-[#f97316] px-4 py-3">
                    <Text className="text-center text-sm font-semibold text-white">Próximo</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
          <View className="pb-6 pt-4">
            <View className="flex-row justify-center gap-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full ${index === stepIndex ? "w-8 bg-[#f97316]" : "w-2 bg-white/25"}`}
                />
              ))}
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}