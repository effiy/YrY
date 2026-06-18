/**
 * notify-panel.js — notification center panel (Vue 3)
 *
 * Aggregates health reports, self-loop reports, trend reports, and project analysis
 * into a unified notification feed with filter chips.
 * Depends on: panel-hub.js (loaded first) · Vue 3 (window.Vue)
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

  /* ── Helpers ─────────────────────────────── */
  function scoreClass(score) { return score >= 80 ? 'A' : score >= 60 ? 'C' : 'D'; }
  function dotClass(score) { return score >= 80 ? 'ok' : score >= 60 ? 'warn' : 'bad'; }
  function gradeMessage(g) { return { A: '系统健康', B: '需关注', C: '需修复', D: '需干预' }[g] || ''; }

  function formatTimeId(timeId) {
    if (!timeId) return '';
    var s = String(timeId).replace(/\D/g, '');
    if (s.length < 4) return '';
    var hh = s.slice(0, 2), mm = s.slice(2, 4);
    if (!/^\d{2}$/.test(hh) || !/^\d{2}$/.test(mm)) return '';
    return hh + ':' + mm;
  }

  function getItemHref(item) {
    if (!item || !item.href) return '';
    var fileName = String(item.href).split('/').pop() || '';
    if (!fileName) return '';
    if (item.type === 'health') return './健康报告/' + fileName;
    return item.basePath ? (item.basePath + item.href) : item.href;
  }

  /* ── Vue reactive state ─────────────────── */
  var state = Vue.reactive({
    allItems: [],
    activeFilter: 'all',
    loading: false,
    error: null
  });

  /* ── Vue app ────────────────────────────── */
  var app = Vue.createApp({
    data: function() { return state; },
    computed: {
      filteredItems: function() {
        var list = this.activeFilter === 'all'
          ? this.allItems
          : this.allItems.filter(function(it) { return it.type === this.activeFilter; }.bind(this));
        // Attach item index for isLatest detection
        return list.map(function(item, i) { item._idx = i; return item; });
      },
      summaryBar: function() {
        var list = this.filteredItems;
        if (!list || list.length === 0) return null;
        var totalTriggers = 0, totalWarnFindings = 0, totalFailFindings = 0;
        var unreadWarn = 0, unreadFail = 0, unreachableTrends = 0;
        var latestScore = null, prevScore = null;
        list.forEach(function(it) {
          if (it.type === 'health' && it.meta && it.meta.triggers) totalTriggers += it.meta.triggers;
          if (it.type === 'loop' && it.meta && it.meta.findings) {
            totalWarnFindings += (it.meta.findings.warn || 0);
            totalFailFindings += (it.meta.findings.fail || 0);
            if (it.meta.status === 'warn') unreadWarn++;
            if (it.meta.status === 'fail') unreadFail++;
          }
          if (it.type === 'trend' && it.meta && it.meta.ok === false) unreachableTrends++;
        });
        var healthItems = list.filter(function(x) { return x.type === 'health' && x.meta && x.meta.score !== undefined; });
        if (healthItems.length >= 2) { latestScore = healthItems[0].meta.score; prevScore = healthItems[1].meta.score; }
        else if (healthItems.length === 1) { latestScore = healthItems[0].meta.score; }
        var stats = [];
        var GRADE_GUIDE = { A: '优秀，系统运行健康', B: '良好，少量维度需关注', C: '告警，多项指标异常需修复', D: '严重，需要立即干预' };
        if (latestScore !== null) {
          var g = healthItems[0].meta.grade || '';
          var scClr = latestScore >= 80 ? '#22c55e' : latestScore >= 60 ? '#f59e0b' : '#ef4444';
          stats.push({ icon: '🩺', val: latestScore + `分 ${g}级`, color: scClr, hint: GRADE_GUIDE[g] || '' });
          if (prevScore !== null && latestScore !== prevScore) {
            var d = latestScore - prevScore;
            stats.push({ val: (d > 0 ? '↑' : '↓') + Math.abs(d), color: d > 0 ? '#22c55e' : '#ef4444' });
          }
        }
        if (totalTriggers > 0) stats.push({ icon: '🔬', val: totalTriggers + '触发', color: '#f59e0b', title: 'D0-D7 诊断触发总数' });
        if (totalFailFindings > 0) stats.push({ icon: '🚫', val: totalFailFindings + '异常', color: '#ef4444' });
        if (totalWarnFindings > 0) stats.push({ icon: '⚠️', val: totalWarnFindings + '告警', color: '#f59e0b' });
        if (unreadFail > 0) stats.push({ icon: '📋', val: unreadFail + '巡检异常', color: '#ef4444', title: '巡检报告中存在异常状态的技能数' });
        else if (unreadWarn > 0) stats.push({ icon: '📋', val: unreadWarn + '巡检告警', color: '#f59e0b' });
        if (unreachableTrends > 0) stats.push({ icon: '🔗', val: unreachableTrends + '源不可达', color: '#ef4444' });
        if (stats.length === 0) stats.push({ icon: '✅', val: '一切正常', color: '#22c55e' });
        return { stats: stats, total: list.length };
      },
      healthSparkline: function() {
        var scores = [];
        this.allItems.forEach(function(item) {
          if (item.type === 'health' && item.meta && item.meta.score !== undefined) {
            scores.push({ score: item.meta.score, grade: item.meta.grade, date: item.date });
          }
        });
        if (scores.length < 2) return null;
        scores.reverse();
        var lastN = scores.slice(-10);
        var minS = Math.min.apply(null, lastN.map(function(s) { return s.score; }));
        var maxS = Math.max.apply(null, lastN.map(function(s) { return s.score; }));
        var range = maxS - minS || 1;
        var firstS = lastN[0].score, lastS = lastN[lastN.length - 1].score;
        var trendIcon = lastS > firstS ? '↑' : lastS < firstS ? '↓' : '→';
        var trendClr = lastS > firstS ? '#22c55e' : lastS < firstS ? '#ef4444' : 'var(--text-muted)';
        var bars = lastN.map(function(s) {
          return { h: Math.max(3, Math.round((s.score - minS) / range * 28) + 2),
                   color: s.score >= 80 ? '#22c55e' : s.score >= 60 ? '#f59e0b' : '#ef4444',
                   title: s.date + `: ${s.score}分 ` + (s.grade || '') + '级' };
        });
        return { bars: bars, trendIcon: trendIcon, trendClr: trendClr,
                 diff: Math.abs(lastS - firstS), from: lastN[0].date, to: lastN[lastN.length - 1].date, count: lastN.length };
      },
      dateGroups: function() {
        var list = this.filteredItems;
        var groups = [];
        var lastDate = '';
        list.forEach(function(item, i) {
          var curDate = item.date || '';
          if (curDate && this.activeFilter === 'all' && curDate !== lastDate) {
            groups.push({ isDate: true, date: curDate });
            lastDate = curDate;
          }
          groups.push({ isDate: false, item: item, isLatest: i === 0 });
        }.bind(this));
        return groups;
      }
    },
    methods: {
      setFilter: function(f) { this.activeFilter = f; },
      openPanel: function(name) { H.open(name); },
      escHtml: function(s) { return H.escHtml(s); },
      relativeTime: function(d) { return H.relativeTime(d); },
      getHref: function(item) { return getItemHref(item); },
      isExternal: function(href) {
        return /^(https?:)?\/\//i.test(String(href).trim()) || /^(mailto:|tel:)/i.test(String(href).trim());
      },
      cardOnclick: function(item) {
        var href = getItemHref(item);
        if (!href) return;
        var rawHref = String(href).trim();
        var isExt = /^(https?:)?\/\//i.test(rawHref) || /^(mailto:|tel:)/i.test(rawHref);
        var finalHref = rawHref;
        try { finalHref = encodeURI(rawHref); } catch(e) {}
        if (isExt) window.open(finalHref, '_blank', 'noopener');
        else location.href = finalHref;
      },
      resolveTypeLabel: function(item) {
        if (item.type === 'health') return { label: '🩺 健康', cls: 'health' };
        if (item.type === 'loop')   return { label: '🔄 自循环', cls: 'loop' };
        if (item.type === 'analysis') return { label: '🔍 项目分析', cls: 'analysis' };
        var icons = { 'all': '🌐', 'github-trending': '🐙', 'oss-insight': '📊', 'trendshift': '🔥', 'top-starred': '⭐' };
        return { label: (icons[item.source] || '📡') + ' 趋势', cls: 'trend' };
      },
      resolveDotClass: function(item) {
        if (item.type === 'health') return item.meta && item.meta.score !== undefined ? dotClass(item.meta.score) : 'ok';
        if (item.type === 'loop') return item.meta && item.meta.status ? (item.meta.status === 'pass' ? 'ok' : item.meta.status === 'warn' ? 'warn' : 'bad') : 'ok';
        if (item.type === 'analysis') return item.meta && item.meta.overallScore !== undefined ? dotClass(item.meta.overallScore) : 'ok';
        return item.meta && item.meta.ok === false ? 'bad' : 'ok';
      },
      resolveTitle: function(item) {
        if (item.label) return String(item.label).trim();
        if (item.type === 'health') {
          if (item.date) return '🩺 ' + item.date;
          if (item.date && item.timeId) return `health-${item.date}-` + item.timeId;
          return '健康报告（文件缺失）';
        }
        var fileName = String(item.href || '').split('/').pop() || '';
        try { fileName = decodeURIComponent(fileName).replace(/\.html$/, ''); } catch(e) { fileName = fileName.replace(/\.html$/, ''); }
        if (fileName) return fileName;
        if (item.type === 'loop') return (item.meta && item.meta.pageTitle) ? item.meta.pageTitle.replace('自循环报告 · ', '') : (item.skill || '自循环报告');
        var srcLabels = { 'all': '全量扫描', 'github-trending': 'GitHub Trending', 'oss-insight': 'OSS Insight', 'trendshift': 'TrendShift', 'top-starred': 'Top-Starred' };
        if (item.type === 'analysis') return `🔍 项目分析 · ${item.date;
        return (srcLabels[item.source] || item.source)} · ` + item.date;
      },
      renderTime: function(item) {
        if (!item.date) return '';
        if (item.type === 'health' && item.timeText) return H.escHtml(item.timeText);
        return H.escHtml(H.relativeTime(item.date));
      },
      renderTimeTitle: function(item) {
        if (!item.date) return '';
        if (item.type === 'health' && item.timeText) return H.escHtml(item.date + ' ' + item.timeText);
        return H.escHtml(item.date);
      },
      /* Health detail helpers */
      healthScorePill: function(m) {
        if (m.score === undefined) return '';
        return { score: m.score, grade: m.grade || '', gradeLabel: gradeMessage(m.grade), cls: m.grade || '' };
      },
      healthDelta: function(item) {
        if (item.prevScore === undefined || item.meta.score === item.prevScore) return null;
        var d = item.meta.score - item.prevScore;
        return { up: d > 0, diff: Math.abs(d), text: (d > 0 ? '↑' : '↓') + Math.abs(d) };
      },
      healthDimScores: function(m) {
        if (!m.dimScores) return [];
        var entries = Object.keys(m.dimScores).map(function(k) { return { name: k, score: m.dimScores[k] }; });
        entries.sort(function(a, b) { return a.score - b.score; });
        return entries.slice(0, 8).map(function(dn) {
          return { name: H.escHtml(dn.name), score: dn.score, color: dn.score >= 80 ? '#22c55e' : dn.score >= 60 ? '#f59e0b' : '#ef4444', cls: dn.score >= 80 ? 'pass' : dn.score >= 60 ? 'warn' : 'fail' };
        });
      },
      healthDimOverflow: function(m) {
        if (!m.dimScores) return 0;
        var entries = Object.keys(m.dimScores);
        return entries.length > 8 ? entries.length - 8 : 0;
      },
      /* Loop detail helpers */
      loopStatus: function(m) {
        if (!m || !m.status) return null;
        var labels = { pass: '✅ 通过', warn: '⚠️ 告警', fail: '🚫 异常' };
        return { label: labels[m.status] || m.status, cls: m.status === 'pass' ? 't-green' : m.status === 'warn' ? 't-yellow' : 't-red' };
      },
      loopFindings: function(m) {
        if (!m || !m.findings) return null;
        var f = m.findings;
        var items = [];
        if (f.fail) items.push({ icon: '🚫', val: f.fail, label: '异常', cls: 't-red' });
        if (f.warn) items.push({ icon: '⚠️', val: f.warn, label: '告警', cls: 't-yellow' });
        if (f.info) items.push({ icon: 'ℹ️', val: f.info, label: '信息', cls: '' });
        if (!f.fail && !f.warn && !f.info) items.push({ icon: '✅', val: '0', cls: 't-green' });
        return items;
      },
      loopFindingTitles: function(m) {
        if (!m || !m.findingTitles || !m.findingTitles.length) return [];
        var maxShow = Math.min(5, m.findingTitles.length);
        var result = [];
        for (var i = 0; i < maxShow; i++) {
          var level = 'info';
          if (m.findingLevels && i < m.findingLevels.length) level = m.findingLevels[i];
          else if (m.findings) {
            if (i < (m.findings.fail || 0)) level = 'fail';
            else if (i < (m.findings.fail || 0) + (m.findings.warn || 0)) level = 'warn';
          }
          result.push({ text: H.escHtml(m.findingTitles[i]), level: level });
        }
        return result;
      },
      loopFindingOverflow: function(m) {
        if (!m || !m.findingTitles) return 0;
        return m.findingTitles.length > 5 ? m.findingTitles.length - 5 : 0;
      },
      /* Trend detail helpers */
      trendOk: function(m) {
        if (!m || m.ok === undefined) return null;
        return { ok: m.ok, label: m.ok ? '✅ 可达' : '🚫 不可达', cls: m.ok ? 't-green' : 't-red' };
      },
      trendReachability: function(m) {
        if (!m || m.reachable === undefined || m.total === undefined) return null;
        var pct = m.total > 0 ? Math.round(m.reachable / m.total * 100) : 0;
        return { reachable: m.reachable, total: m.total, pct: pct, cls: pct >= 80 ? 't-green' : pct >= 50 ? 't-yellow' : 't-red' };
      },
      trendDirection: function(m) {
        if (!m || !m.trend) return null;
        var icon = m.trend === 'flat' ? '➡️' : m.trend === 'rise' ? '📈' : '📉';
        var label = m.trend === 'flat' ? '平稳' : m.trend === 'rise' ? '上升' : '下降';
        return { icon: icon, label: label, cls: m.trend === 'flat' ? '' : m.trend === 'rise' ? 't-green' : 't-red' };
      },
      trendKeywords: function(item) {
        if (!item.keywords || !item.keywords.length) return [];
        return item.keywords.slice(0, 8).map(function(k) { return H.escHtml(k); });
      },
      trendKeywordOverflow: function(item) {
        if (!item.keywords) return 0;
        return item.keywords.length > 8 ? item.keywords.length - 8 : 0;
      },
      /* Analysis detail helpers */
      analysisScorePill: function(m) {
        if (m.overallScore === undefined) return null;
        return { score: m.overallScore, grade: m.overallGrade || '', cls: m.overallGrade || '' };
      },
      analysisDimScores: function(m) {
        if (!m.dimensions || !m.dimensions.length) return [];
        return m.dimensions.slice(0, 8).map(function(dn) {
          return { name: H.escHtml(dn.name), score: dn.score, color: dn.score >= 80 ? '#22c55e' : dn.score >= 60 ? '#f59e0b' : '#ef4444', cls: dn.score >= 80 ? 'pass' : dn.score >= 60 ? 'warn' : 'fail' };
        });
      },
      analysisDimOverflow: function(m) {
        return (m.dimensions && m.dimensions.length > 8) ? m.dimensions.length - 8 : 0;
      },
      analysisIssues: function(m) {
        if (!m.issues || !m.issues.length) return [];
        return m.issues.slice(0, 3).map(function(iss) {
          return { text: H.escHtml(iss.msg), level: iss.level === 'fail' ? 'fail' : iss.level === 'warn' ? 'warn' : 'info' };
        });
      },
      analysisIssueOverflow: function(m) {
        return (m.issues && m.issues.length > 3) ? m.issues.length - 3 : 0;
      },
      /* Empty state hints */
      emptyHint: function() {
        var map = {
          health: { desc: '生成最新健康报告并推送到通知中心', cmd: 'node skills/rui-bot/send.mjs health --html' },
          loop: { desc: '运行自循环巡检，生成各技能巡检报告', cmd: 'node skills/rui-bot/lib/loop-report.mjs' },
          trend: { desc: '扫描 GitHub / OSS Insight 等趋势源', cmd: 'node skills/rui-trends/rui-trends.mjs all --html' },
          analysis: { desc: '运行架构合规检查并生成项目分析报告', cmd: 'node lib/arch-check.mjs --json' },
          all: { desc: '运行健康检查生成首份报告', cmd: 'node skills/rui-bot/send.mjs health --html' }
        };
        return map[this.activeFilter] || map.all;
      },
      emptyMsg: function() {
        return this.activeFilter === 'all' ? '暂无通知 — 尚无可显示的报告或通知数据' : '该类型暂无报告数据';
      }
    },
    template: /* html */'<div v-if="loading" class="panel-loading yry-panel-loading">加载中...</div>'
      /* Empty state */
      + '<div v-else-if="filteredItems.length === 0" class="panel-empty yry-panel-empty"><div style="font-size:1.8rem;margin-bottom:12px;opacity:.4">📭</div><div>{{ emptyMsg() }}</div><span class="hint">{{ emptyHint().desc }}<br><code style="user-select:all;cursor:pointer" :title="emptyHint().cmd">{{ emptyHint().cmd }}</code></span></div>'
      /* Content */
      + '<div v-else class="np-content">'
      /* Summary bar */
      +   '<div v-if="summaryBar" class="np-summary-bar"><span v-for="(s, i) in summaryBar.stats" :key="i" class="np-summary-stat"><span v-if="s.icon" class="np-ss-icon">{{ s.icon }}</span><span class="np-ss-val" :style="{ color: s.color }">{{ s.val }}</span><span v-if="s.hint" style="font-size:.58rem;color:var(--text-muted);margin-left:3px">{{ s.hint }}</span></span><a href="#" class="np-summary-link" @click.prevent.stop="openPanel(\'selfimprove\')" title="在自改进面板中查看趋势分析">🧬 深度分析 →</a><span class="np-summary-stat" style="color:var(--text-muted)">共 {{ summaryBar.total }} 条</span></div>'
      /* Health sparkline */
      +   '<div v-if="healthSparkline && (activeFilter === \'all\' || activeFilter === \'health\')" class="np-sparkline"><div class="np-sparkline-head"><span class="np-sparkline-label">📈 健康趋势（最近 {{ healthSparkline.count }} 次）</span><span class="np-sparkline-trend" :style="{ color: healthSparkline.trendClr }">{{ healthSparkline.trendIcon }} {{ healthSparkline.diff }} 分</span><span class="np-sparkline-range">{{ healthSparkline.from }} → {{ healthSparkline.to }}</span></div><div class="np-sparkline-bars"><span v-for="(b, i) in healthSparkline.bars" :key="i" :style="{ flex:1, height: b.h + \'px\', background: b.color, borderRadius: \'1px 1px 0 0\', minWidth: \'4px\' }" :title="b.title"></span></div></div>'
      /* Card list */
      +   '<div class="np-list"><template v-for="(entry, idx) in dateGroups" :key="idx"><div v-if="entry.isDate" class="np-date-sep"><span>{{ entry.date }}</span></div>'
      /* Featured health card */
      +       '<div v-else-if="entry.isLatest && entry.item.type === \'health\' && entry.item.meta && entry.item.meta.score !== undefined" class="np-card np-latest-featured" @click="cardOnclick(entry.item)"><div class="np-latest-score"><span class="npl-badge">最新</span><span :class="\'npl-score-num \' + scoreClass(entry.item.meta.score)">{{ entry.item.meta.score }}</span><span v-if="entry.item.meta.grade" :class="\'npl-grade \' + entry.item.meta.grade">{{ entry.item.meta.grade }} 级</span><span v-if="healthDelta(entry.item)" :class="\'npl-delta \' + (healthDelta(entry.item).up ? \'up\' : \'down\')">{{ healthDelta(entry.item).up ? \'▲\' : \'▼\' }}{{ healthDelta(entry.item).diff }}</span></div><div class="np-latest-main"><div class="np-latest-head"><span :class="\'np-type \' + resolveTypeLabel(entry.item).cls">{{ resolveTypeLabel(entry.item).label }}</span><span class="np-latest-title">{{ resolveTitle(entry.item) }}</span><span v-if="renderTime(entry.item)" class="np-time" :title="renderTimeTitle(entry.item)">{{ renderTime(entry.item) }}</span></div><div v-if="entry.item.meta.triggers !== undefined || entry.item.meta.recs !== undefined" class="np-latest-meta"><span v-if="entry.item.meta.triggers !== undefined" class="npl-meta-item">🔬 <strong :class="entry.item.meta.triggers === 0 ? \'ok\' : entry.item.meta.triggers <= 2 ? \'warn\' : \'bad\'">{{ entry.item.meta.triggers }}</strong>/8 触发</span><span v-if="entry.item.meta.recs !== undefined" class="npl-meta-item">💡 <strong>{{ entry.item.meta.recs }}</strong> 建议</span><span v-if="entry.item.meta.robotsOk !== undefined && entry.item.meta.robotsTotal !== undefined" class="npl-meta-item">🤖 <strong :class="entry.item.meta.robotsOk === entry.item.meta.robotsTotal ? \'ok\' : entry.item.meta.robotsOk > 0 ? \'warn\' : \'bad\'">{{ entry.item.meta.robotsOk }}/{{ entry.item.meta.robotsTotal }}</strong> 就绪</span></div><div v-if="healthDimScores(entry.item.meta).length" class="np-latest-dims"><div v-for="(dn, di) in healthDimScores(entry.item.meta)" :key="di" class="npl-dim"><span class="npl-dim-label" :title="dn.name">{{ dn.name }}</span><span class="npl-dim-bar-wrap"><span class="npl-dim-bar" :style="{ width: dn.score + \'%\', background: dn.color }"></span></span><span class="npl-dim-val">{{ dn.score }}</span></div></div><div v-if="entry.item.meta.topRec" class="np-latest-rec">💡 {{ entry.item.meta.topRec.slice(0, 140) }}{{ entry.item.meta.topRec.length > 140 ? \'…\' : \'\' }}</div><div v-else-if="entry.item.meta.summaryText" class="np-latest-rec">📋 {{ entry.item.meta.summaryText.slice(0, 140) }}{{ entry.item.meta.summaryText.length > 140 ? \'…\' : \'\' }}</div></div></div>'
      /* Standard card */
      +       '<div v-else :class="\'np-card\' + (entry.isLatest ? \' np-latest\' : \'\')" @click="cardOnclick(entry.item)"><span :class="\'np-dot \' + resolveDotClass(entry.item)"></span><div class="np-body"><div class="np-head"><span :class="\'np-type \' + resolveTypeLabel(entry.item).cls">{{ resolveTypeLabel(entry.item).label }}</span><span class="np-title">{{ resolveTitle(entry.item) }}</span></div>'
      /* Health detail */
      +           '<div v-if="entry.item.type === \'health\' && entry.item.meta" class="np-detail"><div class="np-meta-row"><span v-if="healthScorePill(entry.item.meta)" :class="\'np-score-badge \' + healthScorePill(entry.item.meta).cls">{{ healthScorePill(entry.item.meta).score }}分 {{ healthScorePill(entry.item.meta).grade }}级</span><span v-if="healthScorePill(entry.item.meta)" style="font-size:.62rem;color:var(--text-muted)">{{ healthScorePill(entry.item.meta).gradeLabel }}</span><span v-if="healthDelta(entry.item)" :class="\'np-delta t-\' + (healthDelta(entry.item).up ? \'green\' : \'red\')">{{ healthDelta(entry.item).text }}</span><span v-if="entry.item.meta.triggers !== undefined" class="np-meta-item"><span class="np-meta-icon">🔬</span><span :class="\'np-meta-val \' + (entry.item.meta.triggers === 0 ? \'t-green\' : entry.item.meta.triggers <= 2 ? \'t-yellow\' : \'t-red\')">{{ entry.item.meta.triggers }}</span><span class="np-meta-label">/8 触发</span></span><span v-if="entry.item.meta.recs !== undefined" class="np-meta-item"><span class="np-meta-icon">💡</span><span class="np-meta-val">{{ entry.item.meta.recs }}</span><span class="np-meta-label">建议</span></span><span v-if="entry.item.meta.robotsOk !== undefined && entry.item.meta.robotsTotal !== undefined" class="np-meta-item"><span class="np-meta-icon">🤖</span><span :class="\'np-meta-val \' + (entry.item.meta.robotsOk === entry.item.meta.robotsTotal ? \'t-green\' : entry.item.meta.robotsOk > 0 ? \'t-yellow\' : \'t-red\')">{{ entry.item.meta.robotsOk }}/{{ entry.item.meta.robotsTotal }}</span><span class="np-meta-label">就绪</span></span></div><div v-if="entry.item.meta.triggeredIds && entry.item.meta.triggeredIds.length" class="np-trigger-list"><span v-for="(tid, ti) in entry.item.meta.triggeredIds" :key="ti" class="np-trigger t-warm">{{ tid }}</span></div><div v-if="healthDimScores(entry.item.meta).length" class="np-dim-grid"><div v-for="(dn, di) in healthDimScores(entry.item.meta)" :key="di" class="np-dg-item"><span :class="\'np-dg-dot \' + dn.cls"></span><span class="np-dg-name">{{ dn.name }}</span><span class="np-dg-score" :style="{ color: dn.color }">{{ dn.score }}</span></div><div v-if="healthDimOverflow(entry.item.meta)" class="np-dg-item" style="font-size:.52rem;color:var(--text-muted)">+{{ healthDimOverflow(entry.item.meta) }} 维度</div></div><div v-if="entry.item.meta.overallAssess" class="np-rec-hint">📋 {{ entry.item.meta.overallAssess }}</div><div v-if="entry.item.meta.topRec" class="np-rec-hint">💡 {{ entry.item.meta.topRec.slice(0, 100) }}{{ entry.item.meta.topRec.length > 100 ? \'…\' : \'\' }}</div><div v-if="entry.item.meta.summaryText" class="np-summary-text">{{ entry.item.meta.summaryText.slice(0, 120) }}{{ entry.item.meta.summaryText.length > 120 ? \'…\' : \'\' }}</div></div>'
      /* Loop detail */
      +           '<div v-else-if="entry.item.type === \'loop\' && entry.item.meta" class="np-detail"><div class="np-meta-row"><span v-if="loopStatus(entry.item.meta)" class="np-meta-item"><span :class="\'np-meta-val \' + loopStatus(entry.item.meta).cls">{{ loopStatus(entry.item.meta).label }}</span></span><span v-if="entry.item.meta.interval" class="np-meta-item"><span class="np-meta-icon">⏱️</span><span class="np-meta-val">{{ entry.item.meta.interval }}</span></span><span v-if="entry.item.meta.healthScore !== undefined" :class="\'np-score-badge \' + (entry.item.meta.healthGrade || \'\')">🩺 {{ entry.item.meta.healthScore }} {{ entry.item.meta.healthGrade || \'\' }}</span></div><div v-if="entry.item.meta.description" class="np-summary-text">{{ entry.item.meta.description.slice(0, 100) }}{{ entry.item.meta.description.length > 100 ? \'…\' : \'\' }}</div><div v-if="loopFindings(entry.item.meta)" class="np-meta-row"><span class="np-meta-item"><span class="np-meta-icon">🔍</span><span class="np-meta-label">发现: </span></span><span v-for="(f, fi) in loopFindings(entry.item.meta)" :key="fi" class="np-meta-item"><span class="np-meta-icon">{{ f.icon }}</span><span :class="\'np-meta-val \' + f.cls">{{ f.val }}</span><span v-if="f.label" class="np-meta-label">{{ f.label }}</span></span></div><div v-if="loopFindingTitles(entry.item.meta).length" class="np-finding-list"><div v-for="(ft, fi) in loopFindingTitles(entry.item.meta)" :key="fi" :class="\'np-finding-item \' + ft.level">{{ ft.text }}</div><div v-if="loopFindingOverflow(entry.item.meta)" class="np-finding-item info">…还有 {{ loopFindingOverflow(entry.item.meta) }} 项</div></div></div>'
      /* Trend detail */
      +           '<div v-else-if="entry.item.type === \'trend\'" class="np-detail"><div class="np-meta-row"><span v-if="trendOk(entry.item.meta)" class="np-meta-item"><span :class="\'np-meta-val \' + trendOk(entry.item.meta).cls">{{ trendOk(entry.item.meta).label }}</span></span><span v-if="entry.item.meta.items !== undefined" class="np-meta-item"><span class="np-meta-icon">📦</span><span class="np-meta-val">{{ entry.item.meta.items }}</span><span class="np-meta-label">条目</span></span><span v-if="trendReachability(entry.item.meta)" class="np-meta-item"><span class="np-meta-icon">🔗</span><span :class="\'np-meta-val \' + trendReachability(entry.item.meta).cls">{{ trendReachability(entry.item.meta).reachable }}/{{ trendReachability(entry.item.meta).total }}</span><span class="np-meta-label">可达({{ trendReachability(entry.item.meta).pct }}%)</span></span><span v-if="trendDirection(entry.item.meta)" class="np-meta-item"><span :class="\'np-meta-val \' + trendDirection(entry.item.meta).cls">{{ trendDirection(entry.item.meta).icon }} {{ trendDirection(entry.item.meta).label }}</span></span></div><div v-if="trendKeywords(entry.item).length" class="np-kw-list"><span v-for="(kw, ki) in trendKeywords(entry.item)" :key="ki" class="np-kw">{{ kw }}</span><span v-if="trendKeywordOverflow(entry.item)" class="np-kw">+{{ trendKeywordOverflow(entry.item) }}</span></div></div>'
      /* Analysis detail */
      +           '<div v-else-if="entry.item.type === \'analysis\' && entry.item.meta" class="np-detail"><div class="np-meta-row"><span v-if="analysisScorePill(entry.item.meta)" :class="\'np-score-badge \' + analysisScorePill(entry.item.meta).cls">{{ analysisScorePill(entry.item.meta).score }}分 {{ analysisScorePill(entry.item.meta).grade }}级</span><span v-if="entry.item.meta.checksPassed !== undefined && entry.item.meta.checksTotal !== undefined" class="np-meta-item"><span class="np-meta-icon">✅</span><span :class="\'np-meta-val \' + (entry.item.meta.failedDims && entry.item.meta.failedDims.length ? \'t-yellow\' : \'t-green\')">{{ entry.item.meta.checksPassed }}/{{ entry.item.meta.checksTotal }}</span><span class="np-meta-label">检查通过</span></span><span v-if="entry.item.meta.failedDims && entry.item.meta.failedDims.length" class="np-meta-item"><span class="np-meta-icon">⚠️</span><span class="np-meta-val t-yellow">{{ entry.item.meta.failedDims.join(\', \') }}</span><span class="np-meta-label">失败维度</span></span><span v-if="entry.item.meta.fileCount !== undefined" class="np-meta-item"><span class="np-meta-icon">📁</span><span class="np-meta-val">{{ entry.item.meta.fileCount }}</span><span class="np-meta-label">文件</span></span><span v-if="entry.item.meta.totalLines !== undefined" class="np-meta-item"><span class="np-meta-icon">📐</span><span class="np-meta-val">{{ Math.round(entry.item.meta.totalLines / 1000) }}K</span><span class="np-meta-label">代码行</span></span></div><div v-if="analysisDimScores(entry.item.meta).length" class="np-dim-grid"><div v-for="(dn, di) in analysisDimScores(entry.item.meta)" :key="di" class="np-dg-item"><span :class="\'np-dg-dot \' + dn.cls"></span><span class="np-dg-name">{{ dn.name }}</span><span class="np-dg-score" :style="{ color: dn.color }">{{ dn.score }}</span></div><div v-if="analysisDimOverflow(entry.item.meta)" class="np-dg-item" style="font-size:.52rem;color:var(--text-muted)">+{{ analysisDimOverflow(entry.item.meta) }} 维度</div></div><div v-if="analysisIssues(entry.item.meta).length" class="np-finding-list"><div v-for="(iss, ii) in analysisIssues(entry.item.meta)" :key="ii" :class="\'np-finding-item \' + iss.level">{{ iss.text }}</div><div v-if="analysisIssueOverflow(entry.item.meta)" class="np-finding-item info">…还有 {{ analysisIssueOverflow(entry.item.meta) }} 项</div></div></div></div><span v-if="renderTime(entry.item)" class="np-time" :title="renderTimeTitle(entry.item)">{{ renderTime(entry.item) }}</span></div></template></div></div>'
  });

  function mountApp() {
    function doMount() {
      if (panelBody) app.mount(panelBody);
      H.register('notify', 'notifyPanel', 'notifyOverlay', function() {
        if (state.allItems.length === 0 && !state.loading) fetchAll();
      });
    }
    if (panelBody) { doMount(); return; }
    document.addEventListener('yry-notify-panel-ready', function() {
      panelBody = document.getElementById('notifyPanelBody');
      doMount();
    }, { once: true });
  }
  mountApp();

  /* ── Filter chips ───────────────────────── */
  filterChips.forEach(function(c) {
    c.addEventListener('click', function(e) {
      e.stopPropagation();
      filterChips.forEach(function(x) { x.classList.remove('active'); });
      this.classList.add('active');
      state.activeFilter = this.dataset.filter;
    });
  });

  /* ── Refresh ────────────────────────────── */
  var refreshBtn = document.getElementById('notifyRefresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      refreshBtn.classList.add('spinning');
      state.allItems = []; state.loading = false; state.error = null;
      fetchAll().finally(function() { refreshBtn.classList.remove('spinning'); });
    });
  }

  /* ── Data fetching ───────────────────────── */
  async function fetchAll() {
    state.loading = true;
    state.error = null;

    var [healthData, loopData, trendData, analysisData] = await Promise.all([
      fetchHealthReports(), fetchLoopReports(), fetchTrendReports(), fetchAnalysisReports()
    ]);

    var unified = [];
    healthData.forEach(function(r) {
      unified.push({ type: 'health', href: r.file, basePath: './健康报告/', label: '🩺 ' + r.date,
                     date: r.date, timeText: r.time, timeId: String(r.time || '').replace(/\D/g, ''),
                     meta: { score: r.score, grade: r.grade } });
    });
    loopData.forEach(function(lr) {
      unified.push({ type: 'loop', href: lr.file, basePath: './自循环报告/', label: lr.label || '',
                     date: lr.date || '', timeId: lr.timeId || '', meta: lr.meta || null });
    });
    trendData.forEach(function(tr) {
      unified.push({ type: 'trend', href: tr.file, basePath: './趋势报告/', label: tr.label || '',
                     date: tr.date || '', source: tr.source || '', keywords: tr.keywords || [], meta: tr.meta || null });
    });
    analysisData.forEach(function(ar) {
      unified.push({ type: 'analysis', href: ar.file, basePath: './项目分析/', label: ar.label || '',
                     date: ar.date || '', meta: ar.meta || null });
    });

    var hc = healthData.length, lc = loopData.length, tc = trendData.length, ac = analysisData.length;
    var elAll = document.getElementById('npBadgeAll'), elH = document.getElementById('npBadgeHealth'),
        elL = document.getElementById('npBadgeLoop'), elT = document.getElementById('npBadgeTrend'),
        elA = document.getElementById('npBadgeAnalysis');
    if (elAll) elAll.textContent = unified.length;
    if (elH) elH.textContent = hc;
    if (elL) elL.textContent = lc;
    if (elT) elT.textContent = tc;
    if (elA) elA.textContent = ac;
    if (totalCount) totalCount.textContent = `共 ${unified.length} 条`;
    if (badge && unified.length > 0) badge.textContent = unified.length > 99 ? '99+' : String(unified.length);

    state.allItems = unified.sort(function(a, b) {
      var aAt = (a.date || '') + (a.timeId || '');
      var bAt = (b.date || '') + (b.timeId || '');
      return bAt.localeCompare(aAt);
    });
    state.loading = false;

    // Attach prevScore for health items
    var healthItems = unified.filter(function(x) { return x.type === 'health'; });
    for (var i = 0; i < healthItems.length; i++) {
      if (i + 1 < healthItems.length && healthItems[i+1].meta) {
        healthItems[i].prevScore = healthItems[i+1].meta.score;
      }
    }

    var utEl = document.getElementById('npUpdateTime');
    if (utEl) {
      var now2 = new Date();
      utEl.textContent = `更新 ${now2.getHours().toString().padStart(2,'0')}:` + now2.getMinutes().toString().padStart(2,'0') + ` · ${unified.length} 条通知`;
    }
  }

  async function fetchHealthReports() {
    try {
      var resp = await fetch('./健康报告/reports.json');
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var data = await resp.json();
      if (!Array.isArray(data) || data.length === 0) return [];
      var seen = {};
      var deduped = [];
      for (var i = 0; i < data.length; i++) {
        var d = data[i].date;
        if (!seen[d]) { seen[d] = true; deduped.push(data[i]); }
      }
      return deduped;
    } catch (e) { console.warn('[notify-panel] 健康报告 fetch 失败: ' + e.message); return []; }
  }

  async function fetchLoopReports() {
    try {
      var resp = await fetch('./自循环报告/reports.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status);
      var data = await resp.json();
      if (!Array.isArray(data)) return [];
      return data.map(function(r) {
        return { file: r.file, date: r.date, label: (r.icon || '🔄')} ` + (r.skillLabel || r.skill),
                 meta: { status: r.status, summary: r.summary, findings: r.findings, skill: r.skill } };
      });
    } catch (e) { console.warn('[notify-panel] 自循环报告 fetch 失败: ' + e.message); return []; }
  }

  async function fetchTrendReports() {
    try {
      var resp = await fetch('./趋势报告/reports.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status);
      var data = await resp.json();
      if (!Array.isArray(data)) return [];
      var iconMap = { all: '📡', 'github-trending': '🐙', 'oss-insight': '📊', trendshift: '📈', 'top-starred': '⭐' };
      return data.map(function(r) {
        var src = r.source || '';
        return { file: r.file, date: r.date, source: r.source,
                 label: (iconMap[src] || '📡')} ` + (src || 'trend') + ' · ' + r.date,
                 meta: { ok: r.ok, trend: r.trend, items: r.items } };
      });
    } catch (e) { console.warn('[notify-panel] 趋势报告 fetch 失败: ' + e.message); return []; }
  }

  async function fetchAnalysisReports() {
    try {
      var resp = await fetch('./项目分析/reports.json');
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var data = await resp.json();
      if (!Array.isArray(data)) return [];
      return data.map(function(r) {
        return { file: r.file, date: r.date, source: 'proj-analysis',
                 label: '🔍 项目分析 · ' + r.date, meta: {
          overallScore: r.overallScore, overallGrade: r.overallGrade,
          checksPassed: r.checksPassed, checksTotal: r.checksTotal,
          failedDims: r.failedDims, fileCount: r.fileCount, totalLines: r.totalLines,
          jsFiles: r.jsFiles, jsLines: r.jsLines, importCount: r.importCount,
          dimensions: r.dimensions, issues: r.issues, skills: r.skills,
          rules: r.rules, libFiles: r.libFiles, agents: r.agents
        }};
      });
    } catch (e) { console.warn('[notify-panel] 项目分析 fetch 失败: ' + e.message); return []; }
  }
})();