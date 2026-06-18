/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySearchBar · 搜索栏 脚本
   零依赖 vanilla JS — Custom Element + 防抖 + 自定义事件

   属性:
     placeholder — 提示文本 (默认 "搜索...")
     compact — 紧凑模式 (更窄的最大宽度)
     debounce — 防抖毫秒 (默认 200)

   事件:
     yry-search — { value, detail } 输入变化时触发
     yry-search-enter — 按 Enter 时触发

   快捷键: ⌘K / Ctrl+K 聚焦，Esc 清空并失焦

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-search-bar/index.css">
     <yry-search-bar placeholder="搜索..." id="search"></yry-search-bar>
     <script src="../../../../cdn/yry-search-bar/index.js"></script>
     <script>
       document.getElementById('search').addEventListener('yry-search', function(e) {
         console.log('Search:', e.detail.value);
       });
     </script>
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-search-bar';

  var YrySearchBar = function () {
    return Reflect.construct(HTMLElement, [], YrySearchBar);
  };
  YrySearchBar.prototype = Object.create(HTMLElement.prototype);

  YrySearchBar.prototype.connectedCallback = function () {
    var self = this;
    var placeholder = this.getAttribute('placeholder') || '搜索...';
    var debounceMs = parseInt(this.getAttribute('debounce')) || 200;
    var debounceTimer = null;

    // Build UI
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'sb-input';
    input.placeholder = placeholder;
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');

    var icon = document.createElement('span');
    icon.className = 'sb-icon';
    icon.textContent = '🔍';

    var clearBtn = document.createElement('button');
    clearBtn.className = 'sb-clear';
    clearBtn.textContent = '×';
    clearBtn.setAttribute('aria-label', '清空搜索');
    clearBtn.setAttribute('type', 'button');

    var kbd = document.createElement('span');
    kbd.className = 'sb-kbd';
    kbd.textContent = '⌘K';

    this.appendChild(icon);
    this.appendChild(input);
    this.appendChild(clearBtn);
    this.appendChild(kbd);

    // ── Events ───────────────────────────────────────────────────
    input.addEventListener('input', function () {
      var val = input.value;
      clearBtn.classList.toggle('visible', val.length > 0);

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        self.dispatchEvent(new CustomEvent('yry-search', {
          detail: { value: val },
          bubbles: true
        }));
      }, debounceMs);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        if (debounceTimer) clearTimeout(debounceTimer);
        self.dispatchEvent(new CustomEvent('yry-search-enter', {
          detail: { value: input.value },
          bubbles: true
        }));
      }
      if (e.key === 'Escape') {
        input.value = '';
        clearBtn.classList.remove('visible');
        input.blur();
        self.dispatchEvent(new CustomEvent('yry-search', {
          detail: { value: '' },
          bubbles: true
        }));
      }
    });

    clearBtn.addEventListener('click', function () {
      input.value = '';
      clearBtn.classList.remove('visible');
      input.focus();
      self.dispatchEvent(new CustomEvent('yry-search', {
        detail: { value: '' },
        bubbles: true
      }));
    });

    // Global ⌘K / Ctrl+K shortcut
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        // Only if not already in an input
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && !e.target.isContentEditable) {
          e.preventDefault();
          input.focus();
          input.select();
        }
      }
    });

    // Expose API
    this._input = input;
    this.focus = function () { input.focus(); };
    this.clear = function () {
      input.value = '';
      clearBtn.classList.remove('visible');
      self.dispatchEvent(new CustomEvent('yry-search', {
        detail: { value: '' },
        bubbles: true
      }));
    };
    this.getValue = function () { return input.value; };
    this.setValue = function (val) {
      input.value = val;
      clearBtn.classList.toggle('visible', val.length > 0);
    };
  };

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YrySearchBar);
  }
})();
