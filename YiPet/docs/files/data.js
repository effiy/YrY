window.REPORT_CONFIG = {
    /* Runtime options used by the analysis run. Displayed in the header
       and footer as the verbatim JSON. `generatedAt` is an ISO timestamp
       used to compute the stale-data warning + footer recap. */
    options: {
        topN: 20,
        noCycles: false,
        generatedAt: '2026-07-16T03:48:21.238Z', /* ISO 8601 UTC — filled in by the analyzer */
    },

    /* Fixed constants shared across the report UI. */
    constants: {
        filterDebounceMs: 200,
        componentReadyTimeoutMs: 5000,
    },

    labels: {
        /* ── Header / chrome ─────────────────────────────────────── */
        title:            'rui-report-files',
        footerMethodology:'Methodology: rui-report-files scoring (size × coupling × depth × freshness) · alert contracts: P0/P1/P2 severity rules · template: self-contained report page',

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

window.REPORT_DATA = {
  "scope": "YrY/",
  "score": 88,
  "alerts": [
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "docs/arch/knowledge-graph.json",
      "line": null,
      "message": "File exceeds 1000 LOC (28034 lines)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "hotspot",
      "file": "docs/arch/knowledge-graph.json",
      "line": null,
      "message": "Hotspot score 14.02 (>= 5.0)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "docs/files/index.html",
      "line": null,
      "message": "File exceeds 1000 LOC (1212 lines)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "package-lock.json",
      "line": null,
      "message": "File exceeds 1000 LOC (10517 lines)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "hotspot",
      "file": "package-lock.json",
      "line": null,
      "message": "Hotspot score 5.26 (>= 5.0)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "src/config/dark-sites.config",
      "line": null,
      "message": "File exceeds 1000 LOC (1301 lines)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "src/config/detector-hints.config",
      "line": null,
      "message": "File exceeds 1000 LOC (1816 lines)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "src/config/dynamic-theme-fixes.config",
      "line": null,
      "message": "File exceeds 1000 LOC (40286 lines)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "hotspot",
      "file": "src/config/dynamic-theme-fixes.config",
      "line": null,
      "message": "Hotspot score 20.14 (>= 5.0)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "src/config/inversion-fixes.config",
      "line": null,
      "message": "File exceeds 1000 LOC (3165 lines)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "hotspot",
      "file": "src/inject/dynamic-theme/index.ts",
      "line": null,
      "message": "Hotspot score 7.57 (>= 5.0)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "hotspot",
      "file": "src/ui/controls/index.ts",
      "line": null,
      "message": "Hotspot score 11.22 (>= 5.0)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "hotspot",
      "file": "src/utils/platform.ts",
      "line": null,
      "message": "Hotspot score 8.66 (>= 5.0)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "hotspot",
      "file": "src/utils/url.ts",
      "line": null,
      "message": "Hotspot score 6 (>= 5.0)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "tests/inject/dynamic/variables.tests.ts",
      "line": null,
      "message": "File exceeds 1000 LOC (1320 lines)"
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "yarn.lock",
      "line": null,
      "message": "File exceeds 1000 LOC (5138 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "CHANGELOG.md",
      "line": null,
      "message": "File exceeds 500 LOC (636 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "docs/arch/index.css",
      "line": null,
      "message": "File exceeds 500 LOC (549 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "docs/arch/index.js",
      "line": null,
      "message": "File exceeds 500 LOC (651 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "docs/files/components/rui-report-self-improvement/index.css",
      "line": null,
      "message": "File exceeds 500 LOC (521 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "docs/files/components/rui-report-self-improvement/index.html",
      "line": null,
      "message": "File exceeds 500 LOC (537 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "docs/files/components/rui-report-self-improvement/index.js",
      "line": null,
      "message": "File exceeds 500 LOC (694 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "docs/files/index.js",
      "line": null,
      "message": "File exceeds 500 LOC (721 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "src/background/extension.ts",
      "line": null,
      "message": "File exceeds 500 LOC (585 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "src/inject/dynamic-theme/index.ts",
      "line": null,
      "message": "File exceeds 500 LOC (942 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "src/inject/dynamic-theme/inline-style.ts",
      "line": null,
      "message": "File exceeds 500 LOC (631 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "src/inject/dynamic-theme/modify-css.ts",
      "line": null,
      "message": "File exceeds 500 LOC (786 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/inject/dynamic-theme/modify-css.ts",
      "line": null,
      "message": "2-node cycle detected"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "src/inject/dynamic-theme/style-manager.ts",
      "line": null,
      "message": "File exceeds 500 LOC (675 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "src/inject/dynamic-theme/variables.ts",
      "line": null,
      "message": "File exceeds 500 LOC (916 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "src/ui/assets/fonts/OpenSans-Light.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (719 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "src/ui/assets/fonts/OpenSans-Regular.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (642 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "src/ui/assets/fonts/OpenSans-SemiBold.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (716 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "src/utils/color.ts",
      "line": null,
      "message": "File exceeds 500 LOC (689 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "src/utils/url.ts",
      "line": null,
      "message": "File exceeds 500 LOC (600 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "tests/unit/generators/utils/parse.tests.ts",
      "line": null,
      "message": "File exceeds 500 LOC (578 lines)"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "tests/unit/utils/state-manager.tests.ts",
      "line": null,
      "message": "File exceeds 500 LOC (644 lines)"
    }
  ],
  "summary": {
    "totalFiles": 441,
    "totalBytes": 4531488,
    "totalBytesHuman": "4.3 MB",
    "maxDepth": 13,
    "criticalCount": 16,
    "hotspotCount": 50,
    "cycleCount": 1,
    "staleCount": 0,
    "totalLines": 143055
  },
  "treemap": [
    {
      "name": "src/",
      "bytes": 2151586,
      "humanBytes": "2.1 MB"
    },
    {
      "name": "docs/",
      "bytes": 1295528,
      "humanBytes": "1.2 MB"
    },
    {
      "name": "docs/arch/",
      "bytes": 936252,
      "humanBytes": "914.3 KB"
    },
    {
      "name": "src/config/",
      "bytes": 856983,
      "humanBytes": "836.9 KB"
    },
    {
      "name": "src/ui/",
      "bytes": 663247,
      "humanBytes": "647.7 KB"
    },
    {
      "name": "src/ui/assets/",
      "bytes": 383642,
      "humanBytes": "374.7 KB"
    },
    {
      "name": "tests/",
      "bytes": 335744,
      "humanBytes": "327.9 KB"
    },
    {
      "name": "src/ui/assets/fonts/",
      "bytes": 310806,
      "humanBytes": "303.5 KB"
    },
    {
      "name": "src/inject/",
      "bytes": 305729,
      "humanBytes": "298.6 KB"
    },
    {
      "name": "docs/files/",
      "bytes": 284684,
      "humanBytes": "278.0 KB"
    },
    {
      "name": "src/inject/dynamic-theme/",
      "bytes": 259332,
      "humanBytes": "253.3 KB"
    },
    {
      "name": "docs/files/components/",
      "bytes": 156794,
      "humanBytes": "153.1 KB"
    },
    {
      "name": "tests/inject/",
      "bytes": 149563,
      "humanBytes": "146.1 KB"
    },
    {
      "name": "src/utils/",
      "bytes": 125285,
      "humanBytes": "122.3 KB"
    },
    {
      "name": "src/background/",
      "bytes": 119828,
      "humanBytes": "117.0 KB"
    },
    {
      "name": "tests/inject/dynamic/",
      "bytes": 117642,
      "humanBytes": "114.9 KB"
    },
    {
      "name": "docs/files/components/rui-report-self-improvement/",
      "bytes": 116220,
      "humanBytes": "113.5 KB"
    },
    {
      "name": "tests/unit/",
      "bytes": 104924,
      "humanBytes": "102.5 KB"
    },
    {
      "name": "tasks/",
      "bytes": 101423,
      "humanBytes": "99.0 KB"
    },
    {
      "name": "src/ui/controls/",
      "bytes": 90504,
      "humanBytes": "88.4 KB"
    },
    {
      "name": "src/ui/popup/",
      "bytes": 88989,
      "humanBytes": "86.9 KB"
    },
    {
      "name": "tests/browser/",
      "bytes": 79327,
      "humanBytes": "77.5 KB"
    },
    {
      "name": "src/ui/assets/images/",
      "bytes": 72836,
      "humanBytes": "71.1 KB"
    },
    {
      "name": "tests/unit/utils/",
      "bytes": 64717,
      "humanBytes": "63.2 KB"
    },
    {
      "name": "src/ui/popup/components/",
      "bytes": 48502,
      "humanBytes": "47.4 KB"
    },
    {
      "name": "src/ui/options/",
      "bytes": 41786,
      "humanBytes": "40.8 KB"
    },
    {
      "name": "src/generators/",
      "bytes": 38330,
      "humanBytes": "37.4 KB"
    },
    {
      "name": "tests/browser/e2e/",
      "bytes": 29217,
      "humanBytes": "28.5 KB"
    },
    {
      "name": "src/ui/devtools/",
      "bytes": 27140,
      "humanBytes": "26.5 KB"
    },
    {
      "name": "docs/self-test/",
      "bytes": 22911,
      "humanBytes": "22.4 KB"
    },
    {
      "name": "tests/inject/utils/",
      "bytes": 20038,
      "humanBytes": "19.6 KB"
    },
    {
      "name": "src/inject/dynamic-theme/watch/",
      "bytes": 18300,
      "humanBytes": "17.9 KB"
    },
    {
      "name": "src/ui/devtools/components/",
      "bytes": 18122,
      "humanBytes": "17.7 KB"
    },
    {
      "name": "src/ui/popup/components/header/",
      "bytes": 17369,
      "humanBytes": "17.0 KB"
    },
    {
      "name": "src/background/utils/",
      "bytes": 17212,
      "humanBytes": "16.8 KB"
    },
    {
      "name": "src/ui/controls/color-picker/",
      "bytes": 15914,
      "humanBytes": "15.5 KB"
    },
    {
      "name": "tests/unit/generators/",
      "bytes": 15377,
      "humanBytes": "15.0 KB"
    },
    {
      "name": "tests/unit/generators/utils/",
      "bytes": 15377,
      "humanBytes": "15.0 KB"
    },
    {
      "name": "src/icons/",
      "bytes": 15364,
      "humanBytes": "15.0 KB"
    },
    {
      "name": "tests/browser/dynamic/",
      "bytes": 14757,
      "humanBytes": "14.4 KB"
    },
    {
      "name": "src/inject/utils/",
      "bytes": 14645,
      "humanBytes": "14.3 KB"
    },
    {
      "name": "tests/unit/config/",
      "bytes": 12129,
      "humanBytes": "11.8 KB"
    },
    {
      "name": "src/ui/options/advanced/",
      "bytes": 11271,
      "humanBytes": "11.0 KB"
    },
    {
      "name": "src/ui/controls/slider/",
      "bytes": 10807,
      "humanBytes": "10.6 KB"
    },
    {
      "name": "tests/unit/inject/",
      "bytes": 10683,
      "humanBytes": "10.4 KB"
    },
    {
      "name": "src/utils/css-text/",
      "bytes": 10071,
      "humanBytes": "9.8 KB"
    },
    {
      "name": "docs/files/components/rui-report-health/",
      "bytes": 9877,
      "humanBytes": "9.6 KB"
    },
    {
      "name": "src/generators/utils/",
      "bytes": 9668,
      "humanBytes": "9.4 KB"
    },
    {
      "name": "src/ui/popup/main-page/",
      "bytes": 9429,
      "humanBytes": "9.2 KB"
    },
    {
      "name": "src/ui/icons/",
      "bytes": 9181,
      "humanBytes": "9.0 KB"
    }
  ],
  "types": [
    {
      "type": ".other",
      "fileCount": 125,
      "totalBytes": 2971235,
      "totalLines": 102385,
      "pctFiles": 28.3,
      "pctBytes": 65.6,
      "totalBytesHuman": "2.8 MB"
    },
    {
      "type": ".ts",
      "fileCount": 154,
      "totalBytes": 923652,
      "totalLines": 25343,
      "pctFiles": 34.9,
      "pctBytes": 20.4,
      "totalBytesHuman": "902.0 KB"
    },
    {
      "type": ".js",
      "fileCount": 56,
      "totalBytes": 366082,
      "totalLines": 8134,
      "pctFiles": 12.7,
      "pctBytes": 8.1,
      "totalBytesHuman": "357.5 KB"
    },
    {
      "type": ".tsx",
      "fileCount": 91,
      "totalBytes": 174360,
      "totalLines": 5235,
      "pctFiles": 20.6,
      "pctBytes": 3.8,
      "totalBytesHuman": "170.3 KB"
    },
    {
      "type": ".css",
      "fileCount": 10,
      "totalBytes": 93321,
      "totalLines": 1866,
      "pctFiles": 2.3,
      "pctBytes": 2.1,
      "totalBytesHuman": "91.1 KB"
    },
    {
      "type": ".mjs",
      "fileCount": 4,
      "totalBytes": 2201,
      "totalLines": 68,
      "pctFiles": 0.9,
      "pctBytes": 0,
      "totalBytesHuman": "2.1 KB"
    },
    {
      "type": ".cjs",
      "fileCount": 1,
      "totalBytes": 637,
      "totalLines": 24,
      "pctFiles": 0.2,
      "pctBytes": 0,
      "totalBytesHuman": "637 B"
    }
  ],
  "histogram": [
    {
      "bucket": "0",
      "count": 6,
      "pctFiles": 1.4
    },
    {
      "bucket": "1-50",
      "count": 187,
      "pctFiles": 42.4
    },
    {
      "bucket": "51-100",
      "count": 94,
      "pctFiles": 21.3
    },
    {
      "bucket": "101-250",
      "count": 91,
      "pctFiles": 20.6
    },
    {
      "bucket": "251-500",
      "count": 34,
      "pctFiles": 7.7
    },
    {
      "bucket": "501-1000",
      "count": 20,
      "pctFiles": 4.5
    },
    {
      "bucket": "1001-2000",
      "count": 4,
      "pctFiles": 0.9
    },
    {
      "bucket": "2000+",
      "count": 5,
      "pctFiles": 1.1
    }
  ],
  "largest": [
    {
      "path": "docs/arch/knowledge-graph.json",
      "bytes": 812359,
      "bytesHuman": "793.3 KB",
      "lines": 28034,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src/config/dynamic-theme-fixes.config",
      "bytes": 770945,
      "bytesHuman": "752.9 KB",
      "lines": 40286,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "package-lock.json",
      "bytes": 374649,
      "bytesHuman": "365.9 KB",
      "lines": 10517,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "yarn.lock",
      "bytes": 204806,
      "bytesHuman": "200.0 KB",
      "lines": 5138,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src/ui/assets/fonts/OpenSans-Light.ttf",
      "bytes": 101696,
      "bytesHuman": "99.3 KB",
      "lines": 719,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src/ui/assets/fonts/OpenSans-SemiBold.ttf",
      "bytes": 100820,
      "bytesHuman": "98.5 KB",
      "lines": 716,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src/ui/assets/fonts/OpenSans-Regular.ttf",
      "bytes": 96932,
      "bytesHuman": "94.7 KB",
      "lines": 642,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "docs/files/index.html",
      "bytes": 56140,
      "bytesHuman": "54.8 KB",
      "lines": 1212,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "tests/inject/dynamic/variables.tests.ts",
      "bytes": 54156,
      "bytesHuman": "52.9 KB",
      "lines": 1320,
      "type": ".ts",
      "depth": 13,
      "fanIn": 0,
      "fanOut": 8
    },
    {
      "path": "src/config/inversion-fixes.config",
      "bytes": 43438,
      "bytesHuman": "42.4 KB",
      "lines": 3165,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "docs/arch/data.js",
      "bytes": 42785,
      "bytesHuman": "41.8 KB",
      "lines": 43,
      "type": ".js",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "docs/files/components/rui-report-self-improvement/index.html",
      "bytes": 40699,
      "bytesHuman": "39.7 KB",
      "lines": 537,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "docs/files/components/rui-report-self-improvement/index.css",
      "bytes": 39546,
      "bytesHuman": "38.6 KB",
      "lines": 521,
      "type": ".css",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "docs/files/components/rui-report-self-improvement/index.js",
      "bytes": 35911,
      "bytesHuman": "35.1 KB",
      "lines": 694,
      "type": ".js",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src/inject/dynamic-theme/index.ts",
      "bytes": 35695,
      "bytesHuman": "34.9 KB",
      "lines": 942,
      "type": ".ts",
      "depth": 12,
      "fanIn": 11,
      "fanOut": 25
    },
    {
      "path": "src/inject/dynamic-theme/variables.ts",
      "bytes": 34423,
      "bytesHuman": "33.6 KB",
      "lines": 916,
      "type": ".ts",
      "depth": 5,
      "fanIn": 4,
      "fanOut": 5
    },
    {
      "path": "docs/files/data.js",
      "bytes": 32226,
      "bytesHuman": "31.5 KB",
      "lines": 434,
      "type": ".js",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src/inject/dynamic-theme/modify-css.ts",
      "bytes": 31577,
      "bytesHuman": "30.8 KB",
      "lines": 786,
      "type": ".ts",
      "depth": 7,
      "fanIn": 5,
      "fanOut": 13
    },
    {
      "path": "docs/files/index.js",
      "bytes": 30267,
      "bytesHuman": "29.6 KB",
      "lines": 721,
      "type": ".js",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "docs/arch/index.js",
      "bytes": 27900,
      "bytesHuman": "27.2 KB",
      "lines": 651,
      "type": ".js",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    }
  ],
  "fanin": [
    {
      "path": "src/utils/platform.ts",
      "fanIn": 43,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 118,
      "type": ".ts"
    },
    {
      "path": "src/ui/controls/index.ts",
      "fanIn": 40,
      "fanOut": 20,
      "extDeps": 0,
      "lines": 43,
      "type": ".ts"
    },
    {
      "path": "src/utils/url.ts",
      "fanIn": 27,
      "fanOut": 1,
      "extDeps": 1,
      "lines": 600,
      "type": ".ts"
    },
    {
      "path": "src/utils/locales.ts",
      "fanIn": 21,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 17,
      "type": ".ts"
    },
    {
      "path": "tasks/utils.js",
      "fanIn": 21,
      "fanOut": 0,
      "extDeps": 5,
      "lines": 201,
      "type": ".js"
    },
    {
      "path": "src/utils/text.ts",
      "fanIn": 19,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 162,
      "type": ".ts"
    },
    {
      "path": "src/utils/message.ts",
      "fanIn": 16,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 62,
      "type": ".ts"
    },
    {
      "path": "src/defaults.ts",
      "fanIn": 15,
      "fanOut": 3,
      "extDeps": 2,
      "lines": 96,
      "type": ".ts"
    },
    {
      "path": "tasks/task.js",
      "fanIn": 14,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 84,
      "type": ".js"
    },
    {
      "path": "src/utils/color.ts",
      "fanIn": 13,
      "fanOut": 3,
      "extDeps": 0,
      "lines": 689,
      "type": ".ts"
    },
    {
      "path": "tasks/platform.js",
      "fanIn": 13,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 11,
      "type": ".js"
    },
    {
      "path": "tests/support/test-utils.ts",
      "fanIn": 13,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 21,
      "type": ".ts"
    },
    {
      "path": "tasks/paths.js",
      "fanIn": 12,
      "fanOut": 0,
      "extDeps": 2,
      "lines": 31,
      "type": ".js"
    },
    {
      "path": "src/inject/dynamic-theme/index.ts",
      "fanIn": 11,
      "fanOut": 25,
      "extDeps": 1,
      "lines": 942,
      "type": ".ts"
    },
    {
      "path": "src/inject/utils/log.ts",
      "fanIn": 11,
      "fanOut": 1,
      "extDeps": 1,
      "lines": 54,
      "type": ".ts"
    },
    {
      "path": "src/ui/utils.ts",
      "fanIn": 10,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 211,
      "type": ".ts"
    },
    {
      "path": "src/utils/array.ts",
      "fanIn": 10,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 34,
      "type": ".ts"
    },
    {
      "path": "src/generators/theme-engines.ts",
      "fanIn": 9,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 6,
      "type": ".ts"
    },
    {
      "path": "src/utils/links.ts",
      "fanIn": 9,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 46,
      "type": ".ts"
    },
    {
      "path": "tests/inject/support/test-utils.ts",
      "fanIn": 9,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 21,
      "type": ".ts"
    }
  ],
  "fanout": [
    {
      "path": "src/inject/dynamic-theme/index.ts",
      "fanIn": 11,
      "fanOut": 25,
      "extDeps": 1,
      "lines": 942,
      "type": ".ts"
    },
    {
      "path": "src/background/extension.ts",
      "fanIn": 1,
      "fanOut": 23,
      "extDeps": 1,
      "lines": 585,
      "type": ".ts"
    },
    {
      "path": "src/ui/controls/index.ts",
      "fanIn": 40,
      "fanOut": 20,
      "extDeps": 0,
      "lines": 43,
      "type": ".ts"
    },
    {
      "path": "tasks/build.js",
      "fanIn": 0,
      "fanOut": 16,
      "extDeps": 1,
      "lines": 161,
      "type": ".js"
    },
    {
      "path": "src/inject/dynamic-theme/style-manager.ts",
      "fanIn": 3,
      "fanOut": 14,
      "extDeps": 1,
      "lines": 675,
      "type": ".ts"
    },
    {
      "path": "src/inject/dynamic-theme/modify-css.ts",
      "fanIn": 5,
      "fanOut": 13,
      "extDeps": 1,
      "lines": 786,
      "type": ".ts"
    },
    {
      "path": "src/background/tab-manager.ts",
      "fanIn": 1,
      "fanOut": 11,
      "extDeps": 1,
      "lines": 476,
      "type": ".ts"
    },
    {
      "path": "src/inject/index.ts",
      "fanIn": 0,
      "fanOut": 11,
      "extDeps": 2,
      "lines": 295,
      "type": ".ts"
    },
    {
      "path": "src/ui/popup/components/body.tsx",
      "fanIn": 1,
      "fanOut": 11,
      "extDeps": 6,
      "lines": 129,
      "type": ".tsx"
    },
    {
      "path": "src/background/config-manager.ts",
      "fanIn": 2,
      "fanOut": 10,
      "extDeps": 0,
      "lines": 239,
      "type": ".ts"
    },
    {
      "path": "src/inject/dynamic-theme/inline-style.ts",
      "fanIn": 1,
      "fanOut": 10,
      "extDeps": 1,
      "lines": 631,
      "type": ".ts"
    },
    {
      "path": "src/ui/devtools/components/body.tsx",
      "fanIn": 1,
      "fanOut": 10,
      "extDeps": 4,
      "lines": 162,
      "type": ".tsx"
    },
    {
      "path": "src/background/index.ts",
      "fanIn": 0,
      "fanOut": 9,
      "extDeps": 1,
      "lines": 252,
      "type": ".ts"
    },
    {
      "path": "src/ui/options/body/body.tsx",
      "fanIn": 1,
      "fanOut": 9,
      "extDeps": 3,
      "lines": 55,
      "type": ".tsx"
    },
    {
      "path": "src/ui/popup/components/more-settings/index.tsx",
      "fanIn": 1,
      "fanOut": 9,
      "extDeps": 2,
      "lines": 83,
      "type": ".tsx"
    },
    {
      "path": "src/background/user-storage.ts",
      "fanIn": 2,
      "fanOut": 8,
      "extDeps": 1,
      "lines": 214,
      "type": ".ts"
    },
    {
      "path": "src/inject/dynamic-theme/image.ts",
      "fanIn": 4,
      "fanOut": 8,
      "extDeps": 1,
      "lines": 418,
      "type": ".ts"
    },
    {
      "path": "src/ui/options/advanced/advanced-tab.tsx",
      "fanIn": 1,
      "fanOut": 8,
      "extDeps": 2,
      "lines": 25,
      "type": ".tsx"
    },
    {
      "path": "src/ui/popup/components/header/index.tsx",
      "fanIn": 1,
      "fanOut": 8,
      "extDeps": 2,
      "lines": 92,
      "type": ".tsx"
    },
    {
      "path": "tests/inject/dynamic/variables.tests.ts",
      "fanIn": 0,
      "fanOut": 8,
      "extDeps": 0,
      "lines": 1320,
      "type": ".ts"
    }
  ],
  "hotspots": [
    {
      "path": "src/config/dynamic-theme-fixes.config",
      "bytes": 770945,
      "bytesHuman": "752.9 KB",
      "lines": 40286,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 20.14
    },
    {
      "path": "docs/arch/knowledge-graph.json",
      "bytes": 812359,
      "bytesHuman": "793.3 KB",
      "lines": 28034,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 14.02
    },
    {
      "path": "src/ui/controls/index.ts",
      "bytes": 1066,
      "bytesHuman": "1.0 KB",
      "lines": 43,
      "type": ".ts",
      "fanIn": 40,
      "fanOut": 20,
      "maxDepth": 6,
      "score": 11.22
    },
    {
      "path": "src/utils/platform.ts",
      "bytes": 5384,
      "bytesHuman": "5.3 KB",
      "lines": 118,
      "type": ".ts",
      "fanIn": 43,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 8.66
    },
    {
      "path": "src/inject/dynamic-theme/index.ts",
      "bytes": 35695,
      "bytesHuman": "34.9 KB",
      "lines": 942,
      "type": ".ts",
      "fanIn": 11,
      "fanOut": 25,
      "maxDepth": 12,
      "score": 7.57
    },
    {
      "path": "src/utils/url.ts",
      "bytes": 16978,
      "bytesHuman": "16.6 KB",
      "lines": 600,
      "type": ".ts",
      "fanIn": 27,
      "fanOut": 1,
      "maxDepth": 1,
      "score": 6
    },
    {
      "path": "package-lock.json",
      "bytes": 374649,
      "bytesHuman": "365.9 KB",
      "lines": 10517,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 5.26
    },
    {
      "path": "tasks/utils.js",
      "bytes": 5014,
      "bytesHuman": "4.9 KB",
      "lines": 201,
      "type": ".js",
      "fanIn": 21,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.3
    },
    {
      "path": "src/utils/locales.ts",
      "bytes": 622,
      "bytesHuman": "622 B",
      "lines": 17,
      "type": ".ts",
      "fanIn": 21,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.21
    },
    {
      "path": "src/inject/dynamic-theme/style-manager.ts",
      "bytes": 23444,
      "bytesHuman": "22.9 KB",
      "lines": 675,
      "type": ".ts",
      "fanIn": 3,
      "fanOut": 14,
      "maxDepth": 9,
      "score": 4.14
    },
    {
      "path": "src/inject/dynamic-theme/modify-css.ts",
      "bytes": 31577,
      "bytesHuman": "30.8 KB",
      "lines": 786,
      "type": ".ts",
      "fanIn": 5,
      "fanOut": 13,
      "maxDepth": 7,
      "score": 4.09
    },
    {
      "path": "tests/inject/dynamic/variables.tests.ts",
      "bytes": 54156,
      "bytesHuman": "52.9 KB",
      "lines": 1320,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 8,
      "maxDepth": 13,
      "score": 4.06
    },
    {
      "path": "src/background/extension.ts",
      "bytes": 23994,
      "bytesHuman": "23.4 KB",
      "lines": 585,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 23,
      "maxDepth": 6,
      "score": 3.99
    },
    {
      "path": "src/utils/text.ts",
      "bytes": 4855,
      "bytesHuman": "4.7 KB",
      "lines": 162,
      "type": ".ts",
      "fanIn": 19,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.88
    },
    {
      "path": "src/inject/index.ts",
      "bytes": 11164,
      "bytesHuman": "10.9 KB",
      "lines": 295,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 11,
      "maxDepth": 13,
      "score": 3.85
    },
    {
      "path": "src/ui/popup/components/body.tsx",
      "bytes": 4277,
      "bytesHuman": "4.2 KB",
      "lines": 129,
      "type": ".tsx",
      "fanIn": 1,
      "fanOut": 11,
      "maxDepth": 12,
      "score": 3.76
    },
    {
      "path": "src/utils/color.ts",
      "bytes": 19097,
      "bytesHuman": "18.6 KB",
      "lines": 689,
      "type": ".ts",
      "fanIn": 13,
      "fanOut": 3,
      "maxDepth": 2,
      "score": 3.64
    },
    {
      "path": "src/defaults.ts",
      "bytes": 2718,
      "bytesHuman": "2.7 KB",
      "lines": 96,
      "type": ".ts",
      "fanIn": 15,
      "fanOut": 3,
      "maxDepth": 1,
      "score": 3.55
    },
    {
      "path": "tasks/task.js",
      "bytes": 2047,
      "bytesHuman": "2.0 KB",
      "lines": 84,
      "type": ".js",
      "fanIn": 14,
      "fanOut": 2,
      "maxDepth": 2,
      "score": 3.44
    },
    {
      "path": "src/api/index.ts",
      "bytes": 2526,
      "bytesHuman": "2.5 KB",
      "lines": 79,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 7,
      "maxDepth": 13,
      "score": 3.34
    },
    {
      "path": "tests/inject/dynamic/link-override.tests.ts",
      "bytes": 10028,
      "bytesHuman": "9.8 KB",
      "lines": 226,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 6,
      "maxDepth": 13,
      "score": 3.31
    },
    {
      "path": "src/ui/devtools/components/body.tsx",
      "bytes": 7841,
      "bytesHuman": "7.7 KB",
      "lines": 162,
      "type": ".tsx",
      "fanIn": 1,
      "fanOut": 10,
      "maxDepth": 10,
      "score": 3.28
    },
    {
      "path": "src/ui/popup/index.tsx",
      "bytes": 5238,
      "bytesHuman": "5.1 KB",
      "lines": 148,
      "type": ".tsx",
      "fanIn": 0,
      "fanOut": 6,
      "maxDepth": 13,
      "score": 3.27
    },
    {
      "path": "tests/inject/dynamic/fixes.tests.ts",
      "bytes": 4555,
      "bytesHuman": "4.4 KB",
      "lines": 118,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 6,
      "maxDepth": 13,
      "score": 3.26
    },
    {
      "path": "tests/inject/dynamic/image-analysis.tests.ts",
      "bytes": 11428,
      "bytesHuman": "11.2 KB",
      "lines": 290,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 5,
      "maxDepth": 13,
      "score": 3.25
    },
    {
      "path": "src/utils/message.ts",
      "bytes": 1968,
      "bytesHuman": "1.9 KB",
      "lines": 62,
      "type": ".ts",
      "fanIn": 16,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.23
    },
    {
      "path": "tests/inject/dynamic/style-override.tests.ts",
      "bytes": 12002,
      "bytesHuman": "11.7 KB",
      "lines": 248,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 5,
      "maxDepth": 13,
      "score": 3.22
    },
    {
      "path": "tests/inject/dynamic/shadow-dom.tests.ts",
      "bytes": 7786,
      "bytesHuman": "7.6 KB",
      "lines": 178,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 5,
      "maxDepth": 13,
      "score": 3.19
    },
    {
      "path": "src/inject/dynamic-theme/inline-style.ts",
      "bytes": 23883,
      "bytesHuman": "23.3 KB",
      "lines": 631,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 10,
      "maxDepth": 8,
      "score": 3.12
    },
    {
      "path": "src/inject/dynamic-theme/stylesheet-modifier.ts",
      "bytes": 14901,
      "bytesHuman": "14.6 KB",
      "lines": 378,
      "type": ".ts",
      "fanIn": 3,
      "fanOut": 7,
      "maxDepth": 8,
      "score": 3.09
    },
    {
      "path": "tests/inject/dynamic/media-query.tests.ts",
      "bytes": 8391,
      "bytesHuman": "8.2 KB",
      "lines": 188,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 4,
      "maxDepth": 13,
      "score": 3.09
    },
    {
      "path": "src/ui/popup/body/index.tsx",
      "bytes": 2924,
      "bytesHuman": "2.9 KB",
      "lines": 120,
      "type": ".tsx",
      "fanIn": 1,
      "fanOut": 6,
      "maxDepth": 11,
      "score": 3.06
    },
    {
      "path": "tests/inject/dynamic/color.tests.ts",
      "bytes": 5780,
      "bytesHuman": "5.6 KB",
      "lines": 125,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 4,
      "maxDepth": 13,
      "score": 3.06
    },
    {
      "path": "tests/inject/dynamic/inline-override.tests.ts",
      "bytes": 3516,
      "bytesHuman": "3.4 KB",
      "lines": 85,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 4,
      "maxDepth": 13,
      "score": 3.04
    },
    {
      "path": "src/generators/css-filter.ts",
      "bytes": 8773,
      "bytesHuman": "8.6 KB",
      "lines": 257,
      "type": ".ts",
      "fanIn": 8,
      "fanOut": 7,
      "maxDepth": 3,
      "score": 3.03
    },
    {
      "path": "src/ui/options/body/body.tsx",
      "bytes": 2480,
      "bytesHuman": "2.4 KB",
      "lines": 55,
      "type": ".tsx",
      "fanIn": 1,
      "fanOut": 9,
      "maxDepth": 9,
      "score": 2.93
    },
    {
      "path": "src/inject/dynamic-theme/watch/style-position.ts",
      "bytes": 9621,
      "bytesHuman": "9.4 KB",
      "lines": 252,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 5,
      "maxDepth": 10,
      "score": 2.83
    },
    {
      "path": "src/inject/dynamic-theme/image.ts",
      "bytes": 14823,
      "bytesHuman": "14.5 KB",
      "lines": 418,
      "type": ".ts",
      "fanIn": 4,
      "fanOut": 8,
      "maxDepth": 5,
      "score": 2.81
    },
    {
      "path": "src/inject/dynamic-theme/variables.ts",
      "bytes": 34423,
      "bytesHuman": "33.6 KB",
      "lines": 916,
      "type": ".ts",
      "fanIn": 4,
      "fanOut": 5,
      "maxDepth": 5,
      "score": 2.76
    },
    {
      "path": "src/ui/popup/components/more-settings/index.tsx",
      "bytes": 3657,
      "bytesHuman": "3.6 KB",
      "lines": 83,
      "type": ".tsx",
      "fanIn": 1,
      "fanOut": 9,
      "maxDepth": 8,
      "score": 2.74
    },
    {
      "path": "src/ui/popup/main-page/index.tsx",
      "bytes": 1272,
      "bytesHuman": "1.2 KB",
      "lines": 49,
      "type": ".tsx",
      "fanIn": 1,
      "fanOut": 5,
      "maxDepth": 10,
      "score": 2.72
    },
    {
      "path": "src/ui/popup/components/header/index.tsx",
      "bytes": 3111,
      "bytesHuman": "3.0 KB",
      "lines": 92,
      "type": ".tsx",
      "fanIn": 1,
      "fanOut": 8,
      "maxDepth": 8,
      "score": 2.65
    },
    {
      "path": "src/inject/dynamic-theme/adopted-style-manger.ts",
      "bytes": 7332,
      "bytesHuman": "7.2 KB",
      "lines": 213,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 5,
      "maxDepth": 9,
      "score": 2.61
    },
    {
      "path": "src/inject/dynamic-theme/watch/index.ts",
      "bytes": 635,
      "bytesHuman": "635 B",
      "lines": 22,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 2,
      "maxDepth": 11,
      "score": 2.61
    },
    {
      "path": "src/ui/options/advanced/advanced-tab.tsx",
      "bytes": 874,
      "bytesHuman": "874 B",
      "lines": 25,
      "type": ".tsx",
      "fanIn": 1,
      "fanOut": 8,
      "maxDepth": 8,
      "score": 2.61
    },
    {
      "path": "tasks/platform.js",
      "bytes": 403,
      "bytesHuman": "403 B",
      "lines": 11,
      "type": ".js",
      "fanIn": 13,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 2.61
    },
    {
      "path": "tests/support/test-utils.ts",
      "bytes": 560,
      "bytesHuman": "560 B",
      "lines": 21,
      "type": ".ts",
      "fanIn": 13,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 2.61
    },
    {
      "path": "src/inject/utils/dom.ts",
      "bytes": 12905,
      "bytesHuman": "12.6 KB",
      "lines": 383,
      "type": ".ts",
      "fanIn": 8,
      "fanOut": 4,
      "maxDepth": 2,
      "score": 2.59
    },
    {
      "path": "yarn.lock",
      "bytes": 204806,
      "bytesHuman": "200.0 KB",
      "lines": 5138,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 2.57
    },
    {
      "path": "src/inject/dynamic-theme/modify-colors.ts",
      "bytes": 9825,
      "bytesHuman": "9.6 KB",
      "lines": 320,
      "type": ".ts",
      "fanIn": 6,
      "fanOut": 4,
      "maxDepth": 4,
      "score": 2.56
    }
  ],
  "orphans": [
    {
      "path": "docs/arch/knowledge-graph.json",
      "bytes": 812359,
      "bytesHuman": "793.3 KB",
      "lines": 28034,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 14.02
    },
    {
      "path": "src/config/dynamic-theme-fixes.config",
      "bytes": 770945,
      "bytesHuman": "752.9 KB",
      "lines": 40286,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 20.14
    },
    {
      "path": "package-lock.json",
      "bytes": 374649,
      "bytesHuman": "365.9 KB",
      "lines": 10517,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 5.26
    },
    {
      "path": "yarn.lock",
      "bytes": 204806,
      "bytesHuman": "200.0 KB",
      "lines": 5138,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 2.57
    },
    {
      "path": "src/ui/assets/fonts/OpenSans-Light.ttf",
      "bytes": 101696,
      "bytesHuman": "99.3 KB",
      "lines": 719,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.36
    },
    {
      "path": "src/ui/assets/fonts/OpenSans-SemiBold.ttf",
      "bytes": 100820,
      "bytesHuman": "98.5 KB",
      "lines": 716,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.36
    },
    {
      "path": "src/ui/assets/fonts/OpenSans-Regular.ttf",
      "bytes": 96932,
      "bytesHuman": "94.7 KB",
      "lines": 642,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.32
    },
    {
      "path": "docs/files/index.html",
      "bytes": 56140,
      "bytesHuman": "54.8 KB",
      "lines": 1212,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.61
    },
    {
      "path": "src/config/inversion-fixes.config",
      "bytes": 43438,
      "bytesHuman": "42.4 KB",
      "lines": 3165,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1.58
    },
    {
      "path": "docs/arch/data.js",
      "bytes": 42785,
      "bytesHuman": "41.8 KB",
      "lines": 43,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.02
    },
    {
      "path": "docs/files/components/rui-report-self-improvement/index.html",
      "bytes": 40699,
      "bytesHuman": "39.7 KB",
      "lines": 537,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.27
    },
    {
      "path": "docs/files/components/rui-report-self-improvement/index.css",
      "bytes": 39546,
      "bytesHuman": "38.6 KB",
      "lines": 521,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.26
    },
    {
      "path": "docs/files/components/rui-report-self-improvement/index.js",
      "bytes": 35911,
      "bytesHuman": "35.1 KB",
      "lines": 694,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.35
    },
    {
      "path": "docs/files/data.js",
      "bytes": 32226,
      "bytesHuman": "31.5 KB",
      "lines": 434,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.22
    },
    {
      "path": "docs/files/index.js",
      "bytes": 30267,
      "bytesHuman": "29.6 KB",
      "lines": 721,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.36
    },
    {
      "path": "docs/arch/index.js",
      "bytes": 27900,
      "bytesHuman": "27.2 KB",
      "lines": 651,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.33
    },
    {
      "path": "docs/arch/index.css",
      "bytes": 22097,
      "bytesHuman": "21.6 KB",
      "lines": 549,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.27
    },
    {
      "path": "src/config/dark-sites.config",
      "bytes": 19692,
      "bytesHuman": "19.2 KB",
      "lines": 1301,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.65
    },
    {
      "path": "src/config/detector-hints.config",
      "bytes": 17693,
      "bytesHuman": "17.3 KB",
      "lines": 1816,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.91
    },
    {
      "path": "CHANGELOG.md",
      "bytes": 17660,
      "bytesHuman": "17.2 KB",
      "lines": 636,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.32
    },
    {
      "path": "docs/data.js",
      "bytes": 17655,
      "bytesHuman": "17.2 KB",
      "lines": 234,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.12
    },
    {
      "path": "src/ui/assets/images/darkreader-icon-256x256.png",
      "bytes": 16484,
      "bytesHuman": "16.1 KB",
      "lines": 80,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.04
    },
    {
      "path": "docs/index.css",
      "bytes": 14466,
      "bytesHuman": "14.1 KB",
      "lines": 352,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.18
    },
    {
      "path": "src/ui/assets/images/darkreader-thumb-up.svg",
      "bytes": 14016,
      "bytesHuman": "13.7 KB",
      "lines": 0,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0
    },
    {
      "path": "docs/index.js",
      "bytes": 12590,
      "bytesHuman": "12.3 KB",
      "lines": 272,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.14
    },
    {
      "path": "CONTRIBUTING.md",
      "bytes": 11707,
      "bytesHuman": "11.4 KB",
      "lines": 262,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.13
    },
    {
      "path": "src/ui/assets/fonts/LICENSE.txt",
      "bytes": 11358,
      "bytesHuman": "11.1 KB",
      "lines": 202,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.1
    },
    {
      "path": "src/ui/assets/images/mobile-icon-40x64.svg",
      "bytes": 10104,
      "bytesHuman": "9.9 KB",
      "lines": 0,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0
    },
    {
      "path": "src/ui/popup/components/header/style.less",
      "bytes": 10013,
      "bytesHuman": "9.8 KB",
      "lines": 394,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.2
    },
    {
      "path": "src/ui/assets/images/mode-light-32.svg",
      "bytes": 9342,
      "bytesHuman": "9.1 KB",
      "lines": 0,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0
    },
    {
      "path": "docs/files/index.css",
      "bytes": 9257,
      "bytesHuman": "9.0 KB",
      "lines": 236,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.12
    },
    {
      "path": "src/ui/popup/style.less",
      "bytes": 9181,
      "bytesHuman": "9.0 KB",
      "lines": 398,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.2
    },
    {
      "path": "src/ui/assets/images/mode-dark-32.svg",
      "bytes": 9003,
      "bytesHuman": "8.8 KB",
      "lines": 0,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0
    },
    {
      "path": "README.md",
      "bytes": 8903,
      "bytesHuman": "8.7 KB",
      "lines": 180,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.09
    },
    {
      "path": "src/icons/dr_128.png",
      "bytes": 7950,
      "bytesHuman": "7.8 KB",
      "lines": 33,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.02
    },
    {
      "path": "src/ui/assets/images/birthday-icon.svg",
      "bytes": 7623,
      "bytesHuman": "7.4 KB",
      "lines": 0,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0
    },
    {
      "path": "docs/index.html",
      "bytes": 6970,
      "bytesHuman": "6.8 KB",
      "lines": 169,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.08
    },
    {
      "path": "docs/arch/scene-5-trust-boundary-security-surface/index.md",
      "bytes": 5967,
      "bytesHuman": "5.8 KB",
      "lines": 140,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.07
    },
    {
      "path": "package.json",
      "bytes": 5399,
      "bytesHuman": "5.3 KB",
      "lines": 117,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.06
    },
    {
      "path": "src/ui/popup/body/style.less",
      "bytes": 5362,
      "bytesHuman": "5.2 KB",
      "lines": 235,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.12
    },
    {
      "path": "CODE_OF_CONDUCT.md",
      "bytes": 5232,
      "bytesHuman": "5.1 KB",
      "lines": 129,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.06
    },
    {
      "path": "docs/arch/scene-2-data-flow-tracing/index.md",
      "bytes": 5117,
      "bytesHuman": "5.0 KB",
      "lines": 131,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.07
    },
    {
      "path": "docs/arch/scene-1-module-location/index.md",
      "bytes": 4816,
      "bytesHuman": "4.7 KB",
      "lines": 127,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.06
    },
    {
      "path": "index.d.ts",
      "bytes": 4740,
      "bytesHuman": "4.6 KB",
      "lines": 173,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.09
    },
    {
      "path": "docs/arch/scene-4-dependency-change-impact/index.md",
      "bytes": 4641,
      "bytesHuman": "4.5 KB",
      "lines": 125,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.06
    },
    {
      "path": "docs/self-test/scene-4-security-surface-regression/index.md",
      "bytes": 4419,
      "bytesHuman": "4.3 KB",
      "lines": 118,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.06
    },
    {
      "path": "docs/arch/scene-3-newcomer-onboarding/index.md",
      "bytes": 4400,
      "bytesHuman": "4.3 KB",
      "lines": 111,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.06
    },
    {
      "path": "src/ui/devtools/style.less",
      "bytes": 4391,
      "bytesHuman": "4.3 KB",
      "lines": 243,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.12
    },
    {
      "path": "CLAUDE.md",
      "bytes": 4343,
      "bytesHuman": "4.2 KB",
      "lines": 100,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.05
    },
    {
      "path": "docs/self-test/scene-6-third-party-framework-service/index.md",
      "bytes": 4300,
      "bytesHuman": "4.2 KB",
      "lines": 115,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.06
    }
  ],
  "depthStats": {
    "max": 13,
    "mean": 4.5,
    "median": 3,
    "p90": 9,
    "filesAtMax": 12
  },
  "depthRanking": [
    {
      "path": "src/api/index.ts",
      "bytes": 2526,
      "bytesHuman": "2.5 KB",
      "lines": 79,
      "type": ".ts",
      "maxDepth": 13,
      "fanIn": 0,
      "fanOut": 7
    },
    {
      "path": "src/inject/index.ts",
      "bytes": 11164,
      "bytesHuman": "10.9 KB",
      "lines": 295,
      "type": ".ts",
      "maxDepth": 13,
      "fanIn": 0,
      "fanOut": 11
    },
    {
      "path": "src/ui/popup/index.tsx",
      "bytes": 5238,
      "bytesHuman": "5.1 KB",
      "lines": 148,
      "type": ".tsx",
      "maxDepth": 13,
      "fanIn": 0,
      "fanOut": 6
    },
    {
      "path": "tests/inject/dynamic/color.tests.ts",
      "bytes": 5780,
      "bytesHuman": "5.6 KB",
      "lines": 125,
      "type": ".ts",
      "maxDepth": 13,
      "fanIn": 0,
      "fanOut": 4
    },
    {
      "path": "tests/inject/dynamic/fixes.tests.ts",
      "bytes": 4555,
      "bytesHuman": "4.4 KB",
      "lines": 118,
      "type": ".ts",
      "maxDepth": 13,
      "fanIn": 0,
      "fanOut": 6
    },
    {
      "path": "tests/inject/dynamic/image-analysis.tests.ts",
      "bytes": 11428,
      "bytesHuman": "11.2 KB",
      "lines": 290,
      "type": ".ts",
      "maxDepth": 13,
      "fanIn": 0,
      "fanOut": 5
    },
    {
      "path": "tests/inject/dynamic/inline-override.tests.ts",
      "bytes": 3516,
      "bytesHuman": "3.4 KB",
      "lines": 85,
      "type": ".ts",
      "maxDepth": 13,
      "fanIn": 0,
      "fanOut": 4
    },
    {
      "path": "tests/inject/dynamic/link-override.tests.ts",
      "bytes": 10028,
      "bytesHuman": "9.8 KB",
      "lines": 226,
      "type": ".ts",
      "maxDepth": 13,
      "fanIn": 0,
      "fanOut": 6
    },
    {
      "path": "tests/inject/dynamic/media-query.tests.ts",
      "bytes": 8391,
      "bytesHuman": "8.2 KB",
      "lines": 188,
      "type": ".ts",
      "maxDepth": 13,
      "fanIn": 0,
      "fanOut": 4
    },
    {
      "path": "tests/inject/dynamic/shadow-dom.tests.ts",
      "bytes": 7786,
      "bytesHuman": "7.6 KB",
      "lines": 178,
      "type": ".ts",
      "maxDepth": 13,
      "fanIn": 0,
      "fanOut": 5
    },
    {
      "path": "tests/inject/dynamic/style-override.tests.ts",
      "bytes": 12002,
      "bytesHuman": "11.7 KB",
      "lines": 248,
      "type": ".ts",
      "maxDepth": 13,
      "fanIn": 0,
      "fanOut": 5
    },
    {
      "path": "tests/inject/dynamic/variables.tests.ts",
      "bytes": 54156,
      "bytesHuman": "52.9 KB",
      "lines": 1320,
      "type": ".ts",
      "maxDepth": 13,
      "fanIn": 0,
      "fanOut": 8
    },
    {
      "path": "src/inject/dynamic-theme/index.ts",
      "bytes": 35695,
      "bytesHuman": "34.9 KB",
      "lines": 942,
      "type": ".ts",
      "maxDepth": 12,
      "fanIn": 11,
      "fanOut": 25
    },
    {
      "path": "src/ui/popup/components/body.tsx",
      "bytes": 4277,
      "bytesHuman": "4.2 KB",
      "lines": 129,
      "type": ".tsx",
      "maxDepth": 12,
      "fanIn": 1,
      "fanOut": 11
    },
    {
      "path": "src/inject/dynamic-theme/watch/index.ts",
      "bytes": 635,
      "bytesHuman": "635 B",
      "lines": 22,
      "type": ".ts",
      "maxDepth": 11,
      "fanIn": 1,
      "fanOut": 2
    },
    {
      "path": "src/ui/devtools/index.tsx",
      "bytes": 4238,
      "bytesHuman": "4.1 KB",
      "lines": 113,
      "type": ".tsx",
      "maxDepth": 11,
      "fanIn": 0,
      "fanOut": 2
    },
    {
      "path": "src/ui/popup/body/index.tsx",
      "bytes": 2924,
      "bytesHuman": "2.9 KB",
      "lines": 120,
      "type": ".tsx",
      "maxDepth": 11,
      "fanIn": 1,
      "fanOut": 6
    },
    {
      "path": "src/inject/dynamic-theme/watch/style-position.ts",
      "bytes": 9621,
      "bytesHuman": "9.4 KB",
      "lines": 252,
      "type": ".ts",
      "maxDepth": 10,
      "fanIn": 1,
      "fanOut": 5
    },
    {
      "path": "src/ui/devtools/components/body.tsx",
      "bytes": 7841,
      "bytesHuman": "7.7 KB",
      "lines": 162,
      "type": ".tsx",
      "maxDepth": 10,
      "fanIn": 1,
      "fanOut": 10
    },
    {
      "path": "src/ui/options/index.tsx",
      "bytes": 2126,
      "bytesHuman": "2.1 KB",
      "lines": 61,
      "type": ".tsx",
      "maxDepth": 10,
      "fanIn": 0,
      "fanOut": 4
    }
  ],
  "cycles": [
    {
      "severity": "warning",
      "path": "src/inject/dynamic-theme/modify-css.ts → src/inject/dynamic-theme/variables.ts",
      "length": 2,
      "suggestedFix": "Break edge from src/inject/dynamic-theme/modify-css.ts to break the cycle"
    }
  ],
  "freshness": [
    {
      "path": ".gitattributes",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 7
    },
    {
      "path": ".gitignore",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 46
    },
    {
      "path": ".npmignore",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 5
    },
    {
      "path": "CHANGELOG.md",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 636
    },
    {
      "path": "CLAUDE.md",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 100
    },
    {
      "path": "CODE_OF_CONDUCT.md",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 129
    },
    {
      "path": "CONTRIBUTING.md",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 262
    },
    {
      "path": "docs/arch/scene-1-module-location/index.md",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 127
    },
    {
      "path": "docs/arch/scene-2-data-flow-tracing/index.md",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 131
    },
    {
      "path": "docs/arch/scene-3-newcomer-onboarding/index.md",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 111
    },
    {
      "path": "docs/arch/scene-4-dependency-change-impact/index.md",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 125
    },
    {
      "path": "docs/arch/scene-5-trust-boundary-security-surface/index.md",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 140
    },
    {
      "path": "docs/files/components/rui-report-coupling/data.js",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".js",
      "lines": 3
    },
    {
      "path": "docs/files/components/rui-report-coupling/index.css",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".css",
      "lines": 20
    },
    {
      "path": "docs/files/components/rui-report-coupling/index.html",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 40
    },
    {
      "path": "docs/files/components/rui-report-coupling/index.js",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".js",
      "lines": 71
    },
    {
      "path": "docs/files/components/rui-report-health/data.js",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".js",
      "lines": 3
    },
    {
      "path": "docs/files/components/rui-report-health/index.css",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".css",
      "lines": 63
    },
    {
      "path": "docs/files/components/rui-report-health/index.html",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 66
    },
    {
      "path": "docs/files/components/rui-report-health/index.js",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".js",
      "lines": 71
    }
  ],
  "freshnessBuckets": [
    {
      "bucket": "<30d",
      "count": 441,
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
    "asOf": 1784163919,
    "asOfHuman": "2026-07-16",
    "maxAge": 1,
    "median": 1,
    "p90": 1,
    "staleCount": 0,
    "criticalCount": 0
  },
  "records": [
    {
      "path": ".gitattributes",
      "bytes": 88,
      "lines": 7,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": ".gitignore",
      "bytes": 753,
      "lines": 46,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": ".npmignore",
      "bytes": 46,
      "lines": 5,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "CHANGELOG.md",
      "bytes": 17660,
      "lines": 636,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "CLAUDE.md",
      "bytes": 4343,
      "lines": 100,
      "type": "other",
      "lastModified": 1784006916,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "CODE_OF_CONDUCT.md",
      "bytes": 5232,
      "lines": 129,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "CONTRIBUTING.md",
      "bytes": 11707,
      "lines": 262,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/arch/data.js",
      "bytes": 42785,
      "lines": 43,
      "type": "js",
      "lastModified": 1784093756,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/arch/index.css",
      "bytes": 22097,
      "lines": 549,
      "type": "css",
      "lastModified": 1784093687,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/arch/index.html",
      "bytes": 3572,
      "lines": 66,
      "type": "other",
      "lastModified": 1784090382,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/arch/index.js",
      "bytes": 27900,
      "lines": 651,
      "type": "js",
      "lastModified": 1784090150,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/arch/knowledge-graph.json",
      "bytes": 812359,
      "lines": 28034,
      "type": "other",
      "lastModified": 1784090105,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/arch/meta.json",
      "bytes": 2598,
      "lines": 135,
      "type": "other",
      "lastModified": 1784090105,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/arch/scene-1-module-location/index.md",
      "bytes": 4816,
      "lines": 127,
      "type": "other",
      "lastModified": 1784009303,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/arch/scene-2-data-flow-tracing/index.md",
      "bytes": 5117,
      "lines": 131,
      "type": "other",
      "lastModified": 1784009303,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/arch/scene-3-newcomer-onboarding/index.md",
      "bytes": 4400,
      "lines": 111,
      "type": "other",
      "lastModified": 1784009303,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/arch/scene-4-dependency-change-impact/index.md",
      "bytes": 4641,
      "lines": 125,
      "type": "other",
      "lastModified": 1784009303,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/arch/scene-5-trust-boundary-security-surface/index.md",
      "bytes": 5967,
      "lines": 140,
      "type": "other",
      "lastModified": 1784009303,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/data.js",
      "bytes": 17655,
      "lines": 234,
      "type": "js",
      "lastModified": 1784104127,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/files/components/rui-report-coupling/data.js",
      "bytes": 56,
      "lines": 3,
      "type": "js",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-coupling/index.css",
      "bytes": 880,
      "lines": 20,
      "type": "css",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-coupling/index.html",
      "bytes": 2252,
      "lines": 40,
      "type": "other",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-coupling/index.js",
      "bytes": 2909,
      "lines": 71,
      "type": "js",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-health/data.js",
      "bytes": 54,
      "lines": 3,
      "type": "js",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-health/index.css",
      "bytes": 2309,
      "lines": 63,
      "type": "css",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-health/index.html",
      "bytes": 4070,
      "lines": 66,
      "type": "other",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-health/index.js",
      "bytes": 3444,
      "lines": 71,
      "type": "js",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-largest/data.js",
      "bytes": 84,
      "lines": 5,
      "type": "js",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-largest/index.css",
      "bytes": 694,
      "lines": 18,
      "type": "css",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-largest/index.html",
      "bytes": 2210,
      "lines": 39,
      "type": "other",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-largest/index.js",
      "bytes": 3728,
      "lines": 95,
      "type": "js",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-risk/data.js",
      "bytes": 52,
      "lines": 3,
      "type": "js",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-risk/index.css",
      "bytes": 1043,
      "lines": 21,
      "type": "css",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-risk/index.html",
      "bytes": 3262,
      "lines": 55,
      "type": "other",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-risk/index.js",
      "bytes": 3987,
      "lines": 85,
      "type": "js",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-self-improvement/data.js",
      "bytes": 64,
      "lines": 3,
      "type": "js",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-self-improvement/index.css",
      "bytes": 39546,
      "lines": 521,
      "type": "css",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-self-improvement/index.html",
      "bytes": 40699,
      "lines": 537,
      "type": "other",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-self-improvement/index.js",
      "bytes": 35911,
      "lines": 694,
      "type": "js",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-size/data.js",
      "bytes": 52,
      "lines": 3,
      "type": "js",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-size/index.css",
      "bytes": 2400,
      "lines": 67,
      "type": "css",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-size/index.html",
      "bytes": 3197,
      "lines": 66,
      "type": "other",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-size/index.js",
      "bytes": 1651,
      "lines": 32,
      "type": "js",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-summary/data.js",
      "bytes": 79,
      "lines": 5,
      "type": "js",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-summary/index.css",
      "bytes": 629,
      "lines": 19,
      "type": "css",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-summary/index.html",
      "bytes": 409,
      "lines": 11,
      "type": "other",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/components/rui-report-summary/index.js",
      "bytes": 1123,
      "lines": 27,
      "type": "js",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/data.js",
      "bytes": 32226,
      "lines": 434,
      "type": "js",
      "lastModified": 1784163919,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/files/index.css",
      "bytes": 9257,
      "lines": 236,
      "type": "css",
      "lastModified": 1784011001,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/files/index.html",
      "bytes": 56140,
      "lines": 1212,
      "type": "other",
      "lastModified": 1784163808,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/files/index.js",
      "bytes": 30267,
      "lines": 721,
      "type": "js",
      "lastModified": 1784163868,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/index.css",
      "bytes": 14466,
      "lines": 352,
      "type": "css",
      "lastModified": 1784101063,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/index.html",
      "bytes": 6970,
      "lines": 169,
      "type": "other",
      "lastModified": 1784101068,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/index.js",
      "bytes": 12590,
      "lines": 272,
      "type": "js",
      "lastModified": 1784101063,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/self-test/scene-1-post-init-full-self-check/index.md",
      "bytes": 4155,
      "lines": 114,
      "type": "other",
      "lastModified": 1784009461,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/self-test/scene-2-pre-commit-incremental-self-check/index.md",
      "bytes": 2904,
      "lines": 92,
      "type": "other",
      "lastModified": 1784009461,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/self-test/scene-3-doc-code-consistency/index.md",
      "bytes": 3481,
      "lines": 99,
      "type": "other",
      "lastModified": 1784009461,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/self-test/scene-4-security-surface-regression/index.md",
      "bytes": 4419,
      "lines": 118,
      "type": "other",
      "lastModified": 1784009461,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/self-test/scene-5-cross-story-integration-regression/index.md",
      "bytes": 3652,
      "lines": 98,
      "type": "other",
      "lastModified": 1784009461,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/self-test/scene-6-third-party-framework-service/index.md",
      "bytes": 4300,
      "lines": 115,
      "type": "other",
      "lastModified": 1784009461,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "eslint-plugin-local.js",
      "bytes": 1174,
      "lines": 38,
      "type": "js",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "eslint.config.js",
      "bytes": 7707,
      "lines": 265,
      "type": "js",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 7,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "index.d.ts",
      "bytes": 4740,
      "lines": 173,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "package-lock.json",
      "bytes": 374649,
      "lines": 10517,
      "type": "other",
      "lastModified": 1784006141,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "package.json",
      "bytes": 5399,
      "lines": 117,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "README.md",
      "bytes": 8903,
      "lines": 180,
      "type": "other",
      "lastModified": 1784007029,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/_locales/en.config",
      "bytes": 3835,
      "lines": 255,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/_locales/store/store.en.config",
      "bytes": 932,
      "lines": 12,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/_locales/store/store.zh-CN.config",
      "bytes": 763,
      "lines": 12,
      "type": "other",
      "lastModified": 1783993690,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/api/chrome.ts",
      "bytes": 2146,
      "lines": 61,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 1,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/api/fetch.ts",
      "bytes": 829,
      "lines": 28,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/api/index.ts",
      "bytes": 2526,
      "lines": 79,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 7,
      "extDeps": 1,
      "maxDepth": 13,
      "ageDays": 1
    },
    {
      "path": "src/api/tsconfig.json",
      "bytes": 144,
      "lines": 9,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/background/config-manager.ts",
      "bytes": 8725,
      "lines": 239,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 10,
      "extDeps": 0,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "src/background/content-script-manager.ts",
      "bytes": 3886,
      "lines": 98,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/background/devtools.ts",
      "bytes": 10174,
      "lines": 285,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 1,
      "maxDepth": 5,
      "ageDays": 1
    },
    {
      "path": "src/background/extension.ts",
      "bytes": 23994,
      "lines": 585,
      "type": "ts",
      "lastModified": 1784077137,
      "fanIn": 1,
      "fanOut": 23,
      "extDeps": 1,
      "maxDepth": 6,
      "ageDays": 1
    },
    {
      "path": "src/background/icon-manager.ts",
      "bytes": 3755,
      "lines": 119,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/background/index.ts",
      "bytes": 8671,
      "lines": 252,
      "type": "ts",
      "lastModified": 1784006078,
      "fanIn": 0,
      "fanOut": 9,
      "extDeps": 1,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/background/make-chromium-happy.ts",
      "bytes": 1054,
      "lines": 26,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/background/make-firefox-happy.ts",
      "bytes": 752,
      "lines": 13,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/background/messenger.ts",
      "bytes": 6639,
      "lines": 158,
      "type": "ts",
      "lastModified": 1784006185,
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 1,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/background/tab-manager.ts",
      "bytes": 22169,
      "lines": 476,
      "type": "ts",
      "lastModified": 1784077119,
      "fanIn": 1,
      "fanOut": 11,
      "extDeps": 1,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/background/ui-highlights.ts",
      "bytes": 1210,
      "lines": 35,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/background/user-storage.ts",
      "bytes": 8319,
      "lines": 214,
      "type": "ts",
      "lastModified": 1784081020,
      "fanIn": 2,
      "fanOut": 8,
      "extDeps": 1,
      "maxDepth": 3,
      "ageDays": 0
    },
    {
      "path": "src/background/utils/extension-api.ts",
      "bytes": 6640,
      "lines": 188,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 5,
      "fanOut": 3,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/background/utils/log.ts",
      "bytes": 1099,
      "lines": 43,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 8,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/background/utils/network.ts",
      "bytes": 8176,
      "lines": 257,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 4,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/background/utils/sendLog.ts",
      "bytes": 829,
      "lines": 29,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/background/utils/tab.ts",
      "bytes": 468,
      "lines": 8,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/background/window-theme.ts",
      "bytes": 3268,
      "lines": 96,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 5,
      "ageDays": 1
    },
    {
      "path": "src/config/color-schemes.drconf",
      "bytes": 2365,
      "lines": 225,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/config/dark-sites.config",
      "bytes": 19692,
      "lines": 1301,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/config/detector-hints.config",
      "bytes": 17693,
      "lines": 1816,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/config/dynamic-theme-fixes.config",
      "bytes": 770945,
      "lines": 40286,
      "type": "other",
      "lastModified": 1784104827,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "src/config/inversion-fixes.config",
      "bytes": 43438,
      "lines": 3165,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/config/static-themes.config",
      "bytes": 2850,
      "lines": 174,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/defaults.ts",
      "bytes": 2718,
      "lines": 96,
      "type": "ts",
      "lastModified": 1784081015,
      "fanIn": 15,
      "fanOut": 3,
      "extDeps": 2,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "src/definitions.d.ts",
      "bytes": 5798,
      "lines": 241,
      "type": "ts",
      "lastModified": 1784080998,
      "fanIn": 0,
      "fanOut": 4,
      "extDeps": 0,
      "maxDepth": 4,
      "ageDays": 0
    },
    {
      "path": "src/generators/css-filter.ts",
      "bytes": 8773,
      "lines": 257,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 8,
      "fanOut": 7,
      "extDeps": 1,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/generators/detector-hints.ts",
      "bytes": 2235,
      "lines": 64,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 4,
      "fanOut": 4,
      "extDeps": 1,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/generators/dynamic-theme.ts",
      "bytes": 3362,
      "lines": 89,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 4,
      "fanOut": 5,
      "extDeps": 1,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/generators/static-theme.ts",
      "bytes": 11036,
      "lines": 258,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 4,
      "fanOut": 6,
      "extDeps": 1,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/generators/svg-filter.ts",
      "bytes": 1876,
      "lines": 45,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 4,
      "extDeps": 1,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "src/generators/text-style.ts",
      "bytes": 1227,
      "lines": 49,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 3,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/generators/theme-engines.ts",
      "bytes": 153,
      "lines": 6,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 9,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/generators/utils/format.ts",
      "bytes": 1238,
      "lines": 42,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 4,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/generators/utils/matrix.ts",
      "bytes": 3032,
      "lines": 94,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 4,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/generators/utils/parse.ts",
      "bytes": 5398,
      "lines": 157,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 7,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/icons/dr_128.png",
      "bytes": 7950,
      "lines": 33,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/icons/dr_16.png",
      "bytes": 608,
      "lines": 5,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/icons/dr_48.png",
      "bytes": 2289,
      "lines": 8,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/icons/dr_active_19.png",
      "bytes": 615,
      "lines": 4,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/icons/dr_active_38.png",
      "bytes": 1522,
      "lines": 8,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/icons/dr_active_light_19.png",
      "bytes": 686,
      "lines": 4,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/icons/dr_active_light_38.png",
      "bytes": 1694,
      "lines": 12,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/inject/cache.ts",
      "bytes": 2881,
      "lines": 90,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 4,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 6,
      "ageDays": 1
    },
    {
      "path": "src/inject/color-scheme-watcher.ts",
      "bytes": 2195,
      "lines": 56,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 3,
      "extDeps": 1,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/inject/detector.ts",
      "bytes": 9021,
      "lines": 256,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/adopted-style-manger.ts",
      "bytes": 7332,
      "lines": 213,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 1,
      "maxDepth": 9,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/css-collection.ts",
      "bytes": 2892,
      "lines": 77,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 4,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/css-rules.ts",
      "bytes": 9172,
      "lines": 274,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 6,
      "fanOut": 5,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/fixes.ts",
      "bytes": 2598,
      "lines": 61,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/image.ts",
      "bytes": 14823,
      "lines": 418,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 4,
      "fanOut": 8,
      "extDeps": 1,
      "maxDepth": 5,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/index.ts",
      "bytes": 35695,
      "lines": 942,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 11,
      "fanOut": 25,
      "extDeps": 1,
      "maxDepth": 12,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/injection.ts",
      "bytes": 2486,
      "lines": 71,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/inline-style.ts",
      "bytes": 23883,
      "lines": 631,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 10,
      "extDeps": 1,
      "maxDepth": 8,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/meta-theme-color.ts",
      "bytes": 2029,
      "lines": 57,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 1,
      "maxDepth": 5,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/modify-colors.ts",
      "bytes": 9825,
      "lines": 320,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 6,
      "fanOut": 4,
      "extDeps": 2,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/modify-css.ts",
      "bytes": 31577,
      "lines": 786,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 5,
      "fanOut": 13,
      "extDeps": 1,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/mv3-proxy.ts",
      "bytes": 2538,
      "lines": 67,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/network.ts",
      "bytes": 3255,
      "lines": 119,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/palette.ts",
      "bytes": 2941,
      "lines": 105,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/selectors.ts",
      "bytes": 1914,
      "lines": 71,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/style-manager.ts",
      "bytes": 23444,
      "lines": 675,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 3,
      "fanOut": 14,
      "extDeps": 1,
      "maxDepth": 9,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/style-scope.ts",
      "bytes": 695,
      "lines": 23,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/stylesheet-modifier.ts",
      "bytes": 14901,
      "lines": 378,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 3,
      "fanOut": 7,
      "extDeps": 1,
      "maxDepth": 8,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/stylesheet-proxy.ts",
      "bytes": 14609,
      "lines": 356,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 3,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/variables.ts",
      "bytes": 34423,
      "lines": 916,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 4,
      "fanOut": 5,
      "extDeps": 1,
      "maxDepth": 5,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/watch/custom-elements.ts",
      "bytes": 4694,
      "lines": 126,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/watch/index.ts",
      "bytes": 635,
      "lines": 22,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 11,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/watch/sheet-changes.ts",
      "bytes": 3350,
      "lines": 114,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/inject/dynamic-theme/watch/style-position.ts",
      "bytes": 9621,
      "lines": 252,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 0,
      "maxDepth": 10,
      "ageDays": 1
    },
    {
      "path": "src/inject/fallback.ts",
      "bytes": 2395,
      "lines": 67,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/inject/index.ts",
      "bytes": 11164,
      "lines": 295,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 11,
      "extDeps": 2,
      "maxDepth": 13,
      "ageDays": 1
    },
    {
      "path": "src/inject/style.ts",
      "bytes": 1350,
      "lines": 33,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/inject/svg-filter.ts",
      "bytes": 2746,
      "lines": 62,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/inject/utils/dom.ts",
      "bytes": 12905,
      "lines": 383,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 8,
      "fanOut": 4,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/inject/utils/log.ts",
      "bytes": 1740,
      "lines": 54,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 11,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/manifest-chrome-mv3.json",
      "bytes": 2012,
      "lines": 69,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/manifest-firefox.json",
      "bytes": 1062,
      "lines": 47,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/manifest-thunderbird.json",
      "bytes": 358,
      "lines": 19,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/manifest.json",
      "bytes": 1648,
      "lines": 66,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/stubs/defaults.ts",
      "bytes": 112,
      "lines": 4,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/stubs/popup/plus-body.tsx",
      "bytes": 383,
      "lines": 17,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/stubs/utils/theme.ts",
      "bytes": 837,
      "lines": 29,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/tsconfig.json",
      "bytes": 717,
      "lines": 30,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/fonts/LICENSE.txt",
      "bytes": 11358,
      "lines": 202,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/fonts/OpenSans-Light.ttf",
      "bytes": 101696,
      "lines": 719,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/fonts/OpenSans-Regular.ttf",
      "bytes": 96932,
      "lines": 642,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/fonts/OpenSans-SemiBold.ttf",
      "bytes": 100820,
      "lines": 716,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/images/birthday-icon.svg",
      "bytes": 7623,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/images/darkreader-icon-256x256.png",
      "bytes": 16484,
      "lines": 80,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/images/darkreader-thumb-up.svg",
      "bytes": 14016,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/images/darkreader-type.svg",
      "bytes": 3292,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/images/icon-android-dark.svg",
      "bytes": 728,
      "lines": 18,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/images/icon-apple-white.svg",
      "bytes": 1122,
      "lines": 2,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/images/mobile-icon-40x64.svg",
      "bytes": 10104,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/images/mobile-qr-code-firefox.png",
      "bytes": 609,
      "lines": 6,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/images/mobile-qr-code.png",
      "bytes": 513,
      "lines": 5,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/images/mode-dark-32.svg",
      "bytes": 9003,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/assets/images/mode-light-32.svg",
      "bytes": 9342,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/connect/connector.ts",
      "bytes": 5714,
      "lines": 142,
      "type": "ts",
      "lastModified": 1784006194,
      "fanIn": 4,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/ui/connect/mock.ts",
      "bytes": 2925,
      "lines": 99,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/button/index.tsx",
      "bytes": 438,
      "lines": 16,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 7,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/button/style.less",
      "bytes": 772,
      "lines": 34,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/check-button/check-button.less",
      "bytes": 1109,
      "lines": 47,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/check-button/check-button.tsx",
      "bytes": 873,
      "lines": 23,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/checkbox/index.tsx",
      "bytes": 798,
      "lines": 23,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/checkbox/style.less",
      "bytes": 1613,
      "lines": 68,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/color-dropdown/index.tsx",
      "bytes": 2928,
      "lines": 98,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 2,
      "maxDepth": 5,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/color-dropdown/style.less",
      "bytes": 443,
      "lines": 25,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/color-picker/hsb-picker.less",
      "bytes": 1313,
      "lines": 58,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/color-picker/hsb-picker.tsx",
      "bytes": 7990,
      "lines": 235,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 2,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/color-picker/index.tsx",
      "bytes": 4175,
      "lines": 158,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 3,
      "extDeps": 2,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/color-picker/style.less",
      "bytes": 2436,
      "lines": 92,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/control-group/control-group.less",
      "bytes": 423,
      "lines": 20,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/control-group/control-group.tsx",
      "bytes": 760,
      "lines": 32,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/dropdown/index.tsx",
      "bytes": 3440,
      "lines": 114,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/dropdown/style.less",
      "bytes": 2532,
      "lines": 93,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/index.ts",
      "bytes": 1066,
      "lines": 43,
      "type": "ts",
      "lastModified": 1784082662,
      "fanIn": 40,
      "fanOut": 20,
      "extDeps": 0,
      "maxDepth": 6,
      "ageDays": 0
    },
    {
      "path": "src/ui/controls/message-box/index.tsx",
      "bytes": 1084,
      "lines": 34,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/message-box/style.less",
      "bytes": 638,
      "lines": 33,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/multi-switch/index.tsx",
      "bytes": 1089,
      "lines": 34,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/multi-switch/style.less",
      "bytes": 1000,
      "lines": 41,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/nav-button/index.tsx",
      "bytes": 469,
      "lines": 21,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/nav-button/style.less",
      "bytes": 364,
      "lines": 16,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/overlay/index.ts",
      "bytes": 1674,
      "lines": 64,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/overlay/style.less",
      "bytes": 337,
      "lines": 19,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/reset-button/index.tsx",
      "bytes": 500,
      "lines": 21,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/reset-button/style.less",
      "bytes": 454,
      "lines": 22,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/select/index.tsx",
      "bytes": 4786,
      "lines": 164,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 3,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/select/style.less",
      "bytes": 2246,
      "lines": 93,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/shortcut/index.tsx",
      "bytes": 6785,
      "lines": 168,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/shortcut/style.less",
      "bytes": 687,
      "lines": 37,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/slider/index.tsx",
      "bytes": 7869,
      "lines": 240,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/slider/style.less",
      "bytes": 2938,
      "lines": 111,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/style.less",
      "bytes": 599,
      "lines": 22,
      "type": "other",
      "lastModified": 1784082680,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "src/ui/controls/tab-panel/index.tsx",
      "bytes": 1334,
      "lines": 57,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/tab-panel/style.less",
      "bytes": 1941,
      "lines": 82,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/tab-panel/tab.tsx",
      "bytes": 351,
      "lines": 18,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/text-list/index.tsx",
      "bytes": 2667,
      "lines": 94,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/text-list/style.less",
      "bytes": 983,
      "lines": 32,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/textbox/index.tsx",
      "bytes": 582,
      "lines": 19,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 4,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/textbox/style.less",
      "bytes": 959,
      "lines": 35,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/toggle/index.tsx",
      "bytes": 1130,
      "lines": 49,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/toggle/style.less",
      "bytes": 1068,
      "lines": 48,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/updown/index.tsx",
      "bytes": 2521,
      "lines": 84,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 1,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/updown/style.less",
      "bytes": 2880,
      "lines": 133,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/updown/track.tsx",
      "bytes": 2269,
      "lines": 74,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/utils.ts",
      "bytes": 846,
      "lines": 27,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 5,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/ui/controls/virtual-scroll/index.tsx",
      "bytes": 4345,
      "lines": 127,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 3,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/devtools/components/body.tsx",
      "bytes": 7841,
      "lines": 162,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 10,
      "extDeps": 4,
      "maxDepth": 10,
      "ageDays": 1
    },
    {
      "path": "src/ui/devtools/components/config-editor-per-site.tsx",
      "bytes": 4747,
      "lines": 122,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 8,
      "ageDays": 1
    },
    {
      "path": "src/ui/devtools/components/config-editor-tabs.tsx",
      "bytes": 1311,
      "lines": 35,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 3,
      "maxDepth": 9,
      "ageDays": 1
    },
    {
      "path": "src/ui/devtools/components/config-editor.tsx",
      "bytes": 4223,
      "lines": 132,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 3,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/devtools/index.tsx",
      "bytes": 4238,
      "lines": 113,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 11,
      "ageDays": 1
    },
    {
      "path": "src/ui/devtools/style.less",
      "bytes": 4391,
      "lines": 243,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/devtools/types.d.ts",
      "bytes": 389,
      "lines": 14,
      "type": "ts",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/icons/advanced-icon.tsx",
      "bytes": 1074,
      "lines": 25,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/icons/delete-icon.tsx",
      "bytes": 650,
      "lines": 10,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/icons/help-icon.tsx",
      "bytes": 382,
      "lines": 12,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/icons/icons.less",
      "bytes": 3967,
      "lines": 15,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/icons/index.tsx",
      "bytes": 416,
      "lines": 17,
      "type": "tsx",
      "lastModified": 1784082645,
      "fanIn": 5,
      "fanOut": 7,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "src/ui/icons/key-icon.tsx",
      "bytes": 468,
      "lines": 18,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/icons/keyboard-icon.tsx",
      "bytes": 695,
      "lines": 17,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/icons/list-icon.tsx",
      "bytes": 276,
      "lines": 7,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/icons/phone-icon.tsx",
      "bytes": 341,
      "lines": 10,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/icons/settings-icon.tsx",
      "bytes": 912,
      "lines": 25,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/about/about-tab.tsx",
      "bytes": 739,
      "lines": 25,
      "type": "tsx",
      "lastModified": 1784006721,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 2,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/about/about.less",
      "bytes": 126,
      "lines": 9,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/about/version.tsx",
      "bytes": 358,
      "lines": 14,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/activation/activation-tab.tsx",
      "bytes": 5105,
      "lines": 141,
      "type": "tsx",
      "lastModified": 1784006735,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 3,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/advanced/advanced-tab.tsx",
      "bytes": 874,
      "lines": 25,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 8,
      "extDeps": 2,
      "maxDepth": 8,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/advanced/advanced.less",
      "bytes": 197,
      "lines": 11,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/advanced/context-menus.tsx",
      "bytes": 1710,
      "lines": 41,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/advanced/devtools.tsx",
      "bytes": 744,
      "lines": 24,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 1,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/advanced/enable-for-protected-pages.tsx",
      "bytes": 746,
      "lines": 21,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/advanced/export-settings.tsx",
      "bytes": 845,
      "lines": 27,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/advanced/fetch-news.tsx",
      "bytes": 651,
      "lines": 21,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/advanced/import-settings.tsx",
      "bytes": 2854,
      "lines": 87,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 3,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/advanced/reset-settings.tsx",
      "bytes": 1365,
      "lines": 47,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/advanced/sync-config.tsx",
      "bytes": 618,
      "lines": 19,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/advanced/sync-settings.tsx",
      "bytes": 667,
      "lines": 21,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/body/body.tsx",
      "bytes": 2480,
      "lines": 55,
      "type": "tsx",
      "lastModified": 1784022328,
      "fanIn": 1,
      "fanOut": 9,
      "extDeps": 3,
      "maxDepth": 9,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/general/change-browser-theme.tsx",
      "bytes": 694,
      "lines": 21,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/general/enabled-by-default.tsx",
      "bytes": 699,
      "lines": 21,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/general/enabled-for-pdf.tsx",
      "bytes": 654,
      "lines": 21,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/general/general-tab.tsx",
      "bytes": 570,
      "lines": 16,
      "type": "tsx",
      "lastModified": 1784023402,
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 2,
      "maxDepth": 8,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/hotkeys/hotkeys-tab.tsx",
      "bytes": 1716,
      "lines": 45,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/hotkeys/hotkeys.less",
      "bytes": 692,
      "lines": 27,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/index.tsx",
      "bytes": 2126,
      "lines": 61,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 4,
      "extDeps": 3,
      "maxDepth": 10,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/site-list/clear-site-list.tsx",
      "bytes": 1672,
      "lines": 53,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/site-list/site-list-tab.tsx",
      "bytes": 994,
      "lines": 34,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 8,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/site-list/site-list.less",
      "bytes": 2227,
      "lines": 105,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/site-list/site-list.tsx",
      "bytes": 3753,
      "lines": 119,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/style.less",
      "bytes": 1805,
      "lines": 114,
      "type": "other",
      "lastModified": 1784039451,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/tab-panel/tab-panel.less",
      "bytes": 1790,
      "lines": 94,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/options/tab-panel/tab-panel.tsx",
      "bytes": 2315,
      "lines": 82,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 3,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/body/index.tsx",
      "bytes": 2924,
      "lines": 120,
      "type": "tsx",
      "lastModified": 1784006622,
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 3,
      "maxDepth": 11,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/body/style.less",
      "bytes": 5362,
      "lines": 235,
      "type": "other",
      "lastModified": 1784032305,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/compatibility.js",
      "bytes": 1584,
      "lines": 41,
      "type": "js",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/body.tsx",
      "bytes": 4277,
      "lines": 129,
      "type": "tsx",
      "lastModified": 1784079149,
      "fanIn": 1,
      "fanOut": 11,
      "extDeps": 6,
      "maxDepth": 12,
      "ageDays": 0
    },
    {
      "path": "src/ui/popup/components/custom-settings-toggle/index.tsx",
      "bytes": 1911,
      "lines": 49,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 2,
      "fanOut": 3,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/custom-settings-toggle/style.less",
      "bytes": 713,
      "lines": 32,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/engine-switch/index.tsx",
      "bytes": 1558,
      "lines": 42,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 1,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/engine-switch/style.less",
      "bytes": 1031,
      "lines": 43,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/filter-settings/index.tsx",
      "bytes": 2485,
      "lines": 85,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 2,
      "maxDepth": 8,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/filter-settings/mode-toggle.tsx",
      "bytes": 1278,
      "lines": 37,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/filter-settings/style.less",
      "bytes": 1262,
      "lines": 70,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/font-settings/index.tsx",
      "bytes": 2071,
      "lines": 55,
      "type": "tsx",
      "lastModified": 1783991296,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/font-settings/style.less",
      "bytes": 706,
      "lines": 36,
      "type": "other",
      "lastModified": 1783991296,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/header/index.tsx",
      "bytes": 3111,
      "lines": 92,
      "type": "tsx",
      "lastModified": 1784079191,
      "fanIn": 1,
      "fanOut": 8,
      "extDeps": 2,
      "maxDepth": 8,
      "ageDays": 0
    },
    {
      "path": "src/ui/popup/components/header/more-new-highlight.tsx",
      "bytes": 831,
      "lines": 25,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/header/more-site-settings.tsx",
      "bytes": 3414,
      "lines": 80,
      "type": "tsx",
      "lastModified": 1784025065,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/header/style.less",
      "bytes": 10013,
      "lines": 394,
      "type": "other",
      "lastModified": 1784082701,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "src/ui/popup/components/loader/index.tsx",
      "bytes": 1579,
      "lines": 52,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 3,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/loader/style.less",
      "bytes": 2241,
      "lines": 95,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/more-settings/index.tsx",
      "bytes": 3657,
      "lines": 83,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 9,
      "extDeps": 2,
      "maxDepth": 8,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/more-settings/style.less",
      "bytes": 1168,
      "lines": 58,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/site-list-settings/index.tsx",
      "bytes": 2025,
      "lines": 50,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/site-list-settings/style.less",
      "bytes": 355,
      "lines": 23,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/site-toggle/checkmark-icon.tsx",
      "bytes": 368,
      "lines": 13,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/site-toggle/index.tsx",
      "bytes": 2018,
      "lines": 60,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 3,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/components/site-toggle/style.less",
      "bytes": 430,
      "lines": 24,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/index.tsx",
      "bytes": 5238,
      "lines": 148,
      "type": "tsx",
      "lastModified": 1784006214,
      "fanIn": 0,
      "fanOut": 6,
      "extDeps": 4,
      "maxDepth": 13,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/main-page/app-switch.tsx",
      "bytes": 1620,
      "lines": 53,
      "type": "tsx",
      "lastModified": 1784079191,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 7,
      "ageDays": 0
    },
    {
      "path": "src/ui/popup/main-page/help.tsx",
      "bytes": 618,
      "lines": 19,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 1,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/main-page/index.tsx",
      "bytes": 1272,
      "lines": 49,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 2,
      "maxDepth": 10,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/main-page/site-toggle.tsx",
      "bytes": 2087,
      "lines": 53,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 2,
      "maxDepth": 8,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/main-page/style.less",
      "bytes": 2750,
      "lines": 116,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/main-page/theme-group.tsx",
      "bytes": 1082,
      "lines": 35,
      "type": "tsx",
      "lastModified": 1784021394,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 9,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/page-viewer/index.tsx",
      "bytes": 1350,
      "lines": 51,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/page-viewer/style.less",
      "bytes": 653,
      "lines": 33,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/style.less",
      "bytes": 9181,
      "lines": 398,
      "type": "other",
      "lastModified": 1784006704,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/theme/controls/index.tsx",
      "bytes": 56,
      "lines": 5,
      "type": "tsx",
      "lastModified": 1784032266,
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 8,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/theme/controls/scheme.tsx",
      "bytes": 654,
      "lines": 21,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 1,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/theme/controls/theme-control.less",
      "bytes": 557,
      "lines": 26,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/theme/controls/theme-control.tsx",
      "bytes": 323,
      "lines": 12,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/theme/page/index.tsx",
      "bytes": 736,
      "lines": 29,
      "type": "tsx",
      "lastModified": 1784021705,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 9,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/theme/page/style.less",
      "bytes": 123,
      "lines": 7,
      "type": "other",
      "lastModified": 1784032305,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/theme/utils.ts",
      "bytes": 1402,
      "lines": 46,
      "type": "ts",
      "lastModified": 1784079165,
      "fanIn": 3,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 2,
      "ageDays": 0
    },
    {
      "path": "src/ui/popup/utils/issues.ts",
      "bytes": 732,
      "lines": 21,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/popup/utils/markdown.tsx",
      "bytes": 183,
      "lines": 6,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/shared.less",
      "bytes": 1569,
      "lines": 78,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/stylesheet-editor/components/body.tsx",
      "bytes": 2874,
      "lines": 94,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 7,
      "ageDays": 1
    },
    {
      "path": "src/ui/stylesheet-editor/index.tsx",
      "bytes": 671,
      "lines": 22,
      "type": "tsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 8,
      "ageDays": 1
    },
    {
      "path": "src/ui/stylesheet-editor/style.less",
      "bytes": 29,
      "lines": 1,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/theme.less",
      "bytes": 1112,
      "lines": 44,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/ui/utils.ts",
      "bytes": 7111,
      "lines": 211,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 10,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/utils/array.ts",
      "bytes": 1156,
      "lines": 34,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 10,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/async-queue.ts",
      "bytes": 971,
      "lines": 39,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/cache.ts",
      "bytes": 456,
      "lines": 16,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/color.ts",
      "bytes": 19097,
      "lines": 689,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 13,
      "fanOut": 3,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/utils/colorscheme-parser.ts",
      "bytes": 9433,
      "lines": 235,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 4,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/csp.ts",
      "bytes": 1473,
      "lines": 50,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/utils/css-text/css-text.ts",
      "bytes": 160,
      "lines": 5,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/css-text/format-css.ts",
      "bytes": 2673,
      "lines": 74,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 3,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/utils/css-text/parse-css.ts",
      "bytes": 3897,
      "lines": 116,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/utils/css-text/parse-gradient.ts",
      "bytes": 3341,
      "lines": 85,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/utils/debounce.ts",
      "bytes": 407,
      "lines": 14,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/links.ts",
      "bytes": 1513,
      "lines": 46,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 9,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/utils/locales.ts",
      "bytes": 622,
      "lines": 17,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 21,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/math-eval.ts",
      "bytes": 3774,
      "lines": 100,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/math.ts",
      "bytes": 1279,
      "lines": 41,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 7,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/media-query.ts",
      "bytes": 1534,
      "lines": 45,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 5,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/utils/message.ts",
      "bytes": 1968,
      "lines": 62,
      "type": "ts",
      "lastModified": 1784006223,
      "fanIn": 16,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/network.ts",
      "bytes": 1935,
      "lines": 54,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 5,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/utils/platform.ts",
      "bytes": 5384,
      "lines": 118,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 43,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/promise-barrier.ts",
      "bytes": 1712,
      "lines": 57,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 4,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/state-manager-impl.ts",
      "bytes": 13997,
      "lines": 317,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/utils/state-manager.ts",
      "bytes": 1355,
      "lines": 45,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/utils/tabs.ts",
      "bytes": 2144,
      "lines": 66,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/utils/text.ts",
      "bytes": 4855,
      "lines": 162,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 19,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/throttle.ts",
      "bytes": 2076,
      "lines": 84,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 5,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/time.ts",
      "bytes": 9113,
      "lines": 305,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 6,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/uid.ts",
      "bytes": 584,
      "lines": 16,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 4,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/url.ts",
      "bytes": 16978,
      "lines": 600,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 27,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/utils/validation.ts",
      "bytes": 8145,
      "lines": 190,
      "type": "ts",
      "lastModified": 1784080974,
      "fanIn": 3,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 2,
      "ageDays": 0
    },
    {
      "path": "src/utils/visibility.ts",
      "bytes": 3253,
      "lines": 70,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tasks/build.js",
      "bytes": 4991,
      "lines": 161,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 16,
      "extDeps": 1,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "tasks/bundle-api.js",
      "bytes": 3245,
      "lines": 100,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 6,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tasks/bundle-css.js",
      "bytes": 4298,
      "lines": 140,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 2,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tasks/bundle-html.js",
      "bytes": 4109,
      "lines": 122,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tasks/bundle-js.js",
      "bytes": 9667,
      "lines": 260,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tasks/bundle-locales.js",
      "bytes": 4261,
      "lines": 122,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 2,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tasks/bundle-manifest.js",
      "bytes": 2810,
      "lines": 65,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tasks/bundle-signature.js",
      "bytes": 6751,
      "lines": 205,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 4,
      "extDeps": 2,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tasks/check-exists.js",
      "bytes": 339,
      "lines": 12,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tasks/clean.js",
      "bytes": 539,
      "lines": 19,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tasks/cli.js",
      "bytes": 7508,
      "lines": 208,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 6,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "tasks/code-style.js",
      "bytes": 1986,
      "lines": 73,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 1,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tasks/copy.js",
      "bytes": 3162,
      "lines": 99,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tasks/deno.js",
      "bytes": 1224,
      "lines": 48,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tasks/dependencies.js",
      "bytes": 3493,
      "lines": 103,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 3,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tasks/integrity.js",
      "bytes": 7610,
      "lines": 231,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 3,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tasks/log.js",
      "bytes": 2376,
      "lines": 96,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tasks/package.json",
      "bytes": 23,
      "lines": 3,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tasks/paths.js",
      "bytes": 626,
      "lines": 31,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 12,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tasks/ping.js",
      "bytes": 9371,
      "lines": 311,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 4,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tasks/platform.js",
      "bytes": 403,
      "lines": 11,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 13,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tasks/reload.js",
      "bytes": 3585,
      "lines": 130,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 7,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tasks/task.js",
      "bytes": 2047,
      "lines": 84,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 14,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "tasks/translate.js",
      "bytes": 6676,
      "lines": 228,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tasks/tsconfig.json",
      "bytes": 185,
      "lines": 11,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tasks/types.d.ts",
      "bytes": 857,
      "lines": 42,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tasks/utils.js",
      "bytes": 5014,
      "lines": 201,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 21,
      "fanOut": 0,
      "extDeps": 5,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tasks/watch.js",
      "bytes": 1207,
      "lines": 51,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tasks/zip.js",
      "bytes": 3060,
      "lines": 82,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 4,
      "extDeps": 3,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tests/browser/coverage.js",
      "bytes": 5495,
      "lines": 171,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/browser/dynamic/inline-override.tests.ts",
      "bytes": 1249,
      "lines": 42,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/browser/dynamic/link-override.tests.ts",
      "bytes": 4173,
      "lines": 121,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/browser/dynamic/style-override.tests.ts",
      "bytes": 9335,
      "lines": 255,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/browser/e2e/devtools.tests.ts",
      "bytes": 2499,
      "lines": 82,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/browser/e2e/environment.tests.ts",
      "bytes": 1318,
      "lines": 41,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/browser/e2e/export.tests.ts",
      "bytes": 447,
      "lines": 13,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/browser/e2e/fixes.tests.ts",
      "bytes": 7032,
      "lines": 241,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/browser/e2e/news.tests.ts",
      "bytes": 335,
      "lines": 14,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/browser/e2e/origin.tests.ts",
      "bytes": 6598,
      "lines": 180,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/browser/e2e/shadow-dom.tests.ts",
      "bytes": 1955,
      "lines": 67,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/browser/e2e/toggle.tests.ts",
      "bytes": 9033,
      "lines": 252,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/browser/environment.js",
      "bytes": 18023,
      "lines": 466,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 3,
      "extDeps": 3,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "tests/browser/globals.d.ts",
      "bytes": 2116,
      "lines": 44,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/browser/jest.config.chrome-mv3.mjs",
      "bytes": 183,
      "lines": 5,
      "type": "mjs",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/browser/jest.config.firefox.mjs",
      "bytes": 140,
      "lines": 4,
      "type": "mjs",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/browser/jest.config.mjs",
      "bytes": 1028,
      "lines": 31,
      "type": "mjs",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/browser/paths.js",
      "bytes": 3752,
      "lines": 117,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 4,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/browser/server.js",
      "bytes": 3354,
      "lines": 127,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/browser/settings/sitelist.tests.ts",
      "bytes": 727,
      "lines": 20,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/browser/tsconfig.json",
      "bytes": 535,
      "lines": 24,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/dependencies.js",
      "bytes": 1347,
      "lines": 45,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/inject/dynamic/color.tests.ts",
      "bytes": 5780,
      "lines": 125,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 4,
      "extDeps": 0,
      "maxDepth": 13,
      "ageDays": 1
    },
    {
      "path": "tests/inject/dynamic/fixes.tests.ts",
      "bytes": 4555,
      "lines": 118,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 6,
      "extDeps": 1,
      "maxDepth": 13,
      "ageDays": 1
    },
    {
      "path": "tests/inject/dynamic/image-analysis.tests.ts",
      "bytes": 11428,
      "lines": 290,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 1,
      "maxDepth": 13,
      "ageDays": 1
    },
    {
      "path": "tests/inject/dynamic/inline-override.tests.ts",
      "bytes": 3516,
      "lines": 85,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 4,
      "extDeps": 0,
      "maxDepth": 13,
      "ageDays": 1
    },
    {
      "path": "tests/inject/dynamic/link-override.tests.ts",
      "bytes": 10028,
      "lines": 226,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 6,
      "extDeps": 0,
      "maxDepth": 13,
      "ageDays": 1
    },
    {
      "path": "tests/inject/dynamic/media-query.tests.ts",
      "bytes": 8391,
      "lines": 188,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 4,
      "extDeps": 0,
      "maxDepth": 13,
      "ageDays": 1
    },
    {
      "path": "tests/inject/dynamic/shadow-dom.tests.ts",
      "bytes": 7786,
      "lines": 178,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 0,
      "maxDepth": 13,
      "ageDays": 1
    },
    {
      "path": "tests/inject/dynamic/style-override.tests.ts",
      "bytes": 12002,
      "lines": 248,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 0,
      "maxDepth": 13,
      "ageDays": 1
    },
    {
      "path": "tests/inject/dynamic/variables.tests.ts",
      "bytes": 54156,
      "lines": 1320,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 8,
      "extDeps": 0,
      "maxDepth": 13,
      "ageDays": 1
    },
    {
      "path": "tests/inject/karma.conf.cjs",
      "bytes": 637,
      "lines": 24,
      "type": "cjs",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/inject/karma.conf.js",
      "bytes": 4869,
      "lines": 144,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 6,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/inject/support/background-stub.ts",
      "bytes": 1634,
      "lines": 42,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/inject/support/customize.ts",
      "bytes": 406,
      "lines": 13,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/inject/support/echo-client.ts",
      "bytes": 377,
      "lines": 11,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/inject/support/echo-server.js",
      "bytes": 1802,
      "lines": 72,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/inject/support/polyfills.ts",
      "bytes": 608,
      "lines": 19,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 8,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/inject/support/test-utils.ts",
      "bytes": 571,
      "lines": 21,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 9,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/inject/tsconfig.json",
      "bytes": 979,
      "lines": 38,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/inject/utils/url.tests.ts",
      "bytes": 20038,
      "lines": 395,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "tests/package.json",
      "bytes": 23,
      "lines": 3,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/support/test-utils.ts",
      "bytes": 560,
      "lines": 21,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 13,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/unit/config/config.tests.ts",
      "bytes": 10029,
      "lines": 281,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 8,
      "extDeps": 2,
      "maxDepth": 4,
      "ageDays": 1
    },
    {
      "path": "tests/unit/config/locales.tests.ts",
      "bytes": 2100,
      "lines": 63,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/unit/csp/csp.tests.ts",
      "bytes": 499,
      "lines": 12,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tests/unit/generators/utils/parse.tests.ts",
      "bytes": 15377,
      "lines": 578,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tests/unit/inject/fixes.tests.ts",
      "bytes": 7475,
      "lines": 270,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tests/unit/inject/selectors.tests.ts",
      "bytes": 3208,
      "lines": 77,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/unit/jest.config.mjs",
      "bytes": 850,
      "lines": 28,
      "type": "mjs",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/unit/tsconfig.json",
      "bytes": 669,
      "lines": 27,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "tests/unit/utils/color.tests.ts",
      "bytes": 8217,
      "lines": 138,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tests/unit/utils/math.tests.ts",
      "bytes": 1270,
      "lines": 48,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/unit/utils/parsing.tests.ts",
      "bytes": 3959,
      "lines": 119,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "tests/unit/utils/promise-barrier.tests.ts",
      "bytes": 3872,
      "lines": 99,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/unit/utils/state-manager.tests.ts",
      "bytes": 17588,
      "lines": 644,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "tests/unit/utils/text.tests.ts",
      "bytes": 3765,
      "lines": 112,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 1
    },
    {
      "path": "tests/unit/utils/time.tests.ts",
      "bytes": 8661,
      "lines": 128,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/unit/utils/uid.tests.ts",
      "bytes": 1440,
      "lines": 49,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tests/unit/utils/url.tests.ts",
      "bytes": 9437,
      "lines": 146,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "tests/unit/utils/validation.tests.ts",
      "bytes": 6508,
      "lines": 183,
      "type": "ts",
      "lastModified": 1784081180,
      "fanIn": 0,
      "fanOut": 3,
      "extDeps": 1,
      "maxDepth": 3,
      "ageDays": 0
    },
    {
      "path": "yarn.lock",
      "bytes": 204806,
      "lines": 5138,
      "type": "other",
      "lastModified": 1784006141,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    }
  ],
  "adjacency": {
    "docs/arch/data.js": [],
    "docs/arch/index.css": [],
    "docs/arch/index.js": [],
    "docs/data.js": [],
    "docs/files/components/rui-report-coupling/data.js": [],
    "docs/files/components/rui-report-coupling/index.css": [],
    "docs/files/components/rui-report-coupling/index.js": [],
    "docs/files/components/rui-report-health/data.js": [],
    "docs/files/components/rui-report-health/index.css": [],
    "docs/files/components/rui-report-health/index.js": [],
    "docs/files/components/rui-report-largest/data.js": [],
    "docs/files/components/rui-report-largest/index.css": [],
    "docs/files/components/rui-report-largest/index.js": [],
    "docs/files/components/rui-report-risk/data.js": [],
    "docs/files/components/rui-report-risk/index.css": [],
    "docs/files/components/rui-report-risk/index.js": [],
    "docs/files/components/rui-report-self-improvement/data.js": [],
    "docs/files/components/rui-report-self-improvement/index.css": [],
    "docs/files/components/rui-report-self-improvement/index.js": [],
    "docs/files/components/rui-report-size/data.js": [],
    "docs/files/components/rui-report-size/index.css": [],
    "docs/files/components/rui-report-size/index.js": [],
    "docs/files/components/rui-report-summary/data.js": [],
    "docs/files/components/rui-report-summary/index.css": [],
    "docs/files/components/rui-report-summary/index.js": [],
    "docs/files/data.js": [],
    "docs/files/index.css": [],
    "docs/files/index.js": [],
    "docs/index.css": [],
    "docs/index.js": [],
    "eslint-plugin-local.js": [],
    "eslint.config.js": [
      "eslint-plugin-local.js"
    ],
    "index.d.ts": [],
    "src/api/chrome.ts": [
      "src/utils/message.ts",
      "src/utils/network.ts",
      "src/api/fetch.ts"
    ],
    "src/api/fetch.ts": [],
    "src/api/index.ts": [
      "src/api/chrome.ts",
      "src/defaults.ts",
      "src/generators/theme-engines.ts",
      "src/inject/dynamic-theme/index.ts",
      "src/inject/dynamic-theme/css-collection.ts",
      "src/utils/platform.ts",
      "src/api/fetch.ts"
    ],
    "src/background/config-manager.ts": [
      "src/defaults.ts",
      "src/generators/utils/parse.ts",
      "src/utils/colorscheme-parser.ts",
      "src/utils/links.ts",
      "src/utils/text.ts",
      "src/utils/time.ts",
      "src/utils/url.ts",
      "src/background/user-storage.ts",
      "src/background/utils/log.ts",
      "src/background/utils/network.ts"
    ],
    "src/background/content-script-manager.ts": [
      "src/background/utils/log.ts"
    ],
    "src/background/devtools.ts": [
      "src/generators/css-filter.ts",
      "src/generators/detector-hints.ts",
      "src/generators/dynamic-theme.ts",
      "src/generators/static-theme.ts",
      "src/background/config-manager.ts",
      "src/background/utils/log.ts"
    ],
    "src/background/extension.ts": [
      "src/generators/css-filter.ts",
      "src/generators/detector-hints.ts",
      "src/generators/dynamic-theme.ts",
      "src/generators/static-theme.ts",
      "src/generators/svg-filter.ts",
      "src/generators/theme-engines.ts",
      "src/utils/debounce.ts",
      "src/utils/message.ts",
      "src/utils/platform.ts",
      "src/utils/promise-barrier.ts",
      "src/utils/state-manager.ts",
      "src/utils/tabs.ts",
      "src/utils/url.ts",
      "src/background/config-manager.ts",
      "src/background/devtools.ts",
      "src/background/icon-manager.ts",
      "src/background/messenger.ts",
      "src/background/tab-manager.ts",
      "src/background/ui-highlights.ts",
      "src/background/user-storage.ts",
      "src/background/utils/extension-api.ts",
      "src/background/utils/log.ts",
      "src/background/window-theme.ts"
    ],
    "src/background/icon-manager.ts": [
      "src/utils/platform.ts"
    ],
    "src/background/index.ts": [
      "src/background/utils/extension-api.ts",
      "src/utils/links.ts",
      "src/utils/media-query.ts",
      "src/utils/message.ts",
      "src/utils/platform.ts",
      "src/background/extension.ts",
      "src/background/make-chromium-happy.ts",
      "src/background/utils/log.ts",
      "src/background/utils/sendLog.ts"
    ],
    "src/background/make-chromium-happy.ts": [
      "src/utils/message.ts",
      "src/background/utils/tab.ts"
    ],
    "src/background/make-firefox-happy.ts": [
      "src/utils/message.ts",
      "src/utils/platform.ts"
    ],
    "src/background/messenger.ts": [
      "src/utils/message.ts",
      "src/utils/links.ts",
      "src/utils/platform.ts",
      "src/background/make-firefox-happy.ts",
      "src/background/utils/log.ts"
    ],
    "src/background/tab-manager.ts": [
      "src/background/utils/extension-api.ts",
      "src/utils/message.ts",
      "src/utils/platform.ts",
      "src/utils/state-manager.ts",
      "src/utils/tabs.ts",
      "src/utils/url.ts",
      "src/background/icon-manager.ts",
      "src/background/make-firefox-happy.ts",
      "src/background/utils/log.ts",
      "src/background/utils/network.ts",
      "src/background/utils/tab.ts"
    ],
    "src/background/ui-highlights.ts": [
      "src/background/utils/extension-api.ts"
    ],
    "src/background/user-storage.ts": [
      "src/generators/theme-engines.ts",
      "src/defaults.ts",
      "src/utils/debounce.ts",
      "src/utils/promise-barrier.ts",
      "src/utils/url.ts",
      "src/utils/validation.ts",
      "src/background/utils/extension-api.ts",
      "src/background/utils/log.ts"
    ],
    "src/background/utils/extension-api.ts": [
      "src/utils/platform.ts",
      "src/utils/time.ts",
      "src/utils/url.ts"
    ],
    "src/background/utils/log.ts": [
      "src/background/utils/sendLog.ts"
    ],
    "src/background/utils/network.ts": [
      "src/utils/network.ts",
      "src/utils/platform.ts",
      "src/utils/text.ts",
      "src/utils/time.ts"
    ],
    "src/background/utils/sendLog.ts": [],
    "src/background/utils/tab.ts": [
      "src/utils/platform.ts"
    ],
    "src/background/window-theme.ts": [
      "src/inject/dynamic-theme/modify-colors.ts",
      "src/utils/color.ts"
    ],
    "src/defaults.ts": [
      "src/generators/theme-engines.ts",
      "src/utils/colorscheme-parser.ts",
      "src/utils/platform.ts"
    ],
    "src/definitions.d.ts": [
      "src/generators/css-filter.ts",
      "src/generators/theme-engines.ts",
      "src/utils/colorscheme-parser.ts",
      "src/utils/message.ts"
    ],
    "src/generators/css-filter.ts": [
      "src/utils/platform.ts",
      "src/utils/text.ts",
      "src/utils/url.ts",
      "src/generators/text-style.ts",
      "src/generators/utils/format.ts",
      "src/generators/utils/matrix.ts",
      "src/generators/utils/parse.ts"
    ],
    "src/generators/detector-hints.ts": [
      "src/utils/text.ts",
      "src/utils/url.ts",
      "src/generators/utils/format.ts",
      "src/generators/utils/parse.ts"
    ],
    "src/generators/dynamic-theme.ts": [
      "src/utils/css-text/format-css.ts",
      "src/utils/text.ts",
      "src/utils/url.ts",
      "src/generators/utils/format.ts",
      "src/generators/utils/parse.ts"
    ],
    "src/generators/static-theme.ts": [
      "src/utils/text.ts",
      "src/utils/url.ts",
      "src/generators/text-style.ts",
      "src/generators/utils/format.ts",
      "src/generators/utils/matrix.ts",
      "src/generators/utils/parse.ts"
    ],
    "src/generators/svg-filter.ts": [
      "src/utils/platform.ts",
      "src/generators/css-filter.ts",
      "src/generators/utils/matrix.ts",
      "src/generators/utils/parse.ts"
    ],
    "src/generators/text-style.ts": [],
    "src/generators/theme-engines.ts": [],
    "src/generators/utils/format.ts": [
      "src/utils/array.ts"
    ],
    "src/generators/utils/matrix.ts": [
      "src/utils/math.ts"
    ],
    "src/generators/utils/parse.ts": [
      "src/utils/text.ts",
      "src/utils/url.ts"
    ],
    "src/inject/cache.ts": [
      "src/inject/dynamic-theme/image.ts"
    ],
    "src/inject/color-scheme-watcher.ts": [
      "src/utils/media-query.ts",
      "src/utils/message.ts",
      "src/utils/visibility.ts"
    ],
    "src/inject/detector.ts": [
      "src/utils/color.ts",
      "src/utils/media-query.ts"
    ],
    "src/inject/dynamic-theme/adopted-style-manger.ts": [
      "src/utils/array.ts",
      "src/utils/platform.ts",
      "src/inject/dynamic-theme/css-rules.ts",
      "src/inject/dynamic-theme/style-scope.ts",
      "src/inject/dynamic-theme/stylesheet-modifier.ts"
    ],
    "src/inject/dynamic-theme/css-collection.ts": [
      "src/utils/array.ts",
      "src/utils/css-text/format-css.ts",
      "src/utils/network.ts",
      "src/utils/text.ts"
    ],
    "src/inject/dynamic-theme/css-rules.ts": [
      "src/utils/array.ts",
      "src/utils/platform.ts",
      "src/utils/text.ts",
      "src/utils/url.ts",
      "src/inject/utils/log.ts"
    ],
    "src/inject/dynamic-theme/fixes.ts": [
      "src/utils/url.ts",
      "src/inject/utils/log.ts"
    ],
    "src/inject/dynamic-theme/image.ts": [
      "src/generators/svg-filter.ts",
      "src/utils/async-queue.ts",
      "src/utils/color.ts",
      "src/utils/network.ts",
      "src/utils/text.ts",
      "src/inject/utils/dom.ts",
      "src/inject/utils/log.ts",
      "src/inject/dynamic-theme/network.ts"
    ],
    "src/inject/dynamic-theme/index.ts": [
      "src/generators/css-filter.ts",
      "src/generators/text-style.ts",
      "src/utils/array.ts",
      "src/utils/color.ts",
      "src/utils/math.ts",
      "src/utils/platform.ts",
      "src/utils/throttle.ts",
      "src/utils/uid.ts",
      "src/utils/url.ts",
      "src/utils/visibility.ts",
      "src/inject/utils/dom.ts",
      "src/inject/utils/log.ts",
      "src/inject/dynamic-theme/adopted-style-manger.ts",
      "src/inject/dynamic-theme/fixes.ts",
      "src/inject/dynamic-theme/injection.ts",
      "src/inject/dynamic-theme/inline-style.ts",
      "src/inject/dynamic-theme/meta-theme-color.ts",
      "src/inject/dynamic-theme/modify-colors.ts",
      "src/inject/dynamic-theme/modify-css.ts",
      "src/inject/dynamic-theme/palette.ts",
      "src/inject/dynamic-theme/selectors.ts",
      "src/inject/dynamic-theme/style-manager.ts",
      "src/inject/dynamic-theme/stylesheet-proxy.ts",
      "src/inject/dynamic-theme/variables.ts",
      "src/inject/dynamic-theme/watch/index.ts"
    ],
    "src/inject/dynamic-theme/injection.ts": [],
    "src/inject/dynamic-theme/inline-style.ts": [
      "src/utils/array.ts",
      "src/utils/platform.ts",
      "src/utils/throttle.ts",
      "src/utils/time.ts",
      "src/utils/url.ts",
      "src/inject/utils/dom.ts",
      "src/inject/dynamic-theme/css-rules.ts",
      "src/inject/dynamic-theme/image.ts",
      "src/inject/dynamic-theme/modify-css.ts",
      "src/inject/dynamic-theme/variables.ts"
    ],
    "src/inject/dynamic-theme/meta-theme-color.ts": [
      "src/utils/color.ts",
      "src/inject/utils/log.ts",
      "src/inject/dynamic-theme/modify-colors.ts"
    ],
    "src/inject/dynamic-theme/modify-colors.ts": [
      "src/generators/utils/matrix.ts",
      "src/inject/dynamic-theme/palette.ts",
      "src/utils/color.ts",
      "src/utils/math.ts"
    ],
    "src/inject/dynamic-theme/modify-css.ts": [
      "src/utils/color.ts",
      "src/utils/css-text/parse-gradient.ts",
      "src/utils/math.ts",
      "src/utils/platform.ts",
      "src/utils/text.ts",
      "src/utils/url.ts",
      "src/inject/cache.ts",
      "src/inject/utils/log.ts",
      "src/inject/dynamic-theme/css-rules.ts",
      "src/inject/dynamic-theme/image.ts",
      "src/inject/dynamic-theme/modify-colors.ts",
      "src/inject/dynamic-theme/style-scope.ts",
      "src/inject/dynamic-theme/variables.ts"
    ],
    "src/inject/dynamic-theme/mv3-proxy.ts": [
      "src/inject/utils/log.ts",
      "src/inject/dynamic-theme/stylesheet-proxy.ts"
    ],
    "src/inject/dynamic-theme/network.ts": [
      "src/utils/message.ts",
      "src/utils/uid.ts"
    ],
    "src/inject/dynamic-theme/palette.ts": [
      "src/utils/color.ts"
    ],
    "src/inject/dynamic-theme/selectors.ts": [],
    "src/inject/dynamic-theme/style-manager.ts": [
      "src/utils/array.ts",
      "src/utils/css-text/css-text.ts",
      "src/utils/network.ts",
      "src/utils/platform.ts",
      "src/utils/text.ts",
      "src/utils/url.ts",
      "src/inject/cache.ts",
      "src/inject/utils/dom.ts",
      "src/inject/utils/log.ts",
      "src/inject/dynamic-theme/css-rules.ts",
      "src/inject/dynamic-theme/injection.ts",
      "src/inject/dynamic-theme/network.ts",
      "src/inject/dynamic-theme/stylesheet-modifier.ts",
      "src/inject/dynamic-theme/watch/sheet-changes.ts"
    ],
    "src/inject/dynamic-theme/style-scope.ts": [],
    "src/inject/dynamic-theme/stylesheet-modifier.ts": [
      "src/utils/platform.ts",
      "src/utils/text.ts",
      "src/utils/throttle.ts",
      "src/inject/dynamic-theme/css-rules.ts",
      "src/inject/dynamic-theme/modify-colors.ts",
      "src/inject/dynamic-theme/modify-css.ts",
      "src/inject/dynamic-theme/variables.ts"
    ],
    "src/inject/dynamic-theme/stylesheet-proxy.ts": [],
    "src/inject/dynamic-theme/variables.ts": [
      "src/utils/color.ts",
      "src/utils/text.ts",
      "src/inject/dynamic-theme/css-rules.ts",
      "src/inject/dynamic-theme/modify-colors.ts",
      "src/inject/dynamic-theme/modify-css.ts"
    ],
    "src/inject/dynamic-theme/watch/custom-elements.ts": [
      "src/utils/array.ts",
      "src/utils/platform.ts",
      "src/inject/utils/log.ts"
    ],
    "src/inject/dynamic-theme/watch/index.ts": [
      "src/inject/dynamic-theme/style-manager.ts",
      "src/inject/dynamic-theme/watch/style-position.ts"
    ],
    "src/inject/dynamic-theme/watch/sheet-changes.ts": [],
    "src/inject/dynamic-theme/watch/style-position.ts": [
      "src/utils/array.ts",
      "src/inject/utils/dom.ts",
      "src/inject/dynamic-theme/modify-css.ts",
      "src/inject/dynamic-theme/style-manager.ts",
      "src/inject/dynamic-theme/watch/custom-elements.ts"
    ],
    "src/inject/fallback.ts": [
      "src/inject/cache.ts"
    ],
    "src/inject/index.ts": [
      "src/utils/media-query.ts",
      "src/utils/message.ts",
      "src/utils/uid.ts",
      "src/utils/links.ts",
      "src/inject/cache.ts",
      "src/inject/detector.ts",
      "src/inject/dynamic-theme/index.ts",
      "src/inject/dynamic-theme/css-collection.ts",
      "src/inject/style.ts",
      "src/inject/svg-filter.ts",
      "src/inject/utils/log.ts"
    ],
    "src/inject/style.ts": [
      "src/inject/utils/dom.ts"
    ],
    "src/inject/svg-filter.ts": [
      "src/inject/utils/dom.ts"
    ],
    "src/inject/utils/dom.ts": [
      "src/utils/array.ts",
      "src/utils/throttle.ts",
      "src/utils/time.ts",
      "src/inject/utils/log.ts"
    ],
    "src/inject/utils/log.ts": [
      "src/utils/message.ts"
    ],
    "src/stubs/defaults.ts": [],
    "src/stubs/popup/plus-body.tsx": [],
    "src/stubs/utils/theme.ts": [],
    "src/ui/connect/connector.ts": [
      "src/utils/message.ts",
      "src/utils/platform.ts"
    ],
    "src/ui/connect/mock.ts": [
      "src/generators/theme-engines.ts"
    ],
    "src/ui/controls/button/index.tsx": [
      "src/ui/controls/utils.ts"
    ],
    "src/ui/controls/check-button/check-button.tsx": [
      "src/ui/controls/checkbox/index.tsx",
      "src/ui/controls/control-group/control-group.tsx"
    ],
    "src/ui/controls/checkbox/index.tsx": [
      "src/ui/controls/utils.ts"
    ],
    "src/ui/controls/color-dropdown/index.tsx": [
      "src/utils/color.ts",
      "src/ui/controls/color-picker/index.tsx",
      "src/ui/controls/dropdown/index.tsx"
    ],
    "src/ui/controls/color-picker/hsb-picker.tsx": [
      "src/utils/color.ts",
      "src/utils/math.ts",
      "src/ui/utils.ts",
      "src/ui/controls/utils.ts"
    ],
    "src/ui/controls/color-picker/index.tsx": [
      "src/utils/color.ts",
      "src/ui/controls/textbox/index.tsx",
      "src/ui/controls/color-picker/hsb-picker.tsx"
    ],
    "src/ui/controls/control-group/control-group.tsx": [],
    "src/ui/controls/dropdown/index.tsx": [],
    "src/ui/controls/index.ts": [
      "src/ui/controls/button/index.tsx",
      "src/ui/controls/check-button/check-button.tsx",
      "src/ui/controls/checkbox/index.tsx",
      "src/ui/controls/color-dropdown/index.tsx",
      "src/ui/controls/color-picker/index.tsx",
      "src/ui/controls/control-group/control-group.tsx",
      "src/ui/controls/dropdown/index.tsx",
      "src/ui/controls/message-box/index.tsx",
      "src/ui/controls/multi-switch/index.tsx",
      "src/ui/controls/nav-button/index.tsx",
      "src/ui/controls/overlay/index.ts",
      "src/ui/controls/reset-button/index.tsx",
      "src/ui/controls/select/index.tsx",
      "src/ui/controls/shortcut/index.tsx",
      "src/ui/controls/slider/index.tsx",
      "src/ui/controls/tab-panel/index.tsx",
      "src/ui/controls/text-list/index.tsx",
      "src/ui/controls/textbox/index.tsx",
      "src/ui/controls/toggle/index.tsx",
      "src/ui/controls/updown/index.tsx"
    ],
    "src/ui/controls/message-box/index.tsx": [
      "src/ui/controls/button/index.tsx",
      "src/ui/controls/overlay/index.ts"
    ],
    "src/ui/controls/multi-switch/index.tsx": [],
    "src/ui/controls/nav-button/index.tsx": [
      "src/ui/controls/button/index.tsx"
    ],
    "src/ui/controls/overlay/index.ts": [],
    "src/ui/controls/reset-button/index.tsx": [
      "src/ui/controls/button/index.tsx"
    ],
    "src/ui/controls/select/index.tsx": [
      "src/ui/controls/button/index.tsx",
      "src/ui/controls/textbox/index.tsx",
      "src/ui/controls/virtual-scroll/index.tsx"
    ],
    "src/ui/controls/shortcut/index.tsx": [
      "src/utils/platform.ts",
      "src/ui/controls/utils.ts"
    ],
    "src/ui/controls/slider/index.tsx": [
      "src/utils/math.ts",
      "src/utils/throttle.ts"
    ],
    "src/ui/controls/tab-panel/index.tsx": [
      "src/ui/controls/button/index.tsx",
      "src/ui/controls/tab-panel/tab.tsx"
    ],
    "src/ui/controls/tab-panel/tab.tsx": [],
    "src/ui/controls/text-list/index.tsx": [
      "src/ui/controls/textbox/index.tsx",
      "src/ui/controls/virtual-scroll/index.tsx"
    ],
    "src/ui/controls/textbox/index.tsx": [
      "src/ui/controls/utils.ts"
    ],
    "src/ui/controls/toggle/index.tsx": [],
    "src/ui/controls/updown/index.tsx": [
      "src/utils/locales.ts",
      "src/ui/controls/button/index.tsx",
      "src/ui/controls/updown/track.tsx"
    ],
    "src/ui/controls/updown/track.tsx": [],
    "src/ui/controls/utils.ts": [
      "src/ui/utils.ts"
    ],
    "src/ui/controls/virtual-scroll/index.tsx": [],
    "src/ui/devtools/components/body.tsx": [
      "src/generators/css-filter.ts",
      "src/generators/detector-hints.ts",
      "src/generators/dynamic-theme.ts",
      "src/generators/static-theme.ts",
      "src/generators/theme-engines.ts",
      "src/utils/platform.ts",
      "src/ui/controls/index.ts",
      "src/ui/options/tab-panel/tab-panel.tsx",
      "src/ui/popup/theme/utils.ts",
      "src/ui/devtools/components/config-editor-tabs.tsx"
    ],
    "src/ui/devtools/components/config-editor-per-site.tsx": [
      "src/ui/controls/index.ts",
      "src/ui/devtools/components/config-editor.tsx"
    ],
    "src/ui/devtools/components/config-editor-tabs.tsx": [
      "src/ui/options/tab-panel/tab-panel.tsx",
      "src/ui/devtools/components/config-editor.tsx",
      "src/ui/devtools/components/config-editor-per-site.tsx"
    ],
    "src/ui/devtools/components/config-editor.tsx": [
      "src/utils/links.ts",
      "src/utils/platform.ts",
      "src/ui/controls/index.ts"
    ],
    "src/ui/devtools/index.tsx": [
      "src/ui/connect/connector.ts",
      "src/ui/devtools/components/body.tsx"
    ],
    "src/ui/devtools/types.d.ts": [],
    "src/ui/icons/advanced-icon.tsx": [],
    "src/ui/icons/delete-icon.tsx": [],
    "src/ui/icons/help-icon.tsx": [],
    "src/ui/icons/index.tsx": [
      "src/ui/icons/advanced-icon.tsx",
      "src/ui/icons/delete-icon.tsx",
      "src/ui/icons/help-icon.tsx",
      "src/ui/icons/key-icon.tsx",
      "src/ui/icons/keyboard-icon.tsx",
      "src/ui/icons/list-icon.tsx",
      "src/ui/icons/settings-icon.tsx"
    ],
    "src/ui/icons/key-icon.tsx": [],
    "src/ui/icons/keyboard-icon.tsx": [],
    "src/ui/icons/list-icon.tsx": [],
    "src/ui/icons/phone-icon.tsx": [],
    "src/ui/icons/settings-icon.tsx": [],
    "src/ui/options/about/about-tab.tsx": [
      "src/utils/links.ts",
      "src/utils/locales.ts",
      "src/ui/options/about/version.tsx"
    ],
    "src/ui/options/about/version.tsx": [
      "src/utils/locales.ts"
    ],
    "src/ui/options/activation/activation-tab.tsx": [
      "src/ui/controls/index.ts"
    ],
    "src/ui/options/advanced/advanced-tab.tsx": [
      "src/ui/options/advanced/context-menus.tsx",
      "src/ui/options/advanced/devtools.tsx",
      "src/ui/options/advanced/enable-for-protected-pages.tsx",
      "src/ui/options/advanced/export-settings.tsx",
      "src/ui/options/advanced/import-settings.tsx",
      "src/ui/options/advanced/reset-settings.tsx",
      "src/ui/options/advanced/sync-config.tsx",
      "src/ui/options/advanced/sync-settings.tsx"
    ],
    "src/ui/options/advanced/context-menus.tsx": [
      "src/utils/platform.ts",
      "src/ui/controls/index.ts"
    ],
    "src/ui/options/advanced/devtools.tsx": [
      "src/utils/locales.ts",
      "src/ui/controls/index.ts",
      "src/ui/utils.ts"
    ],
    "src/ui/options/advanced/enable-for-protected-pages.tsx": [
      "src/ui/controls/index.ts"
    ],
    "src/ui/options/advanced/export-settings.tsx": [
      "src/ui/controls/index.ts",
      "src/ui/utils.ts"
    ],
    "src/ui/options/advanced/fetch-news.tsx": [
      "src/ui/controls/index.ts"
    ],
    "src/ui/options/advanced/import-settings.tsx": [
      "src/utils/validation.ts",
      "src/ui/controls/index.ts",
      "src/ui/utils.ts"
    ],
    "src/ui/options/advanced/reset-settings.tsx": [
      "src/defaults.ts",
      "src/ui/controls/index.ts"
    ],
    "src/ui/options/advanced/sync-config.tsx": [
      "src/ui/controls/index.ts"
    ],
    "src/ui/options/advanced/sync-settings.tsx": [
      "src/ui/controls/index.ts"
    ],
    "src/ui/options/body/body.tsx": [
      "src/ui/controls/index.ts",
      "src/ui/icons/index.tsx",
      "src/ui/options/about/about-tab.tsx",
      "src/ui/options/activation/activation-tab.tsx",
      "src/ui/options/advanced/advanced-tab.tsx",
      "src/ui/options/general/general-tab.tsx",
      "src/ui/options/hotkeys/hotkeys-tab.tsx",
      "src/ui/options/site-list/site-list-tab.tsx",
      "src/ui/options/tab-panel/tab-panel.tsx"
    ],
    "src/ui/options/general/change-browser-theme.tsx": [
      "src/ui/controls/index.ts"
    ],
    "src/ui/options/general/enabled-by-default.tsx": [
      "src/ui/controls/index.ts"
    ],
    "src/ui/options/general/enabled-for-pdf.tsx": [
      "src/ui/controls/index.ts"
    ],
    "src/ui/options/general/general-tab.tsx": [
      "src/utils/platform.ts",
      "src/ui/options/general/change-browser-theme.tsx",
      "src/ui/options/general/enabled-by-default.tsx",
      "src/ui/options/general/enabled-for-pdf.tsx"
    ],
    "src/ui/options/hotkeys/hotkeys-tab.tsx": [
      "src/utils/locales.ts",
      "src/ui/controls/index.ts"
    ],
    "src/ui/options/index.tsx": [
      "src/utils/message.ts",
      "src/utils/platform.ts",
      "src/ui/connect/connector.ts",
      "src/ui/options/body/body.tsx"
    ],
    "src/ui/options/site-list/clear-site-list.tsx": [
      "src/ui/controls/index.ts",
      "src/ui/icons/index.tsx"
    ],
    "src/ui/options/site-list/site-list-tab.tsx": [
      "src/ui/options/site-list/clear-site-list.tsx",
      "src/ui/options/site-list/site-list.tsx"
    ],
    "src/ui/options/site-list/site-list.tsx": [
      "src/ui/controls/index.ts",
      "src/ui/controls/virtual-scroll/index.tsx"
    ],
    "src/ui/options/tab-panel/tab-panel.tsx": [
      "src/ui/controls/index.ts"
    ],
    "src/ui/popup/body/index.tsx": [
      "src/utils/platform.ts",
      "src/ui/controls/index.ts",
      "src/ui/utils.ts",
      "src/ui/popup/main-page/index.tsx",
      "src/ui/popup/page-viewer/index.tsx",
      "src/ui/popup/theme/page/index.tsx"
    ],
    "src/ui/popup/compatibility.js": [],
    "src/ui/popup/components/body.tsx": [
      "src/utils/links.ts",
      "src/utils/locales.ts",
      "src/utils/platform.ts",
      "src/ui/controls/index.ts",
      "src/ui/utils.ts",
      "src/ui/popup/body/index.tsx",
      "src/ui/popup/components/filter-settings/index.tsx",
      "src/ui/popup/components/header/index.tsx",
      "src/ui/popup/components/loader/index.tsx",
      "src/ui/popup/components/more-settings/index.tsx",
      "src/ui/popup/components/site-list-settings/index.tsx"
    ],
    "src/ui/popup/components/custom-settings-toggle/index.tsx": [
      "src/utils/locales.ts",
      "src/utils/url.ts",
      "src/ui/controls/index.ts"
    ],
    "src/ui/popup/components/engine-switch/index.tsx": [
      "src/generators/theme-engines.ts",
      "src/utils/locales.ts",
      "src/ui/controls/index.ts",
      "src/ui/utils.ts"
    ],
    "src/ui/popup/components/filter-settings/index.tsx": [
      "src/utils/locales.ts",
      "src/utils/url.ts",
      "src/ui/controls/index.ts",
      "src/ui/popup/components/custom-settings-toggle/index.tsx",
      "src/ui/popup/components/filter-settings/mode-toggle.tsx"
    ],
    "src/ui/popup/components/filter-settings/mode-toggle.tsx": [
      "src/utils/locales.ts",
      "src/ui/controls/index.ts"
    ],
    "src/ui/popup/components/font-settings/index.tsx": [
      "src/utils/locales.ts",
      "src/ui/controls/index.ts"
    ],
    "src/ui/popup/components/header/index.tsx": [
      "src/utils/locales.ts",
      "src/utils/platform.ts",
      "src/utils/url.ts",
      "src/ui/controls/index.ts",
      "src/ui/icons/index.tsx",
      "src/ui/popup/components/site-toggle/index.tsx",
      "src/ui/popup/components/header/more-new-highlight.tsx",
      "src/ui/popup/components/header/more-site-settings.tsx"
    ],
    "src/ui/popup/components/header/more-new-highlight.tsx": [],
    "src/ui/popup/components/header/more-site-settings.tsx": [
      "src/utils/locales.ts",
      "src/ui/controls/index.ts",
      "src/ui/icons/index.tsx"
    ],
    "src/ui/popup/components/loader/index.tsx": [
      "src/utils/locales.ts"
    ],
    "src/ui/popup/components/more-settings/index.tsx": [
      "src/utils/locales.ts",
      "src/utils/platform.ts",
      "src/utils/url.ts",
      "src/ui/controls/index.ts",
      "src/ui/icons/index.tsx",
      "src/ui/utils.ts",
      "src/ui/popup/components/custom-settings-toggle/index.tsx",
      "src/ui/popup/components/engine-switch/index.tsx",
      "src/ui/popup/components/font-settings/index.tsx"
    ],
    "src/ui/popup/components/site-list-settings/index.tsx": [
      "src/utils/locales.ts",
      "src/ui/controls/index.ts"
    ],
    "src/ui/popup/components/site-toggle/checkmark-icon.tsx": [],
    "src/ui/popup/components/site-toggle/index.tsx": [
      "src/utils/url.ts",
      "src/ui/controls/index.ts",
      "src/ui/popup/components/site-toggle/checkmark-icon.tsx"
    ],
    "src/ui/popup/index.tsx": [
      "src/utils/message.ts",
      "src/utils/platform.ts",
      "src/ui/connect/connector.ts",
      "src/ui/utils.ts",
      "src/ui/popup/components/body.tsx",
      "src/ui/popup/utils/issues.ts"
    ],
    "src/ui/popup/main-page/app-switch.tsx": [
      "src/utils/locales.ts",
      "src/ui/controls/index.ts"
    ],
    "src/ui/popup/main-page/help.tsx": [
      "src/utils/links.ts",
      "src/utils/locales.ts",
      "src/ui/controls/index.ts"
    ],
    "src/ui/popup/main-page/index.tsx": [
      "src/ui/controls/index.ts",
      "src/ui/popup/main-page/app-switch.tsx",
      "src/ui/popup/main-page/help.tsx",
      "src/ui/popup/main-page/site-toggle.tsx",
      "src/ui/popup/main-page/theme-group.tsx"
    ],
    "src/ui/popup/main-page/site-toggle.tsx": [
      "src/utils/locales.ts",
      "src/utils/platform.ts",
      "src/utils/url.ts",
      "src/ui/controls/index.ts",
      "src/ui/popup/components/site-toggle/index.tsx"
    ],
    "src/ui/popup/main-page/theme-group.tsx": [
      "src/ui/popup/theme/controls/index.tsx",
      "src/ui/popup/theme/utils.ts"
    ],
    "src/ui/popup/page-viewer/index.tsx": [
      "src/ui/controls/index.ts"
    ],
    "src/ui/popup/theme/controls/index.tsx": [
      "src/ui/popup/theme/controls/scheme.tsx"
    ],
    "src/ui/popup/theme/controls/scheme.tsx": [
      "src/utils/locales.ts",
      "src/ui/controls/index.ts",
      "src/ui/popup/theme/controls/theme-control.tsx"
    ],
    "src/ui/popup/theme/controls/theme-control.tsx": [],
    "src/ui/popup/theme/page/index.tsx": [
      "src/ui/popup/theme/controls/index.tsx",
      "src/ui/popup/theme/utils.ts"
    ],
    "src/ui/popup/theme/utils.ts": [
      "src/utils/url.ts"
    ],
    "src/ui/popup/utils/issues.ts": [],
    "src/ui/popup/utils/markdown.tsx": [],
    "src/ui/stylesheet-editor/components/body.tsx": [
      "src/utils/url.ts",
      "src/ui/controls/index.ts"
    ],
    "src/ui/stylesheet-editor/index.tsx": [
      "src/ui/connect/connector.ts",
      "src/ui/stylesheet-editor/components/body.tsx"
    ],
    "src/ui/utils.ts": [
      "src/utils/platform.ts"
    ],
    "src/utils/array.ts": [],
    "src/utils/async-queue.ts": [],
    "src/utils/cache.ts": [],
    "src/utils/color.ts": [
      "src/utils/math-eval.ts",
      "src/utils/media-query.ts",
      "src/utils/text.ts"
    ],
    "src/utils/colorscheme-parser.ts": [],
    "src/utils/csp.ts": [
      "src/utils/links.ts"
    ],
    "src/utils/css-text/css-text.ts": [],
    "src/utils/css-text/format-css.ts": [
      "src/utils/css-text/parse-css.ts"
    ],
    "src/utils/css-text/parse-css.ts": [
      "src/utils/text.ts",
      "src/utils/css-text/css-text.ts"
    ],
    "src/utils/css-text/parse-gradient.ts": [
      "src/utils/text.ts"
    ],
    "src/utils/debounce.ts": [],
    "src/utils/links.ts": [
      "src/utils/locales.ts",
      "src/utils/platform.ts"
    ],
    "src/utils/locales.ts": [],
    "src/utils/math-eval.ts": [],
    "src/utils/math.ts": [],
    "src/utils/media-query.ts": [
      "src/utils/platform.ts"
    ],
    "src/utils/message.ts": [],
    "src/utils/network.ts": [
      "src/utils/platform.ts"
    ],
    "src/utils/platform.ts": [],
    "src/utils/promise-barrier.ts": [],
    "src/utils/state-manager-impl.ts": [
      "src/utils/promise-barrier.ts"
    ],
    "src/utils/state-manager.ts": [
      "src/utils/platform.ts",
      "src/utils/state-manager-impl.ts"
    ],
    "src/utils/tabs.ts": [
      "src/utils/platform.ts"
    ],
    "src/utils/text.ts": [],
    "src/utils/throttle.ts": [],
    "src/utils/time.ts": [],
    "src/utils/uid.ts": [],
    "src/utils/url.ts": [
      "src/utils/cache.ts"
    ],
    "src/utils/validation.ts": [
      "src/defaults.ts"
    ],
    "src/utils/visibility.ts": [],
    "tasks/build.js": [
      "tasks/bundle-api.js",
      "tasks/bundle-css.js",
      "tasks/bundle-html.js",
      "tasks/bundle-js.js",
      "tasks/bundle-locales.js",
      "tasks/bundle-manifest.js",
      "tasks/bundle-signature.js",
      "tasks/clean.js",
      "tasks/code-style.js",
      "tasks/copy.js",
      "tasks/log.js",
      "tasks/platform.js",
      "tasks/reload.js",
      "tasks/task.js",
      "tasks/utils.js",
      "tasks/zip.js"
    ],
    "tasks/bundle-api.js": [
      "tasks/paths.js",
      "tasks/task.js"
    ],
    "tasks/bundle-css.js": [
      "tasks/paths.js",
      "tasks/platform.js",
      "tasks/reload.js",
      "tasks/task.js",
      "tasks/utils.js"
    ],
    "tasks/bundle-html.js": [
      "tasks/paths.js",
      "tasks/platform.js",
      "tasks/reload.js",
      "tasks/task.js",
      "tasks/utils.js"
    ],
    "tasks/bundle-js.js": [
      "tasks/paths.js",
      "tasks/platform.js",
      "tasks/reload.js",
      "tasks/task.js"
    ],
    "tasks/bundle-locales.js": [
      "tasks/paths.js",
      "tasks/platform.js",
      "tasks/reload.js",
      "tasks/task.js",
      "tasks/utils.js"
    ],
    "tasks/bundle-manifest.js": [
      "tasks/paths.js",
      "tasks/platform.js",
      "tasks/reload.js",
      "tasks/task.js",
      "tasks/utils.js"
    ],
    "tasks/bundle-signature.js": [
      "tasks/paths.js",
      "tasks/platform.js",
      "tasks/task.js",
      "tasks/utils.js"
    ],
    "tasks/check-exists.js": [],
    "tasks/clean.js": [
      "tasks/paths.js",
      "tasks/platform.js",
      "tasks/task.js",
      "tasks/utils.js"
    ],
    "tasks/cli.js": [
      "tasks/bundle-signature.js",
      "tasks/platform.js",
      "tasks/task.js",
      "tasks/utils.js",
      "tasks/zip.js"
    ],
    "tasks/code-style.js": [
      "tasks/paths.js",
      "tasks/platform.js",
      "tasks/task.js",
      "tasks/utils.js"
    ],
    "tasks/copy.js": [
      "tasks/paths.js",
      "tasks/platform.js",
      "tasks/reload.js",
      "tasks/task.js",
      "tasks/utils.js"
    ],
    "tasks/deno.js": [
      "tasks/utils.js"
    ],
    "tasks/dependencies.js": [
      "tasks/utils.js"
    ],
    "tasks/integrity.js": [
      "tasks/utils.js"
    ],
    "tasks/log.js": [
      "tasks/task.js",
      "tasks/utils.js"
    ],
    "tasks/paths.js": [],
    "tasks/ping.js": [
      "tasks/utils.js"
    ],
    "tasks/platform.js": [],
    "tasks/reload.js": [
      "tasks/utils.js"
    ],
    "tasks/task.js": [
      "tasks/utils.js",
      "tasks/watch.js"
    ],
    "tasks/translate.js": [
      "tasks/utils.js"
    ],
    "tasks/types.d.ts": [
      "tasks/platform.js"
    ],
    "tasks/utils.js": [],
    "tasks/watch.js": [
      "tasks/utils.js"
    ],
    "tasks/zip.js": [
      "tasks/paths.js",
      "tasks/platform.js",
      "tasks/task.js",
      "tasks/utils.js"
    ],
    "tests/browser/coverage.js": [
      "tasks/utils.js"
    ],
    "tests/browser/dynamic/inline-override.tests.ts": [
      "tests/support/test-utils.ts"
    ],
    "tests/browser/dynamic/link-override.tests.ts": [
      "tests/support/test-utils.ts"
    ],
    "tests/browser/dynamic/style-override.tests.ts": [
      "tests/support/test-utils.ts"
    ],
    "tests/browser/e2e/devtools.tests.ts": [
      "tests/support/test-utils.ts"
    ],
    "tests/browser/e2e/environment.tests.ts": [
      "tests/support/test-utils.ts"
    ],
    "tests/browser/e2e/export.tests.ts": [
      "tests/support/test-utils.ts"
    ],
    "tests/browser/e2e/fixes.tests.ts": [
      "tests/support/test-utils.ts"
    ],
    "tests/browser/e2e/news.tests.ts": [],
    "tests/browser/e2e/origin.tests.ts": [
      "tests/support/test-utils.ts"
    ],
    "tests/browser/e2e/shadow-dom.tests.ts": [
      "tests/support/test-utils.ts"
    ],
    "tests/browser/e2e/toggle.tests.ts": [
      "tests/support/test-utils.ts"
    ],
    "tests/browser/environment.js": [
      "tests/browser/coverage.js",
      "tests/browser/paths.js",
      "tests/browser/server.js"
    ],
    "tests/browser/globals.d.ts": [],
    "tests/browser/jest.config.chrome-mv3.mjs": [
      "tests/browser/jest.config.mjs"
    ],
    "tests/browser/jest.config.firefox.mjs": [
      "tests/browser/jest.config.mjs"
    ],
    "tests/browser/jest.config.mjs": [],
    "tests/browser/paths.js": [],
    "tests/browser/server.js": [],
    "tests/browser/settings/sitelist.tests.ts": [],
    "tests/dependencies.js": [],
    "tests/inject/dynamic/color.tests.ts": [
      "tests/inject/support/polyfills.ts",
      "src/defaults.ts",
      "src/inject/dynamic-theme/index.ts",
      "tests/inject/support/test-utils.ts"
    ],
    "tests/inject/dynamic/fixes.tests.ts": [
      "tests/inject/support/polyfills.ts",
      "src/defaults.ts",
      "src/generators/css-filter.ts",
      "src/inject/dynamic-theme/index.ts",
      "src/inject/utils/dom.ts",
      "tests/inject/support/test-utils.ts"
    ],
    "tests/inject/dynamic/image-analysis.tests.ts": [
      "tests/inject/support/polyfills.ts",
      "src/defaults.ts",
      "src/inject/dynamic-theme/index.ts",
      "src/inject/dynamic-theme/image.ts",
      "tests/inject/support/test-utils.ts"
    ],
    "tests/inject/dynamic/inline-override.tests.ts": [
      "tests/inject/support/polyfills.ts",
      "src/defaults.ts",
      "src/inject/dynamic-theme/index.ts",
      "tests/inject/support/test-utils.ts"
    ],
    "tests/inject/dynamic/link-override.tests.ts": [
      "src/defaults.ts",
      "src/inject/dynamic-theme/index.ts",
      "src/utils/platform.ts",
      "tests/inject/support/background-stub.ts",
      "tests/inject/support/echo-client.ts",
      "tests/inject/support/test-utils.ts"
    ],
    "tests/inject/dynamic/media-query.tests.ts": [
      "tests/inject/support/polyfills.ts",
      "src/defaults.ts",
      "src/inject/dynamic-theme/index.ts",
      "tests/inject/support/test-utils.ts"
    ],
    "tests/inject/dynamic/shadow-dom.tests.ts": [
      "tests/inject/support/polyfills.ts",
      "src/defaults.ts",
      "src/inject/dynamic-theme/index.ts",
      "src/utils/platform.ts",
      "tests/inject/support/test-utils.ts"
    ],
    "tests/inject/dynamic/style-override.tests.ts": [
      "tests/inject/support/polyfills.ts",
      "src/defaults.ts",
      "src/inject/dynamic-theme/index.ts",
      "src/inject/dynamic-theme/stylesheet-modifier.ts",
      "tests/inject/support/test-utils.ts"
    ],
    "tests/inject/dynamic/variables.tests.ts": [
      "tests/inject/support/polyfills.ts",
      "src/defaults.ts",
      "src/inject/dynamic-theme/index.ts",
      "src/inject/dynamic-theme/stylesheet-proxy.ts",
      "src/utils/platform.ts",
      "tests/inject/support/background-stub.ts",
      "tests/inject/support/echo-client.ts",
      "tests/inject/support/test-utils.ts"
    ],
    "tests/inject/karma.conf.cjs": [],
    "tests/inject/karma.conf.js": [
      "tasks/paths.js",
      "tests/inject/support/echo-server.js"
    ],
    "tests/inject/support/background-stub.ts": [
      "src/utils/message.ts"
    ],
    "tests/inject/support/customize.ts": [],
    "tests/inject/support/echo-client.ts": [],
    "tests/inject/support/echo-server.js": [],
    "tests/inject/support/polyfills.ts": [],
    "tests/inject/support/test-utils.ts": [],
    "tests/inject/utils/url.tests.ts": [
      "src/utils/url.ts"
    ],
    "tests/support/test-utils.ts": [],
    "tests/unit/config/config.tests.ts": [
      "src/generators/css-filter.ts",
      "src/generators/detector-hints.ts",
      "src/generators/dynamic-theme.ts",
      "src/generators/static-theme.ts",
      "src/utils/colorscheme-parser.ts",
      "src/utils/text.ts",
      "src/utils/url.ts",
      "tests/support/test-utils.ts"
    ],
    "tests/unit/config/locales.tests.ts": [
      "tests/support/test-utils.ts"
    ],
    "tests/unit/csp/csp.tests.ts": [
      "src/utils/csp.ts"
    ],
    "tests/unit/generators/utils/parse.tests.ts": [
      "src/generators/utils/parse.ts"
    ],
    "tests/unit/inject/fixes.tests.ts": [
      "src/inject/dynamic-theme/fixes.ts",
      "tests/support/test-utils.ts"
    ],
    "tests/unit/inject/selectors.tests.ts": [
      "src/inject/dynamic-theme/selectors.ts"
    ],
    "tests/unit/jest.config.mjs": [],
    "tests/unit/utils/color.tests.ts": [
      "src/utils/color.ts"
    ],
    "tests/unit/utils/math.tests.ts": [
      "src/utils/math.ts"
    ],
    "tests/unit/utils/parsing.tests.ts": [
      "src/utils/css-text/parse-css.ts",
      "src/utils/css-text/parse-gradient.ts"
    ],
    "tests/unit/utils/promise-barrier.tests.ts": [
      "src/utils/promise-barrier.ts"
    ],
    "tests/unit/utils/state-manager.tests.ts": [
      "src/utils/state-manager-impl.ts"
    ],
    "tests/unit/utils/text.tests.ts": [
      "src/utils/css-text/format-css.ts",
      "src/utils/text.ts"
    ],
    "tests/unit/utils/time.tests.ts": [
      "src/utils/time.ts"
    ],
    "tests/unit/utils/uid.tests.ts": [
      "src/utils/uid.ts"
    ],
    "tests/unit/utils/url.tests.ts": [
      "src/utils/url.ts"
    ],
    "tests/unit/utils/validation.tests.ts": [
      "src/defaults.ts",
      "src/generators/theme-engines.ts",
      "src/utils/validation.ts"
    ]
  },
  "selfImprovement": {
    "topP0": [
      {
        "action": "File exceeds 1000 LOC (28034 lines)",
        "file": "docs/arch/knowledge-graph.json",
        "line": null,
        "severity": "P0"
      },
      {
        "action": "Hotspot score 14.02 (>= 5.0)",
        "file": "docs/arch/knowledge-graph.json",
        "line": null,
        "severity": "P0"
      },
      {
        "action": "File exceeds 1000 LOC (1212 lines)",
        "file": "docs/files/index.html",
        "line": null,
        "severity": "P0"
      },
      {
        "action": "File exceeds 1000 LOC (10517 lines)",
        "file": "package-lock.json",
        "line": null,
        "severity": "P0"
      },
      {
        "action": "Hotspot score 5.26 (>= 5.0)",
        "file": "package-lock.json",
        "line": null,
        "severity": "P0"
      }
    ],
    "focusArea": {
      "dimName": "Nesting depth",
      "score": 76,
      "why": "Nesting depth is at 76/100 with 16 P0 and 21 P1 alerts. Address to lift composite score.",
      "hint": "Invest focused effort on top 3 levers for the largest uplift."
    },
    "trendInsight": "Score 88 (grade B). Nesting depth is the weakest dimension at 76/100.",
    "weightsHint": "Consider increasing Nesting depth weight given its outsized impact on overall health.",
    "narrative": [
      "Overall health at 88/100 (grade B) — good shape with clear remediation path.",
      "16 critical (P0) and 21 major (P1) alerts active. Primary risks cluster around Nesting depth (score 76).",
      "Top lever: refactor src/config/dynamic-theme-fixes.config (+15 pts). Remediation roadmap projects 100/100 after P0+P1 closure.",
      "Score 88 | grade B | gap 0 pts to B | projected 100 after plan | decay risk: -5 pts/quarter without action"
    ],
    "severityDonut": {
      "p0": 16,
      "p1": 21,
      "p2": 0,
      "total": 37
    },
    "riskVectors": [
      {
        "dimension": "Nesting depth",
        "score": 76,
        "weight": 0.2,
        "p0": 0,
        "p1": 39,
        "p2": 0
      },
      {
        "dimension": "Oversized files",
        "score": 81,
        "weight": 0.3,
        "p0": 9,
        "p1": 20,
        "p2": 0
      },
      {
        "dimension": "Coupling",
        "score": 95,
        "weight": 0.15,
        "p0": 0,
        "p1": 2,
        "p2": 0
      },
      {
        "dimension": "Cycles",
        "score": 99,
        "weight": 0.2,
        "p0": 0,
        "p1": 1,
        "p2": 0
      },
      {
        "dimension": "Freshness",
        "score": 100,
        "weight": 0.15,
        "p0": 0,
        "p1": 0,
        "p2": 0
      }
    ],
    "levers": [
      {
        "rank": 1,
        "dimension": "Coupling",
        "severity": "P0",
        "kind": "refactor",
        "action": "Refactor src/config/dynamic-theme-fixes.config (40286 LOC, fan-out 0) to reduce hotspot score from 20.14",
        "file": "src/config/dynamic-theme-fixes.config",
        "line": 1,
        "scoreUplift": 15,
        "effort": "medium"
      },
      {
        "rank": 2,
        "dimension": "Coupling",
        "severity": "P0",
        "kind": "refactor",
        "action": "Refactor docs/arch/knowledge-graph.json (28034 LOC, fan-out 0) to reduce hotspot score from 14.02",
        "file": "docs/arch/knowledge-graph.json",
        "line": 1,
        "scoreUplift": 14,
        "effort": "medium"
      },
      {
        "rank": 3,
        "dimension": "Coupling",
        "severity": "P0",
        "kind": "refactor",
        "action": "Refactor src/ui/controls/index.ts (43 LOC, fan-out 20) to reduce hotspot score from 11.22",
        "file": "src/ui/controls/index.ts",
        "line": 1,
        "scoreUplift": 11,
        "effort": "high"
      },
      {
        "rank": 4,
        "dimension": "Coupling",
        "severity": "P0",
        "kind": "refactor",
        "action": "Refactor src/utils/platform.ts (118 LOC, fan-out 0) to reduce hotspot score from 8.66",
        "file": "src/utils/platform.ts",
        "line": 1,
        "scoreUplift": 9,
        "effort": "medium"
      },
      {
        "rank": 5,
        "dimension": "Coupling",
        "severity": "P0",
        "kind": "refactor",
        "action": "Refactor src/inject/dynamic-theme/index.ts (942 LOC, fan-out 25) to reduce hotspot score from 7.57",
        "file": "src/inject/dynamic-theme/index.ts",
        "line": 1,
        "scoreUplift": 8,
        "effort": "high"
      },
      {
        "rank": 6,
        "dimension": "Coupling",
        "severity": "P0",
        "kind": "refactor",
        "action": "Refactor src/utils/url.ts (600 LOC, fan-out 1) to reduce hotspot score from 6",
        "file": "src/utils/url.ts",
        "line": 1,
        "scoreUplift": 6,
        "effort": "medium"
      }
    ],
    "benchmarks": {
      "currentGrade": "B",
      "currentValue": 88,
      "targetGrade": "B",
      "targetValue": 90,
      "gapToNext": 2
    },
    "remediationPlan": {
      "phases": [
        {
          "phase": "P0 — Blocking fixes (this sprint)",
          "severity": "P0",
          "itemCount": 5,
          "estUplift": 20,
          "projected": 100,
          "deadline": "2 weeks"
        },
        {
          "phase": "P1 — Important (next sprint)",
          "severity": "P1",
          "itemCount": 5,
          "estUplift": 10,
          "projected": 100,
          "deadline": "4 weeks"
        },
        {
          "phase": "P2 — Nice-to-have (this quarter)",
          "severity": "P2",
          "itemCount": 0,
          "estUplift": 5,
          "projected": 100,
          "deadline": "this quarter"
        }
      ],
      "currentScore": 88,
      "projectedScoreIfAllP0P1Remediated": 100
    },
    "decayForecast": {
      "currentScore": 88,
      "projectedNext": 83,
      "delta": -5,
      "rationale": "Without action, Nesting depth debt grows ~1 pt/quarter. Estimated -5 pts next run if no remediation."
    }
  },
  "scoreWeights": [
    {
      "dimension": "Oversized files",
      "weight": 0.3,
      "score": 81
    },
    {
      "dimension": "Nesting depth",
      "weight": 0.2,
      "score": 76
    },
    {
      "dimension": "Cycles",
      "weight": 0.2,
      "score": 99
    },
    {
      "dimension": "Coupling",
      "weight": 0.15,
      "score": 95
    },
    {
      "dimension": "Freshness",
      "weight": 0.15,
      "score": 100
    }
  ],
  "truncated": false
};
