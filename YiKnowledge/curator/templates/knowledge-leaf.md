---
title: Knowledge Leaf Template
aliases: [leaf-template, knowledge-leaf-template, unified-template]
tags: [template, leaf, knowledge-base, ssot]
category: curator/templates
created: 2026-08-24
updated: 2026-08-24
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator, engineer, producter, leader, aier, srer, executiver]
benefit: "Single source of truth template for all knowledge leaves — copy and fill in"
acceptance_criteria:
  - "7 sections: Summary, Core Viewpoints, Key Information, Action Recommendations, Anti-patterns, Related Links, Changelog"
  - "every placeholder is annotated with what to replace"
  - "field explanation table covers all placeholders"
related:
  - ./README.md
  - ./INDEX.md
  - ../治理/readiness-checklist.md
---

# Knowledge Leaf Template

> **Copy this file, rename it, and fill in every `{{placeholder}}`.** This is the SSOT template — all knowledge leaves derive from this structure. Do not modify this file; create a copy.

## 1. Summary

> One paragraph (2-4 sentences). Answer: what problem does this solve, for whom, and what's the key takeaway?

{{Write a concise summary. A busy reader should understand the topic and whether this file is relevant to them within 10 seconds.}}

## 2. Core Viewpoints

> The main arguments, patterns, or principles. Use bullet points. Each point should be a claim, not a description.

- {{Core viewpoint 1 — a claim, not a fact}}
- {{Core viewpoint 2}}
- {{Core viewpoint 3}}

## 3. Key Information

> The essential details: data, steps, comparisons, or code. Use tables for comparisons, numbered lists for steps, code blocks for examples.

{{Fill in the substantive content. This is the body of the leaf.}}

## 4. Action Recommendations

> What should the reader DO after reading this? Concrete, actionable, prioritized.

1. {{Action 1 — start with a verb}}
2. {{Action 2}}
3. {{Action 3}}

## 5. Anti-patterns

> Common mistakes, when NOT to apply this, and what to do instead.

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| {{Anti-pattern 1}} | {{Why it fails}} | {{Better approach}} |
| {{Anti-pattern 2}} | {{Why it fails}} | {{Better approach}} |

## 6. Related Links

- {{relative/path/to/related-file.md}} — {{one-line description}}
- {{another-related-file.md}} — {{one-line description}}

## 7. Changelog

| Date | Change | Author |
|---|---|---|
| {{YYYY-MM-DD}} | Initial creation | {{author}} |