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
        generatedAt: "2026-07-24T07:17:50.993Z", /* ISO 8601 UTC — filled in by the analyzer */
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
  "scope": ".",
  "score": 44,
  "alerts": [
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "assets/favicon.ico",
      "line": null,
      "message": "Orphan file: 0 inbound references (7 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- assets/favicon.ico` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/services/authUtils.js",
      "line": 1,
      "message": "File exceeds 500 LOC (583 lines)",
      "metric": "583 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/services/crud.js",
      "line": 1,
      "message": "File exceeds 500 LOC (826 lines)",
      "metric": "826 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "src/services/fileDeleteService.js",
      "line": null,
      "message": "Orphan file: 0 inbound references (238 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- src/services/fileDeleteService.js` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/services/requestHelper.js",
      "line": 1,
      "message": "File exceeds 500 LOC (618 lines)",
      "metric": "618 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/services/sessionSyncService.js",
      "line": 1,
      "message": "File exceeds 500 LOC (916 lines)",
      "metric": "916 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "src/services/sessionSyncService.js",
      "line": null,
      "message": "Orphan file: 0 inbound references (916 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- src/services/sessionSyncService.js` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "src/utils/resizer.js",
      "line": null,
      "message": "Orphan file: 0 inbound references (232 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- src/utils/resizer.js` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/views/aicr/composables/mainPageMethods.js",
      "line": 1,
      "message": "File exceeds 500 LOC (755 lines)",
      "metric": "755 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/views/aicr/composables/projectZipMethods.js",
      "line": 1,
      "message": "File exceeds 500 LOC (709 lines)",
      "metric": "709 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/views/aicr/composables/sessionActionMethods.js",
      "line": 1,
      "message": "File exceeds 500 LOC (613 lines)",
      "metric": "613 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/views/aicr/composables/sessionChatContextChatMethods.js",
      "line": 1,
      "message": "File exceeds 500 LOC (551 lines)",
      "metric": "551 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/views/aicr/composables/sessionChatContextChatMethods.streaming.js",
      "line": 1,
      "message": "File exceeds 500 LOC (817 lines)",
      "metric": "817 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/views/aicr/composables/sessionFaqMethods.js",
      "line": 1,
      "message": "File exceeds 500 LOC (666 lines)",
      "metric": "666 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/views/aicr/composables/sessionListMethods.js",
      "line": 1,
      "message": "File exceeds 500 LOC (515 lines)",
      "metric": "515 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/views/aicr/composables/shared.js",
      "line": 1,
      "message": "File exceeds 500 LOC (736 lines)",
      "metric": "736 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/views/aicr/composables/tagManagerMethods.js",
      "line": 1,
      "message": "File exceeds 500 LOC (524 lines)",
      "metric": "524 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/views/aicr/state/fileContentOps.js",
      "line": 1,
      "message": "File exceeds 500 LOC (503 lines)",
      "metric": "503 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/views/aicr/state/fileTreeOps.js",
      "line": 1,
      "message": "File exceeds 500 LOC (705 lines)",
      "metric": "705 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/views/aicr/styles/codePage.contextModals.css",
      "line": 1,
      "message": "File exceeds 500 LOC (959 lines)",
      "metric": "959 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "src/views/aicr/styles/codePage.contextModals.css",
      "line": null,
      "message": "Orphan file: 0 inbound references (959 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- src/views/aicr/styles/codePage.contextModals.css` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/views/aicr/styles/codePage.css",
      "line": 1,
      "message": "File exceeds 500 LOC (910 lines)",
      "metric": "910 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "src/views/aicr/styles/codePage.css",
      "line": null,
      "message": "Orphan file: 0 inbound references (910 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- src/views/aicr/styles/codePage.css` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "src/views/aicr/styles/index.css",
      "line": null,
      "message": "Orphan file: 0 inbound references (405 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- src/views/aicr/styles/index.css` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src/views/aicr/styles/layout.css",
      "line": 1,
      "message": "File exceeds 500 LOC (723 lines)",
      "metric": "723 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "src/views/aicr/styles/layout.css",
      "line": null,
      "message": "Orphan file: 0 inbound references (723 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- src/views/aicr/styles/layout.css` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "src/views/aicr/styles/welcomeCard.css",
      "line": null,
      "message": "Orphan file: 0 inbound references (222 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- src/views/aicr/styles/welcomeCard.css` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "src/views/claude/composables/store.js",
      "line": null,
      "message": "Orphan file: 0 inbound references (201 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- src/views/claude/composables/store.js` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    }
  ],
  "summary": {
    "totalFiles": 104,
    "totalBytes": 935717,
    "totalBytesHuman": "913.8 KB",
    "totalLines": 24824,
    "maxDepth": 5,
    "criticalCount": 0,
    "hotspotCount": 1,
    "cycleCount": 0,
    "staleCount": 0
  },
  "treemap": [
    {
      "name": "src/",
      "bytes": 1830876,
      "humanBytes": "1.7 MB"
    },
    {
      "name": "src/views/",
      "bytes": 1481578,
      "humanBytes": "1.4 MB"
    },
    {
      "name": "src/views/aicr/",
      "bytes": 1311518,
      "humanBytes": "1.3 MB"
    },
    {
      "name": "src/views/aicr/composables/",
      "bytes": 938606,
      "humanBytes": "916.6 KB"
    },
    {
      "name": "src/services/",
      "bytes": 276932,
      "humanBytes": "270.4 KB"
    },
    {
      "name": "src/views/aicr/styles/",
      "bytes": 164384,
      "humanBytes": "160.5 KB"
    },
    {
      "name": "src/views/aicr/state/",
      "bytes": 160368,
      "humanBytes": "156.6 KB"
    },
    {
      "name": "src/views/story/",
      "bytes": 140018,
      "humanBytes": "136.7 KB"
    },
    {
      "name": "src/views/story/composables/",
      "bytes": 77782,
      "humanBytes": "76.0 KB"
    },
    {
      "name": "src/utils/",
      "bytes": 52156,
      "humanBytes": "50.9 KB"
    }
  ],
  "types": [
    {
      "type": ".js",
      "fileCount": 85,
      "pctFiles": 81.7,
      "totalBytes": 823900,
      "totalBytesHuman": "804.6 KB",
      "pctBytes": 88.1,
      "totalLines": 21172
    },
    {
      "type": ".css",
      "fileCount": 10,
      "pctFiles": 9.6,
      "totalBytes": 85337,
      "totalBytesHuman": "83.3 KB",
      "pctBytes": 9.1,
      "totalLines": 3353
    },
    {
      "type": ".ico",
      "fileCount": 1,
      "pctFiles": 1,
      "totalBytes": 15406,
      "totalBytesHuman": "15.0 KB",
      "pctBytes": 1.6,
      "totalLines": 7
    },
    {
      "type": ".html",
      "fileCount": 7,
      "pctFiles": 6.7,
      "totalBytes": 10597,
      "totalBytesHuman": "10.3 KB",
      "pctBytes": 1.1,
      "totalLines": 249
    },
    {
      "type": "(none)",
      "fileCount": 1,
      "pctFiles": 1,
      "totalBytes": 477,
      "totalBytesHuman": "477 B",
      "pctBytes": 0.1,
      "totalLines": 43
    }
  ],
  "histogram": [
    {
      "bucket": "0",
      "count": 0,
      "pctFiles": 0
    },
    {
      "bucket": "1-50",
      "count": 25,
      "pctFiles": 24
    },
    {
      "bucket": "51-100",
      "count": 16,
      "pctFiles": 15.4
    },
    {
      "bucket": "101-250",
      "count": 29,
      "pctFiles": 27.9
    },
    {
      "bucket": "251-500",
      "count": 16,
      "pctFiles": 15.4
    },
    {
      "bucket": "501-1000",
      "count": 18,
      "pctFiles": 17.3
    },
    {
      "bucket": "1001-2000",
      "count": 0,
      "pctFiles": 0
    },
    {
      "bucket": "2000+",
      "count": 0,
      "pctFiles": 0
    }
  ],
  "largest": [
    {
      "path": "src/views/aicr/composables/sessionChatContextChatMethods.streaming.js",
      "bytes": 43820,
      "bytesHuman": "42.8 KB",
      "lines": 817,
      "type": ".js",
      "depth": 0,
      "fanIn": 1,
      "fanOut": 0
    },
    {
      "path": "src/services/sessionSyncService.js",
      "bytes": 37594,
      "bytesHuman": "36.7 KB",
      "lines": 916,
      "type": ".js",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src/views/aicr/composables/projectZipMethods.js",
      "bytes": 34049,
      "bytesHuman": "33.3 KB",
      "lines": 709,
      "type": ".js",
      "depth": 0,
      "fanIn": 1,
      "fanOut": 0
    },
    {
      "path": "src/views/aicr/composables/mainPageMethods.js",
      "bytes": 31792,
      "bytesHuman": "31.0 KB",
      "lines": 755,
      "type": ".js",
      "depth": 0,
      "fanIn": 1,
      "fanOut": 0
    },
    {
      "path": "src/views/aicr/state/fileTreeOps.js",
      "bytes": 30898,
      "bytesHuman": "30.2 KB",
      "lines": 705,
      "type": ".js",
      "depth": 0,
      "fanIn": 1,
      "fanOut": 0
    },
    {
      "path": "src/views/aicr/composables/shared.js",
      "bytes": 29864,
      "bytesHuman": "29.2 KB",
      "lines": 736,
      "type": ".js",
      "depth": 1,
      "fanIn": 1,
      "fanOut": 1
    },
    {
      "path": "src/views/aicr/composables/sessionActionMethods.js",
      "bytes": 27321,
      "bytesHuman": "26.7 KB",
      "lines": 613,
      "type": ".js",
      "depth": 0,
      "fanIn": 1,
      "fanOut": 0
    },
    {
      "path": "src/views/aicr/composables/sessionFaqMethods.js",
      "bytes": 26498,
      "bytesHuman": "25.9 KB",
      "lines": 666,
      "type": ".js",
      "depth": 0,
      "fanIn": 1,
      "fanOut": 0
    },
    {
      "path": "src/services/crud.js",
      "bytes": 25550,
      "bytesHuman": "25.0 KB",
      "lines": 826,
      "type": ".js",
      "depth": 0,
      "fanIn": 2,
      "fanOut": 0
    },
    {
      "path": "src/views/aicr/styles/codePage.contextModals.css",
      "bytes": 24478,
      "bytesHuman": "23.9 KB",
      "lines": 959,
      "type": ".css",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextChatMethods.js",
      "bytes": 24167,
      "bytesHuman": "23.6 KB",
      "lines": 551,
      "type": ".js",
      "depth": 1,
      "fanIn": 1,
      "fanOut": 1
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextContextMethods.js",
      "bytes": 23246,
      "bytesHuman": "22.7 KB",
      "lines": 436,
      "type": ".js",
      "depth": 0,
      "fanIn": 1,
      "fanOut": 0
    },
    {
      "path": "src/views/aicr/composables/sessionEditMethods.js",
      "bytes": 22266,
      "bytesHuman": "21.7 KB",
      "lines": 469,
      "type": ".js",
      "depth": 0,
      "fanIn": 1,
      "fanOut": 0
    },
    {
      "path": "src/views/aicr/composables/sessionListMethods.js",
      "bytes": 22197,
      "bytesHuman": "21.7 KB",
      "lines": 515,
      "type": ".js",
      "depth": 0,
      "fanIn": 1,
      "fanOut": 0
    },
    {
      "path": "src/views/aicr/styles/codePage.css",
      "bytes": 21643,
      "bytesHuman": "21.1 KB",
      "lines": 910,
      "type": ".css",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src/services/authUtils.js",
      "bytes": 20962,
      "bytesHuman": "20.5 KB",
      "lines": 583,
      "type": ".js",
      "depth": 0,
      "fanIn": 1,
      "fanOut": 0
    },
    {
      "path": "src/views/aicr/index.js",
      "bytes": 20356,
      "bytesHuman": "19.9 KB",
      "lines": 356,
      "type": ".js",
      "depth": 5,
      "fanIn": 0,
      "fanOut": 5
    },
    {
      "path": "src/views/aicr/state/fileContentOps.js",
      "bytes": 20270,
      "bytesHuman": "19.8 KB",
      "lines": 503,
      "type": ".js",
      "depth": 0,
      "fanIn": 1,
      "fanOut": 0
    },
    {
      "path": "src/views/aicr/styles/layout.css",
      "bytes": 20151,
      "bytesHuman": "19.7 KB",
      "lines": 723,
      "type": ".css",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextMethods.js",
      "bytes": 18269,
      "bytesHuman": "17.8 KB",
      "lines": 477,
      "type": ".js",
      "depth": 2,
      "fanIn": 1,
      "fanOut": 8
    }
  ],
  "fanin": [
    {
      "path": "src/views/aicr/state/store.js",
      "fanIn": 3,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 4,
      "type": ".js"
    },
    {
      "path": "src/services/authErrorHandler.js",
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 241,
      "type": ".js"
    },
    {
      "path": "src/views/story/state/storeFactory.js",
      "fanIn": 2,
      "fanOut": 6,
      "extDeps": 0,
      "lines": 36,
      "type": ".js"
    },
    {
      "path": "src/services/checkStatus.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 100,
      "type": ".js"
    },
    {
      "path": "src/services/documentEnrichService.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 110,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextChatMethods.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 551,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextMethods.js",
      "fanIn": 1,
      "fanOut": 8,
      "extDeps": 0,
      "lines": 477,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/composables/shared.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 736,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/composables/tagManagerMethods.js",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 524,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/composables/useMethods.js",
      "fanIn": 1,
      "fanOut": 16,
      "extDeps": 0,
      "lines": 296,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/state/storeFactory.js",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 0,
      "lines": 72,
      "type": ".js"
    },
    {
      "path": "src/views/story/composables/filterMethods.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 102,
      "type": ".js"
    },
    {
      "path": "src/views/story/composables/storyDataMethods.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 225,
      "type": ".js"
    },
    {
      "path": "src/views/story/composables/uiMethods.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 60,
      "type": ".js"
    },
    {
      "path": "src/services/index.js",
      "fanIn": 0,
      "fanOut": 7,
      "extDeps": 0,
      "lines": 81,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/index.js",
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 0,
      "lines": 356,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/styles/index.css",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 11,
      "lines": 405,
      "type": ".css"
    },
    {
      "path": "src/views/claude/styles/index.css",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 5,
      "lines": 6,
      "type": ".css"
    },
    {
      "path": "src/views/story/index.js",
      "fanIn": 0,
      "fanOut": 3,
      "extDeps": 0,
      "lines": 166,
      "type": ".js"
    },
    {
      "path": "src/views/story/state/store.js",
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 2,
      "type": ".js"
    }
  ],
  "fanout": [
    {
      "path": "src/views/aicr/composables/useMethods.js",
      "fanIn": 1,
      "fanOut": 16,
      "extDeps": 0,
      "lines": 296,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextMethods.js",
      "fanIn": 1,
      "fanOut": 8,
      "extDeps": 0,
      "lines": 477,
      "type": ".js"
    },
    {
      "path": "src/services/index.js",
      "fanIn": 0,
      "fanOut": 7,
      "extDeps": 0,
      "lines": 81,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/state/storeFactory.js",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 0,
      "lines": 72,
      "type": ".js"
    },
    {
      "path": "src/views/story/state/storeFactory.js",
      "fanIn": 2,
      "fanOut": 6,
      "extDeps": 0,
      "lines": 36,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/index.js",
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 0,
      "lines": 356,
      "type": ".js"
    },
    {
      "path": "src/views/story/index.js",
      "fanIn": 0,
      "fanOut": 3,
      "extDeps": 0,
      "lines": 166,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/composables/tagManagerMethods.js",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 524,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/state/store.js",
      "fanIn": 3,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 4,
      "type": ".js"
    },
    {
      "path": "src/services/authErrorHandler.js",
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 241,
      "type": ".js"
    },
    {
      "path": "src/services/checkStatus.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 100,
      "type": ".js"
    },
    {
      "path": "src/services/documentEnrichService.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 110,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextChatMethods.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 551,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/composables/shared.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 736,
      "type": ".js"
    },
    {
      "path": "src/views/story/composables/filterMethods.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 102,
      "type": ".js"
    },
    {
      "path": "src/views/story/composables/storyDataMethods.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 225,
      "type": ".js"
    },
    {
      "path": "src/views/story/composables/uiMethods.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 60,
      "type": ".js"
    },
    {
      "path": "src/views/story/state/store.js",
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 2,
      "type": ".js"
    },
    {
      "path": "src/views/story/utils/index.js",
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 6,
      "type": ".js"
    },
    {
      "path": "src/views/aicr/styles/index.css",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 11,
      "lines": 405,
      "type": ".css"
    }
  ],
  "hotspots": [
    {
      "path": "src/views/aicr/composables/useMethods.js",
      "bytes": 8986,
      "bytesHuman": "8.8 KB",
      "lines": 296,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 16,
      "maxDepth": 4,
      "score": 2.75
    }
  ],
  "orphans": [
    {
      "path": "src/services/sessionSyncService.js",
      "bytes": 37594,
      "bytesHuman": "36.7 KB",
      "lines": 916,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.46
    },
    {
      "path": "src/views/aicr/styles/codePage.contextModals.css",
      "bytes": 24478,
      "bytesHuman": "23.9 KB",
      "lines": 959,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.48
    },
    {
      "path": "src/views/aicr/styles/codePage.css",
      "bytes": 21643,
      "bytesHuman": "21.1 KB",
      "lines": 910,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.46
    },
    {
      "path": "src/views/aicr/styles/layout.css",
      "bytes": 20151,
      "bytesHuman": "19.7 KB",
      "lines": 723,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.36
    },
    {
      "path": "assets/favicon.ico",
      "bytes": 15406,
      "bytesHuman": "15.0 KB",
      "lines": 7,
      "type": ".ico",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0
    },
    {
      "path": "src/views/aicr/styles/index.css",
      "bytes": 9312,
      "bytesHuman": "9.1 KB",
      "lines": 405,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.2
    },
    {
      "path": "src/views/claude/composables/store.js",
      "bytes": 7870,
      "bytesHuman": "7.7 KB",
      "lines": 201,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.1
    },
    {
      "path": "src/utils/resizer.js",
      "bytes": 7621,
      "bytesHuman": "7.4 KB",
      "lines": 232,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.12
    },
    {
      "path": "src/services/fileDeleteService.js",
      "bytes": 7273,
      "bytesHuman": "7.1 KB",
      "lines": 238,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.12
    },
    {
      "path": "src/views/aicr/styles/welcomeCard.css",
      "bytes": 6608,
      "bytesHuman": "6.5 KB",
      "lines": 222,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.11
    },
    {
      "path": "src/utils/listenerManager.js",
      "bytes": 6035,
      "bytesHuman": "5.9 KB",
      "lines": 194,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.1
    },
    {
      "path": "src/utils/fileFieldNormalizer.js",
      "bytes": 5580,
      "bytesHuman": "5.4 KB",
      "lines": 193,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.1
    },
    {
      "path": "src/views/story/index.html",
      "bytes": 4846,
      "bytesHuman": "4.7 KB",
      "lines": 104,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.05
    },
    {
      "path": "config.js",
      "bytes": 4135,
      "bytesHuman": "4.0 KB",
      "lines": 140,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.07
    },
    {
      "path": "src/utils/filterHelpers.js",
      "bytes": 3258,
      "bytesHuman": "3.2 KB",
      "lines": 107,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.05
    },
    {
      "path": "src/composables/useViewInit.js",
      "bytes": 2924,
      "bytesHuman": "2.9 KB",
      "lines": 94,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.05
    },
    {
      "path": "src/views/aicr/index.html",
      "bytes": 2688,
      "bytesHuman": "2.6 KB",
      "lines": 62,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.03
    },
    {
      "path": "src/views/claude/index.js",
      "bytes": 2537,
      "bytesHuman": "2.5 KB",
      "lines": 67,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.03
    },
    {
      "path": "src/utils/modelService.js",
      "bytes": 2423,
      "bytesHuman": "2.4 KB",
      "lines": 101,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.05
    },
    {
      "path": "src/views/claude/index.html",
      "bytes": 2406,
      "bytesHuman": "2.3 KB",
      "lines": 59,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.03
    }
  ],
  "depthStats": {
    "max": 5,
    "mean": 1.73,
    "median": 1,
    "p90": 3,
    "filesAtMax": 1
  },
  "depthRanking": [
    {
      "path": "src/views/aicr/index.js",
      "bytes": 20356,
      "bytesHuman": "19.9 KB",
      "lines": 356,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 5,
      "maxDepth": 5,
      "score": 0
    },
    {
      "path": "src/views/aicr/composables/useMethods.js",
      "bytes": 8986,
      "bytesHuman": "8.8 KB",
      "lines": 296,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 16,
      "maxDepth": 4,
      "score": 0
    },
    {
      "path": "src/services/index.js",
      "bytes": 1888,
      "bytesHuman": "1.8 KB",
      "lines": 81,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 7,
      "maxDepth": 3,
      "score": 0
    },
    {
      "path": "src/views/aicr/composables/tagManagerMethods.js",
      "bytes": 17154,
      "bytesHuman": "16.8 KB",
      "lines": 524,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 2,
      "maxDepth": 3,
      "score": 0
    },
    {
      "path": "src/views/story/index.js",
      "bytes": 7327,
      "bytesHuman": "7.2 KB",
      "lines": 166,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 3,
      "maxDepth": 3,
      "score": 0
    },
    {
      "path": "src/views/story/state/store.js",
      "bytes": 49,
      "bytesHuman": "49 B",
      "lines": 2,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 1,
      "maxDepth": 3,
      "score": 0
    },
    {
      "path": "src/services/checkStatus.js",
      "bytes": 2418,
      "bytesHuman": "2.4 KB",
      "lines": 100,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "maxDepth": 2,
      "score": 0
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextMethods.js",
      "bytes": 18269,
      "bytesHuman": "17.8 KB",
      "lines": 477,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 8,
      "maxDepth": 2,
      "score": 0
    },
    {
      "path": "src/views/aicr/state/store.js",
      "bytes": 191,
      "bytesHuman": "191 B",
      "lines": 4,
      "type": ".js",
      "fanIn": 3,
      "fanOut": 2,
      "maxDepth": 2,
      "score": 0
    },
    {
      "path": "src/views/story/state/storeFactory.js",
      "bytes": 1177,
      "bytesHuman": "1.1 KB",
      "lines": 36,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 6,
      "maxDepth": 2,
      "score": 0
    },
    {
      "path": "src/services/authErrorHandler.js",
      "bytes": 6290,
      "bytesHuman": "6.1 KB",
      "lines": 241,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 1,
      "maxDepth": 1,
      "score": 0
    },
    {
      "path": "src/services/documentEnrichService.js",
      "bytes": 3461,
      "bytesHuman": "3.4 KB",
      "lines": 110,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "maxDepth": 1,
      "score": 0
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextChatMethods.js",
      "bytes": 24167,
      "bytesHuman": "23.6 KB",
      "lines": 551,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "maxDepth": 1,
      "score": 0
    },
    {
      "path": "src/views/aicr/composables/shared.js",
      "bytes": 29864,
      "bytesHuman": "29.2 KB",
      "lines": 736,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "maxDepth": 1,
      "score": 0
    },
    {
      "path": "src/views/aicr/state/storeFactory.js",
      "bytes": 2368,
      "bytesHuman": "2.3 KB",
      "lines": 72,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 6,
      "maxDepth": 1,
      "score": 0
    },
    {
      "path": "src/views/story/composables/filterMethods.js",
      "bytes": 3038,
      "bytesHuman": "3.0 KB",
      "lines": 102,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "maxDepth": 1,
      "score": 0
    },
    {
      "path": "src/views/story/composables/storyDataMethods.js",
      "bytes": 8500,
      "bytesHuman": "8.3 KB",
      "lines": 225,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "maxDepth": 1,
      "score": 0
    },
    {
      "path": "src/views/story/composables/uiMethods.js",
      "bytes": 1630,
      "bytesHuman": "1.6 KB",
      "lines": 60,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "maxDepth": 1,
      "score": 0
    },
    {
      "path": "src/views/story/utils/index.js",
      "bytes": 85,
      "bytesHuman": "85 B",
      "lines": 6,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 1,
      "maxDepth": 1,
      "score": 0
    }
  ],
  "cycles": [],
  "freshness": [],
  "freshnessBuckets": [
    {
      "bucket": "<30d",
      "count": 104,
      "pctFiles": 100
    },
    {
      "bucket": "30-90d",
      "count": 0,
      "pctFiles": 0
    },
    {
      "bucket": "90-180d",
      "count": 0,
      "pctFiles": 0
    },
    {
      "bucket": "180-365d",
      "count": 0,
      "pctFiles": 0
    },
    {
      "bucket": ">365d",
      "count": 0,
      "pctFiles": 0
    }
  ],
  "freshnessStats": {
    "asOf": 1784875339000,
    "asOfHuman": "2026-07-24",
    "maxAge": 0,
    "median": 0,
    "p90": 0,
    "staleCount": 0,
    "criticalCount": 0
  },
  "selfImprovement": {
    "topP0": [],
    "focusArea": {
      "dimName": "Coupling",
      "score": 68,
      "why": "Lowest-scoring risk dimension drives overall health drag.",
      "hint": "Invest 2-3 days addressing top alerts in this dimension. Expected uplift: +10-15 pts."
    },
    "trendInsight": "Score 44/100 at generation. 0 P0 alerts require immediate attention.",
    "weightsHint": "Weights follow methodology.md Stage 3.6. Coupling and Staleness carry 0.20 each.",
    "narrative": [
      "Overall health at 44/100 — high risk.",
      "0 critical (P0), 0 major (P1), 28 minor (P2) alerts active.",
      "Top lever: Refactor src/views/aicr/composables/useMethods.js (hotspot 2.75, 296 LOC, fan-out 16) (+6 pts).",
      "Score 44 | gap 36 pts to next grade | decay risk without action: -2 pts/quarter"
    ],
    "severityDonut": {
      "p0": 0,
      "p1": 0,
      "p2": 28,
      "total": 28
    },
    "riskVectors": [
      {
        "dimension": "Depth",
        "score": 75,
        "weight": 0.15,
        "p0": 0,
        "p1": 0,
        "p2": 0
      },
      {
        "dimension": "Size",
        "score": 100,
        "weight": 0.2,
        "p0": 0,
        "p1": 0,
        "p2": 18
      },
      {
        "dimension": "Coupling",
        "score": 68,
        "weight": 0.2,
        "p0": 0,
        "p1": 0,
        "p2": 0
      },
      {
        "dimension": "Duplication",
        "score": 80,
        "weight": 0.1,
        "p0": 0,
        "p1": 0,
        "p2": 0
      },
      {
        "dimension": "Complexity",
        "score": 78,
        "weight": 0.15,
        "p0": 0,
        "p1": 0,
        "p2": 0
      },
      {
        "dimension": "Staleness",
        "score": 100,
        "weight": 0.2,
        "p0": 0,
        "p1": 0,
        "p2": 0
      }
    ],
    "levers": [
      {
        "rank": 1,
        "dimension": "Size",
        "severity": "P2",
        "kind": "refactor",
        "action": "Refactor src/views/aicr/composables/useMethods.js (hotspot 2.75, 296 LOC, fan-out 16)",
        "file": "src/views/aicr/composables/useMethods.js",
        "line": 1,
        "scoreUplift": 6,
        "effort": "medium"
      }
    ],
    "benchmarks": {
      "currentGrade": "F",
      "currentValue": 44,
      "targetGrade": "D",
      "targetValue": 64,
      "gapToNext": 36
    },
    "remediationPlan": {
      "phases": [
        {
          "phase": "P0 Critical",
          "severity": "P0",
          "itemCount": 0,
          "estUplift": 0,
          "projected": 44,
          "deadline": "7 days"
        },
        {
          "phase": "P1 Major",
          "severity": "P1",
          "itemCount": 0,
          "estUplift": 0,
          "projected": 44,
          "deadline": "30 days"
        },
        {
          "phase": "P2 Minor",
          "severity": "P2",
          "itemCount": 28,
          "estUplift": 56,
          "projected": 100,
          "deadline": "90 days"
        }
      ],
      "currentScore": 44,
      "projectedScoreIfAllP0P1Remediated": 44
    },
    "decayForecast": {
      "currentScore": 44,
      "projectedNext": 42,
      "delta": -2,
      "rationale": "Without active remediation, coupling decay and staleness trend -2 pts/quarter on average."
    }
  },
  "records": [
    {
      "path": ".gitignore",
      "bytes": 477,
      "lines": 43,
      "type": "",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "assets/favicon.ico",
      "bytes": 15406,
      "lines": 7,
      "type": ".ico",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872627,
      "ageDays": 0
    },
    {
      "path": "config.js",
      "bytes": 4135,
      "lines": 140,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872627,
      "ageDays": 0
    },
    {
      "path": "index.html",
      "bytes": 261,
      "lines": 14,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "src/components/YiGlobalLoading/index.css",
      "bytes": 855,
      "lines": 43,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784873403,
      "ageDays": 0
    },
    {
      "path": "src/components/YiGlobalLoading/index.html",
      "bytes": 277,
      "lines": 6,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784873870,
      "ageDays": 0
    },
    {
      "path": "src/components/YiGlobalLoading/index.js",
      "bytes": 1805,
      "lines": 64,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784873875,
      "ageDays": 0
    },
    {
      "path": "src/components/YiNoScript/index.html",
      "bytes": 71,
      "lines": 3,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784873884,
      "ageDays": 0
    },
    {
      "path": "src/components/YiNoScript/index.js",
      "bytes": 1300,
      "lines": 46,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784873886,
      "ageDays": 0
    },
    {
      "path": "src/components/YiSkipLink/index.css",
      "bytes": 483,
      "lines": 24,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784873883,
      "ageDays": 0
    },
    {
      "path": "src/components/YiSkipLink/index.html",
      "bytes": 48,
      "lines": 1,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784873875,
      "ageDays": 0
    },
    {
      "path": "src/components/YiSkipLink/index.js",
      "bytes": 1247,
      "lines": 43,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784873878,
      "ageDays": 0
    },
    {
      "path": "src/composables/useViewInit.js",
      "bytes": 2924,
      "lines": 94,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784873438,
      "ageDays": 0
    },
    {
      "path": "src/services/authErrorHandler.js",
      "bytes": 6290,
      "lines": 241,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "lastModified": 1784872627,
      "ageDays": 0
    },
    {
      "path": "src/services/authUtils.js",
      "bytes": 20962,
      "lines": 583,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872841,
      "ageDays": 0
    },
    {
      "path": "src/services/businessProcessManager.js",
      "bytes": 10951,
      "lines": 303,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872627,
      "ageDays": 0
    },
    {
      "path": "src/services/businessScenarioAnalyzer.js",
      "bytes": 5650,
      "lines": 158,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872627,
      "ageDays": 0
    },
    {
      "path": "src/services/checkStatus.js",
      "bytes": 2418,
      "lines": 100,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 2,
      "lastModified": 1784872849,
      "ageDays": 0
    },
    {
      "path": "src/services/crud.js",
      "bytes": 25550,
      "lines": 826,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872926,
      "ageDays": 0
    },
    {
      "path": "src/services/documentEnrichService.js",
      "bytes": 3461,
      "lines": 110,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "lastModified": 1784872627,
      "ageDays": 0
    },
    {
      "path": "src/services/fileDeleteService.js",
      "bytes": 7273,
      "lines": 238,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872842,
      "ageDays": 0
    },
    {
      "path": "src/services/index.js",
      "bytes": 1888,
      "lines": 81,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 7,
      "extDeps": 0,
      "maxDepth": 3,
      "lastModified": 1784872927,
      "ageDays": 0
    },
    {
      "path": "src/services/requestHelper.js",
      "bytes": 16429,
      "lines": 618,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872927,
      "ageDays": 0
    },
    {
      "path": "src/services/sessionSyncService.js",
      "bytes": 37594,
      "lines": 916,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784875020,
      "ageDays": 0
    },
    {
      "path": "src/styles/common.css",
      "bytes": 1095,
      "lines": 54,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784873412,
      "ageDays": 0
    },
    {
      "path": "src/utils/fileFieldNormalizer.js",
      "bytes": 5580,
      "lines": 193,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872627,
      "ageDays": 0
    },
    {
      "path": "src/utils/filterHelpers.js",
      "bytes": 3258,
      "lines": 107,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872627,
      "ageDays": 0
    },
    {
      "path": "src/utils/index.js",
      "bytes": 1064,
      "lines": 39,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872835,
      "ageDays": 0
    },
    {
      "path": "src/utils/listenerManager.js",
      "bytes": 6035,
      "lines": 194,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872627,
      "ageDays": 0
    },
    {
      "path": "src/utils/modelService.js",
      "bytes": 2423,
      "lines": 101,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872836,
      "ageDays": 0
    },
    {
      "path": "src/utils/resizer.js",
      "bytes": 7621,
      "lines": 232,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872627,
      "ageDays": 0
    },
    {
      "path": "src/utils/view.js",
      "bytes": 97,
      "lines": 3,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872627,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/authDialogMethods.js",
      "bytes": 12289,
      "lines": 254,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/chatMethods.js",
      "bytes": 708,
      "lines": 9,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/fileTreeCrudMethods.js",
      "bytes": 12383,
      "lines": 280,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/fileTreeMethods.js",
      "bytes": 477,
      "lines": 7,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/folderTransferMethods.js",
      "bytes": 16168,
      "lines": 402,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/helpers.js",
      "bytes": 4461,
      "lines": 112,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/imagePreview.js",
      "bytes": 12385,
      "lines": 275,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/inputMethods.js",
      "bytes": 1246,
      "lines": 50,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/mainPageMethods.js",
      "bytes": 31792,
      "lines": 755,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/projectZipMethods.js",
      "bytes": 34049,
      "lines": 709,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/searchMethods.js",
      "bytes": 4401,
      "lines": 155,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/sessionActionMethods.js",
      "bytes": 27321,
      "lines": 613,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextChatMethods.js",
      "bytes": 24167,
      "lines": 551,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextChatMethods.streaming.js",
      "bytes": 43820,
      "lines": 817,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextContextMethods.js",
      "bytes": 23246,
      "lines": 436,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextMethods.js",
      "bytes": 18269,
      "lines": 477,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 8,
      "extDeps": 0,
      "maxDepth": 2,
      "lastModified": 1784875001,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextMethods.scrollSync.js",
      "bytes": 5805,
      "lines": 161,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextMethods.selectSession.js",
      "bytes": 8649,
      "lines": 199,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/sessionChatContextSettingsMethods.js",
      "bytes": 4633,
      "lines": 94,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/sessionEditMethods.js",
      "bytes": 22266,
      "lines": 469,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/sessionFaqMethods.js",
      "bytes": 26498,
      "lines": 666,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/sessionListMethods.js",
      "bytes": 22197,
      "lines": 515,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872933,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/sessionMethods.js",
      "bytes": 387,
      "lines": 6,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/shared.js",
      "bytes": 29864,
      "lines": 736,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/tagComputeds.js",
      "bytes": 14640,
      "lines": 343,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/tagFilterMethods.js",
      "bytes": 7371,
      "lines": 238,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/tagManagerMethods.js",
      "bytes": 17154,
      "lines": 524,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 3,
      "lastModified": 1784872928,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/tagManagerTemplate.js",
      "bytes": 8112,
      "lines": 262,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/uiEventMethods.js",
      "bytes": 4940,
      "lines": 158,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/uiMethods.js",
      "bytes": 284,
      "lines": 5,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/useComputed.js",
      "bytes": 8661,
      "lines": 257,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/useMethods.js",
      "bytes": 8986,
      "lines": 296,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 16,
      "extDeps": 0,
      "maxDepth": 4,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/utilMethods.js",
      "bytes": 2568,
      "lines": 83,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/composables/welcomeCard.js",
      "bytes": 9106,
      "lines": 215,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872847,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/constants.js",
      "bytes": 1036,
      "lines": 62,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/index.html",
      "bytes": 2688,
      "lines": 62,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784873638,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/index.js",
      "bytes": 20356,
      "lines": 356,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 0,
      "maxDepth": 5,
      "lastModified": 1784872848,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/state/fileContentOps.js",
      "bytes": 20270,
      "lines": 503,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872848,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/state/fileTreeBuilders.js",
      "bytes": 4844,
      "lines": 134,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872848,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/state/fileTreeOps.js",
      "bytes": 30898,
      "lines": 705,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872848,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/state/sessionsOps.js",
      "bytes": 9601,
      "lines": 233,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872848,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/state/store.js",
      "bytes": 191,
      "lines": 4,
      "type": ".js",
      "fanIn": 3,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 2,
      "lastModified": 1784872848,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/state/storeFactory.js",
      "bytes": 2368,
      "lines": 72,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 0,
      "maxDepth": 1,
      "lastModified": 1784872848,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/state/storeState.js",
      "bytes": 8599,
      "lines": 235,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872848,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/state/uiOps.js",
      "bytes": 3413,
      "lines": 107,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872848,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/styles/codePage.contextModals.css",
      "bytes": 24478,
      "lines": 959,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/styles/codePage.css",
      "bytes": 21643,
      "lines": 910,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/styles/index.css",
      "bytes": 9312,
      "lines": 405,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 11,
      "maxDepth": 0,
      "lastModified": 1784873539,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/styles/layout.css",
      "bytes": 20151,
      "lines": 723,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "src/views/aicr/styles/welcomeCard.css",
      "bytes": 6608,
      "lines": 222,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "src/views/claude/composables/store.js",
      "bytes": 7870,
      "lines": 201,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872836,
      "ageDays": 0
    },
    {
      "path": "src/views/claude/composables/useComputed.js",
      "bytes": 1110,
      "lines": 40,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "src/views/claude/composables/useMethods.js",
      "bytes": 778,
      "lines": 34,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "src/views/claude/index.html",
      "bytes": 2406,
      "lines": 59,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784873294,
      "ageDays": 0
    },
    {
      "path": "src/views/claude/index.js",
      "bytes": 2537,
      "lines": 67,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784864096,
      "ageDays": 0
    },
    {
      "path": "src/views/claude/styles/index.css",
      "bytes": 320,
      "lines": 6,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 5,
      "maxDepth": 0,
      "lastModified": 1784873500,
      "ageDays": 0
    },
    {
      "path": "src/views/story/composables/filterMethods.js",
      "bytes": 3038,
      "lines": 102,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "lastModified": 1784872848,
      "ageDays": 0
    },
    {
      "path": "src/views/story/composables/storyDataMethods.js",
      "bytes": 8500,
      "lines": 225,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "lastModified": 1784875339,
      "ageDays": 0
    },
    {
      "path": "src/views/story/composables/storyDepsMethods.js",
      "bytes": 2187,
      "lines": 68,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872848,
      "ageDays": 0
    },
    {
      "path": "src/views/story/composables/storyEditMethods.js",
      "bytes": 4512,
      "lines": 122,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872848,
      "ageDays": 0
    },
    {
      "path": "src/views/story/composables/uiMethods.js",
      "bytes": 1630,
      "lines": 60,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "lastModified": 1784872848,
      "ageDays": 0
    },
    {
      "path": "src/views/story/composables/useComputed.js",
      "bytes": 12525,
      "lines": 357,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872848,
      "ageDays": 0
    },
    {
      "path": "src/views/story/composables/useMethods.js",
      "bytes": 1746,
      "lines": 62,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872849,
      "ageDays": 0
    },
    {
      "path": "src/views/story/composables/validators.js",
      "bytes": 4753,
      "lines": 143,
      "type": ".js",
      "fanIn": 3,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872849,
      "ageDays": 0
    },
    {
      "path": "src/views/story/index.html",
      "bytes": 4846,
      "lines": 104,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784873293,
      "ageDays": 0
    },
    {
      "path": "src/views/story/index.js",
      "bytes": 7327,
      "lines": 166,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 3,
      "extDeps": 0,
      "maxDepth": 3,
      "lastModified": 1784872849,
      "ageDays": 0
    },
    {
      "path": "src/views/story/state/store.js",
      "bytes": 49,
      "lines": 2,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 3,
      "lastModified": 1784872849,
      "ageDays": 0
    },
    {
      "path": "src/views/story/state/storeFactory.js",
      "bytes": 1177,
      "lines": 36,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 6,
      "extDeps": 0,
      "maxDepth": 2,
      "lastModified": 1784872849,
      "ageDays": 0
    },
    {
      "path": "src/views/story/state/storeState.js",
      "bytes": 1622,
      "lines": 64,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784872849,
      "ageDays": 0
    },
    {
      "path": "src/views/story/styles/index.css",
      "bytes": 392,
      "lines": 7,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 6,
      "maxDepth": 0,
      "lastModified": 1784873502,
      "ageDays": 0
    },
    {
      "path": "src/views/story/utils/index.js",
      "bytes": 85,
      "lines": 6,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "src/views/story/utils/knowledgeGraphUtils.js",
      "bytes": 15620,
      "lines": 447,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    }
  ],
  "adjacency": {
    "src/services/authErrorHandler.js": [
      "src/services/authUtils.js"
    ],
    "src/services/checkStatus.js": [
      "src/services/authErrorHandler.js"
    ],
    "src/services/documentEnrichService.js": [
      "src/services/crud.js"
    ],
    "src/services/index.js": [
      "src/services/checkStatus.js",
      "src/services/requestHelper.js",
      "src/services/crud.js",
      "src/services/authErrorHandler.js",
      "src/services/businessProcessManager.js",
      "src/services/businessScenarioAnalyzer.js",
      "src/services/documentEnrichService.js"
    ],
    "src/views/aicr/composables/sessionChatContextChatMethods.js": [
      "src/views/aicr/composables/sessionChatContextChatMethods.streaming.js"
    ],
    "src/views/aicr/composables/sessionChatContextMethods.js": [
      "src/views/aicr/composables/shared.js",
      "src/views/aicr/composables/sessionChatContextChatMethods.js",
      "src/views/aicr/composables/sessionChatContextContextMethods.js",
      "src/views/aicr/composables/sessionChatContextSettingsMethods.js",
      "src/views/aicr/composables/helpers.js",
      "src/views/aicr/composables/sessionChatContextMethods.scrollSync.js",
      "src/views/aicr/composables/sessionChatContextMethods.selectSession.js",
      "src/views/aicr/composables/imagePreview.js"
    ],
    "src/views/aicr/composables/shared.js": [
      "src/views/aicr/composables/welcomeCard.js"
    ],
    "src/views/aicr/composables/tagManagerMethods.js": [
      "src/views/aicr/state/store.js",
      "src/views/aicr/composables/tagManagerTemplate.js"
    ],
    "src/views/aicr/composables/useMethods.js": [
      "src/views/aicr/state/store.js",
      "src/views/aicr/composables/sessionFaqMethods.js",
      "src/views/aicr/composables/tagManagerMethods.js",
      "src/views/aicr/composables/sessionChatContextMethods.js",
      "src/views/aicr/composables/fileTreeCrudMethods.js",
      "src/views/aicr/composables/projectZipMethods.js",
      "src/views/aicr/composables/folderTransferMethods.js",
      "src/views/aicr/composables/authDialogMethods.js",
      "src/views/aicr/composables/sessionListMethods.js",
      "src/views/aicr/composables/sessionEditMethods.js",
      "src/views/aicr/composables/sessionActionMethods.js",
      "src/views/aicr/composables/searchMethods.js",
      "src/views/aicr/composables/uiEventMethods.js",
      "src/views/aicr/composables/inputMethods.js",
      "src/views/aicr/composables/utilMethods.js",
      "src/views/aicr/composables/tagFilterMethods.js"
    ],
    "src/views/aicr/index.js": [
      "src/views/aicr/state/store.js",
      "src/views/aicr/composables/useComputed.js",
      "src/views/aicr/composables/tagComputeds.js",
      "src/views/aicr/composables/useMethods.js",
      "src/views/aicr/composables/mainPageMethods.js"
    ],
    "src/views/aicr/state/store.js": [
      "src/views/aicr/state/fileTreeBuilders.js",
      "src/views/aicr/state/storeFactory.js"
    ],
    "src/views/aicr/state/storeFactory.js": [
      "src/views/aicr/state/fileTreeBuilders.js",
      "src/views/aicr/state/storeState.js",
      "src/views/aicr/state/sessionsOps.js",
      "src/views/aicr/state/fileTreeOps.js",
      "src/views/aicr/state/fileContentOps.js",
      "src/views/aicr/state/uiOps.js"
    ],
    "src/views/aicr/styles/index.css": [],
    "src/views/claude/styles/index.css": [],
    "src/views/story/composables/filterMethods.js": [
      "src/views/story/composables/validators.js"
    ],
    "src/views/story/composables/storyDataMethods.js": [
      "src/views/story/composables/validators.js"
    ],
    "src/views/story/composables/uiMethods.js": [
      "src/views/story/composables/validators.js"
    ],
    "src/views/story/index.js": [
      "src/views/story/state/storeFactory.js",
      "src/views/story/composables/useComputed.js",
      "src/views/story/composables/useMethods.js"
    ],
    "src/views/story/state/store.js": [
      "src/views/story/state/storeFactory.js"
    ],
    "src/views/story/state/storeFactory.js": [
      "src/views/story/state/storeState.js",
      "src/views/story/composables/storyDataMethods.js",
      "src/views/story/composables/filterMethods.js",
      "src/views/story/composables/uiMethods.js",
      "src/views/story/composables/storyDepsMethods.js",
      "src/views/story/composables/storyEditMethods.js"
    ],
    "src/views/story/styles/index.css": [],
    "src/views/story/utils/index.js": [
      "src/views/story/utils/knowledgeGraphUtils.js"
    ]
  }
};

/* Alert-enrichment IIFE preserved from template. */
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
