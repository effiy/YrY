/**
 * Role management API — backed by YiAi data_service RPC.
 * Roles live in the "roles" MongoDB collection.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import type { YiAiEnvelope, QueryDocumentsData } from "@/api/interface/yiweb";

const CNAME = "roles";

export interface RoleDocument {
  key: string;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Get role list (paginated)
export async function getRoleList(params: {
  pageNum?: number;
  pageSize?: number;
  name?: string;
}): Promise<YiAiEnvelope<QueryDocumentsData<RoleDocument>>> {
  const filter: Record<string, any> = {};
  if (params.name) filter.name = { $regex: params.name, $options: "i" };

  return queryDocuments<RoleDocument>({
    cname: CNAME,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    pageNum: params.pageNum ?? 1,
    pageSize: params.pageSize ?? 10,
    orderBy: "createdAt",
    orderType: "desc",
  });
}

// Get all roles (no pagination, for dropdowns)
export async function getAllRoles(): Promise<YiAiEnvelope<RoleDocument[]>> {
  const res = await queryDocuments<RoleDocument>({
    cname: CNAME,
    limit: 1000,
    orderBy: "name",
    orderType: "asc",
  });
  return { ...res, data: (res.data?.list ?? []) as unknown as RoleDocument[] };
}

// Create role
export async function createRole(params: {
  name: string;
  code: string;
  description?: string;
  permissions: string[];
}): Promise<YiAiEnvelope> {
  const now = Date.now();
  const key = `role_${now}_${Math.random().toString(36).slice(2, 8)}`;
  return createDocument(CNAME, {
    key,
    ...params,
    userCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

// Update role
export async function updateRole(params: {
  key: string;
  name?: string;
  code?: string;
  description?: string;
  permissions?: string[];
}): Promise<YiAiEnvelope> {
  const { key, ...rest } = params;
  return updateDocument(CNAME, key, {
    ...rest,
    updatedAt: new Date().toISOString(),
  });
}

// Delete role
export async function deleteRole(key: string): Promise<YiAiEnvelope> {
  return deleteDocument(CNAME, key);
}

// Check if role has associated users (query users collection for role reference)
export async function getRoleUserCount(roleCode: string): Promise<number> {
  try {
    const res = await queryDocuments<any>({
      cname: "users",
      filter: { roles: roleCode },
      limit: 1,
    });
    return res.data?.total ?? 0;
  } catch {
    return 0;
  }
}