/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryGantt · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryGantt] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-gantt-tpl';
  var READY_EVENT = 'yry-gantt-ready';
  var TAG_NAME = 'yry-gantt';
  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryGantt',
    templateId: 'yry-gantt-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryGantt',
        props: {
          days: { type: Number, default: 15 },
          labels: { type: String, default: '[]' },
          tasks: { type: String, default: '[]' }
        },
        computed: {
          parsedLabels: function () {
            try {
              return JSON.parse(this.labels);
            } catch (e) {
              return [];
            }
          },
          parsedTasks: function () {
            try {
              return JSON.parse(this.tasks);
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
