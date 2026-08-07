---
title: Building multi-Region resiliency for AWS CloudFormation custom resource deployment
tags: [CloudFormation, custom-resources, multi-region, DynamoDB, Global Tables, distributed-locking, ARC, failover]
category: engineer/infrastructure
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/building-multi-region-resiliency-for-aws-cloudformation-custom-resource-deployment/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, architect, devops]
benefit: "Extend CloudFormation custom resources to active-active multi-region with zero duplicate execution, using DynamoDB Global Tables for distributed locking and ARC for automated failover."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - engineer/infrastructure/prioritize-your-aws-health-alerts-using-aws-user-notificatio-c5feb7
---

# Building multi-Region resiliency for AWS CloudFormation custom resource deployment

> **As a** platform engineer managing multi-region CloudFormation deployments, **I want to** process custom resource lifecycle events in an active-active configuration across regions, **so that** a regional failure does not block stack operations and duplicate execution does not occur.

## Summary

- CloudFormation custom resources lack native multi-region support: no fan-out, no distributed locking, no automated failover, and idempotency is entirely the developer's responsibility.
- The proposed architecture uses SNS cross-region subscriptions to fan out events simultaneously to SQS queues in both us-east-1 (primary) and us-west-2 (secondary).
- DynamoDB Global Tables provide distributed locking via conditional writes: only one Lambda handler can acquire the lock for a given request. The secondary queue has a delay to give the primary time to process first.
- Amazon Application Recovery Controller (ARC) provides automated failover triggered by CloudWatch alarms on queue depth and Lambda health.
- The architecture maintains idempotency by tracking every request state in DynamoDB, so retries and failover scenarios avoid duplicate side effects.

## Core viewpoints

### 1. Distributed locking is the key to avoiding duplicate execution

The naive multi-region approach (deploy the same Lambda in two regions) creates duplicate processing. DynamoDB Global Tables with conditional writes solve this: only one region can acquire the lock. The secondary handler checks the lock state and skips processing if the primary already handled it.

### 2. The queue delay is the failover window

The secondary SQS queue uses a delay (either SQS Delay Queue or Visibility Timeout). This gives the primary time to process the event. The secondary only takes over if the primary has not completed within the delay window. This is a simple but effective active-active pattern.

### 3. ARC-driven failover removes manual intervention

CloudWatch alarms on SQS queue depth and Lambda execution health trigger ARC to initiate failover to the secondary region. This is fully automated -- no manual decision-making during regional outages.

### 4. The presigned URL response is the hidden single point of failure

CloudFormation custom resources require the handler to call a presigned S3 URL to signal SUCCESS or FAILED. If the primary region fails after processing but before calling this URL, CloudFormation waits for the full timeout (up to 1 hour). The failover handler must be able to reconstruct and call this URL even when the primary never completed -- otherwise the stack operation hangs regardless of successful failover.

### 5. Testing multi-region failover requires production-like chaos, not unit tests

You cannot validate this architecture with mock DynamoDB or single-region deployments. You must induce actual regional failures (or simulate them via network partitions) and observe lock acquisition, queue delay behavior, and ARC failover timing. The gap between "works in dev" and "works under regional outage" is larger than for single-region systems, and the failure modes are different.

## Key info

- Architecture: SNS topic in customer region -> cross-region subscriptions -> SQS queues in us-east-1 and us-west-2 -> Lambda handlers -> DynamoDB Global Table for locking.
- Primary Lambda: immediate processing, conditional write to acquire lock, execute business logic, respond to CloudFormation presigned URL.
- Secondary Lambda: delayed processing, check lock, skip if primary already handled, acquire lock if primary failed.
- CloudFormation generates a presigned response URL that the handler must call to signal SUCCESS or FAILED.
- Full cleanup requires deleting resources across all regions: ARC, SNS, SQS, DynamoDB, Lambda, CloudWatch Log Groups, IAM roles.

## Action recommendations

1. Implement the SNS cross-region fan-out pattern as the first step. This alone enables multi-region event delivery.
2. Use DynamoDB Global Tables with conditional writes for distributed locking. The `attribute_not_exists` condition prevents race conditions.
3. Configure the secondary SQS queue with a delay to give the primary time to process.
4. Add CloudWatch alarms on queue depth and Lambda errors, then wire ARC for automated failover.

## Anti-patterns

- **Deploying the same Lambda handler in multiple regions without a locking mecha....** Do not deploy the same Lambda handler in multiple regions without a locking mechanism. This guarantees duplicate execution.

- **Relying on SQS deduplication alone.** Do not rely on SQS deduplication alone. SQS FIFO deduplication is per-queue, not cross-region.

- **Skipping the secondary queue delay.** Do not skip the secondary queue delay. Without it, both handlers race for the lock, increasing contention and latency.

- **Testing failover by manually invoking the secondary Lambda.** Do not test failover by manually invoking the secondary Lambda. The secondary handler's behavior depends on the queue delay, the lock state in DynamoDB, and the timing of the primary's completion -- all of which are absent in a direct invocation. Manual tests produce false confidence.

- **Hardcoding the primary region.** Do not hardcode the primary region. The architecture should treat both regions as peers; hardcoding "us-east-1 is primary" creates a hidden dependency that blocks failback and makes regional rotation exercises impossible.

## Related

- engineer/infrastructure/prioritize-your-aws-health-alerts-using-aws-user-notificatio-c5feb7