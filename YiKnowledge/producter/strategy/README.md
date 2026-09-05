---
title: 案例研究 / 行业用例
aliases: [use-cases-leaf-readme, use-cases-readme, industry-cases]
tags: [leaf, industry, use-cases]
category: producter/strategy
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles: [producter, aier]
benefit: "PM 可以通过清晰的指导、可操作的步骤和已知的反模式来理解和应用案例研究 / 行业用例"
acceptance_criteria:
  - "叶子目录范围边界清晰"
  - "文件清单表完整，包含一句话描述"
  - 包含与相关叶子目录和父级 INDEX 的交叉引用
related:
  - ../../aier/方法/README.md
  - ../../engineer/learn/projects/yiai/README.md
  - ../../aier/机器学习/find-ai-deployment-cases.md
  - ../../curator/治理/tacit-knowledge-backlog.md
  - ../../executiver/industry/
---

# 案例研究 / 行业用例

> **作为**产品经理，**我想要**理解并应用案例研究 / 行业用例，**以便**将经过验证的模式和经验教训应用到我们的产品中。

> AI 和产品实施案例研究。**当前为隐性知识缺口** — 客户行业洞察（每个条目聚焦客户的业务模式）尚未积累（参见 [T008](../../curator/治理/tacit-knowledge-backlog.md)）。

## 收录范围

- AI 客服实施案例研究
- AI 售后实施案例研究（关联 YiAi）
- RAG + Agent 企业实施案例研究
- 客户行业洞察（聚焦客户业务模式）
- 案例研究调研模板

## 文件类型与命名

- `*-summary.md` / `*-cases.md`：案例研究摘要（背景 + 方案 + 效果 + 经验教训）
- `*-original.md`：原始文档
- `case-study-template.md`：案例研究调研模板

## 已收录

| file | content | status |
|---|---|---|
| [ai-customer-service-cases.md](./ai-customer-service-cases.md) | AI 客服实施案例研究 | active |
| [ai-after-sales-cases.md](./ai-after-sales-cases.md) | AI 售后实施案例研究（关联 YiAi） | active |
| [case-study.md](./case-study.md) | 案例研究调研模板 | reference |
| [overseas-brd-case-study.md](./overseas-brd-case-study.md) | 海外售后 BRD agent 案例研究 — 架构、评估结果、合规流程、生产经验 | active |
| [rag-agent-case-study.md](./rag-agent-case-study.md) | RAG + Agent 企业实施案例研究 — 混合搜索、评估框架、agent loop 模式 | active |
| [customer-industry-insight.md](./customer-industry-insight.md) | 客户行业洞察方法论 — 访谈框架、竞争情报、Porter 五力模型、PESTLE | active |

## 推荐撰写结构

1. 背景（客户业务、痛点）
2. 方案（技术栈、架构、流程）
3. 效果（量化指标）
4. 经验教训与收获
5. 来源与验证日期

## 相关叶子目录

- [../../aier/方法](../../aier/方法) — AI 方法论
- [../../engineer/learn/projects/yiai](../../engineer/learn/projects/yiai) — YiAi 实施
- [../../aier/机器学习/find-ai-deployment-cases.md](../../aier/机器学习/find-ai-deployment-cases.md) — 场景入口
- [../../curator/治理/tacit-knowledge-backlog.md](../../curator/治理/tacit-knowledge-backlog.md) — 客户洞察 T001/T008