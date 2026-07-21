/* ═══════════════════════════════════════════════════════════════════════════
   rui HTML CDN — ruiBackTop · Vue 3 back-to-top button (single-file entry)

   Applicable to: any page that needs a back-to-top feature · zero-config self-init

   Design principles:
     · Default behavior: show after scrolling past 400px, smooth scroll-to-top
     · All thresholds/offsets/icons/labels are centrally tunable via data.js

   Page usage (host page):
     <script src="/YiPet/libs/vue.global.js"></script>
     <script src="/YiPet/cdn/components/rui-back-top/index.js"></script>
     No JS or HTML required — the script auto-creates the button and binds events.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    /* ── Singleton state ──────────────────────────────────────────────────── */
    var _app          = null;
    var _scrollCtrl   = null;
    var _cfg          = null;
    var _loaderCtx    = null;

    /* ── Lazily mount the Vue app ─────────────────────────────────────────── */
    function _mountApp(templateHTML) {
        if (_app) return;
        if (!window.Vue) {
            throw new Error('Vue 3 not loaded, please include vue.global.prod.js first');
        }

        var d = _cfg && _cfg.defaults || {};
        var host = document.getElementById(d.hostId || 'rui-back-top-host');
        if (!host) {
            host = document.createElement('div');
            host.id = d.hostId || 'rui-back-top-host';
            document.body.appendChild(host);
        }

        _app = window.Vue.createApp({
            template: templateHTML,
            data: function () {
                return {
                    visible:   window.scrollY > (d.threshold || 400),
                    icon:      d.iconChar || '\u2191',
                    ariaLabel: d.ariaLabel || 'Back to top'
                };
            },
            methods: {
                scrollToTop: function () {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            },
            mounted: function () {
                var el = this.$el;
                var d = (_cfg && _cfg.defaults) || {};
                el.style.setProperty('--rui-back-top-size',  (d.size || 42) + 'px');
                el.style.setProperty('--rui-back-top-right', (d.rightOffset || 28) + 'px');
                el.style.setProperty('--rui-back-top-bottom',(d.bottomOffset || 28) + 'px');
                el.style.setProperty('--rui-back-top-z',     d.zIndex || 100);

                var self = this;
                var threshold = (_cfg && _cfg.defaults && _cfg.defaults.threshold) || 400;
                _scrollCtrl = new AbortController();
                var ticking = false;
                function onScroll() {
                    if (ticking) return;
                    requestAnimationFrame(function () {
                        self.visible = window.scrollY > threshold;
                        ticking = false;
                    });
                    ticking = true;
                }
                window.addEventListener('scroll', onScroll, {
                    passive: true,
                    signal:  _scrollCtrl.signal
                });
                this.visible = window.scrollY > threshold;
                host._ruiBackTopInstance = this;
            },
            beforeUnmount: function () {
                if (_scrollCtrl) {
                    _scrollCtrl.abort();
                    _scrollCtrl = null;
                }
                var hostId = (_cfg && _cfg.defaults && _cfg.defaults.hostId) || 'rui-back-top-host';
                var h = document.getElementById(hostId);
                if (h) h._ruiBackTopInstance = null;
                _app = null;
            }
        });

        _app.mount(host);
        if (_loaderCtx) _loaderCtx.dispatchReady();
    }

    /* ── onReady ──────────────────────────────────────────────────────────── */
    function onReady(cfg, ctx) {
        _cfg = cfg;
        _loaderCtx = ctx;
        ctx.fetchTemplate(cfg.templateId, cfg.loadTimeoutMs)
            .then(_mountApp)
            .catch(function (err) {
                console.error('[ruiBackTop] template load failed:', err);
                ctx.dispatchError(err);
            });
    }

    /* ── Bootstrap ── */
    ruiBootstrapComponent({
        componentName: 'ruiBackTop',
        configKey:     'rui_BACK_TOP_CONFIG',
        cssMarker:     'rui-back-top-css',
        readyEvent:    'rui-back-top-ready',
        errorEvent:    'rui-back-top-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'rui-back-top-tpl',
            loadTimeoutMs: ruiComponentHelpers.DEFAULT_LOAD_TIMEOUT_MS,
            defaults: {
                threshold:    400,
                size:         42,
                bottomOffset: 28,
                rightOffset:  28,
                iconChar:     '\u2191',
                ariaLabel:    'Back to top',
                hostId:       'rui-back-top-host',
                zIndex:       100
            }
        },
        onReady: onReady
    });
})();
