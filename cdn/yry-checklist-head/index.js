/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryChecklistHead · Vue 3 清单头部组件 (loader)

   props: percent (0-100) · title · meta (HTML)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-checklist-head/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-checklist-head/index.js"></script>
     <yry-checklist-head percent="100" title="清单" meta="更新: <code>06-13</code>"></yry-checklist-head>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryChecklistHead] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YryChecklistHead',
    templateId: 'yry-checklist-head-tpl',
    buildComponent: function (templateHTML) {
      return {
        name: 'YryChecklistHead',
        props: {
          percent: { type: Number, default: 0 },
          title: { type: String, default: '' },
          meta: { type: String, default: '' }
        },
        template: templateHTML
      };
    }
  });
})();
