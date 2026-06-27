/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryDepBadge · Vue 3 依赖页跳转徽章组件 (loader)

   props: href · label · type · target
   type: doc/rule/test/cmd/arc/skill/warn

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-dep-badge/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-dep-badge/index.js"></script>
     <div id="my-badge"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryDepBadge, {
           href: '架构图.html', label: '📐 架构图', type: 'arc'
         }).mount('#my-badge');
       }
       if (window.YryDepBadge) mount();
       else document.addEventListener('yry-dep-badge-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryDepBadge] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YryDepBadge',
    templateId: 'yry-dep-badge-tpl',
    buildComponent: function (templateHTML) {
      return {
        name: 'YryDepBadge',
        props: {
          href: { type: String, default: '' },
          label: { type: String, default: '' },
          type: { type: String, default: 'doc' },
          target: { type: String, default: '' }
        },
        template: templateHTML
      };
    }
  });
})();
