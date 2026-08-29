---
title: 'Making Clinical Language Models Auditable: Concept-Guided Fine-Tuning for
  Robust Prediction'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.27397
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Jin Mu, Guanhua Chen
---

arXiv:2608.27397v1 Announce Type: cross 
Abstract: Clinical language models can achieve strong in-hospital accuracy yet fail under deployment shifts because they exploit note-specific artifacts (e.g., templates, separators, boilerplate) that do not reflect patient state. We propose CAST (Concept-guided Artifact Suppression Tuning), an SAE-based framework for auditable clinical text classification. CAST uses Sparse Autoencoders to expose sparse, human-auditable features from intermediate Transformer activations, labels SAE latents with an LLM-assisted interpretation pipeline and ICD-10 retrieval constraints, suppresses verified artifact latents via residual subtraction during fine-tuning, and provides post-hoc per-concept attributions for auditing model decisions. On MIMIC-IV discharge-note mortality prediction, CAST improves over its corresponding fine-tuned encoder baselines and remains competitive with strong LLM baselines, while producing a feature-level audit trail of the clinical concepts that support each prediction and the artifact concepts suppressed during training.