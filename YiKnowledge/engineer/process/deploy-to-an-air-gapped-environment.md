---
title: Deploy to an air gapped environment
aliases: [i-want-to-deploy-to-an-air-gapped-environment, air-gap, tactical-edge, air-gapped, k3s, ollama, vllm, iron-bank, harbor, cosign, distroless, data-diode, cds]
tags: [journey, methodology, air-gap, tactical-edge, k3s, ollama, vllm, iron-bank, harbor, cosign, distroless, data-diode, cds, pki, vault, chrony]
category: engineer/process
created: 2026-08-05
updated: 2026-08-05
last_verified: 2026-08-07
source: internal
type: journey
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "Systems deploy reliably to air-gapped environments where internet access is unavailable, with offline dependency bundling"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present"
related:
 - ./operate-as-a-forward-deployed-engineer.md
 - ./design-a-minimum-viable-architecture.md
 - ../processes/navigate-compliance-accreditation.md
 - ./harden-supply-chain.md
 - ./prepare-an-edge-compute-strategy.md
 - ./prepare-an-edge-ai-strategy.md
 - ./handle-secrets-and-config.md
 - ../../knowledge-curator/templates/thinking--first-principles.md
 - ../../knowledge-curator/templates/thinking--inversion.md
 - ../../knowledge-curator/templates/thinking--second-order-thinking.md
 - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: "Offline is not a subset of cloud; it is a separate stack. Pre-position everything: weights + package mirror + hardened registry + PKI + secrets + NTP; data flows one-way; store-and-forward; Day 1 no internet is always the first hypothesis"
---

# I want to deploy to an air-gapped environment

> **As an** engineer, **I want to** deploy to an air gapped environment, **so that** launch is safe. 

## Summary

- Offline = a separate stack; not a subset of cloud
- Pre-position everything: weights / package mirror / hardened registry / PKI / secrets / NTP
- Edge K8s: K3s / MicroK8s / k0s; not GKE
- Local inference: Ollama / vLLM / llama.cpp / TensorRT-LLM; not cloud-end APIs
- Image hardening: Iron Bank / Harbor / Cosign / distroless / chainguard
- Data flow: One-Way Data Diode / CDS / Manifest-Based Sync / DLP redaction
- Failure patterns: Clock Drift / Cert Rotation / Secrets Management / First Boot
- Distinction from edge-compute: this file focuses on offline + isolated + compliance
- Publicly accessible; regular review
- First principles / inversion / second-order / Occam's razor

## Scenario description

Offline is not a subset of cloud; it is a separate stack. This entry provides the full air-gap path, covering pre-positioned weights + package mirror + hardened registry + PKI + secrets + NTP, covering K3s / Ollama / vLLM / Iron Bank / Harbor / Cosign / distroless / data diode / CDS / store-and-forward / Clock Drift / Cert Rotation / First Boot, and linking with operate-as-a-forward-deployed-engineer + design-a-minimum-viable-architecture + navigate-compliance-accreditation + harden-supply-chain + prepare-an-edge-compute-strategy + prepare-an-edge-ai-strategy + handle-secrets-and-config, publicly accessible, regular review, and links to fde-role / mva / compliance / supply-chain / edge-compute / edge-ai / secrets and other leaves. 

## 2-hop reachability path

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | fde-role | [./operate-as-a-forward-deployed-engineer.md](./operate-as-a-forward-deployed-engineer.md) |
| 1 hop | compliance | [../processes/navigate-compliance-accreditation.md](../engineering/navigate-compliance-accreditation.md) |
| 2 hops | supply-chain | [./harden-supply-chain.md](./harden-supply-chain.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |

## Action recommendations

1. **Day 1 hypothesis**: no internet; always the first hypothesis
2. **Pre-positioned weights**: safetensors not pickle; SHA-256 verify; physical media signed-off
3. **License + Provenance**: every weight labeled with source + license + training data proof
4. **Package Mirror**: devpi / bandersnatch (PyPI) + Verdaccio (npm) + apt-mirror (APT) 
5. **CVE Scanning**: Trivy / Grype + offline NVD snapshot
6. **Hardened Registry**: Iron Bank (DoD) + Harbor (private); not Docker Hub / gcr.io
7. **Image Signing**: Cosign + offline root-of-trust; Kyverno / OPA Gatekeeper reject unsigned
8. **Distroless Base**: chainguard/static / distroless; no shell = no pivot
9. **Edge K8s**: K3s / MicroK8s / k0s; not GKE
10. **GDC on Bare Metal**: Google Distributed Cloud in customer's data center
11. **Local inference**: Ollama / vLLM / llama.cpp / TensorRT-LLM; CPU-only also needs support
12. **Store-and-Forward**: Fluent Bit + local WAL; opportunistic forward when network recovers
13. **One-Way Data Diode**: Owl Cyber Defense / Fox-IT; weights in + telemetry out
14. **Cross-Domain Solution**: cross-classification transmission; multi-party approval; discovery call then submit
15. **Manifest-Based Sync**: every artifact signs manifest + manual review + immutable audit log
16. **DLP Redaction**: telemetry egress through DLP (regex + ML classifier); redact PII / coordinates / unit identifiers
17. **Clock Sync**: local Chrony / PTP; not NTP
18. **Cert Rotation**: internal PKI (Vault / step-ca / Smallstep); not Let's Encrypt
19. **Secrets**: Vault HA + HSM auto-unseal; or SOPS + age + GitOps
20. **First Boot**: signed sneakernet ISO; cleared engineer on-site delivery
21. **Not offline but offline**: every component connects to compliance + business measurement
22. **No empty slogans**: every decision labeled with ADR + compliance basis
23. **Versioned**: offline manifests have versions; evolution is traceable
24. **Link with fde-role**: air-gap + FDE co-build
25. **Link with mva**: air-gap + MVA co-build
26. **Link with compliance**: air-gap + ATO / FedRAMP / STIG / CMMC co-build
27. **Link with supply-chain**: air-gap + image hardening co-build
28. **Distinction from edge-compute**: this file focuses on offline + isolation + compliance; the latter covers general edge
29. **Toolchain**: K3s / Ollama / vLLM / Harbor / Cosign / Kyverno / chainguard / Vault / SOPS / Trivy / Grype / Fluent Bit / Chrony
30. **Publicly accessible**: strategy accessible to everyone; not hidden
31. **Regular review**: evolve and update; not one-shot
32. **First principles**: why air-gap is necessary; worst consequence of not doing it (data leak / compliance failure / task failure) 
33. **Inversion**: how much can cloud solve; does compliance allow it?
34. **Second-order thinking**: second-order consequences after air-gap (ops complexity / refresh frequency / troubleshooting) 
35. **Occam**: offline stack the simpler the better; cut redundant components

## Related

- fde-role: [./operate-as-a-forward-deployed-engineer.md](./operate-as-a-forward-deployed-engineer.md) — FDE co-build
- mva: [./design-a-minimum-viable-architecture.md](../architecture-design/design-a-minimum-viable-architecture.md) — minimum viable architecture co-build
- compliance: [../processes/navigate-compliance-accreditation.md](../engineering/navigate-compliance-accreditation.md) — compliance accreditation co-build
- supply-chain: [./harden-supply-chain.md](./harden-supply-chain.md) — supply chain hardening co-build
- edge-compute: [./prepare-an-edge-compute-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-edge-compute-strategy.md) — edge compute complement
- edge-ai: [./prepare-an-edge-ai-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-edge-ai-strategy.md) — edge AI complement
- secrets: [./handle-secrets-and-config.md](../quality-security/handle-secrets-and-config.md) — secrets management co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
