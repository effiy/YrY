---
title: 阅读清单
aliases:
- reading-list
- resources-reading-list
tags:
- leaf
- resources
- reading-list
- moc
category: executiver/reading-list
created: '2026-08-03'
updated: '2026-08-18'
last_verified: '2026-08-18'
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: monthly
roles:
- executiver
benefit: "高管可以维护精选阅读清单以持续学习，通过读书笔记和模板捕捉可操作的洞察"
acceptance_criteria:
- 叶子目录范围边界清晰
- 文件清单表完整，包含一句话描述
- 包含与相关叶子目录和父级 INDEX 的交叉引用
related:
- ./reading-list.md
- ./reading-notes.md
- ./reading-note-high-output-management.md
- ../../curator/治理/README.md
- ../../curator/templates/README.md
- ../../aier/README.md
- ../../aier/方法/提示词/README.md
- ../../engineer/build/README.md
---

# 阅读清单

> **作为**高管，**我想要**维护精选阅读清单，**以便**持续学习并保持对行业趋势的领先。
> 收集待读或已读的文章、书籍和论文。具有沉淀价值的已读内容提炼到对应的语义叶子目录（`methodology/` `tech/`）；本叶子目录仅作为清单和读书笔记索引。

## 范围

- 月度阅读清单（滚动更新）
- 读书笔记摘要
- 论文阅读笔记
- 长篇阅读笔记

## 文件清单

| File | Type | One-liner |
|---|---|---|
| [reading-list.md](./reading-list.md) | summary | 2026 年月度滚动阅读清单，含状态追踪和积压 |
| [reading-notes.md](./reading-notes.md) | template | 读书笔记模板，含 5 节结构和字段指导 |
| [reading-note-high-output-management.md](./reading-note-high-output-management.md) | summary | Andy Grove《High Output Management》— 关键框架和行动启示 |

## 工作流

```
新文章/书籍捕获 → curator/治理/ → 阅读 → 用 reading-notes 模板记录笔记
→ 有沉淀价值 → 提炼到对应语义叶子目录（方法/tech/strategy/...）
→ 笔记的 related 字段指向最终落地位置
```

### 详细步骤

1. **捕获**：将候选阅读添加到 [reading-list.md](./reading-list.md) 的积压中
2. **优先级排序**：每月审查 — 将最高优先级条目从积压移至当月
3. **阅读并记录**：使用 [reading-notes.md](./reading-notes.md) 模板记录结构化笔记
4. **沉淀**：在 1 周内将可操作洞察提炼到对应语义叶子目录
5. **审查**：每季度审查读书笔记，识别跨领域模式

## 推荐结构（读书笔记）

1. **一句话核心观点** — 用一句话概括作者的核心论点
2. **关键章节摘要** — 表格：核心论证 + 关键证据 + 引用亮点
3. **行动启示** — 本团队工作可以借鉴的内容，立即可操作的条目
4. **引用亮点** — 令人难忘或发人深省的引用
5. **沉淀目的地** — 表格追踪哪些观点已提炼到哪个 YiKnowledge 文件

## 相关叶子目录

- [../../curator/治理/README.md](../../curator/治理/README.md) — 知识生命周期治理、inbox、分类和审查流程
- [../../curator/templates/README.md](../../curator/templates/README.md) — 可复用文档模板（PRD、BRD、ADR 等）
- [../../aier/README.md](../../aier/README.md) — AI 工程资源，用于技术提炼
- [../../aier/方法/提示词/README.md](../../aier/方法/提示词/README.md) — 内容创作的辅助提示词
- [../../engineer/build/README.md](../../engineer/build/README.md) — 构建和开发资源

## 导航

- 父级：[../README.md](../README.md) — Executiver 角色概览
- 索引：[../INDEX.md](../INDEX.md) — Executiver 角色索引
- 角色主页：[../../INDEX.md](../../INDEX.md) — YiKnowledge 根索引