---
title: 'Eclipse Dataspace Components on AWS: Architecture patterns in production'
tags: [EDC, data-spaces, production, ECS, Fargate, Aurora, Well-Architected, security, isolation]
category: engineer/infrastructure
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/eclipse-dataspace-components-on-aws-architecture-patterns-in-production/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, architect]
benefit: "Deploy production-ready EDC connectors on AWS with isolated architecture cells, defense-in-depth security, and managed services instead of self-managed infrastructure."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - engineer/infrastructure/eclipse-dataspace-components-on-aws-data-sharing-fundamental-dac433
  - engineer/infrastructure/eclipse-dataspace-components-on-aws-cost-optimization-strate-7e6656
---

# Eclipse Dataspace Components on AWS: Architecture patterns in production

> **As a** platform architect deploying EDC connectors on AWS, **I want to** follow production-grade architecture patterns for isolation, security, and reliability, **so that** business-critical data sharing processes are not compromised by infrastructure weaknesses.

## Summary

- Part 2 of a 3-part series. Covers the Well-Architected pillars of Operational Excellence, Security, and Reliability for EDC connector deployments.
- Each EDC connector forms an isolated architecture cell: ECS Fargate for compute, Aurora for persistence, Secrets Manager for credentials, S3 for data storage, API Gateway + NLB for networking.
- Four key sub-components: (1) ECS Fargate for serverless container orchestration, (2) Aurora + Secrets Manager + Cognito for managed persistence and auth, (3) S3 for durable data storage, (4) API Gateway + NLB for secure private networking via VPC links.
- Infrastructure-as-code via CDK enables templatized, repeatable deployment. A single CDK command deploys a full connector cell.
- API Gateway MCP proxy support allows EDC APIs to be consumed by authorized AI agents for autonomous data collection and sharing.

## Core viewpoints

### 1. Architecture cells provide failure isolation

Deploying separate connector instances per use case is a common pattern. Each cell is independently deployable, securable, and scalable. This prevents a failure in one data-sharing use case from cascading to others.

### 2. Defense in depth is mandatory, not optional

Security is layered: VPC private subnets, security group segmentation, IAM least privilege, and encryption at every stage. The internal-only NLB fronted by API Gateway prevents unintended public exposure. No single control is sufficient.

### 3. Managed services over self-managed infrastructure

Using Aurora, Secrets Manager, Fargate, and Cognito instead of self-managed equivalents shifts undifferentiated heavy lifting to AWS. You gain high availability, built-in security best practices, compliance certifications, and automatic updates.

### 4. CDK templating enables Day 2 operations, not just Day 1 deployment

The architecture cell pattern is only valuable if you can consistently create, update, and destroy cells. CDK makes every cell identical by construction, which means security patches, EDC version upgrades, and configuration changes can be rolled out deterministically across all cells. Without IaC, each cell drifts into a unique snowflake, and the operational burden compounds with each new use case.

### 5. The control plane / data plane separation is a security boundary, not just an architectural diagram

The control plane handles contract negotiation and policy evaluation; the data plane handles actual data transfer. These should be deployed as separate ECS services with different security groups, different IAM roles, and different scaling policies. A compromised data plane should never be able to authorize new contracts or modify policy. The separation is the last line of defense against lateral movement.

## Key info

- EDC connector consists of a control plane and data plane, deployed as containers to ECR, orchestrated by ECS Fargate.
- Persistence: Aurora PostgreSQL (relational data), Secrets Manager (credentials), Cognito (OAuth 2.0 client credentials).
- Networking: API Gateway with VPC links to internal-only NLB. All traffic stays within VPC private subnets.
- Reliability: ECS circuit breakers, cross-zone load balancing, Aurora multi-AZ replication, decoupled control/data planes.
- Production reference: Prometheus-X Data Space Connector uses the same architecture pattern.

## Action recommendations

1. Deploy EDC connectors as isolated architecture cells per use case. Use CDK for templatized, repeatable deployment.
2. Place the NLB in private subnets and front it with API Gateway. Never expose EDC APIs directly to the internet.
3. Use IAM SigV4 for API Gateway authentication and S3 bucket access. Restrict security groups to the minimum necessary ports and sources.
4. Implement ECS circuit breakers to automatically roll back failed deployments.

## Anti-patterns

- **Deploying a single shared connector for multiple use cases.** Do not deploy a single shared connector for multiple use cases. Failure isolation requires separate instances.

- **Exposing EDC APIs directly to the public internet.** Do not expose EDC APIs directly to the public internet. Always use API Gateway with VPC links.

- **Self-managing databases, secret stores, or identity providers if managed AWS equi....** Do not self-manage databases, secret stores, or identity providers if managed AWS equivalents are available.

- **Using the same IAM role for control plane and data plane.** Do not use the same IAM role for control plane and data plane. They have fundamentally different permission needs: the control plane accesses policy stores and contract negotiation state; the data plane accesses source and sink storage. Shared roles violate least privilege and create a blast radius that spans both planes.

- **Treating EDC connector deployment as a one-time setup.** Do not treat EDC connector deployment as a one-time setup. EDC versions iterate rapidly, and connectors in a data space must maintain protocol compatibility. Plan for regular version upgrades as part of your operational cadence -- a connector that falls two major versions behind may fail to negotiate contracts with upgraded peers.

## Related

- engineer/infrastructure/eclipse-dataspace-components-on-aws-data-sharing-fundamental-dac433
- engineer/infrastructure/eclipse-dataspace-components-on-aws-cost-optimization-strate-7e6656