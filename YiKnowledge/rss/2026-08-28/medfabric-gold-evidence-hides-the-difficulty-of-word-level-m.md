---
title: 'MedFabric: Gold Evidence Hides the Difficulty of Word-Level Medical Fabrication
  Detection'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2605.04180
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Tung Sum Thomas Kwok, Qian Qian, Xiaofeng Lin, Dongxu Zhang, Jun Han, Zhichao
  Yang, Davin Hill, Tamer Soliman, Sanjit Singh Batra, Robert Tillman, Guang Cheng
---

arXiv:2605.04180v2 Announce Type: replace-cross 
Abstract: Large language models fabricate in medicine, producing fluent statements that are factually wrong, so reliable fabrication detection is a prerequisite for clinical deployment. Reported progress on this task is inflated by two evaluation artifacts: an authorship-style shortcut, where human-written ground truths are paired with LLM-written hallucinations so detectors key on writing style rather than facts, and the provision of gold evidence at test time. A benchmark that tests factual reasoning must therefore remove the style shortcut, ground every fabrication in a real retrievable passage, and score detectors across the range of evidence quality faced in deployment. We build MedFabric to these requirements, a benchmark of 646 word-level medical fabrications, each paired with a ground truth that shares its LLM authorship and near-identical surface form (median ROUGE-L 0.95). On MedFabric the task is unsolved: expert clinicians reach only 53.3% macro F1 and no detector family clears about 60% without gold evidence. Our central finding is that detection is governed by evidence correctness rather than fabrication subtlety, since a strong LLM scores 91% with the gold passage but falls to 35%, below its own no-evidence baseline, under a wrong one, a pattern that holds on two benchmarks at two model scales. The failure is actionable: a retrieval-confidence gate that abstains on low-confidence evidence raises macro F1 from 61% to 74%, and we release MedFabric, all code, and every baseline.