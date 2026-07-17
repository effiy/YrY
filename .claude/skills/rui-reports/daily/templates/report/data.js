/**
 * @file: data.js
 * @purpose: Report template data schema + default/empty values for the
 *           `/daily report` template. This is the single source of truth for
 *           what the rendered daily report can render. The Vue app in
 *           index.js reads `window.REPORT_DATA` and renders the four
 *           sections (summary, risk, health, people) from it.
 *
 * @four_file_layout:
 *   data.js    — schema, defaults, example fixture
 *   index.html — page shell (loads shared/loader.js, this file, index.css, index.js)
 *   index.css  — all styles, layered
 *   index.js   — Vue 3 app: inline template + interactivity (section collapse, copy-as-markdown)
 *
 * @data_shape (window.REPORT_DATA):
 *   {
 *     meta: {
 *       project:     string,        // short project name (e.g. 'skills')
 *       scope:       string,        // absolute path that was reported on
 *       scopeShort:  string,        // display path (e.g. '.claude/skills')
 *       date:        'YYYY-MM-DD',  // report date
 *       timestamp:   ISO-8601,      // full generation timestamp
 *       window:      string,        // lookback window, e.g. '7d'
 *       sinceDate:   'YYYY-MM-DD',  // window start
 *       untilDate:   'YYYY-MM-DD',  // window end
 *       title:       string         // page title
 *     },
 *     summary: {
 *       kpis:         [ {label, value, sub, tone} ],
 *       contributors: [ {author, commits, percent, barWidth} ],
 *       hotFiles:     [ {rank, path, touches} ],
 *       narrative:    { shipped, atRisk, drifting, watch }  // 4 paragraphs
 *     },
 *     risk: {
 *       legend: { green, amber, red },
 *       items:  [ {severity, name, hint, action, category} ]
 *     },
 *     health: {
 *       languages:    [ {kind, files, loc, percent, barWidth} ],
 *       skills:       [ {name, files, skillMd, evals, references, notes} ],
 *       tests:        { testLoc, allJsLoc, ratio, threshold, testFileCount, verdict, color },
 *       techDebt:     [ {marker, count, verdict, color, share} ],
 *       branches:     [ {name, lastCommit, ageDays, status, note, color} ],
 *       dependencies: { text, verdict, color }
 *     },
 *     people: {
 *       distribution:     [ {author, commits, percent, barWidth} ],
 *       busFactor:        [ {bucket, files, percent, verdict, color} ],
 *       activityPulse:    [ {date, day, commits, hint, barWidth} ],
 *       review:           { text, verdict, color },
 *       newContributors:  string
 *     }
 *   }
 *
 * @empty_value:
 *   Render any missing scalar as '—'. Render any missing array as [].
 *   The Vue app handles both via `{{ value || '—' }}` for scalars and v-if
 *   for arrays.
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
      project:    'sample-project',
      scope:      '/path/to/project',
      scopeShort: 'sample-project',
      date:       'YYYY-MM-DD',
      timestamp:  'YYYY-MM-DDTHH:MM:SS+00:00',
      window:     '7d',
      sinceDate:  'YYYY-MM-DD',
      untilDate:  'YYYY-MM-DD',
      title:      'sample-project — Daily CTO Report'
    },

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
      legend: { green: 'within threshold', amber: 'near threshold', red: 'exceeds threshold' },
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
        threshold: 0.10,
        testFileCount: 0,
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
     useful for review.
     ─────────────────────────────────────────────────────────────────── */

  var EXAMPLE_DATA = {
    meta: {
      project:    'skills',
      scope:      '/Users/ruiyi/YrY/.claude/skills',
      scopeShort: '.claude/skills',
      date:       '2026-07-17',
      timestamp:  '2026-07-17T15:45:00+08:00',
      window:     '7d',
      sinceDate:  '2026-07-13',
      untilDate:  '2026-07-17',
      title:      '.claude/skills — Daily CTO Report'
    },

    summary: {
      kpis: [
        { label: 'Commits',        value: '83',     sub: '5 days, 100% in window', tone: 'normal'   },
        { label: 'Files changed',  value: '3,265',  sub: 'unique paths in window', tone: 'normal'  },
        { label: 'Insertions',     value: '+269K',  sub: '+82% net code',          tone: 'normal'   },
        { label: 'Deletions',      value: '−131K',  sub: '−48% removed',           tone: 'normal'   },
        { label: 'Active authors', value: '1',      sub: '100% single-author',     tone: 'critical' },
        { label: 'Active branches',value: '1',      sub: 'master only',            tone: 'normal'   },
        { label: 'Skill count',    value: '25',     sub: 'SKILL.md entries',       tone: 'normal'   },
        { label: 'Total LOC',      value: '756K',   sub: 'md+js+html+css+vue+py',  tone: 'normal'   }
      ],
      contributors: [
        { author: 'Chengliang.Yi1@zeekrlife.com', commits: 83, percent: 100, barWidth: 300 }
      ],
      hotFiles: [
        { rank: 1,  path: '.claude/skills/rui-reports/diagram/templates/architecture-diagram.html', touches: 39 },
        { rank: 2,  path: '.claude/skills/rui-reports/diagram/SKILL.md',                              touches: 25 },
        { rank: 3,  path: '.claude/skills/rui-reports/diagram/references/design-system.md',           touches: 14 },
        { rank: 4,  path: '.claude/skills/rui-reports/files/SKILL.md',                                touches:  9 },
        { rank: 5,  path: '.claude/skills/rui-reports/daily/SKILL.md',                                 touches:  9 },
        { rank: 6,  path: '.claude/skills/rui-tools/public-api/SKILL.md',                             touches:  8 },
        { rank: 7,  path: '.claude/skills/rui-tools/cc/SKILL.md',                                      touches:  8 },
        { rank: 8,  path: '.claude/skills/rui-reports/files/templates/index.html',                    touches:  8 },
        { rank: 9,  path: '.claude/skills/rui-reports/files/scripts/analyze.mjs',                      touches:  8 },
        { rank: 10, path: '.claude/skills/rui-reports/diagram/commands/create.md',                     touches:  8 }
      ],
      narrative: {
        shipped:
          'The <code>rui-reports</code> family (daily, files, diagram, self-test) absorbed the ' +
          'heaviest refactor of the window — top-3 hot files all live there. 13+ skill SKILL.md ' +
          'files have been migrated off the old "Page HTML Generation" template pipeline onto the ' +
          'canonical-snippet model documented in <code>rui-init</code>, with template assets ' +
          'removed and <code>templates/</code> directories cleaned across affected skills.',
        atRisk:
          'The <code>architecture-diagram.html</code> template has been rewritten 39 times in 5 ' +
          'days — a 7.8 touches/day pace on a single file. That\'s a strong signal of mid-flight ' +
          'design churn on the diagram skill\'s output, not convergence.',
        drifting:
          'Commit-message hygiene has collapsed: 80 of 83 commits carry the literal subject ' +
          '<code>"1"</code>, leaving no audit trail for what each change did. Combined with the ' +
          'single-author pattern, future archeology of this window will require diffing, not ' +
          '<code>git log</code>.',
        watch:
          'The skill subproject under <code>rui-reports/diagram/engine</code> is now a real ' +
          'codebase (≈ 2,762 files, 889 JS + 807 TS, with a <code>tree-sitter-dart-wasm</code> ' +
          'bundle). It is no longer a thin skill spec; it is a shipped product that needs its own ' +
          'CI, its own test runs, and its own review surface — none of which it currently has.'
      }
    },

    risk: {
      legend: {
        green: 'within threshold',
        amber: 'near threshold',
        red:   'exceeds threshold'
      },
      items: [
        {
          severity: 'red', category: 'bus-factor',
          name: 'Bus factor = 1',
          hint: 'All 83 commits, all 3,265 file touches, all 870 files in <code>.claude/skills</code> come from one author (<code>Chengliang.Yi1@zeekrlife.com</code>). No peer review, no co-author, no second reviewer in the window. Loss of this one account stops the entire skill catalog.',
          action: 'Assign a peer reviewer per skill family and require at least one second-pair-of-eyes before merge, even for documentation-only changes.'
        },
        {
          severity: 'red', category: 'hot-file',
          name: 'Single hot file at 39 touches',
          hint: '<code>architecture-diagram.html</code> was edited 39× in 5 days (47% of all commits). Threshold for "convergence" is ≤ 3 touches post-finalization; the file is still in active design churn.',
          action: 'Freeze the file behind a feature flag, write the contract first in <code>SKILL.md</code>, and only re-open the template once the contract stops moving.'
        },
        {
          severity: 'red', category: 'process',
          name: 'Commit-message hygiene collapse',
          hint: '80 of 83 commits (96%) carry the subject <code>"1"</code>. The remaining 3 carry real subjects (Cytoscape viewport fallback, font-asset filter, link styles in 24 templates). Audit trail for the 96% requires <code>git log --name-only</code>, not titles.',
          action: 'Adopt a <code>commitlint</code> or a pre-commit hook that rejects single-character or placeholder subjects, or at minimum enforce <code>type(scope): summary</code>.'
        },
        {
          severity: 'red', category: 'branch-hygiene',
          name: 'No branch hygiene',
          hint: 'Only <code>master</code> exists. No <code>feat/*</code>, <code>fix/*</code>, <code>chore/*</code>, no tags. 3,265 files changed in 5 days on a single branch means there is no way to bisect, no way to revert one feature, and no review boundary between skill refactors.',
          action: 'Introduce at least a per-skill work branch and merge with a squash + signed commit so the linear history stays legible.'
        },
        {
          severity: 'amber', category: 'tech-debt',
          name: 'TODO / FIXME density in rui-reports',
          hint: '66 of the 82 <code>TODO|FIXME|XXX</code> markers in the entire skills tree live under <code>rui-reports/</code>. The other 4 skills combined account for 16.',
          action: 'Open a "tech-debt sweep" pass over <code>rui-reports</code> before the next reporting cycle lands.'
        },
        {
          severity: 'green', category: 'revert-signal',
          name: 'No reverts, no fix-on-fix — yet',
          hint: '0 commits in the window contain <code>revert</code>, <code>fixup</code>, or <code>rollback</code> in the subject. This is unusual given the 3,265 file touches and is the only positive signal in this section.',
          action: 'Watch: if the 39-touch hot file continues to churn past 60 touches, the absence of reverts becomes a red flag of its own.'
        },
        {
          severity: 'amber', category: 'sub-product',
          name: 'Hidden sub-product: diagram engine',
          hint: '<code>rui-reports/diagram/engine</code> contains ≈ 2,762 files (889 <code>.js</code>, 807 <code>.ts</code>, plus a <code>tree-sitter-dart-wasm</code> bundle). It is no longer a skill definition — it is a delivered library with no CI, no release process, no <code>CHANGELOG</code>, and no version tag.',
          action: 'Either move the engine out of <code>.claude/skills/</code> into a sibling repo, or treat it as a proper sub-project (CI, tests, semver, README).'
        }
      ]
    },

    health: {
      languages: [
        { kind: 'Markdown (.md)',     files: 545, loc: 90205,  percent: 12,  barWidth: 24  },
        { kind: 'JS / MJS',           files: 141, loc: 400568, percent: 53,  barWidth: 160 },
        { kind: 'HTML',               files: 12,  loc: 2439,   percent: 0.3, barWidth: 1   },
        { kind: 'CSS',                files: 12,  loc: 4899,   percent: 0.6, barWidth: 2   },
        { kind: 'JSON',               files: 50,  loc: 0,      percent: 0,   barWidth: 0   },
        { kind: 'Vue',                files: 10,  loc: 0,      percent: 0,   barWidth: 0   },
        { kind: 'Fonts (.ttf)',       files: 54,  loc: 0,      percent: 0,   barWidth: 0   },
        { kind: 'Total tracked text', files: 870, loc: 756069, percent: 100, barWidth: 200 }
      ],
      skills: [
        { name: 'rui-code',    files: 338,  skillMd: 9, evals: 9, references: 317, notes: '9 sub-skills; heavy with vueuse references' },
        { name: 'rui-init',    files: 52,   skillMd: 1, evals: 0, references: 12,  notes: '5-step pipeline (detect → explore → generate → arch → verify)' },
        { name: 'rui-reports', files: 2841, skillMd: 5, evals: 5, references: 24,  notes: '5 sub-skills; the diagram sub-skill contains the engine (≈ 2,762 files)' },
        { name: 'rui-test',    files: 21,   skillMd: 1, evals: 1, references: 14,  notes: 'Smallest skill; the fixture topic bundle has the test-contracts rule set' },
        { name: 'rui-tools',   files: 207,  skillMd: 9, evals: 8, references: 60,  notes: '9 sub-skills; ui-ux/canvas-fonts bundle is 81 of the 207 files' }
      ],
      tests: {
        testLoc: 1161,
        allJsLoc: 400568,
        ratio: 0.0029,
        threshold: 0.10,
        testFileCount: 5,
        verdict: 'RED',
        color: 'red'
      },
      techDebt: [
        { marker: 'TODO in skills',   count: 82,     verdict: 'AMBER', color: 'amber', share: '80% concentrated in rui-reports' },
        { marker: 'FIXME in skills',  count: 0,      verdict: 'GREEN', color: 'green', share: '—' },
        { marker: 'XXX in skills',    count: 0,      verdict: 'GREEN', color: 'green', share: '—' }
      ],
      branches: [
        { name: 'master', lastCommit: '2026-07-17 15:40 +08:00', ageDays: 0, status: 'AMBER', note: 'only branch; 5 days of solo work on it', color: 'amber' }
      ],
      dependencies: {
        text: 'The skills catalog itself has no runtime <code>package.json</code>; only <code>rui-reports/diagram</code> ships one. The diagram engine depends on Vue 3, mermaid, html2canvas, jsPDF, xlsx, and a tree-sitter-dart-wasm bundle. None of those dependencies are versioned from a top-level lockfile in <code>.claude/skills</code>.',
        verdict: 'AMBER',
        color: 'amber'
      }
    },

    people: {
      distribution: [
        { author: 'Chengliang.Yi1@zeekrlife.com', commits: 83, percent: 100, barWidth: 300 }
      ],
      busFactor: [
        { bucket: 'Files touched by 1 distinct author',  files: 1938, percent: 100, verdict: 'RED',   color: 'red'   },
        { bucket: 'Files touched by 2+ authors (window)', files: 0,    percent: 0,   verdict: '—',     color: 'muted' },
        { bucket: 'Files touched by 3+ authors (window)', files: 0,    percent: 0,   verdict: '—',     color: 'muted' }
      ],
      activityPulse: [
        { date: '2026-07-13', day: 'Mon', commits: 24, hint: 'initial commit wave, all 25 skills seeded',   barWidth: 120 },
        { date: '2026-07-14', day: 'Tue', commits: 25, hint: 'peak day; diagram + canvas-fonts seeded',     barWidth: 124 },
        { date: '2026-07-15', day: 'Wed', commits: 13, hint: 'first refactor passes (Cytoscape, fonts)',     barWidth: 64  },
        { date: '2026-07-16', day: 'Thu', commits: 10, hint: 'Page-HTML-Generation removals across rui-tools',barWidth: 48  },
        { date: '2026-07-17', day: 'Fri', commits: 11, hint: 'continuing rui-tools cleanup',                  barWidth: 52  }
      ],
      review: {
        text: 'The workflow has no <code>gh</code> review signal in <code>.claude/skills</code> — there is no <code>.github/workflows</code>, no <code>PULL_REQUEST_TEMPLATE.md</code>, no <code>CODEOWNERS</code>. 0 of 0 PRs were reviewed, because no PRs were opened. All changes landed on <code>master</code> by direct commit.',
        verdict: 'RED',
        color: 'red'
      },
      newContributors: 'The single author appeared in this window and is the entire population. There is no "frequent committer who went inactive" to flag — there were no other frequent committers to start with.'
    }
  };

  /* ═══════════════════════════════════════════════════════════════════
     PUBLIC EXPORTS
     ─────────────────────────────────────────────────────────────────── */

  /**
   * Deep-merge defaults with the active data, so any field the user / the
   * /daily report command forgets to fill still renders as a sensible empty
   * value rather than crashing the template.
   */
  function mergeWithDefaults(input) {
    function isObject(x) { return x && typeof x === 'object' && !Array.isArray(x); }
    function merge(a, b) {
      if (!isObject(a) || !isObject(b)) return b === undefined ? a : b;
      var out = Array.isArray(a) ? a.slice() : Object.assign({}, a);
      Object.keys(b).forEach(function (k) {
        out[k] = (k in a) ? merge(a[k], b[k]) : b[k];
      });
      return out;
    }
    return merge(DEFAULT_DATA, input || {});
  }

  window.REPORT_DATA_SCHEMA = {
    defaults: DEFAULT_DATA,
    example:  EXAMPLE_DATA,
    merge:    mergeWithDefaults,
    na:       na,
    // Schema version — bump when the shape changes so consumers can detect
    // mismatches instead of silently rendering broken reports.
    version: 1
  };

  // Active data: window.REPORT_DATA → defaults → example (last writer wins
  // so a host page can override the data without editing this file).
  window.REPORT_DATA = mergeWithDefaults(window.REPORT_DATA || EXAMPLE_DATA);
})();
