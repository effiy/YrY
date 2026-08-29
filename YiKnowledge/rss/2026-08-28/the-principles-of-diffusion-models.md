---
title: The Principles of Diffusion Models
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2510.21890
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Chieh-Hsin Lai, Yang Song, Dongjun Kim, Yuki Mitsufuji, Stefano Ermon
---

arXiv:2510.21890v3 Announce Type: replace-cross 
Abstract: This book presents the core principles that have guided the development of diffusion models, tracing their origins and showing how diverse formulations arise from shared mathematical ideas. Diffusion modeling starts by defining a forward process that gradually corrupts data into noise, linking the data distribution to a simple prior through a continuum of intermediate distributions. The goal is to learn a reverse process that transforms noise back into data while recovering the same intermediates. We describe three complementary views. The variational view, inspired by variational autoencoders, sees diffusion as learning to remove noise step by step. The score-based view, rooted in energy-based modeling, learns the gradient of the evolving data distribution, indicating how to nudge samples toward more likely regions. The flow-based view, related to normalizing flows, treats generation as following a smooth path that moves samples from noise to data under a learned velocity field. These perspectives share a common backbone: a time-dependent velocity field whose flow transports a simple prior to the data. Sampling then amounts to solving a differential equation that evolves noise into data along a continuous trajectory. On this foundation, the book discusses guidance for controllable generation, efficient numerical solvers, and diffusion-motivated flow-map models that learn direct mappings between arbitrary times. It provides a conceptual and mathematically grounded understanding of diffusion models for readers with basic deep-learning knowledge. Supplementary materials for the book are available at the book website: https://the-principles-of-diffusion-models.github.io/