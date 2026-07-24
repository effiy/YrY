/**
 * yry-report-apis — Static configuration & runtime analysis
 * ----------------------------------------------------------------------
 * window.REPORT_CONFIG provides static labels and options. Runtime data
 * (the analysis result) lives in window.REPORT_DATA. Regeneration
 * rewrites only window.REPORT_DATA — the labels and options are stable.
 *
 * Design principles:
 *   - Every metric framed from the HTTP request lifecycle
 *     (ingress -> processing -> egress -> contract).
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
        /* -- Header / chrome ---------------------------------------------- */
        title: 'yry-report-apis · Yi Ecosystem',
        footerMethodology: 'Methodology: references/methodology.md · schemas: references/schemas.md',

        /* -- Section titles ----------------------------------------------- */
        sectionSummary:    'Summary',
        sectionEndpoints:  'Endpoints',
        sectionSemantics:  'HTTP Semantics',
        sectionPatterns:   'Patterns',
        sectionSecurity:   'Security',
        sectionHealth:     'Health & Contracts',
        sectionRemediation: 'Remediation',

        /* -- Summary stat cards ------------------------------------------- */
        summaryTotalEndpoints: 'Total Requests',
        summaryTotalHandlers:  'Total Handlers',
        summaryAuthCoverage:   'Auth Coverage',
        summaryValidationCoverage: 'Validation Coverage',

        /* -- Column headers ---------------------------------------------- */
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

        /* -- Empty states ------------------------------------------------ */
        emptyEndpoints:  'No API requests detected in scope.',
        emptySemantics:  'No HTTP semantics data collected.',
        emptyMethods:    'No HTTP method data collected.',
        emptyPatterns:   'No route patterns identified.',
        emptySecurity:   'No security issues detected.',
        emptyHealth:     'No health issues detected.',
        emptyRemediation: 'No remediation items — all clear.',

        /* -- Misc --------------------------------------------------------- */
        filterPlaceholder: 'filter by path, method, or handler…',
        exportJson: 'Export JSON',
        exportCsv:  'Export CSV',
        copyPath: 'Copy',

        /* -- Semantics section -------------------------------------------- */
        semanticsScore:       'Semantics Score',
        semanticsSafeCount:   'Safe Requests',
        semanticsUnsafeCount: 'Unsafe Requests',
        semanticsIdempotentCount: 'Idempotent Requests',
        semanticsMisuseCount: 'Method Misuse',
        semanticsMisuseTable:  'Method Misuse Detected',

        /* -- Security section -------------------------------------------- */
        securityAuthCoverage:      'Auth Coverage',
        securityAuthMechanisms:    'Auth Mechanisms',
        securityRateLimit:         'Rate Limit Coverage',
        securityCorsConfigured:    'CORS',
        securityHeadersScore:      'Security Headers',
        securityValidationCoverage:'Input Validation',
        securityMissingAuth:       'Requests Missing Auth',
        securityMissingRateLimit:  'Requests Missing Rate Limit',
        securityMissingValidation: 'Requests Missing Validation',

        /* -- Health & Contracts section ---------------------------------- */
        healthErrorCoverage:       'Error Handling Coverage',
        healthResponseConsistency: 'Response Consistency Score',
        healthHighComplexity:      'High Complexity Handlers',
        healthNegotiationScore:    'Content Negotiation',
        healthErrorFormatScore:    'Error Format (RFC 7807)',
    },
};

/**
 * Runtime analysis data for YiWeb (Vue 3 CDN-loaded SPA, no build step).
 *
 * YiWeb is a browser-only frontend that issues HTTP requests to an upstream
 * YiAi backend (`window.API_URL`, default http://localhost:10086). It uses a
 * generic RPC dispatcher (`POST /` with `{module_name, method_name, parameters}`
 * body) for document CRUD, plus a small set of REST-ish file management
 * endpoints (`/read-file`, `/write-file`, `/delete-file`, `/rename-file`,
 * `/rename-folder`, `/delete-folder`, `/upload/upload-image-to-oss`) and a
 * GET-style RPC dispatcher for `query_documents` / `list_ollama_models`.
 *
 * Every endpoint is framed by the HTTP request lifecycle:
 *   ingress -> processing -> egress -> contract
 */
window.REPORT_DATA = {
    scope: 'YiWeb/src/',
    score: 47,

    summary: {
        totalRequests: 14,
        totalHandlers: 14,
        totalMethods: { GET: 2, POST: 12 },
        authCoverage: 0.86,
        validationDepthCoverage: 0.0,
        errorHandlingCoverage: 0.79,
        deprecatedCount: 0,
        criticalCount: 3,
        maxHandlerLines: 360,
        dominantResponseFormat: 'JSON',
        dominantAuthMechanism: 'X-Token',
        semanticsScore: 48,
        contractScore: 26,
        methodMisuseCount: 4,
        paginationCoverage: 0.0,
        rfc7807ComplianceScore: 10,
        note: 'YiWeb is a Vue 3 CDN-loaded SPA (no build step, no package.json); all entries are outbound HTTP requests (fetch / requestClient) to the YiAi backend RPC dispatcher and file-management endpoints. No backend route definitions exist in scope. Auth is via an optional X-Token header auto-injected by requestHelper.requestInterceptor when a token is stored in localStorage.',
    },

    /* -- Request inventory (ingress -> processing -> egress -> contract) -- */
    endpoints: [
        /* -- RPC dispatcher: query_documents (GET, query-string) --------- */
        { path: '/?module_name=services.database.data_service&method_name=query_documents', method: 'GET',  auth: true, authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'requestHelper.buildServiceUrl', handlerFile: 'src/services/requestHelper.js', line: 278, middleware: ['requestInterceptor'], errorHandling: true,  statusCodes: [200, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 4,   deprecated: false, version: null, hasOpenApiSpec: false },

        /* -- RPC dispatcher: list_ollama_models (GET, query-string) ------- */
        { path: '/?module_name=services.ai.chat_service&method_name=list_ollama_models',   method: 'GET',  auth: true, authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'modelService.fetchOllamaModels', handlerFile: 'src/utils/modelService.js', line: 43,  middleware: ['getAuthHeaders'], errorHandling: true,  statusCodes: [200, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 36,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* -- RPC dispatcher: query_documents via POST body (story) ------- */
        { path: '/',  method: 'POST', auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'storyDataMethods.loadStoryData',   handlerFile: 'src/views/story/composables/storyDataMethods.js', line: 85,  middleware: ['getAuthHeaders'], errorHandling: true,  statusCodes: [200, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 40,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* -- RPC dispatcher: query_documents via POST body (sessions) ---- */
        { path: '/',  method: 'POST', auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'sessionsOps.loadStoryNames',       handlerFile: 'src/views/aicr/state/sessionsOps.js',                line: 13,  middleware: ['getAuthHeaders'], errorHandling: true,  statusCodes: [200, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 55,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* -- RPC dispatcher: query_documents via POST body (claude) ------ */
        { path: '/',  method: 'POST', auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'claudeStore.fetchProjects',         handlerFile: 'src/views/claude/composables/store.js',                line: 43,  middleware: ['requestInterceptor'], errorHandling: true,  statusCodes: [200, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 60,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* -- RPC: create_document ---------------------------------------- */
        { path: '/',  method: 'POST', auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'sessionSyncService.saveSession (create)', handlerFile: 'src/services/sessionSyncService.js', line: 566, middleware: ['requestInterceptor'], errorHandling: true,  statusCodes: [200, 400, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 58, deprecated: false, version: null, hasOpenApiSpec: false },

        /* -- RPC: update_document (saveSession / rename / enrich) ------ */
        { path: '/',  method: 'POST', auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'sessionSyncService.saveSession (update)', handlerFile: 'src/services/sessionSyncService.js', line: 737, middleware: ['requestInterceptor'], errorHandling: true,  statusCodes: [200, 400, 401, 404, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 60, deprecated: false, version: null, hasOpenApiSpec: false },

        /* -- RPC: delete_document --------------------------------------- */
        { path: '/',  method: 'POST', auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'sessionSyncService.deleteSession',  handlerFile: 'src/services/sessionSyncService.js', line: 605, middleware: ['requestInterceptor'], errorHandling: true,  statusCodes: [200, 400, 401, 404, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 95, deprecated: false, version: null, hasOpenApiSpec: false },

        /* -- RPC: update_document (story deps) --------------------------- */
        { path: '/',  method: 'POST', auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'storyEditMethods.updateStoryDeps',   handlerFile: 'src/views/story/composables/storyEditMethods.js', line: 69, middleware: ['requestInterceptor'], errorHandling: true,  statusCodes: [200, 400, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 35, deprecated: false, version: null, hasOpenApiSpec: false },

        /* -- RPC: update_document (enrich) ------------------------------- */
        { path: '/',  method: 'POST', auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'documentEnrichService.enrichDocumentPageDescription', handlerFile: 'src/services/documentEnrichService.js', line: 33, middleware: ['requestInterceptor'], errorHandling: true, statusCodes: [200, 400, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 16, deprecated: false, version: null, hasOpenApiSpec: false },

        /* -- SSE streaming chat (POST /) --------------------------------- */
        { path: '/',  method: 'POST', auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json', 'text/event-stream'], rateLimited: false, handler: 'crud.streamPrompt',           handlerFile: 'src/services/crud.js',                        line: 372, middleware: ['getAuthHeaders'], errorHandling: true,  statusCodes: [200, 401, 422, 500], responseFormat: 'stream', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 360, deprecated: false, version: null, hasOpenApiSpec: false },

        /* -- File management: /read-file (NO auth) ----------------------- */
        { path: '/read-file',  method: 'POST', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'fileContentOps.readFileContent',     handlerFile: 'src/views/aicr/state/fileContentOps.js',           line: 390, middleware: [], errorHandling: true,  statusCodes: [200, 400, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 30,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* -- File management: /write-file (NO auth) ---------------------- */
        { path: '/write-file', method: 'POST', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'fileContentOps.saveFileContent',      handlerFile: 'src/views/aicr/state/fileContentOps.js',           line: 462, middleware: [], errorHandling: true,  statusCodes: [200, 400, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 45,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* -- File management: /delete-file, /rename-file, /rename-folder,
              /delete-folder, /upload/upload-image-to-oss (all POST, auth
              via requestInterceptor) ------------------------------------- */
        { path: '/delete-file',  method: 'POST', auth: true, authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'fileDeleteService.deleteFile',  handlerFile: 'src/services/fileDeleteService.js', line: 81,  middleware: ['requestInterceptor'], errorHandling: true, statusCodes: [200, 400, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 12, deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/rename-file',  method: 'POST', auth: true, authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'fileDeleteService.renameFile',  handlerFile: 'src/services/fileDeleteService.js', line: 102, middleware: ['requestInterceptor'], errorHandling: true, statusCodes: [200, 400, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 12, deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/rename-folder', method: 'POST', auth: true, authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'fileDeleteService.renameFolder', handlerFile: 'src/services/fileDeleteService.js', line: 123, middleware: ['requestInterceptor'], errorHandling: true, statusCodes: [200, 400, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 12, deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/delete-folder', method: 'POST', auth: true, authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'fileDeleteService.deleteFolder', handlerFile: 'src/services/fileDeleteService.js', line: 157, middleware: ['requestInterceptor'], errorHandling: true, statusCodes: [200, 400, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 25, deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/upload/upload-image-to-oss', method: 'POST', auth: true, authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'sessionSyncService.uploadImage', handlerFile: 'src/services/sessionSyncService.js', line: 281, middleware: ['requestInterceptor'], errorHandling: true, statusCodes: [200, 400, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 30, deprecated: false, version: null, hasOpenApiSpec: false },
    ],

    /* -- HTTP Semantics -------------------------------------------------- */
    semantics: {
        score: 48,
        safeCount: 2,
        unsafeCount: 18,
        idempotentCount: 2,
        nonIdempotentCount: 18,
        methodMisuse: [
            { path: '/', method: 'POST', handlerFile: 'src/views/story/composables/storyDataMethods.js', line: 85, issue: 'POST used for data retrieval (query_documents) — use GET', severity: 'P1' },
            { path: '/', method: 'POST', handlerFile: 'src/views/aicr/state/sessionsOps.js',              line: 13,  issue: 'POST used for data retrieval (query_documents) — use GET', severity: 'P1' },
            { path: '/', method: 'POST', handlerFile: 'src/views/claude/composables/store.js',             line: 43,  issue: 'POST used for data retrieval (query_documents) — use GET', severity: 'P1' },
            { path: '/read-file', method: 'POST', handlerFile: 'src/views/aicr/state/fileContentOps.js',   line: 390, issue: 'POST used for data retrieval — use GET with path query', severity: 'P1' },
        ],
        methodCorrectness: [
            { method: 'GET',  total: 2,  correct: 2, misuse: 0 },
            { method: 'POST', total: 18, correct: 14, misuse: 4 },
        ],
    },

    /* -- Method distribution -------------------------------------------- */
    methods: [
        { method: 'POST', count: 18, pct: 90.0, safe: false, idempotent: false },
        { method: 'GET',  count: 2,  pct: 10.0, safe: true,  idempotent: true },
    ],

    /* -- Patterns -------------------------------------------------------- */
    patterns: [
        { pattern: '/?module_name=...&method_name=...', version: null, resource: 'rpc-dispatcher', restScore: 20, issues: ['RPC-style dispatcher', 'No version prefix', 'Method discrimination in body/query', 'Verb in path (query_documents / create_document / etc.)'], methodCount: 10 },
        { pattern: '/read-file',     version: null, resource: 'files',  restScore: 35, issues: ['Verb in path', 'No version prefix', 'POST used for read'], methodCount: 1 },
        { pattern: '/write-file',    version: null, resource: 'files',  restScore: 35, issues: ['Verb in path', 'No version prefix'], methodCount: 1 },
        { pattern: '/delete-file',    version: null, resource: 'files',  restScore: 35, issues: ['Verb in path', 'No version prefix'], methodCount: 1 },
        { pattern: '/rename-file',    version: null, resource: 'files',  restScore: 30, issues: ['Verb in path', 'No version prefix', 'Non-idempotent POST for rename'], methodCount: 1 },
        { pattern: '/rename-folder',  version: null, resource: 'files',  restScore: 30, issues: ['Verb in path', 'No version prefix'], methodCount: 1 },
        { pattern: '/delete-folder',  version: null, resource: 'files',  restScore: 30, issues: ['Verb in path', 'No version prefix'], methodCount: 1 },
        { pattern: '/upload/upload-image-to-oss', version: null, resource: 'upload', restScore: 40, issues: ['Verb in path', 'No version prefix'], methodCount: 1 },
    ],

    /* -- Security (request perspective) --------------------------------- */
    security: {
        authCoverage: 0.86,
        authMechanisms: { 'X-Token': 18, none: 2 },
        endpointsMissingAuth: [
            { path: '/read-file',  method: 'POST', handlerFile: 'src/views/aicr/state/fileContentOps.js', line: 390, authMechanism: 'none' },
            { path: '/write-file', method: 'POST', handlerFile: 'src/views/aicr/state/fileContentOps.js', line: 462, authMechanism: 'none' },
        ],
        rateLimitCoverage: 0.0,
        endpointsMissingRateLimit: [
            { path: '/', method: 'POST', handlerFile: 'src/services/crud.js', line: 372 },
            { path: '/', method: 'POST', handlerFile: 'src/services/sessionSyncService.js', line: 281 },
            { path: '/', method: 'POST', handlerFile: 'src/services/sessionSyncService.js', line: 566 },
        ],
        securityHeadersScore: 20,
        corsConfigured: true,
        inputValidationCoverage: 0.0,
        endpointsMissingValidation: [
            { path: '/', method: 'POST', handlerFile: 'src/services/sessionSyncService.js', line: 566 },
            { path: '/', method: 'POST', handlerFile: 'src/services/sessionSyncService.js', line: 605 },
            { path: '/read-file', method: 'POST', handlerFile: 'src/views/aicr/state/fileContentOps.js', line: 390 },
            { path: '/write-file', method: 'POST', handlerFile: 'src/views/aicr/state/fileContentOps.js', line: 462 },
        ],
    },

    /* -- Health & Contracts (response perspective) ---------------------- */
    health: {
        errorHandlingCoverage: 0.86,
        endpointsWithoutErrorHandling: [
            { path: '/delete-file', method: 'POST', handlerFile: 'src/services/fileDeleteService.js', line: 81 },
            { path: '/rename-file', method: 'POST', handlerFile: 'src/services/fileDeleteService.js', line: 102 },
            { path: '/rename-folder', method: 'POST', handlerFile: 'src/services/fileDeleteService.js', line: 123 },
        ],
        handlerComplexity: [
            { path: '/', method: 'POST', handler: 'crud.streamPrompt', handlerFile: 'src/services/crud.js', line: 372, lines: 360, complexity: 'medium' },
        ],
        responseConsistencyScore: 70,
        contentNegotiationScore: 25,
        errorFormatScore: 10,
        statusCodeDistribution: { '200': 20, '400': 8, '401': 8, '404': 3, '422': 1, '500': 10 },
        paginationCoverage: 0.0,
        contractScore: 26,
    },

    /* -- Alerts ---------------------------------------------------------- */
    alerts: [
        {   /* P0 — security: mutation without auth (write-file) */
            severity: 'P0', marker: 'P0', category: 'security',
            file: 'src/views/aicr/state/fileContentOps.js', line: 462,
            message: 'POST /write-file — mutation request missing auth',
            metric: 'no auth',
            impact: 'Unauthenticated file writes — arbitrary file overwrite on the backend.',
            effort: 'low', scoreUplift: 10,
            recommendations: [
                'Add getAuthHeaders() to the fetch headers for /write-file (and /read-file).',
                'Route these requests through window.requestClient so the requestInterceptor injects X-Token.',
            ],
        },
        {   /* P0 — security: mutation without auth (read-file) */
            severity: 'P0', marker: 'P0', category: 'security',
            file: 'src/views/aicr/state/fileContentOps.js', line: 390,
            message: 'POST /read-file — mutation request missing auth',
            metric: 'no auth',
            impact: 'Unauthenticated file reads — arbitrary file disclosure on the backend.',
            effort: 'low', scoreUplift: 10,
            recommendations: [
                'Add getAuthHeaders() to the fetch headers for /read-file.',
                'Route through window.requestClient for consistent auth injection.',
            ],
        },
        {   /* P0 — validation: no body validation on RPC mutations */
            severity: 'P0', marker: 'P0', category: 'validation',
            file: 'src/services/sessionSyncService.js', line: 566,
            message: 'POST / (create/update/delete_document) — mutation requests without body validation',
            metric: 'no validation',
            impact: 'Untrusted JSON body reaches backend document service — schema drift and injection risk.',
            effort: 'medium', scoreUplift: 8,
            recommendations: [
                'Add a zod/joi schema for the {module_name, method_name, parameters} payload in requestHelper.',
                'Pass validationRules from crud.postData call sites.',
            ],
        },
        {   /* P1 — semantics: POST used for reads */
            severity: 'P1', marker: 'P1', category: 'semantics',
            file: 'src/views/story/composables/storyDataMethods.js', line: 85,
            message: 'POST / — query_documents used for data retrieval (POST for read)',
            metric: 'POST read',
            impact: 'Violates RFC 7231 — POST is unsafe and non-idempotent; breaks caching and HTTP tooling.',
            effort: 'medium', scoreUplift: 6,
            recommendations: [
                'Use GET with query string (buildServiceUrl already supports this).',
                'Reserve POST for create/update/delete_document only.',
            ],
        },
        {   /* P1 — pagination: unpaginated collections */
            severity: 'P1', marker: 'P1', category: 'pagination',
            file: 'src/views/claude/composables/store.js', line: 43,
            message: 'GET query_documents — unpaginated collection (limit=100000000)',
            metric: 'no pagination',
            impact: 'Response bloat on large datasets — risks timeout, memory pressure, and slow UI.',
            effort: 'medium', scoreUplift: 5,
            recommendations: [
                'Use cursor or offset pagination with a sensible default limit (e.g. 100).',
                'Cap max limit server-side.',
            ],
        },
        {   /* P1 — contracts: error format not RFC 7807 */
            severity: 'P1', marker: 'P1', category: 'contracts',
            file: 'src/services/requestHelper.js', line: 278,
            message: 'Error responses not RFC 7807 compliant — custom {code, message, data} envelope only',
            metric: 'error format',
            impact: 'Consumers cannot reliably parse errors; ad-hoc error handling per call site.',
            effort: 'medium', scoreUplift: 6,
            recommendations: [
                'Adopt RFC 7807 Problem Details (type, title, status, detail) for error responses.',
                'Standardize a single error envelope across the backend dispatcher.',
            ],
        },
        {   /* P1 — pattern: RPC-style dispatcher, no REST */
            severity: 'P1', marker: 'P1', category: 'pattern',
            file: 'src/services/requestHelper.js', line: 278,
            message: 'RPC-style dispatcher (/ with module_name/method_name) — non-RESTful',
            metric: 'REST score 20',
            impact: 'Non-standard patterns confuse consumers and bypass HTTP tooling (caching, content negotiation).',
            effort: 'high', scoreUplift: 5,
            recommendations: [
                'Map RPC methods to REST resources (e.g. GET /api/v1/sessions, POST /api/v1/sessions).',
                'Add /v1/ version prefix.',
            ],
        },
        {   /* P1 — versioning: missing version prefix */
            severity: 'P1', marker: 'P1', category: 'versioning',
            file: 'src/services/requestHelper.js', line: 278,
            message: 'All requests — missing /v1/ version prefix',
            metric: 'no version',
            impact: 'Breaking changes to the dispatcher affect all consumers without versioning.',
            effort: 'medium', scoreUplift: 5,
            recommendations: [
                'Add /v1/ prefix and redirect unversioned routes.',
                'Document a versioning policy.',
            ],
        },
        {   /* P1 — error_handling: missing try/catch on file ops */
            severity: 'P1', marker: 'P1', category: 'error_handling',
            file: 'src/services/fileDeleteService.js', line: 81,
            message: 'POST /delete-file (and /rename-*) — partial error handling only',
            metric: 'weak try/catch',
            impact: 'Unhandled rejection on backend failure — UI shows stale state.',
            effort: 'low', scoreUplift: 4,
            recommendations: [
                'Wrap postData calls in try/catch and surface structured errors.',
                'Invalidate local cache on failure.',
            ],
        },
        {   /* P2 — security: no rate limiting anywhere */
            severity: 'P2', marker: 'P2', category: 'security',
            file: 'src/services/requestHelper.js', line: 110,
            message: 'No rate limiting on any request — dispatcher and upload endpoint unprotected',
            metric: 'no rate limit',
            impact: 'Endpoints vulnerable to abuse (especially /upload/upload-image-to-oss and SSE chat).',
            effort: 'medium', scoreUplift: 4,
            recommendations: [
                'Add rate-limit middleware on the backend for the RPC dispatcher and upload route.',
                'Throttle SSE chat per token.',
            ],
        },
        {   /* P2 — contracts: inconsistent response format (stream vs JSON) */
            severity: 'P2', marker: 'P2', category: 'contracts',
            file: 'src/services/crud.js', line: 372,
            message: 'streamPrompt returns text/event-stream while other POSTs return JSON — format outlier',
            metric: 'format mix',
            impact: 'Consumers must special-case the streaming endpoint vs JSON endpoints.',
            effort: 'low', scoreUplift: 2,
            recommendations: [
                'Document the streaming contract separately.',
                'Use a consistent JSON envelope for non-streaming error paths on the SSE endpoint.',
            ],
        },
        {   /* P2 — complexity: streamPrompt handler ~360 LOC */
            severity: 'P2', marker: 'P2', category: 'complexity',
            file: 'src/services/crud.js', line: 372,
            message: 'streamPrompt handler is 360 LOC — approaching complexity threshold',
            metric: '360 LOC',
            impact: 'Hard to test and maintain; mixes payload shaping, fetch, SSE parsing, and error mapping.',
            effort: 'high', scoreUplift: 3,
            recommendations: [
                'Split into payloadBuilder, streamReader, and errorMapper modules.',
                'Add a LOC budget to CI lint for crud.js.',
            ],
        },
    ],

    records: [],
};

/* -- Enrichment fallback: category defaults for alert enrichment -------- */
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
            blastRadius: 'request body -> downstream services',
            estimatedHours: 3,
            acceptance: ['Input schema added for the request.', 'Invalid input returns 400 with structured error.'],
            firstStep: 'Add input schema for the request using the framework validation library.',
            tooling: [{ name: 'zod', hint: 'TypeScript-first schema validation' }, { name: 'joi', hint: 'declarative request validation' }],
            preventiveControls: ['CI: require validation on all POST/PUT/PATCH requests.', 'OpenAPI schema enforcement.'],
            rollbackPlan: 'Revert validation addition; remove the schema import.',
        },
        error_handling: {
            risk: 'Unhandled errors leak stack traces or crash the process.',
            blastRadius: 'single request -> cascading failure',
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
