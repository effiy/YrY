---
title: Prior-Conditioned Gaussian Discriminants for Generalizable AI-generated Image
  Detection
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18523
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Shashank Kotyan, Makoto Shing, Yuki Imajuku, Rujikorn Charakorn, Tarin Clanuwat
---

arXiv:2608.18523v1 Announce Type: cross 
Abstract: Diffusion-based generators have made synthetic images ubiquitous, but detectors often fail under simultaneous shifts in generator, prompt/style, and source-domain. We study AI-generated image detection as a transfer system described by training prior, frozen encoder feature space, and decision rule, and ask when classifier head training adds value beyond what is already separable in modern features. As a controlled diagnostic, we fit a prior-conditioned Gaussian discriminant ladder: closed-form heads built from first- and second-order feature statistics under nested covariance assumptions. On Percept-Lens, a unified protocol over 39 public datasets (7.1 million images), the best rung is frequently competitive with, and sometimes exceeds, released AI-generated image detector heads when matched on both prior and encoder. We further quantify strong sensitivity to the training prior, data-efficiency of moment-based heads, and representation dependence of Gaussian shift metrics, motivating (prior, encoder, head)-level reporting and stronger analytical baselines for AIGI transfer.