/**
 * yry-report-apis — Static configuration & runtime analysis
 * ----------------------------------------------------------------------
 * Scope: /Users/yi/YrY/{YiAi,YiPet,YiWeb,YiH5,YiPot,YiviY,Websites}
 * Generated: 2026-07-21
 * Every endpoint framed by the HTTP request lifecycle:
 *   ingress → processing → egress → contract
 */

window.REPORT_CONFIG = {
    options: {
        topN: 20,
        theme: 'dark',
        generatedAt: '2026-07-21T12:00:00.000Z',
    },
    constants: {
        filterDebounceMs: 200,
        componentReadyTimeoutMs: 5000,
        csvHeader: 'path,method,handler,handlerFile,line,auth,authMechanism,validationDepth,contentTypes,rateLimited,errorHandling,middleware,statusCodes,responseFormat,errorFormat,paginationStyle,safe,idempotent,handlerLines,deprecated,version',
    },
    labels: {
        title: 'yry-report-apis · Yi Ecosystem',
        footerMethodology: 'Methodology: references/methodology.md · schemas: references/schemas.md',
        sectionSummary:    'Summary',
        sectionEndpoints:  'Endpoints',
        sectionSemantics:  'HTTP Semantics',
        sectionPatterns:   'Patterns',
        sectionSecurity:   'Security',
        sectionHealth:     'Health & Contracts',
        sectionLibraries:  'Libraries & Frameworks',
        sectionRemediation: 'Remediation',
        summaryTotalEndpoints: 'Total Requests',
        summaryTotalHandlers:  'Total Handlers',
        summaryAuthCoverage:   'Auth Coverage',
        summaryValidationCoverage: 'Validation Coverage',
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
        emptyEndpoints:  'No API requests detected in scope.',
        emptySemantics:  'No HTTP semantics data collected.',
        emptyMethods:    'No HTTP method data collected.',
        emptyPatterns:   'No route patterns identified.',
        emptySecurity:   'No security issues detected.',
        emptyHealth:     'No health issues detected.',
        emptyRemediation: 'No remediation items — all clear.',
        filterPlaceholder: 'filter by path, method, or handler…',
        exportJson: 'Export JSON',
        exportCsv:  'Export CSV',
        copyPath: 'Copy',
        semanticsScore:       'Semantics Score',
        semanticsSafeCount:   'Safe Requests',
        semanticsUnsafeCount: 'Unsafe Requests',
        semanticsIdempotentCount: 'Idempotent Requests',
        semanticsMisuseCount: 'Method Misuse',
        semanticsMisuseTable:  'Method Misuse Detected',
        securityAuthCoverage:      'Auth Coverage',
        securityAuthMechanisms:    'Auth Mechanisms',
        securityRateLimit:         'Rate Limit Coverage',
        securityCorsConfigured:    'CORS',
        securityHeadersScore:      'Security Headers',
        securityValidationCoverage:'Input Validation',
        securityMissingAuth:       'Requests Missing Auth',
        securityMissingRateLimit:  'Requests Missing Rate Limit',
        securityMissingValidation: 'Requests Missing Validation',
        healthErrorCoverage:       'Error Handling Coverage',
        healthResponseConsistency: 'Response Consistency Score',
        healthHighComplexity:      'High Complexity Handlers',
        healthNegotiationScore:    'Content Negotiation',
        healthErrorFormatScore:    'Error Format (RFC 7807)',
    },
};

window.REPORT_DATA = {
    scope: 'YiAi + YiPet + YiWeb + YiH5 + YiPot + YiviY + Websites',
    score: 58,

    summary: {
        totalRequests: 34,
        totalHandlers: 24,
        totalMethods: { GET: 12, POST: 19, PUT: 2, DELETE: 1 },
        authCoverage: 0.62,
        validationDepthCoverage: 0.68,
        errorHandlingCoverage: 0.82,
        deprecatedCount: 1,
        criticalCount: 8,
        maxHandlerLines: 300,
        dominantResponseFormat: 'JSON',
        dominantAuthMechanism: 'X-Token',
        semanticsScore: 52,
        contractScore: 40,
        methodMisuseCount: 5,
        paginationCoverage: 0.25,
        rfc7807ComplianceScore: 20,
    },

    /* ── Request inventory ──────────────────────────────────────────────── */
    endpoints: [
        /* ─── YiAi: Execution Gateway ─────────────────────────────────── */
        { path: '/',                        method: 'POST',  auth: true,  authMechanism: 'X-Token', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'execute_module_via_post',  handlerFile: 'YiAi/src/api/routes/execution.py', line: 66,  middleware: ['auth','throttle'],      errorHandling: true,  statusCodes: [200,400,500],       responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 40,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/',                        method: 'GET',   auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'execute_module_via_get',   handlerFile: 'YiAi/src/api/routes/execution.py', line: 42,  middleware: ['auth','throttle'],      errorHandling: true,  statusCodes: [200,400,500],       responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 24,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* ─── YiAi: File Operations ──────────────────────────────────── */
        { path: '/read-file',               method: 'POST',  auth: false, authMechanism: 'none',    validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'read_file',                handlerFile: 'YiAi/src/api/routes/upload.py',       line: 160, middleware: ['throttle'],              errorHandling: true,  statusCodes: [200,400,404,500],   responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 74,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/write-file',              method: 'POST',  auth: false, authMechanism: 'none',    validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'write_file',               handlerFile: 'YiAi/src/api/routes/upload.py',       line: 234, middleware: ['throttle'],              errorHandling: true,  statusCodes: [200,400,500],       responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 60,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/delete-file',             method: 'POST',  auth: false, authMechanism: 'none',    validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'delete_file',              handlerFile: 'YiAi/src/api/routes/upload.py',       line: 294, middleware: ['throttle'],              errorHandling: true,  statusCodes: [200,400,404,500],   responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: true,  handlerLines: 36,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/delete-folder',           method: 'POST',  auth: true,  authMechanism: 'X-Token', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'delete_folder',            handlerFile: 'YiAi/src/api/routes/upload.py',       line: 330, middleware: ['auth','throttle'],      errorHandling: true,  statusCodes: [200,400,404,500],   responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: true,  handlerLines: 25,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/rename-file',             method: 'POST',  auth: true,  authMechanism: 'X-Token', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'rename_file',              handlerFile: 'YiAi/src/api/routes/upload.py',       line: 355, middleware: ['auth','throttle'],      errorHandling: true,  statusCodes: [200,400,404,500],   responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: true,  handlerLines: 34,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/rename-folder',           method: 'POST',  auth: true,  authMechanism: 'X-Token', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'rename_folder',            handlerFile: 'YiAi/src/api/routes/upload.py',       line: 389, middleware: ['auth','throttle'],      errorHandling: true,  statusCodes: [200,400,404,500],   responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: true,  handlerLines: 34,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/upload',                  method: 'POST',  auth: false, authMechanism: 'none',    validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'upload_file',              handlerFile: 'YiAi/src/api/routes/upload.py',       line: 430, middleware: ['throttle'],              errorHandling: true,  statusCodes: [200,400,500],       responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 40,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/upload-image-to-oss',     method: 'POST',  auth: true,  authMechanism: 'X-Token', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'upload_image_to_oss',      handlerFile: 'YiAi/src/api/routes/upload.py',       line: 129, middleware: ['auth','throttle'],      errorHandling: true,  statusCodes: [200,400,500],       responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 50,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* ─── YiAi: WeWork ───────────────────────────────────────────── */
        { path: '/wework/send-message',     method: 'POST',  auth: true,  authMechanism: 'X-Token', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'send_wework_message',      handlerFile: 'YiAi/src/api/routes/wework.py',      line: 17,  middleware: ['auth','throttle'],      errorHandling: true,  statusCodes: [200,400,500],       responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 35,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* ─── YiAi: Maintenance ──────────────────────────────────────── */
        { path: '/cleanup-unused-images',   method: 'POST',  auth: true,  authMechanism: 'X-Token', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'cleanup_unused_images',    handlerFile: 'YiAi/src/api/routes/maintenance.py',  line: 204, middleware: ['auth','throttle'],      errorHandling: false, statusCodes: [200],             responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 55,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* ─── YiAi: State Records ────────────────────────────────────── */
        { path: '/state/records',           method: 'POST',  auth: true,  authMechanism: 'X-Token', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'create_record',            handlerFile: 'YiAi/src/api/routes/state.py',        line: 25,  middleware: ['auth','throttle'],      errorHandling: false, statusCodes: [200,201,400,500],   responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 18,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/state/records',           method: 'GET',   auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'query_records',            handlerFile: 'YiAi/src/api/routes/state.py',        line: 36,  middleware: ['auth','throttle'],      errorHandling: false, statusCodes: [200,400,500],       responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'page',   safe: true,  idempotent: true,  handlerLines: 24,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/state/records/{key}',     method: 'GET',   auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'get_record',               handlerFile: 'YiAi/src/api/routes/state.py',        line: 60,  middleware: ['auth','throttle'],      errorHandling: false, statusCodes: [200,404,500],       responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 12,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/state/records/{key}',     method: 'PUT',   auth: true,  authMechanism: 'X-Token', validationDepth: { body: true,  params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'update_record',            handlerFile: 'YiAi/src/api/routes/state.py',        line: 70,  middleware: ['auth','throttle'],      errorHandling: false, statusCodes: [200,404,500],       responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: true,  handlerLines: 14,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/state/records/{key}',     method: 'DELETE',auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'delete_record',            handlerFile: 'YiAi/src/api/routes/state.py',        line: 81,  middleware: ['auth','throttle'],      errorHandling: false, statusCodes: [200,404,500],       responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: true,  handlerLines: 12,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* ─── YiAi: Observer Health ──────────────────────────────────── */
        { path: '/health/observer',         method: 'GET',   auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'observer_health',          handlerFile: 'YiAi/src/api/routes/observer_health.py',line: 45, middleware: ['auth','throttle'],      errorHandling: false, statusCodes: [200],             responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 20,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* ─── YiAi: Story Panel ──────────────────────────────────────── */
        { path: '/api/story-panel/overview',method: 'GET',   auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'overview',                 handlerFile: 'YiAi/src/api/routes/story_panel.py',  line: 151, middleware: ['auth','throttle'],      errorHandling: false, statusCodes: [200],             responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 30,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/api/story-panel/stories', method: 'GET',   auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'list_stories',             handlerFile: 'YiAi/src/api/routes/story_panel.py',  line: 181, middleware: ['auth','throttle'],      errorHandling: false, statusCodes: [200],             responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 24,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/api/story-panel/stories/{name}', method: 'GET', auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'show_story',               handlerFile: 'YiAi/src/api/routes/story_panel.py',  line: 205, middleware: ['auth','throttle'],      errorHandling: false, statusCodes: [200,404],            responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 42,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/api/story-panel/stories/sync', method: 'POST', auth: true, authMechanism: 'X-Token', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'sync_stories',             handlerFile: 'YiAi/src/api/routes/story_panel.py',  line: 247, middleware: ['auth','throttle'],      errorHandling: false, statusCodes: [200],             responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 131, deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/api/story-panel/remote',  method: 'GET',   auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'remote_stories',           handlerFile: 'YiAi/src/api/routes/story_panel.py',  line: 378, middleware: ['auth','throttle'],      errorHandling: false, statusCodes: [200],             responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 57,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/api/story-panel/help',    method: 'GET',   auth: true,  authMechanism: 'X-Token', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: true,  handler: 'help_info',                handlerFile: 'YiAi/src/api/routes/story_panel.py',  line: 435, middleware: ['auth','throttle'],      errorHandling: false, statusCodes: [200],             responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none',   safe: true,  idempotent: true,  handlerLines: 15,  deprecated: false, version: null, hasOpenApiSpec: false },

        /* ─── YiPot: Internal HTTP Server ────────────────────────────── */
        { path: '/',                        method: 'POST',  auth: false, authMechanism: 'none',    validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['text/plain'], rateLimited: false, handler: 'handle_translate',         handlerFile: 'YiPot/src-tauri/src/server.rs',       line: 37,  middleware: [],                        errorHandling: false, statusCodes: [200],             responseFormat: 'text', errorFormat: 'none',    paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 5,   deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/translate',               method: 'POST',  auth: false, authMechanism: 'none',    validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['text/plain'], rateLimited: false, handler: 'handle_translate',         handlerFile: 'YiPot/src-tauri/src/server.rs',       line: 38,  middleware: [],                        errorHandling: false, statusCodes: [200],             responseFormat: 'text', errorFormat: 'none',    paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 5,   deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/ocr_recognize',           method: 'POST',  auth: false, authMechanism: 'none',    validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['text/plain'], rateLimited: false, handler: 'handle_ocr_recognize',      handlerFile: 'YiPot/src-tauri/src/server.rs',       line: 42,  middleware: [],                        errorHandling: false, statusCodes: [200],             responseFormat: 'text', errorFormat: 'none',    paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 5,   deprecated: false, version: null, hasOpenApiSpec: false },

        /* ─── Websites: PHP Contact Forms ────────────────────────────── */
        { path: '/mail.php',               method: 'POST',  auth: false, authMechanism: 'none',    validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/x-www-form-urlencoded'], rateLimited: false, handler: 'Arter mailer',             handlerFile: 'Websites/Arter/mail.php',             line: 1,   middleware: [],                        errorHandling: false, statusCodes: [200],             responseFormat: 'text', errorFormat: 'none',    paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 20,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/php/contact.php',        method: 'POST',  auth: false, authMechanism: 'none',    validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/x-www-form-urlencoded'], rateLimited: false, handler: 'Kasy mailer',             handlerFile: 'Websites/Kasy/php/contact.php',       line: 1,   middleware: [],                        errorHandling: false, statusCodes: [200],             responseFormat: 'text', errorFormat: 'none',    paginationStyle: 'none',   safe: false, idempotent: false, handlerLines: 35,  deprecated: false, version: null, hasOpenApiSpec: false },
    ],

    /* ── HTTP Semantics ───────────────────────────────────────────────── */
    semantics: {
        score: 52,
        safeCount: 12,
        unsafeCount: 22,
        idempotentCount: 20,
        nonIdempotentCount: 14,
        methodMisuse: [
            { path: '/',                    method: 'POST', handlerFile: 'YiAi/src/api/routes/execution.py', line: 66,  issue: 'POST used as generic RPC dispatcher — semantically overloaded; same path handles mutations AND reads', severity: 'P1' },
            { path: '/read-file',           method: 'POST', handlerFile: 'YiAi/src/api/routes/upload.py',      line: 160, issue: 'POST used for read operation — use GET with query params', severity: 'P1' },
            { path: '/write-file',          method: 'POST', handlerFile: 'YiAi/src/api/routes/upload.py',      line: 234, issue: 'Verb in path (write-file) — RPC-style; use PUT /files with semantic body', severity: 'P1' },
            { path: '/delete-file',         method: 'POST', handlerFile: 'YiAi/src/api/routes/upload.py',      line: 294, issue: 'POST for deletion — use DELETE /files/{path}', severity: 'P1' },
            { path: '/wework/send-message', method: 'POST', handlerFile: 'YiAi/src/api/routes/wework.py',      line: 17,  issue: 'Verb in path (send-message) — use POST /messages with semantic body', severity: 'P2' },
        ],
        methodCorrectness: [
            { method: 'GET',    total: 12, correct: 12, misuse: 0 },
            { method: 'POST',   total: 19, correct: 14, misuse: 5 },
            { method: 'PUT',    total: 2,  correct: 2,  misuse: 0 },
            { method: 'DELETE', total: 1,  correct: 1,  misuse: 0 },
        ],
    },

    /* ── Method distribution ───────────────────────────────────────────── */
    methods: [
        { method: 'GET',    count: 12, pct: 35.3, safe: true,  idempotent: true },
        { method: 'POST',   count: 19, pct: 55.9, safe: false, idempotent: false },
        { method: 'PUT',    count: 2,  pct: 5.9,  safe: false, idempotent: true },
        { method: 'DELETE', count: 1,  pct: 2.9,  safe: false, idempotent: true },
    ],

    /* ── Patterns ─────────────────────────────────────────────────────── */
    patterns: [
        { pattern: '/',                     version: null, resource: 'gateway',     restScore: 20, issues: ['No version prefix','Generic RPC dispatcher','No resource nouns'], methodCount: 2 },
        { pattern: '/state/records',        version: null, resource: 'records',     restScore: 65, issues: ['No version prefix'],     methodCount: 5 },
        { pattern: '/api/story-panel/*',    version: null, resource: 'stories',     restScore: 70, issues: ['No version prefix'],     methodCount: 6 },
        { pattern: '/health/observer',      version: null, resource: 'health',      restScore: 50, issues: ['No version prefix'],     methodCount: 1 },
        { pattern: '/read-file, /write-file, /delete-file, etc.', version: null, resource: 'files', restScore: 25, issues: ['Verb in path','POST for reads','No version prefix','RPC-style'], methodCount: 9 },
        { pattern: '/wework/send-message',  version: null, resource: 'messages',    restScore: 30, issues: ['Verb in path','No version prefix'], methodCount: 1 },
        { pattern: '/cleanup-unused-images',version: null, resource: 'images',      restScore: 35, issues: ['Verb in path','No version prefix'], methodCount: 1 },
        { pattern: '/ (YiPot)',             version: null, resource: 'translate',   restScore: 10, issues: ['No resource nouns','Loopback server only','All POST'], methodCount: 3 },
        { pattern: '/mail.php (Websites)',  version: null, resource: 'mail',        restScore: 15, issues: ['File extension in path','No version prefix','No REST structure'], methodCount: 1 },
        { pattern: '/php/contact.php (Websites)', version: null, resource: 'contact', restScore: 15, issues: ['File extension in path','No version prefix','No REST structure'], methodCount: 1 },
    ],

    /* ── Security (request perspective) ────────────────────────────────── */
    security: {
        authCoverage: 0.62,
        authMechanisms: { 'X-Token': 21, 'none': 13 },
        endpointsMissingAuth: [
            { path: '/read-file',           method: 'POST', handlerFile: 'YiAi/src/api/routes/upload.py',    line: 160, authMechanism: 'none' },
            { path: '/write-file',          method: 'POST', handlerFile: 'YiAi/src/api/routes/upload.py',    line: 234, authMechanism: 'none' },
            { path: '/delete-file',         method: 'POST', handlerFile: 'YiAi/src/api/routes/upload.py',    line: 294, authMechanism: 'none' },
            { path: '/upload',              method: 'POST', handlerFile: 'YiAi/src/api/routes/upload.py',    line: 430, authMechanism: 'none' },
            { path: '/ (YiPot)',            method: 'POST', handlerFile: 'YiPot/src-tauri/src/server.rs',    line: 37,  authMechanism: 'none' },
            { path: '/translate (YiPot)',   method: 'POST', handlerFile: 'YiPot/src-tauri/src/server.rs',    line: 38,  authMechanism: 'none' },
            { path: '/ocr_recognize (YiPot)',method: 'POST', handlerFile: 'YiPot/src-tauri/src/server.rs',    line: 42,  authMechanism: 'none' },
            { path: '/mail.php (Websites)',method: 'POST', handlerFile: 'Websites/Arter/mail.php',          line: 1,   authMechanism: 'none' },
            { path: '/php/contact.php (Websites)', method: 'POST', handlerFile: 'Websites/Kasy/php/contact.php', line: 1, authMechanism: 'none' },
        ],
        rateLimitCoverage: 0.71,
        endpointsMissingRateLimit: [
            { path: '/ (YiPot)',            method: 'POST', handlerFile: 'YiPot/src-tauri/src/server.rs',    line: 37 },
            { path: '/translate (YiPot)',   method: 'POST', handlerFile: 'YiPot/src-tauri/src/server.rs',    line: 38 },
            { path: '/ocr_recognize (YiPot)',method: 'POST', handlerFile: 'YiPot/src-tauri/src/server.rs',    line: 42 },
            { path: '/mail.php (Websites)',method: 'POST', handlerFile: 'Websites/Arter/mail.php',          line: 1 },
            { path: '/php/contact.php (Websites)', method: 'POST', handlerFile: 'Websites/Kasy/php/contact.php', line: 1 },
        ],
        securityHeadersScore: 30,
        corsConfigured: true,
        inputValidationCoverage: 0.68,
        endpointsMissingValidation: [
            { path: '/ (YiPot)',            method: 'POST', handlerFile: 'YiPot/src-tauri/src/server.rs',    line: 37 },
            { path: '/health/observer',     method: 'GET',  handlerFile: 'YiAi/src/api/routes/observer_health.py', line: 45 },
            { path: '/api/story-panel/overview', method: 'GET', handlerFile: 'YiAi/src/api/routes/story_panel.py', line: 151 },
            { path: '/api/story-panel/stories', method: 'GET', handlerFile: 'YiAi/src/api/routes/story_panel.py', line: 181 },
            { path: '/api/story-panel/help',method: 'GET',  handlerFile: 'YiAi/src/api/routes/story_panel.py', line: 435 },
        ],
    },

    /* ── Health & Contracts (response perspective) ─────────────────────── */
    health: {
        errorHandlingCoverage: 0.82,
        endpointsWithoutErrorHandling: [
            { path: '/cleanup-unused-images',method: 'POST', handlerFile: 'YiAi/src/api/routes/maintenance.py', line: 204 },
            { path: '/state/records',      method: 'POST', handlerFile: 'YiAi/src/api/routes/state.py',        line: 25 },
            { path: '/state/records',      method: 'GET',  handlerFile: 'YiAi/src/api/routes/state.py',        line: 36 },
            { path: '/state/records/{key}',method: 'GET',  handlerFile: 'YiAi/src/api/routes/state.py',        line: 60 },
            { path: '/state/records/{key}',method: 'PUT',  handlerFile: 'YiAi/src/api/routes/state.py',        line: 70 },
            { path: '/state/records/{key}',method: 'DELETE',handlerFile: 'YiAi/src/api/routes/state.py',        line: 81 },
        ],
        handlerComplexity: [
            { path: '/api/story-panel/stories/sync', method: 'POST', handler: 'sync_stories', handlerFile: 'YiAi/src/api/routes/story_panel.py', line: 247, lines: 131, complexity: 'medium' },
        ],
        responseConsistencyScore: 70,
        contentNegotiationScore: 20,
        errorFormatScore: 20,
        statusCodeDistribution: { '200': 32, '201': 1, '400': 17, '401': 1, '404': 10, '500': 17 },
        paginationCoverage: 0.25,
        contractScore: 40,
    },

    /* ── Third-Party Libraries & Frameworks ─────────────────────────────── */
    thirdPartyLibraries: [
        {
            category: 'Python Backend (YiAi)',
            description: 'Async API server — FastAPI ecosystem with MongoDB, scheduling, LLM gateway, and RSS ingestion',
            items: [
                { name: 'FastAPI',          purpose: 'High-performance async web framework with auto-generated OpenAPI docs', url: 'https://fastapi.tiangolo.com/', version: '0.104+' },
                { name: 'Uvicorn',          purpose: 'ASGI server — production-grade serving for FastAPI apps', url: 'https://www.uvicorn.org/', version: '0.24+' },
                { name: 'Pydantic',         purpose: 'Data validation and settings management via Python type annotations', url: 'https://docs.pydantic.dev/', version: '2.x' },
                { name: 'Motor',            purpose: 'Async MongoDB driver — non-blocking database access for FastAPI handlers', url: 'https://motor.readthedocs.io/', version: '3.3+' },
                { name: 'PyMongo',          purpose: 'Synchronous MongoDB driver — underlying connection layer for Motor', url: 'https://pymongo.readthedocs.io/', version: '4.6+' },
                { name: 'aiohttp',          purpose: 'Async HTTP client/server — RSS fetching and external API calls', url: 'https://docs.aiohttp.org/', version: '3.9+' },
                { name: 'APScheduler',      purpose: 'Advanced job scheduler — cron and interval-based RSS refresh tasks', url: 'https://apscheduler.readthedocs.io/', version: '3.10+' },
                { name: 'feedparser',       purpose: 'Universal RSS/Atom feed parser', url: 'https://feedparser.readthedocs.io/', version: '6.0+' },
                { name: 'Ollama (Python)',  purpose: 'Local LLM client — Ollama API integration for AI features', url: 'https://github.com/ollama/ollama-python', version: '0.1+' },
                { name: 'oss2',             purpose: 'Alibaba Cloud OSS SDK — object storage for file uploads', url: 'https://www.alibabacloud.com/help/en/oss/', version: '2.18+' },
                { name: 'Typer',            purpose: 'CLI application framework — type-hint-driven command-line interfaces', url: 'https://typer.tiangolo.com/', version: '0.9+' },
                { name: 'python-multipart', purpose: 'Multipart form-data parsing for file upload endpoints', url: 'https://github.com/Kludex/python-multipart', version: '-' },
                { name: 'aiofiles',         purpose: 'Async file I/O — non-blocking file read/write operations', url: 'https://github.com/Tinche/aiofiles', version: '23.2+' },
                { name: 'tenacity',         purpose: 'Retry/backoff decorators — resilient external API calls', url: 'https://tenacity.readthedocs.io/', version: '8.2+' },
                { name: 'PyYAML',           purpose: 'YAML configuration parsing — config.yaml application settings', url: 'https://pyyaml.org/', version: '6.0+' },
            ],
        },
        {
            category: 'Python ML / Video (YiViY)',
            description: 'Video translation & dubbing platform — speech recognition, diarization, TTS, and LLM orchestration',
            items: [
                { name: 'Streamlit',           purpose: 'Web UI framework — interactive dashboards with zero frontend code', url: 'https://streamlit.io/', version: '1.49' },
                { name: 'HuggingFace Transformers', purpose: 'Pretrained NLP & speech models — WAV2VEC2, Whisper pipelines', url: 'https://huggingface.co/docs/transformers', version: '4.48+' },
                { name: 'WhisperX',            purpose: 'Word-level timestamped speech recognition with forced alignment', url: 'https://github.com/m-bain/whisperX', version: '3.8+' },
                { name: 'PyAnnote Audio',      purpose: 'Speaker diarization — multi-speaker separation and labeling', url: 'https://github.com/pyannote/pyannote-audio', version: '4.0+' },
                { name: 'PyTorch Lightning',   purpose: 'PyTorch training framework wrapper — streamlined ML pipelines', url: 'https://lightning.ai/docs/pytorch', version: '2.6' },
                { name: 'MoviePy',             purpose: 'Video editing — cutting, compositing, and subtitle overlay', url: 'https://zulko.github.io/moviepy/', version: '1.0' },
                { name: 'OpenAI (Python)',     purpose: 'OpenAI API client — GPT translation and TTS synthesis', url: 'https://github.com/openai/openai-python', version: '1.55+' },
                { name: 'CTranslate2',         purpose: 'Fast inference engine — optimized transformer model execution on GPU', url: 'https://github.com/OpenNMT/CTranslate2', version: '4.5+' },
                { name: 'spaCy',               purpose: 'NLP library — sentence splitting and linguistic analysis', url: 'https://spacy.io/', version: '3.8' },
                { name: 'librosa',             purpose: 'Audio analysis — feature extraction for speech processing', url: 'https://librosa.org/', version: '0.11' },
                { name: 'OpenCV',              purpose: 'Computer vision — video frame extraction and processing', url: 'https://opencv.org/', version: '4.11' },
                { name: 'yt-dlp',              purpose: 'Video downloading — YouTube and 1000+ site support', url: 'https://github.com/yt-dlp/yt-dlp', version: '-' },
                { name: 'Replicate',           purpose: 'ML model API client — cloud-hosted model inference', url: 'https://replicate.com/', version: '0.33' },
                { name: 'pandas',              purpose: 'Data analysis — subtitle DataFrame manipulation', url: 'https://pandas.pydata.org/', version: '2.2+' },
            ],
        },
        {
            category: 'Desktop App · Frontend (YiPot)',
            description: 'Tauri-based cross-platform desktop app — React UI with 39 translation/OCR service integrations',
            items: [
                { name: 'React',               purpose: 'Declarative UI library — component-based frontend architecture', url: 'https://react.dev/', version: '18.3' },
                { name: 'NextUI',              purpose: 'React UI component library — accessible design system with dark mode', url: 'https://nextui.org/', version: '2.4' },
                { name: 'Tailwind CSS',        purpose: 'Utility-first CSS framework — rapid styling without context switching', url: 'https://tailwindcss.com/', version: '3.4' },
                { name: 'React Router',        purpose: 'Client-side routing — declarative navigation for single-page app', url: 'https://reactrouter.com/', version: '6.27' },
                { name: 'Jotai',               purpose: 'Atomic state management — bottom-up reactive state for React', url: 'https://jotai.org/', version: '2.10' },
                { name: 'Framer Motion',       purpose: 'Declarative animation library — gesture-driven UI transitions', url: 'https://www.framer.com/motion/', version: '11.11' },
                { name: 'i18next',             purpose: 'Internationalization framework — multi-language translation UI', url: 'https://www.i18next.com/', version: '23.16' },
                { name: 'Tesseract.js',        purpose: 'Browser-based OCR engine — in-app image text recognition', url: 'https://tesseract.projectnaptha.com/', version: '5.1' },
                { name: 'crypto-js',           purpose: 'Cryptographic hashing — HMAC-SHA256 sign for 9 API services', url: 'https://github.com/brix/crypto-js', version: '4.2' },
                { name: 'jose',                purpose: 'JWT/JWS/JWE/JWK implementation — token signing and verification', url: 'https://github.com/panva/jose', version: '5.9' },
                { name: 'React Markdown',      purpose: 'Markdown rendering — translation result display in rich text', url: 'https://github.com/remarkjs/react-markdown', version: '9.0' },
            ],
        },
        {
            category: 'Desktop App · Backend (YiPot · Rust)',
            description: 'Tauri native shell — HTTP server, screen capture, clipboard, language detection, and system integration',
            items: [
                { name: 'Tauri (Rust)',        purpose: 'Desktop app framework — native window, tray, menu, and filesystem APIs', url: 'https://tauri.app/', version: '1.8' },
                { name: 'Reqwest',             purpose: 'Ergonomic HTTP client — translation API calls with connection pooling', url: 'https://docs.rs/reqwest/', version: '0.12' },
                { name: 'Serde',               purpose: 'Serialization framework — JSON request/response handling', url: 'https://serde.rs/', version: '1.0' },
                { name: 'tiny_http',           purpose: 'Embedded HTTP server — local loopback OCR/translate endpoint', url: 'https://docs.rs/tiny_http/', version: '0.12' },
                { name: 'screenshots',         purpose: 'Screen capture — screenshot-based OCR for any application', url: 'https://docs.rs/screenshots/', version: '0.7' },
                { name: 'arboard',             purpose: 'Clipboard access — cross-platform copy/paste integration', url: 'https://docs.rs/arboard/', version: '3.4' },
                { name: 'Lingua',              purpose: 'Language detection — 22-language identification without external API', url: 'https://github.com/pemistahl/lingua-rs', version: '1.6' },
                { name: 'image',               purpose: 'Image processing — format conversion and manipulation', url: 'https://docs.rs/image/', version: '0.25' },
                { name: 'base64',              purpose: 'Base64 encoding — image data serialization for API requests', url: 'https://docs.rs/base64/', version: '0.22' },
            ],
        },
        {
            category: 'Frontend Dashboards (YiDoc · Websites/Flow)',
            description: 'Vue 3 ecosystem — interactive workflow editors, API reports, and enterprise admin panels',
            items: [
                { name: 'Vue 3',               purpose: 'Progressive JavaScript framework — Composition API with reactive data binding', url: 'https://vuejs.org/', version: '3.4' },
                { name: 'LogicFlow',           purpose: 'Workflow diagram engine — visual process designer with minimap extension', url: 'https://site.logic-flow.cn/', version: '1.2' },
                { name: 'Ant Design Vue',      purpose: 'Enterprise UI component library — 60+ components for admin panels', url: 'https://antdv.com/', version: '4.x' },
                { name: 'Element Plus',        purpose: 'Vue 3 UI component library — Material Design inspired widgets', url: 'https://element-plus.org/', version: '2.7' },
                { name: 'Vite',                purpose: 'Next-gen build tool — instant HMR and optimized production builds', url: 'https://vitejs.dev/', version: '5.3' },
            ],
        },
        {
            category: 'Websites & Templates',
            description: 'Static site UI libraries — Admin dashboards, landing pages, portfolios, and blog templates',
            items: [
                { name: 'Bootstrap',           purpose: 'Responsive CSS framework — grid system and prebuilt components (v4/v5)', url: 'https://getbootstrap.com/', version: '5.2' },
                { name: 'Tailwind CSS',        purpose: 'Utility-first CSS — admin dashboards and social templates', url: 'https://tailwindcss.com/', version: '3.4' },
                { name: 'ApexCharts',          purpose: 'Interactive charting — 16 chart types for data visualization', url: 'https://apexcharts.com/', version: '3.27' },
                { name: 'Apache ECharts',      purpose: 'Declarative visualization — highly customizable interactive charts', url: 'https://echarts.apache.org/', version: '5.4' },
                { name: 'Swiper',              purpose: 'Touch slider/carousel — hardware-accelerated transitions', url: 'https://swiperjs.com/', version: '8.4' },
                { name: 'AOS',                 purpose: 'Animate on Scroll — CSS-driven scroll reveal animations', url: 'https://michalsnik.github.io/aos/', version: '2.x' },
                { name: 'FullCalendar',        purpose: 'Calendar & event management — drag-and-drop scheduling', url: 'https://fullcalendar.io/', version: '6.1' },
                { name: 'Quill',               purpose: 'Rich text editor — WYSIWYG editing with custom formats', url: 'https://quilljs.com/', version: '1.3' },
                { name: 'Dropzone',            purpose: 'File upload with drag-and-drop — image preview and progress', url: 'https://www.dropzone.dev/', version: '5.9' },
                { name: 'Fancybox',            purpose: 'Lightbox gallery — image, video, and iframe modal display', url: 'https://fancyapps.com/fancybox/', version: '3.5' },
                { name: 'anime.js',            purpose: 'Animation engine — lightweight JavaScript animation toolkit', url: 'https://animejs.com/', version: '3.0' },
                { name: 'GSAP',                purpose: 'Professional animation — high-performance SVG and DOM animations', url: 'https://greensock.com/gsap/', version: '-' },
            ],
        },
        {
            category: 'Browser Extension (YiPet)',
            description: 'Chrome extension — markdown conversion, mind map rendering, PDF generation, and data export',
            items: [
                { name: 'Mermaid',             purpose: 'Diagram & mind map rendering — flowchart, sequence, and gantt charts', url: 'https://mermaid.js.org/', version: '-' },
                { name: 'Marked',              purpose: 'Markdown parser — fast .md to HTML conversion with GFM support', url: 'https://marked.js.org/', version: '-' },
                { name: 'Turndown',            purpose: 'HTML to Markdown converter — DOM-based rich text extraction', url: 'https://github.com/mixmark-io/turndown', version: '-' },
                { name: 'html2canvas',         purpose: 'HTML screenshots — render DOM elements to canvas images', url: 'https://html2canvas.hertzen.com/', version: '1.4' },
                { name: 'jsPDF',               purpose: 'PDF generation — client-side PDF creation from HTML content', url: 'https://github.com/parallax/jsPDF', version: '2.5' },
                { name: 'SheetJS',             purpose: 'Excel read/write — xlsx export for data tables and reports', url: 'https://sheetjs.com/', version: '0.20' },
                { name: 'Leaflet',             purpose: 'Interactive maps — lightweight open-source mapping library', url: 'https://leafletjs.com/', version: '1.1' },
            ],
        },
        {
            category: 'Infrastructure & External Services',
            description: 'Cross-cutting dependencies — databases, storage, LLM serving, and containerization',
            items: [
                { name: 'MongoDB',             purpose: 'Document database — primary data store for YiAi API server', url: 'https://www.mongodb.com/docs/', version: '-' },
                { name: 'Ollama',              purpose: 'Local LLM serving — self-hosted GPT, embedding, and vision models', url: 'https://ollama.com/', version: '-' },
                { name: 'Docker',              purpose: 'Container platform — GPU-accelerated YiviY deployment with CUDA 12.4', url: 'https://docs.docker.com/', version: '-' },
                { name: 'Alibaba Cloud OSS',   purpose: 'Object storage — image upload and static asset hosting', url: 'https://www.alibabacloud.com/help/en/oss/', version: '-' },
                { name: 'Nginx',               purpose: 'Reverse proxy — SSL termination and static asset serving', url: 'https://nginx.org/en/docs/', version: '-' },
            ],
        },
    ],

    /* ── Third-Party API Integrations (Consumer-Side) ──────────────────── */
    thirdPartyIntegrations: {
        yiPot: {
            description: 'Desktop translation/OCR tool with 39 built-in service integrations',
            serviceCount: 39,
            categories: {
                translate: 21,
                recognize: 15,
                tts: 1,
                collection: 2,
            },
            authDistribution: {
                'HMAC-SHA256': 9,
                'API Key': 7,
                'None': 9,
                'OAuth2': 2,
                'MD5 Sign': 3,
                'JWT (HS256)': 1,
                'Custom': 1,
            },
            providers: ['google','openai','deepl','bing','yandex','baidu','tencent','volcengine','alibaba','caiyun','niutrans','youdao','transmart','chatglm','geminipro','ollama','lingva','ecdict','cambridge_dict','bing_dict','iflytek'],
        },
        yiviY: {
            description: 'Video dubbing platform with 12 third-party service integrations',
            serviceCount: 12,
            categories: {
                llm: 1,
                asr: 3,
                tts: 8,
            },
            authDistribution: {
                'API Key (Bearer)': 10,
                'None': 2,
            },
            providers: ['openai-compatible','whisperx','elevenlabs','azure-tts','302.ai','siliconflow','fish-audio','gpt-sovits','edge-tts'],
        },
    },

    /* ── Alerts ───────────────────────────────────────────────────────── */
    alerts: [
        {   /* P0 — security: mutation whitelist bypass */
            severity: 'P0', marker: 'P0', category: 'security',
            file: 'YiAi/src/api/routes/upload.py', line: 160,
            message: 'POST /read-file, /write-file, /delete-file, /upload — mutation/file operations bypass auth via whitelist',
            metric: 'auth whitelist',
            impact: 'Public endpoints can read/write/delete files without authentication. Data exfiltration and tampering risk.',
            effort: 'low', scoreUplift: 15,
            recommendations: [
                'Remove /read-file, /write-file, /delete-file, /upload from auth whitelist.',
                'Add X-Token validation to these endpoints when middleware_auth_enabled=true.',
                'Alternative: use scoped tokens with file-path-level ACL.',
            ],
        },
        {   /* P0 — security: X-Token disabled by default */
            severity: 'P0', marker: 'P0', category: 'security',
            file: 'YiAi/src/core/middleware.py', line: 1,
            message: 'middleware_auth_enabled defaults to False — entire API is unprotected OOTB',
            metric: 'auth disabled',
            impact: 'All endpoints are publicly accessible without auth in the default configuration.',
            effort: 'low', scoreUplift: 12,
            recommendations: [
                'Set middleware_auth_enabled=True by default.',
                'Add startup warning if auth is disabled in non-dev environments.',
            ],
        },
        {   /* P0 — validation: RPC gateway no strict schema */
            severity: 'P0', marker: 'P0', category: 'validation',
            file: 'YiAi/src/api/routes/execution.py', line: 66,
            message: 'POST / — RPC gateway accepts arbitrary module_name/method_name/parameters without whitelist validation',
            metric: 'arbitrary dispatch',
            impact: 'Any authenticated client can call any registered module method via the dispatch endpoint.',
            effort: 'medium', scoreUplift: 10,
            recommendations: [
                'Add a module/method whitelist config that restricts what can be called via dispatch.',
                'Validate parameters schema per method_name before execution.',
            ],
        },
        {   /* P0 — complexity: sync_stories handler > 100 LOC */
            severity: 'P0', marker: 'P0', category: 'complexity',
            file: 'YiAi/src/api/routes/story_panel.py', line: 247,
            message: 'POST /api/story-panel/stories/sync — handler is 131 LOC',
            metric: '131 LOC',
            impact: 'Single handler containing file I/O, config parsing, state collection — hard to test and maintain.',
            effort: 'medium', scoreUplift: 8,
            recommendations: [
                'Split into: story discovery, state collection, sync orchestration.',
                'Extract file I/O into a service layer.',
            ],
        },
        {   /* P1 — semantics: POST for reads */
            severity: 'P1', marker: 'P1', category: 'semantics',
            file: 'YiAi/src/api/routes/upload.py', line: 160,
            message: 'POST /read-file — POST used for read operation; violates RFC 7231',
            metric: 'POST for GET',
            impact: 'Caches and intermediaries cannot optimize; violates REST conventions.',
            effort: 'medium', scoreUplift: 6,
            recommendations: [
                'Change to GET /files?path={target_file} with path validation.',
                'Keep POST variant with deprecation header for backward compatibility.',
            ],
        },
        {   /* P1 — semantics: RPC-style verb paths */
            severity: 'P1', marker: 'P1', category: 'semantics',
            file: 'YiAi/src/api/routes/upload.py', line: 234,
            message: 'POST /write-file, /delete-file, /rename-file, /delete-folder, /rename-folder — RPC-style verb paths',
            metric: 'verb in path',
            impact: 'Non-standard conventions confuse API consumers and tooling.',
            effort: 'medium', scoreUplift: 8,
            recommendations: [
                'Refactor to REST: PUT/DELETE /files/{path} with semantic request bodies.',
                'Add /api/v1/files/ endpoints parallel to legacy ones.',
            ],
        },
        {   /* P1 — patterns: no API versioning */
            severity: 'P1', marker: 'P1', category: 'versioning',
            file: 'YiAi/src/main.py', line: 1,
            message: 'No API version prefix (/v1/) used anywhere — breaking changes affect all consumers',
            metric: 'no version',
            impact: 'Any breaking change (path rename, field removal) breaks YiPet, YiWeb, YiH5 simultaneously.',
            effort: 'high', scoreUplift: 10,
            recommendations: [
                'Add /api/v1/ prefix to all routes.',
                'Maintain legacy routes with 301 redirect to /api/v1/ equivalents.',
                'Version negotiation via Accept header as future enhancement.',
            ],
        },
        {   /* P1 — contracts: error format not RFC 7807 */
            severity: 'P1', marker: 'P1', category: 'contracts',
            file: 'YiAi/src/core/response.py', line: 1,
            message: 'Error responses use custom format {code, message, data} — not RFC 7807 Problem Details',
            metric: 'error format',
            impact: 'External consumers cannot reliably parse errors without custom logic.',
            effort: 'medium', scoreUplift: 6,
            recommendations: [
                'Add type, title, status, detail, instance fields to error responses.',
                'Maintain backward-compatible {code, message} alongside RFC 7807 structure.',
            ],
        },
        {   /* P1 — contracts: no pagination on story lists */
            severity: 'P1', marker: 'P1', category: 'pagination',
            file: 'YiAi/src/api/routes/story_panel.py', line: 181,
            message: 'GET /api/story-panel/stories — collection endpoint without pagination',
            metric: 'no pagination',
            impact: 'Response size grows linearly with story count; no limit or cursor.',
            effort: 'low', scoreUplift: 5,
            recommendations: [
                'Add page/page_size query params with sensible defaults (page=1, size=20).',
                'Include Link headers for HATEOAS-style navigation.',
            ],
        },
        {   /* P1 — validation: observer health no body validation */
            severity: 'P1', marker: 'P1', category: 'validation',
            file: 'YiAi/src/api/routes/observer_health.py', line: 45,
            message: 'GET /health/observer — no input validation on any dimension',
            metric: 'no validation',
            impact: 'Low risk (read-only), but inconsistent with other GET endpoints.',
            effort: 'low', scoreUplift: 3,
            recommendations: [
                'Add explicit None-schema to make validation intent clear.',
                'Consider adding rate limit token consumption tracking.',
            ],
        },
        {   /* P1 — error_handling: state routes no try/catch */
            severity: 'P1', marker: 'P1', category: 'error_handling',
            file: 'YiAi/src/api/routes/state.py', line: 25,
            message: 'All 5 /state/records routes lack explicit try/catch in handler body',
            metric: 'no error wrap',
            impact: 'Relies solely on global exception handler; any non-BusinessException may cause 500.',
            effort: 'low', scoreUplift: 4,
            recommendations: [
                'Wrap state route handlers in try/catch for explicit error categorization.',
                'Add specific error codes for database connection failures vs data not found.',
            ],
        },
        {   /* P2 — security: YiPot server no auth on mutation */
            severity: 'P2', marker: 'P2', category: 'security',
            file: 'YiPot/src-tauri/src/server.rs', line: 37,
            message: 'YiPot HTTP server /translate, /ocr_recognize — no auth, rate limit, or validation',
            metric: 'no auth',
            impact: 'Local-only server — risk is limited to local process exploitation.',
            effort: 'low', scoreUplift: 3,
            recommendations: [
                'Bind only to 127.0.0.1 (already done).',
                'Add token validation header check for local automation tools.',
            ],
        },
        {   /* P2 — patterns: Websites PHP mailers */
            severity: 'P2', marker: 'P2', category: 'pattern',
            file: 'Websites/Arter/mail.php', line: 1,
            message: 'Static site PHP mailers — no CSRF, no rate limit, no input sanitization beyond mail()',
            metric: 'static mailers',
            impact: 'Open spam relays if deployed without additional protections.',
            effort: 'low', scoreUplift: 3,
            recommendations: [
                'Add CSRF token validation.',
                'Add reCAPTCHA integration.',
                'Add rate limiting per IP.',
            ],
        },
        {   /* P2 — contracts: no Content-Type negotiation */
            severity: 'P2', marker: 'P2', category: 'contracts',
            file: 'YiAi/src/core/middleware.py', line: 1,
            message: 'No Accept header negotiation — all responses are application/json regardless of client preference',
            metric: 'no negotiation',
            impact: 'API cannot serve alternative formats (XML, protobuf) without code changes.',
            effort: 'low', scoreUplift: 2,
            recommendations: [
                'Add Accept header check in middleware; return 406 for unsupported types.',
                'Document supported content types in API docs.',
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
            tooling: [{ name: 'fastapi.security', hint: 'Auth dependency injection' }],
            preventiveControls: ['CI: lint rule blocks routes without auth.', 'Code review checklist: verify auth on new routes.'],
            rollbackPlan: 'Revert middleware addition; no API contract change.',
        },
        validation: {
            risk: 'Untrusted input reaches business logic — injection, corruption, crashes.',
            blastRadius: 'request body → downstream services',
            estimatedHours: 3,
            acceptance: ['Input schema added for the request.', 'Invalid input returns 400 with structured error.'],
            firstStep: 'Add Pydantic model for the request body/params.',
            tooling: [{ name: 'pydantic', hint: 'Type-first schema validation for FastAPI' }],
            preventiveControls: ['CI: require validation on all POST/PUT/PATCH requests.', 'OpenAPI schema enforcement.'],
            rollbackPlan: 'Revert validation addition; remove the schema import.',
        },
        error_handling: {
            risk: 'Unhandled errors may crash the process or leak stack traces.',
            blastRadius: 'single request → cascading failure',
            estimatedHours: 2,
            acceptance: ['Handler wrapped in try/catch or global handler covers it.', 'Error responses are structured JSON.'],
            firstStep: 'Wrap handler body in try/catch with BusinessException for known failures.',
            tooling: [{ name: 'FastAPI exception handlers', hint: 'Global exception handling with custom error codes' }],
            preventiveControls: ['CI: ensure all routes register on the global exception handler.', 'Shared error codes documented.'],
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
            tooling: [{ name: 'radon', hint: 'Python code complexity analysis' }],
            preventiveControls: ['CI: fail PRs adding >100 LOC to handlers over 500 LOC.', 'CODEOWNERS for large handlers.'],
            rollbackPlan: 'Revert split; barrel re-exports original handler.',
        },
        versioning: {
            risk: 'Breaking changes affect all consumers without versioning.',
            blastRadius: 'all API consumers',
            estimatedHours: 10,
            acceptance: ['Version prefix added.', 'Legacy routes redirected.', 'Documentation updated.'],
            firstStep: 'Add /api/v1/ prefix; deprecate unversioned routes with 301 redirect.',
            tooling: [{ name: 'FastAPI APIRouter prefix', hint: 'Add prefix="/api/v1" to all routers' }],
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
            tooling: [{ name: 'OpenAPI', hint: 'generate and enforce API contracts' }, { name: 'pydantic', hint: 'schema-first validation' }],
            preventiveControls: ['CI: validate response schemas in tests.', 'Contract-first API design workflow.'],
            rollbackPlan: 'Revert schema changes; restore original response shapes.',
        },
        pagination: {
            risk: 'Unpaginated collections risk response bloat, timeout, and memory exhaustion.',
            blastRadius: 'all collection consumers',
            estimatedHours: 3,
            acceptance: ['Pagination added with reasonable defaults.', 'Max limit enforced.', 'Consistent style across collections.'],
            firstStep: 'Add pagination params (page/page_size) to the collection handler.',
            tooling: [{ name: 'fastapi-pagination', hint: 'pagination utilities for FastAPI' }],
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
