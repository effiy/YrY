/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryEmptyState · 空状态 自定义元素
   零依赖 vanilla JS — 从属性渲染空状态占位

   属性: icon (emoji), title, description
   插槽: slot="action" — 操作按钮区域

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-empty-state/index.css">
     <yry-empty-state icon="🔍" title="无结果" description="...">
       <button slot="action">重试</button>
     </yry-empty-state>
     <script src="../../../../cdn/yry-empty-state/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-empty-state';

  var YryEmptyState = function () {
    return Reflect.construct(HTMLElement, [], YryEmptyState);
  };
  YryEmptyState.prototype = Object.create(HTMLElement.prototype);

  YryEmptyState.prototype.connectedCallback = function () {
    var icon = this.getAttribute('icon') || '📭';
    var title = this.getAttribute('title') || '';
    var desc = this.getAttribute('description') || '';

    var html = '';
    if (icon) html += '<div class="es-icon">' + escapeHtml(icon) + '</div>';
    if (title) html += '<div class="es-title">' + escapeHtml(title) + '</div>';
    if (desc) html += '<div class="es-desc">' + escapeHtml(desc) + '</div>';
    html += '<div class="es-actions"><slot name="action"></slot></div>';

    this.innerHTML = html + this.innerHTML;
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryEmptyState);
  }
})();
