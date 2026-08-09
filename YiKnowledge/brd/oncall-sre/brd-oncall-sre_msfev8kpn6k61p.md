---
title: Major Incident Response Strategy — Prepare a Major Incident Response Strategy
lifecycle: active
key: brd_brd-oncall-sre_msfev8kpn6k61p
tags:
- sre
- major-incident
incident_id: INC-MAJOR-001
severity: sev1
incident_type: outage
status: stable
owner: Incident Commander
mttr: 60
blast_radius: all users / multi-service
kb_path: oncall-sre/incident-response/prepare-a-major-incident-response-strategy.md
runbook_link: https://wiki.../major-incident
summary: "Major incident (P0) response: Incident Commander + war room + multi-team coordination + executive briefing + external status page."
timeline: 1. P0 triggered 2. Incident Commander takes over 3. War room convened 4. Multi-team division of labor 5. Internal briefing within 15min 6. External status
  page within 30min 7. 1h update 8. Postmortem after resolution
root_cause: No unified command for P0 incidents leads to response chaos
action_items: 1. Incident Commander training 2. War room runbook 3. Multi-team division of labor 4. Internal SLA 15min 5. External SLA 30min
slo_impact: P0 incident MTTR > 60min → severe SLO breach
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# Major Incident Response Strategy — Prepare a Major Incident Response Strategy

**Incident ID**: INC-MAJOR-001  |  **Severity**: sev1  |  **Type**: outage  |  **Status**: stable
**Oncall**: Incident Commander  |  **MTTR**: 60 min  |  **Blast Radius**: all users / multi-service
**KB Source**: oncall-sre/incident-response/prepare-a-major-incident-response-strategy.md
**Runbook**: https://wiki.../major-incident

## Summary
Major incident (P0) response: Incident Commander + war room + multi-team coordination + executive briefing + external status page.

## Timeline
1. P0 triggered 2. Incident Commander takes over 3. War room convened 4. Multi-team division of labor 5. Internal briefing within 15min 6. External status page within 30min 7. 1h update 8. Postmortem after resolution

## Root Cause
No unified command for P0 incidents leads to response chaos

## Action Items
1. Incident Commander training 2. War room runbook 3. Multi-team division of labor 4. Internal SLA 15min 5. External SLA 30min

## SLO Impact
P0 incident MTTR > 60min → severe SLO breach

## References
- **KB Source**: `YiKnowledge/oncall-sre/incident-response/prepare-a-major-incident-response-strategy.md`
- **Runbook**: https://wiki.../major-incident
