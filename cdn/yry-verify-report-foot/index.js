/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryVerifyReportFoot · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryVerifyReportFoot] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-verify-report-foot-tpl';

  var READY_EVENT = 'yry-verify-report-foot-ready';

  var TAG_NAME = 'yry-verify-report-foot';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryVerifyReportFoot',
    templateId: 'yry-verify-report-foot-tpl',
    buildComponent: function buildComponent(templateHTML) {
    return {
        name: 'YryVerifyReportFoot',
      props: { summary: { type: String, default: '' }, sections: { type: String, default: '[]' }, signatures: { type: String, default: '[]' } },
      computed: {
        parsedSections: function () { try { return JSON.parse(this.sections); } catch (e) { return []; } },
        parsedSigs: function () { try { return JSON.parse(this.signatures); } catch (e) { return []; } }
      },
      template: templateHTML
      };
    }
  });
})();
