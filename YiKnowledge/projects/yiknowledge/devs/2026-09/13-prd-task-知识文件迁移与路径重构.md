---
doc_type: module
prd_task_id: "YK-09-10"
title: "YK-09-10: 知识文件迁移与路径重构 — 开发方案"
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
source_prd: "13-架构设计-知识文件迁移与路径重构.md"
source_okr: [yiknowledge-001]
related_tests: ["13-prd-test-知识文件迁移与路径重构"]
---

# YK-09-10: 知识文件迁移与路径重构 — 开发方案

> 来源 PRD：[13-架构设计-知识文件迁移与路径重构.md](../../prds/2026-09/13-架构设计-知识文件迁移与路径重构.md)
> 需求编号：YK-09-10 · 优先级：P2 · 人天：1.0d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW）。

---

## 一、架构总览

文件迁移时自动更新全库交叉引用 + 创建重定向标记文件，保护引用完整性。组件：

- **迁移脚本**：`git mv` + 引用扫描替换 + 重定向文件生成
- **重定向文件**：`.md.redirect` 空文件（内容 `redirect: <new_path>`），KnowledgeWatcher 读取时自动追踪新路径
- **RAG 更新**：迁移后更新 MDB `knowledge_files` 的 path 字段

## 二、关键技术决策

### D-01：重定向文件而非 HTTP 301

不同于 HTTP，Markdown 知识库无服务端路由。重定向通过创建 `.md.redirect` stub 文件实现——原路径留一个标记文件，KnowledgeWatcher 扫描时追踪到新路径，更新 MDB 和索引。

### D-02：引用更新排除外部 URL

仅更新 `](./relative/path.md)` 形式的内部引用。`http(s)://` 开头的绝对 URL 和 `/absolute/path` 不处理。

---

## 三、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 迁移脚本（git mv + 引用扫描替换） | 0.3 |
| 2 | 重定向文件生成 + KnowledgeWatcher 支持 | 0.3 |
| 3 | RAG 索引更新 | 0.2 |
| 4 | 集成测试 | 0.2 |

**总计：1.0d**

---

## 四、实现完成记录

> **状态**：需求已编写，尚未开始实施。

---

## 五、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | 重定向链追踪（A→B→C） | P3 | 当前仅支持 1 跳重定向 | 待实施 |
| 2 | 重定向文件清理 | P3 | 重定向超过 90 天后自动删除 | 待实施 |

---