---
title: Redakto - The Incognito Tab for LLMs
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18260
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Saurav Kumar Saha, Tom R\"ohr, Felix Bie{\ss}mann
---

arXiv:2608.18260v1 Announce Type: new 
Abstract: Large Language Models (LLMs) are being increasingly used in everyday applications. A major challenge in the context of LLMs or Artificial Intelligence (AI) in general is to ensure privacy when using them, meaning that personally identifiable information (PII) is removed from any text that enters an LLM. These challenges have become more urgent with novel EU legislation. Uncertainty around LLM usage with respect to privacy concerns in EU countries can be a major blocker for the speed of innovation and transfer from research to applications. Here we present \textbf{Redakto}, a tool that can be used for anonymizing text prior to feeding it to an LLM or other downstream text processing. We provide state-of-the-art functionalities for both redaction of PII but also when used for pseudonymization. These functionalities are exposed such that they can easily be used by end-users, through the Redakto web application, and by developers and researchers, via REST APIs and model context protocol (MCP) hooks. The implementation is fully open source, requires modest compute resources, and can be readily deployed on local hardware. In contrast to prior work and in order to better assess the quality of the anonymized texts, we conduct extensive empirical evaluations on textual data from legal and medical domain with respect to both privacy and utility of the redacted texts. Our empirical results demonstrate that the texts anonymized with different redaction strategies achieve utility scores on par with the original texts, suggesting that anonymization with Redakto can be used for LLM tasks without substantial negative impact for the tasks we explored.