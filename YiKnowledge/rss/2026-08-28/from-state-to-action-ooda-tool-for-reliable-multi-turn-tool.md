---
title: 'From State to Action: OODA-Tool for Reliable Multi-Turn Tool Use'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.24368
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Rongfeng Guo, Yinxuan Huang, Yusen Wu, Maoqing Zhong, Yunlu Chen, Meng Tang,
  Teng Long, Vincent Tao Hu
---

arXiv:2608.24368v2 Announce Type: replace 
Abstract: Reliable multi-turn tool use requires an agent to preserve an evolving task state and ensure that each action remains consistent with it. However, direct function-calling and ReAct-style policies learn state tracking and action generation within the same autoregressive trajectory. This coupling creates state-action competition: the pressure to produce the next call can overwrite or ignore information accumulated earlier in the interaction. Inspired by Boyd's Observe-Orient-Decide-Act cycle, we introduce OODA-Tool, a typed closed-loop policy designed to mitigate this competition by separating state preservation from action realization. Rather than generating an action directly from the interaction history, OODA-Tool routes each decision through controller-checked intermediate states, ensuring that the final output remains grounded in the current task state. Specifically, Observe reconstructs the task state, Orient determines whether execution is warranted, Decide forms an admissible action structure, and Act realizes the external output. We evaluate OODA-Tool against direct function-calling and ReAct policies using Qwen3 models ranging from 0.6B to 14B across multi-turn, multi-tool, and incomplete-information settings. OODA-Tool consistently improves task success across model sizes, with larger gains on smaller models and on tasks whose actions depend strongly on information accumulated across turns and prior tool results. Controlled variants, stage-level ablations, and transfer evaluations further demonstrate the robustness of these improvements.