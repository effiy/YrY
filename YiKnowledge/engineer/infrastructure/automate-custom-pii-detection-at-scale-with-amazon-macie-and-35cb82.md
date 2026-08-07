---
title: Automate custom PII detection at scale with Amazon Macie and Step Functions
tags: [PII, Macie, Step Functions, compliance, GDPR, HIPAA, event-driven, custom-identifiers]
category: engineer/infrastructure
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/automate-custom-pii-detection-at-scale-with-amazon-macie-and-step-functions/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, devops, security-engineer]
benefit: "Deploy an event-driven PII detection pipeline that scans files the moment they land in S3, extends Macie with custom identifiers for domain-specific data, and generates audit-ready CSV+JSON reports."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ../quality-security/handle-secrets-and-config.md
---

# Automate custom PII detection at scale with Amazon Macie and Step Functions

> **As a** security engineer in a regulated industry, **I want to** automatically detect PII (including organization-specific identifiers) in every file uploaded to S3, **so that** compliance requirements (GDPR, HIPAA, PCI DSS) are met without manual classification.

## Summary

- Amazon Macie provides managed PII detection, but standard identifiers do not cover domain-specific formats (policy numbers, member IDs, medical record numbers). Custom data identifiers fill this gap.
- The solution uses EventBridge to trigger a Step Functions workflow on every S3 upload. The workflow creates a Macie classification job, polls for completion, generates CSV+JSON reports, and moves files through a three-bucket pipeline (raw -> staged -> scanned).
- Five Step Functions states: TriggerScan (copy to staging, create Macie job), WaitForMacie (60s pause), CheckStatus (poll DescribeClassificationJob), GetFindings (generate reports, SNS notification), MoveFiles (move to scanned bucket, clean staging).
- Custom data identifiers are defined as regex patterns (up to 30 per classification job, 10,000 per account). Production hardening includes SSE-KMS, CloudTrail auditing, and SNS encryption.
- For high-volume workloads, batch multiple objects into a single Macie job to stay within the CreateClassificationJob throttle of 0.1 req/sec.

## Core viewpoints

### 1. Three-bucket pattern provides clear data lineage

The raw bucket receives uploads, the stage bucket holds data during scanning (auto-expires after 7 days), and the scanned bucket stores validated data and reports. This isolation ensures unscanned data never mixes with validated data, which is critical for audit trails.

### 2. Custom identifiers are the key to domain-specific compliance

Macie's built-in identifiers cover standard PII (SSN, credit cards, etc.) but cannot detect organization-specific patterns like `POL-123456` or `MEM-AB123456`. Custom regex identifiers extend Macie to cover these, making the pipeline useful beyond generic PII detection.

### 3. EventBridge triggers are preferred over S3 event notifications

EventBridge provides advanced filtering, support for multiple targets, and cross-account routing. S3 event notifications are simpler but less flexible for multi-account or multi-target scenarios.

### 4. The Step Functions workflow is the audit trail itself

Each state transition (TriggerScan, WaitForMacie, CheckStatus, GetFindings, MoveFiles) is recorded in CloudWatch Logs and Step Functions execution history. For compliance auditors, this means every file can be traced from upload to scanned bucket with exact timestamps and finding counts. The workflow execution history IS the evidence of due diligence -- no separate audit log is needed.

### 5. Custom identifiers require a maintenance lifecycle, not one-time configuration

Regex patterns for PII drift over time as business processes evolve. New policy number formats, member ID schemes, or vendor account numbers emerge. A custom identifier that was accurate six months ago may silently miss new PII formats. Treat custom identifiers as living artifacts: schedule quarterly reviews against recent data samples, and version them so you can track which patterns were active during which time periods.

## Key info

- Architecture: S3 -> EventBridge -> Step Functions -> Macie + Lambda + SNS.
- Three S3 buckets: raw, stage (7-day auto-expire), scanned (reports in CSV+JSON).
- Custom identifiers: regex patterns, max 30 per job, 10,000 per account. Example: `POL-[0-9]{6,10}` for PolicyID.
- Macie job scan duration: 15-20 minutes for typical files. Duration varies by data volume, compression, and identifier count.
- Production hardening: SSE-KMS, CloudTrail data events, cross-account EventBridge, SNS encryption, Macie quota awareness.

## Action recommendations

1. Start by identifying organization-specific PII formats and defining them as custom regex identifiers.
2. Deploy the three-bucket pattern from day one. Retrofitting data lineage is significantly harder.
3. Monitor Macie quotas: batch objects per job for high-volume workloads to stay under the 0.1 req/sec throttle.
4. Enable CloudTrail data events on S3 buckets for complete audit trail.

## Anti-patterns

- **Using a single bucket for all processing states.** Do not use a single bucket for all processing states. Mixing unscanned and validated data breaks audit trails.

- **Ignoring macie quotas.** Do not ignore Macie quotas. The 30-identifier-per-job limit and 0.1 req/sec throttle require planning for high-volume workloads.

- **Skipping the SNS confirmation step.** Do not skip the SNS confirmation step. Notifications will not be delivered until the email contact is confirmed.

- **Creating custom identifiers without a test corpus.** Do not create custom identifiers without a test corpus. A regex that passes syntax validation can produce high false-positive or false-negative rates against real data. Always validate against a representative sample of actual files before deploying to production.

- **Treating macie findings as the final compliance artifact.** Do not treat Macie findings as the final compliance artifact. Macie detects patterns; it cannot determine whether a match is a true PII exposure or a false positive (e.g., synthetic test data). Pair Macie findings with human review or a secondary validation step for high-sensitivity buckets.

## Related

- ../quality-security/handle-secrets-and-config.md