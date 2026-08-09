---
title: threat detection and response dashboard
aliases:
- threat detection dashboard
- security operations dashboard
- SOC dashboard
- incident response dashboard
- threat hunting dashboard
tags:
- dashboard
- threat-detection
- security-operations
- incident-response
- threat-hunting
- soc
- siem
- detection-engineering
category: engineer/security-supply-chain
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- security-engineer
- oncall-sre
- tech-lead
benefit: threat detection coverage, investigation velocity, and security operations effectiveness visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- detection coverage, alert fidelity, investigation velocity, containment time, threat hunting, and SOC effectiveness defined
related:
- ./dashboard-dependency-management.md
- ../quality-security/dashboard-security-posture.md
- ../quality-security/dashboard-vulnerability-management.md
- ../quality-security/dashboard-api-security.md
- ../../oncall-sre/incident-response/dashboard-incident-trends.md
tacit: false
---

# threat detection and response dashboard

> **As a** security engineer, **I want to** track threat detection coverage and response effectiveness, **so that** every threat is detected early, investigated quickly, contained decisively, and learned from systematically — turning security operations from a reactive alert triage into a proactive, intelligence-driven defense capability.

> Threat detection is the immune system of the organization. This dashboard tracks detection coverage, alert fidelity, investigation velocity, containment time, threat hunting, and SOC effectiveness — turning security operations from "too many alerts, not enough time" into a measured, optimized, continuously improving detection and response machine.

## Summary

- 6 threat detection dimensions: detection coverage, alert fidelity, investigation velocity, containment time, threat hunting, SOC effectiveness
- 42 detection rules across MITRE ATT&CK framework; 8 log sources (EDR, CloudTrail, WAF, IdP, DNS, Email, Network, Container); 850K security events/day
- Detection coverage: 72% of MITRE ATT&CK techniques covered (target 85%); 48 detection rules active; 12 rules in testing; 8 gaps identified
- Alert fidelity: 850 alerts/day; 28% true positive rate; 52% false positive; 20% benign/contextual; 12 alerts/day escalated to incidents (1.4% escalation rate)
- Investigation velocity: 18 min avg triage time (target < 10 min); 45 min avg investigation time; 2.5 hours mean time to contain (MTTC)
- Threat hunting: 8 hunts/quarter; 3.5 findings per hunt; 65% hunt coverage of critical assets; 2 new detection rules created per hunt
- Dashboard reviewed weekly; detection engineering sprint biweekly with security engineering

## Core viewpoints

- Detection is a hypothesis, not a configuration — every detection rule is a bet that a specific pattern predicts a specific threat; if you can't articulate the hypothesis, you can't evaluate whether the rule is working
- False positives are the enemy of detection — every false positive consumes 18 minutes of analyst time, erodes trust in the detection system, and increases the chance that a true positive is dismissed as "just another false alarm"
- Mean time to contain (MTTC) is the only metric that matters for incidents — detection without containment is observation without action; the goal is not to detect everything, it's to contain everything that matters before damage occurs
- Threat hunting is not incident response — hunting is proactive, hypothesis-driven exploration of the environment looking for unknown threats; if your "hunters" are just triaging alerts, you don't have a hunting program

## Key information

### 6-panel threat detection overview

```
┌──────────────────────────────────────────────────────────────────┐
│  DETECTION COVERAGE                 │  ALERT FIDELITY                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  MITRE coverage: 72%     │   │  │  Alerts/day: 850         │   │
│  │  Detection rules: 48     │   │  │  True positive: 28% (238)│   │
│  │  Rules in testing: 12    │   │  │  False positive: 52% (442)│  │
│  │  Coverage gaps: 8        │   │  │  Benign/contextual: 20%  │   │
│  │  Log sources: 8/10       │   │  │  Escalation rate: 1.4%   │   │
│  │  Blind spots: 2          │   │  │  Incidents/day: 12       │   │
│  │  Coverage score: B- (72) │   │  │  Fidelity score: C (65)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  INVESTIGATION VELOCITY             │  CONTAINMENT TIME                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Triage time: 18 min avg │   │  │  MTTC: 2.5 hours avg     │   │
│  │  Investigation: 45 min   │   │  │  P1: 45 min              │   │
│  │  Full IR: 3.2 hours      │   │  │  P2: 2.8 hours           │   │
│  │  Auto-enrichment: 65%    │   │  │  P3: 5.5 hours           │   │
│  │  Playbook coverage: 55%  │   │  │  Auto-containment: 22%   │   │
│  │  Analyst utilization:72% │   │  │  Manual escalation: 78%  │   │
│  │  Velocity score: B (78)  │   │  │  Containment: B- (72)    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  THREAT HUNTING                     │  SOC EFFECTIVENESS                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Hunts/quarter: 8        │   │  │  Analyst count: 6        │   │
│  │  Findings/hunt: 3.5      │   │  │  Alerts/analyst/day: 142 │   │
│  │  Hunt coverage: 65%      │   │  │  Escalation accuracy: 85%│   │
│  │  New rules from hunts: 2 │   │  │  Burnout risk: 28%       │   │
│  │  Hunt ROI: 2.5×          │   │  │  MTTR (detection gap):8d│   │
│  │  Unknown threats found: 5│   │  │  SOC maturity: Level 3  │   │
│  │  Hunting score: B (78)   │   │  │  SOC score: B- (72)      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### MITRE ATT&CK coverage by tactic

| Tactic | Techniques | Covered | % Coverage | Detection rules | Gap priority | Notes |
|---|---|---|---|---|---|---|
| **Initial Access** | 12 | 10 | 83% | 8 | Medium | Missing: supply chain compromise, hardware additions |
| **Execution** | 14 | 11 | 79% | 6 | Medium | Missing: inter-protocol exploitation |
| **Persistence** | 20 | 14 | 70% | 7 | High | Missing: bootkit, firmware persistence |
| **Privilege Escalation** | 14 | 10 | 71% | 5 | High | Missing: token manipulation, boot/logon autostart |
| **Defense Evasion** | 42 | 25 | 60% | 8 | Critical | Missing: 17 techniques including indicator removal |
| **Credential Access** | 17 | 14 | 82% | 5 | Low | Missing: credentials from password stores |
| **Discovery** | 30 | 22 | 73% | 3 | Medium | Missing: network service scanning, system info discovery |
| **Lateral Movement** | 9 | 8 | 89% | 4 | Low | Missing: software deployment tools |
| **Collection** | 17 | 12 | 71% | 3 | Medium | Missing: audio/video capture, clipboard data |
| **Command & Control** | 18 | 13 | 72% | 4 | Medium | Missing: protocol tunneling, ingress tool transfer |
| **Exfiltration** | 9 | 7 | 78% | 3 | Low | Missing: exfil over physical medium |
| **Impact** | 14 | 10 | 71% | 2 | Medium | Missing: data destruction, service stop |
| **Overall** | **216** | **156** | **72%** | **48** | | |

### Detection rule inventory

| Rule ID | Name | Tactic | Severity | Alerts/day | TP rate | FP rate | Status | Last tuned |
|---|---|---|---|---|---|---|---|---|
| **DET-001** | Brute-force login (5+ failures in 5 min) | Credential Access | High | 28 | 35% | 45% | Active | 2026-07-15 |
| **DET-002** | Impossible travel (geo-velocity) | Initial Access | Medium | 12 | 55% | 30% | Active | 2026-07-20 |
| **DET-003** | Privilege escalation (sudo/su) | Privilege Escalation | Critical | 8 | 42% | 38% | Active | 2026-07-10 |
| **DET-004** | Data exfil > 1GB in 1 hour | Exfiltration | Critical | 5 | 60% | 25% | Active | 2026-06-28 |
| **DET-005** | C2 beaconing (periodic DNS) | Command & Control | High | 18 | 28% | 52% | Active | 2026-07-01 |
| **DET-006** | Suspicious process creation | Execution | Medium | 45 | 15% | 65% | **Needs tuning** | 2026-03-15 |
| **DET-007** | WAF SQL injection attempt | Initial Access | High | 120 | 8% | 72% | **Needs tuning** | 2026-02-20 |
| **DET-008** | New admin account created | Persistence | Critical | 3 | 75% | 20% | Active | 2026-07-25 |
| **DET-009** | MFA disabled for user | Defense Evasion | High | 6 | 82% | 12% | Active | 2026-07-28 |
| **DET-010** | Suspicious S3 bucket activity | Collection | Medium | 22 | 30% | 50% | Active | 2026-06-15 |

### Top false positive alert rules

| Rule | Alerts/day | FP rate | FP/day | Analyst hrs/mo wasted | Root cause | Fix |
|---|---|---|---|---|---|---|
| **DET-007: WAF SQL injection** | 120 | 72% | 86 | 52 hrs | WAF blocks legitimate API calls with complex JSON | Add API schema allowlist, suppress for known endpoints |
| **DET-006: Suspicious process** | 45 | 65% | 29 | 18 hrs | CI/CD pipeline creates short-lived processes | Add CI/CD pipeline fingerprint allowlist |
| **DET-005: C2 beaconing** | 18 | 52% | 9 | 6 hrs | Monitoring tools use periodic DNS health checks | Add known monitoring domains to allowlist |
| **DET-012: Port scan detection** | 35 | 58% | 20 | 12 hrs | Vulnerability scanner runs weekly scans | Schedule-based suppression during scan window |
| **DET-018: Unusual login hour** | 25 | 55% | 14 | 8 hrs | Global team, on-call logins at all hours | Per-user baseline instead of global threshold |

### Alert pipeline

| Stage | Incoming/day | Pass rate | Drop/False positive | Time in stage | Notes |
|---|---|---|---|---|---|
| **Raw events** | 850,000 | — | — | — | From 8 log sources |
| **SIEM correlation** | 850,000 | 0.5% | 99.5% dropped | 2s | Correlation engine matches rules |
| **Alert generation** | 4,250 | 20% | 80% deduplicated | 1s | 4,250 correlated events → 850 alerts |
| **Auto-enrichment** | 850 | 65% | 35% not enriched | 30s | GeoIP, threat intel, asset context |
| **Triage** | 850 | 28% | 72% FP/benign | 18 min | Analyst reviews enriched alert |
| **Investigation** | 238 | 20% | 80% resolved as benign | 45 min | Deep dive, evidence collection |
| **Escalation to incident** | 48 | 25% | 75% contained at investigation | 30 min | 12 incidents/day created |
| **Incident response** | 12 | — | — | 2.5 hours | Full IR playbook execution |

### Investigation metrics

| Metric | Current | 3 months ago | Target | Notes |
|---|---|---|---|---|
| **Mean time to triage (MTTT)** | 18 min | 22 min | < 10 min | Time from alert to first analyst review |
| **Mean time to investigate (MTTI)** | 45 min | 52 min | < 30 min | Time from triage to determination |
| **Mean time to contain (MTTC)** | 2.5 hours | 3.2 hours | < 1 hour | Time from determination to containment |
| **Mean time to resolve (MTTR)** | 8.5 hours | 12 hours | < 4 hours | Total time from alert to resolution |
| **Auto-enrichment rate** | 65% | 52% | 90% | % of alerts with automated context enrichment |
| **Playbook coverage** | 55% | 40% | 80% | % of alert types with defined playbook |
| **Analyst utilization** | 72% | 78% | 60-70% | 72% risks burnout; over 70% is unsustainable |
| **Escalation accuracy** | 85% | 80% | 95% | % of escalations that are true incidents |

### Containment actions

| Containment type | % of incidents | Avg time | Automated | Manual | Success rate | Recurrence rate |
|---|---|---|---|---|---|---|
| **Network isolation** (host/VLAN) | 28% | 35 min | 45% | 55% | 98% | 2% |
| **Account suspension** | 22% | 12 min | 70% | 30% | 99% | 1% |
| **Credential rotation** | 18% | 25 min | 55% | 45% | 97% | 3% |
| **WAF rule deployment** | 12% | 15 min | 80% | 20% | 95% | 5% |
| **S3 bucket lockdown** | 8% | 20 min | 60% | 40% | 98% | 2% |
| **DNS sinkhole** | 5% | 10 min | 85% | 15% | 100% | 0% |
| **Kill container/pod** | 5% | 5 min | 90% | 10% | 100% | 0% |
| **Revoke API key** | 2% | 8 min | 75% | 25% | 100% | 0% |

### Threat hunting program

| Hunt | Quarter | Hypothesis | Assets | Duration | Findings | New rules | Severity |
|---|---|---|---|---|---|---|---|
| **Hunt-2026-Q3-01** | 2026-Q3 | C2 via DNS tunneling in production | 42 servers | 5 days | 2 (confirmed DNS tunneling, 3 hosts) | 1 | High |
| **Hunt-2026-Q3-02** | 2026-Q3 | Lateral movement via stolen credentials | All user accounts | 8 days | 5 (2 compromised accounts, 3 misconfigurations) | 2 | Critical |
| **Hunt-2026-Q3-03** | 2026-Q3 | Data exfiltration via cloud storage | S3, GCS buckets | 5 days | 3 (1 public bucket, 2 excessive permissions) | 0 | Medium |
| **Hunt-2026-Q2-04** | 2026-Q2 | Persistence via scheduled tasks/cron | 85 servers | 7 days | 4 (12 unauthorized cron jobs across 4 servers) | 1 | High |
| **Hunt-2026-Q2-05** | 2026-Q2 | Supply chain compromise in npm deps | 42 repos | 10 days | 2 (1 compromised package, 1 typosquatting) | 1 | Critical |
| **Hunt-2026-Q2-06** | 2026-Q2 | Credential dumping via LSASS | Windows servers | 4 days | 5 (2 misconfigured monitoring tools) | 1 | Medium |

### Log source health

| Log source | Events/day | Ingestion lag | Completeness | Parsing success | Retention | Health |
|---|---|---|---|---|---|---|
| **EDR** (CrowdStrike) | 320K | 1.5s | 99.5% | 95% | 90 days | A- (90) |
| **CloudTrail** | 180K | 5 min | 98% | 92% | 365 days | B+ (85) |
| **WAF** (AWS WAF) | 150K | 2s | 99% | 88% | 90 days | B (80) |
| **IdP** (Okta) | 85K | 30s | 99.8% | 96% | 180 days | A- (90) |
| **DNS** (Route 53) | 65K | 3 min | 97% | 82% | 90 days | B- (72) |
| **Email** (M365) | 35K | 5 min | 95% | 85% | 180 days | B- (70) |
| **Network** (VPC Flow) | 12K | 10 min | 94% | 90% | 30 days | C+ (68) |
| **Container** (Falco) | 3K | 2s | 99% | 92% | 30 days | B+ (82) |
| **Endpoint** (missing) | 0 | — | — | — | — | Gap |
| **Database audit** (missing) | 0 | — | — | — | — | Gap |

### SOC team metrics

| Metric | Current | Target | Notes |
|---|---|---|---|
| **Analysts** (Tier 1) | 3 | 4 | Understaffed, 142 alerts/analyst/day |
| **Analysts** (Tier 2) | 2 | 3 | 24 investigations/day per analyst |
| **Analysts** (Tier 3 / Hunter) | 1 | 2 | 1 person doing all hunting |
| **Shift coverage** | 12×5 (business hours) | 24×7 | No nights/weekends coverage |
| **On-call for P1** | Yes (rotation) | Yes | 30 min response SLA, 92% met |
| **Alerts/analyst/day** | 142 | < 80 | Nearly double the manageable threshold |
| **Burnout risk** | 28% | < 15% | 2 of 6 analysts showing signs |
| **Training hours/quarter** | 12 hrs | 40 hrs | Below industry standard |
| **SOC maturity** | Level 3 (Proactive) | Level 4 (Adaptive) | Has playbooks, hunting, metrics; needs automation |

### Security incidents by detection source

| Detection source | Incidents (12mo) | % of total | Avg time to detect | Top incident type |
|---|---|---|---|---|
| **SIEM alert** (automated) | 48 | 42% | 2.5 hours | Credential access (35%) |
| **EDR alert** | 22 | 19% | 1.5 hours | Malware execution (45%) |
| **External notification** (customer, vendor) | 18 | 16% | 48 hours | Data exposure (55%) |
| **Threat hunting** | 12 | 11% | 120 hours | Persistence (40%) |
| **Employee report** | 8 | 7% | 4 hours | Phishing (60%) |
| **Bug bounty** | 5 | 4% | 72 hours | Web app vulnerability (80%) |
| **Penetration test** | 2 | 2% | N/A | Configuration weakness |

## Action recommendations

1. **WAF false positive reduction**: 72% FP rate, 52 analyst hrs/mo wasted; implement API schema allowlist, suppress known endpoints, target FP rate < 30%
2. **Suspicious process rule tuning**: 65% FP rate, 18 hrs/mo wasted; add CI/CD pipeline fingerprinting, create allowlist for known build processes, reduce alerts by 60%
3. **SOC staffing increase**: 142 alerts/analyst/day (target < 80), 28% burnout risk; hire 2 Tier 1 analysts, 1 Tier 3 hunter, target 80 alerts/analyst/day
4. **24×7 coverage implementation**: 12×5 coverage leaves 65% of the week uncovered; implement follow-the-sun or on-call model, target 24×7 Tier 1 coverage
5. **Auto-enrichment expansion**: 65% enrichment rate; add automated threat intel lookup, asset context, user behavior baseline for all alert types, target 90%
6. **Playbook development**: 55% playbook coverage; create playbooks for top 10 alert types, target 80% coverage for alert types generating > 5 alerts/day
7. **Detection rule gap closure**: 8 MITRE ATT&CK gaps, 2 missing log sources; add endpoint (EDR) and database audit logging, create 8 new detection rules
8. **Auto-containment expansion**: 22% auto-containment; implement auto-containment for high-confidence alerts (MFA disabled, new admin account, impossible travel), target 40%
9. **Threat hunting cadence**: 8 hunts/quarter, 65% coverage; increase to 12 hunts/quarter, expand to cover all critical assets, add monthly hunt review
10. **Weekly detection review**: review detection coverage, alert fidelity, investigation velocity, containment time, and SOC health with security engineering



- The alert factory → adding detection rules without tuning existing ones; 48 rules with 52% FP means analysts are drowning in noise — every new rule should be preceded by tuning the noisiest existing rule
- Detection without investigation → generating alerts but not staffing analysts to investigate them; an uninvestigated alert is worse than no alert — it creates a false sense of security
- The "we'll detect it in the SIEM" assumption → assuming the SIEM will catch everything if you just feed it enough logs; detection requires hypotheses, rules, and tuning — not just data ingestion
- Threat hunting as alert triage → rebranding Tier 2 analysts as "threat hunters" without giving them time to actually hunt; hunting requires dedicated time, not just the gaps between alerts
- MTTC theater → optimizing containment time by broadly isolating hosts for low-severity alerts; fast containment that breaks production is not good containment — it's self-inflicted DOS

## Related

- Same class: [dashboard-dependency-management](dashboard-dependency-management.md) — dependency management
- Same class: [dashboard-security-posture](../quality-security/dashboard-security-posture.md) — security posture
- Same class: [dashboard-vulnerability-management](../quality-security/dashboard-vulnerability-management.md) — vulnerability management
- Same class: [dashboard-api-security](../quality-security/dashboard-api-security.md) — API security
- Same class: [dashboard-incident-trends](../../oncall-sre/incident-response/dashboard-incident-trends.md) — incident trends
- References: MITRE — *ATT&CK Framework*; NIST — *Computer Security Incident Handling Guide (SP 800-61)*; SANS — *Incident Response Process*; AWS — *Security Incident Response Guide*; Mandiant — *Threat Detection Engineering*; David Bianco — *The Pyramid of Pain*; SOC-CMM — *SOC Maturity Model*