---
title: KV Cache 与推理优化
tags: [AI, 基础, 推理, KV Cache, 优化]
category: tech/ai-foundations
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# KV Cache 与推理优化

## 1. 背景与问题定义

LLM 自回归生成时，每生成一个 token 都要对「整段 prompt + 已生成部分」做 self-attention。若每步重算所有历史 token 的 K/V，复杂度 O(n²) 在序列长度上、O(n) 在生成步数上——长输出不可接受。

观察到：每步只新增一个 token 的 K/V，历史的 K/V 不变。把历史 K/V 缓存下来，下一步只需算新 token 的 K/V 并 append——这就是 **KV Cache**。

KV Cache 把生成复杂度从 O(n²) 降到 O(n)，是当代 LLM 推理引擎的基石。

## 2. 核心概念与组件

| 概念 | 含义 |
|---|---|
| KV Cache | 每层 attention 的 K、V 张量，shape `(seq, num_heads, head_dim)` |
| Prefill 阶段 | 处理 prompt，一次性算出全部 K/V，算力密集 |
| Decode 阶段 | 每步 append 一个 token 的 K/V，访存密集 |
| PagedAttention | 把 KV cache 切成固定大小 block（如 vLLM 的 16 token），按 page 表管理，类似 OS 虚拟内存 |
| Paged / Paged-eager | 不同 batch 用不同 page 数，规避碎片 |
| Prefix Cache | 跨请求复用公共前缀（system prompt、few-shot）的 KV |
| Speculative Decoding | 用小模型/草稿模型预测多个 token，大模型一次验证，命中即批量出 token |
| Continuous Batching | 不等同长度 batch 一起结束，按 token 级别动态调度，提升 GPU 利用率 |

## 3. 主流方案对比

| 维度 | vLLM PagedAttention | TensorRT-LLM | SGLang | TGI |
|---|---|---|---|---|
| 调度核心 | Page 表 + 虚拟内存 | 静态 shape + in-flight batching | RadixAttention（前缀树复用 KV） | Continuous batching |
| 前缀复用 | 是（Automatic Prefix Caching） | 是（KV cache reuse） | 是（Radix 树原生强项） | 有限 |
| 多 LoRA | 较好 | 较好 | 较好 | 一般 |
| 长上下文 | 支持，需调 `max_seq_len` | 支持，需重新构建引擎 | 支持 | 支持 |
| 工程门槛 | 低（开箱即用） | 高（需编译、TensorRT 版本耦合） | 中（自研调度器） | 低 |
| 适用场景 | 通用服务、长尾请求多 | 单一模型极致延迟、吞吐 | Agent / 多共享前缀场景 | HuggingFace 生态无缝 |

## 4. 选型决策树

```
是否需要服务多 LoRA 且流量不大？
├─ 是 → vLLM（多 LoRA 加载强）
└─ 否 → 是否有大量共享前缀（system prompt + 工具描述 + few-shot）？
        ├─ 是 → SGLang（RadixAttention 复用 KV 收益最大）
        └─ 否 → 单一模型要极致 throughput / 延迟？
                 ├─ 是 → TensorRT-LLM（前期工程投入换稳定）
                 └─ 否 → vLLM（默认）
```

## 5. 部署与运维要点

1. **显存预算**：KV cache 显存 ≈ `2 * num_layers * seq_len * num_heads * head_dim * dtype_bytes`。例：Llama-3-70B fp16，32k 上下文，单请求 KV ≈ 5GB。规划并发数与 batch 大小时先算 KV 而非权重。
2. **prefill / decode 分离**：prefill 算力 bound，decode 访存 bound。同 batch 混合会互相阻塞。vLLM/SGLang 支持流水线分阶段调度，可显著提升吞吐。
3. **prefix cache 命中率**：固定 system prompt + 工具描述放最前面；动态部分放最后。监控 `cache_hit_rate`，低于 50% 说明前缀没复用，需调 prompt 结构。
4. **speculative decoding 收益判定**：accept rate > 50% 才有效，否则草稿模型本身的开销吃掉收益。适合确定性强、重复模式多的任务（如结构化输出）。
5. **长上下文降速保护**：上下文 > 16k 时单步 decode 显著变慢，建议为长上下文请求单独建池，避免拖垮短请求 SLA。
6. **显存碎片**：非分页调度器在 batch 长度离散时碎片严重，统一用 PagedAttention 或 SGLang 的 page 接口。

## 6. 评估指标

- **TTFT**（Time To First Token）：prefill + queue 时长，决定首字节延迟
- **TPOT**（Time Per Output Token）：decode 阶段每 token 平均时长
- **Throughput**（tokens/s/GPU）：批量场景核心指标
- **KV cache utilization**：实际占用 / 预分配，反映 batch 调度效率
- **Prefix cache hit rate**：复用率，反映 prompt 结构健康度

## 7. 本团队落地情况

- YiVad 推理服务用 vLLM 0.6+，PagedAttention 默认开，`max_num_seq=128`
- YiAi 的 BRD 生成因 system prompt 长（含 BRD 章节模板 + 多语言术语表），启用 vLLM Automatic Prefix Caching，命中率稳定 60-70%
- 长文场景（>32k）单独建池，避免影响对话类短请求
- 待评估：speculative decoding 在 BRD 结构化输出场景的 accept rate

## 8. 参考资料

- Kwon et al., 2023 — *Efficient Memory Management for LLM Serving with PagedAttention*（vLLM）
- Leviathan et al., 2022 — *Fast Inference from Transformers via Speculative Decoding*
- Zheng et al., 2023 — *SGLang: Squeezing More out of LLMs with RadixAttention*
- NVIDIA TensorRT-LLM 文档
