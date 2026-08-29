---
title: 'HINT-SD: Targeted Hindsight Self-Distillation for Long-Horizon Agents'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2605.17873
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Woongyeong Yeo, Yumin Choi, Taekyung Ki, Sung Ju Hwang
---

arXiv:2605.17873v2 Announce Type: replace-cross 
Abstract: Training long-horizon LLM agents with reinforcement learning is challenging because sparse outcome rewards reveal whether a task succeeds, but not which intermediate actions caused the outcome or how they should be corrected. Recent methods alleviate this issue by generating rewards or textual hints from turn-level action-output signals, or by using feedback-conditioned self-distillation. However, generating feedback at every turn is inefficient when many intermediate turns are already successful or neutral, and applying feedback at a fixed or misaligned turn often fails to supervise the actions that contributed to the failure. To bridge this gap, we propose HINT-SD, a targeted self-distillation framework that uses full-trajectory hindsight to select failure-relevant actions and applies feedback-conditioned distillation only to targeted action spans. Experiments on BFCL v3 and AppWorld show that our method outperforms the dense per-turn feedback baseline by up to 13.60 percentage points on average while achieving a 2.26$\times$ reduction in time per training step, suggesting that selecting where to distill is key to effective and efficient long-horizon agent training.