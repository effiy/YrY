---
doc_type: prd
title: 通知中心
tags: [通知, SSE, 实时推送, 消息中心]
category: 项目/管理后台/需求
created: '2026-09-09'
updated: '2026-09-15'
source: internal
type: 需求
status: 已完成
implementation_progress: 已全部实现并测试通过
implementation_updated: '2026-09-15'
priority: 中
project: YiVad
project_id: yivad
owner: 陈铭
prd_month: '202609'
prd_task_id: YV-09-27
estimate_frontend: 1.5
review_status: 已评审
issue_type: 功能
roles: [engineer, designer]
source_okr: [yivad-003]
---

# 通知中心

> 需求编号：YV-09-27 · 优先级：中 · 人天：1.5d

> **文档职责**：本文档定义**要做什么、为什么做、做到什么程度算完成**（WHAT / WHY），不含实现方案与测试用例。
> 实现方案见 [开发方案](../../devs/2026-09/10-prd-task-通知中心.md)，验证方案见 [测试方案](../../tests/2026-09/10-prd-test-通知中心.md)。


## 目录

- [一、背景](#sec-1)
- [二、目标](#sec-2)
- [三、功能需求](#sec-3)
- [四、通知类型与触发事件](#sec-4)
- [五、验收标准](#sec-5)

---

---

<a id="sec-1"></a>
## 一、背景

YiVad 缺少统一的通知中心，用户无法及时获知 Issue 分配、Bug 状态变更、@提及等关键事件。需要在全局 header 中提供通知铃铛入口，通过 SSE 实时推送通知，支持标记已读和偏好管理。

<a id="sec-2"></a>
## 二、目标

1. **实时通知**：SSE 连接推送，Bell 图标 + 未读 Badge
2. **分类管理**：系统/用户操作/AI/错误四类通知，按类型筛选
3. **偏好控制**：用户可控制接收哪些类型的通知，支持免打扰时段

<a id="sec-3"></a>
## 三、功能需求

| 编号 | 需求 | 说明 |
|------|------|------|
| FR-10.1 | Bell 图标 + Badge | Header 通知铃铛，未读数实时更新 |
| FR-10.2 | SSE 实时连接 | 连接到 `/notification/stream`，断线自动重连（最多 10 次） |
| FR-10.3 | 通知面板 | 下拉面板，按优先级排序（urgent > high > medium > low） |
| FR-10.4 | 通知类型 | system / user_action / ai / error 四种类型 |
| FR-10.5 | 点击跳转 | 通知可绑定 actionUrl，点击跳转到目标页 |
| FR-10.6 | 标记已读 | 单条已读 + 全部已读 |
| FR-10.7 | 类型过滤 | 按通知类型筛选显示 |
| FR-10.8 | 通知偏好 | 控制接收哪些类型的通知，localStorage 持久化 |
| FR-10.9 | 免打扰时段 | 可配置时间段，期间不弹出通知 |
| FR-10.10 | 浏览器通知 | 页面不可见时通过 Web Notification API 弹出系统通知 |
| FR-10.11 | 通知上限 | 最多缓存 100 条，超出自动清理旧通知 |

<a id="sec-4"></a>
## 四、通知类型与触发事件

| 类型 | 触发事件 | 内容示例 |
|------|---------|---------|
| `system` | 系统公告/维护通知 | 「系统将于 22:00 进行维护」 |
| `user_action` | Issue 分配/Bug 状态变更 | 「陈铭 将 Bug #123 分配给你」 |
| `ai` | AI 分析完成/建议 | 「代码审查报告已生成」 |
| `error` | 系统错误/服务异常 | 「数据同步失败，请稍后重试」 |

<a id="sec-5"></a>
## 五、验收标准

- Bell 图标实时显示未读数量
- SSE 连接断线后 5s 自动重连，最多 10 次
- 通知列表按优先级排序，点击跳转到目标页
- 标记已读/全部已读生效
- 免打扰时段内不接收通知
- 页面不可见时（切换到其他 Tab），Web Notification 弹出系统通知

---

> **文档边界**：本文档定义 WHAT/WHY。实现细节见[开发方案](../../devs/2026-09/10-prd-task-通知中心.md)，测试用例见[测试方案](../../tests/2026-09/10-prd-test-通知中心.md)。
