/**
 * rui-report-files — Vue 3 standalone app
 * ----------------------------------------------------------------------
 * Reads window.REPORT_CONFIG (static labels) + window.REPORT_DATA
 * (runtime analysis) and renders the 11-section report. All section
 * rendering is delegated to child components under components/.
 *
 * Page-level concerns: TOC, header, active section tracking,
 * export, component registration.
 *
 * Mount is deferred until window.__vueLoadPromise resolves, so the
 * CDN-loader in index.html can fall back to jsdelivr if unpkg is
 * blocked.
 */

/** Simple debounce — limits the rate at which a function fires. */
function debounce(fn, ms) {
    var timer = null;
    return function () {
        if (timer) clearTimeout(timer);
        var ctx = this, args = arguments;
        timer = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
}

const PAGE_REPORT_FILES_APP = {
    data: function () {
        return {
            CONFIG: window.REPORT_CONFIG || { labels: {}, options: {} },
            breadcrumb: [
                { label: 'Reports', href: '../../index.html' },
                { label: 'Files' }
            ],
            data: window.REPORT_DATA || {
                scope: '',
                score: 0,
                summary: {},
                alerts: [],
                treemap: [],
                types: [],
                histogram: [],
                largest: [],
                fanin: [],
                fanout: [],
                hotspots: [],
                orphans: [],
                depthStats: {},
                depthRanking: [],
                cycles: [],
                freshness: [],
                freshnessBuckets: [],
                freshnessStats: {},
                records: [],
                adjacency: {},
                selfImprovement: {},
            },
            activeSection: 'summary',
        };
    },

    computed: {
        optionsJson: function () {
            try {
                return JSON.stringify(this.CONFIG.options || {});
            } catch (e) {
                return '{}';
            }
        },

        sections: function () {
            const L = this.CONFIG.labels || {};
            return [
                { id: 'summary',    label: L.sectionSummary   || 'Summary' },
                { id: 'size',       label: L.sectionSize      || 'Size' },
                { id: 'largest',    label: L.sectionLargest   || 'Largest Files' },
                { id: 'coupling',   label: L.sectionCoupling  || 'Coupling' },
                { id: 'risk',       label: L.sectionRisk      || 'Risk Files' },
                { id: 'health',     label: L.sectionHealth    || 'Health' },
                { id: 'self-improvement', label: L.selfImprovementLabel || 'Self-Improvement Analysis' },
            ];
        },

        alertCounts: function () {
            const alerts = (this.data && this.data.alerts) || [];
            const counts = { p0: 0, p1: 0, p2: 0 };
            for (let i = 0; i < alerts.length; i++) {
                const sev = alerts[i].severity;
                if (sev === 'P0') counts.p0++;
                else if (sev === 'P1') counts.p1++;
                else if (sev === 'P2') counts.p2++;
            }
            return counts;
        },
    },

    methods: {
        exportJson: function () {
            const self = this;
            this.loadRecords().then(function () {
                const json = JSON.stringify(self.data, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                self.download(blob, 'rui-report-files.json');
            });
        },

        exportCsv: function () {
            const self = this;
            this.loadRecords().then(function () {
                const records = self.data.records || [];
                const header = 'path,bytes,lines,type,fanIn,fanOut,extDeps,maxDepth,lastModified,ageDays';
                const rows = records.map(function (r) {
                    const cells = [
                        r.path, r.bytes, r.lines, r.type,
                        r.fanIn != null ? r.fanIn : '',
                        r.fanOut != null ? r.fanOut : '',
                        r.extDeps != null ? r.extDeps : '',
                        r.maxDepth != null ? r.maxDepth : '',
                        r.lastModified != null ? r.lastModified : '',
                        r.ageDays != null ? r.ageDays : '',
                    ];
                    return cells.map(function (c) { return self.csvEscape(c); }).join(',');
                });
                const csv = header + '\n' + rows.join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                self.download(blob, 'rui-report-files.csv');
            });
        },

        // Lazy-load data-records.js (full records + adjacency) on first export
        // click. The sidecar mutates window.REPORT_DATA in place and sets
        // window.__ruiRecordsLoaded. Works from file:// — no fetch needed.
        loadRecords: function () {
            if (window.__ruiRecordsLoaded) {
                return Promise.resolve();
            }
            if (this._recordsPromise) {
                return this._recordsPromise;
            }
            this._recordsPromise = new Promise(function (resolve, reject) {
                const s = document.createElement('script');
                s.src = 'data-records.js';
                s.async = false;
                s.onload = function () { resolve(); };
                s.onerror = function () {
                    reject(new Error('Failed to load data-records.js'));
                };
                document.head.appendChild(s);
            });
            return this._recordsPromise;
        },

        csvEscape: function (v) {
            const s = String(v == null ? '' : v);
            if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
                return '"' + s.replace(/"/g, '""') + '"';
            }
            return s;
        },

        download: function (blob, filename) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        },
    },

    mounted: function () {
        const theme = (this.CONFIG && this.CONFIG.options && this.CONFIG.options.theme) || 'dark';
        if (theme && document.documentElement) {
            document.documentElement.setAttribute('data-rui-theme', theme);
        }
        const self = this;
        const sections = document.querySelectorAll('section[id]');
        if (sections.length && typeof IntersectionObserver !== 'undefined') {
            this._observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        self.activeSection = e.target.id;
                    }
                });
            }, { rootMargin: '-20% 0px -70% 0px' });
            sections.forEach(function (s) { self._observer.observe(s); });
        }
    },

    beforeUnmount: function () {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    },
};

/* Deferred mount — waits for the CDN loader in index.html to resolve. */
window.__vueLoadPromise = window.__vueLoadPromise || Promise.resolve();
window.__vueLoadPromise.then(function () {
    if (typeof Vue === 'undefined') {
        const missing = document.getElementById('app-vue-missing');
        if (missing) missing.style.display = 'block';
        return;
    }

    return Promise.resolve(window.__reportTemplatesReady).then(function () {

        // Wait for all rui components to be ready (template fetched + options
        // swapped in) before registering them on the app and mounting.
        // If a ready event never fires (e.g. CDN blocked), a 5s timeout lets the
        // page mount anyway — the component tags degrade to empty custom elements
        // and the rest of the report still renders.
        function _whenReady(globalName, readyEvent, errorEvent) {
            return new Promise(function (resolve) {
                if (window[globalName] && window[globalName].name === globalName) { resolve(); return; }
                let settled = false;
                function done() { if (settled) return; settled = true; resolve(); }
                document.addEventListener(readyEvent, done, { once: true });
                document.addEventListener(errorEvent, done, { once: true });
                setTimeout(done, 5000);
            });
        }

        Promise.all([
            _whenReady('ruiBreadcrumb', 'rui-breadcrumb-ready', 'rui-breadcrumb-error'),
            _whenReady('ruiScoreBar',   'rui-score-bar-ready',  'rui-score-bar-error'),
            _whenReady('ruiBadge',      'rui-badge-ready',      'rui-badge-error'),
            _whenReady('ruiTagChip',    'rui-tag-chip-ready',   'rui-tag-chip-error'),
            _whenReady('ruiBackTop',    'rui-back-top-ready',   'rui-back-top-error')
        ]).then(function () {
            const app = Vue.createApp(PAGE_REPORT_FILES_APP);

            // Shared components
            if (window.ruiBreadcrumb && window.ruiBreadcrumb.name === 'ruiBreadcrumb') {
                app.component('rui-breadcrumb', window.ruiBreadcrumb);
            }
            if (window.ruiScoreBar && window.ruiScoreBar.name === 'ruiScoreBar') {
                app.component('rui-score-bar', window.ruiScoreBar);
            }
            if (window.ruiBadge && window.ruiBadge.name === 'ruiBadge') {
                app.component('rui-badge', window.ruiBadge);
            }
            if (window.ruiTagChip && window.ruiTagChip.name === 'ruiTagChip') {
                app.component('rui-tag-chip', window.ruiTagChip);
            }
            if (window.ruiBackTop && window.ruiBackTop.name === 'ruiBackTop') {
                app.component('rui-back-top', window.ruiBackTop);
            }

            // Report section components
            if (window.ruiReportSummary && window.ruiReportSummary.name === 'ruiReportSummary') {
                app.component('rui-report-summary', window.ruiReportSummary);
            }
            if (window.ruiReportSize && window.ruiReportSize.name === 'ruiReportSize') {
                app.component('rui-report-size', window.ruiReportSize);
            }
            if (window.ruiReportLargest && window.ruiReportLargest.name === 'ruiReportLargest') {
                app.component('rui-report-largest', window.ruiReportLargest);
            }
            if (window.ruiReportCoupling && window.ruiReportCoupling.name === 'ruiReportCoupling') {
                app.component('rui-report-coupling', window.ruiReportCoupling);
            }
            if (window.ruiReportRisk && window.ruiReportRisk.name === 'ruiReportRisk') {
                app.component('rui-report-risk', window.ruiReportRisk);
            }
            if (window.ruiReportHealth && window.ruiReportHealth.name === 'ruiReportHealth') {
                app.component('rui-report-health', window.ruiReportHealth);
            }
            if (window.ruiReportSelfImprovement && window.ruiReportSelfImprovement.name === 'ruiReportSelfImprovement') {
                app.component('rui-report-self-improvement', window.ruiReportSelfImprovement);
            }

            app.mount('#page-app');
        });
    });
});
