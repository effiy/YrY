---
title: I want to write a bug report / Prepare a bug report
aliases: [i-want-to-prepare-a-bug-report, bug-report, issue-report]
tags: [journey, methodology, bug-report, qa, issue-tracking, communication]
category: executive/strategy
created: 2026-08-03
updated: 2026-08-03
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [executive]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "descriptive filename verb-phrase, hyphens only, no underscores or digits"
  - "body contains user story header + 7 fixed-order sections"
related:
  - ../../engineer/processes/do-a-code-review.md
  - ../../engineer/processes/troubleshoot-a-regression.md
  - ../../tech-lead/risk/write-a-postmortem.md
  - ../../oncall-sre/incident-response/respond-to-an-incident.md
  - ../../engineer/process/collaborate-across-teams.md
  - ../../engineer/process/handle-customer-feedback.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: A bug report is not just a description; it is reproduction + environment + expected/actual + logs + severity + impact; only reproducible reports have value.
---

# I want to write a bug report

> **As an** executive, **I want to** prepare a bug report, **so that** launch is safe.

## Summary

- Bug report six-piece set: reproduction steps + environment + expected/actual + logs + severity + impact
- Reproducible: N steps always reproduce; not "occasionally"
- Complete environment: OS / browser / version / account / data
- Expected vs actual: not mixed; clear contrast
- Logs attached raw: no screenshots; copyable text
- Severity grading: P0 blocking / P1 severe / P2 general / P3 minor
- Impact quantified: user count / frequency / revenue
- Minimal reproduction: cut until it can't be cut further
- No blame-shifting; no exaggeration; no hidden landmines

## Scenario description

A bug report is the contract between development and users/testers; written clearly, fixes are fast; written sloppily, back-and-forth drags on. This entry provides the full bug-report path, covering the six-piece set, reproducibility, complete environment, expected vs actual, raw logs, severity grading, quantified impact, minimal reproduction, no blame-shifting/exaggeration/hidden landmines, and links to leaves such as do-a-code-review / troubleshoot-a-regression / write-a-postmortem / respond-to-an-incident / collaborate-across-teams / handle-customer-feedback.

## 2-hop reachability path

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | Code review | [../../engineer/processes/do-a-code-review.md](../../engineer/processes/do-a-code-review.md) |
| 2 hops | Regression troubleshooting | [../../engineer/processes/troubleshoot-a-regression.md](../../engineer/processes/troubleshoot-a-regression.md) |
| 2 hops | Incident retrospective | [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) |
| 2 hops | Incident response | [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) |
| 2 hops | Cross-team collaboration | [../../engineer/process/collaborate-across-teams.md](../../engineer/process/collaborate-across-teams.md) |
| 2 hops | Customer feedback | [../../engineer/process/handle-customer-feedback.md](../../engineer/process/handle-customer-feedback.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Six-piece set**: reproduction steps + environment + expected/actual + logs + severity + impact; no missing piece
2. **Reproducible**: N steps always reproduce; not "occasionally"; if not reproducible, mark intermittent + frequency
3. **Complete environment**: OS / browser / version / account / data / network; no omissions
4. **Expected vs actual**: two separate paragraphs; not mixed; clear contrast
5. **Logs attached raw**: copyable text; no screenshots; include trace_id
6. **Severity grading**: P0 blocking / P1 severe / P2 general / P3 minor; no exaggeration
7. **Impact quantified**: user count / frequency / revenue / SLO burn; no ambiguity
8. **Minimal reproduction**: cut until it can't be cut further; remove unrelated steps
9. **Concise title**: verb + phenomenon + trigger condition; not "something broke"
10. **Screenshots / videos**: attach animated GIFs; required for complex operations
11. **Links**: link to PR / deployment / upstream issue; not isolated
12. **No blame-shifting**: target the system, not people
13. **No exaggeration**: don't pad P0 counts; use actual severity
14. **No hidden landmines**: be honest; don't hide known issues
15. **First principles**: why writing clearly is necessary; the worst consequence of not writing
16. **Inversion**: how much can screenshots + logs solve; if solvable, no meeting needed
17. **Second-order thinking**: second-order consequences after the bug report (fix cost / similar vulnerabilities / regressions)
18. **Occam**: the simpler the report, the better; cut redundant descriptions

## Related

- Code review: [../../engineer/processes/do-a-code-review.md](../../engineer/processes/do-a-code-review.md) — review finds bugs
- Regression troubleshooting: [../../engineer/processes/troubleshoot-a-regression.md](../../engineer/processes/troubleshoot-a-regression.md) — regression bugs
- Incident retrospective: [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) — P0 bugs must have retrospective
- Incident response: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — P0 escalation
- Cross-team: [../../engineer/process/collaborate-across-teams.md](../../engineer/process/collaborate-across-teams.md) — cross-team bugs
- Customer feedback: [../../engineer/process/handle-customer-feedback.md](../../engineer/process/handle-customer-feedback.md) — user-reported bugs
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
