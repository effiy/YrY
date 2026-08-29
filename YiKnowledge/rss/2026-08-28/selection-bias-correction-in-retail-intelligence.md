---
title: Selection Bias Correction in Retail Intelligence
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26156
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Spandan Ghose Chowdhury
---

arXiv:2608.26156v1 Announce Type: new 
Abstract: Retail intelligence often relies on monitoring popular, high-velocity products, potentially biasing economic indicators by ignoring the "long tail" of niche items. This simulation study investigates selection bias in inflation estimation and compares correction methods across diverse data-generating processes. Through 400 Monte Carlo replications spanning four scenarios--aligned step functions, smooth gradients, misaligned breaks, and polynomial relationships--we test the robustness of Inverse Probability Weighting (IPW) with five specifications against stratification with varying strata counts. Our findings reveal fundamental limits of weighting methods in retail long-tail contexts: stratification achieves superior performance in three of four scenarios, maintaining sub-0.04pp median error even when boundaries deliberately misalign with population breaks (116x advantage over IPW). However, IPW with spline propensity models wins under smooth polynomial relationships (median error 0.007pp vs. 0.013pp), demonstrating context-dependency. Critically, even an oracle IPW specification with perfect structural knowledge achieves 6.06pp error compared to stratification's 0.008pp in step-function scenarios. This reflects violation of the Positivity Assumption--a fundamental causal inference requirement--rather than IPW methodological inferiority. When selection probabilities differ dramatically (90% vs. 1%), weighting methods operate outside their theoretical design envelope. These results demonstrate that stratification provides a safer engineering choice in retail long-tail distributions with severe positivity violations.