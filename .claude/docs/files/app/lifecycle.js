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
        const reportMap = window.RUI_DOC_REPORTS || {pathRules: []};

        function normalizeReportPath(value) {
            return String(value || '')
                .trim()
                .replace(/^\.?\//, '')
                .replace(/^\.claude\//, '')
                .replace(/^skills\//, '');
        }

        function resolveReport(pathText) {
            const normalized = normalizeReportPath(pathText);
            if (!normalized) {
                return null;
            }
            const rules = Array.isArray(reportMap.pathRules) ? reportMap.pathRules : [];
            for (let i = 0; i < rules.length; i++) {
                const rule = rules[i];
                if (!rule || !rule.match || !rule.slug) {
                    continue;
                }
                if (rule.mode === 'exact' && normalized === rule.match) {
                    return rule;
                }
                if (rule.mode === 'prefix' && normalized.startsWith(rule.match)) {
                    return rule;
                }
            }
            return null;
        }

        function buildReportHref(rule) {
            return `../deps/${ rule.slug }/index.html`;
        }

        function buildJumpLink(rule, label, block) {
            const link = document.createElement('a');
            link.className = block ? 'report-jump report-jump-block' : 'report-jump';
            link.href = buildReportHref(rule);
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = label || 'Report ↗';
            link.title = `Open related report: ${ rule.title || rule.slug }`;
            return link;
        }

        function enhancePathCodes() {
            document.querySelectorAll('#page-app td code, #page-app .cycles-list code').forEach((codeEl) => {
                if (codeEl.dataset.reportEnhanced === 'true') {
                    return;
                }
                const rule = resolveReport(codeEl.textContent);
                codeEl.dataset.reportEnhanced = 'true';
                if (!rule) {
                    return;
                }
                const jump = buildJumpLink(rule, 'Report ↗', false);
                codeEl.insertAdjacentText('afterend', ' ');
                codeEl.insertAdjacentElement('afterend', jump);
            });
        }

        function enhanceRemediationLinks() {
            document.querySelectorAll('#page-app .remediation-cell').forEach((cell) => {
                if (cell.dataset.reportEnhanced === 'true') {
                    return;
                }
                const codeEl = cell.querySelector('.remediation-file code');
                const rule = resolveReport(codeEl && codeEl.textContent);
                cell.dataset.reportEnhanced = 'true';
                if (!rule) {
                    return;
                }
                const wrap = document.createElement('div');
                wrap.className = 'report-jump-row';
                wrap.appendChild(buildJumpLink(rule, 'Related report ↗', true));
                const detail = cell.querySelector('.remediation-detail');
                cell.insertBefore(wrap, detail || null);
            });
        }

        function decorateReportLinks() {
            enhancePathCodes();
            enhanceRemediationLinks();
        }

        // Collapsible sections — click h2 to toggle, state persisted per section id.
        const COLLAPSE_KEY = 'rui-report-collapsed';
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
            const done = JSON.parse(localStorage.getItem('rui-report-remediation-done') || '{}');
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

        // Keyboard navigation.
        this._onKey = (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) {
                return;
            }
            const tag = (e.target && e.target.tagName) || '';
            if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) {
                return;
            }
            if (e.key === '?') {
                const h = document.querySelector('.read-helper');
                if (h) {
                    h.open = !h.open;
                }
                e.preventDefault();
                return;
            }
            if (e.key === 't') {
                window.scrollTo({top: 0, behavior: 'smooth'});
                e.preventDefault();
                return;
            }
            const n = parseInt(e.key, 10);
            if (!isNaN(n) && n >= 1 && n <= this.sections.length) {
                const target = document.getElementById(this.sections[n - 1].id);
                if (target) {
                    target.scrollIntoView({behavior: 'smooth', block: 'start'});
                    e.preventDefault();
                }
            }
        };
        document.addEventListener('keydown', this._onKey);

        this._reportLinkObserver = new MutationObserver(() => {
            requestAnimationFrame(decorateReportLinks);
        });
        this._reportLinkObserver.observe(document.getElementById('page-app'), {
            childList: true,
            subtree: true
        });
        requestAnimationFrame(decorateReportLinks);
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
        if (this._onKey) {
            document.removeEventListener('keydown', this._onKey);
            this._onKey = null;
        }
        if (this._reportLinkObserver) {
            this._reportLinkObserver.disconnect();
            this._reportLinkObserver = null;
        }
    };
})();
