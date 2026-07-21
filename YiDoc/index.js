/**
 * YiDoc · Dashboard Vue 3 mount
 * --------------------------------------------------------------------------
 * Self-contained: no CDN shared component dependencies.
 * All custom elements (rui-breadcrumb, rui-stats-grid, rui-scene-card,
 * rui-tag-chip, rui-panel-hub, rui-back-top) are defined as inline
 * Vue 3 components. Vue 3 is loaded via CDN in index.html.
 */
(function () {
  'use strict';

  var config = window.HELP_CONFIG || {};
  var animationFrameId = 0;

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
          name: (st.icon ? st.icon + ' ' : '') + st.title,
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

  function _resolveStats(rawStats) {
    return (rawStats || []).map(function (s) {
      return {
        value: s.value, label: s.label, sub: s.sub,
        modifier: s.modifier || (s.tone === 'secondary' ? 'cyan' : 'accent')
      };
    });
  }

  // ── Vue app mount (once Vue 3 is ready from CDN) ──────────────────────
  function mountApp() {
    if (typeof Vue === 'undefined') {
      setTimeout(mountApp, 50);
      return;
    }

    var app = Vue.createApp({
      data: function () {
        return {
          titleIcon:        config.titleIcon   || '★',
          title:            config.title       || '',
          tagline:          config.tagline     || '',
          breadcrumb:       config.breadcrumb  || [],
          stats:            _resolveStats(config.stats),
          panelHub:         config.panelHub    || null,
          sections:         config.sections    || [],
          footerLinks:      config.footerLinks || [],
          footerNote:       config.footerNote  || '',
          reportPanelOpen:  false,
          activeReportTab:  'daily',
          reportTabs: [
            { key: 'daily',   label: 'Daily',   icon: '☀️' },
            { key: 'weekly',  label: 'Weekly',  icon: '📅' },
            { key: 'monthly', label: 'Monthly', icon: '🗓' }
          ],
          reportsList:      config.reportsList || null
        };
      },

      computed: {
        activeReportItems: function () {
          if (!this.reportsList) return [];
          return this.reportsList[this.activeReportTab] || [];
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
        }
      },

      mounted: function () {
        var self = this;
        self._ctrl = new AbortController();
        window.addEventListener('scroll', function () { self.scheduleScrollSync(); }, {
          passive: true, signal: self._ctrl.signal
        });
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && self.reportPanelOpen) self.closeReportPanel();
        }, { signal: self._ctrl.signal });
        self.$nextTick(function () { self.syncScrollState(); });
      },

      beforeUnmount: function () {
        if (animationFrameId) { window.cancelAnimationFrame(animationFrameId); animationFrameId = 0; }
        if (this._ctrl) { this._ctrl.abort(); this._ctrl = null; }
      }
    });

    // ── Inline panel-hub component ──────────────────────────────────────
    app.component('rui-panel-hub-inline', {
      props: { buttons: Array, flow: String, label: Object },
      emits: ['select'],
      template: '<div style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px;padding:14px 16px;border-radius:12px;background:color-mix(in srgb, var(--rui-text,#F8FAFC) 3%, transparent);border:1px solid color-mix(in srgb, var(--rui-text,#F8FAFC) 8%, transparent)">'
        + '<button v-for="(btn, i) in buttons" :key="i" :style="{color: btn.color || \'var(--rui-accent,#22C55E)\'}" @click="$emit(\'select\', {detail:{panel:btn.panel}})">'
        + '<span v-html="btn.icon" style="margin-right:4px"></span><span>{{ btn.name }}</span>'
        + '</button>'
        + '<div v-if="flow" style="width:100%;text-align:center;font-size:.7rem;color:var(--rui-text-muted,#64748b);margin-top:4px">{{ flow }}</div>'
        + '</div>'
    });

    app.mount('#dashboard-app');

    window.__ruiInitTeardown = function () {
      if (animationFrameId) { window.cancelAnimationFrame(animationFrameId); animationFrameId = 0; }
      if (app) app.unmount();
    };
  }

  mountApp();
})();
