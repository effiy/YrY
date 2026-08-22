---
title: 'FiLoRA: Focus-and-Ignore LoRA for Controllable Feature Reliance'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2602.02060
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Hyunsuk Chung, Soyeon Caren Han, Seungyeon Ji, Jinwoo Kim, Eun-Jung Holden,
  Kyungreem Han
---

arXiv:2602.02060v2 Announce Type: replace-cross 
Abstract: Multimodal foundation models integrate heterogeneous signals across modalities, yet it remains unclear whether their predictions can be controlled by explicitly modulating reliance on different internal feature pathways. Existing approaches to shortcut and spurious behavior primarily rely on post hoc analysis or data-level interventions, offering limited ability to directly intervene on how models use information. We introduce FiLoRA (Focus-and-Ignore LoRA), an instruction-conditioned, parameter-efficient adaptation framework that enables controllable modulation of feature reliance while keeping the task and predictive objective fixed. FiLoRA decomposes adaptation into feature-aligned low-rank modules and applies instruction-conditioned gating, allowing natural language instructions to act as computation-level control signals over internal representations. We evaluate FiLoRA across both controlled classification settings and generative multimodal tasks, and under a range of instruction types, including natural and compositional instructions. Results show that FiLoRA induces consistent and interpretable shifts in feature reliance, selectively amplifying or suppressing different feature groups in accordance with the instruction, without altering task semantics. Our findings suggest that instruction-conditioned parameter adaptation can serve as a practical mechanism for intervening on internal model behavior, providing a new perspective on controllability and analysis of multimodal systems beyond output-level prompting or post hoc interpretation.