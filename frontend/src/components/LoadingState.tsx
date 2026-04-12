import { ActivityIndicator, Text, View } from "react-native";

type LoadingStateProps = {
  label?: string;
  compact?: boolean;
};

export default function LoadingState({ label = "Carregando...", compact = false }: LoadingStateProps) {
  return (
    <View className={`items-center justify-center gap-2 ${compact ? "py-2" : "py-4"}`}>
      <ActivityIndicator size="small" color="#f97316" />
      <Text className="text-sm text-[#6b7280]">{label}</Text>
    </View>
  );
}
