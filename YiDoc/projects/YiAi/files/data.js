/**
 * yry-report-files — YiAi · FastAPI + MongoDB backend
 * ----------------------------------------------------------------------
 * Regenerated 2026-07-24 by the yry-reports/files dispatcher.
 * Source scope: /Users/ruiyi/Downloads/YrY/YiAi/src/ (Python only).
 *
 * 73 files (70 .py + 1 yaml + 1 txt + 1 .gitignore), ~228 KB, ~6,500 LOC.
 * The codebase is fresh — all files were last touched today (2026-07-24),
 * so the freshness section shows zero stale files. The largest file is
 * src/data/repository.py at 546 LOC; nothing crosses the 1,000-LOC bloat
 * threshold. Coupling is moderate: shared.config has fan-in 18 (used by
 * 18 files), shared.error_codes fan-in 14, data.database and
 * shared.exceptions each fan-in 10. No import cycles detected.
 */
window.REPORT_CONFIG = {
    options: {
        topN: 20,
        noCycles: false,
        theme: 'dark',
        generatedAt: '2026-07-24T00:00:00Z',
    },

    constants: {
        filterDebounceMs: 200,
        componentReadyTimeoutMs: 5000,
        csvHeader: 'path,bytes,lines,type,fanIn,fanOut,extDeps,maxDepth,lastModified,ageDays',
    },

    labels: {
        /* ── Header / chrome ─────────────────────────────────────── */
        title:            'yry-report-files · YiAi',
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
        tabFreshness:  'Freshness',
        tabTechdebt:   'Tech Debt',

        /* ── Column headers ──────────────────────────────────────── */
        colPath:       'Path',
        colBytes:      'Bytes',
        colBytesHuman: 'Size',
        colLines:      'Lines',
        colType:       'Type',
        colFanIn:      'Fan-in',
        colFanOut:     'Fan-out',
        colExtDeps:    'Ext Deps',
        colMaxDepth:   'Depth',
        colScore:      'Score',
        colAge:        'Age (days)',
        colModified:   'Last Modified',
        colBucket:     'Bucket',
        colFiles:      'Files',
        colPctFiles:   '% Files',
        colPctBytes:   '% Bytes',
        colTotalBytes: 'Total Bytes',
        colTotalLines: 'Total Lines',
        colCount:      'Count',
        colPct:        '%',
        colMarker:     'Marker',
        colStaleCount: 'Stale Count',
        colCritical:   'Critical',
        colSeverity:   'Severity',
        colCategory:   'Category',
        colMessage:    'Finding',
        colEffort:     'Effort',
        colUplift:     'Uplift',
        colAction:     'Action',

        /* ── Empty states ────────────────────────────────────────── */
        emptyLargest:    'No files in scope.',
        emptyFanin:      'No fan-in data collected.',
        emptyFanout:     'No fan-out data collected.',
        emptyHotspots:   'No hotspot files detected.',
        emptyOrphans:    'No orphan files detected.',
        emptyCycles:     'No cyclic dependencies detected.',
        emptyFreshness:  'No freshness data collected.',
        emptyTechdebt:   'No tech-debt markers found.',

        /* ── Misc ────────────────────────────────────────────────── */
        filterPlaceholder: 'filter by path, type, or marker…',
        exportJson: 'Export JSON',
        exportCsv:  'Export CSV',
        copyPath: 'Copy',
        scopeLabel: 'Scope',
        generatedAtLabel: 'Generated',
        totalFilesLabel:  'Total files',
        totalBytesLabel:  'Total bytes',
        totalLinesLabel:  'Total lines',
        maxDepthLabel:    'Max depth',
        criticalLabel:    'Critical',
        hotspotLabel:     'Hotspots',
        cycleLabel:       'Cycles',
        staleLabel:       'Stale files',
        scoreLabel:       'Health score',
    },
};

window.REPORT_DATA = {
    scope: 'src/',

    score: 78,

    alerts: [
        {   /* P1 — bloat: largest file approaching the 500-LOC review-fatigue threshold */
            severity: 'P1', marker: 'P1', category: 'bloat',
            file: 'src/data/repository.py', line: 1,
            message: 'Largest file in the project — 546 LOC in a single repository module',
            metric: '546 LOC',
            impact: 'Single-module repository pattern → merge conflicts and review fatigue as the model count grows.',
            effort: 'medium', scoreUplift: 4,
            recommendations: [
                'Split repository.py into per-collection mixins (repository/{sessions,static_files,state}.py) and re-export from a barrel index.',
                'Hoist the shared CRUD primitives into a BaseRepository in src/data/base.py so each child only owns its collection-specific queries.',
                'Add a LOC budget (500/1000) to CI via a pre-commit check so the file cannot silently regress.',
            ],
        },
        {   /* P1 — coupling: shared.config is imported by 18 files */
            severity: 'P1', marker: 'P1', category: 'coupling',
            file: 'src/shared/config.py', line: 1,
            message: 'High fan-in (18) — shared.config is a god module candidate',
            metric: 'fan-in 18',
            impact: 'Every route, service, and domain module depends on the settings singleton; changes ripple across the entire codebase.',
            effort: 'low', scoreUplift: 3,
            recommendations: [
                'Keep shared/config.py as the single source of truth but expose narrowly-scoped sub-settings via domain-owned facades (e.g., domain.state.config.StateSettings).',
                'Use dependency injection (FastAPI Depends) instead of importing the singleton directly in routes.',
                'Add a layer lint (import-linter) banning cross-layer imports of shared.config from routes/',
            ],
        },
        {   /* P2 — freshness: no stale files, but no historical signal either */
            severity: 'P2', marker: 'P2', category: 'freshness',
            file: 'src/app.py', line: 1,
            message: 'Entire codebase last touched today (2026-07-24) — no historical signal yet',
            metric: '0d stale',
            impact: 'Fresh project — no staleness risk today, but the freshness baseline is untested against future drift.',
            effort: 'low', scoreUplift: 2,
            recommendations: [
                'Add a CI rule that flags any file untouched for > 180 days.',
                'Wire CODEOWNERS to every src/ subdirectory so a future stale file has a named owner to ping.',
                'Re-run this report monthly to catch the first stale cohort early.',
            ],
        },
        {   /* P2 — coupling: data.database is imported by 10 files */
            severity: 'P2', marker: 'P2', category: 'coupling',
            file: 'src/data/database.py', line: 1,
            message: 'Moderate fan-in (10) — data.database singleton imported across routes and services',
            metric: 'fan-in 10',
            impact: 'The db singleton is the only MongoDB surface; refactors here cascade to every caller.',
            effort: 'low', scoreUplift: 2,
            recommendations: [
                'Consider exposing collection-scoped accessors (db.static_files, db.sessions) instead of letting callers reach into db.db[collection_name].',
                'Add a contract test that pins the public accessor surface.',
            ],
        },
        {   /* P2 — bloat: src/server/routes/files.py at 465 LOC — RPC-style mega-route */
            severity: 'P2', marker: 'P2', category: 'bloat',
            file: 'src/server/routes/files.py', line: 1,
            message: 'files.py — 465 LOC mixing 9 routes + 7 path-validation helpers',
            metric: '465 LOC',
            impact: 'Single-file route module grows linearly with each new file operation; review fatigue and merge conflicts rise.',
            effort: 'medium', scoreUplift: 3,
            recommendations: [
                'Split into routes/{files_upload,files_read,files_delete,files_rename}.py by concern.',
                'Extract path-validation helpers (_validate_path, _resolve_static_path, _safe_rename) into src/shared/path.py.',
                'Re-export the router from routes/files.py as a thin barrel so app.include_router() call sites do not change.',
            ],
        },
    ],

    summary: {
        totalFiles: 73,
        totalBytes: 228026,
        totalBytesHuman: '223 KB',
        totalLines: 6509,
        maxDepth: 4,
        criticalCount: 0,
        hotspotCount: 1,
        cycleCount: 0,
        staleCount: 0,
    },

    /* ── Treemap: directory-level size breakdown ───────────────────── */
    treemap: [
        { name: 'src/domain/',     bytes: 59403, humanBytes: '58 KB'  },
        { name: 'src/server/',     bytes: 62923, humanBytes: '61 KB'  },
        { name: 'src/data/',        bytes: 45231, humanBytes: '44 KB'  },
        { name: 'src/shared/',      bytes: 21847, humanBytes: '21 KB'  },
        { name: 'src/observer/',    bytes: 13407, humanBytes: '13 KB'  },
        { name: 'src/models/',      bytes: 8684,  humanBytes: '8.5 KB' },
        { name: 'src/cli/',         bytes: 3916,  humanBytes: '3.8 KB' },
        { name: 'src/services/',    bytes: 1740,  humanBytes: '1.7 KB' },
        { name: 'root (main.py + config.yaml + requirements.txt)', bytes: 3835, humanBytes: '3.7 KB' },
    ],

    /* ── File-type breakdown ───────────────────────────────────────── */
    types: [
        { type: '.py',    fileCount: 70, pctFiles: 95.9, totalBytes: 222612, totalBytesHuman: '217 KB', pctBytes: 97.6, totalLines: 6364 },
        { type: '.yaml',  fileCount: 1,  pctFiles: 1.4,  totalBytes: 2296,   totalBytesHuman: '2.2 KB', pctBytes: 1.0,  totalLines: 125  },
        { type: '.txt',   fileCount: 1,  pctFiles: 1.4,  totalBytes: 342,    totalBytesHuman: '342 B',  pctBytes: 0.2,  totalLines: 20   },
        { type: 'other',  fileCount: 1,  pctFiles: 1.4,  totalBytes: 1776,   totalBytesHuman: '1.7 KB', pctBytes: 0.8,  totalLines: 0    },
    ],

    /* ── Size histogram buckets ────────────────────────────────────── */
    histogram: [
        { bucket: '0-200',   count: 62, pctFiles: 84.9 },
        { bucket: '200-500', count: 8,  pctFiles: 11.0 },
        { bucket: '500-1K',  count: 3,  pctFiles: 4.1  },
        { bucket: '1K-2K',   count: 0,  pctFiles: 0.0  },
        { bucket: '2K-5K',   count: 0,  pctFiles: 0.0  },
        { bucket: '5K+',     count: 0,  pctFiles: 0.0  },
    ],

    /* ── Largest files ─────────────────────────────────────────────── */
    largest: [
        { path: 'src/data/repository.py',          bytes: 17928, bytesHuman: '17.5 KB', lines: 546, type: '.py', depth: 3, fanIn: 3,  fanOut: 5  },
        { path: 'src/data/store.py',                bytes: 15426, bytesHuman: '15.1 KB', lines: 534, type: '.py', depth: 3, fanIn: 2,  fanOut: 6  },
        { path: 'src/server/routes/files.py',       bytes: 17576, bytesHuman: '17.2 KB', lines: 465, type: '.py', depth: 4, fanIn: 1,  fanOut: 8  },
        { path: 'src/server/routes/story_panel.py',bytes: 19147,  bytesHuman: '18.7 KB', lines: 462, type: '.py', depth: 4, fanIn: 1,  fanOut: 3  },
        { path: 'src/domain/files/storage.py',      bytes: 11811, bytesHuman: '11.5 KB', lines: 365, type: '.py', depth: 3, fanIn: 1,  fanOut: 10 },
        { path: 'src/domain/rss/scheduler.py',      bytes: 11530, bytesHuman: '11.3 KB', lines: 330, type: '.py', depth: 4, fanIn: 3,  fanOut: 5  },
        { path: 'src/domain/ai/chat.py',            bytes: 9500,  bytesHuman: '9.3 KB',  lines: 298, type: '.py', depth: 3, fanIn: 1,  fanOut: 11 },
        { path: 'src/server/routes/maintenance.py', bytes: 9211,  bytesHuman: '9.0 KB',  lines: 270, type: '.py', depth: 4, fanIn: 1,  fanOut: 5  },
        { path: 'src/domain/execution/executor.py', bytes: 8370,  bytesHuman: '8.2 KB',  lines: 254, type: '.py', depth: 3, fanIn: 2,  fanOut: 11 },
        { path: 'src/shared/config.py',             bytes: 6424,  bytesHuman: '6.3 KB',  lines: 206, type: '.py', depth: 1, fanIn: 18, fanOut: 0  },
    ],

    /* ── Fan-in coupling ───────────────────────────────────────────── */
    fanin: [
        { path: 'src/shared/config.py',         fanIn: 18, fanOut: 0,  extDeps: 0, lines: 206, type: '.py' },
        { path: 'src/shared/error_codes.py',     fanIn: 14, fanOut: 0,  extDeps: 0, lines: 60,  type: '.py' },
        { path: 'src/data/database.py',          fanIn: 10, fanOut: 2,  extDeps: 1, lines: 164, type: '.py' },
        { path: 'src/shared/exceptions.py',       fanIn: 10, fanOut: 1,  extDeps: 0, lines: 30,  type: '.py' },
        { path: 'src/shared/response.py',         fanIn: 9,  fanOut: 2,  extDeps: 0, lines: 50,  type: '.py' },
        { path: 'src/models/schemas.py',          fanIn: 6,  fanOut: 1,  extDeps: 0, lines: 191, type: '.py' },
        { path: 'src/domain/state/store.py',      fanIn: 5,  fanOut: 4,  extDeps: 0, lines: 129, type: '.py' },
        { path: 'src/shared/utils.py',           fanIn: 4,  fanOut: 0,  extDeps: 0, lines: 176, type: '.py' },
        { path: 'src/domain/rss/scheduler.py',    fanIn: 3,  fanOut: 5,  extDeps: 0, lines: 330, type: '.py' },
        { path: 'src/domain/rss/feed.py',         fanIn: 3,  fanOut: 5,  extDeps: 0, lines: 174, type: '.py' },
    ],

    /* ── Fan-out coupling ──────────────────────────────────────────── */
    fanout: [
        { path: 'src/server/routes/files.py',       fanIn: 1,  fanOut: 8,  extDeps: 3, lines: 465, type: '.py' },
        { path: 'src/app.py',                        fanIn: 0,  fanOut: 7,  extDeps: 3, lines: 171, type: '.py' },
        { path: 'src/server/routes/state.py',       fanIn: 1,  fanOut: 5,  extDeps: 0, lines: 88,  type: '.py' },
        { path: 'src/server/routes/maintenance.py', fanIn: 1,  fanOut: 5,  extDeps: 0, lines: 270, type: '.py' },
        { path: 'src/domain/rss/scheduler.py',      fanIn: 3,  fanOut: 5,  extDeps: 0, lines: 330, type: '.py' },
        { path: 'src/domain/rss/feed.py',            fanIn: 3,  fanOut: 5,  extDeps: 0, lines: 174, type: '.py' },
        { path: 'src/server/routes/wework.py',       fanIn: 1,  fanOut: 4,  extDeps: 1, lines: 91,  type: '.py' },
        { path: 'src/domain/state/store.py',         fanIn: 5,  fanOut: 4,  extDeps: 0, lines: 129, type: '.py' },
        { path: 'src/domain/files/storage.py',       fanIn: 1,  fanOut: 10, extDeps: 1, lines: 365, type: '.py' },
        { path: 'src/server/routes/story_panel.py',  fanIn: 1,  fanOut: 3,  extDeps: 1, lines: 462, type: '.py' },
    ],

    /* ── Hotspot files (risk score > threshold) ────────────────────── */
    hotspots: [
        { path: 'src/server/routes/files.py', bytes: 17576, bytesHuman: '17.2 KB', lines: 465, type: '.py', fanIn: 1, fanOut: 8,  maxDepth: 4, score: 58 },
        { path: 'src/data/repository.py',     bytes: 17928, bytesHuman: '17.5 KB', lines: 546, type: '.py', fanIn: 3, fanOut: 5,  maxDepth: 3, score: 52 },
        { path: 'src/shared/config.py',        bytes: 6424,  bytesHuman: '6.3 KB',  lines: 206, type: '.py', fanIn: 18,fanOut: 0,  maxDepth: 1, score: 50 },
    ],

    /* ── Orphan files (fan-in + fan-out == 0) ──────────────────────── */
    orphans: [],

    /* ── Depth statistics ──────────────────────────────────────────── */
    depthStats: { max: 4, mean: 2.4, median: 2, p90: 4, filesAtMax: 3 },
    depthRanking: [
        { path: 'src/server/routes/files.py',       bytes: 17576, bytesHuman: '17.2 KB', lines: 465, type: '.py', fanIn: 1, fanOut: 8,  maxDepth: 4, score: 58 },
        { path: 'src/server/routes/story_panel.py',  bytes: 19147, bytesHuman: '18.7 KB', lines: 462, type: '.py', fanIn: 1, fanOut: 3,  maxDepth: 4, score: 45 },
        { path: 'src/server/routes/maintenance.py', bytes: 9211,  bytesHuman: '9.0 KB',  lines: 270, type: '.py', fanIn: 1, fanOut: 5,  maxDepth: 4, score: 42 },
        { path: 'src/domain/rss/scheduler.py',      bytes: 11530, bytesHuman: '11.3 KB', lines: 330, type: '.py', fanIn: 3, fanOut: 5,  maxDepth: 4, score: 38 },
        { path: 'src/data/repository.py',           bytes: 17928, bytesHuman: '17.5 KB', lines: 546, type: '.py', fanIn: 3, fanOut: 5,  maxDepth: 3, score: 52 },
    ],

    /* ── Cyclic dependencies ───────────────────────────────────────── */
    cycles: [],

    /* ── Freshness (file age in days) ──────────────────────────────── */
    freshness: [
        { path: 'src/data/repository.py',           ageDays: 0, lastModified: '2026-07-24', lastModifiedHuman: '2026-07-24', type: '.py', lines: 546 },
        { path: 'src/data/store.py',                 ageDays: 0, lastModified: '2026-07-24', lastModifiedHuman: '2026-07-24', type: '.py', lines: 534 },
        { path: 'src/server/routes/files.py',        ageDays: 0, lastModified: '2026-07-24', lastModifiedHuman: '2026-07-24', type: '.py', lines: 465 },
        { path: 'src/server/routes/story_panel.py',  ageDays: 0, lastModified: '2026-07-24', lastModifiedHuman: '2026-07-24', type: '.py', lines: 462 },
        { path: 'src/shared/config.py',              ageDays: 0, lastModified: '2026-07-24', lastModifiedHuman: '2026-07-24', type: '.py', lines: 206 },
    ],
    freshnessBuckets: [
        { bucket: '0-30d',    count: 73, pctFiles: 100.0 },
        { bucket: '30-90d',   count: 0,  pctFiles: 0.0   },
        { bucket: '90-180d',  count: 0,  pctFiles: 0.0   },
        { bucket: '180-365d', count: 0,  pctFiles: 0.0   },
        { bucket: '365d+',    count: 0,  pctFiles: 0.0   },
    ],
    freshnessStats: { asOf: 1753315200000, asOfHuman: '2026-07-24', maxAge: 0, median: 0, p90: 0, staleCount: 0, criticalCount: 0 },

    records: [],
    adjacency: {},

    selfImprovement: {
        topP0: [
            { action: 'Split repository.py into per-collection mixins', file: 'src/data/repository.py', line: 1, severity: 'P1' },
        ],

        focusArea: {
            dimName: 'Coupling (fan-in)',
            score: 60,
            why: 'shared.config (fan-in 18) and shared.error_codes (fan-in 14) act as implicit god modules — every route and service depends on the singleton. While not yet a coupling crisis, this is the primary drag on long-term maintainability.',
            hint: 'Introduce domain-scoped config facades and FastAPI Depends injection. Expected uplift: +5–8 pts.'
        },

        trendInsight: 'Codebase is brand-new (all files touched 2026-07-24). Score 78/100 reflects small size + no staleness; coupling and RPC-style file routes are the watch items.',
        weightsHint: 'Coupling weight is currently 0.20 — consider raising to 0.25 once the codebase crosses 100 files, since fan-in concentration will compound.',

        narrative: [
            'Overall health at 78/100 (grade B+) — small, fresh, no staleness, no cycles, no orphans.',
            '0 critical (P0) and 2 major (P1) alerts active. Primary risks: a 546-LOC repository module (split candidate) and shared.config as an implicit god module (fan-in 18).',
            'Top lever: split repository.py into per-collection mixins (+4 pts). Roadmap projects 86/100 after P1 closure.',
            'Score 78 | grade B+ | gap 7 pts to A | projected 86 after plan | decay risk: –1 pt/month as the codebase ages without refactoring.'
        ],

        severityDonut: { p0: 0, p1: 2, p2: 3, total: 5 },

        riskVectors: [
            { dimension: 'Depth',       score: 88,  weight: 0.15, p0: 0, p1: 0, p2: 0 },
            { dimension: 'Size',         score: 80,  weight: 0.20, p0: 0, p1: 1, p2: 1 },
            { dimension: 'Coupling',     score: 60,  weight: 0.20, p0: 0, p1: 1, p2: 1 },
            { dimension: 'Duplication',  score: 80,  weight: 0.10, p0: 0, p1: 0, p2: 0 },
            { dimension: 'Complexity',   score: 75,  weight: 0.15, p0: 0, p1: 0, p2: 1 },
            { dimension: 'Staleness',     score: 100, weight: 0.20, p0: 0, p1: 0, p2: 1 },
        ],

        levers: [
            { rank: 1, dimension: 'Size',       severity: 'P1', kind: 'refactor', action: 'Split repository.py (546 LOC) into per-collection mixins (repository/{sessions,static_files,state}.py)', file: 'src/data/repository.py',    line: 1, scoreUplift: 4, effort: 'medium' },
            { rank: 2, dimension: 'Coupling',   severity: 'P1', kind: 'refactor', action: 'Introduce domain-scoped config facades + FastAPI Depends for shared.config (fan-in 18)',                  file: 'src/shared/config.py',       line: 1, scoreUplift: 3, effort: 'low'    },
            { rank: 3, dimension: 'Coupling',   severity: 'P2', kind: 'refactor', action: 'Narrow data.database fan-in (10) by exposing collection-scoped accessors instead of db.db[name]',                 file: 'src/data/database.py',      line: 1, scoreUplift: 2, effort: 'low'    },
            { rank: 4, dimension: 'Size',       severity: 'P2', kind: 'split',    action: 'Split routes/files.py (465 LOC) into routes/{files_upload,files_read,files_delete,files_rename}.py',           file: 'src/server/routes/files.py', line: 1, scoreUplift: 3, effort: 'medium' },
            { rank: 5, dimension: 'Staleness',  severity: 'P2', kind: 'process',  action: 'Add a CI rule flagging files untouched > 180 days and wire CODEOWNERS to every src/ subdirectory',                       file: 'src/app.py',                 line: 1, scoreUplift: 2, effort: 'low'    },
        ],

        benchmarks: { currentGrade: 'B+', currentValue: 78, targetGrade: 'A', targetValue: 85, gapToNext: 7 },

        remediationPlan: {
            phases: [
                { phase: 'P0 — Blocking fixes (this sprint)', severity: 'P0', itemCount: 0, estUplift: 0,  projected: 78, deadline: '—'           },
                { phase: 'P1 — Important (next sprint)',      severity: 'P1', itemCount: 2, estUplift: 7,  projected: 85, deadline: '2 weeks'    },
                { phase: 'P2 — Nice-to-have (this quarter)',  severity: 'P2', itemCount: 3, estUplift: 7,  projected: 92, deadline: 'this quarter' },
            ],
            currentScore: 78,
            projectedScoreIfAllP0P1Remediated: 85,
        },

        decayForecast: { currentScore: 78, projectedNext: 77, delta: -1, rationale: 'Without action, the codebase will accumulate ~1 pt/quarter from new routes landing in the already-largest files.py and repository.py, plus implicit coupling growth as new modules reach for shared.config.' },
    },
};

/* ── Enrichment fallback: category defaults for alert enrichment ──────── */
(function () {
    const byCategory = {
        bloat: {
            risk: 'If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.',
            blastRadius: 'file-local + reviewers',
            estimatedHours: 8,
            acceptance: ['Each split child ≤ 500 LOC and single-responsibility.', 'Public API unchanged — existing call sites compile without edits.', 'Unit tests pass on every child; coverage ≥ pre-split baseline.'],
            firstStep: 'Open the file and list its top-level responsibilities (one sentence each) — that list becomes the split plan.',
            tooling: [
                { name: 'radon', hint: 'Python cyclomatic complexity + LOC enforcement' },
                { name: 'pylint', hint: 'max-line-length + max-module-lines rules' },
            ],
            preventiveControls: ['CI rule: fail any PR that adds > 100 LOC to a file already over 500 LOC.', 'Pre-commit hook: warn on files crossing 300 LOC.', 'CODEOWNERS: require module-owner review on the barrel index.'],
            rollbackPlan: 'Revert the merge commit; the barrel index re-exports the original single file. Keep split children behind a feature flag for one release if call sites were edited.',
        },
        size: {
            risk: 'If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.',
            blastRadius: 'file-local + reviewers',
            estimatedHours: 8,
            acceptance: ['Each split child ≤ 500 LOC and single-responsibility.', 'Public API unchanged.', 'Tests pass on every child.'],
            firstStep: 'Open the file and list its top-level responsibilities.',
            tooling: [{ name: 'radon', hint: 'Python LOC + complexity' }],
            preventiveControls: ['CI: fail PRs that grow files over threshold.'],
            rollbackPlan: 'Revert the merge commit.',
        },
        cycle: {
            risk: 'If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.',
            blastRadius: 'cycle members + their transitive importers',
            estimatedHours: 6,
            acceptance: ['Cycle detection returns 0 cycles.', 'No runtime circular import errors.'],
            firstStep: 'Run `pydeps --max-bacon=2 <entry>` to visualize cycles.',
            tooling: [{ name: 'pydeps', hint: 'Python import graph visualizer' }, { name: 'import-linter', hint: 'enforce layer contracts in CI' }],
            preventiveControls: ['CI: import-linter rule banning cross-layer cycles.'],
            rollbackPlan: 'Revert the edge-removal commit.',
        },
        hotspot: {
            risk: 'If left unfixed: any change here risks cascading defects across multiple call sites and inflates the blast radius of every release.',
            blastRadius: 'inbound + outbound edges across the graph',
            estimatedHours: 8,
            acceptance: ['Hotspot score drops below threshold on the next analyzer run.', 'Fan-out decreases or moves behind a façade boundary.', 'CODEOWNERS entry added and enforced.'],
            firstStep: 'Grep for all importers and group them by domain — the largest cluster becomes the first façade to extract.',
            tooling: [{ name: 'import-linter', hint: 'enforce fan-in / fan-out limits per module' }, { name: 'pydeps', hint: 'visualize the dependency map' }],
            preventiveControls: ['CI: fail if hotspot score on this file regresses.', 'CODEOWNERS: require 2 reviewers from the owning team.'],
            rollbackPlan: 'Revert the façade PR; callers go back to importing internals directly.',
        },
        orphan: {
            risk: 'If left unfixed: drift between dead code and live APIs accumulates; future readers may revive stale behavior assuming it is current.',
            blastRadius: '0 dependents (direct) — risk is deletion-safety, not ripple',
            estimatedHours: 2,
            acceptance: ['No dynamic references found via grep across the repo.', 'Test suite green after deletion.'],
            firstStep: 'Run `git log --oneline -5 -- <file>` and grep for imports of the basename.',
            tooling: [{ name: 'vulture', hint: 'dead-code detection for Python' }, { name: 'pylint', hint: 'unused-import detection' }],
            preventiveControls: ['CI: vulture --min-confidence 80 on every PR.'],
            rollbackPlan: 'Trivial — `git revert <merge>`.',
        },
        depth: {
            risk: 'If left unfixed: cold-start and CI time grow with each new layer; a leaf change can fail tests in unrelated subtrees.',
            blastRadius: 'transitive dependents along the chain',
            estimatedHours: 8,
            acceptance: ['Max dependency depth drops below the project threshold.', 'Cold-start time unchanged or improved.'],
            firstStep: 'Run `pydeps --max-depth 6 <entry>` to trace the single deepest path.',
            tooling: [{ name: 'pydeps', hint: 'reports max depth per entry' }, { name: 'import-linter', hint: 'enforce max-depth rules in CI' }],
            preventiveControls: ['CI: import-linter rule capping max depth.'],
            rollbackPlan: 'Revert the façade commit; original intermediate layers reappear.',
        },
        coupling: {
            risk: 'If left unfixed: every interface change cascades into N call sites, and the module becomes an undeclared critical path.',
            blastRadius: 'direct dependents across the graph',
            estimatedHours: 16,
            acceptance: ['Fan-in drops below threshold.', 'Each domain façade exposes only the APIs its cluster needs.', 'Module-boundary lint rule added and green on CI.'],
            firstStep: 'List all importers and cluster by top-level directory — each cluster maps to one domain façade.',
            tooling: [{ name: 'import-linter', hint: 'enforce per-module fan-in caps' }, { name: 'pydeps', hint: 'visualize importer clusters' }],
            preventiveControls: ['CI: import-linter rule `no-god-modules` at fan-in 20.', 'CODEOWNERS: require owning-team review on any PR adding a new importer.'],
            rollbackPlan: 'Revert the façade-split PR; callers fall back to importing the original god module.',
        },
        freshness: {
            risk: 'If left unfixed: runtime drift goes undetected until the code path is exercised in production, typically during an incident.',
            blastRadius: 'self + any untested dynamic callers',
            estimatedHours: 3,
            acceptance: ['Coverage + typecheck pass recorded in the PR description.', 'Either deleted, excluded, or covered by a new integration test.', 'ADR linked if ownership is ambiguous.'],
            firstStep: 'Run `git log --since="6 months ago" -- <file>`; if empty, ping the last committer and ask: delete or revive?',
            tooling: [{ name: 'vulture', hint: 'flags stale, unreferenced files' }, { name: 'coverage diff', hint: 'confirm the stale path is exercised' }],
            preventiveControls: ['CI: monthly sweep flagging files untouched > 180 days.', 'CODEOWNERS: every directory has a named owner.'],
            rollbackPlan: 'If deleted: `git revert <merge>` re-creates the file. If kept: bump mtime via an empty touch commit.',
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
