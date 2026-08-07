---
title: "Model Quantization and Knowledge Distillation: GGUF, GPTQ, AWQ, and Distillation Trade-offs"
aliases:
  - quantization
  - knowledge distillation
  - GGUF
  - GPTQ
  - AWQ
  - model compression
tags:
  - AI
  - foundations
  - quantization
  - distillation
  - model-compression
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
benefit: "Reduce model size by 2-8x and inference cost by 3-10x while preserving 95-99% of quality through quantization and distillation"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - transformer-architecture.md
  - attention-mechanism.md
  - moe-architecture.md
  - ../platform/inference-engine-comparison.md
  - ../methodology/model-finetuning-decision-tree.md
tacit: false
---

# Model Quantization and Knowledge Distillation

> **As an** AI engineer, **I want to** understand quantization and distillation techniques for model compression, **so that** I can deploy large models on constrained hardware without unacceptable quality loss.

> Quantization reduces model weight precision (FP16 -> INT4/INT8); distillation transfers knowledge from a large teacher to a small student. Both serve deployment efficiency but target different bottlenecks.

## Summary

- Quantization reduces the bit-width of model weights and/or activations: FP16 (16-bit) to INT8 (8-bit) or INT4 (4-bit). Memory savings: 2x for INT8, 4x for INT4 (plus overhead).
- Three major quantization formats: GGUF (CPU-first, llama.cpp ecosystem, K-quant types), GPTQ (GPU-first, per-channel, requires calibration data), AWQ (activation-aware, protects salient weights, no backprop needed).
- Knowledge distillation trains a smaller student model to mimic a larger teacher model: output distillation (match logits), feature distillation (match hidden states), or black-box distillation (train on teacher outputs only).
- Quantization is lossy but fast to apply (minutes to hours); distillation is higher-quality but requires training (hours to days) and access to the teacher model.
- The two techniques are complementary: a distilled model can be further quantized, and a quantized model can serve as a teacher for further distillation.

## Core viewpoints

### 1. Quantization format choice depends on deployment target: GGUF for CPU/edge, GPTQ/AWQ for GPU

GGUF (GPT-Generated Unified Format) is the standard for llama.cpp and CPU inference. It supports K-quant types (Q4_K_M, Q5_K_M, etc.) that intelligently allocate bit-width to different layers based on sensitivity. GGUF models run on CPU, Apple Silicon (Metal), and CUDA via llama.cpp. GPTQ and AWQ are GPU-only formats optimized for single-batch inference on CUDA GPUs. GPTQ uses Optimal Brain Quantization to minimize layer-wise reconstruction error; AWQ adds activation-awareness to protect the 1% of salient weight channels that disproportionately affect output quality.

### 2. The quality cliff is real: 4-bit is the practical floor for most tasks

Quantization quality degrades non-linearly with bit-width. INT8 quantization typically causes < 0.5% quality degradation (perplexity increase). INT4 quantization causes 1-5% degradation depending on the model size and quantization method. Below 4 bits (3-bit, 2-bit), quality collapses rapidly -- perplexity can increase by 20-50% and the model becomes unusable for most tasks. Larger models (70B+) tolerate quantization better than smaller models (7B): a 70B model at 4-bit often outperforms a 7B model at FP16.

### 3. Knowledge distillation is the only compression method that can improve a model beyond its inherent capability

Unlike quantization, which only approximates the original model, distillation allows the student model to learn patterns that the teacher discovers but the student could not discover on its own. This is why distillation is the preferred method for creating small, capable models (e.g., Orca, Phi, Gemma). The key insight: the teacher's soft labels (full probability distribution over tokens) contain more information than hard labels (one-hot correct answer), encoding the teacher's uncertainty and alternative plausible answers.

### 4. AWQ's activation-awareness is the practical winner for GPU deployment in 2026

AWQ (Activation-aware Weight Quantization) observes that not all weight channels are equally important: ~1% of channels corresponding to large activation magnitudes have outsized impact on output quality. AWQ scales these salient channels up before quantization and down after, protecting them from quantization error. This requires no backpropagation and only a small calibration dataset, making it faster than GPTQ while achieving better quality at the same bit-width. For production GPU deployments in 2026, AWQ int4 is the default recommendation.

## Key info

### Quantization format comparison

| Format | Target | Bit-widths | Calibration | Speed | Quality at 4-bit | Ecosystem |
|---|---|---|---|---|---|---|
| GGUF | CPU / Metal / CUDA | 2-8 bit, K-quant | Not required | Fast on CPU | Good (Q4_K_M) | llama.cpp, Ollama, LM Studio |
| GPTQ | GPU (CUDA) | 2-8 bit | Required (128 samples) | Fast on GPU | Very good | vLLM, TGI, AutoGPTQ |
| AWQ | GPU (CUDA) | 4 bit | Required (128 samples) | Fast on GPU | Excellent | vLLM, TGI, SGLang |
| BitsAndBytes | GPU (CUDA) | 4/8 bit | Not required | Moderate | Good | HuggingFace transformers |
| FP8 (native) | GPU (H100+) | 8 bit | Not required | Fastest | Near-lossless | vLLM, TensorRT-LLM |

### Quality degradation by model size (perplexity increase vs. FP16 baseline)

| Model size | INT8 | INT4 (AWQ) | INT4 (GGUF) | INT3 |
|---|---|---|---|---|
| 7B | 0.1% | 2-3% | 3-5% | 15-25% |
| 13B | 0.1% | 1-2% | 2-4% | 10-18% |
| 34B | 0.05% | 0.5-1% | 1-3% | 5-12% |
| 70B+ | 0.05% | 0.3-0.5% | 0.5-1.5% | 3-8% |

### Distillation methods

| Method | Access needed | Training cost | Quality | Example models |
|---|---|---|---|---|
| Black-box (output only) | Teacher API | Low | Medium | Alpaca, Vicuna |
| Logit distillation | Teacher logits | Medium | High | Orca, WizardLM |
| Feature distillation | Teacher hidden states | High | Very high | MiniLLM, DistilBERT |
| On-policy distillation | Teacher + RL environment | Very high | Highest | Claude Haiku, Gemini Flash |

### Quantization for fine-tuning: QLoRA

QLoRA (Quantized Low-Rank Adaptation) quantizes the base model to 4-bit (NF4 data type) and adds trainable LoRA adapters in FP16. This enables fine-tuning 70B models on a single 48GB GPU. QLoRA achieves 99% of full fine-tuning quality with 0.2% of the trainable parameters. The NF4 (NormalFloat4) data type is specifically designed for normally distributed weights and outperforms standard INT4 for fine-tuning.

## Action recommendations

1. For GPU production deployment, use AWQ int4 as the default quantization format -- it offers the best quality/speed trade-off.
2. For CPU or edge deployment, use GGUF Q4_K_M as the starting point; move to Q5_K_M if quality is insufficient.
3. For fine-tuning with limited GPU memory, use QLoRA with a 4-bit NF4 base model and FP16 LoRA adapters.
4. When the model size must be reduced by 10x or more, use knowledge distillation rather than aggressive quantization (< 4-bit).
5. Always evaluate the quantized model on your specific task, not just on perplexity benchmarks -- quantization can disproportionately affect certain capabilities (math, reasoning, code).
6. Use the same calibration dataset distribution as your production data for GPTQ/AWQ calibration; mismatched calibration data reduces quality.
7. For multi-GPU serving, FP8 native quantization (H100+) is the best option: near-lossless quality with 2x memory reduction and accelerated compute.

## Anti-patterns

- **Using 3-bit or 2-bit quantization for production**: quality collapses below 4 bits; use distillation if you need more compression.
- **Quantizing a 7B model to 4-bit instead of using a native small model**: a purpose-built small model (Phi-3, Gemma-2B) often outperforms a severely quantized 7B model.
- **Using GGUF for GPU serving**: GGUF is optimized for CPU; use AWQ or GPTQ for GPU inference engines (vLLM, TGI).
- **Calibrating GPTQ/AWQ on generic data (WikiText) when the production task is domain-specific**: calibration data distribution must match the production task.
- **Assuming quantization preserves all capabilities equally**: math, reasoning, and code generation degrade faster than language fluency under quantization.
- **Using distillation without evaluating the student on the teacher's failure modes**: the student can inherit the teacher's biases and errors.

## Related

- Same category: [transformer-architecture-summary.md](./transformer-architecture.md), [attention-mechanism-summary.md](./attention-mechanism.md), [moe-architecture-summary.md](./moe-architecture.md)
- Platform: [../platform/inference-engine-comparison.md](../platform/inference-engine-comparison.md) (which engines support which quantization formats)
- Methodology: [../methodology/model-finetuning-decision-tree.md](../methodology/model-finetuning-decision-tree.md) (QLoRA as a fine-tuning optimization)

## References

- Dettmers et al., 2023 -- *QLoRA: Efficient Finetuning of Quantized LLMs*
- Frantar et al., 2023 -- *GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers*
- Lin et al., 2024 -- *AWQ: Activation-aware Weight Quantization for On-Device LLM Compression and Serving*
- Hinton et al., 2015 -- *Distilling the Knowledge in a Neural Network*