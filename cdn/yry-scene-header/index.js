/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneHeader · Vue 3 场景页头组件 (loader)
   适用: 场景页头部 (icon + title + accent + meta + desc)

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-scene-header-tpl"> 内容
     3) 注册组件到 window.YrySceneHeader
     4) 派发 'yry-scene-header-ready' 事件,通知页面挂载

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-scene-header/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-scene-header/index.js"></script>
     <div id="scene-header-app"></div>
     <script>
       function mount() {
         Vue.createApp(window.YrySceneHeader, {
           icon: '📋',
           titlePrefix: '场景-1',
           accent: ' · 模板架构与 CSS 设计系统',
           meta: '📌 v1.0 · 📅 2026-06-05 · 🏷️ arch',
           desc: '定义计划清单页面的模板架构与 CSS 设计系统…'
         }).mount('#scene-header-app');
       }
       if (window.YrySceneHeader) mount();
       else document.addEventListener('yry-scene-header-ready', mount, { once: true });
     </script>

   注意: prop 名不使用 `prefix`,因为 Element.prototype.prefix 是只读 getter
   (XML 命名空间),升级为自定义元素后赋值会抛 TypeError。
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YrySceneHeader] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YrySceneHeader',
    templateId: 'yry-scene-header-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YrySceneHeader',
        props: {
          icon: { type: String, default: '' },
          titlePrefix: { type: String, default: '' },
          accent: { type: String, default: '' },
          meta: { type: String, default: '' },
          desc: { type: String, default: '' }
        },
        template: templateHTML
      };
    }
  });
})();
