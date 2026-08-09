---
title: certificate and secret management dashboard
aliases:
- TLS certificate dashboard
- secret rotation dashboard
- PKI health dashboard
- credential management dashboard
tags:
- dashboard
- certificates
- secrets
- pki
- tls
- rotation
- credential-scanning
category: oncall-sre/observability
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- oncall-sre
- security-engineer
- tech-lead
benefit: certificate and secret management health visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- TLS certificate expiry, secret rotation, key management, credential scanning, and PKI health defined
related:
- ./dashboard-system-health.md
- ./dashboard-observability-coverage.md
- ../../engineer/quality-security/dashboard-security-posture.md
- ../../engineer/quality-security/dashboard-vulnerability-management.md
- ../incident-response/dashboard-incident-trends.md
tacit: false
---

# certificate and secret management dashboard

> **As an** SRE, **I want to** track certificate and secret lifecycle management, **so that** every certificate is renewed before expiry, every secret is rotated on schedule, and no credential-related incident reaches production.

> Certificate expiry is the #1 cause of preventable production outages. This dashboard tracks TLS certificate expiry, secret rotation, key management, credential scanning, and PKI health — turning crypto hygiene from a recurring fire drill into an automated, boring process.

## Summary

- 5 secret management dimensions: TLS certificate expiry, secret rotation, key management, credential scanning, PKI health
- 342 TLS certificates across 42 services, 8 domains, and 3 cloud providers; 8 certificates expiring within 30 days
- 1,850 secrets managed across 4 secret stores (Vault, AWS Secrets Manager, GCP Secret Manager, Kubernetes Secrets); 28% past rotation deadline
- 95 SSH keys, 42 API signing keys, 18 database credentials, 12 service account keys, 8 GPG signing keys
- 12 credential leaks detected in last 12 months; 8 in source code, 3 in logs, 1 in config files; all rotated within SLA
- Dashboard reviewed weekly; certificate and secret management review monthly with security and SRE

## Core viewpoints

- Certificate expiry is never a surprise — it's a failure of monitoring; every certificate expiry incident is a monitoring gap, not a complexity problem
- Secret rotation is not optional — it's the only defense against undetected credential leaks; if a secret hasn't been rotated in 90 days, assume it's compromised
- The blast radius of a leaked secret is the sum of all systems it can access — a single leaked AWS key can compromise the entire infrastructure; minimize secret scope and automate rotation
- PKI is infrastructure, not a feature — internal CA, certificate issuance, and revocation must be as reliable as DNS or DHCP; PKI outages are infrastructure outages

## Key information

### 5-panel certificate and secret overview

```
┌──────────────────────────────────────────────────────────────────┐
│  TLS CERTIFICATE EXPIRY           │  SECRET ROTATION                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Certificates: 342      │   │  │  Secrets: 1,850 total    │   │
│  │  Expired:      2 (1%)   │   │  │  Auto-rotated: 1,050 (57%)│  │
│  │  < 7 days:     3 (1%)   │   │  │  Manual:       520 (28%)│   │
│  │  7-30 days:    3 (1%)   │   │  │  Not rotated:  280 (15%)│   │
│  │  30-90 days:  28 (8%)   │   │  │  Overdue:      520 (28%)│   │
│  │  > 90 days:  306 (89%)  │   │  │  Rotation SLA: 78% met  │   │
│  │  Auto-renew: 285 (83%)  │   │  │  Avg rotation: 68 days   │   │
│  │  Manual:      57 (17%)  │   │  │  Target:       90 days   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  KEY MANAGEMENT                   │  CREDENTIAL SCANNING              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  SSH keys: 95            │   │  │  Scans: per commit       │   │
│  │  API signing: 42         │   │  │  Leaks detected: 12/yr   │   │
│  │  DB credentials: 18      │   │  │  In source: 8 (67%)      │   │
│  │  Service account: 12     │   │  │  In logs: 3 (25%)        │   │
│  │  GPG signing: 8          │   │  │  In config: 1 (8%)       │   │
│  │  Key rotation: 62%       │   │  │  Rotation SLA: 100% met  │   │
│  │  Orphaned keys: 5        │   │  │  MTTR (leak): 45 min     │   │
│  │  Key strength: 98% ≥ 2048│   │  │  False positive: 2.8%    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### TLS certificate inventory

| Domain/Service | Type | Issuer | Expiry date | Days left | Auto-renew | SAN count | Key strength | Status |
|---|---|---|---|---|---|---|---|---|
| `*.yry.ai` | Wildcard | AWS ACM | 2026-10-15 | 70 days | Yes | 12 | RSA 2048 | OK |
| `api.yry.ai` | Single | Let's Encrypt | 2026-08-10 | 4 days | Yes | 3 | ECDSA P-256 | **Warning** |
| `app.yry.ai` | Wildcard | DigiCert | 2026-12-20 | 136 days | No | 8 | RSA 4096 | OK |
| `chat.yry.ai` | Single | AWS ACM | 2026-08-07 | 1 day | Yes | 2 | RSA 2048 | **Critical** |
| `search.yry.ai` | Single | Let's Encrypt | 2026-09-01 | 26 days | Yes | 2 | ECDSA P-256 | OK |
| `code.yry.ai` | Single | AWS ACM | 2026-08-05 | -1 day | Yes | 2 | RSA 2048 | **EXPIRED** |
| `admin.yry.ai` | Single | Let's Encrypt | 2026-08-08 | 2 days | No | 1 | ECDSA P-256 | **Critical** |
| `pay.yry.ai` | Single | DigiCert | 2027-03-15 | 221 days | No | 2 | RSA 4096 | OK |
| `static.yry.ai` | Wildcard | Cloudflare | 2027-01-10 | 157 days | Yes | 5 | ECDSA P-256 | OK |
| `internal.yry.ai` | Wildcard | Internal CA | 2026-11-01 | 87 days | No | 15 | RSA 2048 | OK |
| Internal service mesh (32 services) | Per-service | Internal CA | Various | 30-180 days | Yes | 1 | ECDSA P-256 | Mixed |
| CDN edge certificates | Multi-domain | Cloudflare | 2027-06-01 | 299 days | Yes | 42 | ECDSA P-256 | OK |
| **Overall** | | | | | **83% auto** | | **98% ≥ 2048** | |

### Certificate expiry calendar

| Expiry window | Count | Services | Risk | Action |
|---|---|---|---|---|
| **Already expired** | 2 | code.yry.ai, internal monitoring | **Critical — immediate** | Renew immediately, investigate auto-renew failure |
| **0-7 days** | 3 | api.yry.ai, chat.yry.ai, admin.yry.ai | **Critical** | Renew today, verify auto-renew for api/chat |
| **7-30 days** | 3 | search.yry.ai, internal wiki, staging wildcard | High | Renew this week |
| **30-60 days** | 12 | Various internal services | Medium | Schedule renewal |
| **60-90 days** | 16 | Internal CA certs, dev environments | Low | Plan renewal |
| **> 90 days** | 306 | Production, CDN, wildcards | OK | Monitor |
| **Total** | **342** | | | |

### Certificate auto-renewal health

| Auto-renew method | Certificates | Success rate | Failure reason | Last failure | Impact |
|---|---|---|---|---|---|
| **AWS ACM** | 125 | 98% | IAM permission boundary (2 certs) | 2026-08-01 | code.yry.ai expired |
| **Let's Encrypt (cert-manager)** | 85 | 96% | DNS-01 challenge timeout (3 certs) | 2026-08-04 | api.yry.ai expiring |
| **Cloudflare Origin CA** | 45 | 100% | — | — | None |
| **Internal CA (Vault)** | 30 | 95% | Vault token expiry (1 cert) | 2026-07-28 | internal monitoring expired |
| **Manual (no auto-renew)** | 57 | N/A | Human-dependent | Ongoing | 57 certificates at risk |
| **Overall** | **342** | **83% auto** | | | |

### Secret rotation by store

| Secret store | Total secrets | Auto-rotated | Manual | Overdue | Rotation SLA met | Avg rotation age | Target |
|---|---|---|---|---|---|---|---|
| **HashiCorp Vault** | 850 | 580 (68%) | 180 | 90 (11%) | 89% | 58 days | 90 days |
| **AWS Secrets Manager** | 520 | 380 (73%) | 95 | 45 (9%) | 91% | 52 days | 90 days |
| **GCP Secret Manager** | 180 | 90 (50%) | 55 | 35 (19%) | 81% | 72 days | 90 days |
| **Kubernetes Secrets** | 300 | 0 (0%) | 190 | 110 (37%) | 63% | 120 days | 90 days |
| **Total** | **1,850** | **1,050 (57%)** | **520 (28%)** | **280 (15%)** | **78%** | **68 days** | |

### Secret rotation by type

| Secret type | Count | Auto-rotated | Overdue | Rotation period | Compliance | Risk if leaked |
|---|---|---|---|---|---|---|
| **Database credentials** | 450 | 320 (71%) | 55 (12%) | 90 days | 88% | Data access |
| **API keys (3rd party)** | 280 | 85 (30%) | 72 (26%) | 90 days | 74% | Service access |
| **Cloud provider credentials** | 180 | 150 (83%) | 8 (4%) | 90 days | 96% | **Infrastructure access** |
| **OAuth/OIDC client secrets** | 120 | 45 (38%) | 28 (23%) | 180 days | 77% | User impersonation |
| **Encryption keys (DEK/KEK)** | 95 | 70 (74%) | 12 (13%) | 365 days | 87% | Data exposure |
| **Service account tokens** | 320 | 160 (50%) | 85 (27%) | 90 days | 73% | Service impersonation |
| **Webhook signing secrets** | 85 | 25 (29%) | 35 (41%) | 90 days | 59% | Webhook forgery |
| **CI/CD pipeline secrets** | 180 | 120 (67%) | 18 (10%) | 90 days | 90% | Pipeline compromise |
| **SSH keys** | 95 | 45 (47%) | 28 (29%) | 180 days | 71% | Server access |
| **Other** | 45 | 30 (67%) | 9 (20%) | 90 days | 80% | Various |
| **Overall** | **1,850** | **1,050 (57%)** | **280 (15%)** | | **78%** | |

### Key management inventory

| Key type | Count | Rotated < 90 days | Rotation % | Key strength | Orphaned | Last audit |
|---|---|---|---|---|---|---|
| **SSH user keys** | 65 | 48 | 74% | 98% ≥ ed25519 | 3 | 2026-07 |
| **SSH host keys** | 30 | 28 | 93% | 100% ≥ ed25519 | 0 | 2026-07 |
| **API signing keys (JWT)** | 28 | 18 | 64% | 100% ≥ RS256 | 2 | 2026-06 |
| **API signing keys (HMAC)** | 14 | 10 | 71% | 100% ≥ HS256 | 0 | 2026-06 |
| **Database credentials** | 18 | 10 | 56% | 100% ≥ 32 chars | 0 | 2026-08 |
| **Service account keys** | 12 | 8 | 67% | 100% ≥ RSA 2048 | 1 | 2026-07 |
| **GPG signing keys** | 8 | 5 | 63% | 100% ≥ RSA 4096 | 0 | 2026-04 |
| **mTLS client certs** | 42 | 28 | 67% | 95% ≥ ECDSA P-256 | 2 | 2026-07 |
| **Total** | **217** | **155** | **62%** | | **8** | |

### Orphaned keys and access

| Key | Type | Owner | Last used | Age | Access level | Risk | Action |
|---|---|---|---|---|---|---|---|
| SSH key #42 | SSH user | Former employee (departed 2026-05) | 2026-04-15 | 112 days | Production servers | **Critical** | Revoke immediately |
| API key #18 | JWT signing | Unknown (former team) | 2026-02-10 | 176 days | Internal APIs | **Critical** | Revoke, rotate affected APIs |
| Service account #7 | GCP SA | Decommissioned service | 2026-03-22 | 136 days | GCP project | High | Disable service account |
| SSH key #55 | SSH user | Contractor (contract ended) | 2026-05-01 | 97 days | Staging servers | High | Revoke |
| mTLS cert #12 | Client cert | Decommissioned microservice | 2026-04-08 | 120 days | Service mesh | Medium | Revoke cert |
| mTLS cert #28 | Client cert | Unknown | 2026-01-15 | 203 days | Service mesh | Medium | Investigate, revoke |
| API key #22 | JWT signing | Unknown | 2025-12-01 | 248 days | Legacy API | Medium | Audit, rotate |
| SSH key #31 | SSH user | Employee (role changed) | 2026-06-01 | 66 days | Admin servers | Medium | Review access need |

### Credential leak incidents

| Date | Type | Location | Credential | Exposure | Detected by | MTTR | Impact | Prevention |
|---|---|---|---|---|---|---|---|---|
| 2026-07-22 | Source code | GitHub public repo | AWS access key | 8 hours | GitGuardian | 35 min | None (staging account) | Pre-commit hook |
| 2026-06-15 | Log output | CloudWatch logs | DB password | 3 days | Manual review | 52 min | DB credentials rotated | Log redaction filter |
| 2026-05-08 | Source code | Internal GitLab | Stripe API key | 12 hours | GitGuardian | 28 min | None (test key) | .env file exclusion |
| 2026-04-12 | Config file | Docker image | JWT signing secret | 45 days | Trivy scan | 65 min | JWT rotation, token invalidation | Image scanning |
| 2026-03-20 | Source code | Code review comment | GitHub token | 2 hours | Developer report | 42 min | Token revoked | Review guidelines |
| 2026-02-14 | Source code | Public gist | Internal API key | 4 hours | GitGuardian | 38 min | Key rotated | Gist scanning policy |
| **2025-11-08** | Source code | GitHub public repo | **Production AWS key** | **22 min** | GitGuardian | **18 min** | **None — auto-revoked** | **Pre-commit hook + auto-remediation** |

### Credential scanning coverage

| Scanner | Scope | Frequency | Patterns detected | False positive | Leaks caught (12 mo) | Status |
|---|---|---|---|---|---|---|
| **GitGuardian** | All git repos | Per commit | 350+ patterns | 2.2% | 8 | Active |
| **truffleHog** | All git history | Weekly | 200+ patterns | 4.5% | 2 | Active |
| **Trivy** | Container images | Per build | 150+ patterns | 1.8% | 1 | Active |
| **AWS IAM Access Analyzer** | AWS account | Continuous | IAM policy | 0.5% | 0 | Active |
| **GCP Security Command Center** | GCP projects | Continuous | GCP-specific | 0.8% | 0 | Active |
| **Custom log scanner** | CloudWatch, ELK | Hourly | Custom regex | 8.2% | 1 | Active |
| **Pre-commit hooks** | Developer machines | Per commit | 200+ patterns | 3.5% | N/A (prevention) | Active |
| **Overall** | | | | **2.8%** | **12** | |

### PKI infrastructure health

| Component | Type | Status | Validity | CRL/OCSP | Last rotated | Backup | Issues |
|---|---|---|---|---|---|---|---|
| **Root CA** | Internal | Active | 10 years (2028) | CRL (24h) | 2024-01 (3-year) | HSM + offline | None |
| **Intermediate CA (prod)** | Internal | Active | 5 years (2027) | CRL (12h) + OCSP | 2025-06 (1-year) | HSM | None |
| **Intermediate CA (non-prod)** | Internal | Active | 5 years (2027) | CRL (24h) | 2025-06 (1-year) | HSM | None |
| **Vault PKI backend** | Internal | Active | N/A | CRL (auto) | Auto (30 days) | Raft snapshots | None |
| **cert-manager** | Kubernetes | Active | N/A | N/A | Auto (30 days) | GitOps | Renewal failures (2) |
| **AWS ACM** | Cloud | Active | N/A | N/A | Auto (AWS) | AWS managed | IAM boundary issue |
| **Let's Encrypt account** | External | Active | N/A | OCSP | Auto (60 days) | Account key backup | Rate limit risk |
| **CRL distribution point** | Internal | Active | N/A | N/A | Auto | CDN | OCSP responder latency |

### Certificate transparency monitoring

| Domain | CT logs monitored | Certificates detected (12 mo) | Expected | Unexpected | Unauthorized | Action |
|---|---|---|---|---|---|---|
| `yry.ai` | Google, Cloudflare, DigiCert | 38 | 34 | 4 | 0 | 4 renewals via new provider |
| `yry.io` | Google, Cloudflare, DigiCert | 12 | 12 | 0 | 0 | None |
| `yry.dev` | Google, Cloudflare | 6 | 6 | 0 | 0 | None |
| `yry.internal` | N/A (internal CA) | 285 | 285 | 0 | 0 | None |
| **Total** | | **341** | **337** | **4** | **0** | |

## Action recommendations

1. **Expired certificate remediation**: code.yry.ai (expired), internal monitoring (expired); renew immediately, root-cause auto-renewal failure on AWS ACM
2. **Critical expiry this week**: api.yry.ai (4 days), chat.yry.ai (1 day), admin.yry.ai (2 days); renew all 3 today, verify auto-renew for api/chat
3. **Manual certificate automation**: 57 certificates at risk with no auto-renew; migrate to cert-manager or AWS ACM, target 95% auto-renewal
4. **Kubernetes Secrets rotation**: 0% auto-rotated, 37% overdue; implement External Secrets Operator + Vault/AWS/GCP backend, target 80% auto-rotation
5. **Webhook signing secret rotation**: 41% overdue, 59% SLA compliance; implement automated webhook secret rotation with dual-signing window
6. **Orphaned key cleanup**: 8 orphaned keys including 2 critical from former employees; implement automated key lifecycle management, revoke inactive keys after 30 days
7. **SSH key rotation**: 74% rotated, 3 orphaned; implement SSH certificate authority, replace long-lived SSH keys with short-lived certificates
8. **Credential scanning false positive reduction**: 2.8% average, 8.2% for custom log scanner; tune regex patterns, implement ML-based noise reduction
9. **Secret rotation SLA enforcement**: 78% compliance; add rotation SLA to service health score, page on-call for Tier 0 secrets past rotation deadline
10. **Weekly certificate review**: review expiry calendar, auto-renewal health, new CT log entries, and credential leak incidents with security and SRE



- Certificate expiry as a calendar reminder → relying on someone's Google Calendar to remember to renew a production certificate; certificate expiry monitoring must be automated with pager alerts
- Secret rotation as an annual event → rotating secrets once a year because "it's a pain"; if rotation is painful, the system is wrong — invest in automation, not in tolerance for stale secrets
- Long-lived credentials as a convenience → using 10-year SSH keys because "it's easier"; long-lived credentials are a gift to attackers, use short-lived certificates with automated issuance
- Secrets in source code → "it's just a dev key, it doesn't matter"; dev keys in source code become production keys in source code, and public repos are scanned by attackers within minutes
- PKI as a black box → "the CA just works, don't touch it"; PKI is critical infrastructure — if the CA goes down, all service-to-service communication breaks

## Related

- Same class: [dashboard-system-health](dashboard-system-health.md) — system SLO and health
- Same class: [dashboard-observability-coverage](dashboard-observability-coverage.md) — observability coverage
- Same class: [dashboard-security-posture](../../engineer/quality-security/dashboard-security-posture.md) — security posture
- Same class: [dashboard-vulnerability-management](../../engineer/quality-security/dashboard-vulnerability-management.md) — vulnerability management
- Same class: [dashboard-incident-trends](../incident-response/dashboard-incident-trends.md) — incident trends
- References: NIST — *SP 800-57 (Key Management)*; OWASP — *Secrets Management Cheat Sheet*; HashiCorp — *Vault Operations Guide*; Google — *BeyondCorp (Certificate-Based Access)*; CNCF — *cert-manager Documentation*; AWS — *ACM Best Practices*