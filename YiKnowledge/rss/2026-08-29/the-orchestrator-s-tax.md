---
title: The Orchestrator's Tax
tags:
- Martin Fowler
category: leader/architecture
created: '2026-08-29'
source: https://martinfowler.com/articles/orchestrator-tax.html
type: rss
source_name: Martin Fowler
source_url: https://martinfowler.com/feed.atom
author: Martin Fowler (martin@martinfowler.com)
---

<p>Subagents get justified by time saved and parallel execution, but
      <b class="author">Rahul Garg</b> explains that's not what matters most. Every
      token in the orchestrator's context is competing for its attention, and
      the real value of a subagent is what it keeps out of that context.
      Subagents should be treated as a tool for protecting the orchestrator's
      working memory, offloading reasoning it doesn't need to hold onto. Doing
      this well means giving the orchestrator explicit ground rules for when and
      how to delegate. </p>

<p><a class="more" href="https://martinfowler.com/articles/orchestrator-tax.html">more…</a></p>