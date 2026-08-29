---
title: Unleashing the Power of LLMs in Dense Retrieval with Query Likelihood Modeling
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2504.05216
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Hengran Zhang, Keping Bi, Jiafeng Guo, Xiaojie Sun, Shihao Liu, Daiting Shi,
  Dawei Yin, Xueqi Cheng
---

arXiv:2504.05216v5 Announce Type: replace-cross 
Abstract: Dense retrieval is a crucial task in Information Retrieval (IR), serving as the basis for downstream tasks such as re-ranking and augmenting generation. Recently, large language models (LLMs) have demonstrated impressive semantic understanding capabilities, making them attractive to researchers focusing on dense retrieval. While LLMs, as decoder-style generative models, excel in language generation, they often fall short in modeling global information due to a lack of attention to subsequent tokens. Drawing inspiration from the classical word-based language modeling approach for IR, specifically the query likelihood (QL) model, we aim to leverage the generative strengths of LLMs through QL maximization. Rather than employing QL estimation for document ranking, we propose an auxiliary task of QL maximization to enhance the backbone for subsequent contrastive learning of the retriever. We introduce our model, LLM-QL, which incorporates two key components: Attention Block (AB) and Document Corruption (DC). AB blocks the attention of predictive tokens to the document tokens before the document's ending token, while DC corrupts a document by masking a portion of its tokens during prediction. Evaluations on the in-domain (MS MARCO) and out-of-domain dataset (BEIR) indicate LLM-QL's superiority over other LLM-based retrievers. Furthermore, comprehensive analyses also validate the efficacy of LLM-QL and its components.