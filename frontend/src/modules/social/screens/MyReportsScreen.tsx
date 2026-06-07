import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useReportsData, PeriodFilter, CategoryStat } from "@/src/hooks/useReportsData";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = SCREEN_WIDTH - 52;

const PERIOD_OPTIONS: { label: string; value: PeriodFilter }[] = [
  { label: "Semana", value: "week" },
  { label: "Mês", value: "month" },
];

const CATEGORY_COLORS = [
  "#E8733A",
  "#F5A570",
  "#F7BC8E",
  "#F9D2B3",
  "#FAEADA",
];

const CHART_CONFIG = {
  backgroundGradientFrom: "#FFFFFF",
  backgroundGradientTo: "#FFFFFF",
  color: (opacity = 1) => `rgba(232, 115, 58, ${opacity})`,
  labelColor: () => "#8B8B8B",
  strokeWidth: 2,
  barPercentage: 0.6,
  decimalPlaces: 0,
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: "#E8733A",
    fill: "#FFFFFF",
  },
  propsForBackgroundLines: {
    stroke: "#F0EDE8",
    strokeDasharray: "",
  },
};

function StatCard({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-3.5 items-center gap-1.5 shadow-sm elevation-2">
      <Ionicons name={icon} size={22} color="#E8733A" />
      <Text className="text-xl font-bold text-neutral-900 tracking-tight">{value}</Text>
      <Text className="text-[11px] text-neutral-400 text-center leading-[14px]">{label}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-base font-semibold text-neutral-900 mb-4">{title}</Text>
  );
}

function HorizontalBar({
  label,
  count,
  max,
}: {
  label: string;
  count: number;
  max: number;
}) {
  const fillPercent = max > 0 ? count / max : 0;
  return (
    <View className="flex-row items-center gap-2.5 mb-2.5">
      <Text className="w-24 text-[13px] text-neutral-700">{label}</Text>
      <View className="flex-1 h-2.5 rounded-full flex-row bg-[#F0EDE8] overflow-hidden">
        <View style={{ flex: fillPercent }} className="bg-[#E8733A] rounded-full" />
        <View style={{ flex: 1 - fillPercent }} />
      </View>
      <Text className="w-5 text-[13px] text-neutral-400 text-right">{count}</Text>
    </View>
  );
}

function PieLegend({ stats }: { stats: CategoryStat[] }) {
  return (
    <View className="flex-1 gap-2.5 pl-2">
      {stats.slice(0, 5).map((s, i) => (
        <View key={s.category} className="flex-row items-center gap-2">
          <View
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[i] }}
          />
          <Text className="flex-1 text-xs text-neutral-700">{s.category}</Text>
          <Text className="text-xs text-neutral-400">{s.avgTimeMinutes} min</Text>
        </View>
      ))}
    </View>
  );
}

export default function MyReportsScreen({ navigation }: { navigation: any }) {
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const {
    totalRecipes,
    avgPrepTimeMinutes,
    totalCategories,
    categoryStats,
    weekdayPoints,
    isLoading,
    error,
    refetch,
  } = useReportsData(period);

  const topCategories = categoryStats.slice(0, 5);
  const maxCategoryCount = topCategories[0]?.count ?? 1;

  const pieData = topCategories.map((s, i) => ({
    name: s.category,
    population: s.count,
    color: CATEGORY_COLORS[i],
    legendFontColor: "#8B8B8B",
    legendFontSize: 12,
  }));

  const lineData = {
    labels: weekdayPoints.map((p) => p.label),
    datasets: [{ data: weekdayPoints.map((p) => p.count) }],
  };

  return (
    <View className="flex-1 bg-[#FDFAF7]">
      <View className="pt-16 px-4 flex flex-row items-center gap-6">
        <Pressable onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left" size={24} color="black" />
        </Pressable>
        <Text className="font-robotoSemibold text-xl">Relatórios</Text>
      </View>
      <View className="flex-row mx-6 my-3 bg-[#EDE8E2] rounded-xl p-1">
        {PERIOD_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            className={`flex-1 py-2 items-center rounded-[10px] ${period === opt.value ? "bg-[#E8733A]" : ""
              }`}
            onPress={() => setPeriod(opt.value)}
            activeOpacity={0.8}
          >
            <Text
              className={`text-sm font-medium ${period === opt.value ? "text-white" : "text-neutral-400"
                }`}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E8733A" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-8 gap-3">
          <Text className="text-[15px] text-neutral-400 text-center">{error}</Text>
          <TouchableOpacity
            onPress={refetch}
            className="px-6 py-2.5 bg-[#E8733A] rounded-[10px]"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-6 pb-10"
        >
          <View className="flex-row gap-2.5 mt-2 mb-1">
            <StatCard
              icon="restaurant-outline"
              value={String(totalRecipes)}
              label="Receitas preparadas"
            />
            <StatCard
              icon="time-outline"
              value={`${avgPrepTimeMinutes}min`}
              label="Tempo médio"
            />
            <StatCard
              icon="grid-outline"
              value={String(totalCategories)}
              label="Categorias"
            />
          </View>
          {topCategories.length > 0 && (
            <View className="mt-7">
              <SectionHeader title="Categorias mais preparadas" />
              {topCategories.map((s) => (
                <HorizontalBar
                  key={s.category}
                  label={s.category}
                  count={s.count}
                  max={maxCategoryCount}
                />
              ))}
            </View>
          )}
          {pieData.length > 0 && (
            <View className="mt-7">
              <SectionHeader title="Tempo médio por categoria" />
              <View className="flex-row items-center">
                <PieChart
                  data={pieData}
                  width={CHART_WIDTH / 2 + 16}
                  height={160}
                  chartConfig={CHART_CONFIG}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="8"
                  hasLegend={false}
                  absolute={false}
                />
                <PieLegend stats={topCategories} />
              </View>
            </View>
          )}
          <View className="mt-7">
            <SectionHeader title="Evolução semanal" />
            <LineChart
              data={lineData}
              width={CHART_WIDTH}
              height={180}
              chartConfig={CHART_CONFIG}
              bezier
              withInnerLines
              withOuterLines={false}
              withShadow={false}
              style={{ borderRadius: 12, marginLeft: -8 }}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}