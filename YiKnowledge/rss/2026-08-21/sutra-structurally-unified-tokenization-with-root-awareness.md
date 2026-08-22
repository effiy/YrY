---
title: 'SuTRA : Structurally-Unified Tokenization with Root Awareness'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18087
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Vaibhav Rathore, Siddhant Gole, Dadhichi Telwadkar, Rooshil Bhatia, Maulik
  Ruparel, Siddharth Surekha, Neha Bhargava
---

arXiv:2608.18087v1 Announce Type: cross 
Abstract: Existing subword tokenizers optimize statistical compression but ignore morphological structure, particularly the relationship between roots and affixes. This is harmful for morphologically rich Indic languages, where basic units are complex orthographic syllables (aksharas) rather than letters. Frequency-based methods over-fragment words, arbitrarily splitting roots and affixes - a phenomenon we term Morphological Shattering. We propose SuTRA (Structurally-Unified Tokenization with Root Awareness), a morphology-aware algorithm that preserves akshara indivisibility and penalizes merges crossing morphological boundaries. We also release a new morphological segmentation dataset for Hindi, Marathi, and Gujarati. SuTRA reduces shattering, achieving peak gains of +14.7% in morphological alignment (Boundary F1) and +34% in semantic recoverability (Hindi) over BPE. These structural gains yield an average improvement of +8.08 chrF2 in machine translation.