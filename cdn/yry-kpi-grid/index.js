/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryKpiGrid · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryKpiGrid] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-kpi-grid-tpl';

  var READY_EVENT = 'yry-kpi-grid-ready';

  var TAG_NAME = 'yry-kpi-grid';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryKpiGrid',
    templateId: 'yry-kpi-grid-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryKpiGrid',
        props: {
          kpis: { type: String, default: '[]' },
          cols: { type: [String, Number], default: 6 }
        },
        computed: {
          parsedKpis: function () {
            try {
              return JSON.parse(this.kpis);
            } catch (e) {
              return [];
            }
          }
        },
        template: templateHTML
      };
    }
  });
})();
