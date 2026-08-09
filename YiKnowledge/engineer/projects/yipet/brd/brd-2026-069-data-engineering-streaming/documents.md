---
lifecycle: active
category: engineer/projects/yipet/brd/brd-2026-069-data-engineering-streaming
roles:
- engineer
benefit: project context preserved
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- Filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
review_cycle: quarterly
tacit: false
related: []
status: stable
type: brd
---

# brd-2026-069 YiPet MV3 dual-world boundary governance — documentation collection

> **As an** engineer, **I want to** documents, **so that** project context preserved. 

## 1. Business background
YiPet is the Yi family browser extension (Chrome MV3 + React 18.3 + Ant Design 5.21 + Rsbuild 1 + Biome 2.5 + Vitest 2 + TS 5.5 strict). Form: desktop pet companion + multi-role chat + popup console + on-demand CDN resource injection + full i18n (en + zh_CN) + timezone-aware. Core reality: **MV3 dual execution contexts** (ISOLATED world content script + MAIN world injection); all code changes must respect this boundary. Current pain points: dual-world boundary violations 3; API four-tier cross-level imports 5; RPC contract field violations 3 (filter/target_file/data.key). 

## 2. Platform documentation
- Architecture overview: [architecture.md](../../architecture.md) (tech stack / API four tiers / dual-world boundary / data flow / graceful degradation / anti-patterns) 
- Functional modules: [functional-modules.md](../../functional-modules.md) (10 top-level catalogs / 6 services / 4 popup / 19 chat / content / shared / background / config) 
- Development standards: [dev-standards.md](../../dev-standards.md) (naming / TSX / API four tiers / MV3 dual-world / style co-location / i18n / time / CSP / Biome / Vitest) 
- MV3 dual-world ADR: [chrome-manifest-dual-world-boundary.md](../../../../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md) (type branding + envelope) 
- Biome lint ADR: [biome-lint-format.md](../../../../../tech-lead/decisions/yipet--biome-lint-format.md) (Biome 2.5 replaces ESLint + Prettier) 

## 3. Related documentation
- BRD-2026-061 zero-trust (CSP + supply-chain hardening) 
- BRD-2026-064 cost optimization (no vendor lock-in) 
- BRD-2026-066 DevEx (onboarding + Champion mentoring) 
- YiVad shared client baseline (rpcCall + sseStream + YiAiError) 
- YiAi backend RPC contract (filter / target_file / data.key) 
