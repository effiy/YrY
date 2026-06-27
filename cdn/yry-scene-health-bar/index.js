/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneHealthBar · Vue 3 场景健康进度条 (loader)

   props: segments — JSON 字符串,每项 {pct, cls}

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-scene-health-bar/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-scene-health-bar/index.js"></script>
     <yry-scene-health-bar segments='[{"pct":75,"cls":"strength"},{"pct":25,"cls":"gap"}]'></yry-scene-health-bar>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YrySceneHealthBar] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-scene-health-bar-tpl';

  var READY_EVENT = 'yry-scene-health-bar-ready';

  var TAG_NAME = 'yry-scene-health-bar';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YrySceneHealthBar',
    templateId: 'yry-scene-health-bar-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YrySceneHealthBar',
        props: {
          segments: { type: String, default: '[]' }
        },
        computed: {
          parsedSegments: function () {
            try {
              return JSON.parse(this.segments);
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
