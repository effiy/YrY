---
title: 'RDFdL: Integrating RDF with Differential Dynamic Logic'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18165
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Yuyang Li, Lukas Kubelka, Julia Butte, Tobias K\"afer
---

arXiv:2608.18165v1 Announce Type: new 
Abstract: Knowledge graphs modeled in RDF are powerful for describing static knowledge, but they cannot capture or reason about the dynamic behavior of physical systems, e.g., systems described by differential equations, which is a critical gap for AI-driven cyber-physical systems. To solve this, we propose RDFdL, a framework that integrates RDF with Differential Dynamic Logic (dL) to represent and reason about both static knowledge and the continuous dynamics of physical systems. For the dynamic part, we syntactically represent differential equations and ranges in the state space in RDF and SHACL and provide semantics using a translation to dL. Linking RDF and dL through their shared foundation in first-order logic achieves a unique integration: verification results for safety and reachability properties in the dynamic logic domain become available as entailment to SPARQL queries over RDF data. We implement the pipeline using Apache Jena for ontology-driven RDF reasoning and KeYmaera X, the theorem prover for dL, and sketch its applicability in manufacturing.