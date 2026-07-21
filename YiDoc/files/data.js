/**
 * rui-report-files — Runtime data
 * ----------------------------------------------------------------------
 * Generated: 2026-07-21
 * Scope: Websites/ YiAi/ YiH5/ YiPet/ YiPot/ YiWeb/
 * 4462 source files · 185.30 MB · 1,462,127 lines
 * Health Score: 68 (Grade: C)
 */

window.REPORT_CONFIG = {
    options: {
        topN: 20,
        noCycles: false,
        theme: 'dark',
        generatedAt: '2026-07-21T04:37:24.102Z',
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

window.REPORT_DATA = {
  "scope": "Websites/ YiAi/ YiH5/ YiPet/ YiPot/ YiWeb/",
  "score": 68,
  "alerts": [
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "Websites/Adminto/Admin/src/assets/js/pages/apex-area.init.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1386 lines) — consider splitting by concern",
      "metric": "1386 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split apex-area.init.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "Websites/Adminto/Admin/src/assets/js/pages/apex-column.init.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1272 lines) — consider splitting by concern",
      "metric": "1272 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split apex-column.init.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "Websites/Adminto/Admin/src/assets/js/pages/apex-line.init.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1093 lines) — consider splitting by concern",
      "metric": "1093 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split apex-line.init.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "Websites/Adminto/Admin/src/assets/js/pages/icons-fontawesome.init.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1976 lines) — consider splitting by concern",
      "metric": "1976 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split icons-fontawesome.init.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "Websites/Mortal/assets/libs/tobii/js/tobii.cjs.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1360 lines) — consider splitting by concern",
      "metric": "1360 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split tobii.cjs.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "Websites/News/assets/js/vendor/perfect-scrollbar.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1349 lines) — consider splitting by concern",
      "metric": "1349 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split perfect-scrollbar.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "Websites/Prompt/assets/libs/swiper/angular/fesm2015/swiper_angular.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1082 lines) — consider splitting by concern",
      "metric": "1082 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split swiper_angular.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "coupling",
      "file": "Websites/Prompt/assets/libs/swiper/swiper-bundle.esm.js",
      "line": 1,
      "message": "High fan-out (20) — imports 20 modules, consider decoupling",
      "metric": "fan-out 20",
      "impact": "High coupling → changes may have unexpected side effects.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Review the dependency list and identify unnecessary imports.",
        "Group related dependencies into a façade module."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "YiPet/cdn/markdown/index.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1072 lines) — consider splitting by concern",
      "metric": "1072 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split index.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "YiPet/cdn/utils/index.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1869 lines) — consider splitting by concern",
      "metric": "1869 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split index.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "YiPet/libs/marked.min.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1904 lines) — consider splitting by concern",
      "metric": "1904 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split marked.min.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "YiPet/libs/perfect-scrollbar@1.5.0/perfect-scrollbar.min.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1349 lines) — consider splitting by concern",
      "metric": "1349 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split perfect-scrollbar.min.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "YiPet/libs/turndown.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1016 lines) — consider splitting by concern",
      "metric": "1016 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split turndown.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "YiPet/modules/pet/components/chat/ChatWindow/index.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1668 lines) — consider splitting by concern",
      "metric": "1668 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split index.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "YiPet/modules/pet/components/manager/FaqManager/index.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1027 lines) — consider splitting by concern",
      "metric": "1027 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split index.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "YiPet/modules/pet/content/core/petManager.core.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1035 lines) — consider splitting by concern",
      "metric": "1035 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split petManager.core.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "YiPet/modules/pet/content/editor/petManager.editor.core.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1329 lines) — consider splitting by concern",
      "metric": "1329 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split petManager.editor.core.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "YiPet/modules/pet/content/modules/petManager.roles.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1292 lines) — consider splitting by concern",
      "metric": "1292 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split petManager.roles.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "YiPet/modules/pet/content/petManager.chat.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1677 lines) — consider splitting by concern",
      "metric": "1677 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split petManager.chat.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "YiPet/modules/pet/content/session/petManager.session.crud.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1079 lines) — consider splitting by concern",
      "metric": "1079 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split petManager.session.crud.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "YiPot/src/services/translate/openai/Config.jsx",
      "line": 1,
      "message": "Circular dependency (len 2): YiPot/src/services/translate/openai/Config.jsx → YiPot/src/services/translate/openai/index.jsx → YiPot/src/services/translate/openai/Config.jsx",
      "metric": "cycle len 2",
      "impact": "Circular imports → init-order bugs, tree-shaking breakage, hot-reload instability.",
      "effort": "medium",
      "scoreUplift": 4,
      "cyclePath": "YiPot/src/services/translate/openai/Config.jsx → YiPot/src/services/translate/openai/index.jsx → YiPot/src/services/translate/openai/Config.jsx",
      "recommendations": [
        "Extract shared logic into a third module that both files import.",
        "Invert one edge via dependency injection.",
        "Merge overlapping concerns if the cycle indicates artificial separation."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "YiWeb/src/views/aicr/components/fileTree/fileTreeMethods.js",
      "line": 1,
      "message": "File exceeds 1000 LOC (1028 lines) — consider splitting by concern",
      "metric": "1028 LOC",
      "impact": "Moderately large file → harder to test, review, and maintain.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Split fileTreeMethods.js into smaller, focused modules.",
        "Extract pure helpers into separate utility files.",
        "Add a LOC budget to CI for long-term prevention."
      ]
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "coupling",
      "file": "YiWeb/src/views/aicr/hooks/useMethods.js",
      "line": 1,
      "message": "High fan-out (18) — imports 18 modules, consider decoupling",
      "metric": "fan-out 18",
      "impact": "High coupling → changes may have unexpected side effects.",
      "effort": "medium",
      "scoreUplift": 5,
      "recommendations": [
        "Review the dependency list and identify unnecessary imports.",
        "Group related dependencies into a façade module."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "Websites/DpMarket/assets/js/apexchart.js",
      "line": null,
      "message": "Orphan file — no inbound references detected, potential dead code",
      "metric": "0 inbound refs",
      "impact": "No inbound references → dead code or forgotten entry; inflates cognitive surface.",
      "effort": "low",
      "scoreUplift": 2,
      "recommendations": [
        "Grep for dynamic imports / reflection / string-based resolvers before deletion.",
        "Check git log for last touch and contact prior authors.",
        "Delete in a dedicated PR; revert is cheap if needed."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "Websites/Prompt/assets/js/vendor.js",
      "line": null,
      "message": "Orphan file — no inbound references detected, potential dead code",
      "metric": "0 inbound refs",
      "impact": "No inbound references → dead code or forgotten entry; inflates cognitive surface.",
      "effort": "low",
      "scoreUplift": 2,
      "recommendations": [
        "Grep for dynamic imports / reflection / string-based resolvers before deletion.",
        "Check git log for last touch and contact prior authors.",
        "Delete in a dedicated PR; revert is cheap if needed."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "Websites/Prompt/assets/js/vendor.min.js",
      "line": null,
      "message": "Orphan file — no inbound references detected, potential dead code",
      "metric": "0 inbound refs",
      "impact": "No inbound references → dead code or forgotten entry; inflates cognitive surface.",
      "effort": "low",
      "scoreUplift": 2,
      "recommendations": [
        "Grep for dynamic imports / reflection / string-based resolvers before deletion.",
        "Check git log for last touch and contact prior authors.",
        "Delete in a dedicated PR; revert is cheap if needed."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "Websites/Prompt/assets/libs/leaflet/leaflet-src.esm.js",
      "line": null,
      "message": "Orphan file — no inbound references detected, potential dead code",
      "metric": "0 inbound refs",
      "impact": "No inbound references → dead code or forgotten entry; inflates cognitive surface.",
      "effort": "low",
      "scoreUplift": 2,
      "recommendations": [
        "Grep for dynamic imports / reflection / string-based resolvers before deletion.",
        "Check git log for last touch and contact prior authors.",
        "Delete in a dedicated PR; revert is cheap if needed."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "Websites/Prompt/assets/libs/leaflet/leaflet-src.js",
      "line": null,
      "message": "Orphan file — no inbound references detected, potential dead code",
      "metric": "0 inbound refs",
      "impact": "No inbound references → dead code or forgotten entry; inflates cognitive surface.",
      "effort": "low",
      "scoreUplift": 2,
      "recommendations": [
        "Grep for dynamic imports / reflection / string-based resolvers before deletion.",
        "Check git log for last touch and contact prior authors.",
        "Delete in a dedicated PR; revert is cheap if needed."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "YiPet/libs/apexcharts@3.46.0/apexcharts.min.js",
      "line": null,
      "message": "Orphan file — no inbound references detected, potential dead code",
      "metric": "0 inbound refs",
      "impact": "No inbound references → dead code or forgotten entry; inflates cognitive surface.",
      "effort": "low",
      "scoreUplift": 2,
      "recommendations": [
        "Grep for dynamic imports / reflection / string-based resolvers before deletion.",
        "Check git log for last touch and contact prior authors.",
        "Delete in a dedicated PR; revert is cheap if needed."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "YiPet/libs/mermaid.min.js",
      "line": null,
      "message": "Orphan file — no inbound references detected, potential dead code",
      "metric": "0 inbound refs",
      "impact": "No inbound references → dead code or forgotten entry; inflates cognitive surface.",
      "effort": "low",
      "scoreUplift": 2,
      "recommendations": [
        "Grep for dynamic imports / reflection / string-based resolvers before deletion.",
        "Check git log for last touch and contact prior authors.",
        "Delete in a dedicated PR; revert is cheap if needed."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "YiPet/libs/vue.global.js",
      "line": null,
      "message": "Orphan file — no inbound references detected, potential dead code",
      "metric": "0 inbound refs",
      "impact": "No inbound references → dead code or forgotten entry; inflates cognitive surface.",
      "effort": "low",
      "scoreUplift": 2,
      "recommendations": [
        "Grep for dynamic imports / reflection / string-based resolvers before deletion.",
        "Check git log for last touch and contact prior authors.",
        "Delete in a dedicated PR; revert is cheap if needed."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "YiPet/libs/xlsx@0.20.3/xlsx.full.min.js",
      "line": null,
      "message": "Orphan file — no inbound references detected, potential dead code",
      "metric": "0 inbound refs",
      "impact": "No inbound references → dead code or forgotten entry; inflates cognitive surface.",
      "effort": "low",
      "scoreUplift": 2,
      "recommendations": [
        "Grep for dynamic imports / reflection / string-based resolvers before deletion.",
        "Check git log for last touch and contact prior authors.",
        "Delete in a dedicated PR; revert is cheap if needed."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "YiPot/public/tesseract-core-simd-lstm.wasm.js",
      "line": null,
      "message": "Orphan file — no inbound references detected, potential dead code",
      "metric": "0 inbound refs",
      "impact": "No inbound references → dead code or forgotten entry; inflates cognitive surface.",
      "effort": "low",
      "scoreUplift": 2,
      "recommendations": [
        "Grep for dynamic imports / reflection / string-based resolvers before deletion.",
        "Check git log for last touch and contact prior authors.",
        "Delete in a dedicated PR; revert is cheap if needed."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "Websites/Corporato/js/slick.js",
      "line": 1,
      "message": "File exceeds 2000 LOC (2892 lines) — monolithic js file, split candidate",
      "metric": "2892 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "effort": "high",
      "scoreUplift": 10,
      "recommendations": [
        "Split slick.js by concern into modular sub-files.",
        "Move pure helpers into dedicated utility modules.",
        "Add a LOC budget to CI so the file cannot silently regress.",
        "After split, re-run this report and confirm fan-out drops before merge."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "Websites/Duck/script.js",
      "line": 1,
      "message": "File exceeds 2000 LOC (3286 lines) — monolithic js file, split candidate",
      "metric": "3286 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "effort": "high",
      "scoreUplift": 10,
      "recommendations": [
        "Split script.js by concern into modular sub-files.",
        "Move pure helpers into dedicated utility modules.",
        "Add a LOC budget to CI so the file cannot silently regress.",
        "After split, re-run this report and confirm fan-out drops before merge."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "Websites/Prompt/assets/libs/leaflet/leaflet-src.esm.js",
      "line": 1,
      "message": "File exceeds 2000 LOC (13968 lines) — monolithic js file, split candidate",
      "metric": "13968 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "effort": "high",
      "scoreUplift": 10,
      "recommendations": [
        "Split leaflet-src.esm.js by concern into modular sub-files.",
        "Move pure helpers into dedicated utility modules.",
        "Add a LOC budget to CI so the file cannot silently regress.",
        "After split, re-run this report and confirm fan-out drops before merge."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "Websites/Prompt/assets/libs/leaflet/leaflet-src.js",
      "line": 1,
      "message": "File exceeds 2000 LOC (14062 lines) — monolithic js file, split candidate",
      "metric": "14062 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "effort": "high",
      "scoreUplift": 10,
      "recommendations": [
        "Split leaflet-src.js by concern into modular sub-files.",
        "Move pure helpers into dedicated utility modules.",
        "Add a LOC budget to CI so the file cannot silently regress.",
        "After split, re-run this report and confirm fan-out drops before merge."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "coupling",
      "file": "Websites/Prompt/assets/libs/swiper/esm/components/core/core-class.js",
      "line": 1,
      "message": "Extreme fan-out (22) — imports 22+ modules, central coupling hub",
      "metric": "fan-out 22",
      "impact": "God module → changes ripple to many dependents; any edit here risks cascading failures.",
      "effort": "high",
      "scoreUplift": 8,
      "recommendations": [
        "Split into domain-scoped modules.",
        "Introduce a façade pattern for cross-cutting services.",
        "Add module-boundary lint to enforce fan-out limits."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "Websites/Socialite/public/assets/js/simplebar.js",
      "line": 1,
      "message": "File exceeds 2000 LOC (4391 lines) — monolithic js file, split candidate",
      "metric": "4391 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "effort": "high",
      "scoreUplift": 10,
      "recommendations": [
        "Split simplebar.js by concern into modular sub-files.",
        "Move pure helpers into dedicated utility modules.",
        "Add a LOC budget to CI so the file cannot silently regress.",
        "After split, re-run this report and confirm fan-out drops before merge."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "YiH5/views/home/index.js",
      "line": 1,
      "message": "File exceeds 2000 LOC (3348 lines) — monolithic js file, split candidate",
      "metric": "3348 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "effort": "high",
      "scoreUplift": 10,
      "recommendations": [
        "Split index.js by concern into modular sub-files.",
        "Move pure helpers into dedicated utility modules.",
        "Add a LOC budget to CI so the file cannot silently regress.",
        "After split, re-run this report and confirm fan-out drops before merge."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "YiPet/libs/mermaid.min.js",
      "line": 1,
      "message": "File exceeds 2000 LOC (177342 lines) — monolithic js file, split candidate",
      "metric": "177342 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "effort": "high",
      "scoreUplift": 10,
      "recommendations": [
        "Split mermaid.min.js by concern into modular sub-files.",
        "Move pure helpers into dedicated utility modules.",
        "Add a LOC budget to CI so the file cannot silently regress.",
        "After split, re-run this report and confirm fan-out drops before merge."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "YiPet/libs/slick@1.6.0/js/slick.js",
      "line": 1,
      "message": "File exceeds 2000 LOC (2892 lines) — monolithic js file, split candidate",
      "metric": "2892 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "effort": "high",
      "scoreUplift": 10,
      "recommendations": [
        "Split slick.js by concern into modular sub-files.",
        "Move pure helpers into dedicated utility modules.",
        "Add a LOC budget to CI so the file cannot silently regress.",
        "After split, re-run this report and confirm fan-out drops before merge."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "YiPet/libs/vue.global.js",
      "line": 1,
      "message": "File exceeds 2000 LOC (17739 lines) — monolithic js file, split candidate",
      "metric": "17739 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "effort": "high",
      "scoreUplift": 10,
      "recommendations": [
        "Split vue.global.js by concern into modular sub-files.",
        "Move pure helpers into dedicated utility modules.",
        "Add a LOC budget to CI so the file cannot silently regress.",
        "After split, re-run this report and confirm fan-out drops before merge."
      ]
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "YiWeb/src/views/aicr/components/codeView/index.js",
      "line": 1,
      "message": "File exceeds 2000 LOC (2912 lines) — monolithic js file, split candidate",
      "metric": "2912 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "effort": "high",
      "scoreUplift": 10,
      "recommendations": [
        "Split index.js by concern into modular sub-files.",
        "Move pure helpers into dedicated utility modules.",
        "Add a LOC budget to CI so the file cannot silently regress.",
        "After split, re-run this report and confirm fan-out drops before merge."
      ]
    }
  ],
  "summary": {
    "totalFiles": 4462,
    "totalBytes": 194304348,
    "totalBytesHuman": "185.30 MB",
    "totalLines": 1462127,
    "maxDepth": 4,
    "criticalCount": 11,
    "hotspotCount": 20,
    "cycleCount": 1,
    "staleCount": 0
  },
  "treemap": [
    {
      "name": "Websites/DpMarket",
      "bytes": 33417031,
      "humanBytes": "31.87 MB"
    },
    {
      "name": "Websites/Prompt",
      "bytes": 21730363,
      "humanBytes": "20.72 MB"
    },
    {
      "name": "Websites/Mortal",
      "bytes": 19451292,
      "humanBytes": "18.55 MB"
    },
    {
      "name": "Websites/Adminto",
      "bytes": 19186123,
      "humanBytes": "18.30 MB"
    },
    {
      "name": "Websites/News",
      "bytes": 14568889,
      "humanBytes": "13.89 MB"
    },
    {
      "name": "Websites/Arter",
      "bytes": 13351084,
      "humanBytes": "12.73 MB"
    },
    {
      "name": "Websites/Socialite",
      "bytes": 12345027,
      "humanBytes": "11.77 MB"
    },
    {
      "name": "YiPet/libs",
      "bytes": 11818290,
      "humanBytes": "11.27 MB"
    },
    {
      "name": "YiPet/cdn",
      "bytes": 8813892,
      "humanBytes": "8.41 MB"
    },
    {
      "name": "YiPot/asset",
      "bytes": 7685326,
      "humanBytes": "7.33 MB"
    },
    {
      "name": "YiPot/public",
      "bytes": 5845543,
      "humanBytes": "5.57 MB"
    },
    {
      "name": "Websites/Corporato",
      "bytes": 5655354,
      "humanBytes": "5.39 MB"
    },
    {
      "name": "Websites/Kasy",
      "bytes": 5600522,
      "humanBytes": "5.34 MB"
    },
    {
      "name": "YiPet/assets",
      "bytes": 3662115,
      "humanBytes": "3.49 MB"
    },
    {
      "name": "YiPot/src-tauri",
      "bytes": 2456605,
      "humanBytes": "2.34 MB"
    },
    {
      "name": "Websites/Blog",
      "bytes": 2013902,
      "humanBytes": "1.92 MB"
    },
    {
      "name": "Websites/Blogez",
      "bytes": 1824881,
      "humanBytes": "1.74 MB"
    },
    {
      "name": "YiWeb/src",
      "bytes": 1703506,
      "humanBytes": "1.62 MB"
    },
    {
      "name": "YiPet/modules",
      "bytes": 1018081,
      "humanBytes": "994 KB"
    },
    {
      "name": "YiPot/src",
      "bytes": 721439,
      "humanBytes": "705 KB"
    }
  ],
  "types": [
    {
      "type": ".img",
      "fileCount": 2327,
      "pctFiles": 52.2,
      "totalBytes": 106220172,
      "totalBytesHuman": "101.30 MB",
      "pctBytes": 54.7,
      "totalLines": 419485
    },
    {
      "type": ".font",
      "fileCount": 158,
      "pctFiles": 3.5,
      "totalBytes": 27622488,
      "totalBytesHuman": "26.34 MB",
      "pctBytes": 14.2,
      "totalLines": 173706
    },
    {
      "type": ".js",
      "fileCount": 881,
      "pctFiles": 19.7,
      "totalBytes": 26735023,
      "totalBytesHuman": "25.50 MB",
      "pctBytes": 13.8,
      "totalLines": 395554
    },
    {
      "type": ".html",
      "fileCount": 325,
      "pctFiles": 7.3,
      "totalBytes": 15383108,
      "totalBytesHuman": "14.67 MB",
      "pctBytes": 7.9,
      "totalLines": 257979
    },
    {
      "type": ".media",
      "fileCount": 2,
      "pctFiles": 0,
      "totalBytes": 6506015,
      "totalBytesHuman": "6.20 MB",
      "pctBytes": 3.3,
      "totalLines": 25216
    },
    {
      "type": ".css",
      "fileCount": 228,
      "pctFiles": 5.1,
      "totalBytes": 6065134,
      "totalBytesHuman": "5.78 MB",
      "pctBytes": 3.1,
      "totalLines": 98128
    },
    {
      "type": ".map",
      "fileCount": 8,
      "pctFiles": 0.2,
      "totalBytes": 1847559,
      "totalBytesHuman": "1.76 MB",
      "pctBytes": 1,
      "totalLines": 8
    },
    {
      "type": ".icns",
      "fileCount": 2,
      "pctFiles": 0,
      "totalBytes": 1052796,
      "totalBytesHuman": "1.00 MB",
      "pctBytes": 0.5,
      "totalLines": 1850
    },
    {
      "type": ".scss",
      "fileCount": 157,
      "pctFiles": 3.5,
      "totalBytes": 899523,
      "totalBytesHuman": "878 KB",
      "pctBytes": 0.5,
      "totalLines": 52752
    },
    {
      "type": ".jsx",
      "fileCount": 141,
      "pctFiles": 3.2,
      "totalBytes": 657061,
      "totalBytesHuman": "642 KB",
      "pctBytes": 0.3,
      "totalLines": 16161
    },
    {
      "type": ".other",
      "fileCount": 17,
      "pctFiles": 0.4,
      "totalBytes": 507170,
      "totalBytesHuman": "495 KB",
      "pctBytes": 0.3,
      "totalLines": 2291
    },
    {
      "type": ".py",
      "fileCount": 48,
      "pctFiles": 1.1,
      "totalBytes": 228596,
      "totalBytesHuman": "223 KB",
      "pctBytes": 0.1,
      "totalLines": 6465
    },
    {
      "type": ".json",
      "fileCount": 23,
      "pctFiles": 0.5,
      "totalBytes": 215392,
      "totalBytesHuman": "210 KB",
      "pctBytes": 0.1,
      "totalLines": 1835
    },
    {
      "type": ".txt",
      "fileCount": 29,
      "pctFiles": 0.6,
      "totalBytes": 120034,
      "totalBytesHuman": "117 KB",
      "pctBytes": 0.1,
      "totalLines": 2553
    },
    {
      "type": ".rs",
      "fileCount": 15,
      "pctFiles": 0.3,
      "totalBytes": 84685,
      "totalBytesHuman": "83 KB",
      "pctBytes": 0,
      "totalLines": 2391
    },
    {
      "type": ".ts",
      "fileCount": 71,
      "pctFiles": 1.6,
      "totalBytes": 74565,
      "totalBytesHuman": "73 KB",
      "pctBytes": 0,
      "totalLines": 3173
    },
    {
      "type": ".vue",
      "fileCount": 9,
      "pctFiles": 0.2,
      "totalBytes": 20973,
      "totalBytesHuman": "20 KB",
      "pctBytes": 0,
      "totalLines": 699
    },
    {
      "type": ".svelte",
      "fileCount": 4,
      "pctFiles": 0.1,
      "totalBytes": 13240,
      "totalBytesHuman": "13 KB",
      "pctBytes": 0,
      "totalLines": 516
    },
    {
      "type": ".xml",
      "fileCount": 1,
      "pctFiles": 0,
      "totalBytes": 12978,
      "totalBytesHuman": "13 KB",
      "pctBytes": 0,
      "totalLines": 237
    },
    {
      "type": ".md",
      "fileCount": 2,
      "pctFiles": 0,
      "totalBytes": 12598,
      "totalBytesHuman": "12 KB",
      "pctBytes": 0,
      "totalLines": 408
    },
    {
      "type": ".php",
      "fileCount": 3,
      "pctFiles": 0.1,
      "totalBytes": 7525,
      "totalBytesHuman": "7 KB",
      "pctBytes": 0,
      "totalLines": 192
    },
    {
      "type": ".mjs",
      "fileCount": 2,
      "pctFiles": 0,
      "totalBytes": 7395,
      "totalBytesHuman": "7 KB",
      "pctBytes": 0,
      "totalLines": 174
    },
    {
      "type": ".cjs",
      "fileCount": 1,
      "pctFiles": 0,
      "totalBytes": 2619,
      "totalBytesHuman": "3 KB",
      "pctBytes": 0,
      "totalLines": 76
    },
    {
      "type": ".toml",
      "fileCount": 1,
      "pctFiles": 0,
      "totalBytes": 2548,
      "totalBytesHuman": "2 KB",
      "pctBytes": 0,
      "totalLines": 58
    },
    {
      "type": ".yaml",
      "fileCount": 1,
      "pctFiles": 0,
      "totalBytes": 2295,
      "totalBytesHuman": "2 KB",
      "pctBytes": 0,
      "totalLines": 125
    },
    {
      "type": ".plist",
      "fileCount": 1,
      "pctFiles": 0,
      "totalBytes": 1196,
      "totalBytesHuman": "1 KB",
      "pctBytes": 0,
      "totalLines": 35
    },
    {
      "type": ".patch",
      "fileCount": 1,
      "pctFiles": 0,
      "totalBytes": 1091,
      "totalBytesHuman": "1 KB",
      "pctBytes": 0,
      "totalLines": 38
    },
    {
      "type": ".sh",
      "fileCount": 3,
      "pctFiles": 0.1,
      "totalBytes": 392,
      "totalBytesHuman": "392 B",
      "pctBytes": 0,
      "totalLines": 15
    },
    {
      "type": ".ps1",
      "fileCount": 1,
      "pctFiles": 0,
      "totalBytes": 177,
      "totalBytesHuman": "177 B",
      "pctBytes": 0,
      "totalLines": 7
    }
  ],
  "histogram": [
    {
      "bucket": "0",
      "count": 676,
      "pctFiles": 15.2
    },
    {
      "bucket": "1-50",
      "count": 1792,
      "pctFiles": 40.2
    },
    {
      "bucket": "51-100",
      "count": 510,
      "pctFiles": 11.4
    },
    {
      "bucket": "101-250",
      "count": 592,
      "pctFiles": 13.3
    },
    {
      "bucket": "251-500",
      "count": 362,
      "pctFiles": 8.1
    },
    {
      "bucket": "501-1000",
      "count": 294,
      "pctFiles": 6.6
    },
    {
      "bucket": "1001-2000",
      "count": 150,
      "pctFiles": 3.4
    },
    {
      "bucket": "2000+",
      "count": 86,
      "pctFiles": 1.9
    }
  ],
  "largest": [
    {
      "path": "YiPet/libs/mermaid.min.js",
      "bytes": 6935293,
      "bytesHuman": "6.61 MB",
      "lines": 177342,
      "type": ".js",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/Adminto/Admin/src/assets/images/lightbox-video.mp4",
      "bytes": 4363546,
      "bytesHuman": "4.16 MB",
      "lines": 16762,
      "type": ".media",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "YiPot/public/tesseract-core-simd-lstm.wasm.js",
      "bytes": 3938114,
      "bytesHuman": "3.76 MB",
      "lines": 281,
      "type": ".js",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/Mortal/assets/fonts/materialdesignicons-webfont.svg",
      "bytes": 3658029,
      "bytesHuman": "3.49 MB",
      "lines": 9879,
      "type": ".img",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/DpMarket/assets/images/gradients/pricing-gradient-bg.png",
      "bytes": 3473214,
      "bytesHuman": "3.31 MB",
      "lines": 9341,
      "type": ".img",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/Adminto/Admin/src/assets/fonts/lucide.svg",
      "bytes": 3210820,
      "bytesHuman": "3.06 MB",
      "lines": 15298,
      "type": ".img",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/Arter/img/face-2.png",
      "bytes": 2312355,
      "bytesHuman": "2.21 MB",
      "lines": 8462,
      "type": ".img",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/DpMarket/assets/images/gradients/newsletter-gradient-bg.png",
      "bytes": 2291592,
      "bytesHuman": "2.19 MB",
      "lines": 4285,
      "type": ".img",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/DpMarket/assets/images/gradients/thank-you-gradient.png",
      "bytes": 2168995,
      "bytesHuman": "2.07 MB",
      "lines": 6766,
      "type": ".img",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/Mortal/assets/images/modern.mp4",
      "bytes": 2142469,
      "bytesHuman": "2.04 MB",
      "lines": 8454,
      "type": ".media",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/Prompt/assets/images/hero/marketing.png",
      "bytes": 1701077,
      "bytesHuman": "1.62 MB",
      "lines": 17262,
      "type": ".img",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/DpMarket/assets/images/gradients/footer-gradient-bg.png",
      "bytes": 1607977,
      "bytesHuman": "1.53 MB",
      "lines": 4408,
      "type": ".img",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "YiPot/asset/eg4.gif",
      "bytes": 1506035,
      "bytesHuman": "1.44 MB",
      "lines": 6792,
      "type": ".img",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/Corporato/images/liader.gif",
      "bytes": 1433594,
      "bytesHuman": "1.37 MB",
      "lines": 6144,
      "type": ".img",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "YiPot/asset/eg3.gif",
      "bytes": 1390562,
      "bytesHuman": "1.33 MB",
      "lines": 6884,
      "type": ".img",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/DpMarket/assets/images/gradients/banner-gradient.png",
      "bytes": 1314807,
      "bytesHuman": "1.25 MB",
      "lines": 5093,
      "type": ".img",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/Arter/img/testimonials/face-2.jpg",
      "bytes": 1282373,
      "bytesHuman": "1.22 MB",
      "lines": 5119,
      "type": ".img",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/Adminto/Admin/src/assets/fonts/materialdesignicons-webfont.eot",
      "bytes": 1280212,
      "bytesHuman": "1.22 MB",
      "lines": 8669,
      "type": ".font",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/Mortal/assets/libs/@mdi/font/fonts/materialdesignicons-webfont.eot",
      "bytes": 1280212,
      "bytesHuman": "1.22 MB",
      "lines": 8669,
      "type": ".font",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "Websites/Adminto/Admin/src/assets/fonts/materialdesignicons-webfont.ttf",
      "bytes": 1279992,
      "bytesHuman": "1.22 MB",
      "lines": 8669,
      "type": ".font",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    }
  ],
  "fanin": [
    {
      "path": "YiPot/src/utils/service_instance.ts",
      "fanIn": 53,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 50,
      "type": ".ts"
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/utils/utils.js",
      "fanIn": 33,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 162,
      "type": ".js"
    },
    {
      "path": "YiPot/src/hooks/useConfig.jsx",
      "fanIn": 31,
      "fanOut": 2,
      "extDeps": 2,
      "lines": 67,
      "type": ".jsx"
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/utils/dom.js",
      "fanIn": 23,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 45,
      "type": ".js"
    },
    {
      "path": "YiPot/src/utils/env.js",
      "fanIn": 21,
      "fanOut": 0,
      "extDeps": 2,
      "lines": 14,
      "type": ".js"
    },
    {
      "path": "Websites/Flow/packages/flow-designer/src/types/enums.ts",
      "fanIn": 11,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 31,
      "type": ".ts"
    },
    {
      "path": "YiWeb/src/views/aicr/utils/fileFieldNormalizer.js",
      "fanIn": 11,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 192,
      "type": ".js"
    },
    {
      "path": "YiPot/src/utils/store.js",
      "fanIn": 8,
      "fanOut": 0,
      "extDeps": 4,
      "lines": 16,
      "type": ".js"
    },
    {
      "path": "Websites/Flow/packages/flow-designer/src/tool.ts",
      "fanIn": 7,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 17,
      "type": ".ts"
    },
    {
      "path": "YiH5/utils/index.js",
      "fanIn": 7,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 135,
      "type": ".js"
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/react/utils.js",
      "fanIn": 6,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 58,
      "type": ".js"
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/svelte/utils.js",
      "fanIn": 6,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 58,
      "type": ".js"
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/vue/utils.js",
      "fanIn": 6,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 58,
      "type": ".js"
    },
    {
      "path": "YiPot/src/utils/language.ts",
      "fanIn": 6,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 68,
      "type": ".ts"
    },
    {
      "path": "YiH5/services/client.js",
      "fanIn": 4,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 158,
      "type": ".js"
    },
    {
      "path": "YiPot/src/utils/invoke_plugin.js",
      "fanIn": 4,
      "fanOut": 1,
      "extDeps": 6,
      "lines": 35,
      "type": ".js"
    },
    {
      "path": "Websites/Flow/packages/flow-designer/src/ui/UIAdapter.ts",
      "fanIn": 3,
      "fanOut": 0,
      "extDeps": 2,
      "lines": 122,
      "type": ".ts"
    },
    {
      "path": "YiH5/views/home/state.js",
      "fanIn": 3,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 216,
      "type": ".js"
    },
    {
      "path": "YiWeb/src/views/aicr/hooks/state/store.js",
      "fanIn": 3,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 3,
      "type": ".js"
    },
    {
      "path": "YiWeb/src/views/story/hooks/validators.js",
      "fanIn": 3,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 142,
      "type": ".js"
    }
  ],
  "fanout": [
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/components/core/core-class.js",
      "fanIn": 1,
      "fanOut": 22,
      "extDeps": 0,
      "lines": 591,
      "type": ".js"
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/swiper-bundle.esm.js",
      "fanIn": 0,
      "fanOut": 20,
      "extDeps": 0,
      "lines": 37,
      "type": ".js"
    },
    {
      "path": "YiWeb/src/views/aicr/hooks/useMethods.js",
      "fanIn": 0,
      "fanOut": 18,
      "extDeps": 6,
      "lines": 295,
      "type": ".js"
    },
    {
      "path": "YiH5/views/home/index.js",
      "fanIn": 0,
      "fanOut": 12,
      "extDeps": 1,
      "lines": 3348,
      "type": ".js"
    },
    {
      "path": "Websites/Flow/packages/flow-designer/src/plugins/Flow.ts",
      "fanIn": 1,
      "fanOut": 10,
      "extDeps": 2,
      "lines": 398,
      "type": ".ts"
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/components/core/update/index.js",
      "fanIn": 1,
      "fanOut": 9,
      "extDeps": 0,
      "lines": 19,
      "type": ".js"
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/react/swiper.js",
      "fanIn": 1,
      "fanOut": 9,
      "extDeps": 1,
      "lines": 205,
      "type": ".js"
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/vue/swiper.js",
      "fanIn": 1,
      "fanOut": 8,
      "extDeps": 1,
      "lines": 643,
      "type": ".js"
    },
    {
      "path": "YiWeb/src/views/aicr/hooks/state/storeFactory.js",
      "fanIn": 0,
      "fanOut": 8,
      "extDeps": 3,
      "lines": 71,
      "type": ".js"
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/components/core/slide/index.js",
      "fanIn": 1,
      "fanOut": 7,
      "extDeps": 0,
      "lines": 15,
      "type": ".js"
    },
    {
      "path": "YiWeb/src/views/aicr/hooks/sessionChatContextMethods.js",
      "fanIn": 1,
      "fanOut": 7,
      "extDeps": 1,
      "lines": 728,
      "type": ".js"
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/components/core/events/index.js",
      "fanIn": 1,
      "fanOut": 6,
      "extDeps": 1,
      "lines": 135,
      "type": ".js"
    },
    {
      "path": "YiWeb/src/views/story/hooks/state/storeFactory.js",
      "fanIn": 0,
      "fanOut": 6,
      "extDeps": 0,
      "lines": 35,
      "type": ".js"
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/components/core/manipulation/index.js",
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 0,
      "lines": 11,
      "type": ".js"
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/components/core/translate/index.js",
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 0,
      "lines": 11,
      "type": ".js"
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/svelte/swiper.js",
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 2,
      "lines": 553,
      "type": ".js"
    },
    {
      "path": "YiPot/src/window/Config/pages/History/index.jsx",
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 11,
      "lines": 380,
      "type": ".jsx"
    },
    {
      "path": "YiPot/src/window/Translate/components/TargetArea/index.jsx",
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 16,
      "lines": 459,
      "type": ".jsx"
    },
    {
      "path": "YiPot/src/window/Config/pages/Backup/index.jsx",
      "fanIn": 0,
      "fanOut": 4,
      "extDeps": 15,
      "lines": 317,
      "type": ".jsx"
    },
    {
      "path": "YiPot/src/window/Translate/components/SourceArea/index.jsx",
      "fanIn": 0,
      "fanOut": 4,
      "extDeps": 8,
      "lines": 370,
      "type": ".jsx"
    }
  ],
  "hotspots": [
    {
      "path": "YiPet/libs/mermaid.min.js",
      "bytes": 6935293,
      "bytesHuman": "6.61 MB",
      "lines": 177342,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 88.67
    },
    {
      "path": "Websites/Adminto/Admin/src/assets/scss/icons/_materialdesignicons.scss",
      "bytes": 409198,
      "bytesHuman": "400 KB",
      "lines": 29457,
      "type": ".scss",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 14.73
    },
    {
      "path": "Websites/Prompt/assets/libs/leaflet/reference-1.6.0-newleafdoc.html",
      "bytes": 820089,
      "bytesHuman": "801 KB",
      "lines": 25076,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 12.54
    },
    {
      "path": "Websites/Prompt/assets/libs/leaflet/reference-1.6.0-oldleafdoc.html",
      "bytes": 821856,
      "bytesHuman": "803 KB",
      "lines": 25051,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 12.53
    },
    {
      "path": "Websites/Prompt/assets/libs/leaflet/reference-1.6.0.html",
      "bytes": 821856,
      "bytesHuman": "803 KB",
      "lines": 25051,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 12.53
    },
    {
      "path": "YiPot/src/utils/service_instance.ts",
      "bytes": 1745,
      "bytesHuman": "2 KB",
      "lines": 50,
      "type": ".ts",
      "fanIn": 53,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 10.63
    },
    {
      "path": "YiPet/libs/vue.global.js",
      "bytes": 561941,
      "bytesHuman": "549 KB",
      "lines": 17739,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 8.87
    },
    {
      "path": "Websites/Prompt/assets/images/hero/marketing.png",
      "bytes": 1701077,
      "bytesHuman": "1.62 MB",
      "lines": 17262,
      "type": ".img",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 8.63
    },
    {
      "path": "Websites/Adminto/Admin/src/assets/images/lightbox-video.mp4",
      "bytes": 4363546,
      "bytesHuman": "4.16 MB",
      "lines": 16762,
      "type": ".media",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 8.38
    },
    {
      "path": "Websites/Adminto/Admin/src/assets/fonts/lucide.svg",
      "bytes": 3210820,
      "bytesHuman": "3.06 MB",
      "lines": 15298,
      "type": ".img",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 7.65
    },
    {
      "path": "Websites/Prompt/assets/css/theme.css",
      "bytes": 370867,
      "bytesHuman": "362 KB",
      "lines": 14277,
      "type": ".css",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 7.14
    },
    {
      "path": "Websites/Prompt/assets/libs/leaflet/leaflet-src.js",
      "bytes": 431131,
      "bytesHuman": "421 KB",
      "lines": 14062,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 7.03
    },
    {
      "path": "Websites/Prompt/assets/libs/leaflet/leaflet-src.esm.js",
      "bytes": 406479,
      "bytesHuman": "397 KB",
      "lines": 13968,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 6.98
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/utils/utils.js",
      "bytes": 4616,
      "bytesHuman": "5 KB",
      "lines": 162,
      "type": ".js",
      "fanIn": 33,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 6.68
    },
    {
      "path": "YiPot/src/hooks/useConfig.jsx",
      "bytes": 1925,
      "bytesHuman": "2 KB",
      "lines": 67,
      "type": ".jsx",
      "fanIn": 31,
      "fanOut": 2,
      "maxDepth": 1,
      "score": 6.63
    },
    {
      "path": "Websites/Prompt/assets/images/hero/marketing1.svg",
      "bytes": 953563,
      "bytesHuman": "931 KB",
      "lines": 12331,
      "type": ".img",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 6.17
    },
    {
      "path": "Websites/Mortal/assets/fonts/materialdesignicons-webfont.svg",
      "bytes": 3658029,
      "bytesHuman": "3.49 MB",
      "lines": 9879,
      "type": ".img",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.94
    },
    {
      "path": "Websites/DpMarket/assets/images/gradients/pricing-gradient-bg.png",
      "bytes": 3473214,
      "bytesHuman": "3.31 MB",
      "lines": 9341,
      "type": ".img",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.67
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/utils/dom.js",
      "bytes": 1203,
      "bytesHuman": "1 KB",
      "lines": 45,
      "type": ".js",
      "fanIn": 23,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.62
    },
    {
      "path": "Websites/DpMarket/index-two.html",
      "bytes": 462819,
      "bytesHuman": "452 KB",
      "lines": 8716,
      "type": ".html",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.36
    }
  ],
  "orphans": [
    {
      "path": "YiPet/libs/mermaid.min.js",
      "bytes": 6935293,
      "bytesHuman": "6.61 MB",
      "lines": 177342,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1773.42
    },
    {
      "path": "YiPot/public/tesseract-core-simd-lstm.wasm.js",
      "bytes": 3938114,
      "bytesHuman": "3.76 MB",
      "lines": 281,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 2.81
    },
    {
      "path": "YiPet/libs/xlsx@0.20.3/xlsx.full.min.js",
      "bytes": 951904,
      "bytesHuman": "930 KB",
      "lines": 24,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.24
    },
    {
      "path": "Websites/Prompt/assets/js/vendor.min.js",
      "bytes": 682105,
      "bytesHuman": "666 KB",
      "lines": 356,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.56
    },
    {
      "path": "Websites/Prompt/assets/js/vendor.js",
      "bytes": 682065,
      "bytesHuman": "666 KB",
      "lines": 354,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.54
    },
    {
      "path": "YiPet/libs/vue.global.js",
      "bytes": 561941,
      "bytesHuman": "549 KB",
      "lines": 17739,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 177.39
    },
    {
      "path": "Websites/DpMarket/assets/js/apexchart.js",
      "bytes": 524399,
      "bytesHuman": "512 KB",
      "lines": 13,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.13
    },
    {
      "path": "YiPet/libs/apexcharts@3.46.0/apexcharts.min.js",
      "bytes": 524399,
      "bytesHuman": "512 KB",
      "lines": 13,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.13
    },
    {
      "path": "Websites/Prompt/assets/libs/leaflet/leaflet-src.js",
      "bytes": 431131,
      "bytesHuman": "421 KB",
      "lines": 14062,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 140.62
    },
    {
      "path": "Websites/Prompt/assets/libs/leaflet/leaflet-src.esm.js",
      "bytes": 406479,
      "bytesHuman": "397 KB",
      "lines": 13968,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 139.68
    },
    {
      "path": "YiPet/libs/jspdf@2.5.2/jspdf.umd.min.js",
      "bytes": 365730,
      "bytesHuman": "357 KB",
      "lines": 398,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.98
    },
    {
      "path": "Websites/Adminto/Admin/src/assets/js/pages/icons-material-design.init.js",
      "bytes": 356486,
      "bytesHuman": "348 KB",
      "lines": 42,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.42
    },
    {
      "path": "YiPet/libs/html2canvas@1.4.1/html2canvas.min.js",
      "bytes": 198689,
      "bytesHuman": "194 KB",
      "lines": 19,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.19
    },
    {
      "path": "Websites/Duck/script.js",
      "bytes": 172967,
      "bytesHuman": "169 KB",
      "lines": 3286,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 32.86
    },
    {
      "path": "Websites/Socialite/public/assets/js/simplebar.js",
      "bytes": 150426,
      "bytesHuman": "147 KB",
      "lines": 4391,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 43.91
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/swiper-bundle.esm.browser.min.js",
      "bytes": 147812,
      "bytesHuman": "144 KB",
      "lines": 13,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.13
    },
    {
      "path": "YiPet/libs/vue.global.prod.js",
      "bytes": 147796,
      "bytesHuman": "144 KB",
      "lines": 12,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.12
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/swiper-bundle.min.js",
      "bytes": 142248,
      "bytesHuman": "139 KB",
      "lines": 13,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.13
    },
    {
      "path": "Websites/Prompt/assets/libs/leaflet/leaflet.js",
      "bytes": 141941,
      "bytesHuman": "139 KB",
      "lines": 5,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.05
    },
    {
      "path": "YiPet/libs/leaflet@1.1.1/leaflet.js",
      "bytes": 141941,
      "bytesHuman": "139 KB",
      "lines": 5,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.05
    },
    {
      "path": "Websites/Socialite/public/assets/js/uikit.min.js",
      "bytes": 135975,
      "bytesHuman": "133 KB",
      "lines": 1,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.01
    },
    {
      "path": "Websites/Kasy/js/swiper-bundle.min.js",
      "bytes": 134834,
      "bytesHuman": "132 KB",
      "lines": 13,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.13
    },
    {
      "path": "YiPet/libs/swiper@7.0.3/js/swiper-bundle.min.js",
      "bytes": 134834,
      "bytesHuman": "132 KB",
      "lines": 13,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.13
    },
    {
      "path": "YiPet/libs/react@15.6.1/react-dom.min.js",
      "bytes": 130293,
      "bytesHuman": "127 KB",
      "lines": 15,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.15
    },
    {
      "path": "YiPot/public/worker.min.js",
      "bytes": 126321,
      "bytesHuman": "123 KB",
      "lines": 2,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.02
    },
    {
      "path": "Websites/Arter/js/plugins/swiper.min.js",
      "bytes": 124740,
      "bytesHuman": "122 KB",
      "lines": 13,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.13
    },
    {
      "path": "YiPet/libs/gsap/TweenMax.min.js",
      "bytes": 114925,
      "bytesHuman": "112 KB",
      "lines": 16,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.16
    },
    {
      "path": "Websites/Corporato/js/jquery-1.12.4.min.js",
      "bytes": 97163,
      "bytesHuman": "95 KB",
      "lines": 5,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.05
    },
    {
      "path": "Websites/News/assets/js/vendor/jquery-3.6.0.min.js",
      "bytes": 89503,
      "bytesHuman": "87 KB",
      "lines": 2,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.02
    },
    {
      "path": "Websites/Blog/js/jquery-3.6.0.min.js",
      "bytes": 89501,
      "bytesHuman": "87 KB",
      "lines": 2,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.02
    }
  ],
  "depthStats": {
    "max": 4,
    "mean": 0.27,
    "median": 0,
    "p90": 1,
    "filesAtMax": 1
  },
  "depthRanking": [
    {
      "path": "Websites/Prompt/assets/libs/swiper/swiper-bundle.esm.js",
      "bytes": 1817,
      "bytesHuman": "2 KB",
      "lines": 37,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 20,
      "maxDepth": 4,
      "score": 2.82
    },
    {
      "path": "Websites/Flow/examples/main.ts",
      "bytes": 503,
      "bytesHuman": "503 B",
      "lines": 14,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 1,
      "maxDepth": 3,
      "score": 0.71
    },
    {
      "path": "Websites/Flow/packages/flow-designer/index.ts",
      "bytes": 71,
      "bytesHuman": "71 B",
      "lines": 1,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 1,
      "maxDepth": 3,
      "score": 0.7
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/components/core/core-class.js",
      "bytes": 17274,
      "bytesHuman": "17 KB",
      "lines": 591,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 22,
      "maxDepth": 3,
      "score": 3.3
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/swiper-react.esm.js",
      "bytes": 393,
      "bytesHuman": "393 B",
      "lines": 15,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 2,
      "maxDepth": 3,
      "score": 0.81
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/swiper-svelte.esm.js",
      "bytes": 409,
      "bytesHuman": "409 B",
      "lines": 16,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 2,
      "maxDepth": 3,
      "score": 0.81
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/swiper-vue.esm.js",
      "bytes": 387,
      "bytesHuman": "387 B",
      "lines": 15,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 2,
      "maxDepth": 3,
      "score": 0.81
    },
    {
      "path": "YiH5/components/Chat/index.js",
      "bytes": 12806,
      "bytesHuman": "13 KB",
      "lines": 401,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 3,
      "maxDepth": 3,
      "score": 1.1
    },
    {
      "path": "YiH5/views/home/index.js",
      "bytes": 119975,
      "bytesHuman": "117 KB",
      "lines": 3348,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 12,
      "maxDepth": 3,
      "score": 3.47
    },
    {
      "path": "YiWeb/src/views/aicr/components/fileTree/index.js",
      "bytes": 181,
      "bytesHuman": "181 B",
      "lines": 4,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 1,
      "maxDepth": 3,
      "score": 0.7
    },
    {
      "path": "YiWeb/src/views/aicr/hooks/useMethods.js",
      "bytes": 9060,
      "bytesHuman": "9 KB",
      "lines": 295,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 18,
      "maxDepth": 3,
      "score": 2.55
    },
    {
      "path": "Websites/Flow/examples/App.vue",
      "bytes": 172,
      "bytesHuman": "172 B",
      "lines": 11,
      "type": ".vue",
      "fanIn": 1,
      "fanOut": 1,
      "maxDepth": 2,
      "score": 0.71
    },
    {
      "path": "Websites/Flow/packages/flow-designer/src/index.vue",
      "bytes": 3623,
      "bytesHuman": "4 KB",
      "lines": 127,
      "type": ".vue",
      "fanIn": 1,
      "fanOut": 3,
      "maxDepth": 2,
      "score": 0.96
    },
    {
      "path": "Websites/Flow/packages/flow-designer/src/ui/button/index.ts",
      "bytes": 55,
      "bytesHuman": "55 B",
      "lines": 1,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 1,
      "maxDepth": 2,
      "score": 0.5
    },
    {
      "path": "Websites/Flow/packages/flow-designer/src/ui/drawer/index.ts",
      "bytes": 55,
      "bytesHuman": "55 B",
      "lines": 1,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 1,
      "maxDepth": 2,
      "score": 0.5
    },
    {
      "path": "Websites/Flow/packages/flow-designer/src/ui/modal/index.ts",
      "bytes": 52,
      "bytesHuman": "52 B",
      "lines": 1,
      "type": ".ts",
      "fanIn": 0,
      "fanOut": 1,
      "maxDepth": 2,
      "score": 0.5
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/components/core/breakpoints/index.js",
      "bytes": 172,
      "bytesHuman": "172 B",
      "lines": 5,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 2,
      "maxDepth": 2,
      "score": 0.8
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/components/core/events/index.js",
      "bytes": 4883,
      "bytesHuman": "5 KB",
      "lines": 135,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 6,
      "maxDepth": 2,
      "score": 1.27
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/components/core/images/index.js",
      "bytes": 156,
      "bytesHuman": "156 B",
      "lines": 5,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 2,
      "maxDepth": 2,
      "score": 0.8
    },
    {
      "path": "Websites/Prompt/assets/libs/swiper/esm/components/core/loop/index.js",
      "bytes": 205,
      "bytesHuman": "205 B",
      "lines": 7,
      "type": ".js",
      "fanIn": 1,
      "fanOut": 3,
      "maxDepth": 2,
      "score": 0.9
    }
  ],
  "cycles": [
    {
      "severity": "warning",
      "path": "YiPot/src/services/translate/openai/Config.jsx → YiPot/src/services/translate/openai/index.jsx → YiPot/src/services/translate/openai/Config.jsx",
      "length": 2,
      "suggestedFix": "Extract shared logic into a dedicated module and have both files import from it."
    }
  ],
  "freshness": [
    {
      "path": "YiPot/.gitignore",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".other",
      "lines": 22
    },
    {
      "path": "YiPot/.node-version",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".other",
      "lines": 0
    },
    {
      "path": "YiPot/.npmrc",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".other",
      "lines": 4
    },
    {
      "path": "YiPot/.prettierignore",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".other",
      "lines": 6
    },
    {
      "path": "YiPot/.prettierrc.json",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".json",
      "lines": 21
    },
    {
      "path": "YiPot/.scripts/popclip/build.sh",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".sh",
      "lines": 7
    },
    {
      "path": "YiPot/.scripts/popclip/Config.plist",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".plist",
      "lines": 35
    },
    {
      "path": "YiPot/.scripts/popclip/Pot.png",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".img",
      "lines": 172
    },
    {
      "path": "YiPot/.scripts/popclip/Pot.sh",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".sh",
      "lines": 8
    },
    {
      "path": "YiPot/.scripts/snipdo/build.sh",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".sh",
      "lines": 0
    },
    {
      "path": "YiPot/.scripts/snipdo/pot.json",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".json",
      "lines": 12
    },
    {
      "path": "YiPot/.scripts/snipdo/pot.png",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".img",
      "lines": 172
    },
    {
      "path": "YiPot/.scripts/snipdo/pot.ps1",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".ps1",
      "lines": 7
    },
    {
      "path": "YiPot/com.pot_app.pot.metainfo.xml",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".xml",
      "lines": 237
    },
    {
      "path": "YiPot/daemon.html",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".html",
      "lines": 16
    },
    {
      "path": "YiPot/index.html",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".html",
      "lines": 27
    },
    {
      "path": "YiPot/package.json",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".json",
      "lines": 58
    },
    {
      "path": "YiPot/patches/hyprland.patch",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".patch",
      "lines": 38
    },
    {
      "path": "YiPot/postcss.config.js",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".js",
      "lines": 6
    },
    {
      "path": "YiPot/src-tauri/.gitignore",
      "ageDays": 3,
      "lastModified": "2026-07-17",
      "lastModifiedHuman": "2026-07-17",
      "type": ".other",
      "lines": 4
    }
  ],
  "freshnessBuckets": [
    {
      "bucket": "<30d",
      "count": 4462,
      "pctFiles": 100
    }
  ],
  "freshnessStats": {
    "asOf": 1784607892000,
    "asOfHuman": "2026-07-21",
    "maxAge": 3,
    "median": 0,
    "p90": 0,
    "staleCount": 0,
    "criticalCount": 0
  },
  "selfImprovement": {
    "topP0": [
      {
        "action": "File exceeds 2000 LOC (2892 lines) — monolithic js file, split candidate",
        "file": "Websites/Corporato/js/slick.js",
        "line": 1,
        "severity": "P0"
      },
      {
        "action": "File exceeds 2000 LOC (3286 lines) — monolithic js file, split candidate",
        "file": "Websites/Duck/script.js",
        "line": 1,
        "severity": "P0"
      },
      {
        "action": "File exceeds 2000 LOC (13968 lines) — monolithic js file, split candidate",
        "file": "Websites/Prompt/assets/libs/leaflet/leaflet-src.esm.js",
        "line": 1,
        "severity": "P0"
      },
      {
        "action": "File exceeds 2000 LOC (14062 lines) — monolithic js file, split candidate",
        "file": "Websites/Prompt/assets/libs/leaflet/leaflet-src.js",
        "line": 1,
        "severity": "P0"
      },
      {
        "action": "Extreme fan-out (22) — imports 22+ modules, central coupling hub",
        "file": "Websites/Prompt/assets/libs/swiper/esm/components/core/core-class.js",
        "line": 1,
        "severity": "P0"
      },
      {
        "action": "File exceeds 2000 LOC (4391 lines) — monolithic js file, split candidate",
        "file": "Websites/Socialite/public/assets/js/simplebar.js",
        "line": 1,
        "severity": "P0"
      },
      {
        "action": "File exceeds 2000 LOC (3348 lines) — monolithic js file, split candidate",
        "file": "YiH5/views/home/index.js",
        "line": 1,
        "severity": "P0"
      },
      {
        "action": "File exceeds 2000 LOC (177342 lines) — monolithic js file, split candidate",
        "file": "YiPet/libs/mermaid.min.js",
        "line": 1,
        "severity": "P0"
      }
    ],
    "focusArea": {
      "dimName": "Size",
      "score": 0,
      "why": "Lowest-scoring dimension. Address the 10 P0 bloat and 1 P0 coupling alerts for maximum improvement.",
      "hint": "Focus on this dimension for the highest score uplift per effort."
    },
    "trendInsight": "Score at 68 (C). Total 4462 files, 185.30 MB. 44 alerts: 11 P0, 23 P1, 10 P2.",
    "weightsHint": "Focus remediation on the lowest-scoring dimension for maximum impact.",
    "narrative": [
      "Overall health at 68/100 (grade C). 11 critical (P0) and 23 major (P1) alerts active.",
      "Primary concerns: file bloat (10 P0), coupling (1 P0), and cycles (0 P0).",
      "Top lever: address P0 items for projected 176/100 score."
    ],
    "severityDonut": {
      "p0": 11,
      "p1": 23,
      "p2": 10,
      "total": 44
    },
    "riskVectors": [
      {
        "dimension": "Size",
        "score": 0,
        "weight": 0.3,
        "p0": 10,
        "p1": 20,
        "p2": 0
      },
      {
        "dimension": "Coupling",
        "score": 90,
        "weight": 0.15,
        "p0": 1,
        "p1": 2,
        "p2": 0
      },
      {
        "dimension": "Cycles",
        "score": 98,
        "weight": 0.2,
        "p0": 0,
        "p1": 1,
        "p2": 0
      },
      {
        "dimension": "Depth",
        "score": 100,
        "weight": 0.2,
        "p0": 0,
        "p1": 0,
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
        "dimension": "Size",
        "severity": "P1",
        "kind": "split",
        "action": "File exceeds 1000 LOC (1386 lines) — consider splitting by concern",
        "file": "Websites/Adminto/Admin/src/assets/js/pages/apex-area.init.js",
        "line": 1,
        "scoreUplift": 5,
        "effort": "medium"
      },
      {
        "rank": 2,
        "dimension": "Size",
        "severity": "P1",
        "kind": "split",
        "action": "File exceeds 1000 LOC (1272 lines) — consider splitting by concern",
        "file": "Websites/Adminto/Admin/src/assets/js/pages/apex-column.init.js",
        "line": 1,
        "scoreUplift": 5,
        "effort": "medium"
      },
      {
        "rank": 3,
        "dimension": "Size",
        "severity": "P1",
        "kind": "split",
        "action": "File exceeds 1000 LOC (1093 lines) — consider splitting by concern",
        "file": "Websites/Adminto/Admin/src/assets/js/pages/apex-line.init.js",
        "line": 1,
        "scoreUplift": 5,
        "effort": "medium"
      },
      {
        "rank": 4,
        "dimension": "Size",
        "severity": "P1",
        "kind": "split",
        "action": "File exceeds 1000 LOC (1976 lines) — consider splitting by concern",
        "file": "Websites/Adminto/Admin/src/assets/js/pages/icons-fontawesome.init.js",
        "line": 1,
        "scoreUplift": 5,
        "effort": "medium"
      },
      {
        "rank": 5,
        "dimension": "Size",
        "severity": "P1",
        "kind": "split",
        "action": "File exceeds 1000 LOC (1360 lines) — consider splitting by concern",
        "file": "Websites/Mortal/assets/libs/tobii/js/tobii.cjs.js",
        "line": 1,
        "scoreUplift": 5,
        "effort": "medium"
      },
      {
        "rank": 6,
        "dimension": "Size",
        "severity": "P1",
        "kind": "split",
        "action": "File exceeds 1000 LOC (1349 lines) — consider splitting by concern",
        "file": "Websites/News/assets/js/vendor/perfect-scrollbar.js",
        "line": 1,
        "scoreUplift": 5,
        "effort": "medium"
      },
      {
        "rank": 7,
        "dimension": "Size",
        "severity": "P1",
        "kind": "split",
        "action": "File exceeds 1000 LOC (1082 lines) — consider splitting by concern",
        "file": "Websites/Prompt/assets/libs/swiper/angular/fesm2015/swiper_angular.js",
        "line": 1,
        "scoreUplift": 5,
        "effort": "medium"
      },
      {
        "rank": 8,
        "dimension": "Coupling",
        "severity": "P1",
        "kind": "refactor",
        "action": "High fan-out (20) — imports 20 modules, consider decoupling",
        "file": "Websites/Prompt/assets/libs/swiper/swiper-bundle.esm.js",
        "line": 1,
        "scoreUplift": 5,
        "effort": "medium"
      },
      {
        "rank": 9,
        "dimension": "Size",
        "severity": "P1",
        "kind": "split",
        "action": "File exceeds 1000 LOC (1072 lines) — consider splitting by concern",
        "file": "YiPet/cdn/markdown/index.js",
        "line": 1,
        "scoreUplift": 5,
        "effort": "medium"
      },
      {
        "rank": 10,
        "dimension": "Size",
        "severity": "P1",
        "kind": "split",
        "action": "File exceeds 1000 LOC (1869 lines) — consider splitting by concern",
        "file": "YiPet/cdn/utils/index.js",
        "line": 1,
        "scoreUplift": 5,
        "effort": "medium"
      }
    ],
    "benchmarks": {
      "currentGrade": "C",
      "currentValue": 68,
      "targetGrade": "B",
      "targetValue": 75,
      "gapToNext": 7
    },
    "remediationPlan": {
      "phases": [
        {
          "phase": "P0 — Blocking fixes",
          "severity": "P0",
          "itemCount": 11,
          "estUplift": 108,
          "projected": 100,
          "deadline": "3 weeks"
        },
        {
          "phase": "P1 — Important",
          "severity": "P1",
          "itemCount": 23,
          "estUplift": 114,
          "projected": 100,
          "deadline": "6 weeks"
        },
        {
          "phase": "P2 — Nice-to-have",
          "severity": "P2",
          "itemCount": 10,
          "estUplift": 20,
          "projected": 100,
          "deadline": "this quarter"
        }
      ],
      "currentScore": 68,
      "projectedScoreIfAllP0P1Remediated": 100
    },
    "decayForecast": {
      "currentScore": 68,
      "projectedNext": 63,
      "delta": -5,
      "rationale": "Without action, code debt compounds. Estimated -5 pts per quarter if no remediation."
    }
  },
  "records": [],
  "adjacency": {}
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
