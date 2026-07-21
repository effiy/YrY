---
name: yry-report-apis
description: >
  Generate interactive API request analysis reports from a professional
  HTTP request-lifecycle perspective. Analyzes every API request through
  six dimensions: HTTP semantics (safety, idempotency, method correctness),
  request contracts (validation depth, content types, auth mechanism),
  response contracts (consistency, error format, pagination, status code
  usage), security posture (auth coverage, rate limiting, security headers),
  reliability (error handling, handler complexity), and pattern quality
  (RESTfulness, versioning, naming conventions). Produces a self-contained
  Vue 3 HTML report with sortable tables, charts, and a prioritized
  remediation queue. Use when the user wants to audit API quality from a
  request-centric perspective, analyze REST/GraphQL/gRPC interfaces, or
  generate an API professional report. Trigger words: API report, API audit,
  endpoint analysis, API usage, generate API report, API health check,
  API request analysis, API quality report, API contract analysis.
lifecycle: default-pipeline
user_invocable: true
---

# yry-report-apis

> Generate professional API request analysis reports — every endpoint
> evaluated through the lens of a complete HTTP request lifecycle:
> ingress → processing → egress → contract.

## What this skill does

- Analyzes every API request through the **HTTP request lifecycle**:
  request admission → handler processing → response production → contract governance
- Reports on **HTTP semantics**: safety (safe/unsafe), idempotency, method correctness per RFC 7231
- Evaluates **request contracts**: validation depth, accepted content types, auth mechanism type
- Evaluates **response contracts**: format consistency, error format (RFC 7807), pagination style, status code semantics
- Identifies API design issues and provides prioritized remediation with impact estimation
- Generates a self-contained, interactive HTML report powered by Vue 3
- Supports keyboard navigation, section collapsing, sortable/filterable tables, and export to JSON/CSV

## What this skill does NOT do

- Does NOT modify any source files
- Does NOT require a running server or runtime to analyze
- Does NOT upload or transmit any source code
- Does NOT replace an API gateway or real-time monitoring
- Does NOT perform dynamic testing (load, penetration)

## Report Structure

```
Summary → Endpoints → HTTP Semantics → Patterns → Security → Health → Remediation
```

### Section overview

| Section | What it covers |
|---------|---------------|
| **Summary** | Composite health score (0–100), total requests, method distribution overview, key findings |
| **Endpoints** | Complete request inventory — path, HTTP method, handler, middleware chain, request/response metadata |
| **HTTP Semantics** | Method safety, idempotency classification, RFC 7231 compliance, correct method usage |
| **Patterns** | Route pattern analysis — versioning, RESTfulness score, naming conventions, anti-patterns from consumer perspective |
| **Security** | Auth mechanism depth (JWT/OAuth/API Key), rate limiting, security response headers, input validation coverage |
| **Health** | Error handling quality, response format consistency, status code correctness, handler complexity, content negotiation |
| **Remediation** | Prioritized P0/P1/P2 action queue grouped by category with impact estimation and specific recommendations |

## Workflow

```
Scan Codebase → Extract Requests → Analyze Semantics → Analyze Contracts → Score & Classify → Generate Report
```

Key principles:
1. All analysis is static — no runtime instrumentation needed
2. Every finding is framed from the **HTTP request lifecycle** perspective
3. The report is a single self-contained directory with HTML/CSS/JS/data.js
4. Data stays local — nothing is uploaded or transmitted
5. Reports are interactive with keyboard shortcuts and collapsible sections
6. Follow the same page architecture as YiDoc/files pattern

## Borders

| Boundary | Permission |
|----------|-----------|
| Source code being analyzed | read-only |
| Report output directory | read + write |
| System files outside workspace | no access |

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Never modify source files during analysis | Analysis must be non-destructive |
| 2 | Generate `data.js` with structured `REPORT_DATA` and `REPORT_CONFIG` | Separates data from presentation |
| 3 | Frame every metric from the HTTP request lifecycle perspective | Professional API analysis standard |
| 4 | Use Vue 3 CDN for interactivity | No build step required for the report |
| 5 | All CSS variables must use semantic names (no numbers in names) | Project style convention |
| 6 | Include keyboard shortcuts (1–N, t, ?) | Consistency with other yry-reports |
| 7 | Report pages follow YiDoc/files architecture | Proven modular pattern |
| 8 | Enrich alerts with category defaults (risk, blastRadius, estimatedHours, acceptance, firstStep, tooling, preventiveControls, rollbackPlan) | Consistent remediation UX |

## Page Architecture

```
docs/reports/apis/
├── index.html          # Vue 3 template with CDN loader + section components
├── index.css           # Page-level styles (layout, TOC, header, footer, print)
├── index.js            # Entry point — deferred mount
├── data.js             # window.REPORT_CONFIG + window.REPORT_DATA
├── app/
│   ├── state.js        # data() + computed properties
│   ├── actions.js      # methods (toggle remediation, copy path)
│   ├── lifecycle.js    # mounted/beforeUnmount (Observer, scroll, keyboard)
│   └── mount.js        # Vue app boot + component registration
├── components/
│   ├── yry-report-api-summary/    # Health score + stat cards
│   ├── yry-report-api-endpoints/  # Request inventory (sortable, filterable)
│   ├── yry-report-api-semantics/  # HTTP semantics analysis (NEW)
│   ├── yry-report-api-patterns/   # Pattern analysis table
│   ├── yry-report-api-security/   # Security audit table
│   ├── yry-report-api-health/     # Error handling + response quality + contracts
│   └── yry-report-api-remediation/# P0/P1/P2 action queue
├── lib/
│   └── yry-sortable.js           # Sortable table utility
└── references/
    ├── methodology.md             # Analysis methodology (embedded or linked)
    └── schemas.md                 # Data schemas
```

## Data Model

### REPORT_CONFIG (static, labels + options)

```javascript
window.REPORT_CONFIG = {
  options: {
    topN: 20,
    theme: 'dark',
    generatedAt: '2026-07-21T12:00:00.000Z',
  },
  constants: {
    filterDebounceMs: 200,
    componentReadyTimeoutMs: 5000,
  },
  labels: {
    title: 'yry-report-apis',
    footerMethodology: 'Methodology: references/methodology.md',
    sectionSummary: 'Summary',
    sectionEndpoints: 'Endpoints',
    sectionSemantics: 'HTTP Semantics',
    sectionPatterns: 'Patterns',
    sectionSecurity: 'Security',
    sectionHealth: 'Health & Contracts',
    sectionRemediation: 'Remediation',
    // ... column headers, empty states
  },
};
```

### REPORT_DATA (runtime analysis)

```javascript
window.REPORT_DATA = {
  scope: 'src/',
  score: 72,
  summary: { /* aggregated metrics */ },
  endpoints: [ /* each with request-lifecycle fields */ ],
  semantics: { /* HTTP semantics analysis */ },
  patterns: [ /* route pattern analysis */ ],
  security: { /* security posture from request perspective */ },
  health: { /* response quality + handler health */ },
  alerts: [ /* prioritized P0/P1/P2 items */ ],
  records: [],
};
```

Each endpoint record carries request-lifecycle metadata:

```javascript
{
  path: '/api/v1/users/:id',
  method: 'GET',
  // -- Request admission
  auth: true,
  authMechanism: 'JWT',           // JWT | OAuth | API Key | Session | none
  validationDepth: {              // what parts of the request are validated
    body: false, params: true, query: false, headers: false,
  },
  contentTypes: ['application/json'],
  rateLimited: true,
  // -- Handler processing
  handler: 'users.get',
  handlerFile: 'src/handlers/users.ts',
  handlerLines: 52,
  middleware: ['auth', 'validate', 'rateLimit'],
  // -- Response egress
  statusCodes: [200, 401, 404],
  responseFormat: 'JSON',         // JSON | XML | stream | text
  errorFormat: 'custom',          // RFC7807 | custom | none
  paginationStyle: 'offset',      // offset | cursor | page | none
  // -- HTTP semantics
  safe: true,                     // GET/HEAD/OPTIONS are safe
  idempotent: true,               // GET/PUT/DELETE/HEAD are idempotent
  // -- Contract
  hasOpenApiSpec: false,
  deprecated: false,
  version: 'v1',
}
```

## Category defaults for alert enrichment

| Category | risk | blastRadius | estimatedHours | firstStep |
|----------|------|-------------|----------------|-----------|
| `security` | Unauthenticated requests expose sensitive data | request path + data | 4 | List all routes and verify auth middleware |
| `validation` | Untrusted input reaches business logic | request body → downstream | 3 | Add request body schema validation |
| `error_handling` | Unhandled errors leak stack traces or crash process | single request → cascading failure | 2 | Wrap handler in try/catch |
| `deprecation` | Consumers depend on removed APIs | all callers of the endpoint | 8 | Add deprecation header + sunset date |
| `pattern` | Non-RESTful patterns confuse consumers and tooling | all API consumers | 6 | Refactor to REST conventions |
| `complexity` | Overly large handlers hard to test and maintain | handler + reviewers | 12 | Split handler by concern |
| `versioning` | Missing version prefix → breaking changes affect all consumers | all API consumers | 10 | Add /v1/ prefix |
| `semantics` | Incorrect HTTP method usage violates RFC 7231 | all clients and intermediaries | 4 | Correct method per HTTP spec |
| `contracts` | Missing/inconsistent request/response schemas | API consumers + documentation | 6 | Add request/response schemas |
| `pagination` | Unpaginated collections risk response bloat | all collection consumers | 3 | Add pagination with defaults |

## How to generate the report

### Phase 1: Scan the codebase

1. Walk the scope directory using Glob or Grep
2. For each file, search for endpoint definitions using framework-specific patterns
3. Extract per request: path, method, handler, middleware chain, auth mechanism,
   validation targets, content types, response format, pagination style

### Phase 2: Analyze HTTP semantics

Follow [references/methodology.md](./references/methodology.md) Stage 3a:
- Classify each endpoint as safe / unsafe per RFC 7231
- Classify as idempotent / non-idempotent
- Detect method misuse (GET with side effects, POST for reads)
- Compute semantics health score

### Phase 3: Analyze request/response contracts

Follow [references/methodology.md](./references/methodology.md) Stage 5a:
- Assess validation depth (body / params / query / headers)
- Evaluate response format consistency
- Classify error response format (RFC 7807 compliance)
- Detect pagination style and consistency
- Compute contract quality score

### Phase 4: Build data.js

Assemble `REPORT_CONFIG` and `REPORT_DATA` following the schemas in
[references/schemas.md](./references/schemas.md).

### Phase 5: Generate report pages

Generate the full report page structure following the YiDoc/files architecture.
Report sections in order: Summary → Endpoints → HTTP Semantics → Patterns →
Security → Health & Contracts → Remediation.

## Supporting resources

- [references/schemas.md](./references/schemas.md) — JSON schemas for `data.js`
- [references/methodology.md](./references/methodology.md) — Analysis methodology and scoring

## Fallback

| Situation | Behavior |
|-----------|----------|
| No API endpoints detected | Generate report with empty sections and guidance to adjust scope |
| Mixed framework patterns | Analyze each independently; flag inconsistencies |
| Very large codebase (>1000 endpoints) | Offer to scope to specific directories |
| Framework not in supported list | Attempt generic pattern matching; note detection may be incomplete |
| No auth mechanism detected | Flag all as unauthenticated; note potential false positives |
