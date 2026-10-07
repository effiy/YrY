---
prd_task_id: "YV-09-202"
title: "YV-09-202: 用户 API 密钥管理 — 开发方案"
status: 已完成
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.25
source_prd: "76-prd-用户API密钥管理.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 用户API密钥管理]
roles: [engineer]
benefit: "开发方案：task-用户API密钥管理"
lifecycle: active
---

# YV-09-202: 用户 API 密钥管理 — 开发方案

> 需求编号：YV-09-202 · 人天：0.25d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `ApiKeyManager.vue` | API 密钥管理页面 | `src/views/settings/` |
| `CreateApiKeyDialog.vue` | 创建密钥对话框（名称+权限+过期时间） | `src/components/user/` |
| `ApiKeyList.vue` | 密钥列表（ProTable + 掩码显示） | `src/components/user/` |
| `authStore.ts` | API 密钥相关操作 | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

用户可创建/查看/撤销个人 API 密钥，用于外部工具调用 YiAi API。

### 架构方案

**技术路线**：独立路由页面 `/settings/api-keys`，ProTable 展示密钥列表，密钥仅在创建时显示一次（安全考虑）。操作通过 YiAi `auth_service` RPC 调用。

**数据模型**：
```typescript
interface ApiKey {
  id: string;
  name: string;             // 用户自定义名称
  prefix: string;           // 密钥前 8 位（列表显示用）
  permissions: ApiKeyPermission[];  // 权限范围
  expires_at?: string;      // 过期时间（可选 30/60/90 天或永久）
  last_used_at?: string;
  created_at: string;
  status: 'active' | 'revoked' | 'expired';
}

type ApiKeyPermission = 'read:issues' | 'write:issues' | 'read:bugs' | 
  'write:bugs' | 'read:projects' | 'read:knowledge' | 'admin';
```

**安全设计**：
```
创建流程:
  用户填写名称 + 选择权限 + 选择过期时间
  → 输入当前密码确认（敏感操作）
  → YiAi auth_service.create_api_key
  → 返回完整密钥（仅此一次！）
  → 前端显示: "请立即复制此密钥，关闭后无法再次查看"
  → 提供复制按钮 + 下载为文本文件按钮
  → 关闭对话框后: 列表显示 prefix 掩码（ak_xxxx****）

密钥存储:
  MongoDB api_keys 集合:
    key_hash: bcrypt(key)     // 仅存储哈希，不可逆
    key_prefix: key[0:8]      // 前 8 位用于列表显示
    key_suffix: key[-4:]      // 后 4 位用于用户识别
  完整密钥 = prefix + random(32) + suffix → 生成后不存储原文
```

**组件树**：
```
ApiKeyManager.vue (页面容器)
├── CreateApiKeyButton.vue (创建按钮 → 打开对话框)
├── ApiKeyList.vue (ProTable)
│   ├── 列: Name | Prefix (掩码) | Permissions | Created | Expires | Last Used | Status | Actions
│   └── Actions: 撤销按钮 (el-popconfirm)
└── CreateApiKeyDialog.vue (el-dialog)
    ├── Step 1: 填写名称 + 选择权限 + 过期时间 + 输入密码
    ├── Step 2 (创建成功后): 显示完整密钥 + 复制按钮 + 警告文字
    └── Step 3: 关闭后显示确认提示 "已安全保存密钥?"
```

**关键决策**：
- 密钥安全：完整密钥仅在创建时显示一次（前端不存储），MongoDB 仅存 bcrypt 哈希
- 权限粒度：按模块+操作（read/write/admin），而非全有或全无
- 过期策略：支持 30/60/90 天自动过期或永久有效（默认 90 天）
- 撤销机制：立即失效（`status: 'revoked'`），不可恢复
- 列表掩码：显示 `ak_xxxx****xxxx` 格式（前 4 位 + * + 后 4 位），用户可据此识别密钥
- 创建确认：敏感操作需输入当前密码验证身份

### 密钥管理

| 操作 | 实现方式 | 说明 |
|------|---------|------|
| 创建 | el-dialog 三步流程 | 填写→确认密码→显示密钥（仅一次） |
| 查看 | ProTable + 掩码显示 | 不显示完整密钥（不可逆哈希存储） |
| 撤销 | el-popconfirm 确认 | 立即失效，不可恢复 |
| 过期 | 创建时选择 30/60/90 天 | 到期自动标记 `expired` |

### 实施步骤：0.25d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | ApiKeyList ProTable + 掩码显示 | 列表渲染 + 状态标签 | 0.08 |
| 2 | CreateApiKeyDialog 三步流程 | 填写→确认→显示密钥 | 0.10 |
| 3 | 撤销密钥 + 过期处理 | 确认→API 调用→列表更新 | 0.04 |
| 4 | 复制/下载密钥 + 安全提示 | 复制按钮 + 文本下载 | 0.03 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] ProTable 列表正确显示：Name/Prefix(掩码)/Permissions/Expires/Status
- [ ] 创建密钥三步流程完整（填写→密码确认→显示密钥）
- [ ] 完整密钥仅显示一次（关闭对话框后不可再次查看）
- [ ] 复制按钮 + 下载为文本文件
- [ ] 撤销密钥：二次确认 → API 调用 → 列表更新
- [ ] 过期密钥自动标记 `expired` + 灰显
- [ ] 创建前输入当前密码验证身份
- [ ] `vue-tsc --noEmit` 通过

---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：已完成

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |

---

## 实现完成记录

> **状态**：已完成（0.25d）· **复核日期**：2026-09-15

### 产出

| 分类 | 文件数 | 说明 |
|------|--------|------|
| 页面 | 1 | ApiKeyManager.vue |
| 组件 | 2 | CreateApiKeyDialog + ApiKeyList |
| Store | 1 | authStore (API 密钥 CRUD) |
| 测试 | 1 | 见测试方案 |

---

## 代码审查检查清单

- [x] 密钥列表 ProTable + 掩码显示
- [x] 创建密钥三步流程 + 密码确认
- [x] 完整密钥仅显示一次
- [x] 复制/下载功能
- [x] 撤销密钥二次确认
- [x] 过期密钥自动标记
- [x] bcrypt 哈希存储（后端）+ 前端不存原文
- [x] `vue-tsc --noEmit` 通过