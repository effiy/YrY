---
title: 'From Multi-Agent to Single-Agent: When Is Skill Distillation Beneficial?'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2604.01608
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Binyan Xu, Dong Fang, Haitao Li, Kehuan Zhang
---

arXiv:2604.01608v5 Announce Type: replace 
Abstract: Multi-agent systems (MAS) for structured data-science tasks externalize analytical control through workflows spanning stages, tools, shared state, verification, and repair. Distilling such workflows into a single-agent skill can reduce orchestration overhead, but it remains unclear which workflow components should cross the control boundary. We distinguish capability resources, which expand what an agent can do, from pipeline guidance, which constrains which solutions it explores. On the same causal-estimation instances, adding task-qualified source pipeline guidance to a capability-matched skill changes normalized utility by +19.6 points under method-selection accuracy but -10.3 points under numerical error. To explain this reversal, we introduce Behavior-Outcome Freedom (F), a pre-synthesis diagnostic of signed behavior-outcome rank mismatch, and formalize its candidate-conditional role through Signed Anchor-Rank Transfer. Motivated by this mechanism, we propose AdaSkill, which preserves validated capability resources, removes runtime orchestration, and conditionally inherits pipeline guidance using a calibrated rule over F. Across 16 capability-matched interventions, the native-scale Full-minus-Discard effect decreases across the continuous F scale (r = -0.80, p < 0.001), while a 15-treatment atomic sweep localizes the reversal to pipeline guidance. Across 11 datasets spanning four structured data-science task families, AdaSkill combines strong task performance with substantially lower deployment overhead.