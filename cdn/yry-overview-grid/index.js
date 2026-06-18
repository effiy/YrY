/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryOverviewGrid · 概览卡片网格 自定义元素
   零依赖 vanilla JS — 纯 CSS 组件，JS 仅注册标签

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-overview-grid/index.css">
     <yry-overview-grid>
       <div class="ov-card">...</div>
     </yry-overview-grid>
     <script src="../../../../cdn/yry-overview-grid/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var TAG_NAME = 'yry-overview-grid';
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, function () {
      return Reflect.construct(HTMLElement, [], this.constructor);
    });
  }
})();
