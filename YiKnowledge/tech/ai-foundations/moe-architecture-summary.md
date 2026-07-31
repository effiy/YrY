---
title: MoE 架构
tags: [AI, 基础, MoE, 稀疏激活, 推理]
category: tech/ai-foundations
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# MoE（Mixture of Experts）架构

## 1. 概念定义与背景

Mixture of Experts（MoE）：把模型的一个层（通常是 FFN）拆成 N 个「专家」子网络，每个 token 只路由到其中 top-k 个专家，**激活参数**远小于**总参数**。这是把模型容量做大、推理算力做小的主流路径。

代表性模型：Mixtral 8x7B、DeepSeek-V3/V2、Qwen-MoE、GPT-4（据公开报道）、GLM-4.5。Switch Transformer 把 MoE 引入预训练早期，是现代稀疏 MoE 的奠基工作。

## 2. 关键概念

| 术语 | 含义 |
|---|---|
| Expert | 一个独立的 FFN 子网络，N 个共享 attention 层 |
| Router / Gate | 决定每个 token 去哪几个专家的小型线性层 |
| Top-k routing | 每个 token 选得分最高的 k 个专家（k=1~2 最常见） |
| Load balancing loss | 辅助损失项，强迫 token 在专家间均匀分布，防止塌缩到一两个专家 |
| Aux-loss-free load balancing | DeepSeek-V3 提出，用偏置项动态调整路由，不进梯度，效果更稳 |
| Shared expert | 一组始终激活的专家，承载通用能力，避免冗余共享 |
| Activated params | 每 token 实际算的参数数，决定推理成本 |
| Total params | 全部权重，决定显存占用 |
| Expert parallelism | 把不同专家分到不同 GPU，类似 tensor parallel 但按专家切 |

## 3. 架构图解

```
Token h
   ↓
Router (Linear + Softmax/Top-k)
   ↓               ↓           ...
Expert 1        Expert 2    ...  Expert N
   ↓               ↓
gating weights * expert_output
   ↓
Sum  (h_new = Σ w_i * Expert_i(h))
   ↓
Next layer
```

DeepSeek-V2 的 MLA + 稀疏 MoE：attention 用 MLA（共享 K/V 降维）压 KV cache，FFN 用稀疏 MoE 扩容量——两个优化叠加。

## 4. 工程实现要点

### 训练

- **负载均衡**：必须加 load balancing loss 或 aux-loss-free 机制，否则训练几个 step 后路由塌缩
- **路由稳定性**：top-k 路由对 router 权重的小扰动敏感，可能造成 token-专家分配抖动；用 router z-loss / 路径 dropout 提升鲁棒性
- **通信开销**：expert parallelism 下，token 跨 GPU all-to-all 通信量大；用 grouped GEMM、融合通信 kernel 减开销
- **专家容量上限（capacity factor）**：设每专家最多处理 C = tokens_per_batch/N * factor，超量丢弃；factor 太小丢 token，太大浪费

### 推理

- **显存 vs 算力解耦**：参数占满显存，但每 token 只算 1/N；单请求延迟主要由 activated params 决定
- **batch 路由倾斜**：batch 中 token 集中到少数专家时，那些 GPU 成瓶颈，其他闲。需要 expert-level load balancing 监控 + 动态 router 偏置
- **多 GPU 部署**：MoE 模型通常 > 1 GPU 显存，expert parallel 是首选；与 tensor parallel 混用是常见组合
- **小 batch 效率差**：每专家 batch 小，GEMM 不饱和，吞吐下降；用 continuous batching 把请求拼大
- **DeepSeek MLA**：把 KV cache 进一步压缩，与 MoE 叠加让单卡能装下 671B 模型

## 5. 局限与改进脉络

| 局限 | 改进 |
|---|---|
| 训练不稳定、路由塌缩 | Switch Transformer aux loss → DeepSeek aux-loss-free |
| 显存占用大（要装所有专家） | 专家分片（EP）+ CPU offload + 按需加载（ Expert offloading） |
| 通信成本高 | Grouped GEMM、融合通信、Shared Expert 减少跨专家调用 |
| 小 batch GEMM 不饱和 | continuous batching + dynamic routing buffer |
| 专家特化不均 | 限制每专家 capacity，引入 shared expert 承载通用知识 |
| 路由不可解释 | Probing / sparse autoencoder 看专家学到了什么 |

## 6. 实际应用场景

- **基础大模型**：DeepSeek-V3、GLM-4.5、Qwen3-MoE 等，以稀疏激活把参数做到 200-700B 而推理算力控制在 30-50B 级别
- **边缘推理**：把不常用专家 offload 到 CPU/SSD，常用专家放显存（o1 类模型策略）
- **垂类模型**：让专家天然分到不同子任务，可作为多任务学习的结构先验
- **本团队关注点**：评估稀疏 MoE 模型在 YiAi BRD 生成场景的吞吐收益；若引入自建推理，优先评估 DeepSeek-V3 / GLM-4.5 这类中文友好且 activated params 小的方案

## 7. 关键参考

- Shazeer et al., 2017 — *Outrageously Large Neural Networks: The Sparsely-Gated MoE Layer*
- Fedus et al., 2021 — *Switch Transformer*
- DeepSeek-AI, 2024 — *DeepSeek-V2: Fast, Strong, Economical*（MLA + 稀疏 MoE）
- DeepSeek-AI, 2024 — *Auxiliary-Loss-Free Load Balancing for MoE*
- Mixtral — *Mistral 8x7B*
