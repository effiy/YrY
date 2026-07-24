/**
 * app/lifecycle.js — Side-effects that run on mount / unmount.
 * ----------------------------------------------------------------------
 * Exposes window.RuiReportApp.{mounted, beforeUnmount}. Wires:
 *   - collapsible section h2 click/fold state
 *   - IntersectionObserver → activeSection
 *   - reading progress bar (rAF-throttled)
 *   - keyboard shortcuts (1..N / t / e / c / ?)
 */
(function () {
    'use strict';

    const RuiReportApp = window.RuiReportApp = window.RuiReportApp || {};

    RuiReportApp.mounted = function () {
        // Collapsible sections — click h2 to toggle, state persisted per section id.
        const COLLAPSE_KEY = 'yry-report-collapsed';
        function readCollapsed() {
            try {
                return JSON.parse(localStorage.getItem(COLLAPSE_KEY) || '{}') || {};
            } catch (e) {
                return {};
            }
        }

        function writeCollapsed(state) {
            try {
                localStorage.setItem(COLLAPSE_KEY, JSON.stringify(state));
            } catch (e) {}
        }
        const collapsed = readCollapsed();
        // Hydrate remediation-done state from localStorage.
        try {
            const done = JSON.parse(localStorage.getItem('yry-report-remediation-done') || '{}');
            if (done && typeof done === 'object') {
                this.remediationDone = done;
            }
        } catch (e) {}
        document.querySelectorAll('section[id] > h2').forEach((h2) => {
            const section = h2.parentElement;
            const id = section && section.id;
            if (!id) {
                return;
            }
            h2.setAttribute('role', 'button');
            h2.setAttribute('tabindex', '0');
            h2.setAttribute('aria-expanded', 'true');
            h2.setAttribute('aria-controls', id);
            if (collapsed[id]) {
                section.classList.add('collapsed');
                h2.setAttribute('aria-expanded', 'false');
            }
            const toggle = () => {
                const isCollapsed = section.classList.toggle('collapsed');
                h2.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
                const state = readCollapsed();
                if (isCollapsed) {
                    state[id] = true;
                } else {
                    delete state[id];
                }
                writeCollapsed(state);
            };
            h2.addEventListener('click', (e) => {
                if (e.target.closest('a, button')) {
                    return;
                }
                e.preventDefault();
                toggle();
            });
            h2.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle();
                }
            });
        });

        const sections = document.querySelectorAll('section[id]');
        if (sections.length && typeof IntersectionObserver !== 'undefined') {
            this._observer = new IntersectionObserver((entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        this.activeSection = e.target.id;
                    }
                });
            }, {rootMargin: '-20% 0px -70% 0px'});
            sections.forEach((s) => {
                this._observer.observe(s);
            });
        }

        // Lazy-mount observer: each below-the-fold section's template is
        // compiled + rendered on demand when it nears the viewport, instead
        // of all seven sections being instantiated in the initial mount.
        // The flag flip is cheap; the per-section compile happens in Vue's
        // next update tick, well after the rIC handler has returned.
        if (sections.length && typeof IntersectionObserver !== 'undefined') {
            this._mountObserver = new IntersectionObserver((entries) => {
                entries.forEach((e) => {
                    if (!e.isIntersecting) {
                        return;
                    }
                    const id = e.target.id;
                    if (this.visibleSections && Object.prototype.hasOwnProperty.call(this.visibleSections, id) && !this.visibleSections[id]) {
                        this.visibleSections[id] = true;
                    }
                    this._mountObserver.unobserve(e.target);
                });
            }, {rootMargin: '200px 0px'});
            sections.forEach((s) => {
                this._mountObserver.observe(s);
            });
        }

        // Reading progress bar — throttle with rAF for smoothness.
        let ticking = false;
        this._onScroll = () => {
            if (ticking) {
                return;
            }
            ticking = true;
            requestAnimationFrame(() => {
                const doc = document.documentElement;
                const max = (doc.scrollHeight - doc.clientHeight) || 1;
                this.readingProgress = Math.min(100, Math.max(0, (doc.scrollTop / max) * 100));
                ticking = false;
            });
        };
        window.addEventListener('scroll', this._onScroll, {passive: true});
        // Defer the initial reading-progress read until after the first
        // paint, so the scrollHeight / clientHeight lookups hit a stable
        // layout instead of forcing a synchronous reflow against the DOM
        // that Vue just mounted.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this._onScroll();
            });
        });

        // Keyboard shortcuts (via shared yryKbd module).
        const sectionIds = (this.sections || []).map(function (s) { return s.id; });
        const sectionKeys = sectionIds.map(function (_, i) { return String(i + 1); });
        yryKbd.register(this, [
            { keys: sectionKeys, handler: function (key) { const el = sectionIds[+key - 1] ? document.getElementById(sectionIds[+key - 1]) : null; if (el) el.scrollIntoView({behavior:'smooth',block:'start'}); }, desc: 'Jump to section 1–' + sectionIds.length },
            { key: 't', handler: function () { window.scrollTo({top:0,behavior:'smooth'}); }, desc: 'Scroll to top' },
            { key: '?', handler: function () { const h = document.querySelector('.read-helper'); if (h) h.open = !h.open; }, desc: 'Show/hide reading help' },
        ]);
    };

    RuiReportApp.beforeUnmount = function () {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
        if (this._mountObserver) {
            this._mountObserver.disconnect();
            this._mountObserver = null;
        }
        if (this._onScroll) {
            window.removeEventListener('scroll', this._onScroll);
            this._onScroll = null;
        }
        if (typeof yryKbd !== 'undefined') {
            yryKbd.unregister(this);
        }
    };
})();
