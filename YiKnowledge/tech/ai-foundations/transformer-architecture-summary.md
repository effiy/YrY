---
title: Transformer 架构核心原理摘要
tags: [AI, Transformer, 深度学习, Attention, 架构, MoE, Mamba]
category: tech/ai-foundations
created: 2024-03-01
updated: 2026-07-30
source: https://arxiv.org/abs/1706.03762
type: summary
---

# Transformer 架构核心原理摘要

## 1. 核心创新：Self-Attention

Transformer 的核心是 **Self-Attention（自注意力）** 机制，它允许模型在处理序列时，动态关注序列中不同位置的信息，突破 RNN 的长程依赖瓶颈。

## 2. 关键公式

```
Attention(Q, K, V) = softmax(QK^T / √dk) * V
```

- **Q (Query)**：查询向量，当前 token 想要关注什么
- **K (Key)**：键向量，其他 token 能提供什么
- **V (Value)**：值向量，实际传递的信息
- **√dk**：缩放因子，防止点积过大导致 softmax 进入梯度饱和区

## 3. Multi-Head Attention

将 Q/K/V 投影到多个子空间并行做 attention，最后拼接：
- 每个 head 可学习不同类型的关系（语法、共指、长程依赖等）
- 头数 h 与每头维度 dk 满足 dk = d_model / h
- 计算量与单头 attention 接近（投影后维度减小）

## 4. 架构组成

### 4.1 Encoder（编码器）
1. Multi-Head Self-Attention
2. Feed-Forward Network（两层 MLP + GELU/SwiGLU）
3. Residual Connection + Layer Normalization（Pre-LN 更稳定）

### 4.2 Decoder（解码器）
1. Masked Multi-Head Self-Attention（防止看到未来 token）
2. Cross-Attention（Encoder-Decoder Attention）
3. Feed-Forward Network
4. Residual Connections + Layer Normalization

## 5. 位置编码（Positional Encoding）

Self-Attention 本身不具备位置信息，需额外注入：

- **绝对位置编码**：原论文 sinusoidal；BERT 学习式
- **相对位置编码**：T5 relative attention bias；关注 token 间相对距离
- **RoPE（旋转位置编码）**：Llama / Qwen / DeepSeek 等主流 LLM 采用，通过旋转矩阵注入相对位置，外推性好
- **ALiBi**：通过 attention bias 注入位置，支持更长外推
- **NoPE**：近期研究表明在长上下文场景下不显式位置编码也能 work

## 6. 现代变体与演进

### 6.1 Decoder-only 架构
GPT / Claude / Llama 等主流 LLM 均为 decoder-only，去掉 cross-attention，纯自回归生成。优势：统一生成任务、训练效率高、scaling 友好。

### 6.2 MoE（Mixture of Experts）
- 每层将 FFN 拆为 N 个 expert，路由器选择 top-k 激活
- Mixtral 8x7B / DeepSeek V3 / Llama 4 均采用
- 优点：参数量大但激活稀疏，推理成本接近小模型
- 缺点：训练不稳定、负载均衡难

### 6.3 线性注意力 / 状态空间模型
- **Mamba / Mamba-2**：选择性状态空间模型，推理复杂度 O(1) per token
- **RWKV**：可并行训练的 RNN，推理 O(1) 内存
- **Linear Attention**：将 softmax 替换为核函数近似
- 目标：突破 attention O(n²) 复杂度，超长上下文友好

### 6.4 Grouped-Query Attention (GQA) / Multi-Query Attention
- 多 query head 共享少数 KV head，减少 KV cache 内存
- Llama 4 / Gemini / DeepSeek 均采用
- 是当前长上下文（>1M token）的工程标配

## 7. 训练流程

### 7.1 预训练
- 自回归 next-token prediction（decoder-only）
- 损失：cross-entropy on token
- 数据规模：T 级 token、万亿参数
- 并行：数据并行 + 张量并行 + 流水线并行（3D 并行）

### 7.2 后训练
1. **SFT（监督微调）**：高质量指令数据，1K-100K 样本
2. **RLHF / DPO**：人类偏好对齐
3. **Constitutional AI（Claude）**：用 AI 反馈替代部分人类标注
4. **工具使用训练**：Function Calling 示例
5. **推理数据训练**：思维链数据，训练模型显式 thinking

## 8. Scaling Law

- **Kaplan 2020**：Loss ∝ N^(-α)，参数 / 数据 / 算力同步放大
- **Chinchilla 2022**：数据量应约为参数量的 20 倍
- ** emergent abilities**：规模到一定阈值后涌现新能力（in-context learning、思维链）

## 9. 工程优化

- **KV Cache**：推理时缓存历史 K/V，避免重复计算
- **PagedAttention（vLLM）**：分页式 KV 管理，显存利用率提升 3-10x
- **Flash Attention 1/2/3**：IO-aware attention kernel，速度提升 2-4x
- **Speculative Decoding**：小模型起草，大模型验证，2-3x 加速
- **量化**：FP8 / INT4 / GPTQ，推理成本降低 4-8x
