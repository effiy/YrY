---
title: Blast Radius Analysis - Do a Blast Radius Analysis
lifecycle: active
key: brd_brd-oncall-sre_msfev8k7hueblk
tags:
- sre
- blast-radius
incident_id: INC-BLAST-001
severity: sev2
incident_type: degradation
status: stable
owner: Oncall SRE
mttr: 15
blast_radius: 5-30% services
kb_path: oncall-sre/incident-response/do-a-blast-radius-analysis.md
runbook_link: https://wiki.../blast-radius
summary: "Blast radius analysis: impact scope (user count / service count / region) + severity + trend + isolation strategy."
timeline: 1. discover 2. impact scope scan 3. severity assessment 4. trend predict 5. isolation strategy
root_cause: impact scope unclear causing response to be mis-targeted
action_items: 1. automate scan tool 2. impact scope template 3. trend monitoring 4. isolation runbook
slo_impact: Blast radius assessment wrong -> response over- or under-sized
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# Blast Radius Analysis - Do a Blast Radius Analysis

**Incident ID**: INC-BLAST-001 | **Severity**: sev2 | **Type**: degradation | **Status**: stable
**Oncall**: Oncall SRE | **MTTR**: 15 min | **Blast Radius**: 5-30% services
**KB Source**: oncall-sre/incident-response/do-a-blast-radius-analysis.md
**Runbook**: https://wiki.../blast-radius

## Summary
Blast radius analysis: impact scope (user count / service count / region) + severity + trend + isolation strategy.

## Timeline
1. discover 2. impact scope scan 3. severity assessment 4. trend predict 5. isolation strategy

## Root Cause
Impact scope unclear causing response to be mis-targeted.

## Action Items
1. automate scan tool 2. impact scope template 3. trend monitoring 4. isolation runbook

## SLO Impact
Blast radius assessment wrong -> response over- or under-sized.

## References
- **KB Source**: `YiKnowledge/oncall-sre/incident-response/do-a-blast-radius-analysis.md`
- **Runbook**: https://wiki.../blast-radius
