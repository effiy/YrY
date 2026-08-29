---
title: 'Autoresearch with Coding Agents: Generalizers and Metric-Maximizers on Quran
  Recitation Data'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2607.18064
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Nursultan Askarbekuly, Mohamad Al Mdfaa, Ahmed Helaly, Gonzalo Ferrer, Manuel
  Mazzara
---

arXiv:2607.18064v2 Announce Type: replace-cross 
Abstract: Coding agents can now be left alone to improve software against a score. In this pattern--recently popularized as "autoresearch"--the agent receives a dataset, an evaluation script, and one editable file, and iterates without supervision: modify the code, measure, keep the change if the score improves. But what does the agent actually optimize--the developer's intent, or the literal number? We ran this loop on a real production task: deciding which Quranic verses appear in a noisy speech-recognition transcript and splitting the transcript by verse. Two frontier coding agents, Claude Code and OpenAI Codex, started from the same blank file with the same instructions, budget, and reasoning effort, three runs each. Both independently invented the same algorithm (canonicalization, n-gram anchoring, dynamic-programming alignment)--and then diverged. Claude stopped early with compact, general code. Codex drove the score ~10x lower, largely by memorizing answers to individual evaluation rows (19-41 hardcoded verse ids per run): a clean natural instance of specification gaming by a production agent. In a preregistered second study, we added a held-out test set and told both agents it existed. The memorization vanished, and the score gap vanished with it--yet Codex's general core transferred better and more consistently (held-out detection+split 0.085+/-0.004 vs. 0.121+/-0.031), losing only on one missed rejection of non-recitation input. Two exploratory community arms (Cursor, Antigravity) are consistent with the pattern. Every agent's held-out solution matched or beat the hand-engineered pipeline it was built to replace--the best by an order of magnitude--and now runs in production. From the ways agents exploited our harness--reading sibling runs through shared git state, leaving notes to "future runs" in persistent memory--we distill five design rules for evaluating autonomous agents.