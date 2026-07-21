import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

/* ── PanelHub global registry (independent of the Vue component) ─────────── */
const MS_PER_MINUTE = 60000;
const MS_PER_HOUR   = 3600000;
const MS_PER_DAY    = 86400000;

const PanelHubRegistry = {
    registry: {},
    _keydownHandler: null,
    _ensureKeydownListener() {
        if (this._keydownHandler) return;
        const self = this;
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
    register(name, bellId, panelId, overlayId, onOpen) {
        const bell    = bellId ? document.getElementById(bellId) : null;
        const panel   = document.getElementById(panelId);
        const overlay = document.getElementById(overlayId);
        if (!panel || !overlay) {
            console.warn('[PanelHub] register("' + name + '"): panel or overlay element not found');
            return false;
        }
        this.registry[name] = { bell, panel, overlay, onOpen: onOpen || null };
        const r = this.registry[name];
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
    unregister(name) {
        delete this.registry[name];
    },
    closeAllExcept(name) {
        const self = this;
        Object.keys(this.registry).forEach(function (k) {
            if (k !== name) self.close(k);
        });
    },
    open(name) {
        const r = this.registry[name];
        if (!r) return;
        this.closeAllExcept(name);
        r.panel.classList.add('open');
        r.overlay.classList.add('open');
        if (r.onOpen) r.onOpen();
    },
    close(name) {
        const r = this.registry[name];
        if (!r) return;
        r.panel.classList.remove('open');
        r.overlay.classList.remove('open');
    },
    toggle(name) {
        const r = this.registry[name];
        if (!r) return;
        if (r.panel.classList.contains('open')) this.close(name);
        else this.open(name);
    },
    isOpen(name) {
        const r = this.registry[name];
        return r ? r.panel.classList.contains('open') : false;
    },
    panelLink(name, label) {
        const escapedName = this.escHtml(name);
        return (
            '<a href="#" class="rui-panel-hub-link" onclick="event.preventDefault();event.stopPropagation();PanelHub.open(\'' +
            escapedName +
            '\')">' +
            this.escHtml(label) +
            '</a>'
        );
    },
    escHtml(s) {
        const d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    },
    relativeTime(dateStr) {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const now     = new Date();
            const diffMin = Math.floor((now - d) / MS_PER_MINUTE);
            const diffHr  = Math.floor((now - d) / MS_PER_HOUR);
            const diffDay = Math.floor((now - d) / MS_PER_DAY);
            if (diffMin < 1) return 'just now';
            if (diffMin < 60) return diffMin + ' minutes ago';
            if (diffHr < 24) return diffHr + ' hours ago';
            if (diffDay === 1) return 'yesterday';
            if (diffDay < 30) return diffDay + ' days ago';
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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

/* ── Vue component definition ───────────────────────────────────────────── */
const compDef = {
    name: 'ruiPanelHub',
    html: '/cdn/components/rui-panel-hub/template.html',
    css: '/cdn/components/rui-panel-hub/index.css',
    props: {
        label:       { type: Object,  default: null },
        buttons:     { type: Array,   required: true },
        flow:        { type: String,  default: '' },
        ariaLabel:   { type: String,  default: 'Panel hub toolbar' },
        urls:        { type: Object,  default: () => ({}) },
        targetBlank: { type: Boolean, default: false }
    },
    methods: {
        _resolveNav(panel) {
            const url = (this.urls || {})[panel];
            if (!url) return null;
            return { url };
        },
        _navigate(url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        },
        onSelect(panel) {
            const nav = this._resolveNav(panel);
            if (nav) {
                this._navigate(nav.url);
                return;
            }
            this.$el.dispatchEvent(new CustomEvent('panel-hub-select', {
                detail:  { panel },
                bubbles: true
            }));
        },
        onLabelClick() {
            if (this.label && this.label.panel) this.onSelect(this.label.panel);
        }
    }
};
registerGlobalComponent(compDef);
export default compDef;
