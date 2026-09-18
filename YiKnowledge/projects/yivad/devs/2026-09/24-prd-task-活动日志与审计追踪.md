---
doc_type: module
prd_task_id: "YV-09-50"
title: "YV-09-50: 活动日志与审计追踪 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "24-prd-活动日志与审计追踪.md"
---

# YV-09-50: 活动日志与审计追踪 — 开发方案

> 需求编号：YV-09-50 · 人天：1.0d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

记录用户关键操作（创建/编辑/删除/导出），在活动日志页面展示，支持按操作类型、时间范围、用户筛选。

### 审计事件

| 事件 | 触发操作 | 记录内容 |
|------|---------|---------|
| `document.create` | 创建文档 | 集合名、文档 ID、时间 |
| `document.update` | 更新文档 | 集合名、变更字段、时间 |
| `document.delete` | 删除文档 | 集合名、文档 ID、时间 |
| `file.write` | 写入文件 | 文件路径、大小、时间 |
| `auth.login` | 用户登录 | IP、UserAgent、时间 |

### 数据模型

```typescript
interface AuditLog {
  _id: string;
  userId: string;
  username: string;
  action: "document.create" | "document.update" | "document.delete" | "file.write" | "auth.login";
  target: { cname?: string; docId?: string; filePath?: string };
  detail: Record<string, unknown>;
  ip: string;
  userAgent: string;
  timestamp: string;
}
```

### 实施步骤：1.0d

| 步骤 | 内容 |
|------|------|
| 1 | auditService API (查询 + 筛选) |
| 2 | 活动日志页面 (ProTable + 多维筛选 + 详情弹窗) |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 5 种审计事件记录
- [ ] 日志页 ProTable 渲染 + 筛选
- [ ] 详情弹窗显示完整审计信息

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
|---|--------|--------|---------|------|------
---

## 源码索引

> 此特性为轻量级功能（1.0d），前端主要为数据展示层。

| 文件 | 说明 | 文件路径 |
|------|------|------|
| — | 参见对应 PRD 涉及文件 | — |

---

## 实现完成记录

> **状态**：已完成（1.0d 轻量特性）· **复核日期**：2026-09-15

### 产出

| 分类 | 说明 |
|------|------|
| 类型 | 前端数据展示（数据由 YiAi 后端提供服务） |
| 测试 | 见 [测试方案](../../tests/2026-09/24-prd-test-活动日志与审计追踪.md) |

---

## 代码审查检查清单

- [x] 数据展示与后端接口契约一致
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过
