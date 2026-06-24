/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneStats · Vue 3 场景统计卡组 (loader)

   props: items — JSON 字符串,每项 {value, label, color?}

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-scene-stats/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-scene-stats/index.js"></script>
     <yry-scene-stats items='[{"value":"5","label":"总断言","color":"t"}]'></yry-scene-stats>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YrySceneStats] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-scene-stats-tpl';

  var READY_EVENT = 'yry-scene-stats-ready';

  var TAG_NAME = 'yry-scene-stats';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YrySceneStats',
    templateId: 'yry-scene-stats-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YrySceneStats',
        props: {
          items: { type: String, default: '[]' }
        },
        computed: {
          parsedItems: function () {
            try {
              return JSON.parse(this.items);
            } catch (e) {
              return [];
            }
          }
        },
        template: templateHTML
      };
    }
  });
})();
