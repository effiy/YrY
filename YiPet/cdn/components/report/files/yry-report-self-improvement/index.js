(function () {
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
    template: `
    <section id="self-improvement" class="self-improvement" aria-labelledby="si-heading">
        <h2 id="si-heading">{{ labels.selfImprovementLabel || 'Self-Improvement Analysis' }}</h2>
        <p class="chart-hint">{{ labels.selfImprovementHint || 'Chart-first diagnostics: severity mix, risk vectors, ranked levers, remediation roadmap, and decay forecast.' }}</p>

        <!-- Executive summary stat banner -->
        <div class="si-stat-banner" role="group" aria-label="Executive summary statistics">
            <div class="si-stat-tile" :class="benchmarks.currentValue >= 75 ? 'grade-ok' : benchmarks.currentValue >= 40 ? 'grade-warn' : 'grade-critical'" tabindex="0" role="status" :aria-label="'Current score: ' + benchmarks.currentValue">
                <span class="si-stat-value">{{ benchmarks.currentValue }}</span>
                <span class="si-stat-label">{{ labels.siStatScore || 'score' }}</span>
                <svg class="si-stat-spark" viewBox="0 0 40 12" preserveAspectRatio="none" v-if="sparkline.points">
                    <polyline :points="sparkline.points" fill="none"
                        :stroke="sparkline.trend === 'up' ? 'var(--yry-ok, #22c55e)' : sparkline.trend === 'down' ? 'var(--yry-critical, #ef4444)' : 'var(--yry-fg-subtle, #4a5062)'"
                        stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"/>
                    <circle :cx="sparkline.lastX" :cy="sparkline.lastY" r="1"
                        :fill="sparkline.trend === 'up' ? 'var(--yry-ok, #22c55e)' : sparkline.trend === 'down' ? 'var(--yry-critical, #ef4444)' : 'var(--yry-fg-subtle, #4a5062)'"/>
                </svg>
                <span class="si-stat-momentum" :class="'mom-' + sparkline.trend">{{ sparkline.arrow }} {{ sparkline.delta > 0 ? '+' : '' }}{{ sparkline.delta }}</span>
            </div>
            <div class="si-stat-tile" :class="{ 'grade-critical': p0Count > 0, 'grade-ok': p0Count === 0 }">
                <span class="si-stat-value">{{ p0Count }}</span>
                <span class="si-stat-label">{{ labels.siStatP0Alerts || 'P0 alerts' }}</span>
            </div>
            <div class="si-stat-tile">
                <span class="si-stat-value">{{ benchmarks.gapToNext }}</span>
                <span class="si-stat-label">{{ labels.siStatGapToNext || 'pts to' }} {{ benchmarks.targetGrade }}</span>
            </div>
            <div class="si-stat-tile tone-accent" v-if="levers.length">
                <span class="si-stat-value">+{{ levers[0].scoreUplift }}</span>
                <span class="si-stat-label">{{ labels.siStatTopLever || 'top lever' }}</span>
            </div>
            <div class="si-stat-tile" :class="{ 'grade-critical': decayForecast.isDecaying, 'grade-ok': !decayForecast.isDecaying }">
                <span class="si-stat-value">{{ decayForecast.isDecaying ? '↘' : '→' }} {{ decayForecast.delta }}</span>
                <span class="si-stat-label">{{ labels.siStatDecay || 'decay' }}</span>
            </div>
        </div>

        <!-- Narrative summary -->
        <div class="si-narrative" v-if="narrative.length" aria-live="polite">
            <p v-for="(p, i) in narrative" :key="i" class="si-narrative-para">{{ p }}</p>
        </div>

        <!-- Chart row: severity donut | risk vectors bar | benchmarks gap -->
        <div class="si-chart-row">
            <div class="si-card si-donut">
                <h3>{{ labels.siSeverityDonutLabel || 'Severity Mix' }}</h3>
                <div class="si-donut-wrap" v-if="!donut.empty">
                    <svg class="si-donut-svg" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--yry-surface-2, #1f2937)" stroke-width="10"/>
                        <circle v-for="(s, i) in donut.segments" :key="i"
                            cx="50" cy="50" r="40" fill="none"
                            :stroke="s.color" stroke-width="10"
                            :stroke-dasharray="s.dasharray"
                            :stroke-dashoffset="s.dashoffset"
                            :transform="'rotate(' + s.rotate + ' 50 50)'"/>
                    </svg>
                    <div class="si-donut-center">
                        <span class="si-donut-total">{{ donut.total }}</span>
                        <span class="si-donut-label">findings</span>
                    </div>
                </div>
                <div class="si-donut-legend" v-if="!donut.empty">
                    <span v-for="(s, i) in donut.segments" :key="i" class="si-legend-item">
                        <span class="si-legend-dot" :style="{ background: s.color }"></span>
                        <span class="si-legend-sev">{{ s.sev }}</span>
                        <span class="si-legend-count">{{ s.count }}</span>
                        <span class="si-legend-frac">{{ donut.total === 0 ? '0%' : (s.frac * 100).toFixed(0) + '%' }}</span>
                    </span>
                </div>
                <p v-else class="empty">{{ labels.siNoP0 || 'No P0 alerts — nothing critical to remediate.' }}</p>
            </div>

            <div class="si-card si-risk-vectors">
                <h3>{{ labels.siRiskVectorsLabel || 'Risk Vectors' }}</h3>
                <div class="si-radar" v-if="radar.axes.length >= 3">
                    <svg class="si-radar-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                        <polygon v-for="(ring, i) in radar.rings" :key="'r'+i" :points="ring"
                            fill="none" stroke="var(--yry-fg-subtle, #4a5062)" stroke-width="0.25" opacity="0.35"/>
                        <text v-for="(b, i) in radar.bands" :key="'b'+i"
                            x="51" :y="b.y" class="si-radar-band" text-anchor="start" dominant-baseline="middle">{{ b.label }}</text>
                        <line v-for="(a, i) in radar.axes" :key="'a'+i"
                            x1="50" y1="50" :x2="radar.points[i] ? radar.points[i].x : 50" :y2="radar.points[i] ? radar.points[i].y : 50"
                            stroke="var(--yry-fg-subtle, #4a5062)" stroke-width="0.25" opacity="0.3"/>
                        <polygon :points="radar.polygon"
                            fill="var(--yry-accent, #22C55E)" fill-opacity="0.18"
                            stroke="var(--yry-accent, #22C55E)" stroke-width="0.7" stroke-linejoin="round"/>
                        <circle v-for="(p, i) in radar.points" :key="'p'+i"
                            :cx="p.x" :cy="p.y" r="1.1" :class="p.scoreCls" class="si-radar-pt">
                            <title>{{ p.label }}: {{ p.score }}/100</title>
                        </circle>
                        <text v-for="(a, i) in radar.axes" :key="'l'+i"
                            :x="a.x" :y="a.y" class="si-radar-label" text-anchor="middle" dominant-baseline="middle">{{ a.label }} {{ a.score }}</text>
                    </svg>
                </div>
                <ul class="si-rv-list" v-if="riskVectors.length">
                    <li v-for="(r, i) in riskVectors" :key="i" class="si-rv-row">
                        <span class="si-rv-name">{{ r.dimension }}</span>
                        <div class="si-rv-bar-track">
                            <div class="si-rv-bar">
                                <div class="si-rv-bar-fill" :class="r.scoreCls" :style="{ width: r.scoreWidth + '%' }"></div>
                            </div>
                            <div class="si-rv-sev-strip" v-if="r.p0 + r.p1 + r.p2 > 0">
                                <span class="si-rv-seg si-rv-seg-p0" :style="{ width: (r.p0 / (r.p0 + r.p1 + r.p2) * 100) + '%' }"></span>
                                <span class="si-rv-seg si-rv-seg-p1" :style="{ width: (r.p1 / (r.p0 + r.p1 + r.p2) * 100) + '%' }"></span>
                                <span class="si-rv-seg si-rv-seg-p2" :style="{ width: (r.p2 / (r.p0 + r.p1 + r.p2) * 100) + '%' }"></span>
                            </div>
                        </div>
                        <span class="si-rv-score" :class="r.scoreCls">{{ r.score }}</span>
                    </li>
                </ul>
                <p v-else class="empty">No risk vectors.</p>
                <div class="si-pareto" v-if="pareto.bars.length >= 2">
                    <h4 class="si-pareto-title">{{ labels.siParetoTitle || 'Risk concentration · Pareto' }}</h4>
                    <svg class="si-pareto-svg" viewBox="0 0 100 42" preserveAspectRatio="none">
                        <line :x1="0" :y1="pareto.pct80y" :x2="100" :y2="pareto.pct80y"
                            stroke="var(--yry-warn, #f59e0b)" stroke-width="0.25" stroke-dasharray="1.5,1.5" opacity="0.6"/>
                        <text x="1" :y="pareto.pct80y - 0.8" class="si-pareto-80">80%</text>
                        <rect v-for="(b, i) in pareto.bars" :key="'pb'+i"
                            :x="b.x + b.width * 0.09" :y="b.y" :width="b.width" :height="b.height"
                            class="si-pareto-bar" :class="b.scoreCls">
                            <title>{{ b.label }}: severity score {{ b.score }}</title>
                        </rect>
                        <polyline :points="pareto.line" fill="none"
                            stroke="var(--yry-accent, #22C55E)" stroke-width="0.6" stroke-linejoin="round"/>
                        <circle v-for="(m, i) in pareto.marks" :key="'pm'+i"
                            :cx="m.x" :cy="m.y" r="0.7" class="si-pareto-mark"/>
                    </svg>
                    <div class="si-pareto-labels">
                        <span v-for="(b, i) in pareto.bars" :key="'pl'+i" class="si-pareto-label" :class="b.scoreCls">{{ b.label }}</span>
                    </div>
                </div>
            </div>

            <div class="si-card si-benchmarks">
                <h3>{{ labels.siBenchmarksLabel || 'Target Band' }}</h3>
                <div class="si-bench-body" v-if="benchmarks.currentValue != null">
                    <p class="si-bench-head">
                        <span class="si-bench-current" :class="benchmarks.currentValue >= 75 ? 'grade-ok' : benchmarks.currentValue >= 40 ? 'grade-warn' : 'grade-critical'">{{ benchmarks.currentValue }}/100</span>
                        <span class="si-bench-arrow">→</span>
                        <span class="si-bench-target">{{ benchmarks.targetGrade }} ({{ benchmarks.targetValue }})</span>
                    </p>
                    <div class="si-bench-bands">
                        <div class="si-bench-band si-bench-band-f"><span>F</span></div>
                        <div class="si-bench-band si-bench-band-d"><span>D</span></div>
                        <div class="si-bench-band si-bench-band-c"><span>C</span></div>
                        <div class="si-bench-band si-bench-band-b"><span>B</span></div>
                        <div class="si-bench-band si-bench-band-a"><span>A</span></div>
                        <span class="si-bench-marker" :class="benchmarks.currentValue >= 75 ? 'grade-ok' : benchmarks.currentValue >= 40 ? 'grade-warn' : 'grade-critical'" :style="{ left: benchmarks.currentValue + '%' }" :title="'Current: ' + benchmarks.currentValue"></span>
                    </div>
                    <div class="si-bench-scale"><span>0</span><span>40</span><span>60</span><span>75</span><span>90</span><span>100</span></div>
                    <p class="si-bench-gap-text">{{ labels.siGapLabel || 'Gap to next band' }}: {{ benchmarks.gapToNext }} pts → {{ benchmarks.targetGrade }}</p>
                </div>
            </div>
        </div>

        <!-- Levers row -->
        <div class="si-card si-levers" v-if="levers.length">
            <h3>{{ labels.siLeversLabel || 'Top Remediation Levers' }}</h3>
            <div class="si-levers-body">
                <div class="si-quadrant" v-if="leversQuadrant.length">
                    <svg class="si-quadrant-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <line x1="50" y1="0" x2="50" y2="100" stroke="var(--yry-border-color, #4a5062)" stroke-width="0.5" stroke-dasharray="2,2"/>
                        <line x1="0" y1="50" x2="100" y2="50" stroke="var(--yry-border-color, #4a5062)" stroke-width="0.5" stroke-dasharray="2,2"/>
                        <circle v-for="(p, i) in leversQuadrant" :key="i"
                            :cx="p.cx" :cy="p.cy" :r="p.r"
                            :class="'si-quad-pt--' + (p.severity || 'p2').toLowerCase()"
                            class="si-quad-pt">
                            <title>#{{ p.rank }}: +{{ p.uplift }} pts · {{ p.effort }} effort</title>
                        </circle>
                        <text v-for="(p, i) in leversQuadrant" :key="'t'+i"
                            :x="p.cx" :y="p.cy - p.r - 1"
                            class="si-quad-label" text-anchor="middle">#{{ p.rank }}</text>
                    </svg>
                    <div class="si-quad-axis-x"><span>{{ labels.siLowEffortLabel || 'low effort' }}</span><span>{{ labels.siHighEffortLabel || 'high effort' }}</span></div>
                    <div class="si-quad-quad-labels">
                        <span class="si-quad-q si-quad-q--tl">{{ labels.siQuickWinsLabel || 'Quick wins' }}</span>
                        <span class="si-quad-q si-quad-q--tr">{{ labels.siStrategicBetsLabel || 'Strategic bets' }}</span>
                        <span class="si-quad-q si-quad-q--bl">{{ labels.siFillInsLabel || 'Fill-ins' }}</span>
                        <span class="si-quad-q si-quad-q--br">{{ labels.siThanklessLabel || 'Thankless' }}</span>
                    </div>
                </div>
                <div class="si-heatmap" v-if="heatmap.rows.length">
                    <div class="si-heatmap-row si-heatmap-head">
                        <span class="si-heatmap-cell si-heatmap-label"></span>
                        <span class="si-heatmap-cell si-heatmap-col">P0</span>
                        <span class="si-heatmap-cell si-heatmap-col">P1</span>
                        <span class="si-heatmap-cell si-heatmap-col">P2</span>
                    </div>
                    <div v-for="(row, i) in heatmap.rows" :key="'hm'+i" class="si-heatmap-row">
                        <span class="si-heatmap-cell si-heatmap-label">{{ row.dimName }}</span>
                        <span v-for="(c, j) in row.cells" :key="j"
                            class="si-heatmap-cell si-heatmap-heat" :class="c.cls"
                            :style="{ opacity: c.intensity }">
                            {{ c.count || '' }}
                            <title>{{ row.dimName }} · {{ c.k.toUpperCase() }}: {{ c.count }} finding{{ c.count === 1 ? '' : 's' }}</title>
                        </span>
                    </div>
                </div>
                <div class="si-levers-grid">
                    <div v-for="(l, i) in levers" :key="i" class="si-lever-card">
                        <div class="si-lever-rank">#{{ l.rank }}</div>
                        <div class="si-lever-body">
                            <p class="si-lever-head">
                                <code>{{ l.dimension }}</code>
                                <span class="sev-tag" :class="'sev-' + (l.severity || 'p2').toLowerCase()">{{ l.severity }}</span>
                                <span class="si-lever-uplift">+{{ l.scoreUplift }} pts</span>
                            </p>
                            <p class="si-lever-action">{{ l.action }}</p>
                            <p class="si-lever-meta">
                                <span class="si-lever-effort" :class="'effort-' + l.effort">{{ l.effort }}</span>
                                <code v-if="l.file" class="si-lever-file">{{ l.file }}<span v-if="l.line != null">:{{ l.line }}</span></code>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Remediation roadmap -->
        <div class="si-card si-roadmap" v-if="remediationPlan.phases.length">
            <h3>{{ labels.siRoadmapLabel || 'Remediation Roadmap' }}</h3>
            <div class="si-roadmap-body">
                <div class="si-roadmap-gauge">
                    <span class="si-roadmap-now">{{ remediationPlan.currentScore }}</span>
                    <span class="si-roadmap-arrow">→</span>
                    <span class="si-roadmap-projected">{{ remediationPlan.projectedIfAllP0P1 }}</span>
                    <span class="si-roadmap-label">{{ labels.siProjectedLabel || 'projected if P0+P1 remediated' }}</span>
                </div>
                <div class="si-confidence-ring" :class="confidence.cls">
                    <svg viewBox="0 0 36 36" class="si-confidence-svg">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--yry-fg-subtle, #4a5062)" stroke-width="3" opacity="0.25"/>
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" stroke-width="3"
                            :stroke-dasharray="(confidence.pct * 0.975) + ' 100'" stroke-linecap="round"
                            transform="rotate(-90 18 18)"/>
                        <text x="18" y="20.5" text-anchor="middle" class="si-confidence-pct">{{ confidence.pct }}%</text>
                    </svg>
                    <span class="si-confidence-label">{{ confidence.label }}</span>
                </div>
                <div class="si-gap-decomp" v-if="gapDecomp.gap > 0">
                    <div class="si-gap-decomp-bar">
                        <div class="si-gap-decomp-current" :style="{ width: (gapDecomp.current * 100 / gapDecomp.target) + '%' }"></div>
                        <div v-for="(s, i) in gapDecomp.segments" :key="i"
                            class="si-gap-decomp-seg" :class="s.cls"
                            :style="{ left: s.x + '%', width: s.width + '%' }">
                            <title>{{ s.dimName }}: +{{ s.uplift }} pts ({{ s.pctOfGap }}% of gap)</title>
                        </div>
                        <div class="si-gap-decomp-residual" v-if="gapDecomp.residual > 0"
                            :style="{ left: gapDecomp.residualX + '%', width: gapDecomp.residualWidth + '%' }">
                            <title>Residual gap: {{ gapDecomp.residual }} pts</title>
                        </div>
                        <div class="si-gap-decomp-target"></div>
                    </div>
                    <div class="si-gap-decomp-legend">
                        <span class="si-gap-decomp-key si-gap-decomp-current-key">current {{ gapDecomp.current }}</span>
                        <span v-for="(s, i) in gapDecomp.segments" :key="i" class="si-gap-decomp-key" :class="s.cls">{{ s.dimName }} +{{ s.uplift }}</span>
                        <span class="si-gap-decomp-key si-gap-decomp-residual-key" v-if="gapDecomp.residual > 0">residual {{ gapDecomp.residual }}</span>
                        <span class="si-gap-decomp-key si-gap-decomp-target-key">target {{ gapDecomp.target }}</span>
                    </div>
                </div>
                <div class="si-sensitivity" v-if="sensitivity.levers.length">
                    <h4 class="si-sensitivity-title">{{ labels.siSensitivityTitle || 'Sensitivity tornado · uplift uncertainty per top lever' }}</h4>
                    <div class="si-sensitivity-rows">
                        <div v-for="(l, i) in sensitivity.levers" :key="'sens'+i" class="si-sensitivity-row">
                            <span class="si-sensitivity-label">{{ l.rank }}. {{ l.dimName }}</span>
                            <svg class="si-sensitivity-bar" viewBox="0 0 100 8" preserveAspectRatio="none">
                                <rect :x="l.pessX" y="1.5" :width="l.barWidth" height="5"
                                    :class="'sens-bar ' + l.cls" rx="1"/>
                                <title>{{ l.dimName }} — pessimistic {{ l.pessimistic }} · expected {{ l.expected }} · optimistic {{ l.optimistic }} pts (range {{ l.rangeWidth }})</title>
                                <line :x1="l.expX" y1="0.5" :x2="l.expX" y2="7.5" stroke="var(--yry-fg, #e6e8eb)" stroke-width="0.4"/>
                            </svg>
                            <span class="si-sensitivity-range">{{ l.pessimistic }}–{{ l.optimistic }}</span>
                        </div>
                    </div>
                </div>
                <div class="si-roadmap-phases">
                    <div v-for="(p, i) in remediationPlan.phases" :key="i" class="si-phase" :class="'phase-' + p.severity">
                        <div class="si-phase-head">
                            <span class="si-phase-name">{{ p.phase }}</span>
                            <span class="si-phase-count">{{ p.itemCount }} items</span>
                        </div>
                        <div class="si-phase-bar">
                            <div class="si-phase-bar-fill" :style="{ width: p.projectedWidth + '%' }"></div>
                        </div>
                        <p class="si-phase-meta">
                            <span class="si-phase-uplift">+{{ p.estUplift }} pts → {{ p.projected }}</span>
                            <span class="si-phase-deadline">{{ p.deadline }}</span>
                        </p>
                    </div>
                </div>
            </div>
            <div class="si-timeline" v-if="timeline.segments.length">
                <h4 class="si-timeline-title">{{ labels.siTimelineTitle || 'Initiative timeline · Gantt' }}</h4>
                <div class="si-timeline-track">
                    <div v-for="(s, i) in timeline.segments" :key="'tl'+i"
                        class="si-timeline-seg" :class="s.cls"
                        :style="{ left: s.x + '%', width: s.width + '%' }">
                        <span class="si-timeline-seg-label">{{ s.label }}</span>
                        <span class="si-timeline-seg-count" v-if="s.itemCount">{{ s.itemCount }}</span>
                    </div>
                </div>
                <div class="si-timeline-markers">
                    <span v-for="(m, i) in timeline.markers" :key="'tm'+i"
                        class="si-timeline-marker" :style="{ left: m.x + '%' }">{{ m.label }}</span>
                </div>
            </div>
            <div class="si-effort-donut" v-if="effortDonut.slices.length">
                <h4 class="si-effort-donut-title">{{ labels.siEffortDonutTitle || 'Effort allocation · projected uplift share per phase' }}</h4>
                <div class="si-effort-donut-body">
                    <svg class="si-effort-donut-svg" viewBox="0 0 42 42">
                        <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--yry-bg-elevated, rgba(255,255,255,0.05))" stroke-width="6"/>
                        <circle v-for="(s, i) in effortDonut.slices" :key="'ed'+i"
                            cx="21" cy="21" r="15.915" fill="none"
                            :stroke="'var(--yry-' + (s.cls === 'grade-critical' ? 'critical' : s.cls === 'grade-warn' ? 'warn' : 'ok') + ', #888)'"
                            stroke-width="6"
                            :stroke-dasharray="s.dashArray"
                            :stroke-dashoffset="(100 - s.dashOffset)"
                            transform="rotate(-90 21 21)">
                            <title>{{ s.label }} — +{{ s.value }} pts ({{ s.pct }}% of projected uplift)</title>
                        </circle>
                        <text x="21" y="20" text-anchor="middle" class="si-effort-donut-total">+{{ effortDonut.totalUplift }}</text>
                        <text x="21" y="25" text-anchor="middle" class="si-effort-donut-unit">pts</text>
                    </svg>
                    <div class="si-effort-donut-legend">
                        <span v-for="(s, i) in effortDonut.slices" :key="'edk'+i" class="si-effort-donut-key" :class="s.cls">{{ s.label }} +{{ s.value }} ({{ s.pct }}%)</span>
                    </div>
                </div>
            </div>
            <div class="si-risk-decay" v-if="riskDecay.maxVal > 0">
                <h4 class="si-risk-decay-title">{{ labels.siRiskDecayTitle || 'Risk exposure decay · sevScore across remediation phases' }}</h4>
                <svg class="si-risk-decay-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line v-if="riskDecay.thresholdVisible" x1="0" :y1="riskDecay.thresholdY" x2="100" :y2="riskDecay.thresholdY"
                        stroke="var(--yry-warn, #f59e0b)" stroke-width="0.3" stroke-dasharray="2,2" opacity="0.5"/>
                    <polyline :points="riskDecay.polyline" fill="none" stroke="var(--yry-critical, #ef4444)" stroke-width="0.6" stroke-linejoin="round"/>
                    <circle v-for="(p, i) in riskDecay.points" :key="'rd'+i"
                        :cx="p.x" :cy="p.yPx" r="1.2" fill="var(--yry-critical, #ef4444)">
                        <title>{{ p.label }} — {{ p.val }} sevScore</title>
                    </circle>
                </svg>
                <div class="si-risk-decay-labels">
                    <span v-for="(p, i) in riskDecay.points" :key="'rdl'+i">{{ p.label }}: {{ p.val }}</span>
                </div>
            </div>
            <div class="si-roi-ranking" v-if="roiRanking.levers.length">
                <h4 class="si-roi-ranking-title">{{ labels.siROIRankingTitle || 'ROI ranking · uplift per unit effort (bang-for-buck)' }}</h4>
                <div class="si-roi-ranking-rows">
                    <div v-for="(l, i) in roiRanking.levers" :key="'roi'+i" class="si-roi-ranking-row">
                        <span class="si-roi-ranking-label">{{ l.dimName }}</span>
                        <div class="si-roi-ranking-bar-track">
                            <div class="si-roi-ranking-bar-fill" :class="l.cls" :style="{ width: l.barWidth + '%' }">
                                <title>{{ l.dimName }} — ROI {{ l.roi }} (uplift {{ l.uplift }} / effort {{ l.effort }}={{ l.effortWeight }})</title>
                            </div>
                        </div>
                        <span class="si-roi-ranking-val">{{ l.roi }}</span>
                    </div>
                </div>
            </div>
            <div class="si-scurve" v-if="sCurve.points.length">
                <h4 class="si-scurve-title">{{ labels.siSCurveTitle || 'Cumulative completion · remediation S-curve' }}</h4>
                <svg class="si-scurve-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="0" y1="0" x2="100" y2="0" stroke="var(--yry-fg-subtle, #4a5062)" stroke-width="0.2" stroke-dasharray="1,3" opacity="0.4"/>
                    <polyline :points="sCurve.polyline" fill="none" stroke="var(--yry-accent, #22C55E)" stroke-width="0.8" stroke-linejoin="round"/>
                    <circle v-for="(p, i) in sCurve.points" :key="'sc'+i"
                        :cx="p.x" :cy="p.y" r="1.5" fill="var(--yry-accent, #22C55E)">
                        <title>{{ p.phase }} — {{ p.pct }}% cumulative</title>
                    </circle>
                </svg>
                <div class="si-scurve-labels">
                    <span v-for="(p, i) in sCurve.points" :key="'scl'+i">{{ p.pct }}%</span>
                </div>
            </div>
            <div class="si-score-histogram" v-if="scoreHistogram.total > 0">
                <h4 class="si-score-histogram-title">{{ labels.siScoreHistogramTitle || 'Score distribution · dims per grade band' }} ({{ scoreHistogram.total }} dims)</h4>
                <div class="si-score-histogram-bars">
                    <div v-for="(b, i) in scoreHistogram.bands" :key="'sh'+i" class="si-score-histogram-col">
                        <div class="si-score-histogram-bar" :class="b.cls" :style="{ height: b.heightPct + '%' }">
                            <title>{{ b.label }} grade ({{ b.min }}+) — {{ b.count }} dim(s)</title>
                        </div>
                        <span class="si-score-histogram-count">{{ b.count }}</span>
                        <span class="si-score-histogram-label">{{ b.label }}</span>
                    </div>
                </div>
            </div>
            <div class="si-decision-quadrant">
                <h4 class="si-decision-quadrant-title">{{ labels.siDecisionQuadrantTitle || 'Decision quadrant · confidence vs risk exposure' }} → <span :class="decisionQuadrant.zone.toLowerCase() + '-zone'">{{ decisionQuadrant.zone }}</span></h4>
                <div class="si-decision-quadrant-grid">
                    <div class="si-dq-cell dq-block">BLOCK</div>
                    <div class="si-dq-cell dq-monitor">MONITOR</div>
                    <div class="si-dq-cell dq-conditional">CONDITIONAL</div>
                    <div class="si-dq-cell dq-ship">SHIP</div>
                    <div class="si-dq-marker" :style="{ left: decisionQuadrant.x + '%', bottom: decisionQuadrant.y + '%' }"
                        :title="'confidence ' + decisionQuadrant.confPct + '%, risk ' + decisionQuadrant.riskRaw + ' sevScore → ' + decisionQuadrant.zone"></div>
                </div>
                <div class="si-decision-quadrant-axes">
                    <span class="si-dq-x-label">confidence →</span>
                    <span class="si-dq-y-label">↑ risk</span>
                </div>
            </div>
            <div class="si-time-to-target">
                <h4 class="si-time-to-target-title">{{ labels.siTimeToTargetTitle || 'Time-to-target · ETA at current trajectory slope' }}</h4>
                <div class="si-time-to-target-bar">
                    <div class="si-time-to-target-current" :style="{ width: timeToTarget.currentPct + '%' }"></div>
                    <div class="si-time-to-target-projected" :style="{ width: timeToTarget.projectedPct + '%' }" :title="'projected ' + timeToTarget.projected + '/' + timeToTarget.target"></div>
                </div>
                <p class="si-time-to-target-verdict">
                    <span class="si-time-to-target-eta" :class="timeToTarget.onTrack ? 'grade-ok' : 'grade-warn'">{{ timeToTarget.onTrack ? (labels.siOnTrackLabel || 'ON TRACK') : '+' + timeToTarget.extraPhases + ' phase(s)' }}</span>
                    · avg +{{ timeToTarget.avgUplift }}/phase · current {{ timeToTarget.current }} → projected {{ timeToTarget.projected }}/{{ timeToTarget.target }}
                </p>
            </div>
            <div class="si-capacity-vs-risk" v-if="capacityVsRisk.rows.length">
                <h4 class="si-capacity-vs-risk-title">{{ labels.siCapacityVsRiskTitle || 'Capacity vs risk · per-phase effort alignment' }}</h4>
                <div class="si-capacity-vs-risk-rows">
                    <div v-for="(r, i) in capacityVsRisk.rows" :key="'cvr'+i" class="si-capacity-vs-risk-row">
                        <span class="si-capacity-vs-risk-label">{{ r.label }}</span>
                        <div class="si-capacity-vs-risk-bars">
                            <div class="si-cvr-bar si-cvr-capacity" :style="{ width: r.capPct + '%' }" :title="'capacity: ' + r.capacity + ' pts uplift'"></div>
                            <div class="si-cvr-bar si-cvr-risk" :style="{ width: r.riskPct + '%' }" :title="'risk reduction: ' + r.riskReduction + ' sevScore'"></div>
                        </div>
                        <span class="si-capacity-vs-risk-ratio" :class="r.cls">{{ r.ratio }}×</span>
                    </div>
                </div>
                <div class="si-capacity-vs-risk-legend">
                    <span class="si-cvr-key si-cvr-capacity-key">capacity (estUplift)</span>
                    <span class="si-cvr-key si-cvr-risk-key">risk reduction (sevScore)</span>
                </div>
            </div>
            <div class="si-dim-gap" v-if="dimGap.rows.length">
                <h4 class="si-dim-gap-title">{{ labels.siDimGapTitle || 'Dimension gap to target · shortfalls ranked' }}</h4>
                <div class="si-dim-gap-rows">
                    <div v-for="(r, i) in dimGap.rows" :key="'dg'+i" class="si-dim-gap-row">
                        <span class="si-dim-gap-label">{{ r.name }}</span>
                        <div class="si-dim-gap-track">
                            <div class="si-dim-gap-bar" :class="r.cls" :style="{ width: r.widthPct + '%' }">
                                <title>{{ r.name }}: {{ r.value }}/100 (gap −{{ r.gap }})</title>
                            </div>
                        </div>
                        <span class="si-dim-gap-val" :class="r.cls">−{{ r.gap }}</span>
                    </div>
                </div>
            </div>
            <div class="si-concentration" v-if="concentrationGauge">
                <h4 class="si-concentration-title">{{ labels.siConcentrationTitle || 'Risk concentration · HHI' }}</h4>
                <div class="si-concentration-wrap">
                    <svg class="si-concentration-svg" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r="25" fill="none" stroke="var(--yry-bg-elevated, rgba(255,255,255,0.05))" stroke-width="6"/>
                        <circle cx="30" cy="30" r="25" fill="none"
                            stroke="currentColor"
                            :class="'si-concentration-arc ' + concentrationGauge.cls"
                            stroke-width="6" stroke-linecap="round"
                            :stroke-dasharray="156.2"
                            :stroke-dashoffset="concentrationGauge.arc"
                            transform="rotate(-90 30 30)">
                            <title>Risk concentration {{ concentrationGauge.value }}/100 — {{ concentrationGauge.label }}; top dim {{ concentrationGauge.topDim }} = {{ concentrationGauge.topShare }}%</title>
                        </circle>
                        <text x="30" y="29" text-anchor="middle" class="si-concentration-num" :class="concentrationGauge.cls">{{ concentrationGauge.value }}</text>
                        <text x="30" y="38" text-anchor="middle" class="si-concentration-sub">{{ concentrationGauge.label }}</text>
                    </svg>
                    <div class="si-concentration-note">
                        <span class="si-concentration-top">{{ concentrationGauge.topDim }} <em>{{ concentrationGauge.topShare }}%</em></span>
                        <span class="si-concentration-hint">{{ labels.siConcentrationHint || 'share of risk in top dim' }}</span>
                    </div>
                </div>
            </div>
            <div class="si-dim-uplift" v-if="dimUplift.rows.length">
                <h4 class="si-dim-uplift-title">{{ labels.siDimUpliftTitle || 'Per-dim uplift potential · levers summed by dim' }}</h4>
                <div class="si-dim-uplift-rows">
                    <div v-for="(r, i) in dimUplift.rows" :key="'du'+i" class="si-dim-uplift-row">
                        <span class="si-dim-uplift-label">{{ r.name }}</span>
                        <div class="si-dim-uplift-track">
                            <div class="si-dim-uplift-bar" :class="r.cls" :style="{ width: r.widthPct + '%' }">
                                <title>{{ r.name }}: +{{ r.uplift }} pts from {{ r.count }} lever(s)</title>
                            </div>
                        </div>
                        <span class="si-dim-uplift-val" :class="r.cls">+{{ r.uplift }}</span>
                    </div>
                </div>
            </div>
            <div class="si-trajectory" v-if="trajectory.length >= 2">
                <svg class="si-trajectory-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline :points="trajectory.map(function(p){ return p.x + ',' + p.y; }).join(' ')"
                        fill="none" stroke="var(--yry-accent, #22C55E)" stroke-width="1.5" stroke-linejoin="round"/>
                    <polyline v-if="decayProjection.active" :points="decayProjection.points"
                        fill="none" stroke="var(--yry-critical, #ef4444)" stroke-width="1" stroke-dasharray="2,2" opacity="0.7">
                        <title>No-action decay projection: score → {{ decayProjection.finalScore }}/100</title>
                    </polyline>
                    <line x1="0" y1="0" x2="100" y2="0" stroke="var(--yry-border-color, #4a5062)" stroke-width="0.3" stroke-dasharray="2,2" opacity="0.4"/>
                    <line x1="0" y1="10" x2="100" y2="10" stroke="var(--yry-ok, #22c55e)" stroke-width="0.2" stroke-dasharray="1,3" opacity="0.35"/>
                    <line x1="0" y1="25" x2="100" y2="25" stroke="var(--yry-warn, #f59e0b)" stroke-width="0.2" stroke-dasharray="1,3" opacity="0.35"/>
                    <line x1="0" y1="40" x2="100" y2="40" stroke="var(--yry-warn, #f59e0b)" stroke-width="0.2" stroke-dasharray="1,3" opacity="0.3"/>
                    <line x1="0" y1="60" x2="100" y2="60" stroke="var(--yry-critical, #ef4444)" stroke-width="0.2" stroke-dasharray="1,3" opacity="0.3"/>
                    <text x="99" y="9.5" text-anchor="end" class="si-traj-band">A 90</text>
                    <text x="99" y="24.5" text-anchor="end" class="si-traj-band">B 75</text>
                    <text x="99" y="39.5" text-anchor="end" class="si-traj-band">C 60</text>
                    <text x="99" y="59.5" text-anchor="end" class="si-traj-band">D 40</text>
                    <circle v-for="(p, i) in trajectory" :key="i"
                        :cx="p.x" :cy="p.y" r="1.8"
                        :class="'si-traj-pt--' + p.kind" class="si-traj-pt">
                        <title>{{ p.label }}: {{ p.score }}/100{{ p.uplift ? ' (+' + p.uplift + ')' : '' }}</title>
                    </circle>
                </svg>
                <div class="si-trajectory-labels">
                    <span v-for="(p, i) in trajectory" :key="i" class="si-traj-label" :class="'si-traj-label--' + p.kind">
                        <span class="si-traj-lbl-name">{{ p.label }}</span>
                        <span class="si-traj-lbl-score">{{ p.score }}</span>
                    </span>
                </div>
            </div>
        </div>

        <!-- Decay forecast -->
        <div class="si-card si-decay" v-if="decayForecast.rationale">
            <h3>{{ labels.siDecayLabel || 'Decay Forecast' }}</h3>
            <div class="si-decay-body">
                <div class="si-decay-spark">
                    <svg class="si-decay-spark-svg" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <line x1="0" y1="20" x2="100" y2="20" stroke="var(--yry-border-color, #4a5062)" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.3"/>
                        <polyline :points="'0,' + (40 - Math.max(0, Math.min(40, decayForecast.currentScore * 0.4))) + ' 50,' + (40 - Math.max(0, Math.min(40, decayForecast.projectedNext * 0.4))) + ' 100,' + (40 - Math.max(0, Math.min(40, (decayForecast.projectedNext - Math.abs(decayForecast.delta)) * 0.4)))"
                            fill="none" :stroke="decayForecast.isDecaying ? 'var(--yry-critical, #ef4444)' : 'var(--yry-ok, #22c55e)'" stroke-width="1.5" stroke-linejoin="round"/>
                        <circle cx="0" :cy="40 - Math.max(0, Math.min(40, decayForecast.currentScore * 0.4))" r="1.8" fill="var(--yry-text-muted, #848893)"/>
                        <circle cx="50" :cy="40 - Math.max(0, Math.min(40, decayForecast.projectedNext * 0.4))" r="1.8" :fill="decayForecast.isDecaying ? 'var(--yry-critical, #ef4444)' : 'var(--yry-ok, #22c55e)'"/>
                    </svg>
                    <div class="si-decay-spark-labels"><span>now</span><span>next run</span><span>drift</span></div>
                </div>
                <div class="si-decay-meta">
                    <p class="si-decay-head">
                        <span class="si-decay-now">{{ decayForecast.currentScore }}</span>
                        <span class="si-decay-arrow" :class="{ 'decaying': decayForecast.isDecaying }">{{ decayForecast.isDecaying ? '↘' : '→' }}</span>
                        <span class="si-decay-next">{{ decayForecast.projectedNext }}</span>
                        <span class="si-decay-delta" :class="{ 'decaying': decayForecast.isDecaying }">{{ decayForecast.delta }} pts</span>
                    </p>
                    <p class="si-decay-rationale">{{ decayForecast.rationale }}</p>
                </div>
            </div>
        </div>
    </section>
`,
    css: '../../../YiPet/cdn/components/report/files/yry-report-self-improvement/index.css',
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
if (typeof window !== 'undefined' && window.registerGlobalComponent) { window.registerGlobalComponent(compDef); }

})();
