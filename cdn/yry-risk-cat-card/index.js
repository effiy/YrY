/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryRiskCatCard · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryRiskCatCard] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-risk-cat-card-tpl';

  var READY_EVENT = 'yry-risk-cat-card-ready';

  var TAG_NAME = 'yry-risk-cat-card';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryRiskCatCard',
    templateId: 'yry-risk-cat-card-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryRiskCatCard',
        props: {
          icon: { type: String, default: '' },
          name: { type: String, default: '' },
          count: { type: String, default: '' },
          iconBg: { type: String, default: '' },
          hot: { type: Boolean, default: false },
          badge: { type: String, default: '' },
          metrics: { type: String, default: '[]' },
          progressWidth: { type: String, default: '50%' },
          progressColor: { type: String, default: '#f59e0b' },
          trendDir: { type: String, default: '' },
          trendText: { type: String, default: '' },
          trendSuffix: { type: String, default: '' }
        },
        computed: {
          parsedMetrics: function () {
            try {
              return JSON.parse(this.metrics);
            } catch (e) {
              return [];
            }
          },
          progressStyle: function () {
            return { '--rcc-prog-w': this.progressWidth, '--rcc-prog-bg': this.progressColor };
          }
        },
        template: templateHTML
      };
    }
  });
})();
