/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCdnAggGrid · Vue 3 CDN 聚合中心卡片网格容器 (loader)
   适用: docs/index.html 中"七张聚合页"区块 · 由外部 items 数组驱动渲染

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-cdn-agg-grid-tpl"> 内容
     3) 注册组件到 window.YryCdnAggGrid
     4) 同时通过 Vue.defineCustomElement 注册为 <yry-cdn-agg-grid>
     5) 派发 'yry-cdn-agg-grid-ready' 事件

   依赖 (异步加载链):
     - Vue 3                  (window.Vue)
     - YryCdnAggCard          (window.YryCdnAggCard 或监听 'yry-cdn-agg-card-ready')

   Props:
     items   Array<{
       href, title, emoji, name, badge, dataSource, body, chips, cta, target
     }>

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-cdn-agg-card/index.css">
     <link rel="stylesheet" href="../../../../cdn/yry-cdn-agg-grid/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/shared/vue-ce-loader.js"></script>
     <script src="../../../../cdn/yry-cdn-agg-card/index.js"></script>
     <script src="../../../../cdn/yry-cdn-agg-grid/index.js"></script>

     <yry-cdn-agg-grid id="cdn-agg-grid"></yry-cdn-agg-grid>
     <script>
       function mount() {
         document.getElementById('cdn-agg-grid').items = [
           { href: '../cdn/checklist.html', emoji: '📋', name: '清单聚合',
             badge: 'checklist.html', dataSource: 'manifest.json',
             body: '...', chips: ['状态徽章','类型过滤'], cta: '浏览清单 →' }
         ];
       }
       if (window.YryCdnAggGrid) mount();
       else document.addEventListener('yry-cdn-agg-grid-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryCdnAggGrid] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var COMPONENT_NAME = 'YryCdnAggGrid';
  var TEMPLATE_ID = 'yry-cdn-agg-grid-tpl';
  var READY_EVENT = 'yry-cdn-agg-grid-ready';
  var DEP_GLOBAL = 'YryCdnAggCard';

  window.YrYVueCE.define({
    componentName: COMPONENT_NAME,
    templateId: TEMPLATE_ID,
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: COMPONENT_NAME,
        props: {
          items: {
            type: Array,
            default: function () { return []; }
          }
        },
        components: {
          YryCdnAggCard: window[DEP_GLOBAL] || null
        },
        template: templateHTML,
        mounted: function () {
          /* 通知外部脚本(已浏览追踪 / freshness 时间戳)可以开始处理子卡片 */
          var self = this;
          this.$nextTick(function () {
            document.dispatchEvent(new CustomEvent(READY_EVENT + ':mounted', {
              detail: { component: COMPONENT_NAME, host: self.$el }
            }));
          });
        },
        updated: function () {
          var self = this;
          this.$nextTick(function () {
            document.dispatchEvent(new CustomEvent(READY_EVENT + ':updated', {
              detail: { component: COMPONENT_NAME, host: self.$el }
            }));
          });
        }
      };
    }
  });
})();