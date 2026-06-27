/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryFooterNote · Vue 3 页脚组件 (loader)

   props: version (默认 '5.4.0')

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-footer-note/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-footer-note/index.js"></script>
     <yry-footer-note version="5.4.0"></yry-footer-note>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryFooterNote] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YryFooterNote',
    templateId: 'yry-footer-note-tpl',
    buildComponent: function (templateHTML) {
      return {
        name: 'YryFooterNote',
        props: {
          version: { type: String, default: '5.4.0' }
        },
        template: templateHTML
      };
    }
  });
})();
