<template>
  <div class="rpc" v-loading="loading" element-loading-text="Loading data...">
    <!-- KPI Card -->
    <template v-if="component.type === 'kpi_card'">
      <div v-if="error" class="rpc-err">
        <el-icon><WarningFilled /></el-icon>
        <span>{{ error }}</span>
        <el-button link type="primary" size="small" @click="emit('retry')">Retry</el-button>
      </div>
      <div v-else-if="kpiVal === null && !loading" class="rpc-empty">No data available</div>
      <div v-else class="rpc-kpi">
        <div class="rpc-kpi__header">
          <span class="rpc-kpi__title">{{ component.title }}</span>
          <el-tag v-if="trendInfo" :type="trendTagType" size="small" effect="light">
            <el-icon class="rpc-kpi__trend-icon">
              <CaretTop v-if="trendInfo.direction === 'up'" />
              <CaretBottom v-else-if="trendInfo.direction === 'down'" />
              <Minus v-else />
            </el-icon>
            {{ trendInfo.delta }}%
          </el-tag>
        </div>
        <div class="rpc-kpi__value" :class="kpiClass">{{ formattedKpi }}</div>
        <div v-if="kpiBinding?.label" class="rpc-kpi__desc">{{ kpiBinding.label }}</div>
        <div v-if="sparklineData.length" ref="sparkRef" class="rpc-kpi__spark" />
      </div>
    </template>

    <!-- Charts (line / bar / pie) -->
    <template v-else-if="isChartType">
      <div v-if="error" class="rpc-err">
        <el-icon><WarningFilled /></el-icon>
        <span>{{ error }}</span>
        <el-button link type="primary" size="small" @click="emit('retry')">Retry</el-button>
      </div>
      <div v-else-if="!chartOption && !loading" class="rpc-empty">No data to chart</div>
      <ECharts v-else-if="chartOption" :option="chartOption" class="rpc-chart" />
    </template>

    <!-- Table -->
    <template v-else-if="component.type === 'table'">
      <div v-if="tableErr" class="rpc-err">
        <el-icon><WarningFilled /></el-icon>
        <span>{{ tableErr }}</span>
        <el-button link type="primary" size="small" @click="fetchTable">Retry</el-button>
      </div>
      <div v-else class="rpc-table-wrap">
        <el-table
          :data="tableRows"
          v-loading="tableLoading"
          size="small"
          border
          stripe
          max-height="300"
          empty-text="No records found"
        >
          <el-table-column
            v-for="col in tableColumns"
            :key="col"
            :prop="col"
            :label="col"
            min-width="100"
            show-overflow-tooltip
          />
        </el-table>
        <div v-if="tableTotal > tableRows.length" class="rpc-table__more">
          {{ tableTotal - tableRows.length }} more rows not shown
        </div>
      </div>
    </template>

    <!-- Text -->
    <template v-else-if="component.type === 'text'">
      <div class="rpc-text" v-html="renderedText" />
    </template>

    <!-- Gauge (rendered as bar/progress for now) -->
    <template v-else-if="component.type === 'gauge'">
      <div v-if="kpiVal === null && !loading" class="rpc-empty">No data</div>
      <div v-else class="rpc-gauge">
        <div class="rpc-gauge__val">{{ formattedKpi }}</div>
        <el-progress
          :percentage="Math.min(kpiVal ?? 0, 100)"
          :color="gaugeColor"
          :stroke-width="8"
        />
      </div>
    </template>

    <!-- Fallback for unknown types -->
    <div v-else class="rpc-empty">Unsupported component type: {{ component.type }}</div>
  </div>
</template>

<script setup lang="ts" name="reportPreviewContent">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { WarningFilled, CaretTop, CaretBottom, Minus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import * as echarts from "echarts/core";
import { queryDocuments } from "@/api/modules/dataService";
import type { ReportComponent, DashboardResponse, TrendDataPoint, ThroughputData, PieDataItem, CfdDataPoint, BottleneckItem, ControlChartPoint } from "@/types/analytics";
import type { KpiBinding, ChartBinding } from "./composables/useReportData";
import { useReportData, getKpiMeta } from "./composables/useReportData";

const props = defineProps<{
  component: ReportComponent;
  dashboard: DashboardResponse | null;
  loading?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{ retry: [] }>();

const component = computed(() => props.component);

// ── KPI ──────────────────────────────────────────────────────────────────────

const kpiBinding = computed<KpiBinding | null>(() => {
  const ds = props.component.data_source;
  if (!ds?.metrics?.length) return null;
  const m = ds.metrics[0];
  const field = m.alias || m.field;
  let section: KpiBinding["section"] = "basic";
  if (ds.cname === "bugs") {
    section = "quality";
  } else if (
    m.field.includes("cycle") || m.field.includes("lead") ||
    m.field.includes("throughput") || m.field.includes("velocity") ||
    m.field.includes("arrival") || m.field.includes("wip") ||
    m.field.includes("efficiency") || m.field.includes("predictability") ||
    m.field.includes("done_count")
  ) {
    section = "efficiency";
  }
  const meta = getKpiMeta(field);
  return { section, field, format: meta.format, label: component.value.title, lowerIsBetter: meta.lowerIsBetter };
});

const kpiVal = computed<number | null>(() => {
  if (!props.dashboard || !kpiBinding.value) return null;
  const binding = kpiBinding.value;
  // file_alerts and module_dashboard sections need separate data props
  if (binding.section === "file_alerts" || binding.section === "module_dashboard") return null;
  try {
    const section = props.dashboard[binding.section] as Record<string, any>;
    if (!section) return null;
    const val = binding.field.split(".").reduce((obj, key) => obj?.[key], section);
    return typeof val === "number" ? val : null;
  } catch {
    return null;
  }
});

const formattedKpi = computed(() => {
  if (kpiVal.value === null || kpiVal.value === undefined) return "--";
  const fmt = kpiBinding.value?.format || "number";
  const v = kpiVal.value;
  switch (fmt) {
    case "percent":
      return `${Number(v).toFixed(1)}%`;
    case "duration":
      return Number(v) >= 24 ? `${(Number(v) / 24).toFixed(1)}d` : `${Number(v).toFixed(1)}h`;
    default:
      return Number(v) >= 1000 ? Number(v).toLocaleString() : Number.isInteger(Number(v)) ? String(v) : Number(v).toFixed(1);
  }
});

const kpiClass = computed(() => {
  if (kpiVal.value === null) return "";
  const meta = kpiBinding.value;
  if (!meta?.lowerIsBetter) return "is-good";
  // For "lower is better" metrics (bug_rate, cycle_time...), high = bad
  return "is-bad";
});

const trendTagType = computed(() => {
  const t = trendInfo.value;
  if (!t) return "info";
  if (kpiBinding.value?.lowerIsBetter) {
    // For "lower is better": down = good, up = bad
    return t.direction === "down" ? "success" : t.direction === "up" ? "danger" : "info";
  }
  return t.direction === "up" ? "success" : t.direction === "down" ? "danger" : "info";
});

const trendInfo = computed(() => {
  if (!props.dashboard || !kpiBinding.value) return null;
  const binding = kpiBinding.value;
  // Try prev_period comparison for quality fields
  if (binding.section === "quality" && props.dashboard.quality?.prev_period) {
    const prev = props.dashboard.quality.prev_period as Record<string, any>;
    const curr = props.dashboard.quality as Record<string, any>;
    const cv = Number(curr[binding.field]) || 0;
    const pv = Number(prev[binding.field]) || 0;
    if (pv === 0) return null;
    const delta = ((cv - pv) / pv) * 100;
    return { direction: (delta > 0 ? "up" : delta < 0 ? "down" : "neutral") as "up" | "down" | "neutral", delta: Math.round(Math.abs(delta) * 10) / 10 };
  }
  return null;
});

// Mini sparkline chart
const sparkRef = ref<HTMLDivElement>();
let sparkInstance: echarts.ECharts | null = null;
const sparklineData = computed(() => {
  if (!props.dashboard) return [];
  const ds = component.value.data_source;
  if (ds?.cname === "issues" && props.dashboard.efficiency?.weekly_throughput) {
    return props.dashboard.efficiency.weekly_throughput.map((d: ThroughputData) => d.count);
  }
  if (ds?.cname === "bugs" && props.dashboard.quality?.bug_trend) {
    return props.dashboard.quality.bug_trend.map((d: TrendDataPoint) => d.value);
  }
  return [];
});

const sparkColor = computed(() => {
  const lower = kpiBinding.value?.lowerIsBetter;
  if (lower === undefined) return "#5470c6";
  return lower ? "#f56c6c" : "#67c23a";
});
const sparkAreaTop = computed(() => {
  const lower = kpiBinding.value?.lowerIsBetter;
  if (lower === undefined) return "rgba(84,112,198,0.15)";
  return lower ? "rgba(245,108,108,0.15)" : "rgba(103,194,58,0.15)";
});

function initSparkline() {
  if (!sparkRef.value || !sparklineData.value.length) return;
  if (!sparkInstance) {
    sparkInstance = echarts.init(sparkRef.value, undefined, { renderer: "canvas" });
  }
  sparkInstance.setOption({
    grid: { left: 0, right: 0, top: 2, bottom: 0 },
    xAxis: { type: "category", show: false, data: sparklineData.value.map((_, i) => i) },
    yAxis: { type: "value", show: false, min: "dataMin" },
    series: [{
      type: "line",
      data: sparklineData.value,
      smooth: true,
      symbol: "none",
      lineStyle: { width: 1.5, color: sparkColor.value },
      areaStyle: {
        color: {
          type: "linear", x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: sparkAreaTop.value },
            { offset: 1, color: "rgba(84,112,198,0)" }
          ]
        }
      }
    }]
  });
}

watch([sparklineData, () => props.dashboard], () => nextTick(initSparkline));
onMounted(() => nextTick(initSparkline));
onUnmounted(() => { sparkInstance?.dispose(); sparkInstance = null; });

// ── Charts ───────────────────────────────────────────────────────────────────

const isChartType = computed(() =>
  ["line_chart", "bar_chart", "pie_chart"].includes(component.value.type)
);

const chartOption = computed<ECOption | null>(() => {
  if (!props.dashboard) return null;
  const c = component.value;
  const ds = c.data_source;
  const isQuality = ds?.cname === "bugs";
  const sec = isQuality ? props.dashboard.quality : props.dashboard.efficiency;
  if (!sec) return null;

  const field = ds?.metrics?.[0]?.alias || ds?.metrics?.[0]?.field;

  // Special chart types dispatched by field name
  if (field === "cfd" && (sec as any).cfd?.length) {
    return buildCfdChart((sec as any).cfd);
  }
  if (field === "bottlenecks" && (sec as any).bottlenecks?.length) {
    return buildBottleneckChart((sec as any).bottlenecks);
  }
  if (field === "control_chart" && (sec as any).control_chart?.length) {
    return buildControlChart((sec as any).control_chart);
  }

  const chartType = c.config?.chartType as string || c.type;

  try {
    switch (chartType) {
      case "line_chart":
        return buildLineChart(sec, ds, c.title);
      case "bar_chart":
        return buildBarChart(sec, ds, c.title);
      case "pie_chart":
        return buildPieChart(sec, ds, c.title);
      default:
        return null;
    }
  } catch {
    return null;
  }
});

const gaugeColor = computed(() => {
  const v = kpiVal.value ?? 0;
  if (v >= 80) return "#67c23a";
  if (v >= 60) return "#e6a23c";
  return "#f56c6c";
});

const AXIS = "#909399";

function buildLineChart(sec: any, ds: any, _title: string): ECOption | null {
  const field = ds?.metrics?.[0]?.alias || ds?.metrics?.[0]?.field;

  // Multi-series percentile trends
  if (field === "cycle_time_trend" && sec.cycle_time_trend?.length) {
    return buildMultiLineChart(sec.cycle_time_trend, ["p50", "p80", "p95"]);
  }
  if (field === "lead_time_trend" && sec.lead_time_trend?.length) {
    return buildMultiLineChart(sec.lead_time_trend, ["p50", "p80", "p95"]);
  }
  // Inflow/Outflow dual-series
  if (field === "inflow_outflow") {
    const io = sec.inflow_outflow;
    if (!io?.inflow?.length && !io?.outflow?.length) return null;
    const dates = (io.inflow || io.outflow).map((d: any) => (d.date || "").slice(5));
    return {
      grid: { left: 8, right: 8, top: 12, bottom: 20, containLabel: true },
      tooltip: { trigger: "axis", confine: true },
      legend: { data: ["Inflow", "Outflow"], bottom: 0, textStyle: { fontSize: 10, color: AXIS } },
      xAxis: {
        type: "category", data: dates, boundaryGap: false,
        axisLine: { lineStyle: { color: "#dcdfe6" } }, axisTick: { show: false },
        axisLabel: { color: AXIS, fontSize: 9, interval: Math.max(0, Math.floor(dates.length / 8) - 1) }
      },
      yAxis: { type: "value", minInterval: 1, splitLine: { lineStyle: { color: "#f0f2f5" } }, axisLabel: { color: AXIS, fontSize: 9 } },
      series: [
        { name: "Inflow", type: "line", smooth: true, symbol: "circle", symbolSize: 3, showSymbol: false, data: (io.inflow || []).map((d: any) => d.value ?? 0), lineStyle: { width: 2, color: "#5470c6" } },
        { name: "Outflow", type: "line", smooth: true, symbol: "circle", symbolSize: 3, showSymbol: false, data: (io.outflow || []).map((d: any) => d.value ?? 0), lineStyle: { width: 2, color: "#91cc75" } }
      ]
    };
  }

  // Single-value trend fields (existing + new)
  let data: { date: string; value: number }[] = [];
  if (sec.bug_trend && (!field || field === "bug_trend")) data = sec.bug_trend;
  else if (sec.rework_trend && field === "rework_trend") data = sec.rework_trend;
  else if (sec.mttr_trend && field === "mttr_trend") data = sec.mttr_trend;
  else return null;

  if (!data.length) return null;
  return {
    grid: { left: 8, right: 8, top: 12, bottom: 4, containLabel: true },
    tooltip: { trigger: "axis", confine: true, formatter: "{b}: <b>{c}</b>" },
    xAxis: {
      type: "category",
      data: data.map((d: any) => (d.date || d.label || "").slice(5)),
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#dcdfe6" } },
      axisTick: { show: false },
      axisLabel: { color: AXIS, fontSize: 9, interval: Math.max(0, Math.floor(data.length / 8) - 1) }
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      splitLine: { lineStyle: { color: "#f0f2f5" } },
      axisLabel: { color: AXIS, fontSize: 9 }
    },
    series: [{
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 4,
      showSymbol: false,
      lineStyle: { width: 2, color: "#5470c6" },
      itemStyle: { color: "#5470c6" },
      areaStyle: {
        color: {
          type: "linear", x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(84,112,198,0.24)" },
            { offset: 1, color: "rgba(84,112,198,0.02)" }
          ]
        }
      },
      data: data.map(d => d.value)
    }]
  };
}

function buildBarChart(sec: any, ds: any, _title: string): ECOption | null {
  const field = ds?.metrics?.[0]?.alias || ds?.metrics?.[0]?.field;
  let data: { period: string; count: number }[] = [];

  if (sec.weekly_throughput && (!field || field === "throughput")) data = sec.weekly_throughput;
  else if (sec.defect_density && field === "defect_density") {
    const dd = sec.defect_density as { module: string; bugs: number }[];
    if (!dd?.length) return null;
    return {
      grid: { left: 4, right: 40, top: 8, bottom: 4, containLabel: true },
      tooltip: { trigger: "item", confine: true, formatter: "{b}: <b>{c}</b>" },
      xAxis: { type: "value", show: false },
      yAxis: {
        type: "category",
        data: [...dd].reverse().map(d => d.module),
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: AXIS, fontSize: 10 }
      },
      series: [{
        type: "bar",
        barWidth: "62%",
        label: { show: true, position: "right", fontSize: 10, color: AXIS },
        itemStyle: { color: "#f56c6c", borderRadius: [0, 4, 4, 0] },
        data: [...dd].reverse().map(d => d.bugs)
      }]
    };
  } else if (sec.module_quality && field === "module_quality") {
    const mq = sec.module_quality as { module: string; quality_score: number; bugs: number }[];
    if (!mq?.length) return null;
    return {
      grid: { left: 4, right: 50, top: 8, bottom: 4, containLabel: true },
      tooltip: { trigger: "item", confine: true },
      xAxis: { type: "value", name: "Quality Score", nameTextStyle: { fontSize: 9, color: AXIS } },
      yAxis: {
        type: "category",
        data: [...mq].reverse().map(d => d.module),
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: AXIS, fontSize: 10, width: 80, overflow: "truncate" }
      },
      series: [{
        type: "bar",
        barWidth: "62%",
        label: { show: true, position: "right", fontSize: 10, color: AXIS, formatter: "{c} ({@bugs}b)" },
        itemStyle: {
          color: {
            type: "linear", x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: "#f56c6c" },
              { offset: 0.5, color: "#e6a23c" },
              { offset: 1, color: "#67c23a" }
            ]
          },
          borderRadius: [0, 4, 4, 0]
        },
        data: [...mq].reverse().map(d => ({ value: d.quality_score, bugs: d.bugs }))
      }]
    };
  } else return null;

  if (!data.length) return null;
  return {
    grid: { left: 4, right: 8, top: 12, bottom: 4, containLabel: true },
    tooltip: { trigger: "axis", confine: true, axisPointer: { type: "shadow" } },
    xAxis: {
      type: "category",
      data: data.map(d => (d.period || "").slice(5)),
      axisLine: { lineStyle: { color: "#dcdfe6" } },
      axisTick: { show: false },
      axisLabel: { color: AXIS, fontSize: 9, interval: Math.max(0, Math.floor(data.length / 8) - 1) }
    },
    yAxis: {
      type: "value", minInterval: 1,
      splitLine: { lineStyle: { color: "#f0f2f5" } },
      axisLabel: { color: AXIS, fontSize: 9 }
    },
    series: [{
      type: "bar",
      barWidth: "62%",
      itemStyle: { color: "#5470c6", borderRadius: [4, 4, 0, 0] },
      data: data.map(d => d.count)
    }]
  };
}

function buildPieChart(sec: any, ds: any, _title: string): ECOption | null {
  const field = ds?.metrics?.[0]?.alias || ds?.metrics?.[0]?.field;
  let dist: Record<string, number> = {};

  if (sec.severity_distribution && (!field || field === "severity")) dist = sec.severity_distribution;
  else if (sec.status_breakdown && field === "status") dist = sec.status_breakdown;
  else if (sec.bug_age_distribution && field === "age") dist = sec.bug_age_distribution;
  else if (sec.wip_breakdown && field === "wip") dist = sec.wip_breakdown;
  else return null;

  const entries = Object.entries(dist).filter(([, v]) => v > 0);
  if (!entries.length) return null;
  const colors = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#fc8452", "#9a60b4", "#ea7ccc"];

  return {
    tooltip: { trigger: "item", confine: true, formatter: "{b}: <b>{c}</b> ({d}%)" },
    legend: {
      type: "scroll", orient: "vertical", right: 4, top: "center",
      itemWidth: 8, itemHeight: 8,
      textStyle: { color: AXIS, fontSize: 10 }
    },
    series: [{
      type: "pie",
      radius: ["46%", "72%"],
      center: ["34%", "50%"],
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      itemStyle: { borderWidth: 2, borderColor: "transparent" },
      emphasis: { scale: true, scaleSize: 4 },
      data: entries.map(([k, v], i) => ({ value: v, name: k, itemStyle: { color: colors[i % colors.length] } }))
    }]
  };
}

// ── Special chart builders ──────────────────────────────────────────────────

function buildMultiLineChart(
  data: { label: string;[key: string]: any }[],
  fields: string[]
): ECOption | null {
  if (!data?.length) return null;
  const colors = ["#5470c6", "#fac858", "#f56c6c"];
  return {
    grid: { left: 8, right: 8, top: 12, bottom: 20, containLabel: true },
    tooltip: { trigger: "axis", confine: true },
    legend: { data: fields, bottom: 0, textStyle: { fontSize: 10, color: AXIS } },
    xAxis: {
      type: "category",
      data: data.map(d => (d.label || "").slice(5)),
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#dcdfe6" } },
      axisTick: { show: false },
      axisLabel: { color: AXIS, fontSize: 9, interval: Math.max(0, Math.floor(data.length / 8) - 1) }
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#f0f2f5" } },
      axisLabel: { color: AXIS, fontSize: 9 }
    },
    series: fields.map((f, i) => ({
      name: f,
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 3,
      showSymbol: false,
      lineStyle: { width: 2, color: colors[i % colors.length] },
      data: data.map(d => d[f] ?? 0)
    }))
  };
}

function buildCfdChart(cfd: any[]): ECOption | null {
  if (!cfd?.length) return null;
  const stackKeys = ["backlog", "todo", "in_progress", "review", "done"];
  const stackColors = ["#a0a7b0", "#5470c6", "#fac858", "#91cc75", "#67c23a"];
  return {
    grid: { left: 8, right: 8, top: 12, bottom: 20, containLabel: true },
    tooltip: { trigger: "axis", confine: true },
    legend: { data: stackKeys, bottom: 0, textStyle: { fontSize: 9, color: AXIS } },
    xAxis: {
      type: "category",
      data: cfd.map(d => (d.date || "").slice(5)),
      axisLine: { lineStyle: { color: "#dcdfe6" } },
      axisLabel: { color: AXIS, fontSize: 9, interval: Math.max(0, Math.floor(cfd.length / 10) - 1) }
    },
    yAxis: { type: "value", splitLine: { lineStyle: { color: "#f0f2f5" } }, axisLabel: { color: AXIS, fontSize: 9 } },
    series: stackKeys.map((key, i) => ({
      name: key,
      type: "line",
      stack: "total",
      areaStyle: {},
      smooth: false,
      symbol: "none",
      lineStyle: { width: 0 },
      color: stackColors[i],
      data: cfd.map(d => (d as any)[key] ?? 0)
    }))
  };
}

function buildBottleneckChart(bottlenecks: any[]): ECOption | null {
  if (!bottlenecks?.length) return null;
  return {
    grid: { left: 4, right: 40, top: 8, bottom: 4, containLabel: true },
    tooltip: { trigger: "item", confine: true },
    xAxis: { type: "value", name: "Severity", nameTextStyle: { fontSize: 9, color: AXIS } },
    yAxis: {
      type: "category",
      data: [...bottlenecks].reverse().map((b: any) => b.status),
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: AXIS, fontSize: 10 }
    },
    series: [{
      type: "bar",
      barWidth: "62%",
      label: { show: true, position: "right", fontSize: 10, color: AXIS },
      itemStyle: { borderRadius: [0, 4, 4, 0] },
      data: [...bottlenecks].reverse().map((b: any) => ({
        value: b.severity,
        itemStyle: { color: b.is_bottleneck ? "#f56c6c" : "#a0a7b0" }
      }))
    }]
  };
}

function buildControlChart(data: any[]): ECOption | null {
  if (!data?.length) return null;
  return {
    grid: { left: 8, right: 8, top: 12, bottom: 4, containLabel: true },
    tooltip: { trigger: "axis", confine: true },
    xAxis: {
      type: "category",
      data: data.map(d => (d.date || "").slice(5)),
      axisLabel: { color: AXIS, fontSize: 9, interval: Math.max(0, Math.floor(data.length / 10) - 1) }
    },
    yAxis: { type: "value", name: "Days", nameTextStyle: { fontSize: 9, color: AXIS }, splitLine: { lineStyle: { color: "#f0f2f5" } } },
    series: [
      { type: "scatter", symbolSize: 6, data: data.map(d => d.cycle_time), itemStyle: { color: "#5470c6" } },
      { name: "Moving Avg (5)", type: "line", smooth: true, symbol: "none", data: data.map(d => d.moving_avg_5), lineStyle: { color: "#f56c6c", width: 1.5 } }
    ]
  };
}

// ── Table ────────────────────────────────────────────────────────────────────

const tableRows = ref<any[]>([]);
const tableTotal = ref(0);
const tableLoading = ref(false);
const tableErr = ref<string | null>(null);

const tableColumns = computed(() => {
  const c = component.value;
  if (c.config?.columns && Array.isArray(c.config.columns)) return c.config.columns;
  if (tableRows.value.length) return Object.keys(tableRows.value[0]);
  return [];
});

async function fetchTable() {
  const ds = component.value.data_source;
  if (!ds?.cname) {
    tableErr.value = "No data source configured";
    return;
  }
  tableLoading.value = true;
  tableErr.value = null;
  try {
    const filter = ds.filter || {};
    const limit = component.value.config?.limit || 10;
    const res = await queryDocuments({
      cname: ds.cname,
      filter,
      pageNum: 1,
      pageSize: limit,
      orderBy: component.value.config?.orderBy || "created_at",
      orderType: component.value.config?.orderType || "desc"
    });
    if (res.code === 0 && res.data) {
      tableRows.value = (res.data as any).list || [];
      tableTotal.value = (res.data as any).total || 0;
    } else {
      tableErr.value = res.message || "Query failed";
    }
  } catch (e: any) {
    tableErr.value = e?.message || "Failed to load table data";
  } finally {
    tableLoading.value = false;
  }
}

watch(() => component.value.id, () => {
  if (component.value.type === "table") fetchTable();
}, { immediate: true });

// ── Text ─────────────────────────────────────────────────────────────────────

const renderedText = computed(() => {
  const content = component.value.config?.content || "";
  // Basic newline-to-<br> conversion
  return content.replace(/\n/g, "<br>");
});

</script>

<style scoped lang="scss">
.rpc {
  min-height: 80px;
}
.rpc-err {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: var(--el-color-danger);
  font-size: 13px;
  background: var(--el-color-danger-light-9);
  border-radius: 6px;
}
.rpc-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.rpc-kpi {
  text-align: center;
  padding: 8px 0;
  &__header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  &__title {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
  &__trend-icon {
    font-size: 12px;
  }
  &__value {
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--el-text-color-primary);
    &.is-good { color: var(--el-color-success); }
    &.is-bad { color: var(--el-color-danger); }
  }
  &__desc {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  &__spark {
    height: 40px;
    margin-top: 8px;
  }
}
.rpc-chart {
  height: 260px;
}
.rpc-table-wrap {
  :deep(.el-table) {
    font-size: 12px;
  }
}
.rpc-table__more {
  padding: 8px;
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-radius: 0 0 6px 6px;
}
.rpc-text {
  padding: 8px 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}
.rpc-gauge {
  text-align: center;
  padding: 8px 16px;
  &__val {
    margin-bottom: 12px;
    font-size: 28px;
    font-weight: 700;
  }
}
</style>