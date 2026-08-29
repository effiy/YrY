---
title: Five Primitives for Governing Autonomous AI Agents at Runtime
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26696
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Jiten Oswal, John Cadeddu
---

arXiv:2608.26696v1 Announce Type: new 
Abstract: Enterprise deployments of autonomous AI agents inherit a control model built for human users and long-lived services, and the fit fails in three specific ways: agent principals are ephemeral, appearing and vanishing faster than provisioning; their actions are selected by a model rather than programmed, so the set of things they may attempt is not known in advance; and the population is discovered rather than provisioned, because anyone who can call an API can create one. We argue that governing such agents is a runtime problem -- not a model-alignment problem and not a build-time problem -- and we derive five primitives from the questions that must be answered before an action takes effect and after it has: discovery, identity, governance, attestation, and supply chain. For each we state what fails if it is absent and why the others cannot structurally supply it. We describe an implementation in which an agent's action is mediated against policy before it takes effect, authorised against a per-tenant action vocabulary, and recorded in a hash-linked signed ledger a third party can verify with the vendor out of the loop. We report what the architecture costs: the enforcement point sits on the request's critical path, identity requires a sidecar per workload, and fail-closed mediation converts availability incidents into denial. We are explicit about implementation status: four primitives are built and running in private pilots, and the fifth is built as separate tooling and not yet integrated into the request path. We keep it in the set deliberately: a five-part decomposition that exactly matches what its authors happened to build is not a taxonomy but a description of a codebase.