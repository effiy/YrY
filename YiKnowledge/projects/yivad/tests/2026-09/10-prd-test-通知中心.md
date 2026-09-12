---
doc_type: test
title: "通知中心 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-27"
source_prds: ["10-prd-通知中心"]
source_modules: []
---
# 通知中心 — 测试规格

> 来源 PRD：[10-prd-通知中心.md](../../prds/2026-09/10-prd-通知中心.md)
> 提取日期：2026-09-11

---

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

