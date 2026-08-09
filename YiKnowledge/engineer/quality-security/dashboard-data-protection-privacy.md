---
title: data protection and privacy dashboard
aliases:
- privacy program dashboard
- data protection dashboard
- DPIA dashboard
- GDPR compliance dashboard
tags:
- dashboard
- privacy
- data-protection
- gdpr
- dpia
- encryption
- data-retention
- dsr
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
- security-engineer
- tech-lead
- executive
benefit: data protection and privacy program health visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- DPIA, DSR, encryption, data retention, privacy-by-design, and cross-border transfer defined
related:
- ./dashboard-security-posture.md
- ./dashboard-compliance-readiness.md
- ./dashboard-identity-access-management.md
- ../../oncall-sre/observability/dashboard-certificate-secret-management.md
- ../../tech-lead/risk/dashboard-risk-management.md
tacit: false
---

# data protection and privacy dashboard

> **As a** security engineer, **I want to** track data protection and privacy program health, **so that** every data asset is classified, every processing activity is lawful, every data subject request is honored, and privacy is designed in, not bolted on.

> Data protection is not a compliance checkbox — it's a trust contract with users. This dashboard tracks DPIA coverage, data subject request handling, encryption posture, data retention compliance, privacy-by-design adoption, and cross-border transfer governance — turning privacy from a legal obligation into a competitive advantage.

## Summary

- 6 privacy dimensions: DPIA/ROPA, data subject requests, encryption posture, data retention, privacy-by-design, cross-border governance
- 342 processing activities cataloged; 285 have completed DPIAs (83%); 8 high-risk processing activities identified
- 1,250 data subject requests/year (68% access, 22% deletion, 8% rectification, 2% portability); 92% within regulatory SLA
- 18 data stores across 4 jurisdictions (EU, US, CN, SG); 12 classified as containing personal data; 3 with sensitive/special category data
- Encryption at rest: 88% coverage; encryption in transit: 96%; 3 legacy systems with unencrypted personal data
- 45 data retention policies; 78% automated enforcement; 12 data stores with overdue data purging
- Dashboard reviewed monthly; privacy program review quarterly with DPO and legal

## Core viewpoints

- Privacy is not secrecy — it's about giving individuals control over their data; every data subject request is a test of whether your systems actually respect that control
- A DPIA is not a form — it's a risk assessment; if you're filling out DPIAs after launch, you're doing compliance theater, not privacy engineering
- Data retention is the silent compliance risk — data you don't have can't be breached; every terabyte of data past its retention date is a liability, not an asset
- Encryption is necessary but not sufficient — encryption protects data at rest and in transit, but the #1 cause of privacy incidents is access control failure; encryption without least-privilege access is a locked door with the key under the mat

## Key information

### 6-panel privacy overview

```
┌──────────────────────────────────────────────────────────────────┐
│  DPIA & ROPA                       │  DATA SUBJECT REQUESTS             │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Processing: 342 total   │   │  │  DSRs/yr: 1,250         │   │
│  │  DPIAs done: 285 (83%)   │   │  │  Access: 850 (68%)       │   │
│  │  High-risk: 8 (2.3%)     │   │  │  Deletion: 275 (22%)     │   │
│  │  ROPA updated: 92%       │   │  │  Rectification: 100 (8%) │   │
│  │  DPIA quality: B+ (82)   │   │  │  Portability: 25 (2%)    │   │
│  │  Overdue reviews: 18     │   │  │  SLA met: 92%            │   │
│  │  3rd-party DPA: 88%      │   │  │  Avg response: 18 days   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ENCRYPTION POSTURE                │  DATA RETENTION                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Data stores: 18 total   │   │  │  Retention policies: 45  │   │
│  │  At-rest encrypted: 16   │   │  │  Automated: 35 (78%)     │   │
│  │  In-transit: 17 (96%)    │   │  │  Manual: 10 (22%)        │   │
│  │  Legacy unencrypted: 3   │   │  │  Stores compliant: 12/18 │   │
│  │  Key rotation: 82%       │   │  │  Overdue purge: 12 stores│   │
│  │  TLS 1.3: 72% endpoints  │   │  │  Data past retention: 85TB│  │
│  │  HSM usage: 45% of keys  │   │  │  Retention score: C+ (72)│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  PRIVACY-BY-DESIGN                 │  CROSS-BORDER TRANSFER             │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  PbD reviews: 72/yr      │   │  │  Jurisdictions: 4        │   │
│  │  PbD gate pass: 85%      │   │  │  Cross-border flows: 28  │   │
│  │  Data minimization: B+   │   │  │  SCCs in place: 22 (79%) │   │
│  │  Purpose limitation: A-  │   │  │  BCR approved: No        │   │
│  │  Consent mgmt: B (78)    │   │  │  DPIA for transfer: 18   │   │
│  │  Cookie compliance: 88%  │   │  │  Transfer risk: 5 (high) │   │
│  │  PbD maturity: L3.2      │   │  │  Adequacy decision: 3/4  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### DPIA and ROPA health

| Processing category | Activities | DPIAs completed | High-risk | DPIA overdue | ROPA entry | Last reviewed |
|---|---|---|---|---|---|---|
| **Employee data (HR)** | 45 | 42 (93%) | 1 | 3 | 44 (98%) | 2026-07 |
| **Customer analytics** | 68 | 58 (85%) | 2 | 5 | 62 (91%) | 2026-06 |
| **Marketing & consent** | 42 | 38 (90%) | 0 | 2 | 40 (95%) | 2026-07 |
| **Product personalization** | 55 | 45 (82%) | 3 | 4 | 48 (87%) | 2026-05 |
| **AI/ML training data** | 38 | 28 (74%) | 2 | 8 | 30 (79%) | 2026-04 |
| **Payment & billing** | 22 | 22 (100%) | 0 | 0 | 22 (100%) | 2026-08 |
| **Security monitoring** | 18 | 16 (89%) | 0 | 1 | 17 (94%) | 2026-07 |
| **3rd-party data sharing** | 32 | 24 (75%) | 0 | 3 | 28 (88%) | 2026-05 |
| **Biometric/health data** | 5 | 5 (100%) | 3 | 0 | 5 (100%) | 2026-08 |
| **Location/geolocation** | 12 | 7 (58%) | 0 | 4 | 9 (75%) | 2026-03 |
| **Total** | **342** | **285 (83%)** | **8** | **30** | **305 (89%)** | |

### High-risk processing activities

| Activity | Risk level | DPIA status | Risk factors | Mitigation | DPO sign-off |
|---|---|---|---|---|---|
| AI model training on customer conversations | Critical | Completed | Large scale, automated decisions, sensitive inferences | Data anonymization, opt-out mechanism, human review | Yes |
| Employee productivity monitoring | Critical | Completed | Systematic monitoring, power imbalance, sensitive data | Transparency notice, data minimization, retention limits | Yes |
| Facial recognition for office access | Critical | Completed | Biometric data, vulnerable individuals | On-device processing, no central storage, explicit consent | Yes |
| Cross-border health data transfer (EU→US) | Critical | Draft | Special category data, inadequate safeguards | SCCs + supplementary measures, pseudonymization | Pending |
| Customer behavior prediction (ML) | High | Completed | Profiling, automated decisions, scale | Explainability, opt-out, fairness audit | Yes |
| Real-time location tracking (mobile app) | High | Draft | Continuous tracking, sensitive location data | Foreground-only, granular consent, 90-day retention | Pending |
| Children's data processing (education) | Critical | Completed | Minor data, parental consent complexity | Age verification, parental consent gateway, limited processing | Yes |
| Dark web monitoring for credentials | High | Completed | Legitimate interest balance, data sensitivity | Hashing before check, notification only, no storage | Yes |

### Data subject request (DSR) pipeline

| Request type | Received (12 mo) | Completed | SLA (days) | Avg response | SLA met | Overdue | Automation |
|---|---|---|---|---|---|---|---|
| **Access** (Art. 15) | 850 | 810 (95%) | 30 | 16 days | 95% | 40 | 65% auto |
| **Deletion** (Art. 17) | 275 | 252 (92%) | 30 | 22 days | 92% | 23 | 55% auto |
| **Rectification** (Art. 16) | 100 | 95 (95%) | 30 | 14 days | 95% | 5 | 40% auto |
| **Portability** (Art. 20) | 25 | 23 (92%) | 30 | 20 days | 92% | 2 | 30% auto |
| **Objection** (Art. 21) | 18 | 17 (94%) | 30 | 12 days | 94% | 1 | 20% auto |
| **Restriction** (Art. 18) | 8 | 8 (100%) | 30 | 8 days | 100% | 0 | 25% auto |
| **Total** | **1,276** | **1,205 (94%)** | | **18 days** | **94%** | **71** | **58% auto** |

### DSR backlog and aging

| Aging bucket | Count | % | Risk | Action |
|---|---|---|---|---|
| **0-15 days** (within SLA) | 892 | 70% | Low | Normal processing |
| **16-30 days** (approaching SLA) | 255 | 20% | Medium | Prioritize, notify DPO |
| **31-45 days** (overdue) | 58 | 5% | High | Escalate, regulatory risk |
| **46-60 days** (significantly overdue) | 10 | 0.8% | Critical | Immediate escalation, legal review |
| **60+ days** (regulatory breach) | 3 | 0.2% | Severe | Regulatory notification required |
| **Total open** | **1,218** | | | |

### Data store encryption posture

| Data store | Personal data | Classification | At-rest encryption | In-transit | Key rotation | TLS version | Encryption score |
|---|---|---|---|---|---|---|---|
| **Primary RDS (EU)** | Yes | Confidential | AES-256, KMS | TLS 1.3 | 90 days | 1.3 | A (95) |
| **Primary RDS (US)** | Yes | Confidential | AES-256, KMS | TLS 1.3 | 90 days | 1.3 | A (95) |
| **Redshift DW** | Yes | Highly confidential | AES-256, HSM | TLS 1.2 | 180 days | 1.2 | B+ (85) |
| **S3 analytics bucket** | Yes | Confidential | SSE-KMS | TLS 1.3 | 90 days | 1.3 | A (90) |
| **MongoDB Atlas** | Yes | Confidential | AES-256, auto | TLS 1.3 | Auto | 1.3 | A (92) |
| **Elasticsearch** | Yes | Confidential | AES-256 | TLS 1.2 | 180 days | 1.2 | B (80) |
| **Redis cache** | Yes | Internal | None | TLS 1.3 | N/A | 1.3 | C (65) |
| **Legacy MySQL** | Yes | Confidential | None | TLS 1.2 | 365 days | 1.2 | D (45) |
| **Kafka** | Yes | Confidential | AES-256 | TLS 1.3 | 90 days | 1.3 | A (90) |
| **Snowflake** | Yes | Highly confidential | AES-256, auto | TLS 1.3 | Auto | 1.3 | A (95) |
| **Logs (CloudWatch)** | Yes | Internal | AES-256, default | TLS 1.3 | Auto | 1.3 | A (88) |
| **Backup (S3 Glacier)** | Yes | Confidential | SSE-KMS | TLS 1.3 | 90 days | 1.3 | A (92) |
| **Legacy file server** | Yes | Confidential | None | TLS 1.0 | N/A | 1.0 | F (25) |
| **3rd-party CRM** | Yes | Confidential | AES-256 (vendor) | TLS 1.3 | Vendor | 1.3 | B+ (85) |
| **Overall** | | | **88% at-rest** | **96% in-transit** | **82% rotation** | | **B+ (82)** |

### Data retention compliance

| Data category | Retention policy | Max retention | Auto-purge | Compliance | Overdue data | Data store count |
|---|---|---|---|---|---|---|
| **Customer PII** (active) | Account life + 2 years | 7 years | Yes | 85% | 12 TB | 8 |
| **Customer PII** (inactive) | 2 years after last activity | 3 years | Yes | 78% | 18 TB | 6 |
| **Employee HR data** | Employment + 7 years | 10 years | Partial | 82% | 5 TB | 4 |
| **Financial records** | 7 years (statutory) | 10 years | Yes | 92% | 2 TB | 3 |
| **Application logs** | 90 days | 365 days | Yes | 88% | 15 TB | 5 |
| **Analytics events** | 2 years | 3 years | Partial | 72% | 22 TB | 3 |
| **Backup data** | 90 days (rolling) | 365 days | Yes | 90% | 8 TB | 4 |
| **Biometric data** | 30 days after use | 90 days | Yes | 95% | 0.5 TB | 2 |
| **Audio recordings** | 90 days | 180 days | No | 45% | 3 TB | 2 |
| **Total** | | | | **78%** | **85 TB** | **37** |

### Data retention — overdue purge detail

| Data store | Category | Data past retention | Overdue by | Risk | Blocker | Action |
|---|---|---|---|---|---|---|
| Analytics events (S3) | Analytics events | 22 TB | 18 months | High | No automated lifecycle policy | Implement S3 lifecycle rules |
| Application logs (Elasticsearch) | Application logs | 15 TB | 12 months | Medium | ILM policy misconfigured | Fix ILM policy, force merge |
| Customer PII inactive (RDS) | Customer PII | 12 TB | 24 months | Critical | Business retention override | Legal review, data minimization |
| Backup data (S3 Glacier) | Backups | 8 TB | 8 months | Medium | Manual cleanup process | Automate backup lifecycle |
| Application logs (CloudWatch) | Application logs | 5 TB | 6 months | Low | Log group retention not set | Set retention on all log groups |
| Employee HR data (file server) | HR data | 5 TB | 12 months | High | Legacy system, no automation | Migrate to modern HRIS, set policies |
| Audio recordings (S3) | Audio recordings | 3 TB | 15 months | High | Manual review process | Implement auto-deletion pipeline |
| Financial records (archive) | Financial records | 2 TB | 6 months | Low | Archival process delay | Automate archival verification |

### Privacy-by-design (PbD) maturity

| PbD principle | Maturity | Score | Evidence | Gap |
|---|---|---|---|---|
| **Proactive not reactive** | L3 (Defined) | 78/100 | PbD review gate in 72% of projects | 28% of projects skip PbD gate |
| **Privacy as default** | L3 (Defined) | 82/100 | Default minimum data collection, opt-in for marketing | Some legacy features default to opt-out |
| **Privacy embedded into design** | L2 (Managed) | 72/100 | Privacy requirements in PRD template | Privacy not in all engineering design reviews |
| **Full functionality (positive-sum)** | L3 (Defined) | 80/100 | PbD reviews don't block features | Some teams see privacy as blocker |
| **End-to-end security** | L3 (Defined) | 85/100 | Encryption, access control, monitoring | 3 legacy systems with gaps |
| **Visibility and transparency** | L3 (Defined) | 78/100 | Privacy notice, consent dashboard | Notice language too legalistic |
| **Respect for user privacy** | L3 (Defined) | 80/100 | DSR automation, consent management | DSR automation at 58% |
| **Overall PbD maturity** | **L3.2** | **79/100** | | |

### Consent management

| Consent type | Active consents | Valid consent rate | Consent refresh | Withdrawal rate | Dark pattern risk |
|---|---|---|---|---|---|
| **Marketing email** | 125,000 | 88% | 24 months | 3.2% | Low |
| **Marketing push** | 85,000 | 82% | 12 months | 4.5% | Low |
| **Analytics cookies** | 280,000 | 78% | 12 months | 2.8% | Medium — pre-ticked in 3 regions |
| **Advertising cookies** | 180,000 | 72% | 12 months | 8.5% | Medium — reject button harder to find |
| **Personalization** | 220,000 | 85% | 24 months | 2.2% | Low |
| **3rd-party data sharing** | 95,000 | 68% | 12 months | 5.8% | Low |
| **Biometric data** | 1,200 | 98% | 6 months | 1.5% | Low |
| **Location data** | 65,000 | 75% | 12 months | 6.2% | Low |
| **Overall** | **1,051,200** | **80%** | | **4.3%** | |

### Cross-border data transfer governance

| Transfer flow | Jurisdictions | Data categories | Transfer mechanism | Safeguard adequacy | DPA in place | Risk |
|---|---|---|---|---|---|---|
| EU customer → US processing | EU → US | Customer PII, behavior | SCCs + supplementary measures | Adequate (under DPF) | Yes | Medium |
| EU employee → US HR | EU → US | Employee HR data | SCCs | Needs supplementary measures | Yes | **High** |
| US customer → SG analytics | US → SG | Analytics events | SCCs | Adequate | Yes | Low |
| CN user → CN processing | CN → CN | All user data | Localized (no transfer) | Full (data localization) | N/A | Low |
| EU → US (AI training) | EU → US | Anonymized training data | Adequacy decision (DPF) | Adequate | N/A | Low |
| SG → US (backup) | SG → US | Encrypted backups | SCCs | Adequate | Yes | Low |
| EU → US (3rd-party CRM) | EU → US | Customer PII | SCCs + DPA | Adequate | Yes | Medium |
| CN → SG (analytics) | CN → SG | Aggregated analytics | CAC security assessment | Pending | Draft | **Critical** |
| EU → US (health data) | EU → US | Special category data | SCCs + supplementary | Inadequate | Draft | **Critical** |
| Overall | | | | | | |

### Privacy incident tracking

| Incident type | 12-month count | Reportable | Regulatory notified | Avg detection | Root cause | Trend |
|---|---|---|---|---|---|---|
| **Unauthorized access** (internal) | 8 | 2 | 2 | 48 hours | Access control failure | → |
| **Unauthorized access** (external) | 3 | 1 | 1 | 72 hours | Credential compromise | ↓ |
| **Accidental data exposure** | 12 | 5 | 5 | 24 hours | Misconfiguration | ↑ |
| **Data breach** (3rd-party) | 4 | 3 | 3 | 7 days | Vendor incident | ↑ |
| **DSR non-compliance** | 5 | 2 | 2 | 15 days | Process failure | → |
| **Data retention violation** | 8 | 3 | 1 | 45 days | No auto-purge | ↑ |
| **Cross-border violation** | 2 | 2 | 1 | 30 days | Transfer without safeguards | → |
| **Total** | **42** | **18** | **15** | | | |

## Action recommendations

1. **Legacy system encryption**: 3 systems with no encryption at rest (Redis cache, legacy MySQL, legacy file server); prioritize encryption for legacy MySQL (highly confidential data), migrate legacy file server
2. **AI/ML DPIA gap**: 74% completion, 8 overdue; AI training data processing is high-risk — complete all DPIAs within 30 days, engage DPO for high-risk AI use cases
3. **Data retention automation**: 85 TB data past retention, 12 stores overdue; implement automated lifecycle policies across all data stores, target 95% auto-purge by Q4 2026
4. **Cross-border health data transfer**: Critical risk — EU→US health data without adequate safeguards; suspend transfer until SCCs + supplementary measures finalized, DPO sign-off required
5. **DSR automation**: 58% auto, 71 overdue requests; invest in DSR automation to reach 80%, reduce average response from 18 to 10 days
6. **Cookie consent dark patterns**: Medium risk in 2 categories; redesign cookie banner for equal reject/accept prominence, audit for GDPR/EDPB guidelines compliance
7. **CN→SG analytics transfer**: Critical — CAC security assessment pending; complete assessment before transfer, implement data localization if assessment fails
8. **Consent refresh for advertising**: 72% valid consent, 8.5% withdrawal rate; implement 6-month consent refresh for advertising cookies, improve transparency
9. **PbD gate compliance**: 72% of projects pass PbD gate; make PbD gate mandatory for all projects with personal data, add to Definition of Done
10. **Monthly privacy review**: review DPIA completion, DSR SLA, encryption posture, retention compliance, and cross-border transfer risk with DPO and security team



- DPIA as a post-launch form → filling out the DPIA after the feature is live because "legal said we need one"; a DPIA done after launch is an incident report, not a risk assessment
- Retention as "keep everything forever" → "storage is cheap, we might need it someday"; data you don't have can't be breached — every byte past retention is a liability
- Consent as a liability shield → collecting consent to justify processing that users don't want; consent is not a waiver — it's a choice, and must be freely given
- Privacy as legal's job → "legal handles privacy compliance"; privacy is an engineering discipline — if engineers don't build it, legal can't enforce it
- Anonymization theater → calling data "anonymized" after removing names but leaving purchase history, location, and behavioral data; re-identification is easier than you think — use differential privacy or don't call it anonymous

## Related

- Same class: [dashboard-security-posture](dashboard-security-posture.md) — security posture and compliance
- Same class: [dashboard-compliance-readiness](dashboard-compliance-readiness.md) — compliance and audit readiness
- Same class: [dashboard-identity-access-management](dashboard-identity-access-management.md) — identity and access management
- Same class: [dashboard-certificate-secret-management](../../oncall-sre/observability/dashboard-certificate-secret-management.md) — certificate and secret management
- Same class: [dashboard-risk-management](../../tech-lead/risk/dashboard-risk-management.md) — risk management
- References: GDPR — *EU General Data Protection Regulation*; EDPB — *Guidelines on Data Protection Impact Assessment*; NIST — *Privacy Framework v1.0*; ISO 27701 — *Privacy Information Management*; IAPP — *Privacy Program Management*; CNIL — *Data Protection Impact Assessment Methodology*