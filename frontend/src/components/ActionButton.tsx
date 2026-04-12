import { ActivityIndicator, Pressable, Text, View } from "react-native";

type ActionButtonVariant = "primary" | "outline" | "ghost";

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  loadingLabel?: string;
  variant?: ActionButtonVariant;
  className?: string;
};

const variantClasses: Record<ActionButtonVariant, { container: string; text: string; spinner: string }> = {
  primary: {
    container: "bg-[#f97316]",
    text: "text-white",
    spinner: "#ffffff",
  },
  outline: {
    container: "bg-white border border-[#f97316]",
    text: "text-[#f97316]",
    spinner: "#f97316",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-black",
    spinner: "#6b7280",
  },
};

export default function ActionButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  loadingLabel,
  variant = "primary",
  className = "",
}: ActionButtonProps) {
  const currentVariant = variantClasses[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`w-full min-h-12 rounded-md items-center justify-center px-4 ${currentVariant.container} ${isDisabled ? "opacity-70" : ""} ${className}`}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color={currentVariant.spinner} />
          <Text className={`text-center font-semibold ${currentVariant.text}`}>{loadingLabel ?? label}</Text>
        </View>
      ) : (
        <Text className={`text-center font-semibold ${currentVariant.text}`}>{label}</Text>
      )}
    </Pressable>
  );
}
