---
title: ANTShapes Benchmarking Datasets for Event-Based Neuromorphic Object Classification
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.27150
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: M. Middleton, H. Kayan, B. Sen Bhattacharya, T. Ali, E. Baikas, M. Vousden,
  C. Perera, O. Rhodes, E. Gheorghiu, M. A. Trefzer
---

arXiv:2608.27150v1 Announce Type: cross 
Abstract: Object classification in event-based computer vision is a task that is attracting considerable research attention. Event-based object classification is a fundamental task in the fields of security and applied computer vision, which typically use synchronous frame-based cameras and computing pipelines for operation. This approach has several practical flaws. The size, weight and power consumption of the device could prohibit deployment at the extreme edge or in covert sensing environments. Besides this, there are security concerns inherent in cloud-based or other off-device computation approaches due to the requirement of sending and receiving potentially sensitive data. Furthermore, this transmission of data introduces latency and requires consistent connectivity to the cloud infrastructure to function.
  The use of Spiking Neural Networks (SNNs) hosted on neuromorphic devices attempts to solve several issues present in this conventional approach. Research into event-based object classification methods are hindered by the lack of high-quality vision datasets to use. To this end, the ANTShapes simulation tool has been previously proposed to create and label event-based vision datasets. In this paper, four novel datasets of varying difficulties are created using the tool and are benchmarked against existing spiking datasets commonly used for event-based vision research (N-MNIST, CIFAR10-DVS, DVSGesture and POKER-DVS). Classification is performed using a convolutional SNN. This work simultaneously provides four datasets with rich details for future experiments to use and validates the output of the ANTShapes dataset simulation tool as being suitable for its purpose.