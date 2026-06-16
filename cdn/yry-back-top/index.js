/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryBackTop · 回到顶部按钮 (零配置自初始化)
   适用: 所有需要回到顶部功能的页面

   本文件负责:
     1) 创建 <button class="back-top">↑</button> 并注入到 body
     2) 绑定 scroll 事件: 超过 400px 显示,否则隐藏
     3) 绑定 click 事件: 平滑滚动回顶部

   页面使用方式 (零配置,仅需 2 行):
     <link rel="stylesheet" href="../../../../cdn/yry-back-top/index.css">
     <script src="../../../../cdn/yry-back-top/index.js"></script>

   无需写任何 JS 或 HTML — 脚本加载后自动生效。
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var THRESHOLD = 400;

  var btn = document.createElement('button');
  btn.className = 'back-top';
  btn.setAttribute('aria-label', '回到顶部');
  btn.textContent = '\u2191'; // ↑

  var ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        btn.classList.toggle('visible', window.scrollY > THRESHOLD);
        ticking = false;
      });
      ticking = true;
    }
  }

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* 等待 DOM ready 后注入 */
  function init() {
    document.body.appendChild(btn);
    window.addEventListener('scroll', onScroll, { passive: true });
    /* 初始状态: 如果页面已有滚动位置则立即显示 */
    if (window.scrollY > THRESHOLD) btn.classList.add('visible');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();