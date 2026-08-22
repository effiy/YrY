---
title: 'MotoSafety: Edge-AI with Learned Temporal Importance for Two-Wheeler Collision
  Risk Assessment Under Time Pressure'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.17823
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Sumit S. Shevtekar, Chandresh K. Maurya, Gourab Sil, Subasish Das
---

arXiv:2608.17823v2 Announce Type: replace-cross 
Abstract: Powered two-wheeler riders face critical safety challenges in low- and middle-income countries, yet limited studies exist on how cognitive stressors such as Time Pressure influence collision risk. We address this gap by introducing a comprehensive dataset consisting of over 129,000 labeled multivariate time-series samples, gathered across 153 simulator rides from 51 participants under No, Low, and High TP scenarios. Across each sequence, we capture 64 distinct attributes covering vehicle motion, rider control actions, spatial proximity, and rule compliance indicators. Using this dataset, we introduce MotoSafety, a new edge-AI framework built on the Learned Temporal Importance (LTI) concept. MotoSafety achieves 94.97% accuracy and 99.33% ROC AUC, outperforming ten baselines, including TimesNet and LLM4TS, and achieves 0.039 MSE and 0.094 MAE for forecasting (4.4x lower error than Time-LLM and iTransformer). With only 1.15M parameters and 0.135 ms latency, it is suitable for edge deployment on low-cost CPU hardware. Using ground truth TP as an inductive bias improves accuracy from 94.09% to 94.97%, while predicted TP achieves 94.82%. Using only 21 IMU+GPS features, it achieves 93.91% accuracy, indicating practical deployment. Beyond PTW safety, the architecture shows better transferability to human activity (97.66%) and clinical (99.65%) domains. This lightweight framework advances PTW collision risk assessment, supporting the Safe System Approach for Intelligent Transportation Systems.