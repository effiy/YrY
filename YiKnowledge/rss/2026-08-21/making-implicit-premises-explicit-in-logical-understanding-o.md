---
title: Making Implicit Premises Explicit in Logical Understanding of Enthymemes
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2603.06114
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Xuyao Feng, Anthony Hunter
---

arXiv:2603.06114v3 Announce Type: replace-cross 
Abstract: Real-world arguments in text and dialogues are normally enthymemes (i.e. some of their premises and/or claims are implicit). Natural language processing (NLP) methods for handling enthymemes can potentially identify enthymemes in text but they do not decode their underlying logic, whereas logic-based approaches for handling them assume a knowledgebase with sufficient formulae that can be used to decode them via abduction. There is therefore a lack of a systematic method for translating textual components of an enthymeme into a logical argument and generating the logical formulae required for their decoding, and thereby showing logical entailment. To address this, we propose a pipeline that integrates: (1) a large language model (LLM) to generate intermediate implicit premises based on the explicit premise and claim; (2) another LLM to translate the natural language into logical formulas; and (3) a neuro-symbolic reasoner based on a SAT solver to determine entailment. We evaluate our pipeline on two enthymeme datasets, demonstrating promising performance in selecting the correct implicit premise, as measured by precision, recall, F1-score, and accuracy.