window.REPORT_CONFIG = {
    /* Runtime options used by the analysis run. Displayed in the header
       and footer as the verbatim JSON. `generatedAt` is an ISO timestamp
       used to compute the stale-data warning + footer recap. */
    options: {
        topN: 20,
        noCycles: false,
        theme: 'dark',
        generatedAt: '2026-07-17T01:59:39.731Z', /* ISO 8601 UTC — filled in by the analyzer */
    },

    /* Fixed constants shared across the report UI. */
    constants: {
        filterDebounceMs: 200,
        componentReadyTimeoutMs: 5000,
        csvHeader: 'path,bytes,lines,type,fanIn,fanOut,extDeps,maxDepth,lastModified,ageDays',
    },

    labels: {
        /* ── Header / chrome ─────────────────────────────────────── */
        title:            'rui-report-files',
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

window.REPORT_DATA = {
  "scope": "YrY/",
  "score": 84,
  "alerts": [
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-code/nginx/references/index.json",
      "line": null,
      "message": "File exceeds 1000 LOC (1570 lines)",
      "metric": "1570 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-code/nginx/references/index.json/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-code/nginx/references/index.json and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-code/nodejs/references/index.json",
      "line": null,
      "message": "File exceeds 1000 LOC (1237 lines)",
      "metric": "1237 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-code/nodejs/references/index.json/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-code/nodejs/references/index.json and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-code/tauri/references/index.json",
      "line": null,
      "message": "File exceeds 1000 LOC (3083 lines)",
      "metric": "3083 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-code/tauri/references/index.json/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-code/tauri/references/index.json and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-code/vite/references/index.json",
      "line": null,
      "message": "File exceeds 1000 LOC (3945 lines)",
      "metric": "3945 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-code/vite/references/index.json/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-code/vite/references/index.json and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-cto/references/index.json",
      "line": null,
      "message": "File exceeds 1000 LOC (2206 lines)",
      "metric": "2206 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-cto/references/index.json/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-cto/references/index.json and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-questions/references/index.json",
      "line": null,
      "message": "File exceeds 1000 LOC (8978 lines)",
      "metric": "8978 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-questions/references/index.json/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-questions/references/index.json and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-questions/references/index.md",
      "line": null,
      "message": "File exceeds 1000 LOC (2245 lines)",
      "metric": "2245 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-questions/references/index.md/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-questions/references/index.md and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-questions/references/README-interview-qa.md",
      "line": null,
      "message": "File exceeds 1000 LOC (5172 lines)",
      "metric": "5172 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-questions/references/README-interview-qa.md/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-questions/references/README-interview-qa.md and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-reports/diagram/engine/tree-sitter-dart-wasm/tree-sitter-dart.wasm",
      "line": null,
      "message": "File exceeds 1000 LOC (2679 lines)",
      "metric": "2679 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/diagram/engine/tree-sitter-dart-wasm/tree-sitter-dart.wasm/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/diagram/engine/tree-sitter-dart-wasm/tree-sitter-dart.wasm and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-reports/diagram/pnpm-lock.yaml",
      "line": null,
      "message": "File exceeds 1000 LOC (1309 lines)",
      "metric": "1309 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/diagram/pnpm-lock.yaml/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/diagram/pnpm-lock.yaml and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-reports/diagram/scripts/extract-import-map.mjs",
      "line": null,
      "message": "File exceeds 1000 LOC (1676 lines)",
      "metric": "1676 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/diagram/scripts/extract-import-map.mjs/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/diagram/scripts/extract-import-map.mjs and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-reports/diagram/scripts/merge-batch-graphs.py",
      "line": null,
      "message": "File exceeds 1000 LOC (1167 lines)",
      "metric": "1167 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/diagram/scripts/merge-batch-graphs.py/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/diagram/scripts/merge-batch-graphs.py and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-reports/files/scripts/analyze.mjs",
      "line": null,
      "message": "File exceeds 1000 LOC (1356 lines)",
      "metric": "1356 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/files/scripts/analyze.mjs/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/files/scripts/analyze.mjs and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-reports/files/templates/index.css",
      "line": null,
      "message": "File exceeds 1000 LOC (1134 lines)",
      "metric": "1134 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/files/templates/index.css/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/files/templates/index.css and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-tools/cc/references/index.json",
      "line": null,
      "message": "File exceeds 1000 LOC (2599 lines)",
      "metric": "2599 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/cc/references/index.json/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/cc/references/index.json and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-tools/public-api/references/index.json",
      "line": null,
      "message": "File exceeds 1000 LOC (9150 lines)",
      "metric": "9150 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/public-api/references/index.json/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/public-api/references/index.json and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-tools/public-api/references/index.md",
      "line": null,
      "message": "File exceeds 1000 LOC (1183 lines)",
      "metric": "1183 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/public-api/references/index.md/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/public-api/references/index.md and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-tools/public-api/references/README-public-api-lists.md",
      "line": null,
      "message": "File exceeds 1000 LOC (1184 lines)",
      "metric": "1184 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/public-api/references/README-public-api-lists.md/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/public-api/references/README-public-api-lists.md and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-tools/tmux/references/index.json",
      "line": null,
      "message": "File exceeds 1000 LOC (1529 lines)",
      "metric": "1529 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/tmux/references/index.json/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/tmux/references/index.json and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/ArsenalSC-Regular.ttf",
      "line": null,
      "message": "File exceeds 1000 LOC (1487 lines)",
      "metric": "1487 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/ArsenalSC-Regular.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/ArsenalSC-Regular.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/Gloock-Regular.ttf",
      "line": null,
      "message": "File exceeds 1000 LOC (1375 lines)",
      "metric": "1375 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/Gloock-Regular.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/Gloock-Regular.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Bold.ttf",
      "line": null,
      "message": "File exceeds 1000 LOC (1416 lines)",
      "metric": "1416 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Bold.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Bold.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-BoldItalic.ttf",
      "line": null,
      "message": "File exceeds 1000 LOC (1715 lines)",
      "metric": "1715 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-BoldItalic.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-BoldItalic.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Italic.ttf",
      "line": null,
      "message": "File exceeds 1000 LOC (1993 lines)",
      "metric": "1993 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Italic.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Italic.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Regular.ttf",
      "line": null,
      "message": "File exceeds 1000 LOC (1346 lines)",
      "metric": "1346 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Regular.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Regular.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/LibreBaskerville-Regular.ttf",
      "line": null,
      "message": "File exceeds 1000 LOC (1068 lines)",
      "metric": "1068 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/LibreBaskerville-Regular.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/LibreBaskerville-Regular.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/Lora-BoldItalic.ttf",
      "line": null,
      "message": "File exceeds 1000 LOC (1024 lines)",
      "metric": "1024 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/Lora-BoldItalic.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/Lora-BoldItalic.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/YoungSerif-Regular.ttf",
      "line": null,
      "message": "File exceeds 1000 LOC (1145 lines)",
      "metric": "1145 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/YoungSerif-Regular.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/YoungSerif-Regular.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-code/css/references/index.json",
      "line": null,
      "message": "File exceeds 500 LOC (679 lines)",
      "metric": "679 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-code/css/references/index.json/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-code/css/references/index.json and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-code/h5/references/index.json",
      "line": null,
      "message": "File exceeds 500 LOC (819 lines)",
      "metric": "819 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-code/h5/references/index.json/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-code/h5/references/index.json and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-code/tauri/references/index.md",
      "line": null,
      "message": "File exceeds 500 LOC (510 lines)",
      "metric": "510 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-code/tauri/references/index.md/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-code/tauri/references/index.md and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-code/vite/references/index.md",
      "line": null,
      "message": "File exceeds 500 LOC (752 lines)",
      "metric": "752 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-code/vite/references/index.md/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-code/vite/references/index.md and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-code/vue/references/vueuse-network/useFetch.md",
      "line": null,
      "message": "File exceeds 500 LOC (546 lines)",
      "metric": "546 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-code/vue/references/vueuse-network/useFetch.md/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-code/vue/references/vueuse-network/useFetch.md and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-docs/readme/references/index.json",
      "line": null,
      "message": "File exceeds 500 LOC (551 lines)",
      "metric": "551 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-docs/readme/references/index.json/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-docs/readme/references/index.json and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-questions/references/README-interview-questions.md",
      "line": null,
      "message": "File exceeds 500 LOC (665 lines)",
      "metric": "665 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-questions/references/README-interview-questions.md/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-questions/references/README-interview-questions.md and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-questions/references/README-project-guidelines.md",
      "line": null,
      "message": "File exceeds 500 LOC (954 lines)",
      "metric": "954 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-questions/references/README-project-guidelines.md/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-questions/references/README-project-guidelines.md and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-reports/diagram/agents/file-analyzer.md",
      "line": null,
      "message": "File exceeds 500 LOC (584 lines)",
      "metric": "584 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/diagram/agents/file-analyzer.md/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/diagram/agents/file-analyzer.md and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-reports/diagram/engine/core/src/plugins/extractors/dart-extractor.js",
      "line": null,
      "message": "File exceeds 500 LOC (642 lines)",
      "metric": "642 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "1 direct importer(s)",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/diagram/engine/core/src/plugins/extractors/dart-extractor.js/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/diagram/engine/core/src/plugins/extractors/dart-extractor.js and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-reports/diagram/engine/core/src/schema.js",
      "line": null,
      "message": "File exceeds 500 LOC (607 lines)",
      "metric": "607 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/diagram/engine/core/src/schema.js/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/diagram/engine/core/src/schema.js and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-reports/diagram/scripts/compute-batches.mjs",
      "line": null,
      "message": "File exceeds 500 LOC (592 lines)",
      "metric": "592 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/diagram/scripts/compute-batches.mjs/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/diagram/scripts/compute-batches.mjs and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-reports/diagram/scripts/scan-project.mjs",
      "line": null,
      "message": "File exceeds 500 LOC (800 lines)",
      "metric": "800 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/diagram/scripts/scan-project.mjs/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/diagram/scripts/scan-project.mjs and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-reports/diagram/templates/data.js",
      "line": null,
      "message": "File exceeds 500 LOC (564 lines)",
      "metric": "564 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/diagram/templates/data.js/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/diagram/templates/data.js and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-reports/diagram/templates/index.css",
      "line": null,
      "message": "File exceeds 500 LOC (538 lines)",
      "metric": "538 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/diagram/templates/index.css/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/diagram/templates/index.css and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-reports/diagram/templates/index.js",
      "line": null,
      "message": "File exceeds 500 LOC (651 lines)",
      "metric": "651 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/diagram/templates/index.js/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/diagram/templates/index.js and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-reports/files/templates/components/rui-report-self-improvement/index.css",
      "line": null,
      "message": "File exceeds 500 LOC (539 lines)",
      "metric": "539 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/files/templates/components/rui-report-self-improvement/index.css/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/files/templates/components/rui-report-self-improvement/index.css and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-reports/files/templates/components/rui-report-self-improvement/index.html",
      "line": null,
      "message": "File exceeds 500 LOC (535 lines)",
      "metric": "535 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/files/templates/components/rui-report-self-improvement/index.html/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/files/templates/components/rui-report-self-improvement/index.html and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-reports/files/templates/components/rui-report-self-improvement/index.js",
      "line": null,
      "message": "File exceeds 500 LOC (694 lines)",
      "metric": "694 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/files/templates/components/rui-report-self-improvement/index.js/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/files/templates/components/rui-report-self-improvement/index.js and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-reports/files/templates/data.js",
      "line": null,
      "message": "File exceeds 500 LOC (677 lines)",
      "metric": "677 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/files/templates/data.js/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/files/templates/data.js and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-reports/files/templates/index.html",
      "line": null,
      "message": "File exceeds 500 LOC (616 lines)",
      "metric": "616 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-reports/files/templates/index.html/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-reports/files/templates/index.html and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/lighthouse/references/index.json",
      "line": null,
      "message": "File exceeds 500 LOC (864 lines)",
      "metric": "864 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/lighthouse/references/index.json/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/lighthouse/references/index.json and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/Boldonse-Regular.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (872 lines)",
      "metric": "872 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/Boldonse-Regular.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/Boldonse-Regular.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/CrimsonPro-Italic.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (763 lines)",
      "metric": "763 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/CrimsonPro-Italic.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/CrimsonPro-Italic.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/CrimsonPro-Regular.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (573 lines)",
      "metric": "573 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/CrimsonPro-Regular.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/CrimsonPro-Regular.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/IBMPlexMono-Bold.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (851 lines)",
      "metric": "851 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/IBMPlexMono-Bold.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/IBMPlexMono-Bold.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/IBMPlexMono-Regular.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (822 lines)",
      "metric": "822 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/IBMPlexMono-Regular.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/IBMPlexMono-Regular.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/InstrumentSerif-Italic.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (826 lines)",
      "metric": "826 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/InstrumentSerif-Italic.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/InstrumentSerif-Italic.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/InstrumentSerif-Regular.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (826 lines)",
      "metric": "826 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/InstrumentSerif-Regular.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/InstrumentSerif-Regular.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/JetBrainsMono-Bold.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (605 lines)",
      "metric": "605 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/JetBrainsMono-Bold.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/JetBrainsMono-Bold.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/JetBrainsMono-Regular.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (609 lines)",
      "metric": "609 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/JetBrainsMono-Regular.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/JetBrainsMono-Regular.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/Lora-Bold.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (850 lines)",
      "metric": "850 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/Lora-Bold.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/Lora-Bold.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/Lora-Italic.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (667 lines)",
      "metric": "667 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/Lora-Italic.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/Lora-Italic.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/Lora-Regular.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (516 lines)",
      "metric": "516 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/Lora-Regular.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/Lora-Regular.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/NationalPark-Bold.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (611 lines)",
      "metric": "611 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/NationalPark-Bold.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/NationalPark-Bold.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/NationalPark-Regular.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (601 lines)",
      "metric": "601 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/NationalPark-Regular.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/NationalPark-Regular.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/Tektur-Medium.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (506 lines)",
      "metric": "506 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/Tektur-Medium.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/Tektur-Medium.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/WorkSans-Bold.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (884 lines)",
      "metric": "884 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/WorkSans-Bold.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/WorkSans-Bold.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/WorkSans-BoldItalic.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (730 lines)",
      "metric": "730 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/WorkSans-BoldItalic.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/WorkSans-BoldItalic.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/WorkSans-Italic.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (646 lines)",
      "metric": "646 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/WorkSans-Italic.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/WorkSans-Italic.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "rui-tools/ui-ux/canvas-fonts/WorkSans-Regular.ttf",
      "line": null,
      "message": "File exceeds 500 LOC (892 lines)",
      "metric": "892 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into rui-tools/ui-ux/canvas-fonts/WorkSans-Regular.ttf/{a,b}.ext and re-export from a barrel index.",
        "Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.",
        "Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.",
        "After the split, re-run this report and confirm fan-out / depth drop before merge."
      ],
      "acceptance": [
        "Each split child ≤ 500 LOC (or project threshold) and single-responsibility.",
        "Public API unchanged — existing call sites compile without edits.",
        "Unit tests pass on every child; coverage ≥ pre-split baseline.",
        "Re-run this report: original file no longer triggers the bloat alert."
      ],
      "firstStep": "Open rui-tools/ui-ux/canvas-fonts/WorkSans-Regular.ttf and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
      "tooling": [
        {
          "name": "eslint-plugin-import",
          "hint": "enforce per-file LOC budgets via max-lines + boundary rules"
        },
        {
          "name": "knip",
          "hint": "confirm the split does not strand dead exports"
        },
        {
          "name": "madge",
          "hint": "visualize post-split dependency tree to confirm shallower depth"
        }
      ],
      "preventiveControls": [
        "CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.",
        "Pre-commit hook: warn on files crossing 500 LOC.",
        "CODEOWNERS: require module-owner review on the barrel index file."
      ],
      "rollbackPlan": "Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.",
      "cyclePath": ""
    }
  ],
  "summary": {
    "totalFiles": 888,
    "totalBytes": 12742063,
    "totalBytesHuman": "12.2 MB",
    "maxDepth": 4,
    "criticalCount": 30,
    "hotspotCount": 7,
    "cycleCount": 0,
    "staleCount": 0,
    "totalLines": 189711
  },
  "treemap": [
    {
      "name": "rui-tools/",
      "bytes": 7058808,
      "humanBytes": "6.7 MB"
    },
    {
      "name": "rui-tools/ui-ux/",
      "bytes": 5885552,
      "humanBytes": "5.6 MB"
    },
    {
      "name": "rui-tools/ui-ux/canvas-fonts/",
      "bytes": 5530719,
      "humanBytes": "5.3 MB"
    },
    {
      "name": "rui-reports/",
      "bytes": 2342685,
      "humanBytes": "2.2 MB"
    },
    {
      "name": "rui-reports/diagram/",
      "bytes": 1875229,
      "humanBytes": "1.8 MB"
    },
    {
      "name": "rui-code/",
      "bytes": 1855713,
      "humanBytes": "1.8 MB"
    },
    {
      "name": "rui-reports/diagram/engine/",
      "bytes": 1191554,
      "humanBytes": "1.1 MB"
    },
    {
      "name": "rui-questions/",
      "bytes": 849918,
      "humanBytes": "830.0 KB"
    },
    {
      "name": "rui-questions/references/",
      "bytes": 840912,
      "humanBytes": "821.2 KB"
    },
    {
      "name": "rui-reports/diagram/engine/tree-sitter-dart-wasm/",
      "bytes": 767274,
      "humanBytes": "749.3 KB"
    },
    {
      "name": "rui-code/vue/",
      "bytes": 678077,
      "humanBytes": "662.2 KB"
    },
    {
      "name": "rui-tools/public-api/",
      "bytes": 663422,
      "humanBytes": "647.9 KB"
    },
    {
      "name": "rui-code/vue/references/",
      "bytes": 660312,
      "humanBytes": "644.8 KB"
    },
    {
      "name": "rui-tools/public-api/references/",
      "bytes": 652439,
      "humanBytes": "637.1 KB"
    },
    {
      "name": "rui-reports/files/",
      "bytes": 440704,
      "humanBytes": "430.4 KB"
    },
    {
      "name": "rui-reports/diagram/engine/core/",
      "bytes": 424280,
      "humanBytes": "414.3 KB"
    },
    {
      "name": "rui-reports/diagram/engine/core/src/",
      "bytes": 424280,
      "humanBytes": "414.3 KB"
    },
    {
      "name": "rui-reports/files/templates/",
      "bytes": 322712,
      "humanBytes": "315.1 KB"
    },
    {
      "name": "rui-code/nodejs/",
      "bytes": 288273,
      "humanBytes": "281.5 KB"
    },
    {
      "name": "rui-code/nodejs/references/",
      "bytes": 277087,
      "humanBytes": "270.6 KB"
    },
    {
      "name": "rui-reports/diagram/engine/core/src/plugins/",
      "bytes": 239844,
      "humanBytes": "234.2 KB"
    },
    {
      "name": "rui-code/nginx/",
      "bytes": 237041,
      "humanBytes": "231.5 KB"
    },
    {
      "name": "rui-code/nginx/references/",
      "bytes": 225118,
      "humanBytes": "219.8 KB"
    },
    {
      "name": "rui-code/vite/",
      "bytes": 214702,
      "humanBytes": "209.7 KB"
    },
    {
      "name": "rui-docs/",
      "bytes": 213132,
      "humanBytes": "208.1 KB"
    },
    {
      "name": "rui-code/tauri/",
      "bytes": 212453,
      "humanBytes": "207.5 KB"
    },
    {
      "name": "rui-tools/ui-ux/references/",
      "bytes": 209192,
      "humanBytes": "204.3 KB"
    },
    {
      "name": "rui-code/vite/references/",
      "bytes": 203404,
      "humanBytes": "198.6 KB"
    },
    {
      "name": "rui-code/tauri/references/",
      "bytes": 202260,
      "humanBytes": "197.5 KB"
    },
    {
      "name": "rui-init/",
      "bytes": 184264,
      "humanBytes": "179.9 KB"
    },
    {
      "name": "rui-reports/diagram/scripts/",
      "bytes": 184201,
      "humanBytes": "179.9 KB"
    },
    {
      "name": "rui-tools/cc/",
      "bytes": 180455,
      "humanBytes": "176.2 KB"
    },
    {
      "name": "rui-reports/diagram/engine/core/src/plugins/extractors/",
      "bytes": 175041,
      "humanBytes": "170.9 KB"
    },
    {
      "name": "rui-tools/cc/references/",
      "bytes": 168178,
      "humanBytes": "164.2 KB"
    },
    {
      "name": "rui-docs/quickstart/",
      "bytes": 165709,
      "humanBytes": "161.8 KB"
    },
    {
      "name": "rui-reports/files/templates/components/",
      "bytes": 152310,
      "humanBytes": "148.7 KB"
    },
    {
      "name": "rui-docs/quickstart/concerns/",
      "bytes": 142900,
      "humanBytes": "139.6 KB"
    },
    {
      "name": "rui-reports/diagram/agents/",
      "bytes": 130990,
      "humanBytes": "127.9 KB"
    },
    {
      "name": "rui-cto/",
      "bytes": 125735,
      "humanBytes": "122.8 KB"
    },
    {
      "name": "rui-cto/references/",
      "bytes": 117110,
      "humanBytes": "114.4 KB"
    },
    {
      "name": "rui-reports/files/templates/components/rui-report-self-improvement/",
      "bytes": 116448,
      "humanBytes": "113.7 KB"
    },
    {
      "name": "rui-test/",
      "bytes": 111808,
      "humanBytes": "109.2 KB"
    },
    {
      "name": "rui-code/vue/references/vueuse-browser/",
      "bytes": 109785,
      "humanBytes": "107.2 KB"
    },
    {
      "name": "rui-tools/tmux/",
      "bytes": 108793,
      "humanBytes": "106.2 KB"
    },
    {
      "name": "rui-tools/ui-ux/data/",
      "bytes": 105049,
      "humanBytes": "102.6 KB"
    },
    {
      "name": "rui-init/steps/",
      "bytes": 101965,
      "humanBytes": "99.6 KB"
    },
    {
      "name": "rui-tools/tmux/references/",
      "bytes": 98476,
      "humanBytes": "96.2 KB"
    },
    {
      "name": "rui-reports/diagram/templates/",
      "bytes": 96501,
      "humanBytes": "94.2 KB"
    },
    {
      "name": "rui-tools/lighthouse/",
      "bytes": 89597,
      "humanBytes": "87.5 KB"
    },
    {
      "name": "rui-code/vue/references/vueuse-sensors/",
      "bytes": 89131,
      "humanBytes": "87.0 KB"
    }
  ],
  "types": [
    {
      "type": ".other",
      "fileCount": 731,
      "totalBytes": 11690035,
      "totalLines": 164694,
      "pctFiles": 82.3,
      "pctBytes": 91.7,
      "totalBytesHuman": "11.1 MB"
    },
    {
      "type": ".js",
      "fileCount": 129,
      "totalBytes": 669949,
      "totalLines": 15778,
      "pctFiles": 14.5,
      "pctBytes": 5.3,
      "totalBytesHuman": "654.2 KB"
    },
    {
      "type": ".mjs",
      "fileCount": 7,
      "totalBytes": 194670,
      "totalLines": 4918,
      "pctFiles": 0.8,
      "pctBytes": 1.5,
      "totalBytesHuman": "190.1 KB"
    },
    {
      "type": ".css",
      "fileCount": 10,
      "totalBytes": 124376,
      "totalLines": 2771,
      "pctFiles": 1.1,
      "pctBytes": 1,
      "totalBytesHuman": "121.5 KB"
    },
    {
      "type": ".py",
      "fileCount": 1,
      "totalBytes": 49906,
      "totalLines": 1167,
      "pctFiles": 0.1,
      "pctBytes": 0.4,
      "totalBytesHuman": "48.7 KB"
    },
    {
      "type": ".vue",
      "fileCount": 10,
      "totalBytes": 13127,
      "totalLines": 383,
      "pctFiles": 1.1,
      "pctBytes": 0.1,
      "totalBytesHuman": "12.8 KB"
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
      "count": 263,
      "pctFiles": 29.6
    },
    {
      "bucket": "51-100",
      "count": 233,
      "pctFiles": 26.2
    },
    {
      "bucket": "101-250",
      "count": 233,
      "pctFiles": 26.2
    },
    {
      "bucket": "251-500",
      "count": 87,
      "pctFiles": 9.8
    },
    {
      "bucket": "501-1000",
      "count": 42,
      "pctFiles": 4.7
    },
    {
      "bucket": "1001-2000",
      "count": 21,
      "pctFiles": 2.4
    },
    {
      "bucket": "2000+",
      "count": 9,
      "pctFiles": 1
    }
  ],
  "largest": [
    {
      "path": "rui-reports/diagram/engine/tree-sitter-dart-wasm/tree-sitter-dart.wasm",
      "bytes": 765060,
      "bytesHuman": "747.1 KB",
      "lines": 2679,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-questions/references/index.json",
      "bytes": 361178,
      "bytesHuman": "352.7 KB",
      "lines": 8978,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-tools/public-api/references/index.json",
      "bytes": 332080,
      "bytesHuman": "324.3 KB",
      "lines": 9150,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-tools/public-api/references/README-public-api-lists.md",
      "bytes": 192986,
      "bytesHuman": "188.5 KB",
      "lines": 1184,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/WorkSans-Bold.ttf",
      "bytes": 191304,
      "bytesHuman": "186.8 KB",
      "lines": 884,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/WorkSans-Regular.ttf",
      "bytes": 188916,
      "bytesHuman": "184.5 KB",
      "lines": 892,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/WorkSans-BoldItalic.ttf",
      "bytes": 175772,
      "bytesHuman": "171.7 KB",
      "lines": 730,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/WorkSans-Italic.ttf",
      "bytes": 174280,
      "bytesHuman": "170.2 KB",
      "lines": 646,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Italic.ttf",
      "bytes": 170004,
      "bytesHuman": "166.0 KB",
      "lines": 1993,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-BoldItalic.ttf",
      "bytes": 169840,
      "bytesHuman": "165.9 KB",
      "lines": 1715,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-questions/references/README-interview-qa.md",
      "bytes": 167331,
      "bytesHuman": "163.4 KB",
      "lines": 5172,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/ArsenalSC-Regular.ttf",
      "bytes": 165848,
      "bytesHuman": "162.0 KB",
      "lines": 1487,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Bold.ttf",
      "bytes": 161000,
      "bytesHuman": "157.2 KB",
      "lines": 1416,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Regular.ttf",
      "bytes": 160380,
      "bytesHuman": "156.6 KB",
      "lines": 1346,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Jura-Medium.ttf",
      "bytes": 154488,
      "bytesHuman": "150.9 KB",
      "lines": 317,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Jura-Light.ttf",
      "bytes": 154308,
      "bytesHuman": "150.7 KB",
      "lines": 454,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-code/vite/references/index.json",
      "bytes": 150714,
      "bytesHuman": "147.2 KB",
      "lines": 3945,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/LibreBaskerville-Regular.ttf",
      "bytes": 147584,
      "bytesHuman": "144.1 KB",
      "lines": 1068,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "rui-questions/references/index.md",
      "bytes": 147254,
      "bytesHuman": "143.8 KB",
      "lines": 2245,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    }
  ],
  "fanin": [
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js",
      "fanIn": 12,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 47,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/index.js",
      "fanIn": 3,
      "fanOut": 41,
      "extDeps": 0,
      "lines": 92,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/language-registry.js",
      "fanIn": 3,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 58,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/types.js",
      "fanIn": 3,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 46,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/graph-builder.js",
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 268,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/llm-analyzer.js",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 135,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/ignore-filter.js",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 3,
      "lines": 87,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/frameworks/index.js",
      "fanIn": 2,
      "fanOut": 10,
      "extDeps": 0,
      "lines": 23,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/persistence/index.js",
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 2,
      "lines": 167,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/index.js",
      "fanIn": 2,
      "fanOut": 12,
      "extDeps": 0,
      "lines": 36,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/tree-sitter-plugin.js",
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 2,
      "lines": 232,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/schema.js",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 607,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/language-lesson.js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 157,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/layer-detector.js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 244,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/normalize-graph.js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 273,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/tour-generator.js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 254,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/change-classifier.js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 111,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/embedding-search.js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 60,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/fingerprint.js",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "lines": 273,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/ignore-generator.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "lines": 156,
      "type": ".js"
    }
  ],
  "fanout": [
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/index.js",
      "fanIn": 3,
      "fanOut": 41,
      "extDeps": 0,
      "lines": 92,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/index.js",
      "fanIn": 0,
      "fanOut": 22,
      "extDeps": 0,
      "lines": 23,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/index.js",
      "fanIn": 2,
      "fanOut": 12,
      "extDeps": 0,
      "lines": 36,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/parsers/index.js",
      "fanIn": 1,
      "fanOut": 12,
      "extDeps": 0,
      "lines": 41,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/frameworks/index.js",
      "fanIn": 2,
      "fanOut": 10,
      "extDeps": 0,
      "lines": 23,
      "type": ".js"
    },
    {
      "path": "rui-tools/ui-ux/components/slides/SlideDeck.vue",
      "fanIn": 0,
      "fanOut": 7,
      "extDeps": 0,
      "lines": 48,
      "type": ".vue"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/index.js",
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 0,
      "lines": 7,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/framework-registry.js",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 68,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/language-registry.js",
      "fanIn": 3,
      "fanOut": 2,
      "extDeps": 0,
      "lines": 58,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/graph-builder.js",
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 268,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/graph-builder.test.js",
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "lines": 357,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/llm-analyzer.test.js",
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "lines": 194,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/ignore-generator.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "lines": 156,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/persistence/index.js",
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 2,
      "lines": 167,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/persistence/persistence.test.js",
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 5,
      "lines": 169,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/discovery.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 52,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/cpp-extractor.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 431,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/csharp-extractor.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 418,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/dart-extractor.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 642,
      "type": ".js"
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/go-extractor.js",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "lines": 335,
      "type": ".js"
    }
  ],
  "hotspots": [
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/index.js",
      "bytes": 3378,
      "bytesHuman": "3.3 KB",
      "lines": 92,
      "type": ".js",
      "fanIn": 3,
      "fanOut": 41,
      "maxDepth": 1,
      "score": 4.95
    },
    {
      "path": "rui-tools/public-api/references/index.json",
      "bytes": 332080,
      "bytesHuman": "324.3 KB",
      "lines": 9150,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.58
    },
    {
      "path": "rui-questions/references/index.json",
      "bytes": 361178,
      "bytesHuman": "352.7 KB",
      "lines": 8978,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.49
    },
    {
      "path": "rui-reports/diagram/engine/core/src/index.js",
      "bytes": 2197,
      "bytesHuman": "2.1 KB",
      "lines": 23,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 22,
      "maxDepth": 4,
      "score": 3.01
    },
    {
      "path": "rui-questions/references/README-interview-qa.md",
      "bytes": 167331,
      "bytesHuman": "163.4 KB",
      "lines": 5172,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 2.59
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js",
      "bytes": 1505,
      "bytesHuman": "1.5 KB",
      "lines": 47,
      "type": ".js",
      "fanIn": 12,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 2.42
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/index.js",
      "bytes": 1624,
      "bytesHuman": "1.6 KB",
      "lines": 36,
      "type": ".js",
      "fanIn": 2,
      "fanOut": 12,
      "maxDepth": 2,
      "score": 2.02
    }
  ],
  "orphans": [
    {
      "path": "rui-reports/diagram/engine/tree-sitter-dart-wasm/tree-sitter-dart.wasm",
      "bytes": 765060,
      "bytesHuman": "747.1 KB",
      "lines": 2679,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1.34
    },
    {
      "path": "rui-questions/references/index.json",
      "bytes": 361178,
      "bytesHuman": "352.7 KB",
      "lines": 8978,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.49
    },
    {
      "path": "rui-tools/public-api/references/index.json",
      "bytes": 332080,
      "bytesHuman": "324.3 KB",
      "lines": 9150,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.58
    },
    {
      "path": "rui-tools/public-api/references/README-public-api-lists.md",
      "bytes": 192986,
      "bytesHuman": "188.5 KB",
      "lines": 1184,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.59
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/WorkSans-Bold.ttf",
      "bytes": 191304,
      "bytesHuman": "186.8 KB",
      "lines": 884,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.44
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/WorkSans-Regular.ttf",
      "bytes": 188916,
      "bytesHuman": "184.5 KB",
      "lines": 892,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.45
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/WorkSans-BoldItalic.ttf",
      "bytes": 175772,
      "bytesHuman": "171.7 KB",
      "lines": 730,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.36
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/WorkSans-Italic.ttf",
      "bytes": 174280,
      "bytesHuman": "170.2 KB",
      "lines": 646,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.32
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Italic.ttf",
      "bytes": 170004,
      "bytesHuman": "166.0 KB",
      "lines": 1993,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-BoldItalic.ttf",
      "bytes": 169840,
      "bytesHuman": "165.9 KB",
      "lines": 1715,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.86
    },
    {
      "path": "rui-questions/references/README-interview-qa.md",
      "bytes": 167331,
      "bytesHuman": "163.4 KB",
      "lines": 5172,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 2.59
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/ArsenalSC-Regular.ttf",
      "bytes": 165848,
      "bytesHuman": "162.0 KB",
      "lines": 1487,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.74
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Bold.ttf",
      "bytes": 161000,
      "bytesHuman": "157.2 KB",
      "lines": 1416,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.71
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Regular.ttf",
      "bytes": 160380,
      "bytesHuman": "156.6 KB",
      "lines": 1346,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.67
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Jura-Medium.ttf",
      "bytes": 154488,
      "bytesHuman": "150.9 KB",
      "lines": 317,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.16
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Jura-Light.ttf",
      "bytes": 154308,
      "bytesHuman": "150.7 KB",
      "lines": 454,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.23
    },
    {
      "path": "rui-code/vite/references/index.json",
      "bytes": 150714,
      "bytesHuman": "147.2 KB",
      "lines": 3945,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1.97
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/LibreBaskerville-Regular.ttf",
      "bytes": 147584,
      "bytesHuman": "144.1 KB",
      "lines": 1068,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.53
    },
    {
      "path": "rui-questions/references/index.md",
      "bytes": 147254,
      "bytesHuman": "143.8 KB",
      "lines": 2245,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1.12
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Lora-BoldItalic.ttf",
      "bytes": 140332,
      "bytesHuman": "137.0 KB",
      "lines": 1024,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.51
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Lora-Italic.ttf",
      "bytes": 139328,
      "bytesHuman": "136.1 KB",
      "lines": 667,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.33
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexMono-Bold.ttf",
      "bytes": 136008,
      "bytesHuman": "132.8 KB",
      "lines": 851,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.43
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Lora-Regular.ttf",
      "bytes": 133888,
      "bytesHuman": "130.8 KB",
      "lines": 516,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.26
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Lora-Bold.ttf",
      "bytes": 133828,
      "bytesHuman": "130.7 KB",
      "lines": 850,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.42
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexMono-Regular.ttf",
      "bytes": 133796,
      "bytesHuman": "130.7 KB",
      "lines": 822,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.41
    },
    {
      "path": "rui-tools/public-api/references/index.md",
      "bytes": 126994,
      "bytesHuman": "124.0 KB",
      "lines": 1183,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.59
    },
    {
      "path": "rui-tools/cc/references/index.json",
      "bytes": 115031,
      "bytesHuman": "112.3 KB",
      "lines": 2599,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1.3
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/JetBrainsMono-Regular.ttf",
      "bytes": 114904,
      "bytesHuman": "112.2 KB",
      "lines": 609,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.3
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/JetBrainsMono-Bold.ttf",
      "bytes": 114828,
      "bytesHuman": "112.1 KB",
      "lines": 605,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.3
    },
    {
      "path": "rui-code/tauri/references/index.json",
      "bytes": 108873,
      "bytesHuman": "106.3 KB",
      "lines": 3083,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1.54
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/CrimsonPro-Italic.ttf",
      "bytes": 108828,
      "bytesHuman": "106.3 KB",
      "lines": 763,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.38
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/CrimsonPro-Bold.ttf",
      "bytes": 107352,
      "bytesHuman": "104.8 KB",
      "lines": 476,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.24
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/CrimsonPro-Regular.ttf",
      "bytes": 106696,
      "bytesHuman": "104.2 KB",
      "lines": 573,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.29
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/YoungSerif-Regular.ttf",
      "bytes": 105136,
      "bytesHuman": "102.7 KB",
      "lines": 1145,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.57
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Gloock-Regular.ttf",
      "bytes": 95156,
      "bytesHuman": "92.9 KB",
      "lines": 1375,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.69
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/BigShoulders-Bold.ttf",
      "bytes": 94528,
      "bytesHuman": "92.3 KB",
      "lines": 489,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.24
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/BigShoulders-Regular.ttf",
      "bytes": 94396,
      "bytesHuman": "92.2 KB",
      "lines": 366,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.18
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/BricolageGrotesque-Bold.ttf",
      "bytes": 90952,
      "bytesHuman": "88.8 KB",
      "lines": 331,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.17
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/BricolageGrotesque-Regular.ttf",
      "bytes": 90920,
      "bytesHuman": "88.8 KB",
      "lines": 276,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.14
    },
    {
      "path": "rui-cto/references/index.json",
      "bytes": 83508,
      "bytesHuman": "81.6 KB",
      "lines": 2206,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1.1
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/NationalPark-Bold.ttf",
      "bytes": 79208,
      "bytesHuman": "77.4 KB",
      "lines": 611,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.31
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/GeistMono-Bold.ttf",
      "bytes": 78304,
      "bytesHuman": "76.5 KB",
      "lines": 262,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.13
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/GeistMono-Regular.ttf",
      "bytes": 78232,
      "bytesHuman": "76.4 KB",
      "lines": 285,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.14
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Boldonse-Regular.ttf",
      "bytes": 77168,
      "bytesHuman": "75.4 KB",
      "lines": 872,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.44
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/NationalPark-Regular.ttf",
      "bytes": 76424,
      "bytesHuman": "74.6 KB",
      "lines": 601,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.3
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Tektur-Medium.ttf",
      "bytes": 76248,
      "bytesHuman": "74.5 KB",
      "lines": 506,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.25
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Tektur-Regular.ttf",
      "bytes": 75604,
      "bytesHuman": "73.8 KB",
      "lines": 314,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.16
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/InstrumentSerif-Italic.ttf",
      "bytes": 70868,
      "bytesHuman": "69.2 KB",
      "lines": 826,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.41
    }
  ],
  "depthStats": {
    "max": 4,
    "mean": 1.71,
    "median": 1,
    "p90": 3,
    "filesAtMax": 3
  },
  "depthRanking": [
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/graph-builder.test.js",
      "bytes": 16135,
      "bytesHuman": "15.8 KB",
      "lines": 357,
      "type": ".js",
      "maxDepth": 4,
      "fanIn": 0,
      "fanOut": 1
    },
    {
      "path": "rui-reports/diagram/engine/core/src/index.js",
      "bytes": 2197,
      "bytesHuman": "2.1 KB",
      "lines": 23,
      "type": ".js",
      "maxDepth": 4,
      "fanIn": 0,
      "fanOut": 22
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/tree-sitter-plugin.test.js",
      "bytes": 9918,
      "bytesHuman": "9.7 KB",
      "lines": 260,
      "type": ".js",
      "maxDepth": 4,
      "fanIn": 0,
      "fanOut": 1
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/graph-builder.js",
      "bytes": 9048,
      "bytesHuman": "8.8 KB",
      "lines": 268,
      "type": ".js",
      "maxDepth": 3,
      "fanIn": 2,
      "fanOut": 1
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/index.js",
      "bytes": 404,
      "bytesHuman": "404 B",
      "lines": 7,
      "type": ".js",
      "maxDepth": 3,
      "fanIn": 1,
      "fanOut": 5
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/registry.js",
      "bytes": 2419,
      "bytesHuman": "2.4 KB",
      "lines": 73,
      "type": ".js",
      "maxDepth": 3,
      "fanIn": 1,
      "fanOut": 1
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/tree-sitter-plugin.js",
      "bytes": 9360,
      "bytesHuman": "9.1 KB",
      "lines": 232,
      "type": ".js",
      "maxDepth": 3,
      "fanIn": 2,
      "fanOut": 1
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/framework-registry.js",
      "bytes": 2496,
      "bytesHuman": "2.4 KB",
      "lines": 68,
      "type": ".js",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 2
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/language-registry.js",
      "bytes": 2093,
      "bytesHuman": "2.0 KB",
      "lines": 58,
      "type": ".js",
      "maxDepth": 2,
      "fanIn": 3,
      "fanOut": 2
    },
    {
      "path": "rui-reports/diagram/engine/core/src/persistence/persistence.test.js",
      "bytes": 6526,
      "bytesHuman": "6.4 KB",
      "lines": 169,
      "type": ".js",
      "maxDepth": 2,
      "fanIn": 0,
      "fanOut": 1
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/discovery.js",
      "bytes": 1593,
      "bytesHuman": "1.6 KB",
      "lines": 52,
      "type": ".js",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 1
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/index.js",
      "bytes": 1624,
      "bytesHuman": "1.6 KB",
      "lines": 36,
      "type": ".js",
      "maxDepth": 2,
      "fanIn": 2,
      "fanOut": 12
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/llm-analyzer.test.js",
      "bytes": 8710,
      "bytesHuman": "8.5 KB",
      "lines": 194,
      "type": ".js",
      "maxDepth": 1,
      "fanIn": 0,
      "fanOut": 1
    },
    {
      "path": "rui-reports/diagram/engine/core/src/ignore-generator.js",
      "bytes": 5378,
      "bytesHuman": "5.3 KB",
      "lines": 156,
      "type": ".js",
      "maxDepth": 1,
      "fanIn": 1,
      "fanOut": 1
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/index.js",
      "bytes": 3378,
      "bytesHuman": "3.3 KB",
      "lines": 92,
      "type": ".js",
      "maxDepth": 1,
      "fanIn": 3,
      "fanOut": 41
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/frameworks/index.js",
      "bytes": 788,
      "bytesHuman": "788 B",
      "lines": 23,
      "type": ".js",
      "maxDepth": 1,
      "fanIn": 2,
      "fanOut": 10
    },
    {
      "path": "rui-reports/diagram/engine/core/src/persistence/index.js",
      "bytes": 6287,
      "bytesHuman": "6.1 KB",
      "lines": 167,
      "type": ".js",
      "maxDepth": 1,
      "fanIn": 2,
      "fanOut": 1
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/cpp-extractor.js",
      "bytes": 17277,
      "bytesHuman": "16.9 KB",
      "lines": 431,
      "type": ".js",
      "maxDepth": 1,
      "fanIn": 1,
      "fanOut": 1
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/csharp-extractor.js",
      "bytes": 15661,
      "bytesHuman": "15.3 KB",
      "lines": 418,
      "type": ".js",
      "maxDepth": 1,
      "fanIn": 1,
      "fanOut": 1
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/dart-extractor.js",
      "bytes": 28005,
      "bytesHuman": "27.3 KB",
      "lines": 642,
      "type": ".js",
      "maxDepth": 1,
      "fanIn": 1,
      "fanOut": 1
    }
  ],
  "cycles": [],
  "freshness": [],
  "freshnessBuckets": [
    {
      "bucket": "<30d",
      "count": 888,
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
    "asOf": 1784253579,
    "asOfHuman": "2026-07-17",
    "maxAge": 0,
    "median": 0,
    "p90": 0,
    "staleCount": 0,
    "criticalCount": 0
  },
  "records": [
    {
      "path": "rui-code/chrome/evals/evals.json",
      "bytes": 5452,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/chrome/references/engineering.md",
      "bytes": 8839,
      "lines": 229,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/chrome/references/manifest.md",
      "bytes": 7171,
      "lines": 219,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/chrome/references/performance.md",
      "bytes": 7672,
      "lines": 203,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/chrome/references/scripting.md",
      "bytes": 5941,
      "lines": 184,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/chrome/references/security.md",
      "bytes": 7103,
      "lines": 184,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/chrome/references/side-panel.md",
      "bytes": 5246,
      "lines": 171,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/chrome/references/user-scripts.md",
      "bytes": 5388,
      "lines": 144,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/chrome/SKILL.md",
      "bytes": 6204,
      "lines": 105,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/css/evals/evals.json",
      "bytes": 4587,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/css/references/index.json",
      "bytes": 21695,
      "lines": 679,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/css/references/index.md",
      "bytes": 6974,
      "lines": 187,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/css/references/sources.json",
      "bytes": 713,
      "lines": 20,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/css/SKILL.md",
      "bytes": 4496,
      "lines": 94,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/commands/refactor.md",
      "bytes": 1841,
      "lines": 47,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/commands/review.md",
      "bytes": 2751,
      "lines": 66,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/commands/scaffold.md",
      "bytes": 1968,
      "lines": 46,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/evals/evals.json",
      "bytes": 5084,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/references/anti-patterns.md",
      "bytes": 3042,
      "lines": 34,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/references/async-routes.md",
      "bytes": 2726,
      "lines": 84,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/references/authentication.md",
      "bytes": 1661,
      "lines": 65,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/references/background-tasks.md",
      "bytes": 1781,
      "lines": 47,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/references/database.md",
      "bytes": 1986,
      "lines": 62,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/references/dependencies.md",
      "bytes": 3243,
      "lines": 105,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/references/documentation.md",
      "bytes": 1374,
      "lines": 49,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/references/migrations.md",
      "bytes": 987,
      "lines": 31,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/references/project-structure.md",
      "bytes": 3575,
      "lines": 96,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/references/pydantic.md",
      "bytes": 3341,
      "lines": 120,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/references/quick-reference.md",
      "bytes": 1801,
      "lines": 35,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/references/testing.md",
      "bytes": 1597,
      "lines": 61,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/fastapi/SKILL.md",
      "bytes": 6482,
      "lines": 105,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/h5/evals/evals.json",
      "bytes": 5036,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/h5/references/index.json",
      "bytes": 30901,
      "lines": 819,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/h5/references/index.md",
      "bytes": 11409,
      "lines": 231,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/h5/references/sources.json",
      "bytes": 1810,
      "lines": 34,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/h5/SKILL.md",
      "bytes": 6621,
      "lines": 122,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/nginx/evals/evals.json",
      "bytes": 4890,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/nginx/references/index.json",
      "bytes": 63526,
      "lines": 1570,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/nginx/references/index.md",
      "bytes": 24268,
      "lines": 287,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/nginx/references/sources.json",
      "bytes": 386,
      "lines": 12,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/nginx/SKILL.md",
      "bytes": 7033,
      "lines": 127,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/nodejs/evals/evals.json",
      "bytes": 5050,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/nodejs/references/index.json",
      "bytes": 55138,
      "lines": 1237,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/nodejs/references/index.md",
      "bytes": 20429,
      "lines": 189,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/nodejs/references/sources.json",
      "bytes": 458,
      "lines": 13,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/nodejs/SKILL.md",
      "bytes": 6136,
      "lines": 113,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/tauri/evals/evals.json",
      "bytes": 4400,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/tauri/references/index.json",
      "bytes": 108873,
      "lines": 3083,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/tauri/references/index.md",
      "bytes": 35237,
      "lines": 510,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/tauri/references/sources.json",
      "bytes": 344,
      "lines": 12,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/tauri/SKILL.md",
      "bytes": 5793,
      "lines": 113,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vite/evals/evals.json",
      "bytes": 4374,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vite/references/index.json",
      "bytes": 150714,
      "lines": 3945,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vite/references/index.md",
      "bytes": 52357,
      "lines": 752,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vite/references/sources.json",
      "bytes": 333,
      "lines": 12,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vite/SKILL.md",
      "bytes": 6924,
      "lines": 125,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/evals/evals.json",
      "bytes": 5065,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/animation/animation-class-based-technique.md",
      "bytes": 5026,
      "lines": 254,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/animation/animation-state-driven-technique.md",
      "bytes": 5829,
      "lines": 291,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/animation/README.md",
      "bytes": 290,
      "lines": 10,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/async/component-async.md",
      "bytes": 2529,
      "lines": 97,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/async/README.md",
      "bytes": 170,
      "lines": 9,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/builtin/component-keep-alive.md",
      "bytes": 3487,
      "lines": 137,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/builtin/component-suspense.md",
      "bytes": 5367,
      "lines": 228,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/builtin/component-teleport.md",
      "bytes": 2921,
      "lines": 108,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/builtin/component-transition-group.md",
      "bytes": 3004,
      "lines": 128,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/builtin/component-transition.md",
      "bytes": 2722,
      "lines": 125,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/builtin/README.md",
      "bytes": 457,
      "lines": 13,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/composables/composables.md",
      "bytes": 7011,
      "lines": 290,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/composables/README.md",
      "bytes": 158,
      "lines": 9,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/core/core--advanced-patterns.md",
      "bytes": 6021,
      "lines": 314,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/core/core--core-new-apis.md",
      "bytes": 5335,
      "lines": 264,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/core/core--GENERATION.md",
      "bytes": 133,
      "lines": 5,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/core/core--README.md",
      "bytes": 2255,
      "lines": 77,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/core/core--script-setup-macros.md",
      "bytes": 3899,
      "lines": 204,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/core/README.md",
      "bytes": 435,
      "lines": 14,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/core/sfc--sfc.md",
      "bytes": 6216,
      "lines": 310,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/css/css-architecture.md",
      "bytes": 2289,
      "lines": 60,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/css/README.md",
      "bytes": 153,
      "lines": 9,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/data-flow/component-data-flow.md",
      "bytes": 6956,
      "lines": 307,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/data-flow/README.md",
      "bytes": 201,
      "lines": 9,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/directives/directives.md",
      "bytes": 3803,
      "lines": 162,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/directives/README.md",
      "bytes": 215,
      "lines": 10,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/directives/render-functions.md",
      "bytes": 3866,
      "lines": 201,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/index.md",
      "bytes": 1869,
      "lines": 35,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/infra/infrastructure-and-workflows.md",
      "bytes": 3260,
      "lines": 81,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/infra/README.md",
      "bytes": 197,
      "lines": 9,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/pattern/component-pattern-spec.md",
      "bytes": 3722,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/pattern/README.md",
      "bytes": 177,
      "lines": 9,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/perf/perf--perf-avoid-component-abstraction-in-lists.md",
      "bytes": 4683,
      "lines": 159,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/perf/perf--perf-v-once-v-memo-directives.md",
      "bytes": 4766,
      "lines": 182,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/perf/perf--perf-virtualize-large-lists.md",
      "bytes": 5002,
      "lines": 187,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/perf/perf--updated-hook-performance.md",
      "bytes": 4618,
      "lines": 187,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/perf/README.md",
      "bytes": 468,
      "lines": 12,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/reactivity/reactivity--reactivity.md",
      "bytes": 8452,
      "lines": 344,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/reactivity/README.md",
      "bytes": 198,
      "lines": 9,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/slots/component-fallthrough-attrs.md",
      "bytes": 4047,
      "lines": 174,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/slots/component-slots.md",
      "bytes": 4469,
      "lines": 216,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/slots/README.md",
      "bytes": 231,
      "lines": 10,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/state/plugins.md",
      "bytes": 3882,
      "lines": 166,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/state/README.md",
      "bytes": 203,
      "lines": 10,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/state/state-management.md",
      "bytes": 3380,
      "lines": 135,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-animation/README.md",
      "bytes": 448,
      "lines": 17,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-animation/useAnimate.md",
      "bytes": 4177,
      "lines": 180,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-animation/useInterval.md",
      "bytes": 2482,
      "lines": 112,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-animation/useIntervalFn.md",
      "bytes": 869,
      "lines": 50,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-animation/useNow.md",
      "bytes": 1550,
      "lines": 83,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-animation/useRafFn.md",
      "bytes": 1515,
      "lines": 68,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-animation/useTimeout.md",
      "bytes": 2377,
      "lines": 113,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-animation/useTimeoutFn.md",
      "bytes": 913,
      "lines": 51,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-animation/useTimestamp.md",
      "bytes": 1829,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-animation/useTransition.md",
      "bytes": 8280,
      "lines": 265,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-array/README.md",
      "bytes": 666,
      "lines": 21,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-array/useArrayDifference.md",
      "bytes": 2389,
      "lines": 84,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-array/useArrayEvery.md",
      "bytes": 1277,
      "lines": 59,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-array/useArrayFilter.md",
      "bytes": 1738,
      "lines": 63,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-array/useArrayFind.md",
      "bytes": 1088,
      "lines": 50,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-array/useArrayFindIndex.md",
      "bytes": 1280,
      "lines": 59,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-array/useArrayFindLast.md",
      "bytes": 1167,
      "lines": 52,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-array/useArrayIncludes.md",
      "bytes": 1495,
      "lines": 63,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-array/useArrayJoin.md",
      "bytes": 1846,
      "lines": 74,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-array/useArrayMap.md",
      "bytes": 1338,
      "lines": 59,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-array/useArrayReduce.md",
      "bytes": 1929,
      "lines": 81,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-array/useArraySome.md",
      "bytes": 1256,
      "lines": 59,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-array/useArrayUnique.md",
      "bytes": 1577,
      "lines": 76,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-array/useSorted.md",
      "bytes": 1761,
      "lines": 90,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/README.md",
      "bytes": 2118,
      "lines": 53,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useBluetooth.md",
      "bytes": 5827,
      "lines": 174,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useBreakpoints.md",
      "bytes": 5796,
      "lines": 176,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useBroadcastChannel.md",
      "bytes": 1723,
      "lines": 73,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useBrowserLocation.md",
      "bytes": 1145,
      "lines": 56,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useClipboard.md",
      "bytes": 4548,
      "lines": 124,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useClipboardItems.md",
      "bytes": 2666,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useColorMode.md",
      "bytes": 4301,
      "lines": 172,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useCssSupports.md",
      "bytes": 795,
      "lines": 33,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useCssVar.md",
      "bytes": 1002,
      "lines": 50,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useDark.md",
      "bytes": 3261,
      "lines": 142,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useEventListener.md",
      "bytes": 6683,
      "lines": 226,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useEyeDropper.md",
      "bytes": 1444,
      "lines": 72,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useFavicon.md",
      "bytes": 1492,
      "lines": 69,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useFileDialog.md",
      "bytes": 1987,
      "lines": 91,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useFileSystemAccess.md",
      "bytes": 4737,
      "lines": 161,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useFullscreen.md",
      "bytes": 1856,
      "lines": 74,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useGamepad.md",
      "bytes": 4628,
      "lines": 176,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useImage.md",
      "bytes": 2420,
      "lines": 90,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useMediaControls.md",
      "bytes": 5212,
      "lines": 201,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useMediaQuery.md",
      "bytes": 1531,
      "lines": 53,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useMemory.md",
      "bytes": 1477,
      "lines": 70,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useObjectUrl.md",
      "bytes": 1257,
      "lines": 55,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/usePerformanceObserver.md",
      "bytes": 863,
      "lines": 48,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/usePermission.md",
      "bytes": 1828,
      "lines": 78,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/usePreferredColorScheme.md",
      "bytes": 852,
      "lines": 42,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/usePreferredContrast.md",
      "bytes": 816,
      "lines": 42,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/usePreferredDark.md",
      "bytes": 610,
      "lines": 41,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/usePreferredLanguages.md",
      "bytes": 972,
      "lines": 41,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/usePreferredReducedMotion.md",
      "bytes": 861,
      "lines": 42,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/usePreferredReducedTransparency.md",
      "bytes": 957,
      "lines": 42,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useScreenOrientation.md",
      "bytes": 2533,
      "lines": 98,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useScreenSafeArea.md",
      "bytes": 1301,
      "lines": 60,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useScriptTag.md",
      "bytes": 2589,
      "lines": 116,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useShare.md",
      "bytes": 1473,
      "lines": 67,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useSSRWidth.md",
      "bytes": 894,
      "lines": 47,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useStyleTag.md",
      "bytes": 2222,
      "lines": 131,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useTextareaAutosize.md",
      "bytes": 2798,
      "lines": 121,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useTextDirection.md",
      "bytes": 1409,
      "lines": 75,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useTitle.md",
      "bytes": 2693,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useUrlSearchParams.md",
      "bytes": 2888,
      "lines": 121,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useVibrate.md",
      "bytes": 2319,
      "lines": 86,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useWakeLock.md",
      "bytes": 1713,
      "lines": 51,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useWebNotification.md",
      "bytes": 4308,
      "lines": 175,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useWebWorker.md",
      "bytes": 2478,
      "lines": 60,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-browser/useWebWorkerFn.md",
      "bytes": 2502,
      "lines": 102,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/computedInject.md",
      "bytes": 3254,
      "lines": 137,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/createReusableTemplate.md",
      "bytes": 9333,
      "lines": 361,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/createTemplatePromise.md",
      "bytes": 8184,
      "lines": 306,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/README.md",
      "bytes": 835,
      "lines": 24,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/templateRef.md",
      "bytes": 1657,
      "lines": 86,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/tryOnBeforeMount.md",
      "bytes": 621,
      "lines": 34,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/tryOnBeforeUnmount.md",
      "bytes": 524,
      "lines": 32,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/tryOnMounted.md",
      "bytes": 593,
      "lines": 34,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/tryOnScopeDispose.md",
      "bytes": 492,
      "lines": 31,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/tryOnUnmounted.md",
      "bytes": 496,
      "lines": 32,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/unrefElement.md",
      "bytes": 1385,
      "lines": 54,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/useCurrentElement.md",
      "bytes": 1556,
      "lines": 61,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/useMounted.md",
      "bytes": 486,
      "lines": 38,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/useTemplateRefsList.md",
      "bytes": 660,
      "lines": 37,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/useVirtualList.md",
      "bytes": 5165,
      "lines": 182,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/useVModel.md",
      "bytes": 4119,
      "lines": 182,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-component/useVModels.md",
      "bytes": 1339,
      "lines": 67,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/README.md",
      "bytes": 838,
      "lines": 23,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useActiveElement.md",
      "bytes": 2002,
      "lines": 86,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useDocumentVisibility.md",
      "bytes": 946,
      "lines": 44,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useDraggable.md",
      "bytes": 7554,
      "lines": 289,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useDropZone.md",
      "bytes": 2268,
      "lines": 83,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useElementBounding.md",
      "bytes": 2732,
      "lines": 131,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useElementSize.md",
      "bytes": 1600,
      "lines": 79,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useElementVisibility.md",
      "bytes": 4066,
      "lines": 163,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useIntersectionObserver.md",
      "bytes": 2684,
      "lines": 117,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useMouseInElement.md",
      "bytes": 3092,
      "lines": 132,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useMutationObserver.md",
      "bytes": 1383,
      "lines": 60,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useParentElement.md",
      "bytes": 989,
      "lines": 54,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useResizeObserver.md",
      "bytes": 2651,
      "lines": 108,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useWindowFocus.md",
      "bytes": 747,
      "lines": 46,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useWindowScroll.md",
      "bytes": 808,
      "lines": 46,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-elements/useWindowSize.md",
      "bytes": 1487,
      "lines": 78,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-network/README.md",
      "bytes": 231,
      "lines": 11,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-network/useEventSource.md",
      "bytes": 4695,
      "lines": 204,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-network/useFetch.md",
      "bytes": 14879,
      "lines": 546,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-network/useWebSocket.md",
      "bytes": 7750,
      "lines": 299,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/computedAsync.md",
      "bytes": 5330,
      "lines": 195,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/computedEager.md",
      "bytes": 2023,
      "lines": 62,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/computedWithControl.md",
      "bytes": 2222,
      "lines": 98,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/createRef.md",
      "bytes": 1189,
      "lines": 54,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/extendRef.md",
      "bytes": 1579,
      "lines": 76,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/reactify.md",
      "bytes": 3131,
      "lines": 144,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/reactifyObject.md",
      "bytes": 1203,
      "lines": 62,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/reactiveComputed.md",
      "bytes": 609,
      "lines": 34,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/reactiveOmit.md",
      "bytes": 1592,
      "lines": 86,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/reactivePick.md",
      "bytes": 2030,
      "lines": 106,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/README.md",
      "bytes": 910,
      "lines": 29,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/refAutoReset.md",
      "bytes": 1192,
      "lines": 46,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/refDebounced.md",
      "bytes": 1706,
      "lines": 81,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/refDefault.md",
      "bytes": 541,
      "lines": 36,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/refManualReset.md",
      "bytes": 1134,
      "lines": 48,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/refThrottled.md",
      "bytes": 2829,
      "lines": 99,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/refWithControl.md",
      "bytes": 3426,
      "lines": 145,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/syncRef.md",
      "bytes": 4021,
      "lines": 195,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/syncRefs.md",
      "bytes": 2450,
      "lines": 128,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/toReactive.md",
      "bytes": 738,
      "lines": 41,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/toRef.md",
      "bytes": 2228,
      "lines": 74,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-reactivity/toRefs.md",
      "bytes": 1497,
      "lines": 78,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/onClickOutside.md",
      "bytes": 4815,
      "lines": 228,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/onElementRemoval.md",
      "bytes": 1667,
      "lines": 88,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/onKeyStroke.md",
      "bytes": 4611,
      "lines": 212,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/onLongPress.md",
      "bytes": 5443,
      "lines": 235,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/onStartTyping.md",
      "bytes": 1230,
      "lines": 53,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/README.md",
      "bytes": 1693,
      "lines": 46,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useBattery.md",
      "bytes": 2923,
      "lines": 80,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useDeviceMotion.md",
      "bytes": 3450,
      "lines": 80,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useDeviceOrientation.md",
      "bytes": 2290,
      "lines": 64,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useDevicePixelRatio.md",
      "bytes": 1340,
      "lines": 47,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useDevicesList.md",
      "bytes": 1988,
      "lines": 89,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useDisplayMedia.md",
      "bytes": 1452,
      "lines": 67,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useElementByPoint.md",
      "bytes": 1175,
      "lines": 46,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useElementHover.md",
      "bytes": 1565,
      "lines": 79,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useFocus.md",
      "bytes": 2605,
      "lines": 99,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useFocusWithin.md",
      "bytes": 1416,
      "lines": 57,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useFps.md",
      "bytes": 384,
      "lines": 28,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useGeolocation.md",
      "bytes": 2608,
      "lines": 63,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useIdle.md",
      "bytes": 1724,
      "lines": 88,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useInfiniteScroll.md",
      "bytes": 3784,
      "lines": 156,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useKeyModifier.md",
      "bytes": 2365,
      "lines": 87,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useMagicKeys.md",
      "bytes": 6133,
      "lines": 245,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useMouse.md",
      "bytes": 2468,
      "lines": 113,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useMousePressed.md",
      "bytes": 2621,
      "lines": 116,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useNavigatorLanguage.md",
      "bytes": 1525,
      "lines": 57,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useNetwork.md",
      "bytes": 2754,
      "lines": 106,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useOnline.md",
      "bytes": 568,
      "lines": 41,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/usePageLeave.md",
      "bytes": 738,
      "lines": 43,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useParallax.md",
      "bytes": 1302,
      "lines": 58,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/usePointer.md",
      "bytes": 1735,
      "lines": 91,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/usePointerLock.md",
      "bytes": 1106,
      "lines": 59,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/usePointerSwipe.md",
      "bytes": 1712,
      "lines": 80,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useScroll.md",
      "bytes": 5372,
      "lines": 238,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useScrollLock.md",
      "bytes": 1159,
      "lines": 66,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useSpeechRecognition.md",
      "bytes": 2224,
      "lines": 90,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useSpeechSynthesis.md",
      "bytes": 2448,
      "lines": 101,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useSwipe.md",
      "bytes": 1518,
      "lines": 75,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useTextSelection.md",
      "bytes": 989,
      "lines": 43,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-sensors/useUserMedia.md",
      "bytes": 2231,
      "lines": 96,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/createGlobalState.md",
      "bytes": 1803,
      "lines": 95,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/createInjectionState.md",
      "bytes": 5481,
      "lines": 226,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/createSharedComposable.md",
      "bytes": 1133,
      "lines": 42,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/injectLocal.md",
      "bytes": 742,
      "lines": 35,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/provideLocal.md",
      "bytes": 855,
      "lines": 37,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/README.md",
      "bytes": 824,
      "lines": 23,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/useAsyncState.md",
      "bytes": 5050,
      "lines": 185,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/useDebouncedRefHistory.md",
      "bytes": 962,
      "lines": 40,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/useLastChanged.md",
      "bytes": 1446,
      "lines": 63,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/useLocalStorage.md",
      "bytes": 1100,
      "lines": 41,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/useManualRefHistory.md",
      "bytes": 5258,
      "lines": 204,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/useRefHistory.md",
      "bytes": 8014,
      "lines": 285,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/useSessionStorage.md",
      "bytes": 1116,
      "lines": 41,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/useStorage.md",
      "bytes": 8121,
      "lines": 278,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/useStorageAsync.md",
      "bytes": 3455,
      "lines": 136,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-state/useThrottledRefHistory.md",
      "bytes": 1227,
      "lines": 47,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-time/README.md",
      "bytes": 270,
      "lines": 12,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-time/useCountdown.md",
      "bytes": 2202,
      "lines": 105,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-time/useDateFormat.md",
      "bytes": 5803,
      "lines": 145,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-time/useTimeAgo.md",
      "bytes": 3511,
      "lines": 154,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-time/useTimeAgoIntl.md",
      "bytes": 3154,
      "lines": 117,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/createDisposableDirective.md",
      "bytes": 1301,
      "lines": 47,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/createEventHook.md",
      "bytes": 1901,
      "lines": 86,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/createUnrefFn.md",
      "bytes": 1301,
      "lines": 51,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/get.md",
      "bytes": 395,
      "lines": 30,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/isDefined.md",
      "bytes": 633,
      "lines": 31,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/makeDestructurable.md",
      "bytes": 728,
      "lines": 41,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/README.md",
      "bytes": 1096,
      "lines": 33,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/set.md",
      "bytes": 383,
      "lines": 30,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useAsyncQueue.md",
      "bytes": 2698,
      "lines": 136,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useCached.md",
      "bytes": 1230,
      "lines": 55,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useCloned.md",
      "bytes": 2041,
      "lines": 102,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useConfirmDialog.md",
      "bytes": 3859,
      "lines": 159,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useCounter.md",
      "bytes": 1666,
      "lines": 86,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useCycleList.md",
      "bytes": 1432,
      "lines": 75,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useDebounceFn.md",
      "bytes": 2776,
      "lines": 100,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useEventBus.md",
      "bytes": 2339,
      "lines": 101,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useMemoize.md",
      "bytes": 4350,
      "lines": 175,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useOffsetPagination.md",
      "bytes": 4080,
      "lines": 199,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/usePrevious.md",
      "bytes": 712,
      "lines": 40,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useStepper.md",
      "bytes": 3236,
      "lines": 137,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useSupported.md",
      "bytes": 465,
      "lines": 29,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useThrottleFn.md",
      "bytes": 1913,
      "lines": 57,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useTimeoutPoll.md",
      "bytes": 880,
      "lines": 47,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useToggle.md",
      "bytes": 2240,
      "lines": 103,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useToNumber.md",
      "bytes": 1007,
      "lines": 54,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-utilities/useToString.md",
      "bytes": 508,
      "lines": 34,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-watch/README.md",
      "bytes": 614,
      "lines": 21,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-watch/until.md",
      "bytes": 3845,
      "lines": 161,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-watch/watchArray.md",
      "bytes": 1162,
      "lines": 53,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-watch/watchAtMost.md",
      "bytes": 1557,
      "lines": 63,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-watch/watchDebounced.md",
      "bytes": 2614,
      "lines": 101,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-watch/watchDeep.md",
      "bytes": 1190,
      "lines": 54,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-watch/watchIgnorable.md",
      "bytes": 3140,
      "lines": 120,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-watch/watchImmediate.md",
      "bytes": 1029,
      "lines": 44,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-watch/watchOnce.md",
      "bytes": 1020,
      "lines": 41,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-watch/watchPausable.md",
      "bytes": 2404,
      "lines": 86,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-watch/watchThrottled.md",
      "bytes": 2782,
      "lines": 108,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-watch/watchTriggerable.md",
      "bytes": 2527,
      "lines": 98,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-watch/watchWithFilter.md",
      "bytes": 1435,
      "lines": 54,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/references/vueuse-watch/whenever.md",
      "bytes": 2080,
      "lines": 108,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-code/vue/SKILL.md",
      "bytes": 12700,
      "lines": 124,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-cto/evals/evals.json",
      "bytes": 4085,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-cto/references/index.json",
      "bytes": 83508,
      "lines": 2206,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-cto/references/index.md",
      "bytes": 33274,
      "lines": 412,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-cto/references/sources.json",
      "bytes": 328,
      "lines": 12,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-cto/SKILL.md",
      "bytes": 4540,
      "lines": 91,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/01-operator/CONCERN.md",
      "bytes": 9018,
      "lines": 157,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/01-operator/references/operator-quickstart.md",
      "bytes": 4897,
      "lines": 121,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/01-operator/references/operator-scenarios.md",
      "bytes": 4129,
      "lines": 94,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/02-layout/CONCERN.md",
      "bytes": 6614,
      "lines": 120,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/02-layout/references/layout-regions.md",
      "bytes": 4173,
      "lines": 68,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/02-layout/references/layout-spec.md",
      "bytes": 1579,
      "lines": 39,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/03-diagram/CONCERN.md",
      "bytes": 9757,
      "lines": 162,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/03-diagram/references/diagrams/architecture.mmd",
      "bytes": 1225,
      "lines": 34,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/03-diagram/references/diagrams/changelog.mmd",
      "bytes": 659,
      "lines": 19,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/03-diagram/references/diagrams/recipes.mmd",
      "bytes": 788,
      "lines": 24,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/03-diagram/references/diagrams/troubleshooting.mmd",
      "bytes": 1315,
      "lines": 41,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/03-diagram/references/diagrams/workflow.mmd",
      "bytes": 976,
      "lines": 30,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/04-reactivity/CONCERN.md",
      "bytes": 7082,
      "lines": 143,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/04-reactivity/references/reactivity-map.md",
      "bytes": 3150,
      "lines": 65,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/05-quality/CONCERN.md",
      "bytes": 8344,
      "lines": 128,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/05-quality/references/fragment-contracts.md",
      "bytes": 5796,
      "lines": 129,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/05-quality/references/quality-bar.md",
      "bytes": 3459,
      "lines": 74,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/05-quality/references/writing-guidelines.md",
      "bytes": 2990,
      "lines": 74,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/06-responsive/CONCERN.md",
      "bytes": 7470,
      "lines": 164,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/06-responsive/references/responsive-print.md",
      "bytes": 3442,
      "lines": 104,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/07-perf/CONCERN.md",
      "bytes": 7664,
      "lines": 133,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/07-perf/references/performance-budget.md",
      "bytes": 5314,
      "lines": 108,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/08-config/CONCERN.md",
      "bytes": 11095,
      "lines": 223,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/08-config/references/config-cookbook.md",
      "bytes": 6412,
      "lines": 175,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/09-troubleshoot/CONCERN.md",
      "bytes": 11478,
      "lines": 179,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/concerns/09-troubleshoot/references/troubleshooting-guide.md",
      "bytes": 14074,
      "lines": 99,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/evals/evals.json",
      "bytes": 9512,
      "lines": 157,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/quickstart/SKILL.md",
      "bytes": 13297,
      "lines": 244,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/readme/evals/evals.json",
      "bytes": 3813,
      "lines": 116,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/readme/references/index.json",
      "bytes": 25152,
      "lines": 551,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/readme/references/index.md",
      "bytes": 13311,
      "lines": 103,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/readme/references/sources.json",
      "bytes": 360,
      "lines": 12,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-docs/readme/SKILL.md",
      "bytes": 4787,
      "lines": 94,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/agents/artifact-consistency-checker.md",
      "bytes": 2161,
      "lines": 66,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/agents/pipeline-diagnoser.md",
      "bytes": 2791,
      "lines": 71,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/evals/evals.json",
      "bytes": 4235,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/references/pipeline-lifecycle.md",
      "bytes": 1631,
      "lines": 44,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/references/pipeline-state-reference.md",
      "bytes": 3550,
      "lines": 71,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/rules/orchestration-safety.md",
      "bytes": 1339,
      "lines": 36,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/rules/pipeline-contracts.md",
      "bytes": 3234,
      "lines": 106,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/SKILL.md",
      "bytes": 8819,
      "lines": 161,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/01-detect/agents/manifest-parser.md",
      "bytes": 1332,
      "lines": 40,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/01-detect/agents/project-classifier.md",
      "bytes": 1568,
      "lines": 43,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/01-detect/references/detection-decision-tree.md",
      "bytes": 1902,
      "lines": 48,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/01-detect/references/ecosystem-manifests.md",
      "bytes": 1340,
      "lines": 43,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/01-detect/rules/detection-contracts.md",
      "bytes": 2330,
      "lines": 51,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/01-detect/rules/probing-rules.md",
      "bytes": 1350,
      "lines": 42,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/01-detect/STEP.md",
      "bytes": 8962,
      "lines": 209,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/01-detect/templates/profile-output.json",
      "bytes": 565,
      "lines": 27,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/02-explore/agents/convention-detector.md",
      "bytes": 1546,
      "lines": 41,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/02-explore/agents/module-graph-builder.md",
      "bytes": 1852,
      "lines": 62,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/02-explore/references/graph-algorithms.md",
      "bytes": 1414,
      "lines": 52,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/02-explore/references/module-map-schema.md",
      "bytes": 1548,
      "lines": 42,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/02-explore/rules/exploration-contracts.md",
      "bytes": 2083,
      "lines": 41,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/02-explore/rules/import-resolution.md",
      "bytes": 1357,
      "lines": 42,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/02-explore/STEP.md",
      "bytes": 7563,
      "lines": 177,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/02-explore/templates/exploration-output.json",
      "bytes": 866,
      "lines": 32,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/03-generate/agents/document-validator.md",
      "bytes": 1644,
      "lines": 51,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/03-generate/agents/template-renderer.md",
      "bytes": 2252,
      "lines": 49,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/03-generate/references/doc-templates.md",
      "bytes": 3643,
      "lines": 94,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/03-generate/references/principle-sources.md",
      "bytes": 1182,
      "lines": 27,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/03-generate/rules/generation-contracts.md",
      "bytes": 3285,
      "lines": 89,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/03-generate/rules/output-ownership.md",
      "bytes": 1201,
      "lines": 27,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/03-generate/STEP.md",
      "bytes": 15940,
      "lines": 273,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/03-generate/templates/output-manifest.json",
      "bytes": 782,
      "lines": 18,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/04-arch/agents/scene-builder.md",
      "bytes": 1882,
      "lines": 56,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/04-arch/agents/scene-validator.md",
      "bytes": 1190,
      "lines": 38,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/04-arch/references/scene-catalog.md",
      "bytes": 1649,
      "lines": 35,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/04-arch/references/self-test-scenes.md",
      "bytes": 1522,
      "lines": 35,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/04-arch/rules/scene-constraints.md",
      "bytes": 1218,
      "lines": 35,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/04-arch/rules/story-generation-contracts.md",
      "bytes": 2024,
      "lines": 47,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/04-arch/STEP.md",
      "bytes": 6430,
      "lines": 163,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/04-arch/templates/scene-index.md",
      "bytes": 1123,
      "lines": 63,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/05-verify/agents/check-runner.md",
      "bytes": 1795,
      "lines": 72,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/05-verify/agents/failure-diagnoser.md",
      "bytes": 1590,
      "lines": 47,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/05-verify/references/check-catalog.md",
      "bytes": 1567,
      "lines": 34,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/05-verify/references/integration-points.md",
      "bytes": 1140,
      "lines": 37,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/05-verify/rules/failure-escalation.md",
      "bytes": 1554,
      "lines": 37,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/05-verify/rules/verification-contracts.md",
      "bytes": 2167,
      "lines": 43,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/05-verify/STEP.md",
      "bytes": 7018,
      "lines": 170,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/steps/05-verify/templates/verify-result.json",
      "bytes": 589,
      "lines": 20,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/templates/data.js",
      "bytes": 20510,
      "lines": 356,
      "type": "js",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/templates/index.css",
      "bytes": 14466,
      "lines": 352,
      "type": "css",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/templates/index.html",
      "bytes": 6973,
      "lines": 169,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-init/templates/index.js",
      "bytes": 12590,
      "lines": 272,
      "type": "js",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-questions/evals/evals.json",
      "bytes": 3795,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-questions/references/index.json",
      "bytes": 361178,
      "lines": 8978,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-questions/references/index.md",
      "bytes": 147254,
      "lines": 2245,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-questions/references/README-30s-of-code.md",
      "bytes": 1540,
      "lines": 24,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-questions/references/README-design-patterns.md",
      "bytes": 17202,
      "lines": 229,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-questions/references/README-design-systems.md",
      "bytes": 40714,
      "lines": 194,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-questions/references/README-interview-qa.md",
      "bytes": 167331,
      "lines": 5172,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-questions/references/README-interview-questions.md",
      "bytes": 49633,
      "lines": 665,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-questions/references/README-js-must-watch.md",
      "bytes": 10140,
      "lines": 116,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-questions/references/README-project-guidelines.md",
      "bytes": 43424,
      "lines": 954,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-questions/references/sources.json",
      "bytes": 2496,
      "lines": 60,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-questions/SKILL.md",
      "bytes": 5211,
      "lines": 98,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/daily/evals/evals.json",
      "bytes": 4539,
      "lines": 116,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/daily/references/api-reference.md",
      "bytes": 6926,
      "lines": 201,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/daily/references/ask-workflow.md",
      "bytes": 3838,
      "lines": 127,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/daily/references/security.md",
      "bytes": 1357,
      "lines": 34,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/daily/references/token-storage.md",
      "bytes": 2671,
      "lines": 92,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/daily/SKILL.md",
      "bytes": 7421,
      "lines": 151,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/agents/architecture-analyzer.md",
      "bytes": 22145,
      "lines": 480,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/agents/assemble-reviewer.md",
      "bytes": 11391,
      "lines": 185,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/agents/file-analyzer.md",
      "bytes": 37146,
      "lines": 584,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/agents/graph-reviewer.md",
      "bytes": 16405,
      "lines": 292,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/agents/project-scanner.md",
      "bytes": 18426,
      "lines": 274,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/agents/tour-builder.md",
      "bytes": 25477,
      "lines": 463,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/commands/create.md",
      "bytes": 19311,
      "lines": 316,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/graph-builder.js",
      "bytes": 9048,
      "lines": 268,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/graph-builder.test.js",
      "bytes": 16135,
      "lines": 357,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 4,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/language-lesson.js",
      "bytes": 5757,
      "lines": 157,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/layer-detector.js",
      "bytes": 8778,
      "lines": 244,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/llm-analyzer.js",
      "bytes": 5126,
      "lines": 135,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/llm-analyzer.test.js",
      "bytes": 8710,
      "lines": 194,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/normalize-graph.js",
      "bytes": 10805,
      "lines": 273,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/analyzer/tour-generator.js",
      "bytes": 9424,
      "lines": 254,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/change-classifier.js",
      "bytes": 4560,
      "lines": 111,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/embedding-search.js",
      "bytes": 1830,
      "lines": 60,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/fingerprint.js",
      "bytes": 10066,
      "lines": 273,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/ignore-filter.js",
      "bytes": 1947,
      "lines": 87,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/ignore-generator.js",
      "bytes": 5378,
      "lines": 156,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/index.js",
      "bytes": 2197,
      "lines": 23,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 22,
      "extDeps": 0,
      "maxDepth": 4,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/batch.js",
      "bytes": 340,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/c.js",
      "bytes": 636,
      "lines": 25,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/cpp.js",
      "bytes": 725,
      "lines": 27,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/csharp.js",
      "bytes": 670,
      "lines": 27,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/css.js",
      "bytes": 346,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/csv.js",
      "bytes": 287,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/dart.js",
      "bytes": 702,
      "lines": 27,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/docker-compose.js",
      "bytes": 483,
      "lines": 13,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/dockerfile.js",
      "bytes": 441,
      "lines": 13,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/env.js",
      "bytes": 451,
      "lines": 13,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/github-actions.js",
      "bytes": 370,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/go.js",
      "bytes": 614,
      "lines": 26,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/graphql.js",
      "bytes": 363,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/html.js",
      "bytes": 355,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/index.js",
      "bytes": 3378,
      "lines": 92,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 3,
      "fanOut": 41,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/java.js",
      "bytes": 782,
      "lines": 31,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/javascript.js",
      "bytes": 726,
      "lines": 27,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/jenkinsfile.js",
      "bytes": 400,
      "lines": 13,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/json-config.js",
      "bytes": 379,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/json-schema.js",
      "bytes": 677,
      "lines": 16,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/kotlin.js",
      "bytes": 716,
      "lines": 27,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/kubernetes.js",
      "bytes": 785,
      "lines": 17,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/lua.js",
      "bytes": 500,
      "lines": 21,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/makefile.js",
      "bytes": 400,
      "lines": 13,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/markdown.js",
      "bytes": 337,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/openapi.js",
      "bytes": 440,
      "lines": 13,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/php.js",
      "bytes": 659,
      "lines": 27,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/plaintext.js",
      "bytes": 286,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/powershell.js",
      "bytes": 355,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/protobuf.js",
      "bytes": 340,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/python.js",
      "bytes": 992,
      "lines": 42,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/restructuredtext.js",
      "bytes": 369,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/ruby.js",
      "bytes": 642,
      "lines": 26,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/rust.js",
      "bytes": 694,
      "lines": 29,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/shell.js",
      "bytes": 385,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/sql.js",
      "bytes": 327,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/swift.js",
      "bytes": 597,
      "lines": 23,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/terraform.js",
      "bytes": 394,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/toml.js",
      "bytes": 354,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/typescript.js",
      "bytes": 772,
      "lines": 28,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/xml.js",
      "bytes": 375,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/configs/yaml.js",
      "bytes": 325,
      "lines": 12,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/framework-registry.js",
      "bytes": 2496,
      "lines": 68,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/frameworks/django.js",
      "bytes": 830,
      "lines": 34,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/frameworks/express.js",
      "bytes": 638,
      "lines": 24,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/frameworks/fastapi.js",
      "bytes": 577,
      "lines": 23,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/frameworks/flask.js",
      "bytes": 668,
      "lines": 29,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/frameworks/gin.js",
      "bytes": 462,
      "lines": 17,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/frameworks/index.js",
      "bytes": 788,
      "lines": 23,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 2,
      "fanOut": 10,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/frameworks/nextjs.js",
      "bytes": 558,
      "lines": 21,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/frameworks/rails.js",
      "bytes": 636,
      "lines": 26,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/frameworks/react.js",
      "bytes": 527,
      "lines": 17,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/frameworks/spring.js",
      "bytes": 689,
      "lines": 25,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/frameworks/vue.js",
      "bytes": 523,
      "lines": 17,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/index.js",
      "bytes": 404,
      "lines": 7,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 5,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/language-registry.js",
      "bytes": 2093,
      "lines": 58,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 3,
      "fanOut": 2,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/languages/types.js",
      "bytes": 2146,
      "lines": 46,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 3,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/persistence/index.js",
      "bytes": 6287,
      "lines": 167,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/persistence/persistence.test.js",
      "bytes": 6526,
      "lines": 169,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 5,
      "maxDepth": 2,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/discovery.js",
      "bytes": 1593,
      "lines": 52,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js",
      "bytes": 1505,
      "lines": 47,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 12,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/cpp-extractor.js",
      "bytes": 17277,
      "lines": 431,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/csharp-extractor.js",
      "bytes": 15661,
      "lines": 418,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/dart-extractor.js",
      "bytes": 28005,
      "lines": 642,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/go-extractor.js",
      "bytes": 12223,
      "lines": 335,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/index.js",
      "bytes": 1624,
      "lines": 36,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 2,
      "fanOut": 12,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/java-extractor.js",
      "bytes": 13057,
      "lines": 361,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/kotlin-extractor.js",
      "bytes": 14654,
      "lines": 383,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/php-extractor.js",
      "bytes": 15884,
      "lines": 392,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/python-extractor.js",
      "bytes": 11009,
      "lines": 291,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/ruby-extractor.js",
      "bytes": 13136,
      "lines": 357,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/rust-extractor.js",
      "bytes": 15898,
      "lines": 433,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/types.js",
      "bytes": 11,
      "lines": 1,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/extractors/typescript-extractor.js",
      "bytes": 15097,
      "lines": 372,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/parsers/dockerfile-parser.js",
      "bytes": 2955,
      "lines": 76,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/parsers/env-parser.js",
      "bytes": 1177,
      "lines": 38,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/parsers/graphql-parser.js",
      "bytes": 4170,
      "lines": 109,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/parsers/index.js",
      "bytes": 1903,
      "lines": 41,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 12,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/parsers/json-parser.js",
      "bytes": 4676,
      "lines": 129,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/parsers/makefile-parser.js",
      "bytes": 1813,
      "lines": 49,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/parsers/markdown-parser.js",
      "bytes": 2706,
      "lines": 75,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/parsers/protobuf-parser.js",
      "bytes": 4921,
      "lines": 125,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/parsers/shell-parser.js",
      "bytes": 3181,
      "lines": 82,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/parsers/sql-parser.js",
      "bytes": 3541,
      "lines": 89,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/parsers/terraform-parser.js",
      "bytes": 4764,
      "lines": 114,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/parsers/toml-parser.js",
      "bytes": 1462,
      "lines": 42,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/parsers/yaml-parser.js",
      "bytes": 4244,
      "lines": 104,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/registry.js",
      "bytes": 2419,
      "lines": 73,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 3,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/tree-sitter-plugin.js",
      "bytes": 9360,
      "lines": 232,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 3,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/plugins/tree-sitter-plugin.test.js",
      "bytes": 9918,
      "lines": 260,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 10,
      "maxDepth": 4,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/schema.js",
      "bytes": 22435,
      "lines": 607,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/search.js",
      "bytes": 1444,
      "lines": 45,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/staleness.js",
      "bytes": 2332,
      "lines": 60,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/types.js",
      "bytes": 11,
      "lines": 1,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/core/src/types.test.js",
      "bytes": 7436,
      "lines": 181,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/tree-sitter-dart-wasm/BUILD.md",
      "bytes": 1539,
      "lines": 47,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/tree-sitter-dart-wasm/index.js",
      "bytes": 355,
      "lines": 6,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/tree-sitter-dart-wasm/package.json",
      "bytes": 320,
      "lines": 12,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/engine/tree-sitter-dart-wasm/tree-sitter-dart.wasm",
      "bytes": 765060,
      "lines": 2679,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/frameworks/django.md",
      "bytes": 5920,
      "lines": 71,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/frameworks/express.md",
      "bytes": 5395,
      "lines": 62,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/frameworks/fastapi.md",
      "bytes": 5227,
      "lines": 61,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/frameworks/flask.md",
      "bytes": 4526,
      "lines": 57,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/frameworks/gin.md",
      "bytes": 5600,
      "lines": 64,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/frameworks/nextjs.md",
      "bytes": 5336,
      "lines": 63,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/frameworks/rails.md",
      "bytes": 6759,
      "lines": 70,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/frameworks/react.md",
      "bytes": 4509,
      "lines": 58,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/frameworks/spring.md",
      "bytes": 6481,
      "lines": 65,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/frameworks/vue.md",
      "bytes": 5755,
      "lines": 65,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/cpp.md",
      "bytes": 4158,
      "lines": 65,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/csharp.md",
      "bytes": 4588,
      "lines": 66,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/css.md",
      "bytes": 3127,
      "lines": 44,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/dockerfile.md",
      "bytes": 3250,
      "lines": 43,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/go.md",
      "bytes": 3668,
      "lines": 61,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/graphql.md",
      "bytes": 3316,
      "lines": 46,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/html.md",
      "bytes": 2519,
      "lines": 40,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/java.md",
      "bytes": 4259,
      "lines": 65,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/javascript.md",
      "bytes": 3987,
      "lines": 66,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/json.md",
      "bytes": 2911,
      "lines": 41,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/kotlin.md",
      "bytes": 4250,
      "lines": 63,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/markdown.md",
      "bytes": 2426,
      "lines": 39,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/php.md",
      "bytes": 4284,
      "lines": 64,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/protobuf.md",
      "bytes": 3502,
      "lines": 45,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/python.md",
      "bytes": 4189,
      "lines": 68,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/ruby.md",
      "bytes": 4373,
      "lines": 64,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/rust.md",
      "bytes": 4397,
      "lines": 67,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/shell.md",
      "bytes": 3234,
      "lines": 46,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/sql.md",
      "bytes": 3530,
      "lines": 47,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/swift.md",
      "bytes": 4258,
      "lines": 64,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/terraform.md",
      "bytes": 3606,
      "lines": 47,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/typescript.md",
      "bytes": 3851,
      "lines": 62,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/languages/yaml.md",
      "bytes": 3386,
      "lines": 46,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/locales/en.md",
      "bytes": 3048,
      "lines": 80,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/locales/zh.md",
      "bytes": 3180,
      "lines": 82,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/package.json",
      "bytes": 1456,
      "lines": 44,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/pnpm-lock.yaml",
      "bytes": 38635,
      "lines": 1309,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/references/design-system.md",
      "bytes": 16163,
      "lines": 315,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/references/knowledge-graph-schema.md",
      "bytes": 12557,
      "lines": 313,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/references/quality-rubric.md",
      "bytes": 8416,
      "lines": 165,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/references/templates-index.md",
      "bytes": 9661,
      "lines": 99,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/scripts/build-fingerprints.mjs",
      "bytes": 3528,
      "lines": 97,
      "type": "mjs",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 4,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/scripts/compute-batches.mjs",
      "bytes": 23084,
      "lines": 592,
      "type": "mjs",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 7,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/scripts/extract-import-map.mjs",
      "bytes": 66707,
      "lines": 1676,
      "type": "mjs",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 5,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/scripts/extract-structure.mjs",
      "bytes": 10787,
      "lines": 334,
      "type": "mjs",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 4,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/scripts/generate-ignore.mjs",
      "bytes": 2178,
      "lines": 63,
      "type": "mjs",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 4,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/scripts/merge-batch-graphs.py",
      "bytes": 49906,
      "lines": 1167,
      "type": "py",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 4,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/scripts/scan-project.mjs",
      "bytes": 28011,
      "lines": 800,
      "type": "mjs",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 6,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/SKILL.md",
      "bytes": 18979,
      "lines": 269,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/templates/data.js",
      "bytes": 43364,
      "lines": 564,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/templates/index.css",
      "bytes": 21706,
      "lines": 538,
      "type": "css",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/templates/index.html",
      "bytes": 3591,
      "lines": 66,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/diagram/templates/index.js",
      "bytes": 27840,
      "lines": 651,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/agents/file-analyzer.md",
      "bytes": 3280,
      "lines": 81,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/commands/analyze.md",
      "bytes": 6558,
      "lines": 156,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/evals/evals.json",
      "bytes": 4263,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/references/methodology.md",
      "bytes": 12842,
      "lines": 358,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/references/scoring.md",
      "bytes": 2837,
      "lines": 74,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/rules/analysis-contracts.md",
      "bytes": 9596,
      "lines": 257,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/scripts/analyze.mjs",
      "bytes": 60375,
      "lines": 1356,
      "type": "mjs",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/SKILL.md",
      "bytes": 18241,
      "lines": 423,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/app/actions.js",
      "bytes": 1021,
      "lines": 33,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/app/lifecycle.js",
      "bytes": 7426,
      "lines": 193,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/app/mount.js",
      "bytes": 8780,
      "lines": 206,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/app/state.js",
      "bytes": 15294,
      "lines": 396,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-coupling/index.css",
      "bytes": 880,
      "lines": 20,
      "type": "css",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-coupling/index.html",
      "bytes": 2218,
      "lines": 38,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-coupling/index.js",
      "bytes": 1817,
      "lines": 42,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-health/index.css",
      "bytes": 2309,
      "lines": 63,
      "type": "css",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-health/index.html",
      "bytes": 4036,
      "lines": 64,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-health/index.js",
      "bytes": 2329,
      "lines": 40,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-largest/index.css",
      "bytes": 694,
      "lines": 18,
      "type": "css",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-largest/index.html",
      "bytes": 2176,
      "lines": 37,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-largest/index.js",
      "bytes": 2896,
      "lines": 81,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-risk/index.css",
      "bytes": 1043,
      "lines": 21,
      "type": "css",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-risk/index.html",
      "bytes": 3228,
      "lines": 53,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-risk/index.js",
      "bytes": 2895,
      "lines": 56,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-self-improvement/index.css",
      "bytes": 39872,
      "lines": 539,
      "type": "css",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-self-improvement/index.html",
      "bytes": 40665,
      "lines": 535,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-self-improvement/index.js",
      "bytes": 35911,
      "lines": 694,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-size/index.css",
      "bytes": 2400,
      "lines": 67,
      "type": "css",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-size/index.html",
      "bytes": 3163,
      "lines": 64,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-size/index.js",
      "bytes": 1651,
      "lines": 32,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-summary/index.css",
      "bytes": 629,
      "lines": 19,
      "type": "css",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-summary/index.html",
      "bytes": 375,
      "lines": 9,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/components/rui-report-summary/index.js",
      "bytes": 1123,
      "lines": 27,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/data.js",
      "bytes": 53720,
      "lines": 677,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/index.css",
      "bytes": 40377,
      "lines": 1134,
      "type": "css",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/index.html",
      "bytes": 37637,
      "lines": 616,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/index.js",
      "bytes": 1440,
      "lines": 35,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/lib/rui-bytes.js",
      "bytes": 1358,
      "lines": 48,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-reports/files/templates/lib/rui-sortable.js",
      "bytes": 3349,
      "lines": 91,
      "type": "js",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/evals/evals.json",
      "bytes": 5403,
      "lines": 137,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/references/index.json",
      "bytes": 12885,
      "lines": 280,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/references/index.md",
      "bytes": 2762,
      "lines": 22,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/SKILL.md",
      "bytes": 19381,
      "lines": 262,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/async-component/references/best-practices/async-component-testing.md",
      "bytes": 4896,
      "lines": 163,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/async-flush/references/best-practices/testing-async-await-flushpromises.md",
      "bytes": 5254,
      "lines": 175,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/blackbox/references/best-practices/testing-component-blackbox-approach.md",
      "bytes": 4753,
      "lines": 144,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/composable-wrapper/references/best-practices/testing-composables-helper-wrapper.md",
      "bytes": 6119,
      "lines": 238,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/e2e-playwright/references/best-practices/testing-e2e-playwright-recommended.md",
      "bytes": 6581,
      "lines": 242,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/fixture/agents/test-fixture-generator.md",
      "bytes": 1063,
      "lines": 29,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/fixture/agents/visual-diff-checker.md",
      "bytes": 1115,
      "lines": 38,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/fixture/references/fixture-workflow.md",
      "bytes": 3694,
      "lines": 105,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/fixture/rules/browser-compat.md",
      "bytes": 1164,
      "lines": 33,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/fixture/rules/test-contracts.md",
      "bytes": 1463,
      "lines": 46,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/fixture/templates/test-fixture.md",
      "bytes": 1497,
      "lines": 60,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/no-snapshot/references/best-practices/testing-no-snapshot-only.md",
      "bytes": 6283,
      "lines": 197,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/pinia-setup/references/best-practices/testing-pinia-store-setup.md",
      "bytes": 6249,
      "lines": 228,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/runner-choice/references/best-practices/testing-browser-vs-node-runners.md",
      "bytes": 5623,
      "lines": 208,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/suspense/references/best-practices/testing-suspense-async-components.md",
      "bytes": 6448,
      "lines": 229,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/teleport/references/best-practices/teleport-testing-complexity.md",
      "bytes": 4136,
      "lines": 158,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-test/topics/vitest-setup/references/best-practices/testing-vitest-recommended-for-vue.md",
      "bytes": 5039,
      "lines": 204,
      "type": "other",
      "lastModified": 1784253574,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/cc/evals/evals.json",
      "bytes": 4268,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/cc/references/index.json",
      "bytes": 115031,
      "lines": 2599,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/cc/references/index.md",
      "bytes": 52151,
      "lines": 493,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/cc/references/sources.json",
      "bytes": 996,
      "lines": 22,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/cc/SKILL.md",
      "bytes": 8009,
      "lines": 147,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/git/commands/branch.md",
      "bytes": 1153,
      "lines": 46,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/git/commands/commit.md",
      "bytes": 1193,
      "lines": 42,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/git/commands/status.md",
      "bytes": 1224,
      "lines": 39,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/git/evals/evals.json",
      "bytes": 3825,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/git/SKILL.md",
      "bytes": 2730,
      "lines": 69,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/github/commands/issue.md",
      "bytes": 1617,
      "lines": 53,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/github/commands/pr-review.md",
      "bytes": 2237,
      "lines": 62,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/github/commands/security-scan.md",
      "bytes": 1248,
      "lines": 51,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/github/evals/evals.json",
      "bytes": 3875,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/github/SKILL.md",
      "bytes": 3555,
      "lines": 84,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/grilling/evals/evals.json",
      "bytes": 6767,
      "lines": 136,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/grilling/SKILL.md",
      "bytes": 8975,
      "lines": 164,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/lighthouse/evals/evals.json",
      "bytes": 4097,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/lighthouse/references/index.json",
      "bytes": 30120,
      "lines": 864,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/lighthouse/references/index.md",
      "bytes": 10139,
      "lines": 220,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/lighthouse/references/README-lighthouse.md",
      "bytes": 36065,
      "lines": 489,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/lighthouse/references/sources.json",
      "bytes": 410,
      "lines": 13,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/lighthouse/SKILL.md",
      "bytes": 8766,
      "lines": 162,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/mermaid/evals/evals.json",
      "bytes": 3868,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/mermaid/references/api_reference.md",
      "bytes": 968,
      "lines": 34,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/mermaid/references/DIAGRAM_TYPES.md",
      "bytes": 6375,
      "lines": 328,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/mermaid/references/THEMES.md",
      "bytes": 9272,
      "lines": 477,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/mermaid/SKILL.md",
      "bytes": 3931,
      "lines": 83,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/public-api/evals/evals.json",
      "bytes": 3841,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/public-api/references/index.json",
      "bytes": 332080,
      "lines": 9150,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/public-api/references/index.md",
      "bytes": 126994,
      "lines": 1183,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/public-api/references/README-public-api-lists.md",
      "bytes": 192986,
      "lines": 1184,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/public-api/references/sources.json",
      "bytes": 379,
      "lines": 12,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/public-api/SKILL.md",
      "bytes": 7142,
      "lines": 137,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/skill/agents/analyzer.md",
      "bytes": 10376,
      "lines": 274,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/skill/agents/comparator.md",
      "bytes": 7287,
      "lines": 202,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/skill/agents/grader.md",
      "bytes": 9049,
      "lines": 223,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/skill/commands/create.md",
      "bytes": 5763,
      "lines": 136,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/skill/commands/eval.md",
      "bytes": 8028,
      "lines": 187,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/skill/commands/improve.md",
      "bytes": 4208,
      "lines": 73,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/skill/commands/optimize.md",
      "bytes": 5405,
      "lines": 102,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/skill/commands/package.md",
      "bytes": 1698,
      "lines": 46,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/skill/references/schemas.md",
      "bytes": 12061,
      "lines": 430,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/skill/SKILL.md",
      "bytes": 4301,
      "lines": 87,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/tmux/evals/evals.json",
      "bytes": 3747,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/tmux/references/index.json",
      "bytes": 54118,
      "lines": 1529,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/tmux/references/index.md",
      "bytes": 17818,
      "lines": 272,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/tmux/references/README-awesome-tmux.md",
      "bytes": 26203,
      "lines": 251,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/tmux/references/sources.json",
      "bytes": 337,
      "lines": 12,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/tmux/SKILL.md",
      "bytes": 6570,
      "lines": 123,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/ArsenalSC-OFL.txt",
      "bytes": 4373,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/ArsenalSC-Regular.ttf",
      "bytes": 165848,
      "lines": 1487,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/BigShoulders-Bold.ttf",
      "bytes": 94528,
      "lines": 489,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/BigShoulders-OFL.txt",
      "bytes": 4397,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/BigShoulders-Regular.ttf",
      "bytes": 94396,
      "lines": 366,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Boldonse-OFL.txt",
      "bytes": 4390,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Boldonse-Regular.ttf",
      "bytes": 77168,
      "lines": 872,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/BricolageGrotesque-Bold.ttf",
      "bytes": 90952,
      "lines": 331,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/BricolageGrotesque-OFL.txt",
      "bytes": 4403,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/BricolageGrotesque-Regular.ttf",
      "bytes": 90920,
      "lines": 276,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/CrimsonPro-Bold.ttf",
      "bytes": 107352,
      "lines": 476,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/CrimsonPro-Italic.ttf",
      "bytes": 108828,
      "lines": 763,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/CrimsonPro-OFL.txt",
      "bytes": 4394,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/CrimsonPro-Regular.ttf",
      "bytes": 106696,
      "lines": 573,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/DMMono-OFL.txt",
      "bytes": 4392,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/DMMono-Regular.ttf",
      "bytes": 48852,
      "lines": 256,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/EricaOne-OFL.txt",
      "bytes": 4410,
      "lines": 94,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/EricaOne-Regular.ttf",
      "bytes": 24872,
      "lines": 135,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/GeistMono-Bold.ttf",
      "bytes": 78304,
      "lines": 262,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/GeistMono-OFL.txt",
      "bytes": 4388,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/GeistMono-Regular.ttf",
      "bytes": 78232,
      "lines": 285,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Gloock-OFL.txt",
      "bytes": 4381,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Gloock-Regular.ttf",
      "bytes": 95156,
      "lines": 1375,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexMono-Bold.ttf",
      "bytes": 136008,
      "lines": 851,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexMono-OFL.txt",
      "bytes": 4363,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexMono-Regular.ttf",
      "bytes": 133796,
      "lines": 822,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Bold.ttf",
      "bytes": 161000,
      "lines": 1416,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-BoldItalic.ttf",
      "bytes": 169840,
      "lines": 1715,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Italic.ttf",
      "bytes": 170004,
      "lines": 1993,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/IBMPlexSerif-Regular.ttf",
      "bytes": 160380,
      "lines": 1346,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/InstrumentSans-Bold.ttf",
      "bytes": 68084,
      "lines": 471,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/InstrumentSans-BoldItalic.ttf",
      "bytes": 70004,
      "lines": 420,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/InstrumentSans-Italic.ttf",
      "bytes": 69900,
      "lines": 398,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/InstrumentSans-OFL.txt",
      "bytes": 4403,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/InstrumentSans-Regular.ttf",
      "bytes": 68028,
      "lines": 393,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/InstrumentSerif-Italic.ttf",
      "bytes": 70868,
      "lines": 826,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/InstrumentSerif-Regular.ttf",
      "bytes": 69312,
      "lines": 826,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Italiana-OFL.txt",
      "bytes": 4394,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Italiana-Regular.ttf",
      "bytes": 27184,
      "lines": 188,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/JetBrainsMono-Bold.ttf",
      "bytes": 114828,
      "lines": 605,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/JetBrainsMono-OFL.txt",
      "bytes": 4399,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/JetBrainsMono-Regular.ttf",
      "bytes": 114904,
      "lines": 609,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Jura-Light.ttf",
      "bytes": 154308,
      "lines": 454,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Jura-Medium.ttf",
      "bytes": 154488,
      "lines": 317,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Jura-OFL.txt",
      "bytes": 4380,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/LibreBaskerville-OFL.txt",
      "bytes": 4449,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/LibreBaskerville-Regular.ttf",
      "bytes": 147584,
      "lines": 1068,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Lora-Bold.ttf",
      "bytes": 133828,
      "lines": 850,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Lora-BoldItalic.ttf",
      "bytes": 140332,
      "lines": 1024,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Lora-Italic.ttf",
      "bytes": 139328,
      "lines": 667,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Lora-OFL.txt",
      "bytes": 4423,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Lora-Regular.ttf",
      "bytes": 133888,
      "lines": 516,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/NationalPark-Bold.ttf",
      "bytes": 79208,
      "lines": 611,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/NationalPark-OFL.txt",
      "bytes": 4399,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/NationalPark-Regular.ttf",
      "bytes": 76424,
      "lines": 601,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/NothingYouCouldDo-OFL.txt",
      "bytes": 4363,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/NothingYouCouldDo-Regular.ttf",
      "bytes": 32020,
      "lines": 420,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Outfit-Bold.ttf",
      "bytes": 55392,
      "lines": 188,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Outfit-OFL.txt",
      "bytes": 4389,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Outfit-Regular.ttf",
      "bytes": 54912,
      "lines": 246,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/PixelifySans-Medium.ttf",
      "bytes": 51072,
      "lines": 106,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/PixelifySans-OFL.txt",
      "bytes": 4395,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/PoiretOne-OFL.txt",
      "bytes": 4366,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/PoiretOne-Regular.ttf",
      "bytes": 45244,
      "lines": 103,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/RedHatMono-Bold.ttf",
      "bytes": 34420,
      "lines": 133,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/RedHatMono-OFL.txt",
      "bytes": 4394,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/RedHatMono-Regular.ttf",
      "bytes": 34488,
      "lines": 123,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Silkscreen-OFL.txt",
      "bytes": 4394,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Silkscreen-Regular.ttf",
      "bytes": 31960,
      "lines": 270,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/SmoochSans-Medium.ttf",
      "bytes": 59704,
      "lines": 250,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/SmoochSans-OFL.txt",
      "bytes": 4396,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Tektur-Medium.ttf",
      "bytes": 76248,
      "lines": 506,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Tektur-OFL.txt",
      "bytes": 4385,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/Tektur-Regular.ttf",
      "bytes": 75604,
      "lines": 314,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/WorkSans-Bold.ttf",
      "bytes": 191304,
      "lines": 884,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/WorkSans-BoldItalic.ttf",
      "bytes": 175772,
      "lines": 730,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/WorkSans-Italic.ttf",
      "bytes": 174280,
      "lines": 646,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/WorkSans-OFL.txt",
      "bytes": 4397,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/WorkSans-Regular.ttf",
      "bytes": 188916,
      "lines": 892,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/YoungSerif-OFL.txt",
      "bytes": 4398,
      "lines": 93,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/canvas-fonts/YoungSerif-Regular.ttf",
      "bytes": 105136,
      "lines": 1145,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/commands/banner.md",
      "bytes": 2671,
      "lines": 71,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/commands/brand.md",
      "bytes": 1305,
      "lines": 46,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/commands/cip.md",
      "bytes": 1513,
      "lines": 49,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/commands/design-system.md",
      "bytes": 1047,
      "lines": 38,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/commands/icon.md",
      "bytes": 1170,
      "lines": 42,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/commands/logo.md",
      "bytes": 1252,
      "lines": 46,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/commands/slide.md",
      "bytes": 1753,
      "lines": 65,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/commands/slides.md",
      "bytes": 1677,
      "lines": 59,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/commands/ui-styling.md",
      "bytes": 3109,
      "lines": 83,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/components/cip/CipPresentation.vue",
      "bytes": 1992,
      "lines": 65,
      "type": "vue",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/components/cip/DeliverableCard.vue",
      "bytes": 682,
      "lines": 23,
      "type": "vue",
      "lastModified": 1784253579,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/components/slides/ChartSlide.vue",
      "bytes": 1316,
      "lines": 43,
      "type": "vue",
      "lastModified": 1784253579,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/components/slides/CtaSlide.vue",
      "bytes": 1083,
      "lines": 24,
      "type": "vue",
      "lastModified": 1784253579,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/components/slides/MetricsSlide.vue",
      "bytes": 1025,
      "lines": 33,
      "type": "vue",
      "lastModified": 1784253579,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/components/slides/ProblemSlide.vue",
      "bytes": 2001,
      "lines": 41,
      "type": "vue",
      "lastModified": 1784253579,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/components/slides/SlideDeck.vue",
      "bytes": 1270,
      "lines": 48,
      "type": "vue",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 7,
      "extDeps": 0,
      "maxDepth": 1,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/components/slides/SolutionSlide.vue",
      "bytes": 1977,
      "lines": 55,
      "type": "vue",
      "lastModified": 1784253579,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/components/slides/TestimonialSlide.vue",
      "bytes": 819,
      "lines": 24,
      "type": "vue",
      "lastModified": 1784253579,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/components/slides/TitleSlide.vue",
      "bytes": 962,
      "lines": 27,
      "type": "vue",
      "lastModified": 1784253579,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/cip/deliverables.csv",
      "bytes": 13385,
      "lines": 50,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/cip/industries.csv",
      "bytes": 4935,
      "lines": 20,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/cip/mockup-contexts.csv",
      "bytes": 5205,
      "lines": 20,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/cip/styles.csv",
      "bytes": 5967,
      "lines": 20,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/icon/styles.csv",
      "bytes": 2250,
      "lines": 16,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/logo/colors.csv",
      "bytes": 10674,
      "lines": 56,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/logo/industries.csv",
      "bytes": 13274,
      "lines": 56,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/logo/styles.csv",
      "bytes": 13678,
      "lines": 56,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/slides/slide-backgrounds.csv",
      "bytes": 1038,
      "lines": 11,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/slides/slide-charts.csv",
      "bytes": 8631,
      "lines": 26,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/slides/slide-color-logic.csv",
      "bytes": 877,
      "lines": 14,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/slides/slide-copy.csv",
      "bytes": 6427,
      "lines": 26,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/slides/slide-layout-logic.csv",
      "bytes": 981,
      "lines": 16,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/slides/slide-layouts.csv",
      "bytes": 8760,
      "lines": 26,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/slides/slide-strategies.csv",
      "bytes": 8232,
      "lines": 16,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/data/slides/slide-typography.csv",
      "bytes": 735,
      "lines": 15,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/evals/evals.json",
      "bytes": 4122,
      "lines": 115,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/approval-checklist.md",
      "bytes": 4245,
      "lines": 169,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/asset-organization.md",
      "bytes": 5110,
      "lines": 157,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/banner-sizes-and-styles.md",
      "bytes": 4993,
      "lines": 118,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/brand-guideline-template.md",
      "bytes": 3572,
      "lines": 140,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/canvas-design-system.md",
      "bytes": 7888,
      "lines": 320,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/cip-deliverable-guide.md",
      "bytes": 1735,
      "lines": 95,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/cip-design.md",
      "bytes": 4589,
      "lines": 121,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/cip-prompt-engineering.md",
      "bytes": 2493,
      "lines": 84,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/cip-style-guide.md",
      "bytes": 2357,
      "lines": 68,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/color-palette-management.md",
      "bytes": 4254,
      "lines": 186,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/component-specs.md",
      "bytes": 6914,
      "lines": 236,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/component-tokens.md",
      "bytes": 4986,
      "lines": 214,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/consistency-checklist.md",
      "bytes": 1926,
      "lines": 94,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/copywriting-formulas.md",
      "bytes": 2604,
      "lines": 84,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/design-routing.md",
      "bytes": 5826,
      "lines": 207,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/html-template.md",
      "bytes": 9004,
      "lines": 295,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/icon-design.md",
      "bytes": 4343,
      "lines": 122,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/layout-patterns.md",
      "bytes": 3691,
      "lines": 137,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/logo-color-psychology.md",
      "bytes": 3341,
      "lines": 101,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/logo-design.md",
      "bytes": 3165,
      "lines": 92,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/logo-prompt-engineering.md",
      "bytes": 4314,
      "lines": 158,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/logo-style-guide.md",
      "bytes": 3435,
      "lines": 109,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/logo-usage-rules.md",
      "bytes": 5464,
      "lines": 185,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/messaging-framework.md",
      "bytes": 1763,
      "lines": 85,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/primitive-tokens.md",
      "bytes": 4562,
      "lines": 203,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/semantic-tokens.md",
      "bytes": 4245,
      "lines": 215,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/shadcn-accessibility.md",
      "bytes": 9976,
      "lines": 471,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/shadcn-components.md",
      "bytes": 11155,
      "lines": 424,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/shadcn-theming.md",
      "bytes": 8672,
      "lines": 373,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/slide-strategies.md",
      "bytes": 2715,
      "lines": 94,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/slides.md",
      "bytes": 1742,
      "lines": 42,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/social-photos-design.md",
      "bytes": 11161,
      "lines": 328,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/states-and-variants.md",
      "bytes": 4771,
      "lines": 241,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/tailwind-customization.md",
      "bytes": 10171,
      "lines": 483,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/tailwind-integration.md",
      "bytes": 5633,
      "lines": 251,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/tailwind-responsive.md",
      "bytes": 8270,
      "lines": 382,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/tailwind-utilities.md",
      "bytes": 9980,
      "lines": 455,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/token-architecture.md",
      "bytes": 5365,
      "lines": 224,
      "type": "other",
      "lastModified": 1784253578,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/typography-specifications.md",
      "bytes": 4881,
      "lines": 212,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/visual-identity.md",
      "bytes": 1884,
      "lines": 96,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/references/voice-framework.md",
      "bytes": 1997,
      "lines": 88,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "rui-tools/ui-ux/SKILL.md",
      "bytes": 7846,
      "lines": 106,
      "type": "other",
      "lastModified": 1784253579,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    }
  ],
  "adjacency": {
    "rui-init/templates/data.js": [],
    "rui-init/templates/index.css": [],
    "rui-init/templates/index.js": [],
    "rui-reports/diagram/engine/core/src/analyzer/graph-builder.js": [
      "rui-reports/diagram/engine/core/src/languages/language-registry.js"
    ],
    "rui-reports/diagram/engine/core/src/analyzer/graph-builder.test.js": [
      "rui-reports/diagram/engine/core/src/analyzer/graph-builder.js"
    ],
    "rui-reports/diagram/engine/core/src/analyzer/language-lesson.js": [],
    "rui-reports/diagram/engine/core/src/analyzer/layer-detector.js": [],
    "rui-reports/diagram/engine/core/src/analyzer/llm-analyzer.js": [],
    "rui-reports/diagram/engine/core/src/analyzer/llm-analyzer.test.js": [
      "rui-reports/diagram/engine/core/src/analyzer/llm-analyzer.js"
    ],
    "rui-reports/diagram/engine/core/src/analyzer/normalize-graph.js": [],
    "rui-reports/diagram/engine/core/src/analyzer/tour-generator.js": [],
    "rui-reports/diagram/engine/core/src/change-classifier.js": [],
    "rui-reports/diagram/engine/core/src/embedding-search.js": [],
    "rui-reports/diagram/engine/core/src/fingerprint.js": [],
    "rui-reports/diagram/engine/core/src/ignore-filter.js": [],
    "rui-reports/diagram/engine/core/src/ignore-generator.js": [
      "rui-reports/diagram/engine/core/src/ignore-filter.js"
    ],
    "rui-reports/diagram/engine/core/src/index.js": [
      "rui-reports/diagram/engine/core/src/types.js",
      "rui-reports/diagram/engine/core/src/persistence/index.js",
      "rui-reports/diagram/engine/core/src/schema.js",
      "rui-reports/diagram/engine/core/src/plugins/tree-sitter-plugin.js",
      "rui-reports/diagram/engine/core/src/plugins/extractors/index.js",
      "rui-reports/diagram/engine/core/src/analyzer/graph-builder.js",
      "rui-reports/diagram/engine/core/src/analyzer/llm-analyzer.js",
      "rui-reports/diagram/engine/core/src/analyzer/normalize-graph.js",
      "rui-reports/diagram/engine/core/src/search.js",
      "rui-reports/diagram/engine/core/src/staleness.js",
      "rui-reports/diagram/engine/core/src/analyzer/layer-detector.js",
      "rui-reports/diagram/engine/core/src/analyzer/tour-generator.js",
      "rui-reports/diagram/engine/core/src/analyzer/language-lesson.js",
      "rui-reports/diagram/engine/core/src/plugins/registry.js",
      "rui-reports/diagram/engine/core/src/languages/index.js",
      "rui-reports/diagram/engine/core/src/plugins/discovery.js",
      "rui-reports/diagram/engine/core/src/embedding-search.js",
      "rui-reports/diagram/engine/core/src/fingerprint.js",
      "rui-reports/diagram/engine/core/src/change-classifier.js",
      "rui-reports/diagram/engine/core/src/plugins/parsers/index.js",
      "rui-reports/diagram/engine/core/src/ignore-filter.js",
      "rui-reports/diagram/engine/core/src/ignore-generator.js"
    ],
    "rui-reports/diagram/engine/core/src/languages/configs/batch.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/c.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/cpp.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/csharp.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/css.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/csv.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/dart.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/docker-compose.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/dockerfile.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/env.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/github-actions.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/go.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/graphql.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/html.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/index.js": [
      "rui-reports/diagram/engine/core/src/languages/configs/typescript.js",
      "rui-reports/diagram/engine/core/src/languages/configs/javascript.js",
      "rui-reports/diagram/engine/core/src/languages/configs/python.js",
      "rui-reports/diagram/engine/core/src/languages/configs/go.js",
      "rui-reports/diagram/engine/core/src/languages/configs/rust.js",
      "rui-reports/diagram/engine/core/src/languages/configs/java.js",
      "rui-reports/diagram/engine/core/src/languages/configs/ruby.js",
      "rui-reports/diagram/engine/core/src/languages/configs/php.js",
      "rui-reports/diagram/engine/core/src/languages/configs/swift.js",
      "rui-reports/diagram/engine/core/src/languages/configs/kotlin.js",
      "rui-reports/diagram/engine/core/src/languages/configs/c.js",
      "rui-reports/diagram/engine/core/src/languages/configs/cpp.js",
      "rui-reports/diagram/engine/core/src/languages/configs/dart.js",
      "rui-reports/diagram/engine/core/src/languages/configs/csharp.js",
      "rui-reports/diagram/engine/core/src/languages/configs/lua.js",
      "rui-reports/diagram/engine/core/src/languages/configs/markdown.js",
      "rui-reports/diagram/engine/core/src/languages/configs/yaml.js",
      "rui-reports/diagram/engine/core/src/languages/configs/json-config.js",
      "rui-reports/diagram/engine/core/src/languages/configs/toml.js",
      "rui-reports/diagram/engine/core/src/languages/configs/env.js",
      "rui-reports/diagram/engine/core/src/languages/configs/xml.js",
      "rui-reports/diagram/engine/core/src/languages/configs/dockerfile.js",
      "rui-reports/diagram/engine/core/src/languages/configs/sql.js",
      "rui-reports/diagram/engine/core/src/languages/configs/graphql.js",
      "rui-reports/diagram/engine/core/src/languages/configs/protobuf.js",
      "rui-reports/diagram/engine/core/src/languages/configs/terraform.js",
      "rui-reports/diagram/engine/core/src/languages/configs/github-actions.js",
      "rui-reports/diagram/engine/core/src/languages/configs/makefile.js",
      "rui-reports/diagram/engine/core/src/languages/configs/shell.js",
      "rui-reports/diagram/engine/core/src/languages/configs/html.js",
      "rui-reports/diagram/engine/core/src/languages/configs/css.js",
      "rui-reports/diagram/engine/core/src/languages/configs/openapi.js",
      "rui-reports/diagram/engine/core/src/languages/configs/kubernetes.js",
      "rui-reports/diagram/engine/core/src/languages/configs/docker-compose.js",
      "rui-reports/diagram/engine/core/src/languages/configs/json-schema.js",
      "rui-reports/diagram/engine/core/src/languages/configs/csv.js",
      "rui-reports/diagram/engine/core/src/languages/configs/restructuredtext.js",
      "rui-reports/diagram/engine/core/src/languages/configs/powershell.js",
      "rui-reports/diagram/engine/core/src/languages/configs/batch.js",
      "rui-reports/diagram/engine/core/src/languages/configs/jenkinsfile.js",
      "rui-reports/diagram/engine/core/src/languages/configs/plaintext.js"
    ],
    "rui-reports/diagram/engine/core/src/languages/configs/java.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/javascript.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/jenkinsfile.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/json-config.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/json-schema.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/kotlin.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/kubernetes.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/lua.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/makefile.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/markdown.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/openapi.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/php.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/plaintext.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/powershell.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/protobuf.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/python.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/restructuredtext.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/ruby.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/rust.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/shell.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/sql.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/swift.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/terraform.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/toml.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/typescript.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/xml.js": [],
    "rui-reports/diagram/engine/core/src/languages/configs/yaml.js": [],
    "rui-reports/diagram/engine/core/src/languages/framework-registry.js": [
      "rui-reports/diagram/engine/core/src/languages/types.js",
      "rui-reports/diagram/engine/core/src/languages/frameworks/index.js"
    ],
    "rui-reports/diagram/engine/core/src/languages/frameworks/django.js": [],
    "rui-reports/diagram/engine/core/src/languages/frameworks/express.js": [],
    "rui-reports/diagram/engine/core/src/languages/frameworks/fastapi.js": [],
    "rui-reports/diagram/engine/core/src/languages/frameworks/flask.js": [],
    "rui-reports/diagram/engine/core/src/languages/frameworks/gin.js": [],
    "rui-reports/diagram/engine/core/src/languages/frameworks/index.js": [
      "rui-reports/diagram/engine/core/src/languages/frameworks/django.js",
      "rui-reports/diagram/engine/core/src/languages/frameworks/fastapi.js",
      "rui-reports/diagram/engine/core/src/languages/frameworks/flask.js",
      "rui-reports/diagram/engine/core/src/languages/frameworks/react.js",
      "rui-reports/diagram/engine/core/src/languages/frameworks/nextjs.js",
      "rui-reports/diagram/engine/core/src/languages/frameworks/express.js",
      "rui-reports/diagram/engine/core/src/languages/frameworks/vue.js",
      "rui-reports/diagram/engine/core/src/languages/frameworks/spring.js",
      "rui-reports/diagram/engine/core/src/languages/frameworks/rails.js",
      "rui-reports/diagram/engine/core/src/languages/frameworks/gin.js"
    ],
    "rui-reports/diagram/engine/core/src/languages/frameworks/nextjs.js": [],
    "rui-reports/diagram/engine/core/src/languages/frameworks/rails.js": [],
    "rui-reports/diagram/engine/core/src/languages/frameworks/react.js": [],
    "rui-reports/diagram/engine/core/src/languages/frameworks/spring.js": [],
    "rui-reports/diagram/engine/core/src/languages/frameworks/vue.js": [],
    "rui-reports/diagram/engine/core/src/languages/index.js": [
      "rui-reports/diagram/engine/core/src/languages/types.js",
      "rui-reports/diagram/engine/core/src/languages/language-registry.js",
      "rui-reports/diagram/engine/core/src/languages/framework-registry.js",
      "rui-reports/diagram/engine/core/src/languages/configs/index.js",
      "rui-reports/diagram/engine/core/src/languages/frameworks/index.js"
    ],
    "rui-reports/diagram/engine/core/src/languages/language-registry.js": [
      "rui-reports/diagram/engine/core/src/languages/types.js",
      "rui-reports/diagram/engine/core/src/languages/configs/index.js"
    ],
    "rui-reports/diagram/engine/core/src/languages/types.js": [],
    "rui-reports/diagram/engine/core/src/persistence/index.js": [
      "rui-reports/diagram/engine/core/src/schema.js"
    ],
    "rui-reports/diagram/engine/core/src/persistence/persistence.test.js": [
      "rui-reports/diagram/engine/core/src/persistence/index.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/discovery.js": [
      "rui-reports/diagram/engine/core/src/languages/configs/index.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js": [],
    "rui-reports/diagram/engine/core/src/plugins/extractors/cpp-extractor.js": [
      "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/extractors/csharp-extractor.js": [
      "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/extractors/dart-extractor.js": [
      "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/extractors/go-extractor.js": [
      "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/extractors/index.js": [
      "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js",
      "rui-reports/diagram/engine/core/src/plugins/extractors/typescript-extractor.js",
      "rui-reports/diagram/engine/core/src/plugins/extractors/python-extractor.js",
      "rui-reports/diagram/engine/core/src/plugins/extractors/go-extractor.js",
      "rui-reports/diagram/engine/core/src/plugins/extractors/rust-extractor.js",
      "rui-reports/diagram/engine/core/src/plugins/extractors/java-extractor.js",
      "rui-reports/diagram/engine/core/src/plugins/extractors/ruby-extractor.js",
      "rui-reports/diagram/engine/core/src/plugins/extractors/php-extractor.js",
      "rui-reports/diagram/engine/core/src/plugins/extractors/cpp-extractor.js",
      "rui-reports/diagram/engine/core/src/plugins/extractors/csharp-extractor.js",
      "rui-reports/diagram/engine/core/src/plugins/extractors/dart-extractor.js",
      "rui-reports/diagram/engine/core/src/plugins/extractors/kotlin-extractor.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/extractors/java-extractor.js": [
      "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/extractors/kotlin-extractor.js": [
      "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/extractors/php-extractor.js": [
      "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/extractors/python-extractor.js": [
      "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/extractors/ruby-extractor.js": [
      "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/extractors/rust-extractor.js": [
      "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/extractors/types.js": [],
    "rui-reports/diagram/engine/core/src/plugins/extractors/typescript-extractor.js": [
      "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/parsers/dockerfile-parser.js": [],
    "rui-reports/diagram/engine/core/src/plugins/parsers/env-parser.js": [],
    "rui-reports/diagram/engine/core/src/plugins/parsers/graphql-parser.js": [],
    "rui-reports/diagram/engine/core/src/plugins/parsers/index.js": [
      "rui-reports/diagram/engine/core/src/plugins/parsers/markdown-parser.js",
      "rui-reports/diagram/engine/core/src/plugins/parsers/yaml-parser.js",
      "rui-reports/diagram/engine/core/src/plugins/parsers/json-parser.js",
      "rui-reports/diagram/engine/core/src/plugins/parsers/toml-parser.js",
      "rui-reports/diagram/engine/core/src/plugins/parsers/env-parser.js",
      "rui-reports/diagram/engine/core/src/plugins/parsers/dockerfile-parser.js",
      "rui-reports/diagram/engine/core/src/plugins/parsers/sql-parser.js",
      "rui-reports/diagram/engine/core/src/plugins/parsers/graphql-parser.js",
      "rui-reports/diagram/engine/core/src/plugins/parsers/protobuf-parser.js",
      "rui-reports/diagram/engine/core/src/plugins/parsers/terraform-parser.js",
      "rui-reports/diagram/engine/core/src/plugins/parsers/makefile-parser.js",
      "rui-reports/diagram/engine/core/src/plugins/parsers/shell-parser.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/parsers/json-parser.js": [],
    "rui-reports/diagram/engine/core/src/plugins/parsers/makefile-parser.js": [],
    "rui-reports/diagram/engine/core/src/plugins/parsers/markdown-parser.js": [],
    "rui-reports/diagram/engine/core/src/plugins/parsers/protobuf-parser.js": [],
    "rui-reports/diagram/engine/core/src/plugins/parsers/shell-parser.js": [],
    "rui-reports/diagram/engine/core/src/plugins/parsers/sql-parser.js": [],
    "rui-reports/diagram/engine/core/src/plugins/parsers/terraform-parser.js": [],
    "rui-reports/diagram/engine/core/src/plugins/parsers/toml-parser.js": [],
    "rui-reports/diagram/engine/core/src/plugins/parsers/yaml-parser.js": [],
    "rui-reports/diagram/engine/core/src/plugins/registry.js": [
      "rui-reports/diagram/engine/core/src/languages/language-registry.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/tree-sitter-plugin.js": [
      "rui-reports/diagram/engine/core/src/plugins/extractors/index.js"
    ],
    "rui-reports/diagram/engine/core/src/plugins/tree-sitter-plugin.test.js": [
      "rui-reports/diagram/engine/core/src/plugins/tree-sitter-plugin.js"
    ],
    "rui-reports/diagram/engine/core/src/schema.js": [],
    "rui-reports/diagram/engine/core/src/search.js": [],
    "rui-reports/diagram/engine/core/src/staleness.js": [],
    "rui-reports/diagram/engine/core/src/types.js": [],
    "rui-reports/diagram/engine/core/src/types.test.js": [],
    "rui-reports/diagram/engine/tree-sitter-dart-wasm/index.js": [],
    "rui-reports/diagram/scripts/build-fingerprints.mjs": [],
    "rui-reports/diagram/scripts/compute-batches.mjs": [],
    "rui-reports/diagram/scripts/extract-import-map.mjs": [],
    "rui-reports/diagram/scripts/extract-structure.mjs": [],
    "rui-reports/diagram/scripts/generate-ignore.mjs": [],
    "rui-reports/diagram/scripts/merge-batch-graphs.py": [],
    "rui-reports/diagram/scripts/scan-project.mjs": [],
    "rui-reports/diagram/templates/data.js": [],
    "rui-reports/diagram/templates/index.css": [],
    "rui-reports/diagram/templates/index.js": [],
    "rui-reports/files/scripts/analyze.mjs": [],
    "rui-reports/files/templates/app/actions.js": [],
    "rui-reports/files/templates/app/lifecycle.js": [],
    "rui-reports/files/templates/app/mount.js": [],
    "rui-reports/files/templates/app/state.js": [],
    "rui-reports/files/templates/components/rui-report-coupling/index.css": [],
    "rui-reports/files/templates/components/rui-report-coupling/index.js": [],
    "rui-reports/files/templates/components/rui-report-health/index.css": [],
    "rui-reports/files/templates/components/rui-report-health/index.js": [],
    "rui-reports/files/templates/components/rui-report-largest/index.css": [],
    "rui-reports/files/templates/components/rui-report-largest/index.js": [],
    "rui-reports/files/templates/components/rui-report-risk/index.css": [],
    "rui-reports/files/templates/components/rui-report-risk/index.js": [],
    "rui-reports/files/templates/components/rui-report-self-improvement/index.css": [],
    "rui-reports/files/templates/components/rui-report-self-improvement/index.js": [],
    "rui-reports/files/templates/components/rui-report-size/index.css": [],
    "rui-reports/files/templates/components/rui-report-size/index.js": [],
    "rui-reports/files/templates/components/rui-report-summary/index.css": [],
    "rui-reports/files/templates/components/rui-report-summary/index.js": [],
    "rui-reports/files/templates/data.js": [],
    "rui-reports/files/templates/index.css": [],
    "rui-reports/files/templates/index.js": [],
    "rui-reports/files/templates/lib/rui-bytes.js": [],
    "rui-reports/files/templates/lib/rui-sortable.js": [],
    "rui-tools/ui-ux/components/cip/CipPresentation.vue": [
      "rui-tools/ui-ux/components/cip/DeliverableCard.vue"
    ],
    "rui-tools/ui-ux/components/cip/DeliverableCard.vue": [],
    "rui-tools/ui-ux/components/slides/ChartSlide.vue": [],
    "rui-tools/ui-ux/components/slides/CtaSlide.vue": [],
    "rui-tools/ui-ux/components/slides/MetricsSlide.vue": [],
    "rui-tools/ui-ux/components/slides/ProblemSlide.vue": [],
    "rui-tools/ui-ux/components/slides/SlideDeck.vue": [
      "rui-tools/ui-ux/components/slides/TitleSlide.vue",
      "rui-tools/ui-ux/components/slides/ProblemSlide.vue",
      "rui-tools/ui-ux/components/slides/SolutionSlide.vue",
      "rui-tools/ui-ux/components/slides/MetricsSlide.vue",
      "rui-tools/ui-ux/components/slides/ChartSlide.vue",
      "rui-tools/ui-ux/components/slides/TestimonialSlide.vue",
      "rui-tools/ui-ux/components/slides/CtaSlide.vue"
    ],
    "rui-tools/ui-ux/components/slides/SolutionSlide.vue": [],
    "rui-tools/ui-ux/components/slides/TestimonialSlide.vue": [],
    "rui-tools/ui-ux/components/slides/TitleSlide.vue": []
  },
  "selfImprovement": {
    "topP0": [
      {
        "action": "File exceeds 1000 LOC (1570 lines)",
        "file": "rui-code/nginx/references/index.json",
        "line": null,
        "severity": "P0"
      },
      {
        "action": "File exceeds 1000 LOC (1237 lines)",
        "file": "rui-code/nodejs/references/index.json",
        "line": null,
        "severity": "P0"
      },
      {
        "action": "File exceeds 1000 LOC (3083 lines)",
        "file": "rui-code/tauri/references/index.json",
        "line": null,
        "severity": "P0"
      }
    ],
    "focusArea": {
      "dimName": "Oversized files",
      "score": 49,
      "why": "Oversized files is at 49/100 with 30 P0 and 42 P1 alerts. Address to lift composite score.",
      "hint": "Invest focused effort on top 3 levers for the largest uplift."
    },
    "trendInsight": "Score 84 (grade B). Oversized files is the weakest dimension at 49/100.",
    "weightsHint": "Consider increasing Oversized files weight given its outsized impact on overall health.",
    "narrative": [
      "Overall health at 84/100 (grade B) — good shape with clear remediation path.",
      "30 critical (P0) and 42 major (P1) alerts active. Primary risks cluster around Oversized files (score 49).",
      "Top lever: refactor rui-reports/diagram/engine/core/src/languages/configs/index.js (+5 pts). Remediation roadmap projects 100/100 after P0+P1 closure.",
      "Score 84 | grade B | gap 0 pts to B | projected 100 after plan | decay risk: -5 pts/quarter without action"
    ],
    "severityDonut": {
      "p0": 30,
      "p1": 42,
      "p2": 0,
      "total": 72
    },
    "riskVectors": [
      {
        "dimension": "Oversized files",
        "score": 49,
        "weight": 0.3,
        "p0": 30,
        "p1": 42,
        "p2": 0
      },
      {
        "dimension": "Coupling",
        "score": 98,
        "weight": 0.15,
        "p0": 0,
        "p1": 2,
        "p2": 0
      },
      {
        "dimension": "Nesting depth",
        "score": 100,
        "weight": 0.2,
        "p0": 0,
        "p1": 0,
        "p2": 0
      },
      {
        "dimension": "Cycles",
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
        "dimension": "Coupling",
        "severity": "P0",
        "kind": "refactor",
        "action": "Refactor rui-reports/diagram/engine/core/src/languages/configs/index.js (92 LOC, fan-out 41) to reduce hotspot score from 4.95",
        "file": "rui-reports/diagram/engine/core/src/languages/configs/index.js",
        "line": 1,
        "scoreUplift": 5,
        "effort": "high"
      },
      {
        "rank": 2,
        "dimension": "Coupling",
        "severity": "P1",
        "kind": "refactor",
        "action": "Refactor rui-tools/public-api/references/index.json (9150 LOC, fan-out 0) to reduce hotspot score from 4.58",
        "file": "rui-tools/public-api/references/index.json",
        "line": 1,
        "scoreUplift": 5,
        "effort": "medium"
      },
      {
        "rank": 3,
        "dimension": "Coupling",
        "severity": "P1",
        "kind": "refactor",
        "action": "Refactor rui-questions/references/index.json (8978 LOC, fan-out 0) to reduce hotspot score from 4.49",
        "file": "rui-questions/references/index.json",
        "line": 1,
        "scoreUplift": 4,
        "effort": "medium"
      },
      {
        "rank": 4,
        "dimension": "Coupling",
        "severity": "P1",
        "kind": "refactor",
        "action": "Refactor rui-reports/diagram/engine/core/src/index.js (23 LOC, fan-out 22) to reduce hotspot score from 3.01",
        "file": "rui-reports/diagram/engine/core/src/index.js",
        "line": 1,
        "scoreUplift": 3,
        "effort": "high"
      },
      {
        "rank": 5,
        "dimension": "Coupling",
        "severity": "P1",
        "kind": "refactor",
        "action": "Refactor rui-questions/references/README-interview-qa.md (5172 LOC, fan-out 0) to reduce hotspot score from 2.59",
        "file": "rui-questions/references/README-interview-qa.md",
        "line": 1,
        "scoreUplift": 3,
        "effort": "medium"
      },
      {
        "rank": 6,
        "dimension": "Coupling",
        "severity": "P1",
        "kind": "refactor",
        "action": "Refactor rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js (47 LOC, fan-out 0) to reduce hotspot score from 2.42",
        "file": "rui-reports/diagram/engine/core/src/plugins/extractors/base-extractor.js",
        "line": 1,
        "scoreUplift": 2,
        "effort": "medium"
      }
    ],
    "benchmarks": {
      "currentGrade": "B",
      "currentValue": 84,
      "targetGrade": "B",
      "targetValue": 90,
      "gapToNext": 6
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
      "currentScore": 84,
      "projectedScoreIfAllP0P1Remediated": 100
    },
    "decayForecast": {
      "currentScore": 84,
      "projectedNext": 79,
      "delta": -5,
      "rationale": "Without action, Oversized files debt grows ~1 pt/quarter. Estimated -5 pts next run if no remediation."
    }
  },
  "scoreWeights": [
    {
      "dimension": "Oversized files",
      "weight": 0.3,
      "score": 49
    },
    {
      "dimension": "Nesting depth",
      "weight": 0.2,
      "score": 100
    },
    {
      "dimension": "Cycles",
      "weight": 0.2,
      "score": 100
    },
    {
      "dimension": "Coupling",
      "weight": 0.15,
      "score": 98
    },
    {
      "dimension": "Freshness",
      "weight": 0.15,
      "score": 100
    }
  ],
  "truncated": false
};
