---
title: 'Hierarchical Classification via Cascading Feature Elimination: Application
  to Human Phenotype Ontology-Aligned Facial Phenotyping (FaceMesh2HPO)'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2607.05585
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Fabio Hellmann, Alexander Hustinx, Benjamin D. Solomon, GestaltMatcher Database
  Consortium, Tzung-Chien Hsieh, Peter Krawitz, Elisabeth Andr\'e
---

arXiv:2607.05585v2 Announce Type: replace-cross 
Abstract: FaceMesh2HPO is a framework for classifying facial phenotypic descriptors aligned with the Human Phenotype Ontology (HPO) to support clinical diagnosis. Using annotations from 124 clinicians across 10 disorders (107 HPO terms) combined with non-syndromic controls, we generated 3D facial meshes (478 landmarks) from 2D images and trained a hierarchical PointNet-based pipeline with cascading classification and feature elimination. The best models, incorporating 3D meshes, facial outline, and demographic metadata, achieved AUROCs between ~0.55 and ~0.89, with higher performance at parent nodes than leaf terms. External validation showed variable generalizability across disorders. Results demonstrate that hierarchical modeling of 3D facial geometry enables interpretable, ontology-linked phenotype classification, though performance on rare leaf terms remains limited. Improved data diversity and feature selection strategies are needed to enhance robustness and clinical utility.