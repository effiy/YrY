/**
 * app/state.js — Page-level state and derived data for yry-report-apis.
 * ----------------------------------------------------------------------
 * Exposes window.RuiReportApp.{data, computed}.
 * Pulls window.REPORT_CONFIG (static labels) and window.REPORT_DATA
 * (runtime analysis) and produces the derived state used by the page
 * chrome (TOC, banners, key findings, remediation queue, etc.).
 */
(function () {
    'use strict';

    const EMPTY_DATA = {
        scope: '',
        score: 0,
        summary: {},
        alerts: [],
        endpoints: [],
        methods: [],
        patterns: [],
        security: {},
        health: {},
        records: [],
    };

    const RuiReportApp = window.RuiReportApp = window.RuiReportApp || {};

    RuiReportApp.data = function () {
        return {
            CONFIG: window.REPORT_CONFIG || { labels: {}, options: {} },
            breadcrumb: [
                { label: 'Reports', href: '../../index.html' },
                { label: 'APIs' },
            ],
            data: window.REPORT_DATA || Object.assign({}, EMPTY_DATA),
            activeSection: 'summary',
            readingProgress: 0,
            remediationDone: {},
            copiedKey: null,
            visibleSections: {
                summary: true,
                endpoints: true,
                semantics: false,
                patterns: false,
                security: false,
                health: false,
            },
        };
    };

    RuiReportApp.computed = {
        optionsJson: function () {
            try { return JSON.stringify(this.CONFIG.options || {}); } catch (e) { return '{}'; }
        },

        sections: function () {
            const L = this.CONFIG.labels || {};
            return [
                { id: 'summary',     label: L.sectionSummary || 'Summary' },
                { id: 'endpoints',   label: L.sectionEndpoints || 'Endpoints' },
                { id: 'semantics',   label: L.sectionSemantics || 'HTTP Semantics' },
                { id: 'patterns',    label: L.sectionPatterns || 'Patterns' },
                { id: 'security',    label: L.sectionSecurity || 'Security' },
                { id: 'health',      label: L.sectionHealth || 'Health & Contracts' },
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

        generatedAt: function () {
            const opts = this.CONFIG && this.CONFIG.options;
            const ts = opts && (opts.generatedAt || opts.timestamp);
            if (!ts) {
                const d = new Date();
                return d.toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
            }
            try {
                const d = new Date(ts);
                return isNaN(d.getTime()) ? String(ts) : d.toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
            } catch (e) { return String(ts); }
        },

        riskBanner: function () {
            const c = this.alertCounts;
            const score = this.data && this.data.score;
            const total = c.p0 + c.p1 + c.p2;
            const summary = this.data && this.data.summary || {};

            if (c.p0 > 0) {
                const topP0 = ((this.data && this.data.alerts) || []).filter(function (a) { return a.severity === 'P0'; }).slice(0, 3);
                const topList = topP0.length
                    ? '<ul>' + topP0.map(function (a) {
                        const msg = String(a.message || '').replace(/</g, '&lt;');
                        return '<li><code>' + msg + '</code></li>';
                    }).join('') + '</ul>'
                    : '';
                return {
                    level: 'p0',
                    icon: '!',
                    title: c.p0 + ' critical API alert' + (c.p0 > 1 ? 's' : '') + ' — action required',
                    body: '<strong>P0-level API risk detected — resolve before merge/release.</strong> ' +
                        total + ' alert(s) total (P0: ' + c.p0 + ' · P1: ' + c.p1 + ' · P2: ' + c.p2 + ').' +
                        (topList ? ' Top issues: ' + topList : ''),
                    actions: [
                        { href: '#health', label: 'View health details →' },
                    ],
                };
            }
            if (c.p1 > 0) {
                return {
                    level: 'p1',
                    icon: '\u25b2',
                    title: c.p1 + ' warning' + (c.p1 > 1 ? 's' : '') + ' — review recommended',
                    body: c.p1 + ' P1 warning(s) detected. Review within this iteration to prevent systemic accumulation.',
                    actions: [{ href: '#health', label: 'View health details →' }],
                };
            }
            if (total === 0 && score != null) {
                return {
                    level: 'ok',
                    icon: '\u2713',
                    title: 'No active API alerts — health score ' + score + '/100',
                    body: 'No API alerts triggered this scan. Still recommended to review the Security / Health sections.',
                    actions: [],
                };
            }
            return null;
        },

        scoreClass: function () {
            const s = this.data && this.data.score;
            if (s == null) return '';
            if (s < 40) return 'critical';
            if (s < 70) return 'warn';
            return 'ok';
        },

        sectionFlags: function () {
            const flags = {};
            const c = this.alertCounts;
            if (c.p0 > 0) flags.health = 'critical';
            else if (c.p1 > 0) flags.health = 'warn';
            const sec = this.data && this.data.security || {};
            if (sec.authCoverage != null && sec.authCoverage < 0.5) flags.security = 'critical';
            else if (sec.authCoverage != null && sec.authCoverage < 0.8) flags.security = 'warn';
            const patterns = (this.data && this.data.patterns) || [];
            const lowScore = patterns.filter(function (p) { return p.restScore < 30; }).length;
            if (lowScore > 2) flags.patterns = 'critical';
            else if (lowScore > 0) flags.patterns = 'warn';
            const sem = this.data && this.data.semantics || {};
            if (sem.score != null && sem.score < 40) flags.semantics = 'critical';
            else if (sem.score != null && sem.score < 70) flags.semantics = 'warn';
            return flags;
        },

        dataAgeDays: function () {
            const opts = this.CONFIG && this.CONFIG.options;
            const ts = opts && (opts.generatedAt || opts.timestamp);
            if (!ts) return 0;
            const d = new Date(ts);
            if (isNaN(d.getTime())) return 0;
            return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
        },

        isStale: function () { return this.dataAgeDays > 7; },

        distPct: function () {
            const c = this.alertCounts;
            const total = c.p0 + c.p1 + c.p2 || 1;
            return { p0: (c.p0 / total) * 100, p1: (c.p1 / total) * 100, p2: (c.p2 / total) * 100 };
        },

        keyFindings: function () {
            const d = this.data || {};
            const findings = [];
            const c = this.alertCounts;
            if (c.p0 > 0) {
                findings.push({
                    tone: 'critical', icon: '!',
                    label: 'P0 critical alerts', value: c.p0,
                    href: '#health', hint: 'Resolve before merge',
                });
            }
            const s = d.summary || {};
            if (s.totalRequests) {
                findings.push({
                    tone: 'info', icon: '\u25a0',
                    label: 'Total requests', value: s.totalRequests,
                    sub: s.totalHandlers + ' handlers',
                    href: '#endpoints',
                });
            }
            if (s.authCoverage != null) {
                findings.push({
                    tone: s.authCoverage < 0.5 ? 'critical' : s.authCoverage < 0.8 ? 'warn' : 'ok',
                    icon: '\u26bf',
                    label: 'Auth coverage', value: Math.round(s.authCoverage * 100) + '%',
                    href: '#security', hint: s.authCoverage < 0.8 ? 'Below target' : 'Healthy',
                });
            }
            if (s.errorHandlingCoverage != null) {
                findings.push({
                    tone: s.errorHandlingCoverage < 0.5 ? 'critical' : s.errorHandlingCoverage < 0.7 ? 'warn' : 'ok',
                    icon: '\u26a0',
                    label: 'Error handling', value: Math.round(s.errorHandlingCoverage * 100) + '%',
                    href: '#health', hint: 'Try/catch coverage',
                });
            }
            const methods = d.methods || [];
            if (methods.length) {
                const topMethod = methods[0];
                findings.push({
                    tone: 'info', icon: '\u2191',
                    label: 'Top HTTP method', value: topMethod.method,
                    sub: topMethod.count + ' endpoints (' + Math.round(topMethod.pct) + '%)',
                    href: '#semantics',
                });
            }
            const patterns = d.patterns || [];
            const lowREST = patterns.filter(function (p) { return p.restScore < 30; }).length;
            if (lowREST > 0) {
                findings.push({
                    tone: lowREST > 2 ? 'critical' : 'warn',
                    icon: '\u26d4',
                    label: 'Non-RESTful patterns', value: lowREST,
                    href: '#patterns', hint: 'Review and refactor',
                });
            }
            if (s.deprecatedCount) {
                findings.push({
                    tone: 'warn',
                    icon: '\u23f3',
                    label: 'Deprecated endpoints', value: s.deprecatedCount,
                    href: '#patterns', hint: 'Schedule removal',
                });
            }
            return findings;
        },

        remediationQueue: function () {
            const alerts = (this.data && this.data.alerts) || [];
            const order = { P0: 0, P1: 1, P2: 2 };
            const queue = alerts.slice().sort(function (a, b) {
                const sa = order[a.severity] != null ? order[a.severity] : 9;
                const sb = order[b.severity] != null ? order[b.severity] : 9;
                if (sa !== sb) return sa - sb;
                return String(a.file || '').localeCompare(String(b.file || ''));
            });
            const sectionForCategory = {
                security: '#security',
                validation: '#security',
                semantics: '#semantics',
                error_handling: '#health',
                deprecation: '#patterns',
                pattern: '#patterns',
                complexity: '#health',
                versioning: '#patterns',
                contracts: '#health',
                pagination: '#health',
            };
            return queue.map(function (a) {
                return {
                    severity: a.severity,
                    marker: a.marker || '',
                    category: a.category || '',
                    file: a.file || '',
                    line: a.line,
                    message: a.message || '',
                    metric: a.metric || '',
                    impact: a.impact || '',
                    risk: a.risk || '',
                    blastRadius: a.blastRadius || '',
                    effort: a.effort || '',
                    estimatedHours: typeof a.estimatedHours === 'number' ? a.estimatedHours : null,
                    scoreUplift: typeof a.scoreUplift === 'number' ? a.scoreUplift : null,
                    recommendations: Array.isArray(a.recommendations) ? a.recommendations : [],
                    acceptance: Array.isArray(a.acceptance) ? a.acceptance : [],
                    firstStep: a.firstStep || '',
                    tooling: Array.isArray(a.tooling) ? a.tooling : [],
                    preventiveControls: Array.isArray(a.preventiveControls) ? a.preventiveControls : [],
                    rollbackPlan: a.rollbackPlan || '',
                    href: sectionForCategory[(a.category || '').toLowerCase()] || '#health',
                };
            });
        },

        remediationGrouped: function () {
            const self = this;
            const groups = { P0: [], P1: [], P2: [] };
            this.remediationQueue.forEach(function (item, i) {
                if (!groups[item.severity]) return;
                const key = item.severity + ':' + i;
                groups[item.severity].push(Object.assign({}, item, {
                    _key: key,
                    _done: Boolean(self.remediationDone[key]),
                }));
            });
            return groups;
        },

        remediationDoneCount: function () {
            const map = this.remediationDone || {};
            let n = 0;
            for (const k in map) { if (map[k]) n++; }
            return n;
        },
    };
})();
