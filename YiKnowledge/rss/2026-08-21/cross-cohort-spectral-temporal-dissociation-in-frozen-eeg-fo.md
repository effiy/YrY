---
title: Cross-Cohort Spectral-Temporal Dissociation in Frozen EEG Foundation-Model
  Representations
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2607.24834
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Marzieh Zare
---

arXiv:2607.24834v3 Announce Type: replace-cross 
Abstract: Objective. We tested whether frozen representations from five EEG foundation models support decoding of long-range temporal correlations, measured as the detrended-fluctuation-analysis (DFA) exponent of the alpha-band amplitude envelope.
  Approach. REVE, LaBraM, BENDR, CBraMod, and BIOT were evaluated in CAUEEG and BrainLat. A common 240 s estimator used 8-13 Hz filtering, DFA over 2-23.8 s, artifact masking, and quality control. One fixed nested-cross-validation readout predicted DFA and a fixed-mode aperiodic exponent. Controls tested pre-pool order sensitivity and aperiodic residualization.
  Results. CAUEEG included 764 recordings and BrainLat 79. BIOT decoded DFA in CAUEEG (R-squared = 0.232; conditional subject-bootstrap 95 percent interval, 0.121-0.310), and CBraMod was positive but imprecise (R-squared = 0.121; 0.003-0.214). Neither replicated in BrainLat, where all five point estimates were negative. In contrast, CBraMod and BIOT decoded the aperiodic exponent in both cohorts (R-squared = 0.459-0.757). BIOT remained positive after removal of the measured linear aperiodic association in matched CAUEEG data (R-squared = 0.240). The post-hoc order control was batch- and configuration-sensitive. Because chronological EEG epochs are not exchangeable, it was descriptive, not an LRTC-specific test. No revised DFA transfer direction passed source-label permutation testing. Cohort membership was near-ceiling decodable from all five embeddings, but this is not a pure site effect.
  Significance. CBraMod and BIOT show a replicated, model-specific spectral-temporal dissociation: aperiodic decoding is present in both cohorts, whereas alpha-envelope DFA decoding is cohort-dependent. These findings bound the evaluated readouts; they do not establish representational absence or an architectural cause. Transfer and clinical associations remain exploratory.