---
title: 'Language Chain in Alignment: Cross-lingual Ranking Preference Optimization'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.23149
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Seungyoon Lee, Minhyuk Kim, Jungseob Lee, Heuiseok Lim
---

arXiv:2608.23149v2 Announce Type: replace-cross 
Abstract: The alignment of Large Language Models heavily relies on English-centric high-quality preference data, which often leads to suboptimal performance in other languages. In this paper, we propose Cross-lingual Ranking Preference Optimization~(CRPO), a novel framework that leverages robust preference knowledge from English to facilitate preference alignment in the target language. We design a hierarchical structure within parallel preference pairs across the target language and English to jointly optimize intra- and inter-lingual preferences, thereby enhancing language adaptation and output quality. Building on the LambdaLoss framework, CRPO goes beyond the binary comparison based optimization by providing a relative ranking signal across multiple candidate responses. Our experiments across five languages with varying resource scales demonstrate that CRPO consistently outperforms standard approaches in both instruction-following and knowledge utilization capability. Notably, the robust performance gains observed across various weighting schemes further validate the empirical effectiveness of our hierarchical design in a multilingual setup. Furthermore, our findings highlight that CRPO significantly improves both reward margins and the log-probability of desirable responses, contributing to a more stable preference manifold for cross-lingual alignment. Our code is available at https://github.com/dltmddbs100/CRPO.