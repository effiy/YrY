/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryStatsGrid · Vue 3 统计卡组组件 (loader)
   适用: 进度概览、KPI 总览等多卡片统计区

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-stats-grid-tpl"> 内容
     3) 注册组件到 window.YryStatsGrid
     4) 派发 'yry-stats-grid-ready' 事件,通知页面挂载

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-stats-grid/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-stats-grid/index.js"></script>
     <div id="stats-grid-app"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryStatsGrid, {
           items: [
             { value: 16, label: '已完成',  modifier: 'health' },
             { value: 0,  label: '进行中',  modifier: 'warn-h' },
             { value: 0,  label: '待开始' },
             { value: '100%', label: '完成进度', modifier: 'accent' }
           ]
         }).mount('#stats-grid-app');
       }
       if (window.YryStatsGrid) mount();
       else document.addEventListener('yry-stats-grid-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryStatsGrid] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-stats-grid-tpl';

  var READY_EVENT = 'yry-stats-grid-ready';

  var TAG_NAME = 'yry-stats-grid';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryStatsGrid',
    templateId: 'yry-stats-grid-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryStatsGrid',
        props: {
          items: { type: Array, required: true }
        },
        template: templateHTML
      };
    }
  });
})();
