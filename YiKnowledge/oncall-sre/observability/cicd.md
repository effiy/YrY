---
title: CI/CD pipeline design and observability
aliases:
- cicd-pipeline-observability
- cicd-design
- pipeline-observability
- deployment-pipeline
tags:
- cicd
- devops
- pipeline
- deployment
- observability
- dora-metrics
category: oncall-sre/observability
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- oncall-sre
- engineer
- tech-lead
benefit: "teams can design observable CI/CD pipelines that catch failures early and provide deployment confidence"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./docker-kubernetes.md
- ./containerized-deployment.md
- ../set-up-observability.md
- ../../engineer/infrastructure/set-up-ci-cd.md
- ../../engineer/infrastructure/dashboard-dora-metrics.md
tacit: false
---

# CI/CD pipeline design and observability

> **As an** oncall SRE, **I want to** design and monitor CI/CD pipelines, **so that** deployment failures are detected early, build times are optimized, and release confidence is measurable.

> CI/CD observability goes beyond "did the build pass": it tracks pipeline performance, deployment frequency, change failure rate, and mean time to recovery. These four DORA metrics are the industry standard for measuring delivery performance.

## Summary

- A well-designed CI/CD pipeline has four stages: build, test, scan, deploy -- each with distinct observability requirements.
- The four DORA metrics (deployment frequency, lead time for changes, change failure rate, mean time to recovery) are the canonical framework for measuring pipeline effectiveness.
- Pipeline observability requires metrics (duration, success rate, flakiness), logs (build output, test results), and traces (end-to-end pipeline run visibility).
- Security scanning (SAST, dependency scanning, container image scanning) must be part of the pipeline, not a separate process.
- Build optimization (caching, parallelization, incremental builds) has a direct ROI: faster feedback loops improve developer productivity.

## Core viewpoints

### 1. Pipeline metrics are product metrics, not infrastructure metrics

A slow or flaky pipeline directly impacts developer productivity and deployment confidence. Track pipeline duration (P50/P95), pass rate, and flaky test rate as KPIs. When the pipeline takes > 10 minutes for a simple change, developers context-switch and lose flow. When the flaky test rate exceeds 5%, engineers stop trusting test results and start ignoring failures.

### 2. Security scanning must shift left, not bolt on

SAST (static analysis), dependency scanning (SCA), and container image scanning must run in the CI pipeline before deployment. A scan that runs after deployment is a detection mechanism, not a prevention mechanism. The pipeline should block deployments on critical vulnerabilities (CVSS >= 9.0) and warn on high-severity (CVSS >= 7.0). However, do not block on all findings -- that creates alert fatigue and leads to bypasses.

### 3. The deployment stage is the riskiest, and it needs the most observability

Deployment is where configuration drift, environment differences, and infrastructure issues surface. Every deployment should produce: a deployment event (timestamp, version, environment), health check results, and rollback trigger status. Canary deployments and blue-green deployments require additional metrics: traffic split percentage, error rate comparison between old and new versions, and automated rollback criteria.

### 4. Test flakiness is a reliability problem, not a test quality problem

Flaky tests erode trust in the entire pipeline. When engineers routinely retry failed pipelines because "it's probably flaky," the pipeline has lost its signal value. Track flaky test rate per test suite, quarantine flaky tests (> 3 flakes in a week), and require a fix before un-quarantining. Treat flaky tests with the same severity as production bugs.

## Key info

### DORA metrics framework

| Metric | Definition | Elite target | Low target |
|---|---|---|---|
| Deployment Frequency | How often code is deployed to production | On-demand (multiple per day) | Once per month |
| Lead Time for Changes | Time from commit to production | < 1 hour | 1-6 months |
| Change Failure Rate | Percentage of deployments causing failure | 0-5% | 46-60% |
| Mean Time to Recovery | Time to restore service after failure | < 1 hour | 1 week+ |

### Pipeline stage observability

| Stage | Key metrics | Key logs | Alerts |
|---|---|---|---|
| Build | Duration, cache hit rate | Compilation output, dependency resolution | Build duration > 2x baseline |
| Test | Pass rate, duration, flaky rate | Test results, coverage report | Flaky rate > 5%, coverage drop |
| Scan | Scan duration, vulnerability count | SAST findings, dependency CVEs | Critical CVE detected |
| Deploy | Success rate, rollback rate, duration | Deploy log, health check output | Deploy failure, rollback triggered |

### Build optimization strategies

1. **Dependency caching**: Cache `node_modules`, `.m2`, `pip cache` between builds. Reduces build time by 40-60%.
2. **Layer caching in Docker**: Order Dockerfile instructions from least to most frequently changing. `COPY package.json` before `COPY .` to leverage layer caching.
3. **Parallelization**: Run lint, unit tests, and integration tests in parallel stages. Use matrix builds for multi-platform testing.
4. **Incremental builds**: Only rebuild changed modules. Use tools like Nx, Turborepo, or Bazel for monorepo build orchestration.
5. **Build artifact caching**: Cache build outputs and reuse them across pipeline runs when dependencies haven't changed.

### Pipeline observability stack

- **Metrics**: Prometheus Pushgateway for pipeline metrics, or built-in CI platform metrics (GitHub Actions, GitLab CI).
- **Logs**: Centralized log aggregation for build output. Structured logging in build scripts.
- **Traces**: Pipeline run IDs that correlate build -> test -> deploy stages. OpenTelemetry spans for each stage.
- **Dashboards**: DORA metrics dashboard, pipeline health dashboard, test flakiness dashboard.

## Action recommendations

1. Instrument all pipelines with the four DORA metrics; track them weekly and review trends monthly.
2. Implement security scanning (SAST, SCA, container scanning) as blocking stages in the CI pipeline for critical vulnerabilities.
3. Build a pipeline health dashboard: duration (P50/P95), pass rate, flaky test rate, and deployment success rate.
4. Set up alerts for: pipeline duration > 2x baseline, flaky test rate > 5%, critical CVE detected, deployment failure.
5. Quarantine flaky tests automatically after 3 failures in a week; require a fix ticket before un-quarantining.
6. Optimize build caching: measure cache hit rate and target > 80% for dependency caching.
7. Use canary or blue-green deployment for production; automate rollback when error rate in canary exceeds baseline by > 2x.

## Anti-patterns

- **Security scanning as a separate process** -- scanning after deployment means you are detecting, not preventing; shift left.
- **No flaky test quarantine** -- engineers retry failed pipelines by habit, and genuine failures are missed.
- **Pipeline duration without limits** -- if the pipeline takes 30+ minutes, developers batch large changes, increasing change failure rate.
- **Manual deployment gates** -- manual approval steps become bottlenecks; automate with canary analysis and health checks.
- **Alerting on every pipeline failure** -- generates noise; alert only on production deployment failures and flaky rate trends.
- **No rollback automation** -- manual rollback takes minutes when it should take seconds; automated rollback is a reliability requirement.

## Related

- Same category: [./docker-kubernetes.md](./docker-kubernetes.md) -- container observability
- Same category: [./containerized-deployment.md](./containerized-deployment.md) -- deployment strategies
- Same category: [../set-up-observability.md](./set-up-observability.md) -- observability setup journey
- Upstream: [../../engineer/infrastructure/set-up-ci-cd.md](../../engineer/infrastructure/set-up-ci-cd.md) -- CI/CD setup guide
- Upstream: [../../engineer/infrastructure/dashboard-dora-metrics.md](../../engineer/infrastructure/dashboard-dora-metrics.md) -- DORA metrics dashboard

## References

- DORA (DevOps Research and Assessment) -- Accelerate State of DevOps Report
- Google Cloud -- DORA metrics documentation
- GitHub Actions / GitLab CI -- pipeline metrics documentation