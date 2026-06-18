/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryBadge · 状态徽章 自定义元素
   零依赖 vanilla JS — 纯 CSS 组件，JS 仅注册标签

   属性: type=pass|warn|fail|info|neutral, dot

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-badge/index.css">
     <yry-badge type="pass" dot>A 级</yry-badge>
     <script src="../../../../cdn/yry-badge/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var TAG_NAME = 'yry-badge';
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, function () {
      return Reflect.construct(HTMLElement, [], this.constructor);
    });
  }
})();
