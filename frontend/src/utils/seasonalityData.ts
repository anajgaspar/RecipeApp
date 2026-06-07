export type SeasonalIngredient = {
    name: string;
    months: number[];
};

export const SEASONAL_INGREDIENTS: SeasonalIngredient[] = [
    { name: "abacate", months: [4, 5, 6, 7, 8, 9] },
    { name: "abacaxi", months: [10, 11, 12, 1, 2, 3] },
    { name: "ameixa", months: [11, 12, 1, 2] },
    { name: "banana", months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { name: "caqui", months: [4, 5, 6, 7, 8] },
    { name: "laranja", months: [5, 6, 7, 8, 9, 10] },
    { name: "manga", months: [10, 11, 12, 1, 2] },
    { name: "maracujá", months: [4, 5, 6, 7, 8, 9] },
    { name: "melancia", months: [11, 12, 1, 2, 3] },
    { name: "morango", months: [6, 7, 8, 9, 10] },
    { name: "uva", months: [1, 2, 3, 12] },
    { name: "abobrinha", months: [10, 11, 12, 1, 2, 3, 4] },
    { name: "milho", months: [11, 12, 1, 2, 3] },
    { name: "tomate", months: [11, 12, 1, 2, 3, 4] },
    { name: "pimentão", months: [1, 2, 3, 10, 11, 12] },
    { name: "brócolis", months: [5, 6, 7, 8, 9, 10] },
    { name: "couve-flor", months: [5, 6, 7, 8, 9, 10] },
    { name: "espinafre", months: [5, 6, 7, 8, 9] },
    { name: "repolho", months: [4, 5, 6, 7, 8, 9, 10] },
    { name: "cenoura", months: [5, 6, 7, 8, 9, 10] },
    { name: "batata-doce", months: [3, 4, 5, 6, 7, 8] },
    { name: "mandioca", months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
];

export function normalizeForComparison(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function getSeasonalIngredientNames(month: number): string[] {
    return SEASONAL_INGREDIENTS.filter((i) => i.months.includes(month)).map((i) => i.name);
}

export function getSeasonName(month: number): string {
    if ([12, 1, 2].includes(month)) return "Verão";
    if ([3, 4, 5, 6].includes(month)) return "Outono";
    if ([7, 8].includes(month)) return "Inverno";
    return "Primavera";
}

export function getSeasonEmoji(month: number): string {
    if ([12, 1, 2].includes(month)) return "☀️";
    if ([3, 4, 5, 6].includes(month)) return "🍂";
    if ([7, 8].includes(month)) return "❄️";
    return "🌸";
}

export function getCurrentSeasonalIngredients(): SeasonalIngredient[] {
    const month = new Date().getMonth() + 1;
    return SEASONAL_INGREDIENTS.filter((i) => i.months.includes(month));
}