---
lifecycle: active
title: "brd-2026-069-data-engineering-streaming: objectives"
created: 2026-08-07
tags: [yipet, brd]
updated: 2026-08-09
category: engineer/projects/yipet/brd/brd-2026-069-data-engineering-streaming
source: internal
roles:
- engineer
benefit: project context preserved
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
review_cycle: quarterly
tacit: false
related: []
status: stable
type: summary
---

# brd-2026-069 YiPet MV3 Dual-World Boundary Governance — Objectives

> **As an** engineer, **I want to** objectives, **so that** project context preserved.

## 1. Business objectives
- Dual-world boundary violations from 3 → 0 (ISOLATED + MAIN mixed-use silent breakage)
- Cross-project RPC contract field violations from 3 → 0 (filter is not query / target_file is not path / update_document reads data.key)
- i18n key coverage from 92% → 100% (en + zh_CN in sync)

## 2. Technical objectives
- MV3 dual-world type branding 100% + typed message envelope full coverage
- API four-tier cross-tier imports from 5 → 0 (types do not import services; client does not import services)
- Shared client vendor (rpcCall + sseStream + YiAiError) consistent with YiVad / YiAi contract
- CSP 0 violations (no remote code / no eval / no inline script; vendor fully local public/cdn/vendor/)
- Supply-chain hardening prerequisites (lockfile + audit + min-release-age + allowlist four-piece set)

## 3. Measurement
- Dual-world boundary violation count (type branding + envelope-ization rate)
- API four-tier cross-tier import count (Biome lint static blocking)
- RPC contract field violation count (filter / target_file / data.key)
- i18n key coverage + MessageKey type union completeness
- Content-script injection P95 latency + service-worker cold-start time
- Supply-chain high CVE count + min-release-age days

## 4. Long-term evolution
- 24 months: YiPet becomes the Yi family "MV3 platform + cross-project envelope governance" baseline
- Reusable methodology: dual-world type branding + shared client vendor + cross-project envelope governance
- Cross-extension replication: YiWeb / other browser extensions reuse YiPet platform layer
- AI assistance: LLM-assisted parity diff detection + i18n key drift alerting
