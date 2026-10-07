---

doc_type: module
prd_id: "YP-09-107"
title: "YP-09-107: LlamaIndex RAG 管理面板 — 索引构建/状态/重建"
status: 已完成
priority: P1
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: 需求
---

# YP-09-107: LlamaIndex RAG 管理面板

> **PRD 版本**：v3.0

## 1. 背景

YiPet 通过 `KnowledgeService` 和 `RagService` 接入 YiAi 的 llama_index RAG 引擎。用户需要可视化管理面板来查看索引状态、触发重建、了解文档数。

## 2. 范围

**In scope**：`LlamaIndexPanel` — RAG 索引状态徽章（built/unbuilt/loading）+ 文档计数 + 最后构建时间 + 重建按钮

| 优先级 | 故事 | 验收标准 |
|--------|------|---------|
| P1 | 查看索引状态 | 状态 + 文档数 + 构建时间 |
| P1 | 重建索引 | 触发 /rag-build，轮询状态 |