/* ═══════════════════════════════════════════════════════════════════════
   YryCardReport · 卡片分析报告模态框
   暴露 window.YryCardReport.open(card) — 传入卡片 DOM,打开对应分析报告
   支持 .item-card / .story-card / .scene-card 三种类型
   ═══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var TYPE_LABEL = {
    'item-card':  { label: '组件', icon: '📦' },
    'story-card': { label: '故事', icon: '📑' },
    'scene-card': { label: '场景', icon: '🎬' }
  };
  var ICON_MOD_LABEL = {
    skill: '技能 (Skill)',
    agent: 'Agent 角色',
    rule:  '规则 (Rule)',
    ref:   '参考 (Reference)'
  };
  var DIM_NAMES = {
    health: { name: '健康度', icon: '🩺' },
    test:   { name: '测试度', icon: '🧪' },
    si:     { name: '自改进', icon: '🧬' }
  };

  function gradeOf(s) {
    return s >= 80 ? 'A' : s >= 60 ? 'B' : s >= 40 ? 'C' : 'D';
  }
  function colorClass(s) {
    return s >= 80 ? 'is-good' : s >= 60 ? 'is-warn' : 'is-fail';
  }
  function hexColor(s) {
    return s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444';
  }
  function levelText(s) {
    if (s >= 85) return '优秀';
    if (s >= 70) return '良好';
    if (s >= 55) return '一般';
    if (s >= 40) return '偏弱';
    return '风险';
  }

  /* 从 .ydb-score-badge 中读取三档评分 (与 inject 侧 makeBadge 一致) */
  function readScores(card) {
    var badge = card.querySelector('.ydb-score-badge');
    if (!badge) return null;
    var nums = badge.querySelectorAll('.ydb-badge-num');
    if (nums.length < 3) return null;
    function parse(span) {
      var txt = (span.textContent || '').trim();        // "86/A"
      var m = txt.match(/^(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    }
    return { health: parse(nums[0]), test: parse(nums[1]), si: parse(nums[2]) };
  }

  function detectType(card) {
    if (card.classList.contains('item-card'))  return 'item-card';
    if (card.classList.contains('story-card')) return 'story-card';
    if (card.classList.contains('scene-card')) return 'scene-card';
    return '';
  }

  function detectIconModifier(card) {
    var iconEl = card.querySelector('.icon');
    if (!iconEl) return '';
    var cls = iconEl.className || '';
    var m = cls.match(/\b(skill|agent|rule|ref)\b/);
    return m ? m[1] : '';
  }

  function textOf(el) {
    return el ? (el.textContent || '').trim() : '';
  }

  /* 提取卡片显示用的元信息 */
  function extractCardInfo(card, type) {
    var info = { desc: '', tags: [], scenes: [], meta: '', href: '', modifier: '' };
    if (type === 'item-card') {
      info.modifier = detectIconModifier(card);
      var nameA = card.querySelector('.body .name a');
      if (nameA) info.href = nameA.getAttribute('href') || '';
      var descEl = card.querySelector('.body .desc');
      info.desc = textOf(descEl);
      var metaEl = card.querySelector('.body .meta .detail');
      info.meta = textOf(metaEl);
      card.querySelectorAll('.body .tags-row .tag-chip, .body .tags-row yry-tag-chip')
        .forEach(function (t) { var tx = textOf(t); if (tx) info.tags.push(tx); });
    } else if (type === 'story-card') {
      var sNameA = card.querySelector('.story-name a');
      if (sNameA) info.href = sNameA.getAttribute('href') || '';
      info.desc = textOf(card.querySelector('.story-desc'));
      card.querySelectorAll('.story-scenes .scene-tag').forEach(function (s) {
        var tx = textOf(s); if (tx) info.scenes.push(tx);
      });
    } else if (type === 'scene-card') {
      var cNameA = card.querySelector('.scene-name a');
      if (cNameA) info.href = cNameA.getAttribute('href') || '';
      info.desc = textOf(card.querySelector('.scene-desc'));
      info.meta = textOf(card.querySelector('.scene-num'));
    }
    return info;
  }

  function extractCardName(card, type) {
    if (type === 'item-card') {
      var nameA = card.querySelector('.body .name a');
      if (nameA) return textOf(nameA);
      var nameSpan = card.querySelector('.body .name span');
      if (nameSpan) return textOf(nameSpan);
    } else if (type === 'story-card') {
      var sA = card.querySelector('.story-name a');
      if (sA) return textOf(sA);
      var sSpan = card.querySelector('.story-name span');
      if (sSpan) return textOf(sSpan);
    } else if (type === 'scene-card') {
      var cA = card.querySelector('.scene-name a');
      if (cA) return textOf(cA);
      var cSpan = card.querySelector('.scene-name span');
      if (cSpan) return textOf(cSpan);
    }
    return textOf(card.querySelector('.name, .story-name, .scene-name')) || '未命名卡片';
  }

  /* 基于评分生成分析文本 — 不依赖外部数据,纯由分数推导 */
  function buildAnalysis(name, type, scores) {
    var dims = [
      { key: 'health', s: scores.health, label: '健康度', en: 'health' },
      { key: 'test',   s: scores.test,   label: '测试度', en: 'test' },
      { key: 'si',     s: scores.si,     label: '自改进', en: 'si' }
    ];
    dims.sort(function (a, b) { return a.s - b.s; });
    var lowest = dims[0], highest = dims[2];
    var lines = [];

    var typeLabel = (TYPE_LABEL[type] || {}).label || '卡片';
    lines.push('<strong>' + escapeHtml(name) + '</strong> 是一张 <strong>' + typeLabel + '</strong> 卡片。');

    if (highest.s >= 80) {
      lines.push('其 <strong>' + highest.label + '</strong> 表现突出(' + highest.s + '分 · ' + levelText(highest.s) + '),反映该' + typeLabel + '在此维度上已有较完善的支撑。');
    }
    if (lowest.s < 60) {
      var suggestion = '';
      if (lowest.key === 'health') suggestion = '建议优先排查其健康检查告警,关注依赖、体积与范式合规。';
      else if (lowest.key === 'test') suggestion = '测试覆盖偏弱,建议补充对应单元/集成测试。';
      else suggestion = '自改进闭环尚未形成,建议沉淀经验为技能并接入自循环报告。';
      lines.push('<strong>' + lowest.label + '</strong> 为当前最弱维度(' + lowest.s + '分 · ' + levelText(lowest.s) + '),' + suggestion);
    } else if (lowest.s < 80) {
      lines.push('<strong>' + lowest.label + '</strong> 为主要改进方向(' + lowest.s + '分 · ' + levelText(lowest.s) + '),整体水平尚可但仍有提升空间。');
    } else {
      lines.push('三档评分均在 A 级,整体处于稳定状态,可维持当前节奏。');
    }
    return lines.join(' ');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ── 模态框单例 ─────────────────────────────────────────── */
  var overlayEl = null, modalEl = null, bodyEl = null, titleEl = null, iconEl = null,
      typeEl = null, closeBtn = null, lastFocused = null;

  function ensureDom() {
    if (overlayEl) return;
    overlayEl = document.createElement('div');
    overlayEl.className = 'ydb-report-overlay';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-modal', 'true');
    overlayEl.setAttribute('aria-labelledby', 'ydb-report-title-id');
    overlayEl.innerHTML = [
      '<div class="ydb-report-modal">',
      '  <div class="ydb-report-header">',
      '    <span class="ydb-report-icon">📦</span>',
      '    <span class="ydb-report-title" id="ydb-report-title-id"></span>',
      '    <span class="ydb-report-type"></span>',
      '    <button class="ydb-report-close" aria-label="关闭">✕</button>',
      '  </div>',
      '  <div class="ydb-report-body"></div>',
      '  <div class="ydb-report-footer">点击徽章查看分析 · ESC 或点击背景关闭</div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlayEl);
    modalEl = overlayEl.querySelector('.ydb-report-modal');
    bodyEl  = overlayEl.querySelector('.ydb-report-body');
    titleEl = overlayEl.querySelector('.ydb-report-title');
    iconEl  = overlayEl.querySelector('.ydb-report-icon');
    typeEl  = overlayEl.querySelector('.ydb-report-type');
    closeBtn = overlayEl.querySelector('.ydb-report-close');

    overlayEl.addEventListener('click', function (e) {
      if (e.target === overlayEl) close();
    });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlayEl.classList.contains('is-open')) close();
    });
  }

  function close() {
    if (!overlayEl) return;
    overlayEl.classList.remove('is-open');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      try { lastFocused.focus(); } catch (e) {}
    }
  }

  /* 仅检查卡片是否可渲染 (不创建 DOM) — 用于 open() 前置校验 */
  function canRender(card) {
    if (!card) return false;
    var type = detectType(card);
    if (!type) return false;
    var scores = readScores(card);
    return !!scores;
  }

  function render(card) {
    var type = detectType(card);
    if (!type) return false;
    var name = extractCardName(card, type);
    var info = extractCardInfo(card, type);
    var scores = readScores(card);
    if (!scores) return false;

    var meta = TYPE_LABEL[type] || { label: type, icon: '📄' };
    iconEl.textContent = meta.icon;
    titleEl.textContent = name;
    typeEl.textContent = meta.label + (info.modifier ? ' · ' + (ICON_MOD_LABEL[info.modifier] || info.modifier) : '');

    var html = '';

    /* 描述段 */
    if (info.desc) {
      html += '<div class="ydb-report-section">';
      html += '<h4>卡片描述</h4>';
      html += '<p class="ydb-report-desc">' + escapeHtml(info.desc) + '</p>';
      html += '</div>';
    }

    /* 评分 */
    html += '<div class="ydb-report-section">';
    html += '<h4>三档评分</h4>';
    html += '<div class="ydb-report-scores">';
    ['health', 'test', 'si'].forEach(function (k) {
      var s = scores[k];
      var dn = DIM_NAMES[k];
      html += '<div class="ydb-report-score ' + colorClass(s) + '">';
      html += '<div class="ydb-score-label">' + dn.icon + ' ' + dn.name + '</div>';
      html += '<div class="ydb-score-value" style="color:' + hexColor(s) + '">' + s + '</div>';
      html += '<div class="ydb-score-grade">' + levelText(s) + ' · ' + gradeOf(s) + '</div>';
      html += '</div>';
    });
    html += '</div></div>';

    /* 分析文本 */
    html += '<div class="ydb-report-section">';
    html += '<h4>综合分析</h4>';
    html += '<div class="ydb-report-analysis">' + buildAnalysis(name, type, scores) + '</div>';
    html += '</div>';

    /* 元信息 chips */
    var chips = [];
    if (info.tags && info.tags.length) {
      info.tags.forEach(function (t) { chips.push('<span class="ydb-meta-chip">#' + escapeHtml(t) + '</span>'); });
    }
    if (info.meta) chips.push('<span class="ydb-meta-chip">📐 ' + escapeHtml(info.meta) + '</span>');
    if (info.href) chips.push('<span class="ydb-meta-chip">🔗 含源码链接</span>');
    if (chips.length) {
      html += '<div class="ydb-report-section">';
      html += '<h4>上下文</h4>';
      html += '<div class="ydb-report-meta">' + chips.join('') + '</div>';
      html += '</div>';
    }

    /* 故事卡的 scenes 列表 */
    if (info.scenes && info.scenes.length) {
      html += '<div class="ydb-report-section">';
      html += '<h4>包含场景 (' + info.scenes.length + ')</h4>';
      html += '<div class="ydb-report-scenes">';
      info.scenes.forEach(function (s) {
        html += '<span class="ydb-scene-tag">' + escapeHtml(s) + '</span>';
      });
      html += '</div></div>';
    }

    bodyEl.innerHTML = html;
    return true;
  }

  function open(card) {
    if (!canRender(card)) return;
    ensureDom();
    var ok = render(card);
    if (!ok) return;
    lastFocused = document.activeElement;
    overlayEl.classList.add('is-open');
    try { closeBtn.focus(); } catch (e) {}
  }

  global.YryCardReport = { open: open, close: close };

  /* 在 DOM ready 后通知外部 (可选) */
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try { window.dispatchEvent(new CustomEvent('yry-card-report-ready')); } catch (e) {}
  }
})(typeof window !== 'undefined' ? window : this);
