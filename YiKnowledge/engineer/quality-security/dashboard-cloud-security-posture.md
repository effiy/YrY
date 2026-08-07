---
title: cloud security posture dashboard
aliases:
- cloud security dashboard
- CSPM dashboard
- cloud compliance dashboard
- cloud misconfiguration dashboard
- cloud workload protection dashboard
tags:
- dashboard
- cloud-security
- cspm
- cwp
- ciem
- cloud-compliance
- misconfiguration
- iam
category: engineer/security-supply-chain
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- security-engineer
- oncall-sre
- tech-lead
benefit: cloud security posture, misconfiguration detection, and cloud compliance visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- cloud asset inventory, misconfiguration, IAM hygiene, network exposure, data protection, and compliance benchmark defined
related:
- ./dashboard-threat-detection-response.md
- ./dashboard-dependency-management.md
- ../quality-security/dashboard-security-posture.md
- ../quality-security/dashboard-compliance-readiness.md
- ../quality-security/dashboard-identity-access-management.md
- ../quality-security/dashboard-data-protection-privacy.md
tacit: false
---

# cloud security posture dashboard

> **As a** security engineer, **I want to** track cloud security posture across all cloud environments, **so that** every cloud resource is correctly configured, IAM is least-privilege, network exposure is minimized, data is protected, and compliance benchmarks are met — turning cloud security from a reactive "someone opened an S3 bucket" alert into a continuously measured, proactively hardened, and audit-ready security posture.

> The cloud is a shared responsibility minefield. This dashboard tracks cloud asset inventory, misconfiguration detection, IAM hygiene, network exposure, data protection, and compliance benchmarks — turning cloud security from a post-breach discovery process into a measured, governed, and continuously improving security discipline.

## Summary

- 6 cloud security dimensions: asset inventory, misconfiguration, IAM hygiene, network exposure, data protection, compliance benchmarks
- 3 cloud environments: AWS (primary, 85% of workloads), GCP (ML/AI workloads), Azure (M365 integration); 4,850 cloud resources; 28 AWS accounts, 5 GCP projects, 3 Azure subscriptions
- Asset inventory: 4,850 resources tracked; 92% coverage; 385 untracked/shadow resources; 8% resources without tags; 42 orphaned resources (unused, unbilled)
- Misconfiguration: 285 active misconfigurations; 45 critical (public exposure, encryption disabled); 85 high; 155 medium; avg time to fix: 8.5 days (target < 3 days)
- IAM hygiene: 2,850 IAM roles/users; 12% with excessive permissions; 28 root accounts (2 active); 85 service accounts with console access; 15% MFA gap
- Dashboard reviewed weekly; cloud security sprint biweekly with security and platform engineering

## Core viewpoints

- Cloud security is not perimeter security — there is no firewall around your cloud; every resource has its own security boundary, and a single misconfigured S3 bucket or security group can expose data to the entire internet
- IAM is the most dangerous attack surface — a compromised IAM role with `s3:*` and `dynamodb:*` can exfiltrate your entire database without triggering a single network alert; IAM hygiene is not compliance, it's survival
- The cloud doubles every year — your security posture today is not your security posture tomorrow; new services, new accounts, new regions, and new IAM roles are created faster than any security team can manually review; automation is the only scalable defense
- Compliance is a lagging indicator — being SOC 2 compliant means you passed an audit 6 months ago; a misconfigured security group created yesterday is not in any compliance report; continuous monitoring trumps periodic audits

## Key information

### 6-panel cloud security posture overview

```
┌──────────────────────────────────────────────────────────────────┐
│  ASSET INVENTORY                     │  MISCONFIGURATION                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total resources: 4,850  │   │  │  Active misconfigs: 285  │   │
│  │  Coverage: 92% (tracked) │   │  │  Critical: 45 (15.8%)   │   │
│  │  Shadow resources: 385   │   │  │  High: 85 (29.8%)       │   │
│  │  Untagged: 8% (388)      │   │  │  Medium: 155 (54.4%)    │   │
│  │  Orphaned: 42 resources  │   │  │  Avg fix time: 8.5 days  │   │
│  │  New resources/day: 28   │   │  │  Reopened: 12% (34)     │   │
│  │  Inventory score: B(78)  │   │  │  Misconfig score: C(68) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  IAM HYGIENE                         │  NETWORK EXPOSURE                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  IAM roles/users: 2,850  │   │  │  Public IPs: 185         │   │
│  │  Excessive perms: 12%    │   │  │  Open ports: 45 (0.0.0.0)│   │
│  │  Root accounts: 28 (2    │   │  │  Unrestricted SG: 28     │   │
│  │  active — critical)      │   │  │  Public S3 buckets: 5    │   │
│  │  Service accts w/ console│   │  │  Exposed DB: 3 (critical)│   │
│  │  access: 85 (excessive)  │   │  │  VPC peering: 18 (3      │   │
│  │  MFA gap: 15% (428 users)│   │  │  cross-account, risky)   │   │
│  │  IAM score: C+ (65)      │   │  │  Network score: C+ (68)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  DATA PROTECTION                     │  COMPLIANCE BENCHMARKS               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  S3 buckets: 285         │   │  │  CIS AWS: 82% compliant  │   │
│  │  Public buckets: 5 (fix) │   │  │  CIS GCP: 76% compliant  │   │
│  │  Encryption at rest: 94% │   │  │  CIS Azure: 72% compliant│   │
│  │  Encryption in transit:  │   │  │  PCI DSS: 88% compliant  │   │
│  │  88% enforced             │   │  │  SOC 2: 85% compliant   │   │
│  │  Bucket logging: 72% on  │   │  │  NIST 800-53: 68%       │   │
│  │  Key rotation: 62% auto  │   │  │  Compliance score: B(78)│   │
│  │  Data score: B- (72)     │   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Cloud asset inventory by service

| Service | AWS | GCP | Azure | Total | Tracked % | Untagged | Orphaned | Growth/mo |
|---|---|---|---|---|---|---|---|---|
| **Compute** (EC2, GCE, VM) | 385 | 85 | 42 | 512 | 95% | 5% | 8 | +3% |
| **Containers** (EKS, GKE, AKS) | 12 clusters | 5 clusters | 3 clusters | 20 clusters | 98% | 2% | 1 | +5% |
| **Serverless** (Lambda, Cloud Functions) | 185 | 42 | 28 | 255 | 88% | 12% | 5 | +8% |
| **Databases** (RDS, Cloud SQL, Cosmos) | 48 | 18 | 12 | 78 | 96% | 3% | 2 | +2% |
| **Storage** (S3, GCS, Blob) | 285 | 65 | 38 | 388 | 90% | 8% | 10 | +4% |
| **Networking** (VPC, LB, CDN) | 385 | 85 | 52 | 522 | 92% | 6% | 6 | +3% |
| **IAM** (roles, policies, users) | 1,850 | 580 | 420 | 2,850 | 94% | 5% | 8 | +2% |
| **Security** (KMS, WAF, GuardDuty) | 185 | 42 | 28 | 255 | 90% | 4% | 2 | +3% |
| **Other** | 285 | 85 | 42 | 412 | 85% | 15% | 0 | +5% |
| **Total** | **3,620** | **1,007** | **665** | **4,850** | **92%** | **8%** | **42** | **+3.5%** |

### Critical misconfigurations

| # | Resource | Service | Misconfiguration | Risk | Age (days) | Owner | Action |
|---|---|---|---|---|---|---|---|
| 1 | **yiweb-prod-logs** | S3 Bucket | Public read access (ACL: AllUsers READ) | Data breach, PII exposure | 5 | web-team | Remove public ACL, enable block public access |
| 2 | **yivad-uploads** | S3 Bucket | Public write access (ACL: AllUsers WRITE) | Malware upload, data corruption | 3 | yivad-team | Remove public write, use pre-signed URLs |
| 3 | **prod-db-primary** | RDS | Publicly accessible (PubliclyAccessible=true) | Database exposure to internet | 12 | infra-team | Move to private subnet, use bastion |
| 4 | **ml-training-data** | S3 Bucket | No encryption at rest | Data exposure, compliance violation | 28 | ml-team | Enable SSE-KMS with customer managed key |
| 5 | **root-account-2** | IAM | Root account with active access keys | Complete account compromise | 45 | security-team | Delete access keys, enable MFA, use IAM roles |
| 6 | **eks-node-group** | EC2 Security Group | SSH open to 0.0.0.0/0 | Unauthorized node access | 8 | infra-team | Restrict to jump host IP only |
| 7 | **admin-iam-role** | IAM Role | `s3:*` and `dynamodb:*` on `*` resource | Data exfiltration, destruction | 18 | infra-team | Scope to specific resources, add conditions |
| 8 | **cloudtrail-audit** | CloudTrail | Log file validation disabled | Log tampering undetectable | 35 | security-team | Enable log file validation, cross-account trail |

### IAM hygiene by account

| Account | Users | Roles | Root active | MFA enabled | Excessive perms | Service accts w/ console | Unused creds > 90d | Score |
|---|---|---|---|---|---|---|---|---|
| **prod** (AWS) | 285 | 185 | Yes (1 key) | 88% | 10% (47) | 22 | 35 | C+ (68) |
| **staging** (AWS) | 85 | 72 | No | 82% | 15% (24) | 12 | 18 | C (65) |
| **pre-prod** (AWS) | 42 | 38 | No | 78% | 18% (14) | 8 | 12 | C- (62) |
| **dev** (AWS) | 125 | 85 | No | 65% | 22% (46) | 18 | 28 | D (58) |
| **sandbox** (AWS) | 185 | 52 | No | 52% | 30% (71) | 15 | 42 | E (45) |
| **ml-platform** (GCP) | 42 | 28 | No | 85% | 8% (6) | 5 | 5 | B (80) |
| **data-warehouse** (GCP) | 28 | 18 | No | 90% | 5% (2) | 2 | 2 | A- (88) |
| **m365-integration** (Azure) | 22 | 15 | No | 88% | 10% (4) | 3 | 3 | B+ (82) |
| **Overall** | **814** | **493** | **2 active** | **85%** | **12%** | **85** | **145** | **C+ (65)** |

### Network exposure analysis

| Exposure type | Count | Critical | Description | Action |
|---|---|---|---|---|
| **Public S3 buckets** | 5 | 5 | Buckets accessible from internet (read or write) | Enable block public access, review bucket policies |
| **Security groups: 0.0.0.0/0** | 28 | 8 | SSH (22), RDP (3389), DB ports (3306, 5432, 27017) open to world | Restrict to known IPs, use VPN/bastion |
| **Publicly accessible databases** | 3 | 3 | RDS, Cloud SQL instances with public IP | Move to private subnet, use VPC peering |
| **Unrestricted outbound** | 12 | 2 | Security groups allowing all outbound (0.0.0.0/0, all ports) | Restrict to required ports and destinations |
| **Cross-account VPC peering** | 3 | 1 | Prod↔Dev VPC peering (environment isolation breach) | Remove peering, use separate accounts |
| **Public API endpoints** | 45 | 0 | API Gateway, ALB endpoints (expected, but monitored) | Review authentication, rate limiting |
| **Excessive port exposure** | 18 | 5 | Services exposing > 5 ports to internet | Audit ports, close unused ones |

### Data protection status

| Data store | Count | Encrypted at rest | Encrypted in transit | Access logging | Public access block | Versioning | Key rotation | Score |
|---|---|---|---|---|---|---|---|---|
| **S3 buckets (prod)** | 85 | 96% | 92% | 78% | 94% | 72% | 68% | B+ (82) |
| **S3 buckets (non-prod)** | 200 | 88% | 82% | 65% | 82% | 45% | 52% | C+ (68) |
| **RDS databases** | 48 | 100% | 98% | 85% | 100% | N/A | 75% | A- (90) |
| **DynamoDB tables** | 65 | 100% | 100% | 72% | 100% | N/A | 80% | A- (88) |
| **EBS volumes** | 385 | 95% | N/A | N/A | N/A | 60% | 55% | B (78) |
| **EFS filesystems** | 12 | 100% | 92% | 85% | 100% | N/A | 65% | B+ (85) |
| **GCS buckets** | 65 | 90% | 85% | 68% | 88% | 52% | 58% | C+ (68) |
| **Azure Blob** | 38 | 92% | 88% | 62% | 85% | 48% | 55% | C+ (68) |
| **Overall** | **898** | **94%** | **88%** | **72%** | **90%** | **55%** | **62%** | **B- (72)** |

### Compliance benchmark coverage

| Benchmark | Total controls | Passed | Failed | Exempted | Not applicable | Compliance % | Audit date |
|---|---|---|---|---|---|---|---|
| **CIS AWS Foundations v1.5** | 58 | 48 | 8 | 2 | 0 | 82.8% | 2026-07-15 |
| **CIS GCP Foundations v1.3** | 52 | 40 | 9 | 3 | 0 | 76.9% | 2026-07-20 |
| **CIS Azure Foundations v1.5** | 55 | 40 | 12 | 3 | 0 | 72.7% | 2026-07-22 |
| **PCI DSS v4.0 (cloud controls)** | 42 | 37 | 3 | 2 | 0 | 88.1% | 2026-06-30 |
| **SOC 2 (cloud infrastructure)** | 38 | 32 | 5 | 1 | 0 | 84.2% | 2026-06-15 |
| **NIST 800-53 (moderate)** | 85 | 58 | 22 | 5 | 0 | 68.2% | 2026-05-20 |
| **GDPR (technical controls)** | 28 | 24 | 3 | 1 | 0 | 85.7% | 2026-07-01 |
| **Overall** | **358** | **279** | **62** | **17** | **0** | **77.9%** | |

### Top failing compliance controls

| Benchmark | Control | Failures | Impact | Remediation effort | Action |
|---|---|---|---|---|---|
| **CIS AWS 1.4** | No root account MFA (2 accounts) | 2 accounts | Account compromise risk | 1 hour | Enable hardware MFA for root accounts |
| **CIS AWS 1.16** | IAM policy attached directly to user | 85 users | Policy management chaos | 2 days | Migrate to group-based policies |
| **CIS AWS 2.1** | CloudTrail not enabled in all regions | 3 regions | Blind spots in audit logging | 2 hours | Enable multi-region CloudTrail |
| **CIS AWS 3.1** | S3 bucket access logging not enabled | 80 buckets | No audit trail for data access | 1 week | Enable S3 access logging, ship to SIEM |
| **CIS GCP 1.3** | Service account keys not rotated | 45 keys | Credential exposure risk | 3 days | Enforce 90-day rotation, auto-rotate |
| **CIS Azure 1.2** | No MFA for all users | 128 users | Account compromise risk | 1 week | Conditional access policy enforcement |
| **NIST 800-53 AC-2** | No automated account review | N/A | Orphaned accounts, privilege creep | 2 weeks | Implement automated access review |
| **NIST 800-53 AU-3** | Insufficient audit log detail | CloudTrail | Incomplete forensic data | 1 week | Enable data events for S3, DynamoDB |

### Cloud detection and response

| Detection capability | Coverage | Alerts/day | True positive | False positive | Integration | Notes |
|---|---|---|---|---|---|---|
| **GuardDuty** (AWS threat detection) | 100% AWS accounts | 28 | 35% | 65% | → SIEM | High FP from Recon:EC2/PortProbe |
| **Security Hub** (AWS posture) | 100% AWS accounts | 85 | 72% | 28% | → SIEM, Jira | Auto-remediation for 15 controls |
| **Security Command Center** (GCP) | 80% GCP projects | 18 | 55% | 45% | → SIEM | Missing 1 project, not yet enrolled |
| **Microsoft Defender** (Azure) | 100% Azure subs | 12 | 60% | 40% | → SIEM | Full coverage achieved |
| **CloudTrail anomaly detection** | 100% AWS | 8 | 42% | 58% | → SIEM | High FP from CI/CD automation |
| **VPC Flow Logs analysis** | 92% VPCs | 5 | 28% | 72% | → SIEM | 3 VPCs without flow logs |

## Action recommendations

1. **Public S3 bucket remediation**: 5 public buckets, 2 with PII exposure; enable block public access on all accounts, implement S3 bucket policy auto-remediation (lambda), target 0 public buckets
2. **Root account lockdown**: 2 active root accounts with access keys; delete access keys, enable hardware MFA, move root credentials to break-glass procedure, target 0 active root accounts
3. **Public database elimination**: 3 databases with public IP; move to private subnet, implement VPC peering or private link, add WAF for any required external access, target 0 public databases
4. **IAM excessive permissions reduction**: 12% excessive permissions (342 principals); implement IAM Access Analyzer, right-size based on CloudTrail usage, target < 5% excessive perms
5. **MFA gap closure**: 15% of users without MFA (428 users); enforce MFA via conditional access policy, implement hardware MFA for privileged roles, target 99% MFA coverage
6. **Security group cleanup**: 28 security groups open to 0.0.0.0/0; restrict SSH/RDP to corporate IPs, close unused database ports, implement auto-remediation for 0.0.0.0/0 rules
7. **Compliance benchmark improvement**: 77.9% overall compliance, 62 failing controls; prioritize CIS AWS (82.8% → 95%), fix top 10 failing controls (account for 45% of failures)
8. **CloudTrail coverage**: 3 regions without CloudTrail, data events not enabled; enable multi-region CloudTrail, add S3/DynamoDB data events, ship to SIEM with alerting
9. **Shadow resource discovery**: 385 untracked resources; implement automated resource discovery across all cloud providers, enforce tagging policy, quarantine untagged resources
10. **Weekly cloud security review**: review asset inventory, misconfigurations, IAM hygiene, network exposure, data protection, and compliance benchmarks with security and platform engineering



- The "security is a cloud provider problem" fallacy → assuming the cloud provider handles security and skipping your own posture management; AWS secures the hypervisor, you secure the S3 bucket — the shared responsibility model means you're responsible for everything you put in the cloud
- IAM as a permission dump → granting `service:*` because "we'll need it later" and narrowing down permissions is too hard; a role with `s3:*` on `*` that only needs `s3:GetObject` on one bucket is a data breach waiting to happen
- Security group sprawl → creating a new security group for every service without reviewing existing ones; 28 security groups with 0.0.0.0/0 rules is not a configuration issue — it's a culture issue where "open to everyone" is the default
- The multi-account mess → using the same AWS account for production, staging, and development; a compromised developer credential in the dev account can reach production resources if the blast radius isn't separated by account boundaries
- Compliance as a point-in-time check → running a CIS benchmark scan before the audit and ignoring it for the rest of the year; cloud resources change daily — a compliant resource yesterday may be non-compliant today after a configuration change

## Related

- Same class: [dashboard-threat-detection-response](dashboard-threat-detection-response.md) — threat detection and response
- Same class: [dashboard-dependency-management](dashboard-dependency-management.md) — dependency management
- Same class: [dashboard-security-posture](../quality-security/dashboard-security-posture.md) — security posture
- Same class: [dashboard-compliance-readiness](../quality-security/dashboard-compliance-readiness.md) — compliance readiness
- Same class: [dashboard-identity-access-management](../quality-security/dashboard-identity-access-management.md) — identity and access management
- Same class: [dashboard-data-protection-privacy](../quality-security/dashboard-data-protection-privacy.md) — data protection and privacy
- References: AWS — *Security Reference Architecture*; GCP — *Security Foundations Guide*; Azure — *Cloud Adoption Framework Security*; CIS — *Cloud Benchmarks*; Palo Alto — *Prisma Cloud CSPM Guide*; Wiz — *Cloud Security Best Practices*; CrowdStrike — *Cloud Workload Protection*; Fugue — *Cloud Compliance as Code*