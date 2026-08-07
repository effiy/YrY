---
title: AI incident responsestrategy — Prepare an AI Incident Response Strategy
lifecycle: active
key: brd_brd-oncall-sre_msfev8n0x80zc8
tags:
- sre
- ai
- incident
incident_id: INC-AI-001
severity: sev1
incident_type: outage
status: stable
owner: AI SRE + AI Engineer
mttr: 45
blast_radius: AI users / BRD business stakeholders
kb_path: oncall-sre/incident-response/prepare-an-ai-incident-response-strategy.md
runbook_link: https://wiki.../ai-incident
summary: AI incident response - model hallucination / recall regression / prompt drift / multi-provider switch failure. Roll back prompt + switch back to old model + eval set gate.
timeline: 1. AI alert 2. switch back to old prompt / model 3. rerun eval set baseline 4. retrospective
root_cause: AI model upgrade breaking change + prompt drift + recall regression
action_items: 1. switch back to old prompt 2. switch back to old model 3. rerun eval set baseline 4. retrospective + ADR
slo_impact: AI incident → business users impacted + brand damage
review_cycle: quarterly
tacit: false
related: []
---

# AI incident responsestrategy — Prepare an AI Incident Response Strategy

**Incident ID**: INC-AI-001  |  **Severity**: sev1  |  **Type**: outage  |  **Status**: stable
**Oncall**: AI SRE + AI Engineer  |  **MTTR**: 45 min  |  **Blast Radius**: AI users / BRD business stakeholders
**KB Source**: oncall-sre/incident-response/prepare-an-ai-incident-response-strategy.md
**Runbook**: https://wiki.../ai-incident

## Summary
AI incident response - model hallucination / recall regression / prompt drift / multi-provider switch failure. Roll back prompt + switch back to old model + eval set gate.

## Timeline
1. AI alert 2. switch back to old prompt / model 3. rerun eval set baseline 4. retrospective

## Root Cause
AI model upgrade breaking change + prompt drift + recall regression

## Action Items
1. switch back to old prompt 2. switch back to old model 3. rerun eval set baseline 4. retrospective + ADR

## SLO Impact
AI incident → business users impacted + brand damage

## References
- **KB Source**: `YiKnowledge/oncall-sre/incident-response/prepare-an-ai-incident-response-strategy.md`
- **Runbook**: https://wiki.../ai-incident
