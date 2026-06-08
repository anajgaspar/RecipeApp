import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, Share } from "react-native";

export type MealPlan = Record<string, Record<string, { id: string; title: string; prepTimeMinutes?: number; difficulty?: string } | null>>;

export type MealType = {
  key: string;
  label: string;
  emoji: string;
};

export type SharedMealPlanSlot = {
  id: string;
  title: string;
  prepTimeMinutes?: number | null;
  difficulty?: string | null;
};

export type SharedMealPlanPayload = {
  version: 1;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  days: { date: string; label: string }[];
  mealTypes: MealType[];
  plan: Record<string, Record<string, SharedMealPlanSlot | null>>;
};

export const MEAL_TYPES: MealType[] = [
  { key: "breakfast", label: "Lanche da manhã", emoji: "🥐" },
  { key: "lunch", label: "Almoço", emoji: "🥗" },
  { key: "snack", label: "Lanche da tarde", emoji: "🥪" },
  { key: "dinner", label: "Jantar", emoji: "🍽️" },
];

export const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(value: string, maxChars: number, maxLines: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const tentative = currentLine ? `${currentLine} ${word}` : word;

    if (tentative.length <= maxChars) {
      currentLine = tentative;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  if (lines.length > maxLines) {
    return [...lines.slice(0, maxLines - 1), `${lines[maxLines - 1].slice(0, Math.max(0, maxChars - 1))}…`];
  }

  return lines;
}

export function getWeekRangeLabel(days: { date: string }[]) {
  if (days.length === 0) return "";

  const monday = new Date(days[0].date);
  const sunday = new Date(days[days.length - 1].date);

  return `${monday.toLocaleDateString("pt-BR", { month: "long", day: "numeric" })} - ${sunday.toLocaleDateString("pt-BR", { month: "long", day: "numeric" })}`;
}

export function buildSharedMealPlanPayload(plan: MealPlan, days: Date[]): SharedMealPlanPayload {
  const serializedDays = days.map((day, index) => ({
    date: day.toISOString().split("T")[0],
    label: DAY_LABELS[index],
  }));

  const serializedPlan: SharedMealPlanPayload["plan"] = {};

  MEAL_TYPES.forEach((meal) => {
    const slots: Record<string, SharedMealPlanSlot | null> = {};
    let hasAny = false;

    serializedDays.forEach(({ date }) => {
      const recipe = plan[meal.key]?.[date];
      if (recipe) {
        slots[date] = {
          id: recipe.id,
          title: recipe.title,
          prepTimeMinutes: recipe.prepTimeMinutes,
          difficulty: recipe.difficulty,
        };
        hasAny = true;
      }
    });

    if (hasAny) {
      serializedPlan[meal.key] = slots;
    }
  });

  return {
    version: 1,
    weekStart: serializedDays[0]?.date ?? "",
    weekEnd: serializedDays[serializedDays.length - 1]?.date ?? "",
    generatedAt: new Date().toISOString(),
    days: serializedDays,
    mealTypes: MEAL_TYPES,
    plan: serializedPlan,
  };
}

export function encodeSharedMealPlanPayload(payload: SharedMealPlanPayload) {
  return encodeURIComponent(JSON.stringify(payload));
}

export function decodeSharedMealPlanPayload(encodedPayload?: string | string[]) {
  if (!encodedPayload) return null;

  const value = Array.isArray(encodedPayload) ? encodedPayload[0] : encodedPayload;

  try {
    return JSON.parse(decodeURIComponent(value)) as SharedMealPlanPayload;
  } catch {
    return null;
  }
}

export function buildMealPlanDeepLink(payload: SharedMealPlanPayload) {
  const compact = {
    v: payload.version,
    ws: payload.weekStart,
    we: payload.weekEnd,
    p: payload.plan,
  };
  return `receitanamao://shared-meal-plan?data=${encodeURIComponent(JSON.stringify(compact))}`;
}

export function buildMealPlanShareMessage(payload: SharedMealPlanPayload) {
  const deepLink = buildMealPlanDeepLink(payload);
  const rangeLabel = getWeekRangeLabel(payload.days);

  return [
    `Planejamento semanal de refeições (${rangeLabel})`,
    "",
    "Abra no app pelo link abaixo:",
    deepLink,
  ].join("\n");
}

export function buildMealPlanSvg(payload: SharedMealPlanPayload) {
  const width = 1440;
  const leftColumnWidth = 220;
  const headerHeight = 210;
  const rowHeight = 180;
  const columnWidth = (width - leftColumnWidth - 60) / payload.days.length;
  const height = headerHeight + payload.mealTypes.length * rowHeight + 80;
  const rangeLabel = getWeekRangeLabel(payload.days);

  const cells: string[] = [];

  payload.mealTypes.forEach((meal, mealIndex) => {
    const rowTop = headerHeight + mealIndex * rowHeight;
    const rowCenterY = rowTop + rowHeight / 2;

    cells.push(`
      <rect x="30" y="${rowTop + 10}" width="${leftColumnWidth - 20}" height="${rowHeight - 20}" rx="24" fill="#fff7ed" stroke="#fed7aa" />
      <text x="58" y="${rowCenterY - 10}" font-size="34">${escapeXml(meal.emoji)}</text>
      <text x="58" y="${rowCenterY + 28}" font-size="20" font-weight="700" fill="#9a3412">${escapeXml(meal.label)}</text>
    `);

    payload.days.forEach((day, dayIndex) => {
      const cellLeft = leftColumnWidth + 20 + dayIndex * columnWidth;
      const recipe = payload.plan[meal.key]?.[day.date] ?? null;
      const fill = recipe ? "#fff7ed" : "#ffffff";
      const stroke = recipe ? "#fdba74" : "#e5e7eb";

      cells.push(`
        <rect x="${cellLeft}" y="${rowTop + 10}" width="${columnWidth - 10}" height="${rowHeight - 20}" rx="22" fill="${fill}" stroke="${stroke}" />
        <text x="${cellLeft + 18}" y="${rowTop + 42}" font-size="18" font-weight="700" fill="#6b7280">${escapeXml(day.label)}</text>
        <text x="${cellLeft + 18}" y="${rowTop + 66}" font-size="22" font-weight="700" fill="#1f2937">${new Date(day.date).getDate()}</text>
      `);

      if (recipe) {
        const titleLines = wrapText(recipe.title, 18, 2);
        const titleY = rowTop + 108;

        cells.push(
          titleLines
            .map(
              (line, lineIndex) => `<text x="${cellLeft + 18}" y="${titleY + lineIndex * 24}" font-size="19" font-weight="600" fill="#7c2d12">${escapeXml(line)}</text>`
            )
            .join("")
        );

        const meta = [recipe.prepTimeMinutes ? `${recipe.prepTimeMinutes} min` : null, recipe.difficulty ?? null]
          .filter(Boolean)
          .join(" • ");

        if (meta) {
          cells.push(`<text x="${cellLeft + 18}" y="${rowTop + rowHeight - 32}" font-size="16" fill="#b45309">${escapeXml(meta)}</text>`);
        }
      } else {
        cells.push(`<text x="${cellLeft + 18}" y="${rowTop + 118}" font-size="18" fill="#9ca3af">Sem refeição</text>`);
      }
    });
  });

  const dayHeaders = payload.days
    .map((day, index) => {
      const cellLeft = leftColumnWidth + 20 + index * columnWidth;
      return `
        <text x="${cellLeft + 18}" y="148" font-size="18" font-weight="700" fill="#9a3412">${escapeXml(day.label)}</text>
        <text x="${cellLeft + 18}" y="182" font-size="28" font-weight="700" fill="#1f2937">${new Date(day.date).getDate()}</text>
      `;
    })
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff7ed" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.08" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="36" fill="#ffffff" filter="url(#shadow)" />
      <text x="56" y="92" font-size="40" font-weight="800" fill="#111827">Planejamento semanal de refeições</text>
      <text x="56" y="132" font-size="22" fill="#6b7280">${escapeXml(rangeLabel)}</text>
      <rect x="56" y="156" width="320" height="40" rx="20" fill="#ffedd5" />
      <text x="76" y="183" font-size="18" font-weight="700" fill="#c2410c">Compartilhado em ${new Date(payload.generatedAt).toLocaleDateString("pt-BR")}</text>

      <rect x="30" y="${headerHeight - 24}" width="${width - 60}" height="52" rx="20" fill="#f9fafb" stroke="#e5e7eb" />
      <text x="58" y="${headerHeight + 10}" font-size="18" font-weight="700" fill="#9a3412">Refeição</text>
      ${dayHeaders}

      ${cells.join("")}

      <text x="56" y="${height - 28}" font-size="16" fill="#9ca3af">Receita na Mão</text>
    </svg>
  `;
}

export async function shareMealPlanAsImage(payload: SharedMealPlanPayload) {
  const isSharingAvailable = await Sharing.isAvailableAsync();

  if (!isSharingAvailable) {
    Alert.alert("Erro", "O compartilhamento não está disponível neste dispositivo.");
    return;
  }

  try {
    if (!Paths.cache) {
      throw new Error("Não foi possível acessar o diretório temporário.");
    }

    const file = new File(Paths.cache, `meal-plan-${payload.weekStart || Date.now()}.svg`);
    const svg = buildMealPlanSvg(payload);

    file.write(svg);

    await Sharing.shareAsync(file.uri, {
      dialogTitle: "Compartilhar planejamento semanal",
      mimeType: "image/svg+xml",
      UTI: "public.svg-image",
    });
  } catch (error) {
    console.error("Erro ao compartilhar planejamento como imagem:", error);
    Alert.alert("Compartilhamento", "Não foi possível gerar a imagem do planejamento.");
  }
}

export async function shareMealPlanViaLink(payload: SharedMealPlanPayload) {
  const message = buildMealPlanShareMessage(payload);
  await Share.share({
    title: "Planejamento semanal de refeições",
    message,
  });
}
