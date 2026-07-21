# API Request Analysis Methodology

> Full methodology for `rui-report-apis`. The implementing agent
> reads this once before executing, then follows it step by step.
> Every stage is framed from the HTTP request lifecycle perspective:
> **ingress → processing → egress → contract**.

## Stage 1 — Request Discovery

Walk the scope directory and identify API endpoint definitions using
framework-specific patterns.

### 1.1 Framework detection

First, detect the framework(s) in use. Look for:

| Framework | Detection signals |
|-----------|------------------|
| **Express** | `require('express')`, `express()`, `app.get(` / `router.get(` |
| **Next.js** | `next.config`, files under `pages/api/` or `app/api/route` |
| **Fastify** | `require('fastify')`, `fastify.get(` |
| **Koa** | `require('koa')`, `router.get(` |
| **tRPC** | `@trpc/server`, `publicProcedure`, `protectedProcedure` |
| **GraphQL** | `graphql`, `type Query`, `type Mutation`, `buildSchema` |
| **Django** | `urlpatterns`, `@api_view`, `views.py` |
| **Flask** | `@app.route`, `@blueprint.route` |
| **Go net/http** | `mux.HandleFunc`, `router.GET`, `http.HandleFunc` |
| **Go Gin** | `gin.Default()`, `router.GET` |
| **Go Echo** | `echo.New()`, `e.GET` |
| **Go Chi** | `chi.NewRouter()`, `r.Get` |
| **Rust Actix** | `web::resource`, `App::new().service` |
| **Rust Axum** | `Router::new()`, `.route(` |

### 1.2 Request extraction

For each detected endpoint, extract from the request lifecycle perspective:

**Request Admission (Ingress):**
- `path`: Route path pattern (e.g., `/api/users/:id`)
- `method`: HTTP method in uppercase
- `auth`: `true` if any auth middleware detected
- `authMechanism`: Auth type — `JWT`, `OAuth`, `API Key`, `Session`, `Basic`, `none`
- `validationDepth`: Object tracking which request parts are validated
  - `{ body: bool, params: bool, query: bool, headers: bool }`
- `contentTypes`: Array of accepted content types (e.g., `['application/json']`)
- `rateLimited`: `true` if rate limiting middleware detected

**Handler Processing:**
- `handler`: Qualified handler name (e.g., `users.getUser`)
- `handlerFile`: Relative path to the source file
- `line`: Line number where the route is registered
- `middleware[]`: Names of middleware applied (auth, validate, rateLimit, cors, etc.)
- `handlerLines`: Lines of code in the handler function

**Response Egress:**
- `statusCodes[]`: HTTP status codes returned
- `responseFormat`: `JSON` | `XML` | `stream` | `text` | `binary`
- `errorFormat`: `RFC7807` | `custom` | `none` — error response format
- `paginationStyle`: `offset` | `cursor` | `page` | `none`

**Contract & Metadata:**
- `hasOpenApiSpec`: `true` if OpenAPI/Swagger annotations or spec files detected
- `deprecated`: `true` if deprecation markers found
- `version`: API version if detectable from path prefix (v1, v2, etc.)

### 1.3 Express-specific patterns

```javascript
// Direct route
app.get('/api/users', auth, validate, handler);

// Router-based
router.post('/api/users', [auth, validate], handler);

// Route chaining
router.route('/api/users/:id')
  .get(auth, getUser)
  .put(auth, validate, updateUser)
  .delete(auth, deleteUser);
```

### 1.4 Next.js patterns

- File-system routes: `pages/api/users/[id].js` → `GET /api/users/:id`
- App Router: `app/api/users/[id]/route.ts` → exported `GET`, `POST`, etc.
- Middleware: `middleware.ts` applies globally

### 1.5 GraphQL patterns

- Schema definitions: `type Query { users: [User] }`
- Resolver maps: `Query: { users: (_, args, ctx) => {...} }`
- Each field in Query/Mutation is treated as a virtual request

### 1.6 gRPC / tRPC patterns

- tRPC: `publicProcedure.input(z.object({...})).query(({input}) => {...})`
- gRPC: `.proto` files define services and RPC methods

## Stage 2 — Method Distribution

Aggregate all requests by HTTP method:

```
methodCounts = group requests by method
pct = methodCount / totalRequests * 100
```

Emit `methods[]` sorted by count descending.

## Stage 3 — HTTP Semantics Analysis

**This is a core professional stage.** Analyze every request against
RFC 7231 HTTP semantics.

### 3.1 Safety classification

A **safe** method does not modify server state. Per RFC 7231 §4.2.1:

| Method | Safe? | Rationale |
|--------|:-----:|-----------|
| GET | Yes | Retrieval only |
| HEAD | Yes | Like GET without body |
| OPTIONS | Yes | Communication options |
| POST | No | Creates/processes resources |
| PUT | No | Replaces resource |
| PATCH | No | Partial modification |
| DELETE | No | Removes resource |

### 3.2 Idempotency classification

An **idempotent** method produces the same effect whether called once or
multiple times. Per RFC 7231 §4.2.2:

| Method | Idempotent? | Rationale |
|--------|:-----------:|-----------|
| GET, HEAD, OPTIONS | Yes | Pure reads |
| PUT | Yes | Full replacement — same body = same result |
| DELETE | Yes | Resource gone after first call |
| POST | No | Each call creates a new resource |
| PATCH | No* | Can be idempotent with careful design, but not guaranteed |

### 3.3 Method misuse detection

Flag violations of HTTP semantics:

| Pattern | Severity | Description |
|---------|----------|-------------|
| `GET /api/users/delete/:id` | P0 | Side effects on safe method |
| `GET /api/orders/create` | P0 | Mutation disguised as read |
| `POST /api/users/:id` (no body) | P1 | POST should create, use GET for reads |
| `DELETE` with request body | P1 | DELETE should not have a body per spec |
| `PUT` for partial updates | P2 | Use PATCH for partial updates |

### 3.4 Semantics score

```
safeCount = count where safe == true
correctMethodCount = count where no method misuse detected
semanticsScore = (safeCount/utilization_ratio + correctMethodCount/total) * 50
// capped at 100
```

Where `utilization_ratio` measures whether the API uses a healthy mix of
safe and unsafe methods (not all GET or all POST).

## Stage 4 — Pattern Analysis

### 4.1 Route grouping

Group requests by resource (everything after the version prefix and
before path parameters):

```
/api/v1/users        → resource: users
/api/v1/users/:id    → resource: users
/api/v1/users/:id/posts → resource: users
```

### 4.2 RESTfulness score (0–100)

Per resource group, score based on:

| Criterion | Points |
|-----------|--------|
| Uses nouns, not verbs | 20 |
| Has version prefix (/vN/) | 15 |
| Consistent case (kebab-case or camelCase) | 15 |
| Uses standard HTTP methods correctly | 20 |
| Path is plural for collections | 10 |
| No query params for resource identification | 10 |
| No file extensions in path | 10 |

Deduct for anti-patterns:
- Verb in path (`/getUsers`, `/createOrder`): -20
- Mixed case (`/api/UserProfile`): -10
- Trailing slash inconsistency: -5
- Non-standard method usage (`GET /users/delete`): -15

### 4.3 Anti-pattern detection

Flag patterns containing:
- `get`, `create`, `update`, `delete` as path segments (RPC-style)
- Mixed case (e.g., `/api/UserProfile`)
- File extensions (`.json`, `.xml`)
- Action in query string (`?action=delete`)

## Stage 5 — Request/Response Contract Analysis

**New stage.** Analyze the contract quality from a professional API
design perspective.

### 5.1 Validation depth

Assess how thoroughly each request input vector is validated:

```
bodyValidationCoverage = requests with validationDepth.body / requests with body
paramValidationCoverage = requests with validationDepth.params / requests with params
queryValidationCoverage = requests with validationDepth.query / requests with query params
```

A request is fully validated only when **all applicable input vectors**
(body, params, query) have validation. Flag partial validation as P1.

### 5.2 Response format consistency

```
dominantFormat = most common responseFormat across all requests
consistencyScore = (requests with dominantFormat / total) * 100
```

Flag format outliers (e.g., one XML response in a JSON API) as P2.

### 5.3 Error response format (RFC 7807 Problem Details)

```
RFC7807Compliance:
- Structured error body with "type", "title", "status", "detail": +40
- Consistent across all error paths: +30
- Machine-readable error codes: +20
- Trace ID / correlation ID in errors: +10
```

Score 0–100. Below 50 is flagged as P1.

### 5.4 Pagination analysis

For collection endpoints (those returning lists):

| Pagination style | Detection |
|-----------------|-----------|
| **offset** | `?offset=` or `?skip=` params |
| **cursor** | `?cursor=` or `?after=` params |
| **page** | `?page=` param |

```
paginationCoverage = paginated_collection_requests / total_collection_requests
```

Unpaginated collections (> 10 items expected) flagged as P1.
Inconsistent pagination style across collections flagged as P2.

### 5.5 Contract quality score

```
contractScore = validationDepthScore * 0.30
              + responseConsistency * 0.25
              + errorFormatScore * 0.25
              + paginationScore * 0.20
```

## Stage 6 — Security Analysis (Request Perspective)

### 6.1 Auth mechanism analysis

```
authCoverage = requestsWithAuth / totalRequests
```

Requests are "with auth" if:
- Auth middleware is in the middleware chain
- `requireAuth` or similar wrapper detected
- `ctx.user` or `req.user` is accessed in handler

Classify auth mechanism per request:
- Detect patterns: `jwt.verify`, `passport.authenticate`, `api-key` header, `x-api-key`, session cookies
- Flag mutation requests (POST, PUT, PATCH, DELETE) without auth as P0

### 6.2 Rate limiting

```
rateLimitCoverage = requestsWithRateLimit / totalRequests
```

Detect rate limit middleware: `rateLimit`, `rateLimiter`, `throttle`, `limiter`, `express-rate-limit`.

### 6.3 Security response headers

Check for security headers in responses:
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options` or `Content-Security-Policy: frame-ancestors`
- `Content-Security-Policy`
- `X-XSS-Protection` (legacy, but commonly present)

Score as coverage percentage of key headers set.

### 6.4 CORS

Check for CORS configuration: `cors()`, `@CrossOrigin`, `Access-Control-*` headers.

## Stage 7 — Health & Reliability Analysis

### 7.1 Error handling coverage

```
errorHandlingCoverage = requestsWithErrorHandling / totalRequests
```

A request has error handling if:
- `try/catch` wraps the handler body
- Error middleware is registered on the route
- `.catch()` is chained on promises
- Framework error handler is configured

### 7.2 Handler complexity

Classify by handler LOC:

| LOC | Complexity | Severity |
|-----|-----------|----------|
| > 500 | high | P0 |
| 200–500 | medium | P1 |
| < 200 | low | — |

### 7.3 Status code correctness

Verify status codes follow HTTP semantics:

| Request type | Expected success code |
|-------------|----------------------|
| GET, PUT, PATCH, DELETE | 200 |
| POST (create) | 201 |
| POST (processing accepted) | 202 |
| DELETE (no content) | 204 |

Flag when mutation returns 200 instead of 201 — P2.
Flag when GET returns 200 for "not found" instead of 404 — P1.

### 7.4 Content negotiation

Check if handlers process `Accept` and `Content-Type` headers:

```
negotiationScore:
- Content-Type check present: +40
- Accept header respected: +30
- 406 Not Acceptable returned when unsupported: +20
- 415 Unsupported Media Type returned when wrong Content-Type: +10
```

Score 0–100.

## Stage 8 — Composite Health Score

The composite score blends seven weighted signals:

| Signal | Weight | Formula |
|--------|:------:|---------|
| Security posture | 25% | `max(0, authCoverage*50 + validationDepthScore*30 + rateLimitCoverage*20 - deprecatedCount*2)` |
| Error handling | 15% | `errorHandlingCoverage * 100` |
| HTTP semantics | 15% | `semanticsScore` (from Stage 3) |
| RESTfulness | 12% | Average `restScore` across all resource groups |
| Contract quality | 15% | `contractScore` (from Stage 5) |
| Handler complexity | 10% | `100 × (1 − min(1, highComplexityCount/20 + mediumComplexityCount/50))` |
| Pattern consistency | 8% | `100 × (1 − min(1, antiPatternCount/30))` |

```
apiScore = security*0.25 + errorHandling*0.15 + semantics*0.15 + restfulness*0.12 + contracts*0.15 + complexity*0.10 + patterns*0.08
```

Letter grade:
- **A**: ≥ 90
- **B**: 75–89
- **C**: 60–74
- **D**: 40–59
- **F**: < 40

## Stage 9 — Alert Generation

After all stages complete, fold findings into a flat `alerts[]` array.
Each finding may produce one or more alerts (distinct by category).
Sort by `(severity asc, file asc)` where P0 < P1 < P2.

### Alert derivation rules

| Finding | Severity | Category |
|---------|----------|----------|
| Mutation request without auth | P0 | security |
| Mutation request without body validation | P0 | validation |
| GET with side effects | P0 | semantics |
| Handler > 500 LOC | P0 | complexity |
| Non-mutation request without auth | P1 | security |
| Non-mutation request without param validation | P1 | validation |
| Missing error handling on mutation | P1 | error_handling |
| Deprecated request still referenced | P1 | deprecation |
| REST score < 30 | P1 | pattern |
| Missing version prefix | P1 | versioning |
| POST used for reads | P1 | semantics |
| Unpaginated collection endpoint | P1 | pagination |
| Error format not RFC 7807 compliant | P1 | contracts |
| Inconsistent response format | P1 | contracts |
| Missing rate limiting | P2 | security |
| REST score 30–60 | P2 | pattern |
| Handler 200–500 LOC | P2 | complexity |
| PUT for partial updates | P2 | semantics |
| Inconsistent pagination style | P2 | contracts |
| Response format outlier | P2 | contracts |
| No Content-Type validation | P2 | contracts |

When `alerts.length > 200`, truncate to top 200 and set
`REPORT_DATA._truncated = { alerts: true }`.

## Stage 10 — Page Generation

The final report page follows the YiDoc/files architecture. See
[SKILL.md](../SKILL.md#page-architecture) for the full directory
structure. The implementing agent generates each file using the
Write tool, populating `data.js` with the analysis results and
building interactive Vue components for each section.

### Key generation rules

1. All dynamic content flows through Vue interpolation — never
   build HTML strings in the analyzer
2. Section components follow the three-file pattern
   (index.html template + index.css + index.js component)
3. Tables use `rui-sortable` utility for sort and filter
4. CSS uses `--rui-*` design tokens (semantic names, no numbers)
5. Include reading progress bar, keyboard shortcuts, collapsible
   sections, and remediation queue from the YiDoc/files template
