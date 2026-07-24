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
        generatedAt: "2026-07-24T04:57:04.941Z", /* ISO 8601 UTC — filled in by the analyzer */
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
  "score": 0,
  "alerts": [
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "asset/eg1.gif",
      "line": 1,
      "message": "File exceeds 1000 LOC (2397 lines) — split candidate",
      "metric": "2397 LOC",
      "effort": "high",
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility into cohesive submodules and re-export from a barrel index.",
        "Move pure helpers into a sibling utils file and unit-test in isolation.",
        "Add a LOC budget to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "asset/eg2.gif",
      "line": 1,
      "message": "File exceeds 1000 LOC (4389 lines) — split candidate",
      "metric": "4389 LOC",
      "effort": "high",
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility into cohesive submodules and re-export from a barrel index.",
        "Move pure helpers into a sibling utils file and unit-test in isolation.",
        "Add a LOC budget to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "asset/eg3.gif",
      "line": 1,
      "message": "File exceeds 1000 LOC (6885 lines) — split candidate",
      "metric": "6885 LOC",
      "effort": "high",
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility into cohesive submodules and re-export from a barrel index.",
        "Move pure helpers into a sibling utils file and unit-test in isolation.",
        "Add a LOC budget to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "asset/eg4.gif",
      "line": 1,
      "message": "File exceeds 1000 LOC (6793 lines) — split candidate",
      "metric": "6793 LOC",
      "effort": "high",
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility into cohesive submodules and re-export from a barrel index.",
        "Move pure helpers into a sibling utils file and unit-test in isolation.",
        "Add a LOC budget to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "asset/eg5.gif",
      "line": 1,
      "message": "File exceeds 1000 LOC (1426 lines) — split candidate",
      "metric": "1426 LOC",
      "effort": "high",
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility into cohesive submodules and re-export from a barrel index.",
        "Move pure helpers into a sibling utils file and unit-test in isolation.",
        "Add a LOC budget to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "asset/eg6.gif",
      "line": 1,
      "message": "File exceeds 1000 LOC (3090 lines) — split candidate",
      "metric": "3090 LOC",
      "effort": "high",
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility into cohesive submodules and re-export from a barrel index.",
        "Move pure helpers into a sibling utils file and unit-test in isolation.",
        "Add a LOC budget to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "pnpm-lock.yaml",
      "line": 1,
      "message": "File exceeds 1000 LOC (6657 lines) — split candidate",
      "metric": "6657 LOC",
      "effort": "high",
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility into cohesive submodules and re-export from a barrel index.",
        "Move pure helpers into a sibling utils file and unit-test in isolation.",
        "Add a LOC budget to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "public/logo/simple_latex.png",
      "line": 1,
      "message": "File exceeds 1000 LOC (2288 lines) — split candidate",
      "metric": "2288 LOC",
      "effort": "high",
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility into cohesive submodules and re-export from a barrel index.",
        "Move pure helpers into a sibling utils file and unit-test in isolation.",
        "Add a LOC budget to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "public/logo/yandex.svg",
      "line": 1,
      "message": "File exceeds 1000 LOC (8308 lines) — split candidate",
      "metric": "8308 LOC",
      "effort": "high",
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility into cohesive submodules and re-export from a barrel index.",
        "Move pure helpers into a sibling utils file and unit-test in isolation.",
        "Add a LOC budget to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "src-tauri/Cargo.lock",
      "line": 1,
      "message": "File exceeds 1000 LOC (8633 lines) — split candidate",
      "metric": "8633 LOC",
      "effort": "high",
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility into cohesive submodules and re-export from a barrel index.",
        "Move pure helpers into a sibling utils file and unit-test in isolation.",
        "Add a LOC budget to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "src-tauri/icons/icon.icns",
      "line": 1,
      "message": "File exceeds 1000 LOC (1112 lines) — split candidate",
      "metric": "1112 LOC",
      "effort": "high",
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility into cohesive submodules and re-export from a barrel index.",
        "Move pure helpers into a sibling utils file and unit-test in isolation.",
        "Add a LOC budget to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/collection/anki/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/collection/anki/index.jsx → src/services/collection/anki/Config.jsx → src/services/coll…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/collection/anki/index.jsx → src/services/collection/anki/Config.jsx → src/services/collection/anki/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/collection/anki/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/collection/eudic/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/collection/eudic/index.jsx → src/services/collection/eudic/Config.jsx → src/services/co…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/collection/eudic/index.jsx → src/services/collection/eudic/Config.jsx → src/services/collection/eudic/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/collection/eudic/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/recognize/baidu_accurate/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/recognize/baidu_accurate/index.jsx → src/services/recognize/baidu_accurate/Config.jsx →…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/recognize/baidu_accurate/index.jsx → src/services/recognize/baidu_accurate/Config.jsx → src/services/recognize/baidu_accurate/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/recognize/baidu_accurate/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/recognize/baidu_img/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/recognize/baidu_img/index.jsx → src/services/recognize/baidu_img/Config.jsx → src/servi…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/recognize/baidu_img/index.jsx → src/services/recognize/baidu_img/Config.jsx → src/services/recognize/baidu_img/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/recognize/baidu_img/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/recognize/baidu/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/recognize/baidu/index.jsx → src/services/recognize/baidu/Config.jsx → src/services/reco…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/recognize/baidu/index.jsx → src/services/recognize/baidu/Config.jsx → src/services/recognize/baidu/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/recognize/baidu/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/recognize/iflytek_intsig/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/recognize/iflytek_intsig/index.jsx → src/services/recognize/iflytek_intsig/Config.jsx →…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/recognize/iflytek_intsig/index.jsx → src/services/recognize/iflytek_intsig/Config.jsx → src/services/recognize/iflytek_intsig/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/recognize/iflytek_intsig/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/recognize/iflytek_latex/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/recognize/iflytek_latex/index.jsx → src/services/recognize/iflytek_latex/Config.jsx → s…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/recognize/iflytek_latex/index.jsx → src/services/recognize/iflytek_latex/Config.jsx → src/services/recognize/iflytek_latex/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/recognize/iflytek_latex/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/recognize/iflytek/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/recognize/iflytek/index.jsx → src/services/recognize/iflytek/Config.jsx → src/services/…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/recognize/iflytek/index.jsx → src/services/recognize/iflytek/Config.jsx → src/services/recognize/iflytek/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/recognize/iflytek/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/recognize/simple_latex/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/recognize/simple_latex/index.jsx → src/services/recognize/simple_latex/Config.jsx → src…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/recognize/simple_latex/index.jsx → src/services/recognize/simple_latex/Config.jsx → src/services/recognize/simple_latex/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/recognize/simple_latex/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/recognize/tencent_accurate/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/recognize/tencent_accurate/index.jsx → src/services/recognize/tencent_accurate/Config.j…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/recognize/tencent_accurate/index.jsx → src/services/recognize/tencent_accurate/Config.jsx → src/services/recognize/tencent_accurate/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/recognize/tencent_accurate/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/recognize/tencent_img/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/recognize/tencent_img/index.jsx → src/services/recognize/tencent_img/Config.jsx → src/s…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/recognize/tencent_img/index.jsx → src/services/recognize/tencent_img/Config.jsx → src/services/recognize/tencent_img/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/recognize/tencent_img/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/recognize/tencent/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/recognize/tencent/index.jsx → src/services/recognize/tencent/Config.jsx → src/services/…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/recognize/tencent/index.jsx → src/services/recognize/tencent/Config.jsx → src/services/recognize/tencent/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/recognize/tencent/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/recognize/volcengine_multi_lang/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/recognize/volcengine_multi_lang/index.jsx → src/services/recognize/volcengine_multi_lan…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/recognize/volcengine_multi_lang/index.jsx → src/services/recognize/volcengine_multi_lang/Config.jsx → src/services/recognize/volcengine_multi_lang/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/recognize/volcengine_multi_lang/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/recognize/volcengine/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/recognize/volcengine/index.jsx → src/services/recognize/volcengine/Config.jsx → src/ser…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/recognize/volcengine/index.jsx → src/services/recognize/volcengine/Config.jsx → src/services/recognize/volcengine/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/recognize/volcengine/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/alibaba/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/alibaba/index.jsx → src/services/translate/alibaba/Config.jsx → src/services/…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/alibaba/index.jsx → src/services/translate/alibaba/Config.jsx → src/services/translate/alibaba/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/alibaba/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/baidu_field/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/baidu_field/index.jsx → src/services/translate/baidu_field/Config.jsx → src/s…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/baidu_field/index.jsx → src/services/translate/baidu_field/Config.jsx → src/services/translate/baidu_field/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/baidu_field/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/baidu/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/baidu/index.jsx → src/services/translate/baidu/Config.jsx → src/services/tran…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/baidu/index.jsx → src/services/translate/baidu/Config.jsx → src/services/translate/baidu/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/baidu/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/caiyun/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/caiyun/index.jsx → src/services/translate/caiyun/Config.jsx → src/services/tr…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/caiyun/index.jsx → src/services/translate/caiyun/Config.jsx → src/services/translate/caiyun/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/caiyun/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/chatglm/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/chatglm/index.jsx → src/services/translate/chatglm/Config.jsx → src/services/…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/chatglm/index.jsx → src/services/translate/chatglm/Config.jsx → src/services/translate/chatglm/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/chatglm/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/deepl/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/deepl/index.jsx → src/services/translate/deepl/Config.jsx → src/services/tran…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/deepl/index.jsx → src/services/translate/deepl/Config.jsx → src/services/translate/deepl/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/deepl/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/geminipro/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/geminipro/index.jsx → src/services/translate/geminipro/Config.jsx → src/servi…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/geminipro/index.jsx → src/services/translate/geminipro/Config.jsx → src/services/translate/geminipro/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/geminipro/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/google/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/google/index.jsx → src/services/translate/google/Config.jsx → src/services/tr…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/google/index.jsx → src/services/translate/google/Config.jsx → src/services/translate/google/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/google/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/niutrans/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/niutrans/index.jsx → src/services/translate/niutrans/Config.jsx → src/service…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/niutrans/index.jsx → src/services/translate/niutrans/Config.jsx → src/services/translate/niutrans/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/niutrans/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/ollama/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/ollama/index.jsx → src/services/translate/ollama/Config.jsx → src/services/tr…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/ollama/index.jsx → src/services/translate/ollama/Config.jsx → src/services/translate/ollama/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/ollama/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/openai/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/openai/index.jsx → src/services/translate/openai/Config.jsx → src/services/tr…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/openai/index.jsx → src/services/translate/openai/Config.jsx → src/services/translate/openai/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/openai/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/tencent/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/tencent/index.jsx → src/services/translate/tencent/Config.jsx → src/services/…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/tencent/index.jsx → src/services/translate/tencent/Config.jsx → src/services/translate/tencent/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/tencent/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/transmart/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/transmart/index.jsx → src/services/translate/transmart/Config.jsx → src/servi…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/transmart/index.jsx → src/services/translate/transmart/Config.jsx → src/services/translate/transmart/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/transmart/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/volcengine/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/volcengine/index.jsx → src/services/translate/volcengine/Config.jsx → src/ser…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/volcengine/index.jsx → src/services/translate/volcengine/Config.jsx → src/services/translate/volcengine/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/volcengine/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/translate/youdao/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/translate/youdao/index.jsx → src/services/translate/youdao/Config.jsx → src/services/tr…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/translate/youdao/index.jsx → src/services/translate/youdao/Config.jsx → src/services/translate/youdao/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/translate/youdao/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/services/tts/lingva/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/services/tts/lingva/index.jsx → src/services/tts/lingva/Config.jsx → src/services/tts/lingva/ind…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/services/tts/lingva/index.jsx → src/services/tts/lingva/Config.jsx → src/services/tts/lingva/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/services/tts/lingva/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "cycle",
      "file": "src/window/Recognize/ControlArea/index.jsx",
      "line": null,
      "message": "Cycle detected (length 2): src/window/Recognize/ControlArea/index.jsx → src/window/Recognize/TextArea/index.jsx → src/window/Re…",
      "metric": "cycle len 2",
      "effort": "medium",
      "scoreUplift": 6,
      "cyclePath": "src/window/Recognize/ControlArea/index.jsx → src/window/Recognize/TextArea/index.jsx → src/window/Recognize/ControlArea/index.jsx",
      "recommendations": [
        "Extract shared dependency into a lower-level module.",
        "Invert one edge via DI / event bus / callback registry.",
        "For TS: use `import type` to split runtime vs type cycles.",
        "Break the edge from src/window/Recognize/ControlArea/index.jsx first — highest hotspot."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "yarn.lock",
      "line": 1,
      "message": "File exceeds 1000 LOC (5262 lines) — split candidate",
      "metric": "5262 LOC",
      "effort": "high",
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility into cohesive submodules and re-export from a barrel index.",
        "Move pure helpers into a sibling utils file and unit-test in isolation.",
        "Add a LOC budget to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "depth",
      "file": "src/App.jsx",
      "line": 1,
      "message": "Max depth 12 — deep coupling chain",
      "metric": "depth 12",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Flatten by grouping intermediate layers into a façade.",
        "Hoist shared utilities to a top-level lib/."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "hotspot",
      "file": "src/hooks/index.jsx",
      "line": 1,
      "message": "Hotspot score 12.5 — high size+coupling combo",
      "metric": "hotspot 12.5",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split the file by responsibility.",
        "Introduce a façade for callers.",
        "Add a CODEOWNERS entry + PR-size guardrail."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "hotspot",
      "file": "src/hooks/useConfig.jsx",
      "line": 1,
      "message": "Hotspot score 6.93 — high size+coupling combo",
      "metric": "hotspot 6.93",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split the file by responsibility.",
        "Introduce a façade for callers.",
        "Add a CODEOWNERS entry + PR-size guardrail."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "depth",
      "file": "src/main.jsx",
      "line": 1,
      "message": "Max depth 13 — deep coupling chain",
      "metric": "depth 13",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Flatten by grouping intermediate layers into a façade.",
        "Hoist shared utilities to a top-level lib/."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "coupling",
      "file": "src/services/translate/index.jsx",
      "line": 1,
      "message": "High fan-out (21) — god object candidate",
      "metric": "fan-out 21",
      "effort": "high",
      "scoreUplift": 6,
      "recommendations": [
        "Cluster dependents by domain and split into façades.",
        "Apply Interface Segregation Principle.",
        "Add module-boundary lint (dependency-cruiser)."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "hotspot",
      "file": "src/utils/service_instance.ts",
      "line": 1,
      "message": "Hotspot score 10.63 — high size+coupling combo",
      "metric": "hotspot 10.63",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split the file by responsibility.",
        "Introduce a façade for callers.",
        "Add a CODEOWNERS entry + PR-size guardrail."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "depth",
      "file": "src/window/Config/index.jsx",
      "line": 1,
      "message": "Max depth 11 — deep coupling chain",
      "metric": "depth 11",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Flatten by grouping intermediate layers into a façade.",
        "Hoist shared utilities to a top-level lib/."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "depth",
      "file": "src/window/Config/pages/Service/index.jsx",
      "line": 1,
      "message": "Max depth 9 — deep coupling chain",
      "metric": "depth 9",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Flatten by grouping intermediate layers into a façade.",
        "Hoist shared utilities to a top-level lib/."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "depth",
      "file": "src/window/Config/pages/Service/Recognize/index.jsx",
      "line": 1,
      "message": "Max depth 8 — deep coupling chain",
      "metric": "depth 8",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Flatten by grouping intermediate layers into a façade.",
        "Hoist shared utilities to a top-level lib/."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "depth",
      "file": "src/window/Config/routes/index.jsx",
      "line": 1,
      "message": "Max depth 10 — deep coupling chain",
      "metric": "depth 10",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Flatten by grouping intermediate layers into a façade.",
        "Hoist shared utilities to a top-level lib/."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "depth",
      "file": "src/window/Recognize/ControlArea/index.jsx",
      "line": 1,
      "message": "Max depth 8 — deep coupling chain",
      "metric": "depth 8",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Flatten by grouping intermediate layers into a façade.",
        "Hoist shared utilities to a top-level lib/."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "depth",
      "file": "src/window/Recognize/index.jsx",
      "line": 1,
      "message": "Max depth 9 — deep coupling chain",
      "metric": "depth 9",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Flatten by grouping intermediate layers into a façade.",
        "Hoist shared utilities to a top-level lib/."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "depth",
      "file": "src/window/Translate/components/LanguageArea/index.jsx",
      "line": 1,
      "message": "Max depth 8 — deep coupling chain",
      "metric": "depth 8",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Flatten by grouping intermediate layers into a façade.",
        "Hoist shared utilities to a top-level lib/."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "depth",
      "file": "src/window/Translate/components/TargetArea/index.jsx",
      "line": 1,
      "message": "Max depth 9 — deep coupling chain",
      "metric": "depth 9",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Flatten by grouping intermediate layers into a façade.",
        "Hoist shared utilities to a top-level lib/."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "depth",
      "file": "src/window/Translate/index.jsx",
      "line": 1,
      "message": "Max depth 10 — deep coupling chain",
      "metric": "depth 10",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Flatten by grouping intermediate layers into a façade.",
        "Hoist shared utilities to a top-level lib/."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "asset/1.png",
      "line": null,
      "message": "Orphan file: 0 inbound references (211 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- asset/1.png` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "asset/3.png",
      "line": null,
      "message": "Orphan file: 0 inbound references (115 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- asset/3.png` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "asset/eg2.gif",
      "line": null,
      "message": "Orphan file: 0 inbound references (4389 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- asset/eg2.gif` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "asset/eg3.gif",
      "line": null,
      "message": "Orphan file: 0 inbound references (6885 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- asset/eg3.gif` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "asset/eg4.gif",
      "line": null,
      "message": "Orphan file: 0 inbound references (6793 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- asset/eg4.gif` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "asset/eg6.gif",
      "line": null,
      "message": "Orphan file: 0 inbound references (3090 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- asset/eg6.gif` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "public/logo/simple_latex.png",
      "line": null,
      "message": "Orphan file: 0 inbound references (2288 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- public/logo/simple_latex.png` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "public/logo/tencent.svg",
      "line": 1,
      "message": "File exceeds 500 LOC (549 lines)",
      "metric": "549 LOC",
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
      "file": "public/logo/yandex.svg",
      "line": null,
      "message": "Orphan file: 0 inbound references (8308 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- public/logo/yandex.svg` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "public/tesseract-core-simd-lstm.wasm.js",
      "line": null,
      "message": "Orphan file: 0 inbound references (282 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- public/tesseract-core-simd-lstm.wasm.js` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src-tauri/icons_mac/icon.icns",
      "line": 1,
      "message": "File exceeds 500 LOC (740 lines)",
      "metric": "740 LOC",
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
      "file": "src-tauri/icons/icon.icns",
      "line": null,
      "message": "Orphan file: 0 inbound references (1112 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- src-tauri/icons/icon.icns` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "src-tauri/src/tray.rs",
      "line": 1,
      "message": "File exceeds 500 LOC (634 lines)",
      "metric": "634 LOC",
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
      "file": "src/window/Config/pages/General/index.jsx",
      "line": 1,
      "message": "File exceeds 500 LOC (605 lines)",
      "metric": "605 LOC",
      "effort": "medium",
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility into cohesive submodules.",
        "Add a LOC budget to lint or CI."
      ]
    }
  ],
  "summary": {
    "totalFiles": 316,
    "totalBytes": 17502092,
    "totalBytesHuman": "16.7 MB",
    "totalLines": 87160,
    "maxDepth": 13,
    "criticalCount": 43,
    "hotspotCount": 20,
    "cycleCount": 31,
    "staleCount": 0
  },
  "treemap": [
    {
      "name": "asset/",
      "bytes": 15370652,
      "humanBytes": "14.7 MB"
    },
    {
      "name": "public/",
      "bytes": 11691086,
      "humanBytes": "11.1 MB"
    },
    {
      "name": "src-tauri/",
      "bytes": 5332018,
      "humanBytes": "5.1 MB"
    },
    {
      "name": "public/logo/",
      "bytes": 3438394,
      "humanBytes": "3.3 MB"
    },
    {
      "name": "src-tauri/icons/",
      "bytes": 2377172,
      "humanBytes": "2.3 MB"
    },
    {
      "name": "src-tauri/icons_mac/",
      "bytes": 1789628,
      "humanBytes": "1.7 MB"
    },
    {
      "name": "src/",
      "bytes": 1442878,
      "humanBytes": "1.4 MB"
    },
    {
      "name": "src/window/",
      "bytes": 667334,
      "humanBytes": "651.7 KB"
    },
    {
      "name": "src/services/",
      "bytes": 656052,
      "humanBytes": "640.7 KB"
    },
    {
      "name": "src-tauri/resources/",
      "bytes": 551826,
      "humanBytes": "538.9 KB"
    }
  ],
  "types": [
    {
      "type": ".gif",
      "fileCount": 6,
      "pctFiles": 1.9,
      "totalBytes": 5330233,
      "totalBytesHuman": "5.1 MB",
      "pctBytes": 30.5,
      "totalLines": 24980
    },
    {
      "type": ".js",
      "fileCount": 9,
      "pctFiles": 2.8,
      "totalBytes": 4076916,
      "totalBytesHuman": "3.9 MB",
      "pctBytes": 23.3,
      "totalLines": 738
    },
    {
      "type": ".png",
      "fileCount": 41,
      "pctFiles": 13,
      "totalBytes": 4041469,
      "totalBytesHuman": "3.9 MB",
      "pctBytes": 23.1,
      "totalLines": 5972
    },
    {
      "type": ".icns",
      "fileCount": 2,
      "pctFiles": 0.6,
      "totalBytes": 1052796,
      "totalBytesHuman": "1.0 MB",
      "pctBytes": 6,
      "totalLines": 1852
    },
    {
      "type": ".svg",
      "fileCount": 22,
      "pctFiles": 7,
      "totalBytes": 808036,
      "totalBytesHuman": "789.1 KB",
      "pctBytes": 4.6,
      "totalLines": 10032
    },
    {
      "type": ".jsx",
      "fileCount": 141,
      "pctFiles": 44.6,
      "totalBytes": 657061,
      "totalBytesHuman": "641.7 KB",
      "pctBytes": 3.8,
      "totalLines": 16302
    },
    {
      "type": ".lock",
      "fileCount": 2,
      "pctFiles": 0.6,
      "totalBytes": 464474,
      "totalBytesHuman": "453.6 KB",
      "pctBytes": 2.7,
      "totalLines": 13895
    },
    {
      "type": ".ico",
      "fileCount": 4,
      "pctFiles": 1.3,
      "totalBytes": 296534,
      "totalBytesHuman": "289.6 KB",
      "pctBytes": 1.7,
      "totalLines": 698
    },
    {
      "type": ".yaml",
      "fileCount": 1,
      "pctFiles": 0.3,
      "totalBytes": 287880,
      "totalBytesHuman": "281.1 KB",
      "pctBytes": 1.6,
      "totalLines": 6657
    },
    {
      "type": "(none)",
      "fileCount": 7,
      "pctFiles": 2.2,
      "totalBytes": 276351,
      "totalBytesHuman": "269.9 KB",
      "pctBytes": 1.6,
      "totalLines": 287
    },
    {
      "type": ".rs",
      "fileCount": 15,
      "pctFiles": 4.7,
      "totalBytes": 84685,
      "totalBytesHuman": "82.7 KB",
      "pctBytes": 0.5,
      "totalLines": 2406
    },
    {
      "type": ".json",
      "fileCount": 11,
      "pctFiles": 3.5,
      "totalBytes": 44409,
      "totalBytesHuman": "43.4 KB",
      "pctBytes": 0.3,
      "totalLines": 1192
    },
    {
      "type": ".ts",
      "fileCount": 41,
      "pctFiles": 13,
      "totalBytes": 20768,
      "totalBytesHuman": "20.3 KB",
      "pctBytes": 0.1,
      "totalLines": 1183
    },
    {
      "type": ".webp",
      "fileCount": 1,
      "pctFiles": 0.3,
      "totalBytes": 20766,
      "totalBytesHuman": "20.3 KB",
      "pctBytes": 0.1,
      "totalLines": 87
    },
    {
      "type": ".xml",
      "fileCount": 1,
      "pctFiles": 0.3,
      "totalBytes": 12978,
      "totalBytesHuman": "12.7 KB",
      "pctBytes": 0.1,
      "totalLines": 238
    },
    {
      "type": ".md",
      "fileCount": 2,
      "pctFiles": 0.6,
      "totalBytes": 11701,
      "totalBytesHuman": "11.4 KB",
      "pctBytes": 0.1,
      "totalLines": 207
    },
    {
      "type": ".mjs",
      "fileCount": 2,
      "pctFiles": 0.6,
      "totalBytes": 7395,
      "totalBytesHuman": "7.2 KB",
      "pctBytes": 0,
      "totalLines": 176
    },
    {
      "type": ".cjs",
      "fileCount": 1,
      "pctFiles": 0.3,
      "totalBytes": 2619,
      "totalBytesHuman": "2.6 KB",
      "pctBytes": 0,
      "totalLines": 77
    },
    {
      "type": ".toml",
      "fileCount": 1,
      "pctFiles": 0.3,
      "totalBytes": 2548,
      "totalBytesHuman": "2.5 KB",
      "pctBytes": 0,
      "totalLines": 59
    },
    {
      "type": ".patch",
      "fileCount": 1,
      "pctFiles": 0.3,
      "totalBytes": 1091,
      "totalBytesHuman": "1.1 KB",
      "pctBytes": 0,
      "totalLines": 39
    },
    {
      "type": ".html",
      "fileCount": 2,
      "pctFiles": 0.6,
      "totalBytes": 829,
      "totalBytesHuman": "829 B",
      "pctBytes": 0,
      "totalLines": 45
    },
    {
      "type": ".css",
      "fileCount": 3,
      "pctFiles": 0.9,
      "totalBytes": 553,
      "totalBytesHuman": "553 B",
      "pctBytes": 0,
      "totalLines": 38
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
      "count": 132,
      "pctFiles": 41.8
    },
    {
      "bucket": "51-100",
      "count": 59,
      "pctFiles": 18.7
    },
    {
      "bucket": "101-250",
      "count": 91,
      "pctFiles": 28.8
    },
    {
      "bucket": "251-500",
      "count": 18,
      "pctFiles": 5.7
    },
    {
      "bucket": "501-1000",
      "count": 4,
      "pctFiles": 1.3
    },
    {
      "bucket": "1001-2000",
      "count": 2,
      "pctFiles": 0.6
    },
    {
      "bucket": "2000+",
      "count": 10,
      "pctFiles": 3.2
    }
  ],
  "largest": [
    {
      "path": "public/tesseract-core-simd-lstm.wasm.js",
      "bytes": 3938114,
      "bytesHuman": "3.8 MB",
      "lines": 282,
      "type": ".js",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/eg4.gif",
      "bytes": 1506035,
      "bytesHuman": "1.4 MB",
      "lines": 6793,
      "type": ".gif",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/eg3.gif",
      "bytes": 1390562,
      "bytesHuman": "1.3 MB",
      "lines": 6885,
      "type": ".gif",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/1.png",
      "bytes": 1108203,
      "bytesHuman": "1.1 MB",
      "lines": 211,
      "type": ".png",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/3.png",
      "bytes": 1108203,
      "bytesHuman": "1.1 MB",
      "lines": 115,
      "type": ".png",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/eg2.gif",
      "bytes": 951922,
      "bytesHuman": "929.6 KB",
      "lines": 4389,
      "type": ".gif",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "public/logo/simple_latex.png",
      "bytes": 651647,
      "bytesHuman": "636.4 KB",
      "lines": 2288,
      "type": ".png",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/eg6.gif",
      "bytes": 650295,
      "bytesHuman": "635.1 KB",
      "lines": 3090,
      "type": ".gif",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src-tauri/icons/icon.icns",
      "bytes": 648018,
      "bytesHuman": "632.8 KB",
      "lines": 1112,
      "type": ".icns",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "public/logo/yandex.svg",
      "bytes": 639804,
      "bytesHuman": "624.8 KB",
      "lines": 8308,
      "type": ".svg",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/eg1.gif",
      "bytes": 540046,
      "bytesHuman": "527.4 KB",
      "lines": 2397,
      "type": ".gif",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src-tauri/icons_mac/icon.icns",
      "bytes": 404778,
      "bytesHuman": "395.3 KB",
      "lines": 740,
      "type": ".icns",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/eg5.gif",
      "bytes": 291373,
      "bytesHuman": "284.5 KB",
      "lines": 1426,
      "type": ".gif",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "pnpm-lock.yaml",
      "bytes": 287880,
      "bytesHuman": "281.1 KB",
      "lines": 6657,
      "type": ".yaml",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "yarn.lock",
      "bytes": 255070,
      "bytesHuman": "249.1 KB",
      "lines": 5262,
      "type": ".lock",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src-tauri/Cargo.lock",
      "bytes": 209404,
      "bytesHuman": "204.5 KB",
      "lines": 8633,
      "type": ".lock",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src-tauri/resources/ocr-x86_64-apple-darwin",
      "bytes": 141393,
      "bytesHuman": "138.1 KB",
      "lines": 131,
      "type": "",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src-tauri/resources/ocr-aarch64-apple-darwin",
      "bytes": 134520,
      "bytesHuman": "131.4 KB",
      "lines": 115,
      "type": "",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "public/worker.min.js",
      "bytes": 126321,
      "bytesHuman": "123.4 KB",
      "lines": 3,
      "type": ".js",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src-tauri/icons/icon.png",
      "bytes": 107135,
      "bytesHuman": "104.6 KB",
      "lines": 202,
      "type": ".png",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    }
  ],
  "fanin": [
    {
      "path": "src/hooks/index.jsx",
      "fanIn": 58,
      "fanOut": 5,
      "extDeps": 0,
      "lines": 6,
      "type": ".jsx"
    },
    {
      "path": "src/hooks/useConfig.jsx",
      "fanIn": 32,
      "fanOut": 3,
      "extDeps": 2,
      "lines": 68,
      "type": ".jsx"
    },
    {
      "path": "src/utils/env.js",
      "fanIn": 21,
      "fanOut": 0,
      "extDeps": 2,
      "lines": 15,
      "type": ".js"
    },
    {
      "path": "src/utils/store.js",
      "fanIn": 8,
      "fanOut": 0,
      "extDeps": 4,
      "lines": 17,
      "type": ".js"
    },
    {
      "path": "src/services/collection/index.jsx",
      "fanIn": 6,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 6,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/index.jsx",
      "fanIn": 6,
      "fanOut": 15,
      "extDeps": 0,
      "lines": 32,
      "type": ".jsx"
    },
    {
      "path": "src/services/translate/index.jsx",
      "fanIn": 6,
      "fanOut": 21,
      "extDeps": 0,
      "lines": 44,
      "type": ".jsx"
    },
    {
      "path": "src/services/tts/index.jsx",
      "fanIn": 5,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 4,
      "type": ".jsx"
    },
    {
      "path": "src/utils/invoke_plugin.js",
      "fanIn": 4,
      "fanOut": 1,
      "extDeps": 6,
      "lines": 36,
      "type": ".js"
    },
    {
      "path": "src/window/Config/pages/Service/PluginConfig/index.jsx",
      "fanIn": 4,
      "fanOut": 2,
      "extDeps": 8,
      "lines": 149,
      "type": ".jsx"
    },
    {
      "path": "src/window/Config/pages/Service/SelectPluginModal/index.jsx",
      "fanIn": 4,
      "fanOut": 2,
      "extDeps": 10,
      "lines": 152,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/iflytek/index.jsx",
      "fanIn": 3,
      "fanOut": 2,
      "extDeps": 2,
      "lines": 114,
      "type": ".jsx"
    },
    {
      "path": "src/window/Translate/components/SourceArea/index.jsx",
      "fanIn": 3,
      "fanOut": 7,
      "extDeps": 8,
      "lines": 371,
      "type": ".jsx"
    },
    {
      "path": "src/components/WindowControl/index.jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 5,
      "lines": 58,
      "type": ".jsx"
    },
    {
      "path": "src/hooks/useGetState.jsx",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 10,
      "type": ".jsx"
    },
    {
      "path": "src/services/collection/anki/index.jsx",
      "fanIn": 2,
      "fanOut": 3,
      "extDeps": 1,
      "lines": 111,
      "type": ".jsx"
    },
    {
      "path": "src/services/collection/eudic/index.jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "lines": 73,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/baidu_accurate/index.jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "lines": 65,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/baidu_img/index.jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 4,
      "lines": 62,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/baidu/index.jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "lines": 65,
      "type": ".jsx"
    }
  ],
  "fanout": [
    {
      "path": "src/services/translate/index.jsx",
      "fanIn": 6,
      "fanOut": 21,
      "extDeps": 0,
      "lines": 44,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/index.jsx",
      "fanIn": 6,
      "fanOut": 15,
      "extDeps": 0,
      "lines": 32,
      "type": ".jsx"
    },
    {
      "path": "src/window/Translate/components/TargetArea/index.jsx",
      "fanIn": 1,
      "fanOut": 11,
      "extDeps": 16,
      "lines": 460,
      "type": ".jsx"
    },
    {
      "path": "src/App.jsx",
      "fanIn": 1,
      "fanOut": 9,
      "extDeps": 7,
      "lines": 118,
      "type": ".jsx"
    },
    {
      "path": "src/window/Config/pages/History/index.jsx",
      "fanIn": 1,
      "fanOut": 8,
      "extDeps": 11,
      "lines": 381,
      "type": ".jsx"
    },
    {
      "path": "src/window/Config/routes/index.jsx",
      "fanIn": 1,
      "fanOut": 8,
      "extDeps": 1,
      "lines": 52,
      "type": ".jsx"
    },
    {
      "path": "src/window/Config/pages/Backup/index.jsx",
      "fanIn": 1,
      "fanOut": 7,
      "extDeps": 15,
      "lines": 318,
      "type": ".jsx"
    },
    {
      "path": "src/window/Recognize/index.jsx",
      "fanIn": 1,
      "fanOut": 7,
      "extDeps": 9,
      "lines": 159,
      "type": ".jsx"
    },
    {
      "path": "src/window/Translate/components/SourceArea/index.jsx",
      "fanIn": 3,
      "fanOut": 7,
      "extDeps": 8,
      "lines": 371,
      "type": ".jsx"
    },
    {
      "path": "src/window/Config/index.jsx",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 5,
      "lines": 82,
      "type": ".jsx"
    },
    {
      "path": "src/window/Config/pages/Service/Collection/index.jsx",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 4,
      "lines": 147,
      "type": ".jsx"
    },
    {
      "path": "src/window/Config/pages/Service/Recognize/index.jsx",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 5,
      "lines": 159,
      "type": ".jsx"
    },
    {
      "path": "src/window/Config/pages/Service/Translate/index.jsx",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 5,
      "lines": 163,
      "type": ".jsx"
    },
    {
      "path": "src/window/Config/pages/Service/Tts/index.jsx",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 5,
      "lines": 156,
      "type": ".jsx"
    },
    {
      "path": "src/window/Recognize/ControlArea/index.jsx",
      "fanIn": 2,
      "fanOut": 6,
      "extDeps": 8,
      "lines": 181,
      "type": ".jsx"
    },
    {
      "path": "src/window/Recognize/TextArea/index.jsx",
      "fanIn": 2,
      "fanOut": 6,
      "extDeps": 9,
      "lines": 190,
      "type": ".jsx"
    },
    {
      "path": "src/window/Translate/index.jsx",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 11,
      "lines": 346,
      "type": ".jsx"
    },
    {
      "path": "src/hooks/index.jsx",
      "fanIn": 58,
      "fanOut": 5,
      "extDeps": 0,
      "lines": 6,
      "type": ".jsx"
    },
    {
      "path": "src/window/Config/pages/Service/index.jsx",
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 7,
      "lines": 94,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/baidu_accurate/Config.jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "lines": 132,
      "type": ".jsx"
    }
  ],
  "hotspots": [
    {
      "path": "src/hooks/index.jsx",
      "bytes": 157,
      "bytesHuman": "157 B",
      "lines": 6,
      "type": ".jsx",
      "fanIn": 58,
      "fanOut": 5,
      "maxDepth": 2,
      "score": 12.5
    },
    {
      "path": "src/utils/service_instance.ts",
      "bytes": 1745,
      "bytesHuman": "1.7 KB",
      "lines": 51,
      "type": ".ts",
      "fanIn": 53,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 10.63
    },
    {
      "path": "src/hooks/useConfig.jsx",
      "bytes": 1925,
      "bytesHuman": "1.9 KB",
      "lines": 68,
      "type": ".jsx",
      "fanIn": 32,
      "fanOut": 3,
      "maxDepth": 1,
      "score": 6.93
    },
    {
      "path": "src-tauri/Cargo.lock",
      "bytes": 209404,
      "bytesHuman": "204.5 KB",
      "lines": 8633,
      "type": ".lock",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.32
    },
    {
      "path": "src/services/translate/index.jsx",
      "bytes": 1537,
      "bytesHuman": "1.5 KB",
      "lines": 44,
      "type": ".jsx",
      "fanIn": 6,
      "fanOut": 21,
      "maxDepth": 5,
      "score": 4.32
    },
    {
      "path": "src/utils/env.js",
      "bytes": 381,
      "bytesHuman": "381 B",
      "lines": 15,
      "type": ".js",
      "fanIn": 21,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.21
    },
    {
      "path": "public/logo/yandex.svg",
      "bytes": 639804,
      "bytesHuman": "624.8 KB",
      "lines": 8308,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.15
    },
    {
      "path": "src/services/recognize/index.jsx",
      "bytes": 1445,
      "bytesHuman": "1.4 KB",
      "lines": 32,
      "type": ".jsx",
      "fanIn": 6,
      "fanOut": 15,
      "maxDepth": 6,
      "score": 3.92
    },
    {
      "path": "src/App.jsx",
      "bytes": 4122,
      "bytesHuman": "4.0 KB",
      "lines": 118,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 9,
      "maxDepth": 12,
      "score": 3.56
    },
    {
      "path": "asset/eg3.gif",
      "bytes": 1390562,
      "bytesHuman": "1.3 MB",
      "lines": 6885,
      "type": ".gif",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.44
    },
    {
      "path": "asset/eg4.gif",
      "bytes": 1506035,
      "bytesHuman": "1.4 MB",
      "lines": 6793,
      "type": ".gif",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.4
    },
    {
      "path": "pnpm-lock.yaml",
      "bytes": 287880,
      "bytesHuman": "281.1 KB",
      "lines": 6657,
      "type": ".yaml",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.33
    },
    {
      "path": "src/window/Translate/components/TargetArea/index.jsx",
      "bytes": 17480,
      "bytesHuman": "17.1 KB",
      "lines": 460,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 11,
      "maxDepth": 9,
      "score": 3.33
    },
    {
      "path": "src/window/Config/index.jsx",
      "bytes": 3017,
      "bytesHuman": "2.9 KB",
      "lines": 82,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 6,
      "maxDepth": 11,
      "score": 3.04
    },
    {
      "path": "src/window/Config/routes/index.jsx",
      "bytes": 1040,
      "bytesHuman": "1.0 KB",
      "lines": 52,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 8,
      "maxDepth": 10,
      "score": 3.03
    },
    {
      "path": "src/window/Translate/index.jsx",
      "bytes": 15384,
      "bytesHuman": "15.0 KB",
      "lines": 346,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 6,
      "maxDepth": 10,
      "score": 2.97
    },
    {
      "path": "src/main.jsx",
      "bytes": 817,
      "bytesHuman": "817 B",
      "lines": 29,
      "type": ".jsx",
      "fanIn": 0,
      "fanOut": 3,
      "maxDepth": 13,
      "score": 2.91
    },
    {
      "path": "src/window/Translate/components/SourceArea/index.jsx",
      "bytes": 13873,
      "bytesHuman": "13.5 KB",
      "lines": 371,
      "type": ".jsx",
      "fanIn": 3,
      "fanOut": 7,
      "maxDepth": 7,
      "score": 2.89
    },
    {
      "path": "src/window/Recognize/index.jsx",
      "bytes": 6057,
      "bytesHuman": "5.9 KB",
      "lines": 159,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 7,
      "maxDepth": 9,
      "score": 2.78
    },
    {
      "path": "src/window/Recognize/ControlArea/index.jsx",
      "bytes": 8353,
      "bytesHuman": "8.2 KB",
      "lines": 181,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 6,
      "maxDepth": 8,
      "score": 2.69
    }
  ],
  "orphans": [
    {
      "path": "public/tesseract-core-simd-lstm.wasm.js",
      "bytes": 3938114,
      "bytesHuman": "3.8 MB",
      "lines": 282,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.14
    },
    {
      "path": "asset/eg4.gif",
      "bytes": 1506035,
      "bytesHuman": "1.4 MB",
      "lines": 6793,
      "type": ".gif",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.4
    },
    {
      "path": "asset/eg3.gif",
      "bytes": 1390562,
      "bytesHuman": "1.3 MB",
      "lines": 6885,
      "type": ".gif",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.44
    },
    {
      "path": "asset/1.png",
      "bytes": 1108203,
      "bytesHuman": "1.1 MB",
      "lines": 211,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.11
    },
    {
      "path": "asset/3.png",
      "bytes": 1108203,
      "bytesHuman": "1.1 MB",
      "lines": 115,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.06
    },
    {
      "path": "asset/eg2.gif",
      "bytes": 951922,
      "bytesHuman": "929.6 KB",
      "lines": 4389,
      "type": ".gif",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 2.19
    },
    {
      "path": "public/logo/simple_latex.png",
      "bytes": 651647,
      "bytesHuman": "636.4 KB",
      "lines": 2288,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1.14
    },
    {
      "path": "asset/eg6.gif",
      "bytes": 650295,
      "bytesHuman": "635.1 KB",
      "lines": 3090,
      "type": ".gif",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1.55
    },
    {
      "path": "src-tauri/icons/icon.icns",
      "bytes": 648018,
      "bytesHuman": "632.8 KB",
      "lines": 1112,
      "type": ".icns",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.56
    },
    {
      "path": "public/logo/yandex.svg",
      "bytes": 639804,
      "bytesHuman": "624.8 KB",
      "lines": 8308,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.15
    },
    {
      "path": "asset/eg1.gif",
      "bytes": 540046,
      "bytesHuman": "527.4 KB",
      "lines": 2397,
      "type": ".gif",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1.2
    },
    {
      "path": "src-tauri/icons_mac/icon.icns",
      "bytes": 404778,
      "bytesHuman": "395.3 KB",
      "lines": 740,
      "type": ".icns",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.37
    },
    {
      "path": "asset/eg5.gif",
      "bytes": 291373,
      "bytesHuman": "284.5 KB",
      "lines": 1426,
      "type": ".gif",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.71
    },
    {
      "path": "pnpm-lock.yaml",
      "bytes": 287880,
      "bytesHuman": "281.1 KB",
      "lines": 6657,
      "type": ".yaml",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.33
    },
    {
      "path": "yarn.lock",
      "bytes": 255070,
      "bytesHuman": "249.1 KB",
      "lines": 5262,
      "type": ".lock",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 2.63
    },
    {
      "path": "src-tauri/Cargo.lock",
      "bytes": 209404,
      "bytesHuman": "204.5 KB",
      "lines": 8633,
      "type": ".lock",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.32
    },
    {
      "path": "src-tauri/resources/ocr-x86_64-apple-darwin",
      "bytes": 141393,
      "bytesHuman": "138.1 KB",
      "lines": 131,
      "type": "",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.07
    },
    {
      "path": "src-tauri/resources/ocr-aarch64-apple-darwin",
      "bytes": 134520,
      "bytesHuman": "131.4 KB",
      "lines": 115,
      "type": "",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.06
    },
    {
      "path": "public/worker.min.js",
      "bytes": 126321,
      "bytesHuman": "123.4 KB",
      "lines": 3,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0
    },
    {
      "path": "src-tauri/icons/icon.png",
      "bytes": 107135,
      "bytesHuman": "104.6 KB",
      "lines": 202,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.1
    }
  ],
  "depthStats": {
    "max": 13,
    "mean": 3.51,
    "median": 3,
    "p90": 7,
    "filesAtMax": 1
  },
  "depthRanking": [
    {
      "path": "src/main.jsx",
      "bytes": 817,
      "bytesHuman": "817 B",
      "lines": 29,
      "type": ".jsx",
      "fanIn": 0,
      "fanOut": 3,
      "maxDepth": 13,
      "score": 0
    },
    {
      "path": "src/App.jsx",
      "bytes": 4122,
      "bytesHuman": "4.0 KB",
      "lines": 118,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 9,
      "maxDepth": 12,
      "score": 0
    },
    {
      "path": "src/window/Config/index.jsx",
      "bytes": 3017,
      "bytesHuman": "2.9 KB",
      "lines": 82,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 6,
      "maxDepth": 11,
      "score": 0
    },
    {
      "path": "src/window/Config/routes/index.jsx",
      "bytes": 1040,
      "bytesHuman": "1.0 KB",
      "lines": 52,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 8,
      "maxDepth": 10,
      "score": 0
    },
    {
      "path": "src/window/Translate/index.jsx",
      "bytes": 15384,
      "bytesHuman": "15.0 KB",
      "lines": 346,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 6,
      "maxDepth": 10,
      "score": 0
    },
    {
      "path": "src/window/Config/pages/Service/index.jsx",
      "bytes": 3543,
      "bytesHuman": "3.5 KB",
      "lines": 94,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 5,
      "maxDepth": 9,
      "score": 0
    },
    {
      "path": "src/window/Recognize/index.jsx",
      "bytes": 6057,
      "bytesHuman": "5.9 KB",
      "lines": 159,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 7,
      "maxDepth": 9,
      "score": 0
    },
    {
      "path": "src/window/Translate/components/TargetArea/index.jsx",
      "bytes": 17480,
      "bytesHuman": "17.1 KB",
      "lines": 460,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 11,
      "maxDepth": 9,
      "score": 0
    },
    {
      "path": "src/window/Config/pages/Service/Recognize/index.jsx",
      "bytes": 7093,
      "bytesHuman": "6.9 KB",
      "lines": 159,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 6,
      "maxDepth": 8,
      "score": 0
    },
    {
      "path": "src/window/Recognize/ControlArea/index.jsx",
      "bytes": 8353,
      "bytesHuman": "8.2 KB",
      "lines": 181,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 6,
      "maxDepth": 8,
      "score": 0
    },
    {
      "path": "src/window/Translate/components/LanguageArea/index.jsx",
      "bytes": 5748,
      "bytesHuman": "5.6 KB",
      "lines": 129,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 3,
      "maxDepth": 8,
      "score": 0
    },
    {
      "path": "src/window/Config/pages/Service/Collection/index.jsx",
      "bytes": 6706,
      "bytesHuman": "6.5 KB",
      "lines": 147,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 6,
      "maxDepth": 7,
      "score": 0
    },
    {
      "path": "src/window/Config/pages/Service/Recognize/ConfigModal/index.jsx",
      "bytes": 3843,
      "bytesHuman": "3.8 KB",
      "lines": 91,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "maxDepth": 7,
      "score": 0
    },
    {
      "path": "src/window/Config/pages/Service/Recognize/SelectModal/index.jsx",
      "bytes": 3059,
      "bytesHuman": "3.0 KB",
      "lines": 67,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 3,
      "maxDepth": 7,
      "score": 0
    },
    {
      "path": "src/window/Config/pages/Service/Recognize/ServiceItem/index.jsx",
      "bytes": 4150,
      "bytesHuman": "4.1 KB",
      "lines": 100,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "maxDepth": 7,
      "score": 0
    },
    {
      "path": "src/window/Config/pages/Service/Translate/index.jsx",
      "bytes": 7158,
      "bytesHuman": "7.0 KB",
      "lines": 163,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 6,
      "maxDepth": 7,
      "score": 0
    },
    {
      "path": "src/window/Config/pages/Service/Tts/index.jsx",
      "bytes": 6975,
      "bytesHuman": "6.8 KB",
      "lines": 156,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 6,
      "maxDepth": 7,
      "score": 0
    },
    {
      "path": "src/window/Recognize/TextArea/index.jsx",
      "bytes": 7862,
      "bytesHuman": "7.7 KB",
      "lines": 190,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 6,
      "maxDepth": 7,
      "score": 0
    },
    {
      "path": "src/window/Translate/components/SourceArea/index.jsx",
      "bytes": 13873,
      "bytesHuman": "13.5 KB",
      "lines": 371,
      "type": ".jsx",
      "fanIn": 3,
      "fanOut": 7,
      "maxDepth": 7,
      "score": 0
    },
    {
      "path": "src/services/recognize/index.jsx",
      "bytes": 1445,
      "bytesHuman": "1.4 KB",
      "lines": 32,
      "type": ".jsx",
      "fanIn": 6,
      "fanOut": 15,
      "maxDepth": 6,
      "score": 0
    }
  ],
  "cycles": [
    {
      "severity": "critical",
      "path": "src/services/collection/anki/index.jsx → src/services/collection/anki/Config.jsx → src/services/collection/anki/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/collection/eudic/index.jsx → src/services/collection/eudic/Config.jsx → src/services/collection/eudic/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/recognize/baidu_accurate/index.jsx → src/services/recognize/baidu_accurate/Config.jsx → src/services/recognize/baidu_accurate/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/recognize/baidu_img/index.jsx → src/services/recognize/baidu_img/Config.jsx → src/services/recognize/baidu_img/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/recognize/baidu/index.jsx → src/services/recognize/baidu/Config.jsx → src/services/recognize/baidu/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/recognize/iflytek_intsig/index.jsx → src/services/recognize/iflytek_intsig/Config.jsx → src/services/recognize/iflytek_intsig/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/recognize/iflytek_latex/index.jsx → src/services/recognize/iflytek_latex/Config.jsx → src/services/recognize/iflytek_latex/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/recognize/iflytek/index.jsx → src/services/recognize/iflytek/Config.jsx → src/services/recognize/iflytek/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/recognize/simple_latex/index.jsx → src/services/recognize/simple_latex/Config.jsx → src/services/recognize/simple_latex/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/recognize/tencent_accurate/index.jsx → src/services/recognize/tencent_accurate/Config.jsx → src/services/recognize/tencent_accurate/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/recognize/tencent_img/index.jsx → src/services/recognize/tencent_img/Config.jsx → src/services/recognize/tencent_img/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/recognize/tencent/index.jsx → src/services/recognize/tencent/Config.jsx → src/services/recognize/tencent/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/recognize/volcengine_multi_lang/index.jsx → src/services/recognize/volcengine_multi_lang/Config.jsx → src/services/recognize/volcengine_multi_lang/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/recognize/volcengine/index.jsx → src/services/recognize/volcengine/Config.jsx → src/services/recognize/volcengine/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/alibaba/index.jsx → src/services/translate/alibaba/Config.jsx → src/services/translate/alibaba/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/baidu_field/index.jsx → src/services/translate/baidu_field/Config.jsx → src/services/translate/baidu_field/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/baidu/index.jsx → src/services/translate/baidu/Config.jsx → src/services/translate/baidu/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/caiyun/index.jsx → src/services/translate/caiyun/Config.jsx → src/services/translate/caiyun/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/chatglm/index.jsx → src/services/translate/chatglm/Config.jsx → src/services/translate/chatglm/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/deepl/index.jsx → src/services/translate/deepl/Config.jsx → src/services/translate/deepl/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/geminipro/index.jsx → src/services/translate/geminipro/Config.jsx → src/services/translate/geminipro/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/google/index.jsx → src/services/translate/google/Config.jsx → src/services/translate/google/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/niutrans/index.jsx → src/services/translate/niutrans/Config.jsx → src/services/translate/niutrans/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/ollama/index.jsx → src/services/translate/ollama/Config.jsx → src/services/translate/ollama/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/openai/index.jsx → src/services/translate/openai/Config.jsx → src/services/translate/openai/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/tencent/index.jsx → src/services/translate/tencent/Config.jsx → src/services/translate/tencent/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/transmart/index.jsx → src/services/translate/transmart/Config.jsx → src/services/translate/transmart/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/volcengine/index.jsx → src/services/translate/volcengine/Config.jsx → src/services/translate/volcengine/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/translate/youdao/index.jsx → src/services/translate/youdao/Config.jsx → src/services/translate/youdao/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/services/tts/lingva/index.jsx → src/services/tts/lingva/Config.jsx → src/services/tts/lingva/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    },
    {
      "severity": "critical",
      "path": "src/window/Recognize/ControlArea/index.jsx → src/window/Recognize/TextArea/index.jsx → src/window/Recognize/ControlArea/index.jsx",
      "length": 2,
      "suggestedFix": "extract shared interface/types to break the edge"
    }
  ],
  "freshness": [],
  "freshnessBuckets": [
    {
      "bucket": "<30d",
      "count": 316,
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
    "asOf": 1784854844000,
    "asOfHuman": "2026-07-24",
    "maxAge": 0,
    "median": 0,
    "p90": 0,
    "staleCount": 0,
    "criticalCount": 0
  },
  "selfImprovement": {
    "topP0": [
      {
        "action": "File exceeds 1000 LOC (2397 lines) — split candidate",
        "file": "asset/eg1.gif",
        "line": 1,
        "severity": "P0"
      },
      {
        "action": "File exceeds 1000 LOC (4389 lines) — split candidate",
        "file": "asset/eg2.gif",
        "line": 1,
        "severity": "P0"
      },
      {
        "action": "File exceeds 1000 LOC (6885 lines) — split candidate",
        "file": "asset/eg3.gif",
        "line": 1,
        "severity": "P0"
      },
      {
        "action": "File exceeds 1000 LOC (6793 lines) — split candidate",
        "file": "asset/eg4.gif",
        "line": 1,
        "severity": "P0"
      },
      {
        "action": "File exceeds 1000 LOC (1426 lines) — split candidate",
        "file": "asset/eg5.gif",
        "line": 1,
        "severity": "P0"
      }
    ],
    "focusArea": {
      "dimName": "Coupling",
      "score": 0,
      "why": "Lowest-scoring risk dimension drives overall health drag.",
      "hint": "Invest 2-3 days addressing top alerts in this dimension. Expected uplift: +10-15 pts."
    },
    "trendInsight": "Score 0/100 at generation. 43 P0 alerts require immediate attention.",
    "weightsHint": "Weights follow methodology.md Stage 3.6. Coupling and Staleness carry 0.20 each.",
    "narrative": [
      "Overall health at 0/100 — high risk.",
      "43 critical (P0), 15 major (P1), 14 minor (P2) alerts active.",
      "Top lever: Refactor src/hooks/index.jsx (hotspot 12.5, 6 LOC, fan-out 5) (+20 pts).",
      "Score 0 | gap 80 pts to next grade | decay risk without action: -2 pts/quarter"
    ],
    "severityDonut": {
      "p0": 43,
      "p1": 15,
      "p2": 14,
      "total": 72
    },
    "riskVectors": [
      {
        "dimension": "Depth",
        "score": 35,
        "weight": 0.15,
        "p0": 0,
        "p1": 11,
        "p2": 0
      },
      {
        "dimension": "Size",
        "score": 80,
        "weight": 0.2,
        "p0": 12,
        "p1": 0,
        "p2": 4
      },
      {
        "dimension": "Coupling",
        "score": 0,
        "weight": 0.2,
        "p0": 31,
        "p1": 1,
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
        "score": 0,
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
        "dimension": "Coupling",
        "severity": "P1",
        "kind": "refactor",
        "action": "Refactor src/hooks/index.jsx (hotspot 12.5, 6 LOC, fan-out 5)",
        "file": "src/hooks/index.jsx",
        "line": 1,
        "scoreUplift": 20,
        "effort": "medium"
      },
      {
        "rank": 2,
        "dimension": "Coupling",
        "severity": "P1",
        "kind": "refactor",
        "action": "Refactor src/utils/service_instance.ts (hotspot 10.63, 51 LOC, fan-out 0)",
        "file": "src/utils/service_instance.ts",
        "line": 1,
        "scoreUplift": 20,
        "effort": "medium"
      },
      {
        "rank": 3,
        "dimension": "Coupling",
        "severity": "P1",
        "kind": "refactor",
        "action": "Refactor src/hooks/useConfig.jsx (hotspot 6.93, 68 LOC, fan-out 3)",
        "file": "src/hooks/useConfig.jsx",
        "line": 1,
        "scoreUplift": 14,
        "effort": "medium"
      },
      {
        "rank": 4,
        "dimension": "Size",
        "severity": "P2",
        "kind": "refactor",
        "action": "Refactor src-tauri/Cargo.lock (hotspot 4.32, 8633 LOC, fan-out 0)",
        "file": "src-tauri/Cargo.lock",
        "line": 1,
        "scoreUplift": 9,
        "effort": "high"
      },
      {
        "rank": 5,
        "dimension": "Size",
        "severity": "P2",
        "kind": "refactor",
        "action": "Refactor src/services/translate/index.jsx (hotspot 4.32, 44 LOC, fan-out 21)",
        "file": "src/services/translate/index.jsx",
        "line": 1,
        "scoreUplift": 9,
        "effort": "medium"
      },
      {
        "rank": 6,
        "dimension": "Coupling",
        "severity": "P0",
        "kind": "refactor",
        "action": "Break cycle (len 2): src/services/collection/anki/index.jsx → src/services/collec…",
        "file": "src/services/collection/anki/index.jsx",
        "line": null,
        "scoreUplift": 6,
        "effort": "medium"
      },
      {
        "rank": 7,
        "dimension": "Coupling",
        "severity": "P0",
        "kind": "refactor",
        "action": "Break cycle (len 2): src/services/collection/eudic/index.jsx → src/services/colle…",
        "file": "src/services/collection/eudic/index.jsx",
        "line": null,
        "scoreUplift": 6,
        "effort": "medium"
      },
      {
        "rank": 8,
        "dimension": "Coupling",
        "severity": "P0",
        "kind": "refactor",
        "action": "Break cycle (len 2): src/services/recognize/baidu_accurate/index.jsx → src/servic…",
        "file": "src/services/recognize/baidu_accurate/index.jsx",
        "line": null,
        "scoreUplift": 6,
        "effort": "medium"
      }
    ],
    "benchmarks": {
      "currentGrade": "F",
      "currentValue": 0,
      "targetGrade": "F",
      "targetValue": 20,
      "gapToNext": 80
    },
    "remediationPlan": {
      "phases": [
        {
          "phase": "P0 Critical",
          "severity": "P0",
          "itemCount": 43,
          "estUplift": 258,
          "projected": 258,
          "deadline": "7 days"
        },
        {
          "phase": "P1 Major",
          "severity": "P1",
          "itemCount": 15,
          "estUplift": 60,
          "projected": 318,
          "deadline": "30 days"
        },
        {
          "phase": "P2 Minor",
          "severity": "P2",
          "itemCount": 14,
          "estUplift": 28,
          "projected": 346,
          "deadline": "90 days"
        }
      ],
      "currentScore": 0,
      "projectedScoreIfAllP0P1Remediated": 100
    },
    "decayForecast": {
      "currentScore": 0,
      "projectedNext": 0,
      "delta": -2,
      "rationale": "Without active remediation, coupling decay and staleness trend -2 pts/quarter on average."
    }
  },
  "records": [
    {
      "path": ".gitignore",
      "bytes": 218,
      "lines": 23,
      "type": "",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": ".node-version",
      "bytes": 2,
      "lines": 1,
      "type": "",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": ".npmrc",
      "bytes": 98,
      "lines": 5,
      "type": "",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": ".prettierignore",
      "bytes": 46,
      "lines": 7,
      "type": "",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": ".prettierrc.json",
      "bytes": 547,
      "lines": 22,
      "type": ".json",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "asset/1.png",
      "bytes": 1108203,
      "lines": 211,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "asset/2.png",
      "bytes": 48782,
      "lines": 173,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "asset/3.png",
      "bytes": 1108203,
      "lines": 115,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "asset/eg1.gif",
      "bytes": 540046,
      "lines": 2397,
      "type": ".gif",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "asset/eg2.gif",
      "bytes": 951922,
      "lines": 4389,
      "type": ".gif",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "asset/eg3.gif",
      "bytes": 1390562,
      "lines": 6885,
      "type": ".gif",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "asset/eg4.gif",
      "bytes": 1506035,
      "lines": 6793,
      "type": ".gif",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "asset/eg5.gif",
      "bytes": 291373,
      "lines": 1426,
      "type": ".gif",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "asset/eg6.gif",
      "bytes": 650295,
      "lines": 3090,
      "type": ".gif",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "asset/header.png",
      "bytes": 89905,
      "lines": 306,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "CLAUDE.md",
      "bytes": 3460,
      "lines": 66,
      "type": ".md",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "com.pot_app.pot.metainfo.xml",
      "bytes": 12978,
      "lines": 238,
      "type": ".xml",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "daemon.html",
      "bytes": 280,
      "lines": 17,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "index.html",
      "bytes": 549,
      "lines": 28,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "package.json",
      "bytes": 1997,
      "lines": 59,
      "type": ".json",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "patches/hyprland.patch",
      "bytes": 1091,
      "lines": 39,
      "type": ".patch",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "pnpm-lock.yaml",
      "bytes": 287880,
      "lines": 6657,
      "type": ".yaml",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "postcss.config.js",
      "bytes": 93,
      "lines": 7,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/icon.png",
      "bytes": 59964,
      "lines": 99,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/icon.svg",
      "bytes": 1947,
      "lines": 2,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/alibaba.svg",
      "bytes": 2751,
      "lines": 35,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/anki.svg",
      "bytes": 3223,
      "lines": 1,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/baidu.svg",
      "bytes": 2780,
      "lines": 1,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/bing.svg",
      "bytes": 1717,
      "lines": 1,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/caiyun.svg",
      "bytes": 4996,
      "lines": 64,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/cambridge_dict.svg",
      "bytes": 9284,
      "lines": 120,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/chatglm.png",
      "bytes": 21165,
      "lines": 168,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/Darwin.svg",
      "bytes": 1094,
      "lines": 9,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/deepl.svg",
      "bytes": 1652,
      "lines": 11,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/ecdict.svg",
      "bytes": 1456,
      "lines": 1,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/eudic.png",
      "bytes": 65381,
      "lines": 215,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/geminipro.webp",
      "bytes": 20766,
      "lines": 87,
      "type": ".webp",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/google.svg",
      "bytes": 1821,
      "lines": 1,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/iflytek.png",
      "bytes": 7894,
      "lines": 34,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/lingva.svg",
      "bytes": 9378,
      "lines": 189,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/Linux.svg",
      "bytes": 49982,
      "lines": 438,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/niutrans.svg",
      "bytes": 8027,
      "lines": 103,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/ollama.png",
      "bytes": 92041,
      "lines": 294,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/openai.svg",
      "bytes": 2667,
      "lines": 1,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/paddle.png",
      "bytes": 19316,
      "lines": 75,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/qrcode.svg",
      "bytes": 3208,
      "lines": 1,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/simple_latex.png",
      "bytes": 651647,
      "lines": 2288,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/tencent_cloud.png",
      "bytes": 26245,
      "lines": 228,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/tencent.svg",
      "bytes": 42313,
      "lines": 549,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/tesseract.png",
      "bytes": 8653,
      "lines": 46,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/transmart.svg",
      "bytes": 7245,
      "lines": 93,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/volcengine.svg",
      "bytes": 7817,
      "lines": 101,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/Windows_NT.svg",
      "bytes": 180,
      "lines": 2,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/yandex.svg",
      "bytes": 639804,
      "lines": 8308,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/logo/youdao.svg",
      "bytes": 4694,
      "lines": 1,
      "type": ".svg",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/tesseract-core-simd-lstm.wasm.js",
      "bytes": 3938114,
      "lines": 282,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "public/worker.min.js",
      "bytes": 126321,
      "lines": 3,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "README.md",
      "bytes": 8241,
      "lines": 141,
      "type": ".md",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/.gitignore",
      "bytes": 74,
      "lines": 5,
      "type": "",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/build.rs",
      "bytes": 39,
      "lines": 4,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/Cargo.lock",
      "bytes": 209404,
      "lines": 8633,
      "type": ".lock",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/Cargo.toml",
      "bytes": 2548,
      "lines": 59,
      "type": ".toml",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/128x128.png",
      "bytes": 18806,
      "lines": 65,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/128x128@2x.png",
      "bytes": 38609,
      "lines": 95,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/32x32.png",
      "bytes": 3555,
      "lines": 9,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/icon.icns",
      "bytes": 404778,
      "lines": 740,
      "type": ".icns",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/icon.ico",
      "bytes": 64229,
      "lines": 164,
      "type": ".ico",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/icon.png",
      "bytes": 86032,
      "lines": 166,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/Square107x107Logo.png",
      "bytes": 15580,
      "lines": 32,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/Square142x142Logo.png",
      "bytes": 20731,
      "lines": 44,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/Square150x150Logo.png",
      "bytes": 22206,
      "lines": 65,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/Square284x284Logo.png",
      "bytes": 42624,
      "lines": 97,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/Square30x30Logo.png",
      "bytes": 3344,
      "lines": 11,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/Square310x310Logo.png",
      "bytes": 48291,
      "lines": 139,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/Square44x44Logo.png",
      "bytes": 5260,
      "lines": 10,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/Square71x71Logo.png",
      "bytes": 9572,
      "lines": 13,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/Square89x89Logo.png",
      "bytes": 12684,
      "lines": 28,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/StoreLogo.png",
      "bytes": 6630,
      "lines": 19,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons_mac/tray.ico",
      "bytes": 91883,
      "lines": 187,
      "type": ".ico",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/128x128.png",
      "bytes": 21703,
      "lines": 46,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/128x128@2x.png",
      "bytes": 45424,
      "lines": 110,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/32x32.png",
      "bytes": 4292,
      "lines": 18,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/icon_mac.ico",
      "bytes": 64229,
      "lines": 164,
      "type": ".ico",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/icon.icns",
      "bytes": 648018,
      "lines": 1112,
      "type": ".icns",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/icon.ico",
      "bytes": 76193,
      "lines": 183,
      "type": ".ico",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/icon.png",
      "bytes": 107135,
      "lines": 202,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/Square107x107Logo.png",
      "bytes": 17854,
      "lines": 60,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/Square142x142Logo.png",
      "bytes": 24244,
      "lines": 69,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/Square150x150Logo.png",
      "bytes": 25386,
      "lines": 59,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/Square284x284Logo.png",
      "bytes": 51891,
      "lines": 107,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/Square30x30Logo.png",
      "bytes": 3965,
      "lines": 13,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/Square310x310Logo.png",
      "bytes": 57572,
      "lines": 138,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/Square44x44Logo.png",
      "bytes": 6472,
      "lines": 21,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/Square71x71Logo.png",
      "bytes": 11749,
      "lines": 25,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/Square89x89Logo.png",
      "bytes": 14811,
      "lines": 44,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/icons/StoreLogo.png",
      "bytes": 7648,
      "lines": 15,
      "type": ".png",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/resources/ocr-aarch64-apple-darwin",
      "bytes": 134520,
      "lines": 115,
      "type": "",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/resources/ocr-x86_64-apple-darwin",
      "bytes": 141393,
      "lines": 131,
      "type": "",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/backup.rs",
      "bytes": 8029,
      "lines": 210,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/clipboard.rs",
      "bytes": 1224,
      "lines": 34,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/cmd.rs",
      "bytes": 7288,
      "lines": 226,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/config.rs",
      "bytes": 6131,
      "lines": 189,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/error.rs",
      "bytes": 1284,
      "lines": 41,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/hotkey.rs",
      "bytes": 3073,
      "lines": 99,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/lang_detect.rs",
      "bytes": 2794,
      "lines": 87,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/main.rs",
      "bytes": 5234,
      "lines": 162,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/screenshot.rs",
      "bytes": 1102,
      "lines": 31,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/server.rs",
      "bytes": 2821,
      "lines": 96,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/system_ocr.rs",
      "bytes": 4836,
      "lines": 152,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/tray.rs",
      "bytes": 27079,
      "lines": 634,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/updater.rs",
      "bytes": 818,
      "lines": 29,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/window.rs",
      "bytes": 12933,
      "lines": 412,
      "type": ".rs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/tauri.conf.json",
      "bytes": 4110,
      "lines": 133,
      "type": ".json",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/tauri.linux.conf.json",
      "bytes": 136,
      "lines": 9,
      "type": ".json",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/tauri.macos.conf.json",
      "bytes": 478,
      "lines": 20,
      "type": ".json",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/tauri.windows.conf.json",
      "bytes": 798,
      "lines": 27,
      "type": ".json",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/webview.arm64.json",
      "bytes": 1489,
      "lines": 39,
      "type": ".json",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/webview.x64.json",
      "bytes": 1487,
      "lines": 39,
      "type": ".json",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src-tauri/webview.x86.json",
      "bytes": 1487,
      "lines": 39,
      "type": ".json",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/App.jsx",
      "bytes": 4122,
      "lines": 118,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 9,
      "extDeps": 7,
      "maxDepth": 12,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/components/WindowControl/index.jsx",
      "bytes": 1907,
      "lines": 58,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 5,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/components/WindowControl/style.css",
      "bytes": 66,
      "lines": 4,
      "type": ".css",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/hooks/index.jsx",
      "bytes": 157,
      "lines": 6,
      "type": ".jsx",
      "fanIn": 58,
      "fanOut": 5,
      "extDeps": 0,
      "maxDepth": 2,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/hooks/useConfig.jsx",
      "bytes": 1925,
      "lines": 68,
      "type": ".jsx",
      "fanIn": 32,
      "fanOut": 3,
      "extDeps": 2,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/hooks/useGetState.jsx",
      "bytes": 322,
      "lines": 10,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/hooks/useSyncAtom.jsx",
      "bytes": 364,
      "lines": 13,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/hooks/useToastStyle.jsx",
      "bytes": 510,
      "lines": 15,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/hooks/useTtsPluginInfo.jsx",
      "bytes": 787,
      "lines": 19,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/hooks/useVoice.jsx",
      "bytes": 897,
      "lines": 29,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/i18n/index.jsx",
      "bytes": 1675,
      "lines": 63,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/i18n/locales/en_US.json",
      "bytes": 19228,
      "lines": 473,
      "type": ".json",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/i18n/locales/es_ES.json",
      "bytes": 12652,
      "lines": 332,
      "type": ".json",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/main.jsx",
      "bytes": 817,
      "lines": 29,
      "type": ".jsx",
      "fanIn": 0,
      "fanOut": 3,
      "extDeps": 5,
      "maxDepth": 13,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/collection/anki/Config.jsx",
      "bytes": 4508,
      "lines": 111,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/collection/anki/index.jsx",
      "bytes": 3613,
      "lines": 111,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 3,
      "extDeps": 1,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/collection/anki/info.ts",
      "bytes": 70,
      "lines": 5,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/collection/eudic/Config.jsx",
      "bytes": 5425,
      "lines": 132,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/collection/eudic/index.jsx",
      "bytes": 1946,
      "lines": 73,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/collection/eudic/info.ts",
      "bytes": 72,
      "lines": 5,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/collection/index.jsx",
      "bytes": 125,
      "lines": 6,
      "type": ".jsx",
      "fanIn": 6,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 5,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/baidu_accurate/Config.jsx",
      "bytes": 6148,
      "lines": 132,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/baidu_accurate/index.jsx",
      "bytes": 2066,
      "lines": 65,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/baidu_accurate/info.ts",
      "bytes": 482,
      "lines": 29,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/baidu_img/Config.jsx",
      "bytes": 6093,
      "lines": 132,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/baidu_img/index.jsx",
      "bytes": 1826,
      "lines": 62,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 4,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/baidu_img/info.ts",
      "bytes": 446,
      "lines": 29,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/baidu/Config.jsx",
      "bytes": 6121,
      "lines": 132,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/baidu/index.jsx",
      "bytes": 2065,
      "lines": 65,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/baidu/info.ts",
      "bytes": 357,
      "lines": 22,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/iflytek_intsig/Config.jsx",
      "bytes": 7010,
      "lines": 153,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/iflytek_intsig/index.jsx",
      "bytes": 2360,
      "lines": 79,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 3,
      "extDeps": 2,
      "maxDepth": 5,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/iflytek_intsig/info.ts",
      "bytes": 441,
      "lines": 28,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/iflytek_latex/Config.jsx",
      "bytes": 7006,
      "lines": 153,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/iflytek_latex/index.jsx",
      "bytes": 2224,
      "lines": 69,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 4,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/iflytek_latex/info.ts",
      "bytes": 189,
      "lines": 12,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/iflytek/Config.jsx",
      "bytes": 6982,
      "lines": 153,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/iflytek/index.jsx",
      "bytes": 3470,
      "lines": 114,
      "type": ".jsx",
      "fanIn": 3,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/iflytek/info.ts",
      "bytes": 183,
      "lines": 12,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/index.jsx",
      "bytes": 1445,
      "lines": 32,
      "type": ".jsx",
      "fanIn": 6,
      "fanOut": 15,
      "extDeps": 0,
      "maxDepth": 6,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/qrcode/Config.jsx",
      "bytes": 653,
      "lines": 26,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/qrcode/index.jsx",
      "bytes": 1051,
      "lines": 34,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/qrcode/info.ts",
      "bytes": 374,
      "lines": 28,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/simple_latex/Config.jsx",
      "bytes": 5267,
      "lines": 113,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/simple_latex/index.jsx",
      "bytes": 1121,
      "lines": 40,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/simple_latex/info.ts",
      "bytes": 193,
      "lines": 12,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/system/Config.jsx",
      "bytes": 653,
      "lines": 26,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/system/index.jsx",
      "bytes": 2962,
      "lines": 112,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 1,
      "maxDepth": 2,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/system/info.ts",
      "bytes": 449,
      "lines": 30,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/tencent_accurate/Config.jsx",
      "bytes": 6170,
      "lines": 133,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/tencent_accurate/index.jsx",
      "bytes": 4052,
      "lines": 127,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 4,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/tencent_accurate/info.ts",
      "bytes": 219,
      "lines": 13,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/tencent_img/Config.jsx",
      "bytes": 6159,
      "lines": 133,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/tencent_img/index.jsx",
      "bytes": 4432,
      "lines": 138,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 5,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/tencent_img/info.ts",
      "bytes": 394,
      "lines": 25,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/tencent/Config.jsx",
      "bytes": 6204,
      "lines": 135,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/tencent/index.jsx",
      "bytes": 4081,
      "lines": 128,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 4,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/tencent/info.ts",
      "bytes": 439,
      "lines": 27,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/tesseract/Config.jsx",
      "bytes": 656,
      "lines": 26,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/tesseract/index.jsx",
      "bytes": 635,
      "lines": 21,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/tesseract/info.ts",
      "bytes": 501,
      "lines": 31,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/volcengine_multi_lang/Config.jsx",
      "bytes": 6156,
      "lines": 133,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/volcengine_multi_lang/index.jsx",
      "bytes": 4682,
      "lines": 144,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/volcengine_multi_lang/info.ts",
      "bytes": 451,
      "lines": 28,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/volcengine/Config.jsx",
      "bytes": 6123,
      "lines": 133,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/volcengine/index.jsx",
      "bytes": 4660,
      "lines": 144,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/recognize/volcengine/info.ts",
      "bytes": 205,
      "lines": 13,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/alibaba/Config.jsx",
      "bytes": 5078,
      "lines": 129,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/alibaba/index.jsx",
      "bytes": 2345,
      "lines": 61,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/alibaba/info.ts",
      "bytes": 672,
      "lines": 38,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/baidu_field/Config.jsx",
      "bytes": 6773,
      "lines": 174,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 9,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/baidu_field/index.jsx",
      "bytes": 1300,
      "lines": 52,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/baidu_field/info.ts",
      "bytes": 634,
      "lines": 38,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/baidu/Config.jsx",
      "bytes": 5002,
      "lines": 129,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/baidu/index.jsx",
      "bytes": 1252,
      "lines": 50,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/baidu/info.ts",
      "bytes": 628,
      "lines": 38,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/bing_dict/Config.jsx",
      "bytes": 692,
      "lines": 27,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/bing_dict/index.jsx",
      "bytes": 2628,
      "lines": 72,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/bing_dict/info.ts",
      "bytes": 180,
      "lines": 12,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/bing/Config.jsx",
      "bytes": 687,
      "lines": 27,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/bing/index.jsx",
      "bytes": 2338,
      "lines": 64,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/bing/info.ts",
      "bytes": 689,
      "lines": 39,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/caiyun/Config.jsx",
      "bytes": 4152,
      "lines": 109,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/caiyun/index.jsx",
      "bytes": 1083,
      "lines": 47,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/caiyun/info.ts",
      "bytes": 185,
      "lines": 13,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/cambridge_dict/Config.jsx",
      "bytes": 697,
      "lines": 27,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/cambridge_dict/index.jsx",
      "bytes": 3671,
      "lines": 101,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/cambridge_dict/info.ts",
      "bytes": 224,
      "lines": 12,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/chatglm/Config.jsx",
      "bytes": 10395,
      "lines": 221,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 10,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/chatglm/index.jsx",
      "bytes": 3237,
      "lines": 103,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/chatglm/info.ts",
      "bytes": 833,
      "lines": 40,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/deepl/Config.jsx",
      "bytes": 6923,
      "lines": 161,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 9,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/deepl/index.jsx",
      "bytes": 4234,
      "lines": 150,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/deepl/info.ts",
      "bytes": 405,
      "lines": 27,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/ecdict/Config.jsx",
      "bytes": 689,
      "lines": 27,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/ecdict/index.jsx",
      "bytes": 472,
      "lines": 19,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/ecdict/info.ts",
      "bytes": 166,
      "lines": 12,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/geminipro/Config.jsx",
      "bytes": 11606,
      "lines": 264,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 6,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/geminipro/index.jsx",
      "bytes": 4527,
      "lines": 137,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/geminipro/info.ts",
      "bytes": 838,
      "lines": 40,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/google/Config.jsx",
      "bytes": 3732,
      "lines": 98,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 4,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/google/index.jsx",
      "bytes": 2269,
      "lines": 77,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/google/info.ts",
      "bytes": 642,
      "lines": 38,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/index.jsx",
      "bytes": 1537,
      "lines": 44,
      "type": ".jsx",
      "fanIn": 6,
      "fanOut": 21,
      "extDeps": 0,
      "maxDepth": 5,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/lingva/Config.jsx",
      "bytes": 689,
      "lines": 27,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/lingva/index.jsx",
      "bytes": 745,
      "lines": 25,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/lingva/info.ts",
      "bytes": 660,
      "lines": 40,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/niutrans/Config.jsx",
      "bytes": 4769,
      "lines": 123,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/niutrans/index.jsx",
      "bytes": 975,
      "lines": 38,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/niutrans/info.ts",
      "bytes": 681,
      "lines": 40,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/ollama/Config.jsx",
      "bytes": 16284,
      "lines": 360,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 7,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/ollama/index.jsx",
      "bytes": 1401,
      "lines": 50,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/ollama/info.ts",
      "bytes": 831,
      "lines": 40,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/openai/Config.jsx",
      "bytes": 16154,
      "lines": 355,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 10,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/openai/index.jsx",
      "bytes": 5800,
      "lines": 153,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/openai/info.ts",
      "bytes": 831,
      "lines": 40,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/tencent/Config.jsx",
      "bytes": 4997,
      "lines": 125,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/tencent/index.jsx",
      "bytes": 4013,
      "lines": 126,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 4,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/tencent/info.ts",
      "bytes": 517,
      "lines": 29,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/transmart/Config.jsx",
      "bytes": 5026,
      "lines": 129,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/transmart/index.jsx",
      "bytes": 1307,
      "lines": 52,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/transmart/info.ts",
      "bytes": 469,
      "lines": 28,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/volcengine/Config.jsx",
      "bytes": 5023,
      "lines": 129,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/volcengine/index.jsx",
      "bytes": 4441,
      "lines": 144,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/volcengine/info.ts",
      "bytes": 618,
      "lines": 37,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/yandex/Config.jsx",
      "bytes": 689,
      "lines": 27,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/yandex/index.jsx",
      "bytes": 949,
      "lines": 35,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/yandex/info.ts",
      "bytes": 602,
      "lines": 36,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/youdao/Config.jsx",
      "bytes": 4998,
      "lines": 129,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/youdao/index.jsx",
      "bytes": 3517,
      "lines": 104,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/translate/youdao/info.ts",
      "bytes": 669,
      "lines": 39,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/tts/index.jsx",
      "bytes": 81,
      "lines": 4,
      "type": ".jsx",
      "fanIn": 5,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 5,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/tts/lingva/Config.jsx",
      "bytes": 4092,
      "lines": 103,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/tts/lingva/index.jsx",
      "bytes": 584,
      "lines": 24,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/services/tts/lingva/info.ts",
      "bytes": 584,
      "lines": 38,
      "type": ".ts",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/style.css",
      "bytes": 395,
      "lines": 28,
      "type": ".css",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/utils/env.js",
      "bytes": 381,
      "lines": 15,
      "type": ".js",
      "fanIn": 21,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/utils/index.js",
      "bytes": 197,
      "lines": 8,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/utils/invoke_plugin.js",
      "bytes": 1179,
      "lines": 36,
      "type": ".js",
      "fanIn": 4,
      "fanOut": 1,
      "extDeps": 6,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/utils/lang_detect.js",
      "bytes": 8859,
      "lines": 335,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 3,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/utils/language.ts",
      "bytes": 1000,
      "lines": 69,
      "type": ".ts",
      "fanIn": 6,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/utils/service_instance.ts",
      "bytes": 1745,
      "lines": 51,
      "type": ".ts",
      "fanIn": 53,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/utils/store.js",
      "bytes": 561,
      "lines": 17,
      "type": ".js",
      "fanIn": 8,
      "fanOut": 0,
      "extDeps": 4,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/components/SideBar/index.jsx",
      "bytes": 4372,
      "lines": 124,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 12,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/index.jsx",
      "bytes": 3017,
      "lines": 82,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 5,
      "maxDepth": 11,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/About/index.jsx",
      "bytes": 8721,
      "lines": 201,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 9,
      "maxDepth": 1,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Backup/AliyunModal/index.jsx",
      "bytes": 6522,
      "lines": 143,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Backup/index.jsx",
      "bytes": 12685,
      "lines": 318,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 7,
      "extDeps": 15,
      "maxDepth": 4,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Backup/utils/aliyun.jsx",
      "bytes": 10264,
      "lines": 332,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Backup/utils/local.jsx",
      "bytes": 953,
      "lines": 44,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Backup/utils/webdav.jsx",
      "bytes": 1081,
      "lines": 48,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Backup/WebDavModal/index.jsx",
      "bytes": 6569,
      "lines": 142,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 5,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/General/index.jsx",
      "bytes": 31902,
      "lines": 605,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 16,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/History/index.jsx",
      "bytes": 21488,
      "lines": 381,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 8,
      "extDeps": 11,
      "maxDepth": 6,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Hotkey/index.jsx",
      "bytes": 9913,
      "lines": 248,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 9,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Recognize/index.jsx",
      "bytes": 4292,
      "lines": 95,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 10,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Collection/ConfigModal/index.jsx",
      "bytes": 3558,
      "lines": 84,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 3,
      "maxDepth": 6,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Collection/index.jsx",
      "bytes": 6706,
      "lines": 147,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 4,
      "maxDepth": 7,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Collection/SelectModal/index.jsx",
      "bytes": 2737,
      "lines": 62,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 6,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Collection/ServiceItem/index.jsx",
      "bytes": 4002,
      "lines": 99,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 6,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/index.jsx",
      "bytes": 3543,
      "lines": 94,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 7,
      "maxDepth": 9,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/PluginConfig/index.jsx",
      "bytes": 6924,
      "lines": 149,
      "type": ".jsx",
      "fanIn": 4,
      "fanOut": 2,
      "extDeps": 8,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Recognize/ConfigModal/index.jsx",
      "bytes": 3843,
      "lines": 91,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 3,
      "maxDepth": 7,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Recognize/index.jsx",
      "bytes": 7093,
      "lines": 159,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 5,
      "maxDepth": 8,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Recognize/SelectModal/index.jsx",
      "bytes": 3059,
      "lines": 67,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 3,
      "maxDepth": 7,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Recognize/ServiceItem/index.jsx",
      "bytes": 4150,
      "lines": 100,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 4,
      "extDeps": 6,
      "maxDepth": 7,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/SelectPluginModal/index.jsx",
      "bytes": 8007,
      "lines": 152,
      "type": ".jsx",
      "fanIn": 4,
      "fanOut": 2,
      "extDeps": 10,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Translate/ConfigModal/index.jsx",
      "bytes": 3536,
      "lines": 80,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 3,
      "maxDepth": 6,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Translate/index.jsx",
      "bytes": 7158,
      "lines": 163,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 5,
      "maxDepth": 7,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Translate/SelectModal/index.jsx",
      "bytes": 2735,
      "lines": 62,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 6,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Translate/ServiceItem/index.jsx",
      "bytes": 4203,
      "lines": 93,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 6,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Tts/ConfigModal/index.jsx",
      "bytes": 3543,
      "lines": 84,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 3,
      "maxDepth": 6,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Tts/index.jsx",
      "bytes": 6975,
      "lines": 156,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 5,
      "maxDepth": 7,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Tts/SelectModal/index.jsx",
      "bytes": 2723,
      "lines": 62,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 6,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Service/Tts/ServiceItem/index.jsx",
      "bytes": 3889,
      "lines": 95,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 6,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/Translate/index.jsx",
      "bytes": 18558,
      "lines": 336,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 11,
      "maxDepth": 2,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/routes/index.jsx",
      "bytes": 1040,
      "lines": 52,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 8,
      "extDeps": 1,
      "maxDepth": 10,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/style.css",
      "bytes": 92,
      "lines": 6,
      "type": ".css",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Recognize/ControlArea/index.jsx",
      "bytes": 8353,
      "lines": 181,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 6,
      "extDeps": 8,
      "maxDepth": 8,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Recognize/ImageArea/index.jsx",
      "bytes": 2677,
      "lines": 82,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 8,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Recognize/index.jsx",
      "bytes": 6057,
      "lines": 159,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 7,
      "extDeps": 9,
      "maxDepth": 9,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Recognize/TextArea/index.jsx",
      "bytes": 7862,
      "lines": 190,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 6,
      "extDeps": 9,
      "maxDepth": 7,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Screenshot/index.jsx",
      "bytes": 4167,
      "lines": 101,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 8,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Translate/components/LanguageArea/index.jsx",
      "bytes": 5748,
      "lines": 129,
      "type": ".jsx",
      "fanIn": 2,
      "fanOut": 3,
      "extDeps": 5,
      "maxDepth": 8,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Translate/components/SourceArea/index.jsx",
      "bytes": 13873,
      "lines": 371,
      "type": ".jsx",
      "fanIn": 3,
      "fanOut": 7,
      "extDeps": 8,
      "maxDepth": 7,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Translate/components/SourceArea/SourceActionBar.jsx",
      "bytes": 3378,
      "lines": 90,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 6,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Translate/components/TargetArea/ActionBar.jsx",
      "bytes": 3584,
      "lines": 102,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 6,
      "maxDepth": 6,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Translate/components/TargetArea/index.jsx",
      "bytes": 17480,
      "lines": 460,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 11,
      "extDeps": 16,
      "maxDepth": 9,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Translate/components/TargetArea/ResultView.jsx",
      "bytes": 4690,
      "lines": 96,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Translate/components/TargetArea/ServiceDropdown.jsx",
      "bytes": 2826,
      "lines": 76,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 6,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Translate/index.jsx",
      "bytes": 15384,
      "lines": 346,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 11,
      "maxDepth": 10,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "src/window/Updater/index.jsx",
      "bytes": 7735,
      "lines": 189,
      "type": ".jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 9,
      "maxDepth": 3,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "tailwind.config.cjs",
      "bytes": 2619,
      "lines": 77,
      "type": ".cjs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "updater/updater-for-fix-runtime.mjs",
      "bytes": 3048,
      "lines": 82,
      "type": ".mjs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "updater/updater.mjs",
      "bytes": 4347,
      "lines": 94,
      "type": ".mjs",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "vite.config.js",
      "bytes": 1211,
      "lines": 35,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "lastModified": 1784854843,
      "ageDays": 0
    },
    {
      "path": "yarn.lock",
      "bytes": 255070,
      "lines": 5262,
      "type": ".lock",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    }
  ],
  "adjacency": {
    "src/App.jsx": [
      "src/window/Screenshot/index.jsx",
      "src/window/Translate/index.jsx",
      "src/window/Recognize/index.jsx",
      "src/window/Updater/index.jsx",
      "src/utils/store.js",
      "src/window/Config/index.jsx",
      "src/hooks/index.jsx",
      "src/style.css",
      "src/i18n/index.jsx"
    ],
    "src/components/WindowControl/index.jsx": [
      "src/utils/env.js",
      "src/components/WindowControl/style.css"
    ],
    "src/hooks/index.jsx": [
      "src/hooks/useConfig.jsx",
      "src/hooks/useToastStyle.jsx",
      "src/hooks/useSyncAtom.jsx",
      "src/hooks/useVoice.jsx",
      "src/hooks/useTtsPluginInfo.jsx"
    ],
    "src/hooks/useConfig.jsx": [
      "src/hooks/useGetState.jsx",
      "src/utils/store.js",
      "src/utils/index.js"
    ],
    "src/hooks/useGetState.jsx": [],
    "src/hooks/useSyncAtom.jsx": [
      "src/hooks/useGetState.jsx"
    ],
    "src/hooks/useToastStyle.jsx": [],
    "src/hooks/useTtsPluginInfo.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/hooks/useVoice.jsx": [],
    "src/i18n/index.jsx": [
      "src/i18n/locales/en_US.json",
      "src/i18n/locales/es_ES.json"
    ],
    "src/main.jsx": [
      "src/utils/store.js",
      "src/utils/env.js",
      "src/App.jsx"
    ],
    "src/services/collection/anki/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/index.jsx",
      "src/services/collection/anki/index.jsx"
    ],
    "src/services/collection/anki/index.jsx": [
      "src/utils/store.js",
      "src/services/collection/anki/Config.jsx",
      "src/services/collection/anki/info.ts"
    ],
    "src/services/collection/eudic/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/index.jsx",
      "src/services/collection/eudic/index.jsx"
    ],
    "src/services/collection/eudic/index.jsx": [
      "src/services/collection/eudic/Config.jsx",
      "src/services/collection/eudic/info.ts"
    ],
    "src/services/collection/index.jsx": [
      "src/services/collection/anki/index.jsx",
      "src/services/collection/eudic/index.jsx"
    ],
    "src/services/recognize/baidu_accurate/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/index.jsx",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/baidu_accurate/index.jsx"
    ],
    "src/services/recognize/baidu_accurate/index.jsx": [
      "src/services/recognize/baidu_accurate/Config.jsx",
      "src/services/recognize/baidu_accurate/info.ts"
    ],
    "src/services/recognize/baidu_img/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/index.jsx",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/baidu_img/index.jsx"
    ],
    "src/services/recognize/baidu_img/index.jsx": [
      "src/services/recognize/baidu_img/Config.jsx",
      "src/services/recognize/baidu_img/info.ts"
    ],
    "src/services/recognize/baidu/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/index.jsx",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/baidu/index.jsx"
    ],
    "src/services/recognize/baidu/index.jsx": [
      "src/services/recognize/baidu/Config.jsx",
      "src/services/recognize/baidu/info.ts"
    ],
    "src/services/recognize/iflytek_intsig/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/recognize/iflytek_intsig/index.jsx"
    ],
    "src/services/recognize/iflytek_intsig/index.jsx": [
      "src/services/recognize/iflytek/index.jsx",
      "src/services/recognize/iflytek_intsig/Config.jsx",
      "src/services/recognize/iflytek_intsig/info.ts"
    ],
    "src/services/recognize/iflytek_latex/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/recognize/iflytek_latex/index.jsx"
    ],
    "src/services/recognize/iflytek_latex/index.jsx": [
      "src/services/recognize/iflytek_latex/Config.jsx",
      "src/services/recognize/iflytek_latex/info.ts"
    ],
    "src/services/recognize/iflytek/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/recognize/iflytek/index.jsx"
    ],
    "src/services/recognize/iflytek/index.jsx": [
      "src/services/recognize/iflytek/Config.jsx",
      "src/services/recognize/iflytek/info.ts"
    ],
    "src/services/recognize/index.jsx": [
      "src/services/recognize/system/index.jsx",
      "src/services/recognize/tesseract/index.jsx",
      "src/services/recognize/baidu/index.jsx",
      "src/services/recognize/baidu_accurate/index.jsx",
      "src/services/recognize/baidu_img/index.jsx",
      "src/services/recognize/iflytek/index.jsx",
      "src/services/recognize/iflytek_intsig/index.jsx",
      "src/services/recognize/iflytek_latex/index.jsx",
      "src/services/recognize/simple_latex/index.jsx",
      "src/services/recognize/tencent/index.jsx",
      "src/services/recognize/tencent_accurate/index.jsx",
      "src/services/recognize/tencent_img/index.jsx",
      "src/services/recognize/volcengine/index.jsx",
      "src/services/recognize/volcengine_multi_lang/index.jsx",
      "src/services/recognize/qrcode/index.jsx"
    ],
    "src/services/recognize/qrcode/Config.jsx": [],
    "src/services/recognize/qrcode/index.jsx": [
      "src/services/recognize/qrcode/Config.jsx",
      "src/services/recognize/qrcode/info.ts"
    ],
    "src/services/recognize/simple_latex/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/recognize/simple_latex/index.jsx"
    ],
    "src/services/recognize/simple_latex/index.jsx": [
      "src/services/recognize/simple_latex/Config.jsx",
      "src/services/recognize/simple_latex/info.ts"
    ],
    "src/services/recognize/system/Config.jsx": [],
    "src/services/recognize/system/index.jsx": [
      "src/utils/lang_detect.js",
      "src/utils/env.js",
      "src/services/recognize/system/info.ts",
      "src/services/recognize/system/Config.jsx"
    ],
    "src/services/recognize/tencent_accurate/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/recognize/tencent_accurate/index.jsx"
    ],
    "src/services/recognize/tencent_accurate/index.jsx": [
      "src/services/recognize/tencent_accurate/Config.jsx",
      "src/services/recognize/tencent_accurate/info.ts"
    ],
    "src/services/recognize/tencent_img/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/recognize/tencent_img/index.jsx"
    ],
    "src/services/recognize/tencent_img/index.jsx": [
      "src/services/recognize/tencent_img/Config.jsx",
      "src/services/recognize/tencent_img/info.ts"
    ],
    "src/services/recognize/tencent/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/recognize/tencent/index.jsx"
    ],
    "src/services/recognize/tencent/index.jsx": [
      "src/services/recognize/tencent/Config.jsx",
      "src/services/recognize/tencent/info.ts"
    ],
    "src/services/recognize/tesseract/Config.jsx": [],
    "src/services/recognize/tesseract/index.jsx": [
      "src/services/recognize/tesseract/info.ts",
      "src/services/recognize/tesseract/Config.jsx"
    ],
    "src/services/recognize/volcengine_multi_lang/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/recognize/volcengine_multi_lang/index.jsx"
    ],
    "src/services/recognize/volcengine_multi_lang/index.jsx": [
      "src/services/recognize/volcengine_multi_lang/Config.jsx",
      "src/services/recognize/volcengine_multi_lang/info.ts"
    ],
    "src/services/recognize/volcengine/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/recognize/volcengine/index.jsx"
    ],
    "src/services/recognize/volcengine/index.jsx": [
      "src/services/recognize/volcengine/Config.jsx",
      "src/services/recognize/volcengine/info.ts"
    ],
    "src/services/translate/alibaba/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/alibaba/index.jsx"
    ],
    "src/services/translate/alibaba/index.jsx": [
      "src/services/translate/alibaba/Config.jsx",
      "src/services/translate/alibaba/info.ts"
    ],
    "src/services/translate/baidu_field/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/baidu_field/index.jsx"
    ],
    "src/services/translate/baidu_field/index.jsx": [
      "src/services/translate/baidu_field/Config.jsx",
      "src/services/translate/baidu_field/info.ts"
    ],
    "src/services/translate/baidu/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/baidu/index.jsx"
    ],
    "src/services/translate/baidu/index.jsx": [
      "src/services/translate/baidu/Config.jsx",
      "src/services/translate/baidu/info.ts"
    ],
    "src/services/translate/bing_dict/Config.jsx": [],
    "src/services/translate/bing_dict/index.jsx": [
      "src/services/translate/bing_dict/Config.jsx",
      "src/services/translate/bing_dict/info.ts"
    ],
    "src/services/translate/bing/Config.jsx": [],
    "src/services/translate/bing/index.jsx": [
      "src/services/translate/bing/Config.jsx",
      "src/services/translate/bing/info.ts"
    ],
    "src/services/translate/caiyun/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/caiyun/index.jsx"
    ],
    "src/services/translate/caiyun/index.jsx": [
      "src/services/translate/caiyun/Config.jsx",
      "src/services/translate/caiyun/info.ts"
    ],
    "src/services/translate/cambridge_dict/Config.jsx": [],
    "src/services/translate/cambridge_dict/index.jsx": [
      "src/services/translate/cambridge_dict/info.ts",
      "src/services/translate/cambridge_dict/Config.jsx"
    ],
    "src/services/translate/chatglm/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/chatglm/index.jsx"
    ],
    "src/services/translate/chatglm/index.jsx": [
      "src/services/translate/chatglm/info.ts",
      "src/services/translate/chatglm/Config.jsx"
    ],
    "src/services/translate/deepl/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/deepl/index.jsx"
    ],
    "src/services/translate/deepl/index.jsx": [
      "src/services/translate/deepl/Config.jsx",
      "src/services/translate/deepl/info.ts"
    ],
    "src/services/translate/ecdict/Config.jsx": [],
    "src/services/translate/ecdict/index.jsx": [
      "src/services/translate/ecdict/Config.jsx",
      "src/services/translate/ecdict/info.ts"
    ],
    "src/services/translate/geminipro/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/geminipro/index.jsx"
    ],
    "src/services/translate/geminipro/index.jsx": [
      "src/services/translate/geminipro/info.ts",
      "src/services/translate/geminipro/Config.jsx"
    ],
    "src/services/translate/google/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/google/index.jsx"
    ],
    "src/services/translate/google/index.jsx": [
      "src/services/translate/google/Config.jsx",
      "src/services/translate/google/info.ts"
    ],
    "src/services/translate/index.jsx": [
      "src/services/translate/deepl/index.jsx",
      "src/services/translate/bing/index.jsx",
      "src/services/translate/yandex/index.jsx",
      "src/services/translate/openai/index.jsx",
      "src/services/translate/google/index.jsx",
      "src/services/translate/transmart/index.jsx",
      "src/services/translate/alibaba/index.jsx",
      "src/services/translate/baidu/index.jsx",
      "src/services/translate/baidu_field/index.jsx",
      "src/services/translate/tencent/index.jsx",
      "src/services/translate/volcengine/index.jsx",
      "src/services/translate/niutrans/index.jsx",
      "src/services/translate/youdao/index.jsx",
      "src/services/translate/bing_dict/index.jsx",
      "src/services/translate/cambridge_dict/index.jsx",
      "src/services/translate/caiyun/index.jsx",
      "src/services/translate/chatglm/index.jsx",
      "src/services/translate/geminipro/index.jsx",
      "src/services/translate/ollama/index.jsx",
      "src/services/translate/ecdict/index.jsx",
      "src/services/translate/lingva/index.jsx"
    ],
    "src/services/translate/lingva/Config.jsx": [],
    "src/services/translate/lingva/index.jsx": [
      "src/services/translate/lingva/Config.jsx",
      "src/services/translate/lingva/info.ts"
    ],
    "src/services/translate/niutrans/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/niutrans/index.jsx"
    ],
    "src/services/translate/niutrans/index.jsx": [
      "src/services/translate/niutrans/Config.jsx",
      "src/services/translate/niutrans/info.ts"
    ],
    "src/services/translate/ollama/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/ollama/index.jsx"
    ],
    "src/services/translate/ollama/index.jsx": [
      "src/services/translate/ollama/info.ts",
      "src/services/translate/ollama/Config.jsx"
    ],
    "src/services/translate/openai/Config.jsx": [
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/openai/index.jsx",
      "src/utils/service_instance.ts"
    ],
    "src/services/translate/openai/index.jsx": [
      "src/services/translate/openai/info.ts",
      "src/services/translate/openai/Config.jsx"
    ],
    "src/services/translate/tencent/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/tencent/index.jsx"
    ],
    "src/services/translate/tencent/index.jsx": [
      "src/services/translate/tencent/Config.jsx",
      "src/services/translate/tencent/info.ts"
    ],
    "src/services/translate/transmart/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/transmart/index.jsx"
    ],
    "src/services/translate/transmart/index.jsx": [
      "src/services/translate/transmart/Config.jsx",
      "src/services/translate/transmart/info.ts"
    ],
    "src/services/translate/volcengine/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/volcengine/index.jsx"
    ],
    "src/services/translate/volcengine/index.jsx": [
      "src/services/translate/volcengine/Config.jsx",
      "src/services/translate/volcengine/info.ts"
    ],
    "src/services/translate/yandex/Config.jsx": [],
    "src/services/translate/yandex/index.jsx": [
      "src/services/translate/yandex/Config.jsx",
      "src/services/translate/yandex/info.ts"
    ],
    "src/services/translate/youdao/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/translate/youdao/index.jsx"
    ],
    "src/services/translate/youdao/index.jsx": [
      "src/services/translate/youdao/Config.jsx",
      "src/services/translate/youdao/info.ts"
    ],
    "src/services/tts/index.jsx": [
      "src/services/tts/lingva/index.jsx"
    ],
    "src/services/tts/lingva/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/services/tts/lingva/index.jsx"
    ],
    "src/services/tts/lingva/index.jsx": [
      "src/services/tts/lingva/Config.jsx",
      "src/services/tts/lingva/info.ts"
    ],
    "src/utils/env.js": [],
    "src/utils/invoke_plugin.js": [
      "src/utils/env.js"
    ],
    "src/utils/lang_detect.js": [
      "src/utils/store.js"
    ],
    "src/utils/store.js": [],
    "src/window/Config/components/SideBar/index.jsx": [],
    "src/window/Config/index.jsx": [
      "src/components/WindowControl/index.jsx",
      "src/window/Config/components/SideBar/index.jsx",
      "src/utils/env.js",
      "src/hooks/index.jsx",
      "src/window/Config/routes/index.jsx",
      "src/window/Config/style.css"
    ],
    "src/window/Config/pages/About/index.jsx": [
      "src/utils/env.js"
    ],
    "src/window/Config/pages/Backup/AliyunModal/index.jsx": [
      "src/hooks/index.jsx",
      "src/window/Config/pages/Backup/utils/aliyun.jsx"
    ],
    "src/window/Config/pages/Backup/index.jsx": [
      "src/hooks/index.jsx",
      "src/utils/env.js",
      "src/window/Config/pages/Backup/utils/webdav.jsx",
      "src/window/Config/pages/Backup/WebDavModal/index.jsx",
      "src/window/Config/pages/Backup/AliyunModal/index.jsx",
      "src/window/Config/pages/Backup/utils/local.jsx",
      "src/window/Config/pages/Backup/utils/aliyun.jsx"
    ],
    "src/window/Config/pages/Backup/utils/aliyun.jsx": [],
    "src/window/Config/pages/Backup/utils/local.jsx": [],
    "src/window/Config/pages/Backup/utils/webdav.jsx": [],
    "src/window/Config/pages/Backup/WebDavModal/index.jsx": [
      "src/hooks/index.jsx",
      "src/window/Config/pages/Backup/utils/webdav.jsx"
    ],
    "src/window/Config/pages/General/index.jsx": [
      "src/hooks/useConfig.jsx",
      "src/utils/language.ts",
      "src/hooks/index.jsx",
      "src/utils/env.js"
    ],
    "src/window/Config/pages/History/index.jsx": [
      "src/services/collection/index.jsx",
      "src/utils/invoke_plugin.js",
      "src/services/translate/index.jsx",
      "src/hooks/index.jsx",
      "src/utils/language.ts",
      "src/utils/store.js",
      "src/utils/env.js",
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Hotkey/index.jsx": [
      "src/hooks/useConfig.jsx",
      "src/hooks/index.jsx",
      "src/utils/env.js"
    ],
    "src/window/Config/pages/Recognize/index.jsx": [
      "src/utils/language.ts",
      "src/hooks/index.jsx"
    ],
    "src/window/Config/pages/Service/Collection/ConfigModal/index.jsx": [
      "src/utils/service_instance.ts",
      "src/services/collection/index.jsx",
      "src/window/Config/pages/Service/PluginConfig/index.jsx"
    ],
    "src/window/Config/pages/Service/Collection/index.jsx": [
      "src/window/Config/pages/Service/SelectPluginModal/index.jsx",
      "src/utils/env.js",
      "src/hooks/index.jsx",
      "src/window/Config/pages/Service/Collection/ServiceItem/index.jsx",
      "src/window/Config/pages/Service/Collection/SelectModal/index.jsx",
      "src/window/Config/pages/Service/Collection/ConfigModal/index.jsx"
    ],
    "src/window/Config/pages/Service/Collection/SelectModal/index.jsx": [
      "src/utils/service_instance.ts",
      "src/services/collection/index.jsx"
    ],
    "src/window/Config/pages/Service/Collection/ServiceItem/index.jsx": [
      "src/utils/service_instance.ts",
      "src/services/collection/index.jsx",
      "src/hooks/index.jsx"
    ],
    "src/window/Config/pages/Service/index.jsx": [
      "src/window/Config/pages/Service/Translate/index.jsx",
      "src/window/Config/pages/Service/Recognize/index.jsx",
      "src/window/Config/pages/Service/Collection/index.jsx",
      "src/window/Config/pages/Service/Tts/index.jsx",
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/PluginConfig/index.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/index.jsx"
    ],
    "src/window/Config/pages/Service/Recognize/ConfigModal/index.jsx": [
      "src/utils/service_instance.ts",
      "src/services/recognize/index.jsx",
      "src/utils/env.js",
      "src/window/Config/pages/Service/PluginConfig/index.jsx"
    ],
    "src/window/Config/pages/Service/Recognize/index.jsx": [
      "src/hooks/index.jsx",
      "src/window/Config/pages/Service/SelectPluginModal/index.jsx",
      "src/utils/env.js",
      "src/window/Config/pages/Service/Recognize/ServiceItem/index.jsx",
      "src/window/Config/pages/Service/Recognize/SelectModal/index.jsx",
      "src/window/Config/pages/Service/Recognize/ConfigModal/index.jsx"
    ],
    "src/window/Config/pages/Service/Recognize/SelectModal/index.jsx": [
      "src/utils/service_instance.ts",
      "src/services/recognize/index.jsx",
      "src/utils/env.js"
    ],
    "src/window/Config/pages/Service/Recognize/ServiceItem/index.jsx": [
      "src/utils/service_instance.ts",
      "src/services/recognize/index.jsx",
      "src/utils/env.js",
      "src/hooks/index.jsx"
    ],
    "src/window/Config/pages/Service/SelectPluginModal/index.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/index.jsx"
    ],
    "src/window/Config/pages/Service/Translate/ConfigModal/index.jsx": [
      "src/services/translate/index.jsx",
      "src/window/Config/pages/Service/PluginConfig/index.jsx",
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/Translate/index.jsx": [
      "src/hooks/index.jsx",
      "src/window/Config/pages/Service/SelectPluginModal/index.jsx",
      "src/utils/env.js",
      "src/window/Config/pages/Service/Translate/ServiceItem/index.jsx",
      "src/window/Config/pages/Service/Translate/SelectModal/index.jsx",
      "src/window/Config/pages/Service/Translate/ConfigModal/index.jsx"
    ],
    "src/window/Config/pages/Service/Translate/SelectModal/index.jsx": [
      "src/services/translate/index.jsx",
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/Translate/ServiceItem/index.jsx": [
      "src/services/translate/index.jsx",
      "src/hooks/index.jsx",
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/Tts/ConfigModal/index.jsx": [
      "src/utils/service_instance.ts",
      "src/services/tts/index.jsx",
      "src/window/Config/pages/Service/PluginConfig/index.jsx"
    ],
    "src/window/Config/pages/Service/Tts/index.jsx": [
      "src/hooks/index.jsx",
      "src/window/Config/pages/Service/SelectPluginModal/index.jsx",
      "src/utils/env.js",
      "src/window/Config/pages/Service/Tts/ServiceItem/index.jsx",
      "src/window/Config/pages/Service/Tts/SelectModal/index.jsx",
      "src/window/Config/pages/Service/Tts/ConfigModal/index.jsx"
    ],
    "src/window/Config/pages/Service/Tts/SelectModal/index.jsx": [
      "src/utils/service_instance.ts",
      "src/services/tts/index.jsx"
    ],
    "src/window/Config/pages/Service/Tts/ServiceItem/index.jsx": [
      "src/utils/service_instance.ts",
      "src/services/tts/index.jsx",
      "src/hooks/index.jsx"
    ],
    "src/window/Config/pages/Translate/index.jsx": [
      "src/utils/language.ts",
      "src/hooks/useConfig.jsx"
    ],
    "src/window/Config/routes/index.jsx": [
      "src/window/Config/pages/Translate/index.jsx",
      "src/window/Config/pages/Recognize/index.jsx",
      "src/window/Config/pages/General/index.jsx",
      "src/window/Config/pages/Service/index.jsx",
      "src/window/Config/pages/History/index.jsx",
      "src/window/Config/pages/Hotkey/index.jsx",
      "src/window/Config/pages/Backup/index.jsx",
      "src/window/Config/pages/About/index.jsx"
    ],
    "src/window/Recognize/ControlArea/index.jsx": [
      "src/services/recognize/index.jsx",
      "src/utils/language.ts",
      "src/hooks/index.jsx",
      "src/window/Recognize/TextArea/index.jsx",
      "src/utils/env.js",
      "src/utils/service_instance.ts"
    ],
    "src/window/Recognize/ImageArea/index.jsx": [
      "src/hooks/index.jsx"
    ],
    "src/window/Recognize/index.jsx": [
      "src/components/WindowControl/index.jsx",
      "src/utils/store.js",
      "src/utils/env.js",
      "src/hooks/index.jsx",
      "src/window/Recognize/ControlArea/index.jsx",
      "src/window/Recognize/ImageArea/index.jsx",
      "src/window/Recognize/TextArea/index.jsx"
    ],
    "src/window/Recognize/TextArea/index.jsx": [
      "src/utils/service_instance.ts",
      "src/window/Recognize/ControlArea/index.jsx",
      "src/utils/invoke_plugin.js",
      "src/services/recognize/index.jsx",
      "src/hooks/index.jsx",
      "src/window/Recognize/ImageArea/index.jsx"
    ],
    "src/window/Screenshot/index.jsx": [],
    "src/window/Translate/components/LanguageArea/index.jsx": [
      "src/utils/language.ts",
      "src/window/Translate/components/SourceArea/index.jsx",
      "src/hooks/index.jsx"
    ],
    "src/window/Translate/components/SourceArea/index.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/index.jsx",
      "src/utils/invoke_plugin.js",
      "src/services/recognize/index.jsx",
      "src/services/tts/index.jsx",
      "src/utils/lang_detect.js",
      "src/window/Translate/components/SourceArea/SourceActionBar.jsx"
    ],
    "src/window/Translate/components/SourceArea/SourceActionBar.jsx": [],
    "src/window/Translate/components/TargetArea/ActionBar.jsx": [
      "src/utils/service_instance.ts",
      "src/services/collection/index.jsx"
    ],
    "src/window/Translate/components/TargetArea/index.jsx": [
      "src/services/collection/index.jsx",
      "src/window/Translate/components/LanguageArea/index.jsx",
      "src/hooks/index.jsx",
      "src/window/Translate/components/SourceArea/index.jsx",
      "src/utils/invoke_plugin.js",
      "src/services/translate/index.jsx",
      "src/services/tts/index.jsx",
      "src/window/Translate/components/TargetArea/ResultView.jsx",
      "src/window/Translate/components/TargetArea/ServiceDropdown.jsx",
      "src/window/Translate/components/TargetArea/ActionBar.jsx",
      "src/utils/service_instance.ts"
    ],
    "src/window/Translate/components/TargetArea/ResultView.jsx": [],
    "src/window/Translate/components/TargetArea/ServiceDropdown.jsx": [
      "src/utils/service_instance.ts",
      "src/services/translate/index.jsx"
    ],
    "src/window/Translate/index.jsx": [
      "src/window/Translate/components/LanguageArea/index.jsx",
      "src/window/Translate/components/SourceArea/index.jsx",
      "src/window/Translate/components/TargetArea/index.jsx",
      "src/utils/env.js",
      "src/hooks/index.jsx",
      "src/utils/store.js"
    ],
    "src/window/Updater/index.jsx": [
      "src/hooks/index.jsx",
      "src/utils/env.js"
    ],
    "updater/updater-for-fix-runtime.mjs": [],
    "updater/updater.mjs": [],
    "vite.config.js": []
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
