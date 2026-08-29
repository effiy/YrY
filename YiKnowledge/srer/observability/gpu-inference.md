---
title: GPU Inference — Ollama Performance Optimization
aliases: [gpu-inference, ollama-gpu, gpu-optimization, vram]
tags: [sre, observability, gpu, inference, ollama, performance]
category: srer/observability
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, aier, engineer]
benefit: "SREs and AI engineers optimize Ollama GPU inference — right-sizing models, monitoring VRAM, and avoiding OOM kills"
acceptance_criteria:
  - "covers GPU selection, VRAM sizing, and model quantization"
  - "includes YiAi Ollama configuration patterns"
  - "monitoring and alerting for GPU resources"
related:
  - ./README.md
  - ./capacity-and-cost.md
  - ../../aier/platform/llm-comparison.md
  - ../../aier/foundations/llm-fundamentals.md
---

# GPU Inference — Ollama Performance

> **When to use:** When setting up or optimizing Ollama GPU inference for YiAi. GPU inference is fast but expensive — right-sizing saves money and prevents OOM.

## GPU Selection

| GPU | VRAM | Best for | YiAi fit |
|---|---|---|---|
| RTX 3060 (12GB) | 12 GB | 7B models (q4) | Minimum — runs qwen3.5 |
| RTX 4070 (12GB) | 12 GB | 7B models (q8) | Good — faster than 3060 |
| RTX 4090 (24GB) | 24 GB | 14B models (q4), 7B (fp16) | Best single-GPU |
| RTX A6000 (48GB) | 48 GB | 34B models (q4), 14B (fp16) | Production — multi-model |
| 2× RTX 4090 | 48 GB | 70B models (q4) | Large model inference |

## VRAM Sizing

### Model Memory Formula

```
VRAM needed = model_size_GB × quantization_factor + context_overhead

quantization_factor:
  fp16 = 1.0  (full precision)
  q8   = 0.55 (8-bit quantization)
  q4   = 0.30 (4-bit quantization)
  q2   = 0.18 (2-bit quantization)

context_overhead = (context_window / 1024) × 0.1 GB
```

### YiAi Model Sizing

| Model | Quantization | VRAM | GPU | Context |
|---|---|---|---|---|
| qwen3.5 (7B) | q4_K_M | ~4.5 GB | 12 GB GPU | 8192 |
| qwen3.5 (7B) | q8_0 | ~7 GB | 12 GB GPU | 8192 |
| qwen3-coder (7B) | q4_K_M | ~4.5 GB | 12 GB GPU | 8192 |
| deepseek-v4 (20B) | q4_K_M | ~12 GB | 24 GB GPU | 8192 |

## Ollama Configuration

```yaml
# YiAi config.yaml — Ollama settings
ollama:
  host: "http://localhost:11434"
  model: "qwen3.5:7b-q4_K_M"
  num_ctx: 8192
  num_gpu: 1              # Number of GPU layers (0 = CPU only)
  gpu_memory_limit: 10    # GB — leave 2GB for system
```

### GPU Layer Control

```bash
# Check which layers are on GPU
curl http://localhost:11434/api/show -d '{"name": "qwen3.5:7b-q4_K_M"}' | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(f'GPU layers: {d.get(\"num_gpu\",\"?\")}')"

# Force specific GPU layers
ollama run qwen3.5:7b-q4_K_M --num-gpu 20  # 20 layers on GPU
```

## Monitoring GPU

### Key Metrics

```bash
# GPU utilization and VRAM
nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu \
  --format=csv,noheader

# Watch mode (1s interval)
watch -n 1 nvidia-smi
```

### Python Monitoring

```python
import subprocess
import json

def get_gpu_stats():
    """Get GPU stats for monitoring."""
    result = subprocess.run(
        ['nvidia-smi', '--query-gpu=utilization.gpu,memory.used,memory.total',
         '--format=csv,noheader,nounits'],
        capture_output=True, text=True
    )
    util, mem_used, mem_total = result.stdout.strip().split(', ')
    return {
        'gpu_utilization_pct': float(util),
        'vram_used_mb': float(mem_used),
        'vram_total_mb': float(mem_total),
        'vram_used_pct': float(mem_used) / float(mem_total) * 100,
    }
```

### Alert Thresholds

| Metric | Warning | Critical |
|---|---|---|
| GPU utilization | > 90% for 10 min | > 95% for 5 min |
| VRAM usage | > 80% | > 95% |
| GPU temperature | > 80°C | > 85°C |

## Performance Optimization

| Technique | Impact | Effort |
|---|---|---|
| **Quantization** (fp16 → q4) | 70% less VRAM | Low — use q4 model |
| **Batch inference** | 2-3× throughput | Medium — batch similar requests |
| **Model caching** | 0 latency on cache hit | Low — Ollama default |
| **Flash attention** | 20-30% faster | Low — enable in Ollama |
| **Multi-GPU** | Linear scaling | High — split model across GPUs |

## Troubleshooting

### OOM (Out of Memory)

```
Symptom: CUDA out of memory error
Cause: Model + context exceeds VRAM
Fix: Reduce context window or use lower quantization
```

```bash
# Reduce context window
ollama run qwen3.5:7b --num-ctx 4096  # from 8192

# Use lower quantization
ollama pull qwen3.5:7b-q4_0  # from q4_K_M
```

### Slow Inference

```bash
# Check if model is on GPU
curl http://localhost:11434/api/ps
# Look for "gpu" in the response

# If CPU-only, check CUDA availability
nvidia-smi  # Should show GPU
ollama --version  # Should show CUDA support
```

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| No GPU monitoring | OOM kills go unnoticed; users get errors | Monitor GPU util + VRAM; alert at 80% |
| fp16 for 7B model on 12GB GPU | OOM on first request with context | Use q4 or q8 quantization |
| CPU-only inference | 10-50× slower; users wait minutes | Use GPU; even a 12GB consumer GPU is transformative |
| No model pre-warming | First request takes 30s+ to load model into VRAM | Pre-warm in deploy script; health check validates model loaded |