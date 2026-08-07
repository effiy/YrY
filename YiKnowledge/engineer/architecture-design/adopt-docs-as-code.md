---
title: Adopt docs-as-code
aliases:
- I want to adopt docs as code
- docs-as-code-journey
- documentation-as-code-journey
- docs as code entry
tags:
- journeys
- docs-as-code
- documentation
- knowledge-management
- ssot
- ci-cd
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
- tech-lead
benefit: supply chain stays audited
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../knowledge-curator/templates/write-documentation.md
- ../../knowledge-curator/governance/evolve-the-knowledge-base.md
- ../../new-hire/onboarding/contribute-to-the-knowledge-base.md
- ../../engineer/architecture-design/ssot-view-layer.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to adopt docs-as-code

> **As an** engineer, **I want to** adopt docs as code, **so that** supply chain stays audited.

> "SSOT + repo + template + lint + CI + publish + monitoring + quarterly audit" reachable within 2 hops of process + thinking + case study.

## Summary

- Process follows [code-review.md](../quality-security/do-a-code-review.md) + [requirement-review.md](../../product-manager/delivery/requirement-review.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md)
- Platform follows [ssot-view-layer-pattern.md](ssot-view-layer.md) + [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md)
- Case study follows [yivad-leaf-view-leaves-ssot-win.md](../lessons/win-yivad-leaf-view-leaves-ssot.md) + [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md)

## Core viewpoints

**Docs-as-code is not about writing docs in Markdown -- it is about making documentation subject to the same quality gates as code.** If your code requires PR review, CI, and linting but your docs do not, your docs will drift. The "as-code" part means version control, automated checks, and owner accountability. Markdown is just the format that makes this toolchain work.

**The single source of truth is a process, not a file.** Declaring one file as SSOT does nothing if the build process still reads from three places. SSOT means the downstream consumers (routes, views, navigation) are derived from the source, and CI blocks any divergence. The process is the SSOT; the file is just the input.

**Dead links are a trust-destroying externality.** A user who clicks three broken links stops clicking. Link checking is not a nice-to-have CI step -- it is the primary mechanism that preserves the knowledge base's credibility. Every broken link is a user who will not come back.

**Documentation ownership without enforcement is aspirational.** A CODEOWNERS file that no one reads is not ownership. Ownership means the owner is automatically added as a reviewer on documentation PRs, and the owner's approval is required to merge. Without this enforcement, ownership is a suggestion that gets ignored under schedule pressure.

**Quarterly audit is the only defense against entropy.** Documentation rots at a predictable rate: every sprint that changes code without updating docs creates drift. The quarterly audit is not a review -- it is a reconciliation that closes the gap between what the code does and what the docs say. Skip two quarters, and the docs are historical fiction.

## Key info

- **Docs-as-code toolchain**: Markdown (source format) + Git (version control) + Vale/Markdownlint (linting) + CI (link checking via lychee/mlc) + static site generator (MkDocs/Docusaurus/Hugo for publishing) + CODEOWNERS (ownership enforcement). The minimum viable toolchain is Git + link checker + CODEOWNERS; everything else is optimization. The most common failure mode is adopting the full toolchain and never configuring the link checker -- dead links are the first thing users notice, and broken links erode trust faster than any other doc quality issue.
- **Link rot statistics**: studies of open-source documentation show 5-10% of links break annually without active maintenance. Internal knowledge bases decay faster (15-20% annually) because internal URLs change more frequently than public ones. A link checker in CI (running on every PR and nightly) catches ~70% of breakage before it reaches readers; the remaining 30% are external links that break after publication, caught by the nightly scan.
- **CODEOWNERS mechanics**: GitHub CODEOWNERS file syntax supports `* @team` (all files), `*.md @tech-writer` (file pattern), and `docs/ @docs-team` (directory). The key configuration: "Require review from Code Owners" in branch protection. Without this setting, CODEOWNERS assigns reviewers but does not block merge -- making it informational rather than enforceable. The most effective pattern is to assign both the owning team AND a documentation specialist as co-owners.
- **Template-driven documentation**: the template (not the writer) enforces consistency. A template with YAML frontmatter (title, tags, created, updated, status, lifecycle, owner) and predefined section headers ensures every document has the same structural skeleton. CI validates that documents have required frontmatter fields and all required sections. Templates that are optional produce documents that are inconsistent.
- **Quarterly audit cadence**: the audit should check: (1) docs without an update in 90 days against git log for the relevant code paths -- if code changed but docs didn't, flag for update; (2) all links (internal and external) via a full-site crawl; (3) frontmatter validation (no missing required fields); (4) section completeness (all required sections present). The audit output is a single Markdown file with a checklist of findings, each assigned to an owner with a due date.

## Scenario

When adopting docs-as-code / documentation in repo / templating / lint / CI publish / knowledge base SSOT / markdown first / documentation versioned / documentation PRs / documentation owners / quarterly documentation audit / documentation drift fix, TL + architect + PM + sponsor need to look up process + thinking + case study. This entry aggregates docs-as-code-related process + thinking + case study into a 2-hop path, avoiding "missing SSOT / scattered repo / messy template / missing lint / CI lag / messy publish / missing monitoring / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](ssot-view-layer.md) · [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) · [eval-driven](../engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — documentation essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion of drift · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| `resources/templates/` | [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [brd-generation-prompt.md](../../ai-engineer/methodology/prompts/brd-generation.md) · [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) |
| `work/processes/` | [code-review.md](../quality-security/do-a-code-review.md) · [requirement-review.md](../../product-manager/delivery/requirement-review.md) · [design-review.md](../../product-manager/delivery/design-review.md) · [tech-review.md](../../product-manager/delivery/tech-review.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../process/cross-timezone-collaboration.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — documentation audience |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — documentation owners |
| `lessons/wins/` | [yivad-leaf-view-leaves-ssot-win.md](../lessons/win-yivad-leaf-view-leaves-ssot.md) · [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [bugs/](../lessons) — documentation drift archive |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) · [knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md) · [directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) |
| `projects/` | each project's `architecture-summary.md` + `onboarding.md` + `dev-standards-summary.md` |
| `journeys/` | [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) · [../../knowledge-curator/governance/evolve-the-knowledge-base.md](../../knowledge-curator/governance/evolve-the-knowledge-base.md) · [../../new-hire/onboarding/contribute-to-the-knowledge-base.md](../../new-hire/onboarding/contribute-to-the-knowledge-base.md) · [../processes/do-a-knowledge-audit.md](../process/do-a-knowledge-audit.md) |

## Action recommendations

1. **first principles**: first ask "what documentation solves / what happens if not done / ROI / user impact"; do not document for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first imagine "how documentation can drift (scattered / outdated / wrong / missing / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: documentation changes → code changes → another sync; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest documentation that satisfies the business wins; do not pile up templates; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **SSOT**: must run SSOT + frontend/backend shared + code as documentation; follow [ssot-view-layer-pattern.md](ssot-view-layer.md).
6. **repo**: must run repo-based + markdown first + git history + owners.
7. **template**: must run [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) + frontmatter + aliases / tags / related.
8. **lint**: must run markdown lint + frontmatter lint + link check + spell check.
9. **CI**: must run CI gate + PR review + owner approval + automated publish.
10. **publish**: must run static site (mkdocs / docusaurus / vitepress) + search + navigation + dark mode.
11. **contract**: documentation example code must run [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) + executable + CI gate.
12. **AI recall**: must run high-density MOC + chunk + embedding; follow [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md).
13. **RACI**: must run [raci-matrix-summary.md](../process/raci-matrix.md); owners / contributors / sponsor.
14. **freeze period**: during promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md), do not change documentation schema.
15. **reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report audience + change log.
16. **monitoring**: must run [monitoring-governance-process.md](../process/monitoring-governance.md) for views / links / search / feedback.
17. **retrospective**: after documentation incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../lessons).
18. **quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether documentation is still accurate + whether links are still live.
19. **ADR**: documentation decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
20. **flywheel**: documentation good → recall good → trust up → more contributions; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Anti-patterns

- **Documenting everything.** Not every decision needs a document. A 10-line script that runs once does not need a 5-page design doc. Documentation that no one reads is dead weight that slows down search and erodes trust in the knowledge base. The test is: "will someone need this information in six months?"

- **Docs without owners.** Every document must have an owner who is accountable for keeping it accurate. Documents without owners become orphaned and rot. The owner must be a named person or a specific team rotation, not an alias that forwards to no one.

- **Copy-paste documentation.** Duplicating content across multiple documents creates a maintenance nightmare: a change in one place must be manually propagated to all copies. The DRY principle applies to documentation as much as to code. Use cross-references and SSOT links instead of duplication.

- **Publishing without link checking.** A static site that contains broken links is worse than no site at all. Users who click dead links lose trust and stop using the documentation. Link checking must run in CI on every PR and on a scheduled cadence.

- **Treating documentation as a one-time deliverable.** Documentation that is accurate on launch day will be inaccurate within three months if no one maintains it. The quarterly audit is not optional -- it is the minimum maintenance cycle. Without it, the knowledge base becomes a graveyard of outdated information that misleads more than it helps.

## Related

- Same-class journey: [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) — documentation
- Same-class journey: [../../knowledge-curator/governance/evolve-the-knowledge-base.md](../../knowledge-curator/governance/evolve-the-knowledge-base.md) — knowledge base evolution
- Same-class journey: [../../new-hire/onboarding/contribute-to-the-knowledge-base.md](../../new-hire/onboarding/contribute-to-the-knowledge-base.md) — contribution
- Same-class journey: [../processes/do-a-knowledge-audit.md](../process/do-a-knowledge-audit.md) — knowledge audit
- Upstream: [../../knowledge-curator/README.md](../../knowledge-curator/README.md) — lifecycle leaf entry
