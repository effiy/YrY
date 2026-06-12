/**
 * notify-panel.js — notification center panel
 *
 * Aggregates health reports, self-loop reports, and trend reports
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

  /* ── Parsing helpers ────────────────────── */
  function parseHealthFilename(href) {
    var name = href.replace('.html', '').replace('health-', '');
    var parts = name.split('-');
    return { date: parts.slice(0, 3).join('-'), timeId: parts.slice(3).join('') };
  }

  function parseLoopFilename(href) {
    var name = href.replace('.html', '');
    var parts = name.split('-');
    var dateIdx = -1;
    for (var i = 0; i < parts.length - 2; i++) {
      if (/^\d{4}$/.test(parts[i]) && /^\d{2}$/.test(parts[i+1]) && /^\d{2}$/.test(parts[i+2])) {
        dateIdx = i; break;
      }
    }
    var skill = dateIdx > 0 ? parts.slice(0, dateIdx).join('-') : parts.slice(0, -4).join('-');
    var date = dateIdx > 0 ? parts.slice(dateIdx, dateIdx + 3).join('-') : '';
    var timeId = parts.slice(dateIdx > 0 ? dateIdx + 3 : -4).join('');
    return { skill: skill, date: date, timeId: timeId };
  }

  function parseIndex(html, basePath) {
    var items = [];
    var re = /<a\s+href="([^"]+)">([^<]+)<\/a>\s*<\/td>\s*<td[^>]*>([^<]*)<\/td>/gi;
    var m;
    while ((m = re.exec(html)) !== null) {
      items.push({ href: m[1], label: m[2].replace(/<[^>]+>/g, ''), col2: m[3].trim(), basePath: basePath });
    }
    if (items.length === 0) {
      var re2 = /<tr[^>]*>\s*<td[^>]*><a\s+href="([^"]+)">([^<]+)<\/a>/gi;
      while ((m = re2.exec(html)) !== null) {
        items.push({ href: m[1], label: m[2].replace(/<[^>]+>/g, ''), col2: '', basePath: basePath });
      }
    }
    items.sort(function(a, b) { return b.href.localeCompare(a.href); });
    return items;
  }

  /* ── Metadata extraction ────────────────── */
  function extractHealthMeta(html) {
    var meta = {};
    var sm = html.match(/h-score-num[^>]*>(\d+)</);
    if (sm) meta.score = parseInt(sm[1], 10);
    var gm = html.match(/h-score-grade[^>]*>([ABCD]) 级</);
    if (gm) meta.grade = gm[1];
    var tm = html.match(/h-hs-val[^>]*>(\d+)\/8 触发</);
    if (tm) meta.triggers = parseInt(tm[1], 10);
    var rec = html.match(/h-rec-text">([^<]+)</);
    if (rec) meta.topRec = rec[1];
    var recMatch = html.match(/h-rec-item/g);
    if (recMatch) meta.recs = recMatch.length;
    var pt = html.match(/<title>([^<]+)<\/title>/);
    if (pt) meta.pageTitle = pt[1];
    var robMatch = html.match(/机器人:\s*<span[^>]*>(\d+)\/(\d+)\s*就绪</);
    if (robMatch) { meta.robotsOk = parseInt(robMatch[1], 10); meta.robotsTotal = parseInt(robMatch[2], 10); }
    var execMatch = html.match(/执行记忆:\s*<span[^>]*>(\d+)\s*条</);
    if (execMatch) meta.execCount = parseInt(execMatch[1], 10);
    var assessMatch = html.match(/h-summary-val[^>]*>([^<]+)<\/div>\s*<div[^>]*h-summary-lbl[^>]*>综合评估</);
    if (assessMatch) meta.overallAssess = assessMatch[1].replace(/<[^>]+>/g, '').trim();
    var summaryMatch = html.match(/h-summary-desc[^>]*>([^<]+)</);
    if (!summaryMatch) summaryMatch = html.match(/h-summary-text[^>]*>([^<]+)</);
    if (!summaryMatch) summaryMatch = html.match(/h-rec-body[^>]*>\s*<p[^>]*>([^<]+)</);
    if (summaryMatch) meta.summaryText = summaryMatch[1].trim();
    var trigIds = [];
    var trigRe = /h-trigger-chip[^>]*>([A-Z]\d+)</g;
    var trm;
    while ((trm = trigRe.exec(html)) !== null) { if (trigIds.indexOf(trm[1]) === -1) trigIds.push(trm[1]); }
    if (trigIds.length > 0) meta.triggeredIds = trigIds;
    var dimScores = {};
    var dimRe = /h-dim-label[^>]*>([^<]+)<\/span>[\s\S]*?h-dim-score[^>]*>(\d+) 分</g;
    var dm;
    while ((dm = dimRe.exec(html)) !== null) dimScores[dm[1]] = parseInt(dm[2], 10);
    if (Object.keys(dimScores).length > 0) {
      meta.dimScores = dimScores;
      var pass = 0, warn = 0, fail = 0, bestScore = 0, worstScore = 100, bestDim = '', worstDim = '';
      Object.keys(dimScores).forEach(function(k) {
        var s = dimScores[k];
        if (s >= 80) pass++; else if (s >= 60) warn++; else fail++;
        if (s > bestScore)  { bestScore = s; bestDim = k; }
        if (s < worstScore) { worstScore = s; worstDim = k; }
      });
      meta.dimStats = { pass: pass, warn: warn, fail: fail, total: Object.keys(dimScores).length, best: { dim: bestDim, score: bestScore }, worst: { dim: worstDim, score: worstScore } };
    }
    return meta;
  }

  function extractLoopMeta(html) {
    var meta = {};
    var sm = html.match(/yry-badge\s+(pass|warn|fail)/);
    if (sm) meta.status = sm[1];
    var sum = html.match(/yry-summary">([^<]+)</);
    if (sum) meta.summary = sum[1];
    var pt = html.match(/<title>([^<]+)<\/title>/);
    if (pt) meta.pageTitle = pt[1];
    var intv = html.match(/间隔:?\s*(\d+\s*(?:分钟|小时|天|min|hour|day|hr)[^\s<]*)/i);
    if (intv) meta.interval = intv[1];
    var infoCount = (html.match(/yry-finding\s+info/g) || []).length;
    var warnCount = (html.match(/yry-finding\s+warn/g) || []).length;
    var failCount = (html.match(/yry-finding\s+fail/g) || []).length;
    if (infoCount + warnCount + failCount > 0) {
      meta.findings = { info: infoCount, warn: warnCount, fail: failCount };
    }
    var hc = html.match(/yry-val[^>]*>(\d+)<\/div>\s*<div[^>]*yry-lbl[^>]*>🩺 健康度 ([ABCD]) 级</);
    if (hc) { meta.healthScore = parseInt(hc[1], 10); meta.healthGrade = hc[2]; }
    var findingTitles = [];
    var ftRe = /yry-finding-head[^>]*>\d+\.\s*([^<]+)</g;
    var ftm;
    while ((ftm = ftRe.exec(html)) !== null && findingTitles.length < 8) {
      findingTitles.push(ftm[1]);
    }
    if (findingTitles.length > 0) meta.findingTitles = findingTitles;
    var findingLevels = [];
    var flRe = /yry-finding\s+(info|warn|fail)/g;
    var flm;
    while ((flm = flRe.exec(html)) !== null && findingLevels.length < 8) {
      findingLevels.push(flm[1]);
    }
    if (findingLevels.length > 0) meta.findingLevels = findingLevels;
    var descMatch = html.match(/yry-desc[^>]*>([^<]+)</);
    if (!descMatch) descMatch = html.match(/yry-overview[^>]*>([^<]+)</);
    if (descMatch) meta.description = descMatch[1].trim();
    return meta;
  }

  /* ── Data fetching ──────────────────────── */
  async function fetchIndex(url, key) {
    try {
      var resp = await fetch(url);
      if (!resp.ok) return [];
      var html = await resp.text();
      var basePath = key === 'health' ? './健康报告/' : './自循环报告/';
      return parseIndex(html, basePath);
    } catch (e) { return []; }
  }

  async function fetchTrendItems() {
    try {
      var resp = await fetch(H.PATHS.trendManifest);
      if (!resp.ok) return [];
      var manifest = await resp.json();
      return manifest.map(function(r) {
        return {
          href: r.file || '', basePath: './趋势报告/', date: r.date,
          source: r.source, ok: r.ok, trend: r.trend,
          items: r.items, reachable: r.reachable, total: r.total,
          keywords: r.keywords || [],
          meta: { ok: r.ok, trend: r.trend, items: r.items, source: r.source, reachable: r.reachable, total: r.total, keywords: r.keywords || [] }
        };
      });
    } catch(e) { return []; }
  }

  async function fetchAll() {
    loaded = true;
    panelBody.innerHTML = '<div class="panel-loading">加载中...</div>';

    try {
      var _a = await Promise.all([
        fetchIndex(H.PATHS.healthIndex, 'health'),
        fetchIndex(H.PATHS.loopIndex, 'loop'),
        fetchTrendItems()
      ]);
    } catch(e) {
      panelBody.innerHTML = '<div class="panel-empty">数据加载失败<br><span class="hint">请检查网络连接后重试</span></div>';
      return;
    }
    var healthRaw = _a[0], loopRaw = _a[1], trendItems = _a[2];

    var unified = [];
    for (var i = 0; i < healthRaw.length; i++) {
      var hp = parseHealthFilename(healthRaw[i].href);
      unified.push({
        type: 'health', href: healthRaw[i].href, basePath: healthRaw[i].basePath,
        date: hp.date, timeId: hp.timeId, meta: null
      });
    }
    for (var j = 0; j < loopRaw.length; j++) {
      var lp = parseLoopFilename(loopRaw[j].href);
      unified.push({
        type: 'loop', href: loopRaw[j].href, basePath: loopRaw[j].basePath,
        skill: lp.skill, date: lp.date, timeId: lp.timeId, meta: null
      });
    }
    for (var k = 0; k < trendItems.length; k++) {
      unified.push({
        type: 'trend', href: trendItems[k].href, basePath: trendItems[k].basePath,
        date: trendItems[k].date, meta: trendItems[k].meta,
        source: trendItems[k].source, keywords: trendItems[k].keywords
      });
    }

    unified.sort(function(a, b) {
      var dc = (b.date || '').localeCompare(a.date || '');
      if (dc !== 0) return dc;
      return (b.href || '').localeCompare(a.href || '');
    });

    var hc = healthRaw.length, lc = loopRaw.length, tc = trendItems.length;
    var elAll = document.getElementById('npBadgeAll'), elH = document.getElementById('npBadgeHealth'),
        elL = document.getElementById('npBadgeLoop'), elT = document.getElementById('npBadgeTrend');
    if (elAll) elAll.textContent = unified.length;
    if (elH) elH.textContent = hc;
    if (elL) elL.textContent = lc;
    if (elT) elT.textContent = tc;
    if (totalCount) totalCount.textContent = '共 ' + unified.length + ' 条';
    if (badge && unified.length > 0) badge.textContent = unified.length > 99 ? '99+' : String(unified.length);

    allItems = unified;
    renderList();

    var enrichLimit = 20;
    var fetches = [];
    for (var n = 0; n < Math.min(enrichLimit, unified.length); n++) {
      fetches.push(
        fetch(unified[n].basePath + unified[n].href)
          .then(function(r) { return r.ok ? r.text() : ''; })
          .catch(function() { return ''; })
      );
    }
    var results = await Promise.all(fetches);
    for (var m = 0; m < results.length; m++) {
      if (!results[m]) continue;
      var item = unified[m];
      if (item.type === 'health') {
        item.meta = extractHealthMeta(results[m]);
      } else if (item.type === 'loop') {
        item.meta = extractLoopMeta(results[m]);
      }
    }

    var healthItems = unified.filter(function(it) { return it.type === 'health'; });
    for (var hi = 0; hi < healthItems.length; hi++) {
      var cur = healthItems[hi];
      if (cur.meta && cur.meta.score !== undefined) {
        for (var hj = hi + 1; hj < healthItems.length; hj++) {
          if (healthItems[hj].meta && healthItems[hj].meta.score !== undefined) {
            cur.prevScore = healthItems[hj].meta.score;
            break;
          }
        }
      }
    }

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
    parts.push('<a href="#" onclick="event.stopPropagation();PanelHub.open(\'selfimprove\')" style="margin-left:auto;font-size:.62rem;color:var(--color-accent-2);text-decoration:none;white-space:nowrap" title="在自改进面板中查看趋势分析">🧬 深度分析 →</a>');
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

  function renderCard(item, isLatest) {
    var href = item.basePath + item.href;
    var cls = isLatest ? ' np-latest' : '';

    var dotCls = 'ok';
    var typeLabel = '', typeCls = item.type;
    if (item.type === 'health') {
      typeLabel = '🩺 健康';
      dotCls = item.meta && item.meta.score !== undefined
        ? (item.meta.score >= 80 ? 'ok' : item.meta.score >= 60 ? 'warn' : 'bad') : 'ok';
    } else if (item.type === 'loop') {
      typeLabel = '🔄 自循环';
      dotCls = item.meta && item.meta.status
        ? (item.meta.status === 'pass' ? 'ok' : item.meta.status === 'warn' ? 'warn' : 'bad') : 'ok';
    } else {
      var srcIcons = { 'all': '🌐', 'github-trending': '🐙', 'oss-insight': '📊', 'trendshift': '🔥', 'top-starred': '⭐' };
      typeLabel = (srcIcons[item.source] || '📡') + ' 趋势';
      dotCls = item.meta && item.meta.ok === false ? 'bad' : 'ok';
    }

    var title = '';
    if (item.type === 'health') {
      var t = formatTimeId(item.timeId);
      title = '健康报告 · ' + item.date + (t ? (' ' + t) : '');
    } else if (item.type === 'loop') {
      title = (item.meta && item.meta.pageTitle) ? item.meta.pageTitle.replace('自循环报告 · ', '') : (item.skill || '自循环报告');
    } else {
      var srcLabels = { 'all': '全量扫描', 'github-trending': 'GitHub Trending', 'oss-insight': 'OSS Insight', 'trendshift': 'TrendShift', 'top-starred': 'Top-Starred' };
      title = (srcLabels[item.source] || item.source) + ' · ' + item.date;
    }

    var detailSections = [];
    if (item.type === 'health' && item.meta) {
      var m = item.meta;
      var row1 = '<div class="np-meta-row">';
      if (m.score !== undefined) {
        var g = m.grade || '';
        var gradeMsg = { A: '系统健康', B: '需关注', C: '需修复', D: '需干预' };
        row1 += '<span class="np-score-badge ' + g + '">' + m.score + '分 ' + g + '级</span>';
        row1 += '<span style="font-size:.62rem;color:var(--text-muted)">' + (gradeMsg[g] || '') + '</span>';
      }
      if (item.prevScore !== undefined && m.score !== item.prevScore) {
        var d = m.score - item.prevScore;
        row1 += '<span class="np-delta t-' + (d > 0 ? 'green' : 'red') + '">' + (d > 0 ? '↑' : '↓') + Math.abs(d) + '</span>';
      }
      if (m.triggers !== undefined) {
        var tClr = m.triggers === 0 ? 't-green' : m.triggers <= 2 ? 't-yellow' : 't-red';
        row1 += '<span class="np-meta-item"><span class="np-meta-icon">🔬</span><span class="np-meta-val ' + tClr + '">' + m.triggers + '</span><span class="np-meta-label">/8 触发</span></span>';
      }
      if (m.recs !== undefined) {
        row1 += '<span class="np-meta-item"><span class="np-meta-icon">💡</span><span class="np-meta-val">' + m.recs + '</span><span class="np-meta-label">建议</span></span>';
      }
      if (m.robotsOk !== undefined && m.robotsTotal !== undefined) {
        var rClr = m.robotsOk === m.robotsTotal ? 't-green' : m.robotsOk > 0 ? 't-yellow' : 't-red';
        row1 += '<span class="np-meta-item"><span class="np-meta-icon">🤖</span><span class="np-meta-val ' + rClr + '">' + m.robotsOk + '/' + m.robotsTotal + '</span><span class="np-meta-label">就绪</span></span>';
      }
      row1 += '</div>';
      detailSections.push(row1);

      if (m.triggeredIds && m.triggeredIds.length > 0) {
        var trigTags = '<div class="np-trigger-list">';
        m.triggeredIds.forEach(function(tid) {
          trigTags += '<span class="np-trigger t-warm">' + H.escHtml(tid) + '</span>';
        });
        trigTags += '</div>';
        detailSections.push(trigTags);
      }

      if (m.dimScores && m.dimStats) {
        var dimNames = Object.keys(m.dimScores);
        var dimGrid = '<div class="np-dim-grid">';
        var sorted = dimNames.map(function(k) { return { name: k, score: m.dimScores[k] }; });
        sorted.sort(function(a, b) { return a.score - b.score; });
        var showCount = Math.min(8, sorted.length);
        for (var di = 0; di < showCount; di++) {
          var dn = sorted[di];
          var dnClr = dn.score >= 80 ? 'pass' : dn.score >= 60 ? 'warn' : 'fail';
          dimGrid += '<div class="np-dg-item"><span class="np-dg-dot ' + dnClr + '"></span><span class="np-dg-name">' + H.escHtml(dn.name) + '</span><span class="np-dg-score" style="color:' + (dn.score >= 80 ? '#22c55e' : dn.score >= 60 ? '#f59e0b' : '#ef4444') + '">' + dn.score + '</span></div>';
        }
        if (sorted.length > showCount) dimGrid += '<div class="np-dg-item" style="font-size:.52rem;color:var(--text-muted)">+' + (sorted.length - showCount) + ' 维度</div>';
        dimGrid += '</div>';
        detailSections.push(dimGrid);
      }

      if (m.overallAssess) {
        detailSections.push('<div class="np-rec-hint">📋 ' + H.escHtml(m.overallAssess) + '</div>');
      }
      if (m.topRec) {
        detailSections.push('<div class="np-rec-hint">💡 ' + H.escHtml(m.topRec.length > 100 ? m.topRec.slice(0, 100) + '…' : m.topRec) + '</div>');
      }
      if (m.summaryText) {
        detailSections.push('<div class="np-summary-text">' + H.escHtml(m.summaryText.length > 120 ? m.summaryText.slice(0, 120) + '…' : m.summaryText) + '</div>');
      }
    } else if (item.type === 'loop' && item.meta) {
      var lm = item.meta;
      var lr1 = '<div class="np-meta-row">';
      if (lm.status) {
        var sl = { pass: '✅ 通过', warn: '⚠️ 告警', fail: '🚫 异常' };
        var sClr = lm.status === 'pass' ? 't-green' : lm.status === 'warn' ? 't-yellow' : 't-red';
        lr1 += '<span class="np-meta-item"><span class="np-meta-val ' + sClr + '">' + (sl[lm.status] || lm.status) + '</span></span>';
      }
      if (lm.interval) {
        lr1 += '<span class="np-meta-item"><span class="np-meta-icon">⏱️</span><span class="np-meta-val">' + H.escHtml(lm.interval) + '</span></span>';
      }
      if (lm.healthScore !== undefined) {
        var hg = lm.healthGrade || '';
        lr1 += '<span class="np-score-badge ' + hg + '">🩺 ' + lm.healthScore + ' ' + hg + '</span>';
      }
      lr1 += '</div>';
      detailSections.push(lr1);

      if (lm.description) {
        detailSections.push('<div class="np-summary-text">' + H.escHtml(lm.description.length > 100 ? lm.description.slice(0, 100) + '…' : lm.description) + '</div>');
      }
      if (lm.findings) {
        var f = lm.findings;
        var lr2 = '<div class="np-meta-row"><span class="np-meta-item"><span class="np-meta-icon">🔍</span><span class="np-meta-label">发现: </span></span>';
        if (f.fail) lr2 += '<span class="np-meta-item"><span class="np-meta-val t-red">🚫 ' + f.fail + '</span><span class="np-meta-label">异常</span></span>';
        if (f.warn) lr2 += '<span class="np-meta-item"><span class="np-meta-val t-yellow">⚠️ ' + f.warn + '</span><span class="np-meta-label">告警</span></span>';
        if (f.info) lr2 += '<span class="np-meta-item"><span class="np-meta-val" style="color:#60a5fa">ℹ️ ' + f.info + '</span><span class="np-meta-label">信息</span></span>';
        if (!f.fail && !f.warn && !f.info) lr2 += '<span class="np-meta-item"><span class="np-meta-val t-green">✅ 0</span></span>';
        lr2 += '</div>';
        detailSections.push(lr2);
      }
      if (lm.findingTitles && lm.findingTitles.length) {
        var ftList = '<div class="np-finding-list">';
        var maxShow = Math.min(5, lm.findingTitles.length);
        for (var fti = 0; fti < maxShow; fti++) {
          var ftLevel = 'info';
          if (lm.findingLevels && fti < lm.findingLevels.length) {
            ftLevel = lm.findingLevels[fti];
          } else if (lm.findings) {
            var ff = lm.findings;
            if (fti < (ff.fail || 0)) ftLevel = 'fail';
            else if (fti < (ff.fail || 0) + (ff.warn || 0)) ftLevel = 'warn';
          }
          ftList += '<div class="np-finding-item ' + ftLevel + '">' + H.escHtml(lm.findingTitles[fti]) + '</div>';
        }
        if (lm.findingTitles.length > maxShow) {
          ftList += '<div class="np-finding-item info">…还有 ' + (lm.findingTitles.length - maxShow) + ' 项</div>';
        }
        ftList += '</div>';
        detailSections.push(ftList);
      }
    } else if (item.type === 'trend') {
      var tm = item.meta || {};
      var tr1 = '<div class="np-meta-row">';
      if (tm.ok !== undefined) {
        tr1 += '<span class="np-meta-item"><span class="np-meta-val ' + (tm.ok ? 't-green' : 't-red') + '">' + (tm.ok ? '✅ 可达' : '🚫 不可达') + '</span></span>';
      }
      if (tm.items !== undefined) {
        tr1 += '<span class="np-meta-item"><span class="np-meta-icon">📦</span><span class="np-meta-val">' + tm.items + '</span><span class="np-meta-label">条目</span></span>';
      }
      if (tm.reachable !== undefined && tm.total !== undefined) {
        var ratio = tm.total > 0 ? Math.round(tm.reachable / tm.total * 100) : 0;
        var rClr = ratio >= 80 ? 't-green' : ratio >= 50 ? 't-yellow' : 't-red';
        tr1 += '<span class="np-meta-item"><span class="np-meta-icon">🔗</span><span class="np-meta-val ' + rClr + '">' + tm.reachable + '/' + tm.total + '</span><span class="np-meta-label">可达(' + ratio + '%)</span></span>';
      }
      if (tm.trend) {
        if (tm.trend === 'flat') {
          tr1 += '<span class="np-meta-item"><span class="np-meta-val" style="color:#94a3b8">➡️ 平稳</span></span>';
        } else {
          var trendIcon = tm.trend === 'rise' ? '📈' : '📉';
          var trendLabel = tm.trend === 'rise' ? '上升' : '下降';
          var trendClr = tm.trend === 'rise' ? 't-green' : 't-red';
          tr1 += '<span class="np-meta-item"><span class="np-meta-val ' + trendClr + '">' + trendIcon + ' ' + trendLabel + '</span></span>';
        }
      }
      tr1 += '</div>';
      detailSections.push(tr1);

      if (item.keywords && item.keywords.length) {
        var kws = '<div class="np-kw-list">';
        var showKws = item.keywords.slice(0, 8);
        for (var ki = 0; ki < showKws.length; ki++) {
          kws += '<span class="np-kw">' + H.escHtml(showKws[ki]) + '</span>';
        }
        if (item.keywords.length > 8) kws += '<span class="np-kw">+' + (item.keywords.length - 8) + '</span>';
        kws += '</div>';
        detailSections.push(kws);
      }
    }

    var timeHtml = item.date
      ? '<span class="np-time" title="' + H.escHtml(item.date) + '">' + H.escHtml(H.relativeTime(item.date)) + '</span>'
      : '';

    /* ── Featured card: latest health report ── */
    if (isLatest && item.type === 'health' && item.meta && item.meta.score !== undefined) {
      var m = item.meta;
      var scCls = m.score >= 80 ? 'A' : m.score >= 60 ? 'C' : 'D';
      var gradeCls = m.grade || '';

      var deltaHtml = '';
      if (item.prevScore !== undefined && m.score !== item.prevScore) {
        var d = m.score - item.prevScore;
        deltaHtml = '<span class="npl-delta ' + (d > 0 ? 'up' : 'down') + '">' + (d > 0 ? '&#9650;' : '&#9660;') + Math.abs(d) + '</span>';
      }

      var metaParts = [];
      if (m.triggers !== undefined) {
        var tClr = m.triggers === 0 ? 'ok' : m.triggers <= 2 ? 'warn' : 'bad';
        metaParts.push('<span class="npl-meta-item">&#128300; <strong class="' + tClr + '">' + m.triggers + '</strong>/8 触发</span>');
      }
      if (m.recs !== undefined) {
        metaParts.push('<span class="npl-meta-item">&#128161; <strong>' + m.recs + '</strong> 建议</span>');
      }
      if (m.robotsOk !== undefined && m.robotsTotal !== undefined) {
        var rClr = m.robotsOk === m.robotsTotal ? 'ok' : m.robotsOk > 0 ? 'warn' : 'bad';
        metaParts.push('<span class="npl-meta-item">&#129302; <strong class="' + rClr + '">' + m.robotsOk + '/' + m.robotsTotal + '</strong> 就绪</span>');
      }

      var dimsHtml = '';
      if (m.dimScores) {
        var dimNames = Object.keys(m.dimScores);
        var sorted = dimNames.map(function(k) { return { name: k, score: m.dimScores[k] }; });
        sorted.sort(function(a, b) { return a.score - b.score; });
        var shown = Math.min(sorted.length, 9);
        for (var di = 0; di < shown; di++) {
          var dn = sorted[di];
          var barClr = dn.score >= 80 ? '#22c55e' : dn.score >= 60 ? '#f59e0b' : '#ef4444';
          dimsHtml += '<div class="npl-dim">'
            + '<span class="npl-dim-label" title="' + H.escHtml(dn.name) + '">' + H.escHtml(dn.name) + '</span>'
            + '<span class="npl-dim-bar-wrap"><span class="npl-dim-bar" style="width:' + dn.score + '%;background:' + barClr + '"></span></span>'
            + '<span class="npl-dim-val">' + dn.score + '</span>'
            + '</div>';
        }
        if (dimsHtml) dimsHtml = '<div class="np-latest-dims">' + dimsHtml + '</div>';
      }

      var recHtml = '';
      if (m.topRec) {
        recHtml = '<div class="np-latest-rec">&#128161; ' + H.escHtml(m.topRec.length > 140 ? m.topRec.slice(0, 140) + '…' : m.topRec) + '</div>';
      } else if (m.summaryText) {
        recHtml = '<div class="np-latest-rec">&#128203; ' + H.escHtml(m.summaryText.length > 140 ? m.summaryText.slice(0, 140) + '…' : m.summaryText) + '</div>';
      }

      return '<div class="np-card np-latest-featured" onclick="window.open(\'' + href + '\',\'_blank\')">'
        + '<div class="np-latest-score">'
        + '<span class="npl-badge">最新</span>'
        + '<span class="npl-score-num ' + scCls + '">' + m.score + '</span>'
        + (gradeCls ? '<span class="npl-grade ' + gradeCls + '">' + gradeCls + ' 级</span>' : '')
        + deltaHtml
        + '</div>'
        + '<div class="np-latest-main">'
        + '<div class="np-latest-head"><span class="np-type ' + typeCls + '">' + typeLabel + '</span>'
      + '<span class="np-latest-title"><a href="' + href + '" target="_blank" onclick="event.stopPropagation()">' + H.escHtml(title) + '</a></span>'
        + timeHtml
        + '</div>'
        + (metaParts.length ? '<div class="np-latest-meta">' + metaParts.join('') + '</div>' : '')
        + dimsHtml
        + recHtml
        + '</div>'
        + '</div>';
    }

    /* ── Standard card: non-featured or non-health ── */
    return '<div class="np-card' + cls + '" onclick="window.open(\'' + href + '\',\'_blank\')">'
      + '<span class="np-dot ' + dotCls + '"></span>'
      + '<div class="np-body">'
      + '<div class="np-head"><span class="np-type ' + typeCls + '">' + typeLabel + '</span>'
      + '<span class="np-title"><a href="' + href + '" target="_blank" onclick="event.stopPropagation()">' + H.escHtml(title) + '</a></span></div>'
      + (detailSections.length ? '<div class="np-detail">' + detailSections.join('') + '</div>' : '')
      + '</div>'
      + timeHtml
      + '</div>';
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
    scores.reverse(); // oldest first
    var last10 = scores.slice(-10);
    var minS = Math.min.apply(null, last10.map(function(s) { return s.score; }));
    var maxS = Math.max.apply(null, last10.map(function(s) { return s.score; }));
    var range = maxS - minS || 1;

    var html = '<div style="padding:8px 18px;margin:4px 8px;background:rgba(255,255,255,.015);border-radius:8px;border:1px solid rgba(255,255,255,.04)">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">';
    html += '<span style="font-size:.62rem;color:var(--text-muted)">📈 健康趋势（最近 ' + last10.length + ' 次）</span>';
    var firstS = last10[0].score, lastS = last10[last10.length-1].score;
    var trendIcon = lastS > firstS ? '↑' : lastS < firstS ? '↓' : '→';
    var trendClr = lastS > firstS ? '#22c55e' : lastS < firstS ? '#ef4444' : 'var(--text-muted)';
    html += '<span style="font-size:.62rem;color:' + trendClr + '">' + trendIcon + ' ' + Math.abs(lastS - firstS) + ' 分</span>';
    html += '<span style="font-size:.58rem;color:var(--text-muted);margin-left:auto">' + last10[0].date + ' → ' + last10[last10.length-1].date + '</span>';
    html += '</div>';
    html += '<div style="display:flex;align-items:flex-end;gap:2px;height:32px">';
    for (var j = 0; j < last10.length; j++) {
      var h = Math.max(3, Math.round((last10[j].score - minS) / range * 28) + 2);
      var barClr = last10[j].score >= 80 ? '#22c55e' : last10[j].score >= 60 ? '#f59e0b' : '#ef4444';
      html += '<span style="flex:1;height:' + h + 'px;background:' + barClr + ';border-radius:1px 1px 0 0;min-width:4px" title="' + last10[j].date + ': ' + last10[j].score + '分 ' + (last10[j].grade||'') + '级"></span>';
    }
    html += '</div></div>';
    return html;
  }

  function renderList() {
    var list = activeFilter === 'all'
      ? allItems
      : allItems.filter(function(it) { return it.type === activeFilter; });

    if (list.length === 0) {
      var hintMap = {
        health: { desc: '生成最新健康报告并推送到通知中心', cmd: 'node skills/rui-bot/send.mjs health --html', extra: '或检查 ' + H.panelLink('cron', '⏰ 调度面板') + ' 中的健康检查任务是否正常触发' },
        loop: { desc: '运行自循环巡检，生成各技能巡检报告', cmd: 'node skills/rui-bot/lib/loop-report.mjs' },
        trend: { desc: '扫描 GitHub / OSS Insight 等趋势源', cmd: 'node skills/rui-trends/rui-trends.mjs all --html' },
        all: { desc: '运行健康检查生成首份报告', cmd: 'node skills/rui-bot/send.mjs health --html', extra: '新项目需先运行 /rui init 建立基线' }
      };
      var info = hintMap[activeFilter] || hintMap.all;
      var emptyMsg = activeFilter === 'all' ? '暂无通知 — 尚无可显示的报告或通知数据' : '该类型暂无报告数据';
      var extraHtml = info.extra ? '<br><span style="font-size:.62rem;color:var(--text-muted)">' + info.extra + '</span>' : '';
      panelBody.innerHTML = '<div class="panel-empty">'
        + '<div style="font-size:1.8rem;margin-bottom:12px;opacity:.4">📭</div>'
        + '<div>' + emptyMsg + '</div>'
        + '<span class="hint">' + info.desc + '<br><code style="user-select:all;cursor:pointer" title="点击选中复制">' + info.cmd + '</code></span>'
        + extraHtml
        + '</div>';
      return;
    }

    var html = renderSummaryBar(list);
    // Insert health trend sparkline for 'all' and 'health' filters
    if (activeFilter === 'all' || activeFilter === 'health') {
      var spark = renderHealthSparkline();
      if (spark) html += spark;
    }
    for (var i = 0; i < list.length; i++) {
      html += renderCard(list[i], i === 0);
    }
    panelBody.innerHTML = html;
  }
})();
