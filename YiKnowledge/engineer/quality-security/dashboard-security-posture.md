---
title: security posture dashboard
aliases:
- security dashboard
- vulnerability dashboard
- compliance dashboard
- security metrics dashboard
tags:
- dashboard
- security
- vulnerability
- compliance
- supply-chain
- threat
category: engineer/quality-security
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- engineer
- tech-lead
- oncall-sre
- executive
benefit: security posture and vulnerability exposure visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../../tech-lead/risk/risk-assessment.md
- ../../oncall-sre/incident-response/respond-to-an-incident.md
- ../infrastructure/dashboard-dora-metrics.md
- ../SECURITY.md
tacit: false
---

# security posture dashboard

> **As a** tech lead, **I want to** track security posture across all services and dependencies, **so that** vulnerabilities are prioritized and compliance gaps are closed before they become incidents.

> Security posture is a composite of vulnerability management, dependency health, compliance status, threat detection, and incident response readiness. This dashboard provides a single-pane view.

## Summary

- 5 security dimensions: vulnerability management, dependency health, compliance status, threat detection, incident readiness
- CVSS-based severity classification with SLA-driven remediation timelines
- Supply-chain security tracked via SBOM, dependency freshness, and known vulnerability (CVE) monitoring
- Compliance mapped to frameworks: SOC 2, ISO 27001, GDPR, CIS Benchmarks
- Dashboard refreshes daily; vulnerability scan on every CI build; quarterly penetration test

## Core viewpoints

- Security is a leading indicator — vulnerability count today predicts incident probability tomorrow
- Shift-left security: catch vulnerabilities in CI, not in production; every build scans dependencies
- Mean Time to Patch (MTTP) is the security equivalent of DORA MTTR — measure it, improve it
- Zero critical vulnerabilities is not aspirational — it's the minimum bar for production

## Key information

### 5-dimension security overview

```
┌──────────────────────────────────────────────────────────────────┐
│  VULNERABILITY MANAGEMENT       │  DEPENDENCY HEALTH               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Critical:  0           │   │  │  Outdated:   12 (3 crit)│   │
│  │  High:      2 ↓ 1 WoW   │   │  │  SBOM:       Complete   │   │
│  │  Medium:    8           │   │  │  License:    All clear  │   │
│  │  Low:       23          │   │  │  Renewal:    45 days    │   │
│  │  MTTP:      18h (Good)  │   │  │  Score:      92/100    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  COMPLIANCE STATUS              │  THREAT DETECTION               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  SOC 2:     ████ 92%    │   │  │  Alerts/24h:  142       │   │
│  │  ISO 27001: ███▌ 78%    │   │  │  False pos:   12%       │   │
│  │  GDPR:      █████ 98%   │   │  │  MTTD:        4 min     │   │
│  │  CIS:       ███▌ 85%    │   │  │  Open cases:  3        │   │
│  │  Audit:     34 days     │   │  │  Containment: 8 min     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Vulnerability severity and SLA

| Severity | CVSS Score | Examples | Detection SLA | Remediation SLA |
|---|---|---|---|---|
| Critical | 9.0-10.0 | RCE, auth bypass, data exfiltration | < 1 hour | 24 hours |
| High | 7.0-8.9 | SQL injection, XSS, privilege escalation | < 4 hours | 7 days |
| Medium | 4.0-6.9 | Information disclosure, DoS | < 24 hours | 30 days |
| Low | 0.1-3.9 | Minor config issues | < 7 days | 90 days |

### Dependency health indicators

| Indicator | Measurement | Green | Yellow | Red |
|---|---|---|---|---|
| Critical CVEs | Open critical CVEs in dependencies | 0 | 0 | ≥ 1 |
| High CVEs | Open high CVEs in dependencies | 0 | 1-3 | > 3 |
| Dependency freshness | % deps updated within 6 months | > 90% | 70-90% | < 70% |
| SBOM completeness | % services with generated SBOM | 100% | 95-99% | < 95% |
| License compliance | % deps with approved licenses | 100% | 98-99% | < 98% |
| Supply-chain score | Aggregate OpenSSF Scorecard | > 8 | 6-8 | < 6 |

### Compliance framework mapping

| Framework | Controls total | Compliant | Partial | Gap | Next audit |
|---|---|---|---|---|---|
| SOC 2 | 64 | 59 (92%) | 4 | 1 | 2026-Q3 |
| ISO 27001 | 114 | 89 (78%) | 18 | 7 | 2026-Q4 |
| GDPR | 42 | 41 (98%) | 1 | 0 | 2026-Q3 |
| CIS Benchmarks | 85 | 72 (85%) | 10 | 3 | 2026-Q3 |

### Threat detection metrics

| Metric | Definition | Target | Current |
|---|---|---|---|
| MTTD (Mean Time to Detect) | Time from threat active to alert | < 5 min | 4 min |
| MTTC (Mean Time to Contain) | Time from alert to threat contained | < 15 min | 8 min |
| False positive rate | % alerts that are not real threats | < 10% | 12% |
| Alert-to-triage ratio | Alerts that generate investigation | > 30% | 28% |
| Coverage gap | % attack surface not monitored | < 5% | 3% |

### Security testing cadence

| Test type | Frequency | Owner | Last run | Findings |
|---|---|---|---|---|
| SAST (Static Analysis) | Every CI build | Platform team | Today | 0 critical |
| DAST (Dynamic Analysis) | Weekly | Security team | 3 days ago | 2 medium |
| SCA (Dependency Scan) | Every CI build | Platform team | Today | 3 high |
| Container scan | Every image build | Platform team | Today | 0 critical |
| Secret scanning | Every commit | Pre-commit hook | Continuous | 0 leaked |
| Penetration test | Quarterly | External vendor | 2026-Q2 | 5 findings (all resolved) |
| Red team exercise | Biannual | External vendor | 2026-Q1 | 8 findings (2 open) |

## Action recommendations

1. **Zero critical CVEs**: any critical CVE triggers immediate remediation with 24-hour SLA; page on-call if not resolved
2. **Automate dependency updates**: Dependabot/Renovate with auto-merge for patch versions; weekly review for major/minor
3. **SBOM for every service**: generate SBOM in CI; store in central registry; audit quarterly
4. **Reduce false positives**: tune WAF and IDS rules monthly; target < 10% false positive rate
5. **Close compliance gaps**: prioritize ISO 27001 gaps (78% → 90% target Q4); assign each gap to a specific owner
6. **Quarterly pen test**: schedule external pen test; all critical/high findings must be resolved before next test
7. **Secret scanning everywhere**: pre-commit hooks + CI check + periodic full-repo scan
8. **Incident readiness drill**: quarterly tabletop exercise for security incidents; measure MTTC against target



- Alert fatigue → too many low-quality alerts desensitize the team; tune thresholds, consolidate alerts
- Compliance theater → checking boxes without real security improvement; prioritize risk reduction over audit scores
- Patch-only mindset → patching vulnerabilities without root-cause analysis; ask "why did this CVE reach production?"
- Security as gatekeeper → security team blocks all deployments; shift to security as enabler with automated guardrails
- Ignoring supply chain → focusing only on own code; 80% of vulnerabilities come from dependencies

## Related

- Same class: [dashboard-system-health](../../oncall-sre/observability/dashboard-system-health.md) — system health and availability
- Same class: [dashboard-incident-trends](../../oncall-sre/incident-response/dashboard-incident-trends.md) — incident trends and patterns
- Upstream: [../SECURITY.md](../SECURITY.md) — cross-cutting security content index
- Downstream: [harden-supply-chain](../process/harden-supply-chain.md) — supply-chain hardening guide
- References: OWASP — *Top 10*; OpenSSF — *Scorecard*; NIST — *Cybersecurity Framework*; CIS — *Benchmarks*