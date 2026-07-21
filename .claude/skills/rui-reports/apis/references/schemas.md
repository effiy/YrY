# API Request Report Data Schemas

This document defines the JSON schemas for `data.js` produced by
`rui-report-apis`. The implementing agent writes `window.REPORT_CONFIG`
and `window.REPORT_DATA` following these contracts.

---

## REPORT_CONFIG

Static configuration and labels — written verbatim per run.

```json
{
  "options": {
    "topN": 20,
    "theme": "dark",
    "generatedAt": "2026-07-21T12:00:00.000Z"
  },
  "constants": {
    "filterDebounceMs": 200,
    "componentReadyTimeoutMs": 5000
  },
  "labels": {
    "title": "rui-report-apis",
    "footerMethodology": "Methodology: references/methodology.md · schemas: references/schemas.md",
    "sectionSummary": "Summary",
    "sectionEndpoints": "Endpoints",
    "sectionSemantics": "HTTP Semantics",
    "sectionPatterns": "Patterns",
    "sectionSecurity": "Security",
    "sectionHealth": "Health & Contracts",
    "sectionRemediation": "Remediation",
    "colPath": "Path",
    "colMethod": "Method",
    "colHandler": "Handler",
    "colHandlerFile": "Handler File",
    "colLine": "Line",
    "colSafe": "Safe",
    "colIdempotent": "Idempotent",
    "colAuthMechanism": "Auth Mechanism",
    "colValidationDepth": "Validation",
    "colContentTypes": "Content Types",
    "colResponseFormat": "Response Format",
    "colErrorFormat": "Error Format",
    "colPagination": "Pagination",
    "colMiddleware": "Middleware",
    "colAuth": "Auth",
    "colRateLimited": "Rate Limited",
    "colErrorHandling": "Error Handling",
    "colStatusCodes": "Status Codes",
    "colLines": "Handler LOC",
    "colComplexity": "Complexity",
    "colRestScore": "REST Score",
    "colVersion": "Version",
    "colResource": "Resource",
    "colMethodCount": "Methods",
    "colIssues": "Issues",
    "colCount": "Count",
    "colPct": "%",
    "colCategory": "Category",
    "colEffort": "Effort",
    "colUplift": "Uplift",
    "colMessage": "Finding",
    "emptyEndpoints": "No API requests detected in scope.",
    "emptySemantics": "No HTTP semantics data collected.",
    "emptyPatterns": "No route patterns identified.",
    "emptySecurity": "No security issues detected.",
    "emptyHealth": "No health issues detected.",
    "emptyRemediation": "No remediation items — all clear.",
    "filterPlaceholder": "filter by path, method, or handler…",
    "exportJson": "Export JSON",
    "exportCsv": "Export CSV",
    "copyPath": "Copy",
    "securityAuthCoverage": "Auth Coverage",
    "securityAuthMechanisms": "Auth Mechanisms",
    "securityRateLimit": "Rate Limit Coverage",
    "securityCorsConfigured": "CORS",
    "securityHeadersScore": "Security Headers",
    "securityValidationCoverage": "Input Validation",
    "securityMissingAuth": "Requests Missing Auth",
    "securityMissingRateLimit": "Requests Missing Rate Limit",
    "securityMissingValidation": "Requests Missing Validation",
    "healthErrorCoverage": "Error Handling Coverage",
    "healthResponseConsistency": "Response Consistency Score",
    "healthHighComplexity": "High Complexity Handlers",
    "healthNegotiationScore": "Content Negotiation",
    "healthErrorFormatScore": "Error Format (RFC 7807)",
    "semanticsSafeCount": "Safe Requests",
    "semanticsUnsafeCount": "Unsafe Requests",
    "semanticsIdempotentCount": "Idempotent Requests",
    "semanticsMisuseCount": "Method Misuse",
    "contractsValidationDepth": "Validation Depth",
    "contractsPaginationCoverage": "Pagination Coverage",
  }
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `options.topN` | number | yes | Max items in ranked lists |
| `options.theme` | string | yes | `"dark"` or `"light"` |
| `options.generatedAt` | string | yes | ISO 8601 timestamp |
| `constants.filterDebounceMs` | number | yes | Debounce delay for filter inputs |
| `constants.componentReadyTimeoutMs` | number | yes | Max wait for component registration |
| `labels.*` | string | yes | UI labels for sections, columns, empty states |

---

## REPORT_DATA

Runtime analysis data — the implementing agent fills this from the
codebase scan. Every object is framed from the HTTP request lifecycle.

```json
{
  "scope": "src/api/",
  "score": 72,
  "summary": {
    "totalRequests": 45,
    "totalHandlers": 38,
    "totalMethods": { "GET": 20, "POST": 12, "PUT": 6, "DELETE": 4, "PATCH": 3 },
    "authCoverage": 0.78,
    "validationDepthCoverage": 0.62,
    "errorHandlingCoverage": 0.55,
    "deprecatedCount": 3,
    "criticalCount": 5,
    "maxHandlerLines": 420,
    "dominantResponseFormat": "JSON",
    "dominantAuthMechanism": "JWT",
    "semanticsScore": 82,
    "contractScore": 65,
    "methodMisuseCount": 3,
    "paginationCoverage": 0.45,
    "rfc7807ComplianceScore": 40
  },
  "endpoints": [
    {
      "_comment": "Each endpoint framed by HTTP request lifecycle stages",
      "path": "/api/v1/users/:id",
      "method": "GET",
      "_ingress": "--- Request Admission ---",
      "auth": true,
      "authMechanism": "JWT",
      "validationDepth": { "body": false, "params": true, "query": false, "headers": false },
      "contentTypes": ["application/json"],
      "rateLimited": true,
      "_processing": "--- Handler Processing ---",
      "handler": "users.get",
      "handlerFile": "src/handlers/users.ts",
      "line": 48,
      "middleware": ["auth", "validate", "rateLimit"],
      "handlerLines": 52,
      "_egress": "--- Response Egress ---",
      "statusCodes": [200, 401, 404],
      "responseFormat": "JSON",
      "errorFormat": "custom",
      "paginationStyle": "none",
      "_semantics": "--- HTTP Semantics ---",
      "safe": true,
      "idempotent": true,
      "_contract": "--- Contract & Metadata ---",
      "hasOpenApiSpec": false,
      "deprecated": false,
      "version": "v1"
    }
  ],
  "semantics": {
    "score": 82,
    "safeCount": 20,
    "unsafeCount": 25,
    "idempotentCount": 30,
    "nonIdempotentCount": 15,
    "methodMisuse": [
      {
        "path": "/api/legacy/getUsers",
        "method": "GET",
        "handlerFile": "src/handlers/legacy.ts",
        "line": 12,
        "issue": "GET with side effects — verb in path suggests mutation",
        "severity": "P0"
      },
      {
        "path": "/api/admin/export",
        "method": "POST",
        "handlerFile": "src/handlers/admin.ts",
        "line": 56,
        "issue": "POST used for data retrieval — consider GET with query params",
        "severity": "P1"
      }
    ],
    "methodCorrectness": [
      { "method": "GET", "total": 20, "correct": 18, "misuse": 2 }
    ]
  },
  "methods": [
    { "method": "GET", "count": 20, "pct": 44.4, "safe": true, "idempotent": true },
    { "method": "POST", "count": 12, "pct": 26.7, "safe": false, "idempotent": false },
    { "method": "PUT", "count": 6, "pct": 13.3, "safe": false, "idempotent": true },
    { "method": "DELETE", "count": 4, "pct": 8.9, "safe": false, "idempotent": true },
    { "method": "PATCH", "count": 3, "pct": 6.7, "safe": false, "idempotent": false }
  ],
  "patterns": [
    {
      "pattern": "/api/v1/users",
      "version": "v1",
      "resource": "users",
      "restScore": 90,
      "issues": [],
      "methodCount": 5
    },
    {
      "pattern": "/api/legacy/getData",
      "version": null,
      "resource": "data",
      "restScore": 20,
      "issues": ["Verb in path", "No version prefix", "Mixed case"],
      "methodCount": 1
    }
  ],
  "security": {
    "authCoverage": 0.78,
    "authMechanisms": {
      "JWT": 28,
      "API Key": 4,
      "none": 13
    },
    "endpointsMissingAuth": [
      { "path": "/api/public/health", "method": "GET", "handlerFile": "src/handlers/health.ts", "line": 8, "authMechanism": "none" }
    ],
    "rateLimitCoverage": 0.43,
    "endpointsMissingRateLimit": [],
    "securityHeadersScore": 60,
    "corsConfigured": true,
    "inputValidationCoverage": 0.64,
    "endpointsMissingValidation": []
  },
  "health": {
    "errorHandlingCoverage": 0.57,
    "endpointsWithoutErrorHandling": [
      { "path": "/api/v1/orders", "method": "POST", "handlerFile": "src/handlers/orders.ts", "line": 62 }
    ],
    "handlerComplexity": [
      { "path": "/api/admin/export", "method": "POST", "handler": "admin.export", "handlerFile": "src/handlers/admin.ts", "line": 56, "lines": 420, "complexity": "high" }
    ],
    "responseConsistencyScore": 72,
    "contentNegotiationScore": 30,
    "errorFormatScore": 40,
    "statusCodeDistribution": { "200": 28, "201": 6, "400": 4, "401": 8, "404": 6, "500": 2 },
    "paginationCoverage": 0.45,
    "contractScore": 65
  },
  "alerts": [
    {
      "severity": "P0",
      "marker": "P0",
      "category": "security",
      "file": "src/handlers/legacy.ts",
      "line": 12,
      "message": "GET /api/legacy/getUsers — mutation request missing auth",
      "metric": "no auth",
      "impact": "Unauthenticated access to sensitive data.",
      "effort": "medium",
      "scoreUplift": 10,
      "recommendations": ["Add auth middleware to the route.", "Audit all routes in this handler.", "Add CI rule to block routes without auth."],
      "risk": "If left unfixed: any unauthenticated client can access protected resources.",
      "blastRadius": "user data + service availability",
      "estimatedHours": 4,
      "acceptance": ["All routes have auth middleware.", "Integration test verifies 401 for unauthenticated requests."],
      "firstStep": "List all routes in handler and verify each has auth middleware.",
      "tooling": [{ "name": "eslint-plugin-security", "hint": "detect missing auth patterns" }],
      "preventiveControls": ["CI: lint rule blocks routes without auth middleware."],
      "rollbackPlan": "Revert the middleware addition; no API contract change."
    }
  ],
  "records": []
}
```

### Top-level fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scope` | string | yes | Analyzed directory scope |
| `score` | number | yes | Composite health score 0–100 |
| `summary` | object | yes | Aggregated metrics |
| `endpoints` | array | yes | Full request inventory |
| `semantics` | object | yes | HTTP semantics analysis (NEW) |
| `methods` | array | yes | HTTP method distribution |
| `patterns` | array | yes | Route pattern analysis |
| `security` | object | yes | Security posture |
| `health` | object | yes | Request reliability + contracts |
| `alerts` | array | yes | Prioritized issues |
| `records` | array | no | Raw records for CSV export |

### Endpoint object (request-lifecycle model)

| Field | Type | Required | Stage | Description |
|-------|------|----------|-------|-------------|
| `path` | string | yes | Ingress | Route path with placeholders |
| `method` | string | yes | Ingress | HTTP method in uppercase |
| `auth` | boolean | yes | Ingress | Whether auth middleware is present |
| `authMechanism` | string | yes | Ingress | `JWT`/`OAuth`/`API Key`/`Session`/`Basic`/`none` |
| `validationDepth` | object | yes | Ingress | `{body, params, query, headers}` each boolean |
| `contentTypes` | string[] | yes | Ingress | Accepted content types |
| `rateLimited` | boolean | no | Ingress | Whether rate limiting is applied |
| `handler` | string | yes | Processing | Qualified handler identifier |
| `handlerFile` | string | yes | Processing | Relative path to handler source |
| `line` | number | no | Processing | Line number of route definition |
| `middleware` | string[] | yes | Processing | Middleware names |
| `handlerLines` | number | no | Processing | Handler LOC |
| `statusCodes` | number[] | no | Egress | HTTP status codes returned |
| `responseFormat` | string | yes | Egress | `JSON`/`XML`/`stream`/`text`/`binary` |
| `errorFormat` | string | yes | Egress | `RFC7807`/`custom`/`none` |
| `paginationStyle` | string | yes | Egress | `offset`/`cursor`/`page`/`none` |
| `safe` | boolean | yes | Semantics | Safe per RFC 7231 |
| `idempotent` | boolean | yes | Semantics | Idempotent per RFC 7231 |
| `hasOpenApiSpec` | boolean | no | Contract | OpenAPI/Swagger coverage |
| `deprecated` | boolean | no | Contract | Deprecation status |
| `version` | string | no | Contract | API version prefix |

### Semantics object (NEW)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `score` | number | yes | Semantics health score 0–100 |
| `safeCount` | number | yes | Count of safe requests |
| `unsafeCount` | number | yes | Count of unsafe requests |
| `idempotentCount` | number | yes | Count of idempotent requests |
| `nonIdempotentCount` | number | yes | Count of non-idempotent requests |
| `methodMisuse` | array | yes | Detected method misuse instances |
| `methodCorrectness` | array | yes | Per-method correctness stats |

### Alert categories (extended)

New categories added for HTTP request lifecycle analysis:

| Category | When triggered |
|----------|---------------|
| `semantics` | HTTP method misuse (GET with side effects, POST for reads) |
| `contracts` | Missing/inconsistent request/response schemas |
| `pagination` | Unpaginated collections, inconsistent pagination style |

### Alert severity thresholds (extended)

| Condition | Severity |
|-----------|----------|
| Mutation request without auth | P0 |
| GET with side effects | P0 |
| Mutation request without body validation | P0 |
| Handler > 500 LOC | P0 |
| Missing error handling on mutation request | P1 |
| POST used for reads | P1 |
| Deprecated request still referenced | P1 |
| Non-RESTful pattern (verb in path) | P1 |
| Missing version prefix | P1 |
| Unpaginated collection request | P1 |
| Error format not RFC 7807 compliant | P1 |
| Inconsistent response format across requests | P1 |
| Missing rate limiting | P2 |
| Handler 200–500 LOC | P2 |
| PUT for partial updates (use PATCH) | P2 |
| Response format outlier | P2 |
| Inconsistent pagination style | P2 |
| No Content-Type request validation | P2 |
| No CORS configured | P2 |
