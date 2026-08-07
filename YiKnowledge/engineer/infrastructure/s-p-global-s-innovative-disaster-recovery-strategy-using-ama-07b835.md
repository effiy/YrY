---
title: "S&P Global's innovative disaster recovery strategy using Amazon FSx for NetApp ONTAP snapshots"
tags: [disaster-recovery, Amazon FSx, NetApp ONTAP, SnapMirror, FlexClone, SQL Server, financial-services]
category: engineer/infrastructure
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/sp-globals-innovative-disaster-recovery-strategy-using-amazon-fsx-for-netapp-ontap-snapshots/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, architect, devops]
benefit: "Learn a two-pronged DR strategy that achieves sub-15-minute read-only failover using FlexClone from SnapMirror snapshots, then transitions to full read-write via SnapMirror reversal."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ./disaster-recovery-drill.md
---

# S&P Global's innovative disaster recovery strategy using Amazon FSx for NetApp ONTAP snapshots

> **As a** infrastructure architect for financial services, **I want to** achieve sub-15-minute disaster recovery failover for SQL Server workloads, **so that** global clients maintain access to critical financial data during regional outages.

## Summary

- S&P Global Market Intelligence needed sub-15-minute RTO for their Capital IQ platform, a global financial data service with strict business continuity requirements.
- The solution uses a two-pronged approach: immediate read-only failover via FlexClone volumes from SnapMirror snapshots (under 2 minutes to create the clone), then full read-write recovery via SnapMirror relationship reversal.
- Architecture: four-node geo-distributed WSFC (Windows Server Failover Cluster) spanning us-east-1 and us-west-2, with Amazon FSx for NetApp ONTAP in each region and SnapMirror replication at 15-minute intervals.
- FlexClone volumes share data blocks with the parent volume, consuming minimal additional storage while providing point-in-time consistency.
- The read-only DR instance is pre-provisioned daily via automation, so failover is a redirect, not a rebuild.

## Core viewpoints

### 1. Two-tier recovery is better than one-tier for RTO

The innovation is separating immediate availability (read-only, sub-15-minute) from full recovery (read-write, longer). The read-only instance serves clients during the transition, so business continuity is maintained even while the full recovery process runs.

### 2. FlexClone decouples DR from replication

FlexClone volumes operate independently of the active SnapMirror relationship. This means the DR environment can serve live read-only traffic without interrupting or interfering with ongoing data replication. SnapMirror continues protecting data while the clone handles client requests.

### 3. Cloud-native does not mean abandoning proven on-premise patterns

S&P Global used the same NetApp ONTAP data management capabilities (SnapMirror, FlexClone) they relied on in their on-premise data centers. The cloud migration (Amazon FSx for NetApp ONTAP) preserved these mature capabilities while adding cloud elasticity.

### 4. Pre-provisioning the DR instance daily is the difference between DR readiness and DR theater

A DR plan that requires provisioning infrastructure during an outage is not a plan; it is a hope. By automating the daily FlexClone refresh, S&P Global ensures the DR instance exists and is within the RPO window before any outage occurs. This converts DR from a reactive process into a standing capability. The DR instance is ready when the outage hits, not created during it.

### 5. The geo-distributed WSFC across two regions is a deliberate architectural bet, not a general pattern

Windows Server Failover Clustering across regions with inter-region latency requires careful quorum configuration and witness placement. This is not a general-purpose pattern; it is a specific solution for SQL Server workloads that cannot be easily migrated to cloud-native databases. The decision to preserve this architecture rather than refactor to Aurora reflects a pragmatic assessment: the migration risk and application refactoring cost outweighed the DR benefit of a cloud-native replacement.

## Key info

- RTO: sub-15-minute read-only failover; FlexClone creation completes in under 2 minutes.
- RPO: 15-minute SnapMirror replication interval; actual RPO varies with production activity.
- Architecture: us-east-1 (primary) to us-west-2 (DR) with VPC peering or Transit Gateway.
- Encryption: data at rest via AWS KMS; data in transit via AES-256-GCM for SnapMirror.
- FlexClone storage efficiency: clones share data blocks with parent volume, minimizing DR storage costs.

## Action recommendations

1. For SQL Server DR on AWS, evaluate Amazon FSx for NetApp ONTAP if your team already has NetApp expertise.
2. Implement the two-tier approach: pre-provision read-only instances daily from the latest SnapMirror snapshot.
3. Use FlexClone for the read-only tier to avoid storage waste and maintain replication independence.
4. Automate the daily FlexClone refresh process to keep the DR instance within the RPO window.

## Anti-patterns

- **Treating read-only DR as the final state.** Do not treat read-only DR as the final state. Full read-write recovery requires SnapMirror reversal and SQL Server failover.

- **This pattern requires NetApp ONTAP expertise.** Teams without it should evaluate alternative DR approaches (e.g., Aurora Global Database, DynamoDB Global Tables).

- **The 15-minute RPO is not suitable for zero-data-loss requirements.** For stricter RPO, consider synchronous replication.

- **Confusing flexClone-based DR with continuous replication.** Do not confuse FlexClone-based DR with continuous replication. FlexClone creates a point-in-time copy from the latest SnapMirror snapshot. The clone is read-only and static; it does not receive ongoing updates. For read-write failover, you must complete SnapMirror reversal, which is a separate step.

- **Skipping the daily automation refresh.** Do not skip the daily automation refresh. A DR instance that is 72 hours stale is outside the RPO and may be rejected by auditors. The automation must run on a schedule, alert on failure, and be verified as part of regular DR testing.

## Related

- ./disaster-recovery-drill.md