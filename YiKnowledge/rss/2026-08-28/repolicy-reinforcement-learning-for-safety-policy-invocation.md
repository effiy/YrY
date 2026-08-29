---
title: 'RePolicy: Reinforcement Learning for Safety-Policy Invocation in Agent Safeguards'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.24275
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Houcheng Jiang, Boxuan Zhang, Qiyong Zhong, Junfeng Fang, Xiang Wang, Xiangnan
  He
---

arXiv:2608.24275v2 Announce Type: replace 
Abstract: Safeguarding language model agents requires assessing complete execution trajectories under context-dependent safety policies. Existing policy-aware safeguards mainly rely on prompting or supervised fine-tuning, limiting their ability to adapt to unseen trajectories and changing policy contexts. We propose RePolicy, an agent safeguard that learns safety-policy invocation through reinforcement learning. Given an agent trajectory and a dynamic policy library, RePolicy invokes the applicable policy and uses its content to produce a policy-grounded rationale and safety judgment. We construct PolicyTraj-20K to support supervised initialization, followed by GRPO with verifiable rewards and policy-context perturbation. Experiments across six agent safety benchmarks show that RePolicy achieves strong overall safety-detection performance and robust policy invocation under varying policy contexts.