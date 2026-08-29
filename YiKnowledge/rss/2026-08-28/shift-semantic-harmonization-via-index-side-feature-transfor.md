---
title: 'SHIFT: Semantic Harmonization via Index-side Feature Transformation for Multilingual
  Information Retrieval'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2606.18801
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Youngjoon Jang, Seongtae Hong, Hyeonseok Moon, Heuiseok Lim
---

arXiv:2606.18801v2 Announce Type: replace-cross 
Abstract: With the rapid expansion of massive multilingual corpora, Multilingual Information Retrieval (MLIR) has emerged as a critical technology for global information access. MLIR enables users to retrieve semantically relevant documents from multilingual text collections using a single-language query. However, recent multilingual dense retrieval models often exhibit a strong preference for documents in the same language as the query. This leads to severe language bias, where top-ranked results are dominated by documents of specific languages, even when documents in other languages contain more semantically relevant information. To address this issue, we propose SHIFT, a training-free method applicable in the indexing stage. Specifically, SHIFT utilizes parallel translation pairs to estimate a relative language vector for each target language with respect to a source language. Subsequently, SHIFT corrects the language-specific offset by subtracting this relative language vector from document embeddings during indexing. Our comprehensive evaluation across four MLIR benchmarks and diverse dense retrieval models confirms that SHIFT can effectively mitigate language bias and enhance MLIR performance.