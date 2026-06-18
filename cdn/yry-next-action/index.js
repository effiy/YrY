/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryNextAction · 行动号召横幅 自定义元素
   零依赖 vanilla JS — 纯 CSS 组件，JS 仅注册标签

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-next-action/index.css">
     <yry-next-action>
       <span class="na-ico">📋</span>
       <div class="na-body">
         <div class="na-title">标题</div>
         <div class="na-desc">描述</div>
       </div>
       <button class="na-cta">按钮</button>
     </yry-next-action>
     <script src="../../../../cdn/yry-next-action/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var TAG_NAME = 'yry-next-action';
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, function () {
      return Reflect.construct(HTMLElement, [], this.constructor);
    });
  }
})();
