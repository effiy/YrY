/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryMilestoneGrid · 里程碑卡片 自定义元素
   零依赖 vanilla JS — 纯 CSS 组件，JS 仅注册标签

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-milestone-grid/index.css">
     <yry-milestone-grid>
       <div class="ms-card">...</div>
     </yry-milestone-grid>
     <script src="../../../../cdn/yry-milestone-grid/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var TAG_NAME = 'yry-milestone-grid';
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, function () {
      return Reflect.construct(HTMLElement, [], this.constructor);
    });
  }
})();
