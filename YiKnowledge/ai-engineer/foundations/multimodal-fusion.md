---
title: Multimodal Fusion (CLIP / LLaVA) 
aliases:
- multimodal fusion
- CLIP
- LLaVA
- vision language model
tags:
- AI
- basic
- multimodal
- CLIP
- LLaVA
category: ai-engineer/foundations
created: 2026-07-31
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- ai-engineer
benefit: foundations solid
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- transformer-architecture.md
- long-context-techniques.md
tacit: false
---

# Multimodal Fusion (CLIP / LLaVA) 

> **As a** an ai engineer, **I want to** multimodal fusion, **so that** foundations solid. 

> Object markers / visual / audio signals are mapped to the semantic space the LLM can handle. Two classes of typical architectures: alignment (CLIP) and fusion (LLaVA). 

## Summary
- Alignment (CLIP): dual-tower contrastive learning, text and image encoded to the same space, only learning alignment, zero-shot image classification
- Fusion (LLaVA / Qwen-VL): visual features as tokens fed into the LLM, can generate multimodal content
- LLaVA two stages: feature alignment (freeze LLM and ViT, only train projection layer) + instruction fine-tuning
- Visual token count is large (one image = 256-576 tokens); high resolution needs patch splitting or token compression
- General VLMs are weak at OCR / counting / spatial relationships; need specialized solutions or tool assistance

## Core viewpoints
- **Alignment vs. fusion are two paths** — CLIP can only retrieve / classify, cannot generate; LLaVA can generate but visual token count is large
- **CLIP dual-tower is computationally efficient** — text can be pre-encoded, image only computed one-shot
- **LLaVA architecture is extremely simple and engineer-friendly** — visual encoder + projection layer + LLM; after 1.5/1.6 capability approaches GPT-4V
- **Visual token count is the core constraint** — one image = 256-576 tokens; high resolution blows up context
- **Hallucination is a chronic VLM issue** — faithfulness post-processing + citation mechanism is a must

## Key information

### Concept breakdown

#### CLIP: contrastive learning alignment

Dual-tower: image encoder (ViT) + text encoder (Transformer). Within the same batch, (image, text) positive pairs pull closer, cross-batch negative pairs push apart, InfoNCE loss. 

```
image encoder -> img_embed
text encoder -> text_embed
loss = -log( exp(sim(img, text_pos) / τ) / Σ exp(sim(img, text_i) / τ) )
```

Training data: 400 million pairs (image, caption) scraped from the web. Zero-shot image classification is a byproduct: for unseen classes, encode the text "a photo of a {class}", and compare image embedding similarity to classify. 

#### LLaVA: visual instruction following

Visual encoder (CLIP-ViT) + adapter projection layer + LLM. Image passes through encoder to visual tokens, projected to LLM embedding space, and concatenated with text tokens fed into LLM. 

```
Image -> ViT -> image_features -> Projection -> image_tokens
Text -> tokenizer -> text_tokens
[image_tokens, text_tokens] -> LLM -> output text
```

Training two stages: 
1. **Feature alignment**: freeze LLM and ViT, only train the projection layer; use image-text pairs to let the projection layer learn to align object-marker visual features to the LLM space
2. **Instruction fine-tuning**: unfreeze projection layer (optionally LLM LoRA), train on "image + instruction-answer" pairs

Data generation: use GPT-4 to expand object-marker captions + bounding box descriptions of images into multimodal instruction data. 

### Key parameters / formulas / data

#### Comparison with other mainstream solutions

| solution | path |
|---|---|
| Flamingo | Perceiver Resampler compresses visual features + cross attention fusion |
| BLIP-2 | Q-Former learns a few query tokens to extract visual information |
| Qwen-VL | ViT + Adapter + LLM, Chinese-friendly |
| Llama 3.2-Vision | adapts Llama to accept visual encoder |
| Gemini | native multimodal (multimodal from pretraining onward) |
| GPT-4V / Claude Vision | closed-source flagships |

#### Adapter layer choices

| type | characteristic |
|---|---|
| Linear projection | simplest |
| MLP (two-three layers) | LLaVA-1.5 mainstream |
| Q-Former / Perceiver | compress tokens |
| Pixel Shuffle | reduce token count |

#### Evaluation methods

| task | benchmark |
|---|---|
| image captioning | COCO caption (CIDEr / BLEU) |
| VQA | VQAv2 / OK-VQA / MMBench |
| reasoning | MMMU / MME / MMBench |
| OCR | TextVQA / OCRBench |
| video | MVBench / Video-MME |
| hallucination | POPE / HallusionBench |

### Application scenarios
- Image-text RAG (image + document joint retrieval) 
- Visual QA (product screenshot asking "how to use this button") 
- OCR + content understanding (invoices, tables) 
- Video / monitoring event description
- Multimodal chat (users upload images and ask questions) 
- Internal team: evaluation in progress — whether YiVad should introduce VLM to support users uploading screenshots as context; YiAi BRD after-sale on-site photos as auxiliary evidence

## Action recommendations
1. For retrieval / classification scenarios use CLIP; for generation scenarios use LLaVA-class fusion architecture
2. Visual encoder prefer ViT-L / ViT-G, resolution 224 or 336; high resolution split patches (AnyRes) or dynamic resolution
3. Adapter layer start with MLP (two-three layers); for token-compression needs use Q-Former / Perceiver
4. Training two stages: feature alignment (freeze LLM + ViT) -> instruction fine-tuning (unfreeze projection layer, optionally LLM LoRA) 
5. Visual instruction data quality > quantity; data ratio caption / VQA / OCR / reasoning / multi-turn chat
6. Optimization: visual encoder and LLM can split GPU; visual encoder can batch pre-process and cache

## Anti-patterns
- **Using LLaVA for retrieval scenarios** — dual-tower CLIP is the efficient choice for retrieval / classification; fusion architecture is wasteful
- **High resolution without patch splitting** — visual tokens blow up context; must use AnyRes or dynamic resolution
- **Only training instruction fine-tuning without feature alignment** — projection layer not aligned to LLM space; poor effect
- **Using general VLM for OCR** — general VLMs are weak at OCR / counting / spatial relationships; need specialized OCR + VLM combination
- **Ignoring hallucination** — VLMs will fabricate objects not in the image; must add faithfulness post-processing + citation mechanism
- **Multi-image input without limits** — each image in a single request occupies tokens; use image count limit + pick the most relevant N images


- **Fine-tuning the ViT and LLM simultaneously during the alignment stage** — catastrophic forgetting of pretrained visual representations; freeze both encoders during feature alignment, only train the projection layer.
- **Using CLIP embeddings directly as LLM input tokens without a learned projection** — the embedding spaces are fundamentally misaligned; a trainable projection layer (MLP/Q-Former) is mandatory.
- **Evaluating VLMs solely on text-based benchmarks** — text-only metrics miss visual hallucination, spatial reasoning errors, and object counting failures; use multimodal benchmarks like MMBench and POPE.
- **Skipping data diversity in visual instruction tuning** — training only on captioning data produces a model that describes images but cannot answer questions or reason about them; mix caption/VQA/OCR/reasoning data.
- **Not setting an image count limit per request** — each image consumes 256-576 tokens; without a hard limit, a multi-image request can silently overflow the context window.

## Related
- Same class: [transformer-architecture-summary.md](./transformer-architecture.md), [long-context-techniques-summary.md](./long-context-techniques.md)
- Upstream: [attention-mechanism-summary.md](./attention-mechanism.md) (attention is the core layer of multimodal fusion) 
- Downstream: [../platform/llm-comparison.md](../platform/llm-comparison.md) (multimodal model comparison) 
