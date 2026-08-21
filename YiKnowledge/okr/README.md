---
title: OKR Knowledge Base
tags: [okr, self-closed-loop, index]
category: okr
created: 2026-08-16
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
status: active
lifecycle: active
review_cycle: quarterly
roles: [executiver, producter, leader, engineer, srer, aier, curator]
related:
  - ./2026-Q3/INDEX.md
  - ../INDEX.md
---

# OKR Knowledge Base

> **北极星**: AI 从需求到上线全流程自闭环。
> 本目录承载 7 角色 OKR 的知识库镜像 + 每一次完整闭环的流程记录。

## 目录结构

```
okr/
├── README.md                  ← 你在这里
└── 2026-Q3/
    ├── INDEX.md               ← Q3 OKR 总索引
    ├── README.md              ← Q3 OKR 概览
    ├── goals/                 ← 11 目标 + 20 指标 + 11 KR 证据（7 角色）
    │   ├── executiver/        ← 3 目标 + 5 指标 + 11 KR 证据 + README/INDEX
    │   ├── producter/         ← 1 目标 + 2 指标
    │   ├── leader/            ← 1 目标 + 2 指标
    │   ├── engineer/          ← 2 目标 + 3 指标
    │   ├── srer/              ← 1 目标 + 2 指标
    │   ├── aier/              ← 2 目标 + 3 指标
    │   └── curator/           ← 1 目标 + 3 指标
    ├── loop/                  ← 2 条闭环流程记录
    │   ├── INDEX.md           ← 闭环整合索引
    │   ├── _templates/        ← 8 类记录模板
    │   ├── loop-001-*/        ← 闭环 1：全流程自闭环
    │   └── loop-002-*/        ← 闭环 2：模板编排
    └── 2026-08/               ← 月度活动记录
```

## 7 角色 OKR 总览

| Role | Goals | Metrics | KR Evidence |
|---|---|---|---|
| [executiver](./2026-Q3/goals/executiver/README.md) | 3 | 5 | 11 |
| [producter](./2026-Q3/goals/producter/) | 1 | 2 | — |
| [leader](./2026-Q3/goals/leader/) | 1 | 2 | — |
| [engineer](./2026-Q3/goals/engineer/) | 2 | 3 | — |
| [srer](./2026-Q3/goals/srer/) | 1 | 2 | — |
| [aier](./2026-Q3/goals/aier/) | 2 | 3 | — |
| [curator](./2026-Q3/goals/curator/) | 1 | 3 | — |
| **Total** | **11** | **20** | **11** |

## 数据源关系

- **事实源**：OKR 定义在 YiVad `src/views/knowledge/executiver/okrData.ts`（UI 直接读取）。
- **本目录**：`goals/` 是 OKR 的知识库镜像（供 RAG 检索），`loop/` 是流程记录的单一事实源。
- **展示**：YiVad「流程记录」页（`/executiver/process`）只读扫描 `loop/` 目录聚合展示。

## 快速导航

| 想了解 | 看这里 |
|---|---|
| Q3 OKR 全局概览和索引 | [2026-Q3/INDEX.md](./2026-Q3/INDEX.md) |
| Executiver 角色 OKR 详情 | [2026-Q3/goals/executiver/README.md](./2026-Q3/goals/executiver/README.md) |
| 有哪些闭环、每条闭环五类记录 | [2026-Q3/loop/INDEX.md](./2026-Q3/loop/INDEX.md) |
| 7 角色 OKR（goals + metrics + KR 证据） | [2026-Q3/goals/](./2026-Q3/goals/) |
| 如何复用记录模板 | [2026-Q3/loop/_templates/](./2026-Q3/loop/_templates/) |

## 如何新增一条闭环

1. 复制 `loop/_templates/` 模板到 `loop/loop-XXX-<slug>/`。
2. 改 frontmatter（`loopId` / `title` / `goalId` / `status` / 日期）。
3. 填正文，保证 `type: loop-record` + 5 类 stage 枚举合规。
4. YiVad「流程记录」页自动聚合展示。