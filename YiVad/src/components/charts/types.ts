import type { ECOption } from "@/components/ECharts/config";

export interface ChartData {
  categories: string[];
  series: {
    name: string;
    data: number[];
    color?: string;
    smooth?: boolean;
    areaStyle?: boolean;
  }[];
}

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ScatterChartData {
  name: string;
  data: [number, number][];
  color?: string;
}

export interface HeatmapData {
  xAxis: string[];
  yAxis: string[];
  data: [number, number, number][];
  min?: number;
  max?: number;
}

export interface GaugeData {
  value: number;
  min?: number;
  max?: number;
  label?: string;
}

export interface RadarChartData {
  indicators: { name: string; max: number }[];
  series: { name: string; data: number[]; color?: string }[];
}

export interface TreemapChartData {
  name: string;
  value?: number;
  color?: string;
  children?: TreemapChartData[];
}

export interface FunnelChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ChartEvents {
  chartClick: [params: Record<string, unknown>];
}

export function buildAxisChartOption(
  data: ChartData,
  chartType: "line" | "bar",
  custom: Partial<ECOption> = {},
): ECOption {
  const { categories, series } = data;

  return {
    tooltip: { trigger: "axis" as const },
    legend: {
      data: series.map(s => s.name),
      bottom: 0,
      textStyle: { fontSize: 11 },
    },
    grid: { left: "3%", right: "4%", bottom: series.length > 1 ? "12%" : "3%", containLabel: true },
    xAxis: { type: "category" as const, data: categories, axisLabel: { fontSize: 11 } },
    yAxis: { type: "value" as const, axisLabel: { fontSize: 11 } },
    series: series.map(s => ({
      name: s.name,
      type: chartType,
      data: s.data,
      smooth: s.smooth ?? (chartType === "line"),
      areaStyle: s.areaStyle ? {} : undefined,
      itemStyle: s.color ? { color: s.color } : undefined,
    })),
    ...custom,
  };
}