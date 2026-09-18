import type { ChartThemeConfig } from "./themes";
import { getTheme } from "./themes";
import { lttb } from "./downsampling";

export type EChartsRenderer = "canvas" | "svg";

export interface EChartsInitOptions {
  renderer?: EChartsRenderer;
  theme?: string;
  width?: number;
  height?: number;
}

export interface DataPoint {
  x: number;
  y: number;
  [key: string]: any;
}

export interface ChartSeriesConfig {
  name: string;
  data: DataPoint[];
  type: "line" | "bar" | "area" | "scatter" | "pie";
  color?: string;
  smooth?: boolean;
  areaStyle?: boolean;
  stack?: string;
}

export interface ChartConfig {
  title?: string;
  series: ChartSeriesConfig[];
  xAxis?: { type?: string; data?: string[]; name?: string };
  yAxis?: { type?: string; name?: string };
  legend?: { show?: boolean; orient?: string; top?: string };
  tooltip?: { trigger?: string };
}

export function buildEChartsOption(config: ChartConfig, themeId?: string): Record<string, any> {
  const theme = getTheme(themeId);

  const option: Record<string, any> = {
    title: config.title ? { text: config.title, left: "center", textStyle: { ...theme.textStyle } } : undefined,
    color: theme.colors,
    backgroundColor: theme.backgroundColor,
    textStyle: theme.textStyle,
    tooltip: config.tooltip ?? { trigger: "axis" },
    legend: config.legend ?? { show: true, orient: "horizontal", top: "bottom" },
    grid: { left: "3%", right: "4%", bottom: "15%", containLabel: true, borderColor: theme.grid.borderColor },
    xAxis: config.xAxis ?? { type: "category", data: [], boundaryGap: false },
    yAxis: config.yAxis ?? { type: "value" },
    series: config.series.map(s => ({
      name: s.name,
      type: s.type === "area" ? "line" : s.type,
      data: s.data.map(d => [d.x, d.y]),
      smooth: s.smooth ?? false,
      areaStyle: s.areaStyle ? {} : undefined,
      stack: s.stack,
      itemStyle: s.color ? { color: s.color } : undefined
    }))
  };

  return option;
}

export function downsampleSeries(data: DataPoint[], viewportWidth: number): DataPoint[] {
  if (!shouldDownsample(data.length, viewportWidth)) return data;
  const threshold = getThreshold(data.length, viewportWidth);
  const points: [number, number][] = data.map(d => [d.x, d.y]);
  const sampled = lttb(points, threshold);
  return sampled.map(p => data.find(d => d.x === p[0] && d.y === p[1]) ?? { x: p[0], y: p[1] });
}

function shouldDownsample(dataLength: number, viewportWidth: number): boolean {
  const maxVisiblePoints = Math.max(100, Math.floor(viewportWidth / 1.5));
  return dataLength > maxVisiblePoints;
}

function getThreshold(dataLength: number, viewportWidth: number): number {
  return Math.max(100, Math.floor(viewportWidth / 1.5));
}
