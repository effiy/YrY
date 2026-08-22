---
title: Low-Power, Neuromorphic, Acoustic Anomaly Detection for Persistent Machine
  Monitoring
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18341
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Steven C. Nesbit (Information Sciences, CAI-3, Los Alamos National Laboratory,
  Los Alamos, USA), Victor M. Vergara (AeroVironment Inc., Albuquerque, USA), Michael
  A. Felix (University of New Mexico COSMIAC Research Center, Albuquerque, USA), Evan
  T. Kain (Air Force Research Laboratory, Kirtland AFB, USA), Luis R. Garc\'ia Carrillo
  (Air Force Research Laboratory, Kirtland AFB, USA), Gerd J. Kunde (Nuclear and Particle
  Physics and Applications, P-3, Los Alamos National Laboratory, Los Alamos, USA),
  Andrew T. Sornborger (Information Sciences, CAI-3, Los Alamos National Laboratory,
  Los Alamos, USA)
---

arXiv:2608.18341v1 Announce Type: cross 
Abstract: Persistent acoustic monitoring can detect machine faults without physical contact, but always-on inference is constrained by power, latency, and deployment complexity. We demonstrate autoencoder-based acoustic anomaly detection on an Intel Loihi 2 neuromorphic processor under clean and noisy conditions. Log-mel features are computed off chip; normalization, autoencoder inference, L1 reconstruction scoring, and thresholding run on chip. In a clean, microphone-position-invariant ToyADMOS ToyCar benchmark, the on-chip model achieves 0.9959 AUC and 0.9785 standardized pAUC at maximum false-positive rate 0.1. In the DCASE 2026 Task 2 ToyCar noisy benchmark, the model achieves source AUC 0.7990, target AUC 0.6466, and pAUC 0.6426, exceeding reported baseline metrics. Power profiling on a 16-chip Loihi 2 VPX system shows real-time throughput with 0.0406$\unicode{x2013}$0.0426 mJ dynamic energy per sample, two orders of magnitude lower than both a CPU and GPU. These results support neuromorphic acoustic anomaly detection as a practical candidate for low-power, persistent machine monitoring.