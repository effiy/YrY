/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySpinner · 加载旋转器 脚本
   零依赖 vanilla JS — Custom Element · SVG 旋转动画

   属性:
     size — sm (20px) | md (32px, 默认) | lg (48px)
     color — CSS 颜色值 (默认 var(--yry-accent, #ffc107))
     label — 加载文本 (可选)

   使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-spinner/index.css">
     <yry-spinner size="md"></yry-spinner>
     <yry-spinner label="加载中..." color="var(--yry-pass)"></yry-spinner>
     <script src="../../../../cdn/yry-spinner/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-spinner';
  var SVG_NS = 'http://www.w3.org/2000/svg';

  var SIZES = { sm: 20, md: 32, lg: 48 };

  var YrySpinner = function () {
    return Reflect.construct(HTMLElement, [], YrySpinner);
  };
  YrySpinner.prototype = Object.create(HTMLElement.prototype);

  YrySpinner.prototype.connectedCallback = function () {
    var sizeKey = this.getAttribute('size') || 'md';
    var px = SIZES[sizeKey] || 32;
    var color = this.getAttribute('color') || 'var(--yry-accent, #ffc107)';
    var label = this.getAttribute('label') || '';

    var strokeW = sizeKey === 'sm' ? 2.5 : 3;
    var r = (px / 2) - strokeW;

    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'sp-svg');
    svg.setAttribute('width', String(px));
    svg.setAttribute('height', String(px));
    svg.setAttribute('viewBox', '0 0 ' + px + ' ' + px);

    // Track circle
    var track = document.createElementNS(SVG_NS, 'circle');
    track.setAttribute('class', 'sp-track');
    track.setAttribute('cx', String(px / 2));
    track.setAttribute('cy', String(px / 2));
    track.setAttribute('r', String(r));
    track.setAttribute('stroke-width', String(strokeW));
    svg.appendChild(track);

    // Head arc
    var head = document.createElementNS(SVG_NS, 'circle');
    head.setAttribute('class', 'sp-head');
    head.setAttribute('cx', String(px / 2));
    head.setAttribute('cy', String(px / 2));
    head.setAttribute('r', String(r));
    head.setAttribute('stroke-width', String(strokeW));
    svg.appendChild(head);

    // Apply custom color via CSS variable
    svg.style.setProperty('--sp-color', color);

    this.appendChild(svg);

    if (label) {
      var labelEl = document.createElement('span');
      labelEl.className = 'sp-label';
      labelEl.textContent = label;
      this.appendChild(labelEl);
    }
  };

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YrySpinner);
  }
})();
