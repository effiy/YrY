/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryItemCard · Vue 3 资产卡片组件 (loader)
   适用: 资产/技能/Agent/规则/参考 统一卡片展示

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-item-card-tpl"> 内容
     3) 注册组件到 window.YryItemCard
     4) 派发 'yry-item-card-ready' 事件,通知页面挂载

   依赖 (异步加载链):
     - Vue 3                  (window.Vue)
     - YryTagChip  (window.YryTagChip  ||  监听 'yry-tag-chip-ready' 事件)

   加载链机制: 即使本 <script> 在 yry-tag-chip/index.js 之后执行,
   YryTagChip 也是异步 fetch 完成才注册到 window.YryTagChip 的。
   所以这里必须等待 'yry-tag-chip-ready' 事件,而不是直接检查 window.YryTagChip。

   props 简表:
     icon          (必填) 卡片左侧字母/图标
     iconModifier  (可选) skill | agent | rule | ref · 影响左侧方块背景色
     name          (必填) 卡片主标题
     nameHref      (可选) 主标题链接
     nameTarget    (可选) _blank 等
     badge         (可选) 主标题后的小徽标(如 "新")
     desc          (可选) 描述文字(支持 HTML,经 v-html 渲染)
     tags          (可选) 标签数组 · 内部使用 <yry-tag-chip> 渲染
     meta          (可选) 底部元信息
	     demo          (可选) 效果演示链接 URL

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-item-card/index.css">
     <link rel="stylesheet" href="../../../../cdn/yry-tag-chip/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-tag-chip/index.js"></script>
     <script src="../../../../cdn/yry-item-card/index.js"></script>
     <div id="item-1"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryItemCard, {
           icon: 'C', iconModifier: 'rule',
           name: 'yry-cdn-lib', nameHref: '...', badge: '新',
           desc: 'YrY 自建 CDN 共享库 — ...',
           tags: [
             { text: '自建', modifier: 'accent' },
             { text: 'jsDelivr', modifier: 'info' }
           ],
           meta: 'shared/index.css + theme/index.css + ...'
         }).mount('#item-1');
       }
       if (window.YryItemCard) mount();
       else document.addEventListener('yry-item-card-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryItemCard] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var COMPONENT_NAME = 'YryItemCard';

  var TAG_NAME = 'yry-item-card';

  var TEMPLATE_ID = 'yry-item-card-tpl';

  var READY_EVENT = 'yry-item-card-ready';

  var DEP_EVENT = 'yry-tag-chip-ready';

  var DEP_GLOBAL = 'YryTagChip';

  var LOAD_TIMEOUT_MS = 5000;

  var DEP_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryItemCard',
    templateId: 'yry-item-card-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: COMPONENT_NAME,
        components: { YryTagChip: window[DEP_GLOBAL] },
        props: {
          icon: { type: String, required: true },
          iconModifier: { type: String, default: '' },
          name: { type: String, required: true },
          nameHref: { type: String, default: '' },
          nameTarget: { type: String, default: '' },
          badge: { type: String, default: '' },
          desc: { type: String, default: '' },
          tags: {
            type: Array,
            default: function () {
              return [];
            }
          },
          meta: { type: String, default: '' },
          demo: { type: String, default: '' },
          links: {
            type: Array,
            default: function () {
              return [];
            }
          }
        },
        template: templateHTML
      };
    }
  });
})();
