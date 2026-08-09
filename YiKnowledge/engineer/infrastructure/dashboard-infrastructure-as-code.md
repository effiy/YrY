---
title: infrastructure as code health dashboard
aliases:
- IaC dashboard
- Terraform health dashboard
- infrastructure automation dashboard
- GitOps health dashboard
- configuration drift dashboard
tags:
- dashboard
- infrastructure-as-code
- iac
- terraform
- opentofu
- pulumi
- gitops
- drift-detection
- provisioning
category: engineer/infrastructure
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- engineer
- tech-lead
- sre
benefit: infrastructure as code quality, drift detection, and provisioning health visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- IaC coverage, drift detection, module quality, provisioning health, state management, and GitOps compliance defined
related:
- ./dashboard-cicd-pipeline-health.md
- ./dashboard-deployment-safety.md
- ./dashboard-database-performance.md
- ../quality-security/dashboard-security-posture.md
- ../../oncall-sre/observability/dashboard-cost-and-resource.md
tacit: false
---

# infrastructure as code health dashboard

> **As an** engineer, **I want to** track infrastructure as code quality and provisioning health, **so that** every resource is defined in code, zero drift exists between code and reality, provisioning is fast and reliable, and infrastructure management is a measured, automated, and continuously improving practice — not a snowflake server waiting to fail.

> Infrastructure as code is the foundation of cloud operations. This dashboard tracks IaC coverage, configuration drift, module quality, provisioning health, state management, and GitOps compliance — turning infrastructure from "someone manually created that instance in the console" into a fully automated, audited, and reproducible engineering discipline.

## Summary

- 6 IaC dimensions: IaC coverage, configuration drift, module quality, provisioning health, state management, GitOps compliance
- 4,850 cloud resources across AWS, GCP, Azure; 3 IaC tools: Terraform 1.9 (primary), OpenTofu 1.8 (migrating), Pulumi (legacy); 285 Terraform modules
- IaC coverage: 88% of resources managed by IaC; 582 resources (12%) manually created (console/CLI); 185 unmanaged resources identified for import; 42 resources in "unknown" ownership
- Configuration drift: 8.5% drift rate; 412 resources with drift; 85 drift detections/month; 28 critical drifts (security group, IAM, firewall); avg drift resolution: 5.2 days
- Module quality: 285 modules; 68% with tests; 55% with documentation; 12 modules with breaking changes in last 90 days; 8 deprecated modules still in use
- Dashboard reviewed weekly; IaC health review with platform engineering biweekly

## Core viewpoints

- The console is the enemy of reproducibility — every resource created via cloud console is a resource that will be different in production, staging, and disaster recovery; the console is for exploration, not for creation
- Drift is technical debt in infrastructure form — a security group rule that was added manually during an incident but never codified is a time bomb; the next deployment that touches that security group will either revert the fix (causing an outage) or fail (causing a deploy freeze)
- IaC modules are infrastructure's shared libraries — a well-designed module (VPC, RDS, EKS) is reused 20× and saves 200 hours of engineering; a poorly designed module with 50 input variables and no defaults is reused 0× and costs 40 hours of frustration
- State files are the source of truth, not the cloud — if your Terraform state file is corrupted, lost, or locked, you can't plan, apply, or destroy; state management is the most boring and most critical part of IaC

## Key information

### 6-panel IaC health overview

```
┌──────────────────────────────────────────────────────────────────┐
│  IAC COVERAGE                        │  CONFIGURATION DRIFT                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Resources: 4,850 total  │   │  │  Drift rate: 8.5%       │   │
│  │  IaC managed: 88% (4,268)│   │  │  Resources w/ drift: 412│   │
│  │  Manual: 12% (582)       │   │  │  Critical drifts: 28    │   │
│  │  Unmanaged: 185 (import) │   │  │  Drift detected/mo: 85  │   │
│  │  Unknown ownership: 42   │   │  │  Avg resolution: 5.2d   │   │
│  │  Console changes/mo: 35  │   │  │  Drift-caused incidents:│   │
│  │  Coverage score: B (78)  │   │  │  3 in last 90 days      │   │
│  │                           │   │  │  Drift score: C+ (68)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  MODULE QUALITY                      │  PROVISIONING HEALTH                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Modules: 285 total      │   │  │  Avg plan time: 45s     │   │
│  │  With tests: 68% (194)   │   │  │  Avg apply time: 8.5min │   │
│  │  With docs: 55% (157)    │   │  │  Provision success: 94% │   │
│  │  Breaking changes: 12    │   │  │  Plan failures: 35/mo   │   │
│  │  Deprecated in use: 8    │   │  │  Apply failures: 18/mo  │   │
│  │  Module reuse: 3.2× avg  │   │  │  Rollback rate: 5%      │   │
│  │  Module score: C+ (68)   │   │  │  Provisioning: B- (72)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  STATE MANAGEMENT                    │  GITOPS COMPLIANCE                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  State files: 42         │   │  │  GitOps adoption: 72%   │   │
│  │  Remote backend: 100%    │   │  │  Manual applies: 15/mo  │   │
│  │  State locking: 95%      │   │  │  PR-based changes: 85%  │   │
│  │  State size > 10MB: 8    │   │  │  Drift reconciliation:  │   │
│  │  State corruption: 0     │   │  │  68% automated          │   │
│  │  Workspace hygiene: 72%  │   │  │  Audit trail: 92%       │   │
│  │  State score: B+ (82)    │   │  │  GitOps score: B (78)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### IaC coverage by cloud provider

| Provider | Total resources | IaC managed | Manual | Unmanaged (known) | Unknown ownership | IaC tool | Coverage trend |
|---|---|---|---|---|---|---|---|
| **AWS** (primary) | 3,200 | 90% (2,880) | 320 | 145 | 28 | Terraform 1.9 | +2% |
| **AWS** (legacy) | 450 | 65% (293) | 157 | 58 | 12 | Terraform 0.14 (EOL) | -5% (migrating) |
| **GCP** | 680 | 92% (626) | 54 | 22 | 2 | Terraform 1.9 | +1% |
| **Azure** | 320 | 85% (272) | 48 | 15 | 0 | Terraform 1.9 | +3% |
| **Cloudflare** | 120 | 95% (114) | 6 | 0 | 0 | Terraform 1.9 | 0% |
| **Datadog** | 80 | 80% (64) | 16 | 8 | 0 | Pulumi (legacy) | -2% |
| **Overall** | **4,850** | **88% (4,268)** | **582** | **185** | **42** | | **+2%** |

### Configuration drift by resource type

| Resource type | Drifted | Total | Drift rate | Critical drift | Common drift cause | Risk | Remediation |
|---|---|---|---|---|---|---|---|
| **Security group rules** | 85 | 520 | 16.3% | 18 | Manual incident response, "temporary" rules never codified | High (exposure) | Import changed rules, add drift detection alert |
| **IAM policies** | 52 | 380 | 13.7% | 12 | Console policy changes, service-linked role auto-creation | High (privilege escalation) | Block console IAM changes, enforce IaC-only |
| **Auto-scaling groups** | 42 | 185 | 22.7% | 8 | Manual scaling during incidents, console capacity changes | Medium (capacity) | Codify scaling rules, add ASG drift reconciliation |
| **RDS instance config** | 35 | 95 | 36.8% | 5 | Manual parameter group changes, storage autoscaling | High (performance) | Import parameter changes, add change window |
| **Load balancer rules** | 28 | 165 | 17.0% | 3 | Manual routing rule changes, temporary blocks | Medium (routing) | Enforce LB rule IaC-only, add drift detection |
| **S3 bucket policies** | 22 | 210 | 10.5% | 4 | Console policy changes, public access toggles | Critical (data leak) | Block console S3 policy changes |
| **Kubernetes manifests** | 38 | 520 | 7.3% | 2 | kubectl apply directly, Helm drift | Medium (deployment) | Enforce GitOps, disable kubectl direct apply |
| **DNS records** | 18 | 285 | 6.3% | 0 | Manual DNS changes, temporary routing | Low | Import DNS, add change control |
| **Other** | 92 | 1,490 | 6.2% | 6 | Various | | |
| **Overall** | **412** | **4,850** | **8.5%** | **28** | | | |

### Module quality and reuse

| Module | Provider | Used by | Tests | Docs | Version | Breaking changes (90d) | Deprecated | Quality |
|---|---|---|---|---|---|---|---|---|
| **vpc** | AWS | 28 workspaces | Yes | Yes | v3.2.0 | 0 | No | A (92) |
| **eks-cluster** | AWS | 18 workspaces | Yes | Yes | v2.5.0 | 1 (v2.4→v2.5) | No | B+ (85) |
| **rds-postgres** | AWS | 22 workspaces | Yes | Partial | v1.8.0 | 0 | No | B+ (82) |
| **s3-bucket** | AWS | 35 workspaces | No | Yes | v2.1.0 | 0 | No | B (78) |
| **iam-role** | AWS | 42 workspaces | Yes | Yes | v4.0.0 | 2 (v3→v4 major) | No | A- (88) |
| **lambda-function** | AWS | 15 workspaces | Partial | No | v1.5.0 | 1 | No | C+ (68) |
| **cloudfront-cdn** | AWS | 8 workspaces | No | No | v0.9.0 (beta) | 3 | No | D (55) |
| **gke-cluster** | GCP | 12 workspaces | Yes | Yes | v2.0.0 | 0 | No | A- (88) |
| **azure-aks** | Azure | 5 workspaces | Partial | Partial | v1.2.0 | 0 | No | B- (72) |
| **monitoring-alerts** | Datadog | 8 workspaces | No | No | v0.5.0 | 2 | **Yes (Pulumi→Terraform)** | D (52) |
| **legacy-vpc** | AWS | 3 workspaces | No | No | v1.0.0 | 0 | **Yes (use vpc v3)** | F (38) |
| **legacy-ec2** | AWS | 2 workspaces | No | No | v0.8.0 | 0 | **Yes (use EKS)** | F (35) |

### Provisioning performance

| IaC tool | Workspaces | Avg plan time | Avg apply time | Plan failures/mo | Apply failures/mo | Rollback rate | Concurrency limit |
|---|---|---|---|---|---|---|---|
| **Terraform 1.9** (primary) | 32 | 42s | 7.5 min | 22 | 12 | 4% | 10 concurrent applies |
| **Terraform 0.14** (legacy) | 5 | 85s | 18 min | 8 | 5 | 12% | 3 concurrent |
| **OpenTofu 1.8** (migrating) | 3 | 35s | 6.2 min | 3 | 2 | 6% | 5 concurrent |
| **Pulumi** (legacy) | 2 | 28s | 5.5 min | 2 | 1 | 8% | 2 concurrent |
| **Overall** | **42** | **45s** | **8.5 min** | **35** | **18** | **5%** | |

### State management health

| State backend | State files | Avg size | Locking | Versioning | Workspace isolation | Drift between workspaces | Health |
|---|---|---|---|---|---|---|---|
| **S3 + DynamoDB** (AWS) | 28 | 5.2 MB | Yes (DynamoDB) | Yes (S3 versioning) | 85% correct | 12 cross-workspace drifts | A- (88) |
| **GCS** (GCP) | 8 | 3.8 MB | Yes (GCS object lock) | Yes (GCS versioning) | 78% correct | 3 cross-workspace drifts | B+ (85) |
| **Azure Storage** | 4 | 4.5 MB | Yes (lease blob) | Yes (blob versioning) | 72% correct | 8 cross-workspace drifts | B (78) |
| **Terraform Cloud** | 2 | 2.2 MB | Yes (built-in) | Yes (built-in) | 92% correct | 0 | A (92) |
| **Overall** | **42** | **4.5 MB** | **95% locking** | **100% versioned** | **72%** | **23** | **B+ (82)** |

### GitOps compliance

| Practice | Compliance | Gap | Risk | Action |
|---|---|---|---|---|
| **All changes via PR** | 85% | 15 manual applies/month | High (unaudited changes) | Disable manual apply, enforce PR-only |
| **Branch protection (main)** | 92% | 3 repos without protection | High (force push risk) | Enable branch protection on all IaC repos |
| **Plan in CI** | 78% | 22% of workspaces plan locally | Medium (unreviewed plans) | Add plan to CI, require plan approval |
| **Apply from CI/CD** | 72% | 28% of workspaces apply locally | Medium (credential exposure) | Move all applies to CI/CD pipeline |
| **Drift detection automated** | 68% | 32% manual drift checks | High (undetected drift) | Add scheduled drift detection, alert on drift |
| **Drift reconciliation automated** | 35% | 65% manual reconciliation | Medium (slow resolution) | Auto-import or auto-revert drift, add reconciliation pipeline |
| **State file encryption** | 100% | 0 | None | Excellent |
| **Audit trail (who, what, when)** | 92% | 8% of changes missing audit | Low | Add git commit enforcement, sign commits |
| **Immutable tags** | 65% | 35% using `latest` tag | High (non-reproducible) | Pin all versions, use semantic versioning |
| **Overall** | **72%** | | | |

## Action recommendations

1. **Critical drift elimination**: 28 critical drifts (security groups, IAM, S3 policies); prioritize critical drift resolution, block console changes to security groups/IAM/S3 policies, target 0 critical drift within 30 days
2. **Manual resource import**: 582 manually created resources, 185 identified for import; run `terraform import` sprint, target 95% IaC coverage, add console change detection and alerting
3. **Terraform 0.14 migration**: 5 workspaces on EOL Terraform 0.14; migrate to Terraform 1.9 or OpenTofu 1.8, target 0 legacy workspaces within 60 days
4. **Module testing and documentation**: 32% of modules without tests, 45% without docs; add `terraform test` to all modules, require documentation for new modules, target 90% test + doc coverage
5. **Deprecated module removal**: 8 deprecated modules still in use; migrate 3 workspaces from legacy-vpc to vpc v3, remove legacy-ec2 usage, archive deprecated modules
6. **Drift detection automation**: 68% automated drift detection, avg 5.2 days to resolve drift; add scheduled drift detection every 4 hours, alert on drift within 15 minutes, add auto-remediation for safe drift types
7. **GitOps enforcement**: 15 manual applies/month, 28% local applies; disable manual `terraform apply`, enforce PR-only changes, add plan approval gate, target 100% GitOps
8. **State file optimization**: 8 state files > 10MB (slow plan/apply); refactor large workspaces, use `terraform state mv` to split, add state size monitoring, target < 5MB per state
9. **Pulumi legacy migration**: 2 Pulumi workspaces, 80 Datadog resources; migrate to Terraform or OpenTofu, consolidate tooling, target single IaC tool
10. **Weekly IaC health review**: review IaC coverage, drift resolution, module quality, provisioning health, state management, and GitOps compliance with platform engineering



- The `terraform apply --auto-approve` habit → running `terraform apply` without reviewing the plan; the plan says "destroy 42 resources, create 0" but you approved it because you were in a hurry — auto-approve is the "rm -rf" of infrastructure
- The monolithic state file → putting all infrastructure (prod, staging, dev, networking, databases, apps) in a single Terraform state; a typo in a variable destroys production because the blast radius is the entire state file — small, focused workspaces limit blast radius
- The "just this once" console change → making a manual change in the AWS console during an incident and promising to codify it later; the incident ends, the pressure is off, and the manual change stays for 6 months until the next `terraform apply` reverts it and causes a new incident
- The copy-paste module → duplicating a module directory and tweaking a few values instead of parameterizing the original module; you now have 2 copies that diverge, 2 copies to test, 2 copies to update when the provider changes — DRY applies to infrastructure too
- The "works for me" state lock → using local state (`terraform.tfstate` in git) or skipping state locking; 2 engineers running `terraform apply` simultaneously on the same workspace creates a state race condition that corrupts the state file — remote state with locking is not optional

## Related

- Same class: [dashboard-cicd-pipeline-health](dashboard-cicd-pipeline-health.md) — CI/CD pipeline health
- Same class: [dashboard-deployment-safety](dashboard-deployment-safety.md) — deployment safety
- Same class: [dashboard-database-performance](dashboard-database-performance.md) — database performance
- Same class: [dashboard-security-posture](../quality-security/dashboard-security-posture.md) — security posture
- Same class: [dashboard-cost-and-resource](../../oncall-sre/observability/dashboard-cost-and-resource.md) — cost and resource
- References: HashiCorp — *Terraform Best Practices*; OpenTofu — *Migration Guide*; Google — *Infrastructure as Code Design Patterns*; Kief Morris — *Infrastructure as Code (2nd Edition)*; Gruntwork — *Terraform Up & Running*; W3C — *GitOps Principles*; Rosemary Wang — *Terraform in Depth*