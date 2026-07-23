import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

/* ── Singleton state ──────────────────────────────────────────────────── */
let _app          = null;
let _scrollCtrl   = null;

const _cfg = {
    defaults: {
        threshold:    400,
        size:         42,
        bottomOffset: 28,
        rightOffset:  28,
        iconChar:     '\u2191',
        ariaLabel:    'Back to top',
        hostId:       'yry-back-top-host',
        zIndex:       100
    }
};

/* ── Lazily mount the Vue app ─────────────────────────────────────────── */
function _mountApp(templateHTML) {
    if (_app) return;
    if (!window.Vue) {
        throw new Error('Vue 3 not loaded, please include vue.global.prod.js first');
    }

    const d = _cfg.defaults;
    let host = document.getElementById(d.hostId);
    if (!host) {
        host = document.createElement('div');
        host.id = d.hostId;
        document.body.appendChild(host);
    }

    _app = window.Vue.createApp({
        template: templateHTML,
        data() {
            return {
                visible:   window.scrollY > (d.threshold || 400),
                icon:      d.iconChar || '\u2191',
                ariaLabel: d.ariaLabel || 'Back to top'
            };
        },
        methods: {
            scrollToTop() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        mounted() {
            const el = this.$el;
            const d = _cfg.defaults;
            el.style.setProperty('--yry-back-top-size',  (d.size || 42) + 'px');
            el.style.setProperty('--yry-back-top-right', (d.rightOffset || 28) + 'px');
            el.style.setProperty('--yry-back-top-bottom',(d.bottomOffset || 28) + 'px');
            el.style.setProperty('--yry-back-top-z',     d.zIndex || 100);

            const threshold = d.threshold || 400;
            _scrollCtrl = new AbortController();
            let ticking = false;
            const self = this;
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
            host._yryBackTopInstance = this;
        },
        beforeUnmount() {
            if (_scrollCtrl) {
                _scrollCtrl.abort();
                _scrollCtrl = null;
            }
            const hostId = _cfg.defaults.hostId;
            const h = document.getElementById(hostId);
            if (h) h._yryBackTopInstance = null;
            _app = null;
        }
    });

    _app.mount(host);
}

/* ── Register component via componentLoader (CSS only; template loaded manually) ── */
const compDef = {
    name: 'yryBackTop',
    css: '/cdn/components/common/navigation/YrYBackTop/index.css',
    html: '/cdn/components/common/navigation/YrYBackTop/template.html',
    mounted() {
        // Template will be loaded by componentLoader; trigger auto-mount after
        _mountApp(this.$options.template);
    }
};

registerGlobalComponent(compDef).then(function (component) {
    if (component && component.template) {
        _mountApp(component.template);
    }
});

export default compDef;
