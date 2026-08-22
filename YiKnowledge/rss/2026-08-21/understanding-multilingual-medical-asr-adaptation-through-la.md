---
title: Understanding Multilingual Medical ASR Adaptation Through Layer-Wise Analysis
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18825
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Souranil Kahali, Rituparna Bose, Abner Hernandez, Tomas Arias-Vergara, Andreas
  Maier, Ning Ma, Paula Andrea Perez-Toro
---

arXiv:2608.18825v1 Announce Type: cross 
Abstract: Medical automatic speech recognition (MedASR) requires adaptation to specialised terminology, limited annotated clinical data, and multilingual use cases. Although large-scale pretrained ASR models such as Whisper achieve strong generalisation, their behaviour after medical and multilingual adaptation remains insufficiently understood beyond word error rate (WER). This paper investigates how multilingual medical adaptation reshapes the internal representations of Whisper models through layer-wise encoder analysis. We compare zero-shot decoding, English-only fine-tuning, German-only diagnostic fine-tuning, two-stage EN->EN+DE continuation, and direct EN+DE fine-tuning across Whisper model sizes. Fine-tuning substantially improves MedASR performance, but the best model depends on the adaptation setting: Whisper-Medium gives the lowest English WER (7.72%) and the lowest combined EN+DE WER under direct EN+DE training (26.30%); German-only Whisper-Large-v3 gives the lowest German WER (44.96%), but as a within-corpus diagnostic on 86 single-speaker training utterances rather than robust generalisation. Layer-wise analysis of the two-stage Whisper-Small trajectory shows that English medical fine-tuning produces the dominant encoder shift, whereas multilingual continuation largely preserves the adapted representation space. Domain and language information remain highly recoverable across layers, while linearly recoverable error-predictive cues weaken as WER improves.