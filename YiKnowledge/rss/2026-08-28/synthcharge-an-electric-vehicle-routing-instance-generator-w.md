---
title: 'SynthCharge: An Electric Vehicle Routing Instance Generator with Feasibility
  Screening to Enable Learning-Based Optimization and Benchmarking'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2603.03230
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Mertcan Daysalilar, Fuat Uyguroglu, Gabriel Nicolosi, Adam Meyers
---

arXiv:2603.03230v2 Announce Type: replace-cross 
Abstract: The electric vehicle routing problem with time windows (EVRPTW) extends the classical VRPTW by introducing battery capacity constraints and charging station decisions. Existing benchmark datasets are often static and lack verifiable feasibility, which restricts reproducible evaluation of learning-based routing models. We introduce SynthCharge, a parametric generator that produces diverse, feasibility-screened EVRPTW instances across varying spatiotemporal configurations and scalable customer counts. While SynthCharge can currently generate large-scale instances of up to 500 customers, we focus our experiments on sizes ranging from 5 to 100 customers. Unlike static benchmark suites, SynthCharge integrates instance geometry with adaptive energy capacity scaling and range-aware charging station placement. To guarantee structural validity, the generator systematically filters out unsolvable instances through a fast feasibility screening process. Ultimately, SynthCharge provides the dynamic benchmarking infrastructure needed to systematically evaluate the robustness of emerging neural routing and data-driven approaches.