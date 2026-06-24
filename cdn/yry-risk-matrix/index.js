/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryRiskMatrix · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryRiskMatrix] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-risk-matrix-tpl';

  var READY_EVENT = 'yry-risk-matrix-ready';

  var TAG_NAME = 'yry-risk-matrix';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryRiskMatrix',
    templateId: 'yry-risk-matrix-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryRiskMatrix',
        props: {
          cells: { type: String, default: '[]' },
          colLabels: {
            type: String,
            default: '["极低 (1)","低 (2)","中 (3)","高 (4)","极高 (5)"]'
          },
          rowLabels: {
            type: String,
            default: '["极高 (5)","高 (4)","中 (3)","低 (2)","极低 (1)"]'
          },
          severityAxis: { type: String, default: '↑ 严重度' },
          likelihoodAxis: { type: String, default: '可能性 →' }
        },
        computed: {
          parsedColLabels: function () {
            try {
              return JSON.parse(this.colLabels);
            } catch (e) {
              return [];
            }
          },
          parsedRowLabels: function () {
            try {
              return JSON.parse(this.rowLabels);
            } catch (e) {
              return [];
            }
          },
          parsedCells: function () {
            try {
              return JSON.parse(this.cells);
            } catch (e) {
              return [];
            }
          }
        },
        methods: {
          cellObj: function (r, c) {
            var cells = this.parsedCells;
            return cells[r] && cells[r][c] ? cells[r][c] : {};
          },
          cellCls: function (r, c) {
            var cell = this.cellObj(r, c);
            if (cell.level) return 'r-' + cell.level;
            return 'l' + r;
          }
        },
        template: templateHTML
      };
    }
  });
})();
