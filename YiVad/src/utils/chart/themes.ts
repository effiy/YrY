import type { ECOption } from "@/components/ECharts/config";

export interface ChartThemeConfig {
  name: string;
  color: string[];
  backgroundColor: string;
  textStyle: {
    color: string;
    fontSize: number;
    fontFamily: string;
  };
  title: {
    textStyle: { color: string };
  };
  grid: {
    borderColor: string;
  };
  tooltip: {
    backgroundColor: string;
    borderColor: string;
    textStyle: { color: string };
  };
}

const baseFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export const CHART_THEMES: Record<string, ChartThemeConfig> = {
  default: {
    name: "默认蓝",
    color: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc", "#5ab1ef"],
    backgroundColor: "#ffffff",
    textStyle: { color: "#333", fontSize: 12, fontFamily: baseFont },
    title: { textStyle: { color: "#333" } },
    grid: { borderColor: "#e0e0e0" },
    tooltip: { backgroundColor: "rgba(255,255,255,0.95)", borderColor: "#ddd", textStyle: { color: "#333" } },
  },

  dark: {
    name: "暗色",
    color: ["#4992ff", "#7cffb2", "#fddd60", "#ff6e76", "#58d9f9", "#05c091", "#ff8a45", "#8d48e3", "#dd79c2", "#2e90fa"],
    backgroundColor: "#1a1a2e",
    textStyle: { color: "#e0e0e0", fontSize: 12, fontFamily: baseFont },
    title: { textStyle: { color: "#e0e0e0" } },
    grid: { borderColor: "#333" },
    tooltip: { backgroundColor: "rgba(30,30,50,0.95)", borderColor: "#444", textStyle: { color: "#e0e0e0" } },
  },

  professional: {
    name: "专业灰蓝",
    color: ["#4e79a7", "#59a14f", "#f28e2b", "#e15759", "#76b7b2", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ac", "#6c7a89"],
    backgroundColor: "#f7f8fa",
    textStyle: { color: "#4a5568", fontSize: 12, fontFamily: baseFont },
    title: { textStyle: { color: "#2d3748" } },
    grid: { borderColor: "#e2e8f0" },
    tooltip: { backgroundColor: "rgba(255,255,255,0.97)", borderColor: "#cbd5e0", textStyle: { color: "#2d3748" } },
  },

  vibrant: {
    name: "活力多色",
    color: ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff", "#5f27cd", "#00d2d3", "#1dd1a1", "#f368e0", "#ff6348"],
    backgroundColor: "#ffffff",
    textStyle: { color: "#2d3436", fontSize: 12, fontFamily: baseFont },
    title: { textStyle: { color: "#2d3436" } },
    grid: { borderColor: "#dfe6e9" },
    tooltip: { backgroundColor: "rgba(255,255,255,0.95)", borderColor: "#dfe6e9", textStyle: { color: "#2d3436" } },
  },
};

export function applyChartTheme(ecOption: ECOption, theme: ChartThemeConfig): ECOption {
  return {
    ...ecOption,
    color: ecOption.color ?? theme.color,
    backgroundColor: ecOption.backgroundColor ?? theme.backgroundColor,
    title: {
      textStyle: { ...theme.title.textStyle },
      ...(ecOption.title as Record<string, unknown> || {}),
    },
    tooltip: {
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      ...(ecOption.tooltip as Record<string, unknown> || {}),
    },
  };
}