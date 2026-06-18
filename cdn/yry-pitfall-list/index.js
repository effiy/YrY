/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryPitfallList · 常见陷阱列表 自定义元素
   零依赖 vanilla JS — 纯 CSS 组件，JS 仅注册标签

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-pitfall-list/index.css">
     <yry-pitfall-list>
       <div class="pitfall [warn|tip]">
         <div class="pf-head">...</div>
         <div class="pf-body">...</div>
         <div class="pf-fix">...</div>
       </div>
     </yry-pitfall-list>
     <script src="../../../../cdn/yry-pitfall-list/index.js"></script>

   子元素 (.pitfall) 由页面/Markdown 提取器直接生成，
   组件提供容器样式 + hover 效果 + 严重度颜色系统。
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var TAG_NAME = 'yry-pitfall-list';
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, function () {
      return Reflect.construct(HTMLElement, [], this.constructor);
    });
  }
})();
