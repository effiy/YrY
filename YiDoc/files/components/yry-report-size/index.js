(function() {
    'use strict';
    
    window.ruiReportSize = {
        name: 'ruiReportSize',
        template: '#yry-report-size-tpl',
        props: {
            treemap: { type: Array, default: function() { return []; } },
            types: { type: Array, default: function() { return []; } },
            histogram: { type: Array, default: function() { return []; } },
            labels: { type: Object, default: function() { return {}; } }
        },
        data: function() {
            return { tab: 'treemap' };
        },
        computed: {
            title: function() { return (this.labels || {}).sectionSize || 'Size'; },
            tabTreemap: function() { return (this.labels || {}).tabTreemap || 'Treemap'; },
            tabTypes: function() { return (this.labels || {}).tabTypes || 'Types'; },
            tabHistogram: function() { return (this.labels || {}).tabHistogram || 'Histogram'; },
            colType: function() { return (this.labels || {}).colType; },
            colFiles: function() { return (this.labels || {}).colFiles; },
            colPctFiles: function() { return (this.labels || {}).colPctFiles; },
            colBytes: function() { return (this.labels || {}).colBytes; },
            colPctBytes: function() { return (this.labels || {}).colPctBytes; },
            colLines: function() { return (this.labels || {}).colLines; },
            emptyTreemap: function() { return (this.labels || {}).emptyTreemap; },
            emptyTypes: function() { return (this.labels || {}).emptyTypes; },
            emptyHistogram: function() { return (this.labels || {}).emptyHistogram; }
        }
    };
})();
