/**
 * yry-report-apis — YiAi · FastAPI + MongoDB Backend
 * ----------------------------------------------------------------------
 * Regenerated 2026-07-24 by the yry-reports/apis dispatcher.
 * Source scope: /Users/ruiyi/Downloads/YrY/YiAi/src/server/routes/
 *
 * 7 routers, 26 routes (including alt-path registrations).
 * Auth: global X-Token header middleware (API-Key style), with a
 * whitelist of local file-operation routes that bypass auth.
 */
window.REPORT_CONFIG = {
    options: {
        topN: 30,
        theme: 'dark',
        generatedAt: '2026-07-24T00:00:00Z',
    },
    constants: {
        filterDebounceMs: 200,
        componentReadyTimeoutMs: 5000,
        csvHeader: 'path,method,handler,handlerFile,line,auth,authMechanism,validationDepth,contentTypes,rateLimited,errorHandling,middleware,statusCodes,responseFormat,errorFormat,paginationStyle,safe,idempotent,handlerLines,deprecated,version',
    },
    labels: {
        /* ── Header / chrome ─────────────────────────────────────── */
        title: 'yry-report-apis · YiAi',
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
 * Runtime analysis data — YiAi FastAPI backend.
 * Source: src/server/routes/{execution,files,wework,maintenance,state,health,story_panel}.py
 * Auth model: global X-Token header middleware (src/server/middleware.py);
 *   whitelist [/write-file, /read-file, /delete-file, /upload, /static/*] bypasses auth.
 */
window.REPORT_DATA = {
    scope: 'src/server/routes/',
    score: 58,

    summary: {
        totalRequests: 26,
        totalHandlers: 26,
        totalMethods: { GET: 9, POST: 15, PUT: 1, DELETE: 1 },
        authCoverage: 0.85,
        validationDepthCoverage: 0.62,
        errorHandlingCoverage: 0.77,
        deprecatedCount: 0,
        criticalCount: 4,
        maxHandlerLines: 465,
        dominantResponseFormat: 'JSON',
        dominantAuthMechanism: 'API Key',
        semanticsScore: 55,
        contractScore: 45,
        methodMisuseCount: 6,
        paginationCoverage: 0.04,
        rfc7807ComplianceScore: 0,
    },

    /* ── Request inventory (ingress → processing → egress → contract) ─── */
    endpoints: [
        /* ── execution.py — generic module dispatcher ───────────────── */
        { path: '/',                    method: 'GET',    auth: true,  authMechanism: 'API Key', validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'execute_module_via_get',   handlerFile: 'src/server/routes/execution.py', line: 42,  middleware: ['header_verification'], errorHandling: true,  statusCodes: [200, 400, 401, 500], responseFormat: 'JSON',   errorFormat: 'custom', paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 22,  deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/',                    method: 'POST',   auth: true,  authMechanism: 'API Key', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'execute_module_via_post',  handlerFile: 'src/server/routes/execution.py', line: 66,  middleware: ['header_verification'], errorHandling: true,  statusCodes: [200, 400, 401, 500], responseFormat: 'JSON',   errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 21,  deprecated: false, version: null, hasOpenApiSpec: true },

        /* ── files.py — RPC-style file operations (whitelisted from auth) ── */
        { path: '/upload-image-to-oss',        method: 'POST', auth: true,  authMechanism: 'API Key', validationDepth: { body: true, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'upload_image_to_oss',  handlerFile: 'src/server/routes/files.py', line: 129, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 400, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 30,  deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/upload/upload-image-to-oss', method: 'POST', auth: true,  authMechanism: 'API Key', validationDepth: { body: true, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'upload_image_to_oss_alt', handlerFile: 'src/server/routes/files.py', line: 130, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 400, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 30,  deprecated: true,  version: null, hasOpenApiSpec: true },
        { path: '/read-file',                  method: 'POST', auth: false, authMechanism: 'none',    validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'read_file',             handlerFile: 'src/server/routes/files.py', line: 160, middleware: [],                                  errorHandling: true,  statusCodes: [200, 400, 404], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 73,  deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/write-file',                 method: 'POST', auth: false, authMechanism: 'none',    validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'write_file',            handlerFile: 'src/server/routes/files.py', line: 234, middleware: [],                                  errorHandling: true,  statusCodes: [200, 400, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 59,  deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/delete-file',                method: 'POST', auth: false, authMechanism: 'none',    validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'delete_file',           handlerFile: 'src/server/routes/files.py', line: 294, middleware: [],                                  errorHandling: true,  statusCodes: [200, 400, 404], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 35,  deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/delete-folder',              method: 'POST', auth: true,  authMechanism: 'API Key', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'delete_folder',         handlerFile: 'src/server/routes/files.py', line: 330, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 400, 404], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 24,  deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/rename-file',                method: 'POST', auth: true,  authMechanism: 'API Key', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'rename_file',           handlerFile: 'src/server/routes/files.py', line: 355, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 400, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 34,  deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/rename-folder',              method: 'POST', auth: true,  authMechanism: 'API Key', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'rename_folder',         handlerFile: 'src/server/routes/files.py', line: 389, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 400, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 40,  deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/upload',                     method: 'POST', auth: false, authMechanism: 'none',    validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'upload_file',           handlerFile: 'src/server/routes/files.py', line: 430, middleware: [],                                  errorHandling: true,  statusCodes: [200, 400, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 36,  deprecated: false, version: null, hasOpenApiSpec: true },

        /* ── wework.py — WeWork webhook forwarding ─────────────────── */
        { path: '/wework/send-message',        method: 'POST', auth: true,  authMechanism: 'API Key', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'send_wework_message',   handlerFile: 'src/server/routes/wework.py', line: 17,  middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 400, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 75,  deprecated: false, version: null, hasOpenApiSpec: true },

        /* ── maintenance.py — RPC-style cleanup action ────────────── */
        { path: '/cleanup-unused-images',           method: 'POST', auth: true, authMechanism: 'API Key', validationDepth: { body: true, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'cleanup_unused_images',       handlerFile: 'src/server/routes/maintenance.py', line: 204, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 67, deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/maintenance/cleanup-unused-images', method: 'POST', auth: true, authMechanism: 'API Key', validationDepth: { body: true, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'cleanup_unused_images_alt',    handlerFile: 'src/server/routes/maintenance.py', line: 205, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 67, deprecated: true,  version: null, hasOpenApiSpec: true },

        /* ── state.py — the only RESTful resource (still unversioned) ── */
        { path: '/state/records',         method: 'GET',    auth: true, authMechanism: 'API Key', validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'query_state_records', handlerFile: 'src/server/routes/state.py', line: 36, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 400, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'page', safe: true,  idempotent: true,  handlerLines: 22, deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/state/records',         method: 'POST',   auth: true, authMechanism: 'API Key', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'create_state_record', handlerFile: 'src/server/routes/state.py', line: 25, middleware: ['header_verification'], errorHandling: true, statusCodes: [201, 400, 401, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 9,  deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/state/records/{key}',   method: 'GET',    auth: true, authMechanism: 'API Key', validationDepth: { body: false, params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'get_state_record',    handlerFile: 'src/server/routes/state.py', line: 60, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 400, 404, 401], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 8,  deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/state/records/{key}',   method: 'PUT',    auth: true, authMechanism: 'API Key', validationDepth: { body: true,  params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'update_state_record', handlerFile: 'src/server/routes/state.py', line: 70, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 400, 404, 401], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: true,  handlerLines: 9,  deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/state/records/{key}',   method: 'DELETE', auth: true, authMechanism: 'API Key', validationDepth: { body: false, params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'delete_state_record', handlerFile: 'src/server/routes/state.py', line: 81, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 400, 404, 401], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: true,  handlerLines: 8,  deprecated: false, version: null, hasOpenApiSpec: true },

        /* ── health.py — observer runtime status ───────────────────── */
        { path: '/health/observer',       method: 'GET',    auth: true, authMechanism: 'API Key', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'observer_health',     handlerFile: 'src/server/routes/health.py', line: 45, middleware: ['header_verification'], errorHandling: true, statusCodes: [200],          responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 15, deprecated: false, version: null, hasOpenApiSpec: true },

        /* ── story_panel.py — /api/ namespace (still no version) ──── */
        { path: '/api/story-panel/overview',        method: 'GET',    auth: true, authMechanism: 'API Key', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'overview',       handlerFile: 'src/server/routes/story_panel.py', line: 151, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 28, deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/api/story-panel/stories',         method: 'GET',    auth: true, authMechanism: 'API Key', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'list_stories',   handlerFile: 'src/server/routes/story_panel.py', line: 181, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 22, deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/api/story-panel/stories/{name}',  method: 'GET',    auth: true, authMechanism: 'API Key', validationDepth: { body: false, params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'show_story',    handlerFile: 'src/server/routes/story_panel.py', line: 205, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 400, 404], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 39, deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/api/story-panel/stories/sync',   method: 'POST',   auth: true, authMechanism: 'API Key', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'sync_stories',   handlerFile: 'src/server/routes/story_panel.py', line: 247, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 400, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 65, deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/api/story-panel/remote',         method: 'GET',    auth: true, authMechanism: 'API Key', validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'remote_stories', handlerFile: 'src/server/routes/story_panel.py', line: 378, middleware: ['header_verification'], errorHandling: true, statusCodes: [200, 500], responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 53, deprecated: false, version: null, hasOpenApiSpec: true },
        { path: '/api/story-panel/help',           method: 'GET',    auth: true, authMechanism: 'API Key', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'help_info',      handlerFile: 'src/server/routes/story_panel.py', line: 435, middleware: ['header_verification'], errorHandling: true, statusCodes: [200],          responseFormat: 'JSON', errorFormat: 'custom', paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 28, deprecated: false, version: null, hasOpenApiSpec: true },
    ],

    /* ── HTTP Semantics ───────────────────────────────────────────────── */
    semantics: {
        score: 55,
        safeCount: 9,
        unsafeCount: 17,
        idempotentCount: 11,
        nonIdempotentCount: 15,
        methodMisuse: [
            { path: '/read-file',                       method: 'POST', handlerFile: 'src/server/routes/files.py',        line: 160, issue: 'POST used for data retrieval — should be GET with query or path param', severity: 'P0' },
            { path: '/upload',                          method: 'POST', handlerFile: 'src/server/routes/files.py',        line: 430, issue: 'POST with body for file write — acceptable, but RPC verb-in-path is non-RESTful', severity: 'P1' },
            { path: '/write-file',                      method: 'POST', handlerFile: 'src/server/routes/files.py',        line: 234, issue: 'POST with body for file write — RPC verb-in-path; consider PUT /files/{path}', severity: 'P1' },
            { path: '/delete-file',                     method: 'POST', handlerFile: 'src/server/routes/files.py',        line: 294, issue: 'POST used for deletion — should be DELETE /files/{path}', severity: 'P0' },
            { path: '/delete-folder',                   method: 'POST', handlerFile: 'src/server/routes/files.py',        line: 330, issue: 'POST used for deletion — should be DELETE /folders/{path}', severity: 'P0' },
            { path: '/rename-file',                     method: 'POST', handlerFile: 'src/server/routes/files.py',        line: 355, issue: 'POST used for rename — RPC pattern, consider POST /files/{path}:rename action', severity: 'P1' },
        ],
        methodCorrectness: [
            { method: 'GET',    total: 9,  correct: 9,  misuse: 0 },
            { method: 'POST',   total: 15, correct: 9,  misuse: 6 },
            { method: 'PUT',    total: 1,  correct: 1,  misuse: 0 },
            { method: 'DELETE', total: 1,  correct: 1,  misuse: 0 },
        ],
    },

    /* ── Method distribution ───────────────────────────────────────────── */
    methods: [
        { method: 'GET',    count: 9,  pct: 34.6, safe: true,  idempotent: true },
        { method: 'POST',   count: 15, pct: 57.7, safe: false, idempotent: false },
        { method: 'PUT',     count: 1,  pct: 3.8,  safe: false, idempotent: true },
        { method: 'DELETE',  count: 1,  pct: 3.8,  safe: false, idempotent: true },
    ],

    /* ── Patterns ─────────────────────────────────────────────────────── */
    patterns: [
        { pattern: '/',                              version: null, resource: 'execution',   restScore: 25, issues: ['No version prefix', 'RPC dispatcher at root', 'Ambiguous semantics (GET/POST same path)'],                       methodCount: 2 },
        { pattern: '/upload-image-to-oss',           version: null, resource: 'oss',         restScore: 20, issues: ['Verb in path', 'No version prefix', 'Duplicate alt path /upload/upload-image-to-oss'], methodCount: 2 },
        { pattern: '/read-file',                     version: null, resource: 'file',        restScore: 25, issues: ['Verb in path', 'No version prefix', 'POST for read'],                                       methodCount: 1 },
        { pattern: '/write-file',                    version: null, resource: 'file',        restScore: 25, issues: ['Verb in path', 'No version prefix', 'POST for write (consider PUT)'],                       methodCount: 1 },
        { pattern: '/delete-file',                   version: null, resource: 'file',        restScore: 15, issues: ['Verb in path', 'No version prefix', 'POST for delete'],                                    methodCount: 1 },
        { pattern: '/delete-folder',                 version: null, resource: 'folder',      restScore: 15, issues: ['Verb in path', 'No version prefix', 'POST for delete'],                                    methodCount: 1 },
        { pattern: '/rename-file',                   version: null, resource: 'file',        restScore: 20, issues: ['Verb in path', 'No version prefix', 'RPC action'],                                          methodCount: 1 },
        { pattern: '/rename-folder',                 version: null, resource: 'folder',      restScore: 20, issues: ['Verb in path', 'No version prefix', 'RPC action'],                                          methodCount: 1 },
        { pattern: '/upload',                        version: null, resource: 'file',        restScore: 25, issues: ['Verb in path', 'No version prefix', 'Auth bypassed (whitelist)'],                          methodCount: 1 },
        { pattern: '/wework/send-message',           version: null, resource: 'wework',      restScore: 30, issues: ['Verb in path', 'No version prefix'],                                                          methodCount: 1 },
        { pattern: '/cleanup-unused-images',         version: null, resource: 'maintenance', restScore: 20, issues: ['Verb in path', 'No version prefix', 'Duplicate alt path /maintenance/cleanup-unused-images'], methodCount: 2 },
        { pattern: '/state/records',                 version: null, resource: 'state',      restScore: 70, issues: ['No version prefix'],                                                                          methodCount: 5 },
        { pattern: '/health/observer',               version: null, resource: 'health',     restScore: 40, issues: ['Verb in path', 'No version prefix'],                                                          methodCount: 1 },
        { pattern: '/api/story-panel',               version: null, resource: 'story-panel', restScore: 55, issues: ['No version prefix', 'Mixed RPC + resource'],                                                  methodCount: 6 },
    ],

    /* ── Security (request perspective) ────────────────────────────────── */
    security: {
        authCoverage: 0.85,
        authMechanisms: { 'API Key': 22, none: 4 },
        endpointsMissingAuth: [
            { path: '/read-file',  method: 'POST', handlerFile: 'src/server/routes/files.py', line: 160, authMechanism: 'none' },
            { path: '/write-file', method: 'POST', handlerFile: 'src/server/routes/files.py', line: 234, authMechanism: 'none' },
            { path: '/delete-file', method: 'POST', handlerFile: 'src/server/routes/files.py', line: 294, authMechanism: 'none' },
            { path: '/upload',     method: 'POST', handlerFile: 'src/server/routes/files.py', line: 430, authMechanism: 'none' },
        ],
        rateLimitCoverage: 0.0,
        endpointsMissingRateLimit: [
            { path: '/', method: 'GET',  handlerFile: 'src/server/routes/execution.py', line: 42 },
            { path: '/', method: 'POST', handlerFile: 'src/server/routes/execution.py', line: 66 },
        ],
        securityHeadersScore: 30,
        corsConfigured: true,
        inputValidationCoverage: 0.62,
        endpointsMissingValidation: [
            { path: '/health/observer',              method: 'GET', handlerFile: 'src/server/routes/health.py',       line: 45 },
            { path: '/api/story-panel/overview',      method: 'GET', handlerFile: 'src/server/routes/story_panel.py', line: 151 },
            { path: '/api/story-panel/stories',       method: 'GET', handlerFile: 'src/server/routes/story_panel.py', line: 181 },
            { path: '/api/story-panel/help',          method: 'GET', handlerFile: 'src/server/routes/story_panel.py', line: 435 },
        ],
    },

    /* ── Health & Contracts (response perspective) ─────────────────────── */
    health: {
        errorHandlingCoverage: 0.77,
        endpointsWithoutErrorHandling: [
            { path: '/upload-image-to-oss', method: 'POST', handlerFile: 'src/server/routes/files.py', line: 129 },
        ],
        handlerComplexity: [
            { path: '/read-file',                       method: 'POST', handler: 'read_file',             handlerFile: 'src/server/routes/files.py',        line: 160, lines: 73,  complexity: 'medium' },
            { path: '/wework/send-message',             method: 'POST', handler: 'send_wework_message',   handlerFile: 'src/server/routes/wework.py',      line: 17,  lines: 75,  complexity: 'medium' },
            { path: '/cleanup-unused-images',           method: 'POST', handler: 'cleanup_unused_images', handlerFile: 'src/server/routes/maintenance.py', line: 204, lines: 67,  complexity: 'medium' },
            { path: '/api/story-panel/stories/sync',   method: 'POST', handler: 'sync_stories',          handlerFile: 'src/server/routes/story_panel.py', line: 247, lines: 65,  complexity: 'medium' },
            { path: '/api/story-panel/remote',          method: 'GET',  handler: 'remote_stories',       handlerFile: 'src/server/routes/story_panel.py', line: 378, lines: 53,  complexity: 'medium' },
        ],
        responseConsistencyScore: 80,
        contentNegotiationScore: 25,
        errorFormatScore: 0,
        statusCodeDistribution: { '200': 22, '201': 1, '400': 12, '401': 14, '404': 6, '500': 8 },
        paginationCoverage: 0.04,
        contractScore: 45,
    },

    /* ── Alerts ───────────────────────────────────────────────────────── */
    alerts: [
        {   /* P0 — security: file-mutation routes whitelisted from auth */
            severity: 'P0', marker: 'P0', category: 'security',
            file: 'src/server/middleware.py', line: 71,
            message: 'POST /write-file, /delete-file, /upload, /read-file — whitelisted from X-Token auth',
            metric: '4 unauthenticated mutation routes',
            impact: 'Any unauthenticated client can write, delete, or upload files into static storage.',
            effort: 'low', scoreUplift: 18,
            recommendations: [
                'Remove these paths from the auth whitelist in middleware.py and require X-Token.',
                'If a SPA needs them, gate via a short-lived signed URL or session cookie instead of blanket bypass.',
                'Add an integration test that asserts 401 when X-Token is missing.',
            ],
        },
        {   /* P0 — semantics: POST used for read/delete */
            severity: 'P0', marker: 'P0', category: 'semantics',
            file: 'src/server/routes/files.py', line: 160,
            message: 'POST /read-file — POST used for data retrieval',
            metric: 'POST-for-read',
            impact: 'Violates RFC 7231 — clients/caches/intermediaries assume POST is unsafe and non-cacheable.',
            effort: 'medium', scoreUplift: 10,
            recommendations: [
                'Refactor to GET /files/{path} with the target as a path or query parameter.',
                'For very large payloads, keep POST but use a dedicated /files:read action endpoint with a clear non-REST contract.',
            ],
        },
        {   /* P0 — semantics: POST used for delete */
            severity: 'P0', marker: 'P0', category: 'semantics',
            file: 'src/server/routes/files.py', line: 294,
            message: 'POST /delete-file and /delete-folder — POST used for deletion',
            metric: 'POST-for-delete',
            impact: 'DELETE is the correct semantic method; POST obscures the mutation from intermediaries.',
            effort: 'medium', scoreUplift: 10,
            recommendations: [
                'Refactor to DELETE /files/{path} and DELETE /folders/{path}.',
                'Keep POST variants as 308 redirects during the deprecation window.',
            ],
        },
        {   /* P0 — complexity: files.py is 465 LOC mixing 9 routes + helpers */
            severity: 'P0', marker: 'P0', category: 'complexity',
            file: 'src/server/routes/files.py', line: 1,
            message: 'files.py — 465 LOC with 9 routes and 7 helpers in one module',
            metric: '465 LOC',
            impact: 'Single-file growth makes the routes hard to review, test, and split.',
            effort: 'high', scoreUplift: 6,
            recommendations: [
                'Split into files_upload.py, files_read.py, files_delete.py, files_rename.py by concern.',
                'Extract path validation helpers into src/shared/path.py.',
            ],
        },
        {   /* P1 — versioning: no /v1/ prefix on any route */
            severity: 'P1', marker: 'P1', category: 'versioning',
            file: 'src/app.py', line: 112,
            message: 'No version prefix on any of the 26 routes — breaking changes affect all consumers',
            metric: '0 versioned routes',
            impact: 'Breaking changes cannot be gated by version; all clients break simultaneously.',
            effort: 'medium', scoreUplift: 8,
            recommendations: [
                'Introduce /v1/ prefix on all routers (router = APIRouter(prefix=\'/api/v1\')).',
                'Keep unversioned routes as 308 redirects during migration.',
            ],
        },
        {   /* P1 — pattern: verb-in-path on 11 routes */
            severity: 'P1', marker: '1', category: 'pattern',
            file: 'src/server/routes/files.py', line: 129,
            message: '11 RPC-style verb-in-path routes (upload-image-to-oss, read-file, write-file, delete-*, rename-*, send-message, cleanup-unused-images)',
            metric: 'REST score ≤25',
            impact: 'Non-RESTful patterns confuse consumers and tooling; no resource-oriented mental model.',
            effort: 'high', scoreUplift: 8,
            recommendations: [
                'Adopt resource nouns: POST /files, GET /files/{path}, DELETE /files/{path}, POST /files/{path}:rename.',
                'Move WeWork webhook to POST /integrations/wework/messages.',
            ],
        },
        {   /* P1 — contracts: custom error format, not RFC 7807 */
            severity: 'P1', marker: 'P1', category: 'contracts',
            file: 'src/shared/response.py', line: 1,
            message: 'Error responses use custom {code, message, data} envelope — not RFC 7807 Problem Details',
            metric: 'RFC 7807 score 0',
            impact: 'Consumers cannot generically parse errors; each client needs bespoke error handling.',
            effort: 'medium', scoreUplift: 6,
            recommendations: [
                'Adopt application/problem+json with type/title/status/detail members.',
                'Map ErrorCode enum to RFC 7807 type URIs.',
            ],
        },
        {   /* P1 — pagination: only 1 of 26 routes paginated */
            severity: 'P1', marker: 'P1', category: 'pagination',
            file: 'src/server/routes/state.py', line: 36,
            message: 'Only GET /state/records is paginated — other list-returning routes (story-panel/stories, remote) return unbounded arrays',
            metric: 'pagination coverage 4%',
            impact: 'Large datasets risk response bloat, timeout, and memory pressure.',
            effort: 'medium', scoreUplift: 5,
            recommendations: [
                'Add page_num/page_size (or cursor) to /api/story-panel/stories and /api/story-panel/remote.',
                'Enforce a max page_size in shared middleware.',
            ],
        },
        {   /* P1 — deprecation: alt-path registrations without Deprecation header */
            severity: 'P1', marker: 'P1', category: 'deprecation',
            file: 'src/server/routes/files.py', line: 130,
            message: 'Alt routes /upload/upload-image-to-oss and /maintenance/cleanup-unused-images — no Deprecation/Sunset header',
            metric: '2 unmanaged alt paths',
            impact: 'Consumers may discover and depend on the duplicate paths; removal without notice breaks them.',
            effort: 'low', scoreUplift: 4,
            recommendations: [
                'Add a Deprecation header + Sunset date on the alt-path handlers.',
                'Add a CI lint that forbids new @router multi-decorator alt paths.',
            ],
        },
        {   /* P2 — security: no per-route rate limiting */
            severity: 'P2', marker: 'P2', category: 'security',
            file: 'src/app.py', line: 102,
            message: 'Rate limiting is global observer-throttle only — no per-route limits on /upload, /wework/send-message, /cleanup-unused-images',
            metric: '0 per-route rate limits',
            impact: 'Mutation/upload routes are vulnerable to abuse; global throttle is too coarse for sensitive endpoints.',
            effort: 'low', scoreUplift: 4,
            recommendations: [
                'Add a slowapi or fastapi-limiter dependency on upload/cleanup/wework routes.',
                'Differentiate limits: stricter on /upload-image-to-oss and /wework/send-message.',
            ],
        },
        {   /* P2 — security: weak default auth token */
            severity: 'P2', marker: 'P2', category: 'security',
            file: 'config.yaml', line: 1,
            message: 'middleware.auth_token default is "dev-token-change-me" — never rotated in config.yaml',
            metric: 'dev token',
            impact: 'If the default leaks into a deployed environment, any client knowing the token can call every authenticated route.',
            effort: 'low', scoreUplift: 3,
            recommendations: [
                'Fail fast at startup if auth_token equals the default placeholder.',
                'Move auth_token to a secret manager or environment variable.',
            ],
        },
        {   /* P2 — contracts: inconsistent path-param naming */
            severity: 'P2', marker: 'P2', category: 'contracts',
            file: 'src/server/routes/state.py', line: 60,
            message: 'Path param naming is inconsistent — {key} (state), {name} (story-panel); no shared convention',
            metric: 'path param drift',
            impact: 'Consumers must memorize per-resource param names; OpenAPI spec looks inconsistent.',
            effort: 'low', scoreUplift: 2,
            recommendations: [
                'Standardize on {id} or a per-resource singular noun.',
                'Document the convention in the README.',
            ],
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
            tooling: [{ name: 'pydantic', hint: 'Python data validation' }],
            preventiveControls: ['CI: require validation on all POST/PUT/PATCH requests.', 'OpenAPI schema enforcement.'],
            rollbackPlan: 'Revert validation addition; remove the schema import.',
        },
        error_handling: {
            risk: 'Unhandled errors leak stack traces or crash the process.',
            blastRadius: 'single request → cascading failure',
            estimatedHours: 2,
            acceptance: ['Handler wrapped in try/catch or error middleware added.', 'Error responses are structured JSON.'],
            firstStep: 'Wrap handler body in try/catch or add error middleware.',
            tooling: [{ name: 'fastapi exception handler', hint: 'register_exception_handlers' }],
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
            tooling: [{ name: 'radon', hint: 'Python cyclomatic complexity' }],
            preventiveControls: ['CI: fail PRs adding >100 LOC to handlers over 500 LOC.', 'CODEOWNERS for large handlers.'],
            rollbackPlan: 'Revert split; barrel re-exports original handler.',
        },
        versioning: {
            risk: 'Breaking changes affect all consumers without versioning.',
            blastRadius: 'all API consumers',
            estimatedHours: 10,
            acceptance: ['Version prefix added.', 'Legacy routes redirected.', 'Documentation updated.'],
            firstStep: 'Add /v1/ prefix; deprecate unversioned routes with 308 redirect.',
            tooling: [{ name: 'fastapi versioning', hint: 'fastapi-versioned-routes' }],
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
            tooling: [{ name: 'OpenAPI', hint: 'generate and enforce API contracts' }],
            preventiveControls: ['CI: validate response schemas in tests.', 'Contract-first API design workflow.'],
            rollbackPlan: 'Revert schema changes; restore original response shapes.',
        },
        pagination: {
            risk: 'Unpaginated collections risk response bloat, timeout, and memory exhaustion.',
            blastRadius: 'all collection consumers',
            estimatedHours: 3,
            acceptance: ['Pagination added with reasonable defaults.', 'Max limit enforced.', 'Consistent style across collections.'],
            firstStep: 'Add pagination params (offset/limit or cursor) to the collection handler.',
            tooling: [{ name: 'fastapi-pagination', hint: 'pagination for FastAPI' }],
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
