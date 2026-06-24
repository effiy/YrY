/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryScorecard · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryScorecard] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-scorecard-tpl';

  var READY_EVENT = 'yry-scorecard-ready';

  var TAG_NAME = 'yry-scorecard';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryScorecard',
    templateId: 'yry-scorecard-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryScorecard',
        props: {
          columns: { type: String, default: '[]' },
          rows: { type: String, default: '[]' },
          total: { type: String, default: '[]' }
        },
        computed: {
          parsedColumns: function () {
            try {
              return JSON.parse(this.columns);
            } catch (e) {
              return [];
            }
          },
          parsedRows: function () {
            try {
              return JSON.parse(this.rows);
            } catch (e) {
              return [];
            }
          },
          parsedTotal: function () {
            try {
              return JSON.parse(this.total);
            } catch (e) {
              return [];
            }
          }
        },
        methods: {
          cellClass: function (c) {
            if (c && typeof c === 'object' && c.status) return c.status;
            if (typeof c === 'boolean') return c ? 'pass' : 'fail';
            return '';
          },
          cellText: function (c) {
            if (c === null || c === undefined) return '';
            if (typeof c === 'object') return c.text !== undefined ? c.text : '';
            if (typeof c === 'boolean') return c ? '✓' : '✗';
            return String(c);
          }
        },
        template: templateHTML
      };
    }
  });
})();
