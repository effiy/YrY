---
title: 'Refine-POI: Reinforcement Fine-Tuned Large Language Models for Next Point-of-Interest
  Recommendation'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2506.21599
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Peibo Li, Shuang Ao, Hao Xue, Yang Song, Maarten de Rijke, Johan Barth\'elemy,
  Tomasz Bednarz, Flora D. Salim
---

arXiv:2506.21599v5 Announce Type: replace-cross 
Abstract: Advancing large language models (LLMs) for the next point-of-interest (POI) recommendation task faces two fundamental challenges: (i) although existing methods produce semantic IDs that incorporate semantic information, their topology-blind indexing fails to preserve semantic continuity, meaning that proximity in ID values does not mirror the coherence of the underlying semantics; and (ii) supervised fine-tuning (SFT)-based methods restrict model outputs to top-1 predictions. These approaches suffer from "answer fixation" and neglect the need for top-k ranked lists and reasoning due to the scarcity of supervision. We propose Refine-POI, a framework that addresses these challenges through topology-aware ID generation and reinforcement fine-tuning. First, we introduce a hierarchical self-organizing map (SOM) quantization strategy to generate semantic IDs, ensuring that coordinate proximity in the codebook reflects semantic similarity in the latent space. Second, we employ a policy-gradient framework to optimize the generation of top-k recommendation lists, liberating the model from strict label matching. Extensive experiments on three real-world datasets demonstrate that Refine-POI significantly outperforms state-of-the-art baselines, effectively synthesizing the reasoning capabilities of LLMs with the representational fidelity required for accurate and explainable next-POI recommendation.