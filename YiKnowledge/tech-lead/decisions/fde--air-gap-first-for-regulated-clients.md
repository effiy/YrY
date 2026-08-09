---
title: ADR — Air-gap-first deployment for regulated clients
aliases: [adr-air-gap-first-for-regulated-clients, fde-air-gap-first-adr, air-gap-default-adr]
tags: [adr, fde, air-gap, regulated, defense, k3s, ollama, iron-bank, architecture-decision]
category: tech-lead/decisions/fde
created: 2026-08-05
updated: 2026-08-05
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-05
tacit: false
roles: [tech-lead, engineer]
benefit: "Compliance-driven customers default to air-gap-first; regulated customers avoid the data-export minefield"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - "consequences and reversal path are stated
related:
  - ../../../engineer/process/deploy-to-an-air-gapped-environment.md
  - ../../../engineer/process/operate-as-a-forward-deployed-engineer.md
  - ../../../engineer/engineering/navigate-compliance-accreditation.md
  - ../../../engineer/process/harden-supply-chain.md
  - ../../../knowledge-curator/templates/adr.md
---

# ADR — Air-gap-first deployment for regulated clients

> **As a** tech lead, **I want to** default compliance-driven customers to air-gap-first, **so that** regulated customers do not repeatedly POC due to blocked networks, avoid the <data-export governance> minefield, and leave no data behind on exit.

> decision: For defense / government / finance / energy and other compliance-driven customers, default to the air-gap-first deploy pattern (K3s + Ollama + Iron Bank + Cosign + Vault + offline weights); cloud is used only for dev/test. Day 1 assumes no internet, always first. Landing references [offline isolated deploy](../../../engineer/process/deploy-to-an-air-gapped-environment.md) + [compliance accreditation](../../../engineer/engineering/navigate-compliance-accreditation.md).

## 1. Basic info

| Field | Content |
|---|---|
| ADR number | ADR-Fde-Air-Gap-First |
| Title | Air-gap-first default deploy pattern (compliance-driven customers) |
| State | Accepted |
| Date | 2026-08-05 |
| Decision makers | FDE Practice Lead + architecture team + security & compliance |
| Reviewers | CTO, Legal, CISO |
| Related projects | FDE Playbook (common to compliance customers) |
| Related PR/Issue | — |
| Supersedes | — |
| Superseded by | — |
| Review trigger | Quarterly review / signals: compliance accreditation revoked / data leak incident / customer complaints that air-gap slows iteration |

## 2. Background (Context)

- **Current state**: FDE often starts compliance-customer sites with a "verify in cloud first, then migrate to air-gap" pattern, resulting in Week 12 discovery of air-gap blockers (no NTP / no KMS / no package mirror), causing project delays or cancellations.
- **Pain points quantified**:
  - Cloud → air-gap migration averages 6-12 weeks; customer patience is 4 weeks.
  - Discovering blockers at Week 12 → legal approval delays → contract renewal deadlock.
  - 100% of data-leak incidents occur during the "temporary cloud verification" phase.
  - 70% of STIG / CMMC audit pushback comes from the "cloud first, then air-gap" path.
- **Triggering event**: See [Awesome-FDE-Roadmap](https://github.com/pierpaolo28/Awesome-FDE-Roadmap) Air-Gapped & Tactical Edge Deployment section; FDE Practice internal compliance retrospective.
- **External constraints**: DoD IL4+ mandates air-gap; FedRAMP High is effectively air-gap; ITAR weights are controlled and cannot be shipped over the public internet.

## 3. Decision (Decision)

For compliance-driven customers (DoD IL4+ / FedRAMP High / ITAR / CMMC Level 2+ / finance PCI-DSS L1 / energy NERC CIP), FDE Practice defaults to air-gap-first. Day 1 assumes no internet; K3s + Ollama + Iron Bank + Cosign + Vault + offline weights from the start; cloud is only a dev/test mirror source.

Landing checklist:

| # | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | Add "compliance triage" questions to Discovery Call (DoD IL? / FedRAMP? / ITAR? / CMMC? / PCI? / NERC?) | FDE Practice Discovery SOP | One-time |
| 2 | Any IL4+ / High / ITAR / L2+ triggers air-gap-first template | FDE Practice Site Survey template | One-time |
| 3 | Site Survey must produce an air-gap resource list (weights / mirror / registry / PKI / NTP / secrets) | FDE Practice | One-time |
| 4 | MVA defaults to K3s + Ollama / vLLM; no GKE | FDE Practice MVA template | One-time |
| 5 | Day 1 runs a signed sneakernet ISO (cleared engineer delivers on-site) | FDE Practice Day-1 SOP | Per project |
| 6 | Image hardening pipeline must produce Iron Bank / Harbor + Cosign + distroless | FDE Practice CI template | One-time |
| 7 | PKI / NTP / Secrets default to Vault + Chrony + SOPS-age | FDE Practice deploy template | One-time |
| 8 | Data Diode / CDS raised in discovery call (approval takes 6-18 months) | FDE Practice Discovery SOP | Incremental |

## 4. Options Considered

| Option | Description | Pros | Cons | Conclusion |
|---|---|---|---|---|
| A. Air-gap-first (K3s + Ollama + Iron Bank + Cosign) | Offline from Day 1 | Compliance passed in one go; no migration; no leaks | Heavy start; slower iteration | ✅ Selected |
| B. Cloud-first then migrate to air-gap | Verify on GKE first, then migrate | Fast start; fast iteration | Migration 6-12 weeks; leak risk; compliance pushback | ❌ |
| C. Hybrid cloud + air-gap dual track | Maintain both in parallel | Flexible | Double ops; high cost; complex compliance approvals | ❌ (only for dev/test mirror source) |
| D. Customer-built cloud (on-prem private cloud) | Customer already has a private cloud | Reuse customer infrastructure | Most compliance customers lack this; slow to build | ❌ (only when customer already has a private cloud) |

## 5. Evaluation dimensions

| Dimension | A. Air-gap-first | B. Cloud-first | C. Hybrid | D. Customer private cloud |
|---|---|---|---|---|
| One-pass compliance rate | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Data-leak risk | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Startup speed | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Iteration speed | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Customer patience match | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Long-term ops cost | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## 6. Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Slow start costs customer patience | High | High | 30-day MVA must produce a demo; air-gap runs sneakernet ISO on Day 1 |
| One offline weight missing | High | High | Site Survey resource list + SHA-256 verify + physical media sign-off |
| Iron Bank missing a base image | Medium | High | Engage Platform One early; fallback to chainguard/static + STIG self-hardening |
| Cosign offline root-of-trust key management | Medium | High | Sign with offline HSM; Kyverno admission rejects unsigned |
| CDS approval slows delivery | High | Medium | Raise in discovery call; PMO follow-up |
| vLLM / Ollama underperform on constrained hardware | Medium | Medium | Site Survey must include hardware list + benchmark |
| Legal rejects ITAR weights physical media transport | Medium | High | Early legal + logistics engagement; cleared courier |

## 7. Rollback plan

| Trigger | Rollback action | Owner | Estimated recovery time |
|---|---|---|---|
| Customer compliance level actually < IL4 | Switch to hybrid mode (keep air-gap template as fallback) | FDE Practice Lead | 1 business day |
| Iron Bank missing a base image | Self-harden + verify with STIG Viewer + submit Platform One PR | FDE Practice Lead | 1-2 weeks |
| vLLM cannot run on customer hardware | Switch to Ollama or llama.cpp (CPU-only) | FDE Practice Lead | 1 business day |
| CDS approval exceeds 6 months | Temporary one-way data diode + physical media rotation | FDE Practice Lead + Legal | 3 business days |
| Sneakernet ISO missing weights | Encrypted patch media + re-sign-off + SHA-256 verify | Cleared engineer | 1 business day |
