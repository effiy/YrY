/** Analytics API service — wraps YiAi analytics RPC methods and REST endpoints. */
import http from "@/api/index";
import { callService } from "@/api/modules/dataService";
import type { YiAiEnvelope } from "@/api/interface/yiAi";
import type {
  AggregationRequest,
  AggregationResult,
  ConsoleMetricsResponse,
  DashboardResponse,
  EfficiencyMetrics,
  FileAlertsResponse,
  ModuleDashboardResponse,
  QualityMetrics
} from "@/types/analytics";

const ANALYTICS_QUERY = "services.analytics.query_engine";
const ANALYTICS_AGGR = "services.analytics.aggregator";

// ── Dashboard (REST endpoint — single round-trip for list page) ──

export async function getProjectDashboard(params: {
  project_key?: string;
  dateRange?: { start: string; end: string };
} = {}): Promise<DashboardResponse> {
  const res = await http.post<any>("/analytics/dashboard", params);
  return (res.data?.data ?? res.data) as DashboardResponse;
}

// ── Aggregation (RPC) ──

/** Run a generic aggregation query. */
export function runAggregation(params: AggregationRequest): Promise<YiAiEnvelope<AggregationResult>> {
  return callService<AggregationResult>(ANALYTICS_QUERY, "run_aggregation", params as unknown as Record<string, any>);
}

/** Get available dimensions and metrics for a collection. */
export function getAvailableFields(
  cname: string
): Promise<YiAiEnvelope<{ dimensions: string[]; metrics: { field: string; agg: string; alias?: string }[] }>> {
  return callService(ANALYTICS_QUERY, "get_available_fields", { cname });
}

/** Get efficiency metrics (RPC — returns YiAiEnvelope for existing dashboard consumers). */
export function getEfficiencyMetrics(params: {
  project_key?: string;
  dateRange?: { start: string; end: string };
}): Promise<YiAiEnvelope<EfficiencyMetrics>> {
  return callService<EfficiencyMetrics>(ANALYTICS_AGGR, "get_efficiency_metrics", params as unknown as Record<string, any>);
}

/** Get quality metrics (RPC — returns YiAiEnvelope for existing dashboard consumers). */
export function getQualityMetrics(params: {
  project_key?: string;
  dateRange?: { start: string; end: string };
}): Promise<YiAiEnvelope<QualityMetrics>> {
  return callService<QualityMetrics>(ANALYTICS_AGGR, "get_quality_metrics", params as unknown as Record<string, any>);
}

/** Get quality metrics for the bug page — REST endpoint, unwraps the envelope. */
export async function getBugQualityMetrics(params: {
  project_key?: string;
  dateRange?: { start: string; end: string };
} = {}): Promise<QualityMetrics> {
  const res = await http.post<any>("/analytics/quality", params);
  return (res.data?.data ?? res.data) as QualityMetrics;
}

// ── Console (REST endpoint — single round-trip for analytics console) ──

/** Get combined efficiency + quality metrics in one request for the analytics console. */
export async function getConsoleMetrics(params: {
  project_key?: string;
  dateRange?: { start: string; end: string };
} = {}): Promise<ConsoleMetricsResponse> {
  const res = await http.post<any>("/analytics/console", params);
  return (res.data?.data ?? res.data) as ConsoleMetricsResponse;
}

// ── Module Dashboard (REST endpoint) ──

/** Get module dashboard: weighted progress, burndown, velocity, quality signals. */
export async function getModuleDashboard(params: {
  project_key?: string;
  date?: string;
} = {}): Promise<ModuleDashboardResponse> {
  const res = await http.post<any>("/analytics/module-dashboard", params);
  return (res.data?.data ?? res.data) as ModuleDashboardResponse;
}

// ── File Alerts (Report Warning Analysis) ──

/** Get file health alerts: stale, missing metadata, orphan, unmaintained files. */
export async function getFileAlerts(params: {
  project_key?: string;
} = {}): Promise<FileAlertsResponse> {
  const res = await http.post<any>("/analytics/file-alerts", params);
  return (res.data?.data ?? res.data) as FileAlertsResponse;
}
