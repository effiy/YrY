---
prd_task_id: "YV-09-106"
title: "YV-09-106: 用户角色与权限矩阵 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "50-prd-用户角色与权限矩阵.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 用户角色与权限矩阵]
roles: [engineer]
benefit: "开发方案：task-用户角色与权限矩阵"
lifecycle: active
---

# YV-09-106: 用户角色与权限矩阵 — 开发方案

> 需求编号：YV-09-106 · 人天：0.5d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `PermissionMatrix.vue` | 角色×权限矩阵组件（复用现有模式） | `src/components/` |
| `RolePermissionEditor.vue` | 角色权限编辑页面 | `src/views/system/` |
| `authStore.ts` | 权限管理相关操作 | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

可视化角色-权限矩阵页面：行=角色，列=权限模块，交叉点=勾选框。

### 架构方案

**技术路线**：系统管理子页面 `/system/role-permissions`。复用现有 `PermissionMatrix` 组件模式（已在角色管理中使用），扩展为角色×权限模块的二维矩阵。矩阵中每格为 `el-checkbox`，行列头支持全选/取消。权限粒度分为模块级（read/write/admin）+ 字段级（visible/editable）。

**权限模型**：
```typescript
interface RolePermission {
  role_id: string;
  role_name: string;
  permissions: ModulePermission[];
}

interface ModulePermission {
  module: 'project' | 'knowledge' | 'data' | 'chat' | 'user' | 'role' | 'audit' | 'system';
  read: boolean;
  write: boolean;
  admin: boolean;
  fields?: FieldPermission[];  // 字段级权限（可选）
}
```

**矩阵交互**：
```
点击单元格 el-checkbox → toggle 单个权限
  → authStore.updatePermission(role_id, module, field, value)
  → YiAi auth_service.update_role_permissions
  → 成功: ElMessage.success + 矩阵刷新

点击列头 → 全选/取消整列（该模块所有角色）
点击行头 → 全选/取消整行（该角色所有模块）

单元格颜色:
  空 (无权限): 白色
  ✓ (read): 浅蓝 #E6F0FA
  ✓✓ (write): 蓝色 #409EFF 文字
  ✓✓✓ (admin): 深蓝 #337ECC 文字 + 边框
```

**组件树**：
```
RolePermissionEditor.vue
├── RoleSelector.vue (el-select: 选择要编辑的角色)
└── PermissionMatrix.vue (二维表)
    ├── MatrixHeader.vue (列头: 权限模块名 + 全选按钮)
    ├── MatrixRow.vue ×N (行: 角色名 + 每个模块的 el-checkbox)
    └── MatrixLegend.vue (图例: 空/read/write/admin)
```

**数据流**：
```
页面加载 → authStore.fetchRoles() + authStore.fetchPermissions()
  → YiAi auth_service.list_roles + auth_service.list_permissions
  → 构建矩阵数据: Map<role_id, Map<module, PermissionState>>
  → 渲染矩阵

用户切换复选框
  → debounce 500ms → 批量提交变更（避免每个 checkbox 单独 API 调用）
  → YiAi auth_service.batch_update_permissions
  → 成功: 矩阵保持新状态 + ElMessage.success
  → 失败: 回滚到旧状态 + ElMessage.error
```

**关键决策**：
- 矩阵复用：复用现有 `PermissionMatrix` 组件（已在 `views/system/roleManage` 中使用），调整为角色×模块维度
- 批量提交：debounce 500ms 收集所有变更，一次性调用 `batch_update_permissions`，避免 N×M 次 API 调用
- 权限粒度：模块级权限（read/write/admin）为必须，字段级权限（visible/editable）为可选扩展
- 继承模型：子角色继承父角色权限（父角色 admin→子角色自动获得 write），前端矩阵中继承的权限灰显+不可编辑+tooltip 说明来源
- 变更审计：权限变更记录到 `security_events` 集合（操作人/时间/变更内容/旧值/新值）

### 矩阵视图

| 角色 \ 模块 | project | knowledge | data | chat | user | role | audit |
|------------|---------|-----------|------|------|------|------|-------|
| admin | ✅✅✅ | ✅✅✅ | ✅✅ | ✅✅ | ✅ | ✅ | ✅✅ |
| engineer | ✅✅ | ✅✅ | ✅✅ | ✅✅ | — | — | — |
| viewer | ✅ | ✅ | ✅ | ✅✅ | — | — | — |

### 实施步骤：0.5d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | PermissionMatrix 组件（角色×模块维度） | 矩阵渲染 + 复选框交互 | 0.18 |
| 2 | 批量提交（debounce + batch_update） | 批量 API 调用 + 回滚 | 0.10 |
| 3 | 继承权限显示（灰显+tooltip） | 继承权限不可编辑 | 0.08 |
| 4 | 权限继承关系树（可选：d3/echarts 树图） | 树图渲染 | 0.08 |
| 5 | 变更审计日志 | 操作记录 security_events | 0.06 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 角色×模块矩阵正确渲染（所有角色和模块维度）
- [ ] 复选框交互正常（单格/整行/整列切换）
- [ ] 批量提交 debounce 500ms + 失败回滚
- [ ] 继承权限灰显 + 不可编辑 + tooltip
- [ ] 权限变更记录审计日志
- [ ] 矩阵图例：空/read/write/admin 颜色区分
- [ ] `vue-tsc --noEmit` 通过

---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：已完成

### 功能缺口
| — | 无 | — | — |

### 技术债
| — | 无 | — | — | — | — |

---

## 实现完成记录

> **状态**：已完成（0.5d）· **复核日期**：2026-09-15

### 产出
| 分类 | 文件数 | 说明 |
|------|--------|------|
| 页面 | 1 | RolePermissionEditor.vue |
| 组件 | 1 | PermissionMatrix.vue (角色×模块维度) |
| Store | 1 | authStore (权限管理) |
| 测试 | 1 | 见测试方案 |

---

## 代码审查检查清单
- [x] 角色×模块矩阵渲染
- [x] 单格/整行/整列切换
- [x] 批量提交 + 回滚
- [x] 继承权限灰显+不可编辑
- [x] 审计日志记录
- [x] 矩阵图例颜色区分
- [x] `vue-tsc --noEmit` 通过