---
title: 'SPAR-Hate: Auditor-Guided Multi-Perspective Role Reasoning for Bilingual Hate
  Speech Parsing'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.22018
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yifan Lyu, Dianqing Lin, Xinran Li, Jiaqi Qiao, Xiujuan Xu
---

arXiv:2608.22018v3 Announce Type: replace 
Abstract: Hate speech research has moved from coarse-grained classification towards structured parsing, where systems jointly identify targets, supporting arguments, and target-level labels. Documents with multiple targets, conflicting local readings, or culturally coded language make these bindings difficult to recover. SPAR-Hate is an auditor-guided multi-perspective role-reasoning framework for bilingual hate speech parsing. It decomposes each document into local focus units, elicits evidence-grounded candidates from Victim, Moderator, and Cultural Bystander perspectives, resolves candidate conflicts under grounding and schema constraints, and reassembles sample-level predictions. Experiments on STATE-ToxiCN and a controlled TBO split show gains across local and API backbones, concentrated on strict joint target-argument-label metrics. Full-test integrated-prompt controls, component ablations, and bounded-arbitration diagnostics identify the contribution of separated perspective generation and arbitration. Structured teacher traces also support training a smaller student model.