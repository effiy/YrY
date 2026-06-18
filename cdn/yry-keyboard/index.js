/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryKeyboard · 键盘按键 脚本
   零依赖 vanilla JS — Custom Element

   属性:
     keys — 空格分隔的按键名 (如 "⌘ K" "Ctrl Shift Esc")
     size — sm | md (默认)

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-keyboard/index.css">
     <yry-kbd keys="⌘ K"></yry-kbd>
     <yry-kbd keys="Ctrl C" size="sm"></yry-kbd>
     <script src="../../../../cdn/yry-keyboard/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-kbd';

  var YryKbd = function () {
    return Reflect.construct(HTMLElement, [], YryKbd);
  };
  YryKbd.prototype = Object.create(HTMLElement.prototype);

  YryKbd.prototype.connectedCallback = function () {
    var keys = (this.getAttribute('keys') || '').trim();
    if (!keys) {
      // Fallback: use text content
      keys = (this.textContent || '').trim();
    }

    var parts = keys.split(/\s+/);
    this.textContent = '';

    parts.forEach(function (key, i) {
      var span = document.createElement('span');
      span.className = 'kbd-key';
      span.textContent = key;
      this.appendChild(span);

      // Plus separator between keys
      if (i < parts.length - 1) {
        // Visual gap handled by :host gap
      }
    }, this);
  };

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryKbd);
  }
})();
