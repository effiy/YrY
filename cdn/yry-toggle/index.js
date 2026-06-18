/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryToggle · 开关 脚本
   零依赖 vanilla JS — Custom Element

   属性: checked (boolean), disabled (boolean), label (string)
   事件: yry-change → detail: { checked: boolean }
   方法: toggle()

   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var TAG_NAME = 'yry-toggle';

  var YryToggle = function () {
    return Reflect.construct(HTMLElement, [], YryToggle);
  };
  YryToggle.prototype = Object.create(HTMLElement.prototype);

  YryToggle.prototype.connectedCallback = function () {
    var self = this;
    var label = this.getAttribute('label') || '';

    this.innerHTML =
      '<span class="tg-track"><span class="tg-thumb"></span></span>' +
      (label ? '<span class="tg-label">' + escapeHtml(label) + '</span>' : '');

    this.addEventListener('click', function () {
      if (self.hasAttribute('disabled')) return;
      self.toggle();
    });

    // Keyboard support
    this.setAttribute('tabindex', this.hasAttribute('disabled') ? '-1' : '0');
    this.setAttribute('role', 'switch');
    this.setAttribute('aria-checked', String(this.hasAttribute('checked')));

    this.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (self.hasAttribute('disabled')) return;
        self.toggle();
      }
    });
  };

  YryToggle.prototype.toggle = function () {
    if (this.hasAttribute('checked')) {
      this.removeAttribute('checked');
    } else {
      this.setAttribute('checked', '');
    }
    this.setAttribute('aria-checked', String(this.hasAttribute('checked')));
    this.dispatchEvent(new CustomEvent('yry-change', {
      detail: { checked: this.hasAttribute('checked') },
      bubbles: true
    }));
  };

  // Observe attribute changes
  YryToggle.observedAttributes = ['checked', 'disabled'];

  YryToggle.prototype.attributeChangedCallback = function (name) {
    if (name === 'disabled') {
      this.setAttribute('tabindex', this.hasAttribute('disabled') ? '-1' : '0');
    }
    if (name === 'checked') {
      this.setAttribute('aria-checked', String(this.hasAttribute('checked')));
    }
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryToggle);
  }
})();
