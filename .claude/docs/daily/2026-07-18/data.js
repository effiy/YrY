/**
 * @file: data.js
 * @purpose: Active data for the `.claude/skills` daily CTO report
 *           (window: 7d, generated 2026-07-18). Populates
 *           `window.REPORT_DATA_SCHEMA` (with the same shape as the
 *           template) and `window.REPORT_DATA` (this report's data).
 *
 * @four_file_layout:
 *   data.js    — schema, defaults, this report's data
 *   index.html — page shell (loads shared/loader.js, this file, index.css, index.js)
 *   index.css  — all styles, layered
 *   index.js   — Vue 3 app: inline template + interactivity
 *
 * @data_shape: see templates/report/data.js for the full schema.
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
     HELPERS
     ─────────────────────────────────────────────────────────────────── */
  function na() { return '—'; }

  /* ═══════════════════════════════════════════════════════════════════
     DEFAULT DATA — identical to the template's default. Kept here so
     the schema header, defaults, and merge function are colocated with
     the active data. mergeWithDefaults() below fills any field this
     report forgets to set.
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
      kpis: [],
      contributors: [],
      hotFiles: [],
      narrative: { shipped: '', atRisk: '', drifting: '', watch: '' }
    },
    risk: {
      legend: { green: 'within threshold', amber: 'near threshold', red: 'exceeds threshold' },
      items: []
    },
    health: {
      languages: [],
      skills: [],
      tests: { testLoc: 0, allJsLoc: 0, ratio: 0, threshold: 0.10, testFileCount: 0, verdict: '—', color: 'muted' },
      techDebt: [],
      branches: [],
      dependencies: { text: '', verdict: '—', color: 'muted' }
    },
    people: {
      distribution: [],
      busFactor: [],
      activityPulse: [],
      review: { text: '', verdict: '—', color: 'muted' },
      newContributors: ''
    }
  };

  /* ═══════════════════════════════════════════════════════════════════
     ACTIVE DATA — `.claude/skills`, 7d window ending 2026-07-18.
     ─────────────────────────────────────────────────────────────────── */
  var ACTIVE_DATA = {
    meta: {
      project:    'skills',
      scope:      '/.claude/skills',
      scopeShort: '.claude/skills',
      date:       '2026-07-18',
      timestamp:  '2026-07-18T09:42:00+08:00',
      window:     '7d',
      sinceDate:  '2026-07-11',
      untilDate:  '2026-07-18',
      title:      '.claude/skills — Daily CTO Report'
    },

    summary: {
      kpis: [
        { label: 'Commits',         value: '6',      sub: 'all touching skills',                tone: 'normal'  },
        { label: 'Files changed',   value: '1,264',  sub: 'unique paths in window',             tone: 'normal'  },
        { label: 'Insertions',      value: '+218K',  sub: '~26K renames tracked separately',    tone: 'normal'  },
        { label: 'Deletions',       value: '−76K',   sub: 'coarse `find | wc -l` style',        tone: 'normal'  },
        { label: 'Active authors',  value: '2',      sub: 'YourName + Claude',                  tone: 'warn'    },
        { label: 'Active branches', value: '1',      sub: 'main only',                          tone: 'warn'    },
        { label: 'Skill count',     value: '26',     sub: 'SKILL.md entries (5 families)',      tone: 'normal'  },
        { label: 'Total tracked LOC', value: '107K', sub: 'md + js/mjs + html + css + vue',     tone: 'normal'  }
      ],
      contributors: [
        { author: 'YourName <you@example.com>', commits: 5, percent: 83, barWidth: 250 },
        { author: 'Claude <claude@anthropic.com>', commits: 1, percent: 17, barWidth: 51 }
      ],
      hotFiles: [
        { rank: 1,  path: '.claude/skills/rui-reports/diagram/templates/architecture-diagram.html', touches: 4 },
        { rank: 2,  path: '.claude/skills/rui-reports/diagram/SKILL.md',                              touches: 4 },
        { rank: 3,  path: '.claude/skills/rui-reports/diagram/references/design-system.md',           touches: 4 },
        { rank: 4,  path: '.claude/skills/rui-reports/diagram/agents/graph-reviewer.md',              touches: 4 },
        { rank: 5,  path: '.claude/skills/rui-reports/files/templates/index.js',                       touches: 3 },
        { rank: 6,  path: '.claude/skills/rui-reports/files/templates/index.html',                     touches: 3 },
        { rank: 7,  path: '.claude/skills/rui-reports/files/templates/index.css',                      touches: 3 },
        { rank: 8,  path: '.claude/skills/rui-reports/files/templates/data.js',                        touches: 3 },
        { rank: 9,  path: '.claude/skills/rui-reports/diagram/references/templates-index.md',         touches: 3 },
        { rank: 10, path: '.claude/skills/rui-reports/diagram/references/quality-rubric.md',           touches: 3 }
      ],
      narrative: {
        shipped:
          'The window is the <strong>seed + first refactor</strong> of the skills catalog: ' +
          '<code>rui-tools</code> and <code>rui-reports</code> were committed in their entirety on ' +
          '2026-07-12, the <code>diagram</code> engine was moved from <code>rui-tools</code> into ' +
          '<code>rui-reports</code> on 2026-07-13, and the <code>rui-code</code> family (9 sub-skills: ' +
          'chrome, css, fastapi, h5, nginx, nodejs, tauri, vite, vue) was added on 2026-07-17. ' +
          'Net effect: 26 SKILL.md files across 5 skill families, 887 tracked files, 107K LOC.',
        atRisk:
          'The hot-file cluster is concentrated in <code>rui-reports/diagram/</code> (top-4 files ' +
          'all live there, each touched 4× in the window). That is not a bug — the diagram skill is ' +
          'still in active design churn — but it means the 4 days of silence since 2026-07-14 ' +
          '(only 1 commit on 07-17) are best read as "design still in flight, awaiting convergence".',
        drifting:
          'Test surface is thin: 1,161 test LOC across 5 <code>*.test.js</code> files, all of them ' +
          'inside the <code>rui-reports/diagram/engine</code> bundle. That gives a 4.4% test/code ' +
          'ratio (threshold 10%) and zero tests for the 5 skill families themselves, the 9 ' +
          '<code>rui-code</code> sub-skills, <code>rui-init</code>, or <code>rui-tools</code>. ' +
          'TODOs are also concentrated: 76 of the catalog\'s 96 TODO/FIXME/XXX markers live under ' +
          '<code>rui-reports/</code>.',
        watch:
          'A second author (<code>Claude &lt;claude@anthropic.com&gt;</code>) appeared in the window ' +
          'on 2026-07-17 with a single <code>feat: next</code> commit that seeded all 9 ' +
          '<code>rui-code</code> sub-skills in one go. That is 337 new files in one commit with a ' +
          'zero-character commit subject — easy to miss in <code>git log --oneline</code>. If a ' +
          'second agent or human starts landing changes, branch hygiene (still only <code>main</code>) ' +
          'will need to grow up first.'
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
          severity: 'red', category: 'branch-hygiene',
          name: 'No branch hygiene',
          hint: 'Only <code>main</code> exists. 1,264 file touches across 6 commits in 7 days, all on the same branch. There is no way to bisect, no way to revert one feature in isolation, and no review boundary between <code>rui-code</code> seeding and <code>rui-reports</code> refactors.',
          action: 'Adopt a per-skill work branch and a squash-merge boundary so the linear history stays legible; even solo work benefits from a <code>feat/*</code> → <code>main</code> flow.'
        },
        {
          severity: 'red', category: 'process',
          name: 'No review surface',
          hint: 'No <code>.github/workflows</code>, no <code>CODEOWNERS</code>, no <code>PULL_REQUEST_TEMPLATE.md</code>, no PRs at all. 0 of 6 commits in the window went through any review boundary, because there is no review boundary to go through.',
          action: 'Stand up a minimal review gate: <code>CODEOWNERS</code> per skill family + a PR template that requires at least one human or agent reviewer before merge to <code>main</code>.'
        },
        {
          severity: 'red', category: 'test-coverage',
          name: 'Test / code ratio 4.4% (threshold 10%)',
          hint: '1,161 test LOC vs 26,464 JS/MJS LOC, all 5 <code>*.test.js</code> files live inside <code>rui-reports/diagram/engine/</code>. The remaining 4 skill families (<code>rui-code</code>, <code>rui-init</code>, <code>rui-tools</code>, <code>rui-test</code>) and the <code>test</code> / <code>files</code> / <code>daily</code> / <code>quickstart</code> rui-reports sub-skills have zero test coverage.',
          action: 'Move the test floor to at least the engine + one <code>rui-code</code> sub-skill in the next window; treat 0-test as a launch blocker for any new skill going forward.'
        },
        {
          severity: 'amber', category: 'hot-file',
          name: '4 hot files at 4 touches each',
          hint: 'The top-4 churn files are all under <code>rui-reports/diagram/</code>: <code>architecture-diagram.html</code>, <code>SKILL.md</code>, <code>design-system.md</code>, and <code>graph-reviewer.md</code>. The "single hot file" pattern from the prior window (39 touches on one file) has dissipated, but the diagram skill is still the dominant work surface.',
          action: 'Keep watching: if any one of these exceeds 6 touches in the next 7d, freeze the file behind a feature flag and re-derive the contract from <code>SKILL.md</code> first.'
        },
        {
          severity: 'amber', category: 'bus-factor',
          name: 'Bus factor ≈ 1.2 (cross-skill)',
          hint: 'Two authors in the window — <code>YourName</code> (5 commits) and <code>Claude</code> (1 commit) — but they touched disjoint file sets. <code>YourName</code> did <code>rui-tools</code> + <code>rui-reports</code>; <code>Claude</code> did <code>rui-code</code>. No file in the window was touched by both authors, so per-file bus factor is still 1 across the catalog.',
          action: 'At least one skill family should be co-owned before the next window closes; pick the most user-facing one (<code>rui-reports</code>) and put it behind a <code>CODEOWNERS</code> pair.'
        },
        {
          severity: 'amber', category: 'tech-debt',
          name: '76 of 96 TODO / FIXME / XXX live in rui-reports',
          hint: 'Distribution: <code>rui-reports</code> 76, <code>rui-tools</code> 10, <code>rui-init</code> 6, <code>rui-code</code> 4, <code>rui-test</code> 0. The other 4 families combined (20) are still less than a third of the <code>rui-reports</code> load, and the diagram engine is the dominant sub-source inside <code>rui-reports</code>.',
          action: 'Run a single tech-debt sweep pass over <code>rui-reports</code> before the next reporting cycle; treat the 76 as the work list.'
        },
        {
          severity: 'green', category: 'revert-signal',
          name: 'No reverts, no fix-on-fix — yet',
          hint: '0 commits in the window contain <code>revert</code>, <code>fixup</code>, or <code>rollback</code> in the subject. 5 of the 6 subjects are <code>type(scope): summary</code> — only the bulk <code>feat: next</code> commit on 2026-07-17 has a zero-information subject.',
          action: 'Watch: if the diagram skill re-opens the same 4 hot files past 6 touches each, the absence of reverts flips from a positive signal to a smell.'
        },
        {
          severity: 'amber', category: 'commit-hygiene',
          name: 'One zero-information subject',
          hint: '1 of 6 commits in the window (16%) carries the subject <code>"feat: next"</code>. It is the largest single commit by far (the entire <code>rui-code</code> family, ~337 files). The other 5 are properly namespaced (<code>feat(rui-tools):</code>, <code>refactor:</code>, <code>docs(rui-reports/diagram):</code>).',
          action: 'Reject single-word or non-namespaced subjects in a pre-commit hook, or at minimum require <code>type(scope): summary</code> on any commit ≥ 100 files.'
        }
      ]
    },

    health: {
      languages: [
        { kind: 'Markdown (.md)', files: 547, loc: 72439,  percent: 68,  barWidth: 200 },
        { kind: 'JS / MJS',       files: 154, loc: 26464,  percent: 25,  barWidth: 75  },
        { kind: 'CSS',            files: 13,  loc: 5283,   percent: 5,   barWidth: 15  },
        { kind: 'HTML',           files: 13,  loc: 2598,   percent: 2,   barWidth: 7   },
        { kind: 'Vue',            files: 10,  loc: 383,    percent: 0.4, barWidth: 1   },
        { kind: 'JSON',           files: 50,  loc: 0,      percent: 0,   barWidth: 0   },
        { kind: 'Fonts (.ttf)',   files: 54,  loc: 0,      percent: 0,   barWidth: 0   },
        { kind: 'Other (txt/csv/yaml/wasm/py)', files: 46, loc: 0, percent: 0, barWidth: 0 },
        { kind: 'Total tracked',  files: 887, loc: 107167, percent: 100, barWidth: 200 }
      ],
      skills: [
        { name: 'rui-code',    files: 338, skillMd: 9, evals: 9, references: 311, notes: '9 sub-skills (chrome, css, fastapi, h5, nginx, nodejs, tauri, vite, vue); 337 of 338 files added in the bulk 2026-07-17 commit' },
        { name: 'rui-init',    files: 52,  skillMd: 1, evals: 1, references: 12,  notes: '5-step pipeline (detect → explore → generate → arch → verify)' },
        { name: 'rui-reports', files: 256, skillMd: 5, evals: 4, references: 27,  notes: '5 sub-skills: daily, diagram, files, quickstart, test; diagram engine (113 files, 10.1K LOC) is the dominant sub-product' },
        { name: 'rui-test',    files: 21,  skillMd: 1, evals: 1, references: 14,  notes: 'Smallest skill; 0 TODO/FIXME markers' },
        { name: 'rui-tools',   files: 220, skillMd: 10, evals: 8, references: 36, notes: '10 sub-skills (cc, git, github, import, lighthouse, mermaid, public-api, skill, tmux, ui-ux); ui-ux bundle is the font-asset anchor' }
      ],
      tests: {
        testLoc: 1161,
        allJsLoc: 26464,
        ratio: 0.0439,
        threshold: 0.10,
        testFileCount: 5,
        verdict: 'RED',
        color: 'red'
      },
      techDebt: [
        { marker: 'TODO / FIXME / XXX in skills', count: 96, verdict: 'AMBER', color: 'amber', share: '79% concentrated in rui-reports (76)' },
        { marker: 'TODO / FIXME / XXX in rui-init', count: 6,  verdict: 'GREEN', color: 'green', share: '6%' },
        { marker: 'TODO / FIXME / XXX in rui-test', count: 0,  verdict: 'GREEN', color: 'green', share: '—' }
      ],
      branches: [
        { name: 'main', lastCommit: '2026-07-17 23:23 +08:00', ageDays: 1, status: 'AMBER', note: 'only branch; 6 commits, 1,264 file touches', color: 'amber' }
      ],
      dependencies: {
        text: 'The skills catalog itself ships no top-level <code>package.json</code>. The only sub-project that does is <code>rui-reports/diagram</code>, which depends on Vue 3, mermaid, html2canvas, jsPDF, xlsx, and a <code>tree-sitter-dart-wasm</code> bundle. None of those are versioned from a top-level lockfile, and the <code>rui-code</code> sub-skills (9 of them) do not declare any runtime deps at all — they are pure <code>SKILL.md</code> + <code>references/</code> bundles.',
        verdict: 'AMBER',
        color: 'amber'
      }
    },

    people: {
      distribution: [
        { author: 'YourName <you@example.com>',      commits: 5, percent: 83, barWidth: 250 },
        { author: 'Claude <claude@anthropic.com>',   commits: 1, percent: 17, barWidth: 51 }
      ],
      busFactor: [
        { bucket: 'Files touched by 1 distinct author (window)',  files: 1264, percent: 100, verdict: 'RED', color: 'red' },
        { bucket: 'Files touched by 2 distinct authors (window)', files: 0,    percent: 0,   verdict: '—',  color: 'muted' },
        { bucket: 'Files touched by 3+ distinct authors (window)', files: 0,   percent: 0,   verdict: '—',  color: 'muted' }
      ],
      activityPulse: [
        { date: '2026-07-12', day: 'Sun', commits: 2, hint: 'initial seed: rui-tools + rui-reports code-quality components', barWidth: 100 },
        { date: '2026-07-13', day: 'Mon', commits: 2, hint: 'refactor: move diagram engine; docs overhaul',                  barWidth: 100 },
        { date: '2026-07-14', day: 'Tue', commits: 1, hint: 'docs(rui-reports/diagram): expand edge heuristics',             barWidth: 50  },
        { date: '2026-07-15', day: 'Wed', commits: 0, hint: 'quiet',                                                       barWidth: 0   },
        { date: '2026-07-16', day: 'Thu', commits: 0, hint: 'quiet',                                                       barWidth: 0   },
        { date: '2026-07-17', day: 'Fri', commits: 1, hint: 'feat: next — bulk-seed rui-code (337 files, 1 commit)',        barWidth: 50  },
        { date: '2026-07-18', day: 'Sat', commits: 0, hint: 'quiet (report day)',                                           barWidth: 0   }
      ],
      review: {
        text: 'No <code>gh</code> review signal in <code>.claude/skills</code> — no <code>.github/workflows</code>, no <code>PULL_REQUEST_TEMPLATE.md</code>, no <code>CODEOWNERS</code>. 0 of 0 PRs were reviewed, because no PRs were opened. All 6 commits landed on <code>main</code> by direct commit, including the 337-file <code>rui-code</code> bulk seed.',
        verdict: 'RED',
        color: 'red'
      },
      newContributors: 'One new author appeared in the window: <code>Claude &lt;claude@anthropic.com&gt;</code> on 2026-07-17 (1 commit, 337 files added, the entire <code>rui-code</code> family). The other author (<code>YourName &lt;you@example.com&gt;</code>) was already active earlier in the window.'
    }
  };

  /* ═══════════════════════════════════════════════════════════════════
     PUBLIC EXPORTS
     ─────────────────────────────────────────────────────────────────── */
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

  // Keep a reference to the template's example data if the page-shell
  // is opened without our data (e.g. someone copies just index.html).
  // Falls back to ACTIVE_DATA so the report still renders usefully.
  var EXAMPLE_DATA = ACTIVE_DATA;

  window.REPORT_DATA_SCHEMA = {
    defaults: DEFAULT_DATA,
    example:  EXAMPLE_DATA,
    merge:    mergeWithDefaults,
    na:       na,
    version:  1
  };

  // Active data: defaults → ACTIVE_DATA (last writer wins).
  window.REPORT_DATA = mergeWithDefaults(window.REPORT_DATA || ACTIVE_DATA);
})();
