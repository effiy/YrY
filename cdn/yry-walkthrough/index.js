/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryWalkthrough · Vue 3 逐步演示组件 (loader)

   props:
     steps: [{ title, time?, desc?, cmd?, copyCmd?, tags?, note?, result? }]

   tag class 自动映射: "P0 阻断" → t-p0, "P1 推荐" → t-p1, "P2 收尾" → t-p2
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryWalkthrough] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-walkthrough-tpl';

  var READY_EVENT = 'yry-walkthrough-ready';

  var TAG_NAME = 'yry-walkthrough';

  var LOAD_TIMEOUT_MS = 5000;

  function tagClass(tag) {
    if (!tag) return '';
    if (/^P0/.test(tag)) return 't-p0';
    if (/^P1/.test(tag)) return 't-p1';
    if (/^P2/.test(tag)) return 't-p2';
    if (/^(新|入门|NEW)/i.test(tag)) return 't-new';
    return '';
  }

  window.YrYVueCE.define({
    componentName: 'YryWalkthrough',
    templateId: 'yry-walkthrough-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryWalkthrough',
        props: {
          steps: {
            type: Array,
            default: function () {
              return [];
            }
          }
        },
        methods: {
          tagClass: tagClass
        },
        template: templateHTML
      };
    }
  });
})();
