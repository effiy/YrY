---
title: 'EduRiskX: A Neuro-Symbolic Framework with F-Logic Reasoning for Early Academic
  Risk Prediction'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26107
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yu Fu, Yongqi Kang, Yong Zhao, Rongfang Bie
---

arXiv:2608.26107v1 Announce Type: new 
Abstract: Predicting students' academic risk in online education is crucial for enabling timely interventions that can improve retention and learning outcomes. However, existing models often suffer from limited early detection capability and insufficient interpretability, leading to a "black-box" trust crisis that hinders their adoption in real-world pedagogical settings. To address these challenges, we propose EduRiskX, a neuro-symbolic framework that integrates a temporal Transformer-based predictor with F-Logic symbolic reasoning. The neural component models longitudinal student activity sequences using temporal attention, class-weighted loss, and dynamic weekly truncation. Acting as a data-driven expert system, an F-Logic rule base -- grounded in established educational theories (Engagement Theory and Student Integration Model) to mimic the diagnostic logic of human educators -- is constructed exclusively from the training data. The neural risk probability and the symbolic confidence score are then combined through a logistic regression-based fusion mechanism that learns the relative contribution of each signal. Experiments on the Open University Learning Analytics Dataset (OULAD) using a strict 80/10/10 student-level split show that EduRiskX achieves an accuracy of 0.900 and an F1-score of 0.894 at the end of the semester (Week 38), with an average early detection week of 9.32 and a detection rate of 94.30 percent. Compared with state-of-the-art time-series models (PatchTST, iTransformer) and common deep learning baselines (LSTM, CNN), EduRiskX yields improved recall and earlier risk identification under identical conditions. Beyond predictive performance, the F-Logic module provides structured rule-based explanations linking predictions to observable behavioral patterns and educational theories.