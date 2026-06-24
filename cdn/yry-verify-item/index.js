/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryVerifyItem · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryVerifyItem] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-verify-item-tpl';

  var READY_EVENT = 'yry-verify-item-ready';

  var TAG_NAME = 'yry-verify-item';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryVerifyItem',
    templateId: 'yry-verify-item-tpl',
    buildComponent: function buildComponent(templateHTML) {
    return {
        name: 'YryVerifyItem',
      props: {
        label:    { type: String, default: '' },
        status:   { type: String, default: 'pass' },
        sections: { type: String, default: '[]' }
      },
      computed: {
        parsedSections: function () { try { return JSON.parse(this.sections); } catch (e) { return []; } }
      },
      template: templateHTML
      };
    }
  });
})();
