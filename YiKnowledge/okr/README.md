---
title: OKR Knowledge Base
tags: [okr, self-closed-loop, index]
category: okr
created: 2026-08-16
updated: 2026-08-16
source: internal
type: summary
status: active
lifecycle: active
review_cycle: quarterly
roles: [executiver, producter, leader, engineer, srer, aier, curator]
---

# OKR Knowledge Base

> 北极星：**AI 从需求到上线全流程自闭环**。
> 本目录承载 7 角色 OKR 的知识库镜像 + 每一次完整闭环的流程记录。

## 目录结构（2026-Q3）

```
okr/2026-Q3/
├── goals/            # 10 个目标（type: okr-goal）—— 7 角色 OKR 镜像
├── metrics/          # 18 个指标（type: okr-metric）
└── loop/             # 流程记录（核心）
    ├── INDEX.md      # 闭环整合索引 ← 从这里进入
    ├── _templates/   # 5 类记录模板（type: loop-template）
    └── loop-001-*/   # 每条闭环：需求评审 → 技术评审 → 构建调试 → 测试报告 → 上线
```

## 数据源关系

- **事实源**：OKR 定义在 YiVad `src/views/knowledge/executiver/okrData.ts`（UI 直接读取）。
- **本目录**：`goals/`、`metrics/` 是 OKR 的知识库镜像（供 RAG 检索），`loop/` 是流程记录的单一事实源。
- **展示**：YiVad「流程记录」页（`/executiver/process`）只读扫描 `loop/` 目录聚合展示。

## 快速导航

| 想了解 | 看这里 |
|---|---|
| 有哪些闭环、每条闭环五类记录 | [loop/INDEX.md](./2026-Q3/loop/INDEX.md) |
| 7 角色目标（goals 镜像） | [goals/](./2026-Q3/goals/) |
| 18 个指标（metrics 镜像） | [metrics/](./2026-Q3/metrics/) |
| 如何复用记录模板 | [loop/_templates/](./2026-Q3/loop/_templates/) |

## 如何新增一条闭环

1. 复制 `loop/_templates/` 模板到 `loop/loop-XXX-<slug>/`。
2. 改 frontmatter（`loopId` / `title` / `goalId` / `status` / 日期）。
3. 填正文，保证 `type: loop-record` + 5 类 stage 枚举合规。
4. YiVad「流程记录」页自动聚合展示。
