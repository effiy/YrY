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
        generatedAt: "2026-07-24T07:16:01.164Z", /* ISO 8601 UTC — filled in by the analyzer */
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
  "score": 92,
  "alerts": [
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": ".gitignore",
      "line": null,
      "message": "Orphan file: 0 inbound references (29 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- .gitignore` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
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
      "category": "orphan",
      "file": "index.html",
      "line": null,
      "message": "Orphan file: 0 inbound references (33 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- index.html` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "src/styles/style.css",
      "line": null,
      "message": "Orphan file: 0 inbound references (341 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- src/styles/style.css` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    }
  ],
  "summary": {
    "totalFiles": 24,
    "totalBytes": 63108,
    "totalBytesHuman": "61.6 KB",
    "totalLines": 1750,
    "maxDepth": 4,
    "criticalCount": 0,
    "hotspotCount": 0,
    "cycleCount": 0,
    "staleCount": 0
  },
  "treemap": [
    {
      "name": "src/",
      "bytes": 87940,
      "humanBytes": "85.9 KB"
    },
    {
      "name": "assets/",
      "bytes": 30812,
      "humanBytes": "30.1 KB"
    },
    {
      "name": "src/views/",
      "bytes": 27832,
      "humanBytes": "27.2 KB"
    },
    {
      "name": "src/store/",
      "bytes": 17868,
      "humanBytes": "17.4 KB"
    },
    {
      "name": "src/services/",
      "bytes": 14052,
      "humanBytes": "13.7 KB"
    },
    {
      "name": "src/styles/",
      "bytes": 12710,
      "humanBytes": "12.4 KB"
    },
    {
      "name": "src/components/",
      "bytes": 9860,
      "humanBytes": "9.6 KB"
    },
    {
      "name": "src/router/",
      "bytes": 1658,
      "humanBytes": "1.6 KB"
    },
    {
      "name": "src/utils/",
      "bytes": 1604,
      "humanBytes": "1.6 KB"
    }
  ],
  "types": [
    {
      "type": ".js",
      "fileCount": 20,
      "pctFiles": 83.3,
      "totalBytes": 40017,
      "totalBytesHuman": "39.1 KB",
      "pctBytes": 63.4,
      "totalLines": 1340
    },
    {
      "type": ".ico",
      "fileCount": 1,
      "pctFiles": 4.2,
      "totalBytes": 15406,
      "totalBytesHuman": "15.0 KB",
      "pctBytes": 24.4,
      "totalLines": 7
    },
    {
      "type": ".css",
      "fileCount": 1,
      "pctFiles": 4.2,
      "totalBytes": 6355,
      "totalBytesHuman": "6.2 KB",
      "pctBytes": 10.1,
      "totalLines": 341
    },
    {
      "type": ".html",
      "fileCount": 1,
      "pctFiles": 4.2,
      "totalBytes": 1100,
      "totalBytesHuman": "1.1 KB",
      "pctBytes": 1.7,
      "totalLines": 33
    },
    {
      "type": "(none)",
      "fileCount": 1,
      "pctFiles": 4.2,
      "totalBytes": 230,
      "totalBytesHuman": "230 B",
      "pctBytes": 0.4,
      "totalLines": 29
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
      "count": 15,
      "pctFiles": 62.5
    },
    {
      "bucket": "51-100",
      "count": 4,
      "pctFiles": 16.7
    },
    {
      "bucket": "101-250",
      "count": 3,
      "pctFiles": 12.5
    },
    {
      "bucket": "251-500",
      "count": 2,
      "pctFiles": 8.3
    },
    {
      "bucket": "501-1000",
      "count": 0,
      "pctFiles": 0
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
      "path": "assets/favicon.ico",
      "bytes": 15406,
      "bytesHuman": "15.0 KB",
      "lines": 7,
      "type": ".ico",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src/store/index.js",
      "bytes": 8934,
      "bytesHuman": "8.7 KB",
      "lines": 304,
      "type": ".js",
      "depth": 3,
      "fanIn": 0,
      "fanOut": 3
    },
    {
      "path": "src/styles/style.css",
      "bytes": 6355,
      "bytesHuman": "6.2 KB",
      "lines": 341,
      "type": ".css",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src/views/ChatView.js",
      "bytes": 6336,
      "bytesHuman": "6.2 KB",
      "lines": 215,
      "type": ".js",
      "depth": 2,
      "fanIn": 1,
      "fanOut": 2
    },
    {
      "path": "src/views/NewsList.js",
      "bytes": 4134,
      "bytesHuman": "4.0 KB",
      "lines": 120,
      "type": ".js",
      "depth": 1,
      "fanIn": 1,
      "fanOut": 2
    },
    {
      "path": "src/views/SessionList.js",
      "bytes": 3446,
      "bytesHuman": "3.4 KB",
      "lines": 92,
      "type": ".js",
      "depth": 1,
      "fanIn": 1,
      "fanOut": 2
    },
    {
      "path": "config.js",
      "bytes": 2402,
      "bytesHuman": "2.3 KB",
      "lines": 106,
      "type": ".js",
      "depth": 0,
      "fanIn": 4,
      "fanOut": 0
    },
    {
      "path": "src/services/session.js",
      "bytes": 2148,
      "bytesHuman": "2.1 KB",
      "lines": 59,
      "type": ".js",
      "depth": 2,
      "fanIn": 2,
      "fanOut": 2
    },
    {
      "path": "src/components/FilterBar.js",
      "bytes": 1848,
      "bytesHuman": "1.8 KB",
      "lines": 61,
      "type": ".js",
      "depth": 0,
      "fanIn": 2,
      "fanOut": 0
    },
    {
      "path": "src/services/client.js",
      "bytes": 1640,
      "bytesHuman": "1.6 KB",
      "lines": 46,
      "type": ".js",
      "depth": 1,
      "fanIn": 5,
      "fanOut": 2
    },
    {
      "path": "src/services/prompt.js",
      "bytes": 1551,
      "bytesHuman": "1.5 KB",
      "lines": 56,
      "type": ".js",
      "depth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/components/AppFooter.js",
      "bytes": 1150,
      "bytesHuman": "1.1 KB",
      "lines": 39,
      "type": ".js",
      "depth": 0,
      "fanIn": 1,
      "fanOut": 0
    },
    {
      "path": "index.html",
      "bytes": 1100,
      "bytesHuman": "1.1 KB",
      "lines": 33,
      "type": ".html",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src/components/ChatMessage.js",
      "bytes": 1032,
      "bytesHuman": "1.0 KB",
      "lines": 37,
      "type": ".js",
      "depth": 1,
      "fanIn": 1,
      "fanOut": 1
    },
    {
      "path": "src/components/FaqPopup.js",
      "bytes": 900,
      "bytesHuman": "900 B",
      "lines": 35,
      "type": ".js",
      "depth": 0,
      "fanIn": 1,
      "fanOut": 0
    },
    {
      "path": "src/App.js",
      "bytes": 887,
      "bytesHuman": "887 B",
      "lines": 35,
      "type": ".js",
      "depth": 1,
      "fanIn": 1,
      "fanOut": 1
    },
    {
      "path": "src/router/index.js",
      "bytes": 829,
      "bytesHuman": "829 B",
      "lines": 43,
      "type": ".js",
      "depth": 3,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/utils/time.js",
      "bytes": 802,
      "bytesHuman": "802 B",
      "lines": 26,
      "type": ".js",
      "depth": 0,
      "fanIn": 3,
      "fanOut": 0
    },
    {
      "path": "src/services/faq.js",
      "bytes": 491,
      "bytesHuman": "491 B",
      "lines": 16,
      "type": ".js",
      "depth": 2,
      "fanIn": 2,
      "fanOut": 1
    },
    {
      "path": "src/services/auth.js",
      "bytes": 470,
      "bytesHuman": "470 B",
      "lines": 19,
      "type": ".js",
      "depth": 0,
      "fanIn": 3,
      "fanOut": 0
    }
  ],
  "fanin": [
    {
      "path": "src/services/client.js",
      "fanIn": 5,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 46,
      "type": ".js"
    },
    {
      "path": "src/components/FilterBar.js",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 61,
      "type": ".js"
    },
    {
      "path": "src/services/faq.js",
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 16,
      "type": ".js"
    },
    {
      "path": "src/services/news.js",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 9,
      "type": ".js"
    },
    {
      "path": "src/services/session.js",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 59,
      "type": ".js"
    },
    {
      "path": "src/App.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "lines": 35,
      "type": ".js"
    },
    {
      "path": "src/components/AppFooter.js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 2,
      "lines": 39,
      "type": ".js"
    },
    {
      "path": "src/components/ChatMessage.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 1,
      "lines": 37,
      "type": ".js"
    },
    {
      "path": "src/components/FaqPopup.js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 35,
      "type": ".js"
    },
    {
      "path": "src/router/index.js",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 1,
      "lines": 43,
      "type": ".js"
    },
    {
      "path": "src/services/prompt.js",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 0,
      "lines": 56,
      "type": ".js"
    },
    {
      "path": "src/views/ChatView.js",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "lines": 215,
      "type": ".js"
    },
    {
      "path": "src/views/NewsList.js",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 4,
      "lines": 120,
      "type": ".js"
    },
    {
      "path": "src/views/SessionList.js",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 4,
      "lines": 92,
      "type": ".js"
    },
    {
      "path": "src/main.js",
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 3,
      "lines": 15,
      "type": ".js"
    },
    {
      "path": "src/services/index.js",
      "fanIn": 0,
      "fanOut": 6,
      "extDeps": 0,
      "lines": 7,
      "type": ".js"
    },
    {
      "path": "src/store/index.js",
      "fanIn": 0,
      "fanOut": 3,
      "extDeps": 1,
      "lines": 304,
      "type": ".js"
    }
  ],
  "fanout": [
    {
      "path": "src/services/index.js",
      "fanIn": 0,
      "fanOut": 6,
      "extDeps": 0,
      "lines": 7,
      "type": ".js"
    },
    {
      "path": "src/router/index.js",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 1,
      "lines": 43,
      "type": ".js"
    },
    {
      "path": "src/services/prompt.js",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 0,
      "lines": 56,
      "type": ".js"
    },
    {
      "path": "src/store/index.js",
      "fanIn": 0,
      "fanOut": 3,
      "extDeps": 1,
      "lines": 304,
      "type": ".js"
    },
    {
      "path": "src/main.js",
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 3,
      "lines": 15,
      "type": ".js"
    },
    {
      "path": "src/services/client.js",
      "fanIn": 5,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 46,
      "type": ".js"
    },
    {
      "path": "src/services/news.js",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 9,
      "type": ".js"
    },
    {
      "path": "src/services/session.js",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 59,
      "type": ".js"
    },
    {
      "path": "src/views/ChatView.js",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "lines": 215,
      "type": ".js"
    },
    {
      "path": "src/views/NewsList.js",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 4,
      "lines": 120,
      "type": ".js"
    },
    {
      "path": "src/views/SessionList.js",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 4,
      "lines": 92,
      "type": ".js"
    },
    {
      "path": "src/App.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "lines": 35,
      "type": ".js"
    },
    {
      "path": "src/components/ChatMessage.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 1,
      "lines": 37,
      "type": ".js"
    },
    {
      "path": "src/services/faq.js",
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 16,
      "type": ".js"
    },
    {
      "path": "src/components/AppFooter.js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 2,
      "lines": 39,
      "type": ".js"
    },
    {
      "path": "src/components/FaqPopup.js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 35,
      "type": ".js"
    },
    {
      "path": "src/components/FilterBar.js",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 61,
      "type": ".js"
    }
  ],
  "hotspots": [],
  "orphans": [
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
      "path": "src/styles/style.css",
      "bytes": 6355,
      "bytesHuman": "6.2 KB",
      "lines": 341,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.17
    },
    {
      "path": "index.html",
      "bytes": 1100,
      "bytesHuman": "1.1 KB",
      "lines": 33,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.02
    },
    {
      "path": ".gitignore",
      "bytes": 230,
      "bytesHuman": "230 B",
      "lines": 29,
      "type": "",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.01
    }
  ],
  "depthStats": {
    "max": 4,
    "mean": 1.65,
    "median": 2,
    "p90": 3,
    "filesAtMax": 1
  },
  "depthRanking": [
    {
      "path": "src/main.js",
      "bytes": 291,
      "bytesHuman": "291 B",
      "lines": 15,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 2,
      "maxDepth": 4,
      "score": 0
    },
    {
      "path": "src/router/index.js",
      "bytes": 829,
      "bytesHuman": "829 B",
      "lines": 43,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 3,
      "maxDepth": 3,
      "score": 0
    },
    {
      "path": "src/services/index.js",
      "bytes": 407,
      "bytesHuman": "407 B",
      "lines": 7,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 6,
      "maxDepth": 3,
      "score": 0
    },
    {
      "path": "src/store/index.js",
      "bytes": 8934,
      "bytesHuman": "8.7 KB",
      "lines": 304,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 3,
      "maxDepth": 3,
      "score": 0
    },
    {
      "path": "src/services/faq.js",
      "bytes": 491,
      "bytesHuman": "491 B",
      "lines": 16,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 1,
      "maxDepth": 2,
      "score": 0
    },
    {
      "path": "src/services/news.js",
      "bytes": 319,
      "bytesHuman": "319 B",
      "lines": 9,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 2,
      "maxDepth": 2,
      "score": 0
    },
    {
      "path": "src/services/prompt.js",
      "bytes": 1551,
      "bytesHuman": "1.5 KB",
      "lines": 56,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 3,
      "maxDepth": 2,
      "score": 0
    },
    {
      "path": "src/services/session.js",
      "bytes": 2148,
      "bytesHuman": "2.1 KB",
      "lines": 59,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 2,
      "maxDepth": 2,
      "score": 0
    },
    {
      "path": "src/views/ChatView.js",
      "bytes": 6336,
      "bytesHuman": "6.2 KB",
      "lines": 215,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 2,
      "maxDepth": 2,
      "score": 0
    },
    {
      "path": "src/App.js",
      "bytes": 887,
      "bytesHuman": "887 B",
      "lines": 35,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "maxDepth": 1,
      "score": 0
    },
    {
      "path": "src/components/ChatMessage.js",
      "bytes": 1032,
      "bytesHuman": "1.0 KB",
      "lines": 37,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "maxDepth": 1,
      "score": 0
    },
    {
      "path": "src/services/client.js",
      "bytes": 1640,
      "bytesHuman": "1.6 KB",
      "lines": 46,
      "type": ".js",
      "fanIn": 5,
      "fanOut": 2,
      "maxDepth": 1,
      "score": 0
    },
    {
      "path": "src/views/NewsList.js",
      "bytes": 4134,
      "bytesHuman": "4.0 KB",
      "lines": 120,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 2,
      "maxDepth": 1,
      "score": 0
    },
    {
      "path": "src/views/SessionList.js",
      "bytes": 3446,
      "bytesHuman": "3.4 KB",
      "lines": 92,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 2,
      "maxDepth": 1,
      "score": 0
    }
  ],
  "cycles": [],
  "freshness": [],
  "freshnessBuckets": [
    {
      "bucket": "<30d",
      "count": 24,
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
    "asOf": 1784866638000,
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
      "dimName": "Depth",
      "score": 80,
      "why": "Lowest-scoring risk dimension drives overall health drag.",
      "hint": "Invest 2-3 days addressing top alerts in this dimension. Expected uplift: +10-15 pts."
    },
    "trendInsight": "Score 92/100 at generation. 0 P0 alerts require immediate attention.",
    "weightsHint": "Weights follow methodology.md Stage 3.6. Coupling and Staleness carry 0.20 each.",
    "narrative": [
      "Overall health at 92/100 — low risk.",
      "0 critical (P0), 0 major (P1), 4 minor (P2) alerts active.",
      "Top lever: n/a (+0 pts).",
      "Score 92 | gap 0 pts to next grade | decay risk without action: -2 pts/quarter"
    ],
    "severityDonut": {
      "p0": 0,
      "p1": 0,
      "p2": 4,
      "total": 4
    },
    "riskVectors": [
      {
        "dimension": "Depth",
        "score": 80,
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
        "p2": 0
      },
      {
        "dimension": "Coupling",
        "score": 88,
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
        "score": 100,
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
    "levers": [],
    "benchmarks": {
      "currentGrade": "A",
      "currentValue": 92,
      "targetGrade": "A",
      "targetValue": 100,
      "gapToNext": 0
    },
    "remediationPlan": {
      "phases": [
        {
          "phase": "P0 Critical",
          "severity": "P0",
          "itemCount": 0,
          "estUplift": 0,
          "projected": 92,
          "deadline": "7 days"
        },
        {
          "phase": "P1 Major",
          "severity": "P1",
          "itemCount": 0,
          "estUplift": 0,
          "projected": 92,
          "deadline": "30 days"
        },
        {
          "phase": "P2 Minor",
          "severity": "P2",
          "itemCount": 4,
          "estUplift": 8,
          "projected": 100,
          "deadline": "90 days"
        }
      ],
      "currentScore": 92,
      "projectedScoreIfAllP0P1Remediated": 92
    },
    "decayForecast": {
      "currentScore": 92,
      "projectedNext": 90,
      "delta": -2,
      "rationale": "Without active remediation, coupling decay and staleness trend -2 pts/quarter on average."
    }
  },
  "records": [
    {
      "path": ".gitignore",
      "bytes": 230,
      "lines": 29,
      "type": "",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854841,
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
      "lastModified": 1784854841,
      "ageDays": 0
    },
    {
      "path": "config.js",
      "bytes": 2402,
      "lines": 106,
      "type": ".js",
      "fanIn": 4,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854841,
      "ageDays": 0
    },
    {
      "path": "index.html",
      "bytes": 1100,
      "lines": 33,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784855364,
      "ageDays": 0
    },
    {
      "path": "src/App.js",
      "bytes": 887,
      "lines": 35,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 1,
      "lastModified": 1784855223,
      "ageDays": 0
    },
    {
      "path": "src/components/AppFooter.js",
      "bytes": 1150,
      "lines": 39,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "lastModified": 1784855323,
      "ageDays": 0
    },
    {
      "path": "src/components/ChatMessage.js",
      "bytes": 1032,
      "lines": 37,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "lastModified": 1784866593,
      "ageDays": 0
    },
    {
      "path": "src/components/FaqPopup.js",
      "bytes": 900,
      "lines": 35,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "lastModified": 1784866599,
      "ageDays": 0
    },
    {
      "path": "src/components/FilterBar.js",
      "bytes": 1848,
      "lines": 61,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "lastModified": 1784866461,
      "ageDays": 0
    },
    {
      "path": "src/main.js",
      "bytes": 291,
      "lines": 15,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 4,
      "lastModified": 1784855221,
      "ageDays": 0
    },
    {
      "path": "src/router/index.js",
      "bytes": 829,
      "lines": 43,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 1,
      "maxDepth": 3,
      "lastModified": 1784855333,
      "ageDays": 0
    },
    {
      "path": "src/services/auth.js",
      "bytes": 470,
      "lines": 19,
      "type": ".js",
      "fanIn": 3,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784855258,
      "ageDays": 0
    },
    {
      "path": "src/services/client.js",
      "bytes": 1640,
      "lines": 46,
      "type": ".js",
      "fanIn": 5,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 1,
      "lastModified": 1784855363,
      "ageDays": 0
    },
    {
      "path": "src/services/faq.js",
      "bytes": 491,
      "lines": 16,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 2,
      "lastModified": 1784855268,
      "ageDays": 0
    },
    {
      "path": "src/services/index.js",
      "bytes": 407,
      "lines": 7,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 6,
      "extDeps": 0,
      "maxDepth": 3,
      "lastModified": 1784855273,
      "ageDays": 0
    },
    {
      "path": "src/services/news.js",
      "bytes": 319,
      "lines": 9,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 2,
      "lastModified": 1784855365,
      "ageDays": 0
    },
    {
      "path": "src/services/prompt.js",
      "bytes": 1551,
      "lines": 56,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 0,
      "maxDepth": 2,
      "lastModified": 1784855420,
      "ageDays": 0
    },
    {
      "path": "src/services/session.js",
      "bytes": 2148,
      "lines": 59,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 2,
      "lastModified": 1784855364,
      "ageDays": 0
    },
    {
      "path": "src/store/index.js",
      "bytes": 8934,
      "lines": 304,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 3,
      "extDeps": 1,
      "maxDepth": 3,
      "lastModified": 1784855256,
      "ageDays": 0
    },
    {
      "path": "src/styles/style.css",
      "bytes": 6355,
      "lines": 341,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784855348,
      "ageDays": 0
    },
    {
      "path": "src/utils/time.js",
      "bytes": 802,
      "lines": 26,
      "type": ".js",
      "fanIn": 3,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784866210,
      "ageDays": 0
    },
    {
      "path": "src/views/ChatView.js",
      "bytes": 6336,
      "lines": 215,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 2,
      "lastModified": 1784866638,
      "ageDays": 0
    },
    {
      "path": "src/views/NewsList.js",
      "bytes": 4134,
      "lines": 120,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 4,
      "maxDepth": 1,
      "lastModified": 1784866505,
      "ageDays": 0
    },
    {
      "path": "src/views/SessionList.js",
      "bytes": 3446,
      "lines": 92,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 4,
      "maxDepth": 1,
      "lastModified": 1784866484,
      "ageDays": 0
    }
  ],
  "adjacency": {
    "src/App.js": [
      "src/components/AppFooter.js"
    ],
    "src/components/AppFooter.js": [],
    "src/components/ChatMessage.js": [
      "src/utils/time.js"
    ],
    "src/components/FaqPopup.js": [],
    "src/components/FilterBar.js": [],
    "src/main.js": [
      "src/App.js",
      "src/router/index.js"
    ],
    "src/router/index.js": [
      "src/views/SessionList.js",
      "src/views/NewsList.js",
      "src/views/ChatView.js"
    ],
    "src/services/client.js": [
      "src/services/auth.js",
      "config.js"
    ],
    "src/services/faq.js": [
      "src/services/client.js"
    ],
    "src/services/index.js": [
      "src/services/client.js",
      "src/services/auth.js",
      "src/services/session.js",
      "src/services/news.js",
      "src/services/faq.js",
      "src/services/prompt.js"
    ],
    "src/services/news.js": [
      "config.js",
      "src/services/client.js"
    ],
    "src/services/prompt.js": [
      "src/services/client.js",
      "src/services/auth.js",
      "config.js"
    ],
    "src/services/session.js": [
      "config.js",
      "src/services/client.js"
    ],
    "src/store/index.js": [
      "src/services/session.js",
      "src/services/news.js",
      "src/services/faq.js"
    ],
    "src/views/ChatView.js": [
      "src/components/ChatMessage.js",
      "src/components/FaqPopup.js"
    ],
    "src/views/NewsList.js": [
      "src/utils/time.js",
      "src/components/FilterBar.js"
    ],
    "src/views/SessionList.js": [
      "src/utils/time.js",
      "src/components/FilterBar.js"
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
