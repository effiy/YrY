/** Analytics API service — wraps YiAi analytics RPC methods. */
import { callService } from "@/api/modules/dataService";
import type { YiAiEnvelope } from "@/api/interface/yiAi";
import type {
  AggregationRequest,
  AggregationResult,
  EfficiencyMetrics,
  QualityMetrics,
} from "@/types/analytics";

const ANALYTICS_QUERY = "services.analytics.query_engine";
const ANALYTICS_AGGR = "services.analytics.aggregator";

/** Run a generic aggregation query. */
export function runAggregation(params: AggregationRequest): Promise<YiAiEnvelope<AggregationResult>> {
  return callService<AggregationResult>(ANALYTICS_QUERY, "run_aggregation", params as unknown as Record<string, any>);
}

/** Get available dimensions and metrics for a collection. */
export function getAvailableFields(cname: string): Promise<YiAiEnvelope<{ dimensions: string[]; metrics: { field: string; agg: string; alias?: string }[] }>> {
  return callService(ANALYTICS_QUERY, "get_available_fields", { cname });
}

/** Get pre-computed efficiency metrics. */
export function getEfficiencyMetrics(params: { project_key?: string; dateRange?: { start: string; end: string } }): Promise<YiAiEnvelope<EfficiencyMetrics>> {
  return callService<EfficiencyMetrics>(ANALYTICS_AGGR, "get_efficiency_metrics", params as unknown as Record<string, any>);
}

/** Get pre-computed quality metrics. */
export function getQualityMetrics(params: { project_key?: string; dateRange?: { start: string; end: string } }): Promise<YiAiEnvelope<QualityMetrics>> {
  return callService<QualityMetrics>(ANALYTICS_AGGR, "get_quality_metrics", params as unknown as Record<string, any>);
}