/**
 * Report data composable — fetches dashboard metrics once and exposes
 * individual data slices for report components.
 *
 * Cache strategy: single `getProjectDashboard()` call per (dateRange, projectKey)
 * pair. All components on the canvas read from the same response, avoiding N+1
 * API calls. Optional parallel fetch of file alerts and module dashboard.
 */
import { ref, watch, onUnmounted, type Ref } from "vue";
import {
  getProjectDashboard,
  getFileAlerts,
  getModuleDashboard,
  runAggregation
} from "@/api/modules/analyticsService";
import { queryDocuments } from "@/api/modules/dataService";
import type {
  DashboardResponse,
  EfficiencyMetrics,
  QualityMetrics,
  AggregationRequest,
  AggregationResult,
  DateRange,
  TrendDataPoint,
  ThroughputData,
  FileAlertsResponse,
  ModuleDashboardResponse
} from "@/types/analytics";

/** KPI metric descriptor — maps a component data_source to a dashboard field. */
export interface KpiBinding {
  section: "basic" | "efficiency" | "quality" | "file_alerts" | "module_dashboard";
  field: string;
  format?: "number" | "percent" | "duration";
  label?: string;
  /** Whether lower values are better (e.g. bug_rate, cycle_time). */
  lowerIsBetter?: boolean;
}

/** Chart binding — maps a component to pre-computed chart data. */
export interface ChartBinding {
  section: "efficiency" | "quality" | "module_dashboard";
  chartType:
    | "cycle_time_trend"
    | "lead_time_trend"
    | "throughput"
    | "bug_trend"
    | "cfd"
    | "inflow_outflow"
    | "mttr_trend"
    | "rework_trend"
    | "severity_distribution"
    | "status_breakdown"
    | "bug_age_distribution"
    | "wip_breakdown"
    | "defect_density"
    | "module_quality"
    | "burndown"
    | "velocity"
    | "bottlenecks"
    | "control_chart";
}

/** Pre-computed chart data ready for rendering. */
export interface ChartData {
  type: string;
  labels: string[];
  series: { name: string; data: number[] }[];
  raw?: any;
}

// ── KPI metadata registry — maps field names to format + direction ──

interface KpiMeta {
  format: "number" | "percent" | "duration";
  lowerIsBetter: boolean;
}

const KPI_META: Record<string, KpiMeta> = {
  // basic
  project_count: { format: "number", lowerIsBetter: false },
  total_issues: { format: "number", lowerIsBetter: false },
  total_done: { format: "number", lowerIsBetter: false },
  total_open: { format: "number", lowerIsBetter: true },
  total_bugs: { format: "number", lowerIsBetter: true },
  completion_pct: { format: "percent", lowerIsBetter: false },
  // cycle time
  avg_cycle_time: { format: "duration", lowerIsBetter: true },
  cycle_time_p50: { format: "duration", lowerIsBetter: true },
  cycle_time_p80: { format: "duration", lowerIsBetter: true },
  cycle_time_p95: { format: "duration", lowerIsBetter: true },
  cycle_time_std: { format: "number", lowerIsBetter: true },
  cycle_time_cv: { format: "percent", lowerIsBetter: true },
  // lead time
  avg_lead_time: { format: "duration", lowerIsBetter: true },
  lead_time_p50: { format: "duration", lowerIsBetter: true },
  lead_time_p80: { format: "duration", lowerIsBetter: true },
  lead_time_p95: { format: "duration", lowerIsBetter: true },
  lead_time_std: { format: "number", lowerIsBetter: true },
  lead_time_cv: { format: "percent", lowerIsBetter: true },
  // throughput
  throughput: { format: "number", lowerIsBetter: false },
  throughput_per_day: { format: "number", lowerIsBetter: false },
  throughput_per_week: { format: "number", lowerIsBetter: false },
  throughput_std: { format: "number", lowerIsBetter: true },
  throughput_cv: { format: "percent", lowerIsBetter: true },
  velocity_per_week: { format: "number", lowerIsBetter: false },
  arrival_rate_per_week: { format: "number", lowerIsBetter: false },
  // WIP
  current_wip: { format: "number", lowerIsBetter: true },
  done_count: { format: "number", lowerIsBetter: false },
  wip_age_p50: { format: "duration", lowerIsBetter: true },
  wip_age_p85: { format: "duration", lowerIsBetter: true },
  wip_age_p95: { format: "duration", lowerIsBetter: true },
  // flow
  flow_efficiency: { format: "percent", lowerIsBetter: false },
  predictability: { format: "percent", lowerIsBetter: false },
  // quality
  bug_rate: { format: "percent", lowerIsBetter: true },
  bug_count: { format: "number", lowerIsBetter: true },
  rework_rate: { format: "percent", lowerIsBetter: true },
  reopened_count: { format: "number", lowerIsBetter: true },
  issue_count: { format: "number", lowerIsBetter: false },
  quality_score: { format: "percent", lowerIsBetter: false },
  mttr_hours: { format: "duration", lowerIsBetter: true },
  resolved_count: { format: "number", lowerIsBetter: false },
  sla_compliance: { format: "percent", lowerIsBetter: false },
  resolution_velocity: { format: "number", lowerIsBetter: false },
  critical_open: { format: "number", lowerIsBetter: true },
  unassigned_open: { format: "number", lowerIsBetter: true },
  stale_open: { format: "number", lowerIsBetter: true },
  freshness_seconds: { format: "duration", lowerIsBetter: true },
  avg_resolution_hours: { format: "duration", lowerIsBetter: true },
};

function getKpiMeta(field: string): KpiMeta {
  return KPI_META[field] || { format: "number", lowerIsBetter: false };
}

export { getKpiMeta };

// ── Main composable ──────────────────────────────────────────────────────────

export function useReportData(
  dateRange: Ref<DateRange>,
  projectKey: Ref<string>
) {
  const dashboard = ref<DashboardResponse | null>(null);
  const fileAlerts = ref<FileAlertsResponse | null>(null);
  const moduleDashboard = ref<ModuleDashboardResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<Date | null>(null);
  /** Per-data-source age tracking */
  const dataAge: Record<string, Date | null> = {
    dashboard: null,
    fileAlerts: null,
    moduleDashboard: null,
  };

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let pollIntervalSec = 60;

  /** Core fetch — dashboard + optional file alerts + module dashboard in parallel. */
  async function fetch(forceRefresh = false) {
    loading.value = true;
    error.value = null;
    try {
      const params: any = {};
      if (projectKey.value) params.project_key = projectKey.value;
      if (dateRange.value?.start && dateRange.value?.end) {
        params.dateRange = { start: dateRange.value.start, end: dateRange.value.end };
      }
      if (forceRefresh) params._nocache = Date.now();

      const promises: Promise<any>[] = [getProjectDashboard(params)];
      // Fetch file alerts only when no specific project or for file-health templates
      promises.push(
        getFileAlerts(projectKey.value ? { project_key: projectKey.value } : {}).catch(() => null)
      );
      // Fetch module dashboard only when a project is selected
      if (projectKey.value) {
        promises.push(
          getModuleDashboard({ project_key: projectKey.value }).catch(() => null)
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      const [dash, alerts, modDash] = await Promise.all(promises);
      dashboard.value = dash;
      fileAlerts.value = alerts;
      if (modDash) moduleDashboard.value = modDash;
      lastUpdated.value = new Date();
      dataAge.dashboard = new Date();
      if (alerts) dataAge.fileAlerts = new Date();
      if (modDash) dataAge.moduleDashboard = new Date();
    } catch (e: any) {
      error.value = e?.message || "Failed to load dashboard data";
    } finally {
      loading.value = false;
    }
  }

  function startPolling(intervalSec = 60) {
    stopPolling();
    pollIntervalSec = intervalSec;
    pollTimer = setInterval(() => fetch(true), intervalSec * 1000);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  /** Change polling interval without stopping. */
  function setPollInterval(sec: number) {
    if (pollTimer) startPolling(sec);
    else pollIntervalSec = sec;
  }

  watch(
    [dateRange, projectKey],
    () => { fetch(true); },
    { immediate: true }
  );

  onUnmounted(() => stopPolling());

  // ── KPI helpers ──

  /** Extract a KPI value from the dashboard response by binding. */
  function getKpiValue(binding: KpiBinding): number | null {
    const field = binding.field;
    const section = binding.section;

    try {
      if (section === "file_alerts") {
        return fileAlerts.value ? fileAlerts.value.summary.total : null;
      }
      if (section === "module_dashboard") {
        const md = moduleDashboard.value;
        if (!md) return null;
        return field.split(".").reduce((obj: any, key) => obj?.[key], md) ?? null;
      }

      const d = dashboard.value;
      if (!d) return null;
      const sec = d[section] as Record<string, any>;
      if (!sec) return null;
      const val = field.split(".").reduce((obj: any, key) => obj?.[key], sec);
      return typeof val === "number" ? val : null;
    } catch {
      return null;
    }
  }

  /** Format a KPI value according to its detected format. */
  function formatKpiValue(value: number | null, field: string): string {
    if (value === null || value === undefined) return "--";
    const meta = getKpiMeta(field);
    switch (meta.format) {
      case "percent":
        return `${Number(value).toFixed(1)}%`;
      case "duration":
        return Number(value) >= 24
          ? `${(Number(value) / 24).toFixed(1)}d`
          : `${Number(value).toFixed(1)}h`;
      default:
        return Number(value) >= 1000
          ? Number(value).toLocaleString()
          : Number.isInteger(Number(value))
            ? String(value)
            : Number(value).toFixed(1);
    }
  }

  /** Get trend direction and delta for a field. */
  function getKpiTrend(binding: KpiBinding): {
    direction: "up" | "down" | "neutral";
    delta: number;
  } | null {
    const { section, field } = binding;
    const d = dashboard.value;

    if (section === "file_alerts" || section === "module_dashboard") return null;

    if (!d) return null;

    // Quality: compare to prev_period
    if (section === "quality" && d.quality?.prev_period) {
      const prev = d.quality.prev_period as Record<string, any>;
      const curr = d.quality as Record<string, any>;
      const cv = Number(curr[field]) || 0;
      const pv = Number(prev[field]) || 0;
      if (pv === 0) return null;
      const delta = ((cv - pv) / Math.abs(pv)) * 100;
      return {
        direction: delta > 0 ? "up" : delta < 0 ? "down" : "neutral",
        delta: Math.round(Math.abs(delta) * 10) / 10,
      };
    }

    // Efficiency: use trends object
    if (section === "efficiency" && d.efficiency?.trends) {
      const trends = d.efficiency.trends as Record<string, number | null>;
      // Map field to trend key
      const trendKey = field
        .replace("avg_", "")
        .replace("_p50", "")
        .replace("_p80", "")
        .replace("_p95", "");
      const pct = trends[`${trendKey}_pct`] ?? trends[trendKey];
      if (pct !== null && pct !== undefined) {
        return {
          direction: pct > 0 ? "up" : pct < 0 ? "down" : "neutral",
          delta: Math.abs(Math.round(pct * 10) / 10),
        };
      }
    }

    // Quality: also try trend_direction for enhanced fields
    if (section === "quality" && d.quality?.trend_direction) {
      const dir = d.quality.trend_direction;
      const delta = d.quality.trend_delta ?? 0;
      if (dir) {
        return {
          direction: dir as "up" | "down" | "neutral",
          delta: Math.abs(Math.round(delta * 10) / 10),
        };
      }
    }

    return null;
  }

  // ── Chart helpers ──

  /** Extract chart-ready data from the dashboard for a chart binding. */
  function getChartData(binding: ChartBinding): ChartData | null {
    if (binding.section === "module_dashboard") {
      return getModuleChartData(binding);
    }

    const d = dashboard.value;
    if (!d) return null;
    const section = d[binding.section] as Record<string, any>;
    if (!section) return null;

    switch (binding.chartType) {
      case "cycle_time_trend":
        return trendToChart(section.cycle_time_trend, ["p50", "p80", "p95"], "Cycle Time (days)");
      case "lead_time_trend":
        return trendToChart(section.lead_time_trend, ["p50", "p80", "p95"], "Lead Time (days)");
      case "throughput":
        return throughputToChart(section.weekly_throughput);
      case "bug_trend":
        return trendArrayToChart(section.bug_trend, "Bug Count");
      case "cfd":
        return cfdToChart(section.cfd);
      case "inflow_outflow":
        return inflowOutflowToChart(section.inflow_outflow);
      case "mttr_trend":
        return trendArrayToChart(section.mttr_trend, "MTTR (hours)");
      case "rework_trend":
        return trendArrayToChart(section.rework_trend, "Rework Rate");
      case "severity_distribution":
        return distToChart(section.severity_distribution, "Severity");
      case "status_breakdown":
        return distToChart(section.status_breakdown, "Status");
      case "bug_age_distribution":
        return distToChart(section.bug_age_distribution, "Bug Age");
      case "wip_breakdown":
        return distToChart(section.wip_breakdown, "WIP");
      case "defect_density":
        return defectDensityToChart(section.defect_density);
      case "module_quality":
        return moduleQualityToChart(section.module_quality);
      case "bottlenecks":
        return bottlenecksToChart(section.bottlenecks);
      case "control_chart":
        return null; // handled specially in ReportPreview
      default:
        return null;
    }
  }

  function getModuleChartData(binding: ChartBinding): ChartData | null {
    const md = moduleDashboard.value;
    if (!md) return null;
    switch (binding.chartType) {
      case "burndown":
        if (!md.burndown?.length) return null;
        return {
          type: "line",
          labels: md.burndown.map((d: any) => d.date),
          series: [
            { name: "Remaining", data: md.burndown.map((d: any) => d.remaining) },
            { name: "Ideal", data: md.burndown.map((d: any) => d.ideal) },
          ],
        };
      case "velocity":
        if (!md.velocity?.length) return null;
        return {
          type: "bar",
          labels: md.velocity.map((d: any) => d.week),
          series: [
            { name: "Points", data: md.velocity.map((d: any) => d.points) },
            { name: "Count", data: md.velocity.map((d: any) => d.count) },
          ],
        };
      default:
        return null;
    }
  }

  /** Get sparkline data (small array of numbers for mini KPI trend). */
  function getSparkline(binding: ChartBinding): number[] {
    const chart = getChartData(binding);
    if (!chart || !chart.series.length) return [];
    return chart.series[0].data.slice(-12);
  }

  // ── Table helpers ──

  const tableData = ref<any[]>([]);
  const tableLoading = ref(false);
  const tableTotal = ref(0);
  const tableError = ref<string | null>(null);

  async function fetchTableData(
    cname: string,
    filter: Record<string, any> = {},
    pageNum = 1,
    pageSize = 10,
    orderBy?: string,
    orderType?: "asc" | "desc"
  ) {
    tableLoading.value = true;
    tableError.value = null;
    try {
      // Merge project filter
      const mergedFilter = { ...filter };
      if (projectKey.value && !mergedFilter.project_key) {
        mergedFilter.project_key = projectKey.value;
      }
      const res = await queryDocuments({
        cname,
        filter: mergedFilter,
        pageNum,
        pageSize,
        ...(orderBy ? { orderBy, orderType } : {}),
      });
      if (res.code === 0 && res.data) {
        tableData.value = (res.data as any).list || [];
        tableTotal.value = (res.data as any).total || 0;
      } else {
        tableError.value = res.message || "Query failed";
      }
    } catch (e: any) {
      tableError.value = e?.message || "Failed to query documents";
    } finally {
      tableLoading.value = false;
    }
  }

  // ── Aggregation helper ──

  const aggResult = ref<AggregationResult | null>(null);
  const aggLoading = ref(false);
  const aggError = ref<string | null>(null);

  async function fetchAggregation(config: AggregationRequest) {
    aggLoading.value = true;
    aggError.value = null;
    try {
      const res = await runAggregation(config);
      if (res.code === 0 && res.data) {
        aggResult.value = res.data;
      } else {
        aggError.value = res.message || "Aggregation failed";
      }
    } catch (e: any) {
      aggError.value = e?.message || "Failed to run aggregation";
    } finally {
      aggLoading.value = false;
    }
  }

  // ── File alert table helper ──

  function getFileAlertRows(): any[] {
    if (!fileAlerts.value?.alerts) return [];
    return fileAlerts.value.alerts.map((a) => ({
      severity: a.severity,
      domain: a.domain,
      title: a.title,
      description: a.description,
      count: a.count,
      suggestion: a.suggestion || "",
    }));
  }

  /** Generate dynamic text content from file alerts for text blocks. */
  function getFileHealthSummary(): string {
    const fa = fileAlerts.value;
    if (!fa?.alerts?.length) return "No file health issues detected.";
    const s = fa.summary;
    const lines = [
      `## File Health Summary\n`,
      `| Severity | Count |`,
      `|----------|-------|`,
      `| Critical | ${s.critical} |`,
      `| Warning  | ${s.warning} |`,
      `| Info     | ${s.info} |`,
      `| **Total** | **${s.total}** |`,
      "",
    ];
    for (const a of fa.alerts) {
      const icon = a.severity === "critical" ? "🔴" : a.severity === "warning" ? "🟡" : "🔵";
      lines.push(`- ${icon} **${a.title}** (${a.count} files): ${a.description}`);
      if (a.suggestion) lines.push(`  → ${a.suggestion}`);
    }
    lines.push(`\nGenerated: ${fa.generated_at}`);
    return lines.join("\n");
  }

  return {
    // Dashboard
    dashboard,
    fileAlerts,
    moduleDashboard,
    loading,
    error,
    lastUpdated,
    dataAge,
    fetch,
    startPolling,
    stopPolling,
    setPollInterval,
    pollIntervalSec,
    // KPI
    getKpiValue,
    formatKpiValue,
    getKpiTrend,
    getKpiMeta,
    // Charts
    getChartData,
    getSparkline,
    // Table
    tableData,
    tableLoading,
    tableTotal,
    tableError,
    fetchTableData,
    // Aggregation
    aggResult,
    aggLoading,
    aggError,
    fetchAggregation,
    // File alerts
    getFileAlertRows,
    getFileHealthSummary,
  };
}

// ── Pure chart data transformers ─────────────────────────────────────────────

function trendToChart(
  data: { label: string }[] | undefined,
  fields: string[],
  _label: string
): ChartData | null {
  if (!data?.length) return null;
  return {
    type: "line",
    labels: data.map((d) => d.label),
    series: fields.map((f) => ({
      name: f,
      data: data.map((d) => (d as any)[f] ?? 0),
    })),
  };
}

function throughputToChart(data: ThroughputData[] | undefined): ChartData | null {
  if (!data?.length) return null;
  return {
    type: "bar",
    labels: data.map((d) => d.period),
    series: [{ name: "Throughput", data: data.map((d) => d.count) }],
  };
}

function trendArrayToChart(
  data: TrendDataPoint[] | undefined,
  name: string
): ChartData | null {
  if (!data?.length) return null;
  return {
    type: "line",
    labels: data.map((d) => d.date),
    series: [{ name, data: data.map((d) => d.value) }],
  };
}

function cfdToChart(data: any[] | undefined): ChartData | null {
  if (!data?.length) return null;
  const keys = Object.keys(data[0]).filter((k) => k !== "date");
  return {
    type: "area",
    labels: data.map((d) => d.date),
    series: keys.map((k) => ({
      name: k,
      data: data.map((d) => d[k] ?? 0),
    })),
  };
}

function inflowOutflowToChart(data: any): ChartData | null {
  if (!data?.inflow?.length && !data?.outflow?.length) return null;
  return {
    type: "line",
    labels: (data.inflow || data.outflow || []).map((d: any) => d.date),
    series: [
      { name: "Inflow", data: (data.inflow || []).map((d: any) => d.value ?? 0) },
      { name: "Outflow", data: (data.outflow || []).map((d: any) => d.value ?? 0) },
    ],
  };
}

function distToChart(
  data: Record<string, number> | undefined,
  name: string
): ChartData | null {
  if (!data) return null;
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (!entries.length) return null;
  return {
    type: "pie",
    labels: entries.map(([k]) => k),
    series: [{ name, data: entries.map(([, v]) => v) }],
  };
}

function defectDensityToChart(
  data: { module: string; bugs: number }[] | undefined
): ChartData | null {
  if (!data?.length) return null;
  return {
    type: "bar",
    labels: data.map((d) => d.module),
    series: [{ name: "Bugs", data: data.map((d) => d.bugs) }],
  };
}

function moduleQualityToChart(
  data: { module: string; quality_score: number; bugs: number }[] | undefined
): ChartData | null {
  if (!data?.length) return null;
  return {
    type: "bar",
    labels: data.map((d) => d.module),
    series: [
      { name: "Quality Score", data: data.map((d) => d.quality_score) },
      { name: "Bugs", data: data.map((d) => d.bugs) },
    ],
  };
}

function bottlenecksToChart(
  data: { status: string; severity: number; is_bottleneck: boolean }[] | undefined
): ChartData | null {
  if (!data?.length) return null;
  return {
    type: "bar",
    labels: data.map((d) => d.status),
    series: [{ name: "Severity", data: data.map((d) => d.severity) }],
  };
}