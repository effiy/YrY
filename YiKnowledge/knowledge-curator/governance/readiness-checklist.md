---
title: 10-question launch checklist / Readiness Checklist
aliases:
- readiness-checklist
- launch-checklist
tags:
- lifecycle
- checklist
- 4-diagrams
category: knowledge-curator/governance
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: "Adapted from the launch checklist 10 questions in \"knowledge base directory design: 90% of companies get the first step wrong\""
type: template
status: stable
lifecycle: reference
review_cycle: quarterly
roles:
- knowledge-curator
benefit: kb stays curated
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ../diagrams/knowledge-map.md
- ../diagrams/user-journey.md
- ../diagrams/directory-blueprint.md
- ./governance.md
- ./tacit-knowledge-backlog.md
- ../README.md
- ../../executive/industry/README.md
tacit: false
---

# 10-question launch checklist / Readiness Checklist

> **As a** knowledge curator, **I want to** readiness checklist, **so that** kb stays curated.

> Run through this before starting to extend the knowledge base. If any item is unchecked, go back and draw the diagrams; only start building once all 10 are checked.

## Summary

- Covers 4 diagrams + first batch content sources + AI-era additional items
- If any item is unchecked, go back and complete the corresponding diagram
- Must pass before adding a new class of content (new leaf, new scenario entry)
- Tacit knowledge is the real source of the first batch of extension content, not a gut call

## Core viewpoints

- **The launch checklist is the acceptance gate for the 4 diagrams** — the 4 diagrams are not done when drawn, they are done when the checklist is fully checked
- **AI-era additional items** — frontmatter fields are hard metrics for AI recall; missing fields = knowledge map fails

## Key information

### knowledge map (diagram 1 of 4)

- [ ] Is the knowledge map drawn, and are **both explicit and tacit knowledge inventoried**? → [knowledge-map.md](../diagrams/knowledge-map.md)
- [ ] Are the **holders and consumers** of knowledge both annotated?
- [ ] Are cross-department / cross-leaf stream needs identified?

### user journey map (diagram 2 of 4)

- [ ] Does the user journey map cover at least 3 roles? → [user-journey.md](../diagrams/user-journey.md)
- [ ] Are the **breakpoints** in the journey map (cannot find, found but not trusted, asked but no reply, used but not documented) all marked?

### directory structure diagram (diagram 3 of 4)

- [ ] Does the directory use **scenario logic (`journeys/`)** rather than department logic? → [directory-blueprint.md](../diagrams/directory-blueprint.md)
- [ ] Is the directory **no deeper than 3 levels**? (`projects/{proj}/stories/` exception already explained)
- [ ] Are `journeys/` entry names **verb phrases** ("I want to look up X")?
- [ ] Is there a **fallback directory** (`inbox.md`)?

### operations process diagram (diagram 4 of 4)

- [ ] Are **all 4 roles of the operations mechanism staffed**? (even if part-time) → [governance.md](./governance.md)
- [ ] Is the **weekly / monthly / quarterly operations cadence** defined? → [../../engineer/process/knowledge-review.md](../../engineer/process/knowledge-review.md)

### Additional: first batch content source

- [ ] Does the first batch of extension content come from the **real needs in the user journey map** ([tacit-knowledge-backlog.md](./tacit-knowledge-backlog.md)) rather than a gut call?

### AI-era additional questions

- [ ] Does the frontmatter of new files include `lifecycle` / `tags` / `category` / `related` / `tacit` (true when tacit)?
- [ ] Are you aware that **the knowledge map is the only asset that will not become outdated in the AI era**?

## Action recommendations

1. Run through these 10 questions before adding any new class of content (new leaf, new scenario entry)
2. If any item is unchecked, go back and complete the corresponding diagram
3. Only start building after all items are checked, to avoid rework
4. Also run through it during quarterly reviews to prevent later drift



- **Skipping the checklist and diving in** — consequence: the 4 diagrams become hollow, the knowledge base turns into directory piling
- **Running the checklist only once** — consequence: drift from the original diagrams goes unnoticed during extension
- **Ignoring the AI additional items** — consequence: frontmatter governance lags, AI recall quality drops

## Related

- Same class (4 diagrams): [knowledge-map.md](../diagrams/knowledge-map.md) / [user-journey.md](../diagrams/user-journey.md) / [directory-blueprint.md](../diagrams/directory-blueprint.md) / [governance.md](./governance.md)
- Upstream: [README.md](../README.md) (Lifecycle view overview)
- Downstream: [../../executive/industry/README.md](../../executive/industry/README.md) (scenario entry), [tacit-knowledge-backlog.md](./tacit-knowledge-backlog.md) (tacit backlog)
