---
title: 'From Sound to Symptom: Real-Time Respiratory Signal Understanding for Conversational
  Healthcare Agents'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26163
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Tanmay Laud, Herprit Mahal, Subhabrata Mukherjee
---

arXiv:2608.26163v1 Announce Type: cross 
Abstract: Cough events during live spoken conversations carry clinically valuable respiratory signals, yet existing dialogue systems treat them as acoustic noise to be discarded. We present HealthCUES (Clinical Understanding from Embodied Sounds), a streaming pipeline for paralinguistic respiratory monitoring in real-time conversational agents, a capability that, to the best of our knowledge, is absent from all prior systems. HealthCUES processes audio through a rolling buffer aligned with dialogue turn boundaries, enabling sub-second event detection without interrupting conversational flow. Beyond binary cough detection, the system provides fine-grained analytics: (i) differentiation between coughing and throat clearing, (ii) cough subtype classification (dry, wet, barking, whooping) with confidence scores, and (iii) temporal duration estimation with start-end boundaries. To prevent alert fatigue, HealthCUES introduces dialogue-aware gating mechanisms that modulate triggering based on conversational context. The system leverages Qwen3Omni, a multimodal large language model (MLLM), with constrained structured outputs, decomposing cough analysis into parallel prediction tasks for independent prompt optimization. Evaluation on 847 in-house conversational audio segments demonstrates 93\% F1 for cough detection, 0.75 weighted-F1 for wet/dry subtype classification, and average end-to-end latency of 340ms; external validation on the AMI meeting corpus confirms robust cough, throat-clearing, and speech separation in the presence of speech (0.91 macro-F1). A user study with licensed healthcare professionals confirms the clinical relevance of subtype information and the system's utility in telehealth workflows.