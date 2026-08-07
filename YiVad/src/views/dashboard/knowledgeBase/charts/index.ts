/**
 * Chart option factories for the knowledge base dashboard.
 * Each factory is a pure function: data in → ECOption out.
 */
import type { KnowledgeFileSummary, KnowledgeModuleStats } from "@/api/interface/yiweb";
import type { ECOption } from "@/components/ECharts/config";
import { countByField } from "../utils";
import { STATUS_COLORS, LIFECYCLE_COLORS, REVIEW_CYCLE_COLORS, TYPE_COLORS } from "../utils";

export const CHART_PALETTE = [
  "#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de",
  "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc", "#5ab1ef",
  "#ff99cc", "#99ccff", "#cc99ff", "#ffcc99", "#99ff99",
];

export const AGE_COLORS = ["#91cc75", "#73c0de", "#fac858", "#fc8452", "#ee6666", "#c0c4cc"];

// ── Review Cycle Donut ──

export function buildReviewCycleDonut(
  data: { name: string; count: number }[],
  missingCount: number,
): ECOption {
  const items = [
    ...data.map(d => ({ name: d.name, value: d.count, itemStyle: { color: REVIEW_CYCLE_COLORS[d.name] || "#ccc" } })),
    ...(missingCount > 0 ? [{ name: "__missing__", value: missingCount, itemStyle: { color: "#c0c4cc" } }] : []),
  ];
  return {
    tooltip: { trigger: "item", formatter: (p: any) => `${p.name === "__missing__" ? "No review" : p.name}: ${p.value} files (${p.percent}%)` },
    legend: { orient: "vertical", left: 0, top: "center", itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 10 }, formatter: (n: string) => n === "__missing__" ? "No review" : n },
    series: [{
      type: "pie", radius: ["50%", "75%"], center: ["58%", "50%"],
      label: { show: true, fontSize: 10, formatter: (p: any) => `${p.name === "__missing__" ? "No review" : p.name}\n${p.percent}%` },
      emphasis: { label: { fontSize: 14, fontWeight: "bold" } },
      data: items,
    }]
  };
}

// ── Type Bar ──

export function buildTypeBar(data: { name: string; count: number }[]): ECOption {
  const top = data.slice(0, 12);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "8%", top: "3%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", axisLabel: { fontSize: 9 } },
    yAxis: { type: "category", data: top.map(d => d.name).reverse(), axisLabel: { fontSize: 10 } },
    series: [{ type: "bar", barWidth: "65%",
      data: top.map(d => ({ value: d.count, itemStyle: { color: TYPE_COLORS[d.name] || "#5470c6", borderRadius: [0, 4, 4, 0] } })).reverse(),
    }]
  };
}

// ── Status Bar ──

export function buildStatusBar(data: { name: string; count: number }[]): ECOption {
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "8%", top: "3%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", axisLabel: { fontSize: 9 } },
    yAxis: { type: "category", data: data.map(d => d.name).reverse(), axisLabel: { fontSize: 10 } },
    series: [{ type: "bar", barWidth: "65%",
      data: data.map(d => ({ value: d.count, itemStyle: { color: STATUS_COLORS[d.name] || "#5470c6", borderRadius: [0, 4, 4, 0] } })).reverse(),
    }]
  };
}

// ── Size Distribution Bar ──

export function buildSizeDist(files: KnowledgeFileSummary[]): ECOption {
  const buckets = [
    { label: "<1KB", min: 0, max: 1024 },
    { label: "1-5KB", min: 1024, max: 5120 },
    { label: "5-20KB", min: 5120, max: 20480 },
    { label: "20-50KB", min: 20480, max: 51200 },
    { label: "50-100KB", min: 51200, max: 102400 },
    { label: ">100KB", min: 102400, max: Infinity },
  ];
  const bucketColors = ["#91cc75", "#73c0de", "#fac858", "#ee6666", "#9a60b4", "#5470c6"];
  const counts = buckets.map(b => ({
    name: b.label,
    count: files.filter(f => (f.size || 0) >= b.min && (f.size || 0) < b.max).length,
  }));
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "8%", top: "3%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", axisLabel: { fontSize: 9 } },
    yAxis: { type: "category", data: counts.map(d => d.name).reverse(), axisLabel: { fontSize: 10 } },
    series: [{ type: "bar", barWidth: "65%",
      data: counts.map((d, i) => ({ value: d.count, itemStyle: { color: bucketColors[i], borderRadius: [0, 4, 4, 0] } })).reverse(),
    }]
  };
}

// ── File Age Bar ──

export function buildFileAge(files: KnowledgeFileSummary[]): ECOption {
  const now = Date.now();
  const buckets = [
    { label: "<7d", max: 7 },
    { label: "7-30d", max: 30 },
    { label: "1-3mo", max: 90 },
    { label: "3-6mo", max: 180 },
    { label: "6-12mo", max: 365 },
    { label: ">1y", max: Infinity },
  ];
  const counts = buckets.map(() => 0);
  for (const f of files) {
    if (!f.updated) continue;
    try {
      const d = new Date(f.updated);
      if (isNaN(d.getTime())) continue;
      const days = (now - d.getTime()) / 86400000;
      for (let i = 0; i < buckets.length; i++) {
        if (days <= buckets[i].max) { counts[i]++; break; }
      }
    } catch { continue; }
  }
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "8%", top: "3%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", axisLabel: { fontSize: 9 } },
    yAxis: { type: "category", data: buckets.map(b => b.label).reverse(), axisLabel: { fontSize: 10 } },
    series: [{ type: "bar", barWidth: "65%",
      data: buckets.map((b, i) => ({ value: counts[i], itemStyle: { color: AGE_COLORS[i], borderRadius: [0, 4, 4, 0] } })).reverse(),
    }]
  };
}

// ── Lifecycle Bar ──

export function buildLifecycleBar(data: { name: string; count: number }[]): ECOption {
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "8%", top: "3%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", axisLabel: { fontSize: 9 } },
    yAxis: { type: "category", data: data.map(d => d.name).reverse(), axisLabel: { fontSize: 10 } },
    series: [{ type: "bar", barWidth: "65%",
      data: data.map(d => ({ value: d.count, itemStyle: { color: LIFECYCLE_COLORS[d.name] || "#5470c6", borderRadius: [0, 4, 4, 0] } })).reverse(),
    }]
  };
}

// ── Module Bar ──

export function buildModuleBar(
  modules: KnowledgeModuleStats[],
  activeCategory: string | undefined,
  colors: string[],
): ECOption {
  let filtered = modules.filter(m => m.name !== "__root__");
  if (activeCategory) filtered = filtered.filter(m => m.category === activeCategory);
  const top = filtered.sort((a, b) => b.count - a.count).slice(0, 15);
  return {
    tooltip: {
      trigger: "axis", axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        const md = filtered.find(m => m.name === p.name);
        if (!md) return `${p.name}: ${p.value} files`;
        return `<b>${md.category}/${md.name}</b><br/>${md.count} files | Stale: ${md.stale_count} | Tacit: ${md.tacit_count} | Coverage: ${md.review_coverage_pct}%`;
      },
    },
    grid: { left: "3%", right: "8%", top: "3%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", axisLabel: { fontSize: 9 } },
    yAxis: { type: "category", data: top.map(d => d.name).reverse(), axisLabel: { fontSize: 10 } },
    series: [{ type: "bar", barWidth: "65%",
      data: top.map((d, i) => ({ name: d.name, value: d.count, itemStyle: { color: colors[i % colors.length], borderRadius: [0, 4, 4, 0] } })).reverse(),
    }]
  };
}

// ── Roles Bar ──

export function buildRolesBar(data: { name: string; count: number }[], colors: string[]): ECOption {
  const top = data.slice(0, 15);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "8%", top: "3%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", axisLabel: { fontSize: 9 } },
    yAxis: { type: "category", data: top.map(d => d.name).reverse(), axisLabel: { fontSize: 10 } },
    series: [{ type: "bar", barWidth: "65%",
      data: top.map((d, i) => ({ value: d.count, itemStyle: { color: colors[i % colors.length], borderRadius: [0, 4, 4, 0] } })).reverse(),
    }]
  };
}

// ── Classification Heatmap ──

export function buildClassificationHeatmap(
  modules: KnowledgeModuleStats[],
  activeCategory: string | undefined,
): ECOption {
  let filtered = modules.filter(m => m.name !== "__root__");
  if (activeCategory) filtered = filtered.filter(m => m.category === activeCategory);
  const topMods = filtered.sort((a, b) => b.count - a.count).slice(0, 12);

  const statusSet = new Set<string>();
  for (const m of topMods) {
    for (const s of (m.statuses || [])) statusSet.add(s.name);
  }
  const statuses = Array.from(statusSet).sort();

  const heatData: [number, number, number][] = [];
  for (let mi = 0; mi < topMods.length; mi++) {
    const m = topMods[mi];
    const statusMap = new Map((m.statuses || []).map(s => [s.name, s.count]));
    for (let si = 0; si < statuses.length; si++) {
      const count = statusMap.get(statuses[si]) || 0;
      if (count > 0) heatData.push([mi, si, count]);
    }
  }
  const maxCount = Math.max(...heatData.map(d => d[2]), 1);

  return {
    tooltip: {
      formatter: (params: any) => {
        const d = params.data;
        if (!d || d.length < 3) return "";
        return `<b>${topMods[d[0]]?.name}</b> × <b>${statuses[d[1]]}</b><br/>${d[2]} files`;
      },
    },
    grid: { left: "12%", right: "5%", top: "3%", bottom: "8%" },
    xAxis: { type: "category", data: statuses, axisLabel: { fontSize: 9, rotate: 30 }, position: "top" },
    yAxis: { type: "category", data: topMods.map(m => m.name), axisLabel: { fontSize: 10 } },
    visualMap: {
      min: 0, max: maxCount, calculable: true, orient: "horizontal", left: "center", bottom: 0,
      inRange: { color: ["#f0f5ff", "#91cc75", "#fac858", "#ee6666"] },
      textStyle: { fontSize: 9 },
    },
    series: [{
      type: "heatmap", data: heatData, label: { show: true, fontSize: 9 },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,.3)" } },
    }],
  };
}