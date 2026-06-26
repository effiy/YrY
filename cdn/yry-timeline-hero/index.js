/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryTimelineHero · 时间线可视化 脚本
   零依赖 vanilla JS — 从 JSON 数据渲染交互式时间线

   数据格式 (放在 <script type="application/json" id="..."> 中):
   {
     "title": "标题",
     "subtitle": "副标题",
     "progress": 32,       // 0-100 进度百分比
     "nodes": [
       { "label": "节点名", "time": "时间", "status": "done|active|pending", "tooltip": "悬停提示" }
     ]
   }

   使用方式:
     <script type="application/json" id="timeline-data">
     { "title": "...", "progress": 50, "nodes": [...] }
     </script>
     <yry-timeline-hero></yry-timeline-hero>
     <script src="yry-timeline-hero/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-timeline-hero';

  /* ── Status → icon mapping ────────────────────────────────────────── */
  var STATUS_ICONS = {
    done: '✓',
    active: '●',
    pending: '○'
  };

  var YryTimelineHero = function () {
    return Reflect.construct(HTMLElement, [], YryTimelineHero);
  };
  YryTimelineHero.prototype = Object.create(HTMLElement.prototype);

  YryTimelineHero.prototype.connectedCallback = function () {
    var self = this;

    // Read config from preceding <script type="application/json">
    var dataEl = this.previousElementSibling;
    if (!dataEl || dataEl.tagName !== 'SCRIPT' || dataEl.type !== 'application/json') {
      // Try finding by id
      var id = this.id;
      if (id) {
        dataEl = document.querySelector('script[type="application/json"][id="' + id + '"]');
        if (dataEl && dataEl === this.previousElementSibling) { /* ok */ }
        else if (dataEl) { /* found by id but not adjacent */ }
        else dataEl = null;
      }
    }

    var cfg;
    if (dataEl) {
      try { cfg = JSON.parse(dataEl.textContent); }
      catch (e) { cfg = null; }
    }
    if (!cfg) {
      this.innerHTML = '<div class="tl-hero" style="text-align:center;padding:24px;color:var(--yry-text-tertiary)">⏱️ 无时间线数据</div>';
      return;
    }

    var progress = typeof cfg.progress === 'number' ? Math.min(100, Math.max(0, cfg.progress)) : 0;
    var nodes = cfg.nodes || [];
    var title = cfg.title || '';
    var subtitle = cfg.subtitle || '';

    // Build hero
    var hero = document.createElement('div');
    hero.className = 'tl-hero';

    var head = document.createElement('div');
    head.className = 'tl-head';
    head.innerHTML =
      '<span class="tl-icon">⏱️</span>' +
      '<span class="tl-title">' + escapeHtml(title) + '</span>' +
      (subtitle ? '<span class="tl-sub">' + escapeHtml(subtitle) + '</span>' : '');
    hero.appendChild(head);

    // Track
    var trackWrap = document.createElement('div');
    trackWrap.className = 'tl-track-wrap';

    var track = document.createElement('div');
    track.className = 'tl-track';

    // Base line + progress
    var line = document.createElement('div');
    line.className = 'tl-line';
    track.appendChild(line);

    var progBar = document.createElement('div');
    progBar.className = 'tl-progress';
    progBar.style.width = progress + '%';
    track.appendChild(progBar);

    // Nodes
    var nodesWrap = document.createElement('div');
    nodesWrap.className = 'tl-nodes';

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var node = document.createElement('div');
      node.className = 'tl-node ' + (n.status || 'pending');

      var dot = document.createElement('div');
      dot.className = 'tl-dot';
      dot.textContent = STATUS_ICONS[n.status] || '○';
      node.appendChild(dot);

      var label = document.createElement('div');
      label.className = 'tl-label';
      label.textContent = n.label || '';
      node.appendChild(label);

      if (n.time) {
        var timeEl = document.createElement('div');
        timeEl.className = 'tl-time';
        timeEl.textContent = n.time;
        node.appendChild(timeEl);
      }

      if (n.tooltip) {
        var tip = document.createElement('div');
        tip.className = 'tl-tooltip';
        tip.textContent = n.tooltip;
        node.appendChild(tip);
      }

      nodesWrap.appendChild(node);
    }

    track.appendChild(nodesWrap);
    trackWrap.appendChild(track);
    hero.appendChild(trackWrap);
    this.appendChild(hero);
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryTimelineHero);
  }
})();
