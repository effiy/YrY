/**
 * app/state.js — Page-level state and derived data.
 * ----------------------------------------------------------------------
 * Exposes window.RuiReportApp.{data, computed} for the report app.
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
    };

    const RuiReportApp = window.RuiReportApp = window.RuiReportApp || {};

    RuiReportApp.data = function () {
        return {
            CONFIG: window.REPORT_CONFIG || {labels: {}, options: {}},
            breadcrumb: [
                {label: 'Reports', href: '../../index.html'},
                {label: 'Files'},
            ],
            data: window.REPORT_DATA || Object.assign({}, EMPTY_DATA),
            activeSection: 'summary',
            readingProgress: 0,
            remediationDone: {},
            // Lazy-mount flags — only above-the-fold sections render in the
            // initial mount; the rest flip to true via IntersectionObserver
            // in lifecycle.js as they approach the viewport. This keeps the
            // initial rIC handler under the 50ms long-task threshold.
            visibleSections: {
                summary: true,
                size: true,
                largest: false,
                coupling: false,
                risk: false,
                health: false,
                'self-improvement': false,
            },
        };
    };

    RuiReportApp.computed = {
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
                {id: 'summary', label: L.sectionSummary || 'Summary'},
                {id: 'size', label: L.sectionSize || 'Size'},
                {id: 'largest', label: L.sectionLargest || 'Largest Files'},
                {id: 'coupling', label: L.sectionCoupling || 'Coupling'},
                {id: 'risk', label: L.sectionRisk || 'Risk Files'},
                {id: 'health', label: L.sectionHealth || 'Health'},
                {id: 'self-improvement', label: L.selfImprovementLabel || 'Self-Improvement Analysis'},
            ];
        },

        alertCounts: function () {
            const alerts = (this.data && this.data.alerts) || [];
            const counts = {p0: 0, p1: 0, p2: 0};
            for (let i = 0; i < alerts.length; i++) {
                const sev = alerts[i].severity;
                if (sev === 'P0') {
                    counts.p0++;
                } else if (sev === 'P1') {
                    counts.p1++;
                } else if (sev === 'P2') {
                    counts.p2++;
                }
            }
            return counts;
        },

        generatedAt: function () {
            const opts = this.CONFIG && this.CONFIG.options;
            const ts = opts && (opts.generatedAt || opts.timestamp);
            if (!ts) {
                const d = new Date();
                return `${d.toISOString().slice(0, 19).replace('T', ' ') } UTC`;
            }
            try {
                const d = new Date(ts);
                return isNaN(d.getTime())
                    ? String(ts)
                    : `${d.toISOString().slice(0, 19).replace('T', ' ') } UTC`;
            } catch (e) {
                return String(ts);
            }
        },

        riskBanner: function () {
            const c = this.alertCounts;
            const score = this.data && this.data.score;
            const total = c.p0 + c.p1 + c.p2;
            const hottest = ((this.data && this.data.hotspots) || []).slice(0, 3);
            const hotspotList = hottest.length
                ? `<ul>${ hottest.map(function (h) {
                    const path = String(h.path || h.file || '').replace(/</g, '&lt;');
                    const reason = String(h.reason || h.flag || '').replace(/</g, '&lt;');
                    return `<li><code>${ path }</code> — ${ reason }</li>`;
                }).join('') }</ul>`
                : '';

            if (c.p0 > 0) {
                return {
                    level: 'p0',
                    icon: '!',
                    title: `${c.p0 } critical risk alert${ c.p0 > 1 ? 's' : '' } — action required before merge`,
                    body: `<strong>P0-level risk detected — resolve before merge/release.</strong> ${
                        total } alert(s) total (P0: ${ c.p0 } · P1: ${ c.p1 } · P2: ${ c.p2 }).${
                        hotspotList ? ` Top hotspots: ${ hotspotList}` : ''}`,
                    actions: [
                        {href: '#risk', label: 'View risk details →'},
                        {href: '#self-improvement', label: 'Improvement roadmap →'},
                    ],
                };
            }
            if (c.p1 > 0) {
                return {
                    level: 'p1',
                    icon: '▲',
                    title: `${c.p1 } warning${ c.p1 > 1 ? 's' : '' } — review recommended`,
                    body: `${c.p1 } P1 warning(s) detected. Review within this iteration to prevent systemic accumulation.${
                        hotspotList ? ` Top hotspots: ${ hotspotList}` : ''}`,
                    actions: [
                        {href: '#risk', label: 'View risk details →'},
                    ],
                };
            }
            if (total === 0 && score != null) {
                return {
                    level: 'ok',
                    icon: '✓',
                    title: `No active risk alerts — health score ${ score }/100`,
                    body: 'No risk alerts triggered this scan. Still recommended to review the Coupling / Health sections for potential architecture drift.',
                    actions: [],
                };
            }
            return null;
        },

        scoreClass: function () {
            const s = this.data && this.data.score;
            if (s == null) {
                return '';
            }
            if (s < 40) {
                return 'critical';
            }
            if (s < 70) {
                return 'warn';
            }
            return 'ok';
        },

        sectionFlags: function () {
            const flags = {};
            const c = this.alertCounts;
            if (c.p0 > 0) {
                flags.risk = 'critical';
            } else if (c.p1 > 0) {
                flags.risk = 'warn';
            }
            const cycles = ((this.data && this.data.cycles) || []).length;
            if (cycles > 3) {
                flags.health = 'critical';
            } else if (cycles > 0) {
                flags.health = 'warn';
            }
            const orphans = ((this.data && this.data.orphans) || []).length;
            if (orphans > 5 && !flags.risk) {
                flags.risk = 'warn';
            }
            const sd = (this.data && this.data.selfImprovement && this.data.selfImprovement.severityDonut) || {};
            if (sd.p0 > 0) {
                flags['self-improvement'] = 'critical';
            } else if (sd.p1 > 0) {
                flags['self-improvement'] = 'warn';
            }
            const largest = (this.data && this.data.largest) || [];
            if (largest.length && largest[0].bytes > 500000) {
                flags.size = 'warn';
            }
            return flags;
        },

        dataAgeDays: function () {
            const opts = this.CONFIG && this.CONFIG.options;
            const ts = opts && (opts.generatedAt || opts.timestamp);
            if (!ts) {
                return 0;
            }
            const d = new Date(ts);
            if (isNaN(d.getTime())) {
                return 0;
            }
            return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
        },

        isStale: function () {
            return this.dataAgeDays > 7;
        },

        distPct: function () {
            const c = this.alertCounts;
            const total = c.p0 + c.p1 + c.p2 || 1;
            return {
                p0: (c.p0 / total) * 100,
                p1: (c.p1 / total) * 100,
                p2: (c.p2 / total) * 100,
            };
        },

        keyFindings: function () {
            const d = this.data || {};
            const findings = [];
            const c = this.alertCounts;
            if (c.p0 > 0) {
                findings.push({
                    tone: 'critical', icon: '!',
                    label: 'P0 critical alerts', value: c.p0,
                    href: '#risk', hint: 'Resolve before merge',
                });
            }
            const largest = (d.largest || [])[0];
            if (largest && largest.path) {
                findings.push({
                    tone: largest.bytes >= 1048576 ? 'critical' : largest.bytes >= 524288 ? 'warn' : 'info',
                    icon: '▣',
                    label: 'Largest file',
                    value: (largest.bytesHuman || ''),
                    sub: String(largest.path).split('/').pop(),
                    href: '#largest', hint: 'Split candidate',
                });
            }
            const fanin = (d.fanin || [])[0];
            if (fanin && fanin.path) {
                findings.push({
                    tone: (fanin.fanIn || 0) >= 20 ? 'critical' : (fanin.fanIn || 0) >= 10 ? 'warn' : 'info',
                    icon: '⇄',
                    label: 'Highest fan-in',
                    value: fanin.fanIn || 0,
                    sub: String(fanin.path).split('/').pop(),
                    href: '#coupling', hint: 'Hub file — change ripples widely',
                });
            }
            const cycles = (d.cycles || []).length;
            if (cycles > 0) {
                findings.push({
                    tone: cycles > 3 ? 'critical' : 'warn',
                    icon: '⟳',
                    label: 'Circular dependencies',
                    value: cycles,
                    href: '#health', hint: 'Break before next release',
                });
            }
            const freshStats = d.freshnessStats || {};
            if (freshStats.staleCount > 0) {
                findings.push({
                    tone: freshStats.staleCount > 5 ? 'critical' : 'warn',
                    icon: '⏰',
                    label: 'Stale files (≥180d)',
                    value: freshStats.staleCount,
                    href: '#health', hint: 'Refresh or remove',
                });
            }
            const orphans = (d.orphans || []).length;
            if (orphans > 0) {
                findings.push({
                    tone: orphans > 5 ? 'warn' : 'info',
                    icon: '◯',
                    label: 'Orphan files',
                    value: orphans,
                    href: '#risk', hint: 'No inbound references',
                });
            }
            const s = d.summary || {};
            if (s.totalFiles && s.totalBytes) {
                const avg = s.totalBytes / s.totalFiles;
                findings.push({
                    tone: 'info',
                    icon: 'μ',
                    label: 'Avg file size',
                    value: window.RuiBytes.humanBytes(avg),
                    sub: `${s.totalFiles } files`,
                    href: '#size',
                });
            }
            return findings;
        },

        remediationQueue: function () {
            const alerts = (this.data && this.data.alerts) || [];
            const order = {P0: 0, P1: 1, P2: 2};
            const queue = alerts.slice().sort(function (a, b) {
                const sa = order[a.severity] != null ? order[a.severity] : 9;
                const sb = order[b.severity] != null ? order[b.severity] : 9;
                if (sa !== sb) {
                    return sa - sb;
                }
                return String(a.file || '').localeCompare(String(b.file || ''));
            });
            const sectionForCategory = {
                bloat: '#largest',
                coupling: '#coupling',
                depth: '#risk',
                hotspot: '#risk',
                orphan: '#risk',
                cycle: '#health',
                freshness: '#health',
                size: '#size',
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
                    cyclePath: a.cyclePath || '',
                    href: sectionForCategory[(a.category || '').toLowerCase()] || '#risk',
                };
            });
        },

        remediationGrouped: function () {
            const self = this;
            const groups = {P0: [], P1: [], P2: []};
            this.remediationQueue.forEach(function (item, i) {
                if (!groups[item.severity]) {
                    return;
                }
                const key = `${item.severity }:${ i}`;
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
            for (const k in map) {
                if (map[k]) {
                    n++;
                }
            }
            return n;
        },
    };
})();
