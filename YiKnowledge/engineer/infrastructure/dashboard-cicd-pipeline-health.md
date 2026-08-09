---
title: CI/CD pipeline health dashboard
aliases:
- pipeline health dashboard
- build health dashboard
- deployment pipeline dashboard
- CI health dashboard
tags:
- dashboard
- cicd
- pipeline
- build
- deployment
- artifact
- ci-cd
- devops
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
- oncall-sre
benefit: CI/CD pipeline health, build performance, and deployment reliability visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- build performance, pipeline success, artifact management, environment health, test integration, and deployment frequency defined
related:
- ./dashboard-dora-metrics.md
- ./dashboard-deployment-safety.md
- ./dashboard-database-performance.md
- ../process/dashboard-team-velocity.md
- ../../oncall-sre/release/dashboard-release-management.md
tacit: false
---

# CI/CD pipeline health dashboard

> **As an** engineer, **I want to** track CI/CD pipeline health and build performance, **so that** every pipeline run is fast, reliable, and informative, artifacts are traceable to source, environments are consistently provisioned, and the path from commit to production is a well-oiled machine — not a flaky, slow, manual bottleneck.

> The CI/CD pipeline is the circulatory system of software delivery. This dashboard tracks build performance, pipeline success rate, artifact management, environment health, test integration, and deployment frequency — turning CI/CD from a "hope it passes" black box into a continuously measured, optimized, and trusted delivery system.

## Summary

- 6 CI/CD dimensions: build performance, pipeline success rate, artifact management, environment health, test integration, deployment frequency
- 42 repositories; 85 pipelines (42 CI, 28 CD, 15 utility); 1,850 pipeline runs/day; 8 build agents; 5 deployment environments
- Build performance: 4.2 min average build time; 12 min P95; 28% of builds exceed 5 min target; 8% exceed 10 min (timeout risk)
- Pipeline success: 82% overall pass rate (first attempt); 12% flaky failure rate; 6% deterministic failure; 18% re-run rate
- Artifact management: 1,250 container images; 850 npm/PyPI packages; 42 Helm charts; 15% artifact retention violations; 8 expired artifacts in production
- Environment health: 5 environments (dev, staging, QA, pre-prod, prod); 92% environment parity score; 15 min avg environment provisioning; 3 environment drift incidents/month
- Dashboard reviewed weekly; pipeline optimization sprint monthly with DevEx and platform engineering

## Core viewpoints

- A slow pipeline is a broken pipeline — if your CI takes longer than 5 minutes, engineers stop running it before pushing; they batch commits, skip tests locally, and pray; speed is a feature, not a nice-to-have
- Flaky tests are the silent killer of CI trust — every flaky failure trains engineers to ignore failures; when the pipeline is red 12% of the time for no reason, engineers stop looking at the pipeline
- Artifacts are the only thing between you and "it works on my machine" — if you can't trace a production container back to the exact commit, build command, and dependency versions, you can't debug it
- Environment drift is cumulative — a 5% difference between staging and production today becomes 20% in 6 months if not actively managed; the only safe environment is one that's identical to production

## Key information

### 6-panel CI/CD overview

```
┌──────────────────────────────────────────────────────────────────┐
│  BUILD PERFORMANCE                  │  PIPELINE SUCCESS RATE              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Avg build time: 4.2 min │   │  │  First-attempt pass: 82% │   │
│  │  P95 build time: 12 min  │   │  │  Flaky failure: 12%       │   │
│  │  > 5 min: 28% of builds  │   │  │  Deterministic fail: 6%   │   │
│  │  > 10 min: 8% of builds  │   │  │  Re-run rate: 18%         │   │
│  │  Queue wait: 2.5 min avg │   │  │  False positive: 12%      │   │
│  │  Cache hit rate: 68%     │   │  │  False negative: 0.5%     │   │
│  │  Build score: B- (72)    │   │  │  Pipeline score: B (78)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ARTIFACT MANAGEMENT                │  ENVIRONMENT HEALTH                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Container images: 1,250 │   │  │  Environments: 5          │   │
│  │  Packages: 850            │   │  │  Parity score: 92%        │   │
│  │  Helm charts: 42          │   │  │  Provisioning: 15 min avg │   │
│  │  Retention violations:15% │   │  │  Drift incidents: 3/mo   │   │
│  │  Expired in prod: 8       │   │  │  Config drift: 18 items   │   │
│  │  SBOM attached: 83%       │   │  │  IaC coverage: 88%        │   │
│  │  Artifact score: B (78)   │   │  │  Environment: B- (72)     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  TEST INTEGRATION                   │  DEPLOYMENT FREQUENCY               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Unit: 2.5 min, 92% pass │   │  │  Deployments/day: 38     │   │
│  │  Integration: 4.8 min    │   │  │  CI runs/day: 1,850      │   │
│  │  E2E: 12 min, 78% pass   │   │  │  CD runs/day: 185        │   │
│  │  Test flakiness: 8.5%    │   │  │  Rollback rate: 3.2%     │   │
│  │  Quarantine: 45 tests    │   │  │  Lead time: 2.8 hrs      │   │
│  │  Coverage gate: 85% pass │   │  │  Failed deploy: 2.5%     │   │
│  │  Test score: B (75)      │   │  │  Deploy score: B+ (82)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Build performance by repository

| Repository | Avg build | P95 build | Queue wait | Cache hit | Builds/day | > 5 min % | > 10 min % | Health |
|---|---|---|---|---|---|---|---|---|
| **YiVad** | 5.8 min | 14 min | 3.2 min | 62% | 280 | 42% | 15% | D+ (58) |
| **YiAi** | 6.5 min | 18 min | 4.5 min | 55% | 220 | 48% | 18% | D (55) |
| **YiWeb** | 3.8 min | 10 min | 2.0 min | 72% | 180 | 22% | 5% | B (78) |
| **YiPet** | 4.5 min | 12 min | 2.8 min | 68% | 150 | 32% | 8% | C+ (68) |
| **YiKnowledge** | 2.2 min | 6 min | 1.2 min | 78% | 120 | 8% | 2% | B+ (85) |
| **shared-models** | 1.5 min | 3 min | 0.8 min | 85% | 200 | 2% | 0% | A (92) |
| **auth-service** | 3.2 min | 8 min | 1.5 min | 75% | 95 | 15% | 3% | B (80) |
| **data-pipeline** | 7.2 min | 22 min | 5.5 min | 48% | 85 | 58% | 22% | F (48) |
| **Other (34 repos)** | 4.0 min | 11 min | 2.2 min | 68% | 520 | 25% | 7% | B- (72) |
| **Overall** | **4.2 min** | **12 min** | **2.5 min** | **68%** | **1,850** | **28%** | **8%** | **B- (72)** |

### Build time breakdown (average)

| Build phase | Duration | % of total | Optimization potential | Notes |
|---|---|---|---|---|
| **Checkout/clone** | 18s | 7.1% | Low | Shallow clone, sparse checkout |
| **Dependency install** | 1.8 min | 42.9% | **High** | Cache misses, native module builds |
| **Lint/format** | 22s | 8.7% | Medium | Parallelize, incremental |
| **Compile/transpile** | 45s | 17.9% | Medium | TypeScript, Go build, Rust compile |
| **Unit tests** | 38s | 15.1% | Low | Already parallelized |
| **Integration tests** | 52s | 20.6% | Medium | Test container startup time |
| **Image build** | 1.5 min | 35.7% | **High** | Layer caching, multi-stage builds |
| **Push/publish** | 25s | 9.9% | Low | Parallel push |
| **Total** | **4.2 min** | | | |

### Pipeline success rate by repository

| Repository | First-attempt pass | Flaky failure | Deterministic failure | Re-run pass rate | False positive | MTTR (fix) |
|---|---|---|---|---|---|---|
| **YiVad** | 78% | 15% | 7% | 68% | 15% | 45 min |
| **YiAi** | 75% | 18% | 7% | 62% | 18% | 55 min |
| **YiWeb** | 85% | 10% | 5% | 75% | 10% | 28 min |
| **YiPet** | 80% | 12% | 8% | 70% | 12% | 35 min |
| **YiKnowledge** | 88% | 8% | 4% | 80% | 8% | 18 min |
| **shared-models** | 92% | 5% | 3% | 85% | 5% | 12 min |
| **auth-service** | 86% | 9% | 5% | 78% | 9% | 22 min |
| **data-pipeline** | 68% | 22% | 10% | 55% | 22% | 65 min |
| **Overall** | **82%** | **12%** | **6%** | **72%** | **12%** | **35 min** |

### Top flaky failure causes

| Failure cause | Occurrences/mo | % of all failures | Repos affected | Root cause | Action |
|---|---|---|---|---|---|
| **Test timeout** (exceeded 30s) | 285 | 22% | 12 | Under-provisioned test resources | Increase timeout, parallelize |
| **Network timeout** (npm/pip install) | 220 | 17% | 18 | No package cache, external registry | Local registry mirror, retry logic |
| **Race condition in E2E** | 185 | 14% | 6 | Non-deterministic test ordering | Fix test isolation, add retry |
| **Resource exhaustion** (OOM) | 165 | 13% | 8 | Build agents under-sized | Increase agent memory, limit concurrency |
| **Docker daemon unavailable** | 120 | 9% | 5 | Docker-in-Docker stability | Use Kaniko, buildkit |
| **Port conflict** | 95 | 7% | 4 | Hardcoded test ports | Dynamic port allocation |
| **Database migration conflict** | 85 | 7% | 3 | Parallel migration runs | Serialize migrations, acquire lock |
| **Snapshot/approval test drift** | 75 | 6% | 8 | UI snapshot changes | Auto-update snapshots, review threshold |
| **Other** | 65 | 5% | | | |

### Artifact inventory

| Artifact type | Count | Registry | Retention policy | Violations | Expired in production | SBOM % |
|---|---|---|---|---|---|---|
| **Docker images** (app) | 580 | ECR | 90 days (dev), 365 days (prod) | 12% | 3 | 85% |
| **Docker images** (base) | 180 | ECR | 365 days | 8% | 2 | 78% |
| **Docker images** (tool) | 85 | ECR | 90 days | 18% | 0 | 55% |
| **Docker images** (cache) | 405 | ECR | 30 days | 25% | 0 | N/A |
| **npm packages** | 520 | GitHub Packages | 365 days | 10% | 1 | 82% |
| **PyPI packages** | 185 | AWS CodeArtifact | 365 days | 8% | 0 | 80% |
| **Maven artifacts** | 95 | S3 Maven | 365 days | 5% | 0 | 75% |
| **Go modules** | 50 | GitHub | 365 days | 2% | 0 | 90% |
| **Helm charts** | 42 | OCI (ECR) | 365 days | 15% | 2 | 88% |
| **Terraform modules** | 28 | Terraform Registry | 365 days | 5% | 0 | 92% |
| **Total** | **2,170** | | | **15% avg** | **8** | **83%** |

### Environment health

| Environment | Purpose | Parity score | Provisioning time | Config drift items | Drift from prod | IaC coverage | Last drift scan |
|---|---|---|---|---|---|---|---|
| **dev** | Individual dev sandbox | 78% | 8 min | 42 | 22% | 82% | 2026-08-05 |
| **staging** | Integration testing | 92% | 15 min | 18 | 8% | 88% | 2026-08-05 |
| **QA** | Manual QA, UAT | 85% | 12 min | 28 | 15% | 85% | 2026-08-04 |
| **pre-prod** | Canary, smoke tests | 95% | 18 min | 8 | 5% | 92% | 2026-08-05 |
| **prod** | Production | 100% (baseline) | N/A | 0 | 0% | 95% | 2026-08-05 |
| **Overall** | | **92% avg** | **15 min avg** | **96 total** | | **88%** | |

### Top environment drift items

| Drift item | Environments affected | Impact | Detected | Resolution |
|---|---|---|---|---|
| **Node.js version** (18.14 vs 18.18) | dev (18.14), staging (18.18) | Build inconsistency | 2026-08-03 | Standardize on 18.18 via .nvmrc |
| **Database version** (Postgres 15.3 vs 15.6) | QA (15.3), prod (15.6) | Query plan differences | 2026-08-01 | Upgrade QA to 15.6 |
| **Redis config** (maxmemory 4GB vs 8GB) | staging (4GB), prod (8GB) | OOM in staging tests | 2026-07-28 | Match staging to prod |
| **K8s resource limits** (CPU 500m vs 1000m) | dev (500m), prod (1000m) | Performance test invalid | 2026-07-25 | Standardize limits |
| **Env vars** (12 missing in staging) | staging | Runtime errors | 2026-07-22 | Sync from prod config |
| **SSL/TLS termination** (diff LB config) | QA (ALB), prod (NLB+ALB) | Different TLS behavior | 2026-07-18 | Standardize on NLB+ALB |
| **Log level** (DEBUG vs INFO) | dev (DEBUG), prod (INFO) | Volume mismatch | 2026-07-15 | Standardize, dynamic level |
| **Rate limit** (disabled in QA) | QA | No rate-limit testing | 2026-07-10 | Enable in QA, increase threshold |

### Test integration

| Test stage | Duration | Pass rate | Flakiness | Parallel jobs | Coverage gate | Blocking |
|---|---|---|---|---|---|---|
| **Lint/format** | 22s | 95% | 0% | 1 | N/A | Yes |
| **Type check** | 35s | 92% | 0% | 1 | N/A | Yes |
| **Unit tests** | 38s avg | 92% | 2.5% | 8 | 80% line | Yes |
| **Integration tests** | 4.8 min avg | 85% | 5.2% | 4 | 70% branch | Yes |
| **E2E tests** | 12 min avg | 78% | 8.5% | 2 | 60% critical path | Yes (staging+) |
| **Security scan** | 3.2 min | 88% | 1.5% | 1 | Critical/High CVEs | Yes |
| **License scan** | 45s | 98% | 0% | 1 | No copyleft violations | Yes |
| **Container scan** | 2.5 min | 90% | 2.0% | 1 | No critical CVEs | Yes |
| **Performance test** | 8 min | 82% | 5.0% | 1 | No regression > 20% | No (staging only) |
| **Overall** | | | **8.5% avg** | | | |

### Quarantined tests (flaky test debt)

| Test | Repository | Flaky since | Flake rate | Quarantine date | Root cause | Action |
|---|---|---|---|---|---|---|
| **PaymentGateway.test.ts** | YiWeb | 2026-06-15 | 35% | 2026-07-01 | External API timeout | Mock external API, retry logic |
| **AgentLoop.integration.ts** | YiAi | 2026-05-20 | 28% | 2026-06-15 | LLM non-determinism | Seed responses, snapshot testing |
| **WebSocket.reconnect.spec.ts** | YiVad | 2026-07-01 | 42% | 2026-07-20 | Race condition in reconnect | Fix event ordering |
| **ExportCSV.large.ts** | YiWeb | 2026-04-10 | 22% | 2026-05-01 | Memory exhaustion | Streaming test, smaller fixture |
| **FileUpload.concurrent.spec.ts** | YiPet | 2026-07-15 | 38% | 2026-08-01 | Port conflict | Dynamic port allocation |
| **CacheInvalidation.spec.ts** | auth-service | 2026-03-22 | 25% | 2026-04-15 | Timing-dependent assertion | Use eventual consistency matcher |
| **...40 more quarantined** | | | | | | |

### Deployment frequency

| Metric | Current | 3 months ago | 6 months ago | Target | Trend |
|---|---|---|---|---|---|
| **Deployments/day** | 38 | 32 | 25 | 50+ | ↑ |
| **CI runs/day** | 1,850 | 1,620 | 1,350 | 2,000+ | ↑ |
| **CD runs/day** | 185 | 155 | 120 | 250+ | ↑ |
| **Lead time** (commit→prod) | 2.8 hrs | 3.5 hrs | 5.2 hrs | < 1 hr | ↓ |
| **Rollback rate** | 3.2% | 4.0% | 5.5% | < 2% | ↓ |
| **Failed deploy rate** | 2.5% | 3.5% | 4.8% | < 1% | ↓ |
| **Deploy on Friday %** | 8% | 10% | 12% | < 5% | ↓ |
| **Deploy outside business hrs** | 15% | 18% | 22% | < 10% | ↓ |

### Pipeline infrastructure

| Component | Current | Capacity | Utilization | Scaling | Health |
|---|---|---|---|---|---|
| **Build agents** (Linux) | 6 | 10 concurrent | 72% | Auto-scale at 80% | Green |
| **Build agents** (macOS) | 2 | 3 concurrent | 85% | Manual, needs more | Yellow |
| **CI runners** (GitHub Actions) | 42 repos | 20 concurrent | 68% | GitHub-hosted | Green |
| **Container registry** (ECR) | 1,250 images | 10 TB | 42% | Managed | Green |
| **Package registry** (CodeArtifact) | 850 packages | 500 GB | 35% | Managed | Green |
| **Artifact storage** (S3) | 2.5 TB | 5 TB | 50% | Managed | Green |
| **Pipeline cache** (S3 + EFS) | 850 GB | 2 TB | 42% | Managed | Green |
| **Secrets manager** | 280 secrets | 500 | 56% | Managed | Green |

## Action recommendations

1. **Build time reduction**: 28% of builds exceed 5 min, 8% exceed 10 min; optimize dependency caching (68%→90%), implement remote build caching, and parallelize image builds; target avg < 3 min
2. **Flaky test elimination**: 12% flaky failure rate, 45 quarantined tests; fix top 10 flaky tests (account for 60% of failures), implement auto-quarantine and auto-retry with flake detection
3. **Data pipeline build fix**: 7.2 min avg, 22% flaky failure, F grade; dedicated build agent, increase resources, fix network timeouts with local registry mirror
4. **Environment drift elimination**: 96 drift items, 3 drift incidents/month; implement drift detection in CI/CD, auto-remediate non-critical drift, alert on critical drift within 1 hour
5. **Artifact retention enforcement**: 15% retention violations, 8 expired artifacts in production; enforce lifecycle policies, auto-delete expired artifacts, block deployment of expired artifacts
6. **E2E test reliability**: 78% pass rate, 8.5% flakiness; re-architect E2E for determinism, implement retry with exponential backoff, target 90% pass rate
7. **Queue wait reduction**: 2.5 min avg queue wait; auto-scale build agents at 70% utilization, add 2 Linux agents, target < 1 min queue wait
8. **Environment provisioning speed**: 15 min avg, pre-prod takes 18 min; pre-build golden AMIs, cache dependencies, target < 8 min provisioning
9. **Test quarantine hygiene**: 45 quarantined tests, some > 6 months; monthly quarantine review, fix or delete tests quarantined > 90 days
10. **Weekly pipeline review**: review build performance, success rate, flaky failures, environment drift, artifact hygiene, and deployment frequency with DevEx and platform engineering



- The "it passes on my machine" excuse → if CI fails but your machine passes, your machine is wrong; the CI environment is the source of truth, and local dev should match it as closely as possible
- Re-run until green → clicking "re-run" on a failed pipeline until it passes without investigating the failure; every re-run without a root cause fix is a future production incident waiting to happen
- The monolith pipeline → one pipeline that builds, tests, scans, and deploys everything for every commit; if your pipeline takes 20 minutes, it's not a pipeline — it's a bottleneck
- Environment snowflakes → manually tweaking environment configs to "fix" issues; every manual change is a drift event that will bite you when you least expect it
- Cache everything blindly → caching node_modules, pip packages, and Docker layers without cache invalidation strategy; stale caches cause "it works in CI but not in production" bugs that are impossible to reproduce

## Related

- Same class: [dashboard-dora-metrics](dashboard-dora-metrics.md) — DORA delivery metrics
- Same class: [dashboard-deployment-safety](dashboard-deployment-safety.md) — deployment safety
- Same class: [dashboard-database-performance](dashboard-database-performance.md) — database performance
- Same class: [dashboard-team-velocity](../process/dashboard-team-velocity.md) — team velocity
- Same class: [dashboard-release-management](../../oncall-sre/release/dashboard-release-management.md) — release management
- References: Google — *DORA Accelerate State of DevOps*; Jez Humble, Dave Farley — *Continuous Delivery*; GitHub — *Actions Best Practices*; Buildkite — *CI/CD Pipeline Patterns*; ThoughtWorks — *CI/CD Maturity Model*