---
title: AI Foundations Directory
tags:
- leaf
- tech
- ai-foundations
category: aier/基础
created: '2026-08-03'
updated: '2026-08-10'
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles:
- aier
benefit: foundations solid
acceptance_criteria:
- scope of the leaf directory is clearly bounded
- file inventory table is complete with one-liner descriptions
- cross-references to related leaves and parent INDEX are present
related:
- ../../aier/机器学习/find-ai-deployment-cases.md
- ../平台/README.md
- ../方法/README.md
---

# AI Foundations Directory

> **作为** AI 工程师，**我希望**理解 AI/ML 理论和基础，**以便**为 AI 系统做出明智的架构决策。

收集 AI 基础理论和模型架构知识。

## 范围

- Transformer / Attention 架构
- 训练范式（预训练、SFT、RLHF、DPO）
- 推理和解码（KV cache、采样策略）
- 上下文管理（长上下文、RoPE、ALiBi）
- 多模态架构（视觉编码器、LLaVA）
- MoE 架构

## 文件类型和命名

- `{topic}.md`：基础主题摘要
- 命名使用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: some topic
tags: [AI, foundations, topic]
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: <link or internal>
type: summary
lifecycle: reference
last_verified: YYYY-MM-DD
review_cycle: quarterly
related:
  - ./attention-mechanism.md
  - ../README.md
  - ../INDEX.md
---
```

## 推荐结构

1. 概念定义和背景
2. 数学直觉（不需要严格推导）
3. 架构图
4. 工程实现要点
5. 局限性和改进轨迹
6. 实际应用场景

## 已包含

### 核心理论

- `transformer-architecture.md` — Transformer 架构摘要
- `attention-mechanism.md` — Attention 机制详解
- `kv-cache-inference-optimization.md` — KV Cache 和推理优化
- `moe-architecture.md` — MoE 架构
- `rlhf-dpo-alignment.md` — RLHF / DPO 对齐
- `long-context-techniques.md` — 长上下文技术（RoPE / ALiBi / YaRN）
- `multimodal-fusion.md` — 多模态融合（CLIP / LLaVA）
- `sampling-strategy.md` — LLM 采样策略（temperature, top-p, top-k, nucleus, beam search）
- `speculative-decoding.md` — 投机解码加速 LLM 推理
- `quantization-distillation.md` — 模型量化（GGUF, GPTQ, AWQ）和知识蒸馏
- `flash-attention.md` — Flash Attention 机制和高效 Transformer 架构

### 运维

- `handle-a-model-drift.md` — 模型漂移检测和处理
- `handle-an-ai-failure.md` — AI 故障处理模式

### 仪表盘文件



## 相关叶子

- [../platform](../平台) — 平台层（推理引擎 / 向量存储）
- [../methodology](../方法) — AI 方法论
- [../data/](../data/) — 数据维度
- [../../aier/机器学习/find-ai-deployment-cases.md](../../aier/机器学习/find-ai-deployment-cases.md) — 场景入口