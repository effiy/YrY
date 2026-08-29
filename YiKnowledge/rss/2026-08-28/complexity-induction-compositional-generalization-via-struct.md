---
title: 'Complexity Induction: Compositional Generalization via Structured Training
  Distortion'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.21464
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Aleksandr V. Abramov
---

arXiv:2608.21464v2 Announce Type: replace-cross 
Abstract: We demonstrate that structured distortion of training data - which we term complexity induction - can induce compositional generalization in a standard CNN classifier without architectural modification. Using synthetic images of colored geometric shapes, we encode classes as flat string labels (e.g., "red-circle") with no explicit attribute decomposition, and exclude certain color-shape combinations from training entirely. We apply two distortion methods derived from Jaccard string similarity between class names: mixed labels (soft target distributions encoding inter-class overlap) and expanded dataset (false training samples with structurally motivated incorrect labels). Both methods induce the ability to predict unseen class combinations, and act at different levels: mixed labels activate the classifier for unseen combinations by exploiting the CNN's natural embedding structure, while expanded training improves the embedding factorization itself. A control with random (unstructured) false labels confirms that the effect depends on the structure of the distortion, not on noise per se. These results suggest that structured complication of training signals can influence both the internal organization of learned representations and their compositional interpretation - a principle that may underlie the role of natural language in cognitive development.