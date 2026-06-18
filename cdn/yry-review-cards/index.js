/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryReviewCards · 审查卡片样式 (custom element)
   零依赖 vanilla JS — 纯 CSS 组件
   审查.html 专用 — dim-card, case-card, rec-grid/rec-card/rec-pri

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-review-cards/index.css">
     <script src="../../../../cdn/yry-review-cards/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var TAG_NAME = 'yry-review-cards';
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, function () {
      return Reflect.construct(HTMLElement, [], this.constructor);
    });
  }
})();