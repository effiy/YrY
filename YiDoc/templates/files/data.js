/**
 * yry-report-files — Static configuration
 * ----------------------------------------------------------------------
 * window.REPORT_CONFIG provides static labels and options. Runtime data
 * (the analysis result) lives in window.REPORT_DATA, also in this file
 * when emitted. Regeneration rewrites only window.REPORT_DATA — the
 * labels and options below are stable.
 *
 * Design principles:
 *   - Labels are technical, precise, and self-contained.
 *   - All visible text lives here so the Vue layer is a pure renderer.
 *   - No date / timestamp fields anywhere (per refactor spec).
 *   - Token references (--yry-*) are preferred over hardcoded values.
 */

window.REPORT_CONFIG = {
    /* Runtime options used by the analysis run. Displayed in the header
       and footer as the verbatim JSON. `generatedAt` is an ISO timestamp
       used to compute the stale-data warning + footer recap. */
    options: {
        topN: 20,
        noCycles: false,
        theme: 'dark',
        generatedAt: null, /* ISO 8601 UTC — filled in by the analyzer */
    },

    /* Fixed constants shared across the report UI. */
    constants: {
        filterDebounceMs: 200,
        componentReadyTimeoutMs: 5000,
        csvHeader: 'path,bytes,lines,type,fanIn,fanOut,extDeps,maxDepth,lastModified,ageDays',
    },

    labels: {
        /* ── Header / chrome ─────────────────────────────────────── */
        title:            'yry-report-files',
        footerMethodology:'Methodology: references/methodology.md · contracts: rules/analysis-contracts.md · template: templates/report/',

        /* ── Section titles (kept short so the ToC fits one row) ──── */
        sectionSummary:    'Summary',
        sectionSize:       'Size',
        sectionLargest:    'Largest Files',
        sectionCoupling:   'Coupling',
        sectionRisk:       'Risk Files',
        sectionHealth:     'Health',

        /* ── Size section tabs ────────────────────────────────────── */
        tabTreemap:    'Treemap',
        tabTypes:      'Types',
        tabHistogram:  'Histogram',

        /* ── Coupling section tabs ─────────────────────────────────── */
        tabFanin:      'Fan-in',
        tabFanout:     'Fan-out',

        /* ── Risk section tabs ─────────────────────────────────────── */
        tabHotspots:   'Hotspots',
        tabOrphans:    'Orphans',
        tabDepth:      'Depth',

        /* ── Health section tabs ──────────────────────────────────── */
        tabCycles:     'Cycles',
        tabFreshness:  'Freshness',

        /* ── Summary cards (only 2 — the rest is in the score gauge or tabs) */
        summaryTotalFiles:   'Total Files',
        summaryTotalSize:    'Total Size',

        /* ── Depth stat cards ────────────────────────────────────── */
        depthMax:        'Max',
        depthMean:       'Mean',
        depthMedian:     'Median',
        depthP90:        'P90',
        depthFilesAtMax: 'Files at Max',

        /* ── Freshness stat cards ────────────────────────────────── */
        freshnessAsOf:    'Anchor (newest mtime)',
        freshnessMaxAge:  'Max Age',
        freshnessMedian:  'Median Age',
        freshnessP90:     'P90 Age',
        freshnessStale:   'Stale (≥180d)',

        /* ── Column headers ──────────────────────────────────────── */
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

        /* ── Empty states ────────────────────────────────────────── */
        emptyTreemap:   'No directories under scope.',
        emptyTypes:     'No file types collected.',
        emptyHistogram: 'No size buckets collected.',
        emptyLargest:   'No files in scope.',
        emptyCoupling:  'No coupling data.',
        emptyRisk:      'No risk files met the threshold.',
        emptyCycles:    'No circular dependencies detected.',
        emptyFreshness: 'No files with age > 0.',

        /* ── Misc ────────────────────────────────────────────────── */
        suggestedFix:    'suggested fix',
        filterPlaceholder: 'filter by path…',

        /* ── Export ──────────────────────────────────────────────── */
        exportJson: 'Export JSON',
        exportCsv:  'Export CSV',

        /* ── Self-Improvement Analysis ───────────────────────────── */
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
        /* ── Self-Improvement stat banner ─────────────────────────── */
        siStatScore:         'score',
        siStatP0Alerts:      'P0 alerts',
        siStatGapToNext:     'pts to',
        siStatTopLever:      'top lever',
        siStatDecay:         'decay',
        /* ── Self-Improvement chart sub-labels ────────────────────── */
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
 * Runtime data. The generator overwrites this object with the real
 * analysis result on each run. The shape is the contract — Vue reads
 * exactly these keys. See rules/analysis-contracts.md for the full
 * per-record schema.
 *
 * The sample data below serves as a realistic preview of the full
 * report contract. Every field used by index.js is represented so
 * that the template validates end-to-end. Regeneration replaces all
 * of window.REPORT_DATA — only the schema must be preserved.
 */
window.REPORT_DATA = {
    scope: 'src/',

    /* ── Overall health score (0–100) for the yry-score-bar component ── */
    score: 62,

    /* ── Alerts surfaced to the score-bar P0/P1/P2 badges AND the
       remediation queue. Each alert MUST include a `file` (or path),
       `category` (bloat | coupling | depth | hotspot | orphan | cycle |
       freshness | size), `marker` (P0/P1/P2), and a human-readable
       `message`. `line` is optional but recommended.

       Optional enrichment fields (rendered by the remediation queue):
         metric          — short measurement chip (e.g., "2840 LOC")
         impact          — one-line professional impact statement
         effort          — 'low' | 'medium' | 'high'
         scoreUplift     — estimated health-score points recoverable
         recommendations — 2–5 concrete, professional action items
         cyclePath       — optional "A → B → A" string for cycle alerts */
    alerts: [
        { severity: 'P0', marker: 'P0', category: 'cycle',      file: 'src/store/reducer.ts',       line: 42,  message: 'Cycle detected: store/reducer.ts ↔ services/apiClient.ts',
          metric: 'cycle len 2', impact: 'Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.', effort: 'medium', scoreUplift: 6, cyclePath: 'src/store/reducer.ts → src/services/apiClient.ts → src/store/reducer.ts',
          recommendations: [
              'Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.',
              'Invert one edge via dependency injection, an event bus, or a callback registry.',
              'Break the edge from the hottest member (src/store/reducer.ts) first — it has the highest fan-in+fan-out.',
              'For TypeScript: use `import type` to split runtime cycles from type-only cycles.',
          ] },
        { severity: 'P0', marker: 'P0', category: 'cycle',      file: 'src/components/Editor.tsx',  line: 156, message: 'Cycle detected: components/Editor.tsx ↔ hooks/useDataFetch.ts',
          metric: 'cycle len 2', impact: 'Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.', effort: 'medium', scoreUplift: 6, cyclePath: 'src/components/Editor.tsx → src/hooks/useDataFetch.ts → src/components/Editor.tsx',
          recommendations: [
              'Lift useDataFetch into shared/hooks/ — breaks the Editor↔useDataFetch cycle without changing call sites.',
              'Extract the shared dependency into a lower-level module (types / interface / pure function).',
              'Invert one edge via dependency injection, an event bus, or a callback registry.',
              'Re-run cycle detection after each edge removal to catch regressions before they compound.',
          ] },
        { severity: 'P0', marker: 'P0', category: 'bloat',      file: 'src/services/pipeline.ts',   line: 1,   message: 'File exceeds 1000 LOC (2840 lines) — split candidate',
          metric: '2840 LOC', impact: 'Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.', effort: 'high', scoreUplift: 8,
          recommendations: [
              'Split by responsibility: extract cohesive regions into src/services/pipeline/{parse,transform,validate}.ts and re-export from a barrel index.',
              'Move pure helpers into a sibling pipeline-utils.ts and unit-test them in isolation.',
              'Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.',
              'After the split, re-run this report and confirm fan-out / depth drop before merge.',
          ] },
        { severity: 'P1', marker: 'P1', category: 'orphan',     file: 'src/legacy/migrate.js',      line: null, message: 'Orphan file: 0 inbound references for 340 days',
          metric: '0 inbound refs', impact: 'No inbound references → dead code or forgotten entry; inflates cognitive surface and bundle size.', effort: 'low', scoreUplift: 3,
          recommendations: [
              'Grep for dynamic imports / reflection / string-based resolvers before deletion.',
              'Check `git log -- src/legacy/migrate.js` for the last touch and contact prior authors.',
              'Delete in a dedicated PR; if it turns out to be needed, `git revert` is cheap.',
              'If kept as a script entry, exclude it from the report scope via .ruiignore.',
          ] },
        { severity: 'P1', marker: 'P1', category: 'depth',      file: 'src/services/pipeline.ts',   line: 1,   message: 'Max depth 9 — coupling chain exceeds 6 levels',
          metric: 'depth 9', impact: 'Deep dependency chain → brittle builds, slow cold-start, cascading test failures.', effort: 'medium', scoreUplift: 5,
          recommendations: [
              'Flatten by grouping intermediate layers into a single façade module.',
              'Introduce interfaces at the boundary to decouple runtime chains.',
              'Hoist shared utilities to a top-level lib/ so leaves do not chain through internals.',
              'Cap max-depth in CI and fail the build above an agreed threshold.',
          ] },
        { severity: 'P1', marker: 'P1', category: 'coupling',   file: 'src/types/models.ts',        line: 1,   message: 'High fan-out (28) — god object candidate',
          metric: 'fan-out 28', impact: 'God module → changes ripple to 28 dependents, raising review burden and defect propagation.', effort: 'high', scoreUplift: 6,
          recommendations: [
              'Cluster dependents by domain and split into domain-scoped façades (e.g., models/{user,billing,workflow}.ts).',
              'Apply the Interface Segregation Principle: expose only what each caller needs.',
              'Replace direct imports with a dependency-injection container for cross-cutting services.',
              'Add a module-boundary lint (e.g., dependency-cruiser) to enforce fan-out limits.',
          ] },
        { severity: 'P1', marker: 'P1', category: 'freshness',  file: 'src/legacy/migrate.js',      line: null, message: 'Stale file (340d) — review or remove',
          metric: '340d stale', impact: 'Long-untouched code → untested against current runtime; silent rot raises incident risk.', effort: 'low', scoreUplift: 4,
          recommendations: [
              'Run a coverage + typecheck pass; if green, add a "reviewed" marker and bump mtime.',
              'If there is no owner, open an ADR proposing deletion vs. revival; decide within one sprint.',
              'Verify no dynamic references via grep + CI before adding to a purge PR.',
              'If kept, add an integration test pinning current behavior before future changes.',
          ] },
        { severity: 'P2', marker: 'P2', category: 'size',       file: 'src/components/Editor.tsx',  line: 1,   message: 'File exceeds 2000 LOC (2100 lines)',
          metric: '2100 LOC', impact: 'Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.', effort: 'high', scoreUplift: 4,
          recommendations: [
              'Split into src/components/Editor/{Toolbar,Canvas,Inspector}.tsx and re-export from a barrel index.',
              'Move pure helpers into a sibling Editor-utils.ts and unit-test them in isolation.',
              'Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.',
              'After the split, re-run this report and confirm fan-out / depth drop before merge.',
          ] },
        { severity: 'P2', marker: 'P2', category: 'bloat',      file: 'src/store/reducer.ts',       line: 1,   message: 'File exceeds 1000 LOC (1950 lines)',
          metric: '1950 LOC', impact: 'Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.', effort: 'medium', scoreUplift: 4,
          recommendations: [
              'Split by domain: extract slices into src/store/{userSlice,uiSlice,apiSlice}.ts and re-export from a barrel index.',
              'Move pure selectors into a sibling selectors.ts and unit-test them in isolation.',
              'Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.',
              'After the split, re-run this report and confirm fan-out / depth drop before merge.',
          ] },
        { severity: 'P2', marker: 'P2', category: 'hotspot',    file: 'src/pages/Dashboard.tsx',    line: 98,  message: 'High fan-in + fan-out combo (6/11) — split render tree',
          metric: 'hotspot 4.6', impact: 'High fan-in × fan-out × size → a change ripples widely, raising defect risk and review cost.', effort: 'medium', scoreUplift: 5,
          recommendations: [
              'Split into src/pages/Dashboard/{ChartPanel,FilterBar,MetricsGrid}.tsx; re-export from a barrel.',
              'Introduce a façade; have callers depend on the façade instead of reaching into internals.',
              'Convert large switch/if-else dispatch into a registry/map to shrink the hot core.',
              'Add a CODEOWNERS entry and a PR-size guardrail for this file.',
          ] },
        { severity: 'P2', marker: 'P2', category: 'bloat',      file: 'src/hooks/useDataFetch.ts',  line: 1,   message: 'File exceeds 1000 LOC (1820 lines)',
          metric: '1820 LOC', impact: 'Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.', effort: 'medium', scoreUplift: 4,
          recommendations: [
              'Split by concern into src/hooks/{useFetch,useCache,useRetry}.ts and re-export from a barrel index.',
              'Move pure helpers into a sibling useDataFetch-utils.ts and unit-test them in isolation.',
              'Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.',
              'After the split, re-run this report and confirm fan-out / depth drop before merge.',
          ] },
        { severity: 'P2', marker: 'P2', category: 'bloat',      file: 'src/utils/formatters.ts',    line: 1,   message: 'File exceeds 1000 LOC (1600 lines)',
          metric: '1600 LOC', impact: 'Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.', effort: 'medium', scoreUplift: 4,
          recommendations: [
              'Split by type into src/utils/{date,number,string}-format.ts and re-export from a barrel index.',
              'Move shared primitives into a sibling format-primitives.ts and unit-test them in isolation.',
              'Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.',
              'After the split, re-run this report and confirm fan-out / depth drop before merge.',
          ] },
        { severity: 'P2', marker: 'P2', category: 'freshness',  file: 'src/utils/deadCode.ts',      line: null, message: 'Stale file (210d) — review or remove',
          metric: '210d stale', impact: 'Long-untouched code → untested against current runtime; silent rot raises incident risk.', effort: 'low', scoreUplift: 4,
          recommendations: [
              'Run a coverage + typecheck pass; if green, add a "reviewed" marker and bump mtime.',
              'If there is no owner, open an ADR proposing deletion vs. revival; decide within one sprint.',
              'Verify no dynamic references via grep + CI before adding to a purge PR.',
              'If kept, add an integration test pinning current behavior before future changes.',
          ] },
        { severity: 'P2', marker: 'P2', category: 'orphan',     file: 'src/scripts/seedDb.ts',      line: null, message: 'Orphan script — no inbound references',
          metric: '0 inbound refs', impact: 'No inbound references → dead code or forgotten entry; inflates cognitive surface and bundle size.', effort: 'low', scoreUplift: 3,
          recommendations: [
              'Grep for dynamic imports / reflection / string-based resolvers before deletion.',
              'Check `git log -- src/scripts/seedDb.ts` for the last touch and contact prior authors.',
              'Delete in a dedicated PR; if it turns out to be needed, `git revert` is cheap.',
              'If kept as a script entry, exclude it from the report scope via .ruiignore.',
          ] },
    ],

    summary: {
        totalFiles: 147,
        totalBytes: 2516582,           /* raw byte count — required by avg-size finding */
        totalBytesHuman: '2.4 MB',
        totalLines: 35400,
        maxDepth: 9,
        criticalCount: 3,
        hotspotCount: 12,
        cycleCount: 3,
        staleCount: 8,
    },

    /* ── Treemap: directory-level size breakdown ───────────────────── */
    treemap: [
        { name: 'src/components/',  bytes: 524288,  humanBytes: '512 KB' },
        { name: 'src/services/',    bytes: 393216,  humanBytes: '384 KB' },
        { name: 'src/utils/',       bytes: 262144,  humanBytes: '256 KB' },
        { name: 'src/hooks/',       bytes: 196608,  humanBytes: '192 KB' },
        { name: 'src/pages/',       bytes: 180224,  humanBytes: '176 KB' },
        { name: 'src/store/',       bytes: 131072,  humanBytes: '128 KB' },
        { name: 'src/types/',       bytes: 98304,   humanBytes: '96 KB'  },
        { name: 'src/styles/',      bytes: 81920,   humanBytes: '80 KB'  },
        { name: 'src/lib/',         bytes: 65536,   humanBytes: '64 KB'  },
        { name: 'src/legacy/',      bytes: 49152,   humanBytes: '48 KB'  },
    ],

    /* ── File-type breakdown ───────────────────────────────────────── */
    types: [
        { type: '.ts',      fileCount: 52, pctFiles: 35.4, totalBytes: 884736,  totalBytesHuman: '864 KB', pctBytes: 36.9, totalLines: 12400 },
        { type: '.tsx',     fileCount: 38, pctFiles: 25.9, totalBytes: 622592,  totalBytesHuman: '608 KB', pctBytes: 26.0, totalLines: 8700  },
        { type: '.css',     fileCount: 18, pctFiles: 12.2, totalBytes: 196608,  totalBytesHuman: '192 KB', pctBytes: 8.2,  totalLines: 3200  },
        { type: '.js',      fileCount: 14, pctFiles: 9.5,  totalBytes: 163840,  totalBytesHuman: '160 KB', pctBytes: 6.8,  totalLines: 2800  },
        { type: '.json',    fileCount: 10, pctFiles: 6.8,  totalBytes: 131072,  totalBytesHuman: '128 KB', pctBytes: 5.5,  totalLines: 1800  },
        { type: '.test.ts', fileCount: 8,  pctFiles: 5.4,  totalBytes: 147456,  totalBytesHuman: '144 KB', pctBytes: 6.2,  totalLines: 2200  },
        { type: '.md',      fileCount: 7,  pctFiles: 4.8,  totalBytes: 98304,   totalBytesHuman: '96 KB',  pctBytes: 4.1,  totalLines: 1400  },
    ],

    /* ── Size histogram buckets ────────────────────────────────────── */
    histogram: [
        { bucket: '0-200',   count: 62, pctFiles: 42.2 },
        { bucket: '200-500', count: 38, pctFiles: 25.9 },
        { bucket: '500-1K',  count: 24, pctFiles: 16.3 },
        { bucket: '1K-2K',   count: 14, pctFiles: 9.5  },
        { bucket: '2K-5K',   count: 6,  pctFiles: 4.1  },
        { bucket: '5K+',     count: 3,  pctFiles: 2.0  },
    ],

    /* ── Largest files ─────────────────────────────────────────────── */
    largest: [
        { path: 'src/services/pipeline.ts',   bytes: 98304,  bytesHuman: '96 KB',  lines: 2840, type: '.ts',  depth: 9, fanIn: 4, fanOut: 12 },
        { path: 'src/components/Editor.tsx',  bytes: 81920,  bytesHuman: '80 KB',  lines: 2100, type: '.tsx', depth: 6, fanIn: 8, fanOut: 9  },
        { path: 'src/store/reducer.ts',       bytes: 73728,  bytesHuman: '72 KB',  lines: 1950, type: '.ts',  depth: 5, fanIn: 18, fanOut: 3 },
        { path: 'src/hooks/useDataFetch.ts',  bytes: 65536,  bytesHuman: '64 KB',  lines: 1820, type: '.ts',  depth: 4, fanIn: 2, fanOut: 7  },
        { path: 'src/utils/formatters.ts',    bytes: 57344,  bytesHuman: '56 KB',  lines: 1600, type: '.ts',  depth: 3, fanIn: 12, fanOut: 2 },
        { path: 'src/pages/Dashboard.tsx',    bytes: 53248,  bytesHuman: '52 KB',  lines: 1480, type: '.tsx', depth: 7, fanIn: 6, fanOut: 11 },
        { path: 'src/types/models.ts',        bytes: 49152,  bytesHuman: '48 KB',  lines: 1350, type: '.ts',  depth: 2, fanIn: 0, fanOut: 28 },
        { path: 'src/components/Sidebar.tsx', bytes: 45056,  bytesHuman: '44 KB',  lines: 1240, type: '.tsx', depth: 5, fanIn: 3, fanOut: 6  },
        { path: 'src/styles/theme.css',       bytes: 40960,  bytesHuman: '40 KB',  lines: 1100, type: '.css', depth: 1, fanIn: 0, fanOut: 0  },
    ],

    /* ── Fan-in coupling ───────────────────────────────────────────── */
    fanin: [
        { path: 'src/types/models.ts',       fanIn: 28, fanOut: 0,  extDeps: 0, lines: 1350, type: '.ts'  },
        { path: 'src/store/reducer.ts',      fanIn: 18, fanOut: 3,  extDeps: 0, lines: 1950, type: '.ts'  },
        { path: 'src/utils/formatters.ts',   fanIn: 12, fanOut: 2,  extDeps: 0, lines: 1600, type: '.ts'  },
        { path: 'src/services/apiClient.ts', fanIn: 10, fanOut: 4,  extDeps: 1, lines: 980,  type: '.ts'  },
        { path: 'src/hooks/useAuth.ts',      fanIn: 9,  fanOut: 3,  extDeps: 1, lines: 720,  type: '.ts'  },
        { path: 'src/components/Editor.tsx', fanIn: 8,  fanOut: 9,  extDeps: 2, lines: 2100, type: '.tsx' },
        { path: 'src/pages/Dashboard.tsx',   fanIn: 6,  fanOut: 11, extDeps: 0, lines: 1480, type: '.tsx' },
        { path: 'src/services/pipeline.ts',  fanIn: 4,  fanOut: 12, extDeps: 0, lines: 2840, type: '.ts'  },
    ],

    /* ── Fan-out coupling ──────────────────────────────────────────── */
    fanout: [
        { path: 'src/types/models.ts',       fanIn: 28, fanOut: 28, extDeps: 0, lines: 1350, type: '.ts'  },
        { path: 'src/services/pipeline.ts',  fanIn: 4,  fanOut: 12, extDeps: 0, lines: 2840, type: '.ts'  },
        { path: 'src/pages/Dashboard.tsx',   fanIn: 6,  fanOut: 11, extDeps: 0, lines: 1480, type: '.tsx' },
        { path: 'src/components/Editor.tsx', fanIn: 8,  fanOut: 9,  extDeps: 2, lines: 2100, type: '.tsx' },
        { path: 'src/hooks/useDataFetch.ts', fanIn: 2,  fanOut: 7,  extDeps: 2, lines: 1820, type: '.ts'  },
        { path: 'src/components/Sidebar.tsx',fanIn: 3,  fanOut: 6,  extDeps: 0, lines: 1240, type: '.tsx' },
        { path: 'src/services/apiClient.ts', fanIn: 10, fanOut: 4,  extDeps: 1, lines: 980,  type: '.ts'  },
        { path: 'src/hooks/useAuth.ts',      fanIn: 9,  fanOut: 3,  extDeps: 1, lines: 720,  type: '.ts'  },
    ],

    /* ── Hotspot files (risk score > threshold) ────────────────────── */
    hotspots: [
        { path: 'src/services/pipeline.ts',   bytes: 98304,  bytesHuman: '96 KB',  lines: 2840, type: '.ts',  fanIn: 4,  fanOut: 12, maxDepth: 9,  score: 92 },
        { path: 'src/components/Editor.tsx',  bytes: 81920,  bytesHuman: '80 KB',  lines: 2100, type: '.tsx', fanIn: 8,  fanOut: 9,  maxDepth: 6,  score: 78 },
        { path: 'src/legacy/migrate.js',      bytes: 32768,  bytesHuman: '32 KB',  lines: 920,  type: '.js',  fanIn: 0,  fanOut: 0,  maxDepth: 1,  score: 75 },
        { path: 'src/store/reducer.ts',       bytes: 73728,  bytesHuman: '72 KB',  lines: 1950, type: '.ts',  fanIn: 18, fanOut: 3,  maxDepth: 5,  score: 68 },
        { path: 'src/pages/Dashboard.tsx',    bytes: 53248,  bytesHuman: '52 KB',  lines: 1480, type: '.tsx', fanIn: 6,  fanOut: 11, maxDepth: 7,  score: 64 },
    ],

    /* ── Orphan files (fan-in + fan-out == 0) ──────────────────────── */
    orphans: [
        { path: 'src/legacy/migrate.js',     bytes: 32768, bytesHuman: '32 KB', lines: 920,  type: '.js',  fanIn: 0, fanOut: 0, maxDepth: 1, score: 75 },
        { path: 'src/scripts/seedDb.ts',     bytes: 12288, bytesHuman: '12 KB', lines: 340,  type: '.ts',  fanIn: 0, fanOut: 0, maxDepth: 1, score: 35 },
        { path: 'src/utils/deadCode.ts',     bytes: 8192,  bytesHuman: '8 KB',  lines: 210,  type: '.ts',  fanIn: 0, fanOut: 0, maxDepth: 1, score: 28 },
    ],

    /* ── Depth statistics ──────────────────────────────────────────── */
    depthStats: { max: 9, mean: 3.2, median: 3, p90: 6, filesAtMax: 2 },
    depthRanking: [
        { path: 'src/services/pipeline.ts',   bytes: 98304,  bytesHuman: '96 KB',  lines: 2840, type: '.ts',  fanIn: 4,  fanOut: 12, maxDepth: 9, score: 92 },
        { path: 'src/pages/Dashboard.tsx',    bytes: 53248,  bytesHuman: '52 KB',  lines: 1480, type: '.tsx', fanIn: 6,  fanOut: 11, maxDepth: 7, score: 64 },
        { path: 'src/components/Editor.tsx',  bytes: 81920,  bytesHuman: '80 KB',  lines: 2100, type: '.tsx', fanIn: 8,  fanOut: 9,  maxDepth: 6, score: 78 },
        { path: 'src/components/Sidebar.tsx', bytes: 45056,  bytesHuman: '44 KB',  lines: 1240, type: '.tsx', fanIn: 3,  fanOut: 6,  maxDepth: 5, score: 45 },
        { path: 'src/store/reducer.ts',       bytes: 73728,  bytesHuman: '72 KB',  lines: 1950, type: '.ts',  fanIn: 18, fanOut: 3,  maxDepth: 5, score: 68 },
    ],

    /* ── Cyclic dependencies ───────────────────────────────────────── */
    cycles: [
        { severity: 'critical', path: 'src/store/reducer.ts → src/services/apiClient.ts → src/store/reducer.ts', length: 2, suggestedFix: 'extract shared interface to src/types/' },
        { severity: 'critical', path: 'src/components/Editor.tsx → src/hooks/useDataFetch.ts → src/components/Editor.tsx', length: 2, suggestedFix: 'lift useDataFetch to shared hooks/' },
        { severity: 'warn',     path: 'src/utils/formatters.ts → src/lib/parsers.ts → src/utils/formatters.ts', length: 2, suggestedFix: 'move parse helpers into formatters.ts' },
    ],

    /* ── Freshness (file age in days) ──────────────────────────────── */
    freshness: [
        { path: 'src/legacy/migrate.js',     ageDays: 340, lastModified: '2025-08-05', lastModifiedHuman: '2025-08-05', type: '.js',  lines: 920  },
        { path: 'src/utils/deadCode.ts',     ageDays: 210, lastModified: '2025-12-13', lastModifiedHuman: '2025-12-13', type: '.ts',  lines: 210  },
        { path: 'src/styles/theme.css',      ageDays: 180, lastModified: '2026-01-12', lastModifiedHuman: '2026-01-12', type: '.css', lines: 1100 },
        { path: 'src/types/models.ts',       ageDays: 90,  lastModified: '2026-04-12', lastModifiedHuman: '2026-04-12', type: '.ts',  lines: 1350 },
        { path: 'src/services/pipeline.ts',  ageDays: 14,  lastModified: '2026-06-27', lastModifiedHuman: '2026-06-27', type: '.ts',  lines: 2840 },
        { path: 'src/components/Editor.tsx', ageDays: 7,   lastModified: '2026-07-04', lastModifiedHuman: '2026-07-04', type: '.tsx', lines: 2100 },
        { path: 'src/pages/Dashboard.tsx',   ageDays: 2,   lastModified: '2026-07-09', lastModifiedHuman: '2026-07-09', type: '.tsx', lines: 1480 },
    ],
    freshnessBuckets: [
        { bucket: '0-30d',    count: 62, pctFiles: 42.2 },
        { bucket: '30-90d',   count: 48, pctFiles: 32.7 },
        { bucket: '90-180d',  count: 24, pctFiles: 16.3 },
        { bucket: '180-365d', count: 10, pctFiles: 6.8  },
        { bucket: '365d+',    count: 3,  pctFiles: 2.0  },
    ],
    freshnessStats: { asOf: 1751596800000, asOfHuman: '2026-07-11', maxAge: 340, median: 42, p90: 195, staleCount: 8, criticalCount: 3 },

    /* ── Full record list (kept here for Export JSON / Export CSV) ────── */
    records: [],
    adjacency: {},

    /* ═══════════════════════════════════════════════════════════════════════
     * Self-Improvement Analysis
     * Chart-first diagnostics: severity mix, risk vectors, ranked levers,
     * remediation roadmap, and decay forecast.
     *
     * Contract (all fields required; Vue computed props depend on these keys):
     *   - severityDonut: { p0, p1, p2, total }
     *   - riskVectors:   [{ dimension, score, weight, p0, p1, p2 }]
     *   - levers:        [{ rank, dimension, severity, kind, action, file?, line?, scoreUplift, effort }]
     *   - benchmarks:    { currentGrade, currentValue, targetGrade, targetValue, gapToNext }
     *   - remediationPlan: { phases: [{ phase, severity, itemCount, estUplift, projected, deadline }], currentScore, projectedScoreIfAllP0P1Remediated }
     *   - decayForecast: { currentScore, projectedNext, delta, rationale }
     *   - narrative:     string[]
     *   - topP0:         [{ action, file?, line?, severity }]
     *   - focusArea:     { dimName, score, why, hint }
     *   - trendInsight:  string
     *   - weightsHint:   string
     * ═════════════════════════════════════════════════════════════════════ */
    selfImprovement: {
        /* ── Top P0 actions ─────────────────────────────────────── */
        topP0: [
            { action: 'Break pipeline.ts into pipeline/{parse,transform,validate}.ts', file: 'src/services/pipeline.ts', line: 1, severity: 'P0' },
            { action: 'Resolve store↔apiClient cycle via interface extraction',       file: 'src/store/reducer.ts',       line: 42, severity: 'P0' },
            { action: 'Break Editor↔useDataFetch cycle by lifting hook',               file: 'src/components/Editor.tsx',  line: 156, severity: 'P0' },
            { action: 'Delete or integrate orphan migrate.js',                         file: 'src/legacy/migrate.js',      line: null, severity: 'P0' },
        ],

        /* ── Focus area ──────────────────────────────────────────── */
        focusArea: {
            dimName: 'Coupling (fan-out)',
            score: 38,
            why: 'Excessive fan-out in pipeline.ts (12) and Dashboard.tsx (11) drives tight coupling. Combined with 3 cyclic dependencies, this dimension is the primary drag on overall health.',
            hint: 'Invest 2–3 days refactoring the top 3 fan-out hotspots. Expected uplift: +15–20 pts.'
        },

        /* ── Trend insight & weights ─────────────────────────────── */
        trendInsight: 'Score improved from 55 → 62 this quarter (+7 pts). Depth and size dimensions are stable; coupling and staleness are the key risks.',
        weightsHint: 'Consider increasing Coupling weight from 0.20 → 0.25 given its outsized impact on cycle risk.',

        /* ── Narrative summary (executive readout) ────────────────── */
        narrative: [
            'Overall health at 62/100 (grade C) — moderate risk with clear remediation path.',
            '3 critical (P0) and 1 major (P1) alert active. Primary risks cluster around Coupling (3 cycles, high fan-out) and Staleness (8 files > 180d).',
            'Top lever: refactor pipeline.ts (+18 pts). Remediation roadmap projects 89/100 after P0+P1 closure.',
            'Score 62 | grade C | gap 13 pts to B | projected 89 after plan | decay risk: –2 pts/quarter without action'
        ],

        /* ── Severity donut chart data ────────────────────────────── */
        severityDonut: { p0: 3, p1: 4, p2: 8, total: 15 },

        /* ── Risk vectors (dimension-level scores) ────────────────── */
        riskVectors: [
            { dimension: 'Depth',         score: 82, weight: 0.15, p0: 0, p1: 0, p2: 2 },
            { dimension: 'Size',          score: 71, weight: 0.20, p0: 0, p1: 1, p2: 3 },
            { dimension: 'Coupling',      score: 38, weight: 0.20, p0: 3, p1: 1, p2: 1 },
            { dimension: 'Duplication',   score: 65, weight: 0.10, p0: 0, p1: 1, p2: 1 },
            { dimension: 'Complexity',    score: 58, weight: 0.15, p0: 0, p1: 1, p2: 1 },
            { dimension: 'Staleness',     score: 44, weight: 0.20, p0: 0, p1: 1, p2: 2 },
        ],

        /* ── Top remediation levers ───────────────────────────────── */
        levers: [
            { rank: 1, dimension: 'Coupling',  severity: 'P0', kind: 'refactor', action: 'Decompose pipeline.ts into pipeline/{parse,transform,validate}.ts — breaks fan-out from 12→4 and drops depth from 9→4', file: 'src/services/pipeline.ts',   line: 1,   scoreUplift: 18, effort: 'high'    },
            { rank: 2, dimension: 'Coupling',  severity: 'P0', kind: 'refactor', action: 'Extract IApiClient interface to src/types/ — resolves store↔apiClient cycle',                                    file: 'src/store/reducer.ts',       line: 42,  scoreUplift: 12, effort: 'medium'  },
            { rank: 3, dimension: 'Staleness', severity: 'P1', kind: 'cleanup',  action: 'Review and archive 8 stale files (180d+). Migrate.js is the highest risk — delete or integrate.',                file: 'src/legacy/migrate.js',      line: null, scoreUplift: 8,  effort: 'low'     },
            { rank: 4, dimension: 'Coupling',  severity: 'P0', kind: 'refactor', action: 'Lift useDataFetch into shared/hooks/ — breaks Editor↔useDataFetch cycle',                                         file: 'src/components/Editor.tsx',  line: 156, scoreUplift: 7,  effort: 'medium'  },
            { rank: 5, dimension: 'Complexity',severity: 'P1', kind: 'refactor', action: 'Simplify Dashboard.tsx render tree — split into Dashboard/{ChartPanel,FilterBar,MetricsGrid}.tsx',                file: 'src/pages/Dashboard.tsx',    line: 98,  scoreUplift: 5,  effort: 'medium'  },
            { rank: 6, dimension: 'Size',      severity: 'P2', kind: 'split',    action: 'Split Editor.tsx monolithic component into Editor/{Toolbar,Canvas,Inspector}.tsx',                                file: 'src/components/Editor.tsx',  line: 1,   scoreUplift: 4,  effort: 'high'    },
            { rank: 7, dimension: 'Duplication',severity:'P2', kind: 'dedupe',   action: 'Extract shared date/number formatters into src/lib/format.ts — DRY up formatters.ts and Dashboard.tsx',           file: 'src/utils/formatters.ts',    line: 24,  scoreUplift: 3,  effort: 'low'     },
        ],

        /* ── Benchmark grading ────────────────────────────────────── */
        benchmarks: { currentGrade: 'C', currentValue: 62, targetGrade: 'B', targetValue: 75, gapToNext: 13 },

        /* ── Remediation roadmap ──────────────────────────────────── */
        remediationPlan: {
            phases: [
                { phase: 'P0 — Blocking fixes (this sprint)', severity: 'P0', itemCount: 3, estUplift: 18, projected: 80, deadline: '2 weeks'    },
                { phase: 'P1 — Important (next sprint)',      severity: 'P1', itemCount: 4, estUplift: 9,  projected: 89, deadline: '4 weeks'    },
                { phase: 'P2 — Nice-to-have (this quarter)',  severity: 'P2', itemCount: 8, estUplift: 6,  projected: 95, deadline: 'this quarter' },
            ],
            currentScore: 62,
            projectedScoreIfAllP0P1Remediated: 89,
        },

        /* ── Decay forecast ───────────────────────────────────────── */
        decayForecast: { currentScore: 62, projectedNext: 60, delta: -2, rationale: 'Without action, coupling debt grows ~1 pt/quarter (new imports) and staleness accumulates ~1 pt/quarter (aging files). Estimated –2 pts next run if no remediation.' },
    },
};

/* ── Demo-only enrichment fallback ─────────────────────────────────────
   When a sample alert omits the professional detail fields
   (risk / blastRadius / estimatedHours / acceptance / firstStep /
   tooling / preventiveControls / rollbackPlan), fill them from category
   defaults so the rendered demo page always shows the full professional
   detail block. The analyzer's own `enrichAlert()` produces these for
   real runs; this block only affects the shipped demo data. */
(function () {
    const byCategory = {
        bloat: {
            risk: 'If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.',
            blastRadius: 'file-local + reviewers',
            estimatedHours: 8,
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
        size: {
            risk: 'If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.',
            blastRadius: 'file-local + reviewers',
            estimatedHours: 8,
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
        cycle: {
            risk: 'If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.',
            blastRadius: 'cycle members + their transitive importers',
            estimatedHours: 6,
            acceptance: ['Cycle detection returns 0 cycles touching any original member.', 'Bundled output size does not increase beyond noise.', 'Cold-start / first-paint unchanged or improved.'],
            firstStep: 'Run `madge --circular <entry>` to list every edge in the cycle, then pick the edge whose removal breaks the loop with the smallest diff.',
            tooling: [
                { name: 'madge', hint: 'detects + visualizes circular dependencies across JS/TS' },
                { name: 'dependency-cruiser', hint: 'fails CI on any new cycle, with auto-generated baseline' },
                { name: 'circular-dependency-plugin', hint: 'webpack build-time warning for runtime cycles' },
            ],
            preventiveControls: ['CI: dependency-cruiser rule `no-circular` on the affected subgraph.', 'Pre-commit: madge --circular on staged import graphs.', 'PR template: checkbox "Confirmed no new circular imports introduced".'],
            rollbackPlan: 'Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release.',
        },
        hotspot: {
            risk: 'If left unfixed: any change here risks cascading defects across multiple call sites and inflates the blast radius of every release.',
            blastRadius: 'inbound + outbound edges across the graph',
            estimatedHours: 8,
            acceptance: ['Hotspot score drops below 5.0 on the next analyzer run.', 'Fan-out decreases or moves behind a façade boundary.', 'CODEOWNERS entry added and enforced.'],
            firstStep: 'Grep for all importers and group them by domain — the largest cluster becomes the first façade to extract.',
            tooling: [
                { name: 'dependency-cruiser', hint: 'enforce fan-in / fan-out limits per module' },
                { name: 'knip', hint: 'surface unused exports the façade can drop' },
                { name: 'CodeSee', hint: 'visualize the dependency map around this hotspot' },
            ],
            preventiveControls: ['CI: fail if hotspot score on this file regresses beyond 5.0.', 'CODEOWNERS: require 2 reviewers from the owning team.', 'PR-size guard: cap diff size on this file at 200 LOC per PR.'],
            rollbackPlan: 'Revert the façade PR; callers go back to importing internals directly. Keep the façade module empty but re-exported for one release.',
        },
        orphan: {
            risk: 'If left unfixed: drift between dead code and live APIs accumulates; future readers may revive stale behavior assuming it is current.',
            blastRadius: '0 dependents (direct) — risk is deletion-safety, not ripple',
            estimatedHours: 2,
            acceptance: ['No dynamic references found via grep across the repo.', 'Build + test suite green after deletion.', 'Bundle size does not increase.'],
            firstStep: 'Run `git log --oneline -5 -- <file>` and grep for require/import of the basename — if both empty, deletion is safe.',
            tooling: [
                { name: 'knip', hint: 'automated dead-code detection across the repo' },
                { name: 'ts-prune', hint: 'finds unused TypeScript exports' },
                { name: 'depcheck', hint: 'flags unused dependencies and files' },
            ],
            preventiveControls: ['CI: knip --exit-code on every PR so dead code never lands.', 'Pre-commit: warn on new files with 0 inbound references after 30 days.', '.ruiignore: explicit allow-list for intentional script entries.'],
            rollbackPlan: 'Trivial — `git revert <merge>`. No inbound references means no call-site fixup. Keep the deletion in its own PR to make revert surgical.',
        },
        depth: {
            risk: 'If left unfixed: cold-start and CI time grow with each new layer; a leaf change can fail tests in unrelated subtrees.',
            blastRadius: 'transitive dependents along the chain',
            estimatedHours: 8,
            acceptance: ['Max dependency depth drops below the project threshold.', 'Cold-start / first-import time unchanged or improved.', 'CI max-depth guard added and passing.'],
            firstStep: 'Run `madge --depth <entry>` and trace the single deepest path — the leaf at the bottom is where hoisting starts.',
            tooling: [
                { name: 'madge', hint: 'reports max depth per entry; visualize as a tree' },
                { name: 'dependency-cruiser', hint: 'enforce max-depth rules in CI' },
                { name: 'bundle-analyzer', hint: 'see which layers contribute to cold-start' },
            ],
            preventiveControls: ['CI: dependency-cruiser rule `max-depth` at 6, fail above.', 'PR template: checkbox "No new import chain exceeds 6 levels".', 'ModuleOwnership map: require owner review for any new layer.'],
            rollbackPlan: 'Revert the façade commit; original intermediate layers reappear. Keep the façade file as a thin re-export for one release.',
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
                { name: 'ts-morph', hint: 'script bulk refactors of import paths' },
            ],
            preventiveControls: ['CI: dependency-cruiser rule `no-god-modules` at fan-out 20.', 'CODEOWNERS: require owning-team review on any PR adding a new importer.', 'PR template: checkbox "Confirmed fan-out did not increase".'],
            rollbackPlan: 'Revert the façade-split PR; callers fall back to importing the original god module. Keep façade files as re-exports for one release.',
        },
        freshness: {
            risk: 'If left unfixed: runtime drift goes undetected until the code path is exercised in production, typically during an incident.',
            blastRadius: 'self + any untested dynamic callers',
            estimatedHours: 3,
            acceptance: ['Coverage + typecheck pass recorded in the PR description.', 'Either deleted, added to .ruiignore, or covered by a new integration test.', 'ADR linked if ownership is ambiguous.'],
            firstStep: 'Run `git log --since="6 months ago" -- <file>`; if empty, ping the last committer and ask: delete or revive?',
            tooling: [
                { name: 'knip', hint: 'flags stale, unreferenced files' },
                { name: 'age-check', hint: 'CI guard that fails on files untouched > N days' },
                { name: 'coverage diff', hint: 'confirm the stale path is actually exercised' },
            ],
            preventiveControls: ['CI: monthly sweep flagging files untouched > 180 days.', 'CODEOWNERS: every directory has a named owner.', 'ADR template: "stale file" decision record linked from PR.'],
            rollbackPlan: 'If deleted: `git revert <merge>` re-creates the file. If kept: bump mtime via an empty touch commit and add the new integration test in the same PR.',
        },
    };
    const alerts = (window.REPORT_DATA && window.REPORT_DATA.alerts) || [];
    for (const a of alerts) {
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
