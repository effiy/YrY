/**
 * yry-report-apis — Static configuration & runtime analysis
 * ----------------------------------------------------------------------
 * window.REPORT_CONFIG provides static labels and options. Runtime data
 * (the analysis result) lives in window.REPORT_DATA. Regeneration
 * rewrites only window.REPORT_DATA — the labels and options are stable.
 *
 * Design principles:
 *   - Every metric framed from the HTTP request lifecycle
 *     (ingress → processing → egress → contract).
 *   - Labels are technical, precise, and self-contained.
 *   - CSS variable references (--yry-*) are preferred over hardcoded values.
 */
window.REPORT_CONFIG = {
    options: {
        topN: 20,
        theme: 'dark',
        generatedAt: '2026-07-24T00:00:00.000Z',
    },
    constants: {
        filterDebounceMs: 200,
        componentReadyTimeoutMs: 5000,
        csvHeader: 'path,method,handler,handlerFile,line,auth,authMechanism,validationDepth,contentTypes,rateLimited,errorHandling,middleware,statusCodes,responseFormat,errorFormat,paginationStyle,safe,idempotent,handlerLines,deprecated,version',
    },
    labels: {
        /* ── Header / chrome ─────────────────────────────────────── */
        title: 'yry-report-apis · Yi Ecosystem',
        footerMethodology: 'Methodology: references/methodology.md · schemas: references/schemas.md',

        /* ── Section titles ──────────────────────────────────────── */
        sectionSummary:    'Summary',
        sectionEndpoints:  'Endpoints',
        sectionSemantics:  'HTTP Semantics',
        sectionPatterns:   'Patterns',
        sectionSecurity:   'Security',
        sectionHealth:     'Health & Contracts',
        sectionRemediation: 'Remediation',

        /* ── Summary stat cards ──────────────────────────────────── */
        summaryTotalEndpoints: 'Total Requests',
        summaryTotalHandlers:  'Total Handlers',
        summaryAuthCoverage:   'Auth Coverage',
        summaryValidationCoverage: 'Validation Coverage',

        /* ── Column headers ──────────────────────────────────────── */
        colPath:          'Path',
        colMethod:        'Method',
        colSafe:          'Safe',
        colIdempotent:    'Idempotent',
        colHandler:       'Handler',
        colHandlerFile:   'Handler File',
        colLine:          'Line',
        colAuthMechanism: 'Auth Mechanism',
        colValidationDepth: 'Validation',
        colContentTypes:  'Content Types',
        colResponseFormat:'Response Format',
        colErrorFormat:   'Error Format',
        colPagination:    'Pagination',
        colMiddleware:    'Middleware',
        colAuth:          'Auth',
        colRateLimited:   'Rate Limited',
        colErrorHandling: 'Error Handling',
        colStatusCodes:   'Status Codes',
        colLines:         'Handler LOC',
        colComplexity:    'Complexity',
        colRestScore:     'REST Score',
        colVersion:       'Version',
        colResource:      'Resource',
        colMethodCount:   'Methods',
        colIssues:        'Issues',
        colCount:         'Count',
        colPct:           '%',
        colCategory:      'Category',
        colEffort:        'Effort',
        colUplift:        'Uplift',
        colMessage:       'Finding',

        /* ── Empty states ────────────────────────────────────────── */
        emptyEndpoints:  'No API requests detected in scope.',
        emptySemantics:  'No HTTP semantics data collected.',
        emptyMethods:    'No HTTP method data collected.',
        emptyPatterns:   'No route patterns identified.',
        emptySecurity:   'No security issues detected.',
        emptyHealth:     'No health issues detected.',
        emptyRemediation: 'No remediation items — all clear.',

        /* ── Misc ────────────────────────────────────────────────── */
        filterPlaceholder: 'filter by path, method, or handler…',
        exportJson: 'Export JSON',
        exportCsv:  'Export CSV',
        copyPath: 'Copy',

        /* ── Semantics section ───────────────────────────────────── */
        semanticsScore:       'Semantics Score',
        semanticsSafeCount:   'Safe Requests',
        semanticsUnsafeCount: 'Unsafe Requests',
        semanticsIdempotentCount: 'Idempotent Requests',
        semanticsMisuseCount: 'Method Misuse',
        semanticsMisuseTable:  'Method Misuse Detected',

        /* ── Security section ────────────────────────────────────── */
        securityAuthCoverage:      'Auth Coverage',
        securityAuthMechanisms:    'Auth Mechanisms',
        securityRateLimit:         'Rate Limit Coverage',
        securityCorsConfigured:    'CORS',
        securityHeadersScore:      'Security Headers',
        securityValidationCoverage:'Input Validation',
        securityMissingAuth:       'Requests Missing Auth',
        securityMissingRateLimit:  'Requests Missing Rate Limit',
        securityMissingValidation: 'Requests Missing Validation',

        /* ── Health & Contracts section ──────────────────────────── */
        healthErrorCoverage:       'Error Handling Coverage',
        healthResponseConsistency: 'Response Consistency Score',
        healthHighComplexity:      'High Complexity Handlers',
        healthNegotiationScore:    'Content Negotiation',
        healthErrorFormatScore:    'Error Format (RFC 7807)',
    },
};

/**
 * Runtime analysis data for YiH5 — a Vue 3 H5 mobile frontend (CDN ESM,
 * no bundler) that consumes backend APIs via `fetch`. All request sites
 * live under src/services/. There are no backend routes defined in this
 * project; this inventory captures the outbound HTTP requests the H5
 * client makes to its backend (apiBase default http://localhost:10086).
 */
window.REPORT_DATA = {
    scope: 'YiH5/',
    score: 60,

    summary: {
        totalRequests: 9,
        totalHandlers: 7,
        totalMethods: { GET: 4, POST: 5 },
        authCoverage: 1.0,
        validationDepthCoverage: 0.0,
        errorHandlingCoverage: 0.67,
        deprecatedCount: 0,
        criticalCount: 0,
        maxHandlerLines: 28,
        dominantResponseFormat: 'JSON',
        dominantAuthMechanism: 'API Key (X-Token)',
        semanticsScore: 80,
        contractScore: 25,
        methodMisuseCount: 0,
        paginationCoverage: 0.0,
        rfc7807ComplianceScore: 0,
        note: 'YiH5 is a Vue 3 H5 mobile frontend with no backend routes. Endpoints here are outbound HTTP request sites in src/services/ that call the backend apiBase. Auth is uniform (X-Token header). No client-side input validation schemas, no rate limiting, no version prefix, and no pagination on collection reads.',
    },

    /* ── Request inventory (ingress → processing → egress → contract) ─── */
    endpoints: [
        /* ── RPC dispatcher (root POST) — services.database.data_service ── */
        { path: '/',                method: 'POST', auth: true, authMechanism: 'API Key (X-Token)', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'session.saveSession.update',    handlerFile: 'src/services/session.js', line: 41, middleware: ['auth'],         errorHandling: true,  statusCodes: [200, 401, 404], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 11, deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/',                method: 'POST', auth: true, authMechanism: 'API Key (X-Token)', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'session.saveSession.upsert',   handlerFile: 'src/services/session.js', line: 46, middleware: ['auth'],         errorHandling: true,  statusCodes: [200, 401],      responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 8,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/',                method: 'POST', auth: true, authMechanism: 'API Key (X-Token)', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'session.deleteSession.delete', handlerFile: 'src/services/session.js', line: 55, middleware: ['auth'],         errorHandling: false, statusCodes: [200, 401],      responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 6,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* ── RPC-style collection reads (GET with method_name in query) ─── */
        { path: '/?module_name=services.database.data_service&method_name=query_documents&parameters={cname:"faqs"}',     method: 'GET',  auth: true, authMechanism: 'API Key (X-Token)', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'faq.fetchFaqs',         handlerFile: 'src/services/faq.js',    line: 13, middleware: ['auth'],         errorHandling: true,  statusCodes: [200, 401],      responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 9,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/?module_name=services.database.data_service&method_name=query_documents&parameters={cname:"sessions"}', method: 'GET',  auth: true, authMechanism: 'API Key (X-Token)', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'session.fetchSessions', handlerFile: 'src/services/session.js', line: 11, middleware: ['auth'], errorHandling: true,  statusCodes: [200, 401],      responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 11, deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/?module_name=services.database.data_service&method_name=query_documents&parameters={cname:"sessions",filter:{key}}', method: 'GET', auth: true, authMechanism: 'API Key (X-Token)', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'session.fetchSessionDetail', handlerFile: 'src/services/session.js', line: 24, middleware: ['auth'], errorHandling: true, statusCodes: [200, 401], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: true, idempotent: true, handlerLines: 13, deprecated: false, version: null, hasOpenApiSpec: false },

        /* ── News resource (mongodb endpoint, plain GET) ──────────────── */
        { path: '/mongodb/?isoDate=:date', method: 'GET',  auth: true, authMechanism: 'API Key (X-Token)', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'news.fetchNews',          handlerFile: 'src/services/news.js',  line: 6,  middleware: ['auth'],         errorHandling: true,  statusCodes: [200, 401],      responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 5,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* ── Prompt / chat resource (POST /prompt/) ──────────────────── */
        { path: '/prompt/',         method: 'POST', auth: true, authMechanism: 'API Key (X-Token)', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'prompt.callPrompt',      handlerFile: 'src/services/prompt.js', line: 17, middleware: ['auth'],         errorHandling: false, statusCodes: [200, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 17, deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/prompt/',         method: 'POST', auth: true, authMechanism: 'API Key (X-Token)', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'prompt.streamPrompt',    handlerFile: 'src/services/prompt.js', line: 36, middleware: ['auth'],         errorHandling: true,  statusCodes: [200, 401, 500], responseFormat: 'stream', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 33, deprecated: false, version: null, hasOpenApiSpec: false },
    ],

    /* ── HTTP Semantics ───────────────────────────────────────────────── */
    semantics: {
        score: 80,
        safeCount: 4,
        unsafeCount: 5,
        idempotentCount: 4,
        nonIdempotentCount: 5,
        methodMisuse: [],
        methodCorrectness: [
            { method: 'GET',  total: 4, correct: 4, misuse: 0 },
            { method: 'POST', total: 5, correct: 5, misuse: 0 },
        ],
    },

    /* ── Method distribution ───────────────────────────────────────────── */
    methods: [
        { method: 'POST', count: 5, pct: 55.6, safe: false, idempotent: false },
        { method: 'GET',  count: 4, pct: 44.4, safe: true,  idempotent: true },
    ],

    /* ── Patterns ─────────────────────────────────────────────────────── */
    patterns: [
        { pattern: '/',                  version: null, resource: 'rpc-dispatcher', restScore: 20, issues: ['No version prefix', 'RPC-style (method_name in body)', 'Action in request body'], methodCount: 3 },
        { pattern: '/?module_name=...&method_name=query_documents', version: null, resource: 'rpc-query', restScore: 25, issues: ['No version prefix', 'RPC-style (method_name in query)', 'Action in query string', 'Unpaginated collection'], methodCount: 3 },
        { pattern: '/mongodb/',          version: null, resource: 'mongodb',  restScore: 55, issues: ['No version prefix', 'Unpaginated collection'], methodCount: 1 },
        { pattern: '/prompt/',           version: null, resource: 'prompt',   restScore: 60, issues: ['No version prefix', 'Trailing slash inconsistency'], methodCount: 2 },
    ],

    /* ── Security (request perspective) ────────────────────────────────── */
    security: {
        authCoverage: 1.0,
        authMechanisms: { 'API Key (X-Token)': 9 },
        endpointsMissingAuth: [],
        rateLimitCoverage: 0.0,
        endpointsMissingRateLimit: [
            { path: '/',                method: 'POST', handlerFile: 'src/services/session.js', line: 41 },
            { path: '/',                method: 'POST', handlerFile: 'src/services/session.js', line: 46 },
            { path: '/',                method: 'POST', handlerFile: 'src/services/session.js', line: 55 },
            { path: '/?method_name=...&method_name=query_documents', method: 'GET', handlerFile: 'src/services/faq.js', line: 13 },
            { path: '/?module_name=...&method_name=query_documents', method: 'GET', handlerFile: 'src/services/session.js', line: 11 },
            { path: '/?module_name=...&method_name=query_documents', method: 'GET', handlerFile: 'src/services/session.js', line: 24 },
            { path: '/mongodb/?isoDate=:date', method: 'GET', handlerFile: 'src/services/news.js', line: 6 },
            { path: '/prompt/',         method: 'POST', handlerFile: 'src/services/prompt.js', line: 17 },
            { path: '/prompt/',         method: 'POST', handlerFile: 'src/services/prompt.js', line: 36 },
        ],
        securityHeadersScore: 0,
        corsConfigured: false,
        inputValidationCoverage: 0.0,
        endpointsMissingValidation: [
            { path: '/',        method: 'POST', handlerFile: 'src/services/session.js', line: 41 },
            { path: '/',        method: 'POST', handlerFile: 'src/services/session.js', line: 46 },
            { path: '/',        method: 'POST', handlerFile: 'src/services/session.js', line: 55 },
            { path: '/prompt/', method: 'POST', handlerFile: 'src/services/prompt.js', line: 17 },
            { path: '/prompt/', method: 'POST', handlerFile: 'src/services/prompt.js', line: 36 },
        ],
    },

    /* ── Health & Contracts (response perspective) ─────────────────────── */
    health: {
        errorHandlingCoverage: 0.67,
        endpointsWithoutErrorHandling: [
            { path: '/',        method: 'POST', handlerFile: 'src/services/session.js', line: 55 },
            { path: '/prompt/', method: 'POST', handlerFile: 'src/services/prompt.js', line: 17 },
        ],
        handlerComplexity: [],
        responseConsistencyScore: 89,
        contentNegotiationScore: 20,
        errorFormatScore: 0,
        statusCodeDistribution: { '200': 9, '401': 7, '404': 1, '500': 2 },
        paginationCoverage: 0.0,
        contractScore: 25,
    },

    /* ── Alerts ───────────────────────────────────────────────────────── */
    alerts: [
        {   /* P1 — validation: mutation without body validation */
            severity: 'P1', marker: 'P1', category: 'validation',
            file: 'src/services/client.js', line: 34,
            message: 'POST / (executeModule RPC) — mutation request body is JSON.stringify-ed without a schema; module_name/method_name/parameters unvalidated',
            metric: 'no body validation',
            impact: 'Untrusted client input reaches backend service dispatcher — risk of method injection, type confusion, or unintended method invocation.',
            effort: 'medium', scoreUplift: 10,
            recommendations: [
                'Validate the request body shape on the client with a zod/joi schema before sending.',
                'Whitelist allowed (module_name, method_name) pairs in the service layer.',
                'Push validation into the backend dispatcher as defense-in-depth.',
            ],
        },
        {   /* P1 — validation: prompt POST without body validation */
            severity: 'P1', marker: 'P1', category: 'validation',
            file: 'src/services/prompt.js', line: 17,
            message: 'POST /prompt/ — fromSystem/fromUser/model body fields unvalidated before send',
            metric: 'no body validation',
            impact: 'Empty or oversized prompts, invalid model strings, or injection payloads reach the LLM backend unchecked.',
            effort: 'low', scoreUplift: 8,
            recommendations: [
                'Add a client schema: non-empty fromUser, bounded length, enum for model.',
                'Trim/null-check before building body.',
            ],
        },
        {   /* P1 — contracts: error format not RFC 7807 */
            severity: 'P1', marker: 'P1', category: 'contracts',
            file: 'src/services/client.js', line: 18,
            message: 'Errors thrown as plain Error("HTTP error! status: …") — no RFC 7807 Problem Details structure',
            metric: 'error format',
            impact: 'Callers cannot reliably parse backend error codes; UI shows generic 请求失败 message and loses the server-provided detail.',
            effort: 'medium', scoreUplift: 8,
            recommendations: [
                'Parse server error JSON into a structured Problem object (type, title, status, detail).',
                'Surface server message in showToast instead of generic fallback.',
                'Centralize in handleApiError and return typed errors.',
            ],
        },
        {   /* P1 — pagination: unpaginated collection reads */
            severity: 'P1', marker: 'P1', category: 'pagination',
            file: 'src/services/faq.js', line: 13,
            message: 'GET /?method_name=query_documents (faqs) — fetches entire collection with no limit/offset',
            metric: 'no pagination',
            impact: 'Response bloat and memory pressure as the faqs collection grows; slow first paint on H5.',
            effort: 'medium', scoreUplift: 6,
            recommendations: [
                'Add limit/offset or cursor params to the query_documents parameters payload.',
                'Enforce a max page size in config.news.pageSize style.',
            ],
        },
        {   /* P1 — pagination: sessions list unpaginated */
            severity: 'P1', marker: 'P1', category: 'pagination',
            file: 'src/services/session.js', line: 11,
            message: 'GET /?method_name=query_documents (sessions) — full collection scan, no pagination',
            metric: 'no pagination',
            impact: 'Session list grows unbounded; pull-refresh loads all docs each time.',
            effort: 'medium', scoreUplift: 6,
            recommendations: [
                'Pass filter/sort + limit params in the query_documents parameters.',
                'Consider server-side cursor pagination keyed by session.updatedAt.',
            ],
        },
        {   /* P1 — pagination: news endpoint relies on pageSize only */
            severity: 'P1', marker: 'P1', category: 'pagination',
            file: 'src/services/news.js', line: 6,
            message: 'GET /mongodb/?isoDate= — single-shot fetch, no page/limit param; config.news.pageSize is not enforced client-side',
            metric: 'no pagination',
            impact: 'Large daily news dumps (up to 500 items per config) load in one request; UI memory pressure on low-end H5 devices.',
            effort: 'low', scoreUplift: 5,
            recommendations: [
                'Append a limit/page param to the request URL.',
                'Virtualize the list (already using vlistMinItems) but bound the network payload.',
            ],
        },
        {   /* P1 — versioning: no version prefix on any request */
            severity: 'P1', marker: 'P1', category: 'versioning',
            file: 'config.js', line: 17,
            message: 'config.endpoints defines /mongodb/, /prompt/, /session/ — none versioned; no /v1/ prefix anywhere',
            metric: 'no version',
            impact: 'Breaking backend changes affect all H5 clients with no coexistence window; rollback requires a full redeploy.',
            effort: 'medium', scoreUplift: 7,
            recommendations: [
                'Introduce /v1/ prefix in config.endpoints and have the backend serve both versions during migration.',
                'Pin the apiBase per environment and version.',
            ],
        },
        {   /* P1 — pattern: RPC-style method_name in body/query */
            severity: 'P1', marker: 'P1', category: 'pattern',
            file: 'src/services/client.js', line: 31,
            message: 'POST / with {module_name, method_name, parameters} — RPC envelope, not RESTful',
            metric: 'REST score 20',
            impact: 'Non-RESTful contract confuses tooling (OpenAPI generators, caches); method dispatch is invisible to intermediaries.',
            effort: 'high', scoreUplift: 6,
            recommendations: [
                'Map RPC calls to REST resources: POST /v1/sessions, GET /v1/sessions/:key, DELETE /v1/sessions/:key.',
                'Move query_documents reads to GET /v1/faqs, GET /v1/sessions with filter params.',
            ],
        },
        {   /* P1 — error_handling: callPrompt has no try/catch, no !resp.ok guard */
            severity: 'P1', marker: 'P1', category: 'error_handling',
            file: 'src/services/prompt.js', line: 17,
            message: 'callPrompt — no resp.ok check, no try/catch; raw resp.json() on a 500 will throw or return undefined shape',
            metric: 'no try/catch',
            impact: 'Unhandled rejections bubble to the caller; ChatView path that uses callPrompt (not streamPrompt) has no error contract.',
            effort: 'low', scoreUplift: 5,
            recommendations: [
                'Mirror streamPrompt: throw new Error(`HTTP ${resp.status}`) when !resp.ok.',
                'Wrap in try/catch in the caller and surface showToast on failure.',
            ],
        },
        {   /* P1 — error_handling: deleteSession has no try/catch */
            severity: 'P1', marker: 'P1', category: 'error_handling',
            file: 'src/services/session.js', line: 55,
            message: 'deleteSession — await executeModule with no try/catch; network/404 surfaces as unhandled rejection',
            metric: 'no try/catch',
            impact: 'Delete failures in SessionList.onDelete are caught by the view try/catch but lose backend message detail.',
            effort: 'low', scoreUplift: 4,
            recommendations: [
                'Wrap in try/catch and rethrow a typed error with server message.',
                'Treat 404 as success (already deleted) like saveSession does.',
            ],
        },
        {   /* P2 — security: no rate limiting on any request */
            severity: 'P2', marker: 'P2', category: 'security',
            file: 'src/services/client.js', line: 15,
            message: 'fetchWithAuth has no client-side throttle; rapid taps on 发送 / 下拉刷新 fan out duplicate requests',
            metric: 'no rate limit',
            impact: 'Abuse vector and backend pressure; duplicate chat streams cost LLM tokens.',
            effort: 'low', scoreUplift: 4,
            recommendations: [
                'Add a debounce/dedupe layer in fetchWithAuth (in-flight key by URL+body).',
                'Throttle prompt POSTs (e.g. min 800ms between sends) in ChatView.',
            ],
        },
        {   /* P2 — pattern: GET with action in query string (RPC over GET) */
            severity: 'P2', marker: 'P2', category: 'pattern',
            file: 'src/services/faq.js', line: 13,
            message: 'GET /?method_name=query_documents&parameters=… — action encoded in query string',
            metric: 'REST score 25',
            impact: 'Caches and proxies cannot key by resource; the same URL serves different resources depending on parameters JSON.',
            effort: 'medium', scoreUplift: 4,
            recommendations: [
                'Refactor to GET /v1/faqs and GET /v1/sessions/:key.',
                'Push filter/sort into RESTful query params.',
            ],
        },
        {   /* P2 — versioning: prompt path missing version + trailing slash */
            severity: 'P2', marker: 'P2', category: 'versioning',
            file: 'config.js', line: 18,
            message: 'config.endpoints.prompt = "/prompt/" — trailing slash, no version',
            metric: 'no version',
            impact: 'Inconsistent path style (some routes use root "/") complicates routing and caching.',
            effort: 'low', scoreUplift: 3,
            recommendations: [
                'Set prompt to "/v1/prompt" (no trailing slash) for consistency.',
                'Audit all endpoint strings in config.js for trailing-slash consistency.',
            ],
        },
        {   /* P2 — contracts: inconsistent response format (stream vs JSON) */
            severity: 'P2', marker: 'P2', category: 'contracts',
            file: 'src/services/prompt.js', line: 36,
            message: 'streamPrompt returns a ReadableStream reader; callPrompt returns resp.json() — same path, two contracts',
            metric: 'format outlier',
            impact: 'Consumers must special-case the same /prompt/ route by an out-of-band flag (stream:true in body).',
            effort: 'medium', scoreUplift: 3,
            recommendations: [
                'Split into two routes (e.g. POST /v1/prompt vs POST /v1/prompt/stream) or use Accept: text/event-stream.',
                'Document both contracts in one place.',
            ],
        },
        {   /* P2 — security: CORS not configured / unverified client-side */
            severity: 'P2', marker: 'P2', category: 'security',
            file: 'src/services/client.js', line: 17,
            message: 'Cross-origin fetch to config.apiBase with no CORS preflight handling or whitelist documentation',
            metric: 'no CORS config',
            impact: 'Browser may block responses silently; auth X-Token header triggers a preflight that the backend must explicitly allow.',
            effort: 'low', scoreUplift: 3,
            recommendations: [
                'Document the backend CORS allowlist (Origin, X-Token, Content-Type).',
                'Verify preflight OPTIONS handling in the backend service.',
            ],
        },
    ],

    records: [],
};

/* ── Enrichment fallback: category defaults for alert enrichment ──────── */
(function () {
    var byCategory = {
        security: {
            risk: 'Unauthenticated requests expose sensitive data and enable unauthorized mutations.',
            blastRadius: 'request path + user data',
            estimatedHours: 4,
            acceptance: ['All routes in handler have auth middleware.', 'Integration test verifies 401 for unauthenticated requests.'],
            firstStep: 'List all routes in the handler and verify each has auth middleware.',
            tooling: [{ name: 'eslint-plugin-security', hint: 'detect missing auth patterns' }],
            preventiveControls: ['CI: lint rule blocks routes without auth.', 'Code review checklist: verify auth on new routes.'],
            rollbackPlan: 'Revert middleware addition; no API contract change.',
        },
        validation: {
            risk: 'Untrusted input reaches business logic — injection, corruption, crashes.',
            blastRadius: 'request body → downstream services',
            estimatedHours: 3,
            acceptance: ['Input schema added for the request.', 'Invalid input returns 400 with structured error.'],
            firstStep: 'Add input schema for the request using the framework validation library.',
            tooling: [{ name: 'zod', hint: 'TypeScript-first schema validation' }, { name: 'joi', hint: 'declarative request validation' }],
            preventiveControls: ['CI: require validation on all POST/PUT/PATCH requests.', 'OpenAPI schema enforcement.'],
            rollbackPlan: 'Revert validation addition; remove the schema import.',
        },
        error_handling: {
            risk: 'Unhandled errors leak stack traces or crash the process.',
            blastRadius: 'single request → cascading failure',
            estimatedHours: 2,
            acceptance: ['Handler wrapped in try/catch or error middleware added.', 'Error responses are structured JSON.'],
            firstStep: 'Wrap handler body in try/catch or add error middleware.',
            tooling: [{ name: 'express-async-errors', hint: 'auto-catch async errors in Express' }],
            preventiveControls: ['CI: lint rule requires try/catch in route handlers.', 'Shared error middleware as base template.'],
            rollbackPlan: 'Remove error wrapper; original behavior restored.',
        },
        deprecation: {
            risk: 'Callers depend on removed or unsupported APIs.',
            blastRadius: 'all consumers of the request',
            estimatedHours: 8,
            acceptance: ['Deprecation header + sunset date added.', 'Consumers notified via changelog.', 'Migration path documented.'],
            firstStep: 'Add Deprecation header with sunset date; announce in changelog.',
            tooling: [{ name: 'OpenAPI', hint: 'mark requests as deprecated in spec' }],
            preventiveControls: ['API versioning strategy documented.', 'Deprecation policy: 6-month notice before removal.'],
            rollbackPlan: 'Remove deprecation header; no breaking change.',
        },
        pattern: {
            risk: 'Non-RESTful patterns confuse consumers and tooling.',
            blastRadius: 'all API consumers',
            estimatedHours: 6,
            acceptance: ['Refactored to REST conventions.', 'Existing consumers migrated or backward-compatible.'],
            firstStep: 'Map current routes to REST equivalents and plan migration.',
            tooling: [{ name: 'OpenAPI/Swagger', hint: 'document RESTful API design' }],
            preventiveControls: ['API design review gate for new requests.', 'REST conventions documented in style guide.'],
            rollbackPlan: 'Keep old route with 301 redirect to new RESTful path.',
        },
        complexity: {
            risk: 'Overly large handlers are hard to test, review, and maintain.',
            blastRadius: 'handler + reviewers',
            estimatedHours: 12,
            acceptance: ['Handler split into <200 LOC modules.', 'Test coverage maintained.', 'Public API unchanged.'],
            firstStep: "List the handler's top-level responsibilities — each becomes a module.",
            tooling: [{ name: 'eslint-plugin-import', hint: 'enforce file-level LOC budgets' }],
            preventiveControls: ['CI: fail PRs adding >100 LOC to handlers over 500 LOC.', 'CODEOWNERS for large handlers.'],
            rollbackPlan: 'Revert split; barrel re-exports original handler.',
        },
        versioning: {
            risk: 'Breaking changes affect all consumers without versioning.',
            blastRadius: 'all API consumers',
            estimatedHours: 10,
            acceptance: ['Version prefix added.', 'Legacy routes redirected.', 'Documentation updated.'],
            firstStep: 'Add /v1/ prefix; deprecate unversioned routes with 301 redirect.',
            tooling: [{ name: 'express-version-route', hint: 'versioned routing for Express' }],
            preventiveControls: ['API design review requires version prefix.', 'CI: flag routes without version prefix.'],
            rollbackPlan: 'Remove version prefix; restore original route paths.',
        },
        semantics: {
            risk: 'Incorrect HTTP method usage violates RFC 7231 — clients, caches, and intermediaries make wrong assumptions.',
            blastRadius: 'all clients + intermediary proxies',
            estimatedHours: 4,
            acceptance: ['Method corrected per HTTP spec.', 'Existing consumers migrated or backward-compatible.', 'Tests updated.'],
            firstStep: 'Identify the correct HTTP method per RFC 7231; plan safe migration.',
            tooling: [{ name: 'RFC 7231', hint: 'HTTP/1.1 Semantics and Content specification' }],
            preventiveControls: ['API design review: verify method semantics.', 'OpenAPI spec enforcement.'],
            rollbackPlan: 'Keep old route with redirect; remove after consumer migration.',
        },
        contracts: {
            risk: 'Missing or inconsistent request/response schemas cause integration failures and documentation drift.',
            blastRadius: 'all API consumers + documentation',
            estimatedHours: 6,
            acceptance: ['Request/response schemas documented.', 'Error format standardized.', 'Pagination consistent.'],
            firstStep: 'Audit all endpoints for response format and error format consistency.',
            tooling: [{ name: 'OpenAPI', hint: 'generate and enforce API contracts' }, { name: 'zod-to-openapi', hint: 'bridge validation and docs' }],
            preventiveControls: ['CI: validate response schemas in tests.', 'Contract-first API design workflow.'],
            rollbackPlan: 'Revert schema changes; restore original response shapes.',
        },
        pagination: {
            risk: 'Unpaginated collections risk response bloat, timeout, and memory exhaustion.',
            blastRadius: 'all collection consumers',
            estimatedHours: 3,
            acceptance: ['Pagination added with reasonable defaults.', 'Max limit enforced.', 'Consistent style across collections.'],
            firstStep: 'Add pagination params (offset/limit or cursor) to the collection handler.',
            tooling: [{ name: 'express-paginate', hint: 'pagination middleware for Express' }],
            preventiveControls: ['CI: flag collection endpoints without pagination.', 'Default limit enforced in shared middleware.'],
            rollbackPlan: 'Remove pagination params; revert to unbounded query.',
        },
    };
    var alerts = (window.REPORT_DATA && window.REPORT_DATA.alerts) || [];
    for (var i = 0; i < alerts.length; i++) {
        var a = alerts[i];
        var d = byCategory[(a.category || '').toLowerCase()];
        if (!d) continue;
        if (!a.risk) a.risk = d.risk;
        if (!a.blastRadius) a.blastRadius = d.blastRadius;
        if (!a.estimatedHours) a.estimatedHours = d.estimatedHours;
        if (!Array.isArray(a.acceptance) || a.acceptance.length === 0) a.acceptance = d.acceptance;
        if (!a.firstStep) a.firstStep = d.firstStep;
        if (!Array.isArray(a.tooling) || a.tooling.length === 0) a.tooling = d.tooling;
        if (!Array.isArray(a.preventiveControls) || a.preventiveControls.length === 0) a.preventiveControls = d.preventiveControls;
        if (!a.rollbackPlan) a.rollbackPlan = d.rollbackPlan;
    }
})();
