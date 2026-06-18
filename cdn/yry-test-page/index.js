/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryTestPage · 测试页面组件 (custom element)
   零依赖 vanilla JS — 纯 CSS 组件
   tests/index.html 专用

   页面使用方式:
     <link rel="stylesheet" href="../cdn/yry-test-page/index.css">
     <script src="../cdn/yry-test-page/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var TAG_NAME = 'yry-test-page';
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, function () {
      return Reflect.construct(HTMLElement, [], this.constructor);
    });
  }
})();