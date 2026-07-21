import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

/* ═══════════════════════════════════════════════════════════════════════════
   yryToast · Vue 3 Toast notification component (ES module entry)

   This file:
     1) Uses registerGlobalComponent to load CSS and register the component
     2) Immediately exposes window.yryToast (early calls are queued)
     3) Lazily mounts the Vue app on first actual render
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Singleton state ─────────────────────────────────────────────────────── */
let _app = null;
let _nextId = 1;
let _pending = [];
let _earlyQueue = [];
let _loaderReady = false;
let _cfg = null;

/* ── Default config ──────────────────────────────────────────────────────── */
const DEFAULT_CONFIG = {
    icons: {
        default: '\u2139',
        success: '\u2713',
        warn:    '\u26A0',
        warning: '\u26A0',
        error:   '\u2715',
        info:    '\u2139'
    },
    typeAliases: { warning: 'warn' },
    defaults: {
        duration:      3500,
        maxToasts:     5,
        templateId:    'yry-toast-tpl',
        hostId:        'yry-toast-host',
        loadTimeoutMs: 5000
    }
};

/* ── Type alias normalization ─────────────────────────────────────────────── */
function normalizeType(type) {
    type = String(type || 'default');
    if (_cfg.typeAliases[type]) return _cfg.typeAliases[type];
    if (_cfg.icons[type] === undefined) return 'default';
    return type;
}

/* ── Lazily mount the Vue app ─────────────────────────────────────────────── */
function mountApp(templateHTML) {
    if (_app) return _app;
    if (!window.Vue) {
        throw new Error('Vue 3 not loaded, please include vue.global.prod.js first');
    }

    let host = document.getElementById(_cfg.defaults.hostId);
    if (!host) {
        host = document.createElement('div');
        host.id = _cfg.defaults.hostId;
        document.body.appendChild(host);
    }

    const app = window.Vue.createApp({
        template: templateHTML,
        data() { return { items: [], icons: _cfg.icons }; },
        methods: {
            dismiss(id) {
                if (id == null) {
                    this.items.forEach(function (it) {
                        if (it._tid) clearTimeout(it._tid);
                    });
                    this.items = [];
                    return;
                }
                for (let i = 0; i < this.items.length; i++) {
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

    /* Drain toasts cached before mount */
    const q = _pending;
    _pending = [];
    q.forEach(_pushItem);

    return _app;
}

/* ── Push a toast into the list ───────────────────────────────────────────── */
function _pushItem(item) {
    if (!_app) return;
    const data = _app;
    const items = data.items;

    while (items.length >= _cfg.defaults.maxToasts) {
        const dropped = items.shift();
        if (dropped && dropped._tid) clearTimeout(dropped._tid);
    }
    items.push(item);

    if (item.duration > 0) {
        item._tid = setTimeout(function () {
            data.dismiss(item.id);
        }, item.duration);
    }
}

/* ── Build an item and render ─────────────────────────────────────────────── */
function _doShow(text, type, title, duration, preAssignedId) {
    const t = normalizeType(type);
    const d = typeof duration === 'number' ? duration : _cfg.defaults.duration;
    const item = {
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

    /* Template not loaded yet: cache and mount asynchronously */
    _pending.push(item);
    /* Wait for template to be available via the registered component */
    const checkTemplate = setInterval(function () {
        const comp = window.yryToast;
        if (comp && comp.template) {
            clearInterval(checkTemplate);
            mountApp(comp.template);
        }
    }, 50);
    return item;
}

/* ── Public API ───────────────────────────────────────────────────────────── */
function show(text, type, title, duration) {
    if (!_loaderReady) {
        const id = _nextId++;
        _earlyQueue.push({ fn: _doShow, args: [text, type, title, duration, id] });
        return { id, _queued: true };
    }
    return _doShow(text, type, title, duration);
}
function success(text, title, duration) { return show(text, 'success', title, duration); }
function error(text, title, duration)   { return show(text, 'error',   title, duration); }
function warn(text, title, duration)    { return show(text, 'warn',    title, duration); }
function info(text, title, duration)    { return show(text, 'info',    title, duration); }

function dismiss(id) {
    if (!_app) return;
    _app.dismiss(id);
}

/* ── Immediately expose the global API ────────────────────────────────────── */
window.yryToast = {
    show,
    success,
    error,
    warn,
    info,
    dismiss
};

/* ── Drain early API calls ────────────────────────────────────────────────── */
function _flushEarlyQueue() {
    const q = _earlyQueue;
    _earlyQueue = [];
    q.forEach(function (entry) {
        try {
            entry.fn.apply(null, entry.args);
        } catch (err) {
            console.error('[yryToast] early call replay failed:', err);
        }
    });
}

/* ── Register component via componentLoader ───────────────────────────────── */
const compDef = {
    name: 'yryToast',
    html: '/cdn/components/common/feedback/YrYToast/template.html',
    css: '/cdn/components/common/feedback/YrYToast/index.css'
};

registerGlobalComponent(compDef).then(function () {
    _cfg = DEFAULT_CONFIG;
    _loaderReady = true;
    _flushEarlyQueue();
});

export default compDef;
