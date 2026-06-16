/**
 * notify-panel.js — notification center panel
 *
 * Aggregates health reports, self-loop reports, trend reports, and project analysis
 * into a unified notification feed with filter chips.
 * Depends on: panel-hub.js (loaded first)
 */
(function() {
  'use strict';
  var H = window.PanelHub;
  if (!H) { console.error('notify-panel: PanelHub required'); return; }

  var notifyPanel = document.getElementById('notifyPanel');
  var panelBody = document.getElementById('notifyPanelBody');
  var filterChips = notifyPanel ? notifyPanel.querySelectorAll('.np-filter-chip[data-filter]') : [];
  var totalCount = document.getElementById('npTotalCount');
  var badge = document.getElementById('notifyBadge');
  var activeFilter = 'all';
  var allItems = [];
  var loaded = false;
  var STATIC_HEALTH_REPORTS = [];
  var STATIC_LOOP_REPORTS = [];
  var STATIC_TREND_REPORTS = [];
  var STATIC_ANALYSIS_REPORTS = [];

  /**
   * Fetch health reports dynamically from docs/健康报告/reports.json.
   * Falls back to STATIC_HEALTH_REPORTS if fetch fails.
   */
  async function fetchHealthReports() {
    try {
      var resp = await fetch('./健康报告/reports.json');
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var data = await resp.json();
      if (!Array.isArray(data) || data.length === 0) return STATIC_HEALTH_REPORTS;
      // Deduplicate by date, keep only the latest per day
      var seen = {};
      var deduped = [];
      for (var i = 0; i < data.length; i++) {
        var d = data[i].date;
        if (!seen[d]) { seen[d] = true; deduped.push(data[i]); }
      }
      return deduped;
    } catch (e) {
      console.warn('[notify-panel] 健康报告 fetch 失败，使用静态数据: ' + e.message);
      return STATIC_HEALTH_REPORTS;
    }
  }

  /**
   * Fetch self-loop reports dynamically from docs/自循环报告/reports.json.
   */
  async function fetchLoopReports() {
    try {
      var resp = await fetch('./自循环报告/reports.json');
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var data = await resp.json();
      if (!Array.isArray(data)) return STATIC_LOOP_REPORTS;
      return data.map(function(r) {
        return {
          file: r.file,
          date: r.date,
          label: (r.icon || '🔄') + ' ' + (r.skillLabel || r.skill),
          meta: { status: r.status, summary: r.summary, findings: r.findings, skill: r.skill }
        };
      });
    } catch (e) {
      console.warn('[notify-panel] 自循环报告 fetch 失败: ' + e.message);
      return STATIC_LOOP_REPORTS;
    }
  }

  /**
   * Fetch trend reports dynamically from docs/趋势报告/reports.json.
   */
  async function fetchTrendReports() {
    try {
      var resp = await fetch('./趋势报告/reports.json');
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var data = await resp.json();
      if (!Array.isArray(data)) return STATIC_TREND_REPORTS;
      var iconMap = { all: '📡', 'github-trending': '🐙', 'oss-insight': '📊', trendshift: '📈', 'top-starred': '⭐' };
      return data.map(function(r) {
        var src = r.source || '';
        var icon = iconMap[src] || '📡';
        return {
          file: r.file,
          date: r.date,
          source: r.source,
          label: icon + ' ' + (src || 'trend') + ' · ' + r.date,
          meta: { ok: r.ok, trend: r.trend, items: r.items }
        };
      });
    } catch (e) {
      console.warn('[notify-panel] 趋势报告 fetch 失败: ' + e.message);
      return STATIC_TREND_REPORTS;
    }
  }

  /**
   * Fetch project analysis reports from docs/项目分析/reports.json.
   */
  async function fetchAnalysisReports() {
    try {
      var resp = await fetch('./项目分析/reports.json');
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var data = await resp.json();
      if (!Array.isArray(data)) return STATIC_ANALYSIS_REPORTS;
      return data.map(function(r) {
        return {
          file: r.file,
          date: r.date,
          source: 'proj-analysis',
          label: '🔍 项目分析 · ' + r.date,
          meta: {
            overallScore: r.overallScore,
            overallGrade: r.overallGrade,
            checksPassed: r.checksPassed,
            checksTotal: r.checksTotal,
            failedDims: r.failedDims,
            fileCount: r.fileCount,
            totalLines: r.totalLines,
            jsFiles: r.jsFiles,
            jsLines: r.jsLines,
            importCount: r.importCount,
            dimensions: r.dimensions,
            issues: r.issues,
            skills: r.skills,
            rules: r.rules,
            libFiles: r.libFiles,
            agents: r.agents
          }
        };
      });
    } catch (e) {
      console.warn('[notify-panel] 项目分析 fetch 失败: ' + e.message);
      return STATIC_ANALYSIS_REPORTS;
    }
  }

  /* ── Registration ───────────────────────── */
  H.register('notify', null, 'notifyPanel', 'notifyOverlay', function() {
    if (!loaded) fetchAll();
  });

  /* ── Filter chips ───────────────────────── */
  filterChips.forEach(function(c) {
    c.addEventListener('click', function(e) {
      e.stopPropagation();
      filterChips.forEach(function(x) { x.classList.remove('active'); });
      this.classList.add('active');
      activeFilter = this.dataset.filter;
      renderList();
    });
  });

  /* ── Refresh ────────────────────────────── */
  var refreshBtn = document.getElementById('notifyRefresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      refreshBtn.classList.add('spinning');
      allItems = []; loaded = false;
      fetchAll().finally(function() { refreshBtn.classList.remove('spinning'); });
    });
  }

  async function fetchAll() {
    loaded = true;
    panelBody.innerHTML = '<div class="panel-loading yry-panel-loading">加载中...</div>';

    // Dynamic fetch from reports.json manifests (with static fallback)
    var [healthData, loopData, trendData, analysisData] = await Promise.all([
      fetchHealthReports(),
      fetchLoopReports(),
      fetchTrendReports(),
      fetchAnalysisReports()
    ]);

    var unified = [];
    for (var i = 0; i < healthData.length; i++) {
      var r = healthData[i];
      unified.push({
        type: 'health',
        href: r.file,
        basePath: './健康报告/',
        label: '🩺 ' + r.date,
        date: r.date,
        timeText: r.time,
        timeId: String(r.time || '').replace(/\D/g, ''),
        meta: { score: r.score, grade: r.grade }
      });
    }
    for (var j = 0; j < loopData.length; j++) {
      var lr = loopData[j];
      unified.push({
        type: 'loop',
        href: lr.file,
        basePath: './自循环报告/',
        label: lr.label || '',
        date: lr.date || '',
        timeId: lr.timeId || '',
        meta: lr.meta || null
      });
    }
    for (var k = 0; k < trendData.length; k++) {
      var tr = trendData[k];
      unified.push({
        type: 'trend',
        href: tr.file,
        basePath: './趋势报告/',
        label: tr.label || '',
        date: tr.date || '',
        source: tr.source || '',
        keywords: tr.keywords || [],
        meta: tr.meta || null
      });
    }
    for (var m = 0; m < analysisData.length; m++) {
      var ar = analysisData[m];
      unified.push({
        type: 'analysis',
        href: ar.file,
        basePath: './项目分析/',
        label: ar.label || '',
        date: ar.date || '',
        meta: ar.meta || null
      });
    }

    var hc = healthData.length, lc = loopData.length, tc = trendData.length, ac = analysisData.length;
    var elAll = document.getElementById('npBadgeAll'), elH = document.getElementById('npBadgeHealth'),
        elL = document.getElementById('npBadgeLoop'), elT = document.getElementById('npBadgeTrend'),
        elA = document.getElementById('npBadgeAnalysis');
    if (elAll) elAll.textContent = unified.length;
    if (elH) elH.textContent = hc;
    if (elL) elL.textContent = lc;
    if (elT) elT.textContent = tc;
    if (elA) elA.textContent = ac;
    if (totalCount) totalCount.textContent = '共 ' + unified.length + ' 条';
    if (badge && unified.length > 0) badge.textContent = unified.length > 99 ? '99+' : String(unified.length);

    allItems = unified;
    renderList();

    var utEl = document.getElementById('npUpdateTime');
    if (utEl) {
      var now2 = new Date();
      utEl.textContent = '更新 ' + now2.getHours().toString().padStart(2,'0') + ':' + now2.getMinutes().toString().padStart(2,'0') + ' · ' + unified.length + ' 条通知';
    }
  }

  /* ── Rendering ──────────────────────────── */
  function renderSummaryBar(list) {
    if (!list || list.length === 0) return '';
    var totalTriggers = 0, totalWarnFindings = 0, totalFailFindings = 0;
    var unreadWarn = 0, unreadFail = 0, unreachableTrends = 0;
    var latestScore = null, prevScore = null;
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      if (it.type === 'health' && it.meta && it.meta.triggers) totalTriggers += it.meta.triggers;
      if (it.type === 'loop' && it.meta && it.meta.findings) {
        totalWarnFindings += (it.meta.findings.warn || 0);
        totalFailFindings += (it.meta.findings.fail || 0);
        if (it.meta.status === 'warn') unreadWarn++;
        if (it.meta.status === 'fail') unreadFail++;
      }
      if (it.type === 'trend' && it.meta && it.meta.ok === false) unreachableTrends++;
    }
    var healthItems = list.filter(function(x) { return x.type === 'health' && x.meta && x.meta.score !== undefined; });
    if (healthItems.length >= 2 && healthItems[0].meta && healthItems[1].meta) {
      latestScore = healthItems[0].meta.score; prevScore = healthItems[1].meta.score;
    } else if (healthItems.length === 1 && healthItems[0].meta) {
      latestScore = healthItems[0].meta.score;
    }

    var GRADE_GUIDE = { A: '优秀，系统运行健康', B: '良好，少量维度需关注', C: '告警，多项指标异常需修复', D: '严重，需要立即干预' };
    var parts = [];
    if (latestScore !== null) {
      var g = healthItems[0].meta.grade || '';
      var scClr = latestScore >= 80 ? '#22c55e' : latestScore >= 60 ? '#f59e0b' : '#ef4444';
      parts.push('<span class="np-summary-stat"><span class="np-ss-icon">🩺</span><span class="np-ss-val" style="color:' + scClr + '">' + latestScore + '分 ' + g + '级</span><span style="font-size:.58rem;color:var(--text-muted);margin-left:3px">' + (GRADE_GUIDE[g] || '') + '</span></span>');
      if (prevScore !== null && latestScore !== prevScore) {
        var d = latestScore - prevScore;
        parts.push('<span class="np-summary-stat"><span class="np-ss-val t-' + (d > 0 ? 'green' : 'red') + '">' + (d > 0 ? '↑' : '↓') + Math.abs(d) + '</span></span>');
      }
    }
    if (totalTriggers > 0) parts.push('<span class="np-summary-stat" title="D0-D7 诊断触发总数"><span class="np-ss-icon">🔬</span><span class="np-ss-val t-yellow">' + totalTriggers + '</span>触发</span>');
    if (totalFailFindings > 0) parts.push('<span class="np-summary-stat" title="自循环巡检异常发现"><span class="np-ss-icon">🚫</span><span class="np-ss-val t-red">' + totalFailFindings + '</span>异常</span>');
    if (totalWarnFindings > 0) parts.push('<span class="np-summary-stat"><span class="np-ss-icon">⚠️</span><span class="np-ss-val t-yellow">' + totalWarnFindings + '</span>告警</span>');
    if (unreadFail > 0) parts.push('<span class="np-summary-stat" title="巡检报告中存在异常状态的技能数"><span class="np-ss-icon">📋</span><span class="np-ss-val t-red">' + unreadFail + '</span>巡检异常</span>');
    else if (unreadWarn > 0) parts.push('<span class="np-summary-stat"><span class="np-ss-icon">📋</span><span class="np-ss-val t-yellow">' + unreadWarn + '</span>巡检告警</span>');
    if (unreachableTrends > 0) parts.push('<span class="np-summary-stat"><span class="np-ss-icon">🔗</span><span class="np-ss-val t-red">' + unreachableTrends + '</span>源不可达</span>');
    if (parts.length === 0) parts.push('<span class="np-summary-stat"><span class="np-ss-icon">✅</span><span class="np-ss-val t-green">一切正常</span></span>');

    // Cross-link to self-improvement for deeper analysis
    parts.push('<a href="#" class="np-summary-link" onclick="event.stopPropagation();PanelHub.open(\'selfimprove\')" title="在自改进面板中查看趋势分析">🧬 深度分析 →</a>');
    parts.push('<span class="np-summary-stat" style="color:var(--text-muted)">共 ' + list.length + ' 条</span>');
    return '<div class="np-summary-bar">' + parts.join('') + '</div>';
  }

  function formatTimeId(timeId) {
    if (!timeId) return '';
    var s = String(timeId).replace(/\D/g, '');
    if (s.length < 4) return '';
    var hh = s.slice(0, 2);
    var mm = s.slice(2, 4);
    var ss = s.length >= 6 ? s.slice(4, 6) : '';
    if (!/^\d{2}$/.test(hh) || !/^\d{2}$/.test(mm)) return '';
    return ss && /^\d{2}$/.test(ss) ? (hh + ':' + mm + ':' + ss) : (hh + ':' + mm);
  }

  function getRawFilename(item) {
    if (!item || !item.href) return '';
    return String(item.href).split('/').pop() || '';
  }

  /** Return the filename without .html extension — matches what's on disk. */
  function getDisplayFilename(item) {
    var fileName = getRawFilename(item);
    if (!fileName) return '';
    try {
      return decodeURIComponent(fileName).replace(/\.html$/, '');
    } catch (e) {
      return fileName.replace(/\.html$/, '');
    }
  }

  function getItemHref(item) {
    if (!item || !item.href) return '';
    var fileName = getRawFilename(item);
    if (!fileName) return '';
    if (item.type === 'health') return './健康报告/' + fileName;
    return item.basePath ? (item.basePath + item.href) : item.href;
  }

  function renderTitleLink(href, title, clsName) {
    var safeTitle = H.escHtml(title || '—');
    var cls = clsName || 'np-title';
    if (!href) return '<span class="' + cls + '">' + safeTitle + '</span>';
    var rawHref = String(href).trim();
    var isExternal = /^(https?:)?\/\//i.test(rawHref) || /^(mailto:|tel:)/i.test(rawHref);
    var finalHref = rawHref;
    try { finalHref = encodeURI(rawHref); } catch (e) { finalHref = rawHref; }
    var safeHref = H.escHtml(finalHref);
    var targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    return '<span class="' + cls + '"><a href="' + safeHref + '"' + targetAttr + ' onclick="event.stopPropagation()">' + safeTitle + '</a></span>';
  }

  function escapeJsSingleQuoted(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  function cardOnclickAttr(href) {
    if (!href) return '';
    var rawHref = String(href).trim();
    var isExternal = /^(https?:)?\/\//i.test(rawHref) || /^(mailto:|tel:)/i.test(rawHref);
    var finalHref = rawHref;
    try { finalHref = encodeURI(rawHref); } catch (e) { finalHref = rawHref; }
    var safe = escapeJsSingleQuoted(finalHref);
    return isExternal
      ? ' onclick="window.open(\'' + safe + '\',\'_blank\',\'noopener\')"'
      : ' onclick="location.href=\'' + safe + '\'"';
  }

  /* ── Shared rendering atoms ──────────────── */
  function scoreClass(score) {
    return score >= 80 ? 'A' : score >= 60 ? 'C' : 'D';
  }
  function dotClass(score) {
    return score >= 80 ? 'ok' : score >= 60 ? 'warn' : 'bad';
  }
  function gradeMessage(g) {
    return { A: '系统健康', B: '需关注', C: '需修复', D: '需干预' }[g] || '';
  }

  function renderScorePill(score, grade) {
    var g = grade || '';
    return '<span class="np-score-badge ' + g + '">' + score + '分 ' + g + '级</span>'
      + '<span style="font-size:.62rem;color:var(--text-muted)">' + gradeMessage(g) + '</span>';
  }

  function renderDelta(cur, prev) {
    if (prev === undefined || cur === prev) return '';
    var d = cur - prev;
    return '<span class="np-delta t-' + (d > 0 ? 'green' : 'red') + '">' + (d > 0 ? '↑' : '↓') + Math.abs(d) + '</span>';
  }

  function renderMetaChip(icon, val, label, colorClass) {
    return '<span class="np-meta-item">'
      + (icon ? '<span class="np-meta-icon">' + icon + '</span>' : '')
      + '<span class="np-meta-val' + (colorClass ? ' ' + colorClass : '') + '">' + val + '</span>'
      + (label ? '<span class="np-meta-label">' + label + '</span>' : '')
      + '</span>';
  }

  function renderMetaRow(chips) {
    if (!chips || chips.length === 0) return '';
    return '<div class="np-meta-row">' + chips.join('') + '</div>';
  }

  function renderTimeTag(item) {
    if (!item.date) return '';
    if (item.type === 'health' && item.timeText) {
      return '<span class="np-time" title="' + H.escHtml(item.date + ' ' + item.timeText) + '">' + H.escHtml(item.timeText) + '</span>';
    }
    return '<span class="np-time" title="' + H.escHtml(item.date) + '">' + H.escHtml(H.relativeTime(item.date)) + '</span>';
  }

  /** Resolve display title, always derived from the item's filename on disk. */
  function resolveTitle(item) {
    if (item && item.label) return String(item.label).trim();
    // Health: title is the filename on disk (without .html)
    if (item.type === 'health') {
      if (item.label) return String(item.label).trim();
      if (item.date) return '🩺 ' + item.date;
      // Reconstruct from date+timeId using naming convention: health-YYYY-MM-DD-HHMMSS
      if (item.date && item.timeId) return 'health-' + item.date + '-' + item.timeId;
      return '健康报告（文件缺失）';
    }
    // Loop / trend: filename first, then fallback
    var title = getDisplayFilename(item);
    if (title) return title;
    if (item.type === 'loop') {
      return (item.meta && item.meta.pageTitle)
        ? item.meta.pageTitle.replace('自循环报告 · ', '')
        : (item.skill || '自循环报告');
    }
    var srcLabels = { 'all': '全量扫描', 'github-trending': 'GitHub Trending', 'oss-insight': 'OSS Insight', 'trendshift': 'TrendShift', 'top-starred': 'Top-Starred' };
    if (item.type === 'analysis') return '🔍 项目分析 · ' + item.date;
    return (srcLabels[item.source] || item.source) + ' · ' + item.date;
  }

  function resolveTypeLabel(item) {
    if (item.type === 'health') return { label: '🩺 健康', cls: 'health' };
    if (item.type === 'loop')   return { label: '🔄 自循环', cls: 'loop' };
    if (item.type === 'analysis') return { label: '🔍 项目分析', cls: 'analysis' };
    var icons = { 'all': '🌐', 'github-trending': '🐙', 'oss-insight': '📊', 'trendshift': '🔥', 'top-starred': '⭐' };
    return { label: (icons[item.source] || '📡') + ' 趋势', cls: 'trend' };
  }

  function resolveDotClass(item) {
    if (item.type === 'health') return item.meta && item.meta.score !== undefined ? dotClass(item.meta.score) : 'ok';
    if (item.type === 'loop') {
      return item.meta && item.meta.status
        ? (item.meta.status === 'pass' ? 'ok' : item.meta.status === 'warn' ? 'warn' : 'bad') : 'ok';
    }
    if (item.type === 'analysis') return item.meta && item.meta.overallScore !== undefined ? dotClass(item.meta.overallScore) : 'ok';
    return item.meta && item.meta.ok === false ? 'bad' : 'ok';
  }

  /* ── Per-type detail renderers ──────────── */

  function renderHealthDetail(meta, prevScore) {
    if (!meta) return '';
    var m = meta;
    var chips = [];

    if (m.score !== undefined) chips.push(renderScorePill(m.score, m.grade));
    if (prevScore !== undefined && m.score !== prevScore) chips.push(renderDelta(m.score, prevScore));
    if (m.triggers !== undefined) {
      var tc = m.triggers === 0 ? 't-green' : m.triggers <= 2 ? 't-yellow' : 't-red';
      chips.push(renderMetaChip('🔬', m.triggers, '/8 触发', tc));
    }
    if (m.recs !== undefined)    chips.push(renderMetaChip('💡', m.recs, '建议'));
    if (m.robotsOk !== undefined && m.robotsTotal !== undefined) {
      var rc = m.robotsOk === m.robotsTotal ? 't-green' : m.robotsOk > 0 ? 't-yellow' : 't-red';
      chips.push(renderMetaChip('🤖', m.robotsOk + '/' + m.robotsTotal, '就绪', rc));
    }

    var parts = [];
    var row = renderMetaRow(chips);
    if (row) parts.push(row);

    // Trigger chips
    if (m.triggeredIds && m.triggeredIds.length > 0) {
      var tags = '';
      m.triggeredIds.forEach(function(id) { tags += '<span class="np-trigger t-warm">' + H.escHtml(id) + '</span>'; });
      parts.push('<div class="np-trigger-list">' + tags + '</div>');
    }

    // Dimension grid
    if (m.dimScores && m.dimStats) {
      var entries = Object.keys(m.dimScores).map(function(k) { return { name: k, score: m.dimScores[k] }; });
      entries.sort(function(a, b) { return a.score - b.score; });
      var show = Math.min(8, entries.length);
      var grid = '';
      for (var di = 0; di < show; di++) {
        var dn = entries[di];
        var dc = dn.score >= 80 ? 'pass' : dn.score >= 60 ? 'warn' : 'fail';
        var sc = dn.score >= 80 ? '#22c55e' : dn.score >= 60 ? '#f59e0b' : '#ef4444';
        grid += '<div class="np-dg-item"><span class="np-dg-dot ' + dc + '"></span><span class="np-dg-name">' + H.escHtml(dn.name) + '</span><span class="np-dg-score" style="color:' + sc + '">' + dn.score + '</span></div>';
      }
      if (entries.length > show) grid += '<div class="np-dg-item" style="font-size:.52rem;color:var(--text-muted)">+' + (entries.length - show) + ' 维度</div>';
      parts.push('<div class="np-dim-grid">' + grid + '</div>');
    }

    // Assessment / recommendation / summary
    if (m.overallAssess) parts.push('<div class="np-rec-hint">📋 ' + H.escHtml(m.overallAssess) + '</div>');
    if (m.topRec)        parts.push('<div class="np-rec-hint">💡 ' + H.escHtml(m.topRec.length > 100 ? m.topRec.slice(0, 100) + '…' : m.topRec) + '</div>');
    if (m.summaryText)   parts.push('<div class="np-summary-text">' + H.escHtml(m.summaryText.length > 120 ? m.summaryText.slice(0, 120) + '…' : m.summaryText) + '</div>');

    return parts.length ? parts.join('') : '';
  }

  function renderLoopDetail(meta) {
    if (!meta) return '';
    var m = meta;
    var chips = [];

    if (m.status) {
      var labels = { pass: '✅ 通过', warn: '⚠️ 告警', fail: '🚫 异常' };
      var sc = m.status === 'pass' ? 't-green' : m.status === 'warn' ? 't-yellow' : 't-red';
      chips.push(renderMetaChip('', labels[m.status] || m.status, '', sc));
    }
    if (m.interval) chips.push(renderMetaChip('⏱️', H.escHtml(m.interval)));
    if (m.healthScore !== undefined) {
      var hg = m.healthGrade || '';
      chips.push('<span class="np-score-badge ' + hg + '">🩺 ' + m.healthScore + ' ' + hg + '</span>');
    }

    var parts = [];
    var row = renderMetaRow(chips);
    if (row) parts.push(row);

    if (m.description) parts.push('<div class="np-summary-text">' + H.escHtml(m.description.length > 100 ? m.description.slice(0, 100) + '…' : m.description) + '</div>');

    if (m.findings) {
      var f = m.findings;
      var findChips = [renderMetaChip('🔍', '', '发现: ')];
      if (f.fail) findChips.push(renderMetaChip('', '🚫 ' + f.fail, '异常', 't-red'));
      if (f.warn) findChips.push(renderMetaChip('', '⚠️ ' + f.warn, '告警', 't-yellow'));
      if (f.info) findChips.push(renderMetaChip('', 'ℹ️ ' + f.info, '信息', ''));
      if (!f.fail && !f.warn && !f.info) findChips.push(renderMetaChip('', '✅ 0', '', 't-green'));
      parts.push(renderMetaRow(findChips));
    }

    if (m.findingTitles && m.findingTitles.length) {
      var maxShow = Math.min(5, m.findingTitles.length);
      var list = '';
      for (var i = 0; i < maxShow; i++) {
        var level = 'info';
        if (m.findingLevels && i < m.findingLevels.length) {
          level = m.findingLevels[i];
        } else if (m.findings) {
          if (i < (m.findings.fail || 0)) level = 'fail';
          else if (i < (m.findings.fail || 0) + (m.findings.warn || 0)) level = 'warn';
        }
        list += '<div class="np-finding-item ' + level + '">' + H.escHtml(m.findingTitles[i]) + '</div>';
      }
      if (m.findingTitles.length > maxShow) list += '<div class="np-finding-item info">…还有 ' + (m.findingTitles.length - maxShow) + ' 项</div>';
      parts.push('<div class="np-finding-list">' + list + '</div>');
    }

    return parts.length ? parts.join('') : '';
  }

  function renderTrendDetail(meta, keywords) {
    var m = meta || {};
    var chips = [];

    if (m.ok !== undefined) {
      chips.push(renderMetaChip('', m.ok ? '✅ 可达' : '🚫 不可达', '', m.ok ? 't-green' : 't-red'));
    }
    if (m.items !== undefined) chips.push(renderMetaChip('📦', m.items, '条目'));
    if (m.reachable !== undefined && m.total !== undefined) {
      var pct = m.total > 0 ? Math.round(m.reachable / m.total * 100) : 0;
      var rc = pct >= 80 ? 't-green' : pct >= 50 ? 't-yellow' : 't-red';
      chips.push(renderMetaChip('🔗', m.reachable + '/' + m.total, '可达(' + pct + '%)', rc));
    }
    if (m.trend) {
      var icon = m.trend === 'flat' ? '➡️' : m.trend === 'rise' ? '📈' : '📉';
      var tlabel = m.trend === 'flat' ? '平稳' : m.trend === 'rise' ? '上升' : '下降';
      var tclr = m.trend === 'flat' ? '' : m.trend === 'rise' ? 't-green' : 't-red';
      chips.push(renderMetaChip('', icon + ' ' + tlabel, '', tclr));
    }

    var parts = [];
    var row = renderMetaRow(chips);
    if (row) parts.push(row);

    if (keywords && keywords.length) {
      var showKws = keywords.slice(0, 8);
      var kwHtml = '';
      for (var i = 0; i < showKws.length; i++) kwHtml += '<span class="np-kw">' + H.escHtml(showKws[i]) + '</span>';
      if (keywords.length > 8) kwHtml += '<span class="np-kw">+' + (keywords.length - 8) + '</span>';
      parts.push('<div class="np-kw-list">' + kwHtml + '</div>');
    }

    return parts.length ? parts.join('') : '';
  }

  function renderAnalysisDetail(meta) {
    if (!meta) return '';
    var m = meta;
    var chips = [];

    if (m.overallScore !== undefined) chips.push(renderScorePill(m.overallScore, m.overallGrade));
    if (m.checksPassed !== undefined && m.checksTotal !== undefined) {
      var cc = m.failedDims && m.failedDims.length > 0 ? 't-yellow' : 't-green';
      chips.push(renderMetaChip('✅', m.checksPassed + '/' + m.checksTotal, '检查通过', cc));
    }
    if (m.failedDims && m.failedDims.length > 0) {
      chips.push(renderMetaChip('⚠️', m.failedDims.join(', '), '失败维度', 't-yellow'));
    }
    if (m.fileCount !== undefined) chips.push(renderMetaChip('📁', m.fileCount, '文件'));
    if (m.totalLines !== undefined) {
      var klines = Math.round(m.totalLines / 1000);
      chips.push(renderMetaChip('📐', klines + 'K', '代码行'));
    }
    if (m.importCount !== undefined) chips.push(renderMetaChip('🔗', m.importCount, '导入'));
    if (m.skills !== undefined) chips.push(renderMetaChip('⚙️', m.skills, '技能'));
    if (m.libFiles !== undefined) chips.push(renderMetaChip('📦', m.libFiles, 'lib文件'));

    var parts = [];
    var row = renderMetaRow(chips);
    if (row) parts.push(row);

    if (m.dimensions && m.dimensions.length) {
      var grid = '';
      var maxShow = Math.min(8, m.dimensions.length);
      for (var di = 0; di < maxShow; di++) {
        var dn = m.dimensions[di];
        var dc = dn.score >= 80 ? 'pass' : dn.score >= 60 ? 'warn' : 'fail';
        var sc = dn.score >= 80 ? '#22c55e' : dn.score >= 60 ? '#f59e0b' : '#ef4444';
        grid += '<div class="np-dg-item"><span class="np-dg-dot ' + dc + '"></span><span class="np-dg-name">' + H.escHtml(dn.name) + '</span><span class="np-dg-score" style="color:' + sc + '">' + dn.score + '</span></div>';
      }
      if (m.dimensions.length > maxShow) grid += '<div class="np-dg-item" style="font-size:.52rem;color:var(--text-muted)">+' + (m.dimensions.length - maxShow) + ' 维度</div>';
      parts.push('<div class="np-dim-grid">' + grid + '</div>');
    }

    if (m.issues && m.issues.length) {
      var issueHtml = '';
      for (var i = 0; i < Math.min(m.issues.length, 3); i++) {
        var iss = m.issues[i];
        var icls = iss.level === 'fail' ? 'fail' : iss.level === 'warn' ? 'warn' : 'info';
        issueHtml += '<div class="np-finding-item ' + icls + '">' + H.escHtml(iss.msg) + '</div>';
      }
      if (m.issues.length > 3) issueHtml += '<div class="np-finding-item info">…还有 ' + (m.issues.length - 3) + ' 项</div>';
      parts.push('<div class="np-finding-list">' + issueHtml + '</div>');
    }

    return parts.length ? parts.join('') : '';
  }

  /* ── Featured card: latest health report ──── */
  function renderFeaturedHealthCard(item, href, typeLabel, typeCls, title, timeHtml) {
    var m = item.meta;
    var sc = m.score >= 80 ? 'A' : m.score >= 60 ? 'C' : 'D';
    var gc = m.grade || '';

    var deltaHtml = '';
    if (item.prevScore !== undefined && m.score !== item.prevScore) {
      var d = m.score - item.prevScore;
      deltaHtml = '<span class="npl-delta ' + (d > 0 ? 'up' : 'down') + '">' + (d > 0 ? '&#9650;' : '&#9660;') + Math.abs(d) + '</span>';
    }

    var metaParts = [];
    if (m.triggers !== undefined) {
      var tc = m.triggers === 0 ? 'ok' : m.triggers <= 2 ? 'warn' : 'bad';
      metaParts.push('<span class="npl-meta-item">&#128300; <strong class="' + tc + '">' + m.triggers + '</strong>/8 触发</span>');
    }
    if (m.recs !== undefined) {
      metaParts.push('<span class="npl-meta-item">&#128161; <strong>' + m.recs + '</strong> 建议</span>');
    }
    if (m.robotsOk !== undefined && m.robotsTotal !== undefined) {
      var rc = m.robotsOk === m.robotsTotal ? 'ok' : m.robotsOk > 0 ? 'warn' : 'bad';
      metaParts.push('<span class="npl-meta-item">&#129302; <strong class="' + rc + '">' + m.robotsOk + '/' + m.robotsTotal + '</strong> 就绪</span>');
    }

    // Dimension bars
    var dimsHtml = '';
    if (m.dimScores) {
      var entries = Object.keys(m.dimScores).map(function(k) { return { name: k, score: m.dimScores[k] }; });
      entries.sort(function(a, b) { return a.score - b.score; });
      var shown = Math.min(entries.length, 9);
      for (var di = 0; di < shown; di++) {
        var dn = entries[di];
        var barClr = dn.score >= 80 ? '#22c55e' : dn.score >= 60 ? '#f59e0b' : '#ef4444';
        dimsHtml += '<div class="npl-dim">'
          + '<span class="npl-dim-label" title="' + H.escHtml(dn.name) + '">' + H.escHtml(dn.name) + '</span>'
          + '<span class="npl-dim-bar-wrap"><span class="npl-dim-bar" style="width:' + dn.score + '%;background:' + barClr + '"></span></span>'
          + '<span class="npl-dim-val">' + dn.score + '</span>'
          + '</div>';
      }
      if (dimsHtml) dimsHtml = '<div class="np-latest-dims">' + dimsHtml + '</div>';
    }

    // Recommendation / summary
    var recHtml = '';
    if (m.topRec) {
      recHtml = '<div class="np-latest-rec">&#128161; ' + H.escHtml(m.topRec.length > 140 ? m.topRec.slice(0, 140) + '…' : m.topRec) + '</div>';
    } else if (m.summaryText) {
      recHtml = '<div class="np-latest-rec">&#128203; ' + H.escHtml(m.summaryText.length > 140 ? m.summaryText.slice(0, 140) + '…' : m.summaryText) + '</div>';
    }

    var onclick = cardOnclickAttr(href);
    return '<div class="np-card np-latest-featured"' + onclick + '>'
      + '<div class="np-latest-score">'
      + '<span class="npl-badge">最新</span>'
      + '<span class="npl-score-num ' + sc + '">' + m.score + '</span>'
      + (gc ? '<span class="npl-grade ' + gc + '">' + gc + ' 级</span>' : '')
      + deltaHtml
      + '</div>'
      + '<div class="np-latest-main">'
      + '<div class="np-latest-head"><span class="np-type ' + typeCls + '">' + typeLabel + '</span>'
      + renderTitleLink(href, title, 'np-latest-title') + timeHtml + '</div>'
      + (metaParts.length ? '<div class="np-latest-meta">' + metaParts.join('') + '</div>' : '')
      + dimsHtml + recHtml
      + '</div></div>';
  }

  /* ── Standard card ───────────────────────── */
  function renderStandardCard(item, href, isLatest, dotCls, typeLabel, typeCls, title, timeHtml, detailHtml) {
    var cls = isLatest ? ' np-latest' : '';
    var onclick = cardOnclickAttr(href);
    return '<div class="np-card' + cls + '"' + onclick + '>'
      + '<span class="np-dot ' + dotCls + '"></span>'
      + '<div class="np-body">'
      + '<div class="np-head"><span class="np-type ' + typeCls + '">' + typeLabel + '</span>'
      + renderTitleLink(href, title, 'np-title') + '</div>'
      + (detailHtml ? '<div class="np-detail">' + detailHtml + '</div>' : '')
      + '</div>' + timeHtml
      + '</div>';
  }

  /* ── Card dispatcher ─────────────────────── */
  function renderCard(item, isLatest) {
    var href = getItemHref(item);
    var typeInfo = resolveTypeLabel(item);
    var typeLabel = typeInfo.label, typeCls = typeInfo.cls;
    var dotCls = resolveDotClass(item);
    var title = resolveTitle(item);
    var timeHtml = renderTimeTag(item);

    // Featured: only for latest health report with score
    if (isLatest && item.type === 'health' && item.meta && item.meta.score !== undefined) {
      return renderFeaturedHealthCard(item, href, typeLabel, typeCls, title, timeHtml);
    }

    // Standard card: delegate detail to per-type renderer
    var detailHtml = '';
    if (item.type === 'health' && item.meta) {
      detailHtml = renderHealthDetail(item.meta, item.prevScore);
    } else if (item.type === 'loop' && item.meta) {
      detailHtml = renderLoopDetail(item.meta);
    } else if (item.type === 'trend') {
      detailHtml = renderTrendDetail(item.meta, item.keywords);
    } else if (item.type === 'analysis' && item.meta) {
      detailHtml = renderAnalysisDetail(item.meta);
    }

    return renderStandardCard(item, href, isLatest, dotCls, typeLabel, typeCls, title, timeHtml, detailHtml);
  }

  /* ── Health trend sparkline ─────────────── */
  function renderHealthSparkline() {
    var scores = [];
    for (var i = 0; i < allItems.length; i++) {
      if (allItems[i].type === 'health' && allItems[i].meta && allItems[i].meta.score !== undefined) {
        scores.push({ score: allItems[i].meta.score, grade: allItems[i].meta.grade, date: allItems[i].date });
      }
    }
    if (scores.length < 2) return '';
    scores.reverse();
    var lastN = scores.slice(-10);
    var minS = Math.min.apply(null, lastN.map(function(s) { return s.score; }));
    var maxS = Math.max.apply(null, lastN.map(function(s) { return s.score; }));
    var range = maxS - minS || 1;

    var firstS = lastN[0].score, lastS = lastN[lastN.length - 1].score;
    var trendIcon = lastS > firstS ? '↑' : lastS < firstS ? '↓' : '→';
    var trendClr = lastS > firstS ? '#22c55e' : lastS < firstS ? '#ef4444' : 'var(--text-muted)';

    var barsHtml = '';
    for (var j = 0; j < lastN.length; j++) {
      var h = Math.max(3, Math.round((lastN[j].score - minS) / range * 28) + 2);
      var c = lastN[j].score >= 80 ? '#22c55e' : lastN[j].score >= 60 ? '#f59e0b' : '#ef4444';
      barsHtml += '<span style="flex:1;height:' + h + 'px;background:' + c + ';border-radius:1px 1px 0 0;min-width:4px" title="' + lastN[j].date + ': ' + lastN[j].score + '分 ' + (lastN[j].grade || '') + '级"></span>';
    }

    return '<div class="np-sparkline">'
      + '<div class="np-sparkline-head">'
      + '<span class="np-sparkline-label">📈 健康趋势（最近 ' + lastN.length + ' 次）</span>'
      + '<span class="np-sparkline-trend" style="color:' + trendClr + '">' + trendIcon + ' ' + Math.abs(lastS - firstS) + ' 分</span>'
      + '<span class="np-sparkline-range">' + lastN[0].date + ' → ' + lastN[lastN.length - 1].date + '</span>'
      + '</div>'
      + '<div class="np-sparkline-bars">' + barsHtml + '</div>'
      + '</div>';
  }

  /* ── List renderer ───────────────────────── */
  function renderList() {
    var list = activeFilter === 'all'
      ? allItems
      : allItems.filter(function(it) { return it.type === activeFilter; });

    // Empty state
    if (list.length === 0) {
      var hintMap = {
        health: { desc: '生成最新健康报告并推送到通知中心', cmd: 'node skills/rui-bot/send.mjs health --html', extra: '或检查 ' + H.panelLink('cron', '⏰ 调度面板') + ' 中的健康检查任务是否正常触发' },
        loop: { desc: '运行自循环巡检，生成各技能巡检报告', cmd: 'node skills/rui-bot/lib/loop-report.mjs' },
        trend: { desc: '扫描 GitHub / OSS Insight 等趋势源', cmd: 'node skills/rui-trends/rui-trends.mjs all --html' },
        analysis: { desc: '运行架构合规检查并生成项目分析报告', cmd: 'node lib/arch-check.mjs --json', extra: '或检查 ' + H.panelLink('cron', '⏰ 调度面板') + ' 中是否有项目分析定时任务' },
        all: { desc: '运行健康检查生成首份报告', cmd: 'node skills/rui-bot/send.mjs health --html', extra: '新项目需先运行 /rui init 建立基线' }
      };
      var info = hintMap[activeFilter] || hintMap.all;
      var emptyMsg = activeFilter === 'all' ? '暂无通知 — 尚无可显示的报告或通知数据' : '该类型暂无报告数据';
      var extraHtml = info.extra ? '<br><span style="font-size:.62rem;color:var(--text-muted)">' + info.extra + '</span>' : '';
      panelBody.innerHTML = '<div class="panel-empty yry-panel-empty">'
        + '<div style="font-size:1.8rem;margin-bottom:12px;opacity:.4">📭</div>'
        + '<div>' + emptyMsg + '</div>'
        + '<span class="hint">' + info.desc + '<br><code style="user-select:all;cursor:pointer" title="点击选中复制">' + info.cmd + '</code></span>'
        + extraHtml
        + '</div>';
      return;
    }

    var sections = [renderSummaryBar(list)];

    // Sparkline for health & all filters
    if (activeFilter === 'all' || activeFilter === 'health') {
      var spark = renderHealthSparkline();
      if (spark) sections.push(spark);
    }

    // Build cards grouped by date
    var cardsHtml = '';
    var lastDate = '';
    for (var i = 0; i < list.length; i++) {
      var curDate = list[i].date || '';
      if (curDate && activeFilter === 'all' && curDate !== lastDate) {
        cardsHtml += '<div class="np-date-sep"><span>' + curDate + '</span></div>';
        lastDate = curDate;
      }
      cardsHtml += renderCard(list[i], i === 0);
    }
    sections.push('<div class="np-list">' + cardsHtml + '</div>');

    panelBody.innerHTML = '<div class="np-content">' + sections.join('') + '</div>';
  }
})();
