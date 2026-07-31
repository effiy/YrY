---
title: 长上下文技术（RoPE / ALiBi / YaRN）
tags: [AI, 基础, 长上下文, RoPE, ALiBi, YaRN]
category: tech/ai-foundations
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# 长上下文技术（RoPE / ALiBi / YaRN）

## 1. 背景与问题

Transformer 原始绝对位置编码（learned / sinusoidal）有强训练长度上限：训练 2k，外推到 4k 后质量崩。要让模型支持长上下文（32k / 128k / 1M），需要在位置编码层做文章。

三类方案：

- **相对位置编码**：让 attention 看相对位置（RoPE、ALiBi）
- **位置插值**：训练后扩展（PI、NTK-aware、YaRN）
- **架构改造**：稀疏 attention、分块 attention（Ring Attention、LongRoPE）

## 2. RoPE（Rotary Position Embedding）

### 核心思想

把 query / key 向量按位置旋转，让 $q_m^T k_n$ 自动包含相对位置 $m-n$。

$$ q_m \to R_{\Theta,m} q_m, \quad k_n \to R_{\Theta,n} k_n $$

其中 $R_{\Theta,m}$ 是位置 $m$ 对应的旋转矩阵。

### 优点

- 相对位置自然外推
- 不增加参数
- 实现简单（一次复数乘法）

### 局限

- 外推仍有限：训练 2k 外推到 8k 质量降
- 高频部分外推差

## 3. ALiBi（Attention with Linear Biases）

### 核心思想

不用位置编码，直接在 attention 分数上加一个与相对距离成正比的偏置：

$$ \text{softmax}(q_i^T k_j - m \cdot (i - j)) $$

距离越远，attention 分数被压越低。$m$ 按头不同，几何级数。

### 优点

- 外推极好：训练 1k 推 16k 仍可用
- 实现极简
- 短上下文质量与 RoPE 相当

### 局限

- 长上下文性能略低于 RoPE+YaRN
- 推理时强制衰减，可能丢长距离依赖

## 4. Position Interpolation（PI）

### 核心思想

把训练好的 RoPE 模型"缩放"到更长上下文：

$$ \theta_i' = \theta_i / s $$

其中 $s$ 是扩展倍数。例如训练 2k 扩展到 8k，$s=4$。

需要少量长文本继续微调几千步，效果可恢复。

### 优点

- 工程简单，几小时可训
- 短上下文性能几乎不丢

### 局限

- 需要继续训练
- 高频部分外推仍差

## 5. NTK-aware 与 YaRN

### NTK-aware

调整 RoPE 的 base frequency $\theta$ 让低频部分慢扩、高频部分不扩，避免高频外推破坏。

### YaRN（Yet another RoPE extensioN）

更精细的频率分段缩放，结合 NTK 与 PI 的优点，少量继续训练（10x less data than PI）即可。

### 优点

- 比 PI 更稳的扩展
- 短上下文质量保持
- 训练数据需求少

### 局限

- 实现比 PI 复杂
- 仍需要少量长文本数据

## 6. 方案对比

| 方案 | 训练长度 | 外推上限 | 继续训练需求 | 短上下文质量 | 长上下文质量 |
|---|---|---|---|---|---|
| 原始 absolute | 2k | 4k | 无 | 好 | 差 |
| RoPE | 2k | 8k | 无 | 好 | 中 |
| ALiBi | 1k | 16k | 无 | 好 | 中 |
| RoPE + PI | 2k → 8k | 16k | 几千步 | 好 | 好 |
| RoPE + NTK-aware | 2k | 16k | 少量 | 好 | 好 |
| RoPE + YaRN | 2k → 32k | 64k+ | 极少步 | 好 | 好 |

## 7. 工程实现要点

1. **训练长度**：长上下文训练成本随长度平方增长；用 FlashAttention 等优化
2. **推理长度**：即使支持 128k，单请求显存爆；需 PagedAttention + 长 batch 调度
3. **真实有效长度**：模型支持 128k 不代表能用——「针插草堆」needle-in-haystack 测试发现很多模型在中段 recall 差
4. **稀疏 attention**：长上下文成本可降，但召回质量未必差（Longformer、BigBird）
5. **分段处理**：超长文档先 chunk + retrieve，再喂模型；不要硬塞
6. **监控**：长上下文请求的延迟与成本，避免单请求拖垮服务

## 8. 评估方法

### Needle in Haystack

在长文档中插入一句关键信息，问模型这句信息。不同位置 × 不同长度测召回率。

### 长文档 QA

真实长文档上的问答任务。

### 多轮长对话

多轮对话累计上下文，测模型是否能引用早期信息。

## 9. 实际应用场景

- 大规模文档问答（BRD / 法律 / 代码）
- 多轮长对话（客服连续会话）
- 代码库级理解（整个 repo 作为上下文）
- 多模态长视频

## 10. 本团队关注点

- YiAi BRD 生成：BRD 章节模板 + 多语言术语表 + 用户输入，上下文需求 30-50k，长上下文模型必要
- 选模型时看真实 needle-in-haystack 表现，不只看宣称长度
- 长上下文请求单独池，避免拖垮对话类短请求

## 11. 关键参考

- Su et al., 2021 — *RoFormer: Enhanced Transformer with Rotary Position Embedding*
- Press et al., 2021 — *Train Short, Test Long: Attention with Linear Biases*（ALiBi）
- Chen et al., 2023 — *Extending Context Window of LLM via Position Interpolation*
- Peng et al., 2023 — *YaRN: Efficient Context Window Extension*
- Liu et al., 2024 — *Lost in the Middle: How Language Models Use Long Contexts*
