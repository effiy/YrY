---
title: NiyamAI - An Intent-Bound AI Agent with Cryptographically Verifiable Guardrails
  using Zero-Knowledge Proofs
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.07167
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Aditya Katkar, Om Karkele, Kartik Mandhane, Manisha More, Yash Kashid
---

arXiv:2608.07167v2 Announce Type: replace 
Abstract: Autonomous LLM agents with tool execution capabilities introduce severe security risks through prompt injection, goal hijacking, and unauthorized action invocation. Existing guardrails rely on unverified, host local software filters system prompts, semantic classifiers, policy engines that share the execution environment of the untrusted agent, offering no guarantee to an external observer that a safety policy was correctly evaluated. A compromised host produces no evidence of its own failure. This paper presents NiyamAI, an intent bound runtime guardrail architecture providing cryptographically verifiable execution integrity for autonomous agents. At session initialization, permitted tools and operational constraints are sealed into an immutable Intent Contract under a SHA256 commitment. Every tool invocation is intercepted by a deterministic authority gate and classified by a dedicated neural Judge (11->8->2 feedforward network). For each authorized action, NiyamAI generates a succinct zkSNARK proof certifying correct policy evaluation under the committed contract; execution proceeds only after that proof verifies. Across 2,000 AgentSafetyBench scenarios under 5fold stratified crossvalidation with out of fold scoring, NiyamAI achieves 88.8% F1 at a 1.0% false positive rate (bootstrap 95% CI [85.5%, 92.1%]), against 66.8% for Llama Prompt Guard 2, 46.2% for GPTOSSSafeguard, and 40.4% for NeMo Guardrails; McNemar's exact test confirms each margin at p < 0.0001. Proof generation adds 1.7 s per approved action, verification 51 ms, with an 18.6 KB proof verifiable by any third party without access to model parameters. We further subject NiyamAI's own enforcement mechanism to 18 adversarial vectors across six classes, disclosing two implementation vulnerabilities identified and remediated during development.