---
doc_type: prd
prd_task_id: "YA-09-238"
title: "YiAi Dashboard 轻量汇总端点 — 需求规格"
tags: [需求文档, YiAi, Dashboard, 轻量端点, YiPet, 跨项目, 项目健康]
category: projects/yiai/prds
created: 2026-09-23
updated: 2026-09-23
source: internal
type: 需求
status: 已完成
priority: P1
project: YiAi
project_id: yiai
owner: Chengliang.Yi
prd_month: "202609"
estimate_backend: 0.3
review_status: 已评审
issue_type: 跨项目集成
roles: [engineer]
acceptance_criteria:
  - /dashboard/summary 端点返回项目健康概览
  - YiPet DashboardSummary 组件正常消费
  - 15s 缓存 + ETag 支持
  - 空数据优雅降级
related_modules: ["YA-09-238"]
related_tests: ["YA-09-238"]
---

# YiAi Dashboard 轻量汇总端点 — 需求规格

> 编号: YA-09-238 · 优先级: P1 · 工时: ~0.3d · 状态: 已完成

> **文档职责**: 定义面向 YiPet 弹窗的轻量 Dashboard 汇总 REST 端点。

---

## 一、背景

YiVad 首页需要完整 KPI 面板（5 统计卡片 + 进度条 + Today 概览），数据来自多个 MongoDB 集合的聚合查询。但 YiPet 浏览器扩展弹窗仅需要轻量的项目健康概览——加载完整首页数据既不必要也浪费带宽。

此前无专门的轻量端点，YiPet 直接调用 YiVad 同款重接口，导致:
- 弹窗加载慢（等待完整聚合计算）
- 数据传输量大（不需要的字段被返回）
- 无缓存（每次请求都重新计算）

## 二、功能需求

### FR-1: /dashboard/summary 端点

**文件**: `YiAi/src/server/routes/dashboard/summary.py` (新增)

**响应格式**:
```json
GET /dashboard/summary
{
  "active_projects": 4,
  "total_issues": 145,
  "open_issues": 23,
  "open_bugs": 8,
  "today_done": 12,
  "overdue": 3,
  "blocked": 1,
  "chat_sessions": 56,
  "knowledge_files": 320,
  "server_uptime": 86400,
  "projects": [
    {
      "key": "yivad",
      "name": "YiVad",
      "open_issues": 5,
      "open_bugs": 2,
      "health": "healthy"
    }
  ]
}
```

**性能特性**:
- 并行 MongoDB 查询 (`asyncio.gather`)
- 15s `Cache-Control: max-age=15` + `ETag` 条件请求
- 每项目健康度自动计算: `critical` (>3 overdue) / `warning` (>1) / `healthy`

### FR-2: 空数据降级

当 MongoDB 无数据时（新安装/开发环境）:
- 所有计数字段返回 0
- `projects` 数组为空
- `server_uptime` 为应用进程启动时间
- HTTP 200（非 404/500）

### FR-3: YiPet API 层消费

**文件**: `YiPet/src/api/services/dashboard.ts`

```typescript
const summary = await dashboard.getSummary();      // GET /dashboard/summary
const snapshot = await dashboard.getLiveSnapshot(); // GET /dashboard/live-snapshot
```

---

## 三、跨项目数据流

```
YiAi :10086
  /dashboard/summary (15s cache, ETag)
    ├── YiPet Popup → DashboardSummary.vue → 项目健康概览
    └── YiVad → 可选用轻量数据作为快速首屏渲染
```

---

## 四、验收标准

- [x] `GET /dashboard/summary` 返回正确格式
- [x] YiPet `DashboardSummary` 组件正常渲染
- [x] 15s 缓存头生效（浏览器 DevTools Network 面板验证）
- [x] ETag 条件请求返回 304
- [x] 空 MongoDB 场景返回 `total: 0` + 200 OK
- [x] YiPet `typecheck` 通过

---

## 五、影响范围

| 维度 | 影响 |
|------|------|
| YiPet | Popup 加载速度提升（轻量端点 vs 完整首页） |
| YiVad | 可选用此端点替代首页重接口 |
| API 契约 | 新增 REST 端点 |
| 向后兼容 | ✅ 纯新增 |