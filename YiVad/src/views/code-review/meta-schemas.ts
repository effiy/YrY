/**
 * Per-topic meta column + form field definitions for code-review topics.
 *
 * Each topic gets domain-specific table columns (rendered from row.meta) and
 * structured form fields in the detail page.
 */
import type { MetaColumn } from "@/components/TopicListPage/index.vue";
import type { MetaField } from "@/components/TopicDetailPage/index.vue";

export interface TopicMetaSchema {
  metaColumns: MetaColumn[];
  metaFields: MetaField[];
  /** YiKnowledge-relative path for pre-fill content (optional). */
  templateContent?: string;
}

// ── Shared options ──────────────────────────────────────────────────────────

const SEVERITY_OPTIONS = [
  { label: "Blocker", value: "blocker" },
  { label: "Major", value: "major" },
  { label: "Minor", value: "minor" },
  { label: "Nit", value: "nit" }
];

const RISK_OPTIONS = [
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" }
];

const EFFORT_OPTIONS = [
  { label: "S — hours", value: "s" },
  { label: "M — 1-2 days", value: "m" },
  { label: "L — 3-5 days", value: "l" },
  { label: "XL — weeks", value: "xl" }
];

const IMPACT_OPTIONS = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" }
];

// ── Tag type helpers ────────────────────────────────────────────────────────

function severityTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = { blocker: "danger", major: "warning", minor: "info", nit: "" };
  return (m[v] || "") as any;
}

function riskTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = { critical: "danger", high: "warning", medium: "info", low: "" };
  return (m[v] || "") as any;
}

// ── Code-review topic schemas ───────────────────────────────────────────────

export const crMetaSchemas: Record<string, TopicMetaSchema> = {
  summary: {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "file_path", label: "File Path", minWidth: 200 },
      { key: "language", label: "Language", width: 100 }
    ],
    metaFields: [
      { key: "file_path", label: "File Path", type: "input", placeholder: "e.g. src/components/Foo.vue" },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD / TL / bugs with the same project" },
      { key: "language", label: "Language", type: "input", placeholder: "e.g. TypeScript, Python, Go" }
    ],
    templateContent: `# File Summary

## File: [file_path]

## What it does
(Summarise the file's core purpose in 1-2 sentences)

## Key Entry Points
- Public API / exports: (list exported functions, components, classes)
- Called by: (which modules depend on this)

## Main Responsibilities
1. (responsibility 1)
2. (responsibility 2)

## Dependencies
- Internal: (other modules in this project)
- External: (third-party packages used)

## Notes
- Project context — YiAi (FastAPI/async Python), YiVad (Vue 3 SPA), YiPet (Chrome MV3/React), YiKnowledge (Markdown docs)
- Language-specific: Vue SFC check template/script/style; Python check async/await + Pydantic; React check hooks + MV3 CSP`
  },

  explain: {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "file_path", label: "File Path", minWidth: 200 },
      { key: "language", label: "Language", width: 100 },
      {
        key: "complexity",
        label: "Complexity",
        width: 110,
        enum: [
          { label: "Simple", value: "simple" },
          { label: "Medium", value: "medium" },
          { label: "Complex", value: "complex" }
        ]
      }
    ],
    metaFields: [
      { key: "file_path", label: "File Path", type: "input", placeholder: "e.g. src/components/Foo.vue" },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD / TL / bugs with the same project" },
      { key: "language", label: "Language", type: "input", placeholder: "e.g. TypeScript" },
      {
        key: "complexity",
        label: "Complexity",
        type: "select",
        options: [
          { label: "Simple — straightforward linear logic", value: "simple" },
          { label: "Medium — a few branching paths", value: "medium" },
          { label: "Complex — deeply nested, async, or stateful", value: "complex" }
        ]
      }
    ],
    templateContent: `# Logic Walkthrough: [file_path]

## File: [file_path]
## Language: [language] | Complexity: [simple|medium|complex]

## Step-by-step Logic Flow

### 1. Entry Point
(How does execution enter this module? Import, route handler, event listener?)

### 2. Core Algorithm / Pipeline
(Walk through the main function or component render cycle)

### 3. Branching Paths
- Happy path: (normal execution flow)
- Error path: (exception handling, error boundaries)
- Edge cases: (null/empty inputs, boundary values, concurrent calls)

### 4. State & Side Effects
- Mutable state: (reactive refs, store mutations, class fields)
- Side effects: (API calls, file I/O, DOM mutations, event emissions)
- Cleanup: (onUnmounted, finally blocks, context cancellation)

### 5. Non-obvious Behaviour
(Surprising patterns, implicit contracts, undocumented assumptions)

## Project-specific Patterns to Watch
- **YiAi (Python)**: async/await chains, Motor cursor lifecycle, Pydantic validation boundaries, config.yaml fallback logic
- **YiVad (Vue 3)**: reactive ref vs shallowRef choice, computed dependency tracking, Pinia store cross-talk, ProTable requestApi callback chain
- **YiPet (MV3)**: ISOLATED vs MAIN world message bridge, chrome.storage quota, CSP constraints on dynamic content, useSyncExternalStore subscription`
  },

  security: {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "file_path", label: "File Path", minWidth: 200 },
      {
        key: "severity",
        label: "Severity",
        width: 100,
        enum: SEVERITY_OPTIONS,
        tagTypeFn: severityTag
      },
      {
        key: "vuln_type",
        label: "Vulnerability",
        width: 130,
        enum: [
          { label: "Injection", value: "injection" },
          { label: "Auth / Access", value: "auth" },
          { label: "XSS", value: "xss" },
          { label: "CSRF", value: "csrf" },
          { label: "Secret Leak", value: "secret_leak" },
          { label: "Deserialization", value: "deserialization" },
          { label: "SSRF", value: "ssrf" },
          { label: "Other", value: "other" }
        ]
      }
    ],
    metaFields: [
      { key: "file_path", label: "File Path", type: "input", placeholder: "e.g. src/api/users.py" },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD / TL / bugs with the same project" },
      {
        key: "severity",
        label: "Severity",
        type: "select",
        options: SEVERITY_OPTIONS,
        required: true
      },
      {
        key: "vuln_type",
        label: "Vulnerability Type",
        type: "select",
        options: [
          { label: "Injection (SQL/OS/CMD)", value: "injection" },
          { label: "Auth / Access Control", value: "auth" },
          { label: "XSS", value: "xss" },
          { label: "CSRF", value: "csrf" },
          { label: "Secret / Key Leak", value: "secret_leak" },
          { label: "Unsafe Deserialization", value: "deserialization" },
          { label: "SSRF", value: "ssrf" },
          { label: "Other", value: "other" }
        ],
        required: true
      },
      { key: "cwe_id", label: "CWE ID", type: "input", placeholder: "e.g. CWE-89" }
    ],
    templateContent: `# Security Review

## File: [file_path] | Severity: [blocker|major|minor|nit] | Vuln Type: [injection|auth|xss|csrf|secret_leak|deserialization|ssrf|other]

## Finding

### Description
(What is the vulnerability? How can it be triggered?)

### Attack Scenario
1. Attacker provides: (malicious input / crafted request)
2. Code path: (which function/layer processes it)
3. Result: (data leak, privilege escalation, denial of service)

### Impact
- Confidentiality: (what data is exposed)
- Integrity: (what can be modified)
- Availability: (can the service be disrupted)

## Fix

### Recommended Approach
(Parameterised queries, input validation, CSP headers, etc.)

### Code Diff
\`\`\`
// Before (vulnerable)
...

// After (fixed)
...
\`\`\`

### Verification
(How to test the fix — manual steps or test cases)

## Project-specific Checklist
- **YiAi (Python/FastAPI)**: SQL/NoSQL injection via string formatting, SSRF in file fetchers, unsafe pickle/json deserialization, JWT secret strength, X-Token header bypass when auth disabled, file upload path traversal
- **YiVad (Vue 3)**: XSS via v-html / innerHTML, exposed API keys in env vars (RSBUILD_ENV_*), token in localStorage (XSS-readable), route guard bypass, dependency supply chain (npm audit)
- **YiPet (MV3)**: CSP bypass via dynamic script injection, message passing spoofing (sender origin check), chrome.storage sensitive data exposure, content script DOM injection, manifest.json permission creep`
  },

  "dependency-risk": {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "package_name", label: "Package", minWidth: 170 },
      { key: "current_ver", label: "Current", width: 100 },
      { key: "latest_ver", label: "Latest", width: 100 },
      {
        key: "risk_level",
        label: "Risk",
        width: 100,
        enum: RISK_OPTIONS,
        tagTypeFn: riskTag
      }
    ],
    metaFields: [
      { key: "package_name", label: "Package", type: "input", placeholder: "e.g. axios, lodash", required: true },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD / TL / bugs with the same project" },
      { key: "current_ver", label: "Current Version", type: "input", placeholder: "e.g. 1.7.2" },
      { key: "latest_ver", label: "Latest Version", type: "input", placeholder: "e.g. 2.1.0" },
      {
        key: "risk_level",
        label: "Risk Level",
        type: "select",
        options: RISK_OPTIONS,
        required: true
      }
    ],
    templateContent: `# Dependency Risk Assessment

## Package: [package_name] | Current: [current_ver] → Latest: [latest_ver] | Risk: [critical|high|medium|low]

## Assessment

### What This Dependency Does
(Brief description of the package's role in the project)

### Version Gap Analysis
- Current version release date:
- Latest version release date:
- Number of skipped releases:
- Breaking changes in between: (list major semver bumps)

### Known Vulnerabilities
- CVE / GHSA IDs:
- Severity:
- Fix version:

### Maintenance Health
- Last publish date:
- GitHub stars / issues / PR velocity:
- Is the project actively maintained?: Yes / No / At-risk
- Bus factor: (how many active maintainers)

### Usage in Our Codebase
- Imported by (files):
- Depth of usage: (surface API only / deep integration / monkey-patched)
- Can we remove or replace it?: Yes (with ___) / No, because ___

## Project-specific Dependencies
- **YiAi (Python)**: motor (MongoDB async), pydantic / pydantic-settings, fastapi + uvicorn, tenacity, apscheduler, llama_index, ollama (client), bcrypt, PyJWT, pyyaml
- **YiVad (npm)**: vue 3.5, vue-router 5, pinia 4, element-plus 2.14, echarts 6, axios, @rspack/core, vue-i18n 11, vue-tsc
- **YiPet (npm)**: react 18.3, antd 5.21, marked, @rsbuild/core, @rsbuild/plugin-react, vitest 2, @biomejs/biome 2.5`
  },

  "access-review": {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "code_path", label: "Code Path", minWidth: 200 },
      {
        key: "risk_level",
        label: "Risk",
        width: 100,
        enum: RISK_OPTIONS,
        tagTypeFn: riskTag
      }
    ],
    metaFields: [
      { key: "code_path", label: "Code Path", type: "input", placeholder: "e.g. POST /api/admin/users", required: true },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD / TL / bugs with the same project" },
      { key: "privilege_boundary", label: "Privilege Boundary", type: "input", placeholder: "e.g. user → admin" },
      { key: "caller_roles", label: "Caller Roles", type: "input", placeholder: "e.g. admin, auditor" },
      { key: "data_accessed", label: "Data Accessed", type: "input", placeholder: "e.g. PII, payment" },
      {
        key: "risk_level",
        label: "Risk Level",
        type: "select",
        options: RISK_OPTIONS,
        required: true
      }
    ],
    templateContent: `# Access Review

## Code Path: [code_path] | Risk: [critical|high|medium|low]

## Access Analysis

### What This Code Path Does
(Summarise the endpoint / function / component)

### Caller Identity
- Who can reach this code?: (public, authenticated user, admin, service account, internal-only)
- Authentication mechanism: (JWT token, API key, session cookie, none)
- Authorization check: (role-based, attribute-based, none)

### Privilege Boundary
- Current privilege level: (anonymous → user → admin → system)
- What higher-privilege operations does it perform?: (data access, config changes, user impersonation)
- Does it cross a trust boundary?: (internal→external, user→admin, read→write)

### Data Accessed
- Data classification: (public, internal, confidential, PII, payment, secrets)
- Read vs Write: (read-only, write, delete)
- Scope: (single record, bulk, cross-tenant)

### Missing Checks
- [ ] Authentication required? Currently: Yes / No
- [ ] Authorization check? Currently: Yes / No
- [ ] Rate limiting? Currently: Yes / No
- [ ] Input validation? Currently: Yes / No
- [ ] Audit logging? Currently: Yes / No

## Project-specific Boundaries
- **YiAi**: X-Token optional (check if auth enabled in config.yaml), RPC envelope — any caller can invoke any module, repository layer has no auth
- **YiVad**: route guards (beforeEach), v-auth directive on buttons, dynamic menu permission, env vars RSBUILD_ENV_*
- **YiPet**: MV3 service worker (no DOM access), content script ISOLATED world, chrome.storage (shared across extension contexts)`
  },

  refactor: {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "file_path", label: "File Path", minWidth: 200 },
      {
        key: "effort",
        label: "Effort",
        width: 80,
        enum: EFFORT_OPTIONS
      },
      {
        key: "impact",
        label: "Impact",
        width: 100,
        enum: IMPACT_OPTIONS
      }
    ],
    metaFields: [
      { key: "file_path", label: "File Path", type: "input", placeholder: "e.g. src/utils/helpers.ts", required: true },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD / TL / bugs with the same project" },
      {
        key: "effort",
        label: "Effort",
        type: "select",
        options: EFFORT_OPTIONS
      },
      {
        key: "impact",
        label: "Expected Impact",
        type: "select",
        options: IMPACT_OPTIONS
      }
    ],
    templateContent: `# Refactor Suggestion

## File: [file_path] | Effort: [s|m|l|xl] | Impact: [high|medium|low]

## Current State

### Pain Points
1. (What makes this code hard to change or understand?)
2. (Performance issue, coupling, testability?)
3. (Duplication across the codebase?)

### Root Cause
(Why is it like this? Historical reasons, rushed delivery, missing abstraction?)

## Proposed Refactor

### Approach
(Extract function, introduce interface, split component, deduplicate, etc.)

### Before / After Sketch
- Before: (current structure)
- After: (target structure)

### Expected Benefits
- Readability: (easier to understand because...)
- Maintainability: (easier to change because...)
- Performance: (faster because...)
- Testability: (easier to test because...)

### Risks
- Regression risk: (what could break)
- Migration strategy: (big bang vs strangler fig)

## Project-specific Anti-patterns
- **YiAi**: sync code in async context (blocking the event loop), fat service functions (>100 lines), missing Pydantic validation at API boundary, raw dict passing instead of typed models
- **YiVad**: large SFCs (>300 lines), Options API mixed with Composition API, store methods importing axios directly, duplicate ProTable column configs, inline styles
- **YiPet**: mixed concerns in content script bootstrap, unused CDN catalog entries, React class component remnants, missing cleanup in useEffect`
  },

  perf: {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "file_path", label: "File Path", minWidth: 200 },
      {
        key: "bottleneck_type",
        label: "Bottleneck",
        width: 120,
        enum: [
          { label: "CPU", value: "cpu" },
          { label: "Memory", value: "memory" },
          { label: "I/O", value: "io" },
          { label: "Network", value: "network" },
          { label: "DB Query", value: "db" },
          { label: "Lock Contention", value: "locking" }
        ]
      }
    ],
    metaFields: [
      { key: "file_path", label: "File Path", type: "input", placeholder: "e.g. src/api/search.py", required: true },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD / TL / bugs with the same project" },
      {
        key: "bottleneck_type",
        label: "Bottleneck Type",
        type: "select",
        options: [
          { label: "CPU-bound", value: "cpu" },
          { label: "Memory / Allocation", value: "memory" },
          { label: "Disk I/O", value: "io" },
          { label: "Network I/O", value: "network" },
          { label: "Database / N+1 Query", value: "db" },
          { label: "Lock / Mutex Contention", value: "locking" }
        ],
        required: true
      },
      { key: "current_metric", label: "Current Metric", type: "input", placeholder: "e.g. p99 = 420ms" },
      { key: "target_metric", label: "Target Metric", type: "input", placeholder: "e.g. p99 < 100ms" }
    ],
    templateContent: `# Performance Analysis

## File: [file_path] | Bottleneck: [cpu|memory|io|network|db|locking]

## Profiling Data

### Current Metric
- Measurement: (p99 latency, requests/sec, memory usage, etc.)
- Profiling tool: (Chrome DevTools, Python cProfile, MongoDB explain, etc.)

### Hot Path Identification
- Function / component: (which code is slow)
- Call frequency: (how often is it called)
- Time spent: (absolute time and % of total)

## Root Cause

### Bottleneck Type
- **CPU**: expensive computation, deep recursion, unnecessary re-renders
- **Memory**: large allocations, memory leak, missing cleanup, deep reactive wrapping
- **I/O**: blocking I/O in async context, no connection pooling, missing caching
- **Network**: chatty API calls, large payloads, no compression, missing HTTP/2
- **DB**: N+1 queries, missing index, full collection scan, no projection
- **Locking**: mutex contention, transaction isolation level, deadlock potential

## Proposed Fix

### Approach
(Add index, batch query, memoize, lazy load, use web worker, connection pool, etc.)

### Expected Improvement
- Target metric: (p99 < Xms, memory < YMB, etc.)
- Estimated effort: (hours/days)

## Project-specific Hotspots
- **YiAi**: Motor (async MongoDB) — check for N+1 in repository.query_documents calls, SSE streaming backpressure, llama_index embedding batch size, apscheduler poll interval tuning
- **YiVad**: Vue reactivity — shallowRef for large objects, ProTable requestApi debounce, ECharts resize on container change, keep-alive cache size, route lazy loading
- **YiPet**: Chrome extension — service worker idle timeout, chrome.storage.sync quota (100KB), content script injection on every page load, CDN resource load order`
  },

  tests: {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "target_func", label: "Target Function", minWidth: 200 },
      {
        key: "test_type",
        label: "Test Type",
        width: 120,
        enum: [
          { label: "Unit", value: "unit" },
          { label: "Integration", value: "integration" },
          { label: "E2E", value: "e2e" },
          { label: "Snapshot", value: "snapshot" }
        ]
      }
    ],
    metaFields: [
      { key: "target_func", label: "Target Function", type: "input", placeholder: "e.g. parseMarkdownBody()", required: true },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD / TL / bugs with the same project" },
      {
        key: "test_type",
        label: "Test Type",
        type: "select",
        options: [
          { label: "Unit", value: "unit" },
          { label: "Integration", value: "integration" },
          { label: "E2E / System", value: "e2e" },
          { label: "Snapshot", value: "snapshot" }
        ],
        required: true
      }
    ],
    templateContent: `# Test Cases

## Target: [target_func] | Type: [unit|integration|e2e|snapshot]

## Test Plan

### Happy Path
\`\`\`
// Given: (preconditions, input values, mock setup)
// When: (call the function / render the component / send the request)
// Then: (expected return value, state change, side effect)
\`\`\`

### Edge Cases
1. **Null / Empty input**: (what happens with undefined, null, "", [], {})
2. **Boundary values**: (min, max, off-by-one)
3. **Concurrent calls**: (race conditions, double-submit)
4. **Error path**: (network failure, timeout, invalid response)

### Test Implementation

\`\`\`typescript
// Example test case for [target_func]
import { describe, it, expect } from "vitest"; // or pytest for Python

describe("[target_func]", () => {
  it("should [expected behavior] when [condition]", () => {
    // Arrange
    // Act
    // Assert
  });
});
\`\`\`

### Coverage Notes
- Lines covered: (estimate %)
- Branches covered: (which conditions are tested)
- What's NOT tested: (explicitly out of scope)

## Project-specific Test Setup
- **YiAi**: No test framework yet — add pytest + httpx (see CLAUDE.md). Test FastAPI routes with TestClient, mock Motor with mongomock or fakeredis, test SSE streaming with httpx.stream()
- **YiVad**: No test framework yet — add Vitest (see CLAUDE.md). Test Pinia stores, test composables with @vue/test-utils, test ProTable requestApi mocks
- **YiPet**: Vitest 2 + jsdom 29 — running! Test React components with @testing-library/react, mock chrome.* APIs, test API services with MSW`
  },

  style: {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "file_path", label: "File Path", minWidth: 200 },
      {
        key: "issue_type",
        label: "Issue",
        width: 130,
        enum: [
          { label: "Naming", value: "naming" },
          { label: "Comments", value: "comments" },
          { label: "Structure", value: "structure" },
          { label: "Consistency", value: "consistency" }
        ]
      }
    ],
    metaFields: [
      { key: "file_path", label: "File Path", type: "input", placeholder: "e.g. src/hooks/useTable.ts", required: true },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD / TL / bugs with the same project" },
      {
        key: "issue_type",
        label: "Issue Type",
        type: "select",
        options: [
          { label: "Naming", value: "naming" },
          { label: "Missing / Stale Comments", value: "comments" },
          { label: "Code Structure / Organisation", value: "structure" },
          { label: "Style Consistency", value: "consistency" }
        ]
      }
    ],
    templateContent: `# Naming & Style Review

## File: [file_path] | Issue: [naming|comments|structure|consistency]

## Finding

### Current State
(What is the naming / style issue? Quote the specific line or pattern.)

### Why It Matters
(Confusion risk, inconsistency with codebase conventions, maintenance burden)

### Suggested Fix
- Current: \`badName\` / \`unclear_structure\`
- Proposed: \`goodName\` / \`clear_structure\`
- Rationale: (follows convention X, clearer intent, matches sibling modules)

## Project-specific Conventions

### YiAi (Python)
- File naming: snake_case
- Class: PascalCase, functions/variables: snake_case
- Imports: stdlib → third-party → internal (separated by blank line)
- Type hints: required for all function signatures (Python 3.10+ syntax)
- Docstrings: descriptive for public API, not required for trivial private helpers
- Async: prefer async def throughout, no sync/async mix in same module

### YiVad (Vue 3 + TypeScript)
- Component: PascalCase filenames, kebab-case CSS classes, camelCase composables
- SFC order: <script setup lang="ts"> → <template> → <style scoped lang="scss">
- Props: defineProps<{...}>() with type generics
- Stores: defineStore with setup-function syntax (not options)
- Paths: @/ alias for cross-module, relative for siblings
- No Options API, no inline styles except dynamic values

### YiPet (React + TypeScript)
- Component: PascalCase dir + co-located CSS (Foo/Foo.tsx + Foo/Foo.css)
- Imports: @/ alias for src/, barrel exports via index.ts
- Hooks: useXxx naming, no class components
- API: four-tier (client → endpoints → types → services), no raw fetch
- Format: Biome 2.5 (not ESLint/Prettier), no semicolons`
  },

  "api-contract": {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "endpoint", label: "Endpoint", minWidth: 200 },
      { key: "method", label: "Method", width: 90 },
      {
        key: "contract_status",
        label: "Status",
        width: 110,
        enum: [
          { label: "Compliant", value: "compliant" },
          { label: "Breaking", value: "breaking" },
          { label: "Drift", value: "drift" }
        ]
      }
    ],
    metaFields: [
      { key: "endpoint", label: "Endpoint", type: "input", placeholder: "e.g. /api/v1/users", required: true },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD / TL / bugs with the same project" },
      {
        key: "method",
        label: "HTTP Method",
        type: "select",
        options: [
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" },
          { label: "PATCH", value: "PATCH" },
          { label: "DELETE", value: "DELETE" }
        ],
        required: true
      },
      {
        key: "contract_status",
        label: "Contract Status",
        type: "select",
        options: [
          { label: "Compliant — matches spec", value: "compliant" },
          { label: "Breaking — backwards-incompatible", value: "breaking" },
          { label: "Drift — spec not updated", value: "drift" }
        ],
        required: true
      }
    ],
    templateContent: `# API Contract Check

## Endpoint: [endpoint] | Method: [GET|POST|PUT|PATCH|DELETE] | Status: [compliant|breaking|drift]

## Contract Definition

### Request
\`\`\`json
{
  "module_name": "services.[domain].[service]",
  "method_name": "[method]",
  "parameters": {
    // Document expected parameters
  }
}
\`\`\`

### Response (Success)
\`\`\`json
{
  "code": 0,
  "message": "ok",
  "data": {
    // Document expected shape
  }
}
\`\`\`

### Response (Error)
- Error codes: (list known error codes and their meanings)
- HTTP status: (200 envelope with code≠0 vs actual HTTP error)

## Contract Check Results

### Backward Compatibility
- [ ] Field names unchanged? (breaking if renamed)
- [ ] Field types unchanged? (breaking if string→number)
- [ ] Required fields not removed? (breaking if client sends and gets ignored)
- [ ] Response shape same? (breaking if array→object or vice versa)

### Drift Detection
- [ ] Spec document matches implementation?
- [ ] Client code matches actual response shape?
- [ ] Type definitions match runtime behavior?

### Found Issues
1. (Issue description — what mismatches)
2. (Impact on callers — which projects break)

## Project-specific Contracts
- **YiAi ↔ YiVad/YiPet RPC Envelope**: { module_name, method_name, parameters } → { code, message, data }
- **Critical parameter names**: \`filter\` (not \`query\`) for data_service.query_documents, \`target_file\` (not \`path\`) for /read-file & /write-file, \`cname\` or \`collection_name\` for collection target
- **SSE Streaming**: data: { "data": { "message": "..." } } per frame, data: { "done": true } to terminate
- **YiAi → Ollama**: http://localhost:11434/api/chat — model-specific parameter passthrough
- **YiPet → Chrome APIs**: chrome.storage, chrome.tabs, chrome.runtime — MV3 manifest v3 constraints`
  },

  "observability-gap": {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "file_path", label: "File / Component", minWidth: 200 },
      {
        key: "gap_type",
        label: "Gap",
        width: 110,
        enum: [
          { label: "Logs", value: "logs" },
          { label: "Metrics", value: "metrics" },
          { label: "Traces", value: "traces" },
          { label: "Alerts", value: "alerts" },
          { label: "Dashboard", value: "dashboard" }
        ]
      }
    ],
    metaFields: [
      { key: "file_path", label: "File / Component", type: "input", placeholder: "e.g. src/services/payment.ts", required: true },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD / TL / bugs with the same project" },
      {
        key: "gap_type",
        label: "Gap Type",
        type: "select",
        options: [
          { label: "Logs — missing key log events", value: "logs" },
          { label: "Metrics — no counters/gauges/histograms", value: "metrics" },
          { label: "Traces — no span instrumentation", value: "traces" },
          { label: "Alerts — no alert on failure path", value: "alerts" },
          { label: "Dashboard — no visibility", value: "dashboard" }
        ],
        required: true
      }
    ],
    templateContent: `# Observability Gap Analysis

## File / Component: [file_path] | Gap: [logs|metrics|traces|alerts|dashboard]

## Current State

### What's Observable
(What logs, metrics, traces, or alerts currently exist for this code path?)

### What's Missing
(Specific logging statements, metric counters, span wrappers, or alert rules that should exist)

## Gap Details

### For Logs
- Missing events: (request start, success, failure, retry, timeout)
- Log levels: (info vs warn vs error — is the right level used?)
- Structured logging: (are key-value pairs used vs string interpolation?)
- Sensitive data: (is PII/secrets accidentally logged?)

### For Metrics
- Missing counters: (requests total, errors total, cache hits/misses)
- Missing gauges: (queue depth, connection pool size, active sessions)
- Missing histograms: (request latency, response size, DB query time)
- Labels / dimensions: (are metrics tagged by endpoint, status, tenant?)

### For Traces
- Missing spans: (DB query, external API call, cache lookup, auth check)
- Span context propagation: (is trace_id passed across service boundaries?)
- Sampling: (is head vs tail sampling configured?)

### For Alerts
- Missing alert rules: (error rate > threshold, latency p99 > SLA, queue depth > max)
- Alert routing: (who gets paged? is there an on-call rotation?)
- Runbooks: (does each alert have a documented response procedure?)

### For Dashboards
- Missing panels: (request rate, error rate, latency percentiles, saturation)
- Audience: (who needs this dashboard — dev, ops, PM?)

## Fix Recommendation

### Action Items
1. Add: (specific log statement / metric / span / alert rule)
2. Tool: (use YiAi logging, Chrome DevTools, Python structlog, etc.)
3. Priority: (blocker / major / minor — based on incident risk)

## Project-specific Gaps
- **YiAi**: No structured logging framework (print statements), no metrics/monitoring, no alerting, apscheduler watcher has no health check, SSE connections not tracked, MongoDB connection pool not monitored, Ollama latency not measured
- **YiVad**: Frontend errors caught by browser console only, no error reporting service (Sentry), no performance monitoring (Web Vitals), no user analytics, ProTable errors silently swallowed
- **YiPet**: Chrome extension has no crash reporting, service worker termination not logged, chat streaming errors not instrumented, CDN load failures silent, chrome.storage quota exceeded not surfaced`
  },

  "concurrency": {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "file_path", label: "File", minWidth: 220 },
      { key: "concern_type", label: "Concern", width: 160, enum: [
        { label: "Data race", value: "data-race" },
        { label: "Deadlock", value: "deadlock" },
        { label: "Livelock / starvation", value: "livelock" },
        { label: "Race condition (TOCTOU)", value: "toctou" },
        { label: "Async ordering", value: "async-ordering" },
        { label: "Goroutine / promise leak", value: "leak" },
        { label: "Cache coherence / stale read", value: "stale-read" }
      ] },
      { key: "severity", label: "Severity", width: 100, enum: SEVERITY_OPTIONS, tagTypeFn: severityTag },
      { key: "status", label: "Status", width: 130, enum: [
        { label: "Open", value: "open" },
        { label: "Triaged", value: "triaged" },
        { label: "In progress", value: "in-progress" },
        { label: "Fixed", value: "fixed" },
        { label: "Won't fix", value: "wont-fix" }
      ] },
      { key: "owner", label: "Owner", width: 120 }
    ],
    metaFields: [
      { key: "file_path", label: "File Path", type: "input", required: true, colSpan: 16, placeholder: "e.g. src/stores/aicr/chat.ts" },
      { key: "project", label: "Project", type: "input", colSpan: 8, placeholder: "Cross-domain join key" },
      { key: "line_range", label: "Line Range", type: "input", colSpan: 8, placeholder: "e.g. 120-160" },
      { key: "concern_type", label: "Concern Type", type: "select", required: true, colSpan: 8, options: [
        { label: "Data race — concurrent write to shared state", value: "data-race" },
        { label: "Deadlock — circular wait on locks", value: "deadlock" },
        { label: "Livelock / starvation", value: "livelock" },
        { label: "TOCTOU — time-of-check vs time-of-use", value: "toctou" },
        { label: "Async ordering — un-awaited promise / wrong .then chain", value: "async-ordering" },
        { label: "Goroutine / promise / subscription leak", value: "leak" },
        { label: "Stale read — cache + DB divergence", value: "stale-read" }
      ] },
      { key: "severity", label: "Severity", type: "select", options: SEVERITY_OPTIONS, required: true, colSpan: 8 },
      { key: "status", label: "Status", type: "select", colSpan: 8, options: [
        { label: "Open", value: "open" },
        { label: "Triaged", value: "triaged" },
        { label: "In progress", value: "in-progress" },
        { label: "Fixed", value: "fixed" },
        { label: "Won't fix", value: "wont-fix" }
      ] },
      { key: "owner", label: "Owner", type: "input", colSpan: 12 },
      { key: "reproducer", label: "Reproducer / Trigger", type: "textarea", colSpan: 24, placeholder: "Steps or load pattern that surfaces the bug" },
      { key: "root_cause", label: "Root Cause", type: "textarea", colSpan: 24, placeholder: "Why the ordering / synchronization is broken" },
      { key: "fix", label: "Fix", type: "textarea", colSpan: 24, placeholder: "Mutex / channel / atomic / AbortController / queue / serialization" },
      { key: "test_added", label: "Test Added", type: "input", colSpan: 12, placeholder: "Link to race-detector / stress test" },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, placeholder: "Quirks — heisenbugs, flaky tests, race detector false-negatives." }
    ],
    templateContent: `# Concurrency Review — [file_path]

## Concern
- Type: [concern_type]
- Line range: [line_range]
- Severity: [severity] · Status: [status]

## Reproducer
[reproducer]

## Root Cause
[root_cause]

## Fix
[fix]

## Test
[test_added]

## Ownership
- Owner: [owner]

## Notes
[notes]`
  },

  "error-handling": {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "file_path", label: "File", minWidth: 220 },
      { key: "concern_type", label: "Concern", width: 160, enum: [
        { label: "Silent swallow", value: "silent-swallow" },
        { label: "Generic catch", value: "generic-catch" },
        { label: "Unpropagated error", value: "unpropagated" },
        { label: "Retry storm", value: "retry-storm" },
        { label: "Lost stack", value: "lost-stack" },
        { label: "User-facing leak", value: "leak" }
      ] },
      { key: "severity", label: "Severity", width: 100, enum: SEVERITY_OPTIONS, tagTypeFn: severityTag },
      { key: "status", label: "Status", width: 130 },
      { key: "owner", label: "Owner", width: 120 }
    ],
    metaFields: [
      { key: "file_path", label: "File Path", type: "input", required: true, colSpan: 16 },
      { key: "project", label: "Project", type: "input", colSpan: 8, placeholder: "Cross-domain join key" },
      { key: "line_range", label: "Line Range", type: "input", colSpan: 8 },
      { key: "concern_type", label: "Concern Type", type: "select", required: true, colSpan: 8, options: [
        { label: "Silent swallow — error caught but not logged or surfaced", value: "silent-swallow" },
        { label: "Generic catch — catch (e) { /* one-size-fits-all */ }", value: "generic-catch" },
        { label: "Unpropagated error — return value loses the failure", value: "unpropagated" },
        { label: "Retry storm — loop / exponent without backoff or circuit-break", value: "retry-storm" },
        { label: "Lost stack — new Error() replaces cause; no .cause chain", value: "lost-stack" },
        { label: "User-facing leak — raw stack / PII shown to user", value: "leak" }
      ] },
      { key: "severity", label: "Severity", type: "select", options: SEVERITY_OPTIONS, required: true, colSpan: 8 },
      { key: "status", label: "Status", type: "select", colSpan: 8, options: [
        { label: "Open", value: "open" },
        { label: "Triaged", value: "triaged" },
        { label: "In progress", value: "in-progress" },
        { label: "Fixed", value: "fixed" },
        { label: "Won't fix", value: "wont-fix" }
      ] },
      { key: "owner", label: "Owner", type: "input", colSpan: 12 },
      { key: "current", label: "Current Handling (snippet)", type: "textarea", colSpan: 24, placeholder: "Paste the catch / try block as-is" },
      { key: "problem", label: "Problem", type: "textarea", colSpan: 24, placeholder: "What failure mode this causes" },
      { key: "fix", label: "Fix", type: "textarea", colSpan: 24, placeholder: "Typed error / .cause chain / logging / user-safe message / retry policy" },
      { key: "test_added", label: "Test Added", type: "input", colSpan: 12 },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, placeholder: "Quirks — error-boundary swallowing, abort vs error, partial-failure telemetry." }
    ],
    templateContent: `# Error Handling Review — [file_path]

## Concern
- Type: [concern_type] · Line range: [line_range]
- Severity: [severity] · Status: [status]

## Current
[current]

## Problem
[problem]

## Fix
[fix]

## Test
[test_added]

## Ownership
- Owner: [owner]

## Notes
[notes]`
  },

  "dead-code": {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "symbol", label: "Symbol", minWidth: 200 },
      { key: "symbol_kind", label: "Kind", width: 130, enum: [
        { label: "Function", value: "function" },
        { label: "Method", value: "method" },
        { label: "Class / type", value: "class" },
        { label: "Constant / var", value: "var" },
        { label: "Import", value: "import" },
        { label: "File / module", value: "file" },
        { label: "CSS class", value: "css" }
      ] },
      { key: "file_path", label: "File", width: 220 },
      { key: "confidence", label: "Confidence", width: 120, enum: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" }
      ] },
      { key: "status", label: "Status", width: 130 },
      { key: "owner", label: "Owner", width: 120 }
    ],
    metaFields: [
      { key: "symbol", label: "Symbol", type: "input", required: true, colSpan: 16, placeholder: "Function / file / class name" },
      { key: "project", label: "Project", type: "input", colSpan: 8, placeholder: "Cross-domain join key" },
      { key: "symbol_kind", label: "Kind", type: "select", required: true, colSpan: 8, options: [
        { label: "Function", value: "function" },
        { label: "Method", value: "method" },
        { label: "Class / type", value: "class" },
        { label: "Constant / var", value: "var" },
        { label: "Import", value: "import" },
        { label: "File / module", value: "file" },
        { label: "CSS class", value: "css" }
      ] },
      { key: "file_path", label: "File Path", type: "input", required: true, colSpan: 16 },
      { key: "confidence", label: "Confidence", type: "select", required: true, colSpan: 8, options: [
        { label: "High — no static refs", value: "high" },
        { label: "Medium — refs look dynamic", value: "medium" },
        { label: "Low — usage unconfirmed", value: "low" }
      ] },
      { key: "status", label: "Status", type: "select", colSpan: 8, options: [
        { label: "Identified", value: "identified" },
        { label: "Verified unused", value: "verified" },
        { label: "Marked for removal", value: "marked" },
        { label: "Removed", value: "removed" },
        { label: "Kept (still in use)", value: "kept" }
      ] },
      { key: "owner", label: "Owner", type: "input", colSpan: 8 },
      { key: "detection_method", label: "Detection Method", type: "input", colSpan: 12, placeholder: "e.g. ts-prune, knip, eslint no-unused-vars, grep" },
      { key: "dynamic_refs", label: "Dynamic / Runtime Refs", type: "textarea", colSpan: 24, placeholder: "Anything that defeats static analysis — eval, dynamic import, runtime register" },
      { key: "removal_plan", label: "Removal Plan", type: "textarea", colSpan: 24, placeholder: "PR strategy — single PR or sweep + i18n / route checks" },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, placeholder: "Quirks — feature-flagged code, public SDK, fake dead code." }
    ],
    templateContent: `# Dead Code — [symbol]

## Symbol
- Kind: [symbol_kind] · File: [file_path]
- Confidence: [confidence] · Status: [status]

## Detection
- Method: [detection_method]
- Dynamic refs: [dynamic_refs]

## Removal Plan
[removal_plan]

## Ownership
- Owner: [owner]

## Notes
[notes]`
  },

  "backward-compat": {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "change", label: "Change", minWidth: 220 },
      { key: "surface", label: "Surface", width: 160, enum: [
        { label: "Public API", value: "api" },
        { label: "DB schema", value: "db-schema" },
        { label: "Config / env var", value: "config" },
        { label: "Event / payload", value: "event" },
        { label: "File / path", value: "file" },
        { label: "Behavior / contract", value: "behavior" }
      ] },
      { key: "breaking", label: "Breaking?", width: 110, enum: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
        { label: "Conditional", value: "conditional" }
      ] },
      { key: "risk", label: "Risk", width: 100, enum: RISK_OPTIONS, tagTypeFn: riskTag },
      { key: "status", label: "Status", width: 130 },
      { key: "owner", label: "Owner", width: 120 }
    ],
    metaFields: [
      { key: "change", label: "Change", type: "input", required: true, colSpan: 16, placeholder: "e.g. Rename session_id → session_key" },
      { key: "project", label: "Project", type: "input", colSpan: 8, placeholder: "Cross-domain join key — links to BRD / TL / bugs with the same project" },
      { key: "surface", label: "Surface", type: "select", required: true, colSpan: 8, options: [
        { label: "Public API — endpoint / handler signature", value: "api" },
        { label: "DB schema — collection / column / index", value: "db-schema" },
        { label: "Config / env var", value: "config" },
        { label: "Event / payload — SSE, webhook, message", value: "event" },
        { label: "File / path — read/write target", value: "file" },
        { label: "Behavior / contract — ordering, side effects", value: "behavior" }
      ] },
      { key: "breaking", label: "Breaking?", type: "select", required: true, colSpan: 8, options: [
        { label: "Yes — hard breaking", value: "yes" },
        { label: "No — fully backward compatible", value: "no" },
        { label: "Conditional — depends on consumer", value: "conditional" }
      ] },
      { key: "risk", label: "Risk", type: "select", options: RISK_OPTIONS, required: true, colSpan: 8 },
      { key: "status", label: "Status", type: "select", colSpan: 8, options: [
        { label: "Proposed", value: "proposed" },
        { label: "Reviewed", value: "reviewed" },
        { label: "Implementing", value: "implementing" },
        { label: "Shipped", value: "shipped" },
        { label: "Reverted", value: "reverted" },
        { label: "Won't ship", value: "wont-ship" }
      ] },
      { key: "owner", label: "Owner", type: "input", colSpan: 8 },
      { key: "current_contract", label: "Current Contract", type: "textarea", colSpan: 24, placeholder: "Shape / type / behavior before the change" },
      { key: "new_contract", label: "New Contract", type: "textarea", colSpan: 24, placeholder: "Shape / type / behavior after the change" },
      { key: "affected_consumers", label: "Affected Consumers", type: "textarea", colSpan: 24, placeholder: "Internal + external callers, by name" },
      { key: "migration", label: "Migration Path", type: "textarea", colSpan: 24, placeholder: "How consumers migrate — dual-write, shim, version bump, deprecation window" },
      { key: "rollback", label: "Rollback Plan", type: "textarea", colSpan: 24, placeholder: "How to revert if breakage exceeds tolerance" },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, placeholder: "Quirks — undocumented consumers, mobile client lag, silent field rename." }
    ],
    templateContent: `# Backward Compat Review — [change]

## Surface
- Surface: [surface] · Breaking: [breaking] · Risk: [risk]
- Status: [status] · Owner: [owner]

## Contracts
- Current: [current_contract]
- New: [new_contract]

## Affected Consumers
[affected_consumers]

## Migration
[migration]

## Rollback
[rollback]

## Notes
[notes]`
  },

  "i18n-a11y": {
    metaColumns: [
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "file_path", label: "File / Component", minWidth: 220 },
      { key: "concern_type", label: "Concern", width: 160, enum: [
        { label: "Hardcoded string", value: "hardcoded" },
        { label: "Untranslated key", value: "untranslated" },
        { label: "Missing aria", value: "missing-aria" },
        { label: "Keyboard trap", value: "keyboard-trap" },
        { label: "Color contrast", value: "contrast" },
        { label: "Focus order", value: "focus-order" },
        { label: "Screen-reader test", value: "sr-test" }
      ] },
      { key: "severity", label: "Severity", width: 100, enum: SEVERITY_OPTIONS, tagTypeFn: severityTag },
      { key: "status", label: "Status", width: 130 },
      { key: "owner", label: "Owner", width: 120 }
    ],
    metaFields: [
      { key: "file_path", label: "File / Component", type: "input", required: true, colSpan: 16, placeholder: "e.g. src/views/aiChat/components/MessageBubble.vue" },
      { key: "project", label: "Project", type: "input", colSpan: 8, placeholder: "Cross-domain join key" },
      { key: "line_range", label: "Line Range", type: "input", colSpan: 8 },
      { key: "concern_type", label: "Concern Type", type: "select", required: true, colSpan: 8, options: [
        { label: "Hardcoded string — no i18n key", value: "hardcoded" },
        { label: "Untranslated key — key exists but no zh/en value", value: "untranslated" },
        { label: "Missing aria — aria-label / role / aria-live absent", value: "missing-aria" },
        { label: "Keyboard trap — focus can't escape", value: "keyboard-trap" },
        { label: "Color contrast — below WCAG AA", value: "contrast" },
        { label: "Focus order — illogical tab sequence", value: "focus-order" },
        { label: "Screen-reader test — not verified with NVDA/VoiceOver", value: "sr-test" }
      ] },
      { key: "severity", label: "Severity", type: "select", options: SEVERITY_OPTIONS, required: true, colSpan: 8 },
      { key: "status", label: "Status", type: "select", colSpan: 8, options: [
        { label: "Open", value: "open" },
        { label: "Triaged", value: "triaged" },
        { label: "In progress", value: "in-progress" },
        { label: "Fixed", value: "fixed" },
        { label: "Won't fix", value: "wont-fix" }
      ] },
      { key: "owner", label: "Owner", type: "input", colSpan: 8 },
      { key: "current", label: "Current Code", type: "textarea", colSpan: 24, placeholder: "Paste the offending markup / string" },
      { key: "problem", label: "Problem", type: "textarea", colSpan: 24, placeholder: "Who is excluded and how" },
      { key: "fix", label: "Fix", type: "textarea", colSpan: 24, placeholder: "i18n key, aria attrs, role, focus mgmt, contrast tokens" },
      { key: "test_added", label: "Test Added", type: "input", colSpan: 12, placeholder: "axe / jest-axe / manual SR test notes" },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, placeholder: "Quirks — RTL languages, dynamic content, ARIA live regions for streaming." }
    ],
    templateContent: `# i18n / a11y Review — [file_path]

## Concern
- Type: [concern_type] · Line range: [line_range]
- Severity: [severity] · Status: [status]

## Current
[current]

## Problem
[problem]

## Fix
[fix]

## Test
[test_added]

## Ownership
- Owner: [owner]

## Notes
[notes]`
  }
};
