/**
 * Pure ECharts option factories for the project dashboard.
 *
 * Every factory is a plain function of already-aggregated counts — no store or
 * component access — so the analytics strip stays trivially testable and the
 * option objects can be memoised by `computed`.
 *
 * Clickable segments carry their raw enum value in `data[i].rawKey`; the view
 * reads it back off `ECElementEvent.data` to drive the cross-filter.
 */
import type { ECOption } from "@/components/ECharts/config";
import type { IssuePriority, IssueStatus, IssueType } from "@/api/modules/issueService";
import { ISSUE_PRIORITY_MAP, ISSUE_STATUS_MAP, ISSUE_TYPE_MAP } from "@/api/modules/issueService";

export const STATUS_COLORS: Record<IssueStatus, string> = {
  backlog: "#c0c4cc",
  todo: "#909399",
  in_progress: "#5470c6",
  in_review: "#fac858",
  done: "#91cc75",
  cancelled: "#ee6666"
};

export const PRIORITY_COLORS: Record<IssuePriority, string> = {
  urgent: "#ee6666",
  high: "#fc8452",
  medium: "#fac858",
  low: "#73c0de",
  none: "#c0c4cc"
};

export const TYPE_COLORS: Record<IssueType, string> = {
  bug: "#ee6666",
  task: "#5470c6",
  feature: "#91cc75",
  improvement: "#fac858",
  requirement: "#9a60b4"
};

/** Axis/label grey that stays legible against both the light and dark themes. */
const AXIS_COLOR = "#909399";

interface Slice {
  rawKey: string;
  label: string;
  value: number;
  color: string;
}

/** Drop empty buckets so a chart never renders a row of zero-length bars. */
function toSlices<K extends string>(
  counts: Record<string, number>,
  labels: Record<K, string>,
  colors: Record<K, string>
): Slice[] {
  return (Object.keys(labels) as K[])
    .map(key => ({ rawKey: key, label: labels[key], value: counts[key] ?? 0, color: colors[key] }))
    .filter(s => s.value > 0);
}

/** Horizontal bar — reads top-to-bottom, so reverse for a descending look. */
function horizontalBar(slices: Slice[]): ECOption {
  const ordered = [...slices].reverse();
  return {
    grid: { left: 4, right: 40, top: 8, bottom: 4, containLabel: true },
    tooltip: { trigger: "item", confine: true, formatter: "{b}: <b>{c}</b>" },
    xAxis: { type: "value", show: false },
    yAxis: {
      type: "category",
      data: ordered.map(s => s.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: AXIS_COLOR, fontSize: 10, width: 76, overflow: "truncate" }
    },
    series: [
      {
        type: "bar",
        barWidth: "62%",
        label: { show: true, position: "right", fontSize: 10, color: AXIS_COLOR },
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        data: ordered.map(s => ({ value: s.value, name: s.label, rawKey: s.rawKey, itemStyle: { color: s.color } }))
      }
    ]
  };
}

export function buildStatusBar(counts: Record<string, number>): ECOption {
  return horizontalBar(toSlices(counts, ISSUE_STATUS_MAP, STATUS_COLORS));
}

export function buildTypeBar(counts: Record<string, number>): ECOption {
  return horizontalBar(toSlices(counts, ISSUE_TYPE_MAP, TYPE_COLORS));
}

/** Donut over *open* issues — priority of finished work is not actionable. */
export function buildPriorityDonut(counts: Record<string, number>): ECOption {
  const slices = toSlices(counts, ISSUE_PRIORITY_MAP, PRIORITY_COLORS);
  return {
    tooltip: { trigger: "item", confine: true, formatter: "{b}: <b>{c}</b> ({d}%)" },
    legend: {
      type: "scroll",
      orient: "vertical",
      right: 4,
      top: "center",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: AXIS_COLOR, fontSize: 10 }
    },
    series: [
      {
        type: "pie",
        radius: ["46%", "72%"],
        center: ["34%", "50%"],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderWidth: 2, borderColor: "transparent" },
        emphasis: { scale: true, scaleSize: 4 },
        data: slices.map(s => ({ value: s.value, name: s.label, rawKey: s.rawKey, itemStyle: { color: s.color } }))
      }
    ]
  };
}

export interface TopProjectRow {
  key: string;
  name: string;
  open: number;
  done: number;
}

/** Stacked done-vs-open per project — shows both volume and progress at once. */
export function buildTopProjectsBar(rows: TopProjectRow[]): ECOption {
  const ordered = [...rows].reverse();
  const names = ordered.map(r => r.name);
  return {
    grid: { left: 4, right: 40, top: 8, bottom: 18, containLabel: true },
    tooltip: { trigger: "axis", confine: true, axisPointer: { type: "shadow" } },
    legend: {
      bottom: 0,
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: AXIS_COLOR, fontSize: 10 }
    },
    xAxis: { type: "value", show: false },
    yAxis: {
      type: "category",
      data: names,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: AXIS_COLOR, fontSize: 10, width: 90, overflow: "truncate" }
    },
    series: [
      {
        name: "Open",
        type: "bar",
        stack: "total",
        barWidth: "62%",
        itemStyle: { color: "#fac858", borderRadius: [4, 0, 0, 4] },
        data: ordered.map(r => ({ value: r.open, rawKey: r.key }))
      },
      {
        name: "Done",
        type: "bar",
        stack: "total",
        itemStyle: { color: "#91cc75", borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: "right", fontSize: 10, color: AXIS_COLOR, formatter: (p: any) => p.data.total },
        data: ordered.map(r => ({ value: r.done, rawKey: r.key, total: r.open + r.done }))
      }
    ]
  };
}

/** Issue-touch count per day — the only real time series the data supports. */
export function buildActivityArea(days: Array<{ date: string; count: number }>): ECOption {
  return {
    grid: { left: 4, right: 8, top: 12, bottom: 4, containLabel: true },
    tooltip: { trigger: "axis", confine: true },
    xAxis: {
      type: "category",
      data: days.map(d => d.date.slice(5)),
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#dcdfe6" } },
      axisTick: { show: false },
      axisLabel: { color: AXIS_COLOR, fontSize: 9, interval: Math.max(0, Math.floor(days.length / 8) - 1) }
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      splitLine: { lineStyle: { color: "#f0f2f5" } },
      axisLabel: { color: AXIS_COLOR, fontSize: 9 }
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
        showSymbol: false,
        lineStyle: { width: 2, color: "#5470c6" },
        itemStyle: { color: "#5470c6" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(84,112,198,0.32)" },
              { offset: 1, color: "rgba(84,112,198,0.02)" }
            ]
          }
        },
        data: days.map(d => d.count)
      }
    ]
  };
}
