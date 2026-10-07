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

export interface CfdDataPoint {
  date: string;
  backlog: number;
  todo: number;
  in_progress: number;
  review: number;
  done: number;
}

export interface BottleneckItem {
  status: string;
  wip_count: number;
  avg_days: number;
  max_days: number;
  severity: number;
  is_bottleneck: boolean;
}

export interface ControlChartPoint {
  issue_key: string;
  date: string;
  cycle_time: number;
  lead_time: number;
  moving_avg_5: number | null;
}

export interface EfficiencyTrends {
  cycle_time_pct: number | null;
  throughput_pct: number | null;
  wip_pct: number | null;
}

export interface EfficiencyMetrics {
  // Cycle time
  avg_cycle_time: number;
  cycle_time_p50: number;
  cycle_time_p80: number;
  cycle_time_p95: number;
  cycle_time_std: number;
  cycle_time_cv: number;
  cycle_time_ucl: number;
  cycle_time_lcl: number;
  cycle_time_histogram: Record<string, number>;
  cycle_time_source: "audit" | "estimated";
  // Lead time
  avg_lead_time: number;
  lead_time_p50: number;
  lead_time_p80: number;
  lead_time_p95: number;
  lead_time_std: number;
  lead_time_cv: number;
  lead_time_histogram: Record<string, number>;
  // Throughput
  throughput: number;
  throughput_per_day: number;
  throughput_per_week: number;
  throughput_std: number;
  throughput_cv: number;
  velocity_per_week: number;
  arrival_rate_per_week: number;
  // WIP
  current_wip: number;
  total_issues: number;
  done_count: number;
  wip_breakdown: Record<string, number>;
  wip_aging: Record<string, number>;
  wip_age_p50: number;
  wip_age_p85: number;
  wip_age_p95: number;
  // Flow
  flow_efficiency: number;
  flow_efficiency_confidence: "high" | "low" | "estimated";
  predictability: number;
  // Charts
  cfd: CfdDataPoint[];
  cfd_confidence: "exact" | "cohort" | "estimated";
  weekly_throughput: ThroughputData[];
  cycle_time_trend: { label: string; p50: number; p80: number; p95: number }[];
  lead_time_trend: { label: string; p50: number; p80: number; p95: number }[];
  control_chart: ControlChartPoint[];
  bottlenecks: BottleneckItem[];
  // Trends
  trends: EfficiencyTrends;
}

export interface ThroughputData {
  period: string;
  count: number;
  rolling_avg_4w?: number;
}

// ── Quality ──

export interface SeverityDistribution {
  critical: number;
  major: number;
  minor: number;
  trivial: number;
  [key: string]: number;
}

export interface BugStatusBreakdown {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  [key: string]: number;
}

export interface BugAgeDistribution {
  lt_1d: number;
  "1_3d": number;
  "3_7d": number;
  "7_30d": number;
  gt_30d: number;
  [key: string]: number;
}

export interface PeriodComparison {
  bug_count: number;
  bug_rate: number;
  rework_rate: number;
  reopened_count: number;
  sla_compliance?: number;
}

export interface InflowOutflowData {
  inflow: TrendDataPoint[];
  outflow: TrendDataPoint[];
}

export interface QualityScoreBreakdown {
  bug_rate_score: number;
  rework_score: number;
  severity_score: number;
  mttr_score: number;
  sla_score: number;
}

export interface ModuleQuality {
  module: string;
  bugs: number;
  critical: number;
  issues: number;
  bug_rate: number;
  quality_score: number;
}

export interface RecentActivity {
  created_24h: number;
  resolved_24h: number;
}

export interface QualityMetrics {
  bug_rate: number;
  bug_count: number;
  rework_rate: number;
  reopened_count: number;
  issue_count: number;
  defect_density: { module: string; bugs: number }[];
  quality_score: number;
  quality_score_breakdown: QualityScoreBreakdown;
  severity_distribution: SeverityDistribution;
  status_breakdown: BugStatusBreakdown;
  bug_age_distribution: BugAgeDistribution;
  avg_resolution_hours: number | null;
  resolved_count: number;
  bug_trend: TrendDataPoint[];
  rework_trend: TrendDataPoint[];
  inflow_outflow: InflowOutflowData;
  mttr_hours: number;
  mttr_trend: TrendDataPoint[];
  sla_compliance: number;
  prev_period: PeriodComparison;
  period: { start: string; end: string };
  generated_at: string;
  // Enhanced fields
  freshness_seconds?: number | null;
  trend_direction?: "improving" | "declining" | "stable";
  trend_delta?: number;
  critical_open?: number;
  module_quality?: ModuleQuality[];
  recent_activity?: RecentActivity;
  resolution_velocity?: number;
  mttr_by_severity?: Record<string, number>;
  reopen_by_module?: { module: string; count: number }[];
  // Sidebar attention & data-quality
  unassigned_open?: number;
  stale_open?: number;
  completeness?: {
    total: number;
    description_pct: number;
    assignee_pct: number;
    environment_pct: number;
    fixedVersion_pct: number;
  };
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
  config?: Record<string, any>; // chart-specific config
}

export interface ReportDefinition {
  report_id?: string;
  name: string;
  type:
	    | "weekly"
	    | "monthly"
	    | "sprint_review"
	    | "quality"
	    | "risk"
	    | "custom"
	    | "module_health"
	    | "executive_summary"
	    | "dora_devops"
	    | "flow_metrics"
	    | "risk_compliance"
	    | "team_performance";
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

// ── Module Dashboard ──

export interface ModuleDashboardModule {
  key: string;
  name: string;
  status: string;
  lead?: string;
  project_key: string;
  issue_keys?: string[];
  issue_count: number;
  done_count: number;
  total_points: number;
  done_points: number;
  weighted_progress: number;
  simple_progress: number;
  description_len: number;
  has_description: boolean;
  has_lead: boolean;
  has_dates: boolean;
  quality_score: number;
  scope_creep_pct: number;
  blocked_count: number;
  unassigned_count: number;
  overdue: boolean;
  stale_days: number;
  created_at: string;
  updated_at: string;
}

export interface ModuleDashboardSummary {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  planned: number;
  overall_weighted_progress: number;
  overall_simple_progress: number;
  total_issues: number;
  total_done_issues: number;
  total_points: number;
  done_points: number;
  overdue_count: number;
  empty_count: number;
  stalled_count: number;
  blocked_total: number;
  unassigned_total: number;
  avg_quality_score: number;
  scope_creep_modules: string[];
}

export interface BurndownPoint {
  date: string;
  remaining: number;
  ideal: number;
}

export interface VelocityPoint {
  week: string;
  points: number;
  count: number;
}

export interface ModuleDashboardResponse {
  modules: ModuleDashboardModule[];
  summary: ModuleDashboardSummary;
  burndown: BurndownPoint[];
  velocity: VelocityPoint[];
  period: { start: string; end: string };
  generated_at: string;
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

export interface ProjectBasicStats {
  project_key: string;
  issues: number;
  done: number;
  open: number;
  overdue: number;
  unassigned: number;
  bugs: number;
  modules: number;
}

export interface DashboardBasicStats {
  project_count: number;
  total_issues: number;
  total_done: number;
  total_open: number;
  total_bugs: number;
  completion_pct: number;
  by_project: ProjectBasicStats[];
}

export interface DashboardResponse {
  basic: DashboardBasicStats;
  efficiency: EfficiencyMetrics;
  quality: QualityMetrics;
  period: { start: string; end: string };
  generated_at: string;
}

export interface DashboardConfig {
  cards: { key: string; x: number; y: number; w: number; h: number }[];
  dateRange: DateRange;
  selectedMetrics: string[];
}

// ── Console ──

export interface ConsoleMetricsResponse {
  efficiency: EfficiencyMetrics;
  quality: QualityMetrics;
  generated_at: string;
}

// ── File Alerts (Report Warning Analysis) ──

export interface FileAlertItem {
  severity: "critical" | "warning" | "info";
  domain: "knowledge" | "data" | "code";
  title: string;
  description: string;
  count: number;
  file_paths?: string[];
  module_names?: string[];
  suggestion?: string;
  file?: string;
}

export interface FileAlertSummary {
  critical: number;
  warning: number;
  info: number;
  total: number;
}

export interface FileAlertsResponse {
  alerts: FileAlertItem[];
  summary: FileAlertSummary;
  generated_at: string;
}
