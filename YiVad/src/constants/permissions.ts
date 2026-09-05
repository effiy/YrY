/**
 * RBAC permission code constants.
 *
 * Permission codes use the `{module}:{action}` format for consistency across
 * the frontend and backend. Codes are grouped by functional module for the
 * role-editing permission matrix.
 *
 * Usage:
 *   import { PERMISSIONS, PERMISSION_MODULES } from '@/constants/permissions';
 *   v-auth="PERMISSIONS.PROJECT_CREATE"
 */

// ── Individual permission codes ──

export const PERMISSIONS = {
  // Project
  PROJECT_VIEW: "project:view",
  PROJECT_CREATE: "project:create",
  PROJECT_EDIT: "project:edit",
  PROJECT_DELETE: "project:delete",

  // Knowledge base
  KNOWLEDGE_VIEW: "knowledge:view",
  KNOWLEDGE_CREATE: "knowledge:create",
  KNOWLEDGE_EDIT: "knowledge:edit",
  KNOWLEDGE_DELETE: "knowledge:delete",

  // Data service
  DATA_VIEW: "data:view",
  DATA_EXPORT: "data:export",

  // AI Chat
  CHAT_VIEW: "chat:view",
  CHAT_CREATE: "chat:create",

  // User management
  USER_MANAGE: "user:manage",

  // Role management
  ROLE_MANAGE: "role:manage",

  // Audit log
  AUDIT_VIEW: "audit:view",
  AUDIT_EXPORT: "audit:export",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ── Module groupings (for the permission matrix UI) ──

export interface PermissionModule {
  module: string;
  label: string;
  permissions: { code: PermissionCode; label: string }[];
}

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    module: "project",
    label: "项目管理",
    permissions: [
      { code: "project:view", label: "查看项目" },
      { code: "project:create", label: "新建项目" },
      { code: "project:edit", label: "编辑项目" },
      { code: "project:delete", label: "删除项目" },
    ],
  },
  {
    module: "knowledge",
    label: "知识库",
    permissions: [
      { code: "knowledge:view", label: "查看知识库" },
      { code: "knowledge:create", label: "新建文档" },
      { code: "knowledge:edit", label: "编辑文档" },
      { code: "knowledge:delete", label: "删除文档" },
    ],
  },
  {
    module: "data",
    label: "数据服务",
    permissions: [
      { code: "data:view", label: "查看数据" },
      { code: "data:export", label: "导出数据" },
    ],
  },
  {
    module: "chat",
    label: "AI 对话",
    permissions: [
      { code: "chat:view", label: "使用对话" },
      { code: "chat:create", label: "新建会话" },
    ],
  },
  {
    module: "user",
    label: "用户管理",
    permissions: [
      { code: "user:manage", label: "管理用户" },
    ],
  },
  {
    module: "role",
    label: "角色管理",
    permissions: [
      { code: "role:manage", label: "管理角色" },
    ],
  },
  {
    module: "audit",
    label: "审计日志",
    permissions: [
      { code: "audit:view", label: "查看审计日志" },
      { code: "audit:export", label: "导出审计日志" },
    ],
  },
];

// ── Default role permission matrix ──

export type RoleKey = "admin" | "engineer" | "producter" | "analyst" | "viewer";

export const DEFAULT_ROLE_PERMISSIONS: Record<RoleKey, PermissionCode[]> = {
  admin: [
    "project:view", "project:create", "project:edit", "project:delete",
    "knowledge:view", "knowledge:create", "knowledge:edit", "knowledge:delete",
    "data:view", "data:export",
    "chat:view", "chat:create",
    "user:manage",
    "role:manage",
    "audit:view", "audit:export",
  ],
  engineer: [
    "project:view", "project:create", "project:edit",
    "knowledge:view", "knowledge:create", "knowledge:edit",
    "data:view", "data:export",
    "chat:view", "chat:create",
  ],
  producter: [
    "project:view", "project:create", "project:edit",
    "knowledge:view", "knowledge:create", "knowledge:edit",
    "data:view",
    "chat:view", "chat:create",
  ],
  analyst: [
    "project:view",
    "knowledge:view",
    "data:view", "data:export",
    "chat:view", "chat:create",
  ],
  viewer: [
    "project:view",
    "knowledge:view",
    "data:view",
    "chat:view", "chat:create",
  ],
};