---
title: 'PLCBench: Can Autonomous LLM Agents Turn PLC Access into Sustained Physical
  Impact?'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26882
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yitian Zhou, Jingyu Zheng, Qiliang Jiang, Linkang Du, Haoming Liu, Lichao
  Wu, Shiyi Zhao, Mengxiang Liu, Ruilong Deng
---

arXiv:2608.26882v1 Announce Type: cross 
Abstract: Industrial control systems (ICSs) rely on programmable logic controllers (PLCs) to connect networked computation with physical control. Tool-using large language model (LLM) agents represent an emerging attack threat: can an autonomous agent convert a network-reachable PLC into sustained adverse physical impact? However, existing evaluations focus on digital tasks or individual stages of PLC testing. In ICSs, evaluations that stop at software exploitation, an accepted write, or tool access may therefore mischaracterize physical risk.
  We present PLCBENCH, to our knowledge, the first real-PLC hardware-in-the-loop (HIL) framework for characterizing this cyber-to-physical capability and its boundaries. It combines vendor-native interaction, commercial PLC execution, closed-loop reduced-order process simulation, and independent outcome verification. A deterministic evaluator applies fixed rules to runner, communication, PLC-object, and process records to assign six hidden diagnostic flags, distinguishing usable PLC interaction, process-linked manipulation, and sustained physical impact. We instantiate PLCBENCH on four commercial PLCs crossed with four closed-loop workloads. Across five LLM families and 240 real-PLC episodes, 75 episodes (31.3%) sustain their respective physical objectives. Stagewise results show that 98 episodes stop before a valid native read, whereas 62 reach a process-linked write but do not sustain the final objective. Notably, richer process observation is associated with an increase in conditional objective attainment after a process-linked write from 44.2% to 64.0%. These measurements localize failure in configured PLC-process deployments and identify intervention points for future defense evaluation. To support reproducibility, we release the safely disclosable PLCBENCH code and a software-only reproduction pipeline through the accompanying artifact.