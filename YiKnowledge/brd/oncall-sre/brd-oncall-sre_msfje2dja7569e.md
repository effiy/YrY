---
title: Incident — 2026-08-05 Async processing platform schema evolution triggers canary failure
lifecycle: active
key: brd_brd-oncall-sre_msfje2dja7569e
tags:
- sre
- oncall
- incident
- yipet
- kafka
- schema-registry
__title: Incident — 2026-08-05 Async processing platform schema evolution triggers canary failure
incident_id: INC-2026-08-05-001
project: yipet
severity: sev2
incident_type: degradation
status: reviewed
owner: Oncall SRE
mttr: 18
blast_radius: 12% of users / 3 business teams / canary traffic 5%
kb_path: oncall-sre/incident-response/respond-to-an-incident.md
runbook_link: https://wiki.example.com/runbooks/kafka-schema-evolution
summary: During Kafka schema registry evolutionary publishing, producer deployed backward-incompatible schema
  before consumer, triggering canary traffic 5% of users message parsing failure. Through schema registry enforced
  bidirectional compatibility strategy + canary kill switch, mitigated within 18 minutes.
timeline: 09:12 — canary error rate suddenly rises 5% → 09:14 — SRE alert triggers → 09:18 — locate schema
  incompatibility → 09:23 — kill switch closes canary → 09:30 — rollback producer → 09:42 — recovered, root
  cause enters retrospective
root_cause: Schema registry only enforced backward compatibility, did not enforce forward compatibility; producer/consumer
  deploy order had no sequence constraint. Landed: bidirectional compatibility strategy + deploy order contract
  + BRD-2026-058 platform layer added schema enforcement check.
action_items: '1. Schema registry enforce bidirectional compatibility (landed in BRD-2026-058) — SRE owner, 2 weeks

  2. Canary kill switch automation (BRD-2026-059) — Release Platform, 1 week

  3. Drill rollback + retrospective documentation into the repository'
slo_impact: 'Event SLA: 99.9% / Actual: 99.78% (4 minutes breach); error budget consumed 6%'
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# Incident — 2026-08-05 Async processing platform schema evolution triggers canary failure

**Incident ID**: INC-2026-08-05-001  |  **Project**: yipet  |  **Severity**: sev2

Seeded as a cross-role sample linking to engineer BRD entries under project `yipet`.
