/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryTipBox · 提示框 自定义元素
   零依赖 vanilla JS — 纯 CSS 组件，JS 仅注册标签

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-tip-box/index.css">
     <yry-tip-box type="default|success|info|warn">
       <strong>标题</strong> 内容
     </yry-tip-box>
     <script src="../../../../cdn/yry-tip-box/index.js"></script>

   type 属性控制左边框和背景色:
   - default (或省略): 金色 (#ffc107)
   - success: 绿色 (#22c55e)
   - info: 青色 (#22d3ee)
   - warn: 红色 (#ef4444)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var TAG_NAME = 'yry-tip-box';
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, function () {
      return Reflect.construct(HTMLElement, [], this.constructor);
    });
  }
})();
