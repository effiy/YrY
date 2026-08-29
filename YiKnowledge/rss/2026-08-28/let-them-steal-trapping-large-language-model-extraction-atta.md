---
title: 'Let Them Steal: Trapping Large Language Model Extraction Attacks with Knowledge
  Honeypot'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2606.15810
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yuyang Dai, Yushun Dong
---

arXiv:2606.15810v2 Announce Type: replace-cross 
Abstract: Large language models deployed as commercial APIs are vulnerable to model extraction attacks, while existing defenses either act too late or degrade utility for legitimate users. We propose \textbf{Knowledge Trap}, a defense that redirects extraction attacks toward low-transferability knowledge through a \emph{Honeypot Knowledge Graph} (HKG) and breadcrumb-guided exploration. Instead of blocking queries or perturbing outputs, Knowledge Trap consumes the attacker's limited query budget on knowledge with negligible downstream utility while preserving benign-user performance. Experiments in medical and financial domains show that Knowledge Trap reduces surrogate Agreement by 6.2\% on average without degrading legitimate-user accuracy, outperforming existing defenses that impose measurable user impact. These results suggest that defending knowledge-space traversal is a practical direction for mitigating LLM extraction attacks.