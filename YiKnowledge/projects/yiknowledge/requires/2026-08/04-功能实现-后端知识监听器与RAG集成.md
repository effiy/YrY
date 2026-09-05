---
title: 后端知识监听器与检索增强生成集成
tags: [功能, 检索增强生成, 人工智能, 集成, 向量搜索]
category: 问题/功能
created: 2026-08-10
updated: 2026-08-18
source: 内部
type: 问题
status: 已完成
priority: 高
问题type: 功能
project: YiKnowledge
project_id: yiknowledge
owner: 陈铭
estimate_points: 8
评审status: 已通过
prd_month: 202608
prd_task_id: 4
roles: [engineer]
---

# YiAi Knowledge Watcher and RAG Integration

## 基本信息

| 字段 | 值 |
|------|-----|
| 需求编号 | 4 |
| 项目 | YiKnowledge (知识库) |
| 代码仓库 | `YrY/YiKnowledge` |
| 功能模块 | AI 集成 |
| 优先级 | 高 |
| 人天 | 8.0d |
| 状态 | 已完成 |

### 功能概述

实现 YiAi 后端与 YiKnowledge 知识库的深度集成，包括文件监听器（Knowledge Watcher）、MongoDB 索引同步、llama_index RAG 引擎配置和混合检索优化。

### 技术实现

#### Knowledge Watcher

- 基于 `apscheduler` 每 60s 轮询 `YiKnowledge/` 目录树
- 解析 Markdown 文件的 YAML frontmatter + 正文
- 同步到 MongoDB `knowledge_files` 集合
- 增量更新：仅处理变更文件（基于文件修改时间）
- 支持全量重建索引

#### MongoDB 索引

- 集合：`knowledge_files`
- 索引字段：`title`、`tags`、`category`、`roles`、`lifecycle`、`status`、`created`、`updated`
- 全文索引：`title` + `body`（text index）
- 复合索引：`(category, lifecycle)`、`(roles, status)`

#### RAG 引擎配置

```yaml
rag:
  embed_model: "nomic-embed-text"     # Embedding 模型
  llm_model: "qwen3.5:4b"            # RAG 回答模型
  persist_dir: "./data/rag_store"     # 索引持久化目录
  top_k: 3                            # 检索返回条数
  chunk_size: 512                     # 分块大小
  chunk_overlap: 40                   # 分块重叠
  hybrid_retrieval_enabled: true      # 混合检索 (向量 + BM25)
  rerank_enabled: true                # LLM 重排序
  inline_citations_enabled: true      # 内联引用
  sentence_window_enabled: true       # 句子窗口检索
  hyde_enabled: true                  # HyDE 查询增强
```

#### 检索增强特性

- **HyDE (Hypothetical Document Embeddings)**：用 LLM 生成假设文档，再用其 embedding 检索
- **句子窗口检索**：检索相关句子及其上下文窗口
- **LLM 重排序**：对检索结果进行二次排序，提升相关性
- **内联引用**：RAG 回答中标注引用来源文件

#### 向量索引

- llama_index 构建 Vector Store Index
- 持久化存储：`data/rag_store/`
- 混合检索：向量相似度 + BM25 关键词匹配
- 支持按 `category` 和 `roles` 过滤检索范围

### 关联模块

- 配置文档：`docs/参考/YiAi_配置.md`
- 架构设计：`docs/架构/架构设计.md`
- YiAi 后端：`YiAi/services/knowledge/`、`YiAi/services/rag/`

### 验收标准

1. Knowledge Watcher 正确监听文件变更并同步到 MongoDB
2. 向量索引构建正确，检索结果准确
3. 混合检索（向量 + BM25）正常工作
4. HyDE 查询增强生效
5. RAG 回答包含内联引用来源

---

*source: `projects/yiknowledge/requires/2026-08/yiai-knowledge-watcher-rag-integration.md`*