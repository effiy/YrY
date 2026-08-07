---
title: 'Unlocking the future of video data: March Networks cloud storage on AWS'
tags: [video-surveillance, Amazon S3, S3 Glacier, hybrid-cloud, tiered-storage, cost-optimization]
category: engineer/infrastructure
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/unlocking-the-future-of-video-data-march-networks-cloud-storage-on-aws/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, architect]
benefit: "Learn a proven hybrid-cloud architecture for petabyte-scale video storage that reduces costs by ~80% compared to on-premise while enabling AI-powered natural-language video search."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ../infrastructure/set-up-a-data-pipeline.md
---

# Unlocking the future of video data: March Networks cloud storage on AWS

> **As a** infrastructure architect for a multi-site enterprise, **I want to** move long-term video retention to the cloud while keeping recent footage locally accessible, **so that** I can eliminate on-premise storage expansion costs and enable centralized AI-driven video search.

## Summary

- Enterprise video surveillance generates petabytes across thousands of distributed locations. On-premise NVRs create fragmented storage, inconsistent retention, and hardware expansion headaches.
- March Networks Cloud Storage on AWS uses a hybrid model: recent footage stays on local NVRs for immediate access; older footage archives to Amazon S3 and S3 Glacier with automatic lifecycle tiering.
- A real-world retail example: 580 cameras, 5,600 TB archived -- cloud storage cost ~$347K/year vs. ~$1.7M/year on-premise, an ~80% reduction.
- Centralized cloud storage enables AI-powered capabilities: Amazon S3 Vectors and Amazon Bedrock power natural-language semantic search across video archives (March Networks AI Smart Search).
- Supporting services: SQS for async messaging, CloudWatch for monitoring, STS for secure auth, PostgreSQL + ElastiCache Redis for metadata.

## Core viewpoints

### 1. Hybrid architecture is the pragmatic migration path

Full cloud migration is not required to realize significant savings. Moving only long-term retention and compliance archives to the cloud while keeping recent footage on-premise delivers most of the cost benefit without disrupting low-latency investigation workflows.

### 2. Tiered storage is the economic engine

S3 Standard for frequently accessed recent video, S3 Standard-IA for less active footage, and S3 Glacier for compliance archives. Lifecycle policies automate transitions based on customer-defined retention rules. The key insight: align storage cost with actual access patterns, not with a flat per-TB rate.

### 3. Cloud centralization unlocks AI capabilities that fragmented on-premise storage cannot

Once video is centralized in S3, it becomes queryable. S3 Vectors enable semantic search across archives. Amazon Bedrock integrates for natural-language queries. This transforms video from a liability (storage cost) into an asset (operational intelligence).

### 4. The cost savings come from eliminating over-provisioning, not just cheaper storage

On-premise NVRs must be provisioned for peak retention needs across all cameras at a site. If one camera needs 90 days of retention and another needs 30, the NVR must handle the max for both. Cloud storage with per-camera retention policies means each camera pays for exactly what it needs. The 80% savings reflects the elimination of this over-provisioning tax, not just the raw per-TB price difference between on-premise and S3.

### 5. S3 Vectors and Bedrock transform video from a cost center to a revenue enabler

The natural-language search capability (e.g., "find all footage of a red truck between 2 PM and 4 PM last Tuesday") is not possible with on-premise NVRs. This capability enables new use cases: loss prevention analytics, customer behavior analysis, and operational efficiency monitoring. The storage cost savings fund the AI investment, and the AI capability justifies the migration beyond cost alone.

## Key info

- 580 cameras, 5,600 TB example: $347K/year cloud vs. $1.7M/year on-premise.
- Key AWS services: S3, S3 Glacier, SQS, SES, CloudWatch, STS, ElastiCache Redis, PostgreSQL.
- Supports multiple deployment models: hybrid (local+cloud) and cloud-primary.
- AI Smart Search uses S3 Vectors + Bedrock for natural-language video retrieval.

## Action recommendations

1. Start with a hybrid model: keep recent footage on existing NVRs, archive older footage to S3 with lifecycle policies to S3 Glacier.
2. Define retention policies upfront to configure S3 lifecycle transitions correctly.
3. Evaluate centralized video analytics (S3 Vectors, Bedrock) as a secondary benefit beyond cost savings.
4. For multi-site deployments, consolidate monitoring with CloudWatch and use SQS for reliable ingestion.

## Anti-patterns

- **Attempting a full cloud cutover immediately.** Do not attempt a full cloud cutover immediately. The hybrid model provides the best cost/performance balance.

- **Storing all video in S3 Standard.** Do not store all video in S3 Standard. Without lifecycle policies, costs will approach on-premise levels.

- **Video latency requirements vary.** For real-time surveillance use cases, keep local NVRs; cloud is for archival and analytics.

- **Archiving all cameras to the same retention tier.** Do not archive all cameras to the same retention tier. A lobby camera may need 90 days for security; a break room camera may need 7 days. Applying uniform retention to all cameras wastes storage on low-value footage. Define per-camera or per-camera-group retention policies.

- **Configuring s3 Lifecycle policies without understanding retrieval costs.** Do not configure S3 Lifecycle policies without understanding retrieval costs. S3 Glacier Deep Archive has the lowest storage cost but the highest retrieval cost and latency. Footage that may be needed for investigations should use S3 Glacier Flexible Retrieval or S3 Glacier Instant Retrieval, balancing storage savings against the operational need for timely access.

## Related

- ../infrastructure/set-up-a-data-pipeline.md