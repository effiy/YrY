---
title: 'Beyond Endpoint Gains: A Weight-Delta Audit of Medical Specialization'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.20768
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Praphul Singh, Shanu Kumar, Akshat Agarwal
---

arXiv:2608.20768v3 Announce Type: replace 
Abstract: Specialist language models are usually understood through endpoint gains: the generalist scores lower, the specialist scores higher, and the difference is treated as evidence of specialization. This leaves the released update itself largely unexamined. We propose a paired weight-delta path audit and apply it to two public, aligned generalist-to-medical-specialist checkpoint pairs: Gemma-3-4B-IT to MedGemma-4B-IT and Qwen2.5-7B-Instruct to HuatuoGPT-o1-7B. In both pairs, the full decoder-side update strongly reconstructs measured medical benchmark movement (0.974 and 1.183 endpoint-normalized retention), making each decoder delta an appropriate substrate for the audit. Yet the movement is not cleanly localized. MLP is the strongest broad component family in both pairs, but mixed off-domain movements, 10-seed matched controls, and endpoint-anchored rollbacks prevent a unique coarse-family explanation. The audit therefore separates update-level reconstruction from component-level explanation. Its claims concern text-only multiple-choice benchmark movement, not clinical validation, repair, or circuit-level mechanism.