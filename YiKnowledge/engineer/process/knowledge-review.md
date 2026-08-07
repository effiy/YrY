---
title: Knowledge base cadence review SOP
aliases:
- knowledge-review-process
- knowledge-base-review-sop
tags:
- process
- Knowledge base
- review
- SOP
- Operations
- weekly/monthly/quarterly/yearly
category: engineer/process
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: "internal + reference<Knowledge base directory design: 90% of companies get the first step wrong>"
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../knowledge-curator/governance/governance.md
- ./knowledge-deprecation-policy.md
- ./knowledge-contributor-charter.md
- ../../knowledge-curator/governance/review-log.md
tacit: false
---

# Knowledge base cadence review SOP

> **As an** engineer, **I want to** knowledge review, **so that** process followed predictably.

> Implementation Operations Process diagram (the fourth of the 4 diagrams) of 3 cadences: weekly / monthly / quarterly / yearly.

## Summary

- 4 Roles (see [knowledge-contributor-charter.md](./knowledge-contributor-charter.md)): Owner (strategy direction) / Operations (content review + frontmatter maintenance + reachability analysis) / knowledge owner (accuracy and timeliness of this leaf) / knowledge contributor (write documentation, provide feedback).
- Weekly 4 things (about 1h): W1 clear Inbox / W2 frontmatter integrity inspection / W3 link reachability / W4 push this week's high-value accumulation.
- Monthly 4 things (about 4h): M1 urge triage Summary / M2 external content timeliness / M3 content Governance day / M4 data Retrospective (coverage rate + activity rate + link reachability).
- Quarterly 4 things: Q1 Architecture adjustment (journeys use + hierarchy validation) / Q2 knowledge owner rotation review / Q3 knowledge map update (including tacit backlog) / Q4 select quarterly high-value accumulation.
- Yearly 3 things: Y1 Archive area cleanup / Y2 select yearly high-value accumulation / Y3 revise rule handbook (MEMORY.md).
- Each review must add a line to [lifecycle/review-log.md](../../knowledge-curator/governance/review-log.md), even if no operation (fill `review` type, note "no change").

## Core viewpoints

- Do not rely on "everyone's conscious initiative" — people are profit-seeking by nature, without explicit Roles, cadence and feedback, knowledge contribution is only sloganeering.
- Use "knowledge owner + regular review" to replace "everyone's conscious initiative" — quarterly rotation review ensures every high-read file has someone confirm active / needs update / deprecated.
- Use "search/link data-driven content supplement" to replace "supplement content by feel" — data-driven can supplement the real blind spots.
- Review must log — even if no operation, fill in one line, avoid "forgot to do" and "did but no record".

## Key information

### 4 Roles (see [knowledge-contributor-charter.md](./knowledge-contributor-charter.md))

- **Owner** (ruiyi): strategy direction, cross-category coordination
- **Operations** (ruiyi part-time): content review, frontmatter maintenance, reachability analysis
- **knowledge owner** (each leaf high-frequency contributor): accuracy and timeliness of this leaf
- **knowledge contributor** (everyone): write documentation, provide feedback

### Weekly (Operations, about 1h)

#### W1 — Clear Inbox

- Open [lifecycle/inbox.md](../../knowledge-curator/governance/inbox.md)
- Each entry must do one of the following:
  - Stream switch to target leaf (write frontmatter `lifecycle: triage`, add to [lifecycle/triage.md](../../knowledge-curator/governance/triage.md))
  - Explicitly mark `status: declined` to reject (reason: source quality low / duplicate / out of scope)
- Target: this table cleared

#### W2 — frontmatter integrity inspection

Scan files added/modified in the last 7 days, required fields:
- `title` `tags` `category` `created` `source` `type`
- `lifecycle` (default `active`)
- External content: `last_verified`

Commands:
```bash
rg -l "^lifecycle:" . --glob "!**/static/**" -g "*.md" -g "!INDEX.md" -g "!README.md"
rg "^tags:" . --glob "!**/static/**" -l
```

#### W3 — link reachability

```bash
rg "\]\(\.\.?/[^)]+\.md\)" . --glob "!**/static/**" -r '$1' -o | sort -u | while read p; do
  test -f "$p" || echo "BROKEN: $p"
done
```

Broken link fix: modify the source file to point to the correct path, or delete the link.

#### W4 — Push this week's high-value accumulation

Self-evaluate one file most worth sharing this week, mark it in personal notes or weekly report.

### Monthly (Operations, about 4h)

#### M1 — Urge Triage Summary

- Scan [lifecycle/triage.md](../../knowledge-curator/governance/triage.md)
- `pending` over 30 days: assess whether to reject
- `drafting` over 90 days: split or switch to `active` accepting imperfection

#### M2 — External content timeliness

Scan external content with `last_verified` over half a year:
```bash
rg "^last_verified:" . --glob "!**/static/**" -l | \
  while read f; do
    date=$(rg "^last_verified:" "$f" | head -1 | awk '{print $2}')
    # compare with today's date difference
  done
```

- Still accurate: update `last_verified`
- Out of date: update content or mark `status: deprecated` → add to [lifecycle/archive.md](../../knowledge-curator/archive/archive.md)

#### M3 — content Governance day

- Clean duplicate files (merge or deprecate)
- Fill frontmatter missing fields
- Update each leaf README's "Already included" list

#### M4 — data Retrospective

- Coverage rate: whether each leaf has content
- Activity rate: 30-day modified file ratio
- Link reachability: no broken link ratio

### Quarterly (owner rotation + Owner)

#### Q1 — Architecture adjustment

- Scan `journeys/` (scenario entry, e.g. `tech-lead/roadmap/`) use frequency
- Add / merge / deprecate scenario entries
- Hierarchy validation: new leaf whether ≤3 levels ([directory-blueprint](../../knowledge-curator/diagrams/directory-blueprint.md))

#### Q2 — knowledge owner rotation review

Each high-read file confirmed by owner:
- `active`: still accurate
- `needs update`: mark `lifecycle: triage` enter triage queue
- `deprecated`: mark `status: deprecated` enter Archive

#### Q3 — knowledge map update

Update [lifecycle/knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md):
- newly identified tacit knowledge
- "current status" column changes
- cross-department stream requirements

Update [lifecycle/tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md):
- new entries (every "must ask old employee to get answer" event)
- advance status

#### Q4 — Select quarterly high-value accumulation

Frontmatter add `featured: true`, and update to root [INDEX.md](../../INDEX.md) "quarterly picks" section (if added).

### Yearly (Owner)

#### Y1 — Archive area cleanup

Scan [lifecycle/archive.md](../../knowledge-curator/archive/archive.md) and [archive/](../../knowledge-curator/archive/archive.md):
- `superseded` and replacement file stable for 1 year: physically delete
- `outdated` still referenced: try to update
- `out-of-scope`: move outside or delete

#### Y2 — Select yearly high-value accumulation

#### Y3 — Revise rule handbook

Update [MEMORY.md](../../MEMORY.md) field definitions, naming standards, Process.

### Review log

Each review must add a line to [lifecycle/review-log.md](../../knowledge-curator/governance/review-log.md), even if no operation (fill `review` type, note "no change").

### Core ideas (from reference article)

> Do not rely on "everyone's conscious initiative". Use "knowledge owner + regular review" to replace "everyone's conscious initiative", use "search/link data-driven content supplement" to replace "supplement content by feel".

### Applicable scenarios

- Knowledge base Operations mechanism implementation
- 4 Role division and cadence definition
- Weekly / monthly / quarterly / yearly review standardization
- data-driven content supplement

## Action recommendations

1. Weekly (Operations 1h): W1 clear Inbox → W2 frontmatter inspection → W3 link reachability → W4 push high-value accumulation
2. Monthly (Operations 4h): M1 urge triage Summary → M2 external content timeliness → M3 content Governance day → M4 data Retrospective
3. Quarterly (owner + Owner): Q1 Architecture adjustment → Q2 owner rotation review → Q3 knowledge map update → Q4 select quarterly high-value
4. Yearly (Owner): Y1 Archive area cleanup → Y2 select yearly high-value → Y3 revise MEMORY.md
5. Each review must add a line to [lifecycle/review-log.md](../../knowledge-curator/governance/review-log.md) (even if no operation)
6. data-driven: use search log / broken link stats / feedback data to supplement content, do not go by feel

## Anti-patterns

- **Relying on "everyone's conscious initiative" to maintain the knowledge base** — without explicit roles, cadences, and feedback loops, knowledge contribution devolves into sloganeering. People are naturally profit-seeking, and content maintenance must be driven by assigned ownership and scheduled reviews, not goodwill.

- **Supplementing content by gut feel instead of data** — deciding what to write based on intuition misses the real blind spots. Search logs, broken-link statistics, and user feedback data reveal which topics are actually being sought but not found, and content creation should be driven by those signals.

- **Operations working in isolation without Owner participation** — the Operations role handles day-to-day review, but strategic decisions about architecture adjustments, category reorganization, and knowledge owner rotation require the Owner's direction. Operations fighting alone leads to tactical drift without strategic alignment.

- **Running reviews without logging them** — when a review is conducted but no line is added to `review-log.md`, there is no way to distinguish "review was done but not recorded" from "review was forgotten." Every review must produce a log entry, even if the only note is "no change."

- **Letting the triage queue accumulate indefinitely** — items in `pending` status for over 30 days or `drafting` for over 90 days represent stalled work that consumes attention without producing value. Long-pending items must be explicitly rejected or split, and long-drafting items must be published as-is (accepting imperfection) or switched to active.

## Related

- [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — Knowledge governance overview and role definitions
- [./knowledge-deprecation-policy.md](./knowledge-deprecation-policy.md) — Knowledge deprecation policy for content lifecycle management
- [./knowledge-contributor-charter.md](./knowledge-contributor-charter.md) — Knowledge contributor charter defining the 4 roles
- [../../knowledge-curator/governance/review-log.md](../../knowledge-curator/governance/review-log.md) — Review log where each review must record an entry
- [../../knowledge-curator/diagrams/directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) — Directory blueprint used in quarterly architecture adjustments
