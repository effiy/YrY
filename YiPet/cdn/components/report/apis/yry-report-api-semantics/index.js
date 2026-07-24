(function () {
const compDef = Object.assign({
    name: 'yryReportApiSemantics',
    template: `
    <section id="semantics">
        <!-- Stats cards row -->
        <div class="semantics-grid">
            <div class="semantics-card">
                <div class="semantics-card-label">{{ labels.semanticsScore || 'Semantics Score' }}</div>
                <div class="semantics-card-value" :class="scoreTone">{{ Math.round(score) }}/100</div>
                <div class="semantics-card-meta">RFC 7231 compliance</div>
            </div>
            <div class="semantics-card">
                <div class="semantics-card-label">{{ labels.semanticsSafeCount || 'Safe Requests' }}</div>
                <div class="semantics-card-value tone-ok">{{ safeCount }}</div>
                <div class="semantics-card-meta">GET, HEAD, OPTIONS</div>
            </div>
            <div class="semantics-card">
                <div class="semantics-card-label">{{ labels.semanticsUnsafeCount || 'Unsafe Requests' }}</div>
                <div class="semantics-card-value" :class="unsafeTone">{{ unsafeCount }}</div>
                <div class="semantics-card-meta">POST, PUT, PATCH, DELETE</div>
            </div>
            <div class="semantics-card">
                <div class="semantics-card-label">{{ labels.semanticsIdempotentCount || 'Idempotent' }}</div>
                <div class="semantics-card-value tone-ok">{{ idempotentCount }}</div>
                <div class="semantics-card-meta">GET, PUT, DELETE, HEAD</div>
            </div>
            <div class="semantics-card">
                <div class="semantics-card-label">{{ labels.semanticsMisuseCount || 'Method Misuse' }}</div>
                <div class="semantics-card-value" :class="misuseTone">{{ misuseCount }}</div>
                <div class="semantics-card-meta">RFC violations</div>
            </div>
        </div>
        <!-- Method distribution bars (inline from methods data) -->
        <div class="api-method-list" v-if="methods.length">
            <div class="api-method-item" v-for="m in sortBy(methods)" :key="m.method">
                <span class="api-method-icon" :class="'m-' + m.method.toLowerCase()">{{ m.method }}</span>
                <span class="api-method-track">
                    <span class="api-method-fill" :class="'m-' + m.method.toLowerCase()" :style="{ width: m.pct + '%' }"></span>
                </span>
                <span class="api-method-stats">{{ m.count }} <span class="api-method-pct">{{ Math.round(m.pct) }}%</span></span>
                <span class="api-method-semantics">
                    <span v-if="m.safe" class="semantics-tag tag-safe">safe</span>
                    <span v-else class="semantics-tag tag-unsafe">unsafe</span>
                    <span v-if="m.idempotent" class="semantics-tag tag-idem">idempotent</span>
                    <span v-else class="semantics-tag tag-nonidem">non-idem</span>
                </span>
            </div>
        </div>
        <!-- Method misuse detail table -->
        <table class="misuse-table" v-if="methodMisuse.length">
            <caption style="text-align:left;color:var(--yry-fg-muted,#848893);font-size:12px;margin-bottom:8px;">{{ labels.semanticsMisuseTable || 'Method Misuse Detected' }} — {{ methodMisuse.length }} violations</caption>
            <thead>
                <tr>
                    <th>{{ labels.colMethod || 'Method' }}</th>
                    <th>{{ labels.colPath || 'Path' }}</th>
                    <th>{{ labels.colMessage || 'Issue' }}</th>
                    <th>{{ labels.colCategory || 'Severity' }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(m, idx) in methodMisuse" :key="idx">
                    <td><span class="semantics-method-chip" :class="'m-' + m.method.toLowerCase()">{{ m.method }}</span></td>
                    <td><code>{{ m.path }}</code></td>
                    <td style="font-size:12px;">{{ m.issue }}</td>
                    <td><span class="semantics-severity" :class="m.severity.toLowerCase()">{{ m.severity }}</span></td>
                </tr>
            </tbody>
        </table>
        <p v-if="!methodMisuse.length" style="color: var(--yry-ok, #16a34a); font-size: 12px; font-weight: 600;">
            &#x2713; All HTTP methods used correctly per RFC 7231.
        </p>
    </section>
`,
    css: '../../../YiPet/cdn/components/report/apis/yry-report-api-semantics/index.css',
    props: {
        semantics: { type: Object, default: function() { return {}; } },
        methods: { type: Array, default: function() { return []; } },
        labels: { type: Object, default: function() { return {}; } },
    },
    computed: {
        score: function () { return (this.semantics && this.semantics.score) || 0; },
        safeCount: function () { return (this.semantics && this.semantics.safeCount) || 0; },
        unsafeCount: function () { return (this.semantics && this.semantics.unsafeCount) || 0; },
        idempotentCount: function () { return (this.semantics && this.semantics.idempotentCount) || 0; },
        methodMisuse: function () { return (this.semantics && this.semantics.methodMisuse) || []; },
        misuseCount: function () { return this.methodMisuse.length; },
        scoreTone: function () {
            var s = this.score;
            if (s >= 80) return 'tone-ok';
            if (s >= 50) return 'tone-warn';
            return 'tone-critical';
        },
        unsafeTone: function () {
            var u = this.unsafeCount;
            var t = this.safeCount + this.unsafeCount || 1;
            var ratio = u / t;
            if (ratio > 0.7) return 'tone-warn';
            return 'tone-ok';
        },
        misuseTone: function () {
            var m = this.misuseCount;
            if (m === 0) return 'tone-ok';
            if (m <= 2) return 'tone-warn';
            return 'tone-critical';
        },
    },
}, window.YrYSortable.setSortMixin({ sortKey: 'method', sortDir: -1 }));
if (typeof window !== 'undefined' && window.registerGlobalComponent) { window.registerGlobalComponent(compDef); }

})();
