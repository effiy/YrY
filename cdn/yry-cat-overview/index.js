/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCatOverview · Vue 3 风险类别总览组件 (loader)

   props: title · segments (JSON) · stats (JSON)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-cat-overview/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-cat-overview/index.js"></script>
     <div id="my-ov"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryCatOverview, {
           title: '总评分分布', segments: '[...]', stats: '[...]'
         }).mount('#my-ov');
       }
       if (window.YryCatOverview) mount();
       else document.addEventListener('yry-cat-overview-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryCatOverview] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-cat-overview-tpl';

  var READY_EVENT = 'yry-cat-overview-ready';

  var TAG_NAME = 'yry-cat-overview';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryCatOverview',
    templateId: 'yry-cat-overview-tpl',
    buildComponent: function buildComponent(templateHTML) {
    return {
      name: 'YryCatOverview',
      props: {
        title:    { type: String, default: '' },
        segments: { type: String, default: '[]' },
        stats:    { type: String, default: '[]' }
      },
      computed: {
        parsedSegments: function () {
          try { return JSON.parse(this.segments); } catch (e) { return []; }
        },
        parsedStats: function () {
          try { return JSON.parse(this.stats); } catch (e) { return []; }
        }
      },
      template: templateHTML
    };
  }
  });
})();
