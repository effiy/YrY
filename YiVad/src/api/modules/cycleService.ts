/**
 * Cycle/Sprint management API service.
 * Cycles are stored in the YiAi `cycles` collection via the data service RPC.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "@/api/modules/dataService";

const COLLECTION = "cycles";

export type CycleStatus = "upcoming" | "active" | "completed";

export const CYCLE_STATUS_MAP: Record<CycleStatus, string> = {
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed"
};

export interface Cycle {
  key: string;
  project_key: string;
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  status: CycleStatus;
  issue_keys: string[];
  created_at: string;
  updated_at: string;
}

export interface CycleQueryParams {
  pageNum?: number;
  pageSize?: number;
  project_key?: string;
  status?: string;
  search?: string;
}

export function getCycleList(params: CycleQueryParams) {
  const { pageNum = 1, pageSize = 20, project_key, status, search } = params;
  const filter: Record<string, any> = {};
  if (project_key) filter.project_key = project_key;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { goal: { $regex: search, $options: "i" } }
    ];
  }
  return queryDocuments<Cycle>({
    cname: COLLECTION,
    filter,
    pageNum,
    pageSize,
    orderBy: "start_date",
    orderType: "desc"
  });
}

export function getCycle(key: string) {
  return queryDocuments<Cycle>({
    cname: COLLECTION,
    filter: { key },
    pageSize: 1
  });
}

export function createCycle(data: Omit<Cycle, "created_at" | "updated_at">) {
  return createDocument<Cycle>(COLLECTION, {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export function updateCycle(key: string, data: Partial<Cycle>) {
  return updateDocument<Cycle>(COLLECTION, key, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export function deleteCycle(key: string) {
  return deleteDocument(COLLECTION, key);
}