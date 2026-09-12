/** Export API service — wraps YiAi export RPC methods. */
import { callService } from "@/api/modules/dataService";
import type { YiAiEnvelope } from "@/api/interface/yiAi";
import type { ExportTask } from "@/types/analytics";

const EXPORT_SVC = "services.export.export_service";

/** Create a new export task. */
export function createExportTask(params: {
  cname: string;
  filter?: Record<string, any>;
  fields?: string[];
  format: string;
  limit?: number;
}): Promise<YiAiEnvelope<ExportTask>> {
  return callService<ExportTask>(EXPORT_SVC, "create_export_task", params as unknown as Record<string, any>);
}

/** Get export task status. */
export function getExportStatus(task_id: string): Promise<YiAiEnvelope<ExportTask>> {
  return callService<ExportTask>(EXPORT_SVC, "get_export_status", { task_id });
}

/** List export history. */
export function listExportHistory(params?: {
  cname?: string;
  limit?: number;
  offset?: number;
}): Promise<YiAiEnvelope<{ tasks: ExportTask[]; total: number }>> {
  return callService(EXPORT_SVC, "list_export_history", (params ?? {}) as unknown as Record<string, any>);
}