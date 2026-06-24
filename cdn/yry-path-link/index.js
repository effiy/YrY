/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryPathLink · Vue 3 路径链接组件 (loader)

   props: display · full · href · target

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-path-link/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-path-link/index.js"></script>
     <div id="my-link"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryPathLink, {
           display: 'cdn/shared/index.css', full: '/path/to/file', href: 'file.css'
         }).mount('#my-link');
       }
       if (window.YryPathLink) mount();
       else document.addEventListener('yry-path-link-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryPathLink] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YryPathLink',
    templateId: 'yry-path-link-tpl',
    buildComponent: function (templateHTML) {
      return {
        name: 'YryPathLink',
        props: {
          display: { type: String, default: '' },
          full: { type: String, default: '' },
          href: { type: String, default: '' },
          target: { type: String, default: '' }
        },
        template: templateHTML
      };
    }
  });
})();
