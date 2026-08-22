---
title: 'Formal Verification of Romanov''s Triplet Logic: A Verified Filter for Sliding-window
  3-CNF with Application to Structured Formulas'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18445
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Dmitry V. Alexandrov
---

arXiv:2608.18445v1 Announce Type: cross 
Abstract: We present the first mechanised formalisation of Romanov's Triplet Logic (TLS) in the Rocq proof assistant. TLS is a triplet-based combinatorial framework for reasoning about compatible paths through layered triplet structures, called Compact Triplets Structures (CTS), and their intersection via Romanov's Effective Procedure, which we refer to as Simple Vertex Intersection (SVI). Originally motivated by Boolean satisfiability, TLS constitutes a self-contained mathematical theory whose formal properties had not been previously established. We formalise the core of TLS in Rocq, including Compact Triplets Formulas (CTF), CTS, hyperstructures, clearing, and SVI. For the well-formed sliding-window fragment we verify a clause-by-clause CNF-to-CTF translation, the clearing procedure, and aligned intersection, and we prove explicit polynomial-time bounds for the filter stages. Our main contribution is a precise correctness boundary: the existence of a joint satisfying set implies non-emptiness of SVI, but the converse does not hold in general; for aligned structures we recover a complete bi-implication, extended to systems of structures. We also formalise soundness of grouped-window translation and exhibit a formal counterexample to its completeness. We introduce VFR, an extracted OCaml prototype that provides a verified decision procedure for the sliding-window fragment and a sound one-sided filter for general 3-CNF, with a Python runtime and reproducible Docker packaging. Benchmarks on random and structured instances confirm the predicted behaviour, and the complete toolchain is available as a curated Zenodo artifact. The Rocq development comprises more than 23,000 lines of code across seventeen files, with 427 proved lemmas and theorems and zero admitted goals.