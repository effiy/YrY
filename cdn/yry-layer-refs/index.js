/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryLayerRefs · Vue 3 Layer 6 参考入口复合组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryLayerRefs] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YryLayerRefs',
    templateId: 'yry-layer-refs-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryLayerRefs',
        template: templateHTML
      };
    }
  });
})();
