---
title: 'Reconstruction: A Blind Benchmark for Recovering Research Ideas from Pre-Publication
  Bibliographies'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.16645
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Shaolong Chen, Yanlin Fei, Nazhou Liu, Xinmiao Yu, Lei Li, Rahul Thapa, Madalina
  Ciobanu, Qingqing Mao, Ritankar Das
---

arXiv:2608.16645v2 Announce Type: replace 
Abstract: Can a language model recover the true research idea of a published paper when given only that paper's pre-publication bibliography? We introduce Reconstruction, a blind idea-recovery benchmark that withholds the seed paper and all contemporaneous or future literature, and asks models to propose hypotheses that an independent large language model judge matches against the held-out ground-truth idea. A strict anti-leakage protocol-temporal citation cutoff, anonymous reference IDs, and frozen per-paper bibliographies, which prevents prompt-time leakage of the seed idea. Across six scientific domains and 643 evaluated papers, seven frontier models achieve only modest Match rates (approx. 3-15%). We then evaluate a reference-only multi-agent (top 4) pipeline that combines cross-model review with a Swiss tournament over aligned hypothesis slots, without external web search. Cross-model review plus tournament selection raises Match rates to approx. 23-42% across all six domains, which is an observed approx. 2.4x lift over the best single-model baseline. This draft reports the protocol, anti-leakage design, and current results as an arXiv timestamp.