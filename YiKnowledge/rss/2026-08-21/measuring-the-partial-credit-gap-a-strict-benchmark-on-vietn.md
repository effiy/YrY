---
title: 'Measuring the Partial-Credit Gap: A Strict Benchmark on Vietnam''s 2025 Convex
  Marking Scheme'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18336
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Nguyen Quoc Hung, Nguyen Dang Minh, Le Nhu Quynh, Tran Khanh Linh, Nguyen
  Kieu Linh
---

arXiv:2608.18336v1 Announce Type: new 
Abstract: When evaluating language models on human exams, benchmarks typically score each response as right or wrong and report the overall accuracy. This approach assumes that partial knowledge is worth proportional credit, an assumption that fails when an examination uses a non-additive grading scheme. The 2025 reform of Vietnam's National High School Graduation Examination demonstrates the cost of this substitution. In Part II of the exam, candidates evaluate four true/false statements per question. The grading is convex: the number of correct statements earns 0, 0.10, 0.25, 0.50, or 1.00 points. Identifying three statements correctly pays 0.50 points, not the 0.75 points that standard accuracy metrics would award. Because Part II accounts for 4.00 of the exam's 10.00 points, reporting accuracy inflates the score by rewarding partial knowledge that the state explicitly penalizes. We introduce THPT-Ladder, a benchmark of 632 items from 21 official exams across 11 subjects, graded exactly as the ministry grades its students. The ministry publishes the marks of over a million candidates, allowing us to place models directly into the human cohort. Across eight models, the official rubric pays 0.020 to 0.159 points less per Part II question than proportional credit. This shortfall changes a model's apparent competence. For Qwen3.5-27B on the 2025 History exam, a 0.042-point shortfall drops its standing from the 90th to the 77th percentile among 481,293 candidates. A model's accuracy does not predict this penalty. At Claude Sonnet 5's accuracy level, different distributions of errors yield scores varying from 0.869 to 0.932 points per question. Official marks depend on how correct statements are grouped, meaning standard benchmarks report a competence the institution would not certify.