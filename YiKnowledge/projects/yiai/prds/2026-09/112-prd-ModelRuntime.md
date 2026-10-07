---

doc_type: module
prd_id: "YA-09-112"
title: "YA-09-112: Model Runtime — Ollama/OpenAI/RAG 运行时统一工厂"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"

type: 需求
---

# YA-09-112: Model Runtime

> **PRD 版本**：v3.0

## 1. 背景

YiAi 需根据 `config.yaml` 配置动态选择 LLM 运行时：Ollama（本地）、OpenAI（云端 DeepSeek）、RAG（llama_index）。需统一的工厂模式屏蔽差异。

## 2. 范围

**In scope**：`get_runtime(mode)` → OllamaRuntime / OpenAIRuntime / RAGRuntime

| 优先级 | 故事 | 验收标准 |
|--------|------|---------|
| P1 | 统一运行时工厂 | get_runtime 返回正确实例 |
| P1 | 默认 Ollama | 无参数时默认 Ollama |