---
prd_task_id: "YV-09-61"
title: "YV-09-61: 通知偏好中心 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "29-prd-通知偏好中心.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 通知偏好中心]
benefit: "开发方案：task-通知偏好中心"
lifecycle: active
---

# YV-09-61: 通知偏好中心 — 开发方案

> 需求编号：YV-09-61 · 人天：0.5d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `NotificationCenter.vue` | 通知中心页面（通知列表+偏好设置） | `src/views/` |
| `NotificationList.vue` | 通知列表（ProTable + 已读/未读） | `src/components/notification/` |
| `NotificationPreferences.vue` | 通知偏好面板（渠道×事件类型） | `src/components/notification/` |
| `notificationStore.ts` | 通知状态管理（列表+未读计数+偏好） | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

用户可配置通知偏好：按通知类型开关、通知方式选择（站内/邮件/企微）。

### 架构方案

**技术路线**：独立路由页面 `/notifications`，双面板布局——左侧通知列表（ProTable），右侧偏好设置面板。未读计数通过 `notificationStore.unreadCount` 派生并在 Header 显示角标。

**数据模型**：
```typescript
interface NotificationPreference {
  userId: string;
  preferences: Record<NotificationType, NotificationChannels>;
}
type NotificationType = 'issue.assigned' | 'bug.status_changed' | 'mention' | 'module.progress' | 'system.announcement';
interface NotificationChannels { inApp: boolean; email: boolean; wework: boolean; }
```

**组件树**：
```
NotificationCenter.vue (双栏布局)
├── NotificationList.vue (左栏: ProTable)
│   ├── 列: Type | Title | Time | Read Status
│   ├── 已读/未读过滤 tabs
│   ├── 全部标记已读按钮
│   └── 点击跳转到目标页面（Issue/Bug/模块）
└── NotificationPreferences.vue (右栏: 偏好面板)
    └── 通知类型 × 渠道复选框矩阵 + 自动保存
```

**关键决策**：
- 通知存储：MongoDB `notifications` 集合，字段：`{ user_id, type, title, target_url, is_read, created_at }`
- 未读计数：`notificationStore.unreadCount` 通过 `computed(() => list.filter(n => !n.is_read).length)` 派生，Header 角标实时更新
- 实时推送：初版用轮询（每 30s 检查新通知），后续升级为 WebSocket 推送
- 偏好持久化：YiAi `data_service.update_document("users", { notification_prefs })`，自动保存 debounce 1s
- 标记已读：点击通知 → `PATCH notifications/{id}/read` → 列表更新 + 未读计数 -1

### 偏好配置

| 通知类型 | 站内 | 邮件 | 企微 |
|---------|------|------|------|
| Issue 分配 | ✅ | ☐ | ☐ |
| Bug 状态变更 | ✅ | ☐ | ☐ |
| @提及 | ✅ | ✅ | ☐ |
| 模块进度 | ☐ | ☐ | ☐ |
| 系统公告 | ✅ | ☐ | ☐ |

### 实施步骤：0.5d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | NotificationList ProTable + 已读/未读过滤 | 列表渲染 + 状态切换 | 0.12 |
| 2 | NotificationPreferences 偏好矩阵 | 复选框矩阵 + 自动保存 | 0.10 |
| 3 | notificationStore（列表/未读计数/偏好） | Store 状态管理 | 0.10 |
| 4 | Header 未读角标 + 全部标记已读 | 角标更新 + 批量操作 | 0.08 |
| 5 | 通知详情跳转 + 标记已读 | 点击→跳转→标记 | 0.05 |
| 6 | 轮询新通知（30s 间隔） | 新通知自动出现在列表 | 0.05 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 通知列表 ProTable：类型/标题/时间/已读状态正确渲染
- [ ] 已读/未读过滤 tabs 切换
- [ ] 偏好矩阵复选框 + 自动保存 debounce 1s
- [ ] Header 未读角标实时更新
- [ ] 全部标记已读按钮
- [ ] 点击通知跳转到目标页面 + 自动标记已读
- [ ] 轮询新通知（30s），新通知自动追加到列表
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

> **状态**：已完成（0.5d）· **复核日期**：2026-09-15

### 产出
| 分类 | 文件数 | 说明 |
|------|--------|------|
| 页面 | 1 | NotificationCenter.vue |
| 组件 | 2 | NotificationList + NotificationPreferences |
| Store | 1 | notificationStore |
| 测试 | 1 | 见测试方案 |

---

## 代码审查检查清单
- [x] 通知列表 ProTable + 已读/未读过滤
- [x] 偏好矩阵复选框 + 自动保存
- [x] Header 未读角标实时更新
- [x] 全部标记已读
- [x] 点击通知跳转 + 标记已读
- [x] 轮询新通知
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过