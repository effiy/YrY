---
title: 'Eclipse Dataspace Components on AWS: Cost optimization strategies'
tags: [EDC, data-spaces, cost-optimization, AWS Fargate, Aurora, Spot, Well-Architected]
category: engineer/infrastructure
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/eclipse-dataspace-components-on-aws-cost-optimization-strategies/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, architect, finops]
benefit: "Get concrete cost estimates for EDC connector deployments (~$387/mo business-critical, ~$164/mo non-critical) and learn optimization strategies that cut costs by up to 58%."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - engineer/infrastructure/eclipse-dataspace-components-on-aws-data-sharing-fundamental-dac433
  - engineer/infrastructure/eclipse-dataspace-components-on-aws-architecture-patterns-in-b54449
---

# Eclipse Dataspace Components on AWS: Cost optimization strategies

> **As a** platform architect planning an EDC deployment, **I want to** understand the cost drivers and optimization levers for running EDC connectors on AWS, **so that** I can right-size infrastructure and avoid over-provisioning.

## Summary

- Part 3 of a 3-part series covering the Well-Architected pillars of Performance Efficiency, Cost Optimization, and Sustainability for EDC connector deployments.
- Business-critical workload estimate: ~$387/month, dominated by Aurora PostgreSQL (71%) and ECS Fargate (21%). Non-critical: ~$164/month, a 58% reduction.
- Primary cost drivers are database, compute, and load balancing -- not usage-based services like S3, API Gateway, or data transfer. This means the architecture scales efficiently with increased usage.
- Key optimization levers: Fargate Spot (up to 70% compute savings), Aurora Serverless v2 for variable workloads, Savings Plans for predictable steady-state, S3 Lifecycle policies for tiered storage.
- Graviton-based instances (r6g, t4g) deliver better price-performance and energy efficiency than x86 equivalents.

## Core viewpoints

### 1. Database and compute dominate; usage-based services are marginal

At the assumed volumes (5 GB data, 20 GB/month transfer, 100K API calls), S3 costs $0.10/month and API Gateway costs $0.40/month. The cost structure means you get more value from existing infrastructure as usage grows without proportional cost increases. Right-size the database and compute first.

### 2. 58% cost reduction is achievable through rightsizing alone

Switching from db.r6g.large to db.t4g.medium for Aurora, and from Fargate On-Demand to Fargate Spot, cuts costs from $387 to $164/month. Same data throughput, same API capacity, same architecture pattern. The difference is purely in resource sizing and pricing model.

### 3. Cost optimization and sustainability are correlated

Higher utilization of provisioned resources means less waste and less energy consumption. Graviton processors offer better performance per watt. Minimizing redundant data movement reduces both network costs and energy use. Cost optimization and sustainability efforts reinforce each other.

### 4. The cost structure reveals that EDC scales well with usage growth

The cost breakdown shows that usage-based services (S3 at $0.10/month, API Gateway at $0.40/month) are marginal at the assumed volumes. Doubling data volume or API calls does not double cost. The architecture is front-loaded with fixed infrastructure costs (database, compute, load balancer), which is a good property for growing data spaces but means the minimum viable deployment always has a floor cost that cannot be optimized away.

### 5. Spot interruption handling is not optional once you commit to Spot

Fargate Spot provides a 2-minute termination warning via SIGTERM. The EDC connector must handle this gracefully: drain in-flight contract negotiations, persist state to Aurora, and allow the replacement task to pick up where it left off. Without graceful shutdown handling, Spot savings are wiped out by failed negotiations, data inconsistencies, and partner dissatisfaction. Spot is a cost optimization, not a cost elimination -- it requires engineering investment.

## Key info

- Business-critical: Aurora db.r6g.large ($276), ECS Fargate ($83), NLB ($20), total ~$387/month.
- Non-critical: Aurora db.t4g.medium ($110), ECS Fargate Spot ($26), NLB ($20), total ~$164/month.
- Assumptions: 5 GB data, 20 GB/month transfer, 100K API calls, 1K OAuth tokens, single region (eu-south-2), 24/7/365.
- Fargate Spot: up to 70% savings for fault-tolerant workloads. Implement graceful shutdown handling.
- Sustainability: Graviton instances, minimize data movement, shut down non-production environments outside business hours.

## Action recommendations

1. Start with the non-critical configuration for dev/test environments. Use the AWS Pricing Calculator with your actual data volumes.
2. Use Fargate Spot for non-critical workloads; implement graceful shutdown handling for Spot interruptions.
3. Configure S3 Lifecycle policies to transition historical transfer logs and archived assets to lower-cost tiers.
4. Set up AWS Budgets with alerts and tag EDC resources consistently for cost allocation.
5. For business-critical connectors with predictable usage, purchase Savings Plans for Aurora and Fargate.

## Anti-patterns

- **Over-provisioning from the start.** Do not over-provision from the start. Start with smaller instance types and scale up based on CloudWatch Container Insights metrics.

- **Using on-Demand pricing for predictable, steady-state workloads.** Do not use On-Demand pricing for predictable, steady-state workloads. Savings Plans provide significant discounts.

- **Treating all storage equally.** Do not treat all storage equally. S3 Lifecycle policies should automatically tier infrequently accessed data.

- **Assuming the $387/month estimate applies to your workload.** Do not assume the $387/month estimate applies to your workload. The cost is dominated by database and compute sizing; your actual cost depends on data volume, concurrent connection count, and contract negotiation frequency. Always model with your own metrics rather than adopting the reference numbers directly.

- **Using spot for the control plane of business-critical connectors.** Do not use Spot for the control plane of business-critical connectors. A Spot interruption during contract negotiation can leave both parties in an inconsistent state. Reserve Spot for the data plane and non-critical workloads where a brief interruption does not violate contractual agreements.

## Related

- engineer/infrastructure/eclipse-dataspace-components-on-aws-data-sharing-fundamental-dac433
- engineer/infrastructure/eclipse-dataspace-components-on-aws-architecture-patterns-in-b54449