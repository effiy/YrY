---
title: Detecting Backdoors in Object Detection via Pre-NMS Prediction Distribution
  Shift
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.19088
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Longtian Wang, Zhengyu Zhao, Chenhao Lin, Le Yang, Shiwei Wang, Yuhan Zhi,
  Xiaofei Xie, Chao Shen
---

arXiv:2608.19088v1 Announce Type: cross 
Abstract: Object detection models deployed in safety-critical applications remain vulnerable to backdoor attacks that cause targeted misbehaviors when a hidden trigger is present. Existing detection methods either rely on trigger inversion or exploit architecture-specific assumptions, and critically, representative existing methods fail to generalize reliably to scene-level attacks, where a single trigger induces anomalous behavior across all objects in the scene simultaneously. We present DistScan, a backdoor detection framework based on a simple but previously unexploited observation: backdoor injection systematically shifts a model's pre-NMS prediction class distribution away from its training class frequencies, even on clean inputs without any trigger present. DistScan aggregates intermediate class predictions over a clean validation set and flags a model as backdoored if the resulting distribution deviates significantly from the training class frequencies, requiring no model weight access, no trigger knowledge, and no additional training. Extensive experiments on MS-COCO and PASCAL VOC across two architectures and three scene-level attack scenarios demonstrate that DistScan substantially outperforms existing methods, improving average detection accuracy over the best-performing applicable baseline by 27.32 percentage points.