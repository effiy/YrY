---
title: BRD-2026-071 Air-Gapped / Tactical Edge Deployment Platform
lifecycle: active
key: brd_brd-engineer_fde-air-gap-platform
tags:
- engineer
- fde-playbook
- fde
- air-gap
- tactical-edge
- k3s
- ollama
- iron-bank
- cosign
- compliance
brd_id: BRD-2026-071
project: fde-playbook
domain: Air-Gapped Tactical Edge Deployment
quarter: 2026 Q3
priority: p1
status: proposed
owner: FDE Practice Team
tech_stack: K3s, Ollama, vLLM, llama.cpp, TensorRT-LLM, Iron Bank, Harbor, Cosign,
 Kyverno, chainguard/static, HashiCorp Vault, SOPS, age, Chrony, PTP, Trivy, Grype,
 Fluent Bit, Owl Cyber Defense (data diode)
key_metrics: Day 1 boot success rate ≥ 90%; sneakernet reship count 0/project; compliance one-shot pass rate ≥ 85%; data exfiltration incidents 0; Day
 1 → GA ≤ 8 weeks; image signing rate 100%; secrets unseal rate 100%; DLP desensitization rate 100%
acceptance_criteria: '1. Discovery SOP mandates sneakernet ISO submission + compliance triage (DoD
 IL? / FedRAMP? / ITAR? / CMMC? / PCI? / NERC?)

 2. Any IL4+ / High / ITAR / L2+ triggers air-gap-first template

 3. Day -7 rehearsal injects 4 classes of pitfalls (cert time skew / NTP loss / KMS unreachable / ISO missing weights)

 4. sneakernet ISO signed + checklist + SHA-256 verified

 5. PKI + NTP + Secrets + Cosign must pass acceptance

 6. compliance one-shot pass rate ≥ 85%'
stakeholders: CTO Office(decision); FDE Practice Team(execute); customer CISO/CISO legal(approval); PMO(track);
 DoD/FedRAMP auditors(authentication); cleared engineer(on-site delivery)
kb_path: engineer/strategies/deploy-to-an-air-gapped-environment
notes: References Awesome-FDE-Roadmap Air-Gapped & Tactical Edge Deployment section. Defense / government / finance
 / energy and other compliance drivers make air-gap-first the customer default. Day 1 hypothesis: no internet; always first. Rollout follows deploy-to-an-air-gapped-environment
 + navigate-compliance-accreditation + harden-supply-chain.
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# BRD-2026-071 Air-Gapped / Tactical Edge Deployment Platform

**BRD ID**: BRD-2026-071 | **Project**: fde-playbook | **Domain**: Air-Gapped Tactical Edge Deployment | **Quarter**: 2026 Q3
**Priority**: P1 | **Status**: Proposed | **Owner**: FDE Practice Team
**KB Source**: engineer/strategies/deploy-to-an-air-gapped-environment

## Context
References Awesome-FDE-Roadmap Air-Gapped & Tactical Edge Deployment section. FDE in defense / government / finance / energy and other compliance-driven customers often starts on-site with a "first cloud validation → then migrate to air-gap" pattern, and only discovers air-gap blockers (no NTP / no KMS / no package mirror) at Week 12, causing project delays or deprecation. DoD IL4+ / FedRAMP High / ITAR / CMMC L2+ effectively mandate air-gap.

This BRD sets air-gap-first as the default deployment pattern for compliance-driven customers. Day 1 hypothesis: no internet; K3s + Ollama + Iron Bank + Cosign + Vault + offline weights to start; cloud only as dev/test image source. Rollout follows [deploy-to-an-air-gapped-environment](../../engineer/strategies/deploy-to-an-air-gapped-environment.md) + [navigate-compliance-accreditation](../../engineer/processes/navigate-compliance-accreditation.md) + [harden-supply-chain](../../engineer/strategies/harden-supply-chain.md).

## Objectives & Key Metrics
Day 1 boot success rate ≥ 90% (baseline 30%); sneakernet reship count 0/project (baseline 2-3 times); compliance one-shot pass rate ≥ 85% (baseline 30%); data exfiltration incidents 0 (baseline 1-2 per year); Day 1 → GA ≤ 8 weeks (baseline 12-20 weeks); image signing rate 100%; secrets unseal rate 100%; DLP desensitization rate 100%

## Acceptance Criteria
1. Discovery SOP mandates sneakernet ISO submission + compliance triage (DoD IL? / FedRAMP? / ITAR? / CMMC? / PCI? / NERC?)
2. Any IL4+ / High / ITAR / L2+ triggers air-gap-first template
3. Day -7 rehearsal injects 4 classes of pitfalls (cert time skew / NTP loss / KMS unreachable / ISO missing weights)
4. sneakernet ISO signed + checklist + SHA-256 verified
5. PKI (Vault / step-ca / Smallstep) + NTP (Chrony / PTP) + Secrets (Vault HA + HSM auto-unseal / SOPS + age) + Cosign must pass acceptance
6. compliance one-shot pass rate ≥ 85%
7. image signing rate 100% + Kyverno admission rejects unsigned
8. DLP desensitization rate 100% (PII / coordinates / serial numbers)
9. Day 1 → GA ≤ 8 weeks

## Stakeholders
CTO Office(decision); FDE Practice Team(execute); customer CISO/CISO legal(approval); PMO(track); DoD/FedRAMP auditors(authentication); cleared engineer(on-site delivery)

## Milestones
M1(2026 Q3): Discovery SOP + Site Survey Template launch + air-gap-first template launch
M2(2026 Q4): 3 compliance customers run Day -7 rehearsal end-to-end; Day 1 boot success rate ≥ 80%
M3(2027 Q1): compliance one-shot pass rate ≥ 85%; sneakernet reship 0/project
M4(2027 Q2-Q3): 5 compliance customers GA; Day 1 → GA ≤ 8 weeks
M5(2027 Q4): L3 maturity — air-gap template cross-customer reuse rate ≥ 70%

## risks
1. Slow start, customer loses patience (P1) — 30-day MVA must produce demo; air-gap Day 1 runs sneakernet ISO
2. Offline weights preload missing one piece (P1) — Site Survey resource checklist + SHA-256 verify + physical media sign-off
3. Iron Bank missing some base images (P1) — engage Platform One ahead of time; fallback chainguard/static + STIG self-hardening
4. Cosign offline root-of-trust key management (P2) — HSM offline signing; Kyverno admission rejects unsigned
5. CDS approval slows down (P1) — raise at Discovery call; PMO follow-up
6. vLLM / Ollama insufficient performance on constrained hardware (P2) — Site Survey must fill hardware checklist + benchmark
7. Legal / ITAR weights physical media transport refused (P2) — legal + logistics early engagement; cleared courier

## Long-term Evolution
3 years later: Day 1 boot success rate ≥ 98%; compliance one-shot pass rate ≥ 95%; Day 1 → GA ≤ 4 weeks; air-gap template reused across defense / government / finance / energy 4 industries. FDE Practice Lead abstracts air-gap template into a product-grade "compliance deployment package" feature, feeding back into the core product.

## References
- **KB Source**: `YiKnowledge/engineer/strategies/deploy-to-an-air-gapped-environment.md`
- **Sub-files**: objectives / acceptance / milestones / risks / rules / stakeholders / approvals / documents
- **Related leaves**: [navigate-compliance-accreditation](../../engineer/processes/navigate-compliance-accreditation.md) / [harden-supply-chain](../../engineer/strategies/harden-supply-chain.md) / [operate-as-a-forward-deployed-engineer](../../engineer/strategies/operate-as-a-forward-deployed-engineer.md)
- **Related ADR**: [ADR Air-gap-first for regulated clients](../../tech-lead/decisions/fde/air-gap-first-for-regulated-clients.md)
- **Related failures**: [air-gapped pipeline broke without sneakernet](../../engineer/lessons/failures/air-gapped-pipeline-broke-without-sneakernet.md) / [air-gap first-boot surprise](../../engineer/lessons/gotchas/air-gap-first-boot-surprise.md)
- **External**: [Awesome-FDE-Roadmap](https://github.com/pierpaolo28/Awesome-FDE-Roadmap) / [DoD Platform One](https://p1.dso.mil/) / [NIST SP 800-171](https://csrc.nist.gov/pubs/sp/800/171/r2/final)
