---
title: CPU 噪声会拖慢 GPU 推理吗：用 eBPF 定量测量调度器与 IRQ 影响
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7679000152964153353
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 00:02:29 GMT
author: yunwei37
---

通过 eBPF 追踪 CUDA kernel launch、调度器上下文切换和 IRQ，定量分析 CPU 噪声何时会拖慢 GPU LLM 推理，以及 CPU 绑核能恢复多少吞吐。