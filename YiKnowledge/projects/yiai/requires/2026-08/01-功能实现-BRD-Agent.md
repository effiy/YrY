---
title: 需求智能体-检索增强生成驱动的产品需求
tags: [功能, 智能体, 后端, 检索增强生成, 知识库]
category: 问题/功能
created: 2026-08-03
updated: 2026-08-21
source: 内部
type: 问题
status: 进行中
priority: 高
issue_type: 功能
project: YiAi
project_id: yiai
owner: 陈铭
estimate_points: 8
review_status: 评审中
prd_month: "202608"
prd_task_id: "1"
roles: [engineer]
---

# BRD Agent — RAG驱动的产品需求智能体

## 基本信息

| 字段 | 值 |
|------|-----|
| 需求编号 | 1 |
| 项目 | YiAi (FastAPI Backend) |
| 代码仓库 | `YrY/YiAi` |
| 功能模块 | AI → Agent |
| 优先级 | 高 |
| 人天 | 8.0d |
| 状态 | 进行中 |

### 功能概述

基于 YiKnowledge 知识库构建产品需求 Agent（BRD Agent），通过 RAG 检索知识库中的 PRD/BRD 文档，辅助产品经理进行需求分析、文档对比和方案推荐。

### 技术实现

#### Agent 架构

```
用户输入需求描述
  ↓
RAG 检索 → YiKnowledge 知识库（PRD/BRD/ADR 文档）
  ↓
LLM 分析 → 需求对比、冲突检测、方案推荐
  ↓
输出 BRD 文档草稿
```

#### 核心能力

- **需求文档检索**：从 YiKnowledge 检索相关 PRD/BRD 文档
- **需求对比分析**：对比相似需求，识别差异和冲突
- **方案推荐**：基于历史 ADR 推荐技术方案
- **文档草稿生成**：自动生成 BRD 文档草稿（Markdown 格式）
- **知识库联动**：检索结果引用来源文件和上下文

#### 检索策略

- 检索范围：`producter/`、`leader/decisions/`、`projects/` 目录
- 混合检索：向量相似度 + BM25 关键词
- 按 `category` 和 `roles` 过滤
- Top-K 可配置（默认 5）

#### API 接口

- RPC 路由：`services.ai.agent_service.brd_agent`
- 请求参数：
  ```json
  {
    "module_name": "services.ai.agent_service",
    "method_name": "brd_agent",
    "parameters": {
      "prompt": "需求描述",
      "context_type": "prd|brd|adr",
      "top_k": 5
    }
  }
  ```
- 响应格式：SSE 流式（与 Chat Agent 一致）

#### 与 Chat Agent 的差异

| 维度 | Chat Agent | BRD Agent |
|------|-----------|-----------|
| 知识来源 | 通用知识库 | PRD/BRD/ADR 文档 |
| 检索范围 | 全库 | producter/ + leader/ + projects/ |
| 输出格式 | 对话回复 | 结构化 BRD 文档 |
| 工具调用 | 通用工具 | 文档分析专用工具 |

### 关联模块

- 后端服务：`services/ai/agent_service.py`
- RAG 引擎：`services/rag/rag_service.py`
- Knowledge Watcher：`services/knowledge/watcher.py`
- 配置：`config.yaml`

### 验收标准

1. BRD Agent 正确检索知识库中的 PRD/BRD 文档
2. 需求对比分析准确，识别差异和冲突
3. 方案推荐基于历史 ADR 数据
4. 生成的 BRD 文档草稿结构完整
5. 检索结果引用来源文件和上下文
6. SSE 流式响应正常

---

*来源: `projects/yiai/requires/2026-08/brd-agent-rag-driven.md`*