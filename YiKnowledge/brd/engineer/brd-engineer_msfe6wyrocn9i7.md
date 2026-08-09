---
title: BRD-2026-069 YiPet MV3 Dual-World Boundary Governance
lifecycle: active
key: brd_brd-engineer_msfe6wyrocn9i7
tags:
- engineer
- yipet
- chrome-extension
- mv3
- dual-world
- react18
- l3-maturity
brd_id: BRD-2026-069
project: yipet
domain: Browser Extension MV3 Platformization & Cross-Project RPC Contract Governance
quarter: 2026 Q3
priority: p1
status: in_progress
owner: YiPet primary owner
tech_stack: Chrome MV3, React 18.3, Ant Design 5.21, Rsbuild 1.0, TypeScript 5.5 strict,
  Biome 2.5, Vitest 2, chrome.storage, service worker
key_metrics: Dual-world boundary violations 3->0; API four-tier cross-level imports 5->0; RPC contract field violations (filter != query / target_file != path) 3->0; 
  i18n key coverage 92%->100%; CSP violations 0; content script injection P95 <500ms; service worker cold start <1s; supply chain
  high CVE=0
acceptance_criteria: '1. MV3 dual-world boundary violation events from 3 -> 0 (type branding + envelope full-volume) 

  2. API four-tier cross-level imports from 5 -> 0 (types do not import services; client does not import services) 

  3. Cross-project RPC contract field violations from 3 -> 0 (filter is not query; target_file is not path; update_document reads data.key) 

  4. i18n key coverage rate 92% -> 100% (en + zh_CN sync; MessageKey type union full-volume) 

  5. CSP violations 0 (no remote code / no eval / no inline script; vendor fully local public/cdn/vendor/) 

  6. supply chain high CVE = 0; min-release-age >= 7d; lockfile + audit + allowlist four-piece set'
stakeholders: CTO (Decision); YiPet primary owner (execution); YiVad primary owner (reference baseline); YiAi primary owner (RPC contract co-build);
  business team (consumption); SRE/DevOps (ops); security compliance (CSP + supply chain); Architecture committee (review)
kb_path: engineer/projects/yipet/brd/brd-2026-069-data-engineering-streaming
notes: Through MV3 dual-world boundary governance (type branding + envelope) + API four-tier cross-level block + cross-project RPC contract unified, 
  evolve YiPet from a "single extension" into an "MV3 Platformization + Cross-Project Envelope Governance" baseline. 
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# BRD-2026-069 YiPet MV3 Dual-World Boundary Governance

**BRD ID**: BRD-2026-069  |  **Project**: yipet  |  **Domain**: Browser Extension MV3 Platformization & Cross-Project RPC Contract Governance  |  **Quarter**: 2026 Q3
**Priority**: P1  |  **Status**: In Progress  |  **Owner**: YiPet primary owner
**KB Source**: engineer/projects/yipet/brd/brd-2026-069-data-engineering-streaming

## Context
Through MV3 dual-world boundary governance (ISOLATED + MAIN type branding + typed message envelope) + API four-tier cross-level block (client -> endpoints -> types -> services) + cross-project RPC contract unified (filter != query / target_file != path / data.key), evolve YiPet from a "single extension" into an "MV3 Platformization + Cross-Project Envelope Governance" baseline. 

## Objectives & Key Metrics
Dual-world boundary violations 3->0; API four-tier cross-level imports 5->0; RPC contract field violations 3->0; i18n key coverage 92%->100%; CSP violations 0; content script injection P95 <500ms; service worker cold start <1s; supply chain high CVE=0. 

## Acceptance Criteria
1. MV3 dual-world boundary violation events from 3 -> 0 (type branding + envelope full-volume) 
2. API four-tier cross-level imports from 5 -> 0 (types do not import services; client does not import services) 
3. Cross-project RPC contract field violations from 3 -> 0 (filter is not query; target_file is not path; update_document reads data.key) 
4. i18n key coverage rate 92% -> 100% (en + zh_CN sync; MessageKey type union full-volume) 
5. CSP violations 0 (no remote code / no eval / no inline script; vendor fully local public/cdn/vendor/) 
6. supply chain high CVE = 0; min-release-age >= 7d; lockfile + audit + allowlist four-piece set

## Stakeholders
CTO (Decision); YiPet primary owner (execution); YiVad primary owner (reference baseline); YiAi primary owner (RPC contract co-build); business team (consumption); SRE/DevOps (ops); security compliance (CSP + supply chain); Architecture committee (review)

## Milestones
M1 (2026 Q3): MV3 skeleton + background service worker + content script injection + dual-world type branding + Biome lint forbids `as any` across worlds
M2 (2026 Q4): shared client vendor (rpcCall + sseStream + YiAiError) + contract test co-build (YiAi/YiVad/YiPet three ends) 
M3 (2027 Q1): i18n key 100% (en + zh_CN + MessageKey union) + UTC-first timestamp full-volume + supply-chain hardening retrospective (high CVE = 0) 

## Risks
1. MV3 service worker short life cadence (P1) - state persistence to chrome.storage + wake rebuild
2. content script cross-domain injection failure (P1) - manifest `host_permissions` fully declared + failure retry + monitoring
3. dual-world boundary break (P1) - type branding + Biome lint forbids `as any` across worlds
4. React 18 + jsxDEV pattern mixed use (P2) - chat bundle dev script explicitly `--mode production`
5. shared client contract drift (P2) - contract test co-build (YiAi / YiVad / YiPet three ends) 
6. supply chain CVE (P2) - hardening prerequisites (lockfile + audit + min-release-age + allowlist) 

## Long-term Evolution
After 2 years: dual-world boundary violations 0; API four-tier cross-level 0; RPC contract violations 0; i18n 100%; CSP 0 violations; supply chain high CVE 0; content script injection P95 < 500ms; service worker cold start < 1s. YiPet becomes the Yi family "MV3 Platformization + Cross-Project Envelope Governance" baseline; methodology can be reused for other extensions. 

## References
- **KB Source**: `YiKnowledge/engineer/projects/yipet/brd/brd-2026-069-data-engineering-streaming`
- **Architecture overview**: `YiKnowledge/engineer/projects/yipet/architecture.md`
- **MV3 dual-world ADR**: `YiKnowledge/tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md`
- **Biome lint ADR**: `YiKnowledge/tech-lead/decisions/yipet--biome-lint-format.md`
- **Sub-files**: objectives / acceptance / milestones / risks / rules / stakeholders / approvals / documents
