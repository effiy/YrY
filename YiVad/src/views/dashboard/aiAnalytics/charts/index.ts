/**
 * Chart option factories for the AI Analytics dashboard.
 * Pure functions: data in → ECOption out.
 *
 * Inspired by:
 * - pi (agent tool execution / token usage visualization)
 * - deepseek-harness (model comparison / benchmark radar)
 * - llama_index (RAG retrieval quality / latency distribution)
 */
import type { ECOption } from "@/components/ECharts/config";
import type {
  AiStatsData,
  RagStatsData,
  PerformanceData,
  ServiceStatsData,
} from "@/api/interface/yiweb";

export const PALETTE = [
  "#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de",
  "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc", "#5ab1ef",
];

// ── Model Usage Donut (pi-inspired: model distribution) ──

export function buildModelUsageDonut(data: AiStatsData["model_usage"]): ECOption {
  const items = data.map((d, i) => ({
    name: d.model,
    value: d.count,
    itemStyle: { color: PALETTE[i % PALETTE.length] },
  }));
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: 0, top: "center", itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 10 } },
    series: [{
      type: "pie", radius: ["45%", "70%"], center: ["55%", "50%"],
      label: { fontSize: 10, formatter: "{b}\n{d}%" },
      emphasis: { label: { fontSize: 14, fontWeight: "bold" } },
      data: items,
    }],
  };
}

// ── Daily Activity Combo (line + bar) ──

export function buildDailyActivity(data: AiStatsData["daily"]): ECOption {
  const dates = data.map(d => d.date.slice(5));
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
    legend: { data: ["Sessions", "Messages"], top: 0, textStyle: { fontSize: 10 } },
    grid: { left: "3%", right: "4%", top: "15%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", data: dates, axisLabel: { fontSize: 9, rotate: 30 } },
    yAxis: [
      { type: "value", name: "Sessions", axisLabel: { fontSize: 9 } },
      { type: "value", name: "Messages", axisLabel: { fontSize: 9 } },
    ],
    series: [
      { name: "Sessions", type: "bar", barWidth: "50%", itemStyle: { color: "#5470c6", borderRadius: [4, 4, 0, 0] }, data: data.map(d => d.sessions) },
      { name: "Messages", type: "line", yAxisIndex: 1, smooth: true, itemStyle: { color: "#ee6666" }, data: data.map(d => d.messages) },
    ],
  };
}

// ── Model Comparison Radar (deepseek-harness inspired: benchmark comparison) ──

export interface ModelRadarItem {
  model: string;
  speed: number;    // 0-100
  quality: number;  // 0-100
  cost: number;     // 0-100 (higher = cheaper)
  accuracy: number; // 0-100
  latency: number;  // 0-100 (higher = faster)
}

export function buildModelComparisonRadar(models: ModelRadarItem[]): ECOption {
  const indicator = [
    { name: "Speed", max: 100 },
    { name: "Quality", max: 100 },
    { name: "Cost Eff.", max: 100 },
    { name: "Accuracy", max: 100 },
    { name: "Latency", max: 100 },
  ];
  return {
    tooltip: {},
    legend: { data: models.map(m => m.model), bottom: 0, textStyle: { fontSize: 10 } },
    radar: { indicator, center: ["50%", "45%"], radius: "60%" },
    series: [{
      type: "radar",
      data: models.map((m, i) => ({
        name: m.model,
        value: [m.speed, m.quality, m.cost, m.accuracy, m.latency],
        areaStyle: { opacity: 0.15 },
        lineStyle: { color: PALETTE[i % PALETTE.length] },
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      })),
    }],
  };
}

// ── RAG Query Scatter (llama_index inspired: score vs latency) ──

export function buildRagQueryScatter(queries: RagStatsData["recent_queries"]): ECOption {
  const data = queries.map(q => [q.latency_ms, q.top_score, q.question.slice(0, 30)]);
  return {
    tooltip: {
      trigger: "item",
      formatter: (p: any) => `<b>${p.value[2]}</b><br/>Latency: ${p.value[0]}ms<br/>Score: ${p.value[1].toFixed(3)}`,
    },
    grid: { left: "3%", right: "8%", top: "3%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", name: "Latency (ms)", axisLabel: { fontSize: 9 } },
    yAxis: { type: "value", name: "Top Score", axisLabel: { fontSize: 9 }, min: 0, max: 1 },
    series: [{
      type: "scatter",
      symbolSize: (val: number[]) => Math.max(8, val[1] * 30),
      data,
      itemStyle: {
        color: (p: any) => p.value[0] < 500 ? "#91cc75" : p.value[0] < 1000 ? "#fac858" : "#ee6666",
      },
    }],
  };
}

// ── RAG Query Latency Distribution (histogram) ──

export function buildRagLatencyHistogram(queries: RagStatsData["recent_queries"]): ECOption {
  const buckets = [
    { label: "<100ms", min: 0, max: 100 },
    { label: "100-300ms", min: 100, max: 300 },
    { label: "300-500ms", min: 300, max: 500 },
    { label: "500ms-1s", min: 500, max: 1000 },
    { label: "1-3s", min: 1000, max: 3000 },
    { label: ">3s", min: 3000, max: Infinity },
  ];
  const colors = ["#91cc75", "#73c0de", "#fac858", "#fc8452", "#ee6666", "#9a60b4"];
  const counts = buckets.map(b => queries.filter(q => q.latency_ms >= b.min && q.latency_ms < b.max).length);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "8%", top: "3%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", data: buckets.map(b => b.label), axisLabel: { fontSize: 9 } },
    yAxis: { type: "value", name: "Queries", axisLabel: { fontSize: 9 } },
    series: [{
      type: "bar", barWidth: "60%",
      data: counts.map((c, i) => ({ value: c, itemStyle: { color: colors[i], borderRadius: [4, 4, 0, 0] } })),
    }],
  };
}

// ── Service Performance Bar (success rate + avg duration) ──

export function buildServicePerformance(data: ServiceStatsData["by_service"]): ECOption {
  const top = data.sort((a, b) => b.calls - a.calls).slice(0, 10);
  return {
    tooltip: {
      trigger: "axis", axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params : [params];
        return p.map((x: any) => {
          const s = top.find(t => t.service === x.name);
          return s ? `<b>${s.service}.${s.method}</b><br/>Calls: ${s.calls}<br/>Success: ${s.success} / Failed: ${s.failed}<br/>Avg: ${s.avg_duration_ms}ms` : "";
        }).join("<br/>");
      },
    },
    legend: { data: ["Success Rate", "Avg Duration"], top: 0, textStyle: { fontSize: 10 } },
    grid: { left: "3%", right: "4%", top: "15%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", axisLabel: { fontSize: 9 } },
    yAxis: { type: "category", data: top.map(d => `${d.service.slice(0, 15)}.${d.method.slice(0, 12)}`).reverse(), axisLabel: { fontSize: 9 } },
    series: [
      {
        name: "Success Rate", type: "bar", barWidth: "40%",
        data: top.map(d => ({ value: +(d.success / Math.max(1, d.calls) * 100).toFixed(1), itemStyle: { color: d.failed === 0 ? "#91cc75" : d.failed / d.calls < 0.1 ? "#fac858" : "#ee6666", borderRadius: [0, 4, 4, 0] } })).reverse(),
        xAxisIndex: 0,
      },
    ],
  };
}

// ── System Health Gauges ──

export function buildDiskGauge(disk: PerformanceData["disk"]): ECOption {
  return {
    series: [{
      type: "gauge", startAngle: 210, endAngle: -30, center: ["50%", "55%"], radius: "85%",
      min: 0, max: 100,
      axisLine: { show: true, lineStyle: { width: 16, color: [[0.6, "#91cc75"], [0.85, "#fac858"], [1, "#ee6666"]] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { length: "60%", width: 6, itemStyle: { color: "auto" } },
      detail: { valueAnimation: true, fontSize: 16, offsetCenter: [0, "60%"], formatter: "{value}%" },
      data: [{ value: +disk.percent.toFixed(1), name: "Disk" }],
    }],
  };
}

export function buildMemoryGauge(memory: PerformanceData["memory"]): ECOption {
  return {
    series: [{
      type: "gauge", startAngle: 210, endAngle: -30, center: ["50%", "55%"], radius: "85%",
      min: 0, max: 100,
      axisLine: { show: true, lineStyle: { width: 16, color: [[0.5, "#91cc75"], [0.8, "#fac858"], [1, "#ee6666"]] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { length: "60%", width: 6, itemStyle: { color: "auto" } },
      detail: { valueAnimation: true, fontSize: 16, offsetCenter: [0, "60%"], formatter: "{value}%" },
      data: [{ value: +memory.percent.toFixed(1), name: "Memory" }],
    }],
  };
}

export function buildCpuGauge(cpuPercent: number): ECOption {
  return {
    series: [{
      type: "gauge", startAngle: 210, endAngle: -30, center: ["50%", "55%"], radius: "85%",
      min: 0, max: 100,
      axisLine: { show: true, lineStyle: { width: 16, color: [[0.3, "#91cc75"], [0.7, "#fac858"], [1, "#ee6666"]] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { length: "60%", width: 6, itemStyle: { color: "auto" } },
      detail: { valueAnimation: true, fontSize: 16, offsetCenter: [0, "60%"], formatter: "{value}%" },
      data: [{ value: +cpuPercent.toFixed(1), name: "CPU" }],
    }],
  };
}

// ── Token Usage LiquidFill (pi-inspired: consumption gauge) ──

export function buildTokenGauge(used: number, total: number): any {
  const pct = Math.min(used / Math.max(1, total), 1);
  return {
    series: [{
      type: "liquidFill",
      radius: "75%",
      center: ["50%", "50%"],
      data: [pct, pct * 0.95, pct * 0.9],
      color: [{ type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: pct > 0.8 ? "#ee6666" : "#5470c6" }, { offset: 1, color: pct > 0.8 ? "#fac858" : "#91cc75" }], global: false }],
      outline: { borderDistance: 4, itemStyle: { borderWidth: 2, borderColor: "#5470c6" } },
      label: { fontSize: 14, formatter: `${(pct * 100).toFixed(0)}%`, color: "#333" },
      backgroundStyle: { color: "#f5f5f5" },
    }],
  };
}

// ── RAG Config Info Card (llama_index inspired) ──

export function buildRagConfigIndicator(config: RagStatsData["config"]): { label: string; value: string; color: string }[] {
  return [
    { label: "Embed Model", value: config.embed_model, color: "#5470c6" },
    { label: "LLM", value: config.llm_model, color: "#91cc75" },
    { label: "Chunk Size", value: String(config.chunk_size), color: "#fac858" },
    { label: "Overlap", value: String(config.chunk_overlap), color: "#ee6666" },
    { label: "Top-K", value: String(config.top_k), color: "#73c0de" },
    { label: "Hybrid", value: config.hybrid_retrieval ? "ON" : "OFF", color: config.hybrid_retrieval ? "#91cc75" : "#c0c4cc" },
    { label: "Rerank", value: config.rerank_enabled ? "ON" : "OFF", color: config.rerank_enabled ? "#91cc75" : "#c0c4cc" },
    { label: "Citations", value: config.inline_citations ? "ON" : "OFF", color: config.inline_citations ? "#91cc75" : "#c0c4cc" },
  ];
}

// ── Tool Execution Timeline (pi-inspired: horizontal bar per tool) ──

export interface ToolExecItem {
  name: string;
  success: number;
  failed: number;
  avgDuration: number;
}

export function buildToolExecutionTimeline(tools: ToolExecItem[]): ECOption {
  const top = tools.slice(0, 10);
  return {
    tooltip: {
      trigger: "axis", axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params : [params];
        return p.map((x: any) => {
          const t = top.find(d => d.name === x.name);
          return t ? `<b>${t.name}</b><br/>Success: ${t.success}<br/>Failed: ${t.failed}<br/>Avg: ${t.avgDuration}ms` : "";
        }).join("<br/>");
      },
    },
    legend: { data: ["Success", "Failed"], top: 0, textStyle: { fontSize: 10 } },
    grid: { left: "3%", right: "4%", top: "15%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", axisLabel: { fontSize: 9 } },
    yAxis: { type: "category", data: top.map(d => d.name).reverse(), axisLabel: { fontSize: 10 } },
    series: [
      { name: "Success", type: "bar", stack: "total", barWidth: "50%", itemStyle: { color: "#91cc75", borderRadius: [0, 0, 0, 0] }, data: top.map(d => d.success).reverse() },
      { name: "Failed", type: "bar", stack: "total", barWidth: "50%", itemStyle: { color: "#ee6666", borderRadius: [0, 4, 4, 0] }, data: top.map(d => d.failed).reverse() },
    ],
  };
}

// ── RAG Document Coverage Treemap ──

export interface DocCoverageItem {
  name: string;
  value: number;
  children?: DocCoverageItem[];
}

export function buildDocCoverageTreemap(data: DocCoverageItem[]): ECOption {
  return {
    tooltip: { formatter: (info: any) => `${info.name}: ${info.value} docs` },
    series: [{
      type: "treemap", width: "100%", height: "100%",
      roam: false, nodeClick: false,
      breadcrumb: { show: true, height: 22, bottom: 0 },
      label: { show: true, fontSize: 10, formatter: "{b}\n{c}" },
      levels: [{
        itemStyle: { borderWidth: 2, borderColor: "#fff", gapWidth: 2 },
        upperLabel: { show: true, height: 22 },
      }],
      data,
    }],
  };
}

// ── Session Activity Heatmap (by hour × day) ──

export function buildActivityHeatmap(hourlyData: number[][]): ECOption {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data: [number, number, number][] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      data.push([h, d, hourlyData[d]?.[h] || 0]);
    }
  }
  const maxVal = Math.max(1, ...data.map(d => d[2]));
  return {
    tooltip: { position: "top", formatter: (p: any) => `${days[p.value[1]]} ${hours[p.value[0]]}: ${p.value[2]} msgs` },
    grid: { left: "8%", right: "5%", top: "3%", bottom: "8%" },
    xAxis: { type: "category", data: hours, splitArea: { show: true }, axisLabel: { fontSize: 9 } },
    yAxis: { type: "category", data: days, splitArea: { show: true }, axisLabel: { fontSize: 9 } },
    visualMap: { min: 0, max: maxVal, calculable: true, orient: "horizontal", left: "center", bottom: 0, inRange: { color: ["#f5f5f5", "#91cc75", "#5470c6", "#9a60b4"] } },
    series: [{ type: "heatmap", data, label: { show: false }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)" } } }],
  };
}