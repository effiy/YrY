(function () {
const compDef = {
    name: 'yryReportSummary',
    template: `
    <section id="summary">
        <yry-score-bar :score="scoreObj" :alerts="alertCounts"></yry-score-bar>
        <div class="card" v-for="c in cards" :key="c.label">
            <div class="card-label">{{ c.label }}</div>
            <div class="value">{{ c.value }}</div>
        </div>
    </section>
`,
    css: '../../../YiPet/cdn/components/report/files/yry-report-summary/index.css',
    props: {
        score: { type: Number, required: true },
        alertCounts: { type: Object, default: function() { return { p0: 0, p1: 0, p2: 0 }; } },
        summary: { type: Object, default: function() { return {}; } },
        labels: { type: Object, default: function() { return {}; } }
    },
    computed: {
        scoreObj: function() {
            return { grade: this.score >= 90 ? 'A' : this.score >= 75 ? 'B' : this.score >= 60 ? 'C' : this.score >= 40 ? 'D' : 'F', value: this.score };
        },
        cards: function() {
            var s = this.summary || {};
            var L = this.labels || {};
            return [
                { label: L.summaryTotalFiles || 'Total Files', value: s.totalFiles != null ? s.totalFiles : 0 },
                { label: L.summaryTotalSize || 'Total Size', value: s.totalBytesHuman || '0 B' }
            ];
        }
    }
};
if (typeof window !== 'undefined' && window.registerGlobalComponent) { window.registerGlobalComponent(compDef); }

})();
