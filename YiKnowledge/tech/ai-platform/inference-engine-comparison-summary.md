---
title: 推理引擎对比（vLLM / TGI / SGLang / TensorRT-LLM）
tags: [AI 平台, 推理引擎, 对比]
category: tech/ai-platform
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# 推理引擎对比（vLLM / TGI / SGLang / TensorRT-LLM）

## 1. 技术背景与解决的问题

HuggingFace 原生 `transformers.generate()` 适合调试，单请求性能远低于生产可用。瓶颈在 KV cache 显存浪费、batch 调度死板、kernel 未融合。推理引擎层解决三件事：

1. **显存调度**：把 KV cache 当虚拟内存分页管理，按需分配
2. **batch 调度**：请求级 continuous batching，按 token 级别动态进出
3. **kernel 融合**：flash attention、rmsnorm + qkv fusion、flash decoding 等

## 2. 核心维度对比

| 维度 | vLLM | TGI (HF) | SGLang | TensorRT-LLM |
|---|---|---|---|---|
| 起源 | UC Berkeley SkyLab | HuggingFace | LMSYS / UC Berkeley | NVIDIA |
| 调度核心 | PagedAttention | Continuous batching | RadixAttention（前缀树 KV 复用） | In-flight batching |
| 易用性 | pip 安装即用 | Docker 一键起 | pip 安装即用 | 需编译 engine，与 TensorRT 版本强绑定 |
| 多 LoRA | 强（Punica / LoRAX 集成） | 一般 | 强 | 强 |
| 长上下文 | 支持到 1M（需调） | 支持到 200k | 支持到 1M | 取决于引擎构建参数 |
| 多模态 | 支持（Llama-3.2、Qwen-VL） | 支持 | 支持 | 较新版本支持 |
| Speculative decoding | 支持（draft model、eagle、MTP） | 支持 | 支持 | 支持 |
| 工程门槛 | 低 | 低 | 中 | 高 |
| 开发活跃度 | 极高 | 中 | 高 | 高（NVIDIA 主推） |
| 兼容生态 | OpenAI server 兼容 | OpenAI 兼容 | OpenAI 兼容 + 自研结构化接口 | Triton Inference Server 集成 |

## 3. 选型决策树

```
需要极致 throughput、稳定 SLA、单一模型长期服务？
├─ 是 → TensorRT-LLM（接受编译复杂度）
└─ 否 → 需要多 LoRA 或大量自定义模型？
        ├─ 是 → vLLM
        └─ 否 → 大量请求共享长前缀（system prompt + 工具描述 + few-shot）？
                 ├─ 是 → SGLang（RadixAttention 命中率最高）
                 └─ 否 → 团队已重度依赖 HuggingFace 生态？
                          ├─ 是 → TGI（兼容性最省心）
                          └─ 否 → vLLM（默认选择）
```

## 4. 性能参考（相对值，以 vLLM=1.0）

| 场景 | vLLM | TGI | SGLang | TensorRT-LLM |
|---|---|---|---|---|
| 短 prompt + 长 output 吞吐 | 1.0 | 0.7 | 1.1 | 1.3-1.6 |
| 长 prompt + 短 output（RAG） | 1.0 | 0.8 | 1.3-1.6（前缀复用） | 1.4 |
| 多 LoRA 高并发 | 1.0 | 0.6 | 1.0 | 1.1 |
| 长上下文 128k+ 单请求 | 1.0 | 0.7 | 1.1 | 1.2 |

> 数值是工程经验区间，非 benchmark 承诺；随版本变化大。

## 5. 部署与运维要点

1. **GPU 利用率目标 70-80%**：过低说明 batch 不饱和，过高说明排队风险；监控 `vllm:num_requests_running` 与 `waiting`
2. **KV cache 预分配**：vLLM `gpu_memory_utilization=0.9` 默认占 90% 显存给 KV，留 10% buffer 防碎片爆显存
3. **Prefix cache 健康度**：监控 `cache_hit_rate`，<50% 说明 prompt 结构未复用，调 prompt 把固定段放最前
4. **多模态部署**：vLLM 0.5+ 对 Llama-3.2-Vision / Qwen2-VL 支持完整，但单 batch 多图会显著拖慢——前端节流
5. **Triton + TensorRT-LLM**：NVIDIA 官方推荐部署栈，enforcer 极致延迟，但 engine 编译需 10-30 分钟，每次权重变更要重建
6. **路由层**：上游用 LiteLLM / Portkey 统一 OpenAI 协议，便于多引擎并存与切换

## 6. 本团队落地情况

- 主推理：vLLM，承载 YiAi BRD 生成 + YiVad 对话
- 评估中：SGLang（BRD 长前缀复用收益大）
- 暂不采用：TensorRT-LLM（编译复杂度高，当前规模收益不显著）

## 7. 参考资料

- vLLM: https://docs.vllm.ai
- SGLang: https://github.com/sgl-project/sglang
- TGI: https://github.com/huggingface/text-generation-inference
- TensorRT-LLM: https://github.com/NVIDIA/TensorRT-LLM
