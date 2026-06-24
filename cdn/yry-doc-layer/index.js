/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryDocLayer · Vue 3 文档层级包装组件 (loader)
   适用: 文档中心页面的 7 个 layer,统一渲染 header + 多 sub-section

   依赖 (异步加载链):
     - Vue 3
     - YryLayer       (window.YryLayer       || 监听 'yry-layer-ready')
     - YrySubTitle    (window.YrySubTitle    || 监听 'yry-sub-title-ready')
     - YryTagChip     (window.YryTagChip     || 监听 'yry-tag-chip-ready')  · 通过 YryItemCard 间接依赖
     - YryItemCard    (window.YryItemCard    || 监听 'yry-item-card-ready')
     - YryStoryCard   (window.YryStoryCard   || 监听 'yry-story-card-ready')
     - YrySceneCard   (window.YrySceneCard   || 监听 'yry-scene-card-ready')

   props 简表:
     layerId        (可选) 渲染到 <div class="layer" id="..."> 的 id(经 YryLayer)
     num            (必填) layer 序号
     titleIcon      (可选) 标题 icon
     titlePrefix/titleAccent/titleSuffix 三段式标题
     stats          (可选) 统计行文本数组
     panels         (可选) 跳转面板 dots
     panelsTitle    (可选) "查看" 之类的小标签
     sections       (必填) 子区块数组: [{ subTitle, grid: 'card'|'story'|'scene', items: [...] }]

   grid 类型说明:
     - 'card'  → 渲染 YryItemCard
     - 'story' → 渲染 YryStoryCard
     - 'scene' → 渲染 YrySceneCard

   页面使用方式:
     <link rel="stylesheet" href=".../yry-layer/index.css">     (按需 6 个组件 CSS)
     ...
     <script src=".../yry-layer/index.js"></script>            (按需 6 个组件 JS)
     ...
     <script src=".../yry-doc-layer/index.js"></script>
     <div id="layer-deps-app"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryDocLayer, {
           layerId: 'layer-deps', num: '1',
           titleAccent: '第三方依赖与框架',
           stats: ['6 运行时 · 6 开发'],
           panels: [{ icon: '📦', panel: 'deps' }],
           sections: [
             { subTitle: { icon: '⚡', text: '运行时依赖' }, grid: 'card', items: [...] }
           ]
         }).mount('#layer-deps-app');
       }
       if (window.YryDocLayer) mount();
       else document.addEventListener('yry-doc-layer-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryDocLayer] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var COMPONENT_NAME = 'YryDocLayer';

  var TAG_NAME = 'yry-doc-layer';

  var TEMPLATE_ID = 'yry-doc-layer-tpl';

  var READY_EVENT = 'yry-doc-layer-ready';

  var DEPS = [
    { name: 'YryLayer', event: 'yry-layer-ready', timeout: 5000 },
    { name: 'YrySubTitle', event: 'yry-sub-title-ready', timeout: 5000 },
    { name: 'YryItemCard', event: 'yry-item-card-ready', timeout: 5000 },
    { name: 'YryStoryCard', event: 'yry-story-card-ready', timeout: 5000 },
    { name: 'YrySceneCard', event: 'yry-scene-card-ready', timeout: 5000 }
  ];

  window.YrYVueCE.define({
    componentName: 'YryDocLayer',
    templateId: 'yry-doc-layer-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: COMPONENT_NAME,
        components: {
          YryLayer: window.YryLayer,
          YrySubTitle: window.YrySubTitle,
          YryItemCard: window.YryItemCard,
          YryStoryCard: window.YryStoryCard,
          YrySceneCard: window.YrySceneCard
        },
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
          panelsContainerTitle: { type: String, default: '' },
          style: { type: [String, Object], default: '' },
          numStyle: { type: [String, Object], default: '' },
          sections: { type: Array, required: true }
        },
        methods: {
          componentFor: function (grid) {
            switch (grid) {
              case 'card':
                return 'YryItemCard';
              case 'story':
                return 'YryStoryCard';
              case 'scene':
                return 'YrySceneCard';
              default:
                return 'div';
            }
          }
        },
        template: templateHTML
      };
    }
  });
})();
