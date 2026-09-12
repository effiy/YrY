---
doc_type: module
prd_task_id: "YV-08-06"
title: "系统管理模块 — RBAC 权限管理面板 — 开发任务"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
estimate_frontend: 4.0
source_prd: "06-prd-系统管理模块.md"
---

# 系统管理模块 — RBAC 权限管理面板 — 开发任务

> 来源 PRD：[06-prd-系统管理模块.md](../prds/2026-08/06-prd-系统管理模块.md)
> 需求编号：YV-08-06 · 优先级：P0 · 人天：4.0d

## 五、实施步骤

### 步骤 1: API 模块开发（0.5d）

- [x] 实现 `roleService.ts`：`getRoleList`、`getAllRoles`、`createRole`、`updateRole`、`deleteRole`、`getRoleUserCount`
- [x] 实现 `auditService.ts`：`getAuditLogList`、`AUDIT_ACTIONS`、`AUDIT_MODULES` 枚举
- [x] 实现 `system.ts`：`getMenuList`、`createMenu`、`updateMenu`、`deleteMenu`、`getDepartmentList`、`getRoleList`（字典）、`getDictItems`、`createDictItem`、`updateDictItem`、`deleteDictItem`、`getSchedulerStatus`
- [x] 复用 `user.ts`：`getUserList`、`deleteUser`、`changeUserStatus`、`editUser`

**验证：** 每个 API 函数可通过浏览器 DevTools Network 面板观察到正确的 RPC 信封请求

### 步骤 2: 权限常量定义（0.25d）

- [x] 定义 17 个权限码（`{module}:{action}` 格式）
- [x] 定义 7 个模块分组（`PERMISSION_MODULES`）
- [x] 定义 5 个默认角色权限矩阵（`DEFAULT_ROLE_PERMISSIONS`）
- [x] 导出 `PermissionCode` 类型

**验证：** `PERMISSION_MODULES` 在 `PermissionMatrix` 中正确渲染，`DEFAULT_ROLE_PERMISSIONS` 覆盖所有 17 个权限码

### 步骤 3: 子组件开发（0.75d）

- [x] 实现 `PermissionMatrix.vue`：模块分组表格、全选/取消全选、v-model 双向绑定
- [x] 实现 `AssignRoleDialog.vue`：角色列表加载、多选 checkbox、提交 emit

**验证：** `PermissionMatrix` 全选后 `modelValue` 包含 17 个权限码；`AssignRoleDialog` 打开后正确加载角色列表

### 步骤 4: 页面开发（2.0d）

- [x] 实现 `roleManage/index.vue`：ProTable + 新建/编辑弹窗 + 删除检查
- [x] 实现 `accountManage/index.vue`：ProTable + 状态切换 + 角色分配
- [x] 实现 `menuMange/index.vue`：树形 ProTable + 12 字段表单 + 键盘快捷键
- [x] 实现 `systemLog/index.vue`：ProTable + 多维筛选 + 变更详情弹窗
- [x] 创建 3 个占位页面：`departmentManage`、`dictManage`、`timingTask`

**验证：** 每个页面可正常加载、数据可正确展示、CRUD 操作可正常执行

### 步骤 5: 菜单注册与路由集成（0.25d）

- [x] 在菜单数据中添加系统管理菜单项（含 7 个子菜单）
- [x] 配置路由权限（`user:manage`、`role:manage`、`audit:view`）

**验证：** 具有相应权限的用户可在侧边栏看到系统管理菜单

### 步骤 6: 键盘快捷键（0.25d）

- [x] 菜单管理页面：`?` 帮助、`/` 搜索、`n` 新建、`Esc` 关闭
- [x] 快捷键冲突检测（弹窗/抽屉/下拉打开时禁用）

**验证：** 在菜单管理页面按下 `?` 弹出快捷键帮助，按 `/` 聚焦搜索框

---
