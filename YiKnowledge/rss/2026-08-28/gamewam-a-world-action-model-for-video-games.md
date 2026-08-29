---
title: 'GameWAM: A World Action Model for Video Games'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26200
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yuncheng Guo, Zhanqiu Zhang, Yiwen Guo, Weijia Li
---

arXiv:2608.26200v1 Announce Type: new 
Abstract: Modern video games combine first-person perception, rapid visual changes, persistent world state, and heterogeneous native controls. Existing game agents map visual and task context directly to actions but lack explicit world dynamics modeling, whereas interactive game world models predict visual futures from supplied actions but do not serve as task policies. World-Action Models (WAMs) unify these objectives, but remain largely unexplored under the dynamics and open-ended interaction of video games. We introduce GameWAM, to our knowledge the first WAM for native closed-loop gameplay and GUI control. GameWAM jointly generates future visual observations and executable keyboard-mouse trajectories through parallel visual and action generative processes with block-causal conditioning and flow matching. To support joint world-action learning, we construct synchronized gameplay and GUI trajectories. To handle heterogeneous native control, GameWAM predicts a gameplay/GUI mode at each action step and generates actions with mode-specific prediction distributions and continuous-action normalization. For long-horizon interaction, block-cycle control predicts beyond the committed horizon, executes only a short action prefix, and replans from new observations, while fine-grained within-cycle context and hierarchical cross-cycle history preserve temporal continuity. Experiments demonstrate competitive task success with fewer executed native actions than the compared agents. We further uncover Low-Frequency Action Source Imprinting (LASI), in which low-frequency components of the sampled action source systematically steer coarse generated camera motion under fixed conditioning, revealing a source-sensitivity failure mode in generative control. Project page is available at https://yunncheng.github.io/GameWAM/.