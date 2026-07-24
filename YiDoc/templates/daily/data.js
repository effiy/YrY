/**
 * @file: data.js
 * @purpose: Plan template data schema + default/empty values for the
 *           `/daily plan` template. This is the single source of truth for
 *           what the rendered plan can render. The Vue app in index.js reads
 *           `window.PLAN_DATA` and renders all 13 sections from it; the
 *           markdown exporter in index.js also reads the same shape.
 *
 * @four_file_layout:
 *   data.js   — schema, defaults, helpers, example data
 *   index.html — page shell (loads loader.js, this file, index.css, index.js)
 *   index.css — all styles (layered: reset → tokens → base → sections → utilities)
 *   index.js   — Vue 3 app: inline template + interactivity + markdown export
 *
 * @data_shape (window.PLAN_DATA):
 *   {
 *     meta: {
 *       project:    string,        // project name shown in the header
 *       date:       'YYYY-MM-DD',  // generation date (DRAFT tag)
 *       timestamp:  ISO-8601,      // full generation timestamp
 *       horizon:    string,        // inner tier window, e.g. '30d', '45d'
 *       format:     'html' | 'md'  // source format hint
 *     },
 *     tiers: {
 *       '30d':  boolean,           // render the 30-day section
 *       '90d':  boolean,           // render the 90-day section
 *       'long': boolean            // render the long-term section
 *     },
 *     context: {
 *       paragraph:      string,    // 3-5 sentence framing across all tiers
 *       lastCommit:     string,    // '<short-hash> <subject>'
 *       activeBranches: string,    // count + names, e.g. '4 (main, feat/...)'
 *       todoCount:      number,    // 'git grep TODO|FIXME|XXX | wc -l'
 *       testRatio:      number,    // tests-LOC / src-LOC ratio
 *       medianCommits:  number     // median commits/day over the lookback window
 *     },
 *     diff: {
 *       enabled:        boolean,   // false → render exclusion line, skip section
 *       verdict:        'green' | 'amber' | 'red',
 *       verdictUpper:   string,    // upper-cased verdict for the badge
 *       verdictLabel:   string,    // e.g. 'minor drift'
 *       priorDate:      string,    // 'YYYY-MM-DD' of the prior plan
 *       counts:         { stable, changed, added, removed },
 *       changed:        [ {id, name, fields:[{field, old, new}]} ],
 *       added:          [ {id, name} ],
 *       removed:        [ {id, name, reason} ],
 *       assumptionChanges: [ {id, from, to} ]
 *     },
 *     assumptions: {
 *       open, validated, invalidated: number,
 *       rows: [ {id, text, tier, validation, signal, consequence, owner, status, inferred} ]
 *     },
 *     decisions: {
 *       made, superseded, reversed: number,
 *       rows: [ {id, date, decision, rationale, alternatives, reversibility, tier, owner, status, inferred} ]
 *     },
 *     tier30d: {
 *       milestones: [ {id, name, window, exit, dependsOn, dod} ],
 *       workItems:  [ {id, title, size, owner, deps, files, risk} ]
 *     },
 *     tier90d: {
 *       themes: [ {id, name, exit, rollup, owner, northStar} ],
 *       epics:  [ {id, title, size, deps, risk} ]
 *     },
 *     tierLong: {
 *       bets:       [ {id, name, hypothesis, rollup, northStar, kill, decisionPoint} ],
 *       shifts:     [ string ],
 *       northStars: [ string ]
 *     },
 *     traceability: [ {workItem, milestone, theme, bet, northStar} ],
 *     capacity: {
 *       verdict:        'green' | 'amber' | 'red',
 *       verdictUpper:   string,
 *       available:      number,    // person-days
 *       committers:     number,
 *       workingDays:    number,
 *       focus:          number,    // focus factor, e.g. 0.6
 *       demand:         number,
 *       workDemand:     number,
 *       meetingDemand:  number,
 *       oncallDemand:   number,
 *       bufferDemand:   number,
 *       deltaLabel:     string,    // '+8.0 person-days headroom' etc.
 *       breakdown:      [ {item, size, estimate, dependents} ],
 *       suggestedCuts:  [ string ]
 *     },
 *     risks: {
 *       actionBlock: string,        // rendered as .action div when amber/red
 *       rows:        [ {risk, tier, likelihood, impact, mitigation, owner, trigger} ]
 *     },
 *     team: {
 *       roster:   [ {author, share, files} ],
 *       alloc30d: [ {item, owner, reviewer, busFactor} ],
 *       alloc90d: [ {theme, owner} ]
 *     },
 *     review: {
 *       author, peer, stakeholder, date, peerDate, stakeholderDate, nextDate
 *     }
 *   }
 *
 * @empty_value:
 *   Render any missing scalar as '—'. Render any missing array as [].
 *   The Vue app handles both: `{{ value || '—' }}` for scalars, v-if for arrays.
 *
 * @conditional_blocks (replaces the old {{*_BLOCK}} → '' convention):
 *   `diff.changed`, `diff.added`, `diff.removed`, `diff.assumptionChanges`,
 *   and `risks.actionBlock` are all rendered with v-if. Empty arrays / empty
 *   strings produce no orphan headers.
 *
 * @markdown_export:
 *   index.js exposes `window.planToMarkdown(data)` which reads the same
 *   shape and returns a markdown string. The toolbar "Copy as Markdown"
 *   button writes it to the clipboard. Tier badges, size tags, status tags
 *   all become plain text in the markdown.
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
     HELPERS
     ────────────────────────────────────────────────────────────────── */

  /** Build a `<unassigned>` marker. */
  function unassigned() { return '<unassigned>'; }

  /** Build a row template comment for documentation. */
  function rowHint(text) { return '<!-- ' + text + ' -->'; }

  /* ═══════════════════════════════════════════════════════════════════
     DEFAULT DATA — empty / placeholder values for "fresh template" mode.
     The /daily plan command overwrites this with real git + filesystem
     data before writing the final plan file.
     ────────────────────────────────────────────────────────────────── */

  var DEFAULT_DATA = {
    meta: {
      project:   'sample-project',
      date:      'YYYY-MM-DD',
      timestamp: 'YYYY-MM-DDTHH:MM:SS+00:00',
      horizon:   '30d',
      format:    'html'
    },
    tiers: { '30d': true, '90d': true, 'long': true },

    context: {
      paragraph: '<3-5 sentence framing paragraph that names the thrust for all three tiers.>',
      lastCommit:     '<short-hash> <commit subject>',
      activeBranches: '0 (none)',
      todoCount:      0,
      testRatio:      0,
      medianCommits:  0
    },

    diff: {
      enabled:        true,
      verdict:        'green',
      verdictUpper:   'GREEN',
      verdictLabel:   'no drift',
      priorDate:      'YYYY-MM-DD',
      counts:         { stable: 0, changed: 0, added: 0, removed: 0 },
      changed:        [],
      added:          [],
      removed:        [],
      assumptionChanges: []
    },

    assumptions: {
      open: 0, validated: 0, invalidated: 0,
      rows: []
    },

    decisions: {
      made: 0, superseded: 0, reversed: 0,
      rows: []
    },

    tier30d: {
      milestones: [
        // { id, name, window, exit, dependsOn, dod }
      ],
      workItems: [
        // { id, title, size, owner, deps, files, risk }
      ]
    },

    tier90d: {
      themes: [],
      epics:  []
    },

    tierLong: {
      bets:       [],
      shifts:     [],
      northStars: []
    },

    traceability: [
      // { workItem, milestone, theme, bet, northStar }
    ],

    capacity: {
      verdict:       'green',
      verdictUpper:  'GREEN',
      available:     0,
      committers:    0,
      workingDays:   0,
      focus:         0.6,
      demand:        0,
      workDemand:    0,
      meetingDemand: 0,
      oncallDemand:  0,
      bufferDemand:  0,
      deltaLabel:    '0 person-days',
      breakdown:     [],
      suggestedCuts: []
    },

    risks: {
      actionBlock: '',
      rows:        []
    },

    team: {
      roster:   [],
      alloc30d: [],
      alloc90d: []
    },

    review: {
      author:         unassigned(),
      peer:           unassigned(),
      stakeholder:    unassigned(),
      date:           'T+0d',
      peerDate:       unassigned(),
      stakeholderDate: unassigned(),
      nextDate:       'T+7d'
    }
  };

  /* ═══════════════════════════════════════════════════════════════════
     EXAMPLE DATA — illustrative fixture, used when opening the template
     directly in a browser (no `/daily plan` invocation). It exercises
     every code path in the Vue template so the page renders something
     useful for review.
     ────────────────────────────────────────────────────────────────── */

  var EXAMPLE_DATA = {
    meta: {
      project:   'billing-service',
      date:      '2026-07-17',
      timestamp: '2026-07-17T14:30:00+08:00',
      horizon:   '30d',
      format:    'html'
    },
    tiers: { '30d': true, '90d': true, 'long': true },

    context: {
      paragraph:
        'billing-service stabilises its webhook ingestion path and ships ' +
        'proration in the next 30 days, with the reliability theme carrying ' +
        'through 90 days, anchored by the long-term bet on billing-as-a-platform. ' +
        'The single biggest assumption is webhook volume stays under 2M/day; ' +
        'the single biggest risk is the legacy retry queue starving the new ' +
        'worker pool.',
      lastCommit:     'a3f9c21 feat: add proration on plan downgrade',
      activeBranches: '4 (main, feat/invoices-v2, fix/webhook-retry, chore/deps)',
      todoCount:      47,
      testRatio:      0.31,
      medianCommits:  3.5
    },

    diff: {
      enabled:      true,
      verdict:      'amber',
      verdictUpper: 'AMBER',
      verdictLabel: 'minor drift',
      priorDate:    '2026-07-10',
      counts:       { stable: 12, changed: 3, added: 2, removed: 1 },
      changed: [
        { id: '30d-M1.2', name: 'Add exponential backoff',
          fields: [
            { field: 'Size',   old: 'M', new: 'L' },
            { field: 'Owner',  old: '<unassigned>', new: 'Priya' }
          ] }
      ],
      added: [
        { id: '30d-M3.3', name: 'Add coverage gate to CI' }
      ],
      removed: [
        { id: '30d-M2.3', name: 'PDF watermark', reason: 'no dependents' }
      ],
      assumptionChanges: [
        { id: 'A1', from: 'open', to: 'validated' }
      ]
    },

    assumptions: {
      open: 4, validated: 1, invalidated: 0,
      rows: [
        { id: 'A1', text: 'Webhook volume stays under 2M/day through the quarter',
          tier: '90d', validation: 'T+30d', signal: '7-day rolling avg',
          consequence: 'Re-plan 90d-T1 around sharding',
          owner: '<unassigned>', status: 'open', inferred: false },
        { id: 'A2', text: 'Proration math is auditable from the existing events table',
          tier: '30d', validation: 'T+7d', signal: 'reconciliation report',
          consequence: 'Re-derive proration columns before launch',
          owner: 'Priya', status: 'validated', inferred: true }
      ]
    },

    decisions: {
      made: 3, superseded: 0, reversed: 0,
      rows: [
        { id: 'DL1', date: 'T+0d',
          decision: 'Cut PDF watermark from 30d-M2',
          rationale: 'Capacity pressure; no dependents',
          alternatives: 'Keep (rejected: capacity); Defer (rejected: blocks 90d-T1)',
          reversibility: 'reversible', tier: '30d',
          owner: '<unassigned>', status: 'made', inferred: false }
      ]
    },

    tier30d: {
      milestones: [
        { id: '30d-M1', name: 'Fix webhook retry reliability',
          window: 'T+0d → T+10d', exit: 'p99 retry latency under 200ms',
          dependsOn: '—', dod: 'Replays idempotent under load test' },
        { id: '30d-M2', name: 'Ship proration MVP',
          window: 'T+5d → T+20d', exit: 'Downgrade generates credit line',
          dependsOn: '30d-M1', dod: 'Audit report matches within 0.1%' }
      ],
      workItems: [
        { id: '30d-M1.1', title: 'Add exponential backoff to webhook worker',
          size: 'M', owner: 'Priya', deps: '—',
          files: 'src/workers/webhook.ts', risk: 'medium' }
      ]
    },

    tier90d: {
      themes: [
        { id: '90d-T1', name: 'Reliability baseline',
          exit: 'Webhook success rate ≥ 99.95%',
          rollup: '30d-M1, 30d-M2',
          owner: '<unassigned>',
          northStar: 'Webhook success rate' }
      ],
      epics: [
        { id: '90d-T1.E1', title: 'Idempotent replay queue',
          size: 'XL', deps: '30d-M1', risk: 'high' }
      ]
    },

    tierLong: {
      bets: [
        { id: 'LT-B1', name: 'Billing-as-a-platform',
          hypothesis: 'We believe that a billing primitive can be productised',
          rollup: '90d-T1', northStar: 'External billing revenue',
          kill: 'No external pilot signed by T+180d',
          decisionPoint: 'T+180d' }
      ],
      shifts: [
        'Move from monolithic billing kernel to event-sourced primitives',
        'Adopt Stripe-style API surface for internal + external'
      ],
      northStars: [
        'Webhook success rate ≥ 99.95%',
        'External billing revenue / total revenue'
      ]
    },

    traceability: [
      { workItem: '30d-M1.1 — Add exponential backoff',
        milestone: '30d-M1 — Fix webhook retry reliability',
        theme:     '90d-T1 — Reliability baseline',
        bet:       'LT-B1 — Billing-as-a-platform',
        northStar: 'Webhook success rate' }
    ],

    capacity: {
      verdict:       'amber',
      verdictUpper:  'AMBER',
      available:     32,
      committers:    4,
      workingDays:   20,
      focus:         0.6,
      demand:        28,
      workDemand:    18,
      meetingDemand: 4,
      oncallDemand:  2,
      bufferDemand:  4,
      deltaLabel:    '+4.0 person-days headroom',
      breakdown: [
        { item: '30d-M1 — Fix webhook retry',     size: 'XL', estimate: 8,  dependents: 3 },
        { item: '30d-M1.1 — Add exponential backoff', size: 'M',  estimate: 3,  dependents: 1 }
      ],
      suggestedCuts: [
        '30d-M2.3 — PDF watermark (no dependents)'
      ]
    },

    risks: {
      actionBlock: 'Address amber risks before the next sprint planning session.',
      rows: [
        { risk: 'Legacy retry queue starves the new worker pool',
          tier: '30d', likelihood: 'medium', impact: 'high',
          mitigation: 'Add a circuit breaker; throttle legacy pool to 10%',
          owner: 'Priya', trigger: 'p99 retry latency > 500ms for 5 minutes' },
        { risk: 'Proration math drifts from authoritative events',
          tier: '30d', likelihood: 'low', impact: 'high',
          mitigation: 'Reconciliation report runs nightly; alert on > 0.1% drift',
          owner: '<unassigned>', trigger: 'Drift > 0.1% in nightly report' }
      ]
    },

    team: {
      roster: [
        { author: 'Priya', share: '42%', files: 'src/workers/, src/billing/' }
      ],
      alloc30d: [
        { item: '30d-M1.1', owner: 'Priya', reviewer: '<unassigned>', busFactor: 'green' }
      ],
      alloc90d: [
        { theme: '90d-T1 — Reliability baseline', owner: '<unassigned>' }
      ]
    },

    review: {
      author:         '<unassigned>',
      peer:           '<unassigned>',
      stakeholder:    '<unassigned>',
      date:           'T+0d',
      peerDate:       '<unassigned>',
      stakeholderDate: '<unassigned>',
      nextDate:       'T+7d'
    }
  };

  /* ═══════════════════════════════════════════════════════════════════
     PUBLIC EXPORTS
     ────────────────────────────────────────────────────────────────── */

  /**
   * Deep-merge defaults with the active data, so any field the user / the
   * /daily plan command forgets to fill still renders as a sensible empty
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

  window.PLAN_DATA_SCHEMA = {
    defaults: DEFAULT_DATA,
    example:  EXAMPLE_DATA,
    merge:    mergeWithDefaults,
    unassigned: unassigned,
    // Schema version — bump when the shape changes so consumers can detect
    // mismatches instead of silently rendering broken plans.
    version: 1
  };

  // Active data: window.PLAN_DATA → defaults → example (last writer wins
  // so a host page can override the data without editing this file).
  window.PLAN_DATA = mergeWithDefaults(window.PLAN_DATA || EXAMPLE_DATA);
})();
