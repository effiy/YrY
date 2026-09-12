---
title: GPU 推理 — Ollama 性能优化
aliases: [gpu-inference, ollama-gpu, gpu-optimization, vram]
tags: [sre, observability, gpu, inference, ollama, performance]
category: srer/observability
created: 2026-08-24
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, aier, engineer]
benefit: "SRE 和 AI 工程师优化 Ollama GPU 推理——合理选择模型大小、监控显存使用、避免显存溢出"
acceptance_criteria:
  - "覆盖 GPU 选型、显存估算和模型量化"
  - "包含 YiAi Ollama 配置模式"
  - "GPU 资源监控和告警"
related:
  - ./README.md
  - ./01-可观测-容量与成本.md
  - ../../aier/platform/大模型对比.md
  - ../../aier/foundations/大模型基础.md
---

# GPU 推理 — Ollama 性能优化

> **适用场景**：为 YiAi 配置或优化 Ollama GPU 推理时。GPU 推理速度快但成本高——合理配置节省开支并防止显存溢出。

## 为什么 GPU 推理需要 SRE 关注

Ollama 的 GPU 推理是 YiAi 系统中最昂贵的资源消耗点。与 CPU 和内存不同，GPU 显存是一次性的硬限制——一旦模型和上下文超出显存容量，推理彻底失败，而非缓慢降级。

| 关注点 | CPU/内存 | GPU 显存 |
|---|---|---|
| **耗尽时的行为** | 性能逐渐下降（swap）| 直接 OOM 错误，推理失败 |
| **扩容成本** | 相对低 | 高昂（GPU 硬件固定）|
| **监控需求** | 利用率趋势 | 利用率 + 显存使用绝对值 |
| **优化手段** | 增加内存、优化代码 | 模型量化、减少上下文窗口、模型选择 |

## GPU 选型指南

| GPU | 显存 | 最适合 | YiAi 适用场景 |
|---|---|---|---|
| RTX 3060 (12GB) | 12 GB | 7B 模型 (q4) | **最低配置**——可运行 qwen3.5 7B q4 |
| RTX 4070 (12GB) | 12 GB | 7B 模型 (q8) | 良好——比 3060 更快 |
| RTX 4090 (24GB) | 24 GB | 14B 模型 (q4)、7B (fp16) | **最佳单卡**——性价比最高 |
| RTX A6000 (48GB) | 48 GB | 34B 模型 (q4)、14B (fp16) | 生产级——支持多模型并行 |
| 2x RTX 4090 | 48 GB | 70B 模型 (q4) | 大模型推理 |

**选型建议**：
- 开发环境：RTX 3060 (12GB) 足够运行 7B q4 模型
- 生产环境：RTX 4090 (24GB) 可运行 14B q4 或 7B fp16
- 多模型并行：RTX A6000 (48GB) 可同时加载多个模型

## 显存估算

### 模型内存计算公式

```
所需显存 = 模型参数量(GB) × 量化因子 + 上下文开销

量化因子对照：
  fp16（全精度）= 1.0
  q8（8位量化） = 0.55
  q4（4位量化） = 0.30
  q2（2位量化） = 0.18

上下文开销 = (上下文窗口大小 / 1024) × 0.1 GB
```

### YiAi 常用模型显存估算

| 模型 | 量化方式 | 所需显存 | 最低 GPU | 建议上下文窗口 |
|---|---|---|---|---|
| qwen3.5 (7B) | q4_K_M | ~4.5 GB | 12 GB | 8192 |
| qwen3.5 (7B) | q8_0 | ~7 GB | 12 GB | 8192 |
| qwen3-coder (7B) | q4_K_M | ~4.5 GB | 12 GB | 8192 |
| qwen3.5 (14B) | q4_K_M | ~7 GB | 24 GB | 8192 |
| deepseek-v4 (20B) | q4_K_M | ~12 GB | 24 GB | 8192 |

**估算示例**：qwen3.5 7B 使用 q4_K_M 量化，上下文窗口 8192：
- 模型本身：7 × 0.30 = 2.1 GB
- 量化开销 + KV Cache：约 2.4 GB
- 合计约 4.5 GB——12GB 显卡完全够用，留有充足余量

## Ollama 配置

```yaml
# YiAi config.yaml — Ollama 设置
ollama:
  host: "http://localhost:11434"
  model: "qwen3.5:7b-q4_K_M"
  num_ctx: 8192          # 上下文窗口大小
  num_gpu: 1             # GPU 层数（0 = 纯 CPU）
  gpu_memory_limit: 10   # GB——为系统保留 2GB（12GB 显卡场景）
```

### GPU 层控制

```bash
# 检查当前模型在 GPU 上的层数
curl http://localhost:11434/api/show -d '{"name": "qwen3.5:7b-q4_K_M"}' | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(f'GPU 层数: {d.get(\"num_gpu\",\"?\")}')"

# 强制指定 GPU 层数（调试性能瓶颈用）
ollama run qwen3.5:7b-q4_K_M --num-gpu 20  # 20 层在 GPU 上运行
```

## GPU 监控

### 关键监控指标

```bash
# GPU 利用率和显存实时查看
nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu \
  --format=csv,noheader

# 持续监控模式（每秒刷新）
watch -n 1 nvidia-smi
```

### Python 监控脚本

```python
import subprocess

def get_gpu_stats():
    """获取 GPU 统计数据，用于对接监控系统。"""
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

### GPU 告警阈值

| 指标 | 警告阈值 | 严重阈值 | 说明 |
|---|---|---|---|
| GPU 利用率 | 持续 10 分钟 > 90% | 持续 5 分钟 > 95% | 高利用率说明推理请求排队 |
| 显存使用率 | > 80% | > 95% | 接近限制时，长上下文请求可能 OOM |
| GPU 温度 | > 80°C | > 85°C | 高温会导致 GPU 降频保护，推理变慢 |

## 性能优化策略

| 技术 | 效果 | 投入 | 说明 |
|---|---|---|---|
| **模型量化** (fp16 → q4) | 显存降低 70% | 低 — 直接使用 q4 量化模型 | 精度损失极小，性价比最高 |
| **批量推理** | 吞吐量提升 2-3 倍 | 中 — 需要批量处理相似请求 | 适合离线处理场景，在线聊天不适用 |
| **模型缓存** | 缓存命中时延迟为 0 | 低 — Ollama 默认启用 | 热门问题可缓存结果 |
| **Flash Attention** | 推理速度提升 20-30% | 低 — 在 Ollama 中启用 | 对长上下文窗口效果明显 |
| **多 GPU** | 线性扩展 | 高 — 需要多 GPU 硬件 | 单模型拆分到多 GPU 运行 |

## 故障排查

### 显存溢出 (OOM)

```
症状：CUDA out of memory 错误
原因：模型 + 上下文窗口超过显存容量
修复：缩小上下文窗口或使用更低量化
```

```bash
# 缩小上下文窗口（从 8192 缩到 4096）
ollama run qwen3.5:7b --num-ctx 4096

# 使用更低量化版本
ollama pull qwen3.5:7b-q4_0  # 从 q4_K_M 降级
```

### 推理速度慢

```bash
# 检查模型是否在 GPU 上运行
curl http://localhost:11434/api/ps
# 查看响应中是否包含 "gpu" 字段

# 如果模型在 CPU 上运行，检查 CUDA 可用性
nvidia-smi                     # 应显示 GPU 信息
ollama --version               # 应显示 CUDA 支持
```

**推理速度慢的常见原因**：
1. 模型太大，被挤到 CPU 上运行（部分或全部层）
2. GPU 温度过高，触发了降频保护
3. 上下文窗口设置过大，KV Cache 占用过多计算资源

## 常见反模式

| 反模式 | 为何失败 | 正确做法 |
|---|---|---|
| 无 GPU 监控 | 显存溢出 (OOM) 被遗漏；用户遇到错误才发现 | 监控 GPU 利用率 + 显存；在 80% 时告警 |
| 12GB 显卡运行 7B 模型的 fp16 版本 | 首次请求就 OOM（模型 14GB + 上下文开销 > 12GB）| 使用 q4 或 q8 量化版本 |
| 纯 CPU 推理 | 比 GPU 慢 10-50 倍；用户需等待数分钟 | 使用 GPU；即使一张 12GB 消费级显卡也有质的飞跃 |
| 模型未预加载 | 首次请求需 30 秒以上将模型加载到显存 | 在部署脚本中预加载模型；健康检查验证模型已加载就绪 |