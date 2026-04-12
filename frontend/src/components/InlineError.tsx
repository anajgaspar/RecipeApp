import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

type InlineErrorProps = {
  message: string;
  title?: string;
};

export default function InlineError({ message, title = "Não foi possível concluir esta ação" }: InlineErrorProps) {
  return (
    <View className="w-full flex-row items-start gap-2 rounded-xl border border-[#fca5a5] bg-[#fef2f2] px-3 py-3">
      <Ionicons name="alert-circle" size={18} color="#dc2626" />
      <View className="flex-1">
        <Text className="text-[#991b1b] font-semibold text-sm">{title}</Text>
        <Text className="text-[#b91c1c] text-sm">{message}</Text>
      </View>
    </View>
  );
}
