---
title: Composed Historical Image Retrieval by Modeling Temporal Representations
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18694
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Adri\`a Molina Rodr\'iguez, Oriol Ramos Terrades, Josep Llad\'os Canet
---

arXiv:2608.18694v1 Announce Type: cross 
Abstract: While time evolves linearly, the geometry of neural embedding spaces is inherently multi-dimensional, often chaotic, and difficult to interpret. In principle, one could constrain an embedding space to a single temporal dimension; however, such a reduction would sacrifice performance on downstream tasks, as one-dimensional embeddings cannot retain sufficient expressive capacity. This paper asks whether it is possible to learn representations that preserve temporal structure while remaining effective for image and object retrieval, and answers this question by building the mathematical foundations of such a system. We propose Temporally Decomposable Image Representations (TDIR), a representation learning algorithm that decomposes historical photographs into separate date and content components through orthogonal subspaces. We define and prove the conditions under which such a decomposition is achievable, characterize the error incurred when those conditions are only partially met, and show that orthogonality between temporal and categorical subspaces emerges naturally from the joint optimization, without requiring it to be imposed explicitly. Beyond its geometric properties, TDIR enables a class of transitive operations on embedding spaces: the temporal information of one image can be extracted and injected into the representation of another, with no label supervision required. All theoretical properties are grounded and validated in the real-world problem of Composed Image Retrieval on historical photographs, where a query simultaneously specifies object content and a target time period, either through labels or through example images. This in-the-wild setting serves as a concrete backing for the propositions we derive, offering an intuitive and interpretable way to navigate photographic archives while maintaining competitive performance in both date estimation and object retrieval.