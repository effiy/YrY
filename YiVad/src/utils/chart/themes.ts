export interface ChartThemeConfig {
  id: string;
  name: string;
  colors: string[];
  backgroundColor: string;
  textStyle: { color: string; fontFamily?: string };
  grid: { borderColor: string };
}

const DEFAULT_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const chartThemes: Record<string, ChartThemeConfig> = {
  default: {
    id: "default",
    name: "默认蓝",
    colors: ["#409EFF", "#67C23A", "#E6A23C", "#F56C6C", "#909399", "#00D4AA", "#9B59B6", "#F39C12"],
    backgroundColor: "#ffffff",
    textStyle: { color: "#333333", fontFamily: DEFAULT_FONT },
    grid: { borderColor: "#E4E7ED" }
  },
  dark: {
    id: "dark",
    name: "暗色",
    colors: ["#409EFF", "#67C23A", "#E6A23C", "#F56C6C", "#909399", "#00D4AA", "#9B59B6", "#F39C12"],
    backgroundColor: "#1d1e1f",
    textStyle: { color: "#E0E0E0", fontFamily: DEFAULT_FONT },
    grid: { borderColor: "#363637" }
  },
  professional: {
    id: "professional",
    name: "专业灰蓝",
    colors: ["#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE", "#3BA272", "#FC8452", "#9A60B4"],
    backgroundColor: "#ffffff",
    textStyle: { color: "#464646", fontFamily: DEFAULT_FONT },
    grid: { borderColor: "#DFE3E9" }
  },
  vibrant: {
    id: "vibrant",
    name: "活力多色",
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"],
    backgroundColor: "#ffffff",
    textStyle: { color: "#2c3e50", fontFamily: DEFAULT_FONT },
    grid: { borderColor: "#EDF2F7" }
  }
};

export const CHART_THEMES = chartThemes;

export function getTheme(themeId?: string): ChartThemeConfig {
  return chartThemes[themeId ?? "default"] ?? chartThemes.default;
}

export function applyThemeToEChartsOption(option: Record<string, any>, theme: ChartThemeConfig): Record<string, any> {
  return {
    ...option,
    backgroundColor: theme.backgroundColor,
    color: option.color ?? theme.colors,
    textStyle: { ...theme.textStyle, ...option.textStyle }
  };
}
