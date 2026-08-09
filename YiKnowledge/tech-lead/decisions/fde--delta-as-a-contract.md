---
title: ADR — The Delta as a contract not a feature
aliases: [adr-delta-as-contract, fde-delta-contract-adr, delta-contract-adr]
tags: [adr, fde, delta, contract, sow, scope-creep, architecture-decision]
category: tech-lead/decisions/fde
created: 2026-08-05
updated: 2026-08-05
source: internal
type: adr
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-05
tacit: false
roles: [tech-lead, engineer]
benefit: "Delta managed as a SOW attachment contract, legally traceable, evidence for renewal, exit criteria not lost"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - "consequences and reversal path are stated
related:
  - ../../../engineer/process/operate-as-a-forward-deployed-engineer.md
  - ../../../engineer/process/apply-consulting-frameworks.md
  - ../../../engineer/infrastructure/write-a-statement-of-work.md
  - ../../../engineer/engineering/run-a-site-survey.md
  - ../../../knowledge-curator/templates/adr.md
---

# ADR — The Delta as a contract not a feature

> **As a** tech lead, **I want to** manage Delta as a SOW attachment contract rather than a product backlog, **so that** it is legally traceable, evidence for renewal exists, exit criteria are not lost, and the product team is not tied down.

> Decision: "Delta" identified by FDE (product out-of-box capability vs customer mission gap) must be managed as a SOW attachment contract, not added to the product backlog and not an oral agreement. Each Delta item must have a proposal glue + business measurement + exit criteria; changes go through a change request. Landing references [FDE role discipline](../../../engineer/process/operate-as-a-forward-deployed-engineer.md) + [consulting frameworks](../../../engineer/process/apply-consulting-frameworks.md) + [SOW process](../../../engineer/infrastructure/write-a-statement-of-work.md).

## 1. Basic info

| Field | Content |
|---|---|
| ADR ID | ADR-Fde-Delta-As-Contract |
| Title | The Delta as a contract not a feature |
| State | Accepted |
| Date | 2026-08-05 |
| Decision makers | FDE Practice Lead + architecture team |
| Reviewers | CTO, Legal, PMO |
| Related project | FDE Playbook (reused across customers) |
| Related PR/Issue | — |
| Supersedes | — |
| Superseded by | — |
| Review trigger | Quarterly review / signals: scope creep rate > 15% / Delta items without business measurement / customer renewal rate drop |

## 2. Background (Context)

- **Current state**: FDE identifies "product does not do X, so I write glue" gaps on customer sites, often recorded as a single entry in an issue tracker, with no SOW attachment, no measurement, no exit criteria.
- **Pain points quantified**:
  - Delta items without measurement → cannot be falsified after launch → value questioned at renewal.
  - Delta items without exit criteria → after FDE exit, customer IT does not know when to retire them → shadow IT reappears.
  - Delta items entering product backlog → product team assumes "already planned" → stops investing → customer is stuck.
  - Delta items as oral agreements → scope creep → no legal evidence.
- **Trigger event**: See [Awesome-FDE-Roadmap](https://github.com/pierpaolo28/Awesome-FDE-Roadmap) "Delta" + "SOW" sections; FDE Practice internal retrospective.
- **External constraints**: Customer legal requires changes to go through change request; product team does not allow FDE to touch product backlog.

## 3. Decision

FDE Practice manages Delta as a SOW attachment contract. Each Delta item must have 4 fields: proposal glue (how to stitch) + business metric (business measurement) + exit criteria + owner (customer internal owner). Changes go through a change request, not into the product backlog.

Landing checklist:

| No. | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | Add Delta attachment section to SOW template (4 fields × per Delta item) | FDE Practice SOW template | One-time |
| 2 | Site Survey template produces Delta candidate list ([run-a-site-survey](../../../engineer/engineering/run-a-site-survey.md) §Delta) | FDE Practice Site Survey template | One-time |
| 3 | Discovery Call must produce ≥ 3 Delta candidates | FDE Practice Discovery SOP | Progressive |
| 4 | Change Request process connects to PMO (not into product backlog) | FDE Practice + PMO | One-time |
| 5 | Quarterly scope creep rate statistics (Delta item changes / total Delta items) | FDE Practice OKR | Quarterly |
| 6 | FDE signs off Delta exit criteria before exit | FDE Practice exit SOP | Per project |

## 4. Options Considered

| Option | description | pros | cons | conclusion |
|---|---|---|---|---|
| A. SOW attachment contract (4 fields + change request) | Delta as SOW attachment | Legally traceable; does not touch product backlog; enforces exit criteria | Template heavy; legal involvement slow | ✅ Selected |
| B. Into product backlog | Delta as product feature candidate | Product team takes over; natural customer renewal | Product team does not prioritize; customer stuck; FDE loses ownership | ❌ |
| C. JIRA tracker entry | Delta as issue | Light; fast | No measurement, no exit; no legal evidence; scope creep | ❌ |
| D. Oral agreement | Not documented | Lightest | Renewal deadlock; scope creep out of control | ❌ |

## 5. Evaluation dimensions

| Dimension | A. SOW attachment | B. Product backlog | C. JIRA | D. Oral |
|---|---|---|---|---|
| Legal traceable | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ |
| Measurement enforced | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Exit criteria enforced | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ |
| Customer renewal evidence | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| Startup cost | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Scope-creep control | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ |

## 6. Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| SOW template too heavy, legal slows signing | High | Medium | Template split into must-have / nice-to-have; Delta items ≥ 3 reviewed; <3 uses lightweight version |
| Delta exit criteria too strict, customer rejects | Medium | High | Exit criteria split into hard (legal) + soft (business); soft signed by customer internal owner |
| Product team thinks Delta entering backlog is stealing budget | Medium | Medium | SOW attachment explicitly marked "not a product commitment"; PMO and product team align quarterly |
| Scope creep rate statistics inconsistent | High | Low | Quarterly review of criteria; PMO + FDE Practice define together |
| FDE exit, customer internal owner refuses to sign exit | Medium | High | Exit criteria split into "met" / "not met but with plan"; latter taken over by PMO |
| Delta business measurement not measured | Medium | High | Measurement sourced from SOW Acceptance Criteria; FDE Practice quarterly spot audit |

## 7. Rollback plan

| Trigger | Rollback action | Owner | Estimated recovery time |
|---|---|---|---|
| Template heavy, legal slows > 2 weeks | Switch to lightweight version (Delta < 3 uses simple template) | FDE Practice Lead | 1 business day |
| Scope creep rate > 15% | Review SOW template + mandatory change request training | FDE Practice Lead + PMO | 1 week |
| Customer refuses to sign exit criteria | PMO intervenes + split exit criteria into hard/soft | PMO | 3 business days |
| Measurement not measured | Quarterly spot audit + responsibility to FDE exit owner | FDE Practice Lead | 1 week |
