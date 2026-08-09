---
lifecycle: active
title: brd-2026-069-data-engineering-streaming: acceptance
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
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
review_cycle: quarterly
tacit: false
related: []
status: stable
type: summary
---

# brd-2026-069 YiPet MV3 double world boundary governance — Acceptance

> **As an** engineer, **I want to** acceptance, **so that** project context preserved.

## 1. Functional acceptance
- MV3 double world type branding 100% coverage (ISOLATED + MAIN)
- Typed message envelope for all traffic (chrome.runtime.onMessage end to end)
- API four-tier cross-layer import = 0 (Biome lint static block)
- Shared client vendor: rpcCall + sseStream + YiAiError + unified error mapping
- i18n key coverage 100% (en + zh_CN + MessageKey type union)

## 2. Performance acceptance
- Content script injection P95 < 500ms
- Service worker cold start < 1s
- Chat first-token latency < 2s (SSE first frame)
- chrome.storage read/write < 50ms
- React 18.3 render < 16ms (no long task blocking)
- Chat bundle size < 350KB gzipped

## 3. Security acceptance
- CSP 0 violations (no remote code / no eval / no inline script)
- Vendor assets all under `public/cdn/vendor/`
- Supply chain high CVEs = 0
- min-release-age >= 7d
- Lockfile + audit + allowlist quartet all in place
- Double world boundary type branding blocks `as any` across worlds

## 4. Cost acceptance
- 0 new commercial dependencies (Biome 2.5 replaces ESLint + Prettier already in place)
- 0 vendor lock-in (self-hosted YiAi backend)
- Shared client vendor reuses YiVad baseline = 0 duplicated design cost
- 2 FTE x 12 months + 0 vendor fee
