/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryHelpOverlay · 快捷键帮助面板 脚本
   零依赖 vanilla JS — 自定义元素 + 全局键盘监听

   功能:
   - 按 ? 键打开帮助面板
   - 按 Esc 键关闭
   - 点击背景遮罩关闭
   - 右下角自动注入 FAB 帮助按钮
   - 打开时自动聚焦面板，关闭时恢复焦点

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-help-overlay/index.css">
     <yry-help-overlay>
       <div class="help-card">快捷键内容</div>
     </yry-help-overlay>
     <script src="../../../../cdn/yry-help-overlay/index.js"></script>

   Light DOM: .help-card 由页面提供，组件负责显示/隐藏逻辑
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-help-overlay';
  var BODY_OPEN_CLASS = 'help-overlay-open';

  var YryHelpOverlay = function () {
    return Reflect.construct(HTMLElement, [], YryHelpOverlay);
  };
  YryHelpOverlay.prototype = Object.create(HTMLElement.prototype);

  YryHelpOverlay.prototype.connectedCallback = function () {
    var self = this;

    // Create overlay wrapper
    var overlay = document.createElement('div');
    overlay.className = 'help-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', '快捷键帮助');

    // Move light DOM children into overlay
    while (this.firstChild) {
      overlay.appendChild(this.firstChild);
    }
    this.appendChild(overlay);

    // Create FAB button
    var fab = document.createElement('button');
    fab.className = 'fab-help';
    fab.setAttribute('aria-label', '打开帮助');
    fab.textContent = '?';
    fab.addEventListener('click', function (e) {
      e.stopPropagation();
      self.show();
    });
    this.appendChild(fab);

    // Store refs
    this._overlay = overlay;
    this._fab = fab;
    this._lastFocus = null;

    // Click backdrop to close
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        self.hide();
      }
    });

    // Bind methods
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);

    // Global keyboard listener (delegates to active instance)
    if (!YryHelpOverlay._globalBound) {
      document.addEventListener('keydown', function (e) {
        // Find visible overlay
        var active = document.querySelector(TAG_NAME + ' .help-overlay.show');
        var instance = active ? active.parentElement : document.querySelector(TAG_NAME);
        if (instance && instance._onKeyDown) {
          instance._onKeyDown(e);
        }
      });
      YryHelpOverlay._globalBound = true;
    }
  };

  YryHelpOverlay.prototype.show = function () {
    if (!this._overlay) return;
    this._lastFocus = document.activeElement;
    this._overlay.classList.add('show');
    document.body.classList.add(BODY_OPEN_CLASS);

    // Focus first focusable element in card
    var card = this._overlay.querySelector('.help-card');
    if (card) {
      var focusable = card.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) {
        setTimeout(function () { focusable.focus(); }, 100);
      }
    }
  };

  YryHelpOverlay.prototype.hide = function () {
    if (!this._overlay) return;
    this._overlay.classList.remove('show');
    document.body.classList.remove(BODY_OPEN_CLASS);

    // Restore focus
    if (this._lastFocus && typeof this._lastFocus.focus === 'function') {
      setTimeout(function () {
        try { this._lastFocus.focus(); } catch (e) { /* ignore */ }
      }.bind(this), 100);
    }
  };

  YryHelpOverlay.prototype._onKeyDown = function (e) {
    // Don't intercept when user is typing in an input
    var tag = (e.target.tagName || '').toLowerCase();
    var isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;

    if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey && !isInput) {
      e.preventDefault();
      this.show();
      return;
    }

    if (e.key === 'Escape' && this._overlay && this._overlay.classList.contains('show')) {
      e.preventDefault();
      this.hide();
      return;
    }
  };

  YryHelpOverlay._globalBound = false;

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryHelpOverlay);
  }
})();
