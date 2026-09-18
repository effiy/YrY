---
doc_type: test
title: "YK-09-10: 知识文件迁移与路径重构 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-10"
source_prds: ["13-架构设计-知识文件迁移与路径重构"]
source_modules: ["13-prd-task-知识文件迁移与路径重构"]
source_okr: [yiknowledge-001]
---

# YK-09-10: 知识文件迁移与路径重构 — 测试用例

> 来源 PRD：[13-架构设计-知识文件迁移与路径重构.md](../../prds/2026-09/13-架构设计-知识文件迁移与路径重构.md)
> 需求编号：YK-09-10 · 优先级：P2

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-MG-01 | 引用扫描替换 | `](./old.md)` → `](./new.md)` |
| UT-MG-02 | 外部 URL 不处理 | `](https://example.com)` 不变 |
| UT-MG-03 | 重定向文件内容 | `redirect: <new_path>` |
| UT-MG-04 | KnowledgeWatcher 读取 `.redirect` | 追踪到新路径，更新 MDB path |

---

## 二、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-MG-01 | 迁移 → 引用更新 → 重定向 → RAG 索引 | 全链路：原路径可访问、引用全部更新、MDB path 正确 |
| IT-MG-02 | RAG 检索更新后的文档 | 按旧关键词检索仍能找到（redirect 追踪生效） |

---

## 三、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 迁移后引用断裂（死链） |
| S2 — 一般 | 重定向文件未生成 |

---