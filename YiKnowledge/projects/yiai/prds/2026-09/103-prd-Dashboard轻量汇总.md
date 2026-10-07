---
title: "YA-103-需求: Dashboard 轻量汇总 — YiPet/YiVad 跨项目健康概览"
tags: [需求, dashboard, 跨项目, YiPet, 轻量API, 健康概览]
category: 项目/管理后台/需求
created: 2026-09-23
updated: 2026-09-23
source: internal
type: 需求
status: 已完成
roles: [engineer, product]
---

# YA-103: Dashboard 轻量汇总

## 一、需求背景

YiVad 首页和 YiPet 弹窗都需要项目健康概览，但需求层级不同：

- **YiVad 首页**：需要完整 KPI 面板（状态分布、人员负载、知识动态）
- **YiPet 弹窗**：只需要轻量概览（活跃项目数、开放 Bug 数、项目健康度）

之前 YiAi 只提供重型 dashboard 端点（/dashboard/health 返回全子系统状态），无专门的轻量汇总端点。

## 二、解决方案

### `/dashboard/summary` 端点

```json
GET /dashboard/summary
Cache-Control: public, max-age=15

{
  "active_projects": 4, "total_issues": 145,
  "open_issues": 23, "open_bugs": 8,
  "today_done": 12, "overdue": 3, "blocked": 1,
  "chat_sessions": 56, "knowledge_files": 320,
  "projects": [
    {"key": "yivad", "open_issues": 5, "open_bugs": 2, "health": "healthy"},
    {"key": "yiai", "open_issues": 3, "open_bugs": 1, "health": "warning"}
  ]
}
```

**设计原则**：
- 并行 MongoDB 查询（asyncio.gather）— < 100ms 响应
- 15s Cache-Control — 减少重复查询
- 每项目健康度自动计算（critical: >3 overdue, warning: >1, healthy）
- 空数据优雅降级（返回 0 值）

### 消费方

| 项目 | API | 用途 |
|------|-----|------|
| YiPet | `dashboard.getSummary()` | Popup 健康概览 widget |
| YiVad | `GET /dashboard/summary` | 轻量轮询备选 |

## 三、验收标准

- [x] 响应包含 per-project health 字段
- [x] 所有并行查询在 5s 内完成
- [x] MongoDB 不可用时不抛异常
- [x] YiPet API 层类型完整
- [x] YiPet typecheck + test 通过

## 四、关联文档

| 文档 | 路径 |
|------|------|
| 开发方案 | [238-task-Dashboard轻量汇总端点](../devs/2026-09/238-task-Dashboard轻量汇总端点.md) |
| 测试方案 | [238-test-Dashboard轻量汇总端点](../devs/2026-09/238-test-Dashboard轻量汇总端点.md) |