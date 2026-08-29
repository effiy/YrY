---
title: 'Daydreaming: Stealing Hidden Agent Skills through Black-Box Task Interaction'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26733
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yu-Lin Tsai, Yu-An Lu, Ci-Yang Tsai, Muxi Lyu, Raluca Ada Popa, Chia-Mu Yu
---

arXiv:2608.26733v1 Announce Type: cross 
Abstract: Agent skills bundle instructions, reference data, and executable helpers that let a general agent perform specialized tasks. Hosted providers can keep these files secret while selling access to task results, making the skill itself a valuable target. Existing disclosure defenses can block requests that ask for the skill or reproduce its text, but they cannot block customers from submitting the ordinary tasks the service is built to complete. We present Daydreaming, an execution-only attack that steals a multi-file skill through black-box task interactions. The victim is never asked to reveal the skill or grade a reconstruction. Instead, Daydreaming adaptively creates crafted tasks whose results distinguish possible hidden behaviors. It tests individual behaviors, uses attacker-controlled shadow agents to choose a design, and completes each file using stored victim results and local execution checks. We formalize three nested threat levels of access as Differential, Trace, and Output, and focus on Output, where the attacker sees only the final response and returned files. Across 7 skills and 4 victim models, Daydreaming recovers 86.8% of the original skill's capability at Output, outperforming SigLeak by almost 4x. It produces installable skills using a median of 32 victim calls per skill even with disclosure defenses enabled. These results show that hiding skill files and filtering direct disclosure do not, by themselves, prevent functional reconstruction through normal use.