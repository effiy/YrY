/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryLayer · Vue 3 分层区块组件 (loader)
   适用: 文档中心页面的 6-7 个 layer 分区

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-layer-tpl"> 内容
     3) 注册组件到 window.YryLayer
     4) 派发 'yry-layer-ready' 事件,通知页面挂载

   props 简表:
     layerId   (可选) 渲染到 <div class="layer" id="..."> 的 id
     num       (必填) 左侧序号,如 '1' / '2' / ...
     titleIcon (可选) 标题前的 emoji/icon
     titlePrefix/titleAccent/titleSuffix 三段式标题 · accent 高亮
     stats     (可选) 描述性文本数组,用 · 分隔
     panels    (可选) 跳转面板 dots 数组: [{ icon, label, panel, title? }]
     panelsTitle (可选) "查看" 等小标签

   交互约定:
     - lp-dot 点击 → 组件在根元素上派发 CustomEvent('layer-panel-select',
       { detail: { panel: <name> }, bubbles: true })
     - 页面监听后调用自己的面板 API(例如 window.PanelHub.open)

   页面使用方式 (slot 内容须在 mount 之前就存在):
     <link rel="stylesheet" href="../../../../cdn/yry-layer/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-layer/index.js"></script>
     <div id="layer-deps-app">
       <!-- 此处插入 body 内容,Vue 渲染时会被包含为默认 slot -->
     </div>
     <script>
       function mount() {
         const root = Vue.createApp(window.YryLayer, {
           layerId: 'layer-deps',
           num: '1', titleIcon: '📚',
           titlePrefix: 'Layer 1 · ', titleAccent: '依赖 / 框架',
           stats: ['12 项', '技术债务 ≤ 0'],
           panelsTitle: '查看',
           panels: [
             { icon: '🔍', label: '依赖详情', panel: 'deps' }
           ]
         }).mount('#layer-deps-app');
         root.addEventListener('layer-panel-select', function (e) {
           if (window.PanelHub) window.PanelHub.open(e.detail.panel);
         });
       }
       if (window.YryLayer) mount();
       else document.addEventListener('yry-layer-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryLayer] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-layer-tpl';

  var READY_EVENT = 'yry-layer-ready';

  var TAG_NAME = 'yry-layer';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryLayer',
    templateId: 'yry-layer-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryLayer',
        props: {
          layerId: { type: String, default: '' },
          num: { type: String, required: true },
          titleIcon: { type: String, default: '' },
          titlePrefix: { type: String, default: '' },
          titleAccent: { type: String, default: '' },
          titleSuffix: { type: String, default: '' },
          stats: {
            type: Array,
            default: function () {
              return [];
            }
          },
          panels: {
            type: Array,
            default: function () {
              return [];
            }
          },
          panelsTitle: { type: String, default: '' },
          /* 容器 tooltip(整组 dots 的 title 属性) */
          panelsContainerTitle: { type: String, default: '' },
          /* 根 <div class="layer"> 内联样式(如 margin-top 调整) */
          style: { type: [String, Object], default: '' },
          /* 左侧序号块 <div class="layer-num"> 内联样式(如自定义背景) */
          numStyle: { type: [String, Object], default: '' }
        },
        methods: {
          onPanel: function (panel) {
            /* 派发完整 panel 对象,便于父级 listener 路由(layerInfo.show / PanelHub.open)
             e.detail = { icon, label, panel, onPanel, title, style, ... } */
            this.$el.dispatchEvent(
              new CustomEvent('layer-panel-select', {
                detail: panel,
                bubbles: true
              })
            );
          }
        },
        template: templateHTML
      };
    }
  });
})();
