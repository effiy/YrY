/**
 * selfimprove-panel.js — self-improvement analytics panel (Vue 3)
 *
 * Reads .memory/health-trend.jsonl + summary.json and renders
 * daily / weekly / monthly / overview perspectives.
 * Depends on: panel-hub.js (loaded first) · Vue 3 (window.Vue)
 */
(function() {
  'use strict';
  var H = window.PanelHub;
  if (!H) { console.error('selfimprove-panel: PanelHub required'); return; }

  var siBody = document.getElementById('siPanelBody');
  var siFilters = document.querySelectorAll('#siFilters .np-filter-chip');
  var siCount = document.getElementById('siTotalCount');
  var siBadge = document.getElementById('selfimproveBadge');
  var siLiveGrade = document.getElementById('siLiveGrade');
  var siFooterTime = document.getElementById('siFooterTime');

  /* ── Diagnostic reference ───────────────── */
  var DIAG_INFO = {
    D0: { label: '基线偏离', desc: '项目基线（CLAUDE.md/README.md）与实际状态不一致', rec: '运行 /rui init 重生基线并对照差异' },
    D1: { label: '效率退化', desc: '管线执行效率下降：重复操作、超时增加、轮次膨胀', rec: '检查最近 10 次执行记忆，定位重复模式' },
    D2: { label: '质量退化', desc: 'P0 清零速度下降或 Gate B 失败率上升', rec: '审查最近 3 个故事的 Gate B 评估数据' },
    D3: { label: '复杂度增长', desc: '文件膨胀、函数增长、循环复杂度超过阈值', rec: '运行 rui-analysis 定位高复杂度模块' },
    D4: { label: '流程退化', desc: '管线阶段跳过率上升或阻断标识重复出现', rec: '检查 delivery-tracking.jsonl 中的阻断模式' },
    D5: { label: '依赖退化', desc: '依赖版本过期、安全漏洞、或外部 API 不可达', rec: '运行 npm audit + rui-trends 检查外部源可达性' },
    D6: { label: '文档过时', desc: '文档内容与源码实现不一致或链接断裂', rec: '运行 /rui-update 批量刷新过期文档' },
    D7: { label: '配置漂移', desc: '.claude/ 配置与 plugin.json 声明不一致', rec: '运行 /rui-claude sync 同步配置' }
  };

  /* ── Shared helpers ──────────────────────── */
  function scoreColor(s) { return s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444'; }
  function scoreCls(s)  { return s >= 80 ? 'ok' : s >= 60 ? 'warn' : 'bad'; }
  function mxCls(s)     { return s >= 80 ? 'mx-pass' : s >= 60 ? 'mx-warn' : 'mx-fail'; }

  var gradeColors = { A: '#22c55e', B: '#22c55e', C: '#f59e0b', D: '#ef4444' };
  var gradeLabels = { A: '优秀', B: '良好', C: '需关注', D: '告警' };

  /* ── Vue reactive state ─────────────────── */
  var state = Vue.reactive({
    siData: null,
    siRaw: [],
    siPeriod: 'daily',
    loading: false,
    error: null
  });

  /* ── Vue app ────────────────────────────── */
  var app = Vue.createApp({
    data: function() { return state; },
    computed: {
      /* ── Hero ──────────────────────────────── */
      hero: function() {
        var d = this.siData;
        if (!d || !d.latest) return null;
        var l = d.latest, s = l.composite, g = l.grade;
        var gi = { A: { color: '#22c55e', bg: 'rgba(34,197,94,.1)' },
                   B: { color: '#22c55e', bg: 'rgba(34,197,94,.08)' },
                   C: { color: '#f59e0b', bg: 'rgba(245,158,11,.1)' },
                   D: { color: '#ef4444', bg: 'rgba(239,68,68,.1)' } };
        var info = gi[g] || gi.C;
        var trend = null;
        if (this.siRaw.length >= 2) {
          var prev = this.siRaw[this.siRaw.length - 2];
          var diff = s - (prev.composite || s);
          trend = { icon: diff > 3 ? '\u{1F4C8}' : diff < -3 ? '\u{1F4C9}' : '\u{1F4CA}',
                    label: diff > 3 ? '\u2191' + diff : diff < -3 ? `\u2193${Math.abs(diff) : '\u21920',
                    color: diff > 3 ? '#22c55e' : diff < -3 ? '#ef4444' : 'var(--text-muted)' };
        }
        var spark = [];
        if (this.siRaw.length > 1) {
          var sampled = this.siRaw.slice(-20);
          spark = sampled.map(function(e, i) {
            var last = i === sampled.length - 1;
            return { color: gradeColors[e.grade] || '#555', size: last ? '10px' : '5px',
                     title: (e.grade||'?')}\u7EA7 \u00B7 ` + (e.composite||'?') + '\u5206 \u00B7 ' + ((e.timestamp||'').slice(0,10)) };
          });
        }
        var diagCount = d.diagSummary ? d.diagSummary.filter(function(x) { return x.count > 0; }).length : 0;
        return { score: s, grade: g, label: info.label, color: info.color, bg: info.bg,
                 trend: trend, spark: spark, diagCount: diagCount,
                 dimCount: d.dimSummary ? d.dimSummary.length : 0,
                 totalEntries: d.totalEntries || 0 };
      },
      /* ── Summary card ──────────────────────── */
      summary: function() {
        var d = this.siData;
        if (!d || !d.latest) return null;
        var l = d.latest;
        var overall = gradeLabels[l.grade] || '未知';
        var overallIcon = l.grade === 'A' || l.grade === 'B' ? '\u2705' : l.grade === 'C' ? '\u26A0\uFE0F' : '\u{1F6AB}';
        var diagCount = d.diagSummary ? d.diagSummary.filter(function(x) { return x.count > 0; }).length : 0;
        var dimPass = 0, dimWarn = 0, dimFail = 0;
        if (d.dimSummary) {
          d.dimSummary.forEach(function(dim) {
            if (dim.avgScore >= 80) dimPass++;
            else if (dim.avgScore >= 60) dimWarn++;
            else dimFail++;
          });
        }
        var sorted = d.dimSummary ? d.dimSummary.slice().sort(function(a, b) { return a.avgScore - b.avgScore; }) : [];
        var weakest = sorted[0];
        var strongest = sorted[sorted.length - 1];
        var weakTrend = weakest && weakest.trend !== 0 ? (weakest.trend > 0 ? ' \u2191' : ' \u2193') : '';
        var weakTrendClr = weakest && weakest.trend < -3 ? '#ef4444' : 'inherit';
        var recCount = (d.signals ? d.signals.length : 0) + diagCount;
        var topRec = '';
        if (d.signals && d.signals.length > 0) {
          topRec = d.signals[0].msg || '';
        } else if (diagCount > 0) {
          topRec = diagCount + ' 项诊断触发需处理';
        } else {
          topRec = '系统运行健康，无紧急事项';
        }
        return { overall: overall, overallIcon: overallIcon, diagCount: diagCount,
                 dimPass: dimPass, dimWarn: dimWarn, dimFail: dimFail,
                 weakLabel: weakest ? H.escHtml(weakest.label) + ` ${weakest.avgScore : '\u2014',
                 weakTrend: weakTrend, weakTrendClr: weakTrendClr,
                 strongLabel: strongest ? H.escHtml(strongest.label)} ` + strongest.avgScore : '\u2014',
                 recCount: recCount, topRec: topRec };
      },
      /* ── Recommendations ────────────────────── */
      recommendations: function() {
        var d = this.siData;
        if (!d) return [];
        var recs = [];
        if (d.signals) {
          d.signals.forEach(function(s) {
            recs.push({ source: s.type === 'regression' ? '维度退化' : s.type === 'warning' ? '诊断告警' : '改进信号',
                        text: s.msg, priority: s.type === 'regression' || s.type === 'warning' ? 'high' : 'medium' });
          });
        }
        if (d.diagSummary) {
          d.diagSummary.forEach(function(diag) {
            if (diag.count > 0) {
              var info = DIAG_INFO[diag.id] || {};
              if (info.rec) {
                var covered = recs.some(function(r) { return r.text.indexOf(diag.id) >= 0; });
                if (!covered) recs.push({ source: diag.id + ' ' + (diag.label || ''),
                                          text: info.rec, priority: diag.rate >= 50 ? 'high' : 'medium' });
              }
            }
          });
        }
        var seen = {};
        var uniq = [];
        recs.forEach(function(r) {
          var key = r.text.slice(0, 30);
          if (!seen[key]) { seen[key] = true; uniq.push(r); }
        });
        uniq.sort(function(a, b) { return a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0; });
        return uniq.slice(0, 6);
      },
      /* ── Component health ──────────────────── */
      componentHealth: function() {
        var d = this.siData;
        if (!d || !d.componentHealth) return null;
        var ch = d.componentHealth;
        var types = [
          { key: 'skills',  icon: '\u{1F916}', label: 'Skills' },
          { key: 'agents',  icon: '\u{1F465}', label: 'Agents' },
          { key: 'rules',   icon: '\u{1F4CF}', label: 'Rules' },
          { key: 'scripts', icon: '\u{1F4DC}', label: 'Scripts' }
        ];
        var items = [];
        types.forEach(function(t) {
          var data = ch[t.key];
          if (!data || data.count === 0) return;
          items.push({ icon: t.icon, label: t.label, score: data.avgScore || 0,
                       barW: Math.max(3, data.avgScore || 0), count: data.count,
                       color: scoreColor(data.avgScore || 0) });
        });
        return { items: items, overallAvg: ch.overallAvg, totalComponents: ch.totalComponents || 0,
                 overallColor: scoreColor(ch.overallAvg || 0) };
      },
      /* ── Test score breakdown ──────────────── */
      testScore: function() {
        var d = this.siData;
        if (!d || !d.dimSummary) return null;
        var weights = { em_testing: 0.30, em_types: 0.15, em_linting: 0.15, em_cicd: 0.10, em_docs: 0.10, em_deps: 0.10, em_git: 0.10 };
        var dimLabels = { em_testing: '测试覆盖', em_types: '类型安全', em_linting: '代码检查', em_cicd: 'CI/CD', em_docs: '文档完整', em_deps: '依赖管理', em_git: 'Git实践', comp_qual: '组件质量' };
        var testDims = d.dimSummary.filter(function(dim) {
          return dim.dim && (dim.dim.startsWith('em_') || dim.dim === 'comp_qual');
        });
        if (testDims.length === 0) return null;
        var weightedSum = 0, totalWeight = 0;
        testDims.forEach(function(dim) {
          var w = weights[dim.dim] || 0.10;
          if (dim.dim === 'comp_qual') w = 0.0;
          weightedSum += dim.avgScore * w;
          totalWeight += w;
        });
        var emScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
        var emGrade = emScore >= 80 ? 'A' : emScore >= 60 ? 'B' : emScore >= 40 ? 'C' : 'D';
        var items = testDims.map(function(dim) {
          var s = dim.avgScore;
          var w = weights[dim.dim] ? Math.round(weights[dim.dim] * 100) + '%' : '';
          var trendIcon = dim.trend > 3 ? ' \u2191' : dim.trend < -3 ? ' \u2193' : '';
          var trendClr = dim.trend > 3 ? '#22c55e' : dim.trend < -3 ? '#ef4444' : '';
          return { icon: s >= 80 ? '\u2705' : s >= 60 ? '\u26A0\uFE0F' : '\u{1F6AB}',
                   label: dimLabels[dim.dim] || dim.label, weight: w, score: s,
                   barW: Math.max(3, s), color: scoreColor(s), trendIcon: trendIcon, trendClr: trendClr };
        });
        return { items: items, emScore: emScore, emGrade: emGrade, emColor: scoreColor(emScore) };
      },
      /* ── Core dimension groups ──────────────── */
      coreDims: function() {
        var d = this.siData;
        if (!d || !d.dimSummary) return null;
        var coreKeys = ['token', 'config', 'api', 'reports', 'format', 'diagnostics', 'git', 'security', 'robots'];
        var coreWeights = { token: 0.10, config: 0.15, robots: 0.05, api: 0.15, reports: 0.10, format: 0.10, diagnostics: 0.15, git: 0.10, security: 0.10 };
        var dims = d.dimSummary.filter(function(dim) { return coreKeys.indexOf(dim.dim) >= 0; });
        if (dims.length === 0) return null;
        var coreSum = 0, coreTotal = 0;
        dims.forEach(function(dim) {
          var w = coreWeights[dim.dim] || 0.10;
          coreSum += dim.avgScore * w;
          coreTotal += w;
        });
        var coreScore = coreTotal > 0 ? Math.round(coreSum / coreTotal) : 0;
        var coreGrade = coreScore >= 80 ? 'A' : coreScore >= 60 ? 'B' : coreScore >= 40 ? 'C' : 'D';
        var items = dims.map(function(dim) {
          var s = dim.avgScore;
          var w = coreWeights[dim.dim] ? Math.round(coreWeights[dim.dim] * 100) + '%' : '';
          return { icon: s >= 80 ? '\u25CF' : s >= 60 ? '\u25D0' : '\u25CB',
                   label: H.escHtml(dim.label), weight: w, score: s,
                   barW: Math.max(3, s), color: scoreColor(s) };
        });
        return { items: items, coreScore: coreScore, coreGrade: coreGrade, coreColor: scoreColor(coreScore) };
      },
      /* ── Dimension matrix ──────────────────── */
      dimMatrix: function() {
        var d = this.siData;
        if (!d || !d.dimSummary || d.dimSummary.length === 0) return [];
        return d.dimSummary.map(function(dim) {
          var s = dim.avgScore;
          var trendIcon = dim.trend > 3 ? ' \u2191' : dim.trend < -3 ? ' \u2193' : '';
          var trendClr = dim.trend > 3 ? '#22c55e' : dim.trend < -3 ? '#ef4444' : '';
          return { label: H.escHtml(dim.label), score: s, color: scoreColor(s),
                   cls: mxCls(s), trendIcon: trendIcon, trendClr: trendClr,
                   trendAbs: trendIcon ? Math.abs(dim.trend) : 0,
                   title: H.escHtml(dim.label) + ` \u00B7 \u5747\u5206${s} \u00B7 \u6700\u8FD1` + dim.recentAvg + ` \u00B7 ${dim.entries}\u6B21` };
        });
      },
      /* ── Active diagnostics ────────────────── */
      activeDiags: function() {
        var d = this.siData;
        if (!d || !d.diagSummary) return [];
        var active = d.diagSummary.filter(function(diag) { return diag.count > 0; });
        if (active.length === 0) return [];
        var maxCount = active[0].count || 1;
        return active.map(function(diag) {
          var barClr = diag.rate >= 50 ? '#ef4444' : diag.rate >= 25 ? '#f59e0b' : '#60a5fa';
          var label = d.diagLabels && d.diagLabels[diag.id] ? d.diagLabels[diag.id] : diag.label;
          var info = DIAG_INFO[diag.id] || {};
          return { id: diag.id, label: H.escHtml(label), count: diag.count, rate: diag.rate,
                   barW: Math.max(3, Math.round((diag.count||0) / maxCount * 100)), barClr: barClr,
                   desc: info.desc || '', rec: info.rec || '' };
        });
      },
      /* ── Branch summary ────────────────────── */
      branches: function() {
        var d = this.siData;
        if (!d || !d.branchSummary) return [];
        return d.branchSummary.map(function(b) {
          return { name: H.escHtml(b.name), score: b.avgScore, color: scoreColor(b.avgScore),
                   count: b.count, uncommitted: b.avgUncommitted,
                   uncommittedClr: b.avgUncommitted > 20 ? '#f59e0b' : 'inherit' };
        });
      },
      /* ── Score trend sparkline ──────────────── */
      scoreTrend: function() {
        var d = this.siData;
        if (!d || !d.scoreTrend || d.scoreTrend.length <= 1) return [];
        var trend = d.scoreTrend.slice(-80);
        return trend.map(function(p) {
          return { h: Math.max(2, Math.round(p.score / 100 * 38)), color: scoreColor(p.score),
                   title: p.date + ` ${(p.time||'')}: ` + p.score + `\u5206 ${(p.grade||'')}\u7EA7` };
        });
      },
      /* ── Signals ────────────────────────────── */
      signals: function() {
        var d = this.siData;
        if (!d || !d.signals) return [];
        return d.signals.map(function(s) {
          return { icon: s.icon || '', type: s.type, msg: H.escHtml(s.msg) };
        });
      },
      /* ── Period data ────────────────────────── */
      periodData: function() {
        var d = this.siData;
        if (!d) return null;
        var p = this.siPeriod;
        var buckets = p === 'daily' ? d.daily : p === 'weekly' ? d.weekly : d.monthly;
        if (!buckets || buckets.length === 0) return { empty: true, label: p === 'daily' ? '日' : p === 'weekly' ? '周' : '月' };
        var current = buckets[buckets.length - 1];
        var prev = buckets.length > 1 ? buckets[buckets.length - 2] : null;
        var pLabel = p === 'daily' ? current.date || '' : p === 'weekly' ? (current.week||'') + ` ~ ${(current.weekEnd||'') : (current.month||'').replace('-','\u5E74')}\u6708`;
        var pTitle = p === 'daily' ? '日报' : p === 'weekly' ? '周报' : '月报';
        var delta = null;
        if (prev && current.avgScore !== prev.avgScore) {
          var dSign = current.avgScore > prev.avgScore ? '+' : '';
          delta = { text: dSign + (current.avgScore - prev.avgScore) + ' 分 vs 上期',
                    up: current.avgScore > prev.avgScore };
        }
        var gradeDist = [];
        if (current.gradeDist) {
          ['A','B','C','D'].forEach(function(g) {
            var cnt = current.gradeDist[g] || 0;
            if (cnt > 0) gradeDist.push({ grade: g, count: cnt });
          });
        }
        var spark = [];
        if (this.siRaw.length > 1) {
          var sampled = this.siRaw.slice(-20);
          spark = sampled.map(function(e, i) {
            var last = i === sampled.length - 1;
            return { color: gradeColors[e.grade] || '#555', size: last ? '10px' : '5px',
                     title: (e.grade||'?') + `\u7EA7 \u00B7 ${(e.composite||'?')}\u5206` };
          });
        }
        return { empty: false, score: current.avgScore, grade: current.topGrade, color: scoreColor(current.avgScore),
                 label: pLabel, title: pTitle, entries: current.entries, delta: delta,
                 minScore: current.minScore, maxScore: current.maxScore,
                 branchCount: current.branches ? current.branches.length : 0,
                 gradeDist: gradeDist, spark: spark, current: current, prev: prev };
      },
      /* ── Period score trend ────────────────── */
      periodScoreTrend: function() {
        var d = this.siData;
        if (!d || !d.scoreTrend || d.scoreTrend.length <= 1) return [];
        return d.scoreTrend.slice(-60).map(function(p) {
          return { h: Math.max(2, Math.round(p.score / 100 * 38)), color: scoreColor(p.score),
                   title: p.date + `: ${p.score}\u5206` };
        });
      },
      /* ── Period dims (top 9) ────────────────── */
      periodDims: function() {
        var d = this.siData;
        if (!d || !d.dimSummary) return [];
        return d.dimSummary.slice(0, 9).map(function(dim) {
          var tIcon = dim.trend > 3 ? '\u2191' : dim.trend < -3 ? '\u2193' : '';
          var tClr = dim.trend > 3 ? 't-green' : dim.trend < -3 ? 't-red' : '';
          return { label: H.escHtml(dim.label), score: dim.avgScore, barW: Math.max(dim.avgScore, 3),
                   color: scoreColor(dim.avgScore), trendIcon: tIcon, trendClr: tClr,
                   trendAbs: dim.trend !== 0 ? Math.abs(dim.trend) : null };
        });
      },
      /* ── Period diagnostics ────────────────── */
      periodDiags: function() {
        var pd = this.periodData;
        if (!pd || pd.empty || !pd.current.topDiags) return [];
        var d = this.siData;
        return pd.current.topDiags.map(function(diag) {
          var barClr = diag.rate >= 50 ? '#ef4444' : diag.rate >= 25 ? '#f59e0b' : '#60a5fa';
          var label = d.diagLabels && d.diagLabels[diag.id] ? d.diagLabels[diag.id] : diag.label;
          var info = DIAG_INFO[diag.id] || {};
          return { id: diag.id, label: H.escHtml(label), count: diag.count, rate: diag.rate,
                   barClr: barClr, desc: info.desc || '' };
        });
      },
      /* ── Today entries ──────────────────────── */
      todayEntries: function() {
        var pd = this.periodData;
        if (!pd || pd.empty || this.siPeriod !== 'daily') return [];
        var today = pd.current.date || '';
        return this.siRaw.filter(function(e) {
          return e.timestamp && e.timestamp.slice(0,10) === today;
        }).sort(function(a, b) { return (b.timestamp||'').localeCompare(a.timestamp||''); }).map(function(e) {
          var t = e.timestamp ? e.timestamp.slice(11,16) : '';
          var diagTags = (e.triggeredDiags || []).map(function(diag) {
            var dinfo = DIAG_INFO[diag] || {};
            return { id: diag, title: (dinfo.desc || '') + ' \u2192 ' + (dinfo.rec || '') };
          });
          return { time: t, score: e.composite, color: scoreColor(e.composite),
                   grade: e.grade || '', diagTags: diagTags,
                   gitBranch: e.gitBranch || '', showUncommitted: e.gitUncommitted > 10,
                   uncommitted: e.gitUncommitted };
        });
      },
      /* ── Week days ──────────────────────────── */
      weekDays: function() {
        var pd = this.periodData;
        if (!pd || pd.empty || this.siPeriod !== 'weekly') return [];
        var d = this.siData;
        if (!d || !d.daily) return [];
        var ws = pd.current.week || '', we = pd.current.weekEnd || '';
        var dn = ['日','一','二','三','四','五','六'];
        return d.daily.filter(function(day) { return day.date >= ws && day.date <= we; }).map(function(day) {
          var dayIdx = new Date(day.date).getDay();
          return { name: '周' + dn[dayIdx], score: day.avgScore, color: scoreColor(day.avgScore), entries: day.entries };
        });
      },
      /* ── Month weeks ────────────────────────── */
      monthWeeks: function() {
        var pd = this.periodData;
        if (!pd || pd.empty || this.siPeriod !== 'monthly') return [];
        var d = this.siData;
        if (!d || !d.weekly) return [];
        var mPrefix = (pd.current.month||'').replace(/-/g,'');
        return d.weekly.filter(function(w) { return (w.week||'').replace(/-/g,'').startsWith(mPrefix); }).map(function(w) {
          return { name: 'W' + (w.week||'').replace(/.*W0?(\d+)$/,'$1'), score: w.avgScore, color: scoreColor(w.avgScore), entries: w.entries };
        });
      },
      /* ── Period branches ────────────────────── */
      periodBranches: function() {
        var pd = this.periodData;
        if (!pd || pd.empty || !pd.current.branches) return [];
        return pd.current.branches.map(function(b) {
          return { name: H.escHtml(typeof b === 'string' ? b : b.name || ''),
                   count: typeof b === 'object' ? b.count : 0 };
        });
      },
      /* ── Period history ─────────────────────── */
      periodHistory: function() {
        var d = this.siData;
        if (!d) return [];
        var p = this.siPeriod;
        var buckets = p === 'daily' ? d.daily : p === 'weekly' ? d.weekly : d.monthly;
        if (!buckets || buckets.length <= 1) return [];
        var maxBuckets = p === 'daily' ? 14 : p === 'weekly' ? 8 : 12;
        return buckets.slice(0, buckets.length - 1).reverse().slice(0, maxBuckets).map(function(b) {
          var key = b.date || b.week || b.month;
          var label = p === 'weekly' ? (b.week||'') + ` ~ ${(b.weekEnd||'') : p === 'monthly' ? (b.month||'').replace('-','\u5E74')}\u6708` : key;
          var deltaText = b.delta && b.delta.score !== 0 ? (b.delta.score > 0 ? '+' : '') + b.delta.score + ' vs 上期' : '';
          var topDiags = (b.topDiags || []).map(function(diag) {
            return { id: diag.id, label: H.escHtml(diag.label), count: diag.count, hot: diag.rate >= 50 };
          });
          return { label: H.escHtml(label), score: b.avgScore, grade: b.topGrade || '', entries: b.entries,
                   deltaText: deltaText, topDiags: topDiags };
        });
      }
    },
    methods: {
      setPeriod: function(p) {
        this.siPeriod = p;
      },
      isOverview: function() { return this.siPeriod === 'overview'; },
      escHtml: function(s) { return H.escHtml(s); },
      diagInfo: function(id) { return DIAG_INFO[id] || {}; }
    },
    template: /* html */'<div v-if="loading" class="panel-loading yry-panel-loading">加载中...</div>'
      + '<div v-else-if="error" class="panel-empty yry-panel-empty">数据加载失败<br><span class="hint">运行 <code>node lib/proposals.mjs generate</code> 生成自改进数据</span></div>'
      + '<div v-else-if="!siData" class="panel-loading yry-panel-loading">加载中...</div>'
      /* ── Overview ──────────────────────────── */
      + '<div v-else-if="siPeriod === \'overview\'">'
      /* Hero */
      + '<div v-if="hero" class="si-hero">'
      +   '<div class="si-hero-ring" :style="{ borderColor: hero.color, background: hero.bg }">'
      +     '<div class="si-hero-score" :style="{ color: hero.color }">{{ hero.score }}</div>'
      +     '<div class="si-hero-grade" :style="{ background: hero.color }">{{ hero.label }}</div>'
      +   '</div>'
      +   '<div class="si-hero-info">'
      +     '<div class="si-hero-label">{{ hero.grade }} 级 · 综合健康度</div>'
      +     '<div class="si-hero-stats">'
      +       '<div v-if="hero.trend" class="si-hero-stat"><span class="si-hs-icon">{{ hero.trend.icon }}</span> vs 上次: <span :style="{ color: hero.trend.color, fontWeight: \'700\' }">{{ hero.trend.label }} 分</span></div>'
      +       '<div class="si-hero-stat"><span class="si-hs-icon">🔬</span> D0-D7: <span style="font-weight:700">{{ hero.diagCount }}/8</span> 触发</div>'
      +       '<div class="si-hero-stat"><span class="si-hs-icon">📊</span> {{ hero.dimCount }} 维度</div>'
      +       '<div class="si-hero-stat"><span class="si-hs-icon">📋</span> {{ hero.totalEntries }} 条记录</div>'
      +     '</div>'
      +   '</div>'
      +   '<div v-if="hero.spark.length" class="si-grade-spark">'
      +     '<span v-for="(dot, i) in hero.spark" :key="i" class="si-grade-dot" :style="{ background: dot.color, width: dot.size, height: dot.size }" :title="dot.title"></span>'
      +   '</div>'
      + '</div>'
      /* Summary card */
      + '<div v-if="summary" class="si-summary-card">'
      +   '<div class="si-summary-row">'
      +     '<div class="si-summary-item"><div class="si-summary-val">{{ summary.overallIcon }} {{ summary.overall }}</div><div class="si-summary-lbl">综合评估</div></div>'
      +     '<div class="si-summary-item"><div class="si-summary-val">{{ summary.diagCount }}/8</div><div class="si-summary-lbl">诊断触发</div></div>'
      +     '<div class="si-summary-item"><div class="si-summary-val"><span style="color:#22c55e">{{ summary.dimPass }}</span> <span style="color:#f59e0b">{{ summary.dimWarn }}</span> <span style="color:#ef4444">{{ summary.dimFail }}</span></div><div class="si-summary-lbl">维度过/警/败</div></div>'
      +     '<div class="si-summary-item"><div class="si-summary-val" :style="{ color: summary.weakTrendClr }">{{ summary.weakLabel }}{{ summary.weakTrend }}</div><div class="si-summary-lbl">最弱维度</div></div>'
      +   '</div>'
      +   '<div class="si-summary-row">'
      +     '<div class="si-summary-item"><div class="si-summary-val" style="color:#22c55e">{{ summary.strongLabel }}</div><div class="si-summary-lbl">最强维度</div></div>'
      +     '<div class="si-summary-item"><div class="si-summary-val">{{ summary.recCount }} 项</div><div class="si-summary-lbl">改进建议</div></div>'
      +     '<div class="si-summary-item" style="flex:2;min-width:140px"><div class="si-summary-val" style="font-size:.7rem;text-align:left">💡 {{ summary.topRec.slice(0, 50) }}{{ summary.topRec.length > 50 ? \'…\' : \'\' }}</div><div class="si-summary-lbl">首项建议</div></div>'
      +   '</div>'
      + '</div>'
      /* Recommendations */
      + '<div v-if="recommendations.length">'
      +   '<div class="si-section-title">💡 改进建议 ({{ recommendations.length }} 项)</div>'
      +   '<div class="si-rec-list">'
      +     '<div v-for="(r, i) in recommendations" :key="i" class="si-rec-item">'
      +       '<span class="si-rec-prio" :style="{ color: r.priority === \'high\' ? \'#ef4444\' : \'#f59e0b\' }">{{ r.priority === \'high\' ? \'🔴\' : \'🟡\' }}</span>'
      +       '<div class="si-rec-body"><div class="si-rec-source">{{ r.source }}</div>'
      +       '<div class="si-rec-text">{{ r.text }}</div></div>'
      +     '</div>'
      +   '</div>'
      + '</div>'
      + '<div v-else class="si-section-title">💡 改进建议</div><div style="padding:4px 16px 8px;font-size:.64rem;color:var(--text-muted)">✅ 暂无建议 — 所有指标健康</div>'
      /* Methodology */
      + '<div class="si-section-title">📐 评分方法</div>'
      + '<div class="si-methodology" style="padding:8px 16px 12px;font-size:.62rem;color:var(--text-muted);line-height:1.6;background:rgba(255,255,255,.02);border-radius:8px;margin-bottom:12px">'
      +   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px">'
      +     '<div><strong style="color:#22c55e">🩺 健康评分</strong><br>19 维度加权均分 · A≥80 B≥60 C≥40 D&lt;40<br>数据源: .memory/health-trend.jsonl</div>'
      +     '<div><strong style="color:#f59e0b">🧪 测试评分</strong><br>工程成熟度 7 维加权: 测试×30% + 类型×15% + 检查×15% + CI/CD×10% + 文档×10% + 依赖×10% + Git×10%</div>'
      +     '<div><strong style="color:#a78bfa">🧬 自改进评分</strong><br>Skills/Agents/Rules/Scripts 四类组件健康均分<br>反映代码质量和架构合规度</div>'
      +     '<div><strong style="color:#22c55e">🛡 安全评分</strong><br>四项不妥协: 认证·密钥·输入·架构合规<br>全部通过=100，任一项失败=0</div>'
      +     '<div><strong style="color:#60a5fa">📐 架构评分</strong><br>15 维度架构合规检查 · A≥90 B≥80 C≥70 D&lt;70<br>数据源: lib/arch-check.mjs</div>'
      +     '<div><strong style="color:#22d3ee">🔬 D0-D8 诊断</strong><br>9 级自动诊断: 基线→效率→质量→复杂度→流程→依赖→文档→配置→架构<br>触发率≥50% 产生告警信号</div>'
      +   '</div>'
      + '</div>'
      /* Test score breakdown */
      + '<div v-if="testScore">'
      +   '<div class="si-section-title">🧪 工程成熟度评分 <span style="font-size:.64rem;font-weight:700" :style="{ color: testScore.emColor }">{{ testScore.emScore }}分 {{ testScore.emGrade }}级</span></div>'
      +   '<div class="si-comp-section">'
      +     '<div v-for="(item, i) in testScore.items" :key="i" class="si-comp-row">'
      +       '<span class="si-comp-icon">{{ item.icon }}</span>'
      +       '<span class="si-comp-label">{{ item.label }}<span v-if="item.weight" style="font-size:.54rem;color:var(--text-muted)"> ({{ item.weight }})</span></span>'
      +       '<div class="si-comp-bar-wrap"><div class="si-comp-bar" :style="{ width: item.barW + \'%\', background: item.color }"></div></div>'
      +       '<span class="si-comp-score" :style="{ color: item.color }">{{ item.score }}</span>'
      +       '<span v-if="item.trendIcon" class="si-comp-trend" :style="{ color: item.trendClr, fontSize: \'.6rem\', marginLeft: \'4px\' }">{{ item.trendIcon }}</span>'
      +     '</div>'
      +     '<div class="si-comp-summary">加权均分: <span style="font-weight:700" :style="{ color: testScore.emColor }">{{ testScore.emScore }}分 {{ testScore.emGrade }}级</span> · 公式: 测试×30% + 类型×15% + 检查×15% + CI/CD×10% + 文档×10% + 依赖×10% + Git×10%</div>'
      +   '</div>'
      + '</div>'
      /* Core dimension groups */
      + '<div v-if="coreDims">'
      +   '<div class="si-section-title">⚙️ 核心维度评分 <span style="font-size:.64rem;font-weight:700" :style="{ color: coreDims.coreColor }">{{ coreDims.coreScore }}分 {{ coreDims.coreGrade }}级</span></div>'
      +   '<div class="si-comp-section">'
      +     '<div v-for="(item, i) in coreDims.items" :key="i" class="si-comp-row">'
      +       '<span class="si-comp-icon">{{ item.icon }}</span>'
      +       '<span class="si-comp-label">{{ item.label }}<span v-if="item.weight" style="font-size:.54rem;color:var(--text-muted)"> ({{ item.weight }})</span></span>'
      +       '<div class="si-comp-bar-wrap"><div class="si-comp-bar" :style="{ width: item.barW + \'%\', background: item.color }"></div></div>'
      +       '<span class="si-comp-score" :style="{ color: item.color }">{{ item.score }}</span>'
      +     '</div>'
      +     '<div class="si-comp-summary">核心加权: <span style="font-weight:700" :style="{ color: coreDims.coreColor }">{{ coreDims.coreScore }}分 {{ coreDims.coreGrade }}级</span> · 权重: 配置/API/诊断各15% · Token/报告/格式/Git/安全各10% · 机器人5%</div>'
      +   '</div>'
      + '</div>'
      /* Dimension matrix */
      + '<div v-if="dimMatrix.length">'
      +   '<div class="si-section-title">📐 维度健康矩阵（全部 {{ dimMatrix.length }} 维）</div>'
      +   '<div class="si-matrix">'
      +     '<div v-for="(d, i) in dimMatrix" :key="i" :class="\'si-mx-card \' + d.cls" :title="d.title">'
      +       '<div class="si-mx-name">{{ d.label }}</div>'
      +       '<div class="si-mx-score" :style="{ color: d.color }">{{ d.score }}</div>'
      +       '<div v-if="d.trendIcon" class="si-mx-trend" :style="{ color: d.trendClr }">{{ d.trendIcon }}{{ d.trendAbs }}</div>'
      +     '</div>'
      +   '</div>'
      + '</div>'
      /* Component health */
      + '<div v-if="componentHealth">'
      +   '<div class="si-section-title">📦 组件健康</div>'
      +   '<div class="si-comp-section">'
      +     '<div v-for="(item, i) in componentHealth.items" :key="i" class="si-comp-row">'
      +       '<span class="si-comp-icon">{{ item.icon }}</span>'
      +       '<span class="si-comp-label">{{ item.label }}</span>'
      +       '<div class="si-comp-bar-wrap"><div class="si-comp-bar" :style="{ width: item.barW + \'%\', background: item.color }"></div></div>'
      +       '<span class="si-comp-score" :style="{ color: item.color }">{{ item.score }} 分</span>'
      +       '<span class="si-comp-count">{{ item.count }} 个</span>'
      +     '</div>'
      +     '<div class="si-comp-summary">综合均分: <span style="font-weight:700" :style="{ color: componentHealth.overallColor }">{{ componentHealth.overallAvg }} 分</span> · 共 <span style="font-weight:700">{{ componentHealth.totalComponents }}</span> 组件</div>'
      +   '</div>'
      + '</div>'
      /* Diagnostics */
      + '<div v-if="activeDiags.length">'
      +   '<div class="si-section-title">🔬 诊断触发概览</div>'
      +   '<div v-for="(d, i) in activeDiags" :key="i" class="si-diag-card">'
      +     '<span class="si-dc-id">{{ d.id }}</span>'
      +     '<div class="si-dc-info"><div class="si-dc-name">{{ d.label }}</div>'
      +     '<div class="si-dc-stats">触发 {{ d.count }} 次 · 覆盖率 {{ d.rate }}%'
      +     '<span v-if="d.desc"> · {{ d.desc }}</span>'
      +     '<br v-if="d.rec"><span v-if="d.rec" style="color:#fbbf24">💡 {{ d.rec }}</span>'
      +     '</div></div>'
      +     '<span class="si-dc-bar-wrap"><span class="si-dc-bar" :style="{ width: d.barW + \'%\', background: d.barClr }"></span></span>'
      +     '<span class="si-dc-badge" :style="{ color: d.barClr }">{{ d.rate }}%</span>'
      +   '</div>'
      + '</div>'
      + '<div v-else-if="siData && siData.diagSummary" class="si-section-title">🔬 诊断触发概览</div><div style="padding:4px 16px 8px;font-size:.64rem;color:var(--text-muted)">✅ 近期无诊断触发</div>'
      /* Branches */
      + '<div v-if="branches.length">'
      +   '<div class="si-section-title">🌿 分支健康对比</div><div class="si-branch-chips">'
      +   '<div v-for="(b, i) in branches" :key="i" class="si-br-chip"><span class="si-br-name" :title="b.name">{{ b.name }}</span>'
      +   '<span class="si-br-score" :style="{ color: b.color }">{{ b.score }}</span>'
      +   '<span class="si-br-meta"><span>×{{ b.count }}次</span>'
      +   '<span v-if="b.uncommitted !== undefined" :style="{ color: b.uncommittedClr }">{{ b.uncommitted }}未提交</span>'
      +   '</span></div>'
      + '</div></div>'
      /* Score trend */
      + '<div v-if="scoreTrend.length">'
      +   '<div class="si-section-title">📈 评分走势（全部 {{ siData.scoreTrend.length }} 个数据点）</div>'
      +   '<div class="si-sparkline-legend"><span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#22c55e"></span> A(≥80)</span><span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#f59e0b"></span> B/C(60-79)</span><span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#ef4444"></span> D(&lt;60)</span></div>'
      +   '<div class="si-sparkline">'
      +     '<span v-for="(bar, i) in scoreTrend" :key="i" class="si-spark-bar" :style="{ height: bar.h + \'px\', background: bar.color }" :title="bar.title"></span>'
      +   '</div>'
      + '</div>'
      /* Signals */
      + '<div v-if="signals.length" class="si-signals">'
      +   '<div v-for="(s, i) in signals" :key="i" :class="\`si-signal \${s.type"><span class="si-sig-icon">{{ s.icon }}</span>{{ s.msg }}</div>'
     }</div>`
      /* End overview */
      + '</div>'
      /* ── Period view ───────────────────────── */
      + '<div v-else>'
      + '<div v-if="periodData && periodData.empty" class="panel-empty yry-panel-empty">暂无{{ periodData.label }}报数据<br><span class="hint">积累更多数据后自动生成</span></div>'
      + '<div v-else-if="periodData">'
      /* Period header */
      + '<div class="si-period-header">'
      +   '<div class="si-period-score" :style="{ color: periodData.color }">{{ periodData.score }}</div>'
      +   '<span :class="\'si-period-grade \' + periodData.grade">{{ periodData.grade }} 级</span>'
      +   '<div class="si-period-meta">{{ periodData.title }} · {{ periodData.label }} · {{ periodData.entries }} 次检查'
      +   '<span v-if="periodData.minScore !== undefined && periodData.minScore !== periodData.maxScore"> · 范围 {{ periodData.minScore }}–{{ periodData.maxScore }}</span>'
      +   '<span v-if="periodData.branchCount"> · {{ periodData.branchCount }} 分支</span>'
      +   '</div>'
      +   '<div v-if="periodData.delta" :class="\'si-period-delta \' + (periodData.delta.up ? \'up\' : \'down\')">{{ periodData.delta.text }}</div>'
      +   '<div v-if="periodData.gradeDist.length" class="si-grade-dist">'
      +     '<span v-for="(g, i) in periodData.gradeDist" :key="i" :class="\'si-gd-chip \' + g.grade">{{ g.grade }}×{{ g.count }}</span>'
      +   '</div>'
      +   '<div v-if="periodData.spark.length" class="si-grade-spark" style="justify-content:flex-start;padding:2px 0">'
      +     '<span v-for="(dot, i) in periodData.spark" :key="i" class="si-grade-dot" :style="{ background: dot.color, width: dot.size, height: dot.size }" :title="dot.title"></span>'
      +   '</div>'
      + '</div>'
      /* Signals (daily) */
      + '<div v-if="siPeriod === \'daily\' && signals.length" class="si-signals">'
      +   '<div v-for="(s, i) in signals" :key="i" :class="\`si-signal \${s.type"><span class="si-sig-icon">{{ s.icon }}</span>{{ s.msg }}</div>'
     }</div>`
      /* Score trend */
      + '<div v-if="periodScoreTrend.length">'
      +   '<div class="si-section-title">📈 评分走势</div><div class="si-sparkline">'
      +   '<span v-for="(bar, i) in periodScoreTrend" :key="i" class="si-spark-bar" :style="{ height: bar.h + \'px\', background: bar.color }" :title="bar.title"></span>'
      +   '</div>'
      + '</div>'
      /* Dimension table */
      + '<div v-if="periodDims.length">'
      +   '<div class="si-section-title">📐 维度评分</div><div class="si-dim-table">'
      +   '<div v-for="(d, i) in periodDims" :key="i" class="si-dim-trow"><span class="si-dt-label">{{ d.label }}</span>'
      +   '<span class="si-dt-bar-wrap"><span class="si-dt-bar" :style="{ width: d.barW + \'%\', background: d.color }"></span></span>'
      +   '<span class="si-dt-val">{{ d.score }}</span><span :class="\'si-dt-delta \' + d.trendClr">{{ d.trendAbs !== null ? d.trendIcon + d.trendAbs : \'—\' }}</span></div>'
      +   '</div>'
      + '</div>'
      /* Period diagnostics */
      + '<div v-if="periodDiags.length">'
      +   '<div class="si-section-title">🔬 本期诊断触发</div>'
      +   '<div v-for="(d, i) in periodDiags" :key="i" class="si-diag-card"><span class="si-dc-id">{{ d.id }}</span>'
      +   '<div class="si-dc-info"><div class="si-dc-name">{{ d.label }}</div><div class="si-dc-stats">×{{ d.count }} 次 · 覆盖率 {{ d.rate }}%'
      +   '<span v-if="d.desc"> · {{ d.desc }}</span>'
      +   '</div></div>'
      +   '<span class="si-dc-bar-wrap"><span class="si-dc-bar" :style="{ width: Math.max(Math.round(d.rate), 3) + \'%\', background: d.barClr }"></span></span>'
      +   '<span class="si-dc-badge" :style="{ color: d.barClr }">{{ d.rate }}%</span></div>'
      + '</div>'
      /* Today entries (daily) */
      + '<div v-if="todayEntries.length">'
      +   '<div class="si-section-title">🕐 今日检查记录（{{ todayEntries.length }} 次）</div><div class="si-timeline">'
      +   '<div v-for="(e, i) in todayEntries" :key="i" class="si-tl-entry"><span class="si-tl-dot" :style="{ background: e.color }"></span>'
      +   '<span class="si-tl-time">{{ e.time }}</span><span class="si-tl-score" :style="{ color: e.color }">{{ e.score }}</span>'
      +   '<span class="si-tl-diags">{{ e.grade }}级'
      +   '<span v-if="e.diagTags.length" class="si-tl-diag-tags">'
      +     '<span v-for="(tag, j) in e.diagTags" :key="j" class="si-tl-diag-tag warm" :title="tag.title">{{ tag.id }}</span>'
      +   '</span>'
      +   '</span>'
      +   '<span v-if="e.gitBranch" class="si-tl-br">{{ e.gitBranch }}</span>'
      +   '<span v-if="e.showUncommitted" class="si-tl-uncom">{{ e.uncommitted }}未提交</span>'
      +   '</div>'
      +   '</div>'
      + '</div>'
      /* Week days (weekly) */
      + '<div v-if="weekDays.length">'
      +   '<div class="si-section-title">📅 本周各日概况</div><div class="si-day-grid">'
      +   '<div v-for="(d, i) in weekDays" :key="i" class="si-day-cell"><div class="si-day-name">{{ d.name }}</div><div class="si-day-score" :style="{ color: d.color }">{{ d.score }}</div><div class="si-day-count">{{ d.entries }}次</div></div>'
      +   '</div>'
      + '</div>'
      /* Month weeks (monthly) */
      + '<div v-if="monthWeeks.length">'
      +   '<div class="si-section-title">📅 本月各周概况</div><div class="si-day-grid">'
      +   '<div v-for="(w, i) in monthWeeks" :key="i" class="si-day-cell"><div class="si-day-name">{{ w.name }}</div><div class="si-day-score" :style="{ color: w.color }">{{ w.score }}</div><div class="si-day-count">{{ w.entries }}次</div></div>'
      +   '</div>'
      + '</div>'
      /* Period branches */
      + '<div v-if="periodBranches.length">'
      +   '<div class="si-section-title">🌿 本期活跃分支</div><div class="si-branch-chips">'
      +   '<span v-for="(b, i) in periodBranches" :key="i" class="si-br-chip"><span class="si-br-name">{{ b.name }}</span>'
      +   '<span v-if="b.count" class="si-br-meta"><span>×{{ b.count }}</span></span>'
      +   '</span>'
      +   '</div>'
      + '</div>'
      /* History */
      + '<div class="si-section-title">📋 历史{{ periodData.title }}</div>'
      + '<div v-if="periodHistory.length === 0" style="padding:4px 16px 8px;font-size:.64rem;color:var(--text-muted)">暂无更多历史数据</div>'
      + '<div v-for="(b, i) in periodHistory" :key="i" class="si-bucket"><div class="si-bucket-head"><span class="si-bucket-date">{{ b.label }}</span>'
      + '<span :class="\`si-bucket-grade \${b.grade">{{ b.score }}分 {{ b.grade }}级</span>'
     }<span class="si-bucket-meta">{{ b.entries }} 次</span>`
      + '<span v-if="b.deltaText" class="si-bucket-meta">{{ b.deltaText }}</span>'
      + '</div>'
      + '<div v-if="b.topDiags.length" class="si-bucket-diags">'
      +   '<span v-for="(d, j) in b.topDiags" :key="j" :class="\`si-bucket-diag\${(d.hot ? \' hot\' : \'\')">{{ d.id }} {{ d.label }} ×{{ d.count }}</span>'
     }</div>`
      + '</div>'
      /* End period */
      + '</div>'
      + '</div>'
  });

  /* ── Mount Vue app (defer until panel shell is ready) ── */
  function mountApp() {
    function doMount() {
      if (siBody) app.mount(siBody);
      H.register('selfimprove', 'selfimprovePanel', 'selfimproveOverlay', function() {
        if (!state.siData && !state.loading) fetchData();
      });
    }
    if (siBody) { doMount(); return; }
    document.addEventListener('yry-selfimprove-panel-ready', function() {
      siBody = document.getElementById('siPanelBody');
      doMount();
    }, { once: true });
  }
  mountApp();

  /* ── Filter chips ────────────────────────── */
  siFilters.forEach(function(c) {
    c.addEventListener('click', function(e) {
      e.stopPropagation();
      siFilters.forEach(function(x) { x.classList.remove('active'); });
      this.classList.add('active');
      state.siPeriod = this.dataset.period;
    });
  });

  /* ── Refresh ─────────────────────────────── */
  var siRefresh = document.getElementById('siRefresh');
  if (siRefresh) {
    siRefresh.addEventListener('click', function(e) {
      e.stopPropagation();
      siRefresh.classList.add('spinning');
      state.siData = null; state.siRaw = []; state.loading = false; state.error = null;
      fetchData().finally(function() { siRefresh.classList.remove('spinning'); });
    });
  }

  /* ── Data fetching ───────────────────────── */
  async function fetchData() {
    state.loading = true;
    state.error = null;
    try {
      var _a = await Promise.all([
        fetch(H.PATHS.summaryJson).then(function(r) { return r.ok ? r.json() : null; }),
        fetch(H.PATHS.healthTrend).then(function(r) { return r.ok ? r.text() : ''; }).catch(function() { return ''; })
      ]);
      var data = _a[0];
      if (!data) throw new Error('summary.json 不可用');

      var jsonlText = _a[1] || '';
      state.siRaw = jsonlText.trim().split('\n').filter(Boolean).map(function(line) {
        try { return JSON.parse(line); } catch(e) { return null; }
      }).filter(Boolean);

      state.siData = data;
      state.loading = false;

      if (siBadge && data.latest) {
        var latest = data.latest;
        siBadge.textContent = latest.composite !== undefined ? String(latest.composite) : '';
        siBadge.className = 'badge';
        if (latest.grade) siBadge.classList.add('si-' + latest.grade);
        siBadge.title = `最新评分: ${latest.composite}分 ` + latest.grade + `级 | 共 ${(data.totalEntries||0)} 条记录`;
      } else if (siBadge && data.totalEntries) {
        siBadge.textContent = data.totalEntries > 99 ? '99+' : String(data.totalEntries);
        siBadge.className = 'badge';
      }
      if (siLiveGrade && data.latest) {
        var lg = data.latest, lGrade = lg.grade || '', lScore = lg.composite;
        siLiveGrade.textContent = lScore + ' ' + lGrade;
        siLiveGrade.className = `si-live-grade ${(lGrade ? lGrade : 'loading');
      }
      if (siCount) siCount.textContent = (data.dateRange ? data.dateRange.from} → ` + data.dateRange.to : data.totalEntries + ' 条');
      if (siFooterTime) {
        var now = new Date();
        siFooterTime.textContent = `更新 ${now.getHours().toString().padStart(2,'0')}:` + now.getMinutes().toString().padStart(2,'0');
      }
    } catch(e) {
      state.loading = false;
      state.error = e.message;
      state.siData = null;
      state.siRaw = [];
    }
  }
})();