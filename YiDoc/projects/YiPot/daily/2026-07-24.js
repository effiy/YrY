/**
 * yry-report-daily — CTO daily project report
 * ----------------------------------------------------------------------
 * Generated: 2026-07-24
 * Project: YiPot (Tauri 1.8 + React 18 desktop translation tool)
 * Source: /Users/ruiyi/Downloads/YrY/YiPot
 * Mode: report (offline, git + filesystem only)
 * Window: 1d (since 2026-07-24)
 *
 * Schema source: YiDoc/templates/daily/report/data.js (@data_shape).
 * The shell lives in YiDoc/templates/daily/report/ and is referenced
 * from this directory via ../../../templates/daily/report/ — only
 * <YYYY-MM-DD>.js varies per project per date.
 */
window.REPORT_DATA = {
  meta: {
    date: '2026-07-24',
    window: '1d',
    sinceDate: '2026-07-24',
    untilDate: '2026-07-24',
    timestamp: '2026-07-24T15:30:00.000Z',
    title: 'YrY · Daily CTO Report · 2026-07-24 · YiPot',
  },
  projects: [
    {
      project: 'YiPot',
      scope: '/Users/ruiyi/Downloads/YrY/YiPot',
      scopeShort: 'YiPot',

      summary: {
        kpis: [
          { label: 'Commits',       value: '2',     sub: 'in 1d window',                tone: 'normal' },
          { label: 'Insertions',    value: '+53,190', sub: 'lines added (index.html bulk)', tone: 'warn' },
          { label: 'Deletions',      value: '−0',      sub: 'no removals',                tone: 'normal' },
          { label: 'Authors',        value: '1',       sub: 'single-author — bus-factor risk', tone: 'critical' },
          { label: 'Files touched',  value: '10',      sub: 'unique paths',               tone: 'normal' },
          { label: 'Total LOC',      value: '~20K',   sub: 'src/ + src-tauri/src',       tone: 'normal' },
        ],
        contributors: [
          { author: 'Chengliang.Yi1', commits: '2', percent: '100%', barWidth: 100 },
        ],
        hotFiles: [
          { rank: 1, path: 'YiPot/index.html',                                            touches: 2 },
          { rank: 2, path: 'YiPot/yarn.lock',                                             touches: 1 },
          { rank: 3, path: 'YiPot/vite.config.js',                                         touches: 1 },
          { rank: 4, path: 'YiPot/updater/updater.mjs',                                    touches: 1 },
          { rank: 5, path: 'YiPot/updater/updater-for-fix-runtime.mjs',                    touches: 1 },
        ],
        narrative: {
          shipped: 'Two same-day commits touching the updater bundle (updater.mjs, updater-for-fix-runtime.mjs) and the top-level index.html. The bulk of the +53K insertions come from index.html + yarn.lock churn rather than new business logic.',
          atRisk: 'Single-author repo with zero test coverage — any bus-factor or regression on the Tauri 1.8 IPC surface goes undetected until runtime.',
          drifting: 'No deletions in the window suggests accumulation without pruning; the updater tree now carries two parallel .mjs files (updater + updater-for-fix-runtime) — drift toward a forked updater path.',
          watch: 'The pinned Tauri 1.8 plugin ecosystem (tauri-plugin-sql/store/fs-watch/log/autostart-api) is frozen; a future Tauri 2.x migration is not in scope but remains the largest latent dependency risk.',
        },
      },

      risk: {
        legend: { green: 'on-plan', amber: 'watch', red: 'act now' },
        items: [
          { severity: 'red',   name: 'Zero test coverage',         hint: 'No vitest/jest config; 0 test files in src/ or src-tauri/src/',           action: 'Stand up a Vitest harness around the 21 translate engines first — they are the highest-churn surface.', category: 'quality' },
          { severity: 'red',   name: 'Single-author bus factor',   hint: '100% of 1d commits from one author; no reviewer coverage',             action: 'Pair on the next updater change; introduce a second committer on the Tauri IPC bridge.', category: 'people' },
          { severity: 'amber', name: 'Updater path fork',          hint: 'updater.mjs and updater-for-fix-runtime.mjs coexist',                   action: 'Consolidate onto one updater entry; delete the fix-runtime variant once the runtime patch lands.', category: 'maintainability' },
          { severity: 'amber', name: 'Local HTTP bridge unauth',   hint: 'tiny_http on 127.0.0.1:60828 exposes /translate, /ocr_* with no auth', action: 'Bind to a per-session token or a Unix domain socket; see apis/data.js P0 alert.', category: 'security' },
          { severity: 'amber', name: 'Index.html bulk insertions',  hint: '+53K lines in index.html in one day — likely a bundled/generated artifact committed', action: 'Verify index.html is source, not generated; if generated, move to a build output and gitignore.', category: 'hygiene' },
        ],
      },

      health: {
        languages: [
          { kind: 'jsx', files: 141, loc: 14820, percent: '73.7', barWidth: 74 },
          { kind: 'rs',  files: 14,  loc: 4200,  percent: '20.9', barWidth: 21 },
          { kind: 'ts',  files: 41,  loc: 900,   percent: '4.5',  barWidth: 5 },
          { kind: 'js',  files: 5,   loc: 177,    percent: '0.9',  barWidth: 1 },
        ],
        skills: [
          { name: 'yry-init',   files: 0, skillMd: '—', evals: 0, references: '—', notes: 'Docs catalog pipeline not invoked today.' },
          { name: 'yry-reports', files: 1, skillMd: 'apis + daily', evals: 0, references: 'YiDoc/projects/YiPot/apis/, YiDoc/projects/YiPot/daily/', notes: 'apis report present (27 endpoints, score 34); daily report being regenerated now.' },
          { name: 'yry-code',   files: 0, skillMd: '—', evals: 0, references: '—', notes: 'No framework pattern questions today.' },
          { name: 'yry-test',   files: 0, skillMd: '—', evals: 0, references: '—', notes: 'No test framework — skill not applicable yet.' },
        ],
        tests: {
          testLoc: 0,
          allJsLoc: 15897,
          ratio: '0.0%',
          threshold: '20%',
          verdict: 'critical — no test harness',
          color: 'red',
        },
        techDebt: [
          { marker: 'TODO',   count: 0, verdict: 'clean',      color: 'green', share: '0%' },
          { marker: 'FIXME',  count: 0, verdict: 'clean',      color: 'green', share: '0%' },
          { marker: 'XXX',    count: 0, verdict: 'clean',      color: 'green', share: '0%' },
        ],
        branches: [
          { name: 'master', lastCommit: '2026-07-24', ageDays: 0, status: 'active', note: 'Only branch; long-lived branches not applicable', color: 'green' },
        ],
        dependencies: {
          text: '33 runtime + 7 dev (React 18, Vite 5, NextUI 2, Tauri 1.8 plugin pins); pnpm-lock.yaml present',
          verdict: 'stable — Tauri 1.8 plugin ecosystem frozen by design',
          color: 'green',
        },
        lighthouse: {
          scores: { performance: '—', accessibility: '—', bestPractices: '—', seo: '—' },
          metrics: { fcp: '—', lcp: '—', tbt: '—', cls: '—', tti: '—' },
          verdict: 'Tauri desktop app — lighthouse not applicable',
          color: 'gray',
        },
      },

      people: {
        distribution: [
          { author: 'Chengliang.Yi1', commits: '2', percent: '100%', barWidth: 100 },
        ],
        busFactor: [
          { bucket: '1 author',  files: 201, percent: '100%', verdict: 'single-author — critical bus factor', color: 'red' },
          { bucket: '2 authors', files: 0,   percent: '0%',   verdict: '—',                                   color: 'gray' },
          { bucket: '3+ authors',files: 0,   percent: '0%',   verdict: '—',                                   color: 'gray' },
        ],
        activityPulse: [
          { date: '2026-07-24', day: 'Thu', commits: 2, hint: 'updater + index.html churn', barWidth: 100 },
          { date: '2026-07-23', day: 'Wed', commits: 1, hint: 'minor',                     barWidth: 50 },
        ],
        review: {
          text: '0% review coverage — single-author repo, no PR review process observed',
          verdict: 'no review process — act',
          color: 'red',
        },
        newContributors: '0 in window',
      },
    },
  ],
};
