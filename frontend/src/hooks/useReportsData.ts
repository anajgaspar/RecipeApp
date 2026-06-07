import { useState, useEffect, useCallback } from "react";
import {
  Recipe,
  RecipeCategory,
  RecipeCompletionRecord,
  listCompletedRecipes,
  getMyRecipes,
  searchRecipes,
} from "@/src/services/recipeService";

export type PeriodFilter = "week" | "month";

export type CategoryStat = {
  category: RecipeCategory;
  count: number;
  avgTimeMinutes: number;
};

export type WeekdayPoint = {
  label: string;
  count: number;
};

export type ReportsData = {
  totalRecipes: number;
  avgPrepTimeMinutes: number;
  totalCategories: number;
  categoryStats: CategoryStat[];
  weekdayPoints: WeekdayPoint[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function getPeriodStart(period: PeriodFilter): Date {
  const start = new Date();
  if (period === "week") start.setDate(start.getDate() - 7);
  else if (period === "month") start.setMonth(start.getMonth() - 1);
  return start;
}

function filterByPeriod(
  completions: RecipeCompletionRecord[],
  period: PeriodFilter
): RecipeCompletionRecord[] {
  const start = getPeriodStart(period);
  return completions.filter((c) => new Date(c.completedAt) >= start);
}

function aggregateByCategory(
  completions: RecipeCompletionRecord[],
  recipeMap: Map<string, Recipe>
): CategoryStat[] {
  const map = new Map<RecipeCategory, { count: number; totalTime: number }>();

  for (const completion of completions) {
    const recipe = recipeMap.get(completion.recipeId);
    if (!recipe) continue;

    for (const cat of recipe.category) {
      const prev = map.get(cat) ?? { count: 0, totalTime: 0 };
      map.set(cat, {
        count: prev.count + 1,
        totalTime: prev.totalTime + recipe.prepTimeMinutes,
      });
    }
  }

  return Array.from(map.entries())
    .map(([category, { count, totalTime }]) => ({
      category,
      count,
      avgTimeMinutes: Math.round(totalTime / count),
    }))
    .sort((a, b) => b.count - a.count);
}

function aggregateByWeekday(completions: RecipeCompletionRecord[]): WeekdayPoint[] {
  const counts = new Array(7).fill(0);
  for (const c of completions) {
    const day = new Date(c.completedAt).getDay();
    counts[day === 0 ? 6 : day - 1]++;
  }
  return WEEKDAY_LABELS.map((label, i) => ({ label, count: counts[i] }));
}

function calcAvgPrepTime(
  completions: RecipeCompletionRecord[],
  recipeMap: Map<string, Recipe>
): number {
  let total = 0;
  let count = 0;
  for (const c of completions) {
    const recipe = recipeMap.get(c.recipeId);
    if (!recipe) continue;
    total += recipe.prepTimeMinutes;
    count++;
  }
  return count > 0 ? Math.round(total / count) : 0;
}

async function safeListCompletions(myRecipes: Recipe[]): Promise<RecipeCompletionRecord[]> {
  try {
    const { completions } = await listCompletedRecipes();
    return completions;
  } catch (e) {
    console.warn("Não foi possível buscar receitas, continuando sem.", e);

    return myRecipes.map((recipe) => ({
      id: `fallback-${recipe.id}`,
      userId: recipe.authorId,
      profileId: recipe.authorId,
      recipeId: recipe.id,
      completedAt: recipe.createdAt,
      createdAt: recipe.createdAt,
    }));
  }
}

export function useReportsData(period: PeriodFilter): ReportsData {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Omit<ReportsData, "isLoading" | "error" | "refetch">>({
    totalRecipes: 0,
    avgPrepTimeMinutes: 0,
    totalCategories: 0,
    categoryStats: [],
    weekdayPoints: [],
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const myRecipes = await getMyRecipes(100);

      const completions = await safeListCompletions(myRecipes);

      const recipeMap = new Map<string, Recipe>();
      for (const r of myRecipes) {
        recipeMap.set(r.id, r);
      }

      const missingIds = Array.from(new Set(completions.map((c) => c.recipeId)))
        .filter((id) => !recipeMap.has(id));

      if (missingIds.length > 0) {
        try {
          const extra = await searchRecipes({ limit: 200 });
          for (const r of extra) {
            recipeMap.set(r.id, r);
          }
        } catch {
          console.warn("Não foi possível buscar receitas, continuando sem.");
        }
      }

      const filtered = filterByPeriod(completions, period);

      if (filtered.length === 0) {
        setData({
          totalRecipes: 0,
          avgPrepTimeMinutes: 0,
          totalCategories: 0,
          categoryStats: [],
          weekdayPoints: aggregateByWeekday([]),
        });
        return;
      }

      const categoryStats = aggregateByCategory(filtered, recipeMap);
      const weekdayPoints = aggregateByWeekday(filtered);
      const avgPrepTimeMinutes = calcAvgPrepTime(filtered, recipeMap);
      const allCategories = new Set(categoryStats.map((s) => s.category));

      setData({
        totalRecipes: filtered.length,
        avgPrepTimeMinutes,
        totalCategories: allCategories.size,
        categoryStats,
        weekdayPoints,
      });
    } catch (e) {
      console.error("[useReportsData]", e);
      setError("Não foi possível carregar os relatórios.");
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, isLoading, error, refetch: fetchData };
}