/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryKpiCard · Vue 3 KPI 指标卡组件 (loader)

   props: label · num · trend · trendDir (up/down/flat) · numColor (health/warn/fail/cyan/accent)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-kpi-card/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-kpi-card/index.js"></script>
     <div id="my-kpi"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryKpiCard, {
           label: '路径完整度', num: '100%', trend: '↑ 5 大域全覆盖', trendDir: 'up', numColor: 'health'
         }).mount('#my-kpi');
       }
       if (window.YryKpiCard) mount();
       else document.addEventListener('yry-kpi-card-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryKpiCard] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-kpi-card-tpl';

  var READY_EVENT = 'yry-kpi-card-ready';

  var TAG_NAME = 'yry-kpi-card';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryKpiCard',
    templateId: 'yry-kpi-card-tpl',
    buildComponent: function buildComponent(templateHTML) {
    return {
      name: 'YryKpiCard',
      props: {
        label:    { type: String, default: '' },
        num:      { type: String, default: '' },
        trend:    { type: String, default: '' },
        trendDir: { type: String, default: 'flat' },
        numColor: { type: String, default: '' }
      },
      template: templateHTML
    };
  }
  });
})();
