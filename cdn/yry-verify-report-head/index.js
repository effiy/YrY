/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryVerifyReportHead · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryVerifyReportHead] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-verify-report-head-tpl';

  var READY_EVENT = 'yry-verify-report-head-ready';

  var TAG_NAME = 'yry-verify-report-head';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryVerifyReportHead',
    templateId: 'yry-verify-report-head-tpl',
    buildComponent: function buildComponent(templateHTML) {
    return {
        name: 'YryVerifyReportHead',
      props: {
        title: { type: String, default: '' },
        items: { type: String, default: '[]' }
      },
      computed: {
        parsedItems: function () {
          try { return JSON.parse(this.items); } catch (e) { return []; }
        }
      },
      template: templateHTML
      };
    }
  });
})();
