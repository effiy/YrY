---
title: 'Lost in Compression: A Controlled Cross-Lingual Audit of Extractive Prompt
  Compressors'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26175
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Mantas Lukauskas
---

arXiv:2608.26175v1 Announce Type: cross 
Abstract: Extractive prompt compression promises to cut LLM inference costs by removing low-information tokens, and learned compressors such as LLMLingua-2 report strong results on English benchmarks. Most other languages already pay a token premium: the same content costs 1.3-1.8x more tokens than in English. We ask whether compression closes or widens this gap. Using fully parallel data in ten languages spanning five scripts, with controls budget-matched in the target model's tokenizer, we audit four learned compressors against four deterministic baselines, on eleven target models from ten vendors (over 250,000 evaluation calls). Three of the compressors are trained with English supervision (LLMLingua-2 XLM-R/mBERT; Kompress-v2 from the production Headroom stack); the fourth, XProvence, is trained multilingually. First, the transfer gap is real, replicates across target models and compressor backbones, and is strongly rate-dependent: at a 0.33 keep-rate English retains 57-62% of normalized context utilization while Lithuanian retains 10-24% and Chinese essentially none, despite Chinese having the smallest token premium. Second, the gap tracks compression supervision data, not architecture. All three English-trained compressors show it, deterministic methods show no comparable gap, and the multilingually trained XProvence v1 shows none. Its v2 release, retrained on translated data, empties 92% of Chinese contexts at its aggressive threshold without any warning. Third, in a harder long-context setting, aggressive learned compression drives compressed contexts to or below no-context utility in three of five non-English languages. A translate-then-compress pipeline matches or beats native compression at roughly half the token cost in three of five tested languages. We release all code, compressions, and model outputs. Safe compression budgets are much smaller outside English.