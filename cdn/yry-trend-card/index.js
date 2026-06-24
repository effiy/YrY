/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryTrendCard · Vue 3 趋势柱状图组件 (loader)

   props: title · axis · bars (JSON 字符串,每项 {value, label, color?})

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-trend-card/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-trend-card/index.js"></script>
     <div id="my-trend"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryTrendCard, {
           title: '📈 趋势', axis: 'D-7 → D0',
           bars: '[{"value":62,"label":"62%"}]'
         }).mount('#my-trend');
       }
       if (window.YryTrendCard) mount();
       else document.addEventListener('yry-trend-card-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryTrendCard] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-trend-card-tpl';

  var READY_EVENT = 'yry-trend-card-ready';

  var TAG_NAME = 'yry-trend-card';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryTrendCard',
    templateId: 'yry-trend-card-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryTrendCard',
        props: {
          title: { type: String, default: '' },
          axis: { type: String, default: '' },
          bars: { type: String, default: '[]' }
        },
        computed: {
          parsedBars: function () {
            try {
              return JSON.parse(this.bars);
            } catch (e) {
              return [];
            }
          }
        },
        methods: {
          barHeight: function (v) {
            return Math.max(2, Math.min(100, v || 0));
          }
        },
        template: templateHTML
      };
    }
  });
})();
