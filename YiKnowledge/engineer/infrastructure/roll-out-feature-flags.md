---
title: Roll out feature flags
aliases: [i-want-to-roll-out-feature-flags, roll-out-feature-flags, feature-flag-infra]
tags: [journey, methodology, feature-flag, experiment, kill-switch, grayscale]
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "migration is reversible"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - cross-references to related journeys and patterns are present
related:
  - ./ship-a-release.md
  - ../../tech-lead/roadmap/deprecate-a-feature.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../infrastructure/set-up-ci-cd.md
  - ../../ai-engineer/platform/evaluate-an-llm-app.md
  - ../../product-manager/frameworks/launch-an-ai-product.md
  - ../../engineer/engineering/evaluation-driven-development.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: "Feature flags are not ad-hoc switches; they are five-in-one infrastructure: grayscale + experiment + kill switch + config + personalization; flags also have a lifecycle"
---

# I want to land feature flags

> **As an** engineer, **I want to** roll out feature flags, **so that** migration is reversible.

## Summary

- Five uses of feature flags: grayscale release + A/B experiment + kill switch + remote config + personalization
- Flag lifecycle: create → grayscale → 100% → cleanup; not cleaning up becomes tech debt
- Flag types: release / experiment / ops / permission / long-term; type determines cleanup strategy
- Grayscale dimensions: user % / user ID / cohort / device / region / time window
- Kill switch: 1 line of config turns off a feature; incident response
- Eval set + monitoring triplet as gatekeepers; flag toggles trigger alerts

## Scenario

New feature needs grayscale, needs A/B experiment, needs remote toggle, needs emergency kill; feature flags are infrastructure. This entry provides the landing path for flag infrastructure, covering five uses, lifecycle, types, grayscale dimensions, kill switch, monitoring gatekeeping, and links to experiments, releases, observability, secrets/config, CI/CD and other leaves.

## 2-hop reachability paths

| Hops | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | Experiment | [./run-an-experiment.md](../quality-security/run-an-experiment.md) |
| 1 hop | Release | [./ship-a-release.md](./ship-a-release.md) |
| 2 hops | Deprecate feature | [../../tech-lead/roadmap/deprecate-a-feature.md](../../tech-lead/roadmap/deprecate-a-feature.md) |
| 2 hops | Observability | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hops | Secrets/config | [../strategies/handle-secrets-and-config.md](../quality-security/handle-secrets-and-config.md) |
| 2 hops | CI/CD | [../tools/set-up-ci-cd.md](set-up-ci-cd.md) |
| 2 hops | LLM evaluation | [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) |
| 2 hops | AI product release | [../../product-manager/frameworks/launch-an-ai-product.md](../../product-manager/frameworks/launch-an-ai-product.md) |
| 2 hops | Evaluation-driven | [../../engineer/engineering/evaluation-driven-development.md](../engineering/evaluation-driven-development.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |

## Action recommendations

1. **Five uses in one**: grayscale release + A/B experiment + kill switch + remote config + personalization; do not rebuild infrastructure
2. **Flag type tiering**: release (cleanup on release) / experiment (cleanup after experiment) / ops (kept for incident response) / permission (long-term) / long-term (feature permanent); type determines cleanup strategy
3. **Grayscale dimensions**: user % / user ID / cohort / device / region / time window; multi-dimensional combinations
4. **Kill switch 1-line config**: incident response toggles off a feature in 1 line of config; no deploy wait
5. **Flag lifecycle**: create → grayscale → 100% → cleanup; not cleaning up becomes tech debt
6. **Flag naming convention**: `flag_<scope>_<feature>_<purpose>`; include creation date + owner + cleanup date
7. **Flag evaluation period**: flag creation tags cleanup date; auto-alert on overdue
8. **Flags do not replace config**: long-term config goes to a config center; flags are temporary
9. **Eval set gatekeeping**: see [eval-driven pattern](../engineering/evaluation-driven-development.md); flag toggle triggers eval set regression
10. **Monitoring alerts**: flag toggle triggers alerts; error rate / latency / resource monitoring
11. **Flags do not nest**: nesting flags causes combinatorial explosion; do not nest
12. **Client + server**: client-side flags receive config push; server-side flags go via config center
13. **Flag SDK abstraction**: SDK abstracts the backend; do not call vendor directly in business code
14. **First principles**: why must flags; worst consequence of no flags; flag cost ÷ benefit
15. **Inversion thinking**: how much can deploy replace flags; if deploy suffices, do not flag
16. **Occam**: the fewer flags the better; cut redundant flags

## Related

- Experiment: [./run-an-experiment.md](../quality-security/run-an-experiment.md) — A/B experiment
- Release: [./ship-a-release.md](./ship-a-release.md) — grayscale release
- Deprecate: [../../tech-lead/roadmap/deprecate-a-feature.md](../../tech-lead/roadmap/deprecate-a-feature.md) — flag-gated deprecation
- Observability: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — monitoring alerts
- Secrets/config: [../strategies/handle-secrets-and-config.md](../quality-security/handle-secrets-and-config.md) — remote config
- CI/CD: [../tools/set-up-ci-cd.md](set-up-ci-cd.md) — flag toggle gate
- LLM evaluation: [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) — LLM grayscale
- AI product release: [../../product-manager/frameworks/launch-an-ai-product.md](../../product-manager/frameworks/launch-an-ai-product.md) — traffic cut
- Pattern: [eval-driven](../engineering/evaluation-driven-development.md)
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
