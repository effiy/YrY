/**
 * app/lifecycle.js — Side-effects that run on mount / unmount.
 * ----------------------------------------------------------------------
 * Exposes window.RuiReportApp.{mounted, beforeUnmount}. Wires:
 *   - collapsible section h2 click/fold state
 *   - IntersectionObserver → activeSection
 *   - reading progress bar (rAF-throttled)
 *   - keyboard shortcuts (1..N / t / ?)
 */
(function () {
    'use strict';

    const RuiReportApp = window.RuiReportApp = window.RuiReportApp || {};

    RuiReportApp.mounted = function () {
        const COLLAPSE_KEY = 'yry-report-api-collapsed';
        function readCollapsed() {
            try { return JSON.parse(localStorage.getItem(COLLAPSE_KEY) || '{}') || {}; } catch (e) { return {}; }
        }
        function writeCollapsed(state) {
            try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(state)); } catch (e) {}
        }
        const collapsed = readCollapsed();
        try {
            const done = JSON.parse(localStorage.getItem('yry-report-api-remediation-done') || '{}');
            if (done && typeof done === 'object') this.remediationDone = done;
        } catch (e) {}
        document.querySelectorAll('section[id] > h2').forEach(function (h2) {
            const section = h2.parentElement;
            const id = section && section.id;
            if (!id) return;
            h2.setAttribute('role', 'button');
            h2.setAttribute('tabindex', '0');
            h2.setAttribute('aria-expanded', 'true');
            h2.setAttribute('aria-controls', id);
            if (collapsed[id]) {
                section.classList.add('collapsed');
                h2.setAttribute('aria-expanded', 'false');
            }
            const toggle = function () {
                const isCollapsed = section.classList.toggle('collapsed');
                h2.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
                const state = readCollapsed();
                if (isCollapsed) state[id] = true;
                else delete state[id];
                writeCollapsed(state);
            };
            h2.addEventListener('click', function (e) {
                if (e.target.closest('a, button')) return;
                e.preventDefault();
                toggle();
            });
            h2.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle();
                }
            });
        });

        const sections = document.querySelectorAll('section[id]');
        if (sections.length && typeof IntersectionObserver !== 'undefined') {
            this._observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) this.activeSection = e.target.id;
                }, this);
            }.bind(this), { rootMargin: '-20% 0px -70% 0px' });
            sections.forEach(function (s) { this._observer.observe(s); }, this);
        }

        if (sections.length && typeof IntersectionObserver !== 'undefined') {
            this._mountObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (!e.isIntersecting) return;
                    const id = e.target.id;
                    if (this.visibleSections && Object.prototype.hasOwnProperty.call(this.visibleSections, id) && !this.visibleSections[id]) {
                        this.visibleSections[id] = true;
                    }
                    this._mountObserver.unobserve(e.target);
                }, this);
            }.bind(this), { rootMargin: '200px 0px' });
            sections.forEach(function (s) { this._mountObserver.observe(s); }, this);
        }

        let ticking = false;
        this._onScroll = function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                const doc = document.documentElement;
                const max = (doc.scrollHeight - doc.clientHeight) || 1;
                this.readingProgress = Math.min(100, Math.max(0, (doc.scrollTop / max) * 100));
                ticking = false;
            }.bind(this));
        }.bind(this);
        window.addEventListener('scroll', this._onScroll, { passive: true });
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { this._onScroll(); }.bind(this));
        }.bind(this));

        this._onKey = function (e) {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const tag = (e.target && e.target.tagName) || '';
            if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
            if (e.key === '?') {
                const h = document.querySelector('.read-helper');
                if (h) h.open = !h.open;
                e.preventDefault();
                return;
            }
            if (e.key === 't') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                e.preventDefault();
                return;
            }
            const n = parseInt(e.key, 10);
            if (!isNaN(n) && n >= 1 && n <= this.sections.length) {
                const target = document.getElementById(this.sections[n - 1].id);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    e.preventDefault();
                }
            }
        }.bind(this);
        document.addEventListener('keydown', this._onKey);
    };

    RuiReportApp.beforeUnmount = function () {
        if (this._observer) { this._observer.disconnect(); this._observer = null; }
        if (this._mountObserver) { this._mountObserver.disconnect(); this._mountObserver = null; }
        if (this._onScroll) { window.removeEventListener('scroll', this._onScroll); this._onScroll = null; }
        if (this._onKey) { document.removeEventListener('keydown', this._onKey); this._onKey = null; }
    };
})();
