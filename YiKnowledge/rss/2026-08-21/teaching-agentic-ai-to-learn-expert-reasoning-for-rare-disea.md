---
title: Teaching agentic AI to learn expert reasoning for rare disease diagnosis
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2606.16149
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Minh-Ha Nguyen, Erica Gray, Bryce A. Schuler, Kevin W. Byram, Chih-Ting Yang,
  Fan Ma, Hua Xu, Wu-Chen Su, Chao Yan, Wei-Qi Wei, Adam Wright, Lisa Bastarache,
  Josh F. Peterson, Lingyao Li, Siyuan Ma, Undiagnosed Diseases Network, Rizwan Hamid,
  Thomas A. Cassini, Cathy Shyr
---

arXiv:2606.16149v4 Announce Type: replace 
Abstract: Rare disease diagnosis depends on expert reasoning that is scarce and difficult to transfer; off-the-shelf large language models (LLMs) rank the correct disease first in only 35.4% of benchmark cases. Here we show that this expert reasoning can be converted into a scalable AI capability through a governed learning process rather than model training alone. We developed liteOdyssey through Policy Iteration with Human Feedback (PIHF), an in-context policy-learning method adapted from generalized policy iteration in reinforcement learning, in which model failures and expert corrections consolidate into an clinician-gated policy that turns an off-the-shelf LLM into an agentic diagnostic system. We demonstrated that such a policy improved diagnostic accuracy to match the best published systems at a fraction of their deployment footprint, generalized to unseen diseases, transferred across models, and remained under clinician control. Across 1,243 public benchmark cases spanning 722 rare diseases, liteOdyssey ranked the correct disease first in 59.3% of cases versus 26.5% without the policy, with nearly identical gains on the 1,193 cases and 679 diseases excluded from policy development. Ablations showed that gains exceeded automated prompting improvement and source access alone, and the policy transferred without modification across closed- and open-weight models. In 515 Undiagnosed Diseases Network patients, liteOdyssey again improved accuracy, and blinded physicians rated its differentials more often exact and less often unhelpful. Through PIHF, expert reasoning becomes an LLM capability that experts can inspect, revise, and transfer across models.