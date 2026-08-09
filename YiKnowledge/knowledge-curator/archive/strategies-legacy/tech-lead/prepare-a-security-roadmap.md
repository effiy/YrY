---
title: I want to build security roadmap / Prepare a security roadmap
aliases: [i-want-to-prepare-a-security-roadmap, security-roadmap, security-strategy-roadmap]
tags: [journey, methodology, security, roadmap, strategy, governance, planning]
category: tech-lead/roadmap
created: 2026-08-03
updated: 2026-08-03
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [tech-lead, engineer]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user story header + 7 fixed-order sections"
related:
  - ../../oncall-sre/incident-response/do-a-security-audit.md
  - ../../engineer/processes/do-a-threat-modeling.md
  - ../../engineer/strategies/prepare-an-iam-strategy.md
  - ../../oncall-sre/incident-response/prepare-an-incident-response-plan.md
  - ../../engineer/process/harden-supply-chain.md
  - ../../engineer/strategies/prepare-a-risk-register.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: security roadmap is not just a list; it is a contract. vision + topic + priority + measurement + cadence; risk-driven; not one-shot; measurable
status: deprecated
---

# I want to build security roadmap

> **As a** tech lead, **I want to** prepare a security roadmap, **so that** launch is safe.

## Summary

- security roadmap = contract; not just a list
- vision + topic + priority + measurement + cadence; no missing dimension
- risk-driven; not by gut feel
- Now / Next / Later; not date-bound
- linked with security audit + threat modeling + IAM + IR + supply chain + risk register
- Publicly discoverable (internal); not hidden
- Regular review; evolve and update
- First principles / inversion / second-order / Occam's razor

## Scenario description

security roadmap is a contract; not just a list. This entry provides the security roadmap full path, covering vision + topic + priority + measurement + cadence, risk-driven not by gut feel, Now / Next / Later not date-bound, linked with security audit + threat modeling + IAM + IR + supply chain + risk register, publicly discoverable, regular review, and links to do-a-security-audit / do-a-threat-modeling / prepare-an-iam-strategy / prepare-an-incident-response-plan / harden-supply-chain / prepare-a-risk-register and other leaves.

## 2-hop reachability path

| Hop | Target | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | security audit | [../../oncall-sre/incident-response/do-a-security-audit.md](../../oncall-sre/incident-response/do-a-security-audit.md) |
| 2 hop | threat modeling | [../../engineer/processes/do-a-threat-modeling.md](../../engineer/processes/do-a-threat-modeling.md) |
| 2 hop | IAM | [../../engineer/strategies/prepare-an-iam-strategy.md](../../engineer/strategies/prepare-an-iam-strategy.md) |
| 2 hop | IR plan | [../../oncall-sre/incident-response/prepare-an-incident-response-plan.md](../../oncall-sre/incident-response/prepare-an-incident-response-plan.md) |
| 2 hop | supply chain | [../../engineer/process/harden-supply-chain.md](../../engineer/process/harden-supply-chain.md) |
| 2 hop | risk register | [../../engineer/strategies/prepare-a-risk-register.md](../../engineer/strategies/prepare-a-risk-register.md) |
| 2 hop | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hop | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hop | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hop | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Five dimensions**: vision + topic + priority + measurement + cadence; no missing dimension
2. **Risk-driven**: rank priority by risk classification; not by gut feel
3. **vision**: zero trust + defense in depth + least privilege + continuous validation; not a slogan
4. **topic**: identity + data + application + infrastructure + supply chain; no vagueness
5. **priority**: RICE / ICE / Risk × impact; not by gut feel
6. **Measurement**: MTTR / attack surface / compliance rate / vulnerability fix time; no vagueness
7. **cadence**: Now / Next / Later; not date-bound
8. **Not one-shot**: persistent review; evolve and update
9. **Not a list**: topic + vision; not just listing tasks
10. **Not a promise**: roadmap is not a promise; no vagueness
11. **Publicly discoverable (internal)**: roadmap-related parties can look it up; not hidden
12. **Link with technology roadmap**: security + technology co-build
13. **Link with security audit**: roadmap + audit co-build
14. **Link with threat modeling**: roadmap + threat co-build
15. **Link with IAM**: roadmap + IAM co-build
16. **Link with IR**: roadmap + response co-build
17. **Link with supply chain**: roadmap + supply chain co-build
18. **Link with risk register**: roadmap + risk co-build
19. **Toolchain**: security dashboard + roadmap tool + risk register
20. **Regular review**: evolve and update; not one-shot
21. **First principles**: why must have a security roadmap; worst consequence of not doing
22. **Inversion**: how much can a list + document solve; if solvable, don't introduce a roadmap
23. **Second-order thinking**: second-order consequences after the roadmap (compliance / trust / cost / organization)
24. **Occam's razor**: roadmap simpler is better; cut redundant steps

## Related

- security audit: [../../oncall-sre/incident-response/do-a-security-audit.md](../../oncall-sre/incident-response/do-a-security-audit.md) — audit co-build
- threat modeling: [../../engineer/processes/do-a-threat-modeling.md](../../engineer/processes/do-a-threat-modeling.md) — threat co-build
- IAM: [../../engineer/strategies/prepare-an-iam-strategy.md](../../engineer/strategies/prepare-an-iam-strategy.md) — IAM co-build
- IR plan: [../../oncall-sre/incident-response/prepare-an-incident-response-plan.md](../../oncall-sre/incident-response/prepare-an-incident-response-plan.md) — response co-build
- supply chain: [../../engineer/process/harden-supply-chain.md](../../engineer/process/harden-supply-chain.md) — supply chain co-build
- risk register: [../../engineer/strategies/prepare-a-risk-register.md](../../engineer/strategies/prepare-a-risk-register.md) — risk co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
