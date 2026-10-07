---
prd_task_id: "YV-09-130"
title: "YV-09-130: 用户会话管理 — 开发方案"
status: 已完成
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.25
source_prd: "60-prd-用户会话管理.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 用户会话管理]
roles: [engineer]
benefit: "开发方案：task-用户会话管理"
lifecycle: active
---

# YV-09-130: 用户会话管理 — 开发方案

> 需求编号：YV-09-130 · 人天：0.25d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `SessionList.vue` | 会话列表页面（ProTable） | `src/views/settings/` |
| `sessionStore.ts` | 会话状态管理 | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

用户可查看活跃会话列表、强制下线指定设备。

### 架构方案

**技术路线**：安全设置子页面 `/settings/security` 的 Tab 之一。ProTable 展示活跃会话，每行显示设备/IP/位置/登录时间/最后活跃。当前会话标记「当前」且不可强制下线，其他会话可逐个下线。

**数据模型**：
```typescript
interface ActiveSession {
  session_id: string;
  device: string;       // UserAgent 解析: "Chrome 120 / macOS"
  ip: string;
  location: string;     // IP 地理位置: "Beijing, CN"
  created_at: string;
  last_active: string;
  is_current: boolean;  // 是否为当前会话
}
```

**组件树**：
```
SessionList.vue (ProTable)
├── 列: Device | IP | Location | Login Time | Last Active | Actions
├── 当前会话行: 蓝色高亮 + "当前" 标签 + 强制下线按钮 disabled
├── 其他会话行: 强制下线按钮 (el-popconfirm)
└── 空状态: "仅当前会话活跃"
```

**关键决策**：
- 会话数据源：YiAi `auth_service.list_sessions` RPC，返回 JWT token 列表及其元数据
- 强制下线：`auth_service.revoke_session(session_id)` → Token 加入黑名单 → JWT 中间件拒绝后续请求 → 用户被强制登出
- 当前会话保护：`is_current` 标记的会话不可强制下线（按钮 disabled + tooltip "无法下线当前会话"）
- 批量下线：提供「下线所有其他设备」按钮（el-popconfirm 确认）
- UserAgent 解析：使用 `ua-parser-js` 库解析为 "Chrome 120 / macOS"

### 会话列表

| 字段 | 说明 | 实现 |
|------|------|------|
| 设备 | UserAgent 解析 | `ua-parser-js` → "Chrome / macOS" |
| IP | 登录 IP | JWT payload 中的 IP claim |
| 登录时间 | 会话开始时间 | JWT `iat` claim |
| 最后活跃 | 最后请求时间 | JWT 中间件更新 `last_active` |
| 操作 | 强制下线 | el-popconfirm → API 调用 |

### 实施步骤：0.25d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | SessionList ProTable + UserAgent 解析 | 列表渲染 + 设备信息 | 0.10 |
| 2 | 强制下线（单个+批量） | API 调用 + 列表更新 | 0.08 |
| 3 | 当前会话保护 + 空状态 | 按钮禁用 + 提示 | 0.04 |
| 4 | Token 黑名单验证 | 下线后刷新页面→跳转登录 | 0.03 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] ProTable 列表正确显示设备/IP/位置/时间
- [ ] UserAgent 正确解析为可读设备名
- [ ] 当前会话高亮 + 强制下线按钮禁用
- [ ] 单个强制下线：确认 → API → 列表移除
- [ ] 批量下线所有其他设备
- [ ] 下线后 Token 加入黑名单（被下线用户刷新后跳转登录页）
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

> **状态**：已完成（0.25d）· **复核日期**：2026-09-15

### 产出
| 分类 | 文件数 | 说明 |
|------|--------|------|
| 页面 | 1 | SessionList.vue |
| Store | 1 | sessionStore |
| 测试 | 1 | 见测试方案 |

---

## 代码审查检查清单
- [x] ProTable 列表 + UserAgent 解析
- [x] 当前会话保护（高亮+禁用）
- [x] 单个/批量强制下线
- [x] Token 黑名单验证
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过