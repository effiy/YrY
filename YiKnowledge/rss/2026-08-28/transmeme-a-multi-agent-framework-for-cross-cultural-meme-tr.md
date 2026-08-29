---
title: 'TransMeme: A Multi-Agent Framework for Cross-Cultural Meme Transcreation'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.27127
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Jingyi Zheng, Yule Liu, Zifan Peng, Tianyi Hu, Yuemeng Zhao, Xinhu Zheng,
  Xinlei He
---

arXiv:2608.27127v1 Announce Type: new 
Abstract: Internet memes are a pervasive form of multimodal online communication; however, such communication often involves users from diverse linguistic and cultural backgrounds. Therefore, adapting memes across cultures and languages is a central challenge for enabling mutual understanding in online communication. Unlike ordinary translation or standalone text rewriting, cross-cultural meme transcreation must jointly preserve communicative intent, adapt culture-dependent meaning for the target audience, and maintain coherence between text and image. In this work, we first provide an explicit task analysis of cross-cultural meme transcreation and identify three core challenges: culture-specific knowledge understanding, intent and tone preservation, and multimodal consistency. Based on this analysis, we propose a multi-agent framework with specialized agents that are coordinated to address these challenges through cultural adaptation, target text rewriting, revision, and conditional visual adjustment. The framework strengthens target text adaptation with coordinated feedback to handle difficult cases that require deeper cultural or visual intervention. We evaluate the framework on bidirectional Chinese-English meme transcreation using both human evaluation and LLM-as-a-Judge. Our method consistently outperforms all baselines across both evaluation settings. In human evaluation, it achieves the best performance on all four dimensions and delivers a 33.1% average improvement over the strongest baseline, while in LLM-as-a-Judge, it attains the highest Top-1 ranking rate (60% versus 26% for the second-best baseline). Further analysis indicates that each component contributes to the performance. Our error analysis suggests that the remaining bottlenecks lie in humor reconstruction and image-text alignment rather than simple cultural knowledge gaps, pointing to future work on humor transfer.