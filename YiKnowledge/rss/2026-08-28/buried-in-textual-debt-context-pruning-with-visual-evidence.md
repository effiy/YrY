---
title: 'Buried in Textual Debt: Context Pruning with Visual Evidence Preservation
  for MLLM Agents'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.22963
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yuchen Huang, Sijia Li, Jun Zhang, Yi R. Fung
---

arXiv:2608.22963v2 Announce Type: replace 
Abstract: Multimodal Large Language Models (MLLMs) are increasingly deployed as multi-step agents, where explicit reasoning supports task decomposition and tool coordination but also accumulates self-generated text. Over long trajectories, this text can dominate the context and suppress visual evidence, creating textual debt. We observe that reasoning becomes redundant once task-relevant visual evidence is grounded, while stale hypotheses can misguide later inference when grounding remains uncertain. Pruning must therefore remove redundant text without discarding visual evidence. We propose SPARE, a Kullback-Leibler (KL)-guided framework for pruning accumulated reasoning in multimodal tool-use agents. SPARE uses a compact task-state summary as privileged diagnostic context. For each candidate segment, it replays the same model under the original and summary-conditioned contexts. Reverse-KL divergence from on-policy self-distillation (OPSD) then tests whether the summary sufficiently covers the segment without disrupting future reasoning. We further fine-tune the summarizer with supervised fine-tuning (SFT), enabling more compact summaries, broader coverage, and more aggressive pruning. Across multi-step visual tool-use benchmarks, SPARE achieves the highest average accuracy among pruning methods while removing 37.89-64.58\% of reasoning tokens. This favorable accuracy-context trade-off shows that reducing textual dominance restores reliance on visual evidence and mitigates over-conditioning on self-generated language.