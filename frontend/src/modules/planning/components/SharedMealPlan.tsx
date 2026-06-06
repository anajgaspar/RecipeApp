import { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  DAY_LABELS,
  MEAL_TYPES,
  decodeSharedMealPlanPayload,
  type SharedMealPlanPayload,
} from "../utils/mealPlanSharing";

type SharedMealPlanRouteParams = {
  SharedMealPlan?: {
    data?: string;
  };
};

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function getPayloadDescription(payload: SharedMealPlanPayload) {
  const start = new Date(payload.weekStart);
  const end = new Date(payload.weekEnd);
  return `${start.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })} - ${end.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}`;
}

export default function SharedMealPlan() {
  const route = useRoute<RouteProp<SharedMealPlanRouteParams, "SharedMealPlan">>();

  const payload = useMemo(
    () => decodeSharedMealPlanPayload(route.params?.data),
    [route.params?.data]
  );

  if (!payload) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <FontAwesome6 name="triangle-exclamation" size={40} color="#f97316" />
        <Text className="mt-4 text-lg font-semibold text-gray-900 text-center">
          Não foi possível abrir este planejamento compartilhado.
        </Text>
        <Text className="mt-2 text-sm text-gray-500 text-center">
          O link pode estar incompleto ou inválido.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="px-5 pt-14 pb-5 bg-orange-50 border-b border-orange-100">
        <Text className="text-xs uppercase tracking-[0.2em] text-orange-700 font-semibold">
          Compartilhamento
        </Text>
        <Text className="mt-2 text-2xl font-bold text-gray-900">Planejamento semanal</Text>
        <Text className="mt-1 text-sm text-gray-600">{getPayloadDescription(payload)}</Text>
      </View>

      <View className="px-4 pt-4 gap-4">
        {MEAL_TYPES.map((meal) => (
          <View key={meal.key} className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <View className="flex-row items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <Text className="text-2xl">{meal.emoji}</Text>
              <View>
                <Text className="font-semibold text-gray-900">{meal.label}</Text>
                <Text className="text-xs text-gray-500">{meal.key}</Text>
              </View>
            </View>

            <View className="p-3">
              <View className="flex-row gap-2">
                {payload.days.map((day, dayIndex) => {
                  const recipe = payload.plan[meal.key]?.[day.date] ?? null;

                  return (
                    <View key={`${meal.key}-${day.date}`} className="flex-1 rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden">
                      <View className="px-2 py-2 items-center border-b border-gray-100 bg-white">
                        <Text className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                          {DAY_LABELS[dayIndex]}
                        </Text>
                        <Text className="text-sm font-bold text-gray-900">{formatDateLabel(day.date)}</Text>
                      </View>

                      <View className="min-h-[120px] p-2 items-center justify-center">
                        {recipe ? (
                          <View className="w-full rounded-xl bg-orange-50 border border-orange-100 px-2 py-3 items-center">
                            <Text className="text-[11px] text-orange-700 font-semibold mb-1 text-center">
                              {recipe.title}
                            </Text>
                            {recipe.prepTimeMinutes || recipe.difficulty ? (
                              <Text className="text-[10px] text-orange-900 text-center">
                                {recipe.prepTimeMinutes ? `${recipe.prepTimeMinutes} min` : ""}
                                {recipe.prepTimeMinutes && recipe.difficulty ? " • " : ""}
                                {recipe.difficulty ?? ""}
                              </Text>
                            ) : null}
                          </View>
                        ) : (
                          <View className="items-center justify-center gap-2">
                            <FontAwesome6 name="circle-question" size={18} color="#d1d5db" />
                            <Text className="text-xs text-gray-400">Sem refeição</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
