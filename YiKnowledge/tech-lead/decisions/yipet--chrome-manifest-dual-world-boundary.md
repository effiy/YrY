---
title: ADR — YiPet MV3 Dual-World Boundary Enforcement
aliases: [adr-chrome-manifest-dual-world-boundary, yi-pet-mv3-adr, isolated-main-world-adr]
tags: [adr, yi-pet, mv3, chrome-extension, security, isolated-world, main-world, architecture-decision]
category: tech-lead/decisions/yipet
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [tech-lead, engineer]
benefit: "YiPet Chrome MV3 dual-world boundary decision is documented, enabling safe content-background communication"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - consequences and reversal path are stated
related:
  - ../../../engineer/projects/yipet/architecture.md
  - ../../../engineer/projects/yipet/dev-standards.md
  - ./biome-lint-format.md
  - ../../../product-manager/projects/yipet--project-management.md
  - ../../../ai-engineer/methodology/prompt-injection-defense.md
  - ../../../knowledge-curator/templates/adr.md
---

# ADR — YiPet MV3 Dual-World Boundary Enforcement

> **As a** tech lead, **I want to** chrome manifest dual world boundary, **so that** decision documented and reversible.

> Decision: YiPet uses TS type branding + cross-world messaging contract to enforce the MV3 `ISOLATED` vs `MAIN` world boundary. CSP / DOM injection goes only to `MAIN`; business logic + LLM calls go only to `ISOLATED`; cross-world communication via `chrome.runtime.sendMessage` + typed message envelope. Lands [YiPet architecture overview §Dual-World Boundary](../../../engineer/projects/yipet/architecture.md).

## 1. Basic info

| Field | Content |
|---|---|
| ADR number | ADR-Mv3-Dual-World-Boundary |
| Title | YiPet MV3 dual-world boundary enforcement (ISOLATED vs MAIN) |
| Status | Accepted |
| Date | 2026-08-03 |
| Decider | YiPet lead + architecture team |
| Reviewers | CTO, security |
| Related project | YiPet |
| Related PR/Issue | to be opened (YiPet `refactor(security): typed world boundary + message envelope`) |
| Supersedes | — |
| Superseded by | — |
| Review trigger | quarterly review / signal: MV3 manifest version upgrade / Chrome API change / prompt injection incident / CSP tightening |

## 2. Context

- **Current state**: YiPet MV3 dual-world boundary relies on developer self-discipline; content script can access `window` globals in `MAIN` and call `chrome.runtime.sendMessage` in `ISOLATED`; writing business logic into `MAIN` = exposed to page JS = prompt injection attack surface.
- **Pain points**:
  - MV3 security model relies on manual discipline; PR review easily misses.
  - YiPet `ChatController` calls YiAi backend via SSE; if content script calls from `MAIN` = page JS can listen / hijack.
  - DOM injection (Ant Design component mount points) must be `MAIN`, but business data (user message / RAG source) cannot be `MAIN`.
  - User-input chat message tampered by page JS then injected into prompt = prompt injection direct hit ([prompt injection defense](../../../ai-engineer/methodology/prompt-injection-defense.md)).
- **Trigger event**: after YiPet stack migration, YiAi multi-provider API ([ADR multi-provider](../yiai/route-llm-traffic-across-providers.md)) expanded attack surface.
- **External constraints**: Chrome MV3 `content_scripts.world` field (`ISOLATED` default / `MAIN` explicit); `chrome.scripting.executeScript` supports `world: 'MAIN'`; MV3 service worker cannot persist.

## 3. Decision

YiPet uses TS type branding to enforce world boundary + cross-world messaging typed message envelope. CSP / DOM injection only `MAIN`; business logic / LLM call / user message handling only `ISOLATED`; cross-world communication via `chrome.runtime.sendMessage` + typed envelope.

Landing checklist:

| # | Change | Impact | Launch strategy |
|---|---|---|---|
| 1 | `src/shared/world.ts`: `World = 'ISOLATED' \| 'MAIN'` + `Worldbranded<T, W>` type branding | YiPet shared | one-shot |
| 2 | `src/content/main/` directory: all `MAIN` world entries (Ant Design mount / DOM injection) | YiPet content | one-shot |
| 3 | `src/content/isolated/` directory: all `ISOLATED` world entries (ChatController / SSE parser / YiAi calls) | YiPet content | one-shot |
| 4 | `src/shared/messages.ts`: typed message envelope `{type: 'chat-send' \| 'chat-stream' \| ..., payload: unknown}` + `Message<T>` generic | YiPet shared | one-shot |
| 5 | `chrome.runtime.sendMessage` wrap `sendTypedMessage<T>(msg)` + `onTypedMessage<T>(handler)` | YiPet shared | follow #4 |
| 6 | Biome lint rule: forbid `src/content/main/` import `chrome.runtime` / `services/` / `src/api/` | YiPet lint | one-shot |
| 7 | Vitest tests: world boundary guard + message envelope serialization | YiPet test | follow #4 |
| 8 | CLAUDE.md "Security" section add "world boundary rules + message envelope contract" | doc | one-shot |

## 4. Options considered

| Option | Description | Pros | Cons | Conclusion |
|---|---|---|---|---|
| A. TS type branding + typed message envelope | compile-time boundary + runtime contract | zero runtime overhead; TS-native; CI-enforceable | runtime not blocked (type erasure); needs lint reinforcement | ✅ chosen |
| B. Runtime world detector + assert | runtime boundary block | runtime strong | runtime overhead; no compile-time catch | ❌ (complementary to A, partly adopted) |
| C. CSP-only | manifest CSP restricts `script-src` | browser-native | does not guard world boundary; does not prevent prompt injection | ❌ (baseline hygiene, insufficient) |
| D. Single world (ISOLATED only) | everything in ISOLATED, DOM injection via `chrome.scripting.executeScript` | simplest boundary | DOM injection API complex; Ant Design mount needs MAIN | ❌ |

## 5. Evaluation dimensions

| Dimension | A. TS branding | B. Runtime detector | C. CSP only | D. Single world |
|---|---|---|---|---|
| Compile-time catch | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | ⭐⭐⭐⭐⭐ |
| Runtime guard | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Security (anti-injection) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Maintenance cost | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## 6. Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Type branding erased at build time | high | medium | Biome lint rule #6 guards import boundary + PR review |
| `MAIN` world exposes YiAi API key | medium | high | key only in ISOLATED + service worker; `MAIN` never holds secrets |
| Message envelope type bypassed (`as any`) | medium | high | Biome lint forbids `as any`; use `as unknown as` explicit + comment reason |
| Chrome API change breaks `world` field | low | high | MV3 manifest version pin; quarterly review |
| Prompt injection from `MAIN` to ISOLATED message handler | medium | high | message handler validates `sender.id` + payload schema validation + critical-field rejection |
| Ant Design component mounted on `MAIN` but business props bleed | medium | medium | props serialization passes only primitives + IDs; complex objects via background proxy |

## 7. Rollback plan

| Trigger | Rollback action | Owner | Est. recovery |
|---|---|---|---|
| Type branding engineering resistance | progressive adoption: new files first, old files migrated gradually | YiPet lead | progressive |
| Biome lint boundary rule false-positives | disable rule + add `// biome-ignore` explicit + review | YiPet lead | 30 min |
| Message envelope serialization broken | reinforce with JSON Schema runtime validation | YiPet lead | 2 h |
| Chrome API change | pin manifest version + evaluate option C (CSP reinforcement) | architecture team | 1 work day |
| Prompt injection incident | immediately revoke YiAi API key + audit message handler + add payload schema validation | security + YiPet lead | 4 h |

> Rollback must be executable within 1 h (except option C evaluation + injection incident audit).

## 8. Implementation plan

| Phase | Content | Completion date | Owner |
|---|---|---|---|
| Phase 1 | `shared/world.ts` + `shared/messages.ts` + typed envelope (#1 #4 #5) | 2026-08-08 | YiPet lead |
| Phase 2 | `content/main/` + `content/isolated/` directory split (#2 #3) | 2026-08-12 | YiPet lead |
| Phase 3 | Biome lint boundary rules (#6) + Vitest tests (#7) | 2026-08-15 | YiPet lead + QA |
| Phase 4 | docs + security review (#8) | 2026-08-17 | YiPet lead + security |
| Phase 5 | quarterly review + MV3 manifest upgrade tracking | 2026-09-01 | architecture team |

## 9. Follow-up tracking metrics

| Metric | Pre-launch | Target | Actual |
|---|---|---|---|
| `MAIN` world secret-holding incidents | not monitored | 0 | — |
| `as any` count in content/ | not monitored | 0 | — |
| Biome lint boundary rule violations | not monitored | 0 | — |
| Message envelope payload schema validation coverage | 0% | ≥ 80% | — |
| Vitest world boundary guard tests | 0 | ≥ 5 cases | — |
| Prompt injection attack incidents | not monitored | 0 / quarter | — |

## 10. Coupling with other ADRs / docs

- **[ADR Biome lint](./biome-lint-format.md) #6**: Biome lint rule guards world boundary; co-build with this ADR #6.
- **[YiAi ADR multi-provider](../yiai/route-llm-traffic-across-providers.md)**: YiAi backend manages API key; YiPet `ISOLATED` world only passes through `model` parameter, does not hold secrets.
- **[prompt injection defense](../../../ai-engineer/methodology/prompt-injection-defense.md)**: this ADR is the engineering landing for prompt injection defense.
- **[YiPet architecture overview](../../../engineer/projects/yipet/architecture.md)** §Dual-World Boundary: this ADR is its enforcement.
- **[YiPet dev standards](../../../engineer/projects/yipet/dev-standards.md)** §MV3 dual-world: this ADR is its decision basis.

## 11. References

- [YiPet architecture overview](../../../engineer/projects/yipet/architecture.md) — dual-world boundary definition
- [YiPet dev standards](../../../engineer/projects/yipet/dev-standards.md) — §MV3 dual-world + §CSP
- [ADR Biome lint](./biome-lint-format.md) — boundary lint rule co-build
- [YiAi ADR multi-provider](../yiai/route-llm-traffic-across-providers.md) — API key boundary
- [Prompt Injection Defense](../../../ai-engineer/methodology/prompt-injection-defense.md)
- [Chrome MV3 docs](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration)
- [ADR template](../../../knowledge-curator/templates/adr.md)
