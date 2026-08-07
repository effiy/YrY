---
title: Do a knowledge audit
aliases:
- I want to do a knowledge base audit
- knowledge-audit-journey
- kb-audit-journey
- knowledge audit entry
tags:
- journeys
- knowledge
- audit
- governance
- archive
- deprecate
- refresh
category: engineer/process
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: outcome is traceable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../knowledge-curator/governance/evolve-the-knowledge-base.md
- ../../new-hire/onboarding/contribute-to-the-knowledge-base.md
- ../strategies/prepare-a-quarterly-review.md
- ../../knowledge-curator/governance/governance.md
review_cycle: quarterly
tacit: false
---

# I want to do a knowledge audit

> **As an** engineer, **I want to** do a knowledge audit, **so that** outcome is traceable.

> "Scan stale + merge + deprecate + dead links + tacit externalization + quarterly audit + retrospective" — reach lifecycle + thinking + process + cases within 2 hops.

## Summary

- Governance goes through [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) + [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) + [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md)
- Process goes through [knowledge-review-process.md](knowledge-review.md) + [knowledge-deprecation-policy.md](knowledge-deprecation-policy.md) + [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md)
- Thinking goes through [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Patterns go through [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) + [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md)

## Core viewpoints

- **A knowledge audit is not a cleanup activity -- it is a trust-preservation mechanism.** Every time someone follows a stale link or reads outdated advice, their trust in the knowledge base erodes slightly. After enough erosion, they stop consulting it entirely. The audit restores trust by ensuring that what the knowledge base claims to be true actually is true.

- **The most dangerous files in a knowledge base are not the missing ones but the stale ones.** A missing file is honest about its absence. A stale file confidently gives wrong advice, and the reader has no way to know it is wrong unless they already know the answer. Stale files are misinformation with institutional credibility.

- **Orphan detection (no inbound links) is the single highest-signal audit signal.** A file with no inbound links is either undiscoverable (a structural problem) or irrelevant (a content problem). Either way, it is consuming maintenance overhead without delivering value. Orphan files should be the first target of any audit, because they represent the clearest case of cost without benefit.

- **The audit flywheel (audit, improve, trust, more contributions) only works if audit results are visible.** If the audit team finds and fixes 50 stale files but no one sees the improvement, contributors do not perceive the value and reduce their investment. Audit results must be communicated to stakeholders through the same reporting cadence as any other project deliverable.

- **AI-assisted auditing is a force multiplier, not a replacement for human judgment.** AI can scan for stale timestamps, dead links, and duplicate content faster than any human, but it cannot judge whether a "stable" file from 2024 is still valid in 2026. The human auditor's role shifts from scanner to judge -- the AI narrows the field, and the human makes the final call.

## Key info

- **Knowledge audit dimensions (6 checks with automation potential)**: (1) Staleness — `last_verified` date > 6 months (quarterly files) or > 12 months (annual files); AI can flag, human judges validity; (2) Dead links — broken internal references (404); AI can scan all `[text](path.md)` patterns and verify file existence; 100% automatable; (3) Orphan files — files with zero inbound links (no other file references them); AI can grep for all filenames and count references; 100% automatable; (4) Duplicate content — near-identical content in multiple files; AI can compute similarity scores and flag pairs > 80% similar; human decides which to keep; (5) Frontmatter completeness — missing required fields (`roles`, `benefit`, `acceptance_criteria`, `related`, `review_cycle`, `last_verified`); AI can validate YAML and flag violations; 100% automatable; (6) Content quality — files that are "RSS raw HTML" (not summarized), "placeholder" (TODO/stub), or "outdated" (content contradicts current practice); AI can flag patterns, human judges. The YiKnowledge audit (2026-08) found: 182 broken YAML frontmatter, 84 RSS raw HTML files, 3 duplicate role directories, 2 empty directories, 20 README "待收录" gaps.
- **Audit cadence and scope by file type**: Quarterly — journey files (`type: summary`, `tags: journeys`), process files, methodology files; review checks: staleness, dead links, content accuracy; Biannual — summary files (`type: summary`), template files; review checks: staleness, dead links, frontmatter completeness; Annual — instance files (weekly reports, postmortems), archived files; review checks: historical value, archival appropriateness. The `review_cycle` field in each file's frontmatter determines the audit cadence. The YiKnowledge audit follows this cadence; the next quarterly audit is 2026-11-07.
- **Orphan file analysis and resolution**: An orphan file has zero inbound links — no other file in the knowledge base references it. Detection: `grep -r "filename.md" YiKnowledge/ | wc -l` returns 0. Resolution options: (1) Add links — if the file is valuable but undiscoverable, add `related:` entries from other files; (2) Merge — if the file duplicates content from another file, merge and delete the orphan; (3) Archive — if the file is no longer relevant but has historical value, move to `archive/`; (4) Delete — if the file is obsolete and has no historical value. The YiKnowledge audit (2026-08) found 3 orphan role directories (data-engineer, devops, technical-writer) with 24 files that were byte-for-byte duplicates of files in `engineer/`; all were deleted.
- **Staleness scoring and alert thresholds**: Each file has a staleness score based on: `days_since_last_verified / review_cycle_days`. Score > 1.0 = overdue (should have been reviewed but wasn't); Score > 2.0 = critically stale (missed 2 review cycles). Alert thresholds: Score > 1.0 = warning (file is overdue for review); Score > 2.0 = critical (file is likely stale, content may be wrong). The YiKnowledge standard: no file should have a staleness score > 1.5 without an explicit exception (documented in the file's frontmatter as `staleness_exception: "reason"`).
- **Audit reporting and stakeholder communication**: The audit produces a report with: (1) Executive summary — total files audited, files flagged, files fixed, files deleted; (2) By category — staleness, dead links, orphans, duplicates, frontmatter, content quality; (3) Trend — comparison with previous audit (improving or degrading); (4) Recommendations — top 5 actions for the next audit cycle. The report is distributed to stakeholders within 1 week of the audit. The YiKnowledge audit report is documented in the knowledge base; the Phase 1-5 optimization plan is the current audit output.
- **Yi-family knowledge audit state (2026-08)**: YiKnowledge — 3142 files, audit completed 2026-08-07, findings: 182 broken YAML, 84 RSS HTML, 3 duplicate dirs, 2 empty dirs, 20 README gaps. The audit is ongoing (Phase 1-5 optimization plan). YiAi/YiVad/YiPet — no formal knowledge audits (codebases are audited through code review and dependency audit). The knowledge audit process is documented and tested on YiKnowledge; the next audit cycle is 2026-11-07.

## Scenario

When doing a knowledge base audit / scanning stale files / merging duplicates / deprecating expired content / dead-link checks / externalizing tacit knowledge / quarterly governance review / knowledge map update, the primary owner + TL + governance lead + platform need to look up lifecycle + process + thinking + patterns. This entry aggregates audit-related lifecycle + process + thinking into 2-hop paths to avoid "stale knowledge / duplicates / dead links / deprecated-but-not-deleted / tacit knowledge lost / audit as formality / no quarterly review".

## 2-hop reachability paths

| Hop 1 (by class/leaf) | Hop 2 (specific file) |
|---|---|
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) · [knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md) · [directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) · [user-journey.md](../../knowledge-curator/diagrams/user-journey.md) · [triage.md](../../knowledge-curator/governance/triage.md) · [inbox.md](../../knowledge-curator/governance/inbox.md) · [archive.md](../../knowledge-curator/archive/archive.md) |
| `work/processes/` | [knowledge-review-process.md](knowledge-review.md) · [knowledge-deprecation-policy.md](knowledge-deprecation-policy.md) · [knowledge-contributor-charter.md](knowledge-contributor-charter.md) · [knowledge-transfer-process.md](knowledge-transfer.md) · [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md) · [iteration-pm-handbook-summary.md](iteration-pm-handbook.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — audit purpose · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-think stale consequences · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) — governance flywheel · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) — simplest governance · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) — single source · [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md) — merge no duplicates · [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) — auditable audit |
| `resources/templates/` | [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) — AI-assisted stale scan |
| `lessons/wins/` | [yivad-leaf-view-leaves-ssot-win.md](../lessons/win-yivad-leaf-view-leaves-ssot.md) — SSOT landing · [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) · [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [bugs/](../lessons) |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) · [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — owner marks |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — audit reporting |
| `work/collaboration/` | [raci-matrix-summary.md](raci-matrix.md) · [async-collaboration-principles-summary.md](async-collaboration-principles.md) |
| `journeys/` | [../../knowledge-curator/governance/evolve-the-knowledge-base.md](../../knowledge-curator/governance/evolve-the-knowledge-base.md) · [../../new-hire/onboarding/contribute-to-the-knowledge-base.md](../../new-hire/onboarding/contribute-to-the-knowledge-base.md) · [../strategies/prepare-a-quarterly-review.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-quarterly-review.md) · [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) |
| `INDEX.md` | [../INDEX.md](../INDEX.md) — full library index |

## Action recommendations

1. **First principles**: first ask "what does the audit solve (stale / duplicate / dead links / tacit loss / governance debt) / what happens without an audit"; do not audit for the sake of auditing; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first think "what happens without an audit (stale misleads / duplicates conflict / dead links break trust / tacit loss / quarterly debt explosion)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Occam**: the simplest audit that satisfies governance wins; do not pile up process; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
4. **Flywheel**: audit → improve → trust → more contributions; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).
5. **Scan dimensions**: stale (updated > 6 months) / duplicate (multiple files for same theme) / dead link (points to non-existent) / orphan (no inbound links) / redundant (multiple sources) / deprecated (lifecycle ≠ active).
6. **Owner mark**: each entry must have owner + due; go through [raci-matrix-summary.md](raci-matrix.md); no owner means deprecation candidate.
7. **Merge**: must run [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) + [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md); merge same-theme into a single source + redirect others.
8. **Deprecate**: must run [knowledge-deprecation-policy.md](knowledge-deprecation-policy.md); mark deprecated and archive after 90 days.
9. **Dead links**: must scan internal + external links; for external dead links consider archiving or replacement.
10. **Tacit externalization**: scan [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) for items pending externalization; advance 5-10 per quarter.
11. **Audit cadence**: quarterly scan for stale + half-year scan for dead links + annual scan for governance debt; go through [review-log.md](../../knowledge-curator/governance/review-log.md).
12. **Directory structure**: must scan [directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) whether still accurate + [knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md) whether still reflects reality.
13. **2-hop reach**: must scan each leaf whether still reachable within 2 hops; go through [user-journey.md](../../knowledge-curator/diagrams/user-journey.md).
14. **AI assist**: use [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) pattern to let AI scan stale / duplicate / dead links.
15. **Reporting**: audit results must go through [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report to stakeholders.
16. **Retrospective**: after audit go through [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) retrospective + archive in [review-log.md](../../knowledge-curator/governance/review-log.md).
17. **Readiness**: scan [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) whether still satisfied.
18. **Contributor charter**: must run [knowledge-contributor-charter.md](knowledge-contributor-charter.md); for owner loss must run [knowledge-transfer-process.md](knowledge-transfer.md).

## Anti-patterns

- **Auditing for the sake of auditing without a clear problem statement.** An audit that starts with "let's clean up the knowledge base" without defining what "clean" means (stale threshold? duplicate criteria? dead-link policy?) produces a lot of activity and no measurable improvement. The audit must begin with a specific, quantified goal: "reduce stale files from 30% to under 5%" or "eliminate all dead links from the top 50 most-read files."

- **Deleting or archiving content without a redirect or deprecation notice.** When a file is removed and its inbound links break, every reader who follows those links loses trust in the system. The deprecation policy must include a grace period (e.g., 90 days) with a visible deprecation notice, and all inbound links must be updated or redirected before the file is archived.

- **Running a quarterly audit that only checks timestamps.** A file with `updated: 2026-08-01` could be factually wrong if the author updated the date without reviewing the content. Timestamp-based staleness detection is a first pass; the audit must also sample content for factual accuracy, especially for files that reference external APIs, tool versions, or regulatory requirements.

- **Treating the audit as a solo effort by the operations person.** A single person auditing the entire knowledge base will miss domain-specific staleness that only a subject-matter expert would catch. The audit must distribute review responsibility to knowledge stewards who own specific leaves, with operations providing the tooling and coordination layer.

- **Archiving lessons and gotchas without checking whether they still apply.** A gotcha about a macOS FSEvents bug from 2024 may be fixed in the 2026 OS version. Archiving it without verifying reproducibility removes potentially useful knowledge. The archive decision must include a verification step: "does this still happen on the current environment?" If yes, it stays active; if no, it can be archived with a note about the version where it was fixed.

## Related

- Same-class journey: [../../knowledge-curator/governance/evolve-the-knowledge-base.md](../../knowledge-curator/governance/evolve-the-knowledge-base.md) — knowledge base evolution
- Same-class journey: [../../new-hire/onboarding/contribute-to-the-knowledge-base.md](../../new-hire/onboarding/contribute-to-the-knowledge-base.md) — contribution
- Same-class journey: [../strategies/prepare-a-quarterly-review.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-quarterly-review.md) — quarterly review
- Same-class journey: [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) — documentation
- Upstream: [../../knowledge-curator/README.md](../../knowledge-curator/README.md) — lifecycle leaf entry
