---
prd_task_id: "YV-09-203"
title: "YV-09-203: 用户数据导出 — 开发方案"
status: 已完成
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.25
source_prd: "77-prd-用户数据导出.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 用户数据导出]
roles: [engineer]
benefit: "开发方案：task-用户数据导出"
lifecycle: active
---

# YV-09-203: 用户数据导出 — 开发方案

> 需求编号：YV-09-203 · 人天：0.25d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `DataExport.vue` | 数据导出页面 | `src/views/settings/` |
| `ExportRequestCard.vue` | 导出请求卡片（创建/状态/下载） | `src/components/user/` |
| `exportStore.ts` | 导出任务状态管理 | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

用户可导出个人数据（GDPR 合规）：个人信息/会话/创建内容，JSON/CSV 格式。

### 架构方案

**技术路线**：独立路由页面 `/settings/export`。导出为异步任务——用户创建导出请求后，YiAi 后端异步聚合数据并生成文件，完成后邮件通知下载链接。前端轮询导出状态并展示进度。

**导出流程**：
```
用户选择导出范围 + 格式
  → POST YiAi export_service.request_export
  → 返回 task_id
  → 前端开始轮询 GET export_service.task_status(task_id) (每 5s)
  → YiAi 后端异步: 查询 users + sessions + issues + bugs → 聚合 JSON/CSV
  → 完成: 上传到 OSS → 生成签名下载链接 → 邮件通知用户
  → 前端: 状态更新为 completed → 显示下载按钮
  → 下载链接 24h 有效
```

**组件树**：
```
DataExport.vue (页面容器)
├── ExportScopeSelector.vue (复选框: 个人信息/会话/内容/日志)
├── ExportFormatSelector.vue (radio: JSON/CSV)
├── ExportRequestCard.vue (导出请求状态卡片)
│   ├── pending: 灰色 + "正在生成..." + 进度条
│   ├── completed: 绿色 + 下载按钮 + "链接 24h 内有效"
│   └── failed: 红色 + 错误信息 + 重试按钮
└── ExportHistory.vue (ProTable: 历史导出记录)
```

**关键决策**：
- 异步生成：导出涉及多表查询（users + sessions + issues + bugs），不阻塞前端
- 轮询间隔：5s（导出预计耗时 30s-2min），轮询最多 5min 后超时提示
- 下载链接有效期：24h（安全考虑），过期后需重新请求导出
- 格式支持：JSON（完整结构化数据）+ CSV（表格化，适合 Excel 打开）
- GDPR 合规：导出内容包含个人信息、会话记录、创建内容、活动日志 4 类

### 导出内容

| 数据 | 来源集合 | 格式 |
|------|---------|------|
| 个人信息 | `users` | 姓名/邮箱/部门/职位 |
| 会话记录 | `sessions` (按 user_id 过滤) | AI 聊天历史（含时间戳） |
| 创建内容 | `issues` + `bugs` (按 reporter 过滤) | Issue/Bug 标题/状态/时间 |
| 活动日志 | `activity_log` (按 user_id 过滤) | 操作类型/目标/时间 |

### 实施步骤：0.25d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | ExportScopeSelector + ExportFormatSelector | 复选框+radio 渲染 | 0.04 |
| 2 | 创建导出请求 → API 调用 → task_id | API 调用成功 | 0.06 |
| 3 | 轮询状态 + ExportRequestCard 状态展示 | pending→completed→download | 0.08 |
| 4 | ExportHistory ProTable | 列表+下载+重试 | 0.04 |
| 5 | 下载链接过期处理 + 错误重试 | 过期提示+重试按钮 | 0.03 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 4 种数据类型复选框 + JSON/CSV 格式选择
- [ ] 创建导出请求 → 轮询状态（每 5s）→ 完成后显示下载按钮
- [ ] pending/completed/failed 三种状态正确展示
- [ ] 下载链接 24h 过期后提示重新请求
- [ ] 导出失败时显示错误信息 + 重试按钮
- [ ] ExportHistory ProTable 展示历史导出记录
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
| 页面 | 1 | DataExport.vue |
| 组件 | 1 | ExportRequestCard.vue |
| Store | 1 | exportStore (导出任务状态) |
| 测试 | 1 | 见测试方案 |

---

## 代码审查检查清单

- [x] 4 种数据类型选择 + 格式选择
- [x] 异步导出 → 轮询状态 → 下载按钮
- [x] 三种状态卡片正确展示
- [x] 下载链接过期处理
- [x] 失败重试机制
- [x] ExportHistory 列表
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过