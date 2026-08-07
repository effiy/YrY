---
title: ADR — YiPet aicr port implementation
lifecycle: active
key: brd_brd-tech-lead_msfev70yaxv7y8
tags:
- adr
- yi-pet
- aicr
- port
- mv3
adr_id: ADR-YiPet-AICR-Port-Rollout
project: yipet
domain: AICR Port
decision_type: architectural
team_size: 4
status: proposed
owner: YiPet primary owner
review_cycle: quarterly
kb_path: tech-lead/decisions/yipet/aicr-port-rollout.md
context: YiVad aicr has completed the 7-phase port with 9 stores + 8 modals + parity 100%. The YiPet browser extension must also support aicr (right-click on any web page to trigger AI code review). MV3 dual-world boundary + content-script injection + short-lived service-worker cadence means a large architectural gap. 
decision: "5 phases: Phase 1 MV3 skeleton + dual-world boundary; Phase 2 shared client base layer vendor; Phase 3 ChatPanel + CodeViewer React rewrite; Phase 4 9 stores + 8 modal migration; Phase 5 cards/chart views + parity test + gradual rollout."
alternatives: B. iframe embedding of YiVad — CSP limits + poor UX; C. wait for YiVad to extract a React package — uncontrollable cadence. A chosen. 
risks: 1. MV3 service worker short-lived cadence — chrome.storage persistence + wake-rebuild; 2. content-script cross-origin injection failure — host_permissions fully declared + retry on failure; 3. dual-world boundary break — type branding + Biome lint forbids `as any` across worlds; 4. React 18 + jsxDEV mixed usage — explicit `--mode production`; 5. shared-client contract drift — three-end contract-test co-build. 
rollback: "each phase has independent rollback: Phase 1 remove skeleton; Phase 2 remove client vendor; Phase 3 remove ChatPanel; Phase 4 remove stores/modals; Phase 5 remove cards + keep parity baseline."
stakeholders: YiPet primary owner (decision); CTO (approval); YiVad primary owner (baseline reference); architecture group (review)
tacit: false
related: []
---

# ADR — YiPet aicr port implementation

**ADR ID**: ADR-YiPet-AICR-Port-Rollout  |  **Project**: yipet  |  **Domain**: AICR Port
**Decision Type**: architectural  |  **Team Size**: 4  |  **Status**: proposed  |  **Owner**: YiPet primary owner
**Review Cycle**: quarterly  |  **KB Source**: tech-lead/decisions/yipet/aicr-port-rollout.md

## Context
YiVad aicr has completed the 7-phase port with 9 stores + 8 modals + parity 100%. The YiPet browser extension must also support aicr (right-click on any web page to trigger AI code review). MV3 dual-world boundary + content-script injection + short-lived service-worker cadence means a large architectural gap. 

## Decision
5 phases: Phase 1 MV3 skeleton + dual-world boundary; Phase 2 shared client base layer vendor; Phase 3 ChatPanel + CodeViewer React rewrite; Phase 4 9 stores + 8 modal migration; Phase 5 cards/chart views + parity test + gradual rollout. 

## Alternatives
B. iframe embedding of YiVad — CSP limits + poor UX; C. wait for YiVad to extract a React package — uncontrollable cadence. A chosen. 

## Risks & Mitigations
1. MV3 service worker short-lived cadence — chrome.storage persistence + wake-rebuild; 2. content-script cross-origin injection failure — host_permissions fully declared + retry on failure; 3. dual-world boundary break — type branding + Biome lint forbids `as any` across worlds; 4. React 18 + jsxDEV mixed usage — explicit `--mode production`; 5. shared-client contract drift — three-end contract-test co-build. 

## Rollback Plan
Each phase has independent rollback: Phase 1 remove skeleton; Phase 2 remove client vendor; Phase 3 remove ChatPanel; Phase 4 remove stores/modals; Phase 5 remove cards + keep parity baseline. 

## Stakeholders
YiPet primary owner (decision); CTO (approval); YiVad primary owner (baseline reference); architecture group (review)

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yipet/aicr-port-rollout.md`
