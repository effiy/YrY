/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryRiskRow · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryRiskRow] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-risk-row-tpl';

  var READY_EVENT = 'yry-risk-row-ready';

  var TAG_NAME = 'yry-risk-row';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryRiskRow',
    templateId: 'yry-risk-row-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryRiskRow',
        props: {
          id: { type: String, default: '' },
          name: { type: String, default: '' },
          sub: { type: String, default: '' },
          category: { type: String, default: '' },
          score: { type: [String, Number], default: 0 },
          scoreLevel: { type: String, default: 'low' },
          scoreInfo: { type: String, default: '' },
          deadline: { type: String, default: '' },
          owner: { type: String, default: '' },
          status: { type: String, default: 'pass' },
          statusText: { type: String, default: '' },
          details: { type: String, default: '[]' },
          plan: { type: String, default: '[]' },
          timeline: { type: String, default: '[]' }
        },
        data: function () {
          return { open: false };
        },
        computed: {
          parsedDetails: function () {
            try {
              return JSON.parse(this.details);
            } catch (e) {
              return [];
            }
          },
          parsedPlan: function () {
            try {
              return JSON.parse(this.plan);
            } catch (e) {
              return [];
            }
          },
          parsedTimeline: function () {
            try {
              return JSON.parse(this.timeline);
            } catch (e) {
              return [];
            }
          },
          scorePct: function () {
            return Math.max(2, Math.min(100, ((Number(this.score) || 0) / 25) * 100));
          }
        },
        template: templateHTML
      };
    }
  });
})();
