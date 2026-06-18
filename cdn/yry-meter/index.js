/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryMeter · 仪表盘 脚本
   零依赖 vanilla JS — Custom Element

   属性:
     value — 当前值 (0-100 或其他 max)
     max — 最大值 (默认 100)
     size — sm | md | lg (默认 md)
     label — 标签文本

   自动着色: ≥80 绿色, ≥50 橙色, <50 红色

   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-meter';

  var YryMeter = function () {
    return Reflect.construct(HTMLElement, [], YryMeter);
  };
  YryMeter.prototype = Object.create(HTMLElement.prototype);

  YryMeter.prototype.connectedCallback = function () {
    var value = parseFloat(this.getAttribute('value')) || 0;
    var max = parseFloat(this.getAttribute('max')) || 100;
    var label = this.getAttribute('label') || '';
    var pct = Math.min(100, Math.max(0, (value / max) * 100));

    // Auto-color: ≥80 green, ≥50 orange, <50 red
    var color;
    if (pct >= 80) color = 'var(--yry-pass, #22c55e)';
    else if (pct >= 50) color = 'var(--yry-warn, #f59e0b)';
    else color = 'var(--yry-fail, #ef4444)';

    // Track + fill
    var track = document.createElement('div');
    track.className = 'mt-track';

    var fill = document.createElement('div');
    fill.className = 'mt-fill';
    fill.style.width = pct + '%';
    fill.style.setProperty('--mt-color', color);
    track.appendChild(fill);

    this.appendChild(track);

    // Label
    if (label) {
      var labelRow = document.createElement('div');
      labelRow.className = 'mt-label';
      labelRow.innerHTML =
        '<span class="mt-label-text">' + escapeHtml(label) + '</span>' +
        '<span class="mt-label-val">' + Math.round(pct) + '%</span>';
      labelRow.querySelector('.mt-label-val').style.setProperty('--mt-color', color);
      this.appendChild(labelRow);
    }
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryMeter);
  }
})();
