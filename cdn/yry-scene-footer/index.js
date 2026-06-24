/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneFooter · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YrySceneFooter] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-scene-footer-tpl';

  var READY_EVENT = 'yry-scene-footer-ready';

  var TAG_NAME = 'yry-scene-footer';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YrySceneFooter',
    templateId: 'yry-scene-footer-tpl',
    buildComponent: function buildComponent(templateHTML) {
    return {
        name: 'YrySceneFooter',
      props: {
        version:  { type: String, default: '' },
        date:     { type: String, default: '' },
        docsLink: { type: String, default: '' }
      },
      template: templateHTML
      };
    }
  });
})();
