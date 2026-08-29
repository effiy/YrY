---
title: When Does Latent Communication Pay? A Causal Audit of Relayed KV Caches in
  Multi-Agent LLMs
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.04893
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Jiaming Cheng, Subhransu Das, Rajiv Ramnath
---

arXiv:2608.04893v2 Announce Type: replace-cross 
Abstract: Multi-agent LLM systems relay key-value caches instead of text and credit their gains to exchanged "latent thoughts". That credit is a claim about which example's cache is relayed, not merely that one is. We audit it causally in released systems. The cache is replaced with deranged (mismatched-example), zeroed, and moment-matched random counterparts, under two regimes defined by whether the receiver needs the sender's private information. Where it does, the battery reads ceiling: 100% against 23-25% for answer-irrelevant relays on the primary backbone, a contrast replicated across three families, five checkpoints, and a prose document-QA surface. Where it does not, a pre-registered five-seed protocol establishes equivalence within 2.8 points, a margin anchored to the audited system's reported gain, under Holm-corrected TOST on GSM8K and ARC-Challenge across three Qwen3 scales and on MedQA at 8B (one cell shows a small detected advantage inside the margin); a second family shows no detected advantage. A large cache effect need not be a pairing effect. In one natural cell, zeroing the relay costs 14.7 points; a mismatched cache, 0.4. Nor is need sufficient: under the same test, delivered channels span ceiling (LatentMAS's native relay), partial (KVComm's layer subset), and no detected example-specific transfer (C2C's released projector). Benchmark deltas do not by themselves establish latent-thought transmission; establishing it takes a mismatched-cache audit, which we release.