---
title: Do a security audit
aliases:
- I want to do a security audit
- security-audit-journey
- threat-modeling-journey
- security audit entry
tags:
- journeys
- security
- audit
- threat-modeling
- pentest
- compliance
category: oncall-sre/incident-response
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- oncall-sre
- engineer
benefit: review is structured
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../engineer/process/harden-supply-chain.md
- ../../executive/strategy/handle-data-compliance.md
- ../../engineer/quality-security/handle-secrets-and-config.md
- ../../engineer/quality-security/quarterly-security-audit.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to do a security audit

> **As a** oncall sre, **I want to** do a security audit, **so that** review is structured.

> "threat modeling + dependency scanning + pentest + compliance + CVE handling + quarterly audit + retrospective" reachable within 2 hops: process + thinking + patterns + cases.

## Summary

- Process follows [quarterly-security-audit-process.md](../../engineer/quality-security/quarterly-security-audit.md) + [dependency-upgrade-process.md](../../engineer/engineering/dependency-upgrade.md) + [incident-response-process.md](../../engineer/process/incident-response.md)
- Patterns follow [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) + [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md)
- Thinking follows [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md)
- Cases follow [no-lockfile-supply-chain-risk.md](../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) + [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md)

## Core viewpoints

**A security audit is not a compliance checklist; it is an adversarial exercise.**
The most dangerous audits are the ones that produce a clean report because every checkbox was ticked. A real security audit starts from the attacker's perspective: what is the most valuable asset, what is the cheapest path to it, and what would the attacker do after compromising it? The audit must include active threat modeling and penetration testing, not just policy review. If the audit does not find something that makes the team uncomfortable, the audit was not thorough enough.

**The most dangerous vulnerabilities are not the CVE you found but the architectural assumption you never questioned.**
CVE scanning produces a list of known vulnerabilities with known fixes. The real risks are architectural: an internal service that trusts all traffic behind the firewall, a shared credential that gives access to multiple environments, a logging pipeline that captures PII in plaintext. These assumptions are invisible to automated scanners and only surface through adversarial thinking and threat modeling.

**Security debt compounds faster than technical debt.**
Every sprint that ships a feature without a security review adds to the attack surface. Every hardcoded credential, every unvalidated input, every overly permissive IAM policy becomes a liability that grows over time. Unlike technical debt, which primarily affects velocity, security debt directly affects the probability and severity of a breach. The quarterly audit cadence is the minimum acceptable frequency; high-risk systems should be audited monthly.

**The audit is not complete until the findings are triaged and assigned owners with deadlines.**
A security audit report that sits in a shared drive is a security liability. Every finding must be triaged by severity, assigned to an owner, and given a remediation deadline. Findings that cannot be fixed immediately must have documented mitigations (WAF rules, network isolation, monitoring alerts). The audit's value is measured by the percentage of findings that are remediated within the SLA, not by the number of findings.

## Scenario

When doing a security audit / threat modeling / dependency scanning / pentest / compliance check / quarterly security audit, platform + SRE + architect + security owner need to look up process + thinking + patterns + cases. This entry aggregates security-audit-related process + thinking + patterns + cases to a 2-hop path, avoiding "audit as formality / CVEs scanned but not fixed / threat modeling skipped / compliance only checklist / pentest results not retrospective".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [quarterly-security-audit-process.md](../../engineer/quality-security/quarterly-security-audit.md) · [dependency-upgrade-process.md](../../engineer/engineering/dependency-upgrade.md) · [incident-response-process.md](../../engineer/process/incident-response.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [secret-rotation-process.md](./do-a-security-audit.md) |
| `methodology/engineering-patterns/` | [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md) |
| `methodology/thinking/` | [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert to attacker perspective · [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| `methodology/ai-specific/` | [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) — AI security |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) — data security · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) |
| `tech/infra/` | [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) · [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md) · [yiai-llm-phase-{two,three,four,five}-win.md](../../engineer/lessons) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) · [bugs/](../../engineer/lessons) |
| `brd/reference/` | [countries.md](./../../brd/README.md) · [regulations.md](./../../brd/README.md) — cross-border compliance |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — security disclosure |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) — quarterly audit |
| `projects/` | each project `adr-*.md` — security-related ADR; `dev-standards-summary.md` §security |

## Action recommendations

1. **First principles**: first ask "what is the audit protecting / asset inventory / threat model / compliance requirements / risk tolerance"; do not start scanning immediately; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how an attacker would strike (injection / privilege escalation / supply chain / social engineering / credential leak)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Asset inventory**: must list assets first (data / services / credentials / interfaces / third parties) + data flow diagram + trust boundaries; no inventory, no audit.
4. **Threat modeling**: STRIDE / PASTA / attack tree; item by item against assets; do not skip.
5. **Dependency scanning**: SCA / SAST / DAST / IAST / container scan / secret scan; weekly; see [dependency-upgrade-process.md](../../engineer/engineering/dependency-upgrade.md).
6. **CVE handling**: must run [i-want-to-handle-a-dependency-cve.md](../../engineer/quality-security/handle-a-dependency-cve.md); if cannot fix immediately, use mitigation (WAF / network isolation / virtual patch).
7. **Pentest**: internal + external; must write test scope + read writeup + re-test fixes; do not just read the report.
8. **Compliance**: follow [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md) + [regulations.md](./../../brd/README.md); cross-border data follow [countries.md](./../../brd/README.md).
9. **AI security**: must scan [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) + [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md).
10. **Credential management**: follow [i-want-to-handle-secrets-and-config.md](../../engineer/quality-security/handle-secrets-and-config.md) + quarterly rotation.
11. **Second-order effects**: fixing one CVE may introduce breaking changes; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) to evaluate.
12. **Occam**: the simplest mitigation that satisfies risk wins; do not pile up tools for compliance; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
13. **Quarterly audit**: follow [quarterly-security-audit-process.md](../../engineer/quality-security/quarterly-security-audit.md); scan whether threat model / assets / dependencies / credentials are still accurate.
14. **Retrospective**: after audit / pentest / CVE incident, run [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) retrospective + archive under [lessons/failures/bugs/](../../engineer/lessons).
15. **ADR**: security decisions must be captured in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
16. **Disclosure**: on finding high-severity issues must run [i-want-to-handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) to notify stakeholders.

## Anti-patterns

- **Treating the audit as a compliance exercise rather than a security exercise.** When the audit's goal is to pass a certification rather than to find real vulnerabilities, the output is a set of checkboxes that provide a false sense of security. Compliance frameworks define minimum baselines, not security excellence. The audit should go beyond the framework requirements and ask: "what would an actual attacker do?" If the auditor is only checking that policies exist and not testing whether they are effective, the audit is a paperwork exercise.

- **Scanning dependencies but never fixing the findings.** SCA tools produce a CSV of CVEs. If that CSV goes into a backlog that never gets prioritized, the scanning is a waste of compute cycles. The team must have a CVE SLA: critical CVEs fixed within 24 hours, high within 7 days, medium within 30 days. A CVE backlog that grows month over month is a sign that security is not actually valued.

- **Skipping threat modeling because "we do pentesting."** Penetration testing finds implementation bugs in the current version of the system. Threat modeling finds design flaws that pentesting might miss because the tester is looking for injection points, not architectural weaknesses. A threat model asks: "if an attacker compromises this component, what can they reach?" Penetration testing asks: "can an attacker compromise this component?" Both are necessary; neither is a substitute for the other.

- **Running the same audit checklist every quarter without updating it.** The threat landscape changes. New attack vectors emerge (prompt injection, supply chain poisoning, API abuse via LLM agents). The audit checklist must be updated quarterly to reflect the current threat landscape. If the same checklist is used for two consecutive quarters, the team is auditing against last year's threats.

- **Keeping audit findings in a silo.** Security findings that are not shared with the engineering team do not get fixed. The audit report must be presented to the entire engineering team, not just the security team. Every engineer should understand the top 5 risks in the system and why they matter. If the audit is a black box that only security people see, the organization is not learning from it.

## Related

- Same-category journey: [../../engineer/process/harden-supply-chain.md](../../engineer/process/harden-supply-chain.md) — supply chain hardening
- Same-category journey: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — data compliance
- Same-category journey: [../../engineer/quality-security/handle-secrets-and-config.md](../../engineer/quality-security/handle-secrets-and-config.md) — credentials
- Same-category journey: [./respond-to-an-incident.md](./respond-to-an-incident.md) — security incident response
- Upstream: [../../README.md](../../README.md) — processes leaf entry
