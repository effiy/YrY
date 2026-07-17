window.REPORT_CONFIG = {
    /* Runtime options used by the analysis run. Displayed in the header
       and footer as the verbatim JSON. `generatedAt` is an ISO timestamp
       used to compute the stale-data warning + footer recap. */
    options: {
        topN: 20,
        noCycles: false,
        theme: 'dark',
        generatedAt: '2026-07-17T01:55:13.396Z', /* ISO 8601 UTC — filled in by the analyzer */
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
  "score": 89,
  "alerts": [
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "asset/eg1.gif",
      "line": null,
      "message": "File exceeds 1000 LOC (2396 lines)",
      "metric": "2396 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into asset/eg1.gif/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open asset/eg1.gif and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "file": "asset/eg2.gif",
      "line": null,
      "message": "File exceeds 1000 LOC (4388 lines)",
      "metric": "4388 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into asset/eg2.gif/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open asset/eg2.gif and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "file": "asset/eg3.gif",
      "line": null,
      "message": "File exceeds 1000 LOC (6884 lines)",
      "metric": "6884 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into asset/eg3.gif/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open asset/eg3.gif and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "file": "asset/eg4.gif",
      "line": null,
      "message": "File exceeds 1000 LOC (6792 lines)",
      "metric": "6792 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into asset/eg4.gif/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open asset/eg4.gif and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "file": "asset/eg5.gif",
      "line": null,
      "message": "File exceeds 1000 LOC (1425 lines)",
      "metric": "1425 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into asset/eg5.gif/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open asset/eg5.gif and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "file": "asset/eg6.gif",
      "line": null,
      "message": "File exceeds 1000 LOC (3089 lines)",
      "metric": "3089 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into asset/eg6.gif/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open asset/eg6.gif and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "file": "pnpm-lock.yaml",
      "line": null,
      "message": "File exceeds 1000 LOC (6656 lines)",
      "metric": "6656 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into pnpm-lock.yaml/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open pnpm-lock.yaml and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "file": "public/logo/simple_latex.png",
      "line": null,
      "message": "File exceeds 1000 LOC (2287 lines)",
      "metric": "2287 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into public/logo/simple_latex.png/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open public/logo/simple_latex.png and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "file": "public/logo/yandex.svg",
      "line": null,
      "message": "File exceeds 1000 LOC (8307 lines)",
      "metric": "8307 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into public/logo/yandex.svg/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open public/logo/yandex.svg and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "file": "src-tauri/Cargo.lock",
      "line": null,
      "message": "File exceeds 1000 LOC (8632 lines)",
      "metric": "8632 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into src-tauri/Cargo.lock/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open src-tauri/Cargo.lock and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "file": "src-tauri/icons/icon.icns",
      "line": null,
      "message": "File exceeds 1000 LOC (1111 lines)",
      "metric": "1111 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into src-tauri/icons/icon.icns/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open src-tauri/icons/icon.icns and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "category": "hotspot",
      "file": "src/hooks/useConfig.jsx",
      "line": null,
      "message": "Hotspot score 6.93 (>= 5.0)",
      "metric": "hotspot 6.93",
      "impact": "High fan-in × fan-out × size → a change ripples widely, raising defect risk and review cost.",
      "risk": "If left unfixed: any change here risks cascading defects across multiple call sites and inflates the blast radius of every release.",
      "blastRadius": "35 inbound+outbound edges",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 7,
      "recommendations": [
        "Extract stable primitives (types, constants, pure helpers) into a leaf module that others depend on.",
        "Introduce a façade; have callers depend on the façade instead of reaching into internals.",
        "Convert large switch/if-else dispatch into a registry/map to shrink the hot core.",
        "Split the test suite by concern so a hotspot change does not trigger the full suite.",
        "Add a CODEOWNERS entry and a PR-size guardrail for this file."
      ],
      "acceptance": [
        "Hotspot score drops below 5.0 on the next analyzer run.",
        "Fan-out decreases or moves behind a façade boundary.",
        "No public API removed without a deprecation shim; call sites still type-check.",
        "CODEOWNERS entry added and enforced on the next PR touching the file."
      ],
      "firstStep": "Grep for all importers of this file and group them by domain — the largest cluster becomes the first façade to extract.",
      "tooling": [
        {
          "name": "dependency-cruiser",
          "hint": "enforce fan-in / fan-out limits per module"
        },
        {
          "name": "knip",
          "hint": "surface unused exports the façade can drop"
        },
        {
          "name": "CodeSee",
          "hint": "visualize the dependency map around this hotspot"
        }
      ],
      "preventiveControls": [
        "CI: fail if hotspot score on this file regresses beyond 5.0.",
        "CODEOWNERS: require 2 reviewers from the owning team for any PR touching the file.",
        "PR-size guard: cap diff size on this file at 200 LOC per PR."
      ],
      "rollbackPlan": "Revert the façade PR; callers go back to importing internals directly. Keep the façade module empty but re-exported for one release to ease re-introduction.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "hotspot",
      "file": "src/utils/service_instance.ts",
      "line": null,
      "message": "Hotspot score 10.63 (>= 5.0)",
      "metric": "hotspot 10.63",
      "impact": "High fan-in × fan-out × size → a change ripples widely, raising defect risk and review cost.",
      "risk": "If left unfixed: any change here risks cascading defects across multiple call sites and inflates the blast radius of every release.",
      "blastRadius": "53 inbound+outbound edges",
      "effort": "medium",
      "estimatedHours": 8,
      "scoreUplift": 11,
      "recommendations": [
        "Extract stable primitives (types, constants, pure helpers) into a leaf module that others depend on.",
        "Introduce a façade; have callers depend on the façade instead of reaching into internals.",
        "Convert large switch/if-else dispatch into a registry/map to shrink the hot core.",
        "Split the test suite by concern so a hotspot change does not trigger the full suite.",
        "Add a CODEOWNERS entry and a PR-size guardrail for this file."
      ],
      "acceptance": [
        "Hotspot score drops below 5.0 on the next analyzer run.",
        "Fan-out decreases or moves behind a façade boundary.",
        "No public API removed without a deprecation shim; call sites still type-check.",
        "CODEOWNERS entry added and enforced on the next PR touching the file."
      ],
      "firstStep": "Grep for all importers of this file and group them by domain — the largest cluster becomes the first façade to extract.",
      "tooling": [
        {
          "name": "dependency-cruiser",
          "hint": "enforce fan-in / fan-out limits per module"
        },
        {
          "name": "knip",
          "hint": "surface unused exports the façade can drop"
        },
        {
          "name": "CodeSee",
          "hint": "visualize the dependency map around this hotspot"
        }
      ],
      "preventiveControls": [
        "CI: fail if hotspot score on this file regresses beyond 5.0.",
        "CODEOWNERS: require 2 reviewers from the owning team for any PR touching the file.",
        "PR-size guard: cap diff size on this file at 200 LOC per PR."
      ],
      "rollbackPlan": "Revert the façade PR; callers go back to importing internals directly. Keep the façade module empty but re-exported for one release to ease re-introduction.",
      "cyclePath": ""
    },
    {
      "severity": "P0",
      "marker": "P0",
      "category": "bloat",
      "file": "yarn.lock",
      "line": null,
      "message": "File exceeds 1000 LOC (5261 lines)",
      "metric": "5261 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "high",
      "estimatedHours": 16,
      "scoreUplift": 8,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into yarn.lock/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open yarn.lock and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "file": "public/logo/tencent.svg",
      "line": null,
      "message": "File exceeds 500 LOC (548 lines)",
      "metric": "548 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into public/logo/tencent.svg/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open public/logo/tencent.svg and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "file": "src-tauri/icons_mac/icon.icns",
      "line": null,
      "message": "File exceeds 500 LOC (739 lines)",
      "metric": "739 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into src-tauri/icons_mac/icon.icns/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open src-tauri/icons_mac/icon.icns and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "file": "src-tauri/src/tray.rs",
      "line": null,
      "message": "File exceeds 500 LOC (633 lines)",
      "metric": "633 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "file-local + reviewers",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into src-tauri/src/tray.rs/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open src-tauri/src/tray.rs and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
      "category": "cycle",
      "file": "src/services/collection/anki/index.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/collection/anki/index.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/collection/anki/Config.jsx → src/services/collection/anki/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/collection/eudic/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/collection/eudic/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/collection/eudic/Config.jsx → src/services/collection/eudic/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/recognize/baidu_accurate/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/recognize/baidu_accurate/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/recognize/baidu_accurate/Config.jsx → src/services/recognize/baidu_accurate/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/recognize/baidu_img/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/recognize/baidu_img/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/recognize/baidu_img/Config.jsx → src/services/recognize/baidu_img/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/recognize/baidu/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/recognize/baidu/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/recognize/baidu/Config.jsx → src/services/recognize/baidu/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/recognize/iflytek_intsig/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/recognize/iflytek_intsig/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/recognize/iflytek_intsig/Config.jsx → src/services/recognize/iflytek_intsig/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/recognize/iflytek_latex/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/recognize/iflytek_latex/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/recognize/iflytek_latex/Config.jsx → src/services/recognize/iflytek_latex/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/recognize/iflytek/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/recognize/iflytek/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/recognize/iflytek/Config.jsx → src/services/recognize/iflytek/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/recognize/simple_latex/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/recognize/simple_latex/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/recognize/simple_latex/Config.jsx → src/services/recognize/simple_latex/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/recognize/tencent_accurate/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/recognize/tencent_accurate/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/recognize/tencent_accurate/Config.jsx → src/services/recognize/tencent_accurate/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/recognize/tencent_img/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/recognize/tencent_img/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/recognize/tencent_img/Config.jsx → src/services/recognize/tencent_img/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/recognize/tencent/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/recognize/tencent/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/recognize/tencent/Config.jsx → src/services/recognize/tencent/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/recognize/volcengine_multi_lang/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/recognize/volcengine_multi_lang/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/recognize/volcengine_multi_lang/Config.jsx → src/services/recognize/volcengine_multi_lang/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/recognize/volcengine/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/recognize/volcengine/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/recognize/volcengine/Config.jsx → src/services/recognize/volcengine/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/alibaba/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/alibaba/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/alibaba/Config.jsx → src/services/translate/alibaba/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/baidu_field/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/baidu_field/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/baidu_field/Config.jsx → src/services/translate/baidu_field/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/baidu/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/baidu/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/baidu/Config.jsx → src/services/translate/baidu/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/caiyun/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/caiyun/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/caiyun/Config.jsx → src/services/translate/caiyun/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/chatglm/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/chatglm/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/chatglm/Config.jsx → src/services/translate/chatglm/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/deepl/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/deepl/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/deepl/Config.jsx → src/services/translate/deepl/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/geminipro/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/geminipro/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/geminipro/Config.jsx → src/services/translate/geminipro/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/google/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/google/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/google/Config.jsx → src/services/translate/google/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/niutrans/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/niutrans/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/niutrans/Config.jsx → src/services/translate/niutrans/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/ollama/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/ollama/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/ollama/Config.jsx → src/services/translate/ollama/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/openai/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/openai/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/openai/Config.jsx → src/services/translate/openai/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/tencent/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/tencent/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/tencent/Config.jsx → src/services/translate/tencent/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/transmart/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/transmart/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/transmart/Config.jsx → src/services/translate/transmart/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/volcengine/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/volcengine/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/volcengine/Config.jsx → src/services/translate/volcengine/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/translate/youdao/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/translate/youdao/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/translate/youdao/Config.jsx → src/services/translate/youdao/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "cycle",
      "file": "src/services/tts/lingva/Config.jsx",
      "line": null,
      "message": "2-node cycle detected",
      "metric": "cycle len 2",
      "impact": "Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.",
      "risk": "If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.",
      "blastRadius": "2 module(s) in the cycle + their transitive importers",
      "effort": "medium",
      "estimatedHours": 6,
      "scoreUplift": 6,
      "recommendations": [
        "Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.",
        "Invert one edge via dependency injection, an event bus, or a callback registry.",
        "Break the edge from the hottest member (src/services/tts/lingva/Config.jsx) first — it has the highest fan-in+fan-out.",
        "For TypeScript: use `import type` to split runtime cycles from type-only cycles.",
        "Re-run cycle detection after each edge removal to catch regressions before they compound."
      ],
      "acceptance": [
        "Cycle detection (this analyzer) returns 0 cycles touching any of the original members.",
        "Bundled output size does not increase beyond noise (tree-shaking preserved).",
        "Cold-start / first-paint unchanged or improved.",
        "All existing tests pass without import-order shims."
      ],
      "firstStep": "Run `madge --circular <entry>` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.",
      "tooling": [
        {
          "name": "madge",
          "hint": "detects + visualizes circular dependencies across JS/TS"
        },
        {
          "name": "dependency-cruiser",
          "hint": "fails CI on any new cycle, with auto-generated baseline"
        },
        {
          "name": "circular-dependency-plugin",
          "hint": "webpack build-time warning for runtime cycles"
        }
      ],
      "preventiveControls": [
        "CI: dependency-cruiser rule `no-circular` on the affected subgraph.",
        "Pre-commit: madge --circular on staged import graphs.",
        "PR template: checkbox \"Confirmed no new circular imports introduced\"."
      ],
      "rollbackPlan": "Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.",
      "cyclePath": "src/services/tts/lingva/Config.jsx → src/services/tts/lingva/index.jsx"
    },
    {
      "severity": "P1",
      "marker": "P1",
      "category": "bloat",
      "file": "src/window/Config/pages/General/index.jsx",
      "line": null,
      "message": "File exceeds 500 LOC (604 lines)",
      "metric": "604 LOC",
      "impact": "Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.",
      "risk": "If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.",
      "blastRadius": "3 direct importer(s)",
      "effort": "low",
      "estimatedHours": 4,
      "scoreUplift": 4,
      "recommendations": [
        "Split by responsibility: extract cohesive regions into src/window/Config/pages/General/index.jsx/{a,b}.ext and re-export from a barrel index.",
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
      "firstStep": "Open src/window/Config/pages/General/index.jsx and list its top-level responsibilities (one sentence each) — that list becomes the split plan.",
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
    "totalFiles": 341,
    "totalBytes": 16774466,
    "totalBytesHuman": "16.0 MB",
    "maxDepth": 2,
    "criticalCount": 14,
    "hotspotCount": 10,
    "cycleCount": 30,
    "staleCount": 0,
    "totalLines": 90027
  },
  "treemap": [
    {
      "name": "asset/",
      "bytes": 7685326,
      "humanBytes": "7.3 MB"
    },
    {
      "name": "public/",
      "bytes": 5845543,
      "humanBytes": "5.6 MB"
    },
    {
      "name": "public/logo/",
      "bytes": 1719197,
      "humanBytes": "1.6 MB"
    },
    {
      "name": "src-tauri/",
      "bytes": 1692459,
      "humanBytes": "1.6 MB"
    },
    {
      "name": "src/",
      "bytes": 721439,
      "humanBytes": "704.5 KB"
    },
    {
      "name": "src-tauri/icons/",
      "bytes": 657409,
      "humanBytes": "642.0 KB"
    },
    {
      "name": "src-tauri/icons_mac/",
      "bytes": 498914,
      "humanBytes": "487.2 KB"
    },
    {
      "name": "src/window/",
      "bytes": 333667,
      "humanBytes": "325.8 KB"
    },
    {
      "name": "src/services/",
      "bytes": 328026,
      "humanBytes": "320.3 KB"
    },
    {
      "name": "src/window/Config/",
      "bytes": 229853,
      "humanBytes": "224.5 KB"
    },
    {
      "name": "src-tauri/resources/",
      "bytes": 229440,
      "humanBytes": "224.1 KB"
    },
    {
      "name": "src/window/Config/pages/",
      "bytes": 221332,
      "humanBytes": "216.1 KB"
    },
    {
      "name": "src/services/translate/",
      "bytes": 181070,
      "humanBytes": "176.8 KB"
    },
    {
      "name": "docs/",
      "bytes": 142255,
      "humanBytes": "138.9 KB"
    },
    {
      "name": "src/services/recognize/",
      "bytes": 125856,
      "humanBytes": "122.9 KB"
    },
    {
      "name": ".scripts/",
      "bytes": 100838,
      "humanBytes": "98.5 KB"
    },
    {
      "name": "src/window/Config/pages/Service/",
      "bytes": 88384,
      "humanBytes": "86.3 KB"
    },
    {
      "name": "src-tauri/src/",
      "bytes": 84646,
      "humanBytes": "82.7 KB"
    },
    {
      "name": "src/window/Translate/",
      "bytes": 66963,
      "humanBytes": "65.4 KB"
    },
    {
      "name": "src/window/Translate/components/",
      "bytes": 51579,
      "humanBytes": "50.4 KB"
    },
    {
      "name": ".scripts/popclip/",
      "bytes": 50956,
      "humanBytes": "49.8 KB"
    },
    {
      "name": ".scripts/snipdo/",
      "bytes": 49882,
      "humanBytes": "48.7 KB"
    },
    {
      "name": "docs/self-test/",
      "bytes": 44639,
      "humanBytes": "43.6 KB"
    },
    {
      "name": "docs/arch/",
      "bytes": 41500,
      "humanBytes": "40.5 KB"
    },
    {
      "name": "src/window/Config/pages/Backup/",
      "bytes": 38074,
      "humanBytes": "37.2 KB"
    },
    {
      "name": "src/i18n/",
      "bytes": 33555,
      "humanBytes": "32.8 KB"
    },
    {
      "name": "src/window/Config/pages/General/",
      "bytes": 31902,
      "humanBytes": "31.2 KB"
    },
    {
      "name": "src/i18n/locales/",
      "bytes": 31880,
      "humanBytes": "31.1 KB"
    },
    {
      "name": "src/window/Translate/components/TargetArea/",
      "bytes": 28580,
      "humanBytes": "27.9 KB"
    },
    {
      "name": "src/window/Recognize/",
      "bytes": 24949,
      "humanBytes": "24.4 KB"
    },
    {
      "name": "src/services/translate/openai/",
      "bytes": 22785,
      "humanBytes": "22.3 KB"
    },
    {
      "name": "src/window/Config/pages/History/",
      "bytes": 21488,
      "humanBytes": "21.0 KB"
    },
    {
      "name": "src/window/Config/pages/Translate/",
      "bytes": 18558,
      "humanBytes": "18.1 KB"
    },
    {
      "name": "src/services/translate/ollama/",
      "bytes": 18516,
      "humanBytes": "18.1 KB"
    },
    {
      "name": "src/window/Config/pages/Service/Recognize/",
      "bytes": 18145,
      "humanBytes": "17.7 KB"
    },
    {
      "name": "src/window/Config/pages/Service/Translate/",
      "bytes": 17632,
      "humanBytes": "17.2 KB"
    },
    {
      "name": "src/window/Translate/components/SourceArea/",
      "bytes": 17251,
      "humanBytes": "16.8 KB"
    },
    {
      "name": "src/window/Config/pages/Service/Tts/",
      "bytes": 17130,
      "humanBytes": "16.7 KB"
    },
    {
      "name": "src/window/Config/pages/Service/Collection/",
      "bytes": 17003,
      "humanBytes": "16.6 KB"
    },
    {
      "name": "src/services/translate/geminipro/",
      "bytes": 16971,
      "humanBytes": "16.6 KB"
    },
    {
      "name": "src/services/collection/",
      "bytes": 15759,
      "humanBytes": "15.4 KB"
    },
    {
      "name": "src/services/translate/chatglm/",
      "bytes": 14465,
      "humanBytes": "14.1 KB"
    },
    {
      "name": "src/utils/",
      "bytes": 13922,
      "humanBytes": "13.6 KB"
    },
    {
      "name": "docs/arch/scene-5-trust-boundary-security-surface/",
      "bytes": 12605,
      "humanBytes": "12.3 KB"
    },
    {
      "name": "src/window/Config/pages/Backup/utils/",
      "bytes": 12298,
      "humanBytes": "12.0 KB"
    },
    {
      "name": "src/services/translate/deepl/",
      "bytes": 11562,
      "humanBytes": "11.3 KB"
    },
    {
      "name": "src/services/recognize/volcengine_multi_lang/",
      "bytes": 11289,
      "humanBytes": "11.0 KB"
    },
    {
      "name": "src/services/recognize/volcengine/",
      "bytes": 10988,
      "humanBytes": "10.7 KB"
    },
    {
      "name": "src/services/recognize/tencent_img/",
      "bytes": 10985,
      "humanBytes": "10.7 KB"
    },
    {
      "name": "src/services/recognize/tencent/",
      "bytes": 10724,
      "humanBytes": "10.5 KB"
    }
  ],
  "types": [
    {
      "type": ".other",
      "fileCount": 126,
      "totalBytes": 11875172,
      "totalLines": 68444,
      "pctFiles": 37,
      "pctBytes": 70.8,
      "totalBytesHuman": "11.3 MB"
    },
    {
      "type": ".js",
      "fileCount": 11,
      "totalBytes": 4111747,
      "totalLines": 1252,
      "pctFiles": 3.2,
      "pctBytes": 24.5,
      "totalBytesHuman": "3.9 MB"
    },
    {
      "type": ".jsx",
      "fileCount": 141,
      "totalBytes": 657061,
      "totalLines": 16161,
      "pctFiles": 41.3,
      "pctBytes": 3.9,
      "totalBytesHuman": "641.7 KB"
    },
    {
      "type": ".rust",
      "fileCount": 15,
      "totalBytes": 84685,
      "totalLines": 2391,
      "pctFiles": 4.4,
      "pctBytes": 0.5,
      "totalBytesHuman": "82.7 KB"
    },
    {
      "type": ".ts",
      "fileCount": 41,
      "totalBytes": 20768,
      "totalLines": 1142,
      "pctFiles": 12,
      "pctBytes": 0.1,
      "totalBytesHuman": "20.3 KB"
    },
    {
      "type": ".css",
      "fileCount": 4,
      "totalBytes": 15019,
      "totalLines": 387,
      "pctFiles": 1.2,
      "pctBytes": 0.1,
      "totalBytesHuman": "14.7 KB"
    },
    {
      "type": ".mjs",
      "fileCount": 2,
      "totalBytes": 7395,
      "totalLines": 174,
      "pctFiles": 0.6,
      "pctBytes": 0,
      "totalBytesHuman": "7.2 KB"
    },
    {
      "type": ".cjs",
      "fileCount": 1,
      "totalBytes": 2619,
      "totalLines": 76,
      "pctFiles": 0.3,
      "pctBytes": 0,
      "totalBytesHuman": "2.6 KB"
    }
  ],
  "histogram": [
    {
      "bucket": "0",
      "count": 10,
      "pctFiles": 2.9
    },
    {
      "bucket": "1-50",
      "count": 131,
      "pctFiles": 38.4
    },
    {
      "bucket": "51-100",
      "count": 60,
      "pctFiles": 17.6
    },
    {
      "bucket": "101-250",
      "count": 103,
      "pctFiles": 30.2
    },
    {
      "bucket": "251-500",
      "count": 21,
      "pctFiles": 6.2
    },
    {
      "bucket": "501-1000",
      "count": 4,
      "pctFiles": 1.2
    },
    {
      "bucket": "1001-2000",
      "count": 2,
      "pctFiles": 0.6
    },
    {
      "bucket": "2000+",
      "count": 10,
      "pctFiles": 2.9
    }
  ],
  "largest": [
    {
      "path": "public/tesseract-core-simd-lstm.wasm.js",
      "bytes": 3938114,
      "bytesHuman": "3.8 MB",
      "lines": 281,
      "type": ".js",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/eg4.gif",
      "bytes": 1506035,
      "bytesHuman": "1.4 MB",
      "lines": 6792,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/eg3.gif",
      "bytes": 1390562,
      "bytesHuman": "1.3 MB",
      "lines": 6884,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/1.png",
      "bytes": 1108203,
      "bytesHuman": "1.1 MB",
      "lines": 210,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/3.png",
      "bytes": 1108203,
      "bytesHuman": "1.1 MB",
      "lines": 114,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/eg2.gif",
      "bytes": 951922,
      "bytesHuman": "929.6 KB",
      "lines": 4388,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "public/logo/simple_latex.png",
      "bytes": 651647,
      "bytesHuman": "636.4 KB",
      "lines": 2287,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/eg6.gif",
      "bytes": 650295,
      "bytesHuman": "635.1 KB",
      "lines": 3089,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "public/logo/yandex.svg",
      "bytes": 639804,
      "bytesHuman": "624.8 KB",
      "lines": 8307,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/eg1.gif",
      "bytes": 540046,
      "bytesHuman": "527.4 KB",
      "lines": 2396,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src-tauri/icons/icon.icns",
      "bytes": 357142,
      "bytesHuman": "348.8 KB",
      "lines": 1111,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "asset/eg5.gif",
      "bytes": 291373,
      "bytesHuman": "284.5 KB",
      "lines": 1425,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "pnpm-lock.yaml",
      "bytes": 287880,
      "bytesHuman": "281.1 KB",
      "lines": 6656,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "yarn.lock",
      "bytes": 255070,
      "bytesHuman": "249.1 KB",
      "lines": 5261,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src-tauri/icons_mac/icon.icns",
      "bytes": 226439,
      "bytesHuman": "221.1 KB",
      "lines": 739,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src-tauri/Cargo.lock",
      "bytes": 209404,
      "bytesHuman": "204.5 KB",
      "lines": 8632,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "public/worker.min.js",
      "bytes": 126321,
      "bytesHuman": "123.4 KB",
      "lines": 2,
      "type": ".js",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src-tauri/resources/ocr-x86_64-apple-darwin",
      "bytes": 116944,
      "bytesHuman": "114.2 KB",
      "lines": 130,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "src-tauri/resources/ocr-aarch64-apple-darwin",
      "bytes": 112496,
      "bytesHuman": "109.9 KB",
      "lines": 114,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    },
    {
      "path": "public/logo/ollama.png",
      "bytes": 92041,
      "bytesHuman": "89.9 KB",
      "lines": 293,
      "type": ".other",
      "depth": 0,
      "fanIn": 0,
      "fanOut": 0
    }
  ],
  "fanin": [
    {
      "path": "src/utils/service_instance.ts",
      "fanIn": 53,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 50,
      "type": ".ts"
    },
    {
      "path": "src/hooks/useConfig.jsx",
      "fanIn": 32,
      "fanOut": 3,
      "extDeps": 2,
      "lines": 67,
      "type": ".jsx"
    },
    {
      "path": "src/utils/env.js",
      "fanIn": 21,
      "fanOut": 0,
      "extDeps": 2,
      "lines": 14,
      "type": ".js"
    },
    {
      "path": "src/utils/store.js",
      "fanIn": 8,
      "fanOut": 0,
      "extDeps": 4,
      "lines": 16,
      "type": ".js"
    },
    {
      "path": "src/utils/language.ts",
      "fanIn": 6,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 68,
      "type": ".ts"
    },
    {
      "path": "src/utils/invoke_plugin.js",
      "fanIn": 4,
      "fanOut": 1,
      "extDeps": 6,
      "lines": 35,
      "type": ".js"
    },
    {
      "path": "src/hooks/useGetState.jsx",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 9,
      "type": ".jsx"
    },
    {
      "path": "src/utils/lang_detect.js",
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 3,
      "lines": 334,
      "type": ".js"
    },
    {
      "path": "src/window/Config/pages/Backup/utils/aliyun.jsx",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 3,
      "lines": 331,
      "type": ".jsx"
    },
    {
      "path": "src/window/Config/pages/Backup/utils/webdav.jsx",
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 47,
      "type": ".jsx"
    },
    {
      "path": "src/App.jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 14,
      "lines": 117,
      "type": ".jsx"
    },
    {
      "path": "src/components/WindowControl/style.css",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 3,
      "type": ".css"
    },
    {
      "path": "src/hooks/useSyncAtom.jsx",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 1,
      "lines": 12,
      "type": ".jsx"
    },
    {
      "path": "src/hooks/useToastStyle.jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 2,
      "lines": 14,
      "type": ".jsx"
    },
    {
      "path": "src/hooks/useTtsPluginInfo.jsx",
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "lines": 18,
      "type": ".jsx"
    },
    {
      "path": "src/hooks/useVoice.jsx",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "lines": 28,
      "type": ".jsx"
    },
    {
      "path": "src/i18n/locales/en_US.json",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 472,
      "type": ".other"
    },
    {
      "path": "src/i18n/locales/es_ES.json",
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "lines": 331,
      "type": ".other"
    },
    {
      "path": "src/services/collection/anki/Config.jsx",
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 7,
      "lines": 110,
      "type": ".jsx"
    },
    {
      "path": "src/services/collection/anki/index.jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 1,
      "lines": 110,
      "type": ".jsx"
    }
  ],
  "fanout": [
    {
      "path": "src/hooks/index.jsx",
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 0,
      "lines": 5,
      "type": ".jsx"
    },
    {
      "path": "src/window/Config/pages/History/index.jsx",
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 14,
      "lines": 380,
      "type": ".jsx"
    },
    {
      "path": "src/window/Translate/components/TargetArea/index.jsx",
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 22,
      "lines": 459,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/system/index.jsx",
      "fanIn": 0,
      "fanOut": 4,
      "extDeps": 1,
      "lines": 111,
      "type": ".jsx"
    },
    {
      "path": "src/window/Config/pages/Backup/index.jsx",
      "fanIn": 0,
      "fanOut": 4,
      "extDeps": 18,
      "lines": 317,
      "type": ".jsx"
    },
    {
      "path": "src/window/Translate/components/SourceArea/index.jsx",
      "fanIn": 0,
      "fanOut": 4,
      "extDeps": 11,
      "lines": 370,
      "type": ".jsx"
    },
    {
      "path": "src/hooks/useConfig.jsx",
      "fanIn": 32,
      "fanOut": 3,
      "extDeps": 2,
      "lines": 67,
      "type": ".jsx"
    },
    {
      "path": "src/main.jsx",
      "fanIn": 0,
      "fanOut": 3,
      "extDeps": 5,
      "lines": 28,
      "type": ".jsx"
    },
    {
      "path": "src/services/collection/anki/index.jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 1,
      "lines": 110,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/baidu_accurate/Config.jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "lines": 131,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/baidu_img/Config.jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "lines": 131,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/baidu/Config.jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "lines": 131,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/iflytek_intsig/Config.jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "lines": 152,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/iflytek_latex/Config.jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "lines": 152,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/iflytek/Config.jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "lines": 152,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/simple_latex/Config.jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "lines": 112,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/tencent_accurate/Config.jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "lines": 132,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/tencent_img/Config.jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "lines": 132,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/tencent/Config.jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "lines": 134,
      "type": ".jsx"
    },
    {
      "path": "src/services/recognize/volcengine_multi_lang/Config.jsx",
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "lines": 132,
      "type": ".jsx"
    }
  ],
  "hotspots": [
    {
      "path": "src/utils/service_instance.ts",
      "bytes": 1745,
      "bytesHuman": "1.7 KB",
      "lines": 50,
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
      "lines": 67,
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
      "lines": 8632,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.32
    },
    {
      "path": "src/utils/env.js",
      "bytes": 381,
      "bytesHuman": "381 B",
      "lines": 14,
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
      "lines": 8307,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.15
    },
    {
      "path": "asset/eg3.gif",
      "bytes": 1390562,
      "bytesHuman": "1.3 MB",
      "lines": 6884,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.44
    },
    {
      "path": "asset/eg4.gif",
      "bytes": 1506035,
      "bytesHuman": "1.4 MB",
      "lines": 6792,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.4
    },
    {
      "path": "pnpm-lock.yaml",
      "bytes": 287880,
      "bytesHuman": "281.1 KB",
      "lines": 6656,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.33
    },
    {
      "path": "yarn.lock",
      "bytes": 255070,
      "bytesHuman": "249.1 KB",
      "lines": 5261,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 2.63
    },
    {
      "path": "asset/eg2.gif",
      "bytes": 951922,
      "bytesHuman": "929.6 KB",
      "lines": 4388,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 2.19
    }
  ],
  "orphans": [
    {
      "path": "public/tesseract-core-simd-lstm.wasm.js",
      "bytes": 3938114,
      "bytesHuman": "3.8 MB",
      "lines": 281,
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
      "lines": 6792,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.4
    },
    {
      "path": "asset/eg3.gif",
      "bytes": 1390562,
      "bytesHuman": "1.3 MB",
      "lines": 6884,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.44
    },
    {
      "path": "asset/1.png",
      "bytes": 1108203,
      "bytesHuman": "1.1 MB",
      "lines": 210,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.1
    },
    {
      "path": "asset/3.png",
      "bytes": 1108203,
      "bytesHuman": "1.1 MB",
      "lines": 114,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.06
    },
    {
      "path": "asset/eg2.gif",
      "bytes": 951922,
      "bytesHuman": "929.6 KB",
      "lines": 4388,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 2.19
    },
    {
      "path": "public/logo/simple_latex.png",
      "bytes": 651647,
      "bytesHuman": "636.4 KB",
      "lines": 2287,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1.14
    },
    {
      "path": "asset/eg6.gif",
      "bytes": 650295,
      "bytesHuman": "635.1 KB",
      "lines": 3089,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1.54
    },
    {
      "path": "public/logo/yandex.svg",
      "bytes": 639804,
      "bytesHuman": "624.8 KB",
      "lines": 8307,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.15
    },
    {
      "path": "asset/eg1.gif",
      "bytes": 540046,
      "bytesHuman": "527.4 KB",
      "lines": 2396,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 1.2
    },
    {
      "path": "src-tauri/icons/icon.icns",
      "bytes": 357142,
      "bytesHuman": "348.8 KB",
      "lines": 1111,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.56
    },
    {
      "path": "asset/eg5.gif",
      "bytes": 291373,
      "bytesHuman": "284.5 KB",
      "lines": 1425,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.71
    },
    {
      "path": "pnpm-lock.yaml",
      "bytes": 287880,
      "bytesHuman": "281.1 KB",
      "lines": 6656,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 3.33
    },
    {
      "path": "yarn.lock",
      "bytes": 255070,
      "bytesHuman": "249.1 KB",
      "lines": 5261,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 2.63
    },
    {
      "path": "src-tauri/icons_mac/icon.icns",
      "bytes": 226439,
      "bytesHuman": "221.1 KB",
      "lines": 739,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.37
    },
    {
      "path": "src-tauri/Cargo.lock",
      "bytes": 209404,
      "bytesHuman": "204.5 KB",
      "lines": 8632,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 4.32
    },
    {
      "path": "public/worker.min.js",
      "bytes": 126321,
      "bytesHuman": "123.4 KB",
      "lines": 2,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0
    },
    {
      "path": "src-tauri/resources/ocr-x86_64-apple-darwin",
      "bytes": 116944,
      "bytesHuman": "114.2 KB",
      "lines": 130,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.07
    },
    {
      "path": "src-tauri/resources/ocr-aarch64-apple-darwin",
      "bytes": 112496,
      "bytesHuman": "109.9 KB",
      "lines": 114,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.06
    },
    {
      "path": "public/logo/ollama.png",
      "bytes": 92041,
      "bytesHuman": "89.9 KB",
      "lines": 293,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.15
    },
    {
      "path": "asset/header.png",
      "bytes": 89905,
      "bytesHuman": "87.8 KB",
      "lines": 305,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.15
    },
    {
      "path": "public/logo/eudic.png",
      "bytes": 65381,
      "bytesHuman": "63.8 KB",
      "lines": 214,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.11
    },
    {
      "path": "public/icon.png",
      "bytes": 59964,
      "bytesHuman": "58.6 KB",
      "lines": 98,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.05
    },
    {
      "path": "src-tauri/icons/icon.png",
      "bytes": 59198,
      "bytesHuman": "57.8 KB",
      "lines": 201,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.1
    },
    {
      "path": "src-tauri/icons_mac/tray.ico",
      "bytes": 51016,
      "bytesHuman": "49.8 KB",
      "lines": 186,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.09
    },
    {
      "path": "public/logo/Linux.svg",
      "bytes": 49982,
      "bytesHuman": "48.8 KB",
      "lines": 437,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.22
    },
    {
      "path": ".scripts/popclip/Pot.png",
      "bytes": 49405,
      "bytesHuman": "48.2 KB",
      "lines": 172,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.09
    },
    {
      "path": ".scripts/snipdo/pot.png",
      "bytes": 49405,
      "bytesHuman": "48.2 KB",
      "lines": 172,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.09
    },
    {
      "path": "asset/2.png",
      "bytes": 48782,
      "bytesHuman": "47.6 KB",
      "lines": 172,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.09
    },
    {
      "path": "src-tauri/icons_mac/icon.png",
      "bytes": 47683,
      "bytesHuman": "46.6 KB",
      "lines": 165,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.08
    },
    {
      "path": "src-tauri/icons/icon.ico",
      "bytes": 42612,
      "bytesHuman": "41.6 KB",
      "lines": 182,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.09
    },
    {
      "path": "public/logo/tencent.svg",
      "bytes": 42313,
      "bytesHuman": "41.3 KB",
      "lines": 548,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.27
    },
    {
      "path": "src-tauri/icons_mac/icon.ico",
      "bytes": 35828,
      "bytesHuman": "35.0 KB",
      "lines": 163,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.08
    },
    {
      "path": "src-tauri/icons/icon_mac.ico",
      "bytes": 35828,
      "bytesHuman": "35.0 KB",
      "lines": 163,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.08
    },
    {
      "path": "src-tauri/icons/Square310x310Logo.png",
      "bytes": 31718,
      "bytesHuman": "31.0 KB",
      "lines": 137,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.07
    },
    {
      "path": "src-tauri/icons/Square284x284Logo.png",
      "bytes": 28939,
      "bytesHuman": "28.3 KB",
      "lines": 106,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.05
    },
    {
      "path": "src-tauri/src/tray.rs",
      "bytes": 27079,
      "bytesHuman": "26.4 KB",
      "lines": 633,
      "type": ".rust",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.32
    },
    {
      "path": "src-tauri/icons_mac/Square310x310Logo.png",
      "bytes": 26842,
      "bytesHuman": "26.2 KB",
      "lines": 138,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.07
    },
    {
      "path": "public/logo/tencent_cloud.png",
      "bytes": 26245,
      "bytesHuman": "25.6 KB",
      "lines": 227,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.11
    },
    {
      "path": "src-tauri/icons/128x128@2x.png",
      "bytes": 25218,
      "bytesHuman": "24.6 KB",
      "lines": 109,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.05
    },
    {
      "path": "src-tauri/icons_mac/Square284x284Logo.png",
      "bytes": 23789,
      "bytesHuman": "23.2 KB",
      "lines": 96,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.05
    },
    {
      "path": "docs/data.js",
      "bytes": 22241,
      "bytesHuman": "21.7 KB",
      "lines": 251,
      "type": ".js",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.13
    },
    {
      "path": "src-tauri/icons_mac/128x128@2x.png",
      "bytes": 21497,
      "bytesHuman": "21.0 KB",
      "lines": 94,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.05
    },
    {
      "path": "public/logo/chatglm.png",
      "bytes": 21165,
      "bytesHuman": "20.7 KB",
      "lines": 167,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.08
    },
    {
      "path": "public/logo/geminipro.webp",
      "bytes": 20766,
      "bytesHuman": "20.3 KB",
      "lines": 86,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.04
    },
    {
      "path": "public/logo/paddle.png",
      "bytes": 19316,
      "bytesHuman": "18.9 KB",
      "lines": 74,
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
      "path": "src-tauri/icons/Square150x150Logo.png",
      "bytes": 14042,
      "bytesHuman": "13.7 KB",
      "lines": 58,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.03
    },
    {
      "path": "src-tauri/icons/Square142x142Logo.png",
      "bytes": 13442,
      "bytesHuman": "13.1 KB",
      "lines": 68,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.03
    },
    {
      "path": "com.pot_app.pot.metainfo.xml",
      "bytes": 12978,
      "bytesHuman": "12.7 KB",
      "lines": 237,
      "type": ".other",
      "fanIn": 0,
      "fanOut": 0,
      "maxDepth": 0,
      "score": 0.12
    }
  ],
  "depthStats": {
    "max": 2,
    "mean": 1.34,
    "median": 1,
    "p90": 2,
    "filesAtMax": 40
  },
  "depthRanking": [
    {
      "path": "src/hooks/index.jsx",
      "bytes": 157,
      "bytesHuman": "157 B",
      "lines": 5,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 0,
      "fanOut": 5
    },
    {
      "path": "src/main.jsx",
      "bytes": 817,
      "bytesHuman": "817 B",
      "lines": 28,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 0,
      "fanOut": 3
    },
    {
      "path": "src/services/collection/anki/Config.jsx",
      "bytes": 4508,
      "bytesHuman": "4.4 KB",
      "lines": 110,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 2
    },
    {
      "path": "src/services/collection/eudic/Config.jsx",
      "bytes": 5425,
      "bytesHuman": "5.3 KB",
      "lines": 131,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 2
    },
    {
      "path": "src/services/recognize/baidu_accurate/Config.jsx",
      "bytes": 6148,
      "bytesHuman": "6.0 KB",
      "lines": 131,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/services/recognize/baidu_img/Config.jsx",
      "bytes": 6093,
      "bytesHuman": "6.0 KB",
      "lines": 131,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/services/recognize/baidu/Config.jsx",
      "bytes": 6121,
      "bytesHuman": "6.0 KB",
      "lines": 131,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/services/recognize/iflytek_intsig/Config.jsx",
      "bytes": 7010,
      "bytesHuman": "6.8 KB",
      "lines": 152,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/services/recognize/iflytek_latex/Config.jsx",
      "bytes": 7006,
      "bytesHuman": "6.8 KB",
      "lines": 152,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/services/recognize/iflytek/Config.jsx",
      "bytes": 6982,
      "bytesHuman": "6.8 KB",
      "lines": 152,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/services/recognize/simple_latex/Config.jsx",
      "bytes": 5267,
      "bytesHuman": "5.1 KB",
      "lines": 112,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/services/recognize/system/index.jsx",
      "bytes": 2962,
      "bytesHuman": "2.9 KB",
      "lines": 111,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 0,
      "fanOut": 4
    },
    {
      "path": "src/services/recognize/tencent_accurate/Config.jsx",
      "bytes": 6170,
      "bytesHuman": "6.0 KB",
      "lines": 132,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/services/recognize/tencent_img/Config.jsx",
      "bytes": 6159,
      "bytesHuman": "6.0 KB",
      "lines": 132,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/services/recognize/tencent/Config.jsx",
      "bytes": 6204,
      "bytesHuman": "6.1 KB",
      "lines": 134,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/services/recognize/volcengine_multi_lang/Config.jsx",
      "bytes": 6156,
      "bytesHuman": "6.0 KB",
      "lines": 132,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/services/recognize/volcengine/Config.jsx",
      "bytes": 6123,
      "bytesHuman": "6.0 KB",
      "lines": 132,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/services/translate/alibaba/Config.jsx",
      "bytes": 5078,
      "bytesHuman": "5.0 KB",
      "lines": 128,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/services/translate/baidu_field/Config.jsx",
      "bytes": 6773,
      "bytesHuman": "6.6 KB",
      "lines": 173,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    },
    {
      "path": "src/services/translate/baidu/Config.jsx",
      "bytes": 5002,
      "bytesHuman": "4.9 KB",
      "lines": 128,
      "type": ".jsx",
      "maxDepth": 2,
      "fanIn": 1,
      "fanOut": 3
    }
  ],
  "cycles": [
    {
      "severity": "warning",
      "path": "src/services/collection/anki/Config.jsx → src/services/collection/anki/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/collection/anki/index.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/collection/eudic/Config.jsx → src/services/collection/eudic/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/collection/eudic/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/recognize/baidu_accurate/Config.jsx → src/services/recognize/baidu_accurate/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/recognize/baidu_accurate/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/recognize/baidu_img/Config.jsx → src/services/recognize/baidu_img/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/recognize/baidu_img/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/recognize/baidu/Config.jsx → src/services/recognize/baidu/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/recognize/baidu/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/recognize/iflytek_intsig/Config.jsx → src/services/recognize/iflytek_intsig/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/recognize/iflytek_intsig/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/recognize/iflytek_latex/Config.jsx → src/services/recognize/iflytek_latex/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/recognize/iflytek_latex/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/recognize/iflytek/Config.jsx → src/services/recognize/iflytek/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/recognize/iflytek/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/recognize/simple_latex/Config.jsx → src/services/recognize/simple_latex/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/recognize/simple_latex/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/recognize/tencent_accurate/Config.jsx → src/services/recognize/tencent_accurate/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/recognize/tencent_accurate/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/recognize/tencent_img/Config.jsx → src/services/recognize/tencent_img/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/recognize/tencent_img/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/recognize/tencent/Config.jsx → src/services/recognize/tencent/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/recognize/tencent/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/recognize/volcengine_multi_lang/Config.jsx → src/services/recognize/volcengine_multi_lang/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/recognize/volcengine_multi_lang/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/recognize/volcengine/Config.jsx → src/services/recognize/volcengine/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/recognize/volcengine/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/alibaba/Config.jsx → src/services/translate/alibaba/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/alibaba/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/baidu_field/Config.jsx → src/services/translate/baidu_field/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/baidu_field/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/baidu/Config.jsx → src/services/translate/baidu/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/baidu/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/caiyun/Config.jsx → src/services/translate/caiyun/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/caiyun/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/chatglm/Config.jsx → src/services/translate/chatglm/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/chatglm/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/deepl/Config.jsx → src/services/translate/deepl/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/deepl/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/geminipro/Config.jsx → src/services/translate/geminipro/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/geminipro/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/google/Config.jsx → src/services/translate/google/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/google/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/niutrans/Config.jsx → src/services/translate/niutrans/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/niutrans/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/ollama/Config.jsx → src/services/translate/ollama/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/ollama/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/openai/Config.jsx → src/services/translate/openai/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/openai/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/tencent/Config.jsx → src/services/translate/tencent/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/tencent/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/transmart/Config.jsx → src/services/translate/transmart/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/transmart/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/volcengine/Config.jsx → src/services/translate/volcengine/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/volcengine/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/translate/youdao/Config.jsx → src/services/translate/youdao/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/translate/youdao/Config.jsx to break the cycle"
    },
    {
      "severity": "warning",
      "path": "src/services/tts/lingva/Config.jsx → src/services/tts/lingva/index.jsx",
      "length": 2,
      "suggestedFix": "Break edge from src/services/tts/lingva/Config.jsx to break the cycle"
    }
  ],
  "freshness": [
    {
      "path": ".gitignore",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 22
    },
    {
      "path": ".node-version",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 0
    },
    {
      "path": ".npmrc",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 4
    },
    {
      "path": ".prettierignore",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 6
    },
    {
      "path": ".prettierrc.json",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 21
    },
    {
      "path": ".scripts/popclip/build.sh",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 7
    },
    {
      "path": ".scripts/popclip/Config.plist",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 35
    },
    {
      "path": ".scripts/popclip/Pot.png",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 172
    },
    {
      "path": ".scripts/popclip/Pot.sh",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 8
    },
    {
      "path": ".scripts/snipdo/build.sh",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 0
    },
    {
      "path": ".scripts/snipdo/pot.json",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 12
    },
    {
      "path": ".scripts/snipdo/pot.png",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 172
    },
    {
      "path": ".scripts/snipdo/pot.ps1",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 7
    },
    {
      "path": "asset/1.png",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 210
    },
    {
      "path": "asset/2.png",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 172
    },
    {
      "path": "asset/3.png",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 114
    },
    {
      "path": "asset/eg1.gif",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 2396
    },
    {
      "path": "asset/eg2.gif",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 4388
    },
    {
      "path": "asset/eg3.gif",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 6884
    },
    {
      "path": "asset/eg4.gif",
      "ageDays": 1,
      "lastModified": "2026-07-14",
      "lastModifiedHuman": "2026-07-14",
      "type": ".other",
      "lines": 6792
    }
  ],
  "freshnessBuckets": [
    {
      "bucket": "<30d",
      "count": 341,
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
    "asOf": 1784105265,
    "asOfHuman": "2026-07-15",
    "maxAge": 1,
    "median": 1,
    "p90": 1,
    "staleCount": 0,
    "criticalCount": 0
  },
  "records": [
    {
      "path": ".gitignore",
      "bytes": 218,
      "lines": 22,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": ".node-version",
      "bytes": 2,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": ".npmrc",
      "bytes": 98,
      "lines": 4,
      "type": "other",
      "lastModified": 1784006251,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": ".prettierignore",
      "bytes": 46,
      "lines": 6,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": ".prettierrc.json",
      "bytes": 547,
      "lines": 21,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": ".scripts/popclip/build.sh",
      "bytes": 181,
      "lines": 7,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": ".scripts/popclip/Config.plist",
      "bytes": 1196,
      "lines": 35,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": ".scripts/popclip/Pot.png",
      "bytes": 49405,
      "lines": 172,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": ".scripts/popclip/Pot.sh",
      "bytes": 174,
      "lines": 8,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": ".scripts/snipdo/build.sh",
      "bytes": 37,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": ".scripts/snipdo/pot.json",
      "bytes": 263,
      "lines": 12,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": ".scripts/snipdo/pot.png",
      "bytes": 49405,
      "lines": 172,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": ".scripts/snipdo/pot.ps1",
      "bytes": 177,
      "lines": 7,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "asset/1.png",
      "bytes": 1108203,
      "lines": 210,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "asset/2.png",
      "bytes": 48782,
      "lines": 172,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "asset/3.png",
      "bytes": 1108203,
      "lines": 114,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "asset/eg1.gif",
      "bytes": 540046,
      "lines": 2396,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "asset/eg2.gif",
      "bytes": 951922,
      "lines": 4388,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "asset/eg3.gif",
      "bytes": 1390562,
      "lines": 6884,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "asset/eg4.gif",
      "bytes": 1506035,
      "lines": 6792,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "asset/eg5.gif",
      "bytes": 291373,
      "lines": 1425,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "asset/eg6.gif",
      "bytes": 650295,
      "lines": 3089,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "asset/header.png",
      "bytes": 89905,
      "lines": 305,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "CHANGELOG",
      "bytes": 140,
      "lines": 10,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "CLAUDE.md",
      "bytes": 6602,
      "lines": 135,
      "type": "other",
      "lastModified": 1784101511,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "com.pot_app.pot.metainfo.xml",
      "bytes": 12978,
      "lines": 237,
      "type": "other",
      "lastModified": 1783994494,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "daemon.html",
      "bytes": 280,
      "lines": 16,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "docs/arch/scene-1-module-location/index.md",
      "bytes": 5816,
      "lines": 110,
      "type": "other",
      "lastModified": 1784101641,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/arch/scene-2-data-flow-tracing/index.md",
      "bytes": 7162,
      "lines": 140,
      "type": "other",
      "lastModified": 1784101666,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/arch/scene-3-newcomer-onboarding/index.md",
      "bytes": 6767,
      "lines": 124,
      "type": "other",
      "lastModified": 1784101695,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/arch/scene-4-dependency-change-impact/index.md",
      "bytes": 9150,
      "lines": 170,
      "type": "other",
      "lastModified": 1784101738,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/arch/scene-5-trust-boundary-security-surface/index.md",
      "bytes": 12605,
      "lines": 239,
      "type": "other",
      "lastModified": 1784101792,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/data.js",
      "bytes": 22241,
      "lines": 251,
      "type": "js",
      "lastModified": 1784104236,
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
      "lastModified": 1784101566,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/index.html",
      "bytes": 5622,
      "lines": 148,
      "type": "other",
      "lastModified": 1784101551,
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
      "lastModified": 1784101566,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/self-test/scene-1-post-init-full-self-check/index.md",
      "bytes": 5991,
      "lines": 128,
      "type": "other",
      "lastModified": 1784101823,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/self-test/scene-2-pre-commit-incremental-self-check/index.md",
      "bytes": 6294,
      "lines": 132,
      "type": "other",
      "lastModified": 1784101852,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/self-test/scene-3-doc-code-consistency/index.md",
      "bytes": 7750,
      "lines": 133,
      "type": "other",
      "lastModified": 1784101887,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/self-test/scene-4-security-surface-regression/index.md",
      "bytes": 7608,
      "lines": 139,
      "type": "other",
      "lastModified": 1784101921,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/self-test/scene-5-cross-story-integration-regression/index.md",
      "bytes": 7930,
      "lines": 140,
      "type": "other",
      "lastModified": 1784101957,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/self-test/scene-6-third-party-framework-service/index.md",
      "bytes": 9066,
      "lines": 176,
      "type": "other",
      "lastModified": 1784101995,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "docs/verify-result.json",
      "bytes": 1197,
      "lines": 18,
      "type": "other",
      "lastModified": 1784102041,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "index.html",
      "bytes": 549,
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
      "path": "package.json",
      "bytes": 1997,
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
      "path": "patches/hyprland.patch",
      "bytes": 1091,
      "lines": 38,
      "type": "other",
      "lastModified": 1783994494,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "pnpm-lock.yaml",
      "bytes": 287880,
      "lines": 6656,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "postcss.config.js",
      "bytes": 93,
      "lines": 6,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/icon.png",
      "bytes": 59964,
      "lines": 98,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/icon.svg",
      "bytes": 1947,
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
      "path": "public/logo/alibaba.svg",
      "bytes": 2751,
      "lines": 34,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/anki.svg",
      "bytes": 3223,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/baidu.svg",
      "bytes": 2780,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/bing.svg",
      "bytes": 1717,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/caiyun.svg",
      "bytes": 4996,
      "lines": 63,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/cambridge_dict.svg",
      "bytes": 9284,
      "lines": 119,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/chatglm.png",
      "bytes": 21165,
      "lines": 167,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/Darwin.svg",
      "bytes": 1094,
      "lines": 8,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/deepl.svg",
      "bytes": 1652,
      "lines": 10,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/ecdict.svg",
      "bytes": 1456,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/eudic.png",
      "bytes": 65381,
      "lines": 214,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/geminipro.webp",
      "bytes": 20766,
      "lines": 86,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/google.svg",
      "bytes": 1821,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/iflytek.png",
      "bytes": 7894,
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
      "path": "public/logo/lingva.svg",
      "bytes": 9378,
      "lines": 188,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/Linux.svg",
      "bytes": 49982,
      "lines": 437,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/niutrans.svg",
      "bytes": 8027,
      "lines": 102,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/ollama.png",
      "bytes": 92041,
      "lines": 293,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/openai.svg",
      "bytes": 2667,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/paddle.png",
      "bytes": 19316,
      "lines": 74,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/qrcode.svg",
      "bytes": 3208,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/simple_latex.png",
      "bytes": 651647,
      "lines": 2287,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/tencent_cloud.png",
      "bytes": 26245,
      "lines": 227,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/tencent.svg",
      "bytes": 42313,
      "lines": 548,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/tesseract.png",
      "bytes": 8653,
      "lines": 45,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/transmart.svg",
      "bytes": 7245,
      "lines": 92,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/volcengine.svg",
      "bytes": 7817,
      "lines": 100,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/Windows_NT.svg",
      "bytes": 180,
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
      "path": "public/logo/yandex.svg",
      "bytes": 639804,
      "lines": 8307,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/logo/youdao.svg",
      "bytes": 4694,
      "lines": 0,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/tesseract-core-simd-lstm.wasm.js",
      "bytes": 3938114,
      "lines": 281,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "public/worker.min.js",
      "bytes": 126321,
      "lines": 2,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "README.md",
      "bytes": 7790,
      "lines": 158,
      "type": "other",
      "lastModified": 1784101535,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "src-tauri/.gitignore",
      "bytes": 74,
      "lines": 4,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/build.rs",
      "bytes": 39,
      "lines": 3,
      "type": "rust",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/Cargo.lock",
      "bytes": 209404,
      "lines": 8632,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/Cargo.toml",
      "bytes": 2548,
      "lines": 58,
      "type": "other",
      "lastModified": 1784006588,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/128x128.png",
      "bytes": 10479,
      "lines": 64,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/128x128@2x.png",
      "bytes": 21497,
      "lines": 94,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/32x32.png",
      "bytes": 1967,
      "lines": 8,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/icon.icns",
      "bytes": 226439,
      "lines": 739,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/icon.ico",
      "bytes": 35828,
      "lines": 163,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/icon.png",
      "bytes": 47683,
      "lines": 165,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/Square107x107Logo.png",
      "bytes": 8651,
      "lines": 31,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/Square142x142Logo.png",
      "bytes": 11469,
      "lines": 43,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/Square150x150Logo.png",
      "bytes": 12309,
      "lines": 64,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/Square284x284Logo.png",
      "bytes": 23789,
      "lines": 96,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/Square30x30Logo.png",
      "bytes": 1893,
      "lines": 10,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/Square310x310Logo.png",
      "bytes": 26842,
      "lines": 138,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/Square44x44Logo.png",
      "bytes": 2922,
      "lines": 9,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/Square71x71Logo.png",
      "bytes": 5339,
      "lines": 12,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/Square89x89Logo.png",
      "bytes": 7112,
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
      "path": "src-tauri/icons_mac/StoreLogo.png",
      "bytes": 3679,
      "lines": 18,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons_mac/tray.ico",
      "bytes": 51016,
      "lines": 186,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/128x128.png",
      "bytes": 12084,
      "lines": 45,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/128x128@2x.png",
      "bytes": 25218,
      "lines": 109,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/32x32.png",
      "bytes": 2400,
      "lines": 17,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/icon_mac.ico",
      "bytes": 35828,
      "lines": 163,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/icon.icns",
      "bytes": 357142,
      "lines": 1111,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/icon.ico",
      "bytes": 42612,
      "lines": 182,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/icon.png",
      "bytes": 59198,
      "lines": 201,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/Square107x107Logo.png",
      "bytes": 10000,
      "lines": 59,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/Square142x142Logo.png",
      "bytes": 13442,
      "lines": 68,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/Square150x150Logo.png",
      "bytes": 14042,
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
      "path": "src-tauri/icons/Square284x284Logo.png",
      "bytes": 28939,
      "lines": 106,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/Square30x30Logo.png",
      "bytes": 2150,
      "lines": 12,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/Square310x310Logo.png",
      "bytes": 31718,
      "lines": 137,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/Square44x44Logo.png",
      "bytes": 3578,
      "lines": 20,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/Square71x71Logo.png",
      "bytes": 6510,
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
      "path": "src-tauri/icons/Square89x89Logo.png",
      "bytes": 8280,
      "lines": 43,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/icons/StoreLogo.png",
      "bytes": 4268,
      "lines": 14,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/resources/ocr-aarch64-apple-darwin",
      "bytes": 112496,
      "lines": 114,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/resources/ocr-x86_64-apple-darwin",
      "bytes": 116944,
      "lines": 130,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/src/backup.rs",
      "bytes": 8029,
      "lines": 209,
      "type": "rust",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 8,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/src/clipboard.rs",
      "bytes": 1224,
      "lines": 33,
      "type": "rust",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/src/cmd.rs",
      "bytes": 7288,
      "lines": 225,
      "type": "rust",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 22,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/src/config.rs",
      "bytes": 6131,
      "lines": 188,
      "type": "rust",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 7,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/src/error.rs",
      "bytes": 1284,
      "lines": 40,
      "type": "rust",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/src/hotkey.rs",
      "bytes": 3073,
      "lines": 98,
      "type": "rust",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 5,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/src/lang_detect.rs",
      "bytes": 2794,
      "lines": 86,
      "type": "rust",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/src/main.rs",
      "bytes": 5234,
      "lines": 161,
      "type": "rust",
      "lastModified": 1783993940,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 19,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/src/screenshot.rs",
      "bytes": 1102,
      "lines": 30,
      "type": "rust",
      "lastModified": 1783993941,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 5,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/src/server.rs",
      "bytes": 2821,
      "lines": 95,
      "type": "rust",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 6,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/src/system_ocr.rs",
      "bytes": 4836,
      "lines": 151,
      "type": "rust",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 6,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/src/tray.rs",
      "bytes": 27079,
      "lines": 633,
      "type": "rust",
      "lastModified": 1784105265,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 16,
      "maxDepth": 0,
      "ageDays": 0
    },
    {
      "path": "src-tauri/src/updater.rs",
      "bytes": 818,
      "lines": 28,
      "type": "rust",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/src/window.rs",
      "bytes": 12933,
      "lines": 411,
      "type": "rust",
      "lastModified": 1783993941,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 15,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/tauri.conf.json",
      "bytes": 4110,
      "lines": 132,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/tauri.linux.conf.json",
      "bytes": 136,
      "lines": 8,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/tauri.macos.conf.json",
      "bytes": 478,
      "lines": 19,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src-tauri/tauri.windows.conf.json",
      "bytes": 798,
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
      "path": "src-tauri/webview.arm64.json",
      "bytes": 1489,
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
      "path": "src-tauri/webview.x64.json",
      "bytes": 1487,
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
      "path": "src-tauri/webview.x86.json",
      "bytes": 1487,
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
      "path": "src/App.jsx",
      "bytes": 4122,
      "lines": 117,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 14,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/components/WindowControl/index.jsx",
      "bytes": 1907,
      "lines": 57,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 5,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/components/WindowControl/style.css",
      "bytes": 66,
      "lines": 3,
      "type": "css",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/hooks/index.jsx",
      "bytes": 157,
      "lines": 5,
      "type": "jsx",
      "lastModified": 1784006090,
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 0,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/hooks/useConfig.jsx",
      "bytes": 1925,
      "lines": 67,
      "type": "jsx",
      "lastModified": 1783994198,
      "fanIn": 32,
      "fanOut": 3,
      "extDeps": 2,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/hooks/useGetState.jsx",
      "bytes": 322,
      "lines": 9,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/hooks/useSyncAtom.jsx",
      "bytes": 364,
      "lines": 12,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/hooks/useToastStyle.jsx",
      "bytes": 510,
      "lines": 14,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/hooks/useTtsPluginInfo.jsx",
      "bytes": 787,
      "lines": 18,
      "type": "jsx",
      "lastModified": 1784006081,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 2,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/hooks/useVoice.jsx",
      "bytes": 897,
      "lines": 28,
      "type": "jsx",
      "lastModified": 1783994198,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/i18n/index.jsx",
      "bytes": 1675,
      "lines": 62,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 19,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/i18n/locales/en_US.json",
      "bytes": 19228,
      "lines": 472,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/i18n/locales/es_ES.json",
      "bytes": 12652,
      "lines": 331,
      "type": "other",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/main.jsx",
      "bytes": 817,
      "lines": 28,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 3,
      "extDeps": 5,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/collection/anki/Config.jsx",
      "bytes": 4508,
      "lines": 110,
      "type": "jsx",
      "lastModified": 1783994198,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 7,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/collection/anki/index.jsx",
      "bytes": 3613,
      "lines": 110,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/collection/anki/info.ts",
      "bytes": 70,
      "lines": 4,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/collection/eudic/Config.jsx",
      "bytes": 5425,
      "lines": 131,
      "type": "jsx",
      "lastModified": 1783994198,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 7,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/collection/eudic/index.jsx",
      "bytes": 1946,
      "lines": 72,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/collection/eudic/info.ts",
      "bytes": 72,
      "lines": 4,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/collection/index.jsx",
      "bytes": 125,
      "lines": 5,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/baidu_accurate/Config.jsx",
      "bytes": 6148,
      "lines": 131,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/baidu_accurate/index.jsx",
      "bytes": 2066,
      "lines": 64,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/baidu_accurate/info.ts",
      "bytes": 482,
      "lines": 28,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/baidu_img/Config.jsx",
      "bytes": 6093,
      "lines": 131,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/baidu_img/index.jsx",
      "bytes": 1826,
      "lines": 61,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 4,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/baidu_img/info.ts",
      "bytes": 446,
      "lines": 28,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/baidu/Config.jsx",
      "bytes": 6121,
      "lines": 131,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/baidu/index.jsx",
      "bytes": 2065,
      "lines": 64,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/baidu/info.ts",
      "bytes": 357,
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
      "path": "src/services/recognize/iflytek_intsig/Config.jsx",
      "bytes": 7010,
      "lines": 152,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/iflytek_intsig/index.jsx",
      "bytes": 2360,
      "lines": 78,
      "type": "jsx",
      "lastModified": 1783994199,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/iflytek_intsig/info.ts",
      "bytes": 441,
      "lines": 27,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/iflytek_latex/Config.jsx",
      "bytes": 7006,
      "lines": 152,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/iflytek_latex/index.jsx",
      "bytes": 2224,
      "lines": 68,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 4,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/iflytek_latex/info.ts",
      "bytes": 189,
      "lines": 11,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/iflytek/Config.jsx",
      "bytes": 6982,
      "lines": 152,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/iflytek/index.jsx",
      "bytes": 3470,
      "lines": 113,
      "type": "jsx",
      "lastModified": 1783994199,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/iflytek/info.ts",
      "bytes": 183,
      "lines": 11,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/index.jsx",
      "bytes": 1445,
      "lines": 31,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 15,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/qrcode/Config.jsx",
      "bytes": 653,
      "lines": 25,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/qrcode/index.jsx",
      "bytes": 1051,
      "lines": 33,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/qrcode/info.ts",
      "bytes": 374,
      "lines": 27,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/simple_latex/Config.jsx",
      "bytes": 5267,
      "lines": 112,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/simple_latex/index.jsx",
      "bytes": 1121,
      "lines": 39,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/simple_latex/info.ts",
      "bytes": 193,
      "lines": 11,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/system/Config.jsx",
      "bytes": 653,
      "lines": 25,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/system/index.jsx",
      "bytes": 2962,
      "lines": 111,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 4,
      "extDeps": 1,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/system/info.ts",
      "bytes": 449,
      "lines": 29,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/tencent_accurate/Config.jsx",
      "bytes": 6170,
      "lines": 132,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/tencent_accurate/index.jsx",
      "bytes": 4052,
      "lines": 126,
      "type": "jsx",
      "lastModified": 1783994235,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 4,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/tencent_accurate/info.ts",
      "bytes": 219,
      "lines": 12,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/tencent_img/Config.jsx",
      "bytes": 6159,
      "lines": 132,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/tencent_img/index.jsx",
      "bytes": 4432,
      "lines": 137,
      "type": "jsx",
      "lastModified": 1783994235,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 5,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/tencent_img/info.ts",
      "bytes": 394,
      "lines": 24,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/tencent/Config.jsx",
      "bytes": 6204,
      "lines": 134,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/tencent/index.jsx",
      "bytes": 4081,
      "lines": 127,
      "type": "jsx",
      "lastModified": 1783994235,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 4,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/tencent/info.ts",
      "bytes": 439,
      "lines": 26,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/tesseract/Config.jsx",
      "bytes": 656,
      "lines": 25,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/tesseract/index.jsx",
      "bytes": 635,
      "lines": 20,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/tesseract/info.ts",
      "bytes": 501,
      "lines": 30,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/volcengine_multi_lang/Config.jsx",
      "bytes": 6156,
      "lines": 132,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/volcengine_multi_lang/index.jsx",
      "bytes": 4682,
      "lines": 143,
      "type": "jsx",
      "lastModified": 1783994255,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/volcengine_multi_lang/info.ts",
      "bytes": 451,
      "lines": 27,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/volcengine/Config.jsx",
      "bytes": 6123,
      "lines": 132,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/volcengine/index.jsx",
      "bytes": 4660,
      "lines": 143,
      "type": "jsx",
      "lastModified": 1783994255,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/recognize/volcengine/info.ts",
      "bytes": 205,
      "lines": 12,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/alibaba/Config.jsx",
      "bytes": 5078,
      "lines": 128,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/alibaba/index.jsx",
      "bytes": 2345,
      "lines": 60,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/alibaba/info.ts",
      "bytes": 672,
      "lines": 37,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/baidu_field/Config.jsx",
      "bytes": 6773,
      "lines": 173,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 10,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/baidu_field/index.jsx",
      "bytes": 1300,
      "lines": 51,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/baidu_field/info.ts",
      "bytes": 634,
      "lines": 37,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/baidu/Config.jsx",
      "bytes": 5002,
      "lines": 128,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/baidu/index.jsx",
      "bytes": 1252,
      "lines": 49,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/baidu/info.ts",
      "bytes": 628,
      "lines": 37,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/bing_dict/Config.jsx",
      "bytes": 692,
      "lines": 26,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/bing_dict/index.jsx",
      "bytes": 2628,
      "lines": 71,
      "type": "jsx",
      "lastModified": 1783994322,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/bing_dict/info.ts",
      "bytes": 180,
      "lines": 11,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/bing/Config.jsx",
      "bytes": 687,
      "lines": 26,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/bing/index.jsx",
      "bytes": 2338,
      "lines": 63,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/bing/info.ts",
      "bytes": 689,
      "lines": 38,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/caiyun/Config.jsx",
      "bytes": 4152,
      "lines": 108,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/caiyun/index.jsx",
      "bytes": 1083,
      "lines": 46,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/caiyun/info.ts",
      "bytes": 185,
      "lines": 12,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/cambridge_dict/Config.jsx",
      "bytes": 697,
      "lines": 26,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/cambridge_dict/index.jsx",
      "bytes": 3671,
      "lines": 100,
      "type": "jsx",
      "lastModified": 1783994322,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/cambridge_dict/info.ts",
      "bytes": 224,
      "lines": 11,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/chatglm/Config.jsx",
      "bytes": 10395,
      "lines": 220,
      "type": "jsx",
      "lastModified": 1783994322,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 11,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/chatglm/index.jsx",
      "bytes": 3237,
      "lines": 102,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/chatglm/info.ts",
      "bytes": 833,
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
      "path": "src/services/translate/deepl/Config.jsx",
      "bytes": 6923,
      "lines": 160,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 10,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/deepl/index.jsx",
      "bytes": 4234,
      "lines": 149,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/deepl/info.ts",
      "bytes": 405,
      "lines": 26,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/ecdict/Config.jsx",
      "bytes": 689,
      "lines": 26,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/ecdict/index.jsx",
      "bytes": 472,
      "lines": 18,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/ecdict/info.ts",
      "bytes": 166,
      "lines": 11,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/geminipro/Config.jsx",
      "bytes": 11606,
      "lines": 263,
      "type": "jsx",
      "lastModified": 1783994322,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 7,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/geminipro/index.jsx",
      "bytes": 4527,
      "lines": 136,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/geminipro/info.ts",
      "bytes": 838,
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
      "path": "src/services/translate/google/Config.jsx",
      "bytes": 3732,
      "lines": 97,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 5,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/google/index.jsx",
      "bytes": 2269,
      "lines": 76,
      "type": "jsx",
      "lastModified": 1783994322,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/google/info.ts",
      "bytes": 642,
      "lines": 37,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/index.jsx",
      "bytes": 1537,
      "lines": 43,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 21,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/lingva/Config.jsx",
      "bytes": 689,
      "lines": 26,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/lingva/index.jsx",
      "bytes": 745,
      "lines": 24,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/lingva/info.ts",
      "bytes": 660,
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
      "path": "src/services/translate/niutrans/Config.jsx",
      "bytes": 4769,
      "lines": 122,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/niutrans/index.jsx",
      "bytes": 975,
      "lines": 37,
      "type": "jsx",
      "lastModified": 1783994322,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/niutrans/info.ts",
      "bytes": 681,
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
      "path": "src/services/translate/ollama/Config.jsx",
      "bytes": 16284,
      "lines": 359,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 8,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/ollama/index.jsx",
      "bytes": 1401,
      "lines": 49,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/ollama/info.ts",
      "bytes": 831,
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
      "path": "src/services/translate/openai/Config.jsx",
      "bytes": 16154,
      "lines": 354,
      "type": "jsx",
      "lastModified": 1783994322,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 11,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/openai/index.jsx",
      "bytes": 5800,
      "lines": 152,
      "type": "jsx",
      "lastModified": 1783994322,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/openai/info.ts",
      "bytes": 831,
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
      "path": "src/services/translate/tencent/Config.jsx",
      "bytes": 4997,
      "lines": 124,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/tencent/index.jsx",
      "bytes": 4013,
      "lines": 125,
      "type": "jsx",
      "lastModified": 1783994322,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 4,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/tencent/info.ts",
      "bytes": 517,
      "lines": 28,
      "type": "ts",
      "lastModified": 1783994322,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/transmart/Config.jsx",
      "bytes": 5026,
      "lines": 128,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/transmart/index.jsx",
      "bytes": 1307,
      "lines": 51,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/transmart/info.ts",
      "bytes": 469,
      "lines": 27,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/volcengine/Config.jsx",
      "bytes": 5023,
      "lines": 128,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/volcengine/index.jsx",
      "bytes": 4441,
      "lines": 143,
      "type": "jsx",
      "lastModified": 1783994322,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/volcengine/info.ts",
      "bytes": 618,
      "lines": 36,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/yandex/Config.jsx",
      "bytes": 689,
      "lines": 26,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/yandex/index.jsx",
      "bytes": 949,
      "lines": 34,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 2,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/yandex/info.ts",
      "bytes": 602,
      "lines": 35,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/youdao/Config.jsx",
      "bytes": 4998,
      "lines": 128,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/youdao/index.jsx",
      "bytes": 3517,
      "lines": 103,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 3,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/translate/youdao/info.ts",
      "bytes": 669,
      "lines": 38,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/tts/index.jsx",
      "bytes": 81,
      "lines": 3,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/services/tts/lingva/Config.jsx",
      "bytes": 4092,
      "lines": 102,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 3,
      "extDeps": 6,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/services/tts/lingva/index.jsx",
      "bytes": 584,
      "lines": 23,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 2,
      "extDeps": 1,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/services/tts/lingva/info.ts",
      "bytes": 584,
      "lines": 37,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/style.css",
      "bytes": 395,
      "lines": 27,
      "type": "css",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/env.js",
      "bytes": 381,
      "lines": 14,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 21,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/index.js",
      "bytes": 197,
      "lines": 7,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/invoke_plugin.js",
      "bytes": 1179,
      "lines": 35,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 4,
      "fanOut": 1,
      "extDeps": 6,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/utils/lang_detect.js",
      "bytes": 8859,
      "lines": 334,
      "type": "js",
      "lastModified": 1783994494,
      "fanIn": 2,
      "fanOut": 1,
      "extDeps": 3,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/utils/language.ts",
      "bytes": 1000,
      "lines": 68,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 6,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/service_instance.ts",
      "bytes": 1745,
      "lines": 50,
      "type": "ts",
      "lastModified": 1783991297,
      "fanIn": 53,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/utils/store.js",
      "bytes": 561,
      "lines": 16,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 8,
      "fanOut": 0,
      "extDeps": 4,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/components/SideBar/index.jsx",
      "bytes": 4372,
      "lines": 123,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 12,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/index.jsx",
      "bytes": 3017,
      "lines": 81,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 9,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/About/index.jsx",
      "bytes": 8721,
      "lines": 200,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 9,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Backup/AliyunModal/index.jsx",
      "bytes": 6522,
      "lines": 142,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 6,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Backup/index.jsx",
      "bytes": 12685,
      "lines": 317,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 4,
      "extDeps": 18,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Backup/utils/aliyun.jsx",
      "bytes": 10264,
      "lines": 331,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Backup/utils/local.jsx",
      "bytes": 953,
      "lines": 43,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Backup/utils/webdav.jsx",
      "bytes": 1081,
      "lines": 47,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 2,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Backup/WebDavModal/index.jsx",
      "bytes": 6569,
      "lines": 141,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 6,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/General/index.jsx",
      "bytes": 31902,
      "lines": 604,
      "type": "jsx",
      "lastModified": 1784104827,
      "fanIn": 0,
      "fanOut": 3,
      "extDeps": 18,
      "maxDepth": 2,
      "ageDays": 0
    },
    {
      "path": "src/window/Config/pages/History/index.jsx",
      "bytes": 21488,
      "lines": 380,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 14,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Hotkey/index.jsx",
      "bytes": 9913,
      "lines": 247,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 10,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Recognize/index.jsx",
      "bytes": 4292,
      "lines": 94,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 11,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Collection/ConfigModal/index.jsx",
      "bytes": 3558,
      "lines": 83,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 5,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Collection/index.jsx",
      "bytes": 6706,
      "lines": 146,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 9,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Collection/SelectModal/index.jsx",
      "bytes": 2737,
      "lines": 61,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 4,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Collection/ServiceItem/index.jsx",
      "bytes": 4002,
      "lines": 98,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 8,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/index.jsx",
      "bytes": 3543,
      "lines": 93,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 11,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/PluginConfig/index.jsx",
      "bytes": 6924,
      "lines": 148,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 9,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Recognize/ConfigModal/index.jsx",
      "bytes": 3843,
      "lines": 90,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 5,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Recognize/index.jsx",
      "bytes": 7093,
      "lines": 158,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 11,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Recognize/SelectModal/index.jsx",
      "bytes": 3059,
      "lines": 66,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 4,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Recognize/ServiceItem/index.jsx",
      "bytes": 4150,
      "lines": 99,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 8,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/SelectPluginModal/index.jsx",
      "bytes": 8007,
      "lines": 151,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 11,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Translate/ConfigModal/index.jsx",
      "bytes": 3536,
      "lines": 79,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 5,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Translate/index.jsx",
      "bytes": 7158,
      "lines": 162,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 11,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Translate/SelectModal/index.jsx",
      "bytes": 2735,
      "lines": 61,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 4,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Translate/ServiceItem/index.jsx",
      "bytes": 4203,
      "lines": 92,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 8,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Tts/ConfigModal/index.jsx",
      "bytes": 3543,
      "lines": 83,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 5,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Tts/index.jsx",
      "bytes": 6975,
      "lines": 155,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 11,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Tts/SelectModal/index.jsx",
      "bytes": 2723,
      "lines": 61,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 4,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Service/Tts/ServiceItem/index.jsx",
      "bytes": 3889,
      "lines": 94,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 8,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/pages/Translate/index.jsx",
      "bytes": 18558,
      "lines": 335,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 11,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/routes/index.jsx",
      "bytes": 1040,
      "lines": 51,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 9,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/window/Config/style.css",
      "bytes": 92,
      "lines": 5,
      "type": "css",
      "lastModified": 1783991297,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/window/Recognize/ControlArea/index.jsx",
      "bytes": 8353,
      "lines": 180,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 3,
      "extDeps": 12,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Recognize/ImageArea/index.jsx",
      "bytes": 2677,
      "lines": 81,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 9,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/window/Recognize/index.jsx",
      "bytes": 6057,
      "lines": 158,
      "type": "jsx",
      "lastModified": 1783994380,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 14,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Recognize/TextArea/index.jsx",
      "bytes": 7862,
      "lines": 189,
      "type": "jsx",
      "lastModified": 1784006355,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 14,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/window/Screenshot/index.jsx",
      "bytes": 4167,
      "lines": 100,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 8,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/window/Translate/components/LanguageArea/index.jsx",
      "bytes": 5748,
      "lines": 128,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 7,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Translate/components/SourceArea/index.jsx",
      "bytes": 13873,
      "lines": 370,
      "type": "jsx",
      "lastModified": 1784006138,
      "fanIn": 0,
      "fanOut": 4,
      "extDeps": 11,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/window/Translate/components/SourceArea/SourceActionBar.jsx",
      "bytes": 3378,
      "lines": 89,
      "type": "jsx",
      "lastModified": 1784005091,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 6,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/window/Translate/components/TargetArea/ActionBar.jsx",
      "bytes": 3584,
      "lines": 101,
      "type": "jsx",
      "lastModified": 1784005871,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 7,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Translate/components/TargetArea/index.jsx",
      "bytes": 17480,
      "lines": 459,
      "type": "jsx",
      "lastModified": 1784006184,
      "fanIn": 0,
      "fanOut": 5,
      "extDeps": 22,
      "maxDepth": 2,
      "ageDays": 1
    },
    {
      "path": "src/window/Translate/components/TargetArea/ResultView.jsx",
      "bytes": 4690,
      "lines": 95,
      "type": "jsx",
      "lastModified": 1784005368,
      "fanIn": 1,
      "fanOut": 0,
      "extDeps": 1,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "src/window/Translate/components/TargetArea/ServiceDropdown.jsx",
      "bytes": 2826,
      "lines": 75,
      "type": "jsx",
      "lastModified": 1784006004,
      "fanIn": 1,
      "fanOut": 1,
      "extDeps": 3,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Translate/index.jsx",
      "bytes": 15384,
      "lines": 345,
      "type": "jsx",
      "lastModified": 1783994380,
      "fanIn": 0,
      "fanOut": 2,
      "extDeps": 15,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "src/window/Updater/index.jsx",
      "bytes": 7735,
      "lines": 188,
      "type": "jsx",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 1,
      "extDeps": 10,
      "maxDepth": 1,
      "ageDays": 1
    },
    {
      "path": "tailwind.config.cjs",
      "bytes": 2619,
      "lines": 76,
      "type": "cjs",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "updater/updater-for-fix-runtime.mjs",
      "bytes": 3048,
      "lines": 81,
      "type": "mjs",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "updater/updater.mjs",
      "bytes": 4347,
      "lines": 93,
      "type": "mjs",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 2,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "vite.config.js",
      "bytes": 1211,
      "lines": 34,
      "type": "js",
      "lastModified": 1783991297,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 3,
      "maxDepth": 0,
      "ageDays": 1
    },
    {
      "path": "yarn.lock",
      "bytes": 255070,
      "lines": 5261,
      "type": "other",
      "lastModified": 1784006413,
      "fanIn": 0,
      "fanOut": 0,
      "extDeps": 0,
      "maxDepth": 0,
      "ageDays": 1
    }
  ],
  "adjacency": {
    "docs/data.js": [],
    "docs/index.css": [],
    "docs/index.js": [],
    "postcss.config.js": [],
    "public/worker.min.js": [],
    "src-tauri/build.rs": [],
    "src-tauri/src/backup.rs": [],
    "src-tauri/src/clipboard.rs": [],
    "src-tauri/src/cmd.rs": [],
    "src-tauri/src/config.rs": [],
    "src-tauri/src/error.rs": [],
    "src-tauri/src/hotkey.rs": [],
    "src-tauri/src/lang_detect.rs": [],
    "src-tauri/src/main.rs": [],
    "src-tauri/src/screenshot.rs": [],
    "src-tauri/src/server.rs": [],
    "src-tauri/src/system_ocr.rs": [],
    "src-tauri/src/tray.rs": [],
    "src-tauri/src/updater.rs": [],
    "src-tauri/src/window.rs": [],
    "src/App.jsx": [
      "src/utils/store.js",
      "src/style.css"
    ],
    "src/components/WindowControl/index.jsx": [
      "src/utils/env.js",
      "src/components/WindowControl/style.css"
    ],
    "src/components/WindowControl/style.css": [],
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
      "src/services/collection/anki/index.jsx"
    ],
    "src/services/collection/anki/index.jsx": [
      "src/utils/store.js",
      "src/services/collection/anki/Config.jsx",
      "src/services/collection/anki/info.ts"
    ],
    "src/services/collection/anki/info.ts": [],
    "src/services/collection/eudic/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/services/collection/eudic/index.jsx"
    ],
    "src/services/collection/eudic/index.jsx": [
      "src/services/collection/eudic/Config.jsx",
      "src/services/collection/eudic/info.ts"
    ],
    "src/services/collection/eudic/info.ts": [],
    "src/services/collection/index.jsx": [],
    "src/services/recognize/baidu_accurate/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/baidu_accurate/index.jsx"
    ],
    "src/services/recognize/baidu_accurate/index.jsx": [
      "src/services/recognize/baidu_accurate/Config.jsx",
      "src/services/recognize/baidu_accurate/info.ts"
    ],
    "src/services/recognize/baidu_accurate/info.ts": [],
    "src/services/recognize/baidu_img/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/baidu_img/index.jsx"
    ],
    "src/services/recognize/baidu_img/index.jsx": [
      "src/services/recognize/baidu_img/Config.jsx",
      "src/services/recognize/baidu_img/info.ts"
    ],
    "src/services/recognize/baidu_img/info.ts": [],
    "src/services/recognize/baidu/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/baidu/index.jsx"
    ],
    "src/services/recognize/baidu/index.jsx": [
      "src/services/recognize/baidu/Config.jsx",
      "src/services/recognize/baidu/info.ts"
    ],
    "src/services/recognize/baidu/info.ts": [],
    "src/services/recognize/iflytek_intsig/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/iflytek_intsig/index.jsx"
    ],
    "src/services/recognize/iflytek_intsig/index.jsx": [
      "src/services/recognize/iflytek_intsig/Config.jsx",
      "src/services/recognize/iflytek_intsig/info.ts"
    ],
    "src/services/recognize/iflytek_intsig/info.ts": [],
    "src/services/recognize/iflytek_latex/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/iflytek_latex/index.jsx"
    ],
    "src/services/recognize/iflytek_latex/index.jsx": [
      "src/services/recognize/iflytek_latex/Config.jsx",
      "src/services/recognize/iflytek_latex/info.ts"
    ],
    "src/services/recognize/iflytek_latex/info.ts": [],
    "src/services/recognize/iflytek/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/iflytek/index.jsx"
    ],
    "src/services/recognize/iflytek/index.jsx": [
      "src/services/recognize/iflytek/Config.jsx",
      "src/services/recognize/iflytek/info.ts"
    ],
    "src/services/recognize/iflytek/info.ts": [],
    "src/services/recognize/index.jsx": [],
    "src/services/recognize/qrcode/Config.jsx": [],
    "src/services/recognize/qrcode/index.jsx": [
      "src/services/recognize/qrcode/Config.jsx",
      "src/services/recognize/qrcode/info.ts"
    ],
    "src/services/recognize/qrcode/info.ts": [],
    "src/services/recognize/simple_latex/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/simple_latex/index.jsx"
    ],
    "src/services/recognize/simple_latex/index.jsx": [
      "src/services/recognize/simple_latex/Config.jsx",
      "src/services/recognize/simple_latex/info.ts"
    ],
    "src/services/recognize/simple_latex/info.ts": [],
    "src/services/recognize/system/Config.jsx": [],
    "src/services/recognize/system/index.jsx": [
      "src/utils/lang_detect.js",
      "src/utils/env.js",
      "src/services/recognize/system/info.ts",
      "src/services/recognize/system/Config.jsx"
    ],
    "src/services/recognize/system/info.ts": [],
    "src/services/recognize/tencent_accurate/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/tencent_accurate/index.jsx"
    ],
    "src/services/recognize/tencent_accurate/index.jsx": [
      "src/services/recognize/tencent_accurate/Config.jsx",
      "src/services/recognize/tencent_accurate/info.ts"
    ],
    "src/services/recognize/tencent_accurate/info.ts": [],
    "src/services/recognize/tencent_img/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/tencent_img/index.jsx"
    ],
    "src/services/recognize/tencent_img/index.jsx": [
      "src/services/recognize/tencent_img/Config.jsx",
      "src/services/recognize/tencent_img/info.ts"
    ],
    "src/services/recognize/tencent_img/info.ts": [],
    "src/services/recognize/tencent/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/tencent/index.jsx"
    ],
    "src/services/recognize/tencent/index.jsx": [
      "src/services/recognize/tencent/Config.jsx",
      "src/services/recognize/tencent/info.ts"
    ],
    "src/services/recognize/tencent/info.ts": [],
    "src/services/recognize/tesseract/Config.jsx": [],
    "src/services/recognize/tesseract/index.jsx": [
      "src/services/recognize/tesseract/info.ts",
      "src/services/recognize/tesseract/Config.jsx"
    ],
    "src/services/recognize/tesseract/info.ts": [],
    "src/services/recognize/volcengine_multi_lang/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/volcengine_multi_lang/index.jsx"
    ],
    "src/services/recognize/volcengine_multi_lang/index.jsx": [
      "src/services/recognize/volcengine_multi_lang/Config.jsx",
      "src/services/recognize/volcengine_multi_lang/info.ts"
    ],
    "src/services/recognize/volcengine_multi_lang/info.ts": [],
    "src/services/recognize/volcengine/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/recognize/volcengine/index.jsx"
    ],
    "src/services/recognize/volcengine/index.jsx": [
      "src/services/recognize/volcengine/Config.jsx",
      "src/services/recognize/volcengine/info.ts"
    ],
    "src/services/recognize/volcengine/info.ts": [],
    "src/services/translate/alibaba/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/translate/alibaba/index.jsx"
    ],
    "src/services/translate/alibaba/index.jsx": [
      "src/services/translate/alibaba/Config.jsx",
      "src/services/translate/alibaba/info.ts"
    ],
    "src/services/translate/alibaba/info.ts": [],
    "src/services/translate/baidu_field/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/translate/baidu_field/index.jsx"
    ],
    "src/services/translate/baidu_field/index.jsx": [
      "src/services/translate/baidu_field/Config.jsx",
      "src/services/translate/baidu_field/info.ts"
    ],
    "src/services/translate/baidu_field/info.ts": [],
    "src/services/translate/baidu/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/translate/baidu/index.jsx"
    ],
    "src/services/translate/baidu/index.jsx": [
      "src/services/translate/baidu/Config.jsx",
      "src/services/translate/baidu/info.ts"
    ],
    "src/services/translate/baidu/info.ts": [],
    "src/services/translate/bing_dict/Config.jsx": [],
    "src/services/translate/bing_dict/index.jsx": [
      "src/services/translate/bing_dict/Config.jsx",
      "src/services/translate/bing_dict/info.ts"
    ],
    "src/services/translate/bing_dict/info.ts": [],
    "src/services/translate/bing/Config.jsx": [],
    "src/services/translate/bing/index.jsx": [
      "src/services/translate/bing/Config.jsx",
      "src/services/translate/bing/info.ts"
    ],
    "src/services/translate/bing/info.ts": [],
    "src/services/translate/caiyun/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/translate/caiyun/index.jsx"
    ],
    "src/services/translate/caiyun/index.jsx": [
      "src/services/translate/caiyun/Config.jsx",
      "src/services/translate/caiyun/info.ts"
    ],
    "src/services/translate/caiyun/info.ts": [],
    "src/services/translate/cambridge_dict/Config.jsx": [],
    "src/services/translate/cambridge_dict/index.jsx": [
      "src/services/translate/cambridge_dict/info.ts",
      "src/services/translate/cambridge_dict/Config.jsx"
    ],
    "src/services/translate/cambridge_dict/info.ts": [],
    "src/services/translate/chatglm/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/translate/chatglm/index.jsx"
    ],
    "src/services/translate/chatglm/index.jsx": [
      "src/services/translate/chatglm/info.ts",
      "src/services/translate/chatglm/Config.jsx"
    ],
    "src/services/translate/chatglm/info.ts": [],
    "src/services/translate/deepl/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/translate/deepl/index.jsx"
    ],
    "src/services/translate/deepl/index.jsx": [
      "src/services/translate/deepl/Config.jsx",
      "src/services/translate/deepl/info.ts"
    ],
    "src/services/translate/deepl/info.ts": [],
    "src/services/translate/ecdict/Config.jsx": [],
    "src/services/translate/ecdict/index.jsx": [
      "src/services/translate/ecdict/Config.jsx",
      "src/services/translate/ecdict/info.ts"
    ],
    "src/services/translate/ecdict/info.ts": [],
    "src/services/translate/geminipro/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/translate/geminipro/index.jsx"
    ],
    "src/services/translate/geminipro/index.jsx": [
      "src/services/translate/geminipro/info.ts",
      "src/services/translate/geminipro/Config.jsx"
    ],
    "src/services/translate/geminipro/info.ts": [],
    "src/services/translate/google/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/translate/google/index.jsx"
    ],
    "src/services/translate/google/index.jsx": [
      "src/services/translate/google/Config.jsx",
      "src/services/translate/google/info.ts"
    ],
    "src/services/translate/google/info.ts": [],
    "src/services/translate/index.jsx": [],
    "src/services/translate/lingva/Config.jsx": [],
    "src/services/translate/lingva/index.jsx": [
      "src/services/translate/lingva/Config.jsx",
      "src/services/translate/lingva/info.ts"
    ],
    "src/services/translate/lingva/info.ts": [],
    "src/services/translate/niutrans/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/translate/niutrans/index.jsx"
    ],
    "src/services/translate/niutrans/index.jsx": [
      "src/services/translate/niutrans/Config.jsx",
      "src/services/translate/niutrans/info.ts"
    ],
    "src/services/translate/niutrans/info.ts": [],
    "src/services/translate/ollama/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/translate/ollama/index.jsx"
    ],
    "src/services/translate/ollama/index.jsx": [
      "src/services/translate/ollama/info.ts",
      "src/services/translate/ollama/Config.jsx"
    ],
    "src/services/translate/ollama/info.ts": [],
    "src/services/translate/openai/Config.jsx": [
      "src/hooks/useConfig.jsx",
      "src/services/translate/openai/index.jsx",
      "src/utils/service_instance.ts"
    ],
    "src/services/translate/openai/index.jsx": [
      "src/services/translate/openai/info.ts",
      "src/services/translate/openai/Config.jsx"
    ],
    "src/services/translate/openai/info.ts": [],
    "src/services/translate/tencent/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/translate/tencent/index.jsx"
    ],
    "src/services/translate/tencent/index.jsx": [
      "src/services/translate/tencent/Config.jsx",
      "src/services/translate/tencent/info.ts"
    ],
    "src/services/translate/tencent/info.ts": [],
    "src/services/translate/transmart/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/translate/transmart/index.jsx"
    ],
    "src/services/translate/transmart/index.jsx": [
      "src/services/translate/transmart/Config.jsx",
      "src/services/translate/transmart/info.ts"
    ],
    "src/services/translate/transmart/info.ts": [],
    "src/services/translate/volcengine/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/translate/volcengine/index.jsx"
    ],
    "src/services/translate/volcengine/index.jsx": [
      "src/services/translate/volcengine/Config.jsx",
      "src/services/translate/volcengine/info.ts"
    ],
    "src/services/translate/volcengine/info.ts": [],
    "src/services/translate/yandex/Config.jsx": [],
    "src/services/translate/yandex/index.jsx": [
      "src/services/translate/yandex/Config.jsx",
      "src/services/translate/yandex/info.ts"
    ],
    "src/services/translate/yandex/info.ts": [],
    "src/services/translate/youdao/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/translate/youdao/index.jsx"
    ],
    "src/services/translate/youdao/index.jsx": [
      "src/services/translate/youdao/Config.jsx",
      "src/services/translate/youdao/info.ts"
    ],
    "src/services/translate/youdao/info.ts": [],
    "src/services/tts/index.jsx": [],
    "src/services/tts/lingva/Config.jsx": [
      "src/utils/service_instance.ts",
      "src/hooks/useConfig.jsx",
      "src/services/tts/lingva/index.jsx"
    ],
    "src/services/tts/lingva/index.jsx": [
      "src/services/tts/lingva/Config.jsx",
      "src/services/tts/lingva/info.ts"
    ],
    "src/services/tts/lingva/info.ts": [],
    "src/style.css": [],
    "src/utils/env.js": [],
    "src/utils/index.js": [],
    "src/utils/invoke_plugin.js": [
      "src/utils/env.js"
    ],
    "src/utils/lang_detect.js": [
      "src/utils/store.js"
    ],
    "src/utils/language.ts": [],
    "src/utils/service_instance.ts": [],
    "src/utils/store.js": [],
    "src/window/Config/components/SideBar/index.jsx": [],
    "src/window/Config/index.jsx": [
      "src/utils/env.js",
      "src/window/Config/style.css"
    ],
    "src/window/Config/pages/About/index.jsx": [
      "src/utils/env.js"
    ],
    "src/window/Config/pages/Backup/AliyunModal/index.jsx": [
      "src/window/Config/pages/Backup/utils/aliyun.jsx"
    ],
    "src/window/Config/pages/Backup/index.jsx": [
      "src/utils/env.js",
      "src/window/Config/pages/Backup/utils/webdav.jsx",
      "src/window/Config/pages/Backup/utils/local.jsx",
      "src/window/Config/pages/Backup/utils/aliyun.jsx"
    ],
    "src/window/Config/pages/Backup/utils/aliyun.jsx": [],
    "src/window/Config/pages/Backup/utils/local.jsx": [],
    "src/window/Config/pages/Backup/utils/webdav.jsx": [],
    "src/window/Config/pages/Backup/WebDavModal/index.jsx": [
      "src/window/Config/pages/Backup/utils/webdav.jsx"
    ],
    "src/window/Config/pages/General/index.jsx": [
      "src/hooks/useConfig.jsx",
      "src/utils/language.ts",
      "src/utils/env.js"
    ],
    "src/window/Config/pages/History/index.jsx": [
      "src/utils/invoke_plugin.js",
      "src/utils/language.ts",
      "src/utils/store.js",
      "src/utils/env.js",
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Hotkey/index.jsx": [
      "src/hooks/useConfig.jsx",
      "src/utils/env.js"
    ],
    "src/window/Config/pages/Recognize/index.jsx": [
      "src/utils/language.ts"
    ],
    "src/window/Config/pages/Service/Collection/ConfigModal/index.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/Collection/index.jsx": [
      "src/utils/env.js"
    ],
    "src/window/Config/pages/Service/Collection/SelectModal/index.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/Collection/ServiceItem/index.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/index.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/PluginConfig/index.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/Recognize/ConfigModal/index.jsx": [
      "src/utils/service_instance.ts",
      "src/utils/env.js"
    ],
    "src/window/Config/pages/Service/Recognize/index.jsx": [
      "src/utils/env.js"
    ],
    "src/window/Config/pages/Service/Recognize/SelectModal/index.jsx": [
      "src/utils/service_instance.ts",
      "src/utils/env.js"
    ],
    "src/window/Config/pages/Service/Recognize/ServiceItem/index.jsx": [
      "src/utils/service_instance.ts",
      "src/utils/env.js"
    ],
    "src/window/Config/pages/Service/SelectPluginModal/index.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/Translate/ConfigModal/index.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/Translate/index.jsx": [
      "src/utils/env.js"
    ],
    "src/window/Config/pages/Service/Translate/SelectModal/index.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/Translate/ServiceItem/index.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/Tts/ConfigModal/index.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/Tts/index.jsx": [
      "src/utils/env.js"
    ],
    "src/window/Config/pages/Service/Tts/SelectModal/index.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Service/Tts/ServiceItem/index.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/window/Config/pages/Translate/index.jsx": [
      "src/utils/language.ts",
      "src/hooks/useConfig.jsx"
    ],
    "src/window/Config/routes/index.jsx": [],
    "src/window/Config/style.css": [],
    "src/window/Recognize/ControlArea/index.jsx": [
      "src/utils/language.ts",
      "src/utils/env.js",
      "src/utils/service_instance.ts"
    ],
    "src/window/Recognize/ImageArea/index.jsx": [],
    "src/window/Recognize/index.jsx": [
      "src/utils/store.js",
      "src/utils/env.js"
    ],
    "src/window/Recognize/TextArea/index.jsx": [
      "src/utils/service_instance.ts",
      "src/utils/invoke_plugin.js"
    ],
    "src/window/Screenshot/index.jsx": [],
    "src/window/Translate/components/LanguageArea/index.jsx": [
      "src/utils/language.ts"
    ],
    "src/window/Translate/components/SourceArea/index.jsx": [
      "src/utils/service_instance.ts",
      "src/utils/invoke_plugin.js",
      "src/utils/lang_detect.js",
      "src/window/Translate/components/SourceArea/SourceActionBar.jsx"
    ],
    "src/window/Translate/components/SourceArea/SourceActionBar.jsx": [],
    "src/window/Translate/components/TargetArea/ActionBar.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/window/Translate/components/TargetArea/index.jsx": [
      "src/utils/invoke_plugin.js",
      "src/window/Translate/components/TargetArea/ResultView.jsx",
      "src/window/Translate/components/TargetArea/ServiceDropdown.jsx",
      "src/window/Translate/components/TargetArea/ActionBar.jsx",
      "src/utils/service_instance.ts"
    ],
    "src/window/Translate/components/TargetArea/ResultView.jsx": [],
    "src/window/Translate/components/TargetArea/ServiceDropdown.jsx": [
      "src/utils/service_instance.ts"
    ],
    "src/window/Translate/index.jsx": [
      "src/utils/env.js",
      "src/utils/store.js"
    ],
    "src/window/Updater/index.jsx": [
      "src/utils/env.js"
    ],
    "tailwind.config.cjs": [],
    "updater/updater-for-fix-runtime.mjs": [],
    "updater/updater.mjs": [],
    "vite.config.js": []
  },
  "selfImprovement": {
    "topP0": [
      {
        "action": "File exceeds 1000 LOC (2396 lines)",
        "file": "asset/eg1.gif",
        "line": null,
        "severity": "P0"
      },
      {
        "action": "File exceeds 1000 LOC (4388 lines)",
        "file": "asset/eg2.gif",
        "line": null,
        "severity": "P0"
      },
      {
        "action": "File exceeds 1000 LOC (6884 lines)",
        "file": "asset/eg3.gif",
        "line": null,
        "severity": "P0"
      },
      {
        "action": "File exceeds 1000 LOC (6792 lines)",
        "file": "asset/eg4.gif",
        "line": null,
        "severity": "P0"
      },
      {
        "action": "File exceeds 1000 LOC (1425 lines)",
        "file": "asset/eg5.gif",
        "line": null,
        "severity": "P0"
      }
    ],
    "focusArea": {
      "dimName": "Cycles",
      "score": 70,
      "why": "Cycles is at 70/100 with 14 P0 and 34 P1 alerts. Address to lift composite score.",
      "hint": "Invest focused effort on top 3 levers for the largest uplift."
    },
    "trendInsight": "Score 89 (grade B). Cycles is the weakest dimension at 70/100.",
    "weightsHint": "Consider increasing Cycles weight given its outsized impact on overall health.",
    "narrative": [
      "Overall health at 89/100 (grade B) — good shape with clear remediation path.",
      "14 critical (P0) and 34 major (P1) alerts active. Primary risks cluster around Cycles (score 70).",
      "Top lever: refactor src/utils/service_instance.ts (+11 pts). Remediation roadmap projects 100/100 after P0+P1 closure.",
      "Score 89 | grade B | gap 0 pts to B | projected 100 after plan | decay risk: -5 pts/quarter without action"
    ],
    "severityDonut": {
      "p0": 14,
      "p1": 34,
      "p2": 0,
      "total": 48
    },
    "riskVectors": [
      {
        "dimension": "Cycles",
        "score": 70,
        "weight": 0.2,
        "p0": 0,
        "p1": 30,
        "p2": 0
      },
      {
        "dimension": "Oversized files",
        "score": 86,
        "weight": 0.3,
        "p0": 12,
        "p1": 4,
        "p2": 0
      },
      {
        "dimension": "Coupling",
        "score": 98,
        "weight": 0.15,
        "p0": 0,
        "p1": 0,
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
        "action": "Refactor src/utils/service_instance.ts (50 LOC, fan-out 0) to reduce hotspot score from 10.63",
        "file": "src/utils/service_instance.ts",
        "line": 1,
        "scoreUplift": 11,
        "effort": "medium"
      },
      {
        "rank": 2,
        "dimension": "Coupling",
        "severity": "P0",
        "kind": "refactor",
        "action": "Refactor src/hooks/useConfig.jsx (67 LOC, fan-out 3) to reduce hotspot score from 6.93",
        "file": "src/hooks/useConfig.jsx",
        "line": 1,
        "scoreUplift": 7,
        "effort": "medium"
      },
      {
        "rank": 3,
        "dimension": "Coupling",
        "severity": "P1",
        "kind": "refactor",
        "action": "Refactor src-tauri/Cargo.lock (8632 LOC, fan-out 0) to reduce hotspot score from 4.32",
        "file": "src-tauri/Cargo.lock",
        "line": 1,
        "scoreUplift": 4,
        "effort": "medium"
      },
      {
        "rank": 4,
        "dimension": "Coupling",
        "severity": "P1",
        "kind": "refactor",
        "action": "Refactor src/utils/env.js (14 LOC, fan-out 0) to reduce hotspot score from 4.21",
        "file": "src/utils/env.js",
        "line": 1,
        "scoreUplift": 4,
        "effort": "medium"
      },
      {
        "rank": 5,
        "dimension": "Coupling",
        "severity": "P1",
        "kind": "refactor",
        "action": "Refactor public/logo/yandex.svg (8307 LOC, fan-out 0) to reduce hotspot score from 4.15",
        "file": "public/logo/yandex.svg",
        "line": 1,
        "scoreUplift": 4,
        "effort": "medium"
      },
      {
        "rank": 6,
        "dimension": "Coupling",
        "severity": "P1",
        "kind": "refactor",
        "action": "Refactor asset/eg3.gif (6884 LOC, fan-out 0) to reduce hotspot score from 3.44",
        "file": "asset/eg3.gif",
        "line": 1,
        "scoreUplift": 3,
        "effort": "medium"
      }
    ],
    "benchmarks": {
      "currentGrade": "B",
      "currentValue": 89,
      "targetGrade": "B",
      "targetValue": 90,
      "gapToNext": 1
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
      "currentScore": 89,
      "projectedScoreIfAllP0P1Remediated": 100
    },
    "decayForecast": {
      "currentScore": 89,
      "projectedNext": 84,
      "delta": -5,
      "rationale": "Without action, Cycles debt grows ~1 pt/quarter. Estimated -5 pts next run if no remediation."
    }
  },
  "scoreWeights": [
    {
      "dimension": "Oversized files",
      "weight": 0.3,
      "score": 86
    },
    {
      "dimension": "Nesting depth",
      "weight": 0.2,
      "score": 100
    },
    {
      "dimension": "Cycles",
      "weight": 0.2,
      "score": 70
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
