---
title: 'Temporally-Grounded Language Generation: Towards Real-Time Vision-Language
  Models'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2505.11326
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Keunwoo Peter Yu, Joyce Chai
---

arXiv:2505.11326v2 Announce Type: replace-cross 
Abstract: Vision-language models (VLMs) have shown remarkable progress in offline tasks such as image captioning and video question answering. However, real-time interactive environments impose new demands on VLMs, requiring them to generate utterances that are not only semantically accurate but also temporally precise. We identify two core capabilities necessary for such settings---\textit{perceptual updating} and \textit{contingency awareness}---and propose a new benchmark task, \textbf{Temporally-Grounded Language Generation (TGLG)}, to evaluate them. TGLG requires models to generate utterances in response to streaming video such that both content and timing align with dynamic visual input. To support this benchmark, we curate evaluation datasets from sports broadcasting and egocentric human interaction domains, and introduce a new metric, \textbf{TRACE}, to evaluate TGLG by jointly measuring semantic similarity and temporal alignment. Finally, we present \textbf{Vision-Language Model with Time-Synchronized Interleaving (VLM-TSI)}, a model that interleaves visual and linguistic tokens in a time-synchronized manner, enabling real-time language generation without relying on turn-based assumptions. Experimental results show that VLM-TSI significantly outperforms a strong baseline, yet overall performance remains modest---highlighting the difficulty of TGLG and motivating further research in real-time VLMs. Our code is available at https://github.com/yukw777/tglg.