/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryLayerAgents · Vue 3 YryLayerAgents · Layer 5 Agent 角色 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryLayerAgents] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-layer-agents-tpl';

  var READY_EVENT = 'yry-layer-agents-ready';

  var TAG_NAME = 'yry-layer-agents';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryLayerAgents',
    templateId: 'yry-layer-agents-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return { name: 'YryLayerAgents', template: templateHTML };
    }
  });
})();
