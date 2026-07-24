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
        generatedAt: '2026-07-24T00:00:00Z', /* ISO 8601 UTC — filled in by the analyzer */
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
 * Runtime analysis data for YiPot (Tauri + tiny_http desktop app).
 * Scope covers src-tauri/ Rust command handlers and the local tiny_http
 * bridge, plus the React frontend invoke() call sites.
 *
 * Every endpoint is framed by the HTTP request lifecycle:
 *   ingress → processing → egress → contract
 */
window.REPORT_DATA = {
    scope: 'YiPot/',
    score: 34,

    summary: {
        totalRequests: 27,
        totalHandlers: 27,
        totalMethods: { IPC: 20, POST: 7 },
        authCoverage: 0.0,
        validationDepthCoverage: 0.74,
        errorHandlingCoverage: 0.44,
        deprecatedCount: 0,
        criticalCount: 5,
        maxHandlerLines: 104,
        dominantResponseFormat: 'JSON',
        dominantAuthMechanism: 'none',
        semanticsScore: 30,
        contractScore: 20,
        methodMisuseCount: 0,
        paginationCoverage: 0.0,
        rfc7807ComplianceScore: 0,
        note: 'YiPot is a Tauri 1.8 desktop app. The "API surface" is 20 Tauri IPC commands (Rust #[tauri::command] handlers) plus 7 local tiny_http routes on 127.0.0.1:60828. No remote HTTP server, no auth layer, no OpenAPI spec. Frontend invokes commands via @tauri-apps/api/tauri invoke().',
    },

    /* ── Request inventory (ingress → processing → egress → contract) ─── */
    endpoints: [
        /* ── tiny_http local HTTP bridge (port 60828) ───────────────────── */
        { path: '/',                    method: 'POST', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['text/plain'], rateLimited: false, handler: 'server.handle_translate',        handlerFile: 'src-tauri/src/server.rs', line: 37, middleware: [],                  errorHandling: false, statusCodes: [200],         responseFormat: 'text', errorFormat: 'none',     paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 6,   deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/config',              method: 'POST', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['text/plain'], rateLimited: false, handler: 'server.handle_config',          handlerFile: 'src-tauri/src/server.rs', line: 38, middleware: [],                  errorHandling: true,  statusCodes: [200],         responseFormat: 'text', errorFormat: 'none',     paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 4,   deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/translate',           method: 'POST', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['text/plain'], rateLimited: false, handler: 'server.handle_translate',       handlerFile: 'src-tauri/src/server.rs', line: 39, middleware: [],                  errorHandling: false, statusCodes: [200],         responseFormat: 'text', errorFormat: 'none',     paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 6,   deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/selection_translate', method: 'POST', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['text/plain'], rateLimited: false, handler: 'server.handle_selection_translate', handlerFile: 'src-tauri/src/server.rs', line: 40, middleware: [],              errorHandling: true,  statusCodes: [200],         responseFormat: 'text', errorFormat: 'none',     paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 4,   deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/input_translate',     method: 'POST', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['text/plain'], rateLimited: false, handler: 'server.handle_input_translate', handlerFile: 'src-tauri/src/server.rs', line: 41, middleware: [],                errorHandling: true,  statusCodes: [200],         responseFormat: 'text', errorFormat: 'none',     paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 4,   deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/ocr_recognize',       method: 'POST', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['text/plain'], rateLimited: false, handler: 'server.handle_ocr_recognize',   handlerFile: 'src-tauri/src/server.rs', line: 42, middleware: [],                errorHandling: true,  statusCodes: [200],         responseFormat: 'text', errorFormat: 'none',     paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 7,   deprecated: false, version: null, hasOpenApiSpec: false },
        { path: '/ocr_translate',       method: 'POST', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: true,  headers: false }, contentTypes: ['text/plain'], rateLimited: false, handler: 'server.handle_ocr_translate',   handlerFile: 'src-tauri/src/server.rs', line: 43, middleware: [],                errorHandling: true,  statusCodes: [200],         responseFormat: 'text', errorFormat: 'none',     paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 7,   deprecated: false, version: null, hasOpenApiSpec: false },

        /* ── Tauri IPC commands (#[tauri::command]) ─────────────────────── */
        { path: 'invoke://reload_store',                method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'cmd.reload_store',                handlerFile: 'src-tauri/src/cmd.rs',        line: 16,  middleware: [], errorHandling: true,  statusCodes: [200],            responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 5,   deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://get_text',                    method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'cmd.get_text',                    handlerFile: 'src-tauri/src/cmd.rs',        line: 11,  middleware: [], errorHandling: true,  statusCodes: [200],            responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 3,   deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://cut_image',                   method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: true,  params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'cmd.cut_image',                   handlerFile: 'src-tauri/src/cmd.rs',        line: 23,  middleware: [], errorHandling: true,  statusCodes: [200, 500],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 27,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://get_base64',                  method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'cmd.get_base64',                  handlerFile: 'src-tauri/src/cmd.rs',        line: 52,  middleware: [], errorHandling: true,  statusCodes: [200],            responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 23,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://copy_img',                    method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: true,  params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'cmd.copy_img',                    handlerFile: 'src-tauri/src/cmd.rs',        line: 77,  middleware: [], errorHandling: true,  statusCodes: [200, 500],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 19,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://set_proxy',                   method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'cmd.set_proxy',                   handlerFile: 'src-tauri/src/cmd.rs',        line: 98,  middleware: [], errorHandling: true,  statusCodes: [200, 500],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 21,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://unset_proxy',                 method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'cmd.unset_proxy',                 handlerFile: 'src-tauri/src/cmd.rs',        line: 121, middleware: [], errorHandling: true,  statusCodes: [200, 500],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: false, idempotent: true,  handlerLines: 7,   deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://install_plugin',              method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'cmd.install_plugin',              handlerFile: 'src-tauri/src/cmd.rs',        line: 130, middleware: [], errorHandling: true,  statusCodes: [200, 500],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 46,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://run_binary',                  method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: true,  params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'cmd.run_binary',                  handlerFile: 'src-tauri/src/cmd.rs',        line: 178, middleware: [], errorHandling: true,  statusCodes: [200, 500],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 30,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://font_list',                   method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'cmd.font_list',                   handlerFile: 'src-tauri/src/cmd.rs',        line: 210, middleware: [], errorHandling: true,  statusCodes: [200, 500],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 5,   deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://open_devtools',               method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'cmd.open_devtools',               handlerFile: 'src-tauri/src/cmd.rs',        line: 218, middleware: [], errorHandling: true,  statusCodes: [200],            responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 7,   deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://system_ocr',                  method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: true,  params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'system_ocr.system_ocr',           handlerFile: 'src-tauri/src/system_ocr.rs', line: 3,   middleware: [], errorHandling: true,  statusCodes: [200, 500],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 150, deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://lang_detect',                method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: true,  params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'lang_detect.lang_detect',         handlerFile: 'src-tauri/src/lang_detect.rs', line: 31,  middleware: [], errorHandling: true,  statusCodes: [200, 500],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: true,  idempotent: true,  handlerLines: 55,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://screenshot',                 method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: true,  params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'screenshot.screenshot',           handlerFile: 'src-tauri/src/screenshot.rs',  line: 3,   middleware: [], errorHandling: false, statusCodes: [200],            responseFormat: 'JSON', errorFormat: 'none',    paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 28,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://register_shortcut_by_frontend', method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: true, params: true, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'hotkey.register_shortcut_by_frontend', handlerFile: 'src-tauri/src/hotkey.rs', line: 73, middleware: [], errorHandling: true,  statusCodes: [200, 500],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 26,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://update_tray',                method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: true,  params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'tray.update_tray',                handlerFile: 'src-tauri/src/tray.rs',        line: 17,  middleware: [], errorHandling: true,  statusCodes: [200, 500],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 80,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://updater_window',             method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: false, params: false, query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'window.updater_window',           handlerFile: 'src-tauri/src/window.rs',      line: 403, middleware: [], errorHandling: true,  statusCodes: [200],            responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 8,   deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://webdav',                     method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: true,  params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'backup.webdav',                   handlerFile: 'src-tauri/src/backup.rs',      line: 10,  middleware: [], errorHandling: true,  statusCodes: [200, 500],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 104, deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://local',                      method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: true,  params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'backup.local',                    handlerFile: 'src-tauri/src/backup.rs',       line: 115, middleware: [], errorHandling: true,  statusCodes: [200, 500],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 62,  deprecated: false, version: null, hasOpenApiSpec: false },
        { path: 'invoke://aliyun',                     method: 'IPC', auth: false, authMechanism: 'none', validationDepth: { body: true,  params: true,  query: false, headers: false }, contentTypes: ['application/json'], rateLimited: false, handler: 'backup.aliyun',                   handlerFile: 'src-tauri/src/backup.rs',       line: 178, middleware: [], errorHandling: true,  statusCodes: [200, 500],      responseFormat: 'JSON', errorFormat: 'custom',  paginationStyle: 'none', safe: false, idempotent: false, handlerLines: 32,  deprecated: false, version: null, hasOpenApiSpec: false },
    ],

    /* ── HTTP Semantics ───────────────────────────────────────────────── */
    semantics: {
        score: 30,
        safeCount: 4,
        unsafeCount: 23,
        idempotentCount: 7,
        nonIdempotentCount: 20,
        methodMisuse: [],
        methodCorrectness: [
            { method: 'IPC',  total: 20, correct: 20, misuse: 0 },
            { method: 'POST', total: 7,  correct: 7,  misuse: 0 },
        ],
    },

    /* ── Method distribution ───────────────────────────────────────────── */
    methods: [
        { method: 'IPC',  count: 20, pct: 74.1, safe: false, idempotent: false },
        { method: 'POST', count: 7,  pct: 25.9, safe: false, idempotent: false },
    ],

    /* ── Patterns ─────────────────────────────────────────────────────── */
    patterns: [
        { pattern: 'invoke://reload_store',                  version: null, resource: 'cmd',         restScore: 25, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://get_text',                     version: null, resource: 'cmd',         restScore: 25, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://cut_image',                    version: null, resource: 'cmd',         restScore: 20, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://get_base64',                   version: null, resource: 'cmd',         restScore: 25, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://copy_img',                     version: null, resource: 'cmd',         restScore: 20, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://set_proxy',                    version: null, resource: 'cmd',         restScore: 20, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://unset_proxy',                  version: null, resource: 'cmd',         restScore: 20, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://install_plugin',               version: null, resource: 'cmd',         restScore: 20, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth', 'Zip extraction without path traversal guard'], methodCount: 1 },
        { pattern: 'invoke://run_binary',                   version: null, resource: 'cmd',         restScore: 15, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth', 'Arbitrary binary execution'], methodCount: 1 },
        { pattern: 'invoke://font_list',                    version: null, resource: 'cmd',         restScore: 25, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://open_devtools',                version: null, resource: 'cmd',         restScore: 20, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://system_ocr',                   version: null, resource: 'system_ocr', restScore: 25, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://lang_detect',                  version: null, resource: 'lang_detect', restScore: 25, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://screenshot',                   version: null, resource: 'screenshot',  restScore: 20, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://register_shortcut_by_frontend', version: null, resource: 'hotkey',     restScore: 15, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://update_tray',                  version: null, resource: 'tray',        restScore: 20, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://updater_window',               version: null, resource: 'window',     restScore: 20, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://webdav',                       version: null, resource: 'backup',     restScore: 20, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth', 'Credentials passed via IPC'], methodCount: 1 },
        { pattern: 'invoke://local',                        version: null, resource: 'backup',     restScore: 25, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: 'invoke://aliyun',                      version: null, resource: 'backup',     restScore: 20, issues: ['RPC-style verb_noun name', 'No version prefix', 'No auth', 'Remote URL fetch without validation'], methodCount: 1 },
        { pattern: '/',                                     version: null, resource: 'translate',   restScore: 25, issues: ['Verb in path', 'No version prefix', 'No auth', 'Plain text response'], methodCount: 1 },
        { pattern: '/config',                                version: null, resource: 'config',     restScore: 30, issues: ['No version prefix', 'No auth'], methodCount: 1 },
        { pattern: '/translate',                             version: null, resource: 'translate',  restScore: 25, issues: ['No version prefix', 'No auth', 'Plain text response'], methodCount: 1 },
        { pattern: '/selection_translate',                  version: null, resource: 'translate',  restScore: 20, issues: ['Verb in path', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: '/input_translate',                       version: null, resource: 'translate',  restScore: 20, issues: ['Verb in path', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: '/ocr_recognize',                        version: null, resource: 'ocr',       restScore: 20, issues: ['Verb in path', 'No version prefix', 'No auth'], methodCount: 1 },
        { pattern: '/ocr_translate',                        version: null, resource: 'ocr',       restScore: 20, issues: ['Verb in path', 'No version prefix', 'No auth'], methodCount: 1 },
    ],

    /* ── Security (request perspective) ────────────────────────────────── */
    security: {
        authCoverage: 0.0,
        authMechanisms: { none: 27 },
        endpointsMissingAuth: [
            { path: '/',                     method: 'POST', handlerFile: 'src-tauri/src/server.rs', line: 37, authMechanism: 'none' },
            { path: '/translate',            method: 'POST', handlerFile: 'src-tauri/src/server.rs', line: 39, authMechanism: 'none' },
            { path: '/selection_translate',  method: 'POST', handlerFile: 'src-tauri/src/server.rs', line: 40, authMechanism: 'none' },
            { path: '/input_translate',       method: 'POST', handlerFile: 'src-tauri/src/server.rs', line: 41, authMechanism: 'none' },
            { path: '/ocr_recognize',        method: 'POST', handlerFile: 'src-tauri/src/server.rs', line: 42, authMechanism: 'none' },
            { path: '/ocr_translate',        method: 'POST', handlerFile: 'src-tauri/src/server.rs', line: 43, authMechanism: 'none' },
            { path: 'invoke://run_binary',   method: 'IPC',  handlerFile: 'src-tauri/src/cmd.rs',   line: 178, authMechanism: 'none' },
            { path: 'invoke://install_plugin', method: 'IPC', handlerFile: 'src-tauri/src/cmd.rs', line: 130, authMechanism: 'none' },
            { path: 'invoke://webdav',       method: 'IPC',  handlerFile: 'src-tauri/src/backup.rs', line: 10, authMechanism: 'none' },
            { path: 'invoke://aliyun',       method: 'IPC',  handlerFile: 'src-tauri/src/backup.rs', line: 178, authMechanism: 'none' },
        ],
        rateLimitCoverage: 0.0,
        endpointsMissingRateLimit: [
            { path: '/',                method: 'POST', handlerFile: 'src-tauri/src/server.rs', line: 37 },
            { path: '/translate',       method: 'POST', handlerFile: 'src-tauri/src/server.rs', line: 39 },
            { path: '/ocr_recognize',   method: 'POST', handlerFile: 'src-tauri/src/server.rs', line: 42 },
            { path: 'invoke://run_binary', method: 'IPC', handlerFile: 'src-tauri/src/cmd.rs', line: 178 },
        ],
        securityHeadersScore: 0,
        corsConfigured: false,
        inputValidationCoverage: 0.74,
        endpointsMissingValidation: [
            { path: '/',                method: 'POST', handlerFile: 'src-tauri/src/server.rs', line: 37 },
            { path: '/translate',       method: 'POST', handlerFile: 'src-tauri/src/server.rs', line: 39 },
            { path: 'invoke://screenshot', method: 'IPC', handlerFile: 'src-tauri/src/screenshot.rs', line: 3 },
        ],
    },

    /* ── Health & Contracts (response perspective) ─────────────────────── */
    health: {
        errorHandlingCoverage: 0.44,
        endpointsWithoutErrorHandling: [
            { path: '/',                 method: 'POST', handlerFile: 'src-tauri/src/server.rs', line: 37 },
            { path: '/translate',        method: 'POST', handlerFile: 'src-tauri/src/server.rs', line: 39 },
            { path: 'invoke://screenshot', method: 'IPC', handlerFile: 'src-tauri/src/screenshot.rs', line: 3 },
            { path: 'invoke://get_base64', method: 'IPC', handlerFile: 'src-tauri/src/cmd.rs', line: 52 },
        ],
        handlerComplexity: [],
        responseConsistencyScore: 40,
        contentNegotiationScore: 0,
        errorFormatScore: 0,
        statusCodeDistribution: { '200': 23, '500': 4 },
        paginationCoverage: 0.0,
        contractScore: 20,
    },

    /* ── Alerts ───────────────────────────────────────────────────────── */
    alerts: [
        {   /* P0 — security: local HTTP server has no auth */
            severity: 'P0', marker: 'P0', category: 'security',
            file: 'src-tauri/src/server.rs', line: 34,
            message: 'tiny_http server on 127.0.0.1:60828 exposes translate/OCR routes with no auth — any local process can invoke',
            metric: 'no auth + open listener',
            impact: 'Any local process can trigger translation, OCR, and window actions; clipboard and screenshot data can be exfiltrated.',
            effort: 'medium', scoreUplift: 15,
            recommendations: [
                'Bind to a Unix domain socket or require a per-session token in an Authorization header.',
                'Validate the Host header and reject cross-origin requests explicitly.',
                'Add allow-list of route names; return 403 for unknown callers.',
            ],
        },
        {   /* P0 — security: run_binary executes arbitrary binary */
            severity: 'P0', marker: 'P0', category: 'security',
            file: 'src-tauri/src/cmd.rs', line: 178,
            message: 'invoke://run_binary spawns an arbitrary binary with caller-supplied cmd_name and args — no auth, no allow-list',
            metric: 'arbitrary exec',
            impact: 'Compromised frontend or plugin can execute any binary on the user’s machine with the app’s privileges.',
            effort: 'high', scoreUplift: 12,
            recommendations: [
                'Restrict cmd_name to a hash-allow-list of known plugin binaries.',
                'Sandbox the working directory and pass args through a sanitisation layer.',
                'Require explicit user consent per plugin install.',
            ],
        },
        {   /* P0 — validation: install_plugin extracts zip without traversal guard */
            severity: 'P0', marker: 'P0', category: 'validation',
            file: 'src-tauri/src/cmd.rs', line: 130,
            message: 'invoke://install_plugin extracts a .potext zip archive without path traversal validation',
            metric: 'zip-slip',
            impact: 'A malicious plugin archive can write files outside the plugin directory (zip-slip), achieving arbitrary code placement.',
            effort: 'medium', scoreUplift: 10,
            recommendations: [
                'Validate every entry path with canonicalize() and confirm it stays inside the plugin directory.',
                'Reject absolute paths and ../ sequences in zip entries.',
                'Sign plugin archives and verify the signature before extraction.',
            ],
        },
        {   /* P0 — security: webdav passes credentials through unauthenticated IPC */
            severity: 'P0', marker: 'P0', category: 'security',
            file: 'src-tauri/src/backup.rs', line: 10,
            message: 'invoke://webdav accepts username/password via IPC and performs network operations with no auth gate',
            metric: 'credential IPC',
            impact: 'Any local process can invoke webdav to enumerate or overwrite backups, or exfiltrate stored WebDAV credentials.',
            effort: 'medium', scoreUplift: 8,
            recommendations: [
                'Store WebDAV credentials in the OS keychain and never accept them as IPC args.',
                'Add an explicit user-gesture confirmation before network operations.',
                'Audit backup operations in an append-only log.',
            ],
        },
        {   /* P0 — error_handling: HTTP routes unwrap() reader, can panic */
            severity: 'P0', marker: 'P0', category: 'error_handling',
            file: 'src-tauri/src/server.rs', line: 59,
            message: 'handle_translate calls request.as_reader().read_to_string().unwrap() — malformed body crashes the server thread',
            metric: 'unwrap panic',
            impact: 'A single malformed request body terminates the http_handle thread; the local server stops responding for all routes.',
            effort: 'low', scoreUplift: 6,
            recommendations: [
                'Replace unwrap() with match and return a 400 on read failure.',
                'Wrap http_handle in a recover closure so panics do not kill the thread.',
                'Add length-limit to the reader before reading to avoid memory exhaustion.',
            ],
        },
        {   /* P1 — contracts: HTTP server returns plain "ok" text, not JSON */
            severity: 'P1', marker: 'P1', category: 'contracts',
            file: 'src-tauri/src/server.rs', line: 92,
            message: 'All HTTP routes respond with the plain text "ok" — inconsistent with IPC JSON responses',
            metric: 'format inconsistency',
            impact: 'Consumers cannot reliably parse responses; no machine-readable status or error payload.',
            effort: 'low', scoreUplift: 5,
            recommendations: [
                'Return a JSON envelope { ok: true } from response_ok.',
                'Document the response contract in an OpenAPI spec.',
            ],
        },
        {   /* P1 — validation: /translate reads body with no schema */
            severity: 'P1', marker: 'P1', category: 'validation',
            file: 'src-tauri/src/server.rs', line: 57,
            message: 'POST /translate reads raw body into text_translate with no length or charset validation',
            metric: 'no validation',
            impact: 'Oversized or non-UTF-8 payloads can trigger panics or consume memory.',
            effort: 'low', scoreUplift: 4,
            recommendations: [
                'Enforce a max body size before read_to_string.',
                'Validate UTF-8 and reject with 400 on failure.',
            ],
        },
        {   /* P1 — versioning: no version prefix on HTTP routes or IPC commands */
            severity: 'P1', marker: 'P1', category: 'versioning',
            file: 'src-tauri/src/server.rs', line: 37,
            message: 'HTTP routes (/translate, /ocr_recognize, …) have no version prefix — breaking changes have no migration path',
            metric: 'no version',
            impact: 'Future route changes break existing local integrations without notice.',
            effort: 'medium', scoreUplift: 5,
            recommendations: [
                'Prefix routes with /v1/ and redirect unversioned routes.',
                'Version the IPC command namespace with a major-version suffix on breaking changes.',
            ],
        },
        {   /* P1 — pattern: RPC-style verb_noun names across all IPC commands */
            severity: 'P1', marker: 'P1', category: 'pattern',
            file: 'src-tauri/src/cmd.rs', line: 11,
            message: 'All 20 IPC commands use RPC-style verb_noun names (get_text, cut_image, run_binary, …) — no resource model',
            metric: 'REST score 20',
            impact: 'No consistent resource model; hard to evolve, document, or generate client bindings.',
            effort: 'high', scoreUplift: 6,
            recommendations: [
                'Group commands by resource (clipboard.read, clipboard.write, image.cut, plugin.install).',
                'Publish a JSON schema for each command’s args and return type.',
            ],
        },
        {   /* P1 — security: aliyun fetches remote URL without validation */
            severity: 'P1', marker: 'P1', category: 'security',
            file: 'src-tauri/src/backup.rs', line: 178,
            message: 'invoke://aliyun performs reqwest GET/PUT on a caller-supplied url with no scheme or host validation',
            metric: 'SSRF',
            impact: 'A malicious caller can drive the app to fetch internal or metadata URLs (SSRF).',
            effort: 'medium', scoreUplift: 5,
            recommendations: [
                'Allow-list the aliyun host and reject anything else.',
                'Block link-local and private ranges except for the configured endpoint.',
            ],
        },
        {   /* P2 — security: no rate limiting on local HTTP server */
            severity: 'P2', marker: 'P2', category: 'security',
            file: 'src-tauri/src/server.rs', line: 8,
            message: 'Local HTTP server has no rate limiting — tight loops can starve the single thread',
            metric: 'no rate limit',
            impact: 'Local flood can starve the server thread and degrade the desktop experience.',
            effort: 'low', scoreUplift: 3,
            recommendations: [
                'Add a simple per-second cap in the incoming loop.',
                'Reject requests exceeding the cap with 429.',
            ],
        },
        {   /* P2 — contracts: no OpenAPI spec for any endpoint */
            severity: 'P2', marker: 'P2', category: 'contracts',
            file: 'src-tauri/src/cmd.rs', line: 11,
            message: 'No OpenAPI/Swagger spec exists for IPC commands or HTTP routes — contract is implicit in Rust types only',
            metric: 'no spec',
            impact: 'Consumers and tooling cannot introspect the API surface; drift between frontend invoke() and Rust signatures is undetected.',
            effort: 'medium', scoreUplift: 4,
            recommendations: [
                'Generate a JSON schema for each #[tauri::command] signature.',
                'Publish the schema alongside the build; consume it from a frontend type generator.',
            ],
        },
        {   /* P2 — error_handling: screenshot command uses unwrap() on capture/write */
            severity: 'P2', marker: 'P2', category: 'error_handling',
            file: 'src-tauri/src/screenshot.rs', line: 24,
            message: 'invoke://screenshot uses unwrap() on screen.capture() and fs::write — panics propagate to the frontend',
            metric: 'unwrap panic',
            impact: 'Capture failures crash the command and leak a Rust panic string to the frontend.',
            effort: 'low', scoreUplift: 3,
            recommendations: [
                'Return Result<String, String> and surface a human-readable error.',
                'Log capture failures with the log crate.',
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
