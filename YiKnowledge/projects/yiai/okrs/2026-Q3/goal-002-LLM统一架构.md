---
type: okr-goal
id: yiai-002
title: "Multi-Provider LLM 统一架构"
status: in_progress
period: "2026 Q3"
owner: ""
project: YiAi
project_id: yiai
progress: 90
updated: 2026-09-11
kr1: "ModelRuntime 抽象层 — Pi 风格的多 Provider 统一流式接口"
kr1_completion: 100
kr2: "OpenAI 兼容 API — DeepSeek-Harness 风格多客户端适配层"
kr2_completion: 80
kr3: "LLM 并发调度优化 — 多模型负载均衡与优先级队列"
kr3_completion: 85
metric1_id: "yiai-m04"
metric1_desc: "支持的 LLM Provider 数"
metric1_current: "4"
metric1_target: "≥6"
metric2_id: "yiai-m05"
metric2_desc: "Provider 切换延迟"
metric2_current: "<2s"
metric2_target: "<3s"
related_prds:
  - projects/yiai/prds/2026-08/02-需求-Multi-Provider-LLM.md
  - projects/yiai/prds/2026-08/14-需求-ModelRuntime抽象层.md
  - projects/yiai/prds/2026-08/09-需求-OpenAI兼容API.md
---

# Multi-Provider LLM 统一架构

> Q3 架构目标。建立统一的 LLM Provider 抽象层，支持 Ollama、DeepSeek、OpenAI、Anthropic 等多厂商模型的即插即用切换，实现 ModelRuntime 的 Pi 风格流式接口。

## 背景

YiAi 最初仅支持 Ollama 自托管推理。随着模型生态发展，需要接入 DeepSeek API、OpenAI 兼容 API、Anthropic Claude 等多种外部 LLM 服务。为避免每个 Provider 写一套适配代码，需要建立统一的 ModelRuntime 抽象层。

## 关键结果

1. **ModelRuntime 抽象层** — 统一流式接口（`astream()` / `astream_events()`），支持 chat/completion/embedding 三种模式
2. **OpenAI 兼容 API** — DeepSeek-Harness 风格多客户端适配，支持 base_url + api_key 配置
3. **并发调度优化** — 多模型负载均衡、优先级队列、自适应速率限制

## 影响

- 新增 Provider 平均接入成本从 3 天降至 0.5 天
- 支持 Ollama / DeepSeek / OpenAI / Anthropic 四厂商 12+ 模型
- LLM 调用延迟 P99 < 30s（含超时保护）