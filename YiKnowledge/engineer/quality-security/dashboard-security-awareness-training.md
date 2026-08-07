---
title: security awareness and training dashboard
aliases:
- security training dashboard
- phishing simulation dashboard
- security culture dashboard
- security champions dashboard
- human risk dashboard
tags:
- dashboard
- security-awareness
- security-training
- phishing
- security-culture
- security-champions
- human-risk
- insider-threat
category: engineer/security-supply-chain
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- security-engineer
- tech-lead
- executive
- engineer
benefit: security awareness, training effectiveness, and human risk visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- training completion, phishing simulation, security culture, security champions, human risk scoring, and policy attestation defined
related:
- ./dashboard-security-posture.md
- ./dashboard-threat-detection-response.md
- ./dashboard-cloud-security-posture.md
- ../quality-security/dashboard-identity-access-management.md
- ../quality-security/dashboard-data-protection-privacy.md
tacit: false
---

# security awareness and training dashboard

> **As a** security engineer, **I want to** track security awareness and training effectiveness, **so that** every employee is a human firewall, security culture is measurable and improving, and the human attack surface is as hardened as the technical attack surface — turning security awareness from an annual compliance checkbox into a continuous, measured, and behavior-changing practice.

> People are the last mile of security. This dashboard tracks training completion, phishing simulation, security culture, security champions, human risk scoring, and policy attestation — turning the human element of security from "someone will click the link" into a quantified, managed, and continuously improving defense layer.

## Summary

- 6 security awareness dimensions: training completion, phishing simulation, security culture, security champions, human risk scoring, policy attestation
- 1,250 employees; 85% engineering/technical; 4 security training programs; 12 phishing simulations/year; 28 security champions across 15 teams
- Training completion: 88% overall; 92% engineering; 72% non-technical; 15 employees overdue (> 90 days); 8 new hires missed onboarding training
- Phishing simulation: 12.5% average click rate (target < 8%); 3.2% credential submission rate; 28% reporting rate (target > 50%); 8 departments with > 15% click rate
- Security champions: 28 champions across 15 teams; 5 teams without champion; avg 2.5 hours/week on security; 85% champion satisfaction
- Dashboard reviewed weekly; security culture review with security and HR monthly

## Core viewpoints

- The phishing click rate is the most honest security metric — you can measure firewall rules, patch compliance, and MFA coverage, but nothing tells you more about your real security posture than the percentage of employees who will click a link and enter their password
- Security training is behavior change, not content delivery — completing a 45-minute video module does not mean an employee can spot a phishing email; the measure of training effectiveness is not completion rate, it's whether the click rate goes down after training
- The goal is not zero clicks — if your phishing simulation is so obvious that nobody clicks, you're not testing anything useful; the goal is to decrease click rate over time, increase reporting rate, and decrease the time between click and report
- Security champions are force multipliers — a single security champion embedded in an engineering team is worth 10 security team reminders; they translate security requirements into engineering language, catch issues in code review, and build security culture from within

## Key information

### 6-panel security awareness overview

```
┌──────────────────────────────────────────────────────────────────┐
│  TRAINING COMPLETION                  │  PHISHING SIMULATION                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Overall: 88% (1,100)    │   │  │  Avg click rate: 12.5%  │   │
│  │  Engineering: 92% (782)  │   │  │  Credential submit: 3.2%│   │
│  │  Non-technical: 72% (318)│   │  │  Reporting rate: 28%     │   │
│  │  Overdue: 15 employees   │   │  │  Repeat clickers: 8.5%  │   │
│  │  New hire: 85% (8 missed)│   │  │  Click-to-report: 4.2h  │   │
│  │  Training programs: 4    │   │  │  Depts > 15% click: 8   │   │
│  │  Training score: B (78)  │   │  │  Phishing score: C+(68) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  SECURITY CULTURE                     │  SECURITY CHAMPIONS                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Culture survey: 3.8/5  │   │  │  Champions: 28 active    │   │
│  │  "Security is my job":   │   │  │  Teams covered: 15/20    │   │
│  │  72% agree (target 85%)  │   │  │  Hours/week: 2.5 avg     │   │
│  │  "I can report safely":  │   │  │  Issues found/mo: 45    │   │
│  │  82% agree               │   │  │  Champion satisfaction:  │   │
│  │  Security incidents      │   │  │  85% (target 90%)       │   │
│  │  self-reported: 22/mo    │   │  │  Training for champions: │   │
│  │  Culture score: B (78)   │   │  │  8 hours/quarter        │   │
│  │                           │   │  │  Champion score: B(78)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  HUMAN RISK SCORING                   │  POLICY ATTESTATION                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  High risk: 5% (62 emp)  │   │  │  Policies: 12 active     │   │
│  │  Medium risk: 18% (225)  │   │  │  Attestation: 85%        │   │
│  │  Low risk: 77% (963)     │   │  │  Overdue: 8% (100 emp)   │   │
│  │  Risk factors: phishing  │   │  │  Policy acknowledgment:  │   │
│  │  repeat (8.5%), training │   │  │  92% (target 100%)       │   │
│  │  overdue (15), privilege │   │  │  Policy violations       │   │
│  │  level (admin access)    │   │  │  self-reported: 12/mo    │   │
│  │  Risk score: B (78)      │   │  │  Attestation score: B(78)│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Training completion by program

| Training program | Audience | Enrolled | Completed | Overdue | Avg score | Frequency | Effectiveness |
|---|---|---|---|---|---|---|---|
| **Security Essentials** (annual) | All employees | 1,250 | 88% (1,100) | 15 (> 90 days) | 82% | Annual | Click rate -2.5% after training |
| **Secure Coding** (role-based) | Engineers | 850 | 92% (782) | 8 | 85% | Semi-annual | Vulnerability fixes +15% after training |
| **Data Privacy & GDPR** | Data handlers | 320 | 85% (272) | 12 | 78% | Annual | DSR compliance +8% |
| **Executive Security Briefing** | VP+ | 28 | 95% (27) | 1 | 90% | Quarterly | Budget approval +25% for security |
| **New Hire Onboarding** | New hires | 95 | 85% (81) | 14 (in first 30 days) | 80% | Within 30 days | Phishing resilience +35% vs untrained |
| **Overall** | | **1,250** | **88% (1,100)** | **15** | **82%** | | |

### Training completion by department

| Department | Employees | Completed | Overdue | Avg score | Training hours/employee/yr | Risk level |
|---|---|---|---|---|---|---|
| **Engineering** | 650 | 94% | 5 | 85% | 8.5 | Low |
| **Product** | 85 | 88% | 2 | 82% | 6.0 | Low |
| **Data/AI** | 120 | 90% | 3 | 84% | 7.5 | Low |
| **SRE/Operations** | 85 | 92% | 2 | 88% | 9.0 | Low |
| **Sales** | 95 | 72% | 12 | 68% | 3.5 | High |
| **Marketing** | 55 | 75% | 8 | 72% | 3.0 | High |
| **Customer Success** | 65 | 78% | 5 | 74% | 4.0 | Medium |
| **HR** | 30 | 82% | 2 | 78% | 4.5 | Medium |
| **Finance** | 25 | 85% | 1 | 80% | 5.0 | Medium |
| **Legal** | 15 | 88% | 0 | 82% | 6.0 | Low |
| **Executive** | 25 | 95% | 0 | 88% | 6.5 | Low |
| **Overall** | **1,250** | **88%** | **15** | **82%** | **6.5** | |

### Phishing simulation performance

| Simulation type | Sent to | Clicked | Click rate | Credential submitted | Reported | Reporting rate | Click-to-report time |
|---|---|---|---|---|---|---|---|
| **Credential harvest** (fake login) | 1,250 | 145 | 11.6% | 40 (3.2%) | 310 | 24.8% | 5.5 hours |
| **Malicious attachment** (fake invoice) | 1,250 | 168 | 13.4% | — | 285 | 22.8% | 6.2 hours |
| **Urgency/CEO fraud** | 1,250 | 185 | 14.8% | 28 (2.2%) | 265 | 21.2% | 3.8 hours |
| **Fake IT support** | 1,250 | 132 | 10.6% | 35 (2.8%) | 340 | 27.2% | 4.5 hours |
| **Fake package delivery** | 1,250 | 175 | 14.0% | 22 (1.8%) | 295 | 23.6% | 5.0 hours |
| **Fake social media notification** | 1,250 | 155 | 12.4% | 18 (1.4%) | 320 | 25.6% | 4.2 hours |
| **Overall avg (last 6 sims)** | **1,250** | **160** | **12.5%** | **3.2%** | **350** | **28.0%** | **4.2 hours** |

### Phishing click rate by department (12-month trend)

| Department | Q3 2025 | Q4 2025 | Q1 2026 | Q2 2026 | Trend | Target | Risk |
|---|---|---|---|---|---|---|---|
| **Engineering** | 10.5% | 9.8% | 8.5% | 7.2% | -3.3% | < 5% | Low |
| **Product** | 12.0% | 11.5% | 10.2% | 9.5% | -2.5% | < 8% | Low |
| **Data/AI** | 11.5% | 10.8% | 9.5% | 8.8% | -2.7% | < 8% | Low |
| **SRE/Operations** | 8.5% | 7.8% | 6.5% | 5.5% | -3.0% | < 5% | Low |
| **Sales** | 22.5% | 21.0% | 20.5% | 19.8% | -2.7% | < 12% | High |
| **Marketing** | 20.0% | 19.5% | 18.8% | 18.2% | -1.8% | < 12% | High |
| **Customer Success** | 18.5% | 17.8% | 16.5% | 15.5% | -3.0% | < 12% | Medium |
| **HR** | 16.0% | 15.5% | 14.8% | 14.2% | -1.8% | < 10% | Medium |
| **Finance** | 14.5% | 13.8% | 12.5% | 11.8% | -2.7% | < 8% | Medium |
| **Legal** | 12.0% | 11.5% | 10.5% | 10.0% | -2.0% | < 8% | Low |
| **Executive** | 8.5% | 8.0% | 7.5% | 7.0% | -1.5% | < 5% | Low |
| **Overall** | **15.5%** | **14.5%** | **13.2%** | **12.5%** | **-3.0%** | **< 8%** | |

### Repeat clicker analysis

| Click frequency | Employees | % of total | Avg click rate | Risk level | Intervention |
|---|---|---|---|---|---|
| **Never clicked** (12 months) | 580 | 46.4% | 0% | Very Low | Keep engaged with reporting |
| **Clicked once** | 320 | 25.6% | 8.3% | Low | Targeted training after click |
| **Clicked twice** | 185 | 14.8% | 16.7% | Medium | 1:1 coaching, additional training |
| **Clicked 3-4 times** | 85 | 6.8% | 29.2% | High | Mandatory training, manager escalation, restricted access review |
| **Clicked 5+ times** | 80 | 6.4% | 45.8% | Critical | Individual risk assessment, technical controls (enhanced email filtering, URL rewriting), executive review |
| **Overall** | **1,250** | **100%** | **12.5%** | | |

### Security champions program

| Team | Champion | Hours/week | Issues found/mo | Training attended | Satisfaction | Champion since |
|---|---|---|---|---|---|---|
| **Core Platform** | 2 champions | 3.5 | 8 | 100% | 4.5/5 | 2024-03 |
| **YiVad** | 2 champions | 2.5 | 5 | 100% | 4.0/5 | 2024-06 |
| **YiWeb** | 2 champions | 2.0 | 4 | 85% | 3.8/5 | 2024-09 |
| **YiPet** | 1 champion | 2.0 | 3 | 75% | 3.5/5 | 2025-01 |
| **YiAi** | 2 champions | 3.0 | 6 | 100% | 4.2/5 | 2024-06 |
| **Data Platform** | 2 champions | 2.5 | 5 | 85% | 4.0/5 | 2024-03 |
| **SRE** | 2 champions | 3.0 | 7 | 100% | 4.5/5 | 2024-03 |
| **Mobile** | 1 champion | 1.5 | 2 | 65% | 3.2/5 | 2025-06 |
| **Internal Tools** | 1 champion | 1.0 | 1 | 50% | 2.8/5 | 2025-08 |
| **Security Team** | 3 champions | 5.0 | 12 | 100% | 4.8/5 | 2024-01 |
| **Other (6 teams)** | 10 champions | 2.0 | 8 | 72% | 3.6/5 | Various |
| **Teams without champion** | 5 teams | 0 | 0 | N/A | N/A | N/A |
| **Overall** | **28** | **2.5** | **45** | **85%** | **4.0/5** | |

### Human risk scoring model

| Risk factor | Weight | Data source | Scoring method | High-risk threshold |
|---|---|---|---|---|
| **Phishing click rate** | 30% | Phishing simulation platform | Clicks in last 4 simulations | > 50% click rate |
| **Training completion** | 20% | LMS | Completion status, overdue | > 90 days overdue |
| **Training score** | 10% | LMS | Assessment scores | < 60% avg score |
| **Privilege level** | 25% | IAM/HR systems | Admin access, sensitive data access, production access | Full admin + production access |
| **Policy violations** | 10% | GRC platform | Self-reported + detected violations | > 2 violations in 12 months |
| **Security incident involvement** | 5% | Incident management | Caused or contributed to incident | Caused > 1 incident in 12 months |
| **Overall risk scoring** | **100%** | | Weighted composite | Score > 70/100 |

### Human risk distribution

| Risk tier | Employees | % of total | Privileged access | Avg phishing click | Training overdue | Intervention |
|---|---|---|---|---|---|---|
| **Critical** (score > 85) | 18 | 1.4% | 15 (83%) | 65% | 8 (44%) | Immediate: revoke admin access, mandatory 1:1 coaching, weekly phishing tests |
| **High** (score 70-85) | 44 | 3.5% | 28 (64%) | 42% | 5 (11%) | Enhanced training, monthly phishing tests, restricted access review |
| **Medium** (score 40-70) | 225 | 18.0% | 85 (38%) | 18% | 2 (1%) | Targeted training, quarterly phishing tests, awareness nudges |
| **Low** (score < 40) | 963 | 77.0% | 195 (20%) | 5% | 0 | Standard training, semi-annual phishing tests, positive reinforcement |
| **Overall** | **1,250** | **100%** | **323 (26%)** | **12.5%** | **15 (1.2%)** | |

### Policy attestation status

| Policy | Last updated | Employees covered | Attested | Overdue | Expiring (< 30 days) | Attestation frequency |
|---|---|---|---|---|---|---|
| **Acceptable Use Policy** | 2026-06 | 1,250 | 92% (1,150) | 8% (100) | 5% (62) | Annual |
| **Data Classification & Handling** | 2026-03 | 850 | 88% (748) | 12% (102) | 8% (68) | Annual |
| **Password & Authentication** | 2026-05 | 1,250 | 94% (1,175) | 6% (75) | 3% (38) | Annual |
| **Incident Reporting** | 2026-04 | 1,250 | 90% (1,125) | 10% (125) | 6% (75) | Annual |
| **Remote Work Security** | 2026-02 | 950 | 85% (808) | 15% (142) | 10% (95) | Annual |
| **Third-Party Access** | 2026-05 | 320 | 82% (262) | 18% (58) | 12% (38) | Semi-annual |
| **AI/LLM Usage Policy** | 2026-07 | 850 | 78% (663) | 22% (187) | 18% (153) | Semi-annual |
| **Code of Conduct** | 2026-01 | 1,250 | 95% (1,188) | 5% (62) | 2% (25) | Annual |
| **Overall** | | | **85%** | **8% (100)** | **5% (62)** | |

## Action recommendations

1. **Phishing click rate reduction**: 12.5% click rate, target < 8%; implement just-in-time training after clicks, increase simulation frequency for high-risk departments, add phishing reporting button to email client, target 8% within 2 quarters
2. **Reporting rate improvement**: 28% reporting rate far below 50% target; gamify reporting (leaderboard, recognition), reduce friction to report (one-click PhishAlarm button), add positive reinforcement for reporters
3. **Sales and Marketing training gap**: 72% and 75% completion, 19.8% and 18.2% click rates; create role-specific training for non-technical teams, assign dedicated champion, add monthly micro-training (5 min)
4. **Repeat clicker intervention**: 165 employees clicked 3+ times; implement mandatory 1:1 coaching, enhanced technical controls for repeat clickers (URL rewriting, attachment sandboxing), add progressive consequences
5. **Security champion expansion**: 5 teams without champion, 5 champions with < 2 hrs/week; recruit champions for all teams, increase champion time allocation to 4 hrs/week, add champion career ladder credit
6. **New hire onboarding gap**: 8 new hires missed security training in first 30 days; automate new hire security enrollment, block system access until training complete, add security buddy program
7. **AI/LLM policy attestation**: 22% overdue on new AI/LLM policy; send targeted reminders, add attestation to OKR review, implement just-in-time attestation before AI tool access
8. **Human risk scoring automation**: currently manual quarterly review; automate human risk scoring with real-time data, trigger automated interventions at risk thresholds, integrate with access review process
9. **Security culture survey**: 3.8/5 culture score, 72% "security is my job"; add quarterly security culture pulse survey, track "security is my job" metric, correlate culture score with phishing click rate
10. **Weekly security awareness review**: review training completion, phishing simulation results, security culture, champion health, human risk scoring, and policy attestation with security and HR



- The annual compliance video → showing a 45-minute security training video once a year and calling it "security awareness"; employees retain < 10% of annual training after 30 days — security awareness is a continuous practice, not an annual event
- The "gotcha" phishing simulation → sending deceptive phishing emails that mimic internal communications (fake bonuses, fake HR actions, fake executive praise) to trick employees; this erodes trust, creates resentment toward security, and teaches employees to fear legitimate communications — simulate realistic threats, not psychological manipulation
- Punishing clickers → publicly shaming, manager escalation, or disciplinary action for employees who click phishing simulations; punishment drives underreporting (employees hide clicks instead of reporting them), creates adversarial relationship with security team, and ignores that anyone can click — the goal is learning, not punishment
- Security champions as ticket-jockeys → assigning champions only grunt work (filling out security questionnaires, chasing policy attestations, running vulnerability scans); champions burn out when they're just another security team resource — the role is about advocacy, peer influence, and embedding security thinking, not ticket volume
- The "security is IT's job" culture → measuring security awareness by training completion rate while ignoring whether employees actually believe security is their responsibility; a 100% training completion rate with 72% "security is my job" agreement means 28% of employees think security is someone else's problem — and those are the 28% who will click the link

## Related

- Same class: [dashboard-security-posture](dashboard-security-posture.md) — security posture
- Same class: [dashboard-threat-detection-response](dashboard-threat-detection-response.md) — threat detection and response
- Same class: [dashboard-cloud-security-posture](dashboard-cloud-security-posture.md) — cloud security posture
- Same class: [dashboard-identity-access-management](../quality-security/dashboard-identity-access-management.md) — identity and access management
- Same class: [dashboard-data-protection-privacy](../quality-security/dashboard-data-protection-privacy.md) — data protection and privacy
- References: NIST — *SP 800-50 Building a Security Awareness Program*; SANS — *Security Awareness Maturity Model*; KnowBe4 — *Phishing Benchmarking Report*; Verizon — *DBIR Human Factor*; ENISA — *Cybersecurity Culture Guidelines*; Google — *Security Culture Research*; Masha Sedova — *The Human Element of Security*