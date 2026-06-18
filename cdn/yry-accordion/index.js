/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryAccordion · 折叠面板 自定义元素
   零依赖 vanilla JS — 纯 CSS + 原生 <details> 元素

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-accordion/index.css">
     <yry-accordion>
       <details open><summary>标题</summary><div class="ac-body">内容</div></details>
       <details><summary>标题2</summary><div class="ac-body">内容2</div></details>
     </yry-accordion>
     <script src="../../../../cdn/yry-accordion/index.js"></script>

   原生 <details>/<summary> 提供开箱即用的折叠行为，
   组件仅提供样式主题和圆角容器。
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var TAG_NAME = 'yry-accordion';
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, function () {
      return Reflect.construct(HTMLElement, [], this.constructor);
    });
  }
})();
