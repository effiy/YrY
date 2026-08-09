---
lifecycle: active
category: engineer/projects/yipet/brd/brd-2026-069-data-engineering-streaming
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
type: brd
---

# brd-2026-069 YiPet MV3 dual-world boundary governance — Milestones

> **As an** engineer, **I want to** milestones, **so that** project context preserved.

## M1: 2026 Q3 MV3 skeleton + dual-world boundary
- manifest.json + background service worker + content script injection
- shared/types/world.ts type branding (ISOLATED + MAIN)
- shared/types/messages.ts typed envelope
- Biome lint forbids `as any` across worlds
- Estimated 1 week

## M2: 2026 Q4 shared client vendor
- shared/api/rpc.ts (rpcCall<T>)
- shared/api/sse.ts (sseStream + done frame guard + releaseLock)
- shared/api/error.ts (YiAiError + error normalization)
- Contract test co-build (YiAi / YiVad / YiPet three ends)
- RPC field unification: filter not query / target_file not path / data.key

## M3: 2027 Q1 full i18n + supply chain hardening retrospective
- i18n key 100% (en + zh_CN + MessageKey union)
- UTC-first timestamps across the board
- Supply chain hardening retrospective (high CVE = 0)
- Methodology distillation: dual-world + shared-client-vendor
