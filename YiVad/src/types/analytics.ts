/** Analytics & reporting types for YiVad. */
import type { ExportFormat } from "@/utils/export/types";

// ── Aggregation ──

export interface MetricDef {
  field: string;
  agg: "count" | "sum" | "avg" | "max" | "min" | "distinct_count";
  alias?: string;
}

export interface FilterCondition {
  field: string;
  op: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "regex";
  value: any;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface AggregationRequest {
  cname: string;
  dimensions: string[];
  metrics: MetricDef[];
  filters?: FilterCondition[];
  dateRange?: DateRange;
  sort?: { field: string; order: "asc" | "desc" };
  limit?: number;
}

export interface AggregationResult {
  columns: string[];
  rows: any[][];
  total: number;
}

// ── KPI ──

export interface KpiMetric {
  key: string;
  label: string;
  value: number;
  unit?: string;
  trend?: number;
  trendDirection?: "up" | "down" | "neutral";
  sparkline?: number[];
  format?: "number" | "percent" | "duration";
}

// ── Efficiency ──

export interface EfficiencyMetrics {
  cycle_time: number | null;
  lead_time_days: number | null;
  throughput: number;
  wip: Record<string, number>;
  total_issues: number;
  done_count: number;
  cfd: { date: string; backlog: number; todo: number; in_progress: number; review: number; done: number }[];
}

export interface CycleTimeStats {
  p50: number;
  p80: number;
  p95: number;
  data: { label: string; value: number }[];
}

export interface ThroughputData {
  period: string;
  count: number;
}

// ── Quality ──

export interface QualityMetrics {
  bug_rate: number;
  bug_count: number;
  rework_rate: number;
  reopened_count: number;
  defect_density: { module: string; bugs: number }[];
  quality_score: number;
}

// ── Charts ──

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PieDataItem {
  name: string;
  value: number;
}

export interface HeatmapDataItem {
  x: string;
  y: string;
  value: number;
}

// ── Report Builder ──

export type ReportComponentType = "kpi_card" | "line_chart" | "bar_chart" | "pie_chart" | "gauge" | "table" | "text";

export interface ReportComponent {
  id: string;
  type: ReportComponentType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data_source: {
    cname: string;
    dimensions?: string[];
    metrics?: MetricDef[];
    filter?: Record<string, any>;
  };
  config?: Record<string, any>;  // chart-specific config
}

export interface ReportDefinition {
  report_id?: string;
  name: string;
  type: "weekly" | "monthly" | "sprint_review" | "quality" | "risk" | "custom";
  description?: string;
  layout: ReportComponent[];
  schedule?: {
    cron: string;
    recipients: string[];
    channel: "email" | "wecom";
  };
  created_at?: string;
  updated_at?: string;
}

// ── Export ──

export interface ExportTask {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  format: ExportFormat;
  cname: string;
  row_count?: number;
  file_name?: string;
  file_content?: string;
  created_at: string;
  progress: number;
}

// ── Dashboard ──

export interface DashboardConfig {
  cards: { key: string; x: number; y: number; w: number; h: number }[];
  dateRange: DateRange;
  selectedMetrics: string[];
}