/* ═══════════════════════════════════════════════════════════════════════════
   rui HTML CDN — ruiToast · Vue 3 Toast notification component (single-file entry)

   Applicable to: page-level notifications · copy-success feedback · action hints

   Responsibilities of this file:
     1) Auto-load ../shared/loader.js via ruiBootstrapFromCurrentScript and pass callerSrc
     2) Inject index.css + load data.js + dispatch ready/error events via ruiLoadComponent
     3) Immediately expose window.ruiToast (calls before the loader is ready are auto-enqueued,
        and replayed once loading completes)
     4) On first call, fetch index.html in the same directory and use DOMParser to extract
        <script type="text/x-template" id="rui-toast-tpl"> as the Vue template
     5) Lazily mount the Vue app (created only on first actual render)

   Page usage (host page):
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../rui-html-cdn/rui-toast/index.js"></script>
     <script>ruiToast.success('Copied', 'Link copied');</script>

   Note: calls to ruiToast.* during the async loader/data.js load are internally
         queued, and auto-replayed and rendered once loading completes.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── Singleton state (shared within the closure, spans the placeholder and first render) ────── */
    var _app = null;          // Vue app instance (singleton)
    var _nextId = 1;          // toast id auto-increment
    var _pending = [];        // toasts cached while the template is not loaded
    var _earlyQueue = [];     // API calls cached while the loader is not ready
    var _loaderReady = false; // whether the loader (data.js) has initialized
    var _loaderCtx = null;    // ctx passed in by ruiLoadComponent (fetchTemplate/dispatchReady/...)
    var _cfg = null;          // current config (shallow-merge result of data.js + defaultConfig)

    /* ── Default config for toasts (fields correspond one-to-one with defaultConfig;
           the onerror fallback reuses it directly to avoid drift between two definitions) ─────────────────────────────────────────── */
    var DEFAULT_CONFIG = {
        icons: {
            default: 'ℹ',
            success: '✓',
            warn:    '⚠',
            warning: '⚠',
            error:   '✕',
            info:    'ℹ'
        },
        typeAliases: { warning: 'warn' },
        defaults: {
            duration:      3500,
            maxToasts:     5,
            templateId:    'rui-toast-tpl',
            hostId:        'rui-toast-host',
            loadTimeoutMs: 5000
        }
    };

    /* ── Type alias normalization ─────────────────────────────────────────── */
    function normalizeType(type) {
        type = String(type || 'default');
        if (_cfg.typeAliases[type]) return _cfg.typeAliases[type];
        if (_cfg.icons[type] === undefined) return 'default';
        return type;
    }

    /* ── Lazily mount the Vue app ─────────────────────────────────────────── */
    function mountApp(templateHTML) {
        if (_app) return _app;
        if (!window.Vue) {
            throw new Error('Vue 3 not loaded, please include vue.global.prod.js first');
        }

        var host = document.getElementById(_cfg.defaults.hostId);
        if (!host) {
            host = document.createElement('div');
            host.id = _cfg.defaults.hostId;
            document.body.appendChild(host);
        }

        var app = window.Vue.createApp({
            template: templateHTML,
            data: function () { return { items: [], icons: _cfg.icons }; },
            methods: {
                /* Unified dismiss entry: when id is null/undefined clears all,
                   otherwise removes by id */
                dismiss: function (id) {
                    if (id == null) {
                        this.items.forEach(function (it) {
                            if (it._tid) clearTimeout(it._tid);
                        });
                        this.items = [];
                        return;
                    }
                    for (var i = 0; i < this.items.length; i++) {
                        if (this.items[i].id === id) {
                            if (this.items[i]._tid) clearTimeout(this.items[i]._tid);
                            this.items.splice(i, 1);
                            return;
                        }
                    }
                }
            }
        });

        _app = app.mount(host);

        /* Dispatch the ready event (for pages that need to do something after mount) */
        if (_loaderCtx) _loaderCtx.dispatchReady();

        /* Drain toasts cached before mount */
        var q = _pending;
        _pending = [];
        q.forEach(_pushItem);

        return _app;
    }

    /* ── Push a toast into the list (length-limited + auto-dismiss; timer handle stored in item._tid) ── */
    function _pushItem(item) {
        if (!_app) return;
        var data = _app;
        var items = data.items;

        /* Cap protection: when exceeded, drop the oldest */
        while (items.length >= _cfg.defaults.maxToasts) {
            var dropped = items.shift();
            if (dropped && dropped._tid) clearTimeout(dropped._tid);
        }
        items.push(item);

        /* Auto-dismiss (save timer id for clear on manual dismiss) */
        if (item.duration > 0) {
            item._tid = setTimeout(function () {
                data.dismiss(item.id);
            }, item.duration);
        }
    }

    /* ── Build an item and perform the actual render (internal function, all paths go through here) ────── */
    function _doShow(text, type, title, duration, preAssignedId) {
        var t = normalizeType(type);
        var d = typeof duration === 'number' ? duration : _cfg.defaults.duration;
        var item = {
            id: preAssignedId || _nextId++,
            type: t,
            text: String(text == null ? '' : text),
            title: title ? String(title) : '',
            duration: d,
            _tid: null
        };

        if (_app) {
            _pushItem(item);
            return item;
        }

        /* Template not loaded: cache and mount asynchronously */
        _pending.push(item);
        _loaderCtx.fetchTemplate(_cfg.defaults.templateId, _cfg.defaults.loadTimeoutMs)
            .then(mountApp)
            .catch(function (err) {
                console.error('[ruiToast] template load failed:', err);
                if (_loaderCtx) _loaderCtx.dispatchError(err);
                _pending = [];
            });
        return item;
    }

    /* ── Public API: show(text, type?, title?, duration?) ─────────── */
    function show(text, type, title, duration) {
        if (!_loaderReady) {
            /* Loader not ready: reserve an id placeholder to return, replay after load */
            var id = _nextId++;
            _earlyQueue.push({ fn: _doShow, args: [text, type, title, duration, id] });
            return { id: id, _queued: true };
        }
        return _doShow(text, type, title, duration);
    }
    function success(text, title, duration) { return show(text, 'success', title, duration); }
    function error(text, title, duration)   { return show(text, 'error',   title, duration); }
    function warn(text, title, duration)    { return show(text, 'warn',    title, duration); }
    function info(text, title, duration)    { return show(text, 'info',    title, duration); }

    /* dismiss takes a single path: hand it directly to the Vue method (null/undefined = clear all) */
    function dismiss(id) {
        if (!_app) return;
        _app.dismiss(id);
    }

    /* ── Immediately expose the global API (early calls during async load also enqueue correctly) ──── */
    window.ruiToast = {
        show:    show,
        success: success,
        error:   error,
        warn:    warn,
        info:    info,
        dismiss: dismiss
    };

    /* ── Drain early API calls made while the loader was not ready (call _doShow directly to keep pre-allocated ids) ── */
    function _flushEarlyQueue() {
        var q = _earlyQueue;
        _earlyQueue = [];
        q.forEach(function (entry) {
            try {
                entry.fn.apply(null, entry.args);
            } catch (err) {
                console.error('[ruiToast] early call replay failed:', err);
            }
        });
    }

    /* ── onReady: called by ruiLoadComponent once config is ready ─────────── */
    function _onReady(cfg, ctx) {
        _cfg = cfg;
        _loaderCtx = ctx;
        _loaderReady = true;
        _flushEarlyQueue();
    }

    /* ── Startup: use the bootstrap utility provided by the shared loader to inject the loader and initialize ── */
    ruiBootstrapFromCurrentScript({
        configKey:     'rui_TOAST_CONFIG',
        cssMarker:     'rui-toast-css',
        readyEvent:    'rui-toast-ready',
        errorEvent:    'rui-toast-error',
        componentName: 'ruiToast',
        defaultConfig: DEFAULT_CONFIG,
        onReady: _onReady
    }, function () {
        /* Fallback when loader.js fails to load (e.g. 404):
           toast is a nice-to-have notification component; unlike other components
           (reject queue), we keep the API call path from crashing. Subsequent
           show() calls fail gracefully via the stub fetchTemplate (actual render
           fails but no exception is thrown to pollute the caller). */
        _onReady(DEFAULT_CONFIG, {
            getTemplateUrl: function () { return null; },
            fetchTemplate:  function () { return Promise.reject(new Error('loader.js not loaded')); },
            dispatchReady:  function () {},
            dispatchError:  function () {}
        });
    });
})();