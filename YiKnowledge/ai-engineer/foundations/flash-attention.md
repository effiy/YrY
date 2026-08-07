---
title: "Flash Attention: Memory-Efficient Exact Attention for Transformer Inference and Training"
aliases:
  - Flash Attention
  - FlashAttention
  - FlashAttention-2
  - FlashAttention-3
  - efficient attention
  - IO-aware attention
tags:
  - AI
  - foundations
  - attention
  - flash-attention
  - memory-efficiency
  - transformer
category: ai-engineer/foundations
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
  - ai-engineer
  - engineer
benefit: "Achieve 2-8x faster attention computation and 10-20x memory savings for long sequences by restructuring the attention algorithm to be IO-aware"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - attention-mechanism.md
  - transformer-architecture.md
  - kv-cache-inference-optimization.md
  - long-context-techniques.md
  - ../platform/inference-engine-comparison.md
tacit: false
---

# Flash Attention

> **As an** AI engineer, **I want to** understand Flash Attention and efficient transformer architectures, **so that** I can train and serve models with long contexts without running out of memory.

> Flash Attention is not an approximation -- it computes exact attention with a mathematically identical result, but reorders the computation to minimize GPU memory reads/writes (HBM access), the true bottleneck of attention.

## Summary

- Standard attention is memory-bandwidth bound: the `N x N` attention matrix (where N is the sequence length) must be materialized in GPU HBM, requiring O(N^2) memory and HBM reads/writes.
- Flash Attention uses tiling and online softmax to compute exact attention block-by-block in SRAM (on-chip memory), never materializing the full attention matrix in HBM.
- Memory complexity drops from O(N^2) to O(N) -- a 4K sequence uses ~64MB with Flash Attention vs. ~1.2GB with standard attention.
- Flash Attention-2 (2023) improved parallelism (over sequence length, not just batch/heads) and reduced non-matmul FLOPs, achieving 2x speedup over v1.
- Flash Attention-3 (2024) leverages Hopper GPU features (FP8, TMA, WGMMA) for another 1.5-2x speedup on H100 GPUs.
- Nearly all modern LLM frameworks (PyTorch 2.0+, HuggingFace, vLLM, SGLang) use Flash Attention as the default attention backend.

## Core viewpoints

### 1. The key insight is IO-awareness: GPU compute is fast, HBM bandwidth is the bottleneck

On an A100 GPU, the theoretical peak compute is 312 TFLOPS (FP16), but HBM bandwidth is only 2 TB/s. Standard attention writes the full N x N attention matrix to HBM, then reads it back for softmax and the V multiplication. For N = 4096, this is 67 million elements (134 MB), making the operation entirely memory-bandwidth bound. Flash Attention keeps the attention matrix in SRAM (19 MB on A100, fast but small), processes it in tiles, and only writes the final output to HBM. This converts the operation from bandwidth-bound to compute-bound.

### 2. Online softmax is the mathematical trick that enables tiling

Standard softmax requires two passes over the data: one to compute the max (for numerical stability) and one to compute the sum of exponentials. This seems to require the full row in memory. The online softmax algorithm computes the softmax incrementally: as each block arrives, it updates the running max and rescales the running sum, producing the exact same result as the two-pass version. This is the core mathematical insight that makes tiled attention possible without approximation.

### 3. Flash Attention-2's key improvement is parallelizing over the sequence length dimension

Flash Attention v1 parallelized over batch and head dimensions only. For small batch sizes with long sequences, this underutilized the GPU. Flash Attention-2 added an additional parallelization dimension over the sequence length, enabling better GPU utilization across all batch sizes. It also reduced non-matmul operations (rescaling, masking) from O(N^2) to O(N) by restructuring the inner loop. Combined, these changes deliver 2x speedup over v1 for typical sequence lengths.

### 4. Flash Attention is not a replacement for all attention optimization; it complements KV cache, GQA, and sparse attention

Flash Attention reduces the memory cost of the attention computation itself, but it does not reduce the number of KV cache entries stored across requests. For long-context serving, Flash Attention should be combined with: (a) PagedAttention (vLLM) for efficient KV cache memory management, (b) GQA/MQA (Grouped/Multi-Query Attention) to reduce KV cache size, and (c) continuous batching to maximize throughput. These techniques address different bottlenecks and are complementary.

## Key info

### Flash Attention version comparison

| Version | Year | Key innovation | Hardware | Speedup vs. standard | Memory saving |
|---|---|---|---|---|---|
| Flash Attention v1 | 2022 | Tiling + online softmax | A100 | 2-4x | 10-20x |
| Flash Attention v2 | 2023 | Parallel over seqlen, reduced non-matmul | A100 | 4-8x | 10-20x |
| Flash Attention v3 | 2024 | FP8, TMA, WGMMA (Hopper) | H100 | 6-12x | 10-20x |

### Memory comparison (FP16, single head, batch=1)

| Sequence length | Standard attention | Flash Attention | Ratio |
|---|---|---|---|
| 2K | 16 MB | 8 MB | 2x |
| 4K | 64 MB | 12 MB | 5.3x |
| 8K | 256 MB | 16 MB | 16x |
| 16K | 1 GB | 24 MB | 42x |
| 32K | 4 GB | 40 MB | 102x |
| 128K | 64 GB | 140 MB | 468x |

### Hardware support

| GPU | Flash Attn v1 | Flash Attn v2 | Flash Attn v3 |
|---|---|---|---|
| A100 (Ampere, SM80) | Yes | Yes | No |
| A6000 (Ampere) | Yes | Yes | No |
| H100 (Hopper, SM90) | Yes | Yes | Yes |
| RTX 4090 (Ada) | Yes | Yes | No |
| RTX 3090 (Ampere) | Yes | Yes | No |
| Apple M1/M2/M3 | No (Metal) | No | No |
| AMD MI300X | No (ROCm fork) | Partial | No |

### Installation and integration

Flash Attention is available as a pip package (`flash-attn`) and is integrated into major frameworks:
- **PyTorch 2.0+**: `torch.nn.functional.scaled_dot_product_attention()` with `backend="flash"` or automatic selection
- **HuggingFace Transformers**: set `use_flash_attention_2=True` in model config
- **vLLM**: enabled by default; uses Flash Attention for prefill and PagedAttention for decode
- **SGLang**: uses Flash Attention for prefill and RadixAttention for decode
- **Axolotl / Unsloth**: auto-detects and enables Flash Attention

### When Flash Attention provides the most benefit

- **Long sequences (> 4K tokens)**: speedup and memory savings scale with sequence length
- **Training**: the O(N) memory enables training with 8K-32K sequence lengths that would be impossible with standard attention
- **High-resolution images in vision transformers**: ViT with 1024x1024 patches produces N=4096 tokens, making Flash Attention essential
- **Large batch inference**: memory savings allow larger batch sizes, increasing throughput

## Action recommendations

1. Always install Flash Attention-2 (`pip install flash-attn --no-build-isolation`) on Ampere and newer GPUs; it is the default attention backend for all modern LLM frameworks.
2. On H100 GPUs, use Flash Attention-3 for an additional 1.5-2x speedup; note the separate installation and CUDA 12.3+ requirement.
3. Verify Flash Attention is active by checking the model config or framework logs; a common silent failure is Flash Attention not compiling and falling back to standard attention.
4. For long-context serving, combine Flash Attention with PagedAttention (vLLM) or RadixAttention (SGLang) for KV cache management -- they address different bottlenecks.
5. For Apple Silicon or AMD GPUs, use the PyTorch 2.0+ SDPA backend, which provides a memory-efficient attention kernel (not Flash Attention but similar benefits).
6. Monitor GPU memory usage before and after enabling Flash Attention; if memory savings are not observed, Flash Attention may not be active.

## Anti-patterns

- **Not verifying Flash Attention is actually running**: many installations silently fall back to standard attention. Always check the log output or benchmark memory usage.
- **Using Flash Attention v1 in 2026**: v2 has been the default since 2023 and is universally faster. Upgrade.
- **Expecting Flash Attention to solve KV cache memory pressure**: Flash Attention reduces attention computation memory, not KV cache storage. Use PagedAttention and GQA for KV cache.
- **Installing Flash Attention on GPUs without Ampere or newer**: Flash Attention requires SM80+ (A100, A6000, RTX 3090, RTX 4090, H100). Older GPUs (V100, T4) cannot use it.
- **Using Flash Attention as a substitute for sparse attention**: if you need to process 1M+ token sequences, even Flash Attention's O(N) memory is too much; use sparse attention or Ring Attention.

## Related

- Same category: [attention-mechanism-summary.md](./attention-mechanism.md), [transformer-architecture-summary.md](./transformer-architecture.md), [kv-cache-inference-optimization-summary.md](./kv-cache-inference-optimization.md), [long-context-techniques-summary.md](./long-context-techniques.md)
- Platform: [../platform/inference-engine-comparison.md](../platform/inference-engine-comparison.md) (engine support for Flash Attention)

## References

- Dao et al., 2022 -- *FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness*
- Dao, 2023 -- *FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning*
- Shah et al., 2024 -- *FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision*
- Official repository: https://github.com/Dao-AILab/flash-attention