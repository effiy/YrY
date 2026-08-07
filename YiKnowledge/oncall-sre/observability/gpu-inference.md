---
title: GPU inference deployment
aliases:
- gpu-inference
- gpu-deployment
- model-serving
- gpu-scheduling
- inference-optimization
tags:
- gpu
- inference
- deployment
- mlops
- model-serving
- kubernetes
category: oncall-sre/observability
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- oncall-sre
- ai-engineer
- engineer
- tech-lead
benefit: "teams can deploy GPU inference workloads reliably with efficient scheduling, cost optimization, and auto-scaling"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./docker-kubernetes.md
- ./containerized-deployment.md
- ./observability-triad.md
- ../../ai-engineer/platform/inference-engine-comparison.md
- ../../ai-engineer/platform/llm-observability-comparison.md
tacit: false
---

# GPU inference deployment

> **As an** oncall SRE, **I want to** deploy GPU inference workloads reliably, **so that** model serving is efficient, cost-effective, and scales with demand.

> GPU inference deployment is fundamentally different from CPU deployment: GPUs are expensive, scarce, and have unique scheduling, cooling, and utilization characteristics. A GPU at 30% utilization costs as much as a GPU at 90% utilization -- the goal is to maximize throughput per GPU-hour.

## Summary

- GPU inference requires specialized scheduling: GPU-aware Kubernetes schedulers, node taints/tolerations, and GPU time-slicing or MIG (Multi-Instance GPU) for sharing.
- Model serving frameworks (vLLM, TensorRT-LLM, TGI) handle batching, KV-cache management, and memory optimization. Choosing the right framework can 10x throughput.
- GPU cost is the dominant factor: a single A100 costs $2-4/hour on cloud. Cost optimization strategies include spot instances, model quantization, and right-sizing.
- Auto-scaling GPU workloads is challenging because GPU provisioning is slow (minutes), unlike CPU (seconds). Over-provisioning is expensive; under-provisioning causes timeouts.
- GPU observability requires different metrics than CPU: GPU utilization, memory bandwidth, tensor core utilization, NVLink throughput, and thermal throttling.

## Core viewpoints

### 1. GPU utilization is the most important metric, but it is misleading

GPU utilization reported by `nvidia-smi` measures kernel execution time, not compute efficiency. A GPU can show 100% utilization while only using 30% of its tensor cores. Track GPU SM (Streaming Multiprocessor) utilization, memory bandwidth utilization, and tensor core utilization separately. The goal is to maximize tensor core utilization for inference workloads, not just GPU utilization.

### 2. Continuous batching is the single biggest throughput lever

Static batching waits for a full batch or a timeout. Continuous batching (vLLM, TensorRT-LLM) dynamically adds and removes requests from the batch as they complete. This can increase throughput by 5-10x compared to static batching. Continuous batching is table stakes for production LLM serving -- do not deploy without it.

### 3. KV-cache management determines maximum concurrency

The KV-cache stores attention keys and values for each token in the context. For a 70B model with 8K context on an A100 (80GB), the KV-cache can consume 30-50% of GPU memory. Efficient KV-cache management (paged attention in vLLM, prefix caching) allows more concurrent requests without OOM. Monitor KV-cache utilization as a primary metric alongside GPU memory.

### 4. GPU auto-scaling is fundamentally different from CPU auto-scaling

GPU instances take 2-5 minutes to start (driver loading, model loading, warm-up). CPU instances take seconds. This means reactive auto-scaling (scale up when queue depth grows) causes timeouts. GPU scaling requires predictive approaches: scheduled scaling for known traffic patterns, pre-warming during off-peak hours, and maintaining a buffer of idle GPU capacity.

## Key info

### Model serving frameworks comparison

| Framework | Batching | KV-cache | GPU memory | Throughput | Best for |
|---|---|---|---|---|---|
| vLLM | Continuous | PagedAttention | Efficient | Very high | General LLM serving |
| TensorRT-LLM | Continuous + inflight | Optimized | Best | Highest | Maximum throughput, NVIDIA GPUs |
| TGI (HuggingFace) | Continuous | Standard | Good | High | HuggingFace ecosystem |
| Triton Inference Server | Dynamic | Custom | Good | High | Multi-model serving |
| Ollama | None | Basic | Low | Low | Local development only |

### GPU scheduling strategies

| Strategy | Mechanism | GPU sharing | Isolation | Complexity |
|---|---|---|---|---|
| Time-slicing | GPU operator time-slicing config | Yes (time-based) | Weak | Low |
| MIG (Multi-Instance GPU) | Hardware partitioning (A100, H100) | Yes (hardware) | Strong | Medium |
| GPU Fractional | GPU operator fractional config | Yes (memory + compute) | Medium | Low |
| MPS (Multi-Process Service) | NVIDIA MPS daemon | Yes (process-level) | Weak | Low |
| Dedicated | 1 pod : 1 GPU | No | Strongest | Lowest |

### Cost optimization strategies

1. **Model quantization**: FP16 -> INT8 (2x memory savings, minimal quality loss). INT4 with AWQ or GPTQ (4x savings, 1-3% quality loss). Assess quality impact with your evaluation set before deploying.
2. **Spot/preemptible instances**: Use for batch inference and non-critical workloads. Save 60-80% vs. on-demand. Always have a fallback to on-demand or a checkpointing strategy.
3. **Right-sizing GPU**: Not every model needs an A100. A 7B model with INT4 quantization runs on a T4. Benchmark on your target GPU before deploying.
4. **Multi-model serving**: Serve multiple fine-tuned LoRA adapters from a single base model deployment. Reduces GPU count by 3-10x for multi-model scenarios.
5. **Speculative decoding**: Use a small draft model to generate candidate tokens, verified by the large model. 2-3x throughput improvement for low-latency scenarios.

### GPU observability metrics

| Metric | What it measures | Alert threshold |
|---|---|---|
| GPU utilization | Kernel execution time | < 50% sustained = over-provisioned |
| GPU memory utilization | Total GPU memory used | > 90% = risk of OOM |
| SM utilization | Streaming multiprocessor activity | Core compute metric; target > 70% |
| Tensor core utilization | Tensor core activity | For inference; target > 50% |
| Memory bandwidth utilization | Memory throughput vs. theoretical max | For large models; target > 60% |
| NVLink throughput | Inter-GPU communication | For multi-GPU; abnormal if < 10% of expected |
| GPU temperature | Thermal state | > 80C = throttling risk |
| Throttle reason | Why GPU is throttled | Any throttle = investigate |
| KV-cache utilization | Cache blocks used vs. available | > 85% = risk of preemption |

### Auto-scaling architecture

**For predictable workloads:**
- Scheduled scaling: scale to N replicas at 8 AM, scale to M at 8 PM based on historical traffic patterns.
- Pre-warming: start new replicas 15 minutes before expected traffic increase.

**For variable workloads:**
- Queue-depth based scaling: scale when pending requests > threshold.
- Latency-based scaling: scale when P95 latency > target.
- GPU utilization-based scaling: scale when GPU utilization > 80% sustained for 5 minutes.

**Key constraint**: Model loading time (2-5 minutes) means new replicas cannot serve traffic immediately. Maintain a buffer of 10-20% idle capacity.

## Action recommendations

1. Deploy with vLLM or TensorRT-LLM for production LLM serving; continuous batching is the minimum bar.
2. Set up GPU observability with DCGM (Data Center GPU Manager) exporting to Prometheus; track SM utilization, memory bandwidth, and KV-cache separately.
3. Implement model quantization (INT8 or INT4) to reduce GPU memory and increase throughput; validate quality with your evaluation benchmark.
4. Use a GPU-aware scheduler (GPU operator with time-slicing or MIG) to share GPUs across workloads when utilization is below 50%.
5. Configure GPU auto-scaling with a buffer of pre-warmed replicas; rely on scheduled scaling for predictable patterns, reactive scaling for bursts.
6. Use spot instances for batch inference and non-critical workloads with a fallback to on-demand.
7. Set alerts for: GPU memory > 90%, KV-cache utilization > 85%, GPU temperature > 80C, P95 latency > 2x baseline.

## Anti-patterns

- **Using Ollama or raw transformers in production** -- these are for development and experimentation. Use vLLM, TensorRT-LLM, or TGI for production serving.
- **1 pod : 1 GPU without utilization monitoring** -- if GPU utilization is 20%, you are wasting 80% of the cost. Use GPU sharing or downsize.
- **No KV-cache monitoring** -- KV-cache OOM is the most common production GPU failure. Monitor it.
- **Reactive-only auto-scaling** -- GPU provisioning takes minutes. By the time the new replica is ready, the traffic spike has already caused timeouts.
- **No model warm-up** -- the first request after model loading is 10-100x slower than subsequent requests. Always warm up models with a few inference requests before serving traffic.
- **Ignoring GPU throttling** -- thermal throttling silently reduces throughput. Monitor GPU temperature and throttling reasons.
- **Using on-demand instances for all workloads** -- batch inference, development, and staging can use spot instances. Save 60-80%.

## Related

- Same category: [./docker-kubernetes.md](./docker-kubernetes.md) -- container observability
- Same category: [./containerized-deployment.md](./containerized-deployment.md) -- deployment strategies
- Same category: [./observability-triad.md](./observability-triad.md) -- logs, metrics, traces
- Upstream: [../../ai-engineer/platform/inference-engine-comparison.md](../../ai-engineer/platform/inference-engine-comparison.md) -- inference engine comparison
- Upstream: [../../ai-engineer/platform/llm-observability-comparison.md](../../ai-engineer/platform/llm-observability-comparison.md) -- LLM observability

## References

- vLLM -- official documentation (PagedAttention, continuous batching)
- NVIDIA -- TensorRT-LLM documentation
- NVIDIA -- DCGM (Data Center GPU Manager) documentation
- Kubernetes -- GPU operator and MIG documentation
- HuggingFace -- TGI (Text Generation Inference) documentation