/**
 * @file: index.js
 * @purpose: Vue 3 app for the `/daily report` template.
 *           Defines a runtime template that consumes `window.REPORT_DATA`
 *           (set by data.js) and renders the four sections — Summary,
 *           Risk, Health, People — in the same order as the
 *           /daily report workflow.
 *
 *           Loaded by index.html after data.js. Exposes nothing globally
 *           besides the yry-daily-report namespace banner so other tools
 *           can detect a successful mount.
 *
 * @data_input:    window.REPORT_DATA  (set by data.js, validated by Vue
 *                                    reactive defaults below)
 * @data_fallback: window.REPORT_DATA_SCHEMA.example (so the template
 *                 renders something useful when opened directly)
 * @runtime:       Vue 3.x (auto-injected by /.claude/shared/loader.js)
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
     WAIT FOR VUE
     ───────────────────────────────────────────────────────────────────
     The shared loader injects Vue 3 via either the primary CDN or the
     fallback URL. The loader exposes a `__vueLoadPromise` and emits
     a `vue-ready` event. We listen to both so the app works whether the
     loader is the same version as ours or a future one that drops one
     of those signals.
     ═══════════════════════════════════════════════════════════════════ */

  function waitForVue() {
    if (window.Vue) return Promise.resolve(window.Vue);
    return new Promise(function (resolve) {
      // Strategy 1: shared loader's promise
      if (window.__vueLoadPromise && typeof window.__vueLoadPromise.then === 'function') {
        window.__vueLoadPromise.then(function () { resolve(window.Vue); });
        return;
      }
      // Strategy 2: event-based
      window.addEventListener('vue-ready', function once() {
        window.removeEventListener('vue-ready', once);
        resolve(window.Vue);
      }, { once: true });
      // Strategy 3: short polling fallback (3.5s cap)
      var started = Date.now();
      var t = setInterval(function () {
        if (window.Vue) { clearInterval(t); resolve(window.Vue); }
        else if (Date.now() - started > 3500) { clearInterval(t); resolve(null); }
      }, 50);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     SEVERITY TONE → CSS CLASS
     ─────────────────────────────────────────────────────────────────── */
  function toneToClass(tone) {
    if (tone === 'critical') return 'critical';
    if (tone === 'warn')     return 'warn';
    return '';
  }

  /* ═══════════════════════════════════════════════════════════════════
     RUNTIME TEMPLATE
     ─────────────────────────────────────────────────────────────────── */
  var TEMPLATE = String.raw`
<div class="wrap">

  <header>
    <h1>{{ meta.title || 'Daily CTO Report' }}</h1>
    <p class="meta">
      Window: <span class="num">{{ meta.sinceDate || '—' }} → {{ meta.untilDate || '—' }}</span>
      · Generated <span class="num">{{ meta.timestamp || '—' }}</span>
      · Source path: <code>{{ meta.scope || '—' }}</code>
    </p>
  </header>

  <nav aria-label="Section navigation">
    <a href="#summary">Summary</a>
    <a href="#risk">Risk</a>
    <a href="#health">Health</a>
    <a href="#people">People</a>
  </nav>

  <!-- ══════════════════════════════════════════════════════════════
       1. SUMMARY
       ══════════════════════════════════════════════════════════════ -->
  <section id="summary">
    <div class="head" @click="toggle('summary')">
      <h2>1 · Summary</h2>
      <span class="toggle">{{ toggles.summary ? '+' : '−' }}</span>
    </div>
    <div class="body" v-show="!toggles.summary">

      <div class="kpi-grid" v-if="summary.kpis && summary.kpis.length">
        <div class="kpi" v-for="(kpi, i) in summary.kpis" :key="'kpi-' + i">
          <div class="label">{{ kpi.label || '—' }}</div>
          <div class="value" :class="toneToClass(kpi.tone)">{{ kpi.value || '—' }}</div>
          <div class="sub" v-if="kpi.sub">{{ kpi.sub }}</div>
        </div>
      </div>

      <h3>Top contributors</h3>
      <table v-if="summary.contributors && summary.contributors.length">
        <thead>
          <tr>
            <th>Author</th>
            <th class="num">Commits</th>
            <th class="num">%</th>
            <th>Activity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, i) in summary.contributors" :key="'c-' + i">
            <td>{{ c.author || '—' }}</td>
            <td class="num">{{ c.commits != null ? c.commits : '—' }}</td>
            <td class="num">{{ c.percent != null ? c.percent + '%' : '—' }}</td>
            <td><span class="hbar" :style="{ width: (c.barWidth || 0) + 'px' }"></span></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">No contributor activity in this window.</p>
      <p class="muted" v-if="summary.contributors && summary.contributors.length === 1" style="margin-top:6px">
        No second author touched any file in the window. Bus factor at the contributor level is 1.
      </p>

      <h3>Hot files (by churn count)</h3>
      <table v-if="summary.hotFiles && summary.hotFiles.length">
        <thead>
          <tr>
            <th class="num">#</th>
            <th>File</th>
            <th class="num">Touches</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(f, i) in summary.hotFiles" :key="'f-' + i">
            <td class="num">{{ f.rank != null ? f.rank : (i + 1) }}</td>
            <td><code class="truncate" :title="f.path">{{ f.path || '—' }}</code></td>
            <td class="num">{{ f.touches != null ? f.touches : '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">No hot files in this window.</p>
      <p class="muted" v-if="summary.hotFiles && summary.hotFiles.length" style="margin-top:6px">
        Top-{{ Math.min(10, summary.hotFiles.length) }} files are dominated by SKILL.md / template files.
        The single heaviest file is the active work surface.
      </p>

      <h3>Narrative (CTO standup)</h3>
      <div class="narrative" v-if="hasNarrative">
        <p v-if="summary.narrative.shipped" v-html="'<strong>What shipped.</strong> ' + summary.narrative.shipped"></p>
        <p v-if="summary.narrative.atRisk" v-html="'<strong>What\'s at risk.</strong> ' + summary.narrative.atRisk"></p>
        <p v-if="summary.narrative.drifting" v-html="'<strong>What\'s drifting.</strong> ' + summary.narrative.drifting"></p>
        <p v-if="summary.narrative.watch" v-html="'<strong>One thing to watch.</strong> ' + summary.narrative.watch"></p>
      </div>
      <p v-else class="muted">No narrative supplied.</p>

    </div>
  </section>

  <!-- ══════════════════════════════════════════════════════════════
       2. RISK
       ══════════════════════════════════════════════════════════════ -->
  <section id="risk">
    <div class="head" @click="toggle('risk')">
      <h2>2 · Risk</h2>
      <span class="toggle">{{ toggles.risk ? '+' : '−' }}</span>
    </div>
    <div class="body" v-show="!toggles.risk">

      <div class="legend">
        <span><span class="pill green">GREEN</span> {{ risk.legend && risk.legend.green || 'within threshold' }}</span>
        <span><span class="pill amber">AMBER</span> {{ risk.legend && risk.legend.amber || 'near threshold' }}</span>
        <span><span class="pill red">RED</span> {{ risk.legend && risk.legend.red || 'exceeds threshold' }}</span>
      </div>

      <div v-if="risk.items && risk.items.length">
        <div class="risk-row" v-for="(r, i) in risk.items" :key="'r-' + i">
          <div class="body">
            <div class="name">{{ r.name || '—' }}</div>
            <div class="hint" v-html="r.hint || ''"></div>
            <div class="action" v-if="r.action" v-html="'<em>Action suggested:</em> ' + r.action"></div>
          </div>
          <div class="sev">
            <span :class="['pill', r.severity || 'muted']">{{ (r.severity || '—').toUpperCase() }}</span>
          </div>
        </div>
      </div>
      <p v-else class="muted">No risk items reported.</p>

    </div>
  </section>

  <!-- ══════════════════════════════════════════════════════════════
       3. HEALTH
       ══════════════════════════════════════════════════════════════ -->
  <section id="health">
    <div class="head" @click="toggle('health')">
      <h2>3 · Health</h2>
      <span class="toggle">{{ toggles.health ? '+' : '−' }}</span>
    </div>
    <div class="body" v-show="!toggles.health">

      <h3>Language distribution (files / LOC, all-time in window scope)</h3>
      <table v-if="health.languages && health.languages.length">
        <thead>
          <tr>
            <th>Kind</th>
            <th class="num">Files</th>
            <th class="num">LOC</th>
            <th class="num">% of total</th>
            <th>Distribution</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(l, i) in health.languages" :key="'l-' + i">
            <td>{{ l.kind || '—' }}</td>
            <td class="num">{{ l.files != null ? l.files : '—' }}</td>
            <td class="num">{{ l.loc != null && l.loc > 0 ? l.loc.toLocaleString() : '—' }}</td>
            <td class="num">{{ l.percent != null ? l.percent + '%' : '—' }}</td>
            <td><span class="hbar" :style="{ width: (l.barWidth || 0) + 'px' }"></span></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">No language data.</p>

      <h3>Skill catalog</h3>
      <table v-if="health.skills && health.skills.length">
        <thead>
          <tr>
            <th>Skill family</th>
            <th class="num">Files</th>
            <th class="num">SKILL.md</th>
            <th class="num">evals.json</th>
            <th class="num">References</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in health.skills" :key="'s-' + i">
            <td>{{ s.name || '—' }}</td>
            <td class="num">{{ s.files != null ? s.files : '—' }}</td>
            <td class="num">{{ s.skillMd != null ? s.skillMd : '—' }}</td>
            <td class="num">{{ s.evals != null ? s.evals : '—' }}</td>
            <td class="num">{{ s.references != null ? s.references : '—' }}</td>
            <td>{{ s.notes || '' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">No skill catalog data.</p>

      <h3>Test ratio</h3>
      <table v-if="health.tests">
        <thead><tr><th>Metric</th><th class="num">Value</th><th>Threshold</th><th>Verdict</th></tr></thead>
        <tbody>
          <tr><td>Test LOC (<code>*.test.js</code>)</td>
              <td class="num">{{ (health.tests.testLoc || 0).toLocaleString() }}</td>
              <td>—</td><td>—</td></tr>
          <tr><td>All JS / MJS LOC</td>
              <td class="num">{{ (health.tests.allJsLoc || 0).toLocaleString() }}</td>
              <td>—</td><td>—</td></tr>
          <tr><td>Test / code ratio</td>
              <td class="num">{{ formatPct(health.tests.ratio) }}</td>
              <td>≥ {{ formatPct(health.tests.threshold) }}</td>
              <td><span :class="['pill', health.tests.color || 'muted']">{{ health.tests.verdict || '—' }}</span></td></tr>
          <tr><td>Test files</td>
              <td class="num">{{ health.tests.testFileCount != null ? health.tests.testFileCount : '—' }}</td>
              <td>—</td>
              <td><span class="muted">all under yry-reports/diagram/engine</span></td></tr>
        </tbody>
      </table>

      <h3>Tech-debt signal</h3>
      <table v-if="health.techDebt && health.techDebt.length">
        <thead><tr><th>Marker</th><th class="num">Count</th><th>Verdict</th><th>Share</th></tr></thead>
        <tbody>
          <tr v-for="(d, i) in health.techDebt" :key="'d-' + i">
            <td v-html="'<code>' + (d.marker || '—') + '</code>'"></td>
            <td class="num">{{ d.count != null ? d.count : '—' }}</td>
            <td><span :class="['pill', d.color || 'muted']">{{ d.verdict || '—' }}</span></td>
            <td class="muted">{{ d.share || '—' }}</td>
          </tr>
        </tbody>
      </table>

      <h3>Branch hygiene</h3>
      <table v-if="health.branches && health.branches.length">
        <thead><tr><th>Branch</th><th>Last commit</th><th class="num">Age (d)</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-for="(b, i) in health.branches" :key="'b-' + i">
            <td><code>{{ b.name || '—' }}</code></td>
            <td>{{ b.lastCommit || '—' }}</td>
            <td class="num">{{ b.ageDays != null ? b.ageDays : '—' }}</td>
            <td><span :class="['pill', b.color || 'muted']">{{ b.status || '—' }}</span> &nbsp; <span class="muted">{{ b.note || '' }}</span></td>
          </tr>
        </tbody>
      </table>

      <h3>Dependency footprint</h3>
      <p v-if="health.dependencies && health.dependencies.text" v-html="health.dependencies.text"></p>
      <p v-else class="muted">No dependency data.</p>
      <p v-if="health.dependencies && health.dependencies.verdict" :class="'muted'">
        → <span :class="['pill', health.dependencies.color || 'muted']">{{ health.dependencies.verdict }}</span>
      </p>

    </div>
  </section>

  <!-- ══════════════════════════════════════════════════════════════
       4. PEOPLE
       ══════════════════════════════════════════════════════════════ -->
  <section id="people">
    <div class="head" @click="toggle('people')">
      <h2>4 · People</h2>
      <span class="toggle">{{ toggles.people ? '+' : '−' }}</span>
    </div>
    <div class="body" v-show="!toggles.people">

      <h3>Commit distribution (window)</h3>
      <table v-if="people.distribution && people.distribution.length">
        <thead><tr><th>Author</th><th class="num">Commits</th><th class="num">%</th><th>Share of activity</th></tr></thead>
        <tbody>
          <tr v-for="(d, i) in people.distribution" :key="'d2-' + i">
            <td>{{ d.author || '—' }}</td>
            <td class="num">{{ d.commits != null ? d.commits : '—' }}</td>
            <td class="num">{{ d.percent != null ? d.percent + '%' : '—' }}</td>
            <td><span class="hbar" :style="{ width: (d.barWidth || 0) + 'px' }"></span></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">No distribution data.</p>
      <p class="muted" v-if="people.distribution && people.distribution.length === 1" style="margin-top:6px">
        Pareto check: top 20% of authors did <strong>100%</strong> of the commits. The "rest of the team" did 0. There is no team to report on.
      </p>

      <h3>Bus factor (per-file author count)</h3>
      <table v-if="people.busFactor && people.busFactor.length">
        <thead><tr><th>Bucket</th><th class="num">Files</th><th class="num">%</th><th>Verdict</th></tr></thead>
        <tbody>
          <tr v-for="(b, i) in people.busFactor" :key="'bf-' + i">
            <td>{{ b.bucket || '—' }}</td>
            <td class="num">{{ b.files != null ? b.files.toLocaleString() : '—' }}</td>
            <td class="num">{{ b.percent != null ? b.percent + '%' : '—' }}</td>
            <td><span :class="['pill', b.color || 'muted']">{{ b.verdict || '—' }}</span></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">No bus-factor data.</p>

      <h3>Activity pulse (commits per day, window)</h3>
      <table v-if="people.activityPulse && people.activityPulse.length">
        <thead><tr><th>Date</th><th class="num">Commits</th><th>Activity</th></tr></thead>
        <tbody>
          <tr v-for="(p, i) in people.activityPulse" :key="'p-' + i">
            <td class="nowrap">{{ p.date || '—' }} <span class="muted">({{ p.day || '—' }})</span></td>
            <td class="num">{{ p.commits != null ? p.commits : '—' }}</td>
            <td><span class="hbar" :style="{ width: (p.barWidth || 0) + 'px' }"></span> <span class="muted">· {{ p.hint || '' }}</span></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">No activity-pulse data.</p>

      <h3>Reviewer coverage</h3>
      <p v-if="people.review && people.review.text" v-html="people.review.text"></p>
      <p v-else class="muted">No review data.</p>
      <p v-if="people.review && people.review.verdict">
        <span :class="['pill', people.review.color || 'muted']">{{ people.review.verdict }}</span>
        &nbsp; <span class="muted">{{ people.review.text ? '' : 'No review process in place.' }}</span>
      </p>

      <h3>New contributors in window</h3>
      <p v-if="people.newContributors">{{ people.newContributors }}</p>
      <p v-else class="muted">No new contributors reported.</p>

    </div>
  </section>

  <footer>
    <p>
      Generated by <code>/daily report</code> (<code>yry-reports/daily</code>) ·
      data is offline + git-only ·
      window: <span class="num">{{ meta.window || '—' }}</span>
      (<span class="num">{{ meta.sinceDate || '—' }} → {{ meta.untilDate || '—' }}</span>) ·
      scope: <code>{{ meta.scopeShort || meta.scope || '—' }}</code>
    </p>
    <p class="muted" style="margin-top:4px">
      No network calls · No project execution · No CI integration
    </p>
  </footer>

</div>
`;

  /* ═══════════════════════════════════════════════════════════════════
     MOUNT
     ─────────────────────────────────────────────────────────────────── */
  waitForVue().then(function (Vue) {
    if (!Vue) {
      console.error('[yry-daily-report] Vue 3 was not loaded by the shared CDN loader. Check /.claude/shared/loader.js.');
      return;
    }

    /* Read the active data, falling back to the example if absent. */
    var schema = window.REPORT_DATA_SCHEMA;
    var data = window.REPORT_DATA || (schema && schema.example) || {};

    var app = Vue.createApp({
      template: TEMPLATE,
      data: function () {
        return {
          meta:     data.meta     || {},
          summary:  data.summary  || {},
          risk:     data.risk     || {},
          health:   data.health   || {},
          people:   data.people   || {},
          toggles:  { summary: false, risk: false, health: false, people: false }
        };
      },
      computed: {
        hasNarrative: function () {
          var n = this.summary && this.summary.narrative;
          if (!n) return false;
          return !!(n.shipped || n.atRisk || n.drifting || n.watch);
        }
      },
      methods: {
        toggle: function (key) {
          this.toggles[key] = !this.toggles[key];
        },
        toneToClass: toneToClass,
        formatPct: function (n) {
          if (n == null) return '—';
          return (n * 100).toFixed(2) + '%';
        }
      }
    });

    app.component('tpl', { /* placeholder for future shared bits */ });

    app.mount('#app');

    /* Mark mount complete so other tools (e.g. screenshot) can wait for it. */
    window.dispatchEvent(new CustomEvent('yry-daily-report-ready', { detail: { version: (schema && schema.version) || 1 } }));
    if (window.__rui_daily_report && typeof window.__rui_daily_report.ready === 'function') {
      window.__rui_daily_report.ready();
    }
  });
})();
