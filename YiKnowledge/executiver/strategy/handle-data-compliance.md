---
title: Handle Data Compliance
aliases: [data-compliance, gdpr, privacy, compliance-journey]
tags: [strategy, compliance, data, privacy, journey]
category: executiver/strategy
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [executiver, leader]
benefit: "Establish and maintain ongoing data compliance across PII handling, consent management, and cross-border data flows"
related:
  - ./do-a-data-retention-review.md
  - ./handle-a-regulatory-change.md
  - ./product-strategy-framework.md
  - ../README.md
  - ../INDEX.md
---

# Handle Data Compliance

> **As a** compliance owner, **I want to** establish and maintain data compliance practices, **so that** the organization avoids regulatory penalties and maintains customer trust.

## Trigger condition

This is an **ongoing** journey with quarterly review cadence. Immediate triggers for a full re-assessment:

- New regulation applicable to your data types or jurisdictions
- Data breach or security incident
- New product launch involving personal data collection
- Entry into a new jurisdiction (especially EU, China, or US states with privacy laws)
- Third-party audit or customer due diligence request
- Significant change in data processing (new data type, new processor, new purpose)

## Step-by-step walkthrough

### Step 1: Data inventory — know what you have

Map all data assets:

| Attribute | Example |
|---|---|
| **Data type** | PII, behavioral, financial, health, biometric, location |
| **Source** | User input, API integration, logs, third-party, inferred |
| **Storage location** | Which database, which region, which cloud provider |
| **Processing purpose** | Why was it collected? Is it still needed? |
| **Data subject** | Customer, employee, partner, visitor |
| **Retention period** | How long is it kept? Is there a policy? |
| **Access control** | Who can access it? Is access logged? |

Output: A data inventory spreadsheet or data catalog entry.

### Step 2: Regulatory mapping — know what applies

Map each data type to applicable regulations:

| Regulation | Jurisdiction | Key requirements |
|---|---|---|
| GDPR | EU/EEA | Consent, right to access, right to erasure, DPO, DPIA, 72h breach notification |
| CCPA/CPRA | California | Right to know, right to delete, right to opt-out of sale, data minimization |
| PIPL | China | Consent, data localization, cross-border transfer assessment, personal information protection officer |
| LGPD | Brazil | Similar to GDPR; consent, rights, DPO |
| HIPAA | US (healthcare) | PHI protection, BAAs, minimum necessary standard |
| SOC 2 | Global (voluntary) | Security, availability, confidentiality, processing integrity, privacy |

### Step 3: Gap analysis — know what's missing

For each applicable regulation, assess compliance:

| Requirement | Status | Gap | Priority |
|---|---|---|---|
| Consent management | ✅ Implemented | — | — |
| Data subject access requests (DSAR) | 🔶 Partial | No automated workflow; manual process takes 2 weeks | High |
| Cross-border data transfer safeguards | ❌ Missing | No SCCs in place for EU data | Critical |
| Breach notification process | ✅ Implemented | — | — |

### Step 4: Remediation plan

Prioritize gaps by risk:

```
Risk = Likelihood of enforcement × Impact of penalty
```

Address Critical items within 30 days, High within 90 days, Medium within 180 days.

### Step 5: Operationalize

Build compliance into operations, not as a one-time project:

| Practice | Cadence |
|---|---|
| Data inventory update | Quarterly |
| Regulatory monitoring | Monthly |
| Consent audit | Quarterly |
| Access review | Bi-annual |
| Staff training | Annual |
| Breach drill | Annual |
| DPIA for new processing | Per-change |

## Decision points and branching

| Decision point | Options | Guidance |
|---|---|---|
| Data localization required? | Localize vs. use SCCs vs. stop processing | Localize if regulation requires it; SCCs for GDPR; stop if benefit < compliance cost |
| Consent model | Opt-in vs. opt-out vs. legitimate interest | Opt-in for sensitive data; legitimate interest only if demonstrably necessary |
| Data retention period | Fixed period vs. purpose-based vs. indefinite | Purpose-based: delete when the purpose is fulfilled; never indefinite |
| Third-party processor | Audit vs. rely on certifications vs. don't use | Audit for critical/high-risk processors; certifications (SOC 2, ISO 27001) for standard |

## Key deliverables at each stage

| Stage | Deliverable |
|---|---|
| Data inventory | Data map spreadsheet with all attributes |
| Regulatory mapping | Applicable regulation list with requirements |
| Gap analysis | Prioritized gap report with risk ratings |
| Remediation | Remediation roadmap with owners and deadlines |
| Operationalization | Compliance calendar with recurring tasks |

## Anti-patterns and common pitfalls

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Compliance as a one-time project | Regulations change, data changes, systems change | Build quarterly review cadence; automate monitoring where possible |
| "We don't have EU customers" as defense | GDPR applies to EU residents, not EU customers; similar laws are spreading | Map regulations proactively; don't wait for a violation |
| Over-collecting data "just in case" | Increases compliance surface area and breach risk | Only collect data with a specific, documented purpose |
| Lawyer-only compliance | Lawyers identify gaps but can't implement fixes | Cross-functional team: legal + engineering + product + security |
| Ignoring third-party processors | Your compliance is only as strong as your weakest processor | Vendor assessment checklist; contractual requirements for all processors |

## This product's landing instance

*To be filled in with your current compliance status. Include the applicable regulations, the most recent audit date, the top 3 open gaps, and a link to the data inventory.*