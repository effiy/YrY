---
title: Change Point--Aware Evaluation and Re-Calibration of PPG-Based Blood Pressure
  Estimation
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18639
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Yunwon Tae, Minje Park, Gyunho Rho, Dongjoon Yoo, Sunghoon Joo
---

arXiv:2608.18639v1 Announce Type: cross 
Abstract: Non-invasive continuous blood pressure (BP) monitoring using photoplethysmography (PPG) is a promising alternative to cuff-based measurements. However, existing PPG-based BP estimation studies predominantly rely on aggregated performance metrics (e.g., mean absolute error) computed over entire evaluation intervals, which can obscure model failures during rapid BP fluctuations and limit clinical relevance. In this work, we propose a fluctuation-aware evaluation framework for PPG-based BP estimation based on time-series change point detection. Instead of heuristic BP thresholding (e.g., $\Delta\mathrm{BP} > 10\mathrm{mmHg}$), we identify BP change points by capturing abrupt distributional shifts in BP trajectories and evaluate estimation performance specifically during these fluctuation periods. Our analysis shows that several state-of-the-art models exhibit substantial performance degradation around BP change points, and that periodic test-time calibration is insufficient to handle such dynamic BP variations. To address this limitation, we introduce a targeted re-calibration framework triggered by detected BP change points, improving robustness without modifying model architectures. To the best of our knowledge, this is the first systematic evaluation of PPG-based BP estimation from a BP change point perspective, highlighting the importance of fluctuation-aware evaluation and calibration for real-world continuous BP monitoring.