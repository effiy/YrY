/**
 * Timing task management API service.
 * Tasks are stored in the YiAi `scheduled_tasks` collection via the data service RPC.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument, callService } from "@/api/modules/dataService";

const COLLECTION = "scheduled_tasks";

export interface ScheduledTask {
  key: string;
  name: string;
  cron_expression: string;
  module_name: string;
  method_name: string;
  enabled: boolean;
  description: string;
  last_run: string | null;
  next_run: string | null;
  created_at: string;
  updated_at: string;
}

export function getTaskList(params?: {
  pageNum?: number;
  pageSize?: number;
  search?: string;
  enabled?: boolean;
}) {
  const { pageNum = 1, pageSize = 100, search, enabled } = params || {};
  const filter: Record<string, any> = {};
  if (enabled !== undefined) filter.enabled = enabled;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }
  return queryDocuments<ScheduledTask>({
    cname: COLLECTION,
    filter: Object.keys(filter).length ? filter : undefined,
    pageNum,
    pageSize,
    orderBy: "created_at",
    orderType: "desc"
  });
}

export function createTask(data: Omit<ScheduledTask, "created_at" | "updated_at" | "last_run" | "next_run">) {
  return createDocument(COLLECTION, {
    ...data,
    last_run: null,
    next_run: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export function updateTask(key: string, data: Partial<ScheduledTask>) {
  return updateDocument<ScheduledTask>(COLLECTION, key, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export function deleteTask(key: string) {
  return deleteDocument(COLLECTION, key);
}

/** Manually trigger a task execution. */
export function triggerTask(key: string) {
  return callService("services.system.task_service", "trigger_task", { key });
}