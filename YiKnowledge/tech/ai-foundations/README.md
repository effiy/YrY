# AI 基础 / AI Foundations

收录 AI 基础理论与模型架构知识。

## 收录范围

- Transformer / Attention 架构
- 训练范式（预训练、SFT、RLHF、DPO）
- 推理与解码（KV cache、采样策略）
- 上下文管理（长上下文、RoPE、ALiBi）
- 多模态架构（vision encoder、LLaVA）

## 文件类型与命名

- `{主题}-summary.md`：基础主题摘要
- 命名采用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: 某主题
tags: [AI, 基础, 主题]
category: tech/ai-foundations
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: <链接或 internal>
type: summary
status: stable
last_verified: YYYY-MM-DD
---
```

## 写作推荐结构

1. 概念定义与背景
2. 数学直觉（不需严格推导）
3. 架构图解
4. 工程实现要点
5. 局限与改进脉络
6. 实际应用场景

## 已收录

- `transformer-architecture-summary.md` — Transformer 架构摘要
- `attention-mechanism-summary.md` — Attention 机制详解
- `kv-cache-inference-optimization-summary.md` — KV Cache 与推理优化
- `moe-architecture-summary.md` — MoE 架构
- `rlhf-dpo-alignment-summary.md` — RLHF / DPO 对齐
- `long-context-techniques-summary.md` — 长上下文技术（RoPE / ALiBi / YaRN）
- `multimodal-fusion-summary.md` — 多模态融合（CLIP / LLaVA）

## 待收录
