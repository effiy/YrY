---
title: 'When Text Misleads: Inconsistent-Aware Reasoning for Audio-Grounded Dialogue'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.27176
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yen-Ju Lu, Yuzhe Wang, Yaohan Guan, Xiluo He, Jiarui Hai, Mingrui Liang, Kaavya
  Chaparala, Thomas Thebaud, Laureano Moro-Velazquez, Najim Dehak, Jesus Villalba
---

arXiv:2608.27176v1 Announce Type: cross 
Abstract: Understanding spoken dialogue requires joint reasoning over lexical content and paralinguistic acoustic signals such as emotion and conversational intent. However, existing evaluations often allow shortcuts based on transcripts or single-modality solutions, obscuring whether models genuinely ground predictions in speech. We formalize this failure mode as cross-modal disagreement, where transcripts suggest plausible but incorrect surface interpretations while acoustic cues such as prosody or speaking style support different answers. We develop a scalable framework that identifies text-biased surface interpretations and converts disagreement regions into conflict QA examples. We also include consistent cases where transcript-based and speech-grounded interpretations agree, enabling evaluation beyond adversarial audio dependence. This results in ContraTalk, a controlled benchmark containing 501 questions across five discourse dimensions: interaction behavior, emotion state, dialogue act, social stance, and conversational intent. We further develop an agentic-style reasoning framework that converts speech into an Audio Twin, a text-readable representation of localized acoustic cues that exposes acoustic evidence to the reasoning model. Experiments show that strong text-only LLMs exceed 90% accuracy in consistent cases but drop to 33-48% in conflict cases. Direct AudioLLMs provide only partial grounding, still selecting the transcript-biased trap in roughly 30-40% of conflict cases. Our Audio Twin framework improves conflict-case accuracy while reducing trap selection, but its consistent-case behavior remains backbone-dependent. These results identify transcript-based shortcuts as an important failure mode in spoken dialogue understanding and show that explicit acoustic evidence aggregation provides a more controllable interface for diagnosing and improving speech-grounded reasoning.