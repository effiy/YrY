/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCrossNav · Vue 3 交叉导航组件 (loader)
   适用: 场景页 7 种交付物类型间的快速跳转

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-cross-nav-tpl"> 内容
     3) 注册组件到 window.YryCrossNav
     4) 派发 'yry-cross-nav-ready' 事件,通知页面挂载

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-cross-nav/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-cross-nav/index.js"></script>
     <div id="cross-nav-app"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryCrossNav, {
           basePath: './',
           active: '清单',
           pages: [{ id:'清单', icon:'📋', href:'计划清单.html' }, ...]
         }).mount('#cross-nav-app');
       }
       if (window.YryCrossNav) mount();
       else document.addEventListener('yry-cross-nav-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryCrossNav] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-cross-nav-tpl';

  var READY_EVENT = 'yry-cross-nav-ready';

  var TAG_NAME    = 'yry-cross-nav';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryCrossNav',
    templateId: 'yry-cross-nav-tpl',
    buildComponent: function buildComponent(templateHTML) {
    return {
      name: 'YryCrossNav',
      props: {
        basePath: { type: String, default: './' },
        pages:    { type: Array,  default: function() { return []; } },
        active:   { type: String, default: '' }
      },
      template: templateHTML
    };
  }
  });
})();
