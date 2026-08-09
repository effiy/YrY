---
title: Incident Triage Strategy — Prepare an Incident Triage Strategy
lifecycle: active
key: brd_brd-oncall-sre_msfev8ihouo71l
tags:
- sre
- triage
incident_id: INC-TRIAGE-001
severity: sev2
incident_type: degradation
status: stable
owner: Oncall SRE
mttr: 20
blast_radius: 5-20% users
kb_path: oncall-sre/incident-response/prepare-an-incident-triage-strategy.md
runbook_link: https://wiki.../triage
summary: "Incident triage strategy: 5 dimensions (severity / impact scope / user count / business criticality / time sensitivity) + automated triage tooling + manual review."
timeline: 1. Alert enters triage queue 2. Automated triage (5 dimensions) 3. Manual review 4. Route to handling process
root_cause: Improper triage led to delayed response
action_items: 1. 5-dimension scorecard 2. Automated triage tooling 3. Manual review SLA 4. Triage → response routing
slo_impact: Triage error → response delay → SLO breach
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# Incident Triage Strategy — Prepare an Incident Triage Strategy

**Incident ID**: INC-TRIAGE-001  |  **Severity**: sev2  |  **Type**: degradation  |  **Status**: stable
**Oncall**: Oncall SRE  |  **MTTR**: 20 min  |  **Blast Radius**: 5-20% users
**KB Source**: oncall-sre/incident-response/prepare-an-incident-triage-strategy.md
**Runbook**: https://wiki.../triage

## Summary
Incident triage strategy: 5 dimensions (severity / impact scope / user count / business criticality / time sensitivity) + automated triage tooling + manual review. 

## Timeline
1. Alert enters triage queue 2. Automated triage (5 dimensions) 3. Manual review 4. Route to handling process

## Root Cause
Improper triage led to delayed response

## Action Items
1. 5-dimension scorecard 2. Automated triage tooling 3. Manual review SLA 4. Triage → response routing

## SLO Impact
Triage error → response delay → SLO breach

## References
- **KB Source**: `YiKnowledge/oncall-sre/incident-response/prepare-an-incident-triage-strategy.md`
- **Runbook**: https://wiki.../triage
