/**
 * @file: index.js
 * @purpose: Shared Vue 3 app for the daily CTO report.
 *           Renders a project switcher + the selected project's 4 sections
 *           (Summary, Risk, Health, People).
 *
 *           Data shape (window.REPORT_DATA):
 *             {
 *               meta: { date, window, sinceDate, untilDate, timestamp, title },
 *               projects: [
 *                 { project, scope, scopeShort, summary, risk, health, people }
 *               ]
 *             }
 *
 *           Includes a date-range selector that defaults to today. Changing
 *           the range navigates to the matching date directory.
 */
(function () {
  'use strict';

  /* ── Wait for Vue (CDN loader) ────────────────────────────────────── */
  function waitForVue() {
    if (window.Vue) return Promise.resolve(window.Vue);
    return new Promise(function (resolve) {
      if (window.__vueLoadPromise && typeof window.__vueLoadPromise.then === 'function') {
        window.__vueLoadPromise.then(function () { resolve(window.Vue); });
        return;
      }
      window.addEventListener('vue-ready', function once() {
        window.removeEventListener('vue-ready', once);
        resolve(window.Vue);
      }, { once: true });
      var started = Date.now();
      var t = setInterval(function () {
        if (window.Vue) { clearInterval(t); resolve(window.Vue); }
        else if (Date.now() - started > 3500) { clearInterval(t); resolve(null); }
      }, 50);
    });
  }

  function toneToClass(tone) {
    if (tone === 'critical') return 'critical';
    if (tone === 'warn')     return 'warn';
    return '';
  }

  /* ── Date helpers ─────────────────────────────────────────────────── */
  function toISODate(d) {
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
  }

  /* ── Template ─────────────────────────────────────────────────────── */
  var TEMPLATE = String.raw`
<div class="wrap">

  <header>
    <h1>{{ meta.title || 'Daily CTO Report' }}</h1>
    <p class="meta">
      Window: <span class="num">{{ meta.sinceDate || '—' }} → {{ meta.untilDate || '—' }}</span>
      · Generated <span class="num">{{ fmtTs(meta.timestamp) }}</span>
      · <span class="num">{{ (projects || []).length }}</span> projects
    </p>
  </header>

  <!-- Date-range selector + project switcher -->
  <div class="toolbar">
    <div class="toolbar-group">
      <label class="toolbar-label">Date</label>
      <input type="date" :value="currentDate" @change="navigateDate($event.target.value)" class="date-input">
      <button v-for="p in datePresets" :key="p.key" class="preset-btn" @click="navigatePreset(p)">
        {{ p.label }}
      </button>
    </div>
    <div class="toolbar-group" v-if="projects && projects.length > 1">
      <label class="toolbar-label">Project</label>
      <button
        v-for="p in projects" :key="p.project"
        :class="['project-btn', { 'is-active': activeProject === p.project }]"
        @click="activeProject = p.project">
        {{ p.project }}
      </button>
    </div>
  </div>

  <nav aria-label="Section navigation">
    <a href="#summary">Summary</a>
    <a href="#risk">Risk</a>
    <a href="#health">Health</a>
    <a href="#people">People</a>
    <span style="flex:1"></span>
    <span class="muted" style="align-self:center;font-size:.74rem" v-if="current">
      {{ current.scopeShort || current.project }}
    </span>
  </nav>

  <!-- Empty state -->
  <section v-if="!current">
    <div class="body" style="padding:2rem;text-align:center">
      <p class="muted">No project data available.</p>
    </div>
  </section>

  <!-- 1. SUMMARY -->
  <section v-if="current" id="summary">
    <div class="head" @click="toggle('summary')">
      <h2>1 · Summary</h2>
      <span class="toggle">{{ toggles.summary ? '+' : '−' }}</span>
    </div>
    <div class="body" v-show="!toggles.summary">

      <div class="kpi-grid" v-if="current.summary.kpis && current.summary.kpis.length">
        <div class="kpi" v-for="(kpi, i) in current.summary.kpis" :key="'kpi-' + i">
          <div class="label">{{ kpi.label || '—' }}</div>
          <div class="value" :class="toneToClass(kpi.tone)">{{ kpi.value || '—' }}</div>
          <div class="sub" v-if="kpi.sub">{{ kpi.sub }}</div>
        </div>
      </div>

      <h3>Top contributors</h3>
      <table v-if="current.summary.contributors && current.summary.contributors.length">
        <thead><tr><th>Author</th><th class="num">Commits</th><th class="num">%</th><th>Activity</th></tr></thead>
        <tbody>
          <tr v-for="(c, i) in current.summary.contributors" :key="'c-' + i">
            <td>{{ c.author || '—' }}</td>
            <td class="num">{{ c.commits != null ? c.commits : '—' }}</td>
            <td class="num">{{ c.percent != null ? c.percent + '%' : '—' }}</td>
            <td><span class="hbar" :style="{ width: (c.barWidth || 0) + 'px' }"></span></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">No contributor activity in this window.</p>

      <h3>Hot files (by churn count)</h3>
      <table v-if="current.summary.hotFiles && current.summary.hotFiles.length">
        <thead><tr><th class="num">#</th><th>File</th><th class="num">Touches</th></tr></thead>
        <tbody>
          <tr v-for="(f, i) in current.summary.hotFiles" :key="'f-' + i">
            <td class="num">{{ f.rank != null ? f.rank : (i + 1) }}</td>
            <td><code class="truncate" :title="f.path">{{ f.path || '—' }}</code></td>
            <td class="num">{{ f.touches != null ? f.touches : '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">No hot files in this window.</p>

      <h3>Narrative (CTO standup)</h3>
      <div class="narrative" v-if="hasNarrative">
        <p v-if="current.summary.narrative.shipped" v-html="'<strong>What shipped.</strong> ' + current.summary.narrative.shipped"></p>
        <p v-if="current.summary.narrative.atRisk" v-html="'<strong>What\'s at risk.</strong> ' + current.summary.narrative.atRisk"></p>
        <p v-if="current.summary.narrative.drifting" v-html="'<strong>What\'s drifting.</strong> ' + current.summary.narrative.drifting"></p>
        <p v-if="current.summary.narrative.watch" v-html="'<strong>One thing to watch.</strong> ' + current.summary.narrative.watch"></p>
      </div>
      <p v-else class="muted">No narrative supplied.</p>

    </div>
  </section>

  <!-- 2. RISK -->
  <section v-if="current" id="risk">
    <div class="head" @click="toggle('risk')">
      <h2>2 · Risk</h2>
      <span class="toggle">{{ toggles.risk ? '+' : '−' }}</span>
    </div>
    <div class="body" v-show="!toggles.risk">

      <div class="legend" v-if="current.risk.legend">
        <span><span class="pill green">GREEN</span> {{ current.risk.legend.green || 'within threshold' }}</span>
        <span><span class="pill amber">AMBER</span> {{ current.risk.legend.amber || 'near threshold' }}</span>
        <span><span class="pill red">RED</span> {{ current.risk.legend.red || 'exceeds threshold' }}</span>
      </div>

      <div v-if="current.risk.items && current.risk.items.length">
        <div class="risk-row" v-for="(r, i) in current.risk.items" :key="'r-' + i">
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

  <!-- 3. HEALTH -->
  <section v-if="current" id="health">
    <div class="head" @click="toggle('health')">
      <h2>3 · Health</h2>
      <span class="toggle">{{ toggles.health ? '+' : '−' }}</span>
    </div>
    <div class="body" v-show="!toggles.health">

      <h3>Language distribution</h3>
      <table v-if="current.health.languages && current.health.languages.length">
        <thead><tr><th>Kind</th><th class="num">Files</th><th class="num">LOC</th><th class="num">%</th><th>Distribution</th></tr></thead>
        <tbody>
          <tr v-for="(l, i) in current.health.languages" :key="'l-' + i">
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
      <table v-if="current.health.skills && current.health.skills.length">
        <thead><tr><th>Skill family</th><th class="num">Files</th><th class="num">SKILL.md</th><th class="num">evals</th><th class="num">Refs</th><th>Notes</th></tr></thead>
        <tbody>
          <tr v-for="(s, i) in current.health.skills" :key="'s-' + i">
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
      <table v-if="current.health.tests">
        <thead><tr><th>Metric</th><th class="num">Value</th><th>Threshold</th><th>Verdict</th></tr></thead>
        <tbody>
          <tr><td>Test LOC</td><td class="num">{{ (current.health.tests.testLoc || 0).toLocaleString() }}</td><td>—</td><td>—</td></tr>
          <tr><td>All JS LOC</td><td class="num">{{ (current.health.tests.allJsLoc || 0).toLocaleString() }}</td><td>—</td><td>—</td></tr>
          <tr><td>Test / code ratio</td>
              <td class="num">{{ formatPct(current.health.tests.ratio) }}</td>
              <td>≥ {{ formatPct(current.health.tests.threshold) }}</td>
              <td><span :class="['pill', current.health.tests.color || 'muted']">{{ current.health.tests.verdict || '—' }}</span></td></tr>
        </tbody>
      </table>

      <h3>Tech-debt signal</h3>
      <table v-if="current.health.techDebt && current.health.techDebt.length">
        <thead><tr><th>Marker</th><th class="num">Count</th><th>Verdict</th><th>Share</th></tr></thead>
        <tbody>
          <tr v-for="(d, i) in current.health.techDebt" :key="'d-' + i">
            <td v-html="'<code>' + (d.marker || '—') + '</code>'"></td>
            <td class="num">{{ d.count != null ? d.count : '—' }}</td>
            <td><span :class="['pill', d.color || 'muted']">{{ d.verdict || '—' }}</span></td>
            <td class="muted">{{ d.share || '—' }}</td>
          </tr>
        </tbody>
      </table>

      <h3>Branch hygiene</h3>
      <table v-if="current.health.branches && current.health.branches.length">
        <thead><tr><th>Branch</th><th>Last commit</th><th class="num">Age (d)</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-for="(b, i) in current.health.branches" :key="'b-' + i">
            <td><code>{{ b.name || '—' }}</code></td>
            <td>{{ b.lastCommit || '—' }}</td>
            <td class="num">{{ b.ageDays != null ? b.ageDays : '—' }}</td>
            <td><span :class="['pill', b.color || 'muted']">{{ b.status || '—' }}</span> <span class="muted">{{ b.note || '' }}</span></td>
          </tr>
        </tbody>
      </table>

      <h3>Dependency footprint</h3>
      <p v-if="current.health.dependencies && current.health.dependencies.text" v-html="current.health.dependencies.text"></p>
      <p v-else class="muted">No dependency data.</p>
      <p v-if="current.health.dependencies && current.health.dependencies.verdict" class="muted">
        → <span :class="['pill', current.health.dependencies.color || 'muted']">{{ current.health.dependencies.verdict }}</span>
      </p>

    </div>
  </section>

  <!-- 4. PEOPLE -->
  <section v-if="current" id="people">
    <div class="head" @click="toggle('people')">
      <h2>4 · People</h2>
      <span class="toggle">{{ toggles.people ? '+' : '−' }}</span>
    </div>
    <div class="body" v-show="!toggles.people">

      <h3>Commit distribution</h3>
      <table v-if="current.people.distribution && current.people.distribution.length">
        <thead><tr><th>Author</th><th class="num">Commits</th><th class="num">%</th><th>Share</th></tr></thead>
        <tbody>
          <tr v-for="(d, i) in current.people.distribution" :key="'d2-' + i">
            <td>{{ d.author || '—' }}</td>
            <td class="num">{{ d.commits != null ? d.commits : '—' }}</td>
            <td class="num">{{ d.percent != null ? d.percent + '%' : '—' }}</td>
            <td><span class="hbar" :style="{ width: (d.barWidth || 0) + 'px' }"></span></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">No distribution data.</p>

      <h3>Bus factor</h3>
      <table v-if="current.people.busFactor && current.people.busFactor.length">
        <thead><tr><th>Bucket</th><th class="num">Files</th><th class="num">%</th><th>Verdict</th></tr></thead>
        <tbody>
          <tr v-for="(b, i) in current.people.busFactor" :key="'bf-' + i">
            <td>{{ b.bucket || '—' }}</td>
            <td class="num">{{ b.files != null ? b.files.toLocaleString() : '—' }}</td>
            <td class="num">{{ b.percent != null ? b.percent + '%' : '—' }}</td>
            <td><span :class="['pill', b.color || 'muted']">{{ b.verdict || '—' }}</span></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">No bus-factor data.</p>

      <h3>Activity pulse</h3>
      <table v-if="current.people.activityPulse && current.people.activityPulse.length">
        <thead><tr><th>Date</th><th class="num">Commits</th><th>Activity</th></tr></thead>
        <tbody>
          <tr v-for="(p, i) in current.people.activityPulse" :key="'p-' + i">
            <td class="nowrap">{{ p.date || '—' }} <span class="muted">({{ p.day || '—' }})</span></td>
            <td class="num">{{ p.commits != null ? p.commits : '—' }}</td>
            <td><span class="hbar" :style="{ width: (p.barWidth || 0) + 'px' }"></span> <span class="muted">· {{ p.hint || '' }}</span></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">No activity-pulse data.</p>

      <h3>Reviewer coverage</h3>
      <p v-if="current.people.review && current.people.review.text" v-html="current.people.review.text"></p>
      <p v-else class="muted">No review data.</p>

      <h3>New contributors</h3>
      <p v-if="current.people.newContributors">{{ current.people.newContributors }}</p>
      <p v-else class="muted">No new contributors reported.</p>

    </div>
  </section>

  <footer>
    <p>
      Generated by <code>/daily report</code> · data is offline + git-only ·
      window: <span class="num">{{ meta.window || '—' }}</span>
      (<span class="num">{{ meta.sinceDate || '—' }} → {{ meta.untilDate || '—' }}</span>)
    </p>
    <p class="muted" style="margin-top:4px">
      No network calls · No project execution · No CI integration
    </p>
  </footer>

</div>
`;

  /* ── Mount ────────────────────────────────────────────────────────── */
  function mountApp(Vue) {
    if (!Vue) {
      console.error('[yry-daily-report] Vue 3 was not loaded.');
      var el0 = document.getElementById('app');
      if (el0) {
        el0.removeAttribute('v-cloak');
        el0.innerHTML = '<div style="padding:2rem;color:#666"><h2>Vue 3 failed to load</h2><p>Check console for errors.</p></div>';
      }
      return;
    }

    try {
      var data = window.REPORT_DATA || {};
      var projects = data.projects || [];

      var hashProject = (location.hash || '').replace(/^#/, '');
      var initial = projects.find(function (p) { return p.project === hashProject; });
      var initialName = initial ? initial.project : (projects[0] && projects[0].project);

      var app = Vue.createApp({
        template: TEMPLATE,
      data: function () {
        return {
          meta: data.meta || {},
          projects: projects,
          activeProject: initialName || '',
          toggles: { summary: false, risk: false, health: false, people: false },
          datePresets: [
            { key: 'today', label: 'Today' }
          ]
        };
      },
      computed: {
        currentDate: function () {
          return (this.meta && this.meta.date) || toISODate(new Date());
        },
        current: function () {
          var self = this;
          return this.projects.find(function (p) { return p.project === self.activeProject; }) || null;
        },
        hasNarrative: function () {
          if (!this.current || !this.current.summary || !this.current.summary.narrative) return false;
          var n = this.current.summary.narrative;
          return !!(n.shipped || n.atRisk || n.drifting || n.watch);
        }
      },
      methods: {
        toggle: function (key) { this.toggles[key] = !this.toggles[key]; },
        toneToClass: toneToClass,
        formatPct: function (n) {
          if (n == null) return '—';
          return (n * 100).toFixed(2) + '%';
        },
        fmtTs: function (ts) {
          if (!ts) return '—';
          try { return new Date(ts).toLocaleString(); } catch (e) { return ts; }
        },
        /* Navigate to a different date's report (sibling directory). */
        navigateDate: function (iso) {
          if (!iso) return;
          window.location.href = '../' + iso + '/index.html';
        },
        navigatePreset: function (p) {
          if (p.key === 'today') {
            window.location.href = '../' + toISODate(new Date()) + '/index.html';
          }
        }
      },
      watch: {
        activeProject: function (v) {
          if (location.hash.replace(/^#/, '') !== v) {
            history.replaceState(null, '', '#' + v);
          }
        }
      },
      mounted: function () {
        var self = this;
        window.addEventListener('hashchange', function () {
          var h = location.hash.replace(/^#/, '');
          var match = self.projects.find(function (p) { return p.project === h; });
          if (match) self.activeProject = match.project;
        });
      }
    });

    app.mount('#app');

    window.dispatchEvent(new CustomEvent('yry-daily-report-ready', {
      detail: { date: data.meta && data.meta.date, projects: projects.length }
    }));
    } catch (err) {
      console.error('[yry-daily-report] Mount failed:', err);
      var el2 = document.getElementById('app');
      if (el2) {
        el2.removeAttribute('v-cloak');
        el2.innerHTML = '<div style="padding:2rem;color:#b00"><h2>Report render error</h2><pre style="white-space:pre-wrap">' + (err && err.message || err) + '</pre></div>';
      }
    }
  }

  // Script is loaded in <head>; #app and <body> may not exist yet.
  // Wait for DOMContentLoaded before attempting to mount.
  waitForVue().then(function (Vue) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { mountApp(Vue); });
    } else {
      mountApp(Vue);
    }
  });
})();
