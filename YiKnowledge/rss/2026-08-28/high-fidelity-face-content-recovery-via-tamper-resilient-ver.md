---
title: High-Fidelity Face Content Recovery via Tamper-Resilient Versatile Watermarking
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2603.23940
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Peipeng Yu, Jinfeng Xie, Chengfu Ou, Xiaoyu Zhou, Jianwei Fei, Yunshu Dai,
  Zhihua Xia, Chip Hong Chang
---

arXiv:2603.23940v2 Announce Type: replace-cross 
Abstract: The proliferation of AIGC-driven face manipulation and deepfakes poses severe threats to media provenance, integrity, and copyright protection. Existing versatile watermarking systems typically rely on embedding explicit localization payloads, which introduces a fidelity--functionality trade-off: larger localization signals degrade visual quality and often reduce decoding robustness under strong generative edits. Moreover, these methods rarely support content recovery, limiting their forensic value when original evidence must be reconstructed. To address these challenges, we present VeriFi, a versatile watermarking framework that unifies copyright protection, pixel-level manipulation localization, and high-fidelity face content recovery. VeriFi makes three key contributions: (1) it embeds a compact semantic latent watermark that serves as a content-preserving prior, enabling faithful restoration even after severe manipulations; (2) it achieves fine-grained localization without dedicated payloads by correlating image features with decoded provenance signals; and (3) it introduces an AIGC attack simulator that combines latent-space mixing with seamless blending to enhance robustness against realistic deepfake pipelines. Extensive experiments on CelebA-HQ and FFHQ demonstrate that VeriFi consistently outperforms state-of-the-art baselines in watermark robustness, localization accuracy, and recovery quality, providing a practical and verifiable defense for deepfake forensics.