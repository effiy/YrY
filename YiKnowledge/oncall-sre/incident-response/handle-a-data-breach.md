---
title: Handle a data breach
aliases: [i-want-to-handle-a-data-breach, handle-a-data-breach, security-incident]
tags: [journey, work, security, breach, incident, compliance, forensic]
category: oncall-sre/incident-response
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: journey
lifecycle: active
status: stable
review_cycle: quarterly
roles: [oncall-sre, engineer]
benefit: "Security incidents follow a rehearsed response playbook, minimizing data exposure and compliance risk"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ./respond-to-an-incident.md
  - ../../engineer/process/handle-outage-communication.md
  - ../../engineer/quality-security/handle-secrets-and-config.md
  - ../../engineer/process/harden-supply-chain.md
  - ../../engineer/quality-security/handle-a-dependency-cve.md
  - ../observability/set-up-observability.md
  - ../../engineer/process/run-a-retrospective.md
  - ../../executive/strategy/handle-data-compliance.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
tacit: Data breach is a trio of compliance + trust + technology; do not secretly fix; must run notification + forensics + retrospective + regulatory reporting
---

# I want to handle a data breach

> **As a** oncall sre, **I want to** handle a data breach, **so that** incident is contained.

## Summary

- Data breach five steps: contain → forensics → notify → fix → retrospective
- Contain: isolate + revoke token + take offline impacted services; do not secretly fix
- Forensics: preserve scene + logs + traffic; do not delete evidence
- Notify: user / regulator / internal / customer; statutory 72h report
- Fix: root cause + systemic patch; not just patching the vulnerability
- Retrospective: postmortem public; same-class vulnerability scan

## Scenario

When a data breach is discovered (database leak / token leak / log accidentally storing sensitive info / third-party leak); mishandling causes trust collapse + regulatory penalties. This entry provides the full path from containment to retrospective, covering forensics, notification, fix, retrospective, regulatory reporting, and links to incident-response / outage-communication / secrets / harden-supply-chain / dependency-cve / observability / retrospective / data-compliance and other leaves.

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | Incident response | [./respond-to-an-incident.md](./respond-to-an-incident.md) |
| 2 hops | Outage communication | [../../engineer/process/handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) |
| 2 hops | Secrets and config | [../../engineer/quality-security/handle-secrets-and-config.md](../../engineer/quality-security/handle-secrets-and-config.md) |
| 2 hops | Supply chain hardening | [../../engineer/process/harden-supply-chain.md](../../engineer/process/harden-supply-chain.md) |
| 2 hops | Dependency CVE | [../../engineer/quality-security/handle-a-dependency-cve.md](../../engineer/quality-security/handle-a-dependency-cve.md) |
| 2 hops | Observability | [../observability/set-up-observability.md](../observability/set-up-observability.md) |
| 2 hops | Retrospective | [../../engineer/process/run-a-retrospective.md](../../engineer/process/run-a-retrospective.md) |
| 2 hops | Data compliance | [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) |
| 2 hops | Inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | Second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | First-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Containment before fix**: isolate + revoke token + take offline impacted services; do not secretly fix
2. **Forensics preserves scene**: logs + traffic + memory snapshots; do not delete evidence
3. **Notification follows statute**: user / regulator / internal / customer; GDPR 72h / local regulations
4. **Do not secretly fix**: secretly fixing causes trust collapse; public notification + public postmortem
5. **Root cause + systemic patch**: not just patching the vulnerability; same-class vulnerability scan + systemic hardening
6. **Revoke + rotate**: revoke leaked token / secret / credential; rotate all related credentials
7. **Third-party notification**: vendor / partner notification; joint response
8. **Customer support**: customer success team aligned; unified talking points + FAQ
9. **Regulatory reporting**: refer to [data-compliance](../../executive/strategy/handle-data-compliance.md); local regulations
10. **Retrospective public**: postmortem public; same-class vulnerability scan results public
11. **Supply chain co-built**: refer to [supply-chain hardening](../../engineer/process/harden-supply-chain.md); prevent poisoning
12. **Secrets and config co-built**: refer to [secrets](../../engineer/quality-security/handle-secrets-and-config.md); least privilege + rotation
13. **Monitoring alerting co-built**: refer to [observability](../observability/set-up-observability.md); exception access alerts
14. **Inversion thinking**: if keeping it not leaked, how much can be solved; if solvable, don't leak
15. **Second-order thinking**: second-order consequences after leak (trust / regulation / user traffic loss); not just short-term output
16. **First principles**: why public is a must; worst consequence of not going public; public cost ÷ benefit

## Related

- Incident response: [./respond-to-an-incident.md](./respond-to-an-incident.md) — general incident process
- Outage communication: [../../engineer/process/handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) — user notification
- Secrets and config: [../../engineer/quality-security/handle-secrets-and-config.md](../../engineer/quality-security/handle-secrets-and-config.md) — credential rotation
- Supply chain hardening: [../../engineer/process/harden-supply-chain.md](../../engineer/process/harden-supply-chain.md) — prevent poisoning
- Dependency CVE: [../../engineer/quality-security/handle-a-dependency-cve.md](../../engineer/quality-security/handle-a-dependency-cve.md) — CVE related
- Observability: [../observability/set-up-observability.md](../observability/set-up-observability.md) — exception alerts
- Retrospective: [../../engineer/process/run-a-retrospective.md](../../engineer/process/run-a-retrospective.md) — postmortem
- Data compliance: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — regulatory reporting
- Thinking frameworks: [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [first-principles](../../knowledge-curator/templates/thinking/first-principles.md)
