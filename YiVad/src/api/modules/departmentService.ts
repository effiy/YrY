/**
 * Department management API service.
 * Departments are stored in the YiAi `departments` collection via the data service RPC.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "@/api/modules/dataService";
import type { YiAiEnvelope, QueryDocumentsData } from "@/api/interface/yiAi";

const COLLECTION = "departments";

export interface Department {
  key: string;
  name: string;
  parent_key: string;
  description: string;
  leader: string;
  member_count: number;
  status: "active" | "inactive";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function getDepartmentList(params?: {
  pageNum?: number;
  pageSize?: number;
  parent_key?: string;
  search?: string;
  status?: string;
}) {
  const { pageNum = 1, pageSize = 100, parent_key, search, status } = params || {};
  const filter: Record<string, any> = {};
  if (parent_key !== undefined) filter.parent_key = parent_key;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { leader: { $regex: search, $options: "i" } }
    ];
  }
  return queryDocuments<Department>({
    cname: COLLECTION,
    filter: Object.keys(filter).length ? filter : undefined,
    pageNum,
    pageSize,
    orderBy: "sort_order",
    orderType: "asc"
  });
}

export function createDepartment(data: Omit<Department, "created_at" | "updated_at">) {
  return createDocument<Department>(COLLECTION, {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export function updateDepartment(key: string, data: Partial<Department>) {
  return updateDocument<Department>(COLLECTION, key, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export function deleteDepartment(key: string) {
  return deleteDocument(COLLECTION, key);
}