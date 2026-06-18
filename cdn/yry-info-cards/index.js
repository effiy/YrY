/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryInfoCards · 信息卡片网格 (custom element)
   零依赖 vanilla JS — 纯 CSS 组件，JS 仅注册标签

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-info-cards/index.css">
     <script src="../../../../cdn/yry-info-cards/index.js"></script>
     <yry-info-cards>
       <div class="yry-card">
         <div class="yry-card-header"><div class="yry-card-dot cyan"></div><h3>标题</h3></div>
         <ul><li>内容...</li></ul>
       </div>
     </yry-info-cards>

   Cat-A (Mono dark theme) 专用 — 卡片使用硬编码颜色匹配 shared-a.css 主题
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var TAG_NAME = 'yry-info-cards';
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, function () {
      return Reflect.construct(HTMLElement, [], this.constructor);
    });
  }
})();