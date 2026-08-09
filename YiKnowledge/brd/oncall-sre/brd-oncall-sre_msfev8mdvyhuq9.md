---
title: Model observability strategy — Prepare a Model Observability Strategy
lifecycle: active
key: brd_brd-oncall-sre_msfev8mdvyhuq9
tags:
- sre
- ai
- observability
incident_id: INC-MODEL-001
severity: sev2
incident_type: degradation
status: stable
owner: AI SRE
mttr: 45
blast_radius: AI users
kb_path: oncall-sre/incident-response/prepare-a-model-observability-strategy.md
runbook_link: https://wiki.../model-observability
summary: "AI model observability: tokens / latency / cost / recall / hallucination + self-hosted Langfuse + alerting + quarterly review."
timeline: 1. Model launch 2. trace instrumentation 3. metric monitoring 4. alerting 5. quarterly review
root_cause: AI model black-box makes incidents hard to locate
action_items: 1. Self-host Langfuse 2. 95% trace coverage 3. 5-dimension metrics 4. alerting 5. quarterly review
slo_impact: AI model not observable -> incident MTTR > 1h
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# Model observability strategy — Prepare a Model Observability Strategy

**Incident ID**: INC-MODEL-001  |  **Severity**: sev2  |  **Type**: degradation  |  **Status**: stable
**Oncall**: AI SRE  |  **MTTR**: 45 min  |  **Blast Radius**: AI users
**KB Source**: oncall-sre/incident-response/prepare-a-model-observability-strategy.md
**Runbook**: https://wiki.../model-observability

## Summary
AI model observability: tokens / latency / cost / recall / hallucination + self-hosted Langfuse + alerting + quarterly review. 

## Timeline
1. Model launch 2. trace instrumentation 3. metric monitoring 4. alerting 5. quarterly review

## Root Cause
AI model black-box makes incidents hard to locate

## Action Items
1. Self-host Langfuse 2. 95% trace coverage 3. 5-dimension metrics 4. alerting 5. quarterly review

## SLO Impact
AI model not observable -> incident MTTR > 1h

## References
- **KB Source**: `YiKnowledge/oncall-sre/incident-response/prepare-a-model-observability-strategy.md`
- **Runbook**: https://wiki.../model-observability
