---
title: Rethinking Modality Reliability in Multimodal Sentiment Analysis with Incomplete
  Observations
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.03611
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Chunlei Meng, Jacqueline J. Pang, Pengbin Feng, Zhenyu Yu, Chun Ouyang, Zhongxue
  Gan
---

arXiv:2608.03611v2 Announce Type: replace 
Abstract: Multimodal Sentiment Analysis (MSA) integrates text, audio, and vision to infer human affect, yet real-world multimodal observations are often incomplete. Existing methods for incomplete-observation MSA mainly follow two paradigms. Reconstruction-based methods recover missing information from observed modalities, while joint-representation methods learn directly from incomplete inputs. Although effective, these methods usually treat modality reliability only implicitly within representation learning or fusion design rather than modeling it explicitly. We argue that modality reliability is a central variable in incomplete-observation settings. Failure to model it explicitly gives rise to two related issues. The first is reliability mismatch, in which the affective evidence retained by each modality varies across samples and missing rates. The second is reliability propagation bias, in which messages from degraded modalities may adversely affect cross-modal interaction and predictive performance. To address these issues, we propose MRCF, a Modality Reliability-Calibrated Framework for MSA with incomplete observations. MRCF contains a Reliability-Aware Branch that estimates sample-specific modality reliability from intramodal quality cues and cross-modal semantic consistency, a Reliability-Guided Interaction Branch that uses the estimated scores to modulate cross-modal information flow, and a Reliability-Calibrated Fusion Module that integrates reliability and semantic cues for final prediction. Experiments on CMU-MOSI, CMU-MOSEI, and CH-SIMS show that MRCF achieves strong performance under standard incomplete-observation protocols. Further analyses provide evidence that explicit reliability modeling helps mitigate reliability mismatch and reliability propagation bias during interaction and fusion.