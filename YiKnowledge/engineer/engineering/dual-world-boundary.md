---
title: MV3 Dual World Boundary Pattern
aliases: [dual-world-boundary-pattern, chrome-manifest-dual-world, mv3-isolated-main-boundary]
tags: [pattern, engineeringPattern, MV3, Chrome-Extension, dual-world, type-branding, message-envelope]
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "Chrome extension content and background scripts communicate safely across the MV3 world boundary"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md
  - ../projects/yipet/dev-standards.md
  - ../projects/yipet/architecture.md
---

# MV3 Dual World Boundary Pattern

> **As an** engineer, **I want to** dual world boundary, **so that** pattern applied consistently. 

> Chrome MV3 enforces ISOLATED and MAIN two-world isolation: TS type branding prevents cross-use + typed message envelope for cross-boundary communication; do not let ISOLATED's chrome API leak into MAIN, do not let MAIN's DOM / page JS pollute ISOLATED. 

## Summary

- **Pattern**: The two worlds each hold their own runtime (ISOLATED holds `chrome.*` API + MAIN holds DOM / page JS) → TS type branding (`__brand`) marks world ownership → typed message envelope (`{kind, world, payload}`) crosses boundary → `runtime.sendMessage` / `window.postMessage` channel isolation → Biome lint forbids `any` cross-world assignment
- **Cross-project applicability**: YiPet (Chrome MV3 extension), reusable for any MV3 extension or dual-runtime isolation scenario
- **Implementation**: [YiPet MV3 Dual World ADR](../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md)
- **Replacement solution**: Single world + try/catch fallback (not applicable to MV3, see §Not applicable)

## Core viewpoints

- **Type branding is not a type system trick — it is a compile-time safety net for a runtime constraint** — MV3 enforces ISOLATED and MAIN world separation at runtime, but TypeScript has no concept of execution worlds. Type branding (`__worldBrand`) makes the runtime constraint visible to the compiler: assigning an ISOLATED-typed value to a MAIN-typed variable is a compile error. This catches world-crossing bugs at build time, not at runtime when `chrome.storage` is undefined.

- **The message envelope is the only valid cross-boundary communication** — `sendMessage(any)` is the single most common source of MV3 bugs. The typed envelope (`{kind, world, payload}`) ensures that every message declares its origin, destination, and type. Without it, a payload field rename in one world silently breaks the other world, and debugging requires tracing message passing through Chrome's internal APIs.

- **File naming conventions enforce world separation at the file system level** — `isolated-` prefix for ISOLATED files and `main-` prefix for MAIN files is not a cosmetic convention. It prevents accidental cross-world imports: an ISOLATED file importing a MAIN file crashes the extension at load time. The prefix is a visual signal to the developer and a validation rule for Biome lint.

- **`as any` is the most dangerous two characters in MV3 development** — A single `as any` on a cross-world assignment bypasses all type branding, all envelope validation, and all Biome lint rules. The assignment compiles and passes CI, but crashes at runtime when `chrome.storage` is undefined in MAIN or `document.querySelector` returns null in ISOLATED. Biome must forbid `as any` across world boundaries.

- **Dual-world testing is not optional — it is the only way to catch world-crossing bugs** — Vitest with happy-dom can simulate dual-world message passing, but it cannot simulate Chrome's actual ISOLATED/MAIN execution environment. A test that passes in Vitest may fail in the real extension. Round-trip message tests must be run in the actual extension, not just in the test environment.

## Key info

- **MV3 world architecture**: ISOLATED world (content script's own JS context, has access to `chrome.runtime.*`, `chrome.storage.*`, `chrome.tabs.*`, but cannot access page JS variables, cannot modify page DOM directly without `window.postMessage` relay). MAIN world (the page's JS context, has access to DOM, page-global variables, `window.*`, but CANNOT access any `chrome.*` API). The two worlds share the same DOM tree but have separate JS execution contexts. A variable set in ISOLATED is invisible in MAIN, and vice versa. The only communication channels: `chrome.runtime.sendMessage` (ISOLATED → background), `window.postMessage` (MAIN ↔ ISOLATED via CustomEvent or postMessage).
- **Type branding implementation**: `type IsolatedBrand = { __worldBrand: 'ISOLATED' }` and `type MainBrand = { __worldBrand: 'MAIN' }`. A function that takes `args: IsolatedBrand & Args` will fail at compile time if called with a MAIN-typed value. The brand is a compile-time only construct; it is stripped at runtime. The brand must be propagated through every function that crosses the world boundary: if a function in ISOLATED returns a value that will be sent to MAIN, the return type must not carry the ISOLATED brand.
- **YiPet bootstrap injection**: the `src/content/bootstrap.ts` file first runs as a content script (ISOLATED world), then self-injects into the MAIN world by creating a `<script>` tag with `src=chrome.runtime.getURL('bootstrap.js')`. The injected script runs in MAIN and has access to the page's DOM. The ISOLATED script communicates with the MAIN script via `window.postMessage`. This is the standard MV3 pattern for injecting functionality into the page context.
- **Message envelope type**: `{ kind: 'COMMAND' | 'STATE' | 'EVENT', world: 'ISOLATED' | 'MAIN', payload: unknown, id: string, timestamp: number }`. The `id` field enables request-response correlation (send a message with id=X, listen for a response with inReplyTo=X). The `timestamp` enables debugging stale messages. The `kind` field enables routing: COMMAND messages trigger actions, STATE messages update state, EVENT messages are fire-and-forget.
- **Common MV3 world-crossing bugs**: (1) `chrome.runtime.getURL` called from MAIN (returns undefined, resource fails to load silently), (2) `document.querySelector` called from ISOLATED (returns the ISOLATED world's DOM, not the page's DOM -- the element exists in the page's DOM but is invisible to ISOLATED), (3) `as any` cast on a cross-world message payload (bypasses type checking, the field rename in one world silently breaks the other), (4) `chrome.storage.local.get` called from MAIN (returns undefined, state is lost silently). All four bugs are silent -- no error, just wrong behavior.

## Question

Pain points without this pattern (quantitative): 

- **API leakage**: MAIN world calling `chrome.storage` = undefined = crash; ISOLATED world calling `document.querySelector` = cannot get page DOM = function invalid
- **Untyped messages**: `sendMessage(any)` = payload field drift = runtime chaos
- **World cross-use**: ISOLATED file imports MAIN file = chrome API evaluated in MAIN at load time crashes = extension load failure
- **Page JS pollution**: MAIN directly reads `window.xxx` = page script modifies prototype = security vulnerability
- **CSP violation**: MAIN world inline eval = forbidden by MV3 CSP = console error

## Pattern

### 1. Type branding marks world ownership

```typescript
// shared/types/world.ts
declare const __worldBrand: unique symbol;

export type IsolatedWorld = { readonly __worldBrand: 'isolated' };
export type MainWorld = { readonly __worldBrand: 'main' };

export type Branded<T, W> = T & { readonly __worldBrand: W };

// ISOLATED-specific type
export type ChromeApi = Branded<{ storage: ...; tabs: ... }, 'isolated'>;
// MAIN-specific type
export type PageDom = Branded<{ document: Document; window: Window }, 'main'>;
```

Cross-world assignment = TS compile error = static guard. 

### 2. Typed message envelope

```typescript
// shared/types/messages.ts
type World = 'isolated' | 'main';
type MessageKind = 'storage-get' | 'storage-set' | 'dom-query' | 'tab-create';

export interface MessageEnvelope<T = unknown> {
  kind: MessageKind;
  from: World;
  to: World;
  payload: T;
  id: string;  // request / response alignment
}

export type MessageHandler<T> = (env: MessageEnvelope<T>) => Promise<MessageEnvelope<T>>;
```

### 3. Channel isolation

```typescript
// ISOLATED -> MAIN (ISOLATED wants to query DOM)
chrome.runtime.sendMessage<MessageEnvelope>(
  { kind: 'dom-query', from: 'isolated', to: 'main', payload: { selector: '.title' }, id: uuid() }
);

// MAIN -> ISOLATED (MAIN wants to use chrome.storage)
window.postMessage(
  { kind: 'storage-get', from: 'main', to: 'isolated', payload: { key: 'token' }, id: uuid() },
  location.origin
);
```

### 4. Biome lint guards boundary

```json
// biome.json
{
  "lint": {
    "rules": {
      "correctness": { "noExplicitAny": "error" },
      "suspicious": { "noAssigningAnyToUnknown": "error" }
    }
  }
}
```

Cross-world assignment using `as any` to bypass types = lint block; must use `as unknown as Branded<T, W>` explicitly + comment rationale. 

### 5. File naming constraint

ISOLATED module file names carry the `isolated-` prefix, MAIN modules carry the `main-` prefix, shared does not; at import time you can tell the world ownership at a glance. 

## Applicable / Not applicable

### Applicable

- Chrome MV3 extension (ISOLATED + MAIN dual world required) 
- Firefox WebExtension (dual world isolation) 
- Any dual-runtime isolation scenario (sandbox + main thread / worker + main) 
- High type-security requirements (large team / long-term maintenance) 

### Not applicable

- Single-world MV2 (already deprecated) 
- Pure content script injection without chrome API requirements
- Static sites (no extension context) 
- Non-TS projects (type branding invalid, rely on runtime guards) 

## Implementation list

| No. | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | Build `shared/types/world.ts` type branding (`__worldBrand`)  | frontend shared types | one-shot |
| 2 | Build `shared/types/messages.ts` typed envelope + MessageKind enum | frontend shared types | one-shot |
| 3 | ISOLATED module uses `isolated-` prefix / MAIN uses `main-` prefix | frontend file naming | gradual |
| 4 | Channel isolation: `chrome.runtime.sendMessage` (-> MAIN) + `window.postMessage` (-> ISOLATED)  | frontend cross-boundary communication | one-shot |
| 5 | Biome lint forbids `as any` cross-world + `noExplicitAny` error | frontend lint | one-shot |
| 6 | CI: type check + Biome lint blocks cross-boundary assignment | CI | follows #5 |
| 7 | Tests: cross-boundary message round-trip ([Vitest](../../tech-lead/decisions/yivad--vitest-introduction.md) happy-dom simulating dual world)  | frontend tests | one-shot |

## Action recommendations

1. **Add a Biome lint rule that forbids `as any` in any file that imports or exports cross-world types, and require an explicit `as unknown as Branded<T, W>` cast with a comment explaining why the cast is necessary.** A single `as any` on a cross-world assignment bypasses all type branding, envelope validation, and lint rules. The code compiles and passes CI, but crashes at runtime when `chrome.storage` is undefined in MAIN. The `as unknown as Branded<T, W>` cast is explicit, auditable, and forces the developer to justify the world-crossing.

2. **Create a pre-commit hook that validates the file naming convention: any file that imports `chrome.*` APIs must have the `isolated-` prefix, and any file that references `document` or `window` directly must have the `main-` prefix.** The file naming convention is the file-system-level guard against accidental cross-world imports. A pre-commit hook that enforces this convention catches the mistake at commit time, not at extension load time when Chrome crashes.

3. **Write a round-trip message test that runs in the actual Chrome extension (not just in Vitest) and verifies that every message kind in the `MessageKind` enum can be sent from ISOLATED to MAIN and receive a valid response.** Vitest with happy-dom can simulate message passing but cannot simulate Chrome's actual ISOLATED/MAIN execution environment. The round-trip test must be run in the actual extension using `chrome.runtime.sendMessage` and `window.postMessage` to catch world-crossing bugs that only manifest in the real Chrome runtime.

4. **Add a CI check that verifies every `MessageEnvelope` sent across the boundary includes the required `kind`, `from`, `to`, and `id` fields, and that the `from` and `to` fields are never the same world.** A message without `kind` is untyped and cannot be routed. A message where `from` and `to` are the same world is a no-op that should be a direct function call. The CI check should validate the envelope structure at build time, not at runtime when the message is already in flight.

5. **Document the dual-world boundary in the YiPet onboarding guide with a worked example: a content script that needs to query the DOM and store the result in chrome.storage, showing the full message flow from MAIN (DOM query) to ISOLATED (chrome.storage.set) and back.** The dual-world boundary is the most confusing concept for new MV3 extension developers. A worked example that traces the full message flow across the boundary, with type annotations and error handling, reduces the onboarding time from days to hours and prevents the most common class of MV3 bugs.

## Anti-patterns

- **Using `as any` to bypass type branding** — A single `as any` on a cross-world assignment bypasses all type branding, envelope validation, and lint rules. The code compiles and passes CI, but crashes at runtime when `chrome.storage` is undefined in MAIN. Every `as any` across world boundaries is a latent runtime bug.

- **Single world + try/catch fallback** — MV3 dual world is a hard constraint enforced by Chrome, not a design choice. try/catch cannot cover the fundamental incompatibility: ISOLATED has `chrome.*` API but no DOM access; MAIN has DOM access but no `chrome.*` API. The two worlds must be split; no amount of error handling bridges the gap.

- **ISOLATED file importing MAIN file** — When an ISOLATED file imports a MAIN file, Chrome evaluates the MAIN file's `chrome.*` API calls in the MAIN world at load time, where they are undefined. The extension crashes on load. File naming conventions (`isolated-` / `main-`) prevent this at the file system level.

- **Messages without kind/from/to envelope fields** — `sendMessage(any)` is the single most common source of MV3 bugs. A payload field rename in one world silently breaks the other world. Every message must declare its type, origin, and destination; the typed envelope is the only protection against silent drift.

- **Testing only in Vitest, not in the actual extension** — Vitest with happy-dom can simulate message passing but cannot simulate Chrome's actual ISOLATED/MAIN execution environment. Round-trip message tests must be run in the actual extension to catch world-crossing bugs that only manifest in the real Chrome runtime.


- **Single world + try/catch fallback**: MV3 dual world is a hard constraint, try/catch cannot cover it; must split worlds. 
- **`as any` bypass types**: cross-world assignment silently passes = crashes at runtime; must use `as unknown as Branded<T, W>` + comment. 
- **Messages without kind / from / to**: payload field drift = runtime chaos; must envelope-ize. 
- **ISOLATED imports MAIN file**: chrome API evaluated in MAIN crashes; must split files by world. 
- **MAIN directly reads `window.xxx`**: page script pollutes prototype = security vulnerability; must request ISOLATED to switch via message. 
- **MV2 content script path**: MV3 already deprecated; new extensions must use MV3 + dual world. 
- **CSP violation**: MAIN world eval / inline script = forbidden by MV3 CSP; must bundle then inject. 
- **Cross-boundary message without id**: concurrent request/response mismatch; must envelope with id alignment. 

## Related

- Implementation: [YiPet MV3 Dual World ADR](../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md) — type branding + envelope
- Implementation: [YiPet Development Standards §MV3 Dual World](../projects/yipet/dev-standards.md)
- Implementation: [YiPet Architecture Overview](../projects/yipet/architecture.md) — dual world boundary / API four tiers
- Companion: [./README.md](./) — engineering-patterns leaf entry
