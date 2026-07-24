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
        generatedAt: null, /* ISO 8601 UTC — filled in by the analyzer */
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
 * Runtime analysis data. The generator overwrites this object with the
 * real analysis result on each run. The shape is the contract — Vue reads
 * exactly these keys. See references/schemas.md for the full schema.
 *
 * Every endpoint is framed by the HTTP request lifecycle:
 *   ingress → processing → egress → contract
 */
window.REPORT_DATA = {
    scope: 'src/',
    score: 66,

    summary: {
        totalRequests: 42,
        totalHandlers: 35,
        totalMethods: { GET: 18, POST: 11, PUT: 6, DELETE: 4, PATCH: 3 },
        authCoverage: 0.76,
        validationDepthCoverage: 0.64,
        errorHandlingCoverage: 0.57,
        deprecatedCount: 2,
        criticalCount: 7,
        maxHandlerLines: 420,
        dominantResponseFormat: 'JSON',
        dominantAuthMechanism: 'JWT',
        semanticsScore: 68,
        contractScore: 48,
        methodMisuseCount: 3,
        paginationCoverage: 0.33,
        rfc7807ComplianceScore: 20,
    },

    /* ── Request inventory (ingress → processing → egress → contract) ─── */
    endpoints: [
        /* ── Users resource (v1, well-structured) ───────────────────────── */
        { path: '/api/v1/users',          method: 'GET',    auth: true,  authMechanism: 'JWT',   validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'users.list',        handlerFile: 'src/handlers/users.ts',      line: 24,  middleware: ['auth', 'validate', 'rateLimit'], errorHandling: true,  statusCodes: [200, 401, 404], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'offset', safe: true,  idempotent: true,  handlerLines: 45,  deprecated: false, version: 'v1', hasOpenApiSpec: false },
        { path: '/api/v1/users/:id',      method: 'GET',    auth: true,  authMechanism: 'JWT',   validationDepth: { body: false, params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'users.get',         handlerFile: 'src/handlers/users.ts',      line: 48,  middleware: ['auth', 'validate', 'rateLimit'], errorHandling: true,  statusCodes: [200, 401, 404], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 52,  deprecated: false, version: 'v1', hasOpenApiSpec: false },
        { path: '/api/v1/users',          method: 'POST',   auth: true,  authMechanism: 'JWT',   validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'users.create',      handlerFile: 'src/handlers/users.ts',      line: 72,  middleware: ['auth', 'validate', 'rateLimit'], errorHandling: true,  statusCodes: [201, 400, 401], responseFormat: 'JSON', errorFormat: 'RFC7807', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 68,  deprecated: false, version: 'v1', hasOpenApiSpec: false },
        { path: '/api/v1/users/:id',      method: 'PUT',    auth: true,  authMechanism: 'JWT',   validationDepth: { body: true,  params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'users.update',      handlerFile: 'src/handlers/users.ts',      line: 96,  middleware: ['auth', 'validate', 'rateLimit'], errorHandling: true,  statusCodes: [200, 400, 401, 404], responseFormat: 'JSON', errorFormat: 'RFC7807', paginationStyle: 'none', safe: false, idempotent: true,  handlerLines: 78,  deprecated: false, version: 'v1', hasOpenApiSpec: false },
        { path: '/api/v1/users/:id',      method: 'DELETE', auth: true,  authMechanism: 'JWT',   validationDepth: { body: false, params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'users.remove',      handlerFile: 'src/handlers/users.ts',      line: 120, middleware: ['auth', 'rateLimit'],            errorHandling: true,  statusCodes: [200, 401, 404], responseFormat: 'JSON', errorFormat: 'none',    paginationStyle: 'none',   safe: false, idempotent: true,  handlerLines: 34,  deprecated: false, version: 'v1', hasOpenApiSpec: false },

        /* ── Orders resource (v1, partial coverage) ─────────────────────── */
        { path: '/api/v1/orders',         method: 'GET',    auth: true,  authMechanism: 'JWT',   validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'orders.list',       handlerFile: 'src/handlers/orders.ts',     line: 30,  middleware: ['auth', 'validate', 'rateLimit'], errorHandling: true,  statusCodes: [200, 401],      responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'page',   safe: true,  idempotent: true,  handlerLines: 55,  deprecated: false, version: 'v1', hasOpenApiSpec: false },
        { path: '/api/v1/orders',         method: 'POST',   auth: true,  authMechanism: 'JWT',   validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'orders.create',     handlerFile: 'src/handlers/orders.ts',     line: 62,  middleware: ['auth', 'validate'],             errorHandling: false, statusCodes: [201, 400, 401], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 92,  deprecated: false, version: 'v1', hasOpenApiSpec: false },
        { path: '/api/v1/orders/:id',     method: 'GET',    auth: true,  authMechanism: 'JWT',   validationDepth: { body: false, params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'orders.get',        handlerFile: 'src/handlers/orders.ts',     line: 90,  middleware: ['auth', 'validate'],             errorHandling: true,  statusCodes: [200, 401, 404], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 48,  deprecated: false, version: 'v1', hasOpenApiSpec: false },

        /* ── Products resource ──────────────────────────────────────────── */
        { path: '/api/v1/products',       method: 'GET',    auth: true,  authMechanism: 'JWT',   validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'products.list',     handlerFile: 'src/handlers/products.ts',   line: 18,  middleware: ['auth', 'validate'],             errorHandling: true,  statusCodes: [200, 401],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'offset', safe: true,  idempotent: true,  handlerLines: 42,  deprecated: false, version: 'v1', hasOpenApiSpec: true },
        { path: '/api/v1/products/:id',   method: 'GET',    auth: true,  authMechanism: 'JWT',   validationDepth: { body: false, params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'products.get',      handlerFile: 'src/handlers/products.ts',   line: 40,  middleware: ['auth', 'validate'],             errorHandling: true,  statusCodes: [200, 401, 404], responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 38,  deprecated: false, version: 'v1', hasOpenApiSpec: true },

        /* ── Public / legacy / admin (problematic) ──────────────────────── */
        { path: '/api/public/health',     method: 'GET',    auth: false, authMechanism: 'none',  validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'health.check',      handlerFile: 'src/handlers/health.ts',     line: 8,   middleware: [],                               errorHandling: true,  statusCodes: [200],           responseFormat: 'JSON', errorFormat: 'none',    paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 14,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/api/legacy/getUsers',   method: 'GET',    auth: false, authMechanism: 'none',  validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'legacy.getUsers',   handlerFile: 'src/handlers/legacy.ts',     line: 12,  middleware: [],                               errorHandling: false, statusCodes: [200],           responseFormat: 'JSON', errorFormat: 'none',    paginationStyle: 'none',   safe: false, idempotent: true,  handlerLines: 85,  deprecated: true,  version: null, hasOpenApiSpec: false },
        { path: '/api/admin/export',      method: 'POST',   auth: true,  authMechanism: 'JWT',   validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'admin.export',      handlerFile: 'src/handlers/admin.ts',      line: 56,  middleware: ['auth'],                         errorHandling: true,  statusCodes: [200, 400, 401], responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 420, deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/api/admin/export',      method: 'GET',    auth: true,  authMechanism: 'JWT',   validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'admin.export',      handlerFile: 'src/handlers/admin.ts',      line: 120, middleware: ['auth'],                         errorHandling: true,  statusCodes: [200, 401],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 390, deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/api/files/upload',      method: 'POST',   auth: true,  authMechanism: 'JWT',   validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json', 'multipart/form-data'], rateLimited: false, handler: 'files.upload',      handlerFile: 'src/handlers/files.ts',      line: 22,  middleware: ['auth', 'validate'],             errorHandling: false, statusCodes: [201, 400, 401], responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 110, deprecated: false, version: null, hasOpenApiSpec: false },
    ],

    /* ── HTTP Semantics ───────────────────────────────────────────────── */
    semantics: {
        score: 68,
        safeCount: 8,
        unsafeCount: 7,
        idempotentCount: 12,
        nonIdempotentCount: 3,
        methodMisuse: [
            { path: '/api/legacy/getUsers', method: 'GET',  handlerFile: 'src/handlers/legacy.ts', line: 12,  issue: 'GET with verb in path — side effects disguised as read', severity: 'P0' },
            { path: '/api/admin/export',    method: 'POST', handlerFile: 'src/handlers/admin.ts',  line: 56,  issue: 'POST used for data retrieval — use GET with query params', severity: 'P1' },
            { path: '/api/v1/users/:id',    method: 'PUT',  handlerFile: 'src/handlers/users.ts',  line: 96,  issue: 'PUT for potentially partial update — consider PATCH', severity: 'P2' },
        ],
        methodCorrectness: [
            { method: 'GET',    total: 8,  correct: 7,  misuse: 1 },
            { method: 'POST',   total: 4,  correct: 3,  misuse: 1 },
            { method: 'PUT',    total: 1,  correct: 0,  misuse: 1 },
            { method: 'DELETE', total: 2,  correct: 2,  misuse: 0 },
        ],
    },

    /* ── Method distribution ───────────────────────────────────────────── */
    methods: [
        { method: 'GET',    count: 8,  pct: 53.3, safe: true,  idempotent: true },
        { method: 'POST',   count: 4,  pct: 26.7, safe: false, idempotent: false },
        { method: 'PUT',    count: 1,  pct: 6.7,  safe: false, idempotent: true },
        { method: 'DELETE', count: 2,  pct: 13.3, safe: false, idempotent: true },
    ],

    /* ── Patterns ─────────────────────────────────────────────────────── */
    patterns: [
        { pattern: '/api/v1/users',     version: 'v1', resource: 'users',    restScore: 90, issues: [], methodCount: 5 },
        { pattern: '/api/v1/orders',    version: 'v1', resource: 'orders',   restScore: 85, issues: [], methodCount: 3 },
        { pattern: '/api/v1/products',  version: 'v1', resource: 'products', restScore: 88, issues: [], methodCount: 2 },
        { pattern: '/api/public/health',version: null, resource: 'health',   restScore: 60, issues: ['No version prefix'], methodCount: 1 },
        { pattern: '/api/legacy/getUsers', version: null, resource: 'users', restScore: 15, issues: ['Verb in path', 'No version prefix', 'Non-idempotent GET'], methodCount: 1 },
        { pattern: '/api/admin/export', version: null, resource: 'export',  restScore: 30, issues: ['Verb in path', 'No version prefix'], methodCount: 2 },
        { pattern: '/api/files/upload', version: null, resource: 'files',   restScore: 35, issues: ['Verb in path', 'No version prefix'], methodCount: 1 },
    ],

    /* ── Security (request perspective) ────────────────────────────────── */
    security: {
        authCoverage: 0.76,
        authMechanisms: { JWT: 11, none: 4 },
        endpointsMissingAuth: [
            { path: '/api/public/health',   method: 'GET', handlerFile: 'src/handlers/health.ts', line: 8,  authMechanism: 'none' },
            { path: '/api/legacy/getUsers', method: 'GET', handlerFile: 'src/handlers/legacy.ts', line: 12, authMechanism: 'none' },
        ],
        rateLimitCoverage: 0.43,
        endpointsMissingRateLimit: [
            { path: '/api/v1/orders',    method: 'POST', handlerFile: 'src/handlers/orders.ts', line: 62 },
            { path: '/api/admin/export', method: 'POST', handlerFile: 'src/handlers/admin.ts',  line: 56 },
            { path: '/api/files/upload', method: 'POST', handlerFile: 'src/handlers/files.ts',  line: 22 },
        ],
        securityHeadersScore: 40,
        corsConfigured: true,
        inputValidationCoverage: 0.64,
        endpointsMissingValidation: [
            { path: '/api/v1/users/:id', method: 'DELETE', handlerFile: 'src/handlers/users.ts', line: 120 },
        ],
    },

    /* ── Health & Contracts (response perspective) ─────────────────────── */
    health: {
        errorHandlingCoverage: 0.57,
        endpointsWithoutErrorHandling: [
            { path: '/api/v1/orders',   method: 'POST', handlerFile: 'src/handlers/orders.ts', line: 62 },
            { path: '/api/legacy/getUsers', method: 'GET', handlerFile: 'src/handlers/legacy.ts', line: 12 },
            { path: '/api/files/upload',method: 'POST', handlerFile: 'src/handlers/files.ts', line: 22 },
        ],
        handlerComplexity: [
            { path: '/api/admin/export', method: 'POST', handler: 'admin.export', handlerFile: 'src/handlers/admin.ts', line: 56,  lines: 420, complexity: 'high' },
            { path: '/api/admin/export', method: 'GET',  handler: 'admin.export', handlerFile: 'src/handlers/admin.ts', line: 120, lines: 390, complexity: 'high' },
        ],
        responseConsistencyScore: 72,
        contentNegotiationScore: 30,
        errorFormatScore: 20,
        statusCodeDistribution: { '200': 12, '201': 2, '400': 2, '401': 6, '404': 3 },
        paginationCoverage: 0.33,
        contractScore: 48,
    },

    /* ── Alerts ───────────────────────────────────────────────────────── */
    alerts: [
        {   /* P0 — semantics: GET with side effects */
            severity: 'P0', marker: 'P0', category: 'semantics',
            file: 'src/handlers/legacy.ts', line: 12,
            message: 'GET /api/legacy/getUsers — unsafe: verb in path suggests mutation',
            metric: 'GET side effect',
            impact: 'Violates RFC 7231 — clients, caches & intermediaries assume GET is safe.',
            effort: 'medium', scoreUplift: 12,
            recommendations: [
                'Replace GET with POST for mutation, or refactor to pure read.',
                'Add deprecation header and redirect to /api/v1/users GET.',
            ],
        },
        {   /* P0 — security: mutation without auth */
            severity: 'P0', marker: 'P0', category: 'security',
            file: 'src/handlers/legacy.ts', line: 12,
            message: 'GET /api/legacy/getUsers — mutation request missing auth',
            metric: 'no auth',
            impact: 'Unauthenticated access to user data — data leak risk.',
            effort: 'medium', scoreUplift: 10,
            recommendations: [
                'Add auth middleware to the route.',
                'Audit all routes in this handler file.',
            ],
        },
        {   /* P0 — validation: mutation without body validation */
            severity: 'P0', marker: 'P0', category: 'validation',
            file: 'src/handlers/users.ts', line: 120,
            message: 'DELETE /api/v1/users/:id — mutation request without body validation',
            metric: 'no validation',
            impact: 'Unvalidated params in deletion logic — risk of unintended data loss.',
            effort: 'low', scoreUplift: 8,
            recommendations: ['Add param validation schema (zod/joi) for :id.', 'Audit all DELETE/PUT endpoints for validation.'],
        },
        {   /* P0 — complexity: handler too large */
            severity: 'P0', marker: 'P0', category: 'complexity',
            file: 'src/handlers/admin.ts', line: 56,
            message: 'POST /api/admin/export — handler exceeds 400 LOC (420 lines)',
            metric: '420 LOC',
            impact: 'Overly large handler → hard to test, review, and maintain.',
            effort: 'high', scoreUplift: 8,
            recommendations: ['Split by concern: validation, query building, response formatting.', 'Add LOC budget to CI lint.'],
        },
        {   /* P1 — error_handling: mutation without try/catch */
            severity: 'P1', marker: 'P1', category: 'error_handling',
            file: 'src/handlers/orders.ts', line: 62,
            message: 'POST /api/v1/orders — mutation request missing error handling',
            metric: 'no try/catch',
            impact: 'Unhandled errors may crash the process or leak stack traces.',
            effort: 'low', scoreUplift: 5,
            recommendations: ['Wrap handler in try/catch.', 'Add error middleware to route chain.'],
        },
        {   /* P1 — deprecation */
            severity: 'P1', marker: 'P1', category: 'deprecation',
            file: 'src/handlers/legacy.ts', line: 12,
            message: 'GET /api/legacy/getUsers — deprecated request still referenced',
            metric: 'deprecated',
            impact: 'Callers depend on unsupported endpoint; breaking removal without notice.',
            effort: 'medium', scoreUplift: 6,
            recommendations: ['Add Deprecation header + sunset date.', 'Notify consumers; plan migration to /api/v1/users.'],
        },
        {   /* P1 — pattern: non-RESTful */
            severity: 'P1', marker: 'P1', category: 'pattern',
            file: 'src/handlers/files.ts', line: 22,
            message: 'POST /api/files/upload — verb in path (non-RESTful)',
            metric: 'REST score 35',
            impact: 'Non-standard patterns confuse consumers and tooling.',
            effort: 'medium', scoreUplift: 5,
            recommendations: ['Refactor to POST /api/v1/files with semantic body.', 'Add version prefix.'],
        },
        {   /* P1 — contracts: no pagination on collections */
            severity: 'P1', marker: 'P1', category: 'pagination',
            file: 'src/handlers/admin.ts', line: 56,
            message: 'POST /api/admin/export — unpaginated collection request',
            metric: 'no pagination',
            impact: 'Response bloat on large datasets — risks timeout and memory pressure.',
            effort: 'medium', scoreUplift: 5,
            recommendations: ['Add cursor or offset pagination.', 'Set default limit (e.g. 100) with max.'],
        },
        {   /* P1 — contracts: error format not RFC 7807 */
            severity: 'P1', marker: 'P1', category: 'contracts',
            file: 'src/handlers/users.ts', line: 72,
            message: 'Error responses not RFC 7807 compliant — inconsistent error format across requests',
            metric: 'error format',
            impact: 'API consumers cannot reliably parse errors; custom error handling per client.',
            effort: 'medium', scoreUplift: 6,
            recommendations: ['Adopt RFC 7807 Problem Details format.', 'Include type, title, status, detail in all errors.'],
        },
        {   /* P2 — security: missing rate limiting */
            severity: 'P2', marker: 'P2', category: 'security',
            file: 'src/handlers/files.ts', line: 22,
            message: 'POST /api/files/upload — mutation request missing rate limiting',
            metric: 'no rate limit',
            impact: 'Endpoint vulnerable to abuse.',
            effort: 'low', scoreUplift: 3,
            recommendations: ['Add rateLimit middleware to the route chain.'],
        },
        {   /* P2 — versioning */
            severity: 'P2', marker: 'P2', category: 'versioning',
            file: 'src/handlers/admin.ts', line: 56,
            message: '/api/admin/export — missing version prefix',
            metric: 'no version',
            impact: 'Breaking changes affect all consumers without versioning.',
            effort: 'medium', scoreUplift: 4,
            recommendations: ['Add /v1/ prefix and redirect unversioned routes.'],
        },
        {   /* P2 — contracts: inconsistent pagination */
            severity: 'P2', marker: 'P2', category: 'contracts',
            file: 'src/handlers/orders.ts', line: 30,
            message: 'Inconsistent pagination style — offset vs page across collections',
            metric: 'pagination mix',
            impact: 'Consumers must handle multiple pagination styles.',
            effort: 'low', scoreUplift: 3,
            recommendations: ['Standardize on one pagination style (recommend cursor) across all collection endpoints.'],
        },
    ],

    records: [],
};

/* ── Enrichment fallback: category defaults for alert enrichment ──────── */
(function () {
    const byCategory = {
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
    const alerts = (window.REPORT_DATA && window.REPORT_DATA.alerts) || [];
    for (let i = 0; i < alerts.length; i++) {
        const a = alerts[i];
        const d = byCategory[(a.category || '').toLowerCase()];
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
