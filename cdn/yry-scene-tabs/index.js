/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneTabs · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YrySceneTabs] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-scene-tabs-tpl';

  var READY_EVENT = 'yry-scene-tabs-ready';

  var TAG_NAME = 'yry-scene-tabs';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YrySceneTabs',
    templateId: 'yry-scene-tabs-tpl',
    buildComponent: function buildComponent(templateHTML) {
    return {
        name: 'YrySceneTabs',
      props: {
        tabs: { type: String, default: '[]' }
      },
      data: function () {
        return { activeIdx: 0 };
      },
      computed: {
        parsedTabs: function () {
          try { return JSON.parse(this.tabs); } catch (e) { return []; }
        }
      },
      template: templateHTML
      };
    }
  });
})();
