/**
 * @file: data.js
 * @purpose: Report template data schema + default/empty values for the
 *           unified daily CTO report template. This is the single source
 *           of truth for what the rendered report can render.
 *
 *           The Vue app in index.js reads `window.REPORT_DATA` and
 *           renders a project switcher + the selected project's four
 *           sections (summary, risk, health, people). Reports are
 *           organized by TWO dimensions:
 *             - Date   → one directory per day (YiDoc/reports/daily/)
 *             - Project → entries inside the `projects[]` array
 *
 * @unified_template_layout:
 *   YiDoc/reports/daily/
 *   ├── template/                   ← shared, byte-stable across all dates
 *   │   ├── index.html              ← thin shell (copied into each date dir)
 *   │   ├── index.css               ← shared styles
 *   │   ├── index.js                ← shared Vue 3 app (multi-project)
 *   │   └── README.md
 *   └── <YYYY-MM-DD>/               ← one directory per day
 *       ├── index.html              ← byte-identical copy of template/index.html
 *       └── data.js                 ← per-day data (the ONLY varying file)
 *
 *   The skill's `templates/report/` directory mirrors this layout as the
 *   canonical source — when the skill generates a new daily report, it
 *   copies `templates/report/index.html` verbatim into `<date>/` and
 *   writes a fresh `data.js` from the schema below.
 *
 * @data_shape (window.REPORT_DATA):
 *   {
 *     meta: {
 *       date:        'YYYY-MM-DD',   // report date (the DATE dimension)
 *       window:      string,          // lookback window, e.g. '1d' or '7d'
 *       sinceDate:   'YYYY-MM-DD',   // window start
 *       untilDate:   'YYYY-MM-DD',   // window end
 *       timestamp:   ISO-8601,        // full generation timestamp
 *       title:       string           // page title (drives document.title)
 *     },
 *     projects: [                     // the PROJECT dimension — one entry per project
 *       {
 *         project:     string,        // short project name (e.g. 'YiAi')
 *         scope:       string,        // absolute path that was reported on
 *         scopeShort:  string,        // display path (e.g. 'YiAi')
 *         summary: {
 *           kpis:         [ {label, value, sub, tone} ],
 *           contributors: [ {author, commits, percent, barWidth} ],
 *           hotFiles:     [ {rank, path, touches} ],
 *           narrative:    { shipped, atRisk, drifting, watch }
 *         },
 *         risk: {
 *           legend: { green, amber, red },
 *           items:  [ {severity, name, hint, action, category} ]
 *         },
 *         health: {
 *           languages:    [ {kind, files, loc, percent, barWidth} ],
 *           skills:       [ {name, files, skillMd, evals, references, notes} ],
 *           tests:        { testLoc, allJsLoc, ratio, threshold, verdict, color },
 *           techDebt:     [ {marker, count, verdict, color, share} ],
 *           branches:     [ {name, lastCommit, ageDays, status, note, color} ],
 *           dependencies: { text, verdict, color },
 *           lighthouse:  { scores:{performance,accessibility,bestPractices,seo},
 *                           metrics:{fcp,lcp,tbt,cls,tti},
 *                           verdict, color }
 *         },
 *         people: {
 *           distribution:     [ {author, commits, percent, barWidth} ],
 *           busFactor:        [ {bucket, files, percent, verdict, color} ],
 *           activityPulse:    [ {date, day, commits, hint, barWidth} ],
 *           review:           { text, verdict, color },
 *           newContributors:  string
 *         }
 *       }
 *     ]
 *   }
 *
 * @empty_value:
 *   Render any missing scalar as '—'. Render any missing array as [].
 *   The Vue app handles both via `{{ value || '—' }}` for scalars and
 *   v-if for arrays.
 *
 * @conditional_blocks:
 *   `summary.narrative.*`, `risk.items`, `health.skills`, `health.techDebt`,
 *   `people.activityPulse` are all rendered with v-if. Empty strings /
 *   empty arrays produce no orphan headers.
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
     HELPERS
     ────────────────────────────────────────────────────────────────── */

  /** Build an em-dash for missing scalar values. */
  function na() { return '—'; }

  /* ═══════════════════════════════════════════════════════════════════
     DEFAULT DATA — empty / placeholder values for "fresh template" mode.
     The /daily report command overwrites this with real git + filesystem
     data before writing the final report file.
     ─────────────────────────────────────────────────────────────────── */

  var DEFAULT_DATA = {
    meta: {
      date:       'YYYY-MM-DD',
      window:     '1d',
      sinceDate:  'YYYY-MM-DD',
      untilDate:  'YYYY-MM-DD',
      timestamp:  'YYYY-MM-DDTHH:MM:SS+00:00',
      title:      'YrY · Daily CTO Report'
    },

    projects: []
  };

  /** Default shape for a single project entry — used as the merge base
   *  when a project in `projects[]` omits a field. */
  var DEFAULT_PROJECT = {
    project:    'sample-project',
    scope:      '/path/to/project',
    scopeShort: 'sample-project',
    summary: {
      kpis: [
        // { label, value, sub, tone: 'normal' | 'warn' | 'critical' }
      ],
      contributors: [
        // { author, commits, percent, barWidth }
      ],
      hotFiles: [
        // { rank, path, touches }
      ],
      narrative: {
        shipped:  '',
        atRisk:   '',
        drifting: '',
        watch:    ''
      }
    },

    risk: {
      legend: { green: 'within threshold', amber: 'monitor', red: 'needs action' },
      items: [
        // { severity: 'red' | 'amber' | 'green', name, hint, action, category }
      ]
    },

    health: {
      languages: [
        // { kind, files, loc, percent, barWidth }
      ],
      skills: [
        // { name, files, skillMd, evals, references, notes }
      ],
      tests: {
        testLoc: 0,
        allJsLoc: 0,
        ratio: 0,
        threshold: 0.2,
        verdict: '—',
        color: 'muted'
      },
      techDebt: [
        // { marker, count, verdict, color, share }
      ],
      branches: [
        // { name, lastCommit, ageDays, status, note, color }
      ],
      dependencies: {
        text: '',
        verdict: '—',
        color: 'muted'
      },
      lighthouse: {
        // Populated by yry-tools/lighthouse. Missing → renders as '—'.
        scores: {
          performance:   null,
          accessibility: null,
          bestPractices: null,
          seo:           null
        },
        metrics: {
          fcp:  null,
          lcp:  null,
          tbt:  null,
          cls:  null,
          tti:  null
        },
        verdict: '—',
        color:  'muted'
      }
    },

    people: {
      distribution: [
        // { author, commits, percent, barWidth }
      ],
      busFactor: [
        // { bucket, files, percent, verdict, color }
      ],
      activityPulse: [
        // { date, day, commits, hint, barWidth }
      ],
      review: {
        text: '',
        verdict: '—',
        color: 'muted'
      },
      newContributors: ''
    }
  };

  /* ═══════════════════════════════════════════════════════════════════
     EXAMPLE DATA — illustrative fixture, used when opening the template
     directly in a browser (no `/daily report` invocation). It exercises
     every code path in the Vue template so the page renders something
     useful for review. Two projects are included to demonstrate the
     project-switcher interaction.
     ─────────────────────────────────────────────────────────────────── */

  var EXAMPLE_DATA = {
    meta: {
      date:      '2026-07-23',
      window:    '1d',
      sinceDate: '2026-07-23',
      untilDate: '2026-07-23',
      timestamp: '2026-07-23T09:40:00+08:00',
      title:     'YrY · Daily CTO Report · 2026-07-23'
    },

    projects: [
      {
        project:    'YiDoc',
        scope:      '/Users/ruiyi/Downloads/YrY/YiDoc',
        scopeShort: 'YiDoc',
        summary: {
          kpis: [
            { label: 'Commits',       value: '10',     sub: '10 commit(s)',           tone: 'normal'  },
            { label: 'Insertions',    value: '+41,988',sub: 'lines added today',      tone: 'warn'    },
            { label: 'Deletions',     value: '−2,879', sub: 'lines removed today',    tone: 'normal'  },
            { label: 'Authors',       value: '1',      sub: 'single-author',          tone: 'critical'},
            { label: 'Files touched', value: '15',     sub: 'unique paths',           tone: 'normal'  },
            { label: 'Total LOC',     value: '42K',    sub: 'project-wide',           tone: 'normal'  }
          ],
          contributors: [
            { author: 'Chengliang.Yi1@zeekrlife.com', commits: 10, percent: 100, barWidth: 160 }
          ],
          hotFiles: [
            { rank: 1, path: 'YiDoc/data.js', touches: 7 },
            { rank: 2, path: 'YiDoc/index.html', touches: 3 },
            { rank: 3, path: 'YiDoc/arch/scene-1/index.md', touches: 2 }
          ],
          narrative: {
            shipped:  '10 commits landed on 2026-07-23, all from a single author. The bulk of the activity touched the dashboard data model and the arch/test scene entries.',
            atRisk:   'Single-author bus factor — only one contributor is active, so knowledge concentration is maximal.',
            drifting: '',
            watch:    ''
          }
        },
        risk: {
          legend: { green: 'within threshold', amber: 'monitor', red: 'needs action' },
          items: [
            {
              severity: 'amber',
              name:     'Single-author bus factor',
              hint:     'Only one contributor has touched files in this window.',
              action:   'Encourage knowledge sharing or add reviewers.',
              category: 'people'
            }
          ]
        },
        health: {
          languages: [
            { kind: 'js',   files: 45, loc: 16503, percent: 39.7, barWidth: 160 },
            { kind: 'md',   files: 86, loc: 9540,  percent: 22.9, barWidth: 92  },
            { kind: 'css',  files: 20, loc: 9024,  percent: 21.7, barWidth: 87  },
            { kind: 'html', files: 40, loc: 6483,  percent: 15.6, barWidth: 63  }
          ],
          skills: [],
          tests: {
            testLoc: 0, allJsLoc: 0, ratio: 0, threshold: 0.2,
            verdict: '—', color: 'muted'
          },
          techDebt: [
            { marker: 'TODO',  count: 5, verdict: 'pass', color: 'green', share: '5 files' },
            { marker: 'FIXME', count: 5, verdict: 'pass', color: 'green', share: '5 files' },
            { marker: 'HACK',  count: 3, verdict: 'pass', color: 'green', share: '3 files' },
            { marker: 'XXX',   count: 5, verdict: 'pass', color: 'green', share: '5 files' }
          ],
          branches: [
            { name: 'master', lastCommit: '2026-07-23', ageDays: 0, status: 'active',
              note: 'docs(projects): phase A — shared assets layer + 10 interaction features', color: 'green' }
          ],
          dependencies: {
            text: 'No dependency manifest found.',
            verdict: '—', color: 'muted'
          }
        },
        people: {
          distribution: [
            { author: 'Chengliang.Yi1@zeekrlife.com', commits: 10, percent: 100, barWidth: 160 }
          ],
          busFactor: [
            { bucket: '1 author', files: 1, percent: 100, verdict: 'critical', color: 'red' }
          ],
          activityPulse: [
            { date: '2026-07-23', day: 'Thu', commits: 10, hint: '10 commit(s)', barWidth: 160 }
          ],
          review: { text: 'No review data available.', verdict: '—', color: 'muted' },
          newContributors: '—'
        }
      },
      {
        project:    'YiAi',
        scope:      '/Users/ruiyi/Downloads/YrY/YiAi',
        scopeShort: 'YiAi',
        summary: {
          kpis: [
            { label: 'Commits',       value: '0',  sub: 'no activity today', tone: 'warn'    },
            { label: 'Insertions',    value: '+0', sub: 'lines added today', tone: 'normal'  },
            { label: 'Deletions',     value: '−0', sub: 'lines removed today',tone: 'normal'  },
            { label: 'Authors',       value: '0',  sub: 'no contributors',    tone: 'critical'},
            { label: 'Files touched', value: '0',  sub: 'unique paths',      tone: 'normal'  },
            { label: 'Total LOC',     value: '0',  sub: 'project-wide',      tone: 'normal'  }
          ],
          contributors: [],
          hotFiles: [],
          narrative: {
            shipped:  'No commits on 2026-07-23.',
            atRisk:   'Single-author project — bus factor is 1.',
            drifting: '',
            watch:    'No activity today. Check if the project is on track.'
          }
        },
        risk: {
          legend: { green: 'within threshold', amber: 'monitor', red: 'needs action' },
          items: [
            {
              severity: 'amber',
              name:     'No commits today',
              hint:     'Zero activity in the reporting window.',
              action:   'Verify the project is healthy and contributors are unblocked.',
              category: 'activity'
            }
          ]
        },
        health: {
          languages: [],
          skills: [],
          tests: { testLoc: 0, allJsLoc: 0, ratio: 0, threshold: 0.2, verdict: '—', color: 'muted' },
          techDebt: [],
          branches: [
            { name: 'master', lastCommit: '2026-07-23', ageDays: 0, status: 'active',
              note: 'last commit on 2026-07-23', color: 'green' }
          ],
          dependencies: { text: 'No dependency manifest found.', verdict: '—', color: 'muted' }
        },
        people: {
          distribution: [],
          busFactor: [
            { bucket: '1 author', files: 1, percent: 100, verdict: 'critical', color: 'red' }
          ],
          activityPulse: [
            { date: '2026-07-23', day: 'Thu', commits: 0, hint: 'no commits', barWidth: 0 }
          ],
          review: { text: 'No review data available.', verdict: '—', color: 'muted' },
          newContributors: '—'
        }
      }
    ]
  };

  /* ═══════════════════════════════════════════════════════════════════
     PUBLIC EXPORTS
     ─────────────────────────────────────────────────────────────────── */

  function isObject(x) { return x && typeof x === 'object' && !Array.isArray(x); }

  /** Deep-merge two objects; arrays are replaced, not concatenated. */
  function merge(a, b) {
    if (!isObject(a) || !isObject(b)) return b === undefined ? a : b;
    var out = Array.isArray(a) ? a.slice() : Object.assign({}, a);
    Object.keys(b).forEach(function (k) {
      out[k] = (k in a) ? merge(a[k], b[k]) : b[k];
    });
    return out;
  }

  /** Merge a project entry with DEFAULT_PROJECT so any missing field
   *  still renders as a sensible empty value. */
  function mergeProject(input) {
    return merge(DEFAULT_PROJECT, input || {});
  }

  /** Merge the full report payload with DEFAULT_DATA, and each project
   *  in `projects[]` with DEFAULT_PROJECT. This is the main entry point
   *  the Vue app relies on: any field the /daily report command forgets
   *  to fill still renders as `—` or an empty section, never a crash. */
  function mergeWithDefaults(input) {
    var root = merge(DEFAULT_DATA, input || {});
    if (root && Array.isArray(root.projects)) {
      root.projects = root.projects.map(mergeProject);
    }
    return root;
  }

  window.REPORT_DATA_SCHEMA = {
    defaults:         DEFAULT_DATA,
    defaultProject:   DEFAULT_PROJECT,
    example:          EXAMPLE_DATA,
    merge:            mergeWithDefaults,
    mergeProject:     mergeProject,
    na:               na,
    // Schema version — bump when the shape changes so consumers can detect
    // mismatches instead of silently rendering broken reports.
    version: 2
  };

  // Active data: window.REPORT_DATA → defaults → example (last writer wins
  // so a host page can override the data without editing this file).
  window.REPORT_DATA = mergeWithDefaults(window.REPORT_DATA || EXAMPLE_DATA);
})();
