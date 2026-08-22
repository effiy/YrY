---
title: Block-sparse GPU kernels
tags:
- OpenAI Blog
category: aier/foundations
created: '2026-08-22'
source: https://openai.com/index/block-sparse-gpu-kernels
type: rss
source_name: OpenAI Blog
source_url: https://openai.com/blog/rss.xml
published: Wed, 06 Dec 2017 08:00:00 GMT
---

We’re releasing highly-optimized GPU kernels for an underexplored class of neural network architectures: networks with block-sparse weights. Depending on the chosen sparsity, these kernels can run orders of magnitude faster than cuBLAS or cuSPARSE. We’ve used them to attain state-of-the-art results in text sentiment analysis and generative modeling of text and images.