/** Report API service — wraps YiAi report RPC methods. */
import { callService } from "@/api/modules/dataService";
import type { YiAiEnvelope } from "@/api/interface/yiAi";
import type { ReportDefinition } from "@/types/analytics";

const REPORT_SVC = "services.report.report_service";

/** List saved reports. */
export function listReports(params?: {
  type?: string;
  limit?: number;
  offset?: number;
}): Promise<YiAiEnvelope<{ reports: ReportDefinition[]; total: number }>> {
  return callService(REPORT_SVC, "list_reports", (params ?? {}) as unknown as Record<string, any>);
}

/** Save or update a report definition. */
export function saveReport(report: ReportDefinition): Promise<YiAiEnvelope<{ report_id: string }>> {
  return callService(REPORT_SVC, "save_report", report as unknown as Record<string, any>);
}

/** Generate a report from a saved definition. */
export function generateReport(params: {
  report_id?: string;
  components?: any[];
  dateRange?: { start: string; end: string };
  format?: string;
}): Promise<YiAiEnvelope<any>> {
  return callService(REPORT_SVC, "generate_report", params as unknown as Record<string, any>);
}

/** Delete a report definition. */
export function deleteReport(report_id: string): Promise<YiAiEnvelope<{ report_id: string }>> {
  return callService(REPORT_SVC, "delete_report", { report_id });
}