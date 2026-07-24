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
        generatedAt: "2026-07-24T10:35:00.000Z", /* ISO 8601 UTC — filled in by the analyzer */
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
  "score": 78,
  "alerts": [
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "core/_1_ytdlp.py",
      "line": null,
      "message": "Orphan file: 0 inbound references (292 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- core/_1_ytdlp.py` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "core/_10_gen_audio.py",
      "line": null,
      "message": "Orphan file: 0 inbound references (233 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- core/_10_gen_audio.py` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "core/prompts.py",
      "line": null,
      "message": "Orphan file: 0 inbound references (365 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- core/prompts.py` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "core/st_utils/download_video_section.py",
      "line": null,
      "message": "Orphan file: 0 inbound references (288 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- core/st_utils/download_video_section.py` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "core/st_utils/sidebar_setting.py",
      "line": null,
      "message": "Orphan file: 0 inbound references (366 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- core/st_utils/sidebar_setting.py` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "core/tts_backend/sf_fishtts.py",
      "line": null,
      "message": "Orphan file: 0 inbound references (221 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- core/tts_backend/sf_fishtts.py` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "install.py",
      "line": null,
      "message": "Orphan file: 0 inbound references (264 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- install.py` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "translations/en.json",
      "line": null,
      "message": "Orphan file: 0 inbound references (155 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- translations/en.json` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "orphan",
      "file": "translations/zh-CN.json",
      "line": null,
      "message": "Orphan file: 0 inbound references (155 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- translations/zh-CN.json` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    },
    {
      "severity": "P2",
      "marker": "P2",
      "category": "size",
      "file": "VideoLingo_colab.ipynb",
      "line": 1,
      "message": "File exceeds 500 LOC (835 lines)",
      "metric": "835 LOC",
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
      "file": "VideoLingo_colab.ipynb",
      "line": null,
      "message": "Orphan file: 0 inbound references (835 lines)",
      "metric": "0 inbound refs",
      "effort": "low",
      "scoreUplift": 3,
      "recommendations": [
        "Grep for dynamic imports / reflection before deletion.",
        "Check `git log -- VideoLingo_colab.ipynb` for prior authors.",
        "Delete in a dedicated PR; `git revert` is cheap.",
        "If kept as a script entry, exclude from scope via .ruiignore."
      ]
    }
  ],
  "summary": {
    "totalFiles": 73,
    "totalBytes": 412397,
    "totalBytesHuman": "402.7 KB",
    "totalLines": 8710,
    "maxDepth": 0,
    "criticalCount": 0,
    "hotspotCount": 0,
    "cycleCount": 0,
    "staleCount": 0
  },
  "treemap": [
    {
      "name": "core/",
      "bytes": 466564,
      "humanBytes": "455.6 KB"
    },
    {
      "name": "core/tts_backend/",
      "bytes": 81742,
      "humanBytes": "79.8 KB"
    },
    {
      "name": "core/st_utils/",
      "bytes": 66898,
      "humanBytes": "65.3 KB"
    },
    {
      "name": "core/asr_backend/",
      "bytes": 50382,
      "humanBytes": "49.2 KB"
    },
    {
      "name": "translations/",
      "bytes": 47444,
      "humanBytes": "46.3 KB"
    },
    {
      "name": "core/spacy_utils/",
      "bytes": 37088,
      "humanBytes": "36.2 KB"
    },
    {
      "name": "core/utils/",
      "bytes": 31668,
      "humanBytes": "30.9 KB"
    },
    {
      "name": "batch/",
      "bytes": 21118,
      "humanBytes": "20.6 KB"
    },
    {
      "name": "batch/utils/",
      "bytes": 20336,
      "humanBytes": "19.9 KB"
    }
  ],
  "types": [
    {
      "type": ".py",
      "fileCount": 63,
      "pctFiles": 86.3,
      "totalBytes": 275429,
      "totalBytesHuman": "269.0 KB",
      "pctBytes": 66.8,
      "totalLines": 7042
    },
    {
      "type": ".ipynb",
      "fileCount": 1,
      "pctFiles": 1.4,
      "totalBytes": 93439,
      "totalBytesHuman": "91.2 KB",
      "pctBytes": 22.7,
      "totalLines": 835
    },
    {
      "type": ".json",
      "fileCount": 2,
      "pctFiles": 2.7,
      "totalBytes": 22930,
      "totalBytesHuman": "22.4 KB",
      "pctBytes": 5.6,
      "totalLines": 310
    },
    {
      "type": ".xlsx",
      "fileCount": 1,
      "pctFiles": 1.4,
      "totalBytes": 9409,
      "totalBytesHuman": "9.2 KB",
      "pctBytes": 2.3,
      "totalLines": 37
    },
    {
      "type": "(none)",
      "fileCount": 2,
      "pctFiles": 2.7,
      "totalBytes": 5125,
      "totalBytesHuman": "5.0 KB",
      "pctBytes": 1.2,
      "totalLines": 233
    },
    {
      "type": ".yaml",
      "fileCount": 1,
      "pctFiles": 1.4,
      "totalBytes": 4978,
      "totalBytesHuman": "4.9 KB",
      "pctBytes": 1.2,
      "totalLines": 188
    },
    {
      "type": ".txt",
      "fileCount": 1,
      "pctFiles": 1.4,
      "totalBytes": 696,
      "totalBytesHuman": "696 B",
      "pctBytes": 0.2,
      "totalLines": 38
    },
    {
      "type": ".bat",
      "fileCount": 2,
      "pctFiles": 2.7,
      "totalBytes": 391,
      "totalBytesHuman": "391 B",
      "pctBytes": 0.1,
      "totalLines": 27
    }
  ],
  "histogram": [
    {
      "bucket": "0",
      "count": 2,
      "pctFiles": 2.7
    },
    {
      "bucket": "1-50",
      "count": 21,
      "pctFiles": 28.8
    },
    {
      "bucket": "51-100",
      "count": 16,
      "pctFiles": 21.9
    },
    {
      "bucket": "101-250",
      "count": 27,
      "pctFiles": 37
    },
    {
      "bucket": "251-500",
      "count": 6,
      "pctFiles": 8.2
    },
    {
      "bucket": "501-1000",
      "count": 1,
      "pctFiles": 1.4
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
      "path": "VideoLingo_colab.ipynb",
      "bytes": 93439,
      "bytesHuman": "91.2 KB",
      "lines": 835,
      "type": ".ipynb",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "core/st_utils/sidebar_setting.py",
      "bytes": 14779,
      "bytesHuman": "14.4 KB",
      "lines": 366,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "core/prompts.py",
      "bytes": 13449,
      "bytesHuman": "13.1 KB",
      "lines": 365,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "core/_10_gen_audio.py",
      "bytes": 11684,
      "bytesHuman": "11.4 KB",
      "lines": 233,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "translations/en.json",
      "bytes": 11648,
      "bytesHuman": "11.4 KB",
      "lines": 155,
      "type": ".json",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "install.py",
      "bytes": 11489,
      "bytesHuman": "11.2 KB",
      "lines": 264,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "translations/zh-CN.json",
      "bytes": 11282,
      "bytesHuman": "11.0 KB",
      "lines": 155,
      "type": ".json",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "core/st_utils/download_video_section.py",
      "bytes": 10838,
      "bytesHuman": "10.6 KB",
      "lines": 288,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "core/_1_ytdlp.py",
      "bytes": 10050,
      "bytesHuman": "9.8 KB",
      "lines": 292,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "core/tts_backend/sf_fishtts.py",
      "bytes": 9956,
      "bytesHuman": "9.7 KB",
      "lines": 221,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "custom_terms.xlsx",
      "bytes": 9409,
      "bytesHuman": "9.2 KB",
      "lines": 37,
      "type": ".xlsx",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "st.py",
      "bytes": 9002,
      "bytesHuman": "8.8 KB",
      "lines": 272,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "core/asr_backend/audio_preprocess.py",
      "bytes": 8299,
      "bytesHuman": "8.1 KB",
      "lines": 181,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "core/tts_backend/gpt_sovits_tts.py",
      "bytes": 7993,
      "bytesHuman": "7.8 KB",
      "lines": 190,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "core/_8_2_dub_chunks.py",
      "bytes": 7764,
      "bytesHuman": "7.6 KB",
      "lines": 206,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "setup_env.py",
      "bytes": 7431,
      "bytesHuman": "7.3 KB",
      "lines": 223,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "core/_6_gen_sub.py",
      "bytes": 6929,
      "bytesHuman": "6.8 KB",
      "lines": 168,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "core/asr_backend/whisperX_local.py",
      "bytes": 6877,
      "bytesHuman": "6.7 KB",
      "lines": 150,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "core/_8_1_audio_task.py",
      "bytes": 6558,
      "bytesHuman": "6.4 KB",
      "lines": 143,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "core/tts_backend/estimate_duration.py",
      "bytes": 6488,
      "bytesHuman": "6.3 KB",
      "lines": 139,
      "type": ".py",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    }
  ],
  "fanin": [],
  "fanout": [],
  "hotspots": [],
  "orphans": [
    {
      "path": "VideoLingo_colab.ipynb",
      "bytes": 93439,
      "bytesHuman": "91.2 KB",
      "lines": 835,
      "type": ".ipynb",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.42
    },
    {
      "path": "core/st_utils/sidebar_setting.py",
      "bytes": 14779,
      "bytesHuman": "14.4 KB",
      "lines": 366,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.18
    },
    {
      "path": "core/prompts.py",
      "bytes": 13449,
      "bytesHuman": "13.1 KB",
      "lines": 365,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.18
    },
    {
      "path": "core/_10_gen_audio.py",
      "bytes": 11684,
      "bytesHuman": "11.4 KB",
      "lines": 233,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.12
    },
    {
      "path": "translations/en.json",
      "bytes": 11648,
      "bytesHuman": "11.4 KB",
      "lines": 155,
      "type": ".json",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.08
    },
    {
      "path": "install.py",
      "bytes": 11489,
      "bytesHuman": "11.2 KB",
      "lines": 264,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.13
    },
    {
      "path": "translations/zh-CN.json",
      "bytes": 11282,
      "bytesHuman": "11.0 KB",
      "lines": 155,
      "type": ".json",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.08
    },
    {
      "path": "core/st_utils/download_video_section.py",
      "bytes": 10838,
      "bytesHuman": "10.6 KB",
      "lines": 288,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.14
    },
    {
      "path": "core/_1_ytdlp.py",
      "bytes": 10050,
      "bytesHuman": "9.8 KB",
      "lines": 292,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.15
    },
    {
      "path": "core/tts_backend/sf_fishtts.py",
      "bytes": 9956,
      "bytesHuman": "9.7 KB",
      "lines": 221,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.11
    },
    {
      "path": "custom_terms.xlsx",
      "bytes": 9409,
      "bytesHuman": "9.2 KB",
      "lines": 37,
      "type": ".xlsx",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.02
    },
    {
      "path": "st.py",
      "bytes": 9002,
      "bytesHuman": "8.8 KB",
      "lines": 272,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.14
    },
    {
      "path": "core/asr_backend/audio_preprocess.py",
      "bytes": 8299,
      "bytesHuman": "8.1 KB",
      "lines": 181,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.09
    },
    {
      "path": "core/tts_backend/gpt_sovits_tts.py",
      "bytes": 7993,
      "bytesHuman": "7.8 KB",
      "lines": 190,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.1
    },
    {
      "path": "core/_8_2_dub_chunks.py",
      "bytes": 7764,
      "bytesHuman": "7.6 KB",
      "lines": 206,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.1
    },
    {
      "path": "setup_env.py",
      "bytes": 7431,
      "bytesHuman": "7.3 KB",
      "lines": 223,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.11
    },
    {
      "path": "core/_6_gen_sub.py",
      "bytes": 6929,
      "bytesHuman": "6.8 KB",
      "lines": 168,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.08
    },
    {
      "path": "core/asr_backend/whisperX_local.py",
      "bytes": 6877,
      "bytesHuman": "6.7 KB",
      "lines": 150,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.08
    },
    {
      "path": "core/_8_1_audio_task.py",
      "bytes": 6558,
      "bytesHuman": "6.4 KB",
      "lines": 143,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.07
    },
    {
      "path": "core/tts_backend/estimate_duration.py",
      "bytes": 6488,
      "bytesHuman": "6.3 KB",
      "lines": 139,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.07
    }
  ],
  "depthStats": {
    "max": 0,
    "mean": 0,
    "median": 0,
    "p90": 0,
    "filesAtMax": 0
  },
  "depthRanking": [],
  "cycles": [],
  "freshness": [],
  "freshnessBuckets": [
    {
      "bucket": "<30d",
      "count": 73,
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
    "topP0": [],
    "focusArea": {
      "dimName": "Duplication",
      "score": 80,
      "why": "Lowest-scoring risk dimension drives overall health drag.",
      "hint": "Invest 2-3 days addressing top alerts in this dimension. Expected uplift: +10-15 pts."
    },
    "trendInsight": "Score 78/100 at generation. 0 P0 alerts require immediate attention.",
    "weightsHint": "Weights follow methodology.md Stage 3.6. Coupling and Staleness carry 0.20 each.",
    "narrative": [
      "Overall health at 78/100 — moderate risk.",
      "0 critical (P0), 0 major (P1), 11 minor (P2) alerts active.",
      "Top lever: n/a (+0 pts).",
      "Score 78 | gap 2 pts to next grade | decay risk without action: -2 pts/quarter"
    ],
    "severityDonut": {
      "p0": 0,
      "p1": 0,
      "p2": 11,
      "total": 11
    },
    "riskVectors": [
      {
        "dimension": "Depth",
        "score": 100,
        "weight": 0.15,
        "p0": 0,
        "p1": 0,
        "p2": 0
      },
      {
        "dimension": "Size",
        "score": 95,
        "weight": 0.2,
        "p0": 0,
        "p1": 0,
        "p2": 1
      },
      {
        "dimension": "Coupling",
        "score": 100,
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
      "currentGrade": "C",
      "currentValue": 78,
      "targetGrade": "A",
      "targetValue": 98,
      "gapToNext": 2
    },
    "remediationPlan": {
      "phases": [
        {
          "phase": "P0 Critical",
          "severity": "P0",
          "itemCount": 0,
          "estUplift": 0,
          "projected": 78,
          "deadline": "7 days"
        },
        {
          "phase": "P1 Major",
          "severity": "P1",
          "itemCount": 0,
          "estUplift": 0,
          "projected": 78,
          "deadline": "30 days"
        },
        {
          "phase": "P2 Minor",
          "severity": "P2",
          "itemCount": 11,
          "estUplift": 22,
          "projected": 100,
          "deadline": "90 days"
        }
      ],
      "currentScore": 78,
      "projectedScoreIfAllP0P1Remediated": 78
    },
    "decayForecast": {
      "currentScore": 78,
      "projectedNext": 76,
      "delta": -2,
      "rationale": "Without active remediation, coupling decay and staleness trend -2 pts/quarter on average."
    }
  },
  "records": [
    {
      "path": ".gitignore",
      "bytes": 3000,
      "lines": 177,
      "type": "",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "batch/OneKeyBatch_uv.bat",
      "bytes": 246,
      "lines": 15,
      "type": ".bat",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "batch/OneKeyBatch.bat",
      "bytes": 145,
      "lines": 12,
      "type": ".bat",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "batch/utils/batch_processor.py",
      "bytes": 4485,
      "lines": 97,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "batch/utils/settings_check.py",
      "bytes": 1909,
      "lines": 57,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "batch/utils/video_processor.py",
      "bytes": 3774,
      "lines": 105,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "config.yaml",
      "bytes": 4978,
      "lines": 188,
      "type": ".yaml",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/__init__.py",
      "bytes": 1012,
      "lines": 48,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_1_ytdlp.py",
      "bytes": 10050,
      "lines": 292,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_10_gen_audio.py",
      "bytes": 11684,
      "lines": 233,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_11_merge_audio.py",
      "bytes": 5714,
      "lines": 131,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_12_dub_to_vid.py",
      "bytes": 3108,
      "lines": 89,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_2_asr.py",
      "bytes": 1843,
      "lines": 50,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_3_1_split_nlp.py",
      "bytes": 376,
      "lines": 15,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_3_2_split_meaning.py",
      "bytes": 5738,
      "lines": 129,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_4_1_summarize.py",
      "bytes": 2887,
      "lines": 71,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_4_2_translate.py",
      "bytes": 5260,
      "lines": 112,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_5_split_sub.py",
      "bytes": 5577,
      "lines": 130,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_6_gen_sub.py",
      "bytes": 6929,
      "lines": 168,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_7_sub_into_vid.py",
      "bytes": 3874,
      "lines": 106,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_8_1_audio_task.py",
      "bytes": 6558,
      "lines": 143,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_8_2_dub_chunks.py",
      "bytes": 7764,
      "lines": 206,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/_9_refer_audio.py",
      "bytes": 2065,
      "lines": 55,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/asr_backend/__init__.py",
      "bytes": 0,
      "lines": 0,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784817310,
      "ageDays": 0
    },
    {
      "path": "core/asr_backend/audio_preprocess.py",
      "bytes": 8299,
      "lines": 181,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/asr_backend/demucs_vl.py",
      "bytes": 2280,
      "lines": 55,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/asr_backend/elevenlabs_asr.py",
      "bytes": 5290,
      "lines": 146,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/asr_backend/whisperX_302.py",
      "bytes": 2445,
      "lines": 69,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/asr_backend/whisperX_local.py",
      "bytes": 6877,
      "lines": 150,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/prompts.py",
      "bytes": 13449,
      "lines": 365,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/spacy_utils/__init__.py",
      "bytes": 372,
      "lines": 14,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/spacy_utils/load_nlp_model.py",
      "bytes": 1311,
      "lines": 34,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/spacy_utils/split_by_comma.py",
      "bytes": 2736,
      "lines": 71,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/spacy_utils/split_by_connector.py",
      "bytes": 6177,
      "lines": 155,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/spacy_utils/split_by_mark.py",
      "bytes": 2474,
      "lines": 64,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/spacy_utils/split_long_by_root.py",
      "bytes": 5474,
      "lines": 105,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/st_utils/__init__.py",
      "bytes": 0,
      "lines": 0,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784817310,
      "ageDays": 0
    },
    {
      "path": "core/st_utils/download_video_section.py",
      "bytes": 10838,
      "lines": 288,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/st_utils/imports_and_utils.py",
      "bytes": 3359,
      "lines": 119,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/st_utils/sidebar_setting.py",
      "bytes": 14779,
      "lines": 366,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/st_utils/task_runner.py",
      "bytes": 4473,
      "lines": 148,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/translate_lines.py",
      "bytes": 5505,
      "lines": 99,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/tts_backend/_302_f5tts.py",
      "bytes": 5364,
      "lines": 142,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/tts_backend/azure_tts.py",
      "bytes": 799,
      "lines": 24,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/tts_backend/custom_tts.py",
      "bytes": 948,
      "lines": 35,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/tts_backend/edge_tts.py",
      "bytes": 970,
      "lines": 30,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/tts_backend/estimate_duration.py",
      "bytes": 6488,
      "lines": 139,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/tts_backend/fish_tts.py",
      "bytes": 1261,
      "lines": 41,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/tts_backend/gpt_sovits_tts.py",
      "bytes": 7993,
      "lines": 190,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/tts_backend/openai_tts.py",
      "bytes": 1437,
      "lines": 39,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/tts_backend/sf_cosyvoice2.py",
      "bytes": 1898,
      "lines": 48,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/tts_backend/sf_fishtts.py",
      "bytes": 9956,
      "lines": 221,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/tts_backend/tts_main.py",
      "bytes": 3757,
      "lines": 85,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/utils/__init__.py",
      "bytes": 387,
      "lines": 10,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/utils/ask_gpt.py",
      "bytes": 3344,
      "lines": 95,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/utils/config_utils.py",
      "bytes": 1648,
      "lines": 60,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/utils/decorator.py",
      "bytes": 1574,
      "lines": 50,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/utils/delete_retry_dubbing.py",
      "bytes": 948,
      "lines": 31,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/utils/models.py",
      "bytes": 1471,
      "lines": 50,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/utils/onekeycleanup.py",
      "bytes": 2685,
      "lines": 80,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "core/utils/pypi_autochoose.py",
      "bytes": 3777,
      "lines": 111,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "custom_terms.xlsx",
      "bytes": 9409,
      "lines": 37,
      "type": ".xlsx",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "Dockerfile",
      "bytes": 2125,
      "lines": 56,
      "type": "",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "install.py",
      "bytes": 11489,
      "lines": 264,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "launch.py",
      "bytes": 2949,
      "lines": 95,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "requirements.txt",
      "bytes": 696,
      "lines": 38,
      "type": ".txt",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "setup_env.py",
      "bytes": 7431,
      "lines": 223,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "setup.py",
      "bytes": 316,
      "lines": 15,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "st.py",
      "bytes": 9002,
      "lines": 272,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "translations/en.json",
      "bytes": 11648,
      "lines": 155,
      "type": ".json",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "translations/translations.py",
      "bytes": 792,
      "lines": 26,
      "type": ".py",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "translations/zh-CN.json",
      "bytes": 11282,
      "lines": 155,
      "type": ".json",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    },
    {
      "path": "VideoLingo_colab.ipynb",
      "bytes": 93439,
      "lines": 835,
      "type": ".ipynb",
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "lastModified": 1784854844,
      "ageDays": 0
    }
  ],
  "adjacency": {}
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
