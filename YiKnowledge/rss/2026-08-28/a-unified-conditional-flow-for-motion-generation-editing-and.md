---
title: A Unified Conditional Flow for Motion Generation, Editing, and Intra-Structural
  Retargeting
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2604.13427
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Junlin Li, Xinhao Song, Siqi Wang, Haibin Huang, Yili Zhao
---

arXiv:2604.13427v2 Announce Type: replace-cross 
Abstract: Text-driven motion editing and intra-structural retargeting, where skeletons share topology but may differ in bone lengths and rest pose, are traditionally handled by fragmented pipelines with incompatible inputs and representations: editing relies on specialized generative steering, while retargeting is deferred to geometric post-processing. We present a unified conditional-flow framework that casts generation, semantic editing, and intra-structural retargeting as condition-modulated transport within one text- and skeleton-conditioned rectified-flow model. Under this formulation, editing changes the semantic condition while preserving skeletal structure, whereas retargeting changes the skeletal condition while preserving motion semantics. This makes FlowEdit-style transport a unified inference rule for motion manipulation rather than a task-specific editor. To instantiate this for articulated 3D motion, we develop a text- and skeleton-conditioned rectified-flow transformer. The model uses per-joint tokenization and explicit joint self-attention to capture spatial kinematic dependencies. We further inject text conditions at both joint and frame levels, while residual multi-condition classifier-free guidance balances text adherence and skeletal conformity. Experiments on SnapMoGen and a multi-character Mixamo subset show that one trained model supports text-to-motion generation, zero-shot editing, and zero-shot intra-structural retargeting without task-specific fine-tuning. This unified framework replaces separate pipelines with a single conditional motion transport model while keeping the same-topology retargeting scope explicit.