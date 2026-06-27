/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryOpBtn · Vue 3 操作按钮组件 (loader)

   props: label · icon · href · target · tone (view/run/edit/del/warn/default)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-op-btn/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-op-btn/index.js"></script>
     <div id="my-btn"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryOpBtn, {
           label: '查看', icon: '👁', href: 'demo.html', tone: 'view'
         }).mount('#my-btn');
       }
       if (window.YryOpBtn) mount();
       else document.addEventListener('yry-op-btn-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryOpBtn] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YryOpBtn',
    templateId: 'yry-op-btn-tpl',
    buildComponent: function (templateHTML) {
      return {
        name: 'YryOpBtn',
        props: {
          label: { type: String, default: '' },
          icon: { type: String, default: '' },
          href: { type: String, default: '' },
          target: { type: String, default: '' },
          tone: { type: String, default: '' }
        },
        template: templateHTML
      };
    }
  });
})();
