/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCatWarning · Vue 3 类别警告组件 (loader)

   props:
     tone    — 'warn' | 'success' | 'info' | 'fail'
     icon    — 左侧图标 emoji
     content — 内容 HTML (支持内联 HTML)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-cat-warning/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-cat-warning/index.js"></script>
     <div id="my-warning"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryCatWarning, {
           tone: 'warn', icon: '\u{1F4A1}',
           content: '<b>注意：</b>这是警告内容'
         }).mount('#my-warning');
       }
       if (window.YryCatWarning) mount();
       else document.addEventListener('yry-cat-warning-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryCatWarning] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-cat-warning-tpl';

  var READY_EVENT = 'yry-cat-warning-ready';

  var TAG_NAME = 'yry-cat-warning';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryCatWarning',
    templateId: 'yry-cat-warning-tpl',
    buildComponent: function buildComponent(templateHTML) {
    return {
      name: 'YryCatWarning',
      props: {
        tone:    { type: String, default: 'warn' },
        icon:    { type: String, default: '' },
        content: { type: String, default: '' }
      },
      template: templateHTML
    };
  }
  });
})();
