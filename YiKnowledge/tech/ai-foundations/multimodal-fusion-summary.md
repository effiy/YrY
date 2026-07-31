---
title: 多模态融合（CLIP / LLaVA）
tags: [AI, 基础, 多模态, CLIP, LLaVA]
category: tech/ai-foundations
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# 多模态融合（CLIP / LLaVA）

## 1. 背景与问题

文本 LLM 只懂文本，但真实世界有图像、视频、音频。多模态融合 = 把视觉 / 音频信号映射到 LLM 可处理的语义空间。两类典型架构：

- **对齐式**（CLIP）：双塔，文本与图像编码到同一空间，只学对齐
- **融合式**（LLaVA / Qwen-VL）：视觉特征作为 token 喂入 LLM，可生成多模态内容

## 2. CLIP：对比学习对齐

### 核心思想

双塔：图像编码器（ViT）+ 文本编码器（Transformer）。同 batch 内（图像，文本）正例靠近，跨 batch 反例远离，InfoNCE loss。

```
image encoder → img_embed
text encoder  → text_embed
loss = -log( exp(sim(img, text_pos) / τ) / Σ exp(sim(img, text_i) / τ) )
```

### 训练数据

4 亿对（image, caption）从网络爬取。零样本图像分类能力是副产品：对未见类别，用文本编码 "a photo of a {class}"，与图像编码比相似度即可分类。

### 优点

- 零样本能力强
- 双塔，推理时文本可预编码，图像只算一次
- 训练目标简单

### 局限

- 只能检索 / 分类，不能生成
- 对细粒度任务（OCR、计数）差
- 训练数据噪声大，bias 明显

## 3. LLaVA：视觉指令跟随

### 核心思想

视觉编码器（CLIP-ViT）+ 适配投影层 + LLM。图像通过编码器得 visual token，投影到 LLM embedding 空间，与文本 token 拼接送入 LLM。

```
Image → ViT → image_features → Projection → image_tokens
Text → tokenizer → text_tokens
[image_tokens, text_tokens] → LLM → output text
```

### 训练两阶段

1. **特征对齐**：冻结 LLM 与 ViT，只训投影层，用图像-文本对让投影层学会把视觉特征对齐到 LLM 空间
2. **指令微调**：解冻投影层（可选 LLM LoRA），用「图像 + 指令-回答」对训练

### 数据生成

用 GPT-4 把图像的 caption + bounding box 描述扩写成多模态指令数据。

### 优点

- 可生成图像描述、问答、推理
- 架构极简，工程友好
- 后续 LLaVA-1.5 / 1.6 能力逼近 GPT-4V

### 局限

- 视觉 token 数量多（一张图 256-576 token），上下文消耗大
- 高分辨率细节（OCR、计数）仍弱
- 幻觉（编造图中没有的物体）

## 4. 其他主流方案

| 方案 | 路径 |
|---|---|
| Flamingo | Perceiver Resampler 压缩视觉特征 + 跨 attention 融合 |
| BLIP-2 | Q-Former 学习少量 query token 提取视觉信息 |
| Qwen-VL | ViT + Adapter + LLM，中文友好 |
| Llama 3.2-Vision | 改造 Llama 接视觉编码器 |
| Gemini | 原生多模态（从预训练开始就是多模态） |
| GPT-4V / Claude Vision | 闭源旗舰 |

## 5. 设计要点

### 视觉编码器选择

- ViT-L / ViT-G 主流，分辨率 224 或 336
- 高分辨率：切 patch（AnyRes）或动态分辨率
- 编码器可冻（省算力）或解冻（效果更好但贵）

### 适配层

- 线性投影（最简）
- MLP（两三层，LLaVA-1.5）
- Q-Former / Perceiver（压缩 token）
- Pixel Shuffle（减 token 数）

### 训练策略

- 两阶段（特征对齐 + 指令微调）
- 数据配比：caption / VQA / OCR / 推理 / 多轮对话
- 学习率：投影层大，LLM 小
- 视觉指令数据质量 > 数量

## 6. 工程实现要点

1. **视觉 token 数量管理**：高分辨率爆 context；用 patch 切分或 token 压缩
2. **batch 不均**：图像 batch 大小不均，需要 dynamic batching 与 padding 处理
3. **多图输入**：单请求多图，每张占 token；用图像计数限制 + 选最相关 N 张
4. **OCR 场景**：通用 VLM 弱，可用专门 OCR + VLM 组合
5. **幻觉控制**：faithfulness 后处理，要求模型只描述图中明确内容
6. **推理优化**：视觉编码器与 LLM 可分 GPU，视觉编码器可批量预处理缓存

## 7. 局限与改进脉络

- **细节丢失**：低分辨率 → 高分辨率 + patch
- **计数 / 空间关系**：弱 → 专项训练数据 + 工具辅助
- **视频**：单帧时序信息有限 → 时序 attention / 采样关键帧
- **音频**：另起 audio encoder（Whisper）+ 融合
- **幻觉**：faithfulness loss + 引用机制

## 8. 评估方法

| 任务 | 评测 |
|---|---|
| 图像描述 | COCO caption（CIDEr / BLEU） |
| VQA | VQAv2 / OK-VQA / MMBench |
| 推理 | MMMU / MME / MMBench |
| OCR | TextVQA / OCRBench |
| 视频 | MVBench / Video-MME |
| 幻觉 | POPE / HallusionBench |

## 9. 实际应用场景

- 图文 RAG（图片 + 文档联合检索）
- 视觉问答（产品截图问"这个按钮怎么用"）
- OCR + 内容理解（发票、表格）
- 视频 / 监控事件描述
- 多模态对话（用户上传图片问问题）

## 10. 本团队关注点

- 评估中：YiVad 是否引入 VLM 支持用户上传截图作为上下文
- YiAi BRD 场景：售后现场照片可作为辅助证据
- 暂不引入：当前 BRD 生成纯文本为主

## 11. 关键参考

- Radford et al., 2021 — *Learning Transferable Visual Models From Natural Language Supervision*（CLIP）
- Liu et al., 2023 — *Visual Instruction Tuning*（LLaVA）
- Li et al., 2023 — *BLIP-2*
- Alayrac et al., 2022 — *Flamingo*
- Tong et al., 2024 — *LLaVA-1.5 / LLaVA-NeXT*
