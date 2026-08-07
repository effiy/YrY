---

title: Oncall Handover 2026-W33
lifecycle: active
status: stable
key: tl_oncall-handover_2026_w33
tags:
- oncall
- handover
- 2026-w33
shift_period: 2026-W33
from_engineer: YiPet primary owner
to_engineer: YiAi backend owner
ongoing_incidents: 2
pending_alerts: 2
type: summary
category: oncall-sre/incident-response
roles:
- oncall-sre
benefit: incident handled
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
review_cycle: quarterly
created: 2026-08-17
updated: 2026-08-07
last_verified: 2026-08-07
tacit: false
related:
  - ./dashboard-incident-trends.md
  - ./dashboard-oncall-health.md
  - ./do-a-blast-radius-analysis.md
  - ../README.md
  - ../INDEX.md
---

# Oncall Handover — 2026-W33

> **As a** oncall sre, **I want to** tl_oncall handover_2026_w33, **so that** incident handled.

## Summary

- Handover from YiPet primary owner to YiAi backend owner for W33 (2026-08-17 ~ 2026-08-23), with 2 ongoing incidents (GPU peak 95% after aicr rollout, MongoDB working set 75% persistent rise), 2 pending alerts, and 4 recent changes including security hardening (lockfile commits, gitleaks scans)
- Security hardening changes are high-risk changes that modify the build pipeline and can cause unexpected CI failures — the incoming oncall should be explicitly aware of them as the most likely source of "build suddenly broken" alerts
- The expected false-positive rate and failure mode of every new automated check must be communicated during handover (e.g., gitleaks blocks commits with ~2% false-positive rate) so the incoming oncall can distinguish between expected friction and actual incidents
- Each ongoing incident needs a concrete trigger condition: "if GPU utilization exceeds 95%, initiate multi-provider traffic cut," "if MongoDB working set exceeds 80%, escalate to backend owner"
- Escalation contacts must be verified against the current team roster at the start of every shift — outdated contacts turn a 30-minute incident into a 3-hour one

## Shift Info

- **Period: ** 2026-W33 (2026-08-17 ~ 2026-08-23)
- **From: ** YiPet primary owner
- **To: ** YiAi backend owner
- **Handover date: ** 2026-08-17

## Ongoing Incidents

| # | Incident | Severity | Status | Next Step |
|---|----------|----------|--------|-----------|
| 1 | YiAi GPU peak 95% (after aicr rollout) | P2 | Mitigating | multi-provider Phase 1 traffic cut |
| 2 | MongoDB working set 75% (persistent rise) | P3 | Monitoring | RSS body split effect pending validation |

## Pending Alerts / Known Issues

- YiPet aicr Phase 1 smoke testing (content script injection failure rate ~0.8%, under control).
- YiAi AUTH_ENABLED in dev environment persistent alert (pending CI check rollout).

## Recent Changes (last 7 days)

- 2026-08-10: YiPet aicr Phase 1 completed (MV3 skeleton + dual world boundary type branding).
- 2026-08-12: YiAi RAG hybrid retrieval full-volume launch (dense + sparse + metadata filter).
- 2026-08-15: Three-end lockfile committed to git (see postmortem no-lockfile-supply-chain).
- 2026-08-17: pre-commit gitleaks secret scan rolled out (see brd-approvals AP-003).

## Monitoring Dashboard

- YiAi `/health` + structlog trace id (pending L4 dashboard rollout).
- apscheduler stale log: every 5 min scan.
- YiAi GPU / MongoDB / OSS dashboard (pending L4 rollout).

## Escalation Contacts

- **Secondary oncall: ** YiVad primary owner
- **Service owners: ** YiAi inference — YiAi backend owner; YiVad SPA — YiVad primary owner; YiPet extension — YiPet primary owner
- **Manager: ** CTO

## Core viewpoints

- **Handover is a reliability mechanism, not an administrative ritual.** The oncall handover exists to transfer operational context — which incidents are active, which alerts are pending, which recent changes may have introduced instability. A handover that only transfers the pager is a gap in the incident response chain.

- **Incomplete handover creates a single point of failure in human memory.** When operational knowledge lives only in the outgoing oncall's head, the incoming oncall is blind to subtle issues: a GPU utilization trend that looks normal but is trending up, a MongoDB working set approaching its limit. The handover document externalizes that tacit knowledge.

- **Pending alerts are the incoming oncall's first priority, not "someone else's problem."** Every pending alert in the handover represents a known issue that has not yet been resolved. The incoming oncall inherits these alerts along with the pager. Each alert needs a clear next step, not just a description.

- **Recent changes are the most likely source of new incidents and serve as a differential diagnosis tool.** When a new incident occurs in the first 24 hours of a shift, the first question should be "what changed in the last 7 days?" The handover makes that question answerable without searching through commit logs.

- **Security hardening changes (lockfile commits, gitleaks scans) are high-risk changes that deserve extra scrutiny during handover.** These changes modify the build pipeline and can cause unexpected CI failures. The incoming oncall should be explicitly aware of any security tooling changes, as they are the most likely source of "build suddenly broken" alerts.

## Action recommendations

1. **Update the handover document continuously throughout the shift as a running log, not a retrospective written at the end.** Each incident, alert, and deployment should be added to the handover document as it occurs. The incoming oncall needs the full operational context, including subtle trends that are only visible when recorded in real time.

2. **Give every ongoing incident a concrete next step with a specific trigger condition.** "Monitoring" is not a next step. Each incident should have a specific action: "if GPU utilization exceeds 95%, initiate multi-provider traffic cut," "if MongoDB working set exceeds 80%, escalate to the backend owner," "if content script injection failure rate exceeds 2%, apply the retry mitigation."

3. **Flag security tooling changes (lockfile commits, gitleaks scans) explicitly during handover as high-risk changes.** These changes modify the build pipeline and can cause unexpected CI failures. The incoming oncall should be explicitly aware of any security tooling changes, as they are the most likely source of "build suddenly broken" alerts during the first 24 hours of the new shift.

4. **Explain the expected false-positive rate and failure mode for every new automated check introduced during the shift.** "Pre-commit gitleaks secret scan rolled out" is useful. Explaining that it blocks commits containing secrets and that the expected false-positive rate is ~2% is what the incoming oncall needs when a developer reports being blocked on a commit at 10 PM.

5. **Verify escalation contacts against the current team roster at the start of every shift and treat discrepancies as P1 documentation bugs.** Outdated contacts turn a 30-minute incident into a 3-hour one. The escalation list must be verified before the handover is accepted by the incoming oncall, not after the first incident occurs.

## Anti-patterns

- **Treating the handover as a template to fill out rather than a context transfer.** A handover with placeholder text or copied-from-last-week content creates the illusion of context transfer. The incoming oncall should be able to ask "what does this mean?" about every line and get a substantive answer.

- **Handing over unresolved incidents without a clear next step.** "Monitoring" is not a next step — it is the absence of one. Every ongoing incident should have a concrete action: "run this diagnostic," "escalate to this person if X happens," "apply this mitigation if the error rate exceeds Y."

- **Omitting the "why" behind recent changes.** Listing "pre-commit gitleaks secret scan rolled out" is useful. Explaining that it blocks commits containing secrets and that the expected false-positive rate is ~2% is what the incoming oncall needs when a developer reports being blocked on a commit at 10 PM.

- **Writing the handover document at the last minute.** The document should be updated continuously throughout the shift. Writing it at the last minute guarantees subtle issues are forgotten. The document is a running log, not a retrospective.

## Related

- [Oncall handover W32](./tl-oncall-handover-2026-w32.md) — the previous week's handover, carries the same ongoing incidents forward
- [No-lockfile supply chain postmortem](./tl-postmortem-no-lockfile-supply-chain-2026-07.md) — three-end lockfile commit tracked as a recent change in this handover
- [FSEvents silent drop postmortem](./tl-postmortem-fsevents-silent-drop-2026-08.md) — macOS watcher incident, ongoing alert about apscheduler polling
- [Monitoring alert governance](../../engineer/process/monitoring-governance.md) — alert quality standards for the GPU utilization and MongoDB working set alerts being monitored
- [Bug-logging protocol](../../engineer/quality-security/bug-logging-protocol.md) — RPC shape for logging bugs discovered during oncall shifts
