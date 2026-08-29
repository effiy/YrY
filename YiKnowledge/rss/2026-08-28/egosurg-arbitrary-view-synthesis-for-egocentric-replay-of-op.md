---
title: 'Egosurg: Arbitrary view synthesis for egocentric replay of operating room
  workflows from ambient cameras'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2510.04802
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Han Zhang, Lalithkumar Seenivasan, Jose L. Porras, Roger D. Soberanis-Mukul,
  Hao Ding, Hongchao Shu, Benjamin D. Killeen, Ankita Ghosh, Lonny Yarmus, Jeffrey
  K. Jopling, Masaru Ishii, Angela C. Argento, Mathias Unberath
---

arXiv:2510.04802v2 Announce Type: replace-cross 
Abstract: Observing surgical practice has historically relied on fixed vantage points or recollections, leaving the egocentric perspectives that shape clinical decisions undocumented. Ambient fixed cameras capture the operating room (OR) at room scale but cannot recover what any individual team member actually saw. We present EgoSurg, a framework that reconstructs dynamic OR scenes from sparse wall-mounted stereo video and renders arbitrary, role-specific egocentric views without instrumenting personnel or interfering with clinical workflow. EgoSurg initializes a per-timestamp 3D Gaussian Splatting representation from scale-aware stereo depth and refines it with an image-conditioned diffusion model that corrects auxiliary rendered views, mitigating artifacts caused by limited camera coverage, crowding, and occlusion. We evaluated the framework on four real robotic pulmonology procedures and two simulated full-workflow sessions across two hospital sites. Near-field reconstruction fidelity was consistent (PSNR 26.8~dB, SSIM .895) across five workflow phases and both sites, and synthesized egocentric views reached a PSNR of 17.8~dB and an SSIM of .766 against paired hand-held point-of-view recordings. We further demonstrate three case studies for intended use: adjudicating a simulated sterile field violation, replaying a procedure from role-specific viewpoints, and testing a counterfactual change in personnel position. These results indicate that existing ambient camera infrastructure can be turned into a navigable 3D record of surgical work, supporting retrospective review of safety events, training, and workflow analysis from every angle.