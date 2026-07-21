import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryReportSummary',
    html: '/cdn/components/business/reports/files/yry-report-summary/index.html',
    css: '/cdn/components/business/reports/files/yry-report-summary/index.css',
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
registerGlobalComponent(compDef);
export default compDef;
