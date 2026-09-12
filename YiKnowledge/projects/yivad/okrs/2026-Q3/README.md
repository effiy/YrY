---
doc_type: index
title: 2026-Q3 项目 OKR 索引
category: 项目/管理后台/OKR
created: 2026-09-11
updated: 2026-09-11
project: YiVad
---

# 2026-Q3 项目 OKR 索引

> 与 YiVad 项目相关的 OKR 目标和关键结果。OKR 源文件按角色存储在 `YiKnowledge/{role}/okr/2026-Q3/` 中。

## OKR → PRD 可追溯矩阵

| Goal ID | 目标 | 进度 | 关联 PRD | 关联 Dev 模块 |
|---------|------|------|----------|-------------|
| yivad-001 | Project 页面架构重构 | 100% | [YV-09-01](../../prds/2026-09/00-prd-需求总览.md), [YV-08-01](../../prds/2026-08/00-prd-需求总览.md) | YV-09-01-1, YV-09-01-2, YV-09-01-3 |
| yivad-002 | 文档职责分离与知识关联 | 70% | [YV-09-01](../../prds/2026-09/00-prd-需求总览.md) | YV-09-01-4, YV-09-01-12 |
| yivad-003 | 全项目视图优化与体验提升 | 85% | [YV-09-01](../../prds/2026-09/00-prd-需求总览.md) | YV-09-01-6, YV-09-01-9~21 |

## 关联角色 OKR 一览

| Goal ID | 目标 | 角色 | 进度 | 关联项目 |
|---------|------|------|------|----------|
| eng-001 | 代码编写与调试自闭环 | engineer | 100% | YiVad |
| eng-005 | 构建健康归零 | engineer | — | YiVad |
| prod-001 | 需求评审可闭环 | producter | 100% | YiAi |

## 目录规范

```
okrs/{quarter}/
├── README.md                  # 本索引 + OKR→PRD 可追溯矩阵
├── goal-001-{描述}.md         # OKR 目标文件（含 related_prds）
├── goal-002-{描述}.md
└── goal-003-{描述}.md
```

> 角色级 OKR 详细内容参见 `YiKnowledge/{role}/okr/2026-Q3/{goal-id}/goal.md`