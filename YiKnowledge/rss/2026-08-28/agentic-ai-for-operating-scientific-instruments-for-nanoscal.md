---
title: Agentic AI for operating scientific instruments for nanoscale characterization
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26198
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Zahra Ayar, Marcos Penedo, Mahdi Mehdikhani, Nahid Hosseini, Prabhu Prasad
  Swain, Georg E. Fantner
---

arXiv:2608.26198v1 Announce Type: new 
Abstract: Operating a scientific instrument such as an atomic force microscope (AFM) requires continuous expert decision-making. A trained user defines the experimental intent, translates it into instrument commands, assesses incoming data, adjusts imaging parameters, and post-processes the final image. Existing automation usually addresses only parts of this workflow through hard-coded routines, task-specific controllers, or trained machine-learning models. Here we present an agentic-AI framework that operates the executable part of the AFM workflow using a general-purpose, tool-augmented large language model connected to instrument functions through the Model Context Protocol (MCP). The framework consists of 3 MCP-based agents: AFM Messenger converts natural-language instructions into checked instrument commands; AFM Pilot assesses image quality through a large language model (LLM) and, if necessary, adapts imaging parameters; and AFM Doctor diagnoses image artifacts and applies transparent post-processing from a pre-approved tool set. Because the language model performs image assessment rather than a fixed scalar objective or external optimizer, the same strategy can be applied across sample types and imaging modes without specific retraining. Safe hardware operation is enforced through an ambiguity check layer before execution. Benchmarking against fine-tuned and off-the-shelf tool-using models shows that this guarded execution layer, rather than model capability alone, reduces wrong-command execution to zero. In live experiments on different samples, AFM Pilot matched expert operators in image quality, iteration count, and tuning time, with no significant difference. These results demonstrate a safe route to agentic operation of scientific instruments, where experimental intent remains human-defined while command execution, image-based tuning, and post-processing are delegated to AI agents.