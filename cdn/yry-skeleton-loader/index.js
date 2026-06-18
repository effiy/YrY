/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySkeletonLoader · 骨架加载 脚本
   零依赖 vanilla JS — Custom Element

   属性:
     variant — "text" | "card" | "list" | "table" (预设)
     lines — 行数 (text/list 预设, 默认 3)
     width / height — 自定义尺寸 (如 "60%", "200px", "24px")
     radius — 自定义圆角 (如 "8px")

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-skeleton-loader/index.css">
     <yry-skeleton-loader variant="text" lines="5"></yry-skeleton-loader>
     <yry-skeleton-loader variant="card"></yry-skeleton-loader>
     <yry-skeleton-loader width="80%" height="20px" radius="4px"></yry-skeleton-loader>
     <script src="../../../../cdn/yry-skeleton-loader/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-skeleton-loader';

  var YrySkeletonLoader = function () {
    return Reflect.construct(HTMLElement, [], YrySkeletonLoader);
  };
  YrySkeletonLoader.prototype = Object.create(HTMLElement.prototype);

  YrySkeletonLoader.prototype.connectedCallback = function () {
    var variant = this.getAttribute('variant') || '';
    var lines = parseInt(this.getAttribute('lines')) || 3;
    var width = this.getAttribute('width') || '';
    var height = this.getAttribute('height') || '';
    var radius = this.getAttribute('radius') || '';

    // Custom dimensions
    if (width || height) {
      var el = document.createElement('div');
      el.className = 'sk-base';
      if (width) el.style.width = width;
      if (height) el.style.height = height;
      if (radius) el.style.borderRadius = radius;
      this.appendChild(el);
      return;
    }

    // Variant presets
    switch (variant) {
      case 'card':
        var card = document.createElement('div');
        card.className = 'sk-base sk-card';
        this.appendChild(card);
        break;

      case 'list':
        for (var i = 0; i < lines; i++) {
          var row = document.createElement('div');
          row.className = 'sk-list';
          row.innerHTML = '<div class="sk-circle"></div><div class="sk-line"></div>';
          this.appendChild(row);
        }
        break;

      case 'table':
        for (var j = 0; j < lines; j++) {
          var tr = document.createElement('div');
          tr.className = 'sk-base';
          tr.style.cssText = 'height:14px;margin-bottom:8px;width:' + (90 - j * 10) + '%';
          this.appendChild(tr);
        }
        break;

      case 'text':
      default:
        for (var k = 0; k < lines; k++) {
          var line = document.createElement('div');
          line.className = 'sk-base sk-text';
          if (k === lines - 1) line.style.width = '50%';
          this.appendChild(line);
        }
        break;
    }
  };

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YrySkeletonLoader);
  }
})();
