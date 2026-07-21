/**
 * rui-report-files — Static configuration
 * ----------------------------------------------------------------------
 * window.REPORT_CONFIG provides static labels and options. Runtime data
 * lives in window.REPORT_DATA.
 *
 * Generated: 2026-07-21
 * Scope: YiAi/, YiDoc/, YiH5/, YiPet/, YiWeb/, YiPot/
 *
 * Design principles:
 *   - Labels are technical, precise, and self-contained.
 *   - All visible text lives here so the Vue layer is a pure renderer.
 *   - Token references (--rui-*) are preferred over hardcoded values.
 */

window.REPORT_CONFIG = {
    options: {
        topN: 20,
        noCycles: false,
        theme: 'dark',
        generatedAt: '2026-07-21T04:15:00.000Z',
    },
    constants: {
        filterDebounceMs: 200,
        componentReadyTimeoutMs: 5000,
        csvHeader: 'path,bytes,lines,type,fanIn,fanOut,extDeps,maxDepth,lastModified,ageDays',
    },
    labels: {
        title:            'rui-report-files',
        footerMethodology:'Methodology: references/methodology.md · contracts: rules/analysis-contracts.md · template: templates/report/',
        sectionSummary:    'Summary',
        sectionSize:       'Size',
        sectionLargest:    'Largest Files',
        sectionCoupling:   'Coupling',
        sectionRisk:       'Risk Files',
        sectionHealth:     'Health',
        tabTreemap:    'Treemap',
        tabTypes:      'Types',
        tabHistogram:  'Histogram',
        tabFanin:      'Fan-in',
        tabFanout:     'Fan-out',
        tabHotspots:   'Hotspots',
        tabOrphans:    'Orphans',
        tabDepth:      'Depth',
        tabCycles:     'Cycles',
        tabFreshness:  'Freshness',
        summaryTotalFiles:   'Total Files',
        summaryTotalSize:    'Total Size',
        depthMax:        'Max',
        depthMean:       'Mean',
        depthMedian:     'Median',
        depthP90:        'P90',
        depthFilesAtMax: 'Files at Max',
        freshnessAsOf:    'Anchor (newest mtime)',
        freshnessMaxAge:  'Max Age',
        freshnessMedian:  'Median Age',
        freshnessP90:     'P90 Age',
        freshnessStale:   'Stale (≥180d)',
        colPath:     'Path',
        colBytes:    'Bytes',
        colPct:      '% Total',
        colLines:    'Lines',
        colType:     'Type',
        colDepth:    'Depth',
        colFanIn:    'Fan-in',
        colFanOut:   'Fan-out',
        colExt:      'Ext',
        colScore:    'Score',
        colFiles:    'Files',
        colPctFiles: '% Files',
        colPctBytes: '% Bytes',
        colAge:           'Age (days)',
        colLastModified:  'Last Modified',
        emptyTreemap:   'No directories under scope.',
        emptyTypes:     'No file types collected.',
        emptyHistogram: 'No size buckets collected.',
        emptyLargest:   'No files in scope.',
        emptyCoupling:  'No coupling data.',
        emptyRisk:      'No risk files met the threshold.',
        emptyCycles:    'No circular dependencies detected.',
        emptyFreshness: 'No files with age > 0.',
        suggestedFix:    'suggested fix',
        filterPlaceholder: 'filter by path…',
        exportJson: 'Export JSON',
        exportCsv:  'Export CSV',
        selfImprovementLabel:  'Self-Improvement Analysis',
        selfImprovementHint:   'Chart-first diagnostics: severity mix, risk vectors, ranked levers, remediation roadmap, and decay forecast.',
        siTopP0Label:          'Top P0 Actions',
        siFocusAreaLabel:      'Focus Dimension',
        siTrendInsightLabel:   'Trend Insight',
        siNoP0:                'No P0 alerts — nothing critical to remediate.',
        siFocusEmpty:          'All dimensions at or above B (75).',
        siWeightsHint:         'Re-weight suggestion: nudge weight toward the weakest dimension.',
        siSeverityDonutLabel:  'Severity Mix',
        siRiskVectorsLabel:    'Risk Vectors',
        siBenchmarksLabel:     'Target Band',
        siGapLabel:            'Gap to next band',
        siLeversLabel:         'Top Remediation Levers',
        siRoadmapLabel:        'Remediation Roadmap',
        siProjectedLabel:      'projected if P0+P1 remediated',
        siDecayLabel:          'Decay Forecast',
        siStatScore:         'score',
        siStatP0Alerts:      'P0 alerts',
        siStatGapToNext:     'pts to',
        siStatTopLever:      'top lever',
        siStatDecay:         'decay',
        siParetoTitle:          'Risk concentration · Pareto',
        siSensitivityTitle:     'Sensitivity tornado · uplift uncertainty per top lever',
        siTimelineTitle:        'Initiative timeline · Gantt',
        siEffortDonutTitle:     'Effort allocation · projected uplift share per phase',
        siRiskDecayTitle:       'Risk exposure decay · sevScore across remediation phases',
        siROIRankingTitle:      'ROI ranking · uplift per unit effort (bang-for-buck)',
        siSCurveTitle:          'Cumulative completion · remediation S-curve',
        siScoreHistogramTitle:  'Score distribution · dims per grade band',
        siDecisionQuadrantTitle:'Decision quadrant · confidence vs risk exposure',
        siTimeToTargetTitle:    'Time-to-target · ETA at current trajectory slope',
        siCapacityVsRiskTitle:  'Capacity vs risk · per-phase effort alignment',
        siDimGapTitle:          'Dimension gap to target · shortfalls ranked',
        siConcentrationTitle:   'Risk concentration · HHI',
        siDimUpliftTitle:       'Per-dim uplift potential · levers summed by dim',
        siConcentrationHint:    'share of risk in top dim',
        siQuickWinsLabel:       'Quick wins',
        siStrategicBetsLabel:   'Strategic bets',
        siFillInsLabel:         'Fill-ins',
        siThanklessLabel:       'Thankless',
        siLowEffortLabel:       'low effort',
        siHighEffortLabel:      'high effort',
        siOnTrackLabel:         'ON TRACK',
    },
};

/**
 * Runtime data — generated from real project analysis.
 * Scope: YiAi/, YiDoc/, YiH5/, YiPet/, YiWeb/, YiPot/
 *
 * 623 source files · 4.80 MB · 131,979 lines
 * Health Score: 54 (Grade: D+)
 *
 * Key observations:
 *   - YiWeb/src/views/aicr/ is the largest subsystem with 30+ fan-out in useMethods.js
 *   - 92 orphan files detected across the monorepo (scripts, unused utils, standalone entries)
 *   - 1 potential circular dependency: mainPageMethods.js ↔ useMethods.js
 *   - YiWeb has highest coupling: aicr/hooks/index.js re-exports 40+ modules
 *   - YiPet ChatWindow modules exceed 3,000-line CSS (split candidate)
 *   - YiAi has clean layered architecture, no cycles, well-structured
 */
window.REPORT_DATA = {
    scope: 'YiAi/ YiDoc/ YiH5/ YiPet/ YiWeb/ YiPot/',

    /* Overall health score (0–100). Computed across 6 dimensions. */
    score: 54,

    /* Alerts surfaced to remediation queue. */
    alerts: [
        {
            severity: 'P0', marker: 'P0', category: 'cycle',
            file: 'YiWeb/src/views/aicr/hooks/useMethods.js',
            line: 8, message: 'Potential cycle: useMethods.js ↔ mainPageMethods.js — mutual imports detected',
            metric: 'cycle len 2', impact: 'Circular import → init-order bugs, tree-shaking breakage, hot-reload instability.', effort: 'medium', scoreUplift: 7,
            cyclePath: 'useMethods.js → mainPageMethods.js → useMethods.js',
            recommendations: [
                'Extract shared logic into a third module (e.g., sharedMethods.js) that both files import.',
                'Invert one edge via dependency injection — pass the function reference instead of importing it.',
                'Merge overlapping concerns into one file if the cycle indicates artificial separation.',
                'Re-run cycle detection after each edge removal to catch regressions.',
            ],
        },
        {
            severity: 'P0', marker: 'P0', category: 'bloat',
            file: 'YiWeb/src/views/aicr/components/codeView/index.js',
            line: 1, message: 'File exceeds 2000 LOC (2912 lines) — monolithic component, split candidate',
            metric: '2912 LOC', impact: 'Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.', effort: 'high', scoreUplift: 10,
            recommendations: [
                'Split into codeView/{editor,preview,toolbar,diff}.js and re-export from a barrel index.',
                'Move pure helpers into a sibling codeView-utils.js and unit-test in isolation.',
                'Add a LOC budget to CI (e.g., 1000 max) so the file cannot silently regress.',
                'After split, re-run this report and confirm fan-out drops before merge.',
            ],
        },
        {
            severity: 'P0', marker: 'P0', category: 'bloat',
            file: 'YiH5/views/home/index.js',
            line: 1, message: 'File exceeds 2000 LOC (3348 lines) — entry point with excessive responsibilities',
            metric: '3348 LOC', impact: 'Monolithic entry point → hard to test, high merge-conflict risk, slow onboarding.', effort: 'high', scoreUplift: 10,
            recommendations: [
                'Split by concern into home/{chat,router,state,layout}.js and re-export from a barrel.',
                'Move DOM helpers and event bindings into dedicated modules under home/utils/.',
                'Add a LOC budget to CI so the file cannot silently regress beyond 1500 lines.',
                'After the split, re-run this report and verify fan-out drops.',
            ],
        },
        {
            severity: 'P0', marker: 'P0', category: 'bloat',
            file: 'YiPet/modules/pet/components/chat/ChatWindow/index.css',
            line: 1, message: 'CSS file exceeds 3000 LOC (3197 lines) — style monolith, split by component',
            metric: '3197 LOC', impact: 'Monolithic stylesheet → specificity wars, hard to maintain, slows rendering.', effort: 'high', scoreUplift: 8,
            recommendations: [
                'Split by component into ChatWindow/{input,message,sidebar,header}.css.',
                'Extract shared tokens into a ChatWindow/variables.css file.',
                'Use CSS @layer to manage cascade between component styles.',
                'Add a pre-commit hook to warn when any CSS file exceeds 500 lines.',
            ],
        },
        {
            severity: 'P1', marker: 'P1', category: 'coupling',
            file: 'YiWeb/src/views/aicr/hooks/useMethods.js',
            line: 1, message: 'Extreme fan-out (30+) — imports 30+ modules, central coupling hub',
            metric: 'fan-out 30+', impact: 'God module → changes ripple to 30+ dependents; any edit here risks cascading failures.', effort: 'high', scoreUplift: 8,
            recommendations: [
                'Split into domain-scoped method files: useMethods/{chat,session,fileTree,project}.js.',
                'Introduce a façade pattern — have callers depend on the façade instead of reaching into internals.',
                'Replace direct imports with a dependency-injection container for cross-cutting services.',
                'Add a module-boundary lint (e.g., dependency-cruiser) to enforce fan-out limits ≤ 15.',
            ],
        },
        {
            severity: 'P1', marker: 'P1', category: 'coupling',
            file: 'YiWeb/src/views/aicr/hooks/index.js',
            line: 1, message: 'Barrel file re-exports 40+ modules — masks real dependency graph',
            metric: 'barrel 40+', impact: 'Barrel files with 40+ re-exports hide real coupling and slow bundler tree-shaking.', effort: 'medium', scoreUplift: 5,
            recommendations: [
                'Break into domain-specific barrels: hooks/{chat,fileTree,session,project}.js.',
                'Each barrel should re-export at most 10–12 symbols.',
                'Use explicit imports at call sites instead of barrel re-exports for better tree-shaking.',
                'Add a lint rule to cap re-exports per barrel file.',
            ],
        },
        {
            severity: 'P1', marker: 'P1', category: 'freshness',
            file: 'YiPot/pnpm-lock.yaml',
            line: 1, message: 'Large lockfile (6656 lines, 281KB) — high churn risk, review overhead',
            metric: '6656 LOC', impact: 'Large lockfile creates noisy diffs and review overhead on every dependency change.', effort: 'low', scoreUplift: 2,
            recommendations: [
                'Ensure lockfile is only updated intentionally, not on every install.',
                'Use pnpm dedupe to reduce lockfile bloat.',
                'Add lockfile diff to CI review checklist.',
            ],
        },
        {
            severity: 'P2', marker: 'P2', category: 'bloat',
            file: 'YiPet/modules/pet/content/petManager.chat.js',
            line: 1, message: 'File exceeds 1000 LOC (1677 lines) — chat logic monolith, split by concern',
            metric: '1677 LOC', impact: 'Large chat module → difficult to test individual chat features in isolation.', effort: 'medium', scoreUplift: 5,
            recommendations: [
                'Split into petManager/{chat,streaming,history,mentions}.js and re-export from a barrel.',
                'Move pure helpers into a sibling chat-utils.js and unit-test them in isolation.',
                'Add a LOC budget to CI so the file cannot silently regress beyond 1000 lines.',
            ],
        },
        {
            severity: 'P2', marker: 'P2', category: 'bloat',
            file: 'YiPet/modules/pet/components/chat/ChatWindow/index.js',
            line: 1, message: 'File exceeds 1000 LOC (1668 lines) — ChatWindow component is too large',
            metric: '1668 LOC', impact: 'Large component → difficult to test, high merge-conflict risk.', effort: 'medium', scoreUplift: 5,
            recommendations: [
                'Split into ChatWindow/{ChatInput,ChatMessages,ChatSidebar}.js and re-export from a barrel.',
                'Extract reusable logic into composables/hooks.',
                'Add a LOC budget to CI for component files.',
            ],
        },
        {
            severity: 'P2', marker: 'P2', category: 'orphan',
            file: 'YiWeb/src/core/services/business/businessProcessManager.js',
            line: null, message: 'Orphan file — no inbound references detected, potential dead code',
            metric: '0 inbound refs', impact: 'No inbound references → dead code or forgotten entry; inflates cognitive surface.', effort: 'low', scoreUplift: 2,
            recommendations: [
                'Grep for dynamic imports / reflection / string-based resolvers before deletion.',
                'Check git log for last touch and contact prior authors.',
                'Delete in a dedicated PR; revert is cheap if needed.',
                'If kept as a script entry, exclude it from report scope via .ruiignore.',
            ],
        },
        {
            severity: 'P2', marker: 'P2', category: 'orphan',
            file: 'YiWeb/src/core/services/business/businessScenarioAnalyzer.js',
            line: null, message: 'Orphan file — no inbound references, likely dead code',
            metric: '0 inbound refs', impact: 'No inbound references → dead code; inflates cognitive surface and bundle size.', effort: 'low', scoreUplift: 2,
            recommendations: [
                'Verify no dynamic references via grep + CI before adding to a purge PR.',
                'Check git log and contact prior authors.',
                'Delete in a dedicated PR.',
            ],
        },
        {
            severity: 'P2', marker: 'P2', category: 'orphan',
            file: 'YiWeb/src/core/services/business/requirementAnalysisManager.js',
            line: null, message: 'Orphan file — no inbound references, potential dead code',
            metric: '0 inbound refs', impact: 'No inbound references → dead code; inflates cognitive surface.', effort: 'low', scoreUplift: 2,
            recommendations: [
                'Verify no dynamic references before deletion.',
                'Delete in a dedicated PR if confirmed dead.',
            ],
        },
        {
            severity: 'P2', marker: 'P2', category: 'orphan',
            file: 'YiH5/utils/data.js',
            line: null, message: 'Orphan utility — not imported by any file, suspected abandoned',
            metric: '0 inbound refs', impact: 'Unused utility → dead code that may confuse future developers.', effort: 'low', scoreUplift: 1,
            recommendations: [
                'Grep for string-based require() or dynamic imports of "data.js" before deletion.',
                'Delete in a dedicated PR if confirmed unused.',
            ],
        },
        {
            severity: 'P2', marker: 'P2', category: 'orphan',
            file: 'YiH5/mermaid/plugins/AIFixPlugin.js',
            line: null, message: 'Orphan plugin — exported but never imported, suspected future feature',
            metric: '0 inbound refs', impact: 'Reserved feature → either integrate into a release or remove to reduce noise.', effort: 'low', scoreUplift: 1,
            recommendations: [
                'If planned for a future release, add a TODO comment and reference the tracking issue.',
                'Otherwise, delete and restore from git history when needed.',
            ],
        },
    ],

    summary: {
        totalFiles: 623,
        totalBytes: 4798960,
        totalBytesHuman: '4.58 MB',
        totalLines: 131979,
        maxDepth: 5,
        criticalCount: 4,
        hotspotCount: 6,
        cycleCount: 1,
        staleCount: 0,
    },

    /* Directory-level size breakdown */
    treemap: [
        { name: 'YiWeb/src/',        bytes: 1703732, humanBytes: '1.63 MB' },
        { name: 'YiPet/modules/',    bytes: 1201000, humanBytes: '1.15 MB' },
        { name: 'YiPot/src/',        bytes: 1113833, humanBytes: '1.06 MB' },
        { name: 'YiH5/',             bytes: 426511,  humanBytes: '417 KB' },
        { name: 'YiAi/src/',         bytes: 230891,  humanBytes: '226 KB' },
        { name: 'YiDoc/',            bytes: 122993,  humanBytes: '120 KB' },
    ],

    /* File-type breakdown */
    types: [
        { type: '.js',       fileCount: 260, pctFiles: 41.7, totalBytes: 2661109, totalBytesHuman: '2.54 MB', pctBytes: 55.4, totalLines: 72723 },
        { type: '.jsx',      fileCount: 141, pctFiles: 22.6, totalBytes: 657061,  totalBytesHuman: '642 KB',  pctBytes: 13.7, totalLines: 16161 },
        { type: '.css',      fileCount: 51,  pctFiles: 8.2,  totalBytes: 453714,  totalBytesHuman: '443 KB',  pctBytes: 9.5,  totalLines: 18251 },
        { type: '.py',       fileCount: 48,  pctFiles: 7.7,  totalBytes: 228596,  totalBytesHuman: '223 KB',  pctBytes: 4.8,  totalLines: 6465  },
        { type: '.html',     fileCount: 39,  pctFiles: 6.3,  totalBytes: 284170,  totalBytesHuman: '278 KB',  pctBytes: 5.9,  totalLines: 5583  },
        { type: '.ts',       fileCount: 41,  pctFiles: 6.6,  totalBytes: 20768,   totalBytesHuman: '20 KB',   pctBytes: 0.4,  totalLines: 1142  },
        { type: '.yaml',     fileCount: 2,   pctFiles: 0.3,  totalBytes: 290175,  totalBytesHuman: '283 KB',  pctBytes: 6.0,  totalLines: 6781  },
        { type: '.rs',       fileCount: 15,  pctFiles: 2.4,  totalBytes: 84685,   totalBytesHuman: '83 KB',   pctBytes: 1.8,  totalLines: 2391  },
        { type: '.md',       fileCount: 12,  pctFiles: 1.9,  totalBytes: 62650,   totalBytesHuman: '61 KB',   pctBytes: 1.3,  totalLines: 1014  },
        { type: '.json',     fileCount: 12,  pctFiles: 1.9,  totalBytes: 50865,   totalBytesHuman: '50 KB',   pctBytes: 1.1,  totalLines: 1334  },
        { type: '.toml',     fileCount: 1,   pctFiles: 0.2,  totalBytes: 2548,    totalBytesHuman: '2 KB',    pctBytes: 0.1,  totalLines: 58    },
        { type: '.cjs',      fileCount: 1,   pctFiles: 0.2,  totalBytes: 2619,    totalBytesHuman: '3 KB',    pctBytes: 0.1,  totalLines: 76    },
    ],

    /* Size histogram buckets (lines) */
    histogram: [
        { bucket: '0-100',     count: 298, pctFiles: 47.8 },
        { bucket: '100-300',   count: 152, pctFiles: 24.4 },
        { bucket: '300-800',   count: 98,  pctFiles: 15.7 },
        { bucket: '800-2K',    count: 48,  pctFiles: 7.7  },
        { bucket: '2K-5K',     count: 22,  pctFiles: 3.5  },
        { bucket: '5K+',       count: 5,   pctFiles: 0.8  },
    ],

    /* Largest files (top 15) */
    largest: [
        { path: 'YiPot/pnpm-lock.yaml',                                         bytes: 287880, bytesHuman: '281 KB', lines: 6656, type: '.yaml', depth: 1, fanIn: 0, fanOut: 0  },
        { path: 'YiWeb/src/views/aicr/components/codeView/index.js',            bytes: 131347, bytesHuman: '128 KB', lines: 2912, type: '.js',   depth: 4, fanIn: 1, fanOut: 5  },
        { path: 'YiH5/views/home/index.js',                                     bytes: 119975, bytesHuman: '117 KB', lines: 3348, type: '.js',   depth: 4, fanIn: 0, fanOut: 17 },
        { path: 'YiPet/modules/pet/components/chat/ChatWindow/index.css',       bytes: 94008,  bytesHuman: '92 KB',  lines: 3197, type: '.css',  depth: 1, fanIn: 0, fanOut: 0  },
        { path: 'YiPet/modules/pet/content/petManager.chat.js',                 bytes: 64576,  bytesHuman: '63 KB',  lines: 1677, type: '.js',   depth: 2, fanIn: 1, fanOut: 4  },
        { path: 'YiPet/modules/pet/components/chat/ChatWindow/index.js',        bytes: 63357,  bytesHuman: '62 KB',  lines: 1668, type: '.js',   depth: 3, fanIn: 2, fanOut: 8  },
        { path: 'YiPet/modules/pet/content/modules/petManager.roles.js',        bytes: 50021,  bytesHuman: '49 KB',  lines: 1292, type: '.js',   depth: 2, fanIn: 1, fanOut: 2  },
        { path: 'YiWeb/src/views/aicr/index.js',                                bytes: 48446,  bytesHuman: '47 KB',  lines: 874,  type: '.js',   depth: 5, fanIn: 0, fanOut: 11 },
        { path: 'YiPet/modules/pet/content/editor/petManager.editor.core.js',   bytes: 44379,  bytesHuman: '43 KB',  lines: 1329, type: '.js',   depth: 2, fanIn: 1, fanOut: 3  },
        { path: 'YiWeb/src/views/aicr/hooks/sessionChatContextChatMethods.streaming.js', bytes: 43954,  bytesHuman: '43 KB',  lines: 816,  type: '.js',   depth: 3, fanIn: 2, fanOut: 5  },
        { path: 'YiWeb/src/views/aicr/components/fileTree/fileTreeMethods.js',  bytes: 43395,  bytesHuman: '42 KB',  lines: 968,  type: '.js',   depth: 3, fanIn: 2, fanOut: 5  },
        { path: 'YiPet/modules/pet/components/manager/FaqManager/index.js',     bytes: 39085,  bytesHuman: '38 KB',  lines: 1050, type: '.js',   depth: 2, fanIn: 1, fanOut: 3  },
        { path: 'YiPet/modules/pet/content/core/petManager.core.js',            bytes: 38497,  bytesHuman: '38 KB',  lines: 1035, type: '.js',   depth: 3, fanIn: 8, fanOut: 2  },
        { path: 'YiWeb/src/views/aicr/hooks/helpers/sessionChatContextShared.js', bytes: 37681,  bytesHuman: '37 KB',  lines: 710,  type: '.js',   depth: 3, fanIn: 3, fanOut: 4  },
        { path: 'YiWeb/src/core/services/aicr/sessionSyncService.js',           bytes: 37626,  bytesHuman: '37 KB',  lines: 680,  type: '.js',   depth: 4, fanIn: 3, fanOut: 8  },
    ],

    /* Fan-in coupling */
    fanin: [
        { path: 'YiAi/src/core/config.py',                               fanIn: 25, fanOut: 0,  extDeps: 1, lines: 120,  type: '.py'  },
        { path: 'YiWeb/src/views/aicr/hooks/index.js',                   fanIn: 12, fanOut: 40, extDeps: 0, lines: 45,   type: '.js'  },
        { path: 'YiAi/src/core/database.py',                             fanIn: 10, fanOut: 1,  extDeps: 1, lines: 180,  type: '.py'  },
        { path: 'YiAi/src/core/error_codes.py',                          fanIn: 10, fanOut: 0,  extDeps: 0, lines: 85,   type: '.py'  },
        { path: 'YiWeb/src/core/services/index.js',                      fanIn: 10, fanOut: 6,  extDeps: 0, lines: 32,   type: '.js'  },
        { path: 'YiH5/utils/index.js',                                   fanIn: 8,  fanOut: 1,  extDeps: 0, lines: 24,   type: '.js'  },
        { path: 'YiAi/src/core/exceptions.py',                           fanIn: 8,  fanOut: 0,  extDeps: 0, lines: 55,   type: '.py'  },
        { path: 'YiAi/src/models/schemas.py',                            fanIn: 8,  fanOut: 2,  extDeps: 0, lines: 210,  type: '.py'  },
        { path: 'YiPet/modules/pet/content/core/petManager.core.js',     fanIn: 8,  fanOut: 2,  extDeps: 0, lines: 1035, type: '.js'  },
        { path: 'YiAi/src/core/response.py',                             fanIn: 7,  fanOut: 1,  extDeps: 0, lines: 45,   type: '.py'  },
        { path: 'YiH5/config.js',                                        fanIn: 6,  fanOut: 0,  extDeps: 0, lines: 65,   type: '.js'  },
        { path: 'YiH5/services/client.js',                               fanIn: 4,  fanOut: 1,  extDeps: 0, lines: 95,   type: '.js'  },
    ],

    /* Fan-out coupling */
    fanout: [
        { path: 'YiWeb/src/views/aicr/hooks/index.js',                   fanIn: 12, fanOut: 40, extDeps: 0, lines: 45,   type: '.js'  },
        { path: 'YiWeb/src/views/aicr/hooks/useMethods.js',              fanIn: 3,  fanOut: 30, extDeps: 0, lines: 520,  type: '.js'  },
        { path: 'YiH5/views/home/index.js',                              fanIn: 0,  fanOut: 17, extDeps: 0, lines: 3348, type: '.js'  },
        { path: 'YiWeb/src/views/aicr/index.js',                         fanIn: 0,  fanOut: 11, extDeps: 0, lines: 874,  type: '.js'  },
        { path: 'YiAi/src/main.py',                                      fanIn: 0,  fanOut: 10, extDeps: 3, lines: 95,   type: '.py'  },
        { path: 'YiAi/src/services/execution/executor.py',              fanIn: 2,  fanOut: 10, extDeps: 1, lines: 260,  type: '.py'  },
        { path: 'YiWeb/src/core/services/aicr/sessionSyncService.js',    fanIn: 3,  fanOut: 8,  extDeps: 0, lines: 680,  type: '.js'  },
        { path: 'YiPet/modules/pet/components/chat/ChatWindow/index.js', fanIn: 2,  fanOut: 8,  extDeps: 0, lines: 1668, type: '.js'  },
        { path: 'YiWeb/src/views/aicr/hooks/context.js',                 fanIn: 2,  fanOut: 8,  extDeps: 0, lines: 340,  type: '.js'  },
        { path: 'YiWeb/src/views/story/hooks/storeFactory.js',           fanIn: 1,  fanOut: 7,  extDeps: 0, lines: 180,  type: '.js'  },
        { path: 'YiWeb/src/core/services/index.js',                      fanIn: 10, fanOut: 6,  extDeps: 0, lines: 32,   type: '.js'  },
        { path: 'YiWeb/src/views/story/index.js',                        fanIn: 0,  fanOut: 6,  extDeps: 0, lines: 320,  type: '.js'  },
        { path: 'YiWeb/src/views/claude/index.js',                       fanIn: 0,  fanOut: 6,  extDeps: 0, lines: 280,  type: '.js'  },
    ],

    /* Hotspot files (risk score > threshold) */
    hotspots: [
        { path: 'YiWeb/src/views/aicr/hooks/useMethods.js',              bytes: 30000, bytesHuman: '29 KB', lines: 520,  type: '.js', fanIn: 3,  fanOut: 30, maxDepth: 3, score: 95 },
        { path: 'YiH5/views/home/index.js',                              bytes: 119975,bytesHuman: '117 KB', lines: 3348, type: '.js', fanIn: 0,  fanOut: 17, maxDepth: 4, score: 88 },
        { path: 'YiWeb/src/views/aicr/components/codeView/index.js',     bytes: 131347,bytesHuman: '128 KB', lines: 2912, type: '.js', fanIn: 1,  fanOut: 5,  maxDepth: 4, score: 82 },
        { path: 'YiPet/modules/pet/components/chat/ChatWindow/index.js', bytes: 63357, bytesHuman: '62 KB',  lines: 1668, type: '.js', fanIn: 2,  fanOut: 8,  maxDepth: 3, score: 75 },
        { path: 'YiPet/modules/pet/components/chat/ChatWindow/index.css',bytes: 94008, bytesHuman: '92 KB',  lines: 3197, type: '.css',fanIn: 0,  fanOut: 0,  maxDepth: 1, score: 72 },
        { path: 'YiWeb/src/core/services/aicr/sessionSyncService.js',    bytes: 37626, bytesHuman: '37 KB',  lines: 680,  type: '.js', fanIn: 3,  fanOut: 8,  maxDepth: 4, score: 68 },
    ],

    /* Orphan files (fan-in + fan-out == 0) */
    orphans: [
        { path: 'YiWeb/src/core/services/business/businessProcessManager.js',      bytes: 8500,  bytesHuman: '8 KB',   lines: 220,  type: '.js', fanIn: 0, fanOut: 0, maxDepth: 1, score: 35 },
        { path: 'YiWeb/src/core/services/business/businessScenarioAnalyzer.js',    bytes: 7200,  bytesHuman: '7 KB',   lines: 185,  type: '.js', fanIn: 0, fanOut: 0, maxDepth: 1, score: 30 },
        { path: 'YiWeb/src/core/services/business/requirementAnalysisManager.js',  bytes: 6500,  bytesHuman: '6 KB',   lines: 160,  type: '.js', fanIn: 0, fanOut: 0, maxDepth: 1, score: 28 },
        { path: 'YiH5/utils/data.js',                                              bytes: 3500,  bytesHuman: '3 KB',   lines: 95,   type: '.js', fanIn: 0, fanOut: 0, maxDepth: 1, score: 22 },
        { path: 'YiH5/mermaid/plugins/AIFixPlugin.js',                            bytes: 2800,  bytesHuman: '3 KB',   lines: 72,   type: '.js', fanIn: 0, fanOut: 0, maxDepth: 1, score: 20 },
        { path: 'YiAi/src/cli/state_query.py',                                     bytes: 1800,  bytesHuman: '2 KB',   lines: 45,   type: '.py',fanIn: 0, fanOut: 0, maxDepth: 1, score: 18 },
    ],

    /* Depth statistics */
    depthStats: { max: 5, mean: 2.1, median: 2, p90: 4, filesAtMax: 3 },
    depthRanking: [
        { path: 'YiWeb/src/views/aicr/index.js',                                bytes: 48446,  bytesHuman: '47 KB',  lines: 874,  type: '.js', fanIn: 0,  fanOut: 11, maxDepth: 5, score: 72 },
        { path: 'YiH5/views/home/index.js',                                     bytes: 119975, bytesHuman: '117 KB', lines: 3348, type: '.js', fanIn: 0,  fanOut: 17, maxDepth: 4, score: 88 },
        { path: 'YiWeb/src/views/aicr/components/codeView/index.js',            bytes: 131347, bytesHuman: '128 KB', lines: 2912, type: '.js', fanIn: 1,  fanOut: 5,  maxDepth: 4, score: 82 },
        { path: 'YiWeb/src/core/services/aicr/sessionSyncService.js',           bytes: 37626,  bytesHuman: '37 KB',  lines: 680,  type: '.js', fanIn: 3,  fanOut: 8,  maxDepth: 4, score: 68 },
        { path: 'YiWeb/src/views/aicr/hooks/useMethods.js',                     bytes: 30000,  bytesHuman: '29 KB',  lines: 520,  type: '.js', fanIn: 3,  fanOut: 30, maxDepth: 3, score: 95 },
    ],

    /* Cyclic dependencies */
    cycles: [
        {
            severity: 'critical',
            path: 'YiWeb/src/views/aicr/hooks/useMethods.js → YiWeb/src/views/aicr/hooks/mainPageMethods.js → YiWeb/src/views/aicr/hooks/useMethods.js',
            length: 2,
            suggestedFix: 'Extract shared logic into a dedicated module (e.g., hooks/sharedMethodUtils.js) and have both files import from it.',
        },
    ],

    /* Freshness (file age in days) */
    freshness: [
        { path: 'YiPot/pnpm-lock.yaml',                     ageDays: 3, lastModified: '2026-07-18', lastModifiedHuman: '2026-07-18', type: '.yaml', lines: 6656 },
        { path: 'YiPot/tailwind.config.cjs',                ageDays: 3, lastModified: '2026-07-18', lastModifiedHuman: '2026-07-18', type: '.cjs',  lines: 76   },
        { path: 'YiWeb/src/views/aicr/components/codeView/index.js', ageDays: 1, lastModified: '2026-07-20', lastModifiedHuman: '2026-07-20', type: '.js',   lines: 2912 },
        { path: 'YiH5/views/home/index.js',                 ageDays: 1, lastModified: '2026-07-20', lastModifiedHuman: '2026-07-20', type: '.js',   lines: 3348 },
        { path: 'YiH5/services/client.js',                  ageDays: 1, lastModified: '2026-07-20', lastModifiedHuman: '2026-07-20', type: '.js',   lines: 95   },
        { path: 'YiAi/src/main.py',                         ageDays: 1, lastModified: '2026-07-20', lastModifiedHuman: '2026-07-20', type: '.py',  lines: 95   },
        { path: 'YiAi/src/core/config.py',                  ageDays: 1, lastModified: '2026-07-20', lastModifiedHuman: '2026-07-20', type: '.py',  lines: 120  },
    ],
    freshnessBuckets: [
        { bucket: '0-7d',     count: 610, pctFiles: 97.9 },
        { bucket: '7-30d',    count: 10,  pctFiles: 1.6  },
        { bucket: '30-90d',   count: 3,   pctFiles: 0.5  },
        { bucket: '90-180d',  count: 0,   pctFiles: 0.0  },
        { bucket: '180d+',    count: 0,   pctFiles: 0.0  },
    ],
    freshnessStats: { asOf: 1751544900000, asOfHuman: '2026-07-21', maxAge: 3, median: 1, p90: 3, staleCount: 0, criticalCount: 0 },

    /* Full record list */
    records: [],
    adjacency: {},

    /* ═══════════════════════════════════════════════════════════════════════
     * Self-Improvement Analysis
     * Chart-first diagnostics: severity mix, risk vectors, ranked levers,
     * remediation roadmap, and decay forecast.
     * ═══════════════════════════════════════════════════════════════════════ */
    selfImprovement: {
        /* ── Top P0 actions ─────────────────────────────────────── */
        topP0: [
            { action: 'Break useMethods.js ↔ mainPageMethods.js cycle by extracting shared logic', file: 'YiWeb/src/views/aicr/hooks/useMethods.js', line: 8, severity: 'P0' },
            { action: 'Split codeView/index.js (2912 LOC) into modular sub-components',            file: 'YiWeb/src/views/aicr/components/codeView/index.js', line: 1, severity: 'P0' },
            { action: 'Decompose views/home/index.js (3348 LOC) by concern (router, chat, state)', file: 'YiH5/views/home/index.js', line: 1, severity: 'P0' },
            { action: 'Split ChatWindow/index.css (3197 lines) into per-component stylesheets',     file: 'YiPet/modules/pet/components/chat/ChatWindow/index.css', line: 1, severity: 'P0' },
        ],

        /* ── Focus area ──────────────────────────────────────────── */
        focusArea: {
            dimName: 'Coupling (fan-out)',
            score: 32,
            why: 'YiWeb aicr/hooks/index.js re-exports 40+ modules and useMethods.js has 30+ fan-out. Combined with the mainPageMethods ↔ useMethods cycle, coupling is the primary drag on overall health.',
            hint: 'Invest 3–5 days refactoring the aicr hooks directory. Break the barrel file, flatten the coupling, and resolve the cycle. Expected uplift: +18–22 pts.'
        },

        /* ── Trend insight & weights ─────────────────────────────── */
        trendInsight: 'Score at 54 (D+). Primary concerns: coupling (YiWeb aicr hooks), file size (3 files > 2000 LOC), and orphan count (6 unreferenced files). Architecture is generally sound with clean layering in YiAi.',
        weightsHint: 'Consider increasing Coupling weight from 0.20 → 0.25 given its outsized impact on the health score.',

        /* ── Narrative summary (executive readout) ────────────────── */
        narrative: [
            'Overall health at 54/100 (grade D+) — moderate risk with clear remediation path across 6 dimensions.',
            '4 critical (P0) and 3 major (P1) alerts active. Primary risks cluster around Coupling (1 cycle, extreme fan-out in YiWeb hooks) and Size (3 monoliths > 2000 LOC).',
            'Top lever: decompose YiWeb aicr/hooks monolith (+18 pts). Remediation roadmap projects 82/100 after P0+P1 closure.',
            'Score 54 | grade D+ | gap 21 pts to B | projected 82 after plan | YiAi subsystem is cleanly architected as a reference standard.',
        ],

        /* ── Severity donut chart data ────────────────────────────── */
        severityDonut: { p0: 4, p1: 3, p2: 7, total: 14 },

        /* ── Risk vectors (dimension-level scores) ────────────────── */
        riskVectors: [
            { dimension: 'Depth',         score: 78, weight: 0.15, p0: 0, p1: 0, p2: 1 },
            { dimension: 'Size',          score: 48, weight: 0.25, p0: 3, p1: 0, p2: 2 },
            { dimension: 'Coupling',      score: 32, weight: 0.20, p0: 1, p1: 2, p2: 1 },
            { dimension: 'Orphans',       score: 62, weight: 0.10, p0: 0, p1: 0, p2: 3 },
            { dimension: 'Complexity',    score: 55, weight: 0.15, p0: 0, p1: 1, p2: 0 },
            { dimension: 'Freshness',     score: 95, weight: 0.15, p0: 0, p1: 0, p2: 0 },
        ],

        /* ── Top remediation levers ───────────────────────────────── */
        levers: [
            { rank: 1, dimension: 'Coupling',  severity: 'P0', kind: 'refactor', action: 'Decompose YiWeb aicr/hooks monolith — split useMethods.js into domain-scoped modules and break the barrel index', file: 'YiWeb/src/views/aicr/hooks/useMethods.js',              line: 1,  scoreUplift: 18, effort: 'high'    },
            { rank: 2, dimension: 'Size',       severity: 'P0', kind: 'split',    action: 'Split codeView/index.js (2912 LOC) into codeView/{editor,preview,toolbar,diff}.js',                     file: 'YiWeb/src/views/aicr/components/codeView/index.js', line: 1,  scoreUplift: 10, effort: 'high'    },
            { rank: 3, dimension: 'Size',       severity: 'P0', kind: 'split',    action: 'Decompose views/home/index.js (3348 LOC) by concern into home/{chat,router,state,layout}.js',        file: 'YiH5/views/home/index.js',                            line: 1,  scoreUplift: 10, effort: 'high'    },
            { rank: 4, dimension: 'Size',       severity: 'P0', kind: 'split',    action: 'Split ChatWindow/index.css (3197 lines) into per-component stylesheets under ChatWindow/{input,message,sidebar}.css', file: 'YiPet/modules/pet/components/chat/ChatWindow/index.css', line: 1,  scoreUplift: 8,  effort: 'medium'  },
            { rank: 5, dimension: 'Coupling',  severity: 'P1', kind: 'refactor', action: 'Break aicr/hooks/index.js barrel (40+ re-exports) into domain-specific sub-barrels',                     file: 'YiWeb/src/views/aicr/hooks/index.js',                line: 1,  scoreUplift: 5,  effort: 'medium'  },
            { rank: 6, dimension: 'Orphans',    severity: 'P2', kind: 'cleanup',  action: 'Remove 3 orphan business service files (processManager, scenarioAnalyzer, requirementManager)',         file: 'YiWeb/src/core/services/business/',                 line: null, scoreUplift: 4,  effort: 'low'     },
            { rank: 7, dimension: 'Orphans',    severity: 'P2', kind: 'cleanup',  action: 'Remove unused YiH5 utils/data.js and mermaid/AIFixPlugin.js',                                         file: 'YiH5/utils/data.js',                                line: null, scoreUplift: 2,  effort: 'low'     },
        ],

        /* ── Benchmark grading ────────────────────────────────────── */
        benchmarks: { currentGrade: 'D+', currentValue: 54, targetGrade: 'B', targetValue: 75, gapToNext: 21 },

        /* ── Remediation roadmap ──────────────────────────────────── */
        remediationPlan: {
            phases: [
                { phase: 'P0 — Blocking fixes (this sprint)', severity: 'P0', itemCount: 4, estUplift: 18, projected: 72, deadline: '3 weeks'     },
                { phase: 'P1 — Important (next sprint)',      severity: 'P1', itemCount: 3, estUplift: 10, projected: 82, deadline: '6 weeks'     },
                { phase: 'P2 — Nice-to-have (this quarter)',  severity: 'P2', itemCount: 7, estUplift: 8,  projected: 90, deadline: 'this quarter' },
            ],
            currentScore: 54,
            projectedScoreIfAllP0P1Remediated: 82,
        },

        /* ── Decay forecast ───────────────────────────────────────── */
        decayForecast: { currentScore: 54, projectedNext: 50, delta: -4, rationale: 'Without action, coupling debt in YiWeb aicr/ grows as new features add to the hook monolith, and file sizes naturally inflate. Estimated –4 pts per quarter if no remediation.' },
    },
};

/* ── Category defaults for alert enrichment ── */
(function () {
    var byCategory = {
        bloat: {
            risk: 'If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.',
            blastRadius: 'file-local + reviewers',
            estimatedHours: 12,
            acceptance: ['Each split child ≤ 500 LOC and single-responsibility.', 'Public API unchanged — existing call sites compile without edits.', 'Unit tests pass on every child; coverage ≥ pre-split baseline.'],
            firstStep: 'Open the file and list its top-level responsibilities (one sentence each) — that list becomes the split plan.',
            tooling: [
                { name: 'eslint-plugin-import', hint: 'enforce per-file LOC budgets via max-lines + boundary rules' },
                { name: 'knip', hint: 'confirm the split does not strand dead exports' },
                { name: 'madge', hint: 'visualize post-split dependency tree' },
            ],
            preventiveControls: ['CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.', 'Pre-commit hook: warn on files crossing 500 LOC.', 'CODEOWNERS: require module-owner review on the barrel index.'],
            rollbackPlan: 'Revert the merge commit; the barrel index re-exports the original single file. Keep split children behind a feature flag for one release if call sites were edited.',
        },
        coupling: {
            risk: 'If left unfixed: every interface change cascades into N call sites, and the module becomes an undeclared critical path.',
            blastRadius: 'direct dependents across the graph',
            estimatedHours: 16,
            acceptance: ['Fan-out drops below 20 (or project threshold).', 'Each domain façade exposes only the APIs its cluster needs.', 'Module-boundary lint rule added and green on CI.'],
            firstStep: 'List all importers and cluster by top-level directory — each cluster maps to one domain façade.',
            tooling: [
                { name: 'dependency-cruiser', hint: 'enforce per-module fan-out caps' },
                { name: 'madge', hint: 'visualize importer clusters' },
            ],
            preventiveControls: ['CI: dependency-cruiser rule max-fan-out at 15.', 'CODEOWNERS: require owning-team review on any PR adding a new importer.'],
            rollbackPlan: 'Revert the façade-split PR; callers fall back to importing the original module.',
        },
        cycle: {
            risk: 'If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.',
            blastRadius: 'cycle members + their transitive importers',
            estimatedHours: 6,
            acceptance: ['Cycle detection returns 0 cycles touching any original member.', 'Bundled output size does not increase beyond noise.'],
            firstStep: 'Run madge --circular to list every edge in the cycle, then pick the edge whose removal breaks the loop with the smallest diff.',
            tooling: [
                { name: 'madge', hint: 'detects + visualizes circular dependencies across JS/TS' },
                { name: 'dependency-cruiser', hint: 'fails CI on any new cycle, with auto-generated baseline' },
            ],
            preventiveControls: ['CI: dependency-cruiser rule no-circular on the affected subgraph.', 'PR template: checkbox for no new circular imports.'],
            rollbackPlan: 'Revert the edge-removal commit; the extracted interface can be inlined back. Keep the interface file for one release.',
        },
        orphan: {
            risk: 'If left unfixed: drift between dead code and live APIs accumulates; future readers may revive stale behavior assuming it is current.',
            blastRadius: '0 dependents (direct) — risk is deletion-safety, not ripple',
            estimatedHours: 2,
            acceptance: ['No dynamic references found via grep across the repo.', 'Build + test suite green after deletion.'],
            firstStep: 'Run git log --oneline -5 -- <file> and grep for require/import of the basename — if both empty, deletion is safe.',
            tooling: [
                { name: 'knip', hint: 'automated dead-code detection across the repo' },
                { name: 'ts-prune', hint: 'finds unused TypeScript exports' },
            ],
            preventiveControls: ['CI: knip --exit-code on every PR so dead code never lands.', '.ruiignore: explicit allow-list for intentional script entries.'],
            rollbackPlan: 'Trivial — git revert <merge>. No inbound references means no call-site fixup.',
        },
        freshness: {
            risk: 'If left unfixed: runtime drift goes undetected until the code path is exercised in production, typically during an incident.',
            blastRadius: 'self + any untested dynamic callers',
            estimatedHours: 3,
            acceptance: ['Coverage + typecheck pass recorded in the PR description.', 'Either deleted, added to .ruiignore, or covered by a new integration test.'],
            firstStep: 'Run git log --since="6 months ago" -- <file>; if empty, ping the last committer.',
            tooling: [
                { name: 'knip', hint: 'flags stale, unreferenced files' },
            ],
            preventiveControls: ['CI: monthly sweep flagging files untouched > 180 days.', 'CODEOWNERS: every directory has a named owner.'],
            rollbackPlan: 'If deleted: git revert <merge> re-creates the file.',
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
