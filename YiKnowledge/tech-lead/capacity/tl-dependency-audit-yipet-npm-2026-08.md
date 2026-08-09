---
title: YiPet npm audit 2026-08
lifecycle: active
status: stable
key: tl_dependency-audit_yipet_npm_2026_08
tags:
- dependency
- audit
- npm
- yipet
ecosystem: npm
audit_date: '2026-08-03'
total_deps: 318
outdated: 15
vulnerable: 0
unmaintained: 1
type: summary
category: tech-lead/capacity
created: 2026-08-07
updated: 2026-08-07
source: internal
roles:
- tech-lead
- engineer
benefit: Tech leads can track capacity and cost trends to prevent resource exhaustion and budget overruns
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
review_cycle: quarterly
tacit: false
related:
  - ./dashboard-engineering-capacity.md
  - ./dashboard-talent-retention.md
  - ./tl-capacity-cost-2026-08-trend.md
  - ../README.md
  - ../INDEX.md
---

# Dependency Audit — YiPet npm — 2026-08-03

> **As a** tech lead, **I want to** tl_dependency audit_yipet_npm_2026_08, **so that** capacity bounded.

## Audit Summary

- **Ecosystem:** npm / Node.js
- **Audit date:** 2026-08-03
- **Tool used:** `pnpm audit` + `pnpm outdated` (Biome 2.5 already landed)
- **Total dependencies:** 318

## Findings

### Critical CVEs

| Package | Installed | Patched | CVE | Severity | Action |
|---------|-----------|---------|-----|----------|--------|
| (none) | | | | | |

### Outdated (major version behind)

| Package | Current | Latest | Breaking changes | Migration effort |
|---------|---------|--------|------------------|------------------|
| react | 18.3.x | 18.3.x | (current) | 0 |
| ant | 5.21.x | 5.21.x | (current) | 0 |
| biome | 2.5.x | 2.5.x | (current) | 0 |
| zustand | 4.5.x | 5.x | API changed | medium |
| (12 others minor-behind) | | | | low |

### Unmaintained / Deprecated

| Package | Last release | Risk | Replacement |
|---------|-------------|------|-------------|
| (1 Bootstrap legacy dep to be cleaned) | | | |

## Recommendations

1. **Zustand 5 upgrade** — API change requires manual store migration, estimated 1 person-day.
2. **Bootstrap legacy cleanup** — after React 18 migration Bootstrap is unused, remove dependency.
3. **Supply-chain hardening** — co-build with YiVad lockfile + npm audit CI gate.

---
> References: YiKnowledge → work/processes/dependency-upgrade-process.md | engineer/quality-security/harden-supply-chain.md
> Yi family: YiVad (npm/Element Plus/Rsbuild) | YiPet (npm/React/Ant Design) | YiAi (pip/FastAPI/Motor/llama_index)
