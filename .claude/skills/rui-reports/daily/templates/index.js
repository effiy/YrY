/**
 * @file: index.js
 * @purpose: Vue 3 application for the `/daily plan` template.
 *           Single source of truth for the page — handles the inline
 *           template, all interactivity (expand/collapse, risk matrix
 *           filter, copy-as-markdown, print, and the conditional tier
 *           exclusion that `--tiers` triggered via a 1.0 + 1.0 patch).
 *
 * @data_source: window.PLAN_DATA  (set by data.js, loaded before this file)
 * @dom_mount:   #app              (defined in index.html)
 *
 * @four_file_layout: data.js · index.html · index.css · index.js
 *
 * @composables:
 *   - useRiskMatrixFilter() — click cell to filter the risk table by
 *     likelihood × impact. Identical behaviour to the original
 *     template's risk matrix.
 *   - useToolbar()          — expand/collapse all, copy-as-markdown, print.
 *   - useTierExclusion()    — when `data.tiers.<x>` is false, render the
 *     section as "— excluded via --tiers —" so the nav anchors stay
 *     stable.
 *
 * @markdown_export:
 *   window.planToMarkdown(data)  — pure function, returns a markdown
 *   string. Same shape as PLAN_DATA, no Vue dependency. Used by the
 *   "Copy as Markdown" button and by external tools that want to
 *   write a `.md` plan file.
 */
(function () {
  'use strict';

  var DATA = window.PLAN_DATA || {};
  var SCHEMA = window.PLAN_DATA_SCHEMA || {};

  /* ═══════════════════════════════════════════════════════════════════
     VUE LOADER (identical pattern to other rui-report-* pages)
     ────────────────────────────────────────────────────────────────── */

  function whenVueReady() {
    if (window.Vue) return Promise.resolve();
    if (window.__vueLoadPromise) return window.__vueLoadPromise;
    return new Promise(function (resolve) {
      var tries = 0;
      var t = setInterval(function () {
        if (window.Vue) { clearInterval(t); resolve(); }
        else if (++tries > 50) { clearInterval(t); resolve(); }
      }, 100);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     RENDER HELPERS (also used by planToMarkdown)
     ────────────────────────────────────────────────────────────────── */

  function dash(v) { return (v === undefined || v === null || v === '') ? '—' : v; }

  function escapeCellPipes(s) { return String(s == null ? '' : s).replace(/\|/g, '\\|'); }

  function sizeTag(size) {
    var cls = ({ S: 'tag-s', M: 'tag-m', L: 'tag-l', XL: 'tag-xl' })[size];
    return cls ? '<span class="tag ' + cls + '">' + size + '</span>' : dash(size);
  }

  function riskTag(risk) {
    var cls = ({ low: 'risk-low', medium: 'risk-medium', high: 'risk-high' })[risk];
    return cls ? '<span class="' + cls + '">' + risk + '</span>' : dash(risk);
  }

  function statusTag(status) {
    var cls = ({
      open:        'status-open',
      validated:   'status-validated',
      invalidated: 'status-invalidated',
      made:        'status-made',
      superseded:  'status-superseded',
      reversed:    'status-reversed'
    })[status];
    return cls ? '<span class="' + cls + '">' + status + '</span>' : dash(status);
  }

  function reversibilityTag(rev) {
    var cls = ({
      'reversible':       'rev-reversible',
      'hard to reverse':  'rev-hard',
      'irreversible':     'rev-irreversible'
    })[rev];
    return cls ? '<span class="' + cls + '">' + rev + '</span>' : dash(rev);
  }

  function tierBadge(tier) {
    var cls = ({ '30d': 'tier-30d', '90d': 'tier-90d', 'long': 'tier-long' })[tier];
    return cls ? '<span class="tier-badge ' + cls + '">' + tier.toUpperCase() + '</span>' : dash(tier);
  }

  function rollupCell(parent) { return parent ? parent : '<span class="orphan">— ORPHAN —</span>'; }

  function inferredTag(inferred) { return inferred ? ' <code>[inferred]</code>' : ''; }

  /* ═══════════════════════════════════════════════════════════════════
     VUE TEMPLATE — built once at top level so it can be passed to
     Vue.createApp. All 13 sections are rendered here; partials (the
     old templates/partials/*.html files) are inlined because the
     data is fully reactive and the Vue v-if / v-for handle the
     conditional rendering that the old {{*_BLOCK}} convention did.
     ────────────────────────────────────────────────────────────────── */

  var TEMPLATE = String.raw`
    <div class="rui-plan-report">

      <!-- HEADER -->
      <header>
        <h1>{{ meta.project }} — Engineering Plan <span class="draft-tag">DRAFT — {{ meta.date }}</span></h1>
        <p class="meta">
          Horizon: {{ meta.horizon }} · Tiers: 30d / 90d / long-term ·
          Generated {{ meta.timestamp }} · Offline + git-only
        </p>
      </header>

      <!-- NAV (13 anchors — kept stable even when a tier is excluded) -->
      <nav>
        <a href="#diff">Diff</a>
        <a href="#context">Context</a>
        <a href="#assumptions">Assumptions</a>
        <a href="#decisions">Decisions</a>
        <a href="#tier-30d">30 days</a>
        <a href="#tier-90d">90 days</a>
        <a href="#tier-long">Long-term</a>
        <a href="#traceability">Traceability</a>
        <a href="#capacity">Capacity</a>
        <a href="#risks">Risks</a>
        <a href="#team">Team</a>
        <a href="#dod">Definition of Done</a>
        <a href="#review">Review</a>
      </nav>

      <!-- TOOLBAR -->
      <div class="toolbar">
        <button type="button" data-action="expand">Expand all</button>
        <button type="button" data-action="collapse">Collapse all</button>
        <button type="button" data-action="copy-md">Copy as Markdown</button>
        <button type="button" data-action="print">Print / PDF</button>
      </div>

      <main>
        <!-- ══════════════════════════════════════════════════════════
             1. PLAN DIFF
             ══════════════════════════════════════════════════════════ -->
        <section id="diff">
          <h2>Plan Diff vs Prior</h2>
          <div v-if="!diff.enabled" class="diff-note">— excluded via --no-diff —</div>
          <div v-else>
            <div class="diff-summary">
              <span class="diff-badge" :class="'diff-' + diff.verdict">
                {{ diff.verdictUpper }} — {{ diff.verdictLabel }}
              </span>
              <p class="diff-vs">vs prior plan dated <code>{{ diff.priorDate }}</code></p>
              <p class="diff-counts">
                <span class="diff-stable">{{ diff.counts.stable }} stable</span> ·
                <span class="diff-changed">{{ diff.counts.changed }} changed</span> ·
                <span class="diff-added">{{ diff.counts.added }} added</span> ·
                <span class="diff-removed">{{ diff.counts.removed }} removed</span>
              </p>
            </div>

            <div v-if="diff.changed.length">
              <h3>Changed items</h3>
              <ul class="diff-changed-list">
                <li v-for="(it, i) in diff.changed" :key="'c-' + i">
                  <code>{{ it.id }}</code> — {{ it.name }}
                  <ul v-if="it.fields && it.fields.length" class="diff-field-changes">
                    <li v-for="(f, j) in it.fields" :key="'cf-' + i + '-' + j">
                      <span class="diff-field">{{ f.field }}:</span>
                      <span class="diff-old">{{ f.old }}</span> →
                      <span class="diff-new">{{ f.new }}</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

            <div v-if="diff.added.length">
              <h3>Added items</h3>
              <ul class="diff-added-list">
                <li v-for="(it, i) in diff.added" :key="'a-' + i">
                  <span class="diff-plus">+</span>
                  <code>{{ it.id }}</code> — {{ it.name }}
                </li>
              </ul>
            </div>

            <div v-if="diff.removed.length">
              <h3>Removed items</h3>
              <ul class="diff-removed-list">
                <li v-for="(it, i) in diff.removed" :key="'r-' + i">
                  <span class="diff-minus">−</span>
                  <code>{{ it.id }}</code> — {{ it.name }}
                  <span v-if="it.reason" class="diff-reason"> (cut — {{ it.reason }})</span>
                </li>
              </ul>
            </div>

            <div v-if="diff.assumptionChanges.length">
              <h3>Assumption status changes</h3>
              <ul class="diff-assumption-changes">
                <li v-for="(it, i) in diff.assumptionChanges" :key="'ac-' + i">
                  <code>{{ it.id }}</code> —
                  <span class="diff-old">{{ it.from }}</span> →
                  <span class="diff-new" :class="'status-' + it.to">{{ it.to }}</span>
                </li>
              </ul>
            </div>

            <p class="diff-note">
              Drift verdict escalates to RED if any assumption moved to
              <code>invalidated</code>, regardless of item counts — a broken
              assumption is a structural change.
            </p>
          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════
             2. CONTEXT
             ══════════════════════════════════════════════════════════ -->
        <section id="context">
          <h2>Context</h2>
          <p>{{ context.paragraph }}</p>
          <table>
            <tr><th>Last commit</th><td><code>{{ context.lastCommit }}</code></td></tr>
            <tr><th>Active branches</th><td>{{ context.activeBranches }}</td></tr>
            <tr><th>TODO / FIXME</th><td>{{ context.todoCount }}</td></tr>
            <tr><th>Test / src ratio</th><td>{{ context.testRatio }}</td></tr>
            <tr><th>Median commits/day</th><td>{{ context.medianCommits }}</td></tr>
          </table>
        </section>

        <!-- ══════════════════════════════════════════════════════════
             3. ASSUMPTIONS
             ══════════════════════════════════════════════════════════ -->
        <section id="assumptions">
          <h2>Assumptions Register</h2>
          <div class="assumptions-summary">
            <span class="assumptions-count">{{ assumptions.open }} open</span> ·
            <span class="assumptions-count-validated">{{ assumptions.validated }} validated</span> ·
            <span class="assumptions-count-invalidated">{{ assumptions.invalidated }} invalidated</span>
          </div>
          <table id="assumptions-table">
            <tr>
              <th>ID</th>
              <th>Assumption</th>
              <th>Tier</th>
              <th>Validation</th>
              <th>Signal</th>
              <th>Consequence</th>
              <th>Owner</th>
              <th>Status</th>
            </tr>
            <tr v-for="(r, i) in assumptions.rows" :key="'a-' + i"
                :data-tier="r.tier" :data-status="r.status">
              <td>
                <code>{{ r.id }}</code><span v-html="inferred(r.inferred)"></span>
              </td>
              <td>{{ r.text }}</td>
              <td><span class="tier-badge" :class="'tier-' + tierShort(r.tier)">{{ r.tier }}</span></td>
              <td>{{ r.validation }}</td>
              <td>{{ r.signal }}</td>
              <td>{{ r.consequence }}</td>
              <td>{{ r.owner }}</td>
              <td><span :class="'status-' + r.status">{{ r.status }}</span></td>
            </tr>
          </table>
          <p class="assumptions-note">
            Inferred assumptions are tagged <code>[inferred]</code> —
            review and confirm or strike. Every assumption should have a
            concrete consequence, not "re-evaluate".
          </p>
        </section>

        <!-- ══════════════════════════════════════════════════════════
             4. DECISIONS
             ══════════════════════════════════════════════════════════ -->
        <section id="decisions">
          <h2>Decision Log</h2>
          <div class="decisions-summary">
            <span class="decisions-count-made">{{ decisions.made }} made</span> ·
            <span class="decisions-count-superseded">{{ decisions.superseded }} superseded</span> ·
            <span class="decisions-count-reversed">{{ decisions.reversed }} reversed</span>
          </div>
          <table id="decisions-table">
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Decision</th>
              <th>Rationale</th>
              <th>Alternatives considered</th>
              <th>Reversibility</th>
              <th>Tier</th>
              <th>Owner</th>
              <th>Status</th>
            </tr>
            <tr v-for="(r, i) in decisions.rows" :key="'d-' + i"
                :data-tier="r.tier" :data-status="r.status" :data-reversibility="r.reversibility">
              <td>
                <code>{{ r.id }}</code><span v-html="inferred(r.inferred)"></span>
              </td>
              <td>{{ r.date }}</td>
              <td>{{ r.decision }}</td>
              <td>{{ r.rationale }}</td>
              <td>{{ r.alternatives }}</td>
              <td><span :class="'rev-' + revShort(r.reversibility)">{{ r.reversibility }}</span></td>
              <td><span class="tier-badge" :class="'tier-' + tierShort(r.tier)">{{ r.tier }}</span></td>
              <td>{{ r.owner }}</td>
              <td><span :class="'status-' + r.status">{{ r.status }}</span></td>
            </tr>
          </table>
          <p class="decisions-note">
            Every cut, override, and tier exclusion is a decision — log it.
            Inferred decisions are tagged <code>[inferred]</code> — review
            and confirm or expand. Irreversible decisions deserve more
            rationale text (3+ sentences).
          </p>
        </section>

        <!-- ══════════════════════════════════════════════════════════
             5. TIER 30D (sprint-tier)
             ══════════════════════════════════════════════════════════ -->
        <section id="tier-30d">
          <h2><span class="tier-badge tier-30d">30 DAYS</span> Sprint-tier execution</h2>
          <p v-if="!tiers['30d']" class="rollup">— excluded via --tiers —</p>
          <div v-else>
            <h3>Milestones</h3>
            <table>
              <tr><th>ID</th><th>Name</th><th>Window</th><th>Exit criteria</th><th>Depends on</th><th>DoD</th></tr>
              <tr v-for="(m, i) in tier30d.milestones" :key="'m-' + i">
                <td><code>{{ m.id }}</code></td>
                <td>{{ m.name }}</td>
                <td>{{ m.window }}</td>
                <td>{{ m.exit }}</td>
                <td>{{ m.dependsOn }}</td>
                <td>{{ m.dod }}</td>
              </tr>
            </table>
            <h3>Work items</h3>
            <table>
              <tr>
                <th>ID</th><th>Title</th><th>Size</th><th>Owner</th>
                <th>Dependencies</th><th>Files likely touched</th><th>Risk</th>
              </tr>
              <tr v-for="(w, i) in tier30d.workItems" :key="'w-' + i">
                <td><code>{{ w.id }}</code></td>
                <td>{{ w.title }}</td>
                <td v-html="renderSize(w.size)"></td>
                <td>{{ w.owner }}</td>
                <td>{{ w.deps }}</td>
                <td><code>{{ w.files }}</code></td>
                <td><span :class="'risk-' + w.risk">{{ w.risk }}</span></td>
              </tr>
            </table>
            <p class="rollup">Roll-up: 30d milestones → 90d themes (see 90-day tier).</p>
          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════
             6. TIER 90D (quarter-tier)
             ══════════════════════════════════════════════════════════ -->
        <section id="tier-90d">
          <h2><span class="tier-badge tier-90d">90 DAYS</span> Quarter-tier commitments</h2>
          <p v-if="!tiers['90d']" class="rollup">— excluded via --tiers —</p>
          <div v-else>
            <h3>Themes</h3>
            <table>
              <tr>
                <th>ID</th><th>Name</th><th>Exit criteria</th>
                <th>Roll-up from</th><th>Owner</th><th>North-star metric</th>
              </tr>
              <tr v-for="(t, i) in tier90d.themes" :key="'t-' + i">
                <td><code>{{ t.id }}</code></td>
                <td>{{ t.name }}</td>
                <td>{{ t.exit }}</td>
                <td>{{ t.rollup }}</td>
                <td>{{ t.owner }}</td>
                <td>{{ t.northStar }}</td>
              </tr>
            </table>
            <h3>Epics</h3>
            <table>
              <tr><th>ID</th><th>Title</th><th>Size</th><th>Dependencies</th><th>Risk</th></tr>
              <tr v-for="(e, i) in tier90d.epics" :key="'e-' + i">
                <td><code>{{ e.id }}</code></td>
                <td>{{ e.title }}</td>
                <td v-html="renderSize(e.size)"></td>
                <td>{{ e.deps }}</td>
                <td><span :class="'risk-' + e.risk">{{ e.risk }}</span></td>
              </tr>
            </table>
            <p class="rollup">Roll-up: 90d themes → long-term bets (see Long-term tier).</p>
          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════
             7. TIER LONG (strategic bets)
             ══════════════════════════════════════════════════════════ -->
        <section id="tier-long">
          <h2><span class="tier-badge tier-long">LONG-TERM</span> Strategic bets</h2>
          <p v-if="!tiers['long']" class="rollup">— excluded via --tiers —</p>
          <div v-else>
            <h3>Strategic bets</h3>
            <table>
              <tr>
                <th>ID</th><th>Name</th><th>Hypothesis</th>
                <th>Roll-up from</th><th>North-star metric</th>
                <th>Kill criteria</th><th>Decision point</th>
              </tr>
              <tr v-for="(b, i) in tierLong.bets" :key="'b-' + i">
                <td><code>{{ b.id }}</code></td>
                <td>{{ b.name }}</td>
                <td>{{ b.hypothesis }}</td>
                <td>{{ b.rollup }}</td>
                <td>{{ b.northStar }}</td>
                <td>{{ b.kill }}</td>
                <td>{{ b.decisionPoint }}</td>
              </tr>
            </table>
            <h3>Platform / architectural shifts anticipated</h3>
            <ul>
              <li v-for="(s, i) in tierLong.shifts" :key="'s-' + i">{{ s }}</li>
            </ul>
            <h3>Project north-star metrics</h3>
            <ul>
              <li v-for="(n, i) in tierLong.northStars" :key="'n-' + i">{{ n }}</li>
            </ul>
          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════
             8. TRACEABILITY
             ══════════════════════════════════════════════════════════ -->
        <section id="traceability">
          <h2>Traceability Matrix</h2>
          <table id="traceability-table">
            <tr>
              <th>30d work item</th>
              <th>30d milestone</th>
              <th>90d theme</th>
              <th>Long-term bet</th>
              <th>North-star metric</th>
            </tr>
            <tr v-for="(t, i) in traceability" :key="'tr-' + i">
              <td>{{ t.workItem }}</td>
              <td v-html="renderRollup(t.milestone)"></td>
              <td v-html="renderRollup(t.theme)"></td>
              <td v-html="renderRollup(t.bet)"></td>
              <td>{{ t.northStar }}</td>
            </tr>
          </table>
          <p class="rollup">
            Every row should trace 30d → 90d → long-term without gaps.
            A cell showing <code class="orphan">— ORPHAN —</code> means the
            roll-up is broken — fix it before sharing the plan.
          </p>
        </section>

        <!-- ══════════════════════════════════════════════════════════
             9. CAPACITY
             ══════════════════════════════════════════════════════════ -->
        <section id="capacity">
          <h2>Capacity vs Demand</h2>
          <div class="capacity-summary">
            <span class="capacity-badge" :class="'capacity-' + capacity.verdict">
              {{ capacity.verdictUpper }}
            </span>
            <p>
              <strong>Available:</strong> {{ capacity.available }} person-days
              ({{ capacity.committers }} committers × {{ capacity.workingDays }} days × {{ capacity.focus }} focus)
            </p>
            <p>
              <strong>Demand:</strong> {{ capacity.demand }} person-days
              ({{ capacity.workDemand }} work + {{ capacity.meetingDemand }} meetings
              + {{ capacity.oncallDemand }} oncall × 1.15 buffer)
            </p>
            <p class="capacity-delta">{{ capacity.deltaLabel }}</p>
          </div>
          <table class="capacity-demand-breakdown">
            <tr><th>Work item</th><th>Size</th><th>Estimate (days)</th><th>Dependents</th></tr>
            <tr v-for="(b, i) in capacity.breakdown" :key="'cb-' + i">
              <td>{{ b.item }}</td>
              <td v-html="renderSize(b.size)"></td>
              <td>{{ b.estimate }}</td>
              <td>{{ b.dependents }}</td>
            </tr>
            <tr class="capacity-overhead">
              <td colspan="2">Meeting overhead</td>
              <td>{{ capacity.meetingDemand }}</td>
              <td>—</td>
            </tr>
            <tr class="capacity-overhead">
              <td colspan="2">Oncall overhead</td>
              <td>{{ capacity.oncallDemand }}</td>
              <td>—</td>
            </tr>
            <tr class="capacity-overhead">
              <td colspan="2">Buffer (15%)</td>
              <td>{{ capacity.bufferDemand }}</td>
              <td>—</td>
            </tr>
            <tr class="capacity-total">
              <td colspan="2">Total demand</td>
              <td>{{ capacity.demand }}</td>
              <td>—</td>
            </tr>
          </table>
          <div v-if="capacity.suggestedCuts && capacity.suggestedCuts.length"
               class="capacity-suggested-cuts">
            <h4>Suggested cuts</h4>
            <ul>
              <li v-for="(c, i) in capacity.suggestedCuts" :key="'sc-' + i">{{ c }}</li>
            </ul>
          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════
             10. RISKS
             ══════════════════════════════════════════════════════════ -->
        <section id="risks">
          <h2>Risk Mitigations</h2>
          <div class="risk-matrix" id="risk-matrix">
            <div class="risk-matrix-grid">
              <div class="risk-matrix-cell" data-likelihood="high"   data-impact="low">High / Low</div>
              <div class="risk-matrix-cell" data-likelihood="high"   data-impact="medium">High / Medium</div>
              <div class="risk-matrix-cell risk-red"   data-likelihood="high"   data-impact="high">High / High</div>
              <div class="risk-matrix-cell" data-likelihood="medium" data-impact="low">Medium / Low</div>
              <div class="risk-matrix-cell risk-amber" data-likelihood="medium" data-impact="medium">Medium / Medium</div>
              <div class="risk-matrix-cell risk-red"   data-likelihood="medium" data-impact="high">Medium / High</div>
              <div class="risk-matrix-cell" data-likelihood="low"    data-impact="low">Low / Low</div>
              <div class="risk-matrix-cell" data-likelihood="low"    data-impact="medium">Low / Medium</div>
              <div class="risk-matrix-cell risk-amber" data-likelihood="low"    data-impact="high">Low / High</div>
            </div>
            <p class="risk-matrix-legend">
              <span class="risk-low">low</span> ·
              <span class="risk-amber">amber</span> ·
              <span class="risk-red">red</span>
              — hover a cell to filter the table below
            </p>
          </div>
          <div v-if="risks.actionBlock" class="action">
            <strong>Action:</strong> {{ risks.actionBlock }}
          </div>
          <table id="risk-table">
            <tr>
              <th>Risk</th><th>Tier</th><th>Likelihood</th><th>Impact</th>
              <th>Mitigation</th><th>Owner</th><th>Trigger</th>
            </tr>
            <tr v-for="(r, i) in risks.rows" :key="'r-' + i"
                :data-likelihood="r.likelihood" :data-impact="r.impact" :data-tier="r.tier">
              <td>{{ r.risk }}</td>
              <td><span class="tier-badge" :class="'tier-' + tierShort(r.tier)">{{ r.tier }}</span></td>
              <td><span :class="'risk-' + r.likelihood">{{ r.likelihood }}</span></td>
              <td><span :class="'risk-' + r.impact">{{ r.impact }}</span></td>
              <td>{{ r.mitigation }}</td>
              <td>{{ r.owner }}</td>
              <td>{{ r.trigger }}</td>
            </tr>
          </table>
        </section>

        <!-- ══════════════════════════════════════════════════════════
             11. TEAM
             ══════════════════════════════════════════════════════════ -->
        <section id="team">
          <h2>Team Allocation</h2>
          <h3>Roster</h3>
          <table>
            <tr><th>Author</th><th>Commit share</th><th>Files owned (top 3)</th></tr>
            <tr v-for="(r, i) in team.roster" :key="'tr-' + i">
              <td>{{ r.author }}</td>
              <td>{{ r.share }}</td>
              <td><code>{{ r.files }}</code></td>
            </tr>
          </table>
          <h3>30d allocation <span class="draft-tag">DRAFT</span></h3>
          <table>
            <tr><th>Work item</th><th>Suggested owner</th><th>Reviewer</th><th>Bus-factor flag</th></tr>
            <tr v-for="(a, i) in team.alloc30d" :key="'a30-' + i">
              <td>{{ a.item }}</td>
              <td>{{ a.owner }}</td>
              <td>{{ a.reviewer }}</td>
              <td><span :class="'bus-' + a.busFactor">{{ a.busFactor }}</span></td>
            </tr>
          </table>
          <h3>90d allocation <span class="draft-tag">DRAFT</span></h3>
          <table>
            <tr><th>Theme</th><th>Suggested owner</th></tr>
            <tr v-for="(a, i) in team.alloc90d" :key="'a90-' + i">
              <td>{{ a.theme }}</td>
              <td>{{ a.owner }}</td>
            </tr>
          </table>
        </section>

        <!-- ══════════════════════════════════════════════════════════
             12. DEFINITION OF DONE (static checklist, all unchecked)
             ══════════════════════════════════════════════════════════ -->
        <section id="dod">
          <h2>Definition of Done</h2>
          <ul class="checklist">
            <li><strong>30d DoD</strong></li>
            <li><input type="checkbox"> All 30d milestone exit criteria met</li>
            <li><input type="checkbox"> All L / XL items have a reviewer assigned</li>
            <li><input type="checkbox"> Test-to-src LOC ratio did not decrease vs baseline</li>
            <li><input type="checkbox"> No new TODO/FIXME without a linked issue</li>
            <li><strong>90d DoD</strong></li>
            <li><input type="checkbox"> All 90d theme exit criteria met (north-star metrics moved)</li>
            <li><input type="checkbox"> Every 30d milestone traces to a 90d theme</li>
            <li><input type="checkbox"> Cross-team dependencies resolved or documented</li>
            <li><input type="checkbox"> Capacity plan reviewed vs actual velocity</li>
            <li><strong>Long-term DoD</strong></li>
            <li><input type="checkbox"> Every 90d theme traces to a long-term bet</li>
            <li><input type="checkbox"> Each bet has a kill criteria + decision point</li>
            <li><input type="checkbox"> Platform shifts have a migration sketch (not a full plan)</li>
            <li><input type="checkbox"> North-star metrics reviewed quarterly</li>
          </ul>
        </section>

        <!-- ══════════════════════════════════════════════════════════
             13. REVIEW (6 groups + sign-off)
             ══════════════════════════════════════════════════════════ -->
        <section id="review">
          <h2>Review Checklist</h2>
          <h3>Narrative</h3>
          <ul class="checklist">
            <li><input type="checkbox"> Context paragraph names the thrust for all three tiers</li>
            <li><input type="checkbox"> No marketing language or hedging</li>
            <li><input type="checkbox"> The single biggest assumption is named in the context</li>
            <li><input type="checkbox"> The single biggest risk is named in the context</li>
          </ul>
          <h3>Roll-up integrity</h3>
          <ul class="checklist">
            <li><input type="checkbox"> Every 30d milestone traces to a 90d theme</li>
            <li><input type="checkbox"> Every 90d theme traces to a long-term bet</li>
            <li><input type="checkbox"> Traceability matrix has no <code>— ORPHAN —</code> cells</li>
            <li><input type="checkbox"> No 90d theme or long-term bet is an orphan</li>
          </ul>
          <h3>Capacity</h3>
          <ul class="checklist">
            <li><input type="checkbox"> Capacity verdict is green or amber (or <code>--allow-overcommit</code> documented)</li>
            <li><input type="checkbox"> Buffer is 15% of (work + meeting + oncall)</li>
            <li><input type="checkbox"> Focus factor matches the scenario</li>
            <li><input type="checkbox"> Active committer count reflects reality</li>
          </ul>
          <h3>Assumptions</h3>
          <ul class="checklist">
            <li><input type="checkbox"> Every assumption has a concrete consequence</li>
            <li><input type="checkbox"> Every assumption has a validation date in T+Nd form</li>
            <li><input type="checkbox"> Inferred assumptions are tagged <code>[inferred]</code> and reviewed</li>
            <li><input type="checkbox"> No assumption's validation date is in the past without a status update</li>
          </ul>
          <h3>Risks</h3>
          <ul class="checklist">
            <li><input type="checkbox"> Every risk has a trigger signal</li>
            <li><input type="checkbox"> Tier tags are present (30d / 90d / long)</li>
            <li><input type="checkbox"> Amber and red risks have mitigations</li>
            <li><input type="checkbox"> The highest-impact risk has a named owner</li>
          </ul>
          <h3>Sign-off</h3>
          <table class="signoff-table">
            <tr><th>Role</th><th>Name</th><th>Date</th></tr>
            <tr><td>Author</td><td>{{ review.author }}</td><td>{{ review.date }}</td></tr>
            <tr><td>Peer reviewer</td><td>{{ review.peer }}</td><td>{{ review.peerDate }}</td></tr>
            <tr><td>Stakeholder</td><td>{{ review.stakeholder }}</td><td>{{ review.stakeholderDate }}</td></tr>
            <tr><td>Next review</td><td>—</td><td>{{ review.nextDate }}</td></tr>
          </table>
          <p class="review-note">
            All checkboxes must be unchecked when the plan is written —
            the review hasn't happened yet. A pre-checked review is a lie.
            Fill the sign-off block only after walking through the checklist
            above.
          </p>
        </section>
      </main>

      <footer>
        <p>
          Generated by /daily plan · three-horizon model (30d / 90d / long-term) ·
          data is offline + git-only · label as DRAFT until reviewed
        </p>
      </footer>
    </div>
  `;

  /* ═══════════════════════════════════════════════════════════════════
     COMPOSABLE — risk matrix filter
     ────────────────────────────────────────────────────────────────── */

  function useRiskMatrixFilter() {
    var activeCell = null;
    function init() {
      var cells = document.querySelectorAll('.risk-matrix-cell');
      var rows  = document.querySelectorAll('#risk-table tr[data-likelihood]');
      if (!cells.length) return;
      cells.forEach(function (cell) {
        cell.addEventListener('click', function () {
          var lik = cell.dataset.likelihood;
          var imp = cell.dataset.impact;
          if (activeCell === cell) {
            cell.classList.remove('active');
            activeCell = null;
            rows.forEach(function (r) { r.classList.remove('risk-row-hidden'); });
            return;
          }
          cells.forEach(function (c) { c.classList.remove('active'); });
          cell.classList.add('active');
          activeCell = cell;
          rows.forEach(function (r) {
            var match = r.dataset.likelihood === lik && r.dataset.impact === imp;
            r.classList.toggle('risk-row-hidden', !match);
          });
        });
      });
    }
    return { init: init };
  }

  /* ═══════════════════════════════════════════════════════════════════
     COMPOSABLE — toolbar (expand/collapse, copy-md, print)
     ────────────────────────────────────────────────────────────────── */

  function useToolbar(plan) {
    function expandAll()   { document.querySelectorAll('section').forEach(function (s) { s.classList.remove('collapsed'); }); }
    function collapseAll() { document.querySelectorAll('section').forEach(function (s) { s.classList.add('collapsed'); }); }
    function print()       { window.print(); }
    function copyMarkdown(btn) {
      var md = planToMarkdown(plan);
      var done = function () { setBtn(btn, 'Copied!', 'Copy as Markdown'); };
      var fail = function () {
        // Fallback for browsers without async clipboard
        var ta = document.createElement('textarea');
        ta.value = md; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { setBtn(btn, 'Copy failed', 'Copy as Markdown'); }
        ta.remove();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(md).then(done, fail);
      } else { fail(); }
    }
    function setBtn(btn, text, restore) {
      if (!btn) return;
      btn.textContent = text;
      setTimeout(function () { btn.textContent = restore; }, 1500);
    }
    function init() {
      document.querySelectorAll('.toolbar button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var action = btn.dataset.action;
          if (action === 'expand')   expandAll();
          if (action === 'collapse') collapseAll();
          if (action === 'print')    print();
          if (action === 'copy-md')  copyMarkdown(btn);
        });
      });
      // Click h2 to collapse/expand (same as the original template)
      document.querySelectorAll('section > h2').forEach(function (h) {
        h.addEventListener('click', function () { h.parentElement.classList.toggle('collapsed'); });
      });
    }
    return { init: init, expandAll: expandAll, collapseAll: collapseAll, print: print, copyMarkdown: copyMarkdown };
  }

  /* ═══════════════════════════════════════════════════════════════════
     MARKDOWN EXPORTER
     ──────────────────────────────────────────────────────────────────
     Reads the same PLAN_DATA shape and returns a markdown string with
     the same 13 sections as the HTML page. Mirrors the old
     templates/plan-checklist.md placeholder list, but as pipe tables +
     checkboxes rather than a separate template file.
     ────────────────────────────────────────────────────────────────── */

  function mdRow(cells) {
    return '| ' + cells.map(escapeCellPipes).join(' | ') + ' |';
  }
  function mdHeader(headers) {
    return [
      mdRow(headers),
      '| ' + headers.map(function () { return '---'; }).join(' | ') + ' |'
    ].join('\n');
  }
  function mdExcluded() { return '— excluded via --tiers —'; }

  function planToMarkdown(d) {
    d = d || DATA;
    if (!d || !d.meta) return '# Engineering Plan (empty data)';

    var out = [];
    var meta = d.meta;
    var tiers = d.tiers || { '30d': true, '90d': true, 'long': true };

    out.push('# ' + meta.project + ' — Engineering Plan (DRAFT — ' + meta.date + ')');
    out.push('');
    out.push('> Horizon: ' + meta.horizon + ' · Tiers: 30d / 90d / long-term');
    out.push('> Generated ' + meta.timestamp + ' · Offline + git-only');
    out.push('> Label as DRAFT until reviewed.');
    out.push('');

    /* 1. DIFF */
    out.push('## Plan Diff vs Prior');
    out.push('');
    if (!d.diff || !d.diff.enabled) {
      out.push(mdExcluded());
    } else {
      var df = d.diff;
      out.push('**Verdict:** ' + df.verdictUpper + ' — ' + df.verdictLabel);
      out.push('');
      out.push('- vs prior plan dated `' + df.priorDate + '`');
      out.push('- counts: ' + df.counts.stable + ' stable · ' + df.counts.changed + ' changed · ' + df.counts.added + ' added · ' + df.counts.removed + ' removed');
      out.push('');
      if (df.changed && df.changed.length) {
        out.push('### Changed items');
        out.push('');
        df.changed.forEach(function (c) {
          out.push('- `' + c.id + '` — ' + c.name);
          (c.fields || []).forEach(function (f) {
            out.push('  - ' + f.field + ': ' + f.old + ' → ' + f.new);
          });
        });
        out.push('');
      }
      if (df.added && df.added.length) {
        out.push('### Added items');
        out.push('');
        df.added.forEach(function (a) { out.push('- + `' + a.id + '` — ' + a.name); });
        out.push('');
      }
      if (df.removed && df.removed.length) {
        out.push('### Removed items');
        out.push('');
        df.removed.forEach(function (r) {
          out.push('- − `' + r.id + '` — ' + r.name + (r.reason ? ' (cut — ' + r.reason + ')' : ''));
        });
        out.push('');
      }
      if (df.assumptionChanges && df.assumptionChanges.length) {
        out.push('### Assumption status changes');
        out.push('');
        df.assumptionChanges.forEach(function (a) {
          out.push('- `' + a.id + '` — ' + a.from + ' → ' + a.to);
        });
        out.push('');
      }
    }

    /* 2. CONTEXT */
    out.push('## Context');
    out.push('');
    if (d.context && d.context.paragraph) out.push(d.context.paragraph);
    out.push('');
    if (d.context) {
      out.push('- **Last commit:** `' + (d.context.lastCommit || '—') + '`');
      out.push('- **Active branches:** ' + (d.context.activeBranches || '—'));
      out.push('- **TODO / FIXME:** ' + (d.context.todoCount || 0));
      out.push('- **Test / src ratio:** ' + (d.context.testRatio || 0));
      out.push('- **Median commits/day:** ' + (d.context.medianCommits || 0));
    }
    out.push('');

    /* 3. ASSUMPTIONS */
    out.push('## Assumptions Register');
    out.push('');
    if (d.assumptions) {
      out.push('**' + (d.assumptions.open || 0) + ' open · ' +
               (d.assumptions.validated || 0) + ' validated · ' +
               (d.assumptions.invalidated || 0) + ' invalidated**');
      out.push('');
      out.push(mdHeader(['ID','Assumption','Tier','Validation','Signal','Consequence','Owner','Status']));
      (d.assumptions.rows || []).forEach(function (r) {
        out.push(mdRow([
          r.id + (r.inferred ? ' [inferred]' : ''),
          r.text, r.tier, r.validation, r.signal, r.consequence, r.owner, r.status
        ]));
      });
    }
    out.push('');

    /* 4. DECISIONS */
    out.push('## Decision Log');
    out.push('');
    if (d.decisions) {
      out.push('**' + (d.decisions.made || 0) + ' made · ' +
               (d.decisions.superseded || 0) + ' superseded · ' +
               (d.decisions.reversed || 0) + ' reversed**');
      out.push('');
      out.push(mdHeader(['ID','Date','Decision','Rationale','Alternatives considered','Reversibility','Tier','Owner','Status']));
      (d.decisions.rows || []).forEach(function (r) {
        out.push(mdRow([
          r.id + (r.inferred ? ' [inferred]' : ''),
          r.date, r.decision, r.rationale, r.alternatives, r.reversibility, r.tier, r.owner, r.status
        ]));
      });
    }
    out.push('');

    /* 5. TIER 30D */
    out.push('## 30 DAYS — Sprint-tier execution');
    out.push('');
    if (!tiers['30d']) { out.push(mdExcluded()); out.push(''); }
    else if (d.tier30d) {
      out.push('### Milestones');
      out.push('');
      out.push(mdHeader(['ID','Name','Window','Exit criteria','Depends on','DoD']));
      (d.tier30d.milestones || []).forEach(function (m) {
        out.push(mdRow([m.id, m.name, m.window, m.exit, m.dependsOn, m.dod]));
      });
      out.push('');
      out.push('### Work items');
      out.push('');
      out.push(mdHeader(['ID','Title','Size','Owner','Dependencies','Files likely touched','Risk']));
      (d.tier30d.workItems || []).forEach(function (w) {
        out.push(mdRow([w.id, w.title, w.size, w.owner, w.deps, w.files, w.risk]));
      });
      out.push('');
    }

    /* 6. TIER 90D */
    out.push('## 90 DAYS — Quarter-tier commitments');
    out.push('');
    if (!tiers['90d']) { out.push(mdExcluded()); out.push(''); }
    else if (d.tier90d) {
      out.push('### Themes');
      out.push('');
      out.push(mdHeader(['ID','Name','Exit criteria','Roll-up from','Owner','North-star metric']));
      (d.tier90d.themes || []).forEach(function (t) {
        out.push(mdRow([t.id, t.name, t.exit, t.rollup, t.owner, t.northStar]));
      });
      out.push('');
      out.push('### Epics');
      out.push('');
      out.push(mdHeader(['ID','Title','Size','Dependencies','Risk']));
      (d.tier90d.epics || []).forEach(function (e) {
        out.push(mdRow([e.id, e.title, e.size, e.deps, e.risk]));
      });
      out.push('');
    }

    /* 7. TIER LONG */
    out.push('## LONG-TERM — Strategic bets');
    out.push('');
    if (!tiers['long']) { out.push(mdExcluded()); out.push(''); }
    else if (d.tierLong) {
      out.push('### Strategic bets');
      out.push('');
      out.push(mdHeader(['ID','Name','Hypothesis','Roll-up from','North-star metric','Kill criteria','Decision point']));
      (d.tierLong.bets || []).forEach(function (b) {
        out.push(mdRow([b.id, b.name, b.hypothesis, b.rollup, b.northStar, b.kill, b.decisionPoint]));
      });
      out.push('');
      out.push('### Platform / architectural shifts');
      out.push('');
      (d.tierLong.shifts || []).forEach(function (s) { out.push('- ' + s); });
      out.push('');
      out.push('### Project north-star metrics');
      out.push('');
      (d.tierLong.northStars || []).forEach(function (n) { out.push('- ' + n); });
      out.push('');
    }

    /* 8. TRACEABILITY */
    out.push('## Traceability Matrix');
    out.push('');
    if (d.traceability && d.traceability.length) {
      out.push(mdHeader(['30d work item','30d milestone','90d theme','Long-term bet','North-star metric']));
      d.traceability.forEach(function (t) {
        out.push(mdRow([t.workItem, t.milestone, t.theme, t.bet, t.northStar]));
      });
    }
    out.push('');

    /* 9. CAPACITY */
    out.push('## Capacity vs Demand');
    out.push('');
    if (d.capacity) {
      var c = d.capacity;
      out.push('**Available:** ' + c.available + ' person-days (' + c.committers + ' committers × ' + c.workingDays + ' days × ' + c.focus + ' focus)');
      out.push('');
      out.push('**Demand:** ' + c.demand + ' person-days (' + c.workDemand + ' work + ' + c.meetingDemand + ' meetings + ' + c.oncallDemand + ' oncall × 1.15 buffer)');
      out.push('');
      out.push('**Verdict:** ' + c.verdictUpper + ' (' + c.deltaLabel + ')');
      out.push('');
      out.push(mdHeader(['Work item','Size','Estimate (days)','Dependents']));
      (c.breakdown || []).forEach(function (b) {
        out.push(mdRow([b.item, b.size, b.estimate, b.dependents]));
      });
      out.push(mdRow(['Meeting overhead', '', c.meetingDemand, '—']));
      out.push(mdRow(['Oncall overhead', '', c.oncallDemand, '—']));
      out.push(mdRow(['Buffer (15%)', '', c.bufferDemand, '—']));
      out.push(mdRow(['**Total demand**', '', '**' + c.demand + '**', '—']));
      if (c.suggestedCuts && c.suggestedCuts.length) {
        out.push('');
        out.push('### Suggested cuts');
        out.push('');
        c.suggestedCuts.forEach(function (s) { out.push('- ' + s); });
      }
    }
    out.push('');

    /* 10. RISKS */
    out.push('## Risk Mitigations');
    out.push('');
    if (d.risks && d.risks.actionBlock) {
      out.push('> **Action:** ' + d.risks.actionBlock);
      out.push('');
    }
    if (d.risks && d.risks.rows) {
      out.push(mdHeader(['Risk','Tier','Likelihood','Impact','Mitigation','Owner','Trigger']));
      d.risks.rows.forEach(function (r) {
        out.push(mdRow([r.risk, r.tier, r.likelihood, r.impact, r.mitigation, r.owner, r.trigger]));
      });
    }
    out.push('');

    /* 11. TEAM */
    out.push('## Team Allocation');
    out.push('');
    if (d.team) {
      out.push('### Roster');
      out.push('');
      out.push(mdHeader(['Author','Commit share','Files owned (top 3)']));
      (d.team.roster || []).forEach(function (r) {
        out.push(mdRow([r.author, r.share, r.files]));
      });
      out.push('');
      out.push('### 30d allocation (DRAFT)');
      out.push('');
      out.push(mdHeader(['Work item','Suggested owner','Reviewer','Bus-factor flag']));
      (d.team.alloc30d || []).forEach(function (a) {
        out.push(mdRow([a.item, a.owner, a.reviewer, a.busFactor]));
      });
      out.push('');
      out.push('### 90d allocation (DRAFT)');
      out.push('');
      out.push(mdHeader(['Theme','Suggested owner']));
      (d.team.alloc90d || []).forEach(function (a) {
        out.push(mdRow([a.theme, a.owner]));
      });
    }
    out.push('');

    /* 12. DoD */
    out.push('## Definition of Done');
    out.push('');
    out.push('**30d DoD**');
    out.push('');
    out.push('- [ ] All 30d milestone exit criteria met');
    out.push('- [ ] All L / XL items have a reviewer assigned');
    out.push('- [ ] Test-to-src LOC ratio did not decrease vs baseline');
    out.push('- [ ] No new TODO/FIXME without a linked issue');
    out.push('');
    out.push('**90d DoD**');
    out.push('');
    out.push('- [ ] All 90d theme exit criteria met (north-star metrics moved)');
    out.push('- [ ] Every 30d milestone traces to a 90d theme');
    out.push('- [ ] Cross-team dependencies resolved or documented');
    out.push('- [ ] Capacity plan reviewed vs actual velocity');
    out.push('');
    out.push('**Long-term DoD**');
    out.push('');
    out.push('- [ ] Every 90d theme traces to a long-term bet');
    out.push('- [ ] Each bet has a kill criteria + decision point');
    out.push('- [ ] Platform shifts have a migration sketch (not a full plan)');
    out.push('- [ ] North-star metrics reviewed quarterly');
    out.push('');

    /* 13. REVIEW */
    out.push('## Review Checklist');
    out.push('');
    out.push('### Narrative');
    out.push('- [ ] Context paragraph names the thrust for all three tiers');
    out.push('- [ ] No marketing language or hedging');
    out.push('- [ ] The single biggest assumption is named in the context');
    out.push('- [ ] The single biggest risk is named in the context');
    out.push('');
    out.push('### Roll-up integrity');
    out.push('- [ ] Every 30d milestone traces to a 90d theme');
    out.push('- [ ] Every 90d theme traces to a long-term bet');
    out.push('- [ ] Traceability matrix has no — ORPHAN — cells');
    out.push('- [ ] No 90d theme or long-term bet is an orphan');
    out.push('');
    out.push('### Capacity');
    out.push('- [ ] Capacity verdict is green or amber (or --allow-overcommit documented)');
    out.push('- [ ] Buffer is 15% of (work + meeting + oncall)');
    out.push('- [ ] Focus factor matches the scenario');
    out.push('- [ ] Active committer count reflects reality');
    out.push('');
    out.push('### Assumptions');
    out.push('- [ ] Every assumption has a concrete consequence');
    out.push('- [ ] Every assumption has a validation date in T+Nd form');
    out.push('- [ ] Inferred assumptions are tagged [inferred] and reviewed');
    out.push('- [ ] No assumption\'s validation date is in the past without a status update');
    out.push('');
    out.push('### Risks');
    out.push('- [ ] Every risk has a trigger signal');
    out.push('- [ ] Tier tags are present (30d / 90d / long)');
    out.push('- [ ] Amber and red risks have mitigations');
    out.push('- [ ] The highest-impact risk has a named owner');
    out.push('');
    if (d.review) {
      out.push('### Sign-off');
      out.push('');
      out.push(mdHeader(['Role','Name','Date']));
      out.push(mdRow(['Author',        d.review.author,        d.review.date]));
      out.push(mdRow(['Peer reviewer', d.review.peer,          d.review.peerDate]));
      out.push(mdRow(['Stakeholder',   d.review.stakeholder,   d.review.stakeholderDate]));
      out.push(mdRow(['Next review',   '—',                    d.review.nextDate]));
    }
    out.push('');
    out.push('---');
    out.push('');
    out.push('Generated by `/daily plan` · three-horizon model (30d / 90d / long-term) · data is offline + git-only · label as DRAFT until reviewed.');

    return out.join('\n');
  }

  /* ═══════════════════════════════════════════════════════════════════
     MOUNT
     ────────────────────────────────────────────────────────────────── */

  whenVueReady().then(function () {
    if (!window.Vue) {
      console.error('[rui-plan-report] Vue 3 failed to load — page will not mount.');
      return;
    }

    /* Merge with defaults so any field the host forgot to fill still
     * renders as an empty value rather than crashing the template. */
    var plan = (SCHEMA.merge || function (d) { return d; })(DATA);

    var riskMatrix = useRiskMatrixFilter();

    var app = Vue.createApp({
      template: TEMPLATE,
      data: function () {
        return {
          meta:          plan.meta || {},
          tiers:         plan.tiers || { '30d': true, '90d': true, 'long': true },
          context:       plan.context || {},
          diff:          plan.diff || { enabled: false },
          assumptions:   plan.assumptions || { rows: [] },
          decisions:     plan.decisions || { rows: [] },
          tier30d:       plan.tier30d || { milestones: [], workItems: [] },
          tier90d:       plan.tier90d || { themes: [], epics: [] },
          tierLong:      plan.tierLong || { bets: [], shifts: [], northStars: [] },
          traceability:  plan.traceability || [],
          capacity:      plan.capacity || {},
          risks:         plan.risks || { rows: [] },
          team:          plan.team || { roster: [], alloc30d: [], alloc90d: [] },
          review:        plan.review || {}
        };
      },
      methods: {
        renderSize:    function (s) { return sizeTag(s); },
        renderRollup:  function (p) { return rollupCell(p); },
        inferred:      function (b) { return inferredTag(b); },
        tierShort:     function (t) { return t === '30d' || t === '90d' ? t : 'long'; },
        revShort:      function (r) {
          return r === 'reversible' ? 'reversible'
               : r === 'hard to reverse' ? 'hard'
               : r === 'irreversible' ? 'irreversible'
               : 'reversible';
        }
      },
      mounted: function () {
        riskMatrix.init();
        useToolbar(plan).init();
        // Update document title to the active project (the page shell
        // uses {{PROJECT}} but Vue doesn't render <title> in the body)
        if (plan.meta && plan.meta.project) {
          document.title = plan.meta.project + ' — Engineering Plan — ' + plan.meta.date;
        }
      }
    });

    // Defensive: register rui-back-top if it loaded
    if (window.ruiBackTop && window.ruiBackTop.name === 'ruiBackTop') {
      app.component('rui-back-top', window.ruiBackTop);
    }

    app.mount('#app');
  });

  /* ═══════════════════════════════════════════════════════════════════
     EXPORTS — pure functions, available before / after Vue mount so
     external tools (e.g. /daily plan command) can render markdown
     without booting a browser.
     ────────────────────────────────────────────────────────────────── */

  window.planToMarkdown = planToMarkdown;
  window.planHelpers = {
    dash: dash, sizeTag: sizeTag, riskTag: riskTag,
    statusTag: statusTag, reversibilityTag: reversibilityTag,
    tierBadge: tierBadge, rollupCell: rollupCell, inferredTag: inferredTag,
    merge: (SCHEMA && SCHEMA.merge) || function (d) { return d; }
  };
})();
