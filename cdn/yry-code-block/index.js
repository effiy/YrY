/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCodeBlock · 代码块 脚本
   零依赖 vanilla JS — Custom Element + 复制到剪贴板

   属性:
     lang — 语言标签 (显示在头部，省略则不显示头部)
     copy — 是否显示复制按钮 (默认 true)

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-code-block/index.css">
     <yry-code-block lang="bash">echo hello</yry-code-block>
     <script src="../../../../cdn/yry-code-block/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-code-block';

  var YryCodeBlock = function () {
    return Reflect.construct(HTMLElement, [], YryCodeBlock);
  };
  YryCodeBlock.prototype = Object.create(HTMLElement.prototype);

  YryCodeBlock.prototype.connectedCallback = function () {
    var self = this;
    var lang = this.getAttribute('lang') || '';
    var showCopy = this.getAttribute('copy') !== 'false';

    // Collect light DOM text content
    var code = (this.textContent || '').replace(/^\n+|\n+$/g, '');

    // Clear and rebuild
    this.textContent = '';

    // Header (only if lang is specified)
    if (lang) {
      var head = document.createElement('div');
      head.className = 'cb-head';

      var langEl = document.createElement('span');
      langEl.className = 'cb-lang';
      langEl.textContent = lang;
      head.appendChild(langEl);

      if (showCopy) {
        var copyBtn = document.createElement('button');
        copyBtn.className = 'cb-copy';
        copyBtn.textContent = '📋 复制';
        copyBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          copyToClipboard(code, copyBtn);
        });
        head.appendChild(copyBtn);
      }

      this.appendChild(head);
    }

    // Code body
    var pre = document.createElement('pre');
    pre.className = 'cb-code';
    pre.textContent = code;
    this.appendChild(pre);
  };

  function copyToClipboard(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showCopied(btn);
      }).catch(function () {
        fallbackCopy(text, btn);
      });
    } else {
      fallbackCopy(text, btn);
    }
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showCopied(btn); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  function showCopied(btn) {
    btn.textContent = '✓ 已复制';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.textContent = '📋 复制';
      btn.classList.remove('copied');
    }, 2000);
  }

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryCodeBlock);
  }
})();
