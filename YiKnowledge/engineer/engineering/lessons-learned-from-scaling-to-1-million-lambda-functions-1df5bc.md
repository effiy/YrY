---
title: Lessons learned from scaling to 1 million Lambda functions
tags: [Lambda, serverless, scale-to-zero, SaaS, multi-account, CloudFormation, StackSets, observability, FinOps, mono-repo]
category: engineer/engineering
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/lessons-learned-from-scaling-to-1-million-lambda-functions/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, architect, devops, finops]
benefit: "Real-world lessons from operating 1M Lambda functions across thousands of accounts: scale-to-zero is mandatory, observability can double your bill, SQS polling is a hidden cost, and a mono-repo enforces consistency at scale."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ./reduce-cost.md
  - ../quality-security/do-a-load-test.md
---

# Lessons learned from scaling to 1 million Lambda functions

> **As a** platform engineer building a multi-tenant serverless SaaS, **I want to** learn from ProGlove's journey from 0 to 1M Lambda functions across thousands of accounts, **so that** I can avoid the hidden costs and scaling traps they discovered.

## Summary

- ProGlove operates a one-AWS-account-per-tenant SaaS platform for wearable barcode scanners. At scale: 1M+ Lambda functions deployed across thousands of accounts.
- Phase 1 (0-1K functions): standard serverless playbooks work. Scale-to-zero is "nice to have." SQS decoupling and long-polling are best practices.
- Phase 2 (50 accounts): automated account factory (Step Functions + Organizations), CloudFormation StackSets for multi-account deployment, quota isolation as a key benefit of account-per-tenant.
- Phase 3 (hundreds of accounts): self-DDoS from synchronized schedules. Solution: jitter, randomized batch offsets, staggered updates. Never do the same thing at the same time everywhere.
- Phase 4 (1K+ accounts): SQS polling becomes a cost driver. Remove SQS between EventBridge and Lambda. Centralized DLQ. Observability costs nearly double the cloud bill. Aggressive optimization brought it to $0.70/account/month.
- Phase 5-6: StackSets performance ceiling. Engaged AWS service team to influence roadmap. Mono-repo (20 microservices consolidated) for consistent tooling. Idle cost for inactive accounts: <$1/month.

## Core viewpoints

### 1. Scale-to-zero is not optional at scale

At 1,000+ accounts, "idle" resources are not free. SQS long-polling continuously makes requests even when there are no messages. CloudWatch Alarms, NAT Gateways, and observability forwarding all incur costs on idle accounts. True scale-to-zero requires deliberately eliminating every polling and monitoring pattern that prevents resources from going completely idle.

### 2. Observability is the hidden cost driver

ProGlove found that forwarding all observability data nearly doubled their cloud bill. The cost drivers were not Lambda compute or storage -- they were CloudWatch log forwarding fees and per-account monitoring charges. At $3/account/month, thousands of accounts add up fast. The solution: differentiate high vs. low priority data, move only the priority data, and switch inactive accounts to near-zero monitoring.

### 3. "Best practices" change at scale

SQS between EventBridge and Lambda is a standard resilience pattern. At 1,000+ accounts, the polling cost of empty queues became significant. Removing SQS and relying on metric-driven safety (AsyncEventsDropped, ConcurrentExecutions) was the right call at that scale. The lesson: patterns that are correct at small scale can become anti-patterns at large scale.

### 4. The mono-repo is a consistency enforcement mechanism, not a code organization preference

ProGlove consolidated 20 microservices into a single mono-repo not because they prefer mono-repos, but because consistency at scale requires it. With thousands of accounts, each running copies of the same microservices, any divergence in tooling, security scanning, or CI/CD creates a combinatorial explosion of drift. The mono-repo enforces uniformity by making divergence visible and reviewable in a single PR.

### 5. Quota isolation is the strategic value of account-per-tenant, not cost tracking

The common argument for account-per-tenant is cost allocation. ProGlove discovered that the real value is quota isolation: a single noisy tenant cannot exhaust shared concurrency, API rate limits, or Lambda concurrency for all other tenants. This is a blast-radius argument, not a billing argument. The cost tracking benefit is secondary.

## Key info

- Architecture: one AWS account per tenant, 5-15 Lambda functions per microservice, coordinated by Step Functions, EventBridge, DynamoDB.
- Account factory: Step Functions + Organizations, 15-minute provisioning from request to ready.
- Self-DDoS fix: jitter, randomized batch offsets, staggered updates. "Never do the same thing at the same time everywhere."
- Observability: $3/account/month at 50 accounts, nearly doubled cloud bill at scale. Optimized to $0.70/account/month.
- Idle cost: <$1/month per inactive account after aggressive optimization.
- Mono-repo: 20 microservices consolidated, consistent tooling, security scanning, and CI/CD chain.

## Action recommendations

1. Start with account-per-tenant for quota isolation. Implement automated account factory early.
2. Use jitter and randomized offsets for all scheduled functions from day one. The self-DDoS problem is invisible until it is not.
3. Budget observability cost per account from the start. Treat it with the same scrutiny as compute cost.
4. Remove SQS between EventBridge and Lambda if polling cost becomes significant. Monitor AsyncEventsDropped and ConcurrentExecutions.
5. Engage AWS service teams for scale requirements early. They can influence the service roadmap.

## Anti-patterns

- **Do not use shared-account multi-tenancy at scale. A single noisy tenant exhausts shared concurrency and causes cascading failures.**

- **Do not synchronize schedules across accounts. `rate(5 minutes)` aligns to the top of the minute across all accounts.**

- **Do not assume serverless means zero idle cost. SQS polling, CloudWatch Alarms, and observability forwarding all cost money on idle resources.**

- **Do not use per-account DLQs at scale. The polling cost per DLQ reintroduces the same problem that removing SQS solved.**

- **Using CloudFormation StackSets at scale without engaging the AWS service team.** StackSets hit a performance ceiling at ProGlove's scale. Teams that hit service limits and assume the answer is "work around it" miss the opportunity to influence the service roadmap. AWS service teams use customer scale requirements to prioritize improvements. If you are operating at a scale that stresses a managed service, engage the service team directly.

## Related

- ./reduce-cost.md
- ../quality-security/do-a-load-test.md