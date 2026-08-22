---
title: 'ComponentBench: Diagnosing Component-Level Failures in Computer-Use Agents'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18307
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Tianchen Guan, Xinlei Lin, Royce Cheng-Yue, Xiangjun Wang, Shuyan Zhou
---

arXiv:2608.18307v1 Announce Type: new 
Abstract: Current evaluation of computer-use agents is split between long-horizon workflow benchmarks and atomic GUI-grounding tests. This leaves an under-instrumented middle layer: realistic component-centered interactions (e.g., toggle a button set) that are short enough to diagnose and rich enough to capture the burdens of modern interfaces. We present ComponentBench, a benchmark and diagnostic pipeline for component-level evaluation of computer-use agents on modern web UIs. ComponentBench is organized around a library-agnostic ontology of 97 canonical UI components instantiated as 2,910 programmatically verified tasks across widely used component libraries, paired with cleaned human reference trajectories that enable evaluation of both task success and interaction efficiency. Beyond task collection, we introduce a scalable pipeline for auditing realized structural difficulty after implementation and synthesizing structured failure analyses across tasks and component families. Evaluating seven models -- GPT-5.4, Gemini 3 Flash, GPT-5.4 mini, GPT-5 mini, Gemini 3.1 Flash-Lite, Qwen3-VL-235B, and UI-TARS-1.5-7B -- across four observation and action spaces, we show that these design choices critically impact performance. Within a single shared harness, changing only the observation and action space shifts task success by more than 30% for the same model: GPT-5 mini falls from 83.1% with accessibility-tree observations to 48.9% with coordinate-only Pixel control. Moreover, even the fastest configuration takes 3.7x as long as the matched human reference, and spatial manipulations that are trivial for humans continue to challenge current agents.