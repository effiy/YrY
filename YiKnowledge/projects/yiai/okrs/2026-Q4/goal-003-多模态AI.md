---
type: okr-goal
id: yiai-q4-003
title: "多模态 AI 与智能推理优化"
status: planned
period: "2026 Q4"
owner: ""
project: YiAi
project_id: yiai
progress: 5
updated: 2026-09-14
kr1: "多模态模型接入 — 图像理解 (GPT-4V/Claude Vision) + 音频转录 (Whisper)"
kr1_completion: 0
kr2: "智能模型路由 — 基于任务复杂度/成本/延迟的自动模型选择 + fallback 链"
kr2_completion: 10
kr3: "成本优化引擎 — Token 用量追踪 + 模型推荐（性价比最优）+ 预算告警"
kr3_completion: 10
kr4: "Prompt 管理平台 — 模板版本管理 + A/B 测试 + 效果评估"
kr4_completion: 5
metric1_id: "yiai-q4-m07"
metric1_desc: "多模态支持能力数"
metric1_current: "0 (text-only)"
metric1_target: "2 (image + audio)"
metric2_id: "yiai-q4-m08"
metric2_desc: "LLM 调用成本降低"
metric2_current: "baseline"
metric2_target: "-30%"
metric3_id: "yiai-q4-m09"
metric3_desc: "模型路由决策准确率"
metric3_current: "N/A"
metric3_target: ">90%"
related_prds:
  - projects/yiai/prds/2026-09/160-需求-多模态支持-图像理解.md
  - projects/yiai/prds/2026-09/168-需求-音频转录与处理.md
  - projects/yiai/prds/2026-09/171-需求-意图分类与路由.md
  - projects/yiai/prds/2026-09/189-需求-多模型路由与fallback.md
  - projects/yiai/prds/2026-09/201-需求-成本优化引擎.md
  - projects/yiai/prds/2026-09/162-需求-Prompt压缩与优化服务.md
  - projects/yiai/prds/2026-09/19-需求-LLM-Prompt模板管理与版本控制.md
  - projects/yiai/prds/2026-09/230-需求-对话模板版本管理.md
---

# 多模态 AI 与智能推理优化

> Q4 AI 能力升级目标。在 Q3 LLM 统一架构的基础上，从纯文本扩展到多模态（图像 + 音频），建立智能模型路由和成本优化体系，从"能用"到"聪明地用"。

## 背景

YiAi 的 LLM 架构已支持 4 个 Provider 的文本模型。Q4 将能力边界扩展到多模态输入（产品截图分析、会议录音转录），并解决多模型场景下的核心问题——如何为每个请求选择最合适的模型（成本/延迟/质量权衡）。

## 关键结果

1. **多模态接入** — GPT-4V/Claude Vision 图像理解（产品截图→文本描述→Agent 处理）+ Whisper 音频转录（会议录音→文字→知识库摘要）。
2. **智能模型路由** — 基于任务复杂度（简单问答→Haiku、代码生成→Opus）、成本预算、延迟要求的自动模型选择，含 fallback 链（Primary→Secondary→Ollama 兜底）。
3. **成本优化** — Token 用量实时追踪（按用户/会话/模型维度），基于历史用量的模型推荐（性价比最优），月度预算告警。目标降低 30% LLM 调用成本。
4. **Prompt 管理平台** — 模板版本管理（`src/services/ai/` 下的 prompt 模板），A/B 测试框架，效果评估指标（完成率/延迟/成本）。

## 影响

- 支持图像+音频输入，Agent 可处理多模态任务（截图 Bug 分析、会议纪要生成）
- LLM 调用成本降低 30%（通过智能路由 + 缓存 + 压缩）
- Prompt 变更可追溯可回滚可评估
- 为 YiPet 提供图像理解能力（宠物角色识别截图内容）