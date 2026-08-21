/**
 * Project management API service.
 * Projects are stored in the YiAi `projects` collection via the data service RPC.
 */
import http from "@/api/index";
import { callService, queryDocuments, createDocument, updateDocument, deleteDocument } from "@/api/modules/dataService";

const COLLECTION = "projects";

export interface ProjectMember {
  user_id: string;
  username: string;
  role: "owner" | "admin" | "member" | "viewer";
  avatar?: string;
}

export interface Project {
  key: string;
  name: string;
  description?: string;
  identifier: string;
  status: "active" | "archived";
  cover_image?: string;
  members: ProjectMember[];
  created_at: string;
  updated_at: string;
}

export interface ProjectQueryParams {
  pageNum?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

export function getProjectList(params: ProjectQueryParams) {
  const { pageNum = 1, pageSize = 20, status, search } = params;
  const filter: Record<string, any> = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { identifier: { $regex: search, $options: "i" } }
    ];
  }
  return queryDocuments<Project>({
    cname: COLLECTION,
    filter,
    pageNum,
    pageSize,
    orderBy: "updated_at",
    orderType: "desc"
  });
}

export function getProject(key: string) {
  return queryDocuments<Project>({
    cname: COLLECTION,
    filter: { key },
    pageSize: 1
  });
}

export function createProject(data: Omit<Project, "created_at" | "updated_at">) {
  return createDocument<Project>(COLLECTION, {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export function updateProject(key: string, data: Partial<Project>) {
  return updateDocument<Project>(COLLECTION, key, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export function deleteProject(key: string) {
  return deleteDocument(COLLECTION, key);
}