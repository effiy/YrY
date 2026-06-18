/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryTooltip · 悬停提示 脚本
   零依赖 vanilla JS — Custom Element

   属性:
     text — 提示文本 (简单模式)
     position — top | bottom | left | right (默认 top)

   插槽:
     default — 触发元素
     slot="content" — 富文本提示内容 (覆盖 text 属性)

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-tooltip/index.css">
     <yry-tooltip text="提示" position="top">
       <button>悬停</button>
     </yry-tooltip>
     <script src="../../../../cdn/yry-tooltip/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-tooltip';

  var YryTooltip = function () {
    return Reflect.construct(HTMLElement, [], YryTooltip);
  };
  YryTooltip.prototype = Object.create(HTMLElement.prototype);

  YryTooltip.prototype.connectedCallback = function () {
    var self = this;
    var text = this.getAttribute('text') || '';
    var position = this.getAttribute('position') || 'top';

    // Find content slot (if provided) or use text attribute
    var contentSlot = this.querySelector('[slot="content"]');
    var tipContent = contentSlot ? contentSlot.innerHTML : escapeHtml(text);

    if (!tipContent) return;

    // Create bubble
    var bubble = document.createElement('div');
    bubble.className = 'tt-bubble tt-' + position;
    bubble.innerHTML = tipContent;

    this.appendChild(bubble);

    // Show/hide on hover + focus
    var showTimer = null;
    var hideTimer = null;

    this.addEventListener('mouseenter', function () {
      clearTimeout(hideTimer);
      showTimer = setTimeout(function () { bubble.classList.add('show'); }, 150);
    });

    this.addEventListener('mouseleave', function () {
      clearTimeout(showTimer);
      hideTimer = setTimeout(function () { bubble.classList.remove('show'); }, 100);
    });

    this.addEventListener('focusin', function () {
      bubble.classList.add('show');
    });

    this.addEventListener('focusout', function () {
      bubble.classList.remove('show');
    });
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryTooltip);
  }
})();
