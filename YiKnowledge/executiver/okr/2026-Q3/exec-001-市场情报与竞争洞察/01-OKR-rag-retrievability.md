---
title: KR 证据 — RAG 可检索性
aliases: [kr-exec-001-rag-retrievability, kr-rag-retrievability]
tags: [okr, kr, executiver, market-intel, rag]
category: executiver/okr/2026-Q3/exec-001-市场情报与竞争洞察
created: 2026-08-18
updated: 2026-09-10
last_verified: 2026-09-10
source: internal
type: okr-kr-evidence
lifecycle: active
status: active
review_cycle: quarterly
roles: [executiver]
kr_id: kr-exec-001-rag-retrievability
parent_goal: exec-001
progress: 70
related:
  - ./goal.md
  - ../../industry/README.md
---

# KR4: RAG 可检索性 — 70% 🔶

竞品与行业信息可被 RAG 检索，过时条目标记 deprecated。确保市场情报不仅是静态文档，而是可以被 AI 实时检索和利用的活知识。

## KR 详情

| 字段 | 值 |
|---|---|
| KR | 竞品与行业信息可被 RAG 检索，过时条目标记 deprecated |
| 目标 | [exec-001: 市场情报与竞争洞察](./goal.md) |
| 进度 | 70% -- 进行中 |

## 达标明细

| 要求 | 状态 | 说明 |
|---|---|---|
| 竞品和行业信息已纳入 RAG 检索范围 | ✅ 完成 | YiAi 知识监视器已扫描并索引所有 industry/ 文件 |
| `last_verified` 超过 6 个月的条目标记 `status: deprecated` | ✅ 完成 | 当前所有文件均在 6 个月窗口内 |
| 月度审查机制已建立 | ✅ 完成 | 每月 1 日扫描全量文件 `last_verified` |
| RAG 检索质量测试 | 🚧 进行中 | 待建立检索质量指标（命中率，准确率）和定期测试流程 |
| 检索反馈循环 | 🚧 规划中 | 收集 RAG 检索的点击率和满意度，反馈优化索引策略 |

## 后续计划

- [ ] 定义 RAG 检索质量标准：检索命中率 > 80%，前 3 结果准确率 > 90%
- [ ] 建立季度 RAG 检索测试流程
- [ ] 指标数据同步到 YiVad 前端仪表盘

## 内容目录

- [../../industry/README.md](../../industry/README.md) — 行业情报总览
- [../../industry/](../../industry/) — 行业情报总目录