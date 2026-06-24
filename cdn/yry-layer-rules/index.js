/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryLayerRules · Vue 3 YryLayerRules · Layer R 治理规则 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryLayerRules] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-layer-rules-tpl';

  var READY_EVENT = 'yry-layer-rules-ready';

  var TAG_NAME = 'yry-layer-rules';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryLayerRules',
    templateId: 'yry-layer-rules-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return { name: 'YryLayerRules', template: templateHTML };
    }
  });
})();
