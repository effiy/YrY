---
title: 'Canonical-basis realignment for Transformer LLMs: every hidden axis becomes
  independently measurable and controllable'
tags:
- Lobsters
category: engineer/ship
created: '2026-08-29'
source: https://github.com/todotge/canonical-basis
type: rss
source_name: Lobsters
source_url: https://lobste.rs/rss
published: Sat, 29 Aug 2026 15:16:54 -0500
author: github.com via Yogthos
---

<p>The code essentially gives you a way to rotate a Transformer's internal coordinate system into a canonical basis that aligns with its own weight matrices in a lossless way. By absorbing the normalization gains directly into the adjacent weights and using orthogonal matrices built from the singular vectors of the model, you can transform architectures like Qwen or Pythia without altering their outputs or perplexity scores.</p>
<p>Applying this transform reveals the actual hidden geometric structures operating inside the network. Once the model is rotated into this new perspective, you can see its internal mechanisms that were previously opaque. The authors found things like a bipolar oscillator where specific axes form inhibitory pairs that fire against each other in perfect opposition. They also observed a kind of rhythmic respiration across layers where the model alternates between absorbing knowledge and filtering it. On top of that, it exposed a homeostatic defense mechanism that aggressively erases any localized perturbations within just a couple of layers.</p>
<p>Practically speaking, researchers now have a powerful lens for mapping out how models actually do reasoning. For example, it turns out that the effective rank of the correlation matrix in a half billion parameter model might be as low as eleven independent patterns. Reframing how we look at the internal activations of language models provides a standardized way to study their underlying architecture.</p>
<p><a href="https://lobste.rs/s/wg65qn/canonical_basis_realignment_for">Comments</a></p>