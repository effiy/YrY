/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryHealthBar · 健康/进度条 组件 (CSS-only, 无 Vue 依赖)

   本组件为纯 CSS 组件 — 无需 JS 运行时。
   页面直接使用 HTML 结构 + index.css 即可渲染。

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-health-bar/index.css">
     <div class="yry-bar-wrap">
       <div class="yry-bar-outer">
         <div class="yry-seg p" style="width:75%"></div>
         <div class="yry-seg f" style="width:20%"></div>
         <div class="yry-seg s" style="width:5%"></div>
       </div>
     </div>
   ═══════════════════════════════════════════════════════════════════════════ */

/* YryHealthBar is a CSS-only component. No JS registration needed. */
/* For programmatic creation, use standard DOM APIs:
     const bar = document.createElement('div');
     bar.className = 'yry-bar-wrap';
     bar.innerHTML = '<div class="yry-bar-outer">...</div>';
*/
