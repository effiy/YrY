/**
 * Modules/Epics API service.
 * Modules group related issues into larger work items.
 * Stored in the YiAi `modules` collection.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "@/api/modules/dataService";

const COLLECTION = "modules";

export type ModuleStatus = "planned" | "in_progress" | "completed" | "cancelled";

export const MODULE_STATUS_MAP: Record<ModuleStatus, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled"
};

export interface Module {
  key: string;
  project_key: string;
  name: string;
  description?: string;
  status: ModuleStatus;
  lead?: string;
  issue_keys: string[];
  start_date?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export function getModuleList(params: { pageNum?: number; pageSize?: number; project_key?: string; status?: string }) {
  const { pageNum = 1, pageSize = 50, project_key, status } = params;
  const filter: Record<string, any> = {};
  if (project_key) filter.project_key = project_key;
  if (status) filter.status = status;
  return queryDocuments<Module>({
    cname: COLLECTION, filter, pageNum, pageSize,
    orderBy: "updated_at", orderType: "desc"
  });
}

export function getModule(key: string) {
  return queryDocuments<Module>({ cname: COLLECTION, filter: { key }, pageSize: 1 });
}

export function createModule(data: Omit<Module, "created_at" | "updated_at">) {
  return createDocument<Module>(COLLECTION, {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export function updateModule(key: string, data: Partial<Module>) {
  return updateDocument<Module>(COLLECTION, key, { ...data, updated_at: new Date().toISOString() });
}

export function deleteModule(key: string) {
  return deleteDocument(COLLECTION, key);
}