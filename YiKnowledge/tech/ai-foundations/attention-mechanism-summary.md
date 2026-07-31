---
title: Attention 机制详解
tags: [AI, 基础, Attention, Transformer]
category: tech/ai-foundations
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# Attention 机制详解

## 1. 概念定义与背景

Attention 不是单一算法，而是一族「让模型在每一步动态选择输入的加权组合」的算子。它在 2014-2015 年由 Bahdanau 等人引入 seq2seq，解决长序列中的信息瓶颈；2017 年《Attention Is All You Need》提出 Self-Attention，去掉了 RNN/CNN 骨干，Transformer 由此诞生。

直观理解：给定查询向量 `q`、一组键值对 `(k, v)`，attention 用 `q` 与每个 `k` 计算相关度，按相关度对 `v` 加权求和。这就是「soft retrieval」——可微、可端到端训练的检索。

## 2. 数学直觉

### Scaled Dot-Product Attention

$$ \text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right) V $$

- `QK^T`：查询与所有键的相似度矩阵
- `/sqrt(d_k)`：防止内积过大使 softmax 进入饱和区，梯度消失
- `softmax`：把相似度归一成注意力权重
- `* V`：用权重对值加权求和

### Multi-Head Attention

把 `Q/K/V` 切成 `h` 份，每份独立做 attention，再拼回去线性映射一次。

- 每个 head 学到不同子空间的关注模式
- 参数量与单 head 大致相当（因为 `d_model = h * d_k`）
- 实现上是一次 matmul + reshape，不增加 FLOPs 数量级

## 3. 架构图解

```
Input → [Embedding + Positional Encoding]
            ↓
    ┌──────────────┐
    │ Multi-Head   │ ← Self-Attention（每位置看全序列）
    │ Attention    │
    └──────────────┘
            ↓
        Add & Norm (残差 + LayerNorm)
            ↓
      Feed-Forward (两层 MLP，逐位置)
            ↓
        Add & Norm
            ↓       （重复 N 层）
```

Encoder 全用 self-attention；Decoder 多了 mask（防止看未来）和 cross-attention（看 encoder 输出）。

## 4. 工程实现要点

| 痛点 | 解决方案 |
|---|---|
| `QK^T` 是序列长度的平方 | FlashAttention 把中间矩阵切分到 SRAM，避免 HBM 读写；KV cache 推理期复用 |
| softmax 需整行归一 | FlashAttention 用两遍算法在线 softmax，无需物化整行 |
| 长序列 OOM | 稀疏 attention（Longformer、BigBird）只看局部窗口 + 全局 token |
| padding 浪费算力 | 用 unpadding / varlen 接口，把多个 batch 拼成一个长序列一次算 |
| 多 head 同 shape | 用 `view + transpose` 而非循环，编译器友好的 fused kernel |

## 5. 局限与改进脉络

- **长上下文成本**：平方复杂度 → 稀疏 / 线性 attention（Performer、Linformer）、分块（Ring Attention）
- **位置编码**：绝对位置外推差 → RoPE / ALiBi / YaRN，让相对位置自然外推
- **信息瓶颈**：单个 softmax 既要建模内容相关也要建模位置相关 → disentangled attention（DeBERTa）
- **多查询冗余**：每个 head 各自的 K/V 造成 KV cache 爆 → MQA / GQA / MLA（DeepSeek）共享 K/V
- **训练稳定性**：softmax infty-attn 在数值上脆弱 → qk-norm、`1/sqrt(d)` 调整

## 6. 实际应用场景

- **NLP 基础设施**：所有现代 LLM 的核心层
- **多模态**：图像 token 与文本 token 共进入 attention（ViT + LLM）
- **推荐系统**：行为序列建模（用户最近 N 次点击 attend 到 item embedding）
- **代码模型**：文件级 cross-attention，遵循长距离依赖
- **本团队落地**：YiAi 的 BRD 生成依赖长上下文 LLM，attention 的长上下文能力直接决定 BRD 章节一致性；推理优化上，YiVad 用 vLLM 的 PagedAttention 管控 KV cache。

## 7. 关键参考文献

- Vaswani et al., 2017 — *Attention Is All You Need*
- Bahdanau et al., 2014 — Neural Machine Translation by Jointly Learning to Align and Translate
- Dao et al., 2022 — FlashAttention: Fast and Memory-Efficient Exact Attention
- Su et al., 2021 — RoFormer（RoPE）
