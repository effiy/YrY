---

title: Oncall Handover 2026-W32
lifecycle: active
status: stable
key: tl_oncall-handover_2026_w32
tags:
- oncall
- handover
- 2026-w32
shift_period: 2026-W32
from_engineer: YiVad primary owner
to_engineer: YiPet primary owner
ongoing_incidents: 1
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
created: 2026-08-10
updated: 2026-08-07
source: internal
last_verified: 2026-08-07
tacit: false
related:
  - ./dashboard-incident-trends.md
  - ./dashboard-oncall-health.md
  - ./do-a-blast-radius-analysis.md
  - ../README.md
  - ../INDEX.md
---

# Oncall Handover — 2026-W32

> **As a** oncall sre, **I want to** tl_oncall handover_2026_w32, **so that** incident handled. 

## Summary

- Handover from YiVad primary owner to YiPet primary owner for W32 (2026-08-10 ~ 2026-08-16), with 1 ongoing incident (YiPet aicr content script injection failure at ~1%), 2 pending alerts (GPU utilization peak 85%, MongoDB working set 70%), and 3 recent changes (aicr port Phase 1, RAG hybrid retrieval launch, BRD 21 topics)
- Handover is a reliability mechanism, not an administrative ritual — its purpose is to transfer operational context so the incoming oncall can triage incidents without rediscovering the state of the system
- The most actionable element is a concrete next step for every ongoing incident: "run this diagnostic," "escalate if X exceeds Y," not "monitoring" which is the absence of a next step
- Recent changes are the most likely source of new incidents in the first 24 hours — the handover must explain the "why" behind each change, not just the "what"
- Cross-project oncall rotation builds operational knowledge transfer across YiVad, YiPet, and YiAi, making each engineer effective at debugging cross-project issues like RPC contract mismatches

## Shift Info

- **Period: ** 2026-W32 (2026-08-10 ~ 2026-08-16) 
- **From: ** YiVad primary owner
- **To: ** YiPet primary owner
- **Handover date: ** 2026-08-10

## Ongoing Incidents

| # | Incident | Severity | Status | Next Step |
|---|----------|----------|--------|-----------|
| 1 | YiPet aicr Phase 1 MV3 skeleton smoke-testing (content script injection occasional failure 1%)  | P2 | Mitigating | manifest host_permissions fully declared + failure retry |

## Pending Alerts / Known Issues

- YiAi GPU utilization peak 85% (expected 95%+ after aicr landing) , pending multi-provider switch for streaming landing. 
- MongoDB working set 70% (near limit) , RSS body split effect pending next bill verification. 

## Recent Changes (last 7 days)

- 2026-08-03: YiPet aicr port Phase 1 kicked off. 
- 2026-08-03: YiAi RAG hybrid retrieval launch (dense + sparse + metadata filter) . 
- 2026-08-03: BRD system 21 topics fully populated with content. 

## Monitoring Dashboard

- YiAi `/health` endpoint + apscheduler stale log. 
- aicr parity diff weekly report (to be enabled after YiPet Phase 5) . 

## Escalation Contacts

- **Secondary oncall: ** YiAi backend owner
- **Service owners: ** YiPet extension — YiPet primary owner; YiAi inference — YiAi backend owner; YiVad SPA — YiVad primary owner
- **Manager: ** CTO

## Core viewpoints

- **Handover is a reliability mechanism, not an administrative ritual.** The oncall handover exists to transfer operational context — which incidents are active, which alerts are pending, which recent changes may have introduced instability. A handover that only transfers the pager is a gap in the incident response chain.

- **Incomplete handover creates a single point of failure in human memory.** When operational knowledge lives only in the outgoing oncall's head, the incoming oncall is blind to subtle issues: a GPU utilization trend that looks normal but is trending up, a MongoDB working set approaching its limit. The handover document externalizes that tacit knowledge.

- **Pending alerts are the incoming oncall's first priority, not "someone else's problem."** Every pending alert in the handover represents a known issue that has not yet been resolved. The incoming oncall inherits these alerts along with the pager. Each alert needs a clear next step, not just a description.

- **Recent changes are the most likely source of new incidents and serve as a differential diagnosis tool.** When a new incident occurs in the first 24 hours of a shift, the first question should be "what changed in the last 7 days?" The handover makes that question answerable without searching through commit logs.

- **Cross-project oncall rotation builds operational knowledge transfer.** Rotating the oncall across YiVad, YiPet, and YiAi owners ensures each engineer develops operational familiarity with all three projects, which is valuable when debugging cross-project issues like RPC contract mismatches or SSE streaming failures.

## Action recommendations

1. **Update the handover document continuously throughout the shift, not at the last minute.** The document is a running log of incidents, changes, and observations. Writing it at the last minute guarantees subtle issues are forgotten. Each incident, alert, and deployment should be added to the handover document as it occurs.

2. **Give every ongoing incident a concrete next step, not "monitoring."** "Monitoring" is the absence of a next step. Every ongoing incident should have a specific action: "run this diagnostic at 2 PM," "escalate to the backend owner if GPU utilization exceeds 90%," "apply the retry mitigation if the content script injection failure rate exceeds 2%."

3. **Explain the "why" behind every recent change, not just the "what."** Listing "YiAi RAG hybrid retrieval launch" is useful. Explaining that it switched from pure dense to dense + sparse + metadata filter, and the expected impact is higher latency but better recall, is what the incoming oncall needs when the latency alert fires at 3 AM.

4. **Verify escalation contacts against the current team roster at the start of every shift.** Outdated contacts turn a 30-minute incident into a 3-hour one. Any discrepancy between the escalation list and the actual team roster should be treated as a P1 documentation bug and fixed before the handover is accepted.

5. **Treat the handover as a context transfer, not a template to fill out.** The incoming oncall should be able to ask "what does this mean?" about every line and get a substantive answer. A handover with placeholder text or copied-from-last-week content creates the illusion of context transfer while leaving the incoming oncall blind to real operational risks.

## Anti-patterns

- **Treating the handover as a template to fill out rather than a context transfer.** A handover with placeholder text or copied-from-last-week content creates the illusion of context transfer. The incoming oncall should be able to ask "what does this mean?" about every line and get a substantive answer.

- **Handing over unresolved incidents without a clear next step.** "Monitoring" is not a next step — it is the absence of one. Every ongoing incident should have a concrete action: "run this diagnostic," "escalate to this person if X happens," "apply this mitigation if the error rate exceeds Y."

- **Omitting the "why" behind recent changes.** Listing "YiAi RAG hybrid retrieval launch" is useful. Explaining that it switched from pure dense to dense + sparse + metadata filter, and the expected impact is higher latency but better recall, is what the incoming oncall needs when the latency alert fires at 3 AM.

- **Writing the handover document at the last minute.** The document should be updated continuously throughout the shift as incidents occur and changes deploy. Writing it at the last minute guarantees subtle issues are forgotten. The document is a running log, not a retrospective.

## Related

- [Oncall handover W33](./tl-oncall-handover-2026-w33.md) — the following week's handover, carries forward the same ongoing incidents and alerts
- [No-lockfile supply chain postmortem](./tl-postmortem-no-lockfile-supply-chain-2026-07.md) — supply chain incident discovered during ADR review, referenced in W33 handover changes
- [FSEvents silent drop postmortem](./tl-postmortem-fsevents-silent-drop-2026-08.md) — macOS watcher incident affecting YiKnowledge scanning and YiAi hot reload
- [Monitoring alert governance](../../engineer/process/monitoring-governance.md) — alert quality standards and governance process that the oncall should follow
- [Bug-logging protocol](../../engineer/quality-security/bug-logging-protocol.md) — RPC shape for logging bugs discovered during oncall shifts
