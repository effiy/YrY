---
title: Knowledge-Verified Emergent Deception in LLM Agents Under Conflicting Incentives
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26372
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Zheyuan Liu, Weiliang Zhao, Xiangchi Yuan, Ningshan Ma, Yue Huang, Meng Jiang
---

arXiv:2608.26372v1 Announce Type: cross 
Abstract: Large language models are increasingly deployed as autonomous agents serving users on behalf of companies, placing them in settings where user and deployer interests can conflict. When an agent knows that a user is owed something its deployer would prefer to deny, does it remain honest? Answering this is difficult because false statements can reflect either ignorance or hallucination rather than deception. To address this challenge, we introduce KnownLieBench , a knowledge-verified benchmark that first confirms through a neutral probe that an agent knows a user's entitlement, and then evaluates whether it makes false claims once an incentive to deny that entitlement is introduced. Specifically, KnownLieBench covers eight customer-service domains and 112 grounded cases, conducts multi-round dialogues with a trust-tracking customer agent, and separates deception emerging from incentive alone from deception produced under explicit instruction. Across eighteen proprietary and open-weight models, emergent deception varies substantially across model families and domains. We further use the benchmark for post-training, finding that honesty-directed fine-tuning reduces deception under incentive, while deception-graded fine-tuning increases lie success on honest-control dialogues without increasing lie frequency under incentive. By verifying entitlement knowledge before scoring deceptive behavior, KnownLieBench reduces the confound between lying and not knowing and enables more rigorous auditing and steering of agent honesty.