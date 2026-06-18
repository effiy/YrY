/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCheckItem · 检查项 自定义元素
   零依赖 vanilla JS — 纯 CSS 组件，JS 仅注册标签

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-check-item/index.css">
     <yry-check-item>
       <div class="ci-row">
         <span class="ci-ico">🔍</span>
         <span class="ci-text">检查内容</span>
         <span class="ci-day">每日</span>
         <a class="ci-link" href="#">→ 详情</a>
       </div>
     </yry-check-item>
     <script src="../../../../cdn/yry-check-item/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var TAG_NAME = 'yry-check-item';
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, function () {
      return Reflect.construct(HTMLElement, [], this.constructor);
    });
  }
})();
