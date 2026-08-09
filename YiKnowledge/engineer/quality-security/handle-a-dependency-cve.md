---
title: Handle a dependency CVE
aliases: [i-want-to-handle-a-dependency-cve, handle-a-dependency-cve, cve-response]
tags: [journey, work, security, cve, dependency, patch, advisory]
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer, tech-lead]
benefit: "Dependency CVEs are triaged and patched systematically, minimizing the window of vulnerability exposure"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - cross-references to related journeys and patterns are present
related:
  - ../process/harden-supply-chain.md
  - ../../oncall-sre/incident-response/respond-to-an-incident.md
  - ../infrastructure/set-up-ci-cd.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../../engineer/quality-security/harden-supply-chain.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: CVE response is not direct upgrade; it is first assessing impact surface + real reachability + patch stability, then gradual rollout; do not rush patches for unreachable CVEs
---

# I want to respond to a dependency CVE

> **As an** engineer, **I want to** handle a dependency cve, **so that** incident is contained. 

## Summary

- CVE response six steps: assess -> reachability -> patch -> gradual rollout -> monitoring -> retrospective
- Assess: CVSS score + real reachability + business impact + alternatives
- Reachability: call path + input source + data flow; if unreachable, do not rush patch
- Patch: upgrade version + run tests + evaluation set gate; do not downgrade to older version
- Gradual rollout: 1% -> 10% -> 50% -> 100%; observe each stage + monitoring trio
- Monitoring: error rate + latency + resource; incident rollback
- Retrospective: patch process sediment + similar CVE prevention

## Scenario

Dependency hits a CVE; security team / regulator / customer inquiry; improper CVE response causes incidents (unstable upgrade patch, reachability misjudgment). This entry provides the full path from assessment to retrospective, covering reachability analysis, patch gradual rollout, monitoring rollback, retrospective sediment, and links to supply-chain hardening, new dependency, incident response, CI/CD, observability, release and other leaves. 

## 2-hop reachability paths

| Hops | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | Supply-chain hardening | [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) |
| 2 hops | New dependency | [./i-want-to-adopt-a-new-dependency.md](adopt-a-new-dependency.md) |
| 2 hops | Incident response | [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) |
| 2 hops | CI/CD | [../tools/set-up-ci-cd.md](../infrastructure/set-up-ci-cd.md) |
| 2 hops | Observability | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hops | Release | [./ship-a-release.md](../infrastructure/ship-a-release.md) |
| 2 hops | Secrets and config | [../strategies/handle-secrets-and-config.md](handle-secrets-and-config.md) |
| 2 hops | Migration | [./roll-out-a-migration.md](../infrastructure/roll-out-a-migration.md) |
| 2 hops | Supply-chain pattern | [../../engineer/quality-security/harden-supply-chain.md](../process/harden-supply-chain.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |

## Action recommendations

1. **CVSS score as reference, not blind follow**: high CVSS does not mean high real risk; look at reachability
2. **Reachability analysis is mandatory**: call path + input source + data flow; if unreachable, do not rush patch
3. **Business impact assessment**: core business impact vs edge feature impact; priority sort
4. **Alternatives**: upgrade / downgrade / replace / self-patch; do not downgrade to older version (older may be worse) 
5. **Patch gradual rollout 4 stages**: 1% -> 10% -> 50% -> 100%; observe each stage + monitoring trio
6. **Test + evaluation set gate**: run full test + evaluation set baseline before patch; block if not passing
7. **Monitoring alerts**: error rate + latency + resource; exception rollback
8. **Do not rush unreachable CVE**: rushing unreachable CVE introduces high incident risk; follow process to assess
9. **Supply-chain hardening up front**: see [supply-chain hardening](../process/harden-supply-chain.md); lockfile + audit + min-release-age + allowlist
10. **CI gate blocks**: dependency upgrade PR goes through CI gate; block if not passing
11. **Incident rollback plan**: prepare rollback for each stage; if patch causes incident, immediately rollback
12. **Retrospective sediment**: patch process + similar CVE prevention; smoother next time
13. **Inversion thinking**: what is the worst consequence of not patching; if can avoid patching, avoid (prevent incidents) 
14. **Second-order thinking**: second-order consequences after patch (compatibility / performance / maintenance); not only short-term output
15. **Occam**: patch the simpler the better; cut redundant operations

## Related

- Supply-chain hardening: [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) — lockfile quartet
- New dependency: [./i-want-to-adopt-a-new-dependency.md](adopt-a-new-dependency.md) — replacement path
- Incident response: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — patch incident
- CI/CD: [../tools/set-up-ci-cd.md](../infrastructure/set-up-ci-cd.md) — CI gate
- Observability: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — monitoring alerts
- Release: [./ship-a-release.md](../infrastructure/ship-a-release.md) — gradual rollout process
- Secrets: [../strategies/handle-secrets-and-config.md](handle-secrets-and-config.md) — secret leak CVE
- Migration: [./roll-out-a-migration.md](../infrastructure/roll-out-a-migration.md) — general migration methodology
- Pattern: [supply-chain-hardening](../process/harden-supply-chain.md)
- Thinking frameworks: [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
