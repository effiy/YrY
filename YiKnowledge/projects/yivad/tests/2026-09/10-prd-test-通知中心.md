---
doc_type: test
title: "通知中心 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-27"
source_prds: ["10-prd-通知中心"]
source_modules: []
---
# 通知中心 — 测试规格

> 来源 PRD：[10-prd-通知中心.md](../../prds/2026-09/10-prd-通知中心.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。用例覆盖度以 PRD 的 `FR-x.y` / `NFR-x` 编号追溯，不复制需求正文。
> 提取日期：2026-09-11

---


---

<a id="sec-strategy"></a>
## 测试策略

### 分层模型

| 层级 | 说明 | 自动化 | 执行时机 |
|------|------|--------|---------|
| L1 单元 | Composable/hook/工具函数纯逻辑 | Vitest | 每次提交 |
| L2 组件 | Vue 组件挂载与交互 | Vitest + @vue/test-utils | 每次提交 |
| L3 集成 | Composable ↔ 组件 ↔ Store ↔ RPC | Vitest + mock | 每次提交 |
| L4 端到端 | 完整用户路径（需 YiAi 运行） | 手动 | 提测/回归 |

### 优先级定义

| 级别 | 含义 | 响应 |
|------|------|------|
| P0 | 核心路径，失败阻塞发布 | 立即修复 |
| P1 | 重要功能，失败需评估 | 当日修复 |
| P2 | 增强功能，可延后 | 排期修复 |

---

<a id="sec-env"></a>
## 测试环境与前置条件

| 项 | 要求 |
|----|------|
| Node.js | 与项目 `.nvmrc` 一致 |
| 包管理器 | pnpm |
| 浏览器 | Chrome 最新版 |
| 框架 | Vitest + jsdom |
| 类型检查 | `pnpm exec vue-tsc --noEmit` |

```bash
pnpm test                                    # 全部测试
pnpm exec vitest run tests/hooks/            # 仅 hooks
pnpm exec vitest run --coverage             # 覆盖率
```

---

<a id="sec-criteria"></a>
## 准入与准出标准

### 准入

| # | 条件 |
|---|------|
| 1 | 对应 FR 的实现已提交 |
| 2 | `vue-tsc --noEmit` 无错误 |
| 3 | 功能在开发环境可正常使用 |

### 准出

| # | 条件 | 阈值 |
|---|------|------|
| 1 | P0 用例通过率 | 100% |
| 2 | P1 用例通过率 | ≥ 95% |
| 3 | 遗留缺陷 | 无 Blocker / Critical |

---

<a id="sec-defects"></a>
## 缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| Blocker | 阻塞测试或数据损坏 | 功能完全不可用 |
| Critical | 核心功能不可用 | 主要路径报错 |
| Major | 功能缺陷但有替代路径 | 边界条件处理不当 |
| Minor | 体验问题 | UI 偏移/文案错误 |
| Trivial | 视觉细节 | 间距微调 |

### 需求覆盖矩阵

| FR | 需求 | 测试覆盖 | 状态 |
|----|------|---------|------|
| FR-10.1 | 参见 PRD | UT | ✅ 已完成 |
| FR-10.2 | 参见 PRD | UT | ✅ 已完成 |
| FR-10.3 | 参见 PRD | UT | ✅ 已完成 |
| FR-10.4 | 参见 PRD | UT | ✅ 已完成 |
| FR-10.5 | 参见 PRD | UT | ✅ 已完成 |
| FR-10.6 | 参见 PRD | UT | ✅ 已完成 |
| FR-10.7 | 参见 PRD | UT | ✅ 已完成 |
| FR-10.8 | 参见 PRD | UT | ✅ 已完成 |
| FR-10.9 | 参见 PRD | UT | ✅ 已完成 |
| FR-10.10 | 参见 PRD | UT | ✅ 已完成 |
| FR-10.11 | 参见 PRD | UT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### 单元测试：NotificationStore

#### Scenario: 添加通知
- **GIVEN** 空通知列表
- **WHEN** 调用 `addNotification({ id: '1', type: 'system', title: 'Test', ... })`
- **THEN** `notifications.length` 为 1，`unreadCount` 为 1

#### Scenario: 不重复添加相同 ID 的通知
- **GIVEN** 通知列表已有 `id: '1'` 的通知
- **WHEN** 再次调用 `addNotification({ id: '1', ... })`
- **THEN** `notifications.length` 保持 1

#### Scenario: 标记单条已读
- **GIVEN** 通知列表有 2 条未读通知
- **WHEN** 调用 `markAsRead('1')`
- **THEN** 通知 `id: '1'` 的 `read` 为 `true`，`unreadCount` 为 1

#### Scenario: 全部标记已读
- **GIVEN** 通知列表有 5 条未读通知
- **WHEN** 调用 `markAllAsRead()`
- **THEN** 所有通知 `read` 为 `true`，`unreadCount` 为 0

#### Scenario: 缓存上限
- **GIVEN** 通知列表已有 100 条通知
- **WHEN** 调用 `addNotification` 添加第 101 条
- **THEN** `notifications.length` 保持 100，最早的通知被移除

#### Scenario: 按优先级排序
- **GIVEN** 通知列表包含 `urgent`、`low`、`high` 优先级通知
- **WHEN** 访问 `unreadNotifications`
- **THEN** 顺序为 `urgent` > `high` > `low`（其余未读通知按此顺序）

### E2E 测试：通知流程

#### Scenario: 收到实时通知
- **GIVEN** 用户登录 YiVad，SSE 连接正常
- **WHEN** 后端推送一条新通知
- **THEN** 导航栏通知铃铛显示未读角标，数值 +1

#### Scenario: 点击通知跳转
- **GIVEN** 通知面板打开，有一条 AI 聊天完成通知，`actionUrl: '/chat'`
- **WHEN** 点击该通知
- **THEN** 页面导航到聊天页面，该通知标记为已读

---

## 源码索引

| 文件 | 说明 | 文件路径 |
|------|------|------|
| `src/hooks/useNotificationSSE.ts` | 通知 SSE hook | `YiVad/src/hooks/useNotificationSSE.ts` |
| `src/stores/modules/notification.ts` | 通知 Pinia store | `YiVad/src/stores/modules/notification.ts` |
| `src/api/modules/notificationService.ts` | 通知 API 服务 | `YiVad/src/api/modules/notificationService.ts` |
| `src/components/notification/NotificationPanel.vue` | 通知面板 | `YiVad/src/components/notification/NotificationPanel.vue` |
| `src/components/notification/NotificationItem.vue` | 通知条目 | `YiVad/src/components/notification/NotificationItem.vue` |
| `src/components/notification/NotificationFilter.vue` | 通知筛选 | `YiVad/src/components/notification/NotificationFilter.vue` |
| `src/components/NotificationBell.vue` | 通知铃铛 | `YiVad/src/components/NotificationBell.vue` |
| `src/views/settings/NotificationPreferences.vue` | 通知偏好设置 | `YiVad/src/views/settings/NotificationPreferences.vue` |

---

## 覆盖矩阵

| 编号 | 用例 | 覆盖 FR | 优先级 | 自动化 |
|------|------|--------|--------|--------|
| TC-NOTIF-001 | 初始空通知列表 | FR-10.3 | P0 | ✅ notificationStore.test.ts |
| TC-NOTIF-002 | 添加通知+未读计数 | FR-10.1 | P0 | ✅ notificationStore.test.ts |
| TC-NOTIF-003 | 按 ID 去重 | FR-10.11 | P0 | ✅ notificationStore.test.ts |
| TC-NOTIF-004 | 标记单条已读 | FR-10.6 | P0 | ✅ notificationStore.test.ts |
| TC-NOTIF-005 | 标记全部已读 | FR-10.6 | P0 | ✅ notificationStore.test.ts |
| TC-NOTIF-006 | 删除通知 | FR-10.11 | P0 | ✅ notificationStore.test.ts |
| TC-NOTIF-007 | 按类型清除 | FR-10.7 | P0 | ✅ notificationStore.test.ts |
| TC-NOTIF-008 | 100 条上限 | FR-10.11 | P0 | ✅ notificationStore.test.ts |
| TC-NOTIF-009 | 优先级排序 | FR-10.3 | P0 | ✅ notificationStore.test.ts |
| TC-NOTIF-010 | 类型分组 | FR-10.7 | P1 | ✅ notificationStore.test.ts |
| TC-NOTIF-011 | 偏好过滤 | FR-10.8 | P1 | ✅ notificationStore.test.ts |
| TC-NOTIF-012 | 免打扰时段 | FR-10.9 | P1 | ✅ notificationStore.test.ts |




## 补充：单元测试用例

### UT-NT01: useNotification

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 通知列表 | SSE 推送 3 条通知 | notifications 含 3 条 |
| 2 | 未读计数 | 3 条未读 | unreadCount=3 |
| 3 | 标记已读 | markAsRead(id) | unreadCount 减 1 |
| 4 | 全部已读 | markAllRead() | unreadCount=0 |
| 5 | 通知点击 | 点击通知 | 跳转到目标页面 |
| 6 | SSE 重连 | 连接断开 | 自动重连（指数退避） |

### UT-NT02: 通知模板

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 模板渲染 | 模板 + 数据 | 标题/内容变量替换正确 |
| 2 | 多语言 | locale='en' | 使用英文模板 |

---

## 执行状态

> 复核日期：2026-09-15

| 指标 | 值 |
|------|-----|
| 全局测试 | 67 文件 · 594 用例 · 100% 通过 |
| 本模块 Hook 测试 | 0 文件 · 已纳入 `pnpm test` |
| 本模块组件测试 | 0 文件 · 已纳入 `pnpm test` |
| 本模块工具测试 | 0 文件 · 已纳入 `pnpm test` |
| 执行命令 | `cd YiVad && pnpm test` |

