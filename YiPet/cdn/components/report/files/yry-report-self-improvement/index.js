import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

/* ── Severity scoring (component-local) ─────────────────────────────
 * Note: helpers stay inlined here to preserve the "single entry per
 * component" property — the parent page includes one <script> per
 * component and the entry auto-injects its CSS and template. If a
 * second component ever needs the same severity math, copy these
 * three declarations rather than introducing a shared util file.
 * ─────────────────────────────────────────────────────────────────── */
var SEVERITY_WEIGHTS = { P0: 3, P1: 1, P2: 0.3 };

function calcSeverity(r) {
    return (r.p0 || 0) * SEVERITY_WEIGHTS.P0
         + (r.p1 || 0) * SEVERITY_WEIGHTS.P1
         + (r.p2 || 0) * SEVERITY_WEIGHTS.P2;
}

const compDef = {
    name: 'yryReportSelfImprovement',
    html: '/cdn/components/business/reports/files/yry-report-self-improvement/index.html',
    css: '/cdn/components/business/reports/files/yry-report-self-improvement/index.css',
    props: {
        si: { type: Object, default: function() { return {}; } },
        labels: { type: Object, default: function() { return {}; } }
    },
    computed: {

        /* ── p0Count: derived from severity donut ── */
        p0Count: function() {
            var sd = (this.si && this.si.severityDonut) || {};
            return sd.p0 || 0;
        },

        /* ── donut: severity donut chart data ── */
        donut: function() {
            var d = (this.si && this.si.severityDonut) || { p0: 0, p1: 0, p2: 0, total: 0 };
            var p0 = d.p0 || 0, p1 = d.p1 || 0, p2 = d.p2 || 0;
            var total = p0 + p1 + p2;
            var DONUT_C = 2 * Math.PI * 40;
            var acc = 0;
            var segs = [
                { sev: 'P0', count: p0, color: 'var(--yry-critical, #ef4444)' },
                { sev: 'P1', count: p1, color: 'var(--yry-warn, #f59e0b)' },
                { sev: 'P2', count: p2, color: 'var(--yry-ok, #22c55e)' }
            ].map(function (s) {
                var frac = total === 0 ? 0 : s.count / total;
                var seg = {
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

        /* ── riskVectors: risk vectors with score, weight, sevScore ── */
        riskVectors: function() {
            return ((this.si && this.si.riskVectors) || []).map(function (r) {
                var score = r.score || 0;
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

        /* ── heatmap: severity-dimension matrix ── */
        heatmap: function() {
            var rows = (this.riskVectors || []).slice().sort(function (a, b) {
                return (b.sevScore || 0) - (a.sevScore || 0);
            }).slice(0, 6);
            var maxCount = 1;
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

        /* ── pareto: Pareto chart bars, line, marks ── */
        pareto: function() {
            var vectors = (this.riskVectors || []).slice().sort(function (a, b) {
                return (b.sevScore || 0) - (a.sevScore || 0);
            });
            var n = vectors.length;
            if (n < 2) return { bars: [], line: '', marks: [], pct80y: 0 };
            var total = vectors.reduce(function (s, v) { return s + (v.sevScore || 0); }, 0) || 1;
            var max = vectors.reduce(function (m, v) { return Math.max(m, v.sevScore || 0); }, 0) || 1;
            var BAR_TOP = 5, BAR_H = 35, BASELINE = BAR_TOP + BAR_H;
            var barW = 100 / n; var running = 0;
            var bars = [], marks = [], linePts = [];
            for (var i = 0; i < n; i++) {
                var v = vectors[i];
                var score = v.sevScore || 0;
                running += score;
                var h = (score / max) * BAR_H;
                bars.push({ label: v.dimension, score: v.score, x: i * barW, width: barW * 0.82, y: BASELINE - h, height: h, scoreCls: v.scoreCls });
                var cx = i * barW + barW / 2;
                var cumPct = (running / total) * 100;
                var ly = BASELINE - (cumPct / 100) * BAR_H;
                marks.push({ x: cx, y: ly, pct: Math.round(cumPct) });
                linePts.push(cx + ',' + ly);
            }
            return { bars: bars, line: linePts.join(' '), marks: marks, pct80y: BASELINE - 0.8 * BAR_H };
        },

        /* ── radar: radar chart with axes, polygon, rings, points ── */
        radar: function() {
            var vectors = this.riskVectors || [];
            var n = vectors.length;
            if (n < 3) return { axes: [], polygon: '', rings: [], points: [], bands: [] };
            var cx = 50, cy = 50, r = 38, labelR = 47;
            var angles = [];
            for (var i = 0; i < n; i++) { angles.push(-Math.PI / 2 + (2 * Math.PI * i / n)); }
            function pt(rr, idx) {
                return {
                    x: Math.round((cx + rr * Math.cos(angles[idx])) * 100) / 100,
                    y: Math.round((cy + rr * Math.sin(angles[idx])) * 100) / 100
                };
            }
            var axes = vectors.map(function (v, idx) {
                var a = pt(labelR, idx);
                return { label: v.dimension, score: v.score, x: a.x, y: a.y, scoreCls: v.scoreCls };
            });
            var points = vectors.map(function (v, idx) {
                var p = pt(r * (Math.max(0, Math.min(100, v.score)) / 100), idx);
                return { label: v.dimension, score: v.score, x: p.x, y: p.y, scoreCls: v.scoreCls };
            });
            var polygon = points.map(function (p) { return p.x + ',' + p.y; }).join(' ');
            var rings = [25, 50, 75, 100].map(function (pct) {
                return vectors.map(function (v, idx) {
                    var p = pt(r * (pct / 100), idx);
                    return p.x + ',' + p.y;
                }).join(' ');
            });
            var bands = [
                { label: 'A', y: Math.round((cy - r * 0.90) * 100) / 100 },
                { label: 'B', y: Math.round((cy - r * 0.75) * 100) / 100 },
                { label: 'C', y: Math.round((cy - r * 0.60) * 100) / 100 },
                { label: 'D', y: Math.round((cy - r * 0.40) * 100) / 100 }
            ];
            return { axes: axes, polygon: polygon, rings: rings, points: points, bands: bands };
        },

        /* ── levers: top remediation levers ── */
        levers: function() {
            return ((this.si && this.si.levers) || []).map(function (l) {
                return {
                    rank: l.rank, dimension: l.dimension, severity: l.severity,
                    kind: l.kind, action: l.action,
                    file: l.file || null, line: l.line != null ? l.line : null,
                    scoreUplift: l.scoreUplift, effort: l.effort
                };
            });
        },

        /* ── leversQuadrant: effort vs uplift quadrant ── */
        leversQuadrant: function() {
            var EFFORT_X = { trivial: 10, low: 25, medium: 50, high: 80 };
            var levers = this.levers || [];
            var maxUplift = levers.reduce(function (m, l) {
                return Math.max(m, l.scoreUplift || 0);
            }, 1);
            return levers.map(function (l) {
                var x = EFFORT_X[l.effort] != null ? EFFORT_X[l.effort] : 50;
                var y = Math.round(((l.scoreUplift || 0) / maxUplift) * 100);
                return {
                    rank: l.rank, severity: l.severity, action: l.action,
                    cx: x, cy: 100 - y,
                    r: l.rank === 1 ? 9 : l.rank === 2 ? 7 : 5,
                    uplift: l.scoreUplift, effort: l.effort
                };
            });
        },

        /* ── remediationPlan: phases with current/projected scores ── */
        remediationPlan: function() {
            var rp = (this.si && this.si.remediationPlan) || { phases: [], currentScore: 0, projectedScoreIfAllP0P1Remediated: 0 };
            var phases = (rp.phases || []).map(function (p) {
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

        /* ── timeline: Gantt timeline segments and markers ── */
        timeline: function() {
            var rp = this.remediationPlan || {};
            var phases = rp.phases || [];
            if (!phases.length) return { segments: [], markers: [] };
            var SLOTS = [
                { start: 0, width: 25 }, { start: 25, width: 35 }, { start: 60, width: 40 }
            ];
            var segments = phases.map(function (p, i) {
                var slot = SLOTS[i] || SLOTS[SLOTS.length - 1];
                var cls = p.severity === 'p0' || p.severity === 'blocking' ? 'grade-critical'
                        : p.severity === 'p1' || p.severity === 'important' ? 'grade-warn' : 'grade-ok';
                return { label: p.phase.split('—')[0].trim(), itemCount: p.itemCount,
                    x: slot.start, width: slot.width, cls: cls, deadline: p.deadline };
            });
            var markers = [
                { x: 0, label: 'now' }, { x: 25, label: 'before merge' },
                { x: 60, label: 'next iteration' }, { x: 100, label: 'this quarter' }
            ];
            return { segments: segments, markers: markers };
        },

        /* ── confidence: confidence ring percentage ── */
        confidence: function() {
            var rp = this.remediationPlan || {};
            var b = this.benchmarks || {};
            var current = rp.currentScore || 0;
            var projected = rp.projectedIfAllP0P1 || 0;
            var target = b.targetValue || 100;
            var gap = Math.max(1, target - current);
            var closeable = Math.max(0, projected - current);
            var pct = Math.max(0, Math.min(100, Math.round(closeable / gap * 100)));
            return {
                pct: pct, current: current, projected: projected, target: target,
                cls: pct >= 75 ? 'grade-ok' : pct >= 40 ? 'grade-warn' : 'grade-critical',
                label: pct >= 75 ? 'high confidence' : pct >= 40 ? 'moderate' : 'low'
            };
        },

        /* ── gapDecomp: gap decomposition segments ── */
        gapDecomp: function() {
            var b = this.benchmarks || {};
            var rp = this.remediationPlan || {};
            var current = rp.currentScore || 0;
            var target = b.targetValue || 100;
            var gap = Math.max(0, target - current);
            if (gap <= 0) return { current: current, target: target, gap: 0, segments: [], residual: 0, residualX: 0, residualWidth: 0 };
            var levers = (this.levers || []).slice().sort(function (a, c) {
                return (c.scoreUplift || 0) - (a.scoreUplift || 0);
            }).slice(0, 3);
            var segments = []; var used = 0;
            levers.forEach(function (l, idx) {
                var u = Math.max(0, Math.min(gap - used, l.scoreUplift || 0));
                if (u <= 0) return;
                segments.push({
                    dimName: l.dimension, rank: l.rank, uplift: u,
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

        /* ── decayForecast: decay forecast data ── */
        decayForecast: function() {
            var d = (this.si && this.si.decayForecast) || {};
            return {
                currentScore: d.currentScore || 0,
                projectedNext: d.projectedNext || 0,
                delta: d.delta || 0,
                rationale: d.rationale || '',
                isDecaying: (d.delta || 0) < 0
            };
        },

        /* ── narrative: narrative paragraphs ── */
        narrative: function() {
            return (this.si && this.si.narrative) || [];
        },

        /* ── sensitivity: tornado chart data ── */
        sensitivity: function() {
            var g = this.gapDecomp;
            if (!g || !g.segments || g.segments.length === 0) return { levers: [], maxUplift: 0 };
            var sorted = g.segments.slice().sort(function (a, c) {
                return (c.uplift || 0) - (a.uplift || 0);
            });
            var maxUplift = 0;
            var levers = sorted.map(function (s, i) {
                var exp = s.uplift || 0;
                var pess = Math.round(exp * 0.7 * 10) / 10;
                var opt = Math.round(exp * 1.3 * 10) / 10;
                if (opt > maxUplift) maxUplift = opt;
                return {
                    dimName: s.dimName, rank: s.rank,
                    pessimistic: pess, expected: exp, optimistic: opt,
                    rangeWidth: Math.round((opt - pess) * 10) / 10,
                    cls: i === 0 ? 'grade-critical' : i === 1 ? 'grade-warn' : 'grade-ok',
                    pessX: 0, barWidth: 0, expX: 0
                };
            });
            var scale = maxUplift > 0 ? 100 / maxUplift : 0;
            levers.forEach(function (l) {
                l.pessX = Math.round(l.pessimistic * scale * 10) / 10;
                l.barWidth = Math.round((l.optimistic - l.pessimistic) * scale * 10) / 10;
                l.expX = Math.round(l.expected * scale * 10) / 10;
            });
            return { levers: levers, maxUplift: maxUplift };
        },

        /* ── effortDonut: effort allocation donut ── */
        effortDonut: function() {
            var rp = this.remediationPlan || {};
            var phases = rp.phases || [];
            if (!phases.length) return { slices: [], totalUplift: 0 };
            var total = phases.reduce(function (s, p) { return s + (p.estUplift || 0); }, 0);
            if (total <= 0) return { slices: [], totalUplift: 0 };
            var cumulative = 0;
            var slices = phases.map(function (p, i) {
                var v = p.estUplift || 0;
                var pct = total > 0 ? v / total * 100 : 0;
                var slice = {
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

        /* ── riskDecay: risk exposure decay polyline ── */
        riskDecay: function() {
            var d = this.donut || {};
            var segs = d.segments || [];
            var p0 = (segs[0] && segs[0].count) || 0;
            var p1 = (segs[1] && segs[1].count) || 0;
            var p2 = (segs[2] && segs[2].count) || 0;
            var start = p0 * 3 + p1 * 1 + p2 * 0.3;
            var afterP0 = p1 * 1 + p2 * 0.3;
            var afterP1 = p2 * 0.3;
            var afterP2 = 0;
            var maxV = start;
            var points = [
                { x: 0,   y: start,   label: 'current',   val: Math.round(start * 10) / 10 },
                { x: 33,  y: afterP0, label: 'P0 closed', val: Math.round(afterP0 * 10) / 10 },
                { x: 66,  y: afterP1, label: 'P1 closed', val: Math.round(afterP1 * 10) / 10 },
                { x: 100, y: afterP2, label: 'P2 closed', val: Math.round(afterP2 * 10) / 10 }
            ];
            var yScale = maxV > 0 ? 80 / maxV : 0;
            points.forEach(function (p) { p.yPx = 90 - p.y * yScale; });
            var polyline = points.map(function (p) { return p.x + ',' + p.yPx; }).join(' ');
            var threshold = 5;
            return {
                points: points,
                polyline: polyline,
                maxVal: Math.round(maxV * 10) / 10,
                threshold: threshold,
                thresholdY: Math.max(0, Math.round((90 - threshold * yScale) * 10) / 10),
                thresholdVisible: threshold < maxV
            };
        },

        /* ── roiRanking: ROI ranking bars ── */
        roiRanking: function() {
            var EFFORT_W = { trivial: 10, low: 25, medium: 50, high: 80 };
            var levers = (this.levers || []).map(function (l) {
                var w = EFFORT_W[l.effort] != null ? EFFORT_W[l.effort] : 50;
                var roi = w > 0 ? (l.scoreUplift || 0) / w : 0;
                return {
                    rank: l.rank,
                    dimName: l.dimension,
                    action: l.action,
                    uplift: l.scoreUplift || 0,
                    effort: l.effort,
                    effortWeight: w,
                    roi: Math.round(roi * 100) / 100,
                    cls: l.rank === 1 ? 'grade-critical' : l.rank === 2 ? 'grade-warn' : 'grade-ok'
                };
            }).sort(function (a, b) { return b.roi - a.roi; }).slice(0, 5);
            var maxRoi = levers.reduce(function (m, l) { return Math.max(m, l.roi); }, 0.01);
            levers.forEach(function (l) {
                l.barWidth = Math.max(3, Math.round(l.roi / maxRoi * 100));
            });
            return { levers: levers, maxRoi: Math.round(maxRoi * 100) / 100 };
        },

        /* ── sCurve: cumulative S-curve ── */
        sCurve: function() {
            var rp = this.remediationPlan || {};
            var phases = rp.phases || [];
            if (!phases.length) return { points: [], polyline: '', totalUplift: 0 };
            var total = phases.reduce(function (s, p) { return s + (p.estUplift || 0); }, 0);
            if (total <= 0) return { points: [], polyline: '', totalUplift: 0 };
            var cum = 0;
            var pts = phases.map(function (p, i) {
                cum += p.estUplift || 0;
                return {
                    x: (i / (phases.length - 1 || 1)) * 100,
                    y: 100 - (cum / total) * 100,
                    phase: p.phase,
                    pct: Math.round(cum / total * 100)
                };
            });
            pts.unshift({ x: 0, y: 100, phase: 'start', pct: 0 });
            var polyline = pts.map(function (p) { return p.x + ',' + p.y; }).join(' ');
            return { points: pts, polyline: polyline, totalUplift: total };
        },

        /* ── scoreHistogram: score distribution histogram ── */
        scoreHistogram: function() {
            var vectors = this.riskVectors || [];
            var bands = [
                { label: 'A', min: 90, cls: 'grade-ok', count: 0 },
                { label: 'B', min: 75, cls: 'grade-ok', count: 0 },
                { label: 'C', min: 60, cls: 'grade-warn', count: 0 },
                { label: 'D', min: 40, cls: 'grade-warn', count: 0 },
                { label: 'F', min: 0,  cls: 'grade-critical', count: 0 }
            ];
            vectors.forEach(function (v) {
                var s = v.score || 0;
                for (var i = 0; i < bands.length; i++) {
                    if (s >= bands[i].min) { bands[i].count++; break; }
                }
            });
            var maxCount = 1;
            bands.forEach(function (b) { if (b.count > maxCount) maxCount = b.count; });
            bands.forEach(function (b) { b.heightPct = Math.round(b.count / maxCount * 100); });
            return { bands: bands, total: vectors.length, maxCount: maxCount };
        },

        /* ── decisionQuadrant: confidence vs risk quadrant ── */
        decisionQuadrant: function() {
            var conf = this.confidence || { pct: 0 };
            var d = this.donut || {};
            var segs = d.segments || [];
            var p0 = (segs[0] && segs[0].count) || 0;
            var p1 = (segs[1] && segs[1].count) || 0;
            var p2 = (segs[2] && segs[2].count) || 0;
            var risk = p0 * 3 + p1 * 1 + p2 * 0.3;
            var riskScale = 30;
            var riskPct = Math.min(100, Math.round(risk / riskScale * 100));
            var confPct = conf.pct || 0;
            var highConf = confPct >= 50;
            var lowRisk = riskPct < 50;
            var zone = highConf && lowRisk ? 'SHIP'
                : highConf && !lowRisk ? 'MONITOR'
                : !highConf && lowRisk ? 'CONDITIONAL'
                : 'BLOCK';
            return {
                confPct: confPct, riskPct: riskPct,
                x: confPct, y: 100 - riskPct,
                zone: zone, riskRaw: Math.round(risk * 10) / 10
            };
        },

        /* ── timeToTarget: time-to-target calculation ── */
        timeToTarget: function() {
            var rp = this.remediationPlan || {};
            var b = this.benchmarks || {};
            var current = rp.currentScore || 0;
            var projected = rp.projectedIfAllP0P1 || 0;
            var target = b.targetValue || 100;
            var phases = (rp.phases || []).length;
            var avgUplift = phases > 0 ? (projected - current) / phases : 0;
            var remaining = Math.max(0, target - projected);
            var extraPhases = avgUplift > 0 ? Math.ceil(remaining / avgUplift) : (remaining > 0 ? 99 : 0);
            var onTrack = projected >= target;
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

        /* ── capacityVsRisk: capacity vs risk bars ── */
        capacityVsRisk: function() {
            var rp = this.remediationPlan || {};
            var phases = rp.phases || [];
            var d = this.donut || {};
            var segs = d.segments || [];
            var p0 = (segs[0] && segs[0].count) || 0;
            var p1 = (segs[1] && segs[1].count) || 0;
            var p2 = (segs[2] && segs[2].count) || 0;
            var riskByPhase = [p0 * 3, p1 * 1, p2 * 0.3];
            if (!phases.length) return { rows: [], maxVal: 0 };
            var rows = phases.map(function (p, i) {
                var capacity = p.estUplift || 0;
                var riskRed = riskByPhase[i] || 0;
                return {
                    label: p.phase.split('—')[0].trim(),
                    capacity: capacity,
                    riskReduction: Math.round(riskRed * 10) / 10,
                    ratio: riskRed > 0 ? Math.round(capacity / riskRed * 100) / 100 : 0,
                    cls: i === 0 ? 'grade-critical' : i === 1 ? 'grade-warn' : 'grade-ok'
                };
            });
            var maxVal = rows.reduce(function (m, r) {
                return Math.max(m, r.capacity, r.riskReduction);
            }, 1);
            rows.forEach(function (r) {
                r.capPct = Math.round(r.capacity / maxVal * 100);
                r.riskPct = Math.round(r.riskReduction / maxVal * 100);
            });
            return { rows: rows, maxVal: maxVal };
        },

        /* ── dimGap: dimension gap to target ── */
        dimGap: function() {
            var vectors = this.riskVectors || [];
            if (!vectors.length) return { rows: [], maxGap: 0 };
            var rows = vectors.map(function (v) {
                var val = v.score || 0;
                var gap = Math.max(0, 100 - val);
                return {
                    name: v.dimension,
                    value: val,
                    gap: gap,
                    cls: gap >= 30 ? 'grade-critical' : gap >= 10 ? 'grade-warn' : 'grade-ok'
                };
            }).sort(function (a, b) { return b.gap - a.gap; });
            var maxGap = rows.reduce(function (m, r) { return Math.max(m, r.gap); }, 1);
            rows.forEach(function (r) { r.widthPct = Math.round(r.gap / maxGap * 100); });
            return { rows: rows, maxGap: maxGap };
        },

        /* ── concentrationGauge: HHI concentration gauge ── */
        concentrationGauge: function() {
            var vectors = this.riskVectors || [];
            var scores = vectors.map(function (v) {
                return { name: v.dimension, sev: v.sevScore || 0 };
            }).filter(function (s) { return s.sev > 0; });
            if (!scores.length) return { value: 0, cls: 'grade-ok', label: 'no risk', topDim: '—', topShare: 0, arc: 156.2 };
            var total = scores.reduce(function (s, x) { return s + x.sev; }, 0);
            if (total <= 0) return { value: 0, cls: 'grade-ok', label: 'no risk', topDim: '—', topShare: 0, arc: 156.2 };
            var hhi = scores.reduce(function (s, x) {
                var share = x.sev / total;
                return s + share * share;
            }, 0);
            var n = scores.length;
            var norm = n > 1 ? (hhi - 1 / n) / (1 - 1 / n) : 1;
            var value = Math.max(0, Math.min(100, Math.round(norm * 100)));
            var sorted = scores.slice().sort(function (a, b) { return b.sev - a.sev; });
            var top = sorted[0];
            var topShare = Math.round(top.sev / total * 100);
            var cls = value >= 60 ? 'grade-critical' : value >= 35 ? 'grade-warn' : 'grade-ok';
            var label = value >= 60 ? 'concentrated' : value >= 35 ? 'moderate' : 'dispersed';
            return { value: value, cls: cls, label: label, topDim: top.name, topShare: topShare, arc: 156.2 * (1 - value / 100) };
        },

        /* ── dimUplift: per-dim uplift potential ── */
        dimUplift: function() {
            var levers = this.levers || [];
            if (!levers.length) return { rows: [], maxUplift: 0 };
            var byDim = {};
            levers.forEach(function (l) {
                var key = l.dimension || l.action;
                if (!key) return;
                if (!byDim[key]) byDim[key] = { name: key, uplift: 0, count: 0 };
                byDim[key].uplift += (l.scoreUplift || 0);
                byDim[key].count += 1;
            });
            var rows = Object.keys(byDim).map(function (k) {
                var r = byDim[k];
                r.uplift = Math.round(r.uplift * 10) / 10;
                return r;
            }).sort(function (a, b) { return b.uplift - a.uplift; });
            var maxUplift = rows.reduce(function (m, r) { return Math.max(m, r.uplift); }, 1);
            rows.forEach(function (r) {
                r.widthPct = Math.round(r.uplift / maxUplift * 100);
                r.cls = r.uplift >= 15 ? 'grade-critical' : r.uplift >= 5 ? 'grade-warn' : 'grade-ok';
            });
            return { rows: rows, maxUplift: maxUplift };
        },

        /* ── trajectory: trajectory points with x,y coordinates ── */
        trajectory: function() {
            var rp = this.remediationPlan;
            var pts = [{ label: 'current', score: rp.currentScore, kind: 'now' }];
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

        /* ── sparkline: mini sparkline for stat banner ── */
        sparkline: function() {
            var pts = this.trajectory || [];
            if (!pts.length || pts.length < 2) return { points: '', trend: 'flat', delta: 0, arrow: '→', lastX: 0, lastY: 0 };
            var W = 40, H = 12, pad = 1;
            var ys = pts.map(function (p) { return p.y; });
            var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
            var range = Math.max(1, maxY - minY);
            var mapped = pts.map(function (p) {
                return (pad + p.x / 100 * (W - 2 * pad)).toFixed(1) + ',' +
                    (pad + (p.y - minY) / range * (H - 2 * pad)).toFixed(1);
            });
            var projected = pts[pts.length - 2] || pts[0];
            var current = pts[0];
            var delta = (projected.score || 0) - (current.score || 0);
            var trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
            var arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
            return {
                points: mapped.join(' '),
                trend: trend, delta: delta, arrow: arrow,
                lastX: (pad + (pts[pts.length - 1].x / 100) * (W - 2 * pad)).toFixed(1),
                lastY: (pad + ((pts[pts.length - 1].y - minY) / range) * (H - 2 * pad)).toFixed(1)
            };
        },

        /* ── benchmarks: current/target grade values ── */
        benchmarks: function() {
            var b = (this.si && this.si.benchmarks) || {};
            return {
                currentGrade: b.currentGrade || 'F',
                currentValue: b.currentValue || 0,
                targetGrade: b.targetGrade || 'A',
                targetValue: b.targetValue || 100,
                gapToNext: b.gapToNext || 0,
                gapPct: Math.max(2, Math.min(100, (b.gapToNext || 0) * 2))
            };
        },

        /* ── decayProjection: decay projection polyline ── */
        decayProjection: function() {
            var traj = this.trajectory || [];
            var decay = this.decayForecast || {};
            if (!traj.length || traj.length < 2) return { points: '', active: false };
            var current = decay.currentScore || (traj[0] ? traj[0].score : 0);
            var delta = decay.delta || 0;
            if (delta >= 0) return { points: '', active: false };
            var n = traj.length;
            var pts = [];
            for (var i = 0; i < n; i++) {
                var score = Math.max(0, Math.min(100, current + (delta * i)));
                pts.push({ x: (i / Math.max(1, n - 1)) * 100, y: 100 - score });
            }
            return {
                points: pts.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' '),
                active: true,
                finalScore: Math.max(0, Math.min(100, current + delta * (n - 1)))
            };
        }
    }
};
registerGlobalComponent(compDef);
export default compDef;
