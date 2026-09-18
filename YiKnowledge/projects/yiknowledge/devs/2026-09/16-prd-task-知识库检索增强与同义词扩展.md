---
doc_type: module
prd_task_id: "YK-09-13"
title: "YK-09-13: 知识库检索增强 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "16-架构设计-知识库检索增强与同义词扩展.md"
source_okr: [yiknowledge-001]
related_tests: ["16-prd-test-知识库检索增强与同义词扩展"]
---

# YK-09-13: 知识库检索增强 — 开发方案

> 来源 PRD：[16-架构设计-知识库检索增强与同义词扩展.md](../../prds/2026-09/16-架构设计-知识库检索增强与同义词扩展.md)
> 需求编号：YK-09-13 · 优先级：P2 · 人天：1.0d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW）。

---

## 一、架构总览

从 YiKnowledge 视角定义同义词映射规则，补充 yiai YA-09-01 的通用同义词引擎。知识库策展人维护领域特化的同义词表（如"RAG"↔"检索增强生成"），RAG 检索时自动扩展查询。

### 文件清单

```
YiKnowledge/
├── curator/governance/
│   └── synonyms.json           # 【新增】领域同义词映射表
YiAi/src/domain/knowledge/
└── watcher.py                  # 【修改】扫描 synonyms.json 写入 MDB
```

## 二、关键技术决策

- **领域隔离**：YiKnowledge 同义词与 YiAi 通用同义词分表存储（`knowledge_synonyms` vs `synonym_dictionaries`），检索时合并
- **JSON 格式**：`{"RAG": ["检索增强生成", "Retrieval Augmented Generation"]}`，策展人可手动编辑

## 三、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 初始同义词映射（50 对领域术语） | 0.3 |
| 2 | KnowledgeWatcher 扫描 synonyms.json → MDB | 0.3 |
| 3 | RAG 检索集成（查询扩展） | 0.2 |
| 4 | 测试 | 0.2 |

**总计：1.0d**

## 四、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | 同义词自动发现 | P3 | 当前手工维护，基于查询日志的共现分析待实现 | 待实施 |

---