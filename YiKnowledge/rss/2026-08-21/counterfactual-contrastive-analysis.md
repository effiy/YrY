---
title: Counterfactual Contrastive Analysis
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.19032
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Yunlong He, Pietro Gori
---

arXiv:2608.19032v1 Announce Type: cross 
Abstract: Visual Counterfactual Explanations (VCEs) aim to explain image classifiers by generating minimally edited and realistic versions of an input image that change the classifier's prediction. Existing VCE methods are inherently classifier-dependent and therefore susceptible to classifier biases and failure modes, such as sensitivity to shortcut features and calibration errors. In this paper, we propose a classifier-free approach for visual counterfactual generation based on Contrastive Analysis (CA). Given two datasets corresponding to different classes (e.g., healthy and patients), we disentangle the generative factors that are common across the two datasets from those that are salient to each dataset, and generate counterfactual images by swapping only the salient factors. By operating directly on data distributions rather than decision boundaries, our method provides model-agnostic VCEs that are less sensitive to classifier biases. Our approach leverages the high-quality synthesis and well-structured latent space of StyleGAN2. We use the feature space F, instead than the usual W-space, to improve detail preservation. Unlike conventional CA approaches, which typically assume salient factors in only one dataset, we introduce an adapted framework and loss functions for VCE that allow multiple salient factors in each dataset. We evaluate our method on three medical imaging datasets and demonstrate superior counterfactual generation quality compared to existing approaches.