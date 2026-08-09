---
title: ADR — YiPet MV3 Dual World Boundary Enforcement
lifecycle: active
key: brd_brd-tech-lead_msfev72wlzyt1z
tags:
- adr
- yi-pet
- mv3
- security
- isolated-world
adr_id: ADR-Mv3-Dual-World-Boundary
project: yipet
domain: MV3 Security Boundary
decision_type: architectural
team_size: 3
status: accepted
owner: YiPet main owner + architecture team
review_cycle: quarterly
kb_path: tech-lead/decisions/yipet/chrome-manifest-dual-world-boundary.md
context: "In the YiPet MV3 extension the ISOLATED and MAIN world boundary is easy to break: CSP / DOM injection should go through MAIN, business logic + LLM calls should go through ISOLATED. Need type-enforced enforcement."
decision: Use TS type branding + cross-world messaging contract to enforce the MV3 `ISOLATED` vs `MAIN` world boundary. CSP / DOM injection only goes through `MAIN`; business logic + LLM calls only go through `ISOLATED`; the two worlds communicate via `chrome.runtime.sendMessage` + typed message envelope. 
alternatives: B. String convention — easy to bypass with `as any`; C. Runtime validation — performance loss + cannot statically detect. A selected (type branding + Biome lint). 
risks: 1. Type branding learning curve — documentation + workshop; 2. Cross-world serialization limits — postMessage structuredClone; 3. CSP tightening — quarterly review of manifest; 4. Prompt injection attacks — main world only does render + strict sanitize. 
rollback: Boundary broken -> revert to string convention + fix + re-enable type branding (1 business day). 
stakeholders: YiPet main owner + architecture team (decision); CTO (approval); security (review)
tacit: false
related: []
type: reference
---

# ADR — YiPet MV3 Dual World Boundary Enforcement

**ADR ID**: ADR-Mv3-Dual-World-Boundary  |  **Project**: yipet  |  **Domain**: MV3 Security Boundary
**Decision Type**: architectural  |  **Team Size**: 3  |  **Status**: accepted  |  **Owner**: YiPet main owner + architecture team
**Review Cycle**: quarterly  |  **KB Source**: tech-lead/decisions/yipet/chrome-manifest-dual-world-boundary.md

## Context
In the YiPet MV3 extension the ISOLATED and MAIN world boundary is easy to break: CSP / DOM injection should go through MAIN, business logic + LLM calls should go through ISOLATED. Need type-enforced enforcement. 

## Decision
Use TS type branding + cross-world messaging contract to enforce the MV3 `ISOLATED` vs `MAIN` world boundary. CSP / DOM injection only goes through `MAIN`; business logic + LLM calls only go through `ISOLATED`; the two worlds communicate via `chrome.runtime.sendMessage` + typed message envelope. 

## Alternatives
B. String convention — easy to bypass with `as any`; C. Runtime validation — performance loss + cannot statically detect. A selected (type branding + Biome lint). 

## Risks & Mitigations
1. Type branding learning curve — documentation + workshop; 2. Cross-world serialization limits — postMessage structuredClone; 3. CSP tightening — quarterly review of manifest; 4. Prompt injection attacks — main world only does render + strict sanitize. 

## Rollback Plan
Boundary broken -> revert to string convention + fix + re-enable type branding (1 business day). 

## Stakeholders
YiPet main owner + architecture team (decision); CTO (approval); security (review)

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yipet/chrome-manifest-dual-world-boundary.md`
