---
title: Subspace Alignment for Vision-Language Model Test-time Adaptation
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2601.08139
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Zhichen Zeng, Wenxuan Bao, Xiao Lin, Ruizhong Qiu, Tianxin Wei, Xuying Ning,
  Yuchen Yan, Chen Luo, Monica Xiao Cheng, Jingrui He, Hanghang Tong
---

arXiv:2601.08139v2 Announce Type: replace-cross 
Abstract: Vision-language models (VLMs), despite their extraordinary zero-shot capabilities, are vulnerable to distribution shifts. Test-time adaptation (TTA) emerges as a predominant strategy to adapt VLMs to unlabeled test data on the fly. However, existing TTA methods heavily rely on zero-shot predictions as pseudo-labels for self-training, which can be unreliable under distribution shifts and misguide adaptation due to two fundamental limitations.First (Modality Gap), distribution shifts induce gaps between visual and textual modalities, making cross-modal relations inaccurate. Second (Visual Nuisance), visual embeddings encode rich but task-irrelevant noise that often overwhelms task-specific semantics under distribution shifts. To address these limitations, we propose SubTTA, which aligns the semantic subspaces of both modalities to enhance zero-shot predictions to better guide the TTA process. To bridge the modality gap, SubTTA extracts the principal subspaces of both modalities and aligns the visual manifold to the textual semantic anchor by minimizing their chordal distance. To eliminate visual nuisance, SubTTA projects the aligned visual features onto the task-specific textual subspace, which filters out task-irrelevant noise by constraining visual embeddings within the valid semantic span, and standard TTA is further performed on the purified space to refine the decision boundaries. Extensive experiments on various benchmarks and VLM architectures demonstrate the effectiveness of SubTTA, yielding an average improvement of 2.24% over state-of-the-art TTA methods. Our code is available at https://github.com/zhichenz98/SubTTA_EMNLP26.