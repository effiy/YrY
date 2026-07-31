/**
 * System management module — backed by the YiAi data-service RPC.
 * Each domain lives in its own MongoDB collection:
 *   menus, departments, roles, dicts, scheduler_status
 *
 * `getSchedulerStatus` reads the latest snapshot document from the
 * `scheduler_status` collection (updated by the backend scheduler).
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import { callService } from "./dataService";
import type {
  YiAiEnvelope,
  QueryDocumentsData,
  MenuDocument,
  DepartmentDocument,
  RoleDocument,
  DictDocument,
  SchedulerStatusDocument
} from "@/api/interface/yiweb";

function newKey(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Menus ──

export async function getMenuList(): Promise<YiAiEnvelope<MenuDocument[]>> {
  const res = await queryDocuments<MenuDocument>({
    cname: "menus",
    limit: 1000,
    orderBy: "sort",
    orderType: "asc"
  });
  return { ...res, data: (res.data?.list ?? []) as MenuDocument[] };
}

export function createMenu(params: Record<string, any>): Promise<YiAiEnvelope> {
  const now = Date.now();
  return createDocument("menus", {
    ...params,
    key: params.key || newKey("menu"),
    createdAt: now,
    updatedAt: now
  });
}

export function updateMenu(key: string, params: Record<string, any>): Promise<YiAiEnvelope> {
  return updateDocument("menus", key, { ...params, key, updatedAt: Date.now() });
}

export function deleteMenu(key: string): Promise<YiAiEnvelope> {
  return deleteDocument("menus", key);
}

// ── Departments ──

export async function getDepartmentList(): Promise<YiAiEnvelope<DepartmentDocument[]>> {
  const res = await queryDocuments<DepartmentDocument>({
    cname: "departments",
    limit: 1000,
    orderBy: "createdAt",
    orderType: "asc"
  });
  return { ...res, data: (res.data?.list ?? []) as DepartmentDocument[] };
}

export function createDepartment(params: Record<string, any>): Promise<YiAiEnvelope> {
  const now = Date.now();
  return createDocument("departments", {
    ...params,
    key: params.key || newKey("dept"),
    id: params.id || params.key || newKey("dept"),
    createdAt: now,
    updatedAt: now
  });
}

export function updateDepartment(key: string, params: Record<string, any>): Promise<YiAiEnvelope> {
  return updateDocument("departments", key, { ...params, key, updatedAt: Date.now() });
}

export function deleteDepartment(key: string): Promise<YiAiEnvelope> {
  return deleteDocument("departments", key);
}

// ── Roles ──

export async function getRoleList(): Promise<YiAiEnvelope<RoleDocument[]>> {
  const res = await queryDocuments<RoleDocument>({
    cname: "roles",
    limit: 1000,
    orderBy: "createdAt",
    orderType: "asc"
  });
  return { ...res, data: (res.data?.list ?? []) as RoleDocument[] };
}

export function createRole(params: Record<string, any>): Promise<YiAiEnvelope> {
  const now = Date.now();
  return createDocument("roles", {
    ...params,
    key: params.key || newKey("role"),
    id: params.id || params.key || newKey("role"),
    createdAt: now,
    updatedAt: now
  });
}

export function updateRole(key: string, params: Record<string, any>): Promise<YiAiEnvelope> {
  return updateDocument("roles", key, { ...params, key, updatedAt: Date.now() });
}

export function deleteRole(key: string): Promise<YiAiEnvelope> {
  return deleteDocument("roles", key);
}

// ── Dictionaries ──

export async function getDictItems(name: string): Promise<YiAiEnvelope<DictDocument[]>> {
  const res = await queryDocuments<DictDocument>({
    cname: name,
    limit: 1000,
    orderBy: "sort",
    orderType: "asc"
  });
  return { ...res, data: (res.data?.list ?? []) as DictDocument[] };
}

export function createDictItem(name: string, params: Record<string, any>): Promise<YiAiEnvelope> {
  const now = Date.now();
  return createDocument(name, {
    ...params,
    key: params.key || newKey("dict"),
    createdAt: now,
    updatedAt: now
  });
}

export function updateDictItem(name: string, key: string, params: Record<string, any>): Promise<YiAiEnvelope> {
  return updateDocument(name, key, { ...params, key, updatedAt: Date.now() });
}

export function deleteDictItem(name: string, key: string): Promise<YiAiEnvelope> {
  return deleteDocument(name, key);
}

// ── Scheduler ──

/**
 * Fetch the latest scheduler-status snapshot. The backend scheduler writes
 * a single document into the `scheduler_status` collection; we read the
 * newest entry. Falls back to a synthetic snapshot via the
 * `services.system.scheduler_service.get_status` RPC when the collection is
 * empty.
 */
export async function getSchedulerStatus(): Promise<YiAiEnvelope<SchedulerStatusDocument>> {
  const res = await queryDocuments<SchedulerStatusDocument>({
    cname: "scheduler_status",
    limit: 1,
    orderBy: "updatedAt",
    orderType: "desc"
  });
  const fromCollection = res.data?.list?.[0];
  if (fromCollection) {
    return { ...res, data: fromCollection };
  }
  // Fallback to the RPC call (returns a synthesized snapshot)
  const rpc = await callService<SchedulerStatusDocument>("services.system.scheduler_service", "get_status", {});
  return rpc;
}

export type { MenuDocument, DepartmentDocument, RoleDocument, DictDocument, SchedulerStatusDocument };
