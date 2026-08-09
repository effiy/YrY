---
title: Offline environment first boot certificate / NTP / secrets misconfiguration
aliases: [air-gap-first-boot-surprise, air-gap-cert-ntp-secrets, first-boot-gotcha]
tags: [pitfall, offline, air-gap, first-boot, cert, ntp, secrets, pki, vault, chrony]
category: engineer/lessons
created: 2026-08-05
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
tacit: true
roles: [engineer, oncall-sre, devops]
benefit: "same mistake avoided"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
---

# Offline environment first boot certificate / NTP / secrets misconfiguration

> **As an** engineer, **I want to** air gap first boot surprise, **so that** same mistake avoided. 

> Offline environment first boot (Day 1) must step on 4 classes of pitfalls: TLS certificate self-signed without PKI / NTP unreachable causing Kerberos and TLS cert time mismatch / Cloud KMS unreachable causing secrets undecryptable / sneakernet ISO missing weights must be re-sent. This gotcha is the basis of [ADR air-gap-first for regulated clients](../../tech-lead/decisions/fde--air-gap-first-for-regulated-clients.md) §Risk #5 + #6 + #7, reference [offline isolation deployment](../process/deploy-to-an-air-gapped-environment.md) §First boot four classes of pitfalls. 

## Summary

- **First boot 4 classes of pitfalls**: TLS cert / NTP / secrets / sneakernet ISO; any one missing = Day 1 Incident
- **Current state**: FDE on-site first boot often only focuses on weights + images, 4 classes of infrastructure are misconfigured
- **Root cause**: treating offline as a subset of cloud; not pre-provisioning PKI / NTP / KMS replacements
- **Fix**: Day 1 must run PKI (Vault / step-ca / Smallstep) + Chrony / PTP + Vault HA + HSM auto-unseal + signed sneakernet ISO list
- **Reference**: DoD Platform One first boot checklist + Iron Bank hardening guide

## Core viewpoints

- **offline = a separate stack; is not a subset of cloud** — not pre-provisioning PKI / NTP / KMS replacement = Day 1 inevitable Incident
- **TLS cert time mismatch is the hidden killer** — no NTP → cert NotBefore / NotAfter mismatch → all TLS handshake failure → entire cluster unavailable
- **Cloud KMS unreachable = all secrets undecryptable** — Vault must be HA + HSM auto-unseal; or SOPS + age + GitOps
- **sneakernet ISO is Day 1 unique entry** — missing one weights / mirror / cert must be re-sent → cleared engineer then runs on-site
- **First Boot is not a Day 2 Question** — discovery call must identify; ADR air-gap-first §Decision #5

## Key information

### Symptoms

- Day 1 cluster fails to start: TLS handshake all failure; Kerberos tickets not issued; Pod CrashLoopBackoff; secrets undecryptable. 
- Logs show: cert NotBefore in future / NotAfter in past; Kerberos time mismatch; Vault sealed. 
- Customer IT reports: "yesterday also could run, today all broken" — investigate to find NTP misconfigured. 
- All fixes depend on internet, but air-gap has no internet → must re-send sneakernet ISO. 

### Root cause

- **TLS cert**: self-signed cert without PKI; or cert issuance time mismatch (NotBefore in future) ; or cert rotation not automated. 
- **NTP**: offline environment no NTP reachable; Chrony / PTP not pre-provisioned; system time drift. 
- **Cloud KMS unreachable**: secrets encryption uses Cloud KMS; offline environment KMS unreachable → Vault sealed → all secrets undecryptable. 
- **sneakernet ISO missing**: weights / package mirror / cert / PKI key any one missing → must re-send → cleared engineer then runs on-site. 
- **First boot process not drilled**: Day 1 fakes having internet; no drill → inevitable miss. 
- **The "First Boot" Problem** (industry term) : Day 1 config how to enter air-gap — is a design question, not an ops question. 

### Impact scope

- FDE Practice all compliance-driven customers (DoD IL4+ / FedRAMP High / ITAR / CMMC L2+) 
- offline K3s / MicroK8s / k0s clusters
- offline Ollama / vLLM / llama.cpp inference
- Vault HA + HSM auto-unseal
- offline Cosign image signing and verification

### Resolution

**Day 1 first boot checklist** (must run) : 

| category | tool / config | Acceptance |
|---|---|---|
| PKI | HashiCorp Vault / step-ca / Smallstep | cert issuance + auto rotation + TLS handshake works |
| NTP | Chrony / PTP | system time ±50ms; cert NotBefore / NotAfter within window |
| Secrets | Vault HA + HSM auto-unseal; or SOPS + age + GitOps | sealed=false; secrets decryption rate 100% |
| sneakernet ISO | signed + listed + SHA-256 verify | cleared engineer on-site signoff; weights + mirror + cert + PKI key complete |
| Cosign root-of-trust | offline HSM signing; Kyverno admission rejects unsigned | image verification 100% |
| DLP redaction | egress telemetry passes through regex + ML classifier | PII / coordinates / unit numbers data masking rate 100% |

**drill** (Day -7 drill) : 

- in customer mirrored env run one first boot; must run 4 classes of pitfall injection (cert time mismatch / NTP loss / KMS unreachable / ISO missing weights) 
- drill report archived; customer internal owner signs

### Similar pitfalls

- offline environment cert rotation not automated → half year later cert expires → entire cluster unavailable
- Vault sealed without auto-unseal → engineer must be on-site → offline environment must have HSM auto-unseal
- sneakernet ISO unsigned → tampered mid-way → air-gap supply chain attack
- NTP goes public → offline environment setup drift → time mismatch
- Cloud KMS "temporary" for offline → KMS unreachable → secrets undecryptable

## Action recommendations

1. **Day -7 drill**: in mirrored env run one first boot + 4 classes of pitfall injection; customer internal owner signs ([ADR air-gap-first](../../tech-lead/decisions/fde--air-gap-first-for-regulated-clients.md) §Decision #5) 
2. **PKI must run**: Vault / step-ca / Smallstep; cert auto rotation; TLS handshake works as acceptance
3. **NTP must run**: Chrony / PTP; system time ±50ms; cert NotBefore / NotAfter within window
4. **Secrets must run**: Vault HA + HSM auto-unseal; or SOPS + age + GitOps; sealed=false as acceptance
5. **sneakernet ISO must be signed + listed**: cleared engineer on-site signoff; weights + mirror + cert + PKI key complete + SHA-256 verify
6. **Cosign offline root-of-trust**: HSM signing; Kyverno admission rejects unsigned
7. **DLP redaction egress**: telemetry passes through regex + ML classifier; PII / coordinates / unit numbers data masking
8. **CI must produce STIG-compliant artifact**: otherwise ATO rejection
9. **First boot runbook**: 4 classes of pitfalls + fix steps; customer internal owner training
10. **quarterly drill**: 4 classes of pitfall injection; prevent first boot process from rusting

## Anti-patterns

- **Treating the air-gap as a "subset" of cloud** — assuming that removing internet access from a cloud-native stack is enough leads to missing PKI, NTP, and KMS replacements. The offline environment is a separate stack with its own infrastructure dependencies.

- **Skipping the Day -7 drill** — without a full mirrored-environment rehearsal that injects all four pitfall classes (cert time mismatch, NTP loss, KMS unreachable, ISO missing weights), the first real boot will inevitably trip on at least one of them.

- **Using self-signed TLS certs without a PKI** — individual self-signed certs expire silently after six months with no automated rotation, bringing the entire cluster down. A proper PKI (Vault, step-ca, or Smallstep) with auto-rotation is non-negotiable.

- **Leaving Cloud KMS as the secrets encryption backend** — in an offline environment, Cloud KMS is unreachable, so Vault stays sealed and all secrets become undecryptable. Vault must be configured with HA and HSM auto-unseal or replaced with SOPS + age + GitOps.

- **Shipping an unsigned sneakernet ISO** — an unsigned ISO can be tampered with mid-transit, creating an air-gap supply chain attack vector. Every ISO must be signed, checksummed with SHA-256, and verified by a cleared engineer on-site.

## Related

- [../../tech-lead/decisions/fde--air-gap-first-for-regulated-clients.md](../../tech-lead/decisions/fde--air-gap-first-for-regulated-clients.md) — ADR for air-gap-first approach for regulated clients
- [./gotcha-agents-cli-alpha-instability.md](./gotcha-agents-cli-alpha-instability.md) — Another FDE customer-facing gotcha with version-pinning lessons
- [./gotcha-no-lockfile-supply-chain-risk.md](./gotcha-no-lockfile-supply-chain-risk.md) — Supply chain risk in air-gapped environments
- [../../ai-engineer/platform/orchestrate-agents-with-adk-and-agents-cli.md](../../ai-engineer/platform/orchestrate-agents-with-adk-and-agents-cli.md) — ADK + Agents CLI in FDE air-gapped deployment context
- [../../tech-lead/decisions/fde--two-loop-eval-as-production-gate.md](../../tech-lead/decisions/fde--two-loop-eval-as-production-gate.md) — ADR two-loop eval gate with FDE production deployment patterns
