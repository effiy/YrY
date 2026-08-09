---
title: Do a threat modeling
aliases: [i-want-to-do-a-threat-modeling, threat-modeling, threat-model, security-threat-modeling]
tags: [journey, methodology, threat-modeling, security, stride, attack-tree, risk-assessment]
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: journey
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers identify and mitigate security threats during design, before they become production vulnerabilities"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
- ../../oncall-sre/incident-response/do-a-security-audit.md
  - ../../oncall-sre/incident-response/handle-a-data-breach.md
  - ../../executive/strategy/handle-data-compliance.md
  - ../../product-manager/frameworks/launch-an-ai-product.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: Threat modeling is not vulnerability scanning; it is the attacker's perspective. STRIDE six threat classes; trust boundary; attack tree; least privilege; defense in depth; linked with code review + penetration testing
---

# I want to do threat modeling

> **As an** engineer, **I want to** do a threat modeling, **so that** outcome is traceable. 

## Summary

- Threat modeling = attacker's perspective; not vulnerability scanning
- STRIDE six classes: spoofing / tampering / repudiation / information disclosure / denial of service / elevation of privilege
- Trust boundary: each boundary must be inspected for threats
- Attack tree: root target → sub-target → attack path
- Least privilege: default deny; not default allow
- Defense in depth: multiple layers; not single point
- Link with code review + penetration testing; not isolated
- Timing: design stage; not retrofit later
- Team co-creation; not one person thinking alone
- Persistent update; architecture evolution must trigger update
- LLM specifics: prompt injection / data leakage / model exfiltration
- First principles / inversion / second-order / Occam's razor

## Scenario description

Threat modeling is a design-stage security drill; it does not replace vulnerability scanning. This entry provides the full threat-modeling path, covering attacker perspective, STRIDE six classes, trust boundary, attack tree, least privilege, defense in depth, links with code review + penetration testing, timing, team co-creation, persistent update, LLM specifics, and links to do-a-security-audit / handle-a-data-breach / handle-secrets-and-config / handle-a-dependency-cve / handle-data-compliance / launch-an-ai-product and other leaves.

## 2-hop reachability path

| Hop | Target | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | security audit | [../../oncall-sre/incident-response/do-a-security-audit.md](../../oncall-sre/incident-response/do-a-security-audit.md) |
| 2 hop | data breach | [../../oncall-sre/incident-response/handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) |
| 2 hop | secret config | [../strategies/handle-secrets-and-config.md](../quality-security/handle-secrets-and-config.md) |
| 2 hop | CVE | [./handle-a-dependency-cve.md](../quality-security/handle-a-dependency-cve.md) |
| 2 hop | data compliance | [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) |
| 2 hop | AI Launch | [../../product-manager/frameworks/launch-an-ai-product.md](../../product-manager/frameworks/launch-an-ai-product.md) |
| 2 hop | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hop | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hop | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hop | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |

## Action recommendations

1. **Attacker perspective**: not the defender's perspective; think with the attacker's mindset
2. **STRIDE six classes**: spoofing / tampering / repudiation / information disclosure / denial of service / elevation of privilege
3. **Trust boundary**: each trust boundary must be inspected for threats; not just internal
4. **Attack tree**: root target → sub-target → attack path; no attack path leakage
5. **Least privilege**: default deny; not default allow; authorize as needed
6. **Defense in depth**: multiple layers; not single point; one layer broken does not mean full compromise
7. **Link with code review**: threat-driven code review; not isolated
8. **Link with penetration testing**: threat modeling → penetration test validation; not replacement
9. **Timing**: design stage; not retrofit; architecture changes must trigger update
10. **Team co-creation**: engineers + security + product co-create; not one person thinking alone
11. **Persistent update**: architecture evolution must trigger update; not one-shot
12. **Data flow diagram**: draw data flow + trust boundary; no vagueness
13. **Threat list**: each threat must be tagged with probability / impact / mitigation / owner
14. **Mitigation priority**: sort by probability × impact; mitigate high-priority first
15. **LLM specifics**: prompt injection / data leakage / model exfiltration / jailbreak / harmful output
16. **First principles**: why threat modeling is necessary; worst consequence of not doing it
17. **Inversion**: how much can be solved with vulnerability scanning + WAF alone; if solvable, do not introduce threat modeling
18. **Second-order thinking**: second-order consequences after threat modeling (security awareness / hiring / architecture / compliance)
19. **Occam's razor**: simpler threat modeling is better; cut redundant dimensions

## Related

- security audit: [../../oncall-sre/incident-response/do-a-security-audit.md](../../oncall-sre/incident-response/do-a-security-audit.md) — global audit
- data breach: [../../oncall-sre/incident-response/handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) — information disclosure consequence
- secret config: [../strategies/handle-secrets-and-config.md](../quality-security/handle-secrets-and-config.md) — spoofing protection
- CVE: [./handle-a-dependency-cve.md](../quality-security/handle-a-dependency-cve.md) — third-party tampering
- data compliance: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — regulatory alignment
- AI Launch: [../../product-manager/frameworks/launch-an-ai-product.md](../../product-manager/frameworks/launch-an-ai-product.md) — LLM threat modeling
- Thinking frameworks: [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
