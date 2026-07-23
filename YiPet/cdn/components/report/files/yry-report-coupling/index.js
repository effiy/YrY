import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryReportCoupling',
    html: '/cdn/components/business/reports/files/yry-report-coupling/index.html',
    css: '/cdn/components/business/reports/files/yry-report-coupling/index.css',
    mixins: [window.YrYSortable.setSortMixin({ sortKey: 'fanIn', sortDir: -1 })],
    props: {
        fanin: { type: Array, default: function() { return []; } },
        fanout: { type: Array, default: function() { return []; } },
        labels: { type: Object, default: function() { return {}; } }
    },
    data: function() {
        return { tab: 'fanin' };
    },
    computed: {
        title: function() { return (this.labels || {}).sectionCoupling || 'Coupling'; },
        tabFanin: function() { return (this.labels || {}).tabFanin; },
        tabFanout: function() { return (this.labels || {}).tabFanout; },
        colPath: function() { return (this.labels || {}).colPath; },
        colFanIn: function() { return (this.labels || {}).colFanIn; },
        colFanOut: function() { return (this.labels || {}).colFanOut; },
        colExt: function() { return (this.labels || {}).colExt; },
        colLines: function() { return (this.labels || {}).colLines; },
        colType: function() { return (this.labels || {}).colType; },
        emptyCoupling: function() { return (this.labels || {}).emptyCoupling; },
        rows: function() {
            return this.tab === 'fanout' ? (this.fanout || []) : (this.fanin || []);
        },
        sorted: function() {
            return this.sortBy(this.rows);
        }
    },
    methods: {
        setTab: function(tab) {
            this.tab = tab;
            this.sortKey = tab === 'fanout' ? 'fanOut' : 'fanIn';
            this.sortDir = -1;
        }
    }
};
registerGlobalComponent(compDef);
export default compDef;
