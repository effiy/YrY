/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryStepCard · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryStepCard] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-step-card-tpl';

  var READY_EVENT = 'yry-step-card-ready';

  var TAG_NAME = 'yry-step-card';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryStepCard',
    templateId: 'yry-step-card-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryStepCard',
        props: {
          num: { type: [String, Number], default: '' },
          title: { type: String, default: '' },
          status: { type: String, default: 'pending' },
          statusText: { type: String, default: '' },
          checked: { type: Boolean, default: false },
          summary: { type: String, default: '' },
          meta: { type: String, default: '[]' },
          criteria: { type: String, default: '[]' },
          deps: { type: String, default: '[]' },
          log: { type: String, default: '[]' }
        },
        data: function () {
          return { open: false };
        },
        computed: {
          parsedMeta: function () {
            try {
              return JSON.parse(this.meta);
            } catch (e) {
              return [];
            }
          },
          parsedCriteria: function () {
            try {
              return JSON.parse(this.criteria);
            } catch (e) {
              return [];
            }
          },
          parsedDeps: function () {
            try {
              return JSON.parse(this.deps);
            } catch (e) {
              return [];
            }
          },
          parsedLog: function () {
            try {
              return JSON.parse(this.log);
            } catch (e) {
              return [];
            }
          }
        },
        methods: {
          onCheck: function (e) {
            this.checked = e.target.checked;
            this.$el.dispatchEvent(
              new CustomEvent('step-toggle', {
                detail: { num: this.num, checked: this.checked },
                bubbles: true
              })
            );
          }
        },
        template: templateHTML
      };
    }
  });
})();
