/**
 * rui-init · Standalone dashboard Vue 3 mount (rebuilt 2026-07-15)
 * ----------------------------------------------------------------------
 * Refactor over v1:
 *   1. Vue 3 is injected by shared/loader.js (unified). We just await
 *      window.__vueLoadPromise.
 *   2. <rui-scene-card> / <rui-tag-chip> / <rui-stats-grid> /
 *      <rui-breadcrumb> / <rui-panel-hub> are registered as global
 *      components once their *-ready event fires. The parallel
 *      _whenReady() pattern waits for all of them with a single
 *      Promise.all, then mounts the dashboard app. <rui-back-top> is
 *      auto-mounted by the shared loader and needs no registration.
 *   3. High-level KPIs: <rui-stats-grid> is a child component of the
 *      dashboard app — bound to data.js's `stats` array. The CDN
 *      component owns the card chrome (border / hover / animation)
 *      and the per-modifier color tokens.
 *   4. Cross-report navigation: <rui-panel-hub> dispatches
 *      'panel-hub-select' events; onPanelHubSelect navigates to the
 *      URL mapped in panelHub.urls.
 *   5. Reading-progress: the only page-level concern left. It writes
 *      width: % to [data-progress-bar] on every scroll, gated by a
 *      single requestAnimationFrame and torn down on __ruiInitTeardown.
 */
(function () {
  'use strict';

  var config = window.HELP_CONFIG || {};
  var animationFrameId = 0;

  // Build { target, rel } object for v-bind based on whether the link
  // should open in a new tab. Returning `{}` adds no attributes.
  function linkAttrs(openInNew) {
    return openInNew ? { target: '_blank', rel: 'noopener' } : {};
  }

  // sceneCardFor(group) · per-kind mapping from HELP_CONFIG items to
  // <rui-scene-card> props. Returns an array of card descriptors; the
  // section template iterates over them with a single v-for. Centralising
  // the dispatch here keeps the section HTML a one-liner and lets the
  // template reference <rui-scene-card> directly with no extra wrapper.
  function sceneCardFor(group) {
    if (!group || !group.items) return [];
    if (group.kind === 'items') {
      return group.items.map(function (it, i) {
        return {
          key: 'items:' + it.title + ':' + i,
          name: it.title,
          nameHref: it.href || null,
          nameTarget: it.targetBlank ? '_blank' : null,
          // items: HELP_CONFIG keeps description (plain) and meta (HTML with
          // <span class="accent">) on separate fields. rui-scene-card exposes
          // only one v-html desc slot, so join them on a <br>. The accent
          // utility is styled in index.css so it still pops on the dashboard
          // palette.
          desc: [it.description, it.meta].filter(Boolean).join('<br>'),
          // items: allow per-card explicit links from data.js. When absent,
          // keep the older demoHref bridge so existing generated cards
          // continue to render a single footer action.
          links: Array.isArray(it.links)
            ? it.links
            : (it.demoHref
              ? [{ label: it.demoLabel || 'Interactive Demo →', href: it.demoHref, target: '_blank' }]
              : []),
          // Staggered card entrance delay (rui-scene-card reads --card-delay).
          style: { '--card-delay': (0.01 + (i % 20) * 0.012) + 's' }
        };
      });
    }
    if (group.kind === 'stories') {
      return group.items.map(function (st) {
        return {
          key: 'stories:' + st.title,
          // stories: prepend the emoji icon to the name (rui-scene-card has
          // no separate icon slot; the emoji gives a quick visual cue).
          name: (st.icon ? st.icon + ' ' : '') + st.title,
          badge: st.badge,
          desc: st.description,
          // stories: sceneLinks use {label, href}, but rui-tag-chip wants
          // {text, href, modifier}. Normalize the shape here so rui-scene-card
          // can pass the array through to its tags row untouched.
          tags: (st.sceneLinks || []).map(function (sl) {
            return { text: sl.label, href: sl.href, modifier: 'info' };
          }),
          links: st.links,
          meta: st.meta
        };
      });
    }
    if (group.kind === 'scenes') {
      return group.items.map(function (sc) {
        return {
          key: 'scenes:' + sc.title,
          // scenes: prepend the index (e.g. "Scene 1") to the name so the
          // ordering is visible without a separate slot.
          name: (sc.index ? sc.index + ' · ' : '') + sc.title,
          nameHref: sc.href || null,
          desc: sc.description,
          // scenes: build a custom link entry for the preview button
          // (renders as the footer link row in rui-scene-card).
          links: sc.previewHref
            ? [{ label: sc.previewLabel || 'Architecture Diagram →', href: sc.previewHref, target: '_blank' }]
            : []
        };
      });
    }
    return [];
  }

  /* ── Component-ready gate ───────────────────────────────────────────────
     Wait for ALL CDN components we depend on to be ready before mounting.
     Each component dispatches a *-ready (or *-error) event from its
     onReady. We treat both as "settle" so a network failure does not
     block the page; the components degrade to empty custom elements. */
  function _whenReady(globalName, readyEvent, errorEvent) {
    return new Promise(function (resolve) {
      if (window[globalName] && window[globalName].name === globalName) { resolve(); return; }
      var settled = false;
      function done() { if (settled) return; settled = true; resolve(); }
      document.addEventListener(readyEvent, done, { once: true });
      document.addEventListener(errorEvent, done, { once: true });
      setTimeout(done, 5000);
    });
  }

  /* ── Resolve the stats shape for <rui-stats-grid> ───────────────────────
     data.js may carry the legacy `tone: "secondary"` field. Map it to
     the CDN's modifier vocabulary (accent | cyan | pass | fail | warn |
     info | health) so existing per-project data.js keep working. */
  function _resolveStats(rawStats) {
    return (rawStats || []).map(function (s) {
      return {
        value:    s.value,
        label:    s.label,
        sub:      s.sub,
        modifier: s.modifier || (s.tone === 'secondary' ? 'cyan' : 'accent')
      };
    });
  }

  /* ── Page-level state (Vue 3 reactive data) ─────────────────────────────
     NOTE: var app is declared here so the IIFE hoists it, but the actual
     Vue.createApp call happens INSIDE the window.__vueLoadPromise.then(...)
     callback below — the dynamic Vue script loaded by shared/loader.js is
     async, so calling Vue.createApp() synchronously here would throw
     "ReferenceError: Vue is not defined" (the v1 page had the same bug
     class and the v2 fix is to keep app creation in the same callback that
     gates on __vueLoadPromise). */
  var app = null;

  /* ── Register CDN components on the Vue app ─────────────────────────────
     Each component, once its template+CSS+data are loaded, exposes itself
     on window (e.g. window.ruiSceneCard). We register it on the app and
     let Vue resolve the tag in the template. */
  function _registerComponent(globalName, tagName) {
    if (app && window[globalName] && window[globalName].name === globalName) {
      app.component(tagName, window[globalName]);
    }
  }

  /* ── Wait for Vue 3 (CDN) to finish loading before calling Vue.createApp.
     The Vue script is injected by shared/loader.js; __vueLoadPromise is
     the contract exposed by the loader and resolves once Vue is on
     window. We register + mount AFTER it resolves so the app can use
     Vue.component / Vue.createApp synchronously. */
  window.__vueLoadPromise = window.__vueLoadPromise || Promise.resolve();
  window.__vueLoadPromise.then(function () {
    if (typeof Vue === 'undefined') {
      console.error('[rui-init] Vue global not present after load promise — page will not mount');
      return;
    }

    app = Vue.createApp({
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

          // Floating Reports panel — opened by the "Reports" button in
          // <rui-panel-hub>. `reportTabs` is derived once (cadence key +
          // label + icon); `reportsList` is the per-cadence list from
          // data.js. `reportPanelOpen` toggles the overlay/panel via the
          // `is-open` class on the corresponding elements.
          reportPanelOpen:  false,
          activeReportTab:  'daily',
          reportTabs: [
            { key: 'daily',   label: '日报', icon: '☀️' },
            { key: 'weekly',  label: '周报', icon: '📅' },
            { key: 'monthly', label: '月报', icon: '🗓' }
          ],
          reportsList:      config.reportsList || null
        };
      },

      computed: {
        // Items in the currently active tab. The Vue template re-renders
        // whenever `activeReportTab` changes, so the panel body swaps
        // instantly without a re-render of the header / tabs.
        activeReportItems: function () {
          if (!this.reportsList) return [];
          return this.reportsList[this.activeReportTab] || [];
        }
      },

      methods: {
        linkAttrs:     linkAttrs,
        sceneCardFor:  sceneCardFor,

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

        // Cross-report navigation: <rui-panel-hub> dispatches
        // 'panel-hub-select' (detail: { panel }) ONLY when the host
        // page did not pass a `urls` prop to the component (or when
        // `urls[panel]` is missing for the clicked button). When
        // `urls` is provided, the component navigates directly and
        // honors per-button `newTab` / `targetBlank` plus the
        // `targetBlank` panelHub-level default — see
        // shared/components/rui-panel-hub/index.js.
        //
        // The component dispatches a native CustomEvent on its root
        // element (`this.$el.dispatchEvent(new CustomEvent('panel-hub-select',
        // { detail: { panel } }))`), so Vue 3 passes the event object
        // to the @panel-hub-select handler. Unwrap detail.panel here
        // so the rest of the handler can treat `panel` as a plain
        // string. The "Reports" button intentionally omits a URL — it
        // opens the floating reports panel (daily / weekly / monthly
        // tabs) via Vue state instead of navigating away.
        onPanelHubSelect: function (evt) {
          var panel = (evt && evt.detail && typeof evt.detail === 'object')
            ? evt.detail.panel
            : evt;
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

        // Reading-progress only; back-to-top visibility is owned by rui-back-top.
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
          passive: true,
          signal: self._ctrl.signal
        });
        // Esc closes the floating reports panel when it is open. Bound
        // to the same AbortController as the scroll listener so
        // beforeUnmount tears it down without a separate handle.
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && self.reportPanelOpen) self.closeReportPanel();
        }, { signal: self._ctrl.signal });
        self.$nextTick(function () { self.syncScrollState(); });
      },

      beforeUnmount: function () {
        if (animationFrameId) { window.cancelAnimationFrame(animationFrameId); animationFrameId = 0; }
        if (this._ctrl)       { this._ctrl.abort(); this._ctrl = null; }
      }
    });

    Promise.all([
      _whenReady('ruiBreadcrumb', 'rui-breadcrumb-ready', 'rui-breadcrumb-error'),
      _whenReady('ruiStatsGrid',  'rui-stats-grid-ready', 'rui-stats-grid-error'),
      _whenReady('ruiPanelHub',   'rui-panel-hub-ready',  'rui-panel-hub-error'),
      _whenReady('ruiTagChip',    'rui-tag-chip-ready',   'rui-tag-chip-error'),
      _whenReady('ruiSceneCard',  'rui-scene-card-ready', 'rui-scene-card-error')
    ]).then(function () {
      _registerComponent('ruiBreadcrumb', 'rui-breadcrumb');
      _registerComponent('ruiStatsGrid',  'rui-stats-grid');
      _registerComponent('ruiPanelHub',   'rui-panel-hub');
      _registerComponent('ruiTagChip',    'rui-tag-chip');
      _registerComponent('ruiSceneCard',  'rui-scene-card');
      // rui-back-top is auto-mounted by the shared loader; it does not
      // expose a Vue component definition, so we do not register it.

      app.mount('#dashboard-app');

      window.__ruiInitTeardown = function () {
        if (animationFrameId) { window.cancelAnimationFrame(animationFrameId); animationFrameId = 0; }
        if (app) app.unmount();
      };
    });
  });
})();
