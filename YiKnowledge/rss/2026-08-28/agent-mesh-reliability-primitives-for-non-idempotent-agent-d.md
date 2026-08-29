---
title: 'Agent Mesh: Reliability Primitives for Non-Idempotent Agent Delegation - Identity
  Adequacy and Evidence Adequacy'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26225
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Mazhar Shaikh, Anurag Rajkumar Bombarde, Harshal Pathak
---

arXiv:2608.26225v1 Announce Type: new 
Abstract: Autonomous agents increasingly perform bounded software tasks under an orchestrator that retries, resumes, and budgets them. The machinery such orchestrators reach for is the service mesh's: retry, timeout, and error-rate circuit breaking. We report a failure study of a production agentic software-delivery platform over 147 numbered incidents spanning 81 runs, each with a measured cost and, in most cases, a mutation proof reproducing the failure. All three assumptions those primitives rest on are violated in practice, and we quantify the consequences: a loop of fifty-four consecutive successful tool calls no error-rate breaker could see; a progress signal constant by construction, guaranteeing a false trip on the third repair round and driving one run from six of six components to three; twenty-one events accumulated across six invocations of one delegation, making a correct, idempotent component unwinnable; a misrouted failure that woke five components for a two-component fault, leaving three bystanders regressing working code; and twelve incidents in which the enforcement layer blocked correct work, the most expensive costing 107 agent turns and zero accepted writes. We find one cross-cutting cause and its dual. Identity adequacy: in five separate subsystems an identity that failed to discriminate produced a confident wrong answer, and two of them derived the corrective rule independently. Evidence adequacy: a reliability decision may be taken only on evidence capable of moving, attributable to what it measures, and deterministic under identical conditions. From the findings we derive seven reliability primitives whose enforcement unit is the delegation rather than the message, and specify the controlled evaluation the study motivates but does not constitute.