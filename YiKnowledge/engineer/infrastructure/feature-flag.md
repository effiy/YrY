---
title: Feature flag pattern / Feature flag pattern
aliases: [feature-flag-pattern, feature-toggle-pattern, kill-switch-pattern]
tags: [methodology, engineering-patterns, feature-flag, kill-switch, grayscale, experiment]
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: flag is temporary not permanent; flag has lifecycle; create immediately mark cleanup date; overdue alert; no nesting do not replace config
roles: [engineer, tech-lead, oncall-sre]
benefit: "Features are toggled at runtime without redeploying code, enabling gradual rollouts, A/B testing, and kill switches"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - at least one concrete example or code snippet is provided
related:
  - ../infrastructure/roll-out-feature-flags.md
  - ../quality-security/run-an-experiment.md
  - ../infrastructure/ship-a-release.md
  - ../../tech-lead/roadmap/deprecate-a-feature.md
  - ../lessons/win-yiai-llm-phase-three.md
  - ../lessons/win-yiai-llm-phase-five.md
  - ../lessons/win-yipet-aicr-phase-four.md
---

# Feature flag pattern

> **As an** engineer, **I want to** feature flag, **so that** pattern applied consistently. 

## Summary

- Flag five uses in one: gradual rollout release + A/B experiment + kill switch + remote config + personalization
- Flag lifecycle: create → gradual rollout → 100% → cleanup; not cleanup becomes tech debt
- Type layered: release (release immediately cleanup) / experiment (experiment end cleanup) / ops (incident emergency keep) / permission (long-term keep) / long-term (feature permanent keep) 
- Gradual rollout dimension: user % / user ID / cohort / device / region / time window
- Kill switch: 1 line config turn off feature; incident emergency
- Flag no nesting: nesting causes combination explosion; no nesting

## Applicable scenarios

New feature gradual rollout release, A/B experiment, emergency kill, remote config, personalized experience; any scenario needing "other side unchanged I unchanged"; cross-team impact goes gradual rollout; incident emergency turn off feature; experiment split-stream. 

## Core points

### 1. Flag five uses in one

Don't rebuild infrastructure; flag same time bears five purposes. 

- **Gradual rollout release**: 1% → 10% → 50% → 100%
- **A/B experiment**: compare experiment
- **Kill switch**: incident emergency 1 line config turn off feature
- **Remote config**: no deployment immediately change config
- **Personalization**: by user attribute toggle

### 2. Flag lifecycle

Flag has lifecycle; create immediately mark cleanup date. 

```
create → grayscale 1% → grayscale 10% → grayscale 50% → 100% → cleanup
```

- When creating fill cleanup date
- Overdue auto alert
- Release flag launch immediately cleanup
- Experiment flag experiment end immediately cleanup
- Ops / permission / long-term keep

### 3. Type layered

| type | purpose | cleanup strategy |
|---|---|---|
| release | gradual rollout release | release immediately cleanup |
| experiment | A/B experiment | experiment end cleanup |
| ops | incident emergency | keep |
| permission | permission control | long-term keep |
| long-term | feature permanent keep | no cleanup |

### 4. Gradual rollout dimension

- user % (by ratio) 
- user ID (allowlist / blocklist) 
- cohort (by user attribute) 
- device (PC / mobile / tablet) 
- region (country / area) 
- time window (by time toggle) 

### 5. Kill switch

Incident emergency 1 line config turn off feature. 

- No wait deployment
- 1 line config off
- Monitoring alert sync
- After off keep fallback

### 6. Flag no nesting

- Nesting causes combination explosion
- Nesting causes combination test infeasible
- Nested flag must split

### 7. Flag does not replace config

Long-term config goes config center; flag is temporary. 

- Long-term config = config center
- Short-term toggle = flag
- No mixing

### 8. Flag SDK abstraction

SDK abstracts backend; not call vendor directly in business code. 

- SDK abstracts vendor
- Business code only calls SDK
- Vendor switch does not impact business

## Anti-patterns

- **Flag not cleanup**: After launch forgot cleanup → tech debt → must lifecycle + overdue alert
- **Flag nesting**: Flag nested → combination explosion → must no nesting
- **Flag replace config**: Long-term config using flag → maintenance cost high → must split
- **Business code calls vendor**: Business code directly calls vendor → vendor switch impacts business → must SDK abstraction
- **Kill switch no monitoring**: Kill switch after off no monitoring → don't know effective → must monitoring alert
- **Flag no expiry date**: No cleanup date → overdue no alert → must expiry date
- **Flag type not split**: All flags same cleanup strategy → long-term flag accidentally cleaned → must type layered

## Co-build

- journeys: [i-want-to-roll-out-feature-flags](roll-out-feature-flags.md) + [i-want-to-run-an-experiment](../quality-security/run-an-experiment.md) + [i-want-to-ship-a-release](ship-a-release.md) + [i-want-to-deprecate-a-feature](../../tech-lead/roadmap/deprecate-a-feature.md)
- implementation win: [yiai-llm-phase-three-win](../lessons/win-yiai-llm-phase-three.md) + [yiai-llm-phase-five-win](../lessons/win-yiai-llm-phase-five.md) + [yipet-aicr-phase-four-win](../lessons/win-yipet-aicr-phase-four.md)
- Companion pattern: [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md) + [dual-world-boundary-pattern](../engineering/dual-world-boundary.md) + [one-to-one-mapping-migration-pattern](../architecture-design/one-to-one-mapping-migration.md) + [contract-test-baseline-pattern](../quality-security/contract-test-baseline.md)
