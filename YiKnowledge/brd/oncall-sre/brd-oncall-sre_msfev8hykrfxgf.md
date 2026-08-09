---
title: incident response — I want to respond to an incident
lifecycle: active
key: brd_brd-oncall-sre_msfev8hykrfxgf
tags:
- sre
- oncall
- incident-response
incident_id: INC-JOURNEY-001
severity: sev1
incident_type: outage
status: stable
owner: Oncall SRE
mttr: 30
blast_radius: depends on incident
kb_path: oncall-sre/incident-response/respond-to-an-incident.md
runbook_link: https://wiki.../incident-response
summary: 2 hops to reach incident response + oncall rotation + hotfix process + rollback drill + incident retrospective template. Severity P0/P1/P2/P3 + triage first
 + investigate + fix + retrospective. 
timeline: 1. alert triggered / user feedback 2. severity (P0-P3) 3. triage first (rollback / gradual switchback / rate limit / degrade / feature flag off)
 4. investigate (log / monitoring / trace / user feedback / recent change) 5. hotfix 6. 24h retrospective
root_cause: incident root cause — 5-whys to root cause + improvement items assigned to process not individuals
action_items: 1. severity SLA 2. triage first 3. investigate after triage 4. hotfix via dedicated process 5. 24h retrospective 6. quarterly rollback drill + DR
 + chaos 7. rotation handoff 8. alert actionable
slo_impact: P0 all users unable to use / P1 partial users unable to use / P2 degraded experience / P3 hidden risk
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# incident response — I want to respond to an incident

**Incident ID**: INC-JOURNEY-001 | **Severity**: sev1 | **Type**: outage | **Status**: stable
**Oncall**: Oncall SRE | **MTTR**: 30 min | **Blast Radius**: depends on incident
**KB Source**: oncall-sre/incident-response/respond-to-an-incident.md
**Runbook**: https://wiki.../incident-response

## Summary
2 hops to reach incident response + oncall rotation + hotfix process + rollback drill + incident retrospective template. Severity P0/P1/P2/P3 + triage first + investigate + fix + retrospective. 

## Timeline
1. alert triggered / user feedback 2. severity (P0-P3) 3. triage first (rollback / gradual switchback / rate limit / degrade / feature flag off) 4. investigate (log / monitoring / trace / user feedback / recent change) 5. hotfix 6. 24h retrospective

## Root Cause
incident root cause — 5-whys to root cause + improvement items assigned to process not individuals

## Action Items
1. severity SLA 2. triage first 3. investigate after triage 4. hotfix via dedicated process 5. 24h retrospective 6. quarterly rollback drill + DR + chaos 7. rotation handoff 8. alert actionable

## SLO Impact
P0 all users unable to use / P1 partial users unable to use / P2 degraded experience / P3 hidden risk

## References
- **KB Source**: `YiKnowledge/oncall-sre/incident-response/respond-to-an-incident.md`
- **Runbook**: https://wiki.../incident-response
