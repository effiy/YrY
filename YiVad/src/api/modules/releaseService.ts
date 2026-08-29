/**
 * Release management API service.
 * Releases are stored in the YiAi `releases` collection via the data service RPC.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "@/api/modules/dataService";

const COLLECTION = "releases";

export type ReleaseStatus = "planned" | "in_progress" | "released";

export const RELEASE_STATUS_MAP: Record<ReleaseStatus, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  released: "Released"
};

export interface Release {
  key: string;
  project_key: string;
  version: string;
  name: string;
  notes?: string;
  status: ReleaseStatus;
  target_date?: string;
  release_date?: string;
  issue_keys: string[];
  created_at: string;
  updated_at: string;
}

export interface ReleaseQueryParams {
  pageNum?: number;
  pageSize?: number;
  project_key?: string;
  status?: string;
  search?: string;
}

export function getReleaseList(params: ReleaseQueryParams) {
  const { pageNum = 1, pageSize = 20, project_key, status, search } = params;
  const filter: Record<string, any> = {};
  if (project_key) filter.project_key = project_key;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { version: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } }
    ];
  }
  return queryDocuments<Release>({
    cname: COLLECTION,
    filter,
    pageNum,
    pageSize,
    orderBy: "target_date",
    orderType: "desc"
  });
}

export function getRelease(key: string) {
  return queryDocuments<Release>({
    cname: COLLECTION,
    filter: { key },
    pageSize: 1
  });
}

export function createRelease(data: Omit<Release, "created_at" | "updated_at">) {
  return createDocument<Release>(COLLECTION, {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export function updateRelease(key: string, data: Partial<Release>) {
  return updateDocument<Release>(COLLECTION, key, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export function deleteRelease(key: string) {
  return deleteDocument(COLLECTION, key);
}