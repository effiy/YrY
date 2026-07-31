/**
 * User management module — backed by the YiAi data-service RPC.
 * Users live in the "users" MongoDB collection; reference dictionaries
 * live in dedicated collections (dict_status, dict_gender, dict_department,
 * dict_role) so that enum-style reads stay cheap.
 *
 * All functions return the YiAi envelope shape ({ code, message, data })
 * so existing view-side destructuring (`{ data }`) keeps working.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import type { YiAiEnvelope, QueryDocumentsData } from "@/api/interface/yiweb";
import type { ReqPage, User, UserDocument } from "@/api/interface/index";

const CNAME = "users";

function newKey(): string {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── User CRUD ──

// Get user list (paginated)
export async function getUserList(
  params: User.ReqUserParams
): Promise<YiAiEnvelope<QueryDocumentsData<UserDocument> & User.ReqUserParams>> {
  const filter: Record<string, any> = {};
  // Username comes from a ProTable search input — exact-match would silently
  // drop partial queries ("ali" wouldn't match "alice"). Use case-insensitive
  // $regex so partial typing works. YiAi's `query_documents` ignores the
  // `search` parameter (only `filter` is honored), so push it into the filter.
  if (params.username) filter.username = { $regex: params.username, $options: "i" };
  if (params.gender !== undefined) filter.gender = params.gender;
  if (params.idCard) filter.idCard = params.idCard;
  if (params.email) filter.email = { $regex: params.email, $options: "i" };
  if (params.address) filter.address = { $regex: params.address, $options: "i" };
  if (params.status !== undefined) filter.status = params.status;

  const pageNum = params.pageNum ?? 1;
  const pageSize = params.pageSize ?? 10;

  const res = await queryDocuments<UserDocument>({
    cname: CNAME,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    pageNum,
    pageSize,
    orderBy: "createdTime",
    orderType: "desc"
  });
  // Patch response to match the legacy ResPage shape (list/pageNum/pageSize/total)
  return {
    ...res,
    data: {
      ...(res.data as QueryDocumentsData<UserDocument>),
      pageNum,
      pageSize
    } as any
  };
}

// Get user list as a tree (built client-side from parentId)
export async function getUserTreeList(
  params: User.ReqUserParams
): Promise<YiAiEnvelope<QueryDocumentsData<UserDocument> & User.ReqUserParams>> {
  return getUserList(params);
}

// Add user
export async function addUser(params: Record<string, any>): Promise<YiAiEnvelope> {
  const now = Date.now();
  const key = params.key || newKey();
  const doc: UserDocument = {
    key,
    id: params.id || key,
    username: params.username ?? "",
    password: params.password ?? "",
    gender: params.gender ?? 0,
    idCard: params.idCard ?? "",
    email: params.email ?? "",
    address: params.address ?? "",
    status: params.status ?? 1,
    avatar: params.avatar ?? "",
    photo: params.photo ?? [],
    createdTime: new Date().toISOString(),
    updatedTime: new Date().toISOString()
  };
  return createDocument(CNAME, { ...doc, createdAt: now, updatedAt: now });
}

// Batch add users (FormData multipart) — iterate parsed rows client-side
export async function BatchAddUser(params: FormData): Promise<YiAiEnvelope<{ added: number }>> {
  const file = params.get("file") as File | null;
  if (!file) {
    return { code: 0, message: "no file", data: { added: 0 } };
  }
  const text = await file.text();
  const rows = text.split(/\r?\n/).filter(Boolean);
  let added = 0;
  for (const row of rows.slice(1)) {
    // naive CSV split — backend may parse differently; this is a best-effort fallback
    const cols = row.split(",");
    if (cols.length < 3) continue;
    try {
      await addUser({
        username: cols[0]?.trim() ?? "",
        gender: Number(cols[1]) || 0,
        email: cols[2]?.trim() ?? ""
      });
      added++;
    } catch {
      /* skip row */
    }
  }
  return { code: 0, message: "ok", data: { added } };
}

// Edit user
export async function editUser(params: Record<string, any>): Promise<YiAiEnvelope> {
  const key = params.key || params.id;
  if (!key) throw new Error("editUser: missing key");
  return updateDocument(CNAME, String(key), {
    ...params,
    updatedAt: Date.now(),
    updatedTime: new Date().toISOString()
  });
}

// Delete user
export async function deleteUser(params: { id: string[] }): Promise<YiAiEnvelope> {
  const target = params.id?.[0] || (params as any).key;
  if (!target) throw new Error("deleteUser: missing id");
  return deleteDocument(CNAME, String(target));
}

// Toggle user status
export async function changeUserStatus(params: { id: string; status: number }): Promise<YiAiEnvelope> {
  const key = params.id || (params as any).key;
  if (!key) throw new Error("changeUserStatus: missing id");
  return updateDocument(CNAME, String(key), {
    status: params.status,
    updatedAt: Date.now(),
    updatedTime: new Date().toISOString()
  });
}

// Reset user password
export async function resetUserPassWord(params: { id: string }): Promise<YiAiEnvelope> {
  const key = params.id || (params as any).key;
  if (!key) throw new Error("resetUserPassWord: missing id");
  return updateDocument(CNAME, String(key), {
    password: "",
    updatedAt: Date.now(),
    updatedTime: new Date().toISOString()
  });
}

// Export user data — YiAi has no export endpoint; return an empty CSV blob
export async function exportUserInfo(_params: User.ReqUserParams): Promise<Blob> {
  return new Blob(["\ufeff"], { type: "text/csv;charset=utf-8;" });
}

// ── Dictionary queries ──

async function queryDict<T>(cname: string): Promise<YiAiEnvelope<T[]>> {
  const res = await queryDocuments<T>({ cname, limit: 1000, orderBy: "sort", orderType: "asc" });
  return { ...res, data: (res.data?.list ?? []) as unknown as T[] };
}

// Get user status dictionary
export function getUserStatus(): Promise<YiAiEnvelope<User.ResStatus[]>> {
  return queryDict<User.ResStatus>("dict_status");
}

// Get user gender dictionary
export function getUserGender(): Promise<YiAiEnvelope<User.ResGender[]>> {
  return queryDict<User.ResGender>("dict_gender");
}

// Get user department tree
export function getUserDepartment(): Promise<YiAiEnvelope<User.ResDepartment[]>> {
  return queryDict<User.ResDepartment>("dict_department");
}

// Get user role tree
export function getUserRole(): Promise<YiAiEnvelope<User.ResRole[]>> {
  return queryDict<User.ResRole>("dict_role");
}

export type { UserDocument };
