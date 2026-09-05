/**
 * Audit log API — backed by YiAi data_service RPC.
 * Audit logs live in the "audit_logs" MongoDB collection.
 */
import { queryDocuments } from "./dataService";
import type { YiAiEnvelope, QueryDocumentsData } from "@/api/interface/yiweb";

const CNAME = "audit_logs";

export interface AuditLogDocument {
  key: string;
  operator: string;
  operatorName: string;
  target: string;
  targetName: string;
  action: string;
  module: string;
  detail: string;
  changes?: Record<string, any>;
  ip?: string;
  createdAt: string;
}

// Get audit log list (paginated)
export async function getAuditLogList(params: {
  pageNum?: number;
  pageSize?: number;
  operator?: string;
  target?: string;
  action?: string;
  module?: string;
  startTime?: string;
  endTime?: string;
}): Promise<YiAiEnvelope<QueryDocumentsData<AuditLogDocument>>> {
  const filter: Record<string, any> = {};
  if (params.operator) filter.operator = { $regex: params.operator, $options: "i" };
  if (params.target) filter.target = { $regex: params.target, $options: "i" };
  if (params.action) filter.action = params.action;
  if (params.module) filter.module = params.module;

  // Time range filter
  if (params.startTime || params.endTime) {
    filter.createdAt = {};
    if (params.startTime) filter.createdAt.$gte = params.startTime;
    if (params.endTime) filter.createdAt.$lte = params.endTime;
  }

  return queryDocuments<AuditLogDocument>({
    cname: CNAME,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    pageNum: params.pageNum ?? 1,
    pageSize: params.pageSize ?? 10,
    orderBy: "createdAt",
    orderType: "desc",
  });
}

// Action types for audit log filter dropdown
export const AUDIT_ACTIONS = [
  { label: "创建", value: "create" },
  { label: "更新", value: "update" },
  { label: "删除", value: "delete" },
  { label: "登录", value: "login" },
  { label: "登出", value: "logout" },
  { label: "导出", value: "export" },
  { label: "分配角色", value: "assign_role" },
];

// Module types for audit log filter dropdown
export const AUDIT_MODULES = [
  { label: "用户管理", value: "user" },
  { label: "角色管理", value: "role" },
  { label: "权限管理", value: "permission" },
  { label: "系统配置", value: "system" },
  { label: "项目管理", value: "project" },
  { label: "知识库", value: "knowledge" },
];