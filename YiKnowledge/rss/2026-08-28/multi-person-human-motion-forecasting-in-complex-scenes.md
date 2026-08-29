---
title: Multi-Person Human Motion Forecasting in Complex Scenes
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.27039
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Serdar Ozsoy, Lars Doorenbos, Juergen Gall
---

arXiv:2608.27039v1 Announce Type: cross 
Abstract: Accurately forecasting the movement of people in complex scenes requires reasoning over the past and present state of the entire environment. In this context, effectively incorporating object information and social interactions into a unified framework remains particularly challenging. To address this, we propose Object-Conditioned Social Diffusion (OCSD), a conditional diffusion model that integrates motion history, multi-person interactions, and object cues into a single framework. OCSD uses an object-conditioning mechanism that modulates denoising at every timestep, enabling fine-grained human-object reasoning, and a social encoder that models the interactions between all humans in the scene. As a result, our model naturally handles varying group sizes, complex social interactions, and supports sampling multiple plausible futures. Extensive experiments show that OCSD achieves state-of-the-art results on the Humans in Kitchens (HiK) and HOI-M3 benchmarks. It reduces the two-second path error by 121.5 mm (31.3%) on HiK and 130.5 mm (33.2%) on HOI-M3 compared to prior work, and produces more realistic long-term forecasts.