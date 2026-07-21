/* ═══════════════════════════════════════════════════════════════════════════
   rui HTML CDN — ruiPanelHub · Vue 3 panel-hub toolbar component (single-file entry)

   This file registers the ruiPanelHub Vue 3 toolbar component via the standard
   rui-* loader chain and also exposes the window.PanelHub global API
   (panel open/close/toggle/register) synchronously from the same script.

   Page usage (host page):
     <script src="/YiPet/cdn/components/rui-panel-hub/index.js"></script>
     <div id="panel-hub-host"></div>
     <script>
       PanelHub.register('my-panel', 'bell-id', 'panel-id', 'overlay-id');
       window.ruiPanelHub.mount({ buttons: [...] }, '#panel-hub-host').then(app => { ... });
     </script>

   Props (Vue template binding):
     label       — { text, panel, title? } clickable label rendered before the
                   buttons. Clicking it routes to `urls[label.panel]` (or
                   dispatches 'panel-hub-select' if no URL is mapped).
    buttons     — Array<{ icon, name, desc?, color?, panel, title?,
                           newTab?, targetBlank?, href? }>. Each button's
                   `panel` is the lookup key in `urls` and in the dispatched
                   event detail. `newTab` / `targetBlank` are accepted for
                   backward compatibility but no longer affect navigation.
     flow        — Optional caption rendered below the row.
     ariaLabel   — aria-label for the toolbar wrapper.
     urls        — { [panel: string]: string } URL map. When a button's
                   `panel` resolves to a URL here, the component navigates
                   directly and does NOT dispatch 'panel-hub-select'.
                   Legacy host pages that pass only `buttons` keep working
                   — the event still fires as a fallback.
    targetBlank — Boolean prop retained for backward compatibility. URL
                  navigation from `onSelect` now always opens in a new tab
                  whenever `urls[panel]` is provided.

   New-tab navigation uses window.open(url, '_blank', 'noopener,noreferrer').
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var H = window.ruiComponentHelpers || {};
    var MS_PER_MINUTE = H.MS_PER_MINUTE || 60000;
    var MS_PER_HOUR   = H.MS_PER_HOUR   || 3600000;
    var MS_PER_DAY    = H.MS_PER_DAY    || 86400000;
    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';
    var PanelHubRegistry = window.PanelHub || {
        registry: {},
        _keydownHandler: null,
        _ensureKeydownListener: function () {
            if (this._keydownHandler) return;
            var self = this;
            this._keydownHandler = function (e) {
                if (e.key === 'Escape') {
                    Object.keys(self.registry).forEach(function (name) {
                        if (self.registry[name].panel.classList.contains('open')) {
                            self.close(name);
                        }
                    });
                }
            };
            document.addEventListener('keydown', this._keydownHandler);
        },
        register: function (name, bellId, panelId, overlayId, onOpen) {
            var bell    = bellId ? document.getElementById(bellId) : null;
            var panel   = document.getElementById(panelId);
            var overlay = document.getElementById(overlayId);
            if (!panel || !overlay) {
                console.warn('[PanelHub] register("' + name + '"): panel or overlay element not found');
                return false;
            }
            this.registry[name] = { bell: bell, panel: panel, overlay: overlay, onOpen: onOpen || null };
            var r = this.registry[name];
            if (r.bell) {
                r.bell.addEventListener('click', function () {
                    PanelHubRegistry.toggle(name);
                });
            }
            r.overlay.addEventListener('click', function () {
                PanelHubRegistry.close(name);
            });
            this._ensureKeydownListener();
            return true;
        },
        unregister: function (name) {
            delete this.registry[name];
        },
        closeAllExcept: function (name) {
            var self = this;
            Object.keys(this.registry).forEach(function (k) {
                if (k !== name) self.close(k);
            });
        },
        open: function (name) {
            var r = this.registry[name];
            if (!r) return;
            this.closeAllExcept(name);
            r.panel.classList.add('open');
            r.overlay.classList.add('open');
            if (r.onOpen) r.onOpen();
        },
        close: function (name) {
            var r = this.registry[name];
            if (!r) return;
            r.panel.classList.remove('open');
            r.overlay.classList.remove('open');
        },
        toggle: function (name) {
            var r = this.registry[name];
            if (!r) return;
            if (r.panel.classList.contains('open')) this.close(name);
            else this.open(name);
        },
        isOpen: function (name) {
            var r = this.registry[name];
            return r ? r.panel.classList.contains('open') : false;
        },
        panelLink: function (name, label) {
            var escapedName = this.escHtml(name);
            return (
                '<a href="#" class="rui-panel-hub-link" onclick="event.preventDefault();event.stopPropagation();PanelHub.open(\'' +
                escapedName +
                '\')">' +
                this.escHtml(label) +
                '</a>'
            );
        },
        escHtml: function (s) {
            var d = document.createElement('div');
            d.textContent = s == null ? '' : String(s);
            return d.innerHTML;
        },
        relativeTime: function (dateStr) {
            if (!dateStr) return '';
            try {
                var d = new Date(dateStr);
                if (isNaN(d.getTime())) return dateStr;
                var now     = new Date();
                var diffMin = Math.floor((now - d) / MS_PER_MINUTE);
                var diffHr  = Math.floor((now - d) / MS_PER_HOUR);
                var diffDay = Math.floor((now - d) / MS_PER_DAY);
                if (diffMin < 1) return 'just now';
                if (diffMin < 60) return diffMin + ' minutes ago';
                if (diffHr < 24) return diffHr + ' hours ago';
                if (diffDay === 1) return 'yesterday';
                if (diffDay < 30) return diffDay + ' days ago';
                var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return months[d.getMonth()] + ' ' + d.getDate();
            } catch (e) {
                return dateStr;
            }
        }
    };

    if (!window.PanelHub) window.PanelHub = PanelHubRegistry;
    if (!window.openPanel) {
        window.openPanel = function (name) { PanelHubRegistry.open(name); };
    }

    ruiBootstrapComponent({
        componentName: 'ruiPanelHub',
        configKey:     'rui_PANEL_HUB_CONFIG',
        cssMarker:     'rui-panel-hub-css',
        readyEvent:    'rui-panel-hub-ready',
        errorEvent:    'rui-panel-hub-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'rui-panel-hub-tpl',
            loadTimeoutMs: ruiComponentHelpers.DEFAULT_LOAD_TIMEOUT_MS,
            defaults: {
                ariaLabel: 'Panel hub toolbar',
                flow:      ''
            }
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'ruiPanelHub',
                template: tpl,
                props: {
                    label:       { type: Object,  default: null },
                    buttons:     { type: Array,   required: true },
                    flow:        { type: String,  default: function () { return cfg.defaults.flow; } },
                    ariaLabel:   { type: String,  default: function () { return cfg.defaults.ariaLabel; } },
                    urls:        { type: Object,  default: function () { return {}; } },
                    targetBlank: { type: Boolean, default: false }
                },
                methods: {
                    // Resolve the URL for a clicked panel. Returns { url } or
                    // null when the component has no URL for this panel
                    // (callers fall back to dispatching 'panel-hub-select').
                    _resolveNav: function (panel) {
                        var url = (this.urls || {})[panel];
                        if (!url) return null;
                        return { url: url };
                    },
                    _navigate: function (url) {
                        window.open(url, '_blank', 'noopener,noreferrer');
                    },
                    onSelect: function (panel) {
                        var nav = this._resolveNav(panel);
                        if (nav) {
                            this._navigate(nav.url);
                            return;
                        }
                        // No URL is mapped for this panel — fall back to
                        // dispatching the legacy event so host pages that
                        // resolve URLs themselves (e.g. a floating panel)
                        // keep working.
                        this.$el.dispatchEvent(new CustomEvent('panel-hub-select', {
                            detail:  { panel: panel },
                            bubbles: true
                        }));
                    },
                    onLabelClick: function () {
                        if (this.label && this.label.panel) this.onSelect(this.label.panel);
                    }
                }
            };
        }
    });
})();
