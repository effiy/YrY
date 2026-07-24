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
        generatedAt: '2026-07-24T10:00:00Z',
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
    scope: 'YiviY/',
    score: 0,

    summary: {
        totalRequests: 0,
        totalHandlers: 0,
        totalMethods: {},
        authCoverage: 0,
        validationDepthCoverage: 0,
        errorHandlingCoverage: 0,
        deprecatedCount: 0,
        criticalCount: 0,
        maxHandlerLines: 0,
        dominantResponseFormat: null,
        dominantAuthMechanism: null,
        semanticsScore: 0,
        contractScore: 0,
        methodMisuseCount: 0,
        paginationCoverage: 0,
        rfc7807ComplianceScore: 0,
        note: 'No HTTP API endpoints detected in this project\'s source. Project is a Streamlit application with no direct HTTP route exposure. The codebase (st.py, core/, batch/) exposes no FastAPI/Flask route decorators, no @app.route/@api_view, and no st_api definitions. External API call sites exist (requests/httpx to OpenAI TTS, Fish TTS, GPT-SoVITS, ElevenLabs ASR, PyPI) but these are egress-only clients and are not inventoried as ingress endpoints per the methodology.',
    },

    /* ── Request inventory (ingress → processing → egress → contract) ─── */
    endpoints: [],

    /* ── HTTP Semantics ───────────────────────────────────────────────── */
    semantics: {
        score: 0,
        safeCount: 0,
        unsafeCount: 0,
        idempotentCount: 0,
        nonIdempotentCount: 0,
        methodMisuse: [],
        methodCorrectness: [],
    },

    /* ── Method distribution ───────────────────────────────────────────── */
    methods: [],

    /* ── Patterns ─────────────────────────────────────────────────────── */
    patterns: [],

    /* ── Security (request perspective) ────────────────────────────────── */
    security: {
        authCoverage: 0,
        authMechanisms: {},
        endpointsMissingAuth: [],
        rateLimitCoverage: 0,
        endpointsMissingRateLimit: [],
        securityHeadersScore: 0,
        corsConfigured: false,
        inputValidationCoverage: 0,
        endpointsMissingValidation: [],
    },

    /* ── Health & Contracts (response perspective) ─────────────────────── */
    health: {
        errorHandlingCoverage: 0,
        endpointsWithoutErrorHandling: [],
        handlerComplexity: [],
        responseConsistencyScore: 0,
        contentNegotiationScore: 0,
        errorFormatScore: 0,
        statusCodeDistribution: {},
        paginationCoverage: 0,
        contractScore: 0,
    },

    /* ── Alerts ───────────────────────────────────────────────────────── */
    alerts: [],

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
