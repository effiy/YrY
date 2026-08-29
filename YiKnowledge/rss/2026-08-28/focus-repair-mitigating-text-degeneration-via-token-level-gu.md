---
title: 'FOCUS & RePAIR: Mitigating Text Degeneration via Token-Level Guidance for
  Pruned Large Language Models'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26676
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Junyoung Lee, Sehyeon Park, Shinhyoung Jang, Seonha Ryu, Hojeong Kim, Hyunsei
  Lee, Il Hong Suh, Yeseong Kim
---

arXiv:2608.26676v1 Announce Type: cross 
Abstract: Pruning is a practical approach to compress large language models (LLMs), but it can amplify text degeneration, especially repetition loops, even when perplexity and task accuracy remain largely unchanged. In this work, we present a token-level analysis of this failure mode by viewing decoding as a dynamical process that enters and persists in a small set of recurrent contexts. Our analysis decomposes degeneration into loop entry risk and loop persistence, and shows that persistence is controlled by the escape mass assigned to plausible alternatives within the token sampling set. Motivated by these findings, we propose two token-level guidance objectives for post-pruning fine-tuning. FOCUS reweights distillation toward high-confidence teacher regions to suppress leakage, while RePAIR uses onset-centered positive/negative continuation pairs with a margin loss to promote plausible alternatives and prevent early commitment to repetition loops. Experiments on open-ended continuation and instruction-based generation show that both methods consistently reduce repetition and improve generation quality.