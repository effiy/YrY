/**
 * YiDoc · Dashboard Vue 3 mount
 * --------------------------------------------------------------------------
 * Self-contained: no CDN shared component dependencies.
 * All custom elements (yry-panel-hub-inline) are registered as inline
 * Vue 3 components. Vue 3 is loaded via CDN in index.html.
 *
 * Improvements over v1:
 *   - Uses window.__vueLoadPromise to detect Vue readiness instead of
 *     polling setTimeout(). Falls back to polling with a 10s timeout.
 *   - try/finally guard ensures v-cloak is torn down even on mount failure.
 *   - AbortController-based listener cleanup (scroll + keydown) via a
 *     single handle (_teardownCtrl).
 *   - Shows a visible error banner when Vue fails to load (no silent hang).
 */
(function () {
  'use strict';

  var config = window.HELP_CONFIG || {};
  var animationFrameId = 0;
  var _app = null;                          // Vue app instance for teardown
  var _teardownCtrl = null;                 // single AbortController for listeners

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  function linkAttrs(openInNew) {
    return openInNew ? { target: '_blank', rel: 'noopener' } : {};
  }

  function sceneCardFor(group) {
    if (!group || !group.items) return [];
    if (group.kind === 'items') {
      return group.items.map(function (it, i) {
        return {
          key: 'items:' + it.title + ':' + i,
          icon: it.icon, iconTone: it.iconTone || '',
          name: it.title,
          nameHref: it.href || null,
          nameTarget: it.targetBlank ? '_blank' : null,
          desc: it.description,
          meta: it.meta || null,
          links: it.demoHref
            ? [{ label: it.demoLabel || 'Demo →', href: it.demoHref, target: '_blank' }]
            : [],
          tags: [],
          badge: null,
          style: { '--card-delay': (0.01 + (i % 20) * 0.012) + 's' }
        };
      });
    }
    if (group.kind === 'stories') {
      return group.items.map(function (st) {
        return {
          key: 'stories:' + st.title,
          icon: st.icon || '', iconTone: '',
          name: st.title,
          badge: st.badge || null,
          desc: st.description,
          tags: (st.sceneLinks || []).map(function (sl) {
            return { text: sl.label, href: sl.href, modifier: 'info' };
          }),
          links: st.links || [],
          meta: st.meta || null,
          nameHref: null, nameTarget: null,
          style: {}
        };
      });
    }
    if (group.kind === 'scenes') {
      return group.items.map(function (sc) {
        return {
          key: 'scenes:' + sc.title,
          icon: '', iconTone: '',
          name: (sc.index ? sc.index + ' · ' : '') + sc.title,
          nameHref: sc.href || null,
          desc: sc.description,
          links: sc.previewHref
            ? [{ label: sc.previewLabel || 'Diagram →', href: sc.previewHref, target: '_blank' }]
            : [],
          tags: [], badge: null, meta: null, nameTarget: null,
          style: {}
        };
      });
    }
    return [];
  }

  function resolveStats(rawStats) {
    return (rawStats || []).map(function (s) {
      return {
        value: s.value, label: s.label, sub: s.sub,
        modifier: s.modifier || (s.tone === 'secondary' ? 'cyan' : 'accent')
      };
    });
  }

  /** Display a visible error banner when Vue fails to load. */
  function showVueMissing(err) {
    var banner = document.createElement('div');
    banner.id = 'dashboard-vue-missing';
    banner.style.cssText =
      'position:fixed;top:0;left:0;right:0;padding:16px 20px;background:#ef4444;color:#fff;' +
      'font-family:monospace;z-index:9999;white-space:pre-wrap;line-height:1.5;font-size:13px;';
    banner.textContent = '[YiDoc Dashboard] Vue failed to load: ' + (err && err.message || String(err)) +
      '\nExpected Vue 3 CDN from YiPet/cdn/vendor/ with unpkg fallback — open DevTools → Network tab.';
    document.body.appendChild(banner);
  }

  /** Tab definitions used by multiple computed properties (module scope — avoids
   *  Vue 3 _‑prefix proxying restriction). */
  var TAB_DEFS = [
    { key: 'daily',   label: 'Daily',   icon: '\u2600\uFE0F' },
    { key: 'weekly',  label: 'Weekly',  icon: '\uD83D\uDCC5' },
    { key: 'monthly', label: 'Monthly', icon: '\uD83D\uDDD3'  }
  ];

  // -----------------------------------------------------------------------
  // Mount
  // -----------------------------------------------------------------------

  function doMount() {
    var app = Vue.createApp({
      data: function () {
        return {
          titleIcon:        config.titleIcon   || '\u2605',
          title:            config.title       || '',
          tagline:          config.tagline     || '',
          breadcrumb:       config.breadcrumb  || [],
          stats:            resolveStats(config.stats),
          panelHub:         config.panelHub    || null,
          sections:         config.sections    || [],
          thirdPartyLibraries: config.thirdPartyLibraries || [],
          footerLinks:      config.footerLinks || [],
          footerNote:       config.footerNote  || '',
          reportPanelOpen:  false,
          activeReportTab:  'daily',
          reportsList:      config.reportsList || null
        };
      },

      computed: {
        _tabDefs: function () {
          return [
            { key: 'daily',   label: 'Daily',   icon: '\u2600\uFE0F' },
            { key: 'weekly',  label: 'Weekly',  icon: '\uD83D\uDCC5' },
            { key: 'monthly', label: 'Monthly', icon: '\uD83D\uDDD3'  }
          ];
        },
        visibleReportTabs: function () {
          var self = this;
          return this._tabDefs.map(function (t) {
            return {
              key: t.key, label: t.label, icon: t.icon,
              count: self.reportsList ? (self.reportsList[t.key] || []).length : 0
            };
          });
        },
        activeReportItems: function () {
          if (!this.reportsList) return [];
          return this.reportsList[this.activeReportTab] || [];
        },
        notifCount: function () {
          if (!this.reportsList) return 0;
          var tabs = this._tabDefs;
          var n = 0;
          for (var i = 0; i < tabs.length; i++) {
            n += (this.reportsList[tabs[i].key] || []).length;
          }
          return n;
        },
        notifTitle: function () {
          var n = this.notifCount;
          return n > 0
            ? '\u67E5\u770B ' + n + ' \u4EFD\u65E5\u62A5\u5206\u6790\u62A5\u544A'
            : '\u6682\u65E0\u65E5\u62A5\u62A5\u544A';
        },
        notifPulse: function () {
          return this.notifCount > 0 && !this.reportPanelOpen;
        },
        latestReportDate: function () {
          if (!this.reportsList) return '—';
          var tabs = this._tabDefs;
          var latest = '';
          for (var i = 0; i < tabs.length; i++) {
            var items = this.reportsList[tabs[i].key] || [];
            for (var j = 0; j < items.length; j++) {
              if (!latest || items[j].date > latest) latest = items[j].date;
            }
          }
          return latest || '—';
        },
        librariesMeta: function () {
          var cats = this.thirdPartyLibraries.length;
          var total = 0;
          this.thirdPartyLibraries.forEach(function (c) { total += (c.items || []).length; });
          return total + ' libraries \u00B7 ' + cats + ' categories \u00B7 official docs';
        }
      },

      methods: {
        linkAttrs: linkAttrs,
        sceneCardFor: sceneCardFor,

        openReportPanel: function (initialTab) {
          this.activeReportTab = initialTab || 'daily';
          this.reportPanelOpen = true;
        },
        closeReportPanel: function () {
          this.reportPanelOpen = false;
        },
        selectReportTab: function (key) {
          this.activeReportTab = key;
        },

        onPanelHubSelect: function (evt) {
          var panel = (evt && evt.detail && typeof evt.detail === 'object')
            ? evt.detail.panel : evt;
          var ph = this.panelHub;
          if (!ph) return;
          if (panel === 'reports') {
            this.openReportPanel('daily');
            return;
          }
          var url = (ph.urls || {})[panel];
          if (!url) return;
          var btn = (ph.buttons || []).filter(function (b) { return b && b.panel === panel; })[0];
          var open = btn && btn.targetBlank !== undefined
            ? btn.targetBlank
            : (ph.targetBlank === true);
          if (open) {
            window.open(url, '_blank', 'noopener');
          } else {
            window.location.href = url;
          }
        },

        syncScrollState: function () {
          var y     = window.pageYOffset || document.documentElement.scrollTop || 0;
          var max   = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          var ratio = Math.max(0, Math.min(100, (y / max) * 100));
          var bar   = document.querySelector('[data-progress-bar]');
          if (bar) bar.style.width = ratio + '%';
        },

        scheduleScrollSync: function () {
          var self = this;
          if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
          animationFrameId = window.requestAnimationFrame(function () { self.syncScrollState(); });
        },

        openLibUrl: function (url) {
          if (!url) return;
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      },

      mounted: function () {
        var self = this;
        self._teardownCtrl = new AbortController();
        _teardownCtrl = self._teardownCtrl;
        window.addEventListener('scroll', function () { self.scheduleScrollSync(); }, {
          passive: true, signal: self._teardownCtrl.signal
        });
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && self.reportPanelOpen) self.closeReportPanel();
        }, { signal: self._teardownCtrl.signal });
        self.$nextTick(function () { self.syncScrollState(); });
      },

      beforeUnmount: function () {
        if (animationFrameId) { window.cancelAnimationFrame(animationFrameId); animationFrameId = 0; }
        if (this._teardownCtrl) { this._teardownCtrl.abort(); this._teardownCtrl = null; _teardownCtrl = null; }
      }
    });

    // ── Inline panel-hub component ────────────────────────────────────
    app.component('yry-panel-hub-inline', {
      props: { buttons: Array, flow: String },
      emits: ['select'],
      template:
        '<div class="panel-hub-container">' +
        '<button v-for="(btn, i) in buttons" :key="i"' +
        '  :style="{color: btn.color || \'var(--yry-accent,#22C55E)\'}"' +
        '  @click="$emit(\'select\', {detail:{panel:btn.panel}})">' +
        '<span v-html="btn.icon" class="panel-hub-btn-icon"></span><span>{{ btn.name }}</span>' +
        '</button>' +
        '<div v-if="flow" class="panel-hub-flow">{{ flow }}</div>' +
        '</div>'
    });

    // try/finally 守卫 — 确保即使挂载失败 v-cloak 也能正确移除
    try {
      app.mount('#dashboard-app');
    } finally {
      var el = document.getElementById('dashboard-app');
      if (el && el.hasAttribute('v-cloak')) {
        el.removeAttribute('v-cloak');
      }
    }

    _app = app;

    window.__ruiInitTeardown = function () {
      if (animationFrameId) { window.cancelAnimationFrame(animationFrameId); animationFrameId = 0; }
      if (_teardownCtrl)    { _teardownCtrl.abort(); _teardownCtrl = null; }
      if (_app)             { _app.unmount(); _app = null; }
    };
  }

  // ── Vue readiness detection ────────────────────────────────────────

  function boot() {
    // Prefer the standard __vueLoadPromise contract (used by shared loader).
    // Falls back to short-timeout polling for self-hosted Vue CDN setups.
    if (window.__vueLoadPromise) {
      window.__vueLoadPromise.then(function () {
        if (typeof Vue !== 'undefined') { doMount(); }
        else { showVueMissing(new Error('Vue global absent after __vueLoadPromise resolved')); }
      }).catch(function (err) {
        showVueMissing(err);
      });
      return;
    }

    // Fallback: poll until Vue is on window (max 10 s)
    var waited = 0;
    var maxWait = 10000;
    var step = 80;
    var timer = setInterval(function () {
      waited += step;
      if (typeof Vue !== 'undefined') {
        clearInterval(timer);
        doMount();
        return;
      }
      if (waited >= maxWait) {
        clearInterval(timer);
        showVueMissing(new Error('Vue not detected on window after ' + (maxWait / 1000) + 's — CDN may be offline'));
      }
    }, step);
  }

  boot();
})();
