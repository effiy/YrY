/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneNav · Vue 3 场景层级导航组件 (loader)
   适用: 场景页 pill 风格面包屑导航

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-scene-nav-tpl"> 内容
     3) 注册组件到 window.YrySceneNav
     4) 派发 'yry-scene-nav-ready' 事件,通知页面挂载

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-scene-nav/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-scene-nav/index.js"></script>
     <div id="scene-nav-app"></div>
     <script>
       function mount() {
         Vue.createApp(window.YrySceneNav, {
           items: [{ label:'任务故事', href:'../README.md' }, { label:'场景 1' }]
         }).mount('#scene-nav-app');
       }
       if (window.YrySceneNav) mount();
       else document.addEventListener('yry-scene-nav-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YrySceneNav] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-scene-nav-tpl';

  var READY_EVENT = 'yry-scene-nav-ready';

  var TAG_NAME = 'yry-scene-nav';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YrySceneNav',
    templateId: 'yry-scene-nav-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YrySceneNav',
        props: {
          items: { type: Array, required: true },
          separator: { type: String, default: '·' }
        },
        template: templateHTML
      };
    }
  });
})();
