/**
 * rui-report-files — Vue 3 standalone app
 * ----------------------------------------------------------------------
 * Reads window.REPORT_CONFIG (static labels) + window.REPORT_DATA
 * (runtime analysis) and renders the 11-section report. No HTML
 * string concatenation — all dynamic content goes through Vue's
 * {{ }} text interpolation or v-for :key. User-controlled strings
 * (file paths) are emitted via {{ }}, which Vue escapes as text.
 *
 * Mount is deferred until window.__vueLoadPromise resolves, so the
 * CDN-loader in index.html can fall back to jsdelivr if unpkg is
 * blocked.
 */

const SEVERITY_WEIGHTS = { P0: 3, P1: 1, P2: 0.3 };

function calcSeverity(r) {
    return (r.p0 || 0) * SEVERITY_WEIGHTS.P0
         + (r.p1 || 0) * SEVERITY_WEIGHTS.P1
         + (r.p2 || 0) * SEVERITY_WEIGHTS.P2;
}

/** Simple debounce — limits the rate at which a function fires. */
function debounce(fn, ms) {
    var timer = null;
    return function () {
        if (timer) clearTimeout(timer);
        var ctx = this, args = arguments;
        timer = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
}

/** Safe wrapper: returns a value (or fallback) when accessing deep paths. */
function safeGet(obj, path, fallback) {
    try {
        var keys = path.split('.');
        var cur = obj;
        for (var i = 0; i < keys.length; i++) {
            if (cur == null) return fallback;
            cur = cur[keys[i]];
        }
        return cur != null ? cur : fallback;
    } catch (_) { return fallback; }
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
                summary: {},
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
            },
            activeSection: 'summary',
            couplingTab: 'fanin',
            riskTab: 'hotspots',
            sizeTab: 'treemap',
            healthTab: 'cycles',
            sortState: {
                largest:   { key: 'bytes',   dir: -1 },
                coupling:  { key: 'fanIn',   dir: -1 },
                risk:      { key: 'score',   dir: -1 },
                freshness: { key: 'ageDays', dir: -1 },
            },
            filterText: '',
            filterTextDebounced: '',
            expandedTiles: {},
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
                { id: 'summary',   label: L.sectionSummary   || 'Summary' },
                { id: 'size',      label: L.sectionSize      || 'Size' },
                { id: 'largest',   label: L.sectionLargest   || 'Largest Files' },
                { id: 'coupling',  label: L.sectionCoupling  || 'Coupling' },
                { id: 'risk',      label: L.sectionRisk      || 'Risk Files' },
                { id: 'health',    label: L.sectionHealth    || 'Health' },
                { id: 'self-improvement', label: L.selfImprovementLabel || 'Self-Improvement Analysis' },
            ];
        },

        summaryCards: function () {
            const s = this.data.summary || {};
            return [
                { label: this.CONFIG.labels.summaryTotalFiles,    value: s.totalFiles ?? 0 },
                { label: this.CONFIG.labels.summaryTotalSize,     value: s.totalBytesHuman ?? '0 B' },
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

        sortedLargest: function () {
            return this.applySort(this.data.largest, 'largest');
        },

        largestFiltered: function () {
            if (!this.filterTextDebounced) return this.sortedLargest;
            const t = this.filterTextDebounced.toLowerCase();
            return this.sortedLargest.filter(function (r) {
                return (r.path || '').toLowerCase().indexOf(t) !== -1;
            });
        },

        sortedCoupling: function () {
            const rows = this.couplingTab === 'fanout'
                ? (this.data.fanout || [])
                : (this.data.fanin || []);
            return this.applySort(rows, 'coupling');
        },

        sortedRisk: function () {
            let rows;
            if (this.riskTab === 'orphans') {
                rows = this.data.orphans || [];
            } else if (this.riskTab === 'depth') {
                rows = this.data.depthRanking || [];
            } else {
                rows = this.data.hotspots || [];
            }
            return this.applySort(rows, 'risk');
        },

        sortedFreshness: function () {
            return this.applySort(this.data.freshness, 'freshness');
        },

        topP0: function () {
            const si = (this.data && this.data.selfImprovement) || {};
            return (si.topP0 || []).slice(0, 5);
        },

        focusArea: function () {
            const si = (this.data && this.data.selfImprovement) || {};
            return si.focusArea || null;
        },

        trendInsight: function () {
            const si = (this.data && this.data.selfImprovement) || {};
            return si.trendInsight || '';
        },

        weightsHint: function () {
            const si = (this.data && this.data.selfImprovement) || {};
            return si.weightsHint || '';
        },

        // ── v2 chart-first Self-Improvement computed ──
        siSeverityDonut: function () {
            const si = safeGet(this, 'data.selfImprovement', {});
            const d = si.severityDonut || { p0: 0, p1: 0, p2: 0, total: 0 };
            const p0 = d.p0 || 0, p1 = d.p1 || 0, p2 = d.p2 || 0;
            const total = p0 + p1 + p2;
            const DONUT_C = 2 * Math.PI * 40;
            let acc = 0;
            const segs = [
                { sev: 'P0', count: p0, color: 'var(--rui-critical, #ef4444)' },
                { sev: 'P1', count: p1, color: 'var(--rui-warn, #f59e0b)' },
                { sev: 'P2', count: p2, color: 'var(--rui-ok, #22c55e)' }
            ].map(function (s) {
                const frac = total === 0 ? 0 : s.count / total;
                const seg = {
                    sev: s.sev, count: s.count, frac: frac,
                    dasharray: DONUT_C,
                    dashoffset: DONUT_C * (1 - frac),
                    rotate: -90 + (acc / (total || 1)) * 360,
                    color: s.color
                };
                acc += s.count;
                return seg;
            });
            return { segments: segs, total: total, circumference: DONUT_C, empty: total === 0 };
        },

        siRiskVectors: function () {
            const si = (this.data && this.data.selfImprovement) || {};
            return (si.riskVectors || []).map(function (r) {
                const score = r.score || 0;
                return {
                    dimension: r.dimension,
                    score: score,
                    weightPct: Math.round((r.weight || 0) * 100),
                    p0: r.p0 || 0, p1: r.p1 || 0, p2: r.p2 || 0,
                    sevScore: calcSeverity(r),
                    scoreCls: score >= 90 ? 'grade-ok' : score >= 75 ? 'grade-warn' : 'grade-critical',
                    scoreWidth: Math.max(2, Math.min(100, score))
                };
            });
        },
        siHeatmap: function () {
            const rows = (this.siRiskVectors || []).slice().sort(function (a, b) {
                return (b.sevScore || 0) - (a.sevScore || 0);
            }).slice(0, 6);
            let maxCount = 1;
            rows.forEach(function (r) {
                ['p0', 'p1', 'p2'].forEach(function (k) { if (r[k] > maxCount) maxCount = r[k]; });
            });
            return {
                rows: rows.map(function (r) {
                    return {
                        dimName: r.dimension,
                        cells: [
                            { k: 'p0', count: r.p0, intensity: Math.max(0.08, r.p0 / maxCount), cls: 'heat-p0' },
                            { k: 'p1', count: r.p1, intensity: Math.max(0.08, r.p1 / maxCount), cls: 'heat-p1' },
                            { k: 'p2', count: r.p2, intensity: Math.max(0.08, r.p2 / maxCount), cls: 'heat-p2' }
                        ]
                    };
                }),
                maxCount: maxCount
            };
        },

        siPareto: function () {
            const vectors = (this.siRiskVectors || []).slice().sort(function (a, b) {
                return (b.sevScore || 0) - (a.sevScore || 0);
            });
            const n = vectors.length;
            if (n < 2) return { bars: [], line: '', marks: [], pct80y: 0 };
            const total = vectors.reduce(function (s, v) { return s + (v.sevScore || 0); }, 0) || 1;
            const max = vectors.reduce(function (m, v) { return Math.max(m, v.sevScore || 0); }, 0) || 1;
            const BAR_TOP = 5, BAR_H = 35, BASELINE = BAR_TOP + BAR_H;
            const barW = 100 / n; let running = 0;
            const bars = [], marks = [], linePts = [];
            for (let i = 0; i < n; i++) {
                const v = vectors[i];
                const score = v.sevScore || 0;
                running += score;
                const h = (score / max) * BAR_H;
                bars.push({ label: v.dimension, score: v.score, x: i * barW, width: barW * 0.82, y: BASELINE - h, height: h, scoreCls: v.scoreCls });
                const cx = i * barW + barW / 2;
                const cumPct = (running / total) * 100;
                const ly = BASELINE - (cumPct / 100) * BAR_H;
                marks.push({ x: cx, y: ly, pct: Math.round(cumPct) });
                linePts.push(cx + ',' + ly);
            }
            return { bars: bars, line: linePts.join(' '), marks: marks, pct80y: BASELINE - 0.8 * BAR_H };
        },

        siRadar: function () {
            const vectors = this.siRiskVectors || [];
            const n = vectors.length;
            if (n < 3) return { axes: [], polygon: '', rings: [], points: [] };
            const cx = 50, cy = 50, r = 38, labelR = 47;
            const angles = [];
            for (let i = 0; i < n; i++) { angles.push(-Math.PI / 2 + (2 * Math.PI * i / n)); }
            function pt(rr, i) {
                return {
                    x: Math.round((cx + rr * Math.cos(angles[i])) * 100) / 100,
                    y: Math.round((cy + rr * Math.sin(angles[i])) * 100) / 100
                };
            }
            const axes = vectors.map(function (v, i) {
                const a = pt(labelR, i);
                return { label: v.dimension, score: v.score, x: a.x, y: a.y, scoreCls: v.scoreCls };
            });
            const points = vectors.map(function (v, i) {
                const p = pt(r * (Math.max(0, Math.min(100, v.score)) / 100), i);
                return { label: v.dimension, score: v.score, x: p.x, y: p.y, scoreCls: v.scoreCls };
            });
            const polygon = points.map(function (p) { return p.x + ',' + p.y; }).join(' ');
            const rings = [25, 50, 75, 100].map(function (pct) {
                return vectors.map(function (v, i) {
                    const p = pt(r * (pct / 100), i);
                    return p.x + ',' + p.y;
                }).join(' ');
            });
            const bands = [
                { label: 'A', y: Math.round((cy - r * 0.90) * 100) / 100 },
                { label: 'B', y: Math.round((cy - r * 0.75) * 100) / 100 },
                { label: 'C', y: Math.round((cy - r * 0.60) * 100) / 100 },
                { label: 'D', y: Math.round((cy - r * 0.40) * 100) / 100 }
            ];
            return { axes: axes, polygon: polygon, rings: rings, points: points, bands: bands };
        },

        siLevers: function () {
            const si = (this.data && this.data.selfImprovement) || {};
            return (si.levers || []).map(function (l) {
                return {
                    rank: l.rank, dimension: l.dimension, severity: l.severity,
                    kind: l.kind, action: l.action,
                    file: l.file || null, line: l.line != null ? l.line : null,
                    scoreUplift: l.scoreUplift, effort: l.effort
                };
            });
        },

        siLeversQuadrant: function () {
            const EFFORT_X = { trivial: 10, low: 25, medium: 50, high: 80 };
            const levers = this.siLevers || [];
            const maxUplift = levers.reduce(function (m, l) {
                return Math.max(m, l.scoreUplift || 0);
            }, 1);
            return levers.map(function (l) {
                const x = EFFORT_X[l.effort] != null ? EFFORT_X[l.effort] : 50;
                const y = Math.round(((l.scoreUplift || 0) / maxUplift) * 100);
                return {
                    rank: l.rank, severity: l.severity, action: l.action,
                    cx: x, cy: 100 - y,
                    r: l.rank === 1 ? 9 : l.rank === 2 ? 7 : 5,
                    uplift: l.scoreUplift, effort: l.effort
                };
            });
        },

        siRemediationPlan: function () {
            const si = (this.data && this.data.selfImprovement) || {};
            const rp = si.remediationPlan || { phases: [], currentScore: 0, projectedScoreIfAllP0P1Remediated: 0 };
            const phases = (rp.phases || []).map(function (p) {
                return {
                    phase: p.phase, severity: p.severity,
                    itemCount: p.itemCount || 0, estUplift: p.estUplift || 0,
                    projected: p.projected || 0, deadline: p.deadline || '',
                    projectedWidth: Math.max(2, Math.min(100, p.projected || 0))
                };
            });
            return {
                phases: phases,
                currentScore: rp.currentScore || 0,
                projectedIfAllP0P1: rp.projectedScoreIfAllP0P1Remediated || 0
            };
        },

        siTimeline: function () {
            const rp = this.siRemediationPlan || {};
            const phases = rp.phases || [];
            if (!phases.length) return { segments: [], markers: [] };
            const SLOTS = [
                { start: 0, width: 25 }, { start: 25, width: 35 }, { start: 60, width: 40 }
            ];
            const segments = phases.map(function (p, i) {
                const slot = SLOTS[i] || SLOTS[SLOTS.length - 1];
                const cls = p.severity === 'p0' || p.severity === 'blocking' ? 'grade-critical'
                        : p.severity === 'p1' || p.severity === 'important' ? 'grade-warn' : 'grade-ok';
                return { label: p.phase.split('—')[0].trim(), itemCount: p.itemCount,
                    x: slot.start, width: slot.width, cls: cls, deadline: p.deadline };
            });
            const markers = [
                { x: 0, label: 'now' }, { x: 25, label: 'before merge' },
                { x: 60, label: 'next iteration' }, { x: 100, label: 'this quarter' }
            ];
            return { segments: segments, markers: markers };
        },

        siTrajectory: function () {
            const rp = this.siRemediationPlan;
            const pts = [{ label: 'current', score: rp.currentScore, kind: 'now' }];
            (rp.phases || []).forEach(function (p) {
                pts.push({
                    label: p.phase.split('—')[0].trim(),
                    score: p.projected, kind: p.severity,
                    uplift: p.estUplift
                });
            });
            pts.push({ label: 'target', score: 100, kind: 'target' });
            return pts.map(function (p, i) {
                return {
                    label: p.label, kind: p.kind, score: p.score, uplift: p.uplift || 0,
                    x: (i / Math.max(1, pts.length - 1)) * 100,
                    y: 100 - Math.max(0, Math.min(100, p.score))
                };
            });
        },
        siSparkline: function () {
            const pts = this.siTrajectory || [];
            if (!pts.length || pts.length < 2) return { points: '', trend: 'flat', delta: 0, arrow: '→', lastX: 0, lastY: 0 };
            const W = 40, H = 12, pad = 1;
            const ys = pts.map(function (p) { return p.y; });
            const minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
            const range = Math.max(1, maxY - minY);
            const mapped = pts.map(function (p) {
                return (pad + p.x / 100 * (W - 2 * pad)).toFixed(1) + ',' +
                    (pad + (p.y - minY) / range * (H - 2 * pad)).toFixed(1);
            });
            const projected = pts[pts.length - 2] || pts[0];
            const current = pts[0];
            const delta = (projected.score || 0) - (current.score || 0);
            const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
            const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
            return {
                points: mapped.join(' '),
                trend: trend, delta: delta, arrow: arrow,
                lastX: (pad + (pts[pts.length - 1].x / 100) * (W - 2 * pad)).toFixed(1),
                lastY: (pad + ((pts[pts.length - 1].y - minY) / range) * (H - 2 * pad)).toFixed(1)
            };
        },

        siBenchmarks: function () {
            const si = (this.data && this.data.selfImprovement) || {};
            const b = si.benchmarks || {};
            return {
                currentGrade: b.currentGrade || 'F',
                currentValue: b.currentValue || 0,
                targetGrade: b.targetGrade || 'A',
                targetValue: b.targetValue || 100,
                gapToNext: b.gapToNext || 0,
                gapPct: Math.max(2, Math.min(100, (b.gapToNext || 0) * 2))
            };
        },
        siDecayProjection: function () {
            const traj = this.siTrajectory || [];
            const decay = this.siDecayForecast || {};
            if (!traj.length || traj.length < 2) return { points: '', active: false };
            const current = decay.currentScore || (traj[0] ? traj[0].score : 0);
            const delta = decay.delta || 0;
            if (delta >= 0) return { points: '', active: false };
            const n = traj.length;
            const pts = [];
            for (let i = 0; i < n; i++) {
                const score = Math.max(0, Math.min(100, current + (delta * i)));
                pts.push({ x: (i / Math.max(1, n - 1)) * 100, y: 100 - score });
            }
            return {
                points: pts.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' '),
                active: true,
                finalScore: Math.max(0, Math.min(100, current + delta * (n - 1)))
            };
        },

        siConfidence: function () {
            const rp = this.siRemediationPlan || {};
            const b = this.siBenchmarks || {};
            const current = rp.currentScore || 0;
            const projected = rp.projectedIfAllP0P1 || 0;
            const target = b.targetValue || 100;
            const gap = Math.max(1, target - current);
            const closeable = Math.max(0, projected - current);
            const pct = Math.max(0, Math.min(100, Math.round(closeable / gap * 100)));
            return {
                pct: pct, current: current, projected: projected, target: target,
                cls: pct >= 75 ? 'grade-ok' : pct >= 40 ? 'grade-warn' : 'grade-critical',
                label: pct >= 75 ? 'high confidence' : pct >= 40 ? 'moderate' : 'low'
            };
        },
        siGapDecomp: function () {
            const b = this.siBenchmarks || {};
            const rp = this.siRemediationPlan || {};
            const current = rp.currentScore || 0;
            const target = b.targetValue || 100;
            const gap = Math.max(0, target - current);
            if (gap <= 0) return { current: current, target: target, gap: 0, segments: [], residual: 0 };
            const levers = (this.siLevers || []).slice().sort(function (a, c) {
                return (c.scoreUplift || 0) - (a.scoreUplift || 0);
            }).slice(0, 3);
            const segments = []; let used = 0;
            levers.forEach(function (l, idx) {
                const u = Math.max(0, Math.min(gap - used, l.scoreUplift || 0));
                if (u <= 0) return;
                segments.push({
                    dimName: l.dimName, rank: l.rank, uplift: u,
                    pctOfGap: gap > 0 ? Math.round(u / gap * 100) : 0,
                    cls: idx === 0 ? 'grade-critical' : idx === 1 ? 'grade-warn' : 'grade-ok',
                    x: Math.round((current + used) * 100 / target),
                    width: Math.round(u * 100 / target)
                });
                used += u;
            });
            return {
                current: current, target: target, gap: gap, segments: segments,
                residual: Math.max(0, gap - used),
                residualX: Math.round((current + used) * 100 / target),
                residualWidth: Math.round(Math.max(0, gap - used) * 100 / target)
            };
        },

        siDecayForecast: function () {
            const si = (this.data && this.data.selfImprovement) || {};
            const d = si.decayForecast || {};
            return {
                currentScore: d.currentScore || 0,
                projectedNext: d.projectedNext || 0,
                delta: d.delta || 0,
                rationale: d.rationale || '',
                isDecaying: (d.delta || 0) < 0
            };
        },

        siNarrative: function () {
            const si = (this.data && this.data.selfImprovement) || {};
            return si.narrative || [];
        },

        siSensitivity: function () {
            const g = this.siGapDecomp;
            if (!g || !g.segments || g.segments.length === 0) return { levers: [], maxUplift: 0 };
            const sorted = g.segments.slice().sort(function (a, c) {
                return (c.uplift || 0) - (a.uplift || 0);
            });
            let maxUplift = 0;
            const levers = sorted.map(function (s, i) {
                const exp = s.uplift || 0;
                const pess = Math.round(exp * 0.7 * 10) / 10;
                const opt = Math.round(exp * 1.3 * 10) / 10;
                if (opt > maxUplift) maxUplift = opt;
                return {
                    dimName: s.dimName, rank: s.rank,
                    pessimistic: pess, expected: exp, optimistic: opt,
                    rangeWidth: Math.round((opt - pess) * 10) / 10,
                    cls: i === 0 ? 'grade-critical' : i === 1 ? 'grade-warn' : 'grade-ok',
                    pessX: 0, barWidth: 0, expX: 0
                };
            });
            const scale = maxUplift > 0 ? 100 / maxUplift : 0;
            levers.forEach(function (l) {
                l.pessX = Math.round(l.pessimistic * scale * 10) / 10;
                l.barWidth = Math.round((l.optimistic - l.pessimistic) * scale * 10) / 10;
                l.expX = Math.round(l.expected * scale * 10) / 10;
            });
            return { levers: levers, maxUplift: maxUplift };
        },

        siEffortDonut: function () {
            const rp = this.siRemediationPlan || {};
            const phases = rp.phases || [];
            if (!phases.length) return { slices: [], totalUplift: 0 };
            const total = phases.reduce(function (s, p) { return s + (p.estUplift || 0); }, 0);
            if (total <= 0) return { slices: [], totalUplift: 0 };
            let cumulative = 0;
            const slices = phases.map(function (p, i) {
                const v = p.estUplift || 0;
                const pct = total > 0 ? v / total * 100 : 0;
                const slice = {
                    label: p.phase.split('—')[0].trim(),
                    value: v,
                    pct: Math.round(pct * 10) / 10,
                    cls: i === 0 ? 'grade-critical' : i === 1 ? 'grade-warn' : 'grade-ok',
                    dashArray: Math.round(pct * 10) / 10 + ' ' + Math.round((100 - pct) * 10) / 10,
                    dashOffset: Math.round(cumulative * 10) / 10
                };
                cumulative += pct;
                return slice;
            });
            return { slices: slices, totalUplift: total };
        },

        siRiskDecay: function () {
            const d = this.siSeverityDonut || {};
            const segs = d.segments || [];
            const p0 = (segs[0] && segs[0].count) || 0;
            const p1 = (segs[1] && segs[1].count) || 0;
            const p2 = (segs[2] && segs[2].count) || 0;
            const start = p0 * 3 + p1 * 1 + p2 * 0.3;
            const afterP0 = p1 * 1 + p2 * 0.3;
            const afterP1 = p2 * 0.3;
            const afterP2 = 0;
            const maxV = start;
            const points = [
                { x: 0,   y: start,   label: 'current',   val: Math.round(start * 10) / 10 },
                { x: 33,  y: afterP0, label: 'P0 closed', val: Math.round(afterP0 * 10) / 10 },
                { x: 66,  y: afterP1, label: 'P1 closed', val: Math.round(afterP1 * 10) / 10 },
                { x: 100, y: afterP2, label: 'P2 closed', val: Math.round(afterP2 * 10) / 10 }
            ];
            const yScale = maxV > 0 ? 80 / maxV : 0;
            points.forEach(function (p) { p.yPx = 90 - p.y * yScale; });
            const polyline = points.map(function (p) { return p.x + ',' + p.yPx; }).join(' ');
            const threshold = 5;
            return {
                points: points,
                polyline: polyline,
                maxVal: Math.round(maxV * 10) / 10,
                threshold: threshold,
                thresholdY: Math.max(0, Math.round((90 - threshold * yScale) * 10) / 10),
                thresholdVisible: threshold < maxV
            };
        },

        siROIRanking: function () {
            const EFFORT_W = { trivial: 10, low: 25, medium: 50, high: 80 };
            const levers = (this.siLevers || []).map(function (l) {
                const w = EFFORT_W[l.effort] != null ? EFFORT_W[l.effort] : 50;
                const roi = w > 0 ? (l.scoreUplift || 0) / w : 0;
                return {
                    rank: l.rank,
                    dimName: l.dimName,
                    action: l.action,
                    uplift: l.scoreUplift || 0,
                    effort: l.effort,
                    effortWeight: w,
                    roi: Math.round(roi * 100) / 100,
                    cls: l.rank === 1 ? 'grade-critical' : l.rank === 2 ? 'grade-warn' : 'grade-ok'
                };
            }).sort(function (a, b) { return b.roi - a.roi; }).slice(0, 5);
            const maxRoi = levers.reduce(function (m, l) { return Math.max(m, l.roi); }, 0.01);
            levers.forEach(function (l) {
                l.barWidth = Math.max(3, Math.round(l.roi / maxRoi * 100));
            });
            return { levers: levers, maxRoi: Math.round(maxRoi * 100) / 100 };
        },

        siSCurve: function () {
            const rp = this.siRemediationPlan || {};
            const phases = rp.phases || [];
            if (!phases.length) return { points: [], polyline: '', totalUplift: 0 };
            const total = phases.reduce(function (s, p) { return s + (p.estUplift || 0); }, 0);
            if (total <= 0) return { points: [], polyline: '', totalUplift: 0 };
            let cum = 0;
            const pts = phases.map(function (p, i) {
                cum += p.estUplift || 0;
                return {
                    x: (i / (phases.length - 1 || 1)) * 100,
                    y: 100 - (cum / total) * 100,
                    phase: p.phase,
                    pct: Math.round(cum / total * 100)
                };
            });
            pts.unshift({ x: 0, y: 100, phase: 'start', pct: 0 });
            const polyline = pts.map(function (p) { return p.x + ',' + p.y; }).join(' ');
            return { points: pts, polyline: polyline, totalUplift: total };
        },

        siScoreHistogram: function () {
            const vectors = this.siRiskVectors || [];
            const bands = [
                { label: 'A', min: 90, cls: 'grade-ok', count: 0 },
                { label: 'B', min: 75, cls: 'grade-ok', count: 0 },
                { label: 'C', min: 60, cls: 'grade-warn', count: 0 },
                { label: 'D', min: 40, cls: 'grade-warn', count: 0 },
                { label: 'F', min: 0,  cls: 'grade-critical', count: 0 }
            ];
            vectors.forEach(function (v) {
                const s = v.score || 0;
                for (let i = 0; i < bands.length; i++) {
                    if (s >= bands[i].min) { bands[i].count++; break; }
                }
            });
            let maxCount = 1;
            bands.forEach(function (b) { if (b.count > maxCount) maxCount = b.count; });
            bands.forEach(function (b) { b.heightPct = Math.round(b.count / maxCount * 100); });
            return { bands: bands, total: vectors.length, maxCount: maxCount };
        },

        siDecisionQuadrant: function () {
            const conf = this.siConfidence || { pct: 0 };
            const d = this.siSeverityDonut || {};
            const segs = d.segments || [];
            const p0 = (segs[0] && segs[0].count) || 0;
            const p1 = (segs[1] && segs[1].count) || 0;
            const p2 = (segs[2] && segs[2].count) || 0;
            const risk = p0 * 3 + p1 * 1 + p2 * 0.3;
            const riskScale = 30;
            const riskPct = Math.min(100, Math.round(risk / riskScale * 100));
            const confPct = conf.pct || 0;
            const highConf = confPct >= 50;
            const lowRisk = riskPct < 50;
            const zone = highConf && lowRisk ? 'SHIP'
                : highConf && !lowRisk ? 'MONITOR'
                : !highConf && lowRisk ? 'CONDITIONAL'
                : 'BLOCK';
            return {
                confPct: confPct, riskPct: riskPct,
                x: confPct, y: 100 - riskPct,
                zone: zone, riskRaw: Math.round(risk * 10) / 10
            };
        },

        siTimeToTarget: function () {
            const rp = this.siRemediationPlan || {};
            const b = this.siBenchmarks || {};
            const current = rp.currentScore || 0;
            const projected = rp.projectedIfAllP0P1 || 0;
            const target = b.targetValue || 100;
            const phases = (rp.phases || []).length;
            const avgUplift = phases > 0 ? (projected - current) / phases : 0;
            const remaining = Math.max(0, target - projected);
            const extraPhases = avgUplift > 0 ? Math.ceil(remaining / avgUplift) : (remaining > 0 ? 99 : 0);
            const onTrack = projected >= target;
            return {
                current: current, projected: projected, target: target,
                avgUplift: Math.round(avgUplift * 10) / 10,
                extraPhases: extraPhases, totalPhases: phases + extraPhases,
                onTrack: onTrack,
                currentPct: target > 0 ? Math.min(100, Math.round(current / target * 100)) : 0,
                projectedPct: target > 0 ? Math.min(100, Math.round(projected / target * 100)) : 0,
                verdict: onTrack ? 'on track — plan reaches target'
                    : avgUplift <= 0 ? 'stalled — no uplift trajectory'
                    : 'needs ' + extraPhases + ' more phase(s) beyond plan'
            };
        },

        siCapacityVsRisk: function () {
            const rp = this.siRemediationPlan || {};
            const phases = rp.phases || [];
            const d = this.siSeverityDonut || {};
            const segs = d.segments || [];
            const p0 = (segs[0] && segs[0].count) || 0;
            const p1 = (segs[1] && segs[1].count) || 0;
            const p2 = (segs[2] && segs[2].count) || 0;
            const riskByPhase = [p0 * 3, p1 * 1, p2 * 0.3];
            if (!phases.length) return { rows: [], maxVal: 0 };
            const rows = phases.map(function (p, i) {
                const capacity = p.estUplift || 0;
                const riskRed = riskByPhase[i] || 0;
                return {
                    label: p.phase.split('—')[0].trim(),
                    capacity: capacity,
                    riskReduction: Math.round(riskRed * 10) / 10,
                    ratio: riskRed > 0 ? Math.round(capacity / riskRed * 100) / 100 : 0,
                    cls: i === 0 ? 'grade-critical' : i === 1 ? 'grade-warn' : 'grade-ok'
                };
            });
            const maxVal = rows.reduce(function (m, r) {
                return Math.max(m, r.capacity, r.riskReduction);
            }, 1);
            rows.forEach(function (r) {
                r.capPct = Math.round(r.capacity / maxVal * 100);
                r.riskPct = Math.round(r.riskReduction / maxVal * 100);
            });
            return { rows: rows, maxVal: maxVal };
        },

        siDimGap: function () {
            const vectors = this.siRiskVectors || [];
            if (!vectors.length) return { rows: [], maxGap: 0 };
            const rows = vectors.map(function (v) {
                const val = v.score || 0;
                const gap = Math.max(0, 100 - val);
                return {
                    name: v.dimension,
                    value: val,
                    gap: gap,
                    cls: gap >= 30 ? 'grade-critical' : gap >= 10 ? 'grade-warn' : 'grade-ok'
                };
            }).sort(function (a, b) { return b.gap - a.gap; });
            const maxGap = rows.reduce(function (m, r) { return Math.max(m, r.gap); }, 1);
            rows.forEach(function (r) { r.widthPct = Math.round(r.gap / maxGap * 100); });
            return { rows: rows, maxGap: maxGap };
        },

        siConcentrationGauge: function () {
            const vectors = this.siRiskVectors || [];
            const scores = vectors.map(function (v) {
                return { name: v.dimension, sev: v.sevScore || 0 };
            }).filter(function (s) { return s.sev > 0; });
            if (!scores.length) return { value: 0, cls: 'grade-ok', label: 'no risk', topDim: '—', topShare: 0, arc: 156.2 };
            const total = scores.reduce(function (s, x) { return s + x.sev; }, 0);
            if (total <= 0) return { value: 0, cls: 'grade-ok', label: 'no risk', topDim: '—', topShare: 0, arc: 156.2 };
            const hhi = scores.reduce(function (s, x) {
                const share = x.sev / total;
                return s + share * share;
            }, 0);
            const n = scores.length;
            const norm = n > 1 ? (hhi - 1 / n) / (1 - 1 / n) : 1;
            const value = Math.max(0, Math.min(100, Math.round(norm * 100)));
            const sorted = scores.slice().sort(function (a, b) { return b.sev - a.sev; });
            const top = sorted[0];
            const topShare = Math.round(top.sev / total * 100);
            const cls = value >= 60 ? 'grade-critical' : value >= 35 ? 'grade-warn' : 'grade-ok';
            const label = value >= 60 ? 'concentrated' : value >= 35 ? 'moderate' : 'dispersed';
            return { value: value, cls: cls, label: label, topDim: top.name, topShare: topShare, arc: 156.2 * (1 - value / 100) };
        },

        siDimUplift: function () {
            const levers = this.siLevers || [];
            if (!levers.length) return { rows: [], maxUplift: 0 };
            const byDim = {};
            levers.forEach(function (l) {
                const key = l.dimension || l.action;
                if (!key) return;
                if (!byDim[key]) byDim[key] = { name: key, uplift: 0, count: 0 };
                byDim[key].uplift += (l.scoreUplift || 0);
                byDim[key].count += 1;
            });
            const rows = Object.keys(byDim).map(function (k) {
                const r = byDim[k];
                r.uplift = Math.round(r.uplift * 10) / 10;
                return r;
            }).sort(function (a, b) { return b.uplift - a.uplift; });
            const maxUplift = rows.reduce(function (m, r) { return Math.max(m, r.uplift); }, 1);
            rows.forEach(function (r) {
                r.widthPct = Math.round(r.uplift / maxUplift * 100);
                r.cls = r.uplift >= 15 ? 'grade-critical' : r.uplift >= 5 ? 'grade-warn' : 'grade-ok';
            });
            return { rows: rows, maxUplift: maxUplift };
        },
    },

    watch: {
        filterText: {
            handler: function (val) {
                var self = this;
                if (!this._filterDebounce) {
                    this._filterDebounce = debounce(function (v) {
                        self.filterTextDebounced = v || '';
                    }, 200);
                }
                this._filterDebounce(val);
            },
            immediate: false
        }
    },

    methods: {
        applySort: function (rows, table) {
            const s = this.sortState[table];
            if (!s || !rows || !rows.length) return rows || [];
            const key = s.key;
            const dir = s.dir;
            const arr = rows.slice();
            arr.sort(function (a, b) {
                const av = a[key];
                const bv = b[key];
                if (typeof av === 'string' || typeof bv === 'string') {
                    return String(av).localeCompare(String(bv)) * dir;
                }
                return ((av || 0) - (bv || 0)) * dir;
            });
            return arr;
        },

        sortClass: function (table, key) {
            const s = this.sortState[table];
            if (!s || s.key !== key) return '';
            return s.dir === 1 ? 'sort-asc' : 'sort-desc';
        },

        setSort: function (table, key) {
            const s = this.sortState[table];
            if (!s) return;
            if (s.key === key) {
                s.dir = -s.dir;
            } else {
                s.key = key;
                s.dir = -1;
            }
        },

        setCouplingTab: function (tab) {
            this.couplingTab = tab;
            const s = this.sortState.coupling;
            if (s) {
                s.key = tab === 'fanout' ? 'fanOut' : 'fanIn';
                s.dir = -1;
            }
        },

        setRiskTab: function (tab) {
            this.riskTab = tab;
            const s = this.sortState.risk;
            if (s) {
                if (tab === 'orphans') { s.key = 'bytes'; }
                else if (tab === 'depth') { s.key = 'maxDepth'; }
                else { s.key = 'score'; }
                s.dir = -1;
            }
        },

        setSizeTab: function (tab) {
            this.sizeTab = tab;
        },

        setHealthTab: function (tab) {
            this.healthTab = tab;
        },

        subScoreClass: function (s) {
            if (s == null) return 'grade-warn';
            if (s >= 75) return 'grade-ok';
            if (s >= 40) return 'grade-warn';
            return 'grade-critical';
        },

        toggleTile: function (name) {
            this.expandedTiles[name] = !this.expandedTiles[name];
        },

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
        // Sync initial debounced filter value
        this.filterTextDebounced = this.filterText || '';
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

        // Core navigation / data components
        if (window.ruiBreadcrumb && window.ruiBreadcrumb.name === 'ruiBreadcrumb') {
            app.component('rui-breadcrumb', window.ruiBreadcrumb);
        }
        if (window.ruiScoreBar && window.ruiScoreBar.name === 'ruiScoreBar') {
            app.component('rui-score-bar', window.ruiScoreBar);
        }

        // Indicator components
        if (window.ruiBadge && window.ruiBadge.name === 'ruiBadge') {
            app.component('rui-badge', window.ruiBadge);
        }
        if (window.ruiTagChip && window.ruiTagChip.name === 'ruiTagChip') {
            app.component('rui-tag-chip', window.ruiTagChip);
        }

        // UX affordance
        if (window.ruiBackTop && window.ruiBackTop.name === 'ruiBackTop') {
            app.component('rui-back-top', window.ruiBackTop);
        }

        app.mount('#page-app');
    });
});
