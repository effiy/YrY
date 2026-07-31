---
title: vLLM / Ollama 部署经验
tags: [工具, vLLM, Ollama, 部署]
category: work/tools
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# vLLM / Ollama 部署经验

## 1. 适用场景

- **vLLM**：生产级 LLM 推理服务，吞吐与延迟优化
- **Ollama**：本地开发 / 个人设备，单用户场景

两者定位不同：vLLM 是服务端，Ollama 是本地工具。

## 2. vLLM 部署要点

### 启动参数

```bash
vllm serve {model_id} \
  --port 8000 \
  --tensor-parallel-size {N} \
  --gpu-memory-utilization 0.9 \
  --max-model-len 32768 \
  --max-num-seqs 128 \
  --enable-prefix-caching \
  --enable-auto-tool-call \
  --served-model-name {name}
```

### 关键参数

| 参数 | 含义 | 推荐值 |
|---|---|---|
| `tensor-parallel-size` | 张量并行数 | = GPU 数 |
| `gpu-memory-utilization` | 显存占比 | 0.85-0.9 |
| `max-model-len` | 最大上下文 | 按业务 |
| `max-num-seqs` | 并发请求数 | 64-256 |
| `enable-prefix-caching` | 前缀缓存 | 必开 |
| `enable-auto-tool-call` | 工具调用 | 用 Agent 时开 |
| `quantization` | 量化 | awq / gptq / fp8 |

### 部署模式

| 模式 | 适合 |
|---|---|
| 单机单 GPU | 7B-13B 模型 |
| 单机多 GPU（TP） | 30B-70B |
| 多机多 GPU（TP + PP） | 100B+ |
| 多机 Ray cluster | 大规模服务 |

### 与 vLLM 兼容协议

- OpenAI server 协议（默认）
- Anthropic 兼容（通过 LiteLLM）
- 自定义（用 Python SDK）

## 3. vLLM 运维

### 监控指标

- `vllm:num_requests_running` / `num_requests_waiting`
- `vllm:gpu_cache_usage_perc`
- `vllm:cache_hit_rate`
- `vllm:request_success_total`
- TTFT / TPOT / Throughput

### 常见问题

| 问题 | 原因 | 解决 |
|---|---|---|
| OOM | 显存不足 | 降 `gpu_memory_utilization` 或 `max-num-seqs` |
| 启动失败 | 模型文件下载中断 | 用 hf-transfer |
| 延迟抖动 | batch 不饱和 | 加 `max-num-seqs` 或加请求 |
| KV cache 满 | 上下文太长 | 加 GPU 或降 `max-model-len` |
| prefix cache 命中低 | prompt 结构差 | 把固定段放最前 |

## 4. Ollama 部署要点

### 安装

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 拉模型

```bash
ollama pull llama3.1:8b
ollama pull qwen2.5:7b
ollama pull bge-m3
```

### 启动

```bash
ollama serve  # 默认 11434 端口
ollama run llama3.1:8b  # 直接交互
```

### 适用场景

- 个人本地开发与测试
- 数据隐私敏感的本地推理
- CI 跑评估集
- 边缘设备

### 限制

- 单用户为主（多用户吞吐差）
- 模型库有限（主要 GGUF 格式）
- 量化版本为主（质量略降）
- 无 prefix cache 等高级特性

## 5. 模型选择建议

| 场景 | 推荐 |
|---|---|
| 生产对话 | vLLM + Llama 3.x / Qwen / DeepSeek |
| 生产 BRD 生成 | vLLM + Claude / DeepSeek-V3（API）|
| 本地开发测试 | Ollama + 7B 模型 |
| 嵌入向量 | vLLM + bge-m3 或直接 sentence-transformers |
| 多模态 | vLLM + Llama 3.2 Vision |

## 6. 成本对比

| 方案 | 单次成本 | 适合 |
|---|---|---|
| OpenAI / Anthropic API | 按 token 计 | 小规模、原型 |
| vLLM 自部署 GPU | 固定 GPU 成本 | 中大规模、稳定流量 |
| Ollama 本地 | 设备折旧 | 个人 / 开发 |
| 量化 + 边缘 | 极低 | 隐私敏感 |

成本拐点：每月 token 消耗 > $5000 时自部署开始划算。

## 7. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 本地 Ollama 当生产 | 多用户延迟差 | vLLM 或 API |
| vLLM 不开 prefix cache | 性能差 | 必开 |
| 显存塞满 | OOM 频发 | 留 10-15% buffer |
| 不监控 | 故障被动发现 | 上 Prometheus |
| 模型版本固化 | 错过新版改进 | 季度评估新版 |
| 单点部署 | 服务中断无备份 | 多实例 + 负载均衡 |

## 8. 与其他工具关系

- 与 LiteLLM / Portkey：上游统一路由
- 与 Langfuse / Helicone：可观测
- 与 Qdrant / Milvus：RAG 配合
- 与 HuggingFace：模型下载

## 9. 本团队落地情况

- YiVad 推理服务：vLLM 主推理，PagedAttention + prefix caching
- 本地开发：Ollama 跑小模型测试
- 评估：vLLM + bge-m3 跑 embedding，Ollama 跑小评测集

## 10. 参考资料

- vLLM: https://docs.vllm.ai
- Ollama: https://ollama.com
