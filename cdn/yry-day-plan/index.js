/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryDayPlan · 每日计划卡片 自定义元素
   零依赖 vanilla JS — 纯 CSS 组件，JS 仅注册标签

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-day-plan/index.css">
     <yry-day-plan>
       <div class="day-card d1|d2|d3">...</div>
     </yry-day-plan>
     <script src="../../../../cdn/yry-day-plan/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var TAG_NAME = 'yry-day-plan';
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, function () {
      return Reflect.construct(HTMLElement, [], this.constructor);
    });
  }
})();
