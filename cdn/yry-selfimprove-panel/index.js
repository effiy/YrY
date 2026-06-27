/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySelfImprovePanel · 自改进分析面板 (Vue 3 custom element, full)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-selfimprove-panel/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-selfimprove-panel/index.js"></script>
     <yry-selfimprove-panel></yry-selfimprove-panel>

   行为:
     1) 拉取 ./自我改进/summary.json + ../.memory/health-trend.jsonl
     2) 渲染日/周/月/全景四视角健康趋势
     3) 自动注册到 window.PanelHub ('selfimprove')
     4) 派发 yry-selfimprove-panel-ready 事件

   数据迁移说明:
     本组件 1:1 保留 docs/js/selfimprove-panel.js 的业务逻辑(789 行 IIFE),
     但改为 Vue 3 custom element 模式,模板来自 index.html,数据/方法集中在
     buildComponent() 内,无需外部挂载脚本。
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YrySelfImprovePanel] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TAG_NAME = 'yry-selfimprove-panel';

  var TEMPLATE_ID = 'yry-selfimprove-panel-tpl';

  var READY_EVENT = 'yry-selfimprove-panel-ready';

  var LOAD_TIMEOUT_MS = 5000;

  var DEFAULT_PATHS = {
    summaryJson: './自我改进/summary.json',
    healthTrend: '../.memory/health-trend.jsonl'
  };

  var scriptUrl = (document.currentScript && document.currentScript.src) || '';
  var diagInfoUrl = scriptUrl ? scriptUrl.replace(/index\.js(\?[^]*)?$/, 'diag-info.json') : 'cdn/yry-selfimprove-panel/diag-info.json';

  function resolvePaths() {
    var base = (window.PanelHub && window.PanelHub.PATHS) || window.YRY_PATHS || {};
    return {
      summaryJson: base.summaryJson || DEFAULT_PATHS.summaryJson,
      healthTrend: base.healthTrend || DEFAULT_PATHS.healthTrend
    };
  }

  var DIAG_INFO = {};

  function scoreColor(s) {
    return s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444';
  }

  function scoreCls(s) {
    return s >= 80 ? 'ok' : s >= 60 ? 'warn' : 'bad';
  }

  function mxCls(s) {
    return s >= 80 ? 'mx-pass' : s >= 60 ? 'mx-warn' : 'mx-fail';
  }

  function escHtml(s) {
    if (window.PanelHub && typeof window.PanelHub.escHtml === 'function')
      return window.PanelHub.escHtml(s);
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  var GRADE_COLORS = { A: '#22c55e', B: '#22c55e', C: '#f59e0b', D: '#ef4444' };

  window.YrYVueCE.define({
    componentName: 'YrySelfImprovePanel',
    templateId: 'yry-selfimprove-panel-tpl',
    tagName: 'yry-selfimprove-panel',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YrySelfImprovePanel',
        template: templateHTML,
        data: function () {
          return {
            siData: null,
            siRaw: [],
            siPeriod: 'daily',
            loading: false,
            error: null
          };
        },
        computed: {
          /* ── Hero (overview view) ─────────────── */
          hero: function () {
            var d = this.siData;
            if (!d || !d.latest) return null;
            var l = d.latest,
              s = l.composite,
              g = l.grade;
            var gi = {
              A: { color: '#22c55e', bg: 'rgba(34,197,94,.1)' },
              B: { color: '#22c55e', bg: 'rgba(34,197,94,.08)' },
              C: { color: '#f59e0b', bg: 'rgba(245,158,11,.1)' },
              D: { color: '#ef4444', bg: 'rgba(239,68,68,.1)' }
            };
            var info = gi[g] || gi.C;
            var trend = null;
            if (this.siRaw.length >= 2) {
              var prev = this.siRaw[this.siRaw.length - 2];
              var diff = s - (prev.composite || s);
              trend = {
                icon: diff > 3 ? '📈' : diff < -3 ? '📉' : '📊',
                label: diff > 3 ? '↑' + diff : diff < -3 ? '↓' + Math.abs(diff) : '→0',
                color: diff > 3 ? '#22c55e' : diff < -3 ? '#ef4444' : 'var(--text-muted)'
              };
            }
            var spark = [];
            if (this.siRaw.length > 1) {
              var sampled = this.siRaw.slice(-20);
              spark = sampled.map(function (e, i) {
                var last = i === sampled.length - 1;
                return {
                  color: GRADE_COLORS[e.grade] || '#555',
                  size: last ? '10px' : '5px',
                  title:
                    (e.grade || '?') +
                    '级 · ' +
                    (e.composite || '?') +
                    '分 · ' +
                    (e.timestamp || '').slice(0, 10)
                };
              });
            }
            var diagCount = d.diagSummary
              ? d.diagSummary.filter(function (x) {
                  return x.count > 0;
                }).length
              : 0;
            return {
              score: s,
              grade: g,
              label: g,
              color: info.color,
              bg: info.bg,
              trend: trend,
              spark: spark,
              diagCount: diagCount,
              dimCount: d.dimSummary ? d.dimSummary.length : 0,
              totalEntries: d.totalEntries || this.siRaw.length
            };
          },
          /* ── Summary card ─────────────────────── */
          summary: function () {
            var d = this.siData;
            if (!d || !d.dimSummary) return null;
            var pass = 0,
              warn = 0,
              fail = 0;
            d.dimSummary.forEach(function (x) {
              if (x.avgScore >= 80) pass++;
              else if (x.avgScore >= 60) warn++;
              else fail++;
            });
            var diagCount = d.diagSummary
              ? d.diagSummary.filter(function (x) {
                  return x.count > 0;
                }).length
              : 0;
            var overall, overallIcon;
            if (d.latest) {
              var g = d.latest.grade;
              overall = g === 'A' ? '优秀' : g === 'B' ? '良好' : g === 'C' ? '需修复' : '需干预';
              overallIcon = g === 'A' ? '✅' : g === 'B' ? '👌' : g === 'C' ? '⚠️' : '🚨';
            } else {
              overall = '—';
              overallIcon = '⏳';
            }
            var sorted = d.dimSummary.slice().sort(function (a, b) {
              return a.avgScore - b.avgScore;
            });
            var weakest = sorted[0];
            var strongest = sorted[sorted.length - 1];
            var weakTrend = weakest && weakest.trend !== 0 ? (weakest.trend > 0 ? ' ↑' : ' ↓') : '';
            var weakTrendClr = weakest && weakest.trend < -3 ? '#ef4444' : 'inherit';
            var recCount = (d.signals ? d.signals.length : 0) + diagCount;
            var topRec = '';
            if (d.signals && d.signals.length > 0) topRec = d.signals[0].msg || '';
            else if (diagCount > 0) topRec = diagCount + ' 项诊断触发需处理';
            else topRec = '系统运行健康,无紧急事项';
            return {
              overall: overall,
              overallIcon: overallIcon,
              diagCount: diagCount,
              dimPass: pass,
              dimWarn: warn,
              dimFail: fail,
              weakLabel: weakest ? escHtml(weakest.label) + ' ' + weakest.avgScore : '—',
              weakTrend: weakTrend,
              weakTrendClr: weakTrendClr,
              strongLabel: strongest ? escHtml(strongest.label) + ' ' + strongest.avgScore : '—',
              recCount: recCount,
              topRec: topRec
            };
          },
          /* ── Recommendations ──────────────────── */
          recommendations: function () {
            var d = this.siData;
            if (!d) return [];
            var recs = [];
            if (d.signals) {
              d.signals.forEach(function (s) {
                recs.push({
                  source:
                    s.type === 'regression'
                      ? '维度退化'
                      : s.type === 'warning'
                        ? '诊断告警'
                        : '改进信号',
                  text: s.msg,
                  priority: s.type === 'regression' || s.type === 'warning' ? 'high' : 'medium'
                });
              });
            }
            if (d.diagSummary) {
              d.diagSummary.forEach(function (diag) {
                if (diag.count > 0) {
                  var info = DIAG_INFO[diag.id] || {};
                  if (info.rec) {
                    var covered = recs.some(function (r) {
                      return r.text.indexOf(diag.id) >= 0;
                    });
                    if (!covered)
                      recs.push({
                        source: diag.id + ' ' + (diag.label || ''),
                        text: info.rec,
                        priority: diag.rate >= 50 ? 'high' : 'medium'
                      });
                  }
                }
              });
            }
            var seen = {},
              uniq = [];
            recs.forEach(function (r) {
              var key = r.text.slice(0, 30);
              if (!seen[key]) {
                seen[key] = true;
                uniq.push(r);
              }
            });
            uniq.sort(function (a, b) {
              return a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0;
            });
            return uniq.slice(0, 6);
          },
          /* ── Test score breakdown ──────────────── */
          testScore: function () {
            var d = this.siData;
            if (!d || !d.dimSummary) return null;
            var weights = {
              em_testing: 0.3,
              em_types: 0.15,
              em_linting: 0.15,
              em_cicd: 0.1,
              em_docs: 0.1,
              em_deps: 0.1,
              em_git: 0.1
            };
            var dimLabels = {
              em_testing: '测试覆盖',
              em_types: '类型安全',
              em_linting: '代码检查',
              em_cicd: 'CI/CD',
              em_docs: '文档完整',
              em_deps: '依赖管理',
              em_git: 'Git实践',
              comp_qual: '组件质量'
            };
            var testDims = d.dimSummary.filter(function (dim) {
              return dim.dim && (dim.dim.startsWith('em_') || dim.dim === 'comp_qual');
            });
            if (testDims.length === 0) return null;
            var weightedSum = 0,
              totalWeight = 0;
            testDims.forEach(function (dim) {
              var w = weights[dim.dim] || 0.1;
              if (dim.dim === 'comp_qual') w = 0.0;
              weightedSum += dim.avgScore * w;
              totalWeight += w;
            });
            var emScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
            var emGrade = emScore >= 80 ? 'A' : emScore >= 60 ? 'B' : emScore >= 40 ? 'C' : 'D';
            var items = testDims.map(function (dim) {
              var s = dim.avgScore;
              var w = weights[dim.dim] ? Math.round(weights[dim.dim] * 100) + '%' : '';
              var trendIcon = dim.trend > 3 ? ' ↑' : dim.trend < -3 ? ' ↓' : '';
              var trendClr = dim.trend > 3 ? '#22c55e' : dim.trend < -3 ? '#ef4444' : '';
              return {
                icon: s >= 80 ? '✅' : s >= 60 ? '⚠️' : '🚫',
                label: dimLabels[dim.dim] || dim.label,
                weight: w,
                score: s,
                barW: Math.max(3, s),
                color: scoreColor(s),
                trendIcon: trendIcon,
                trendClr: trendClr
              };
            });
            return {
              items: items,
              emScore: emScore,
              emGrade: emGrade,
              emColor: scoreColor(emScore)
            };
          },
          /* ── Core dimension groups ──────────────── */
          coreDims: function () {
            var d = this.siData;
            if (!d || !d.dimSummary) return null;
            var coreKeys = [
              'token',
              'config',
              'api',
              'reports',
              'format',
              'diagnostics',
              'git',
              'security',
              'robots'
            ];
            var coreWeights = {
              token: 0.1,
              config: 0.15,
              robots: 0.05,
              api: 0.15,
              reports: 0.1,
              format: 0.1,
              diagnostics: 0.15,
              git: 0.1,
              security: 0.1
            };
            var dims = d.dimSummary.filter(function (dim) {
              return coreKeys.indexOf(dim.dim) >= 0;
            });
            if (dims.length === 0) return null;
            var coreSum = 0,
              coreTotal = 0;
            dims.forEach(function (dim) {
              var w = coreWeights[dim.dim] || 0.1;
              coreSum += dim.avgScore * w;
              coreTotal += w;
            });
            var coreScore = coreTotal > 0 ? Math.round(coreSum / coreTotal) : 0;
            var coreGrade =
              coreScore >= 80 ? 'A' : coreScore >= 60 ? 'B' : coreScore >= 40 ? 'C' : 'D';
            var items = dims.map(function (dim) {
              var s = dim.avgScore;
              var w = coreWeights[dim.dim] ? Math.round(coreWeights[dim.dim] * 100) + '%' : '';
              return {
                icon: s >= 80 ? '●' : s >= 60 ? '◐' : '○',
                label: escHtml(dim.label),
                weight: w,
                score: s,
                barW: Math.max(3, s),
                color: scoreColor(s)
              };
            });
            return {
              items: items,
              coreScore: coreScore,
              coreGrade: coreGrade,
              coreColor: scoreColor(coreScore)
            };
          },
          /* ── Dimension matrix ──────────────────── */
          dimMatrix: function () {
            var d = this.siData;
            if (!d || !d.dimSummary || d.dimSummary.length === 0) return [];
            return d.dimSummary.map(function (dim) {
              var s = dim.avgScore;
              var trendIcon = dim.trend > 3 ? ' ↑' : dim.trend < -3 ? ' ↓' : '';
              var trendClr = dim.trend > 3 ? '#22c55e' : dim.trend < -3 ? '#ef4444' : '';
              return {
                label: escHtml(dim.label),
                score: s,
                color: scoreColor(s),
                cls: mxCls(s),
                trendIcon: trendIcon,
                trendClr: trendClr,
                trendAbs: trendIcon ? Math.abs(dim.trend) : 0,
                title:
                  escHtml(dim.label) +
                  ' · 均分' +
                  s +
                  ' · 最近' +
                  dim.recentAvg +
                  ' · ' +
                  dim.entries +
                  '次'
              };
            });
          },
          /* ── Active diagnostics ────────────────── */
          activeDiags: function () {
            var d = this.siData;
            if (!d || !d.diagSummary) return [];
            var active = d.diagSummary.filter(function (diag) {
              return diag.count > 0;
            });
            if (active.length === 0) return [];
            var maxCount = active[0].count || 1;
            return active.map(function (diag) {
              var barClr = diag.rate >= 50 ? '#ef4444' : diag.rate >= 25 ? '#f59e0b' : '#60a5fa';
              var label =
                d.diagLabels && d.diagLabels[diag.id] ? d.diagLabels[diag.id] : diag.label;
              var info = DIAG_INFO[diag.id] || {};
              return {
                id: diag.id,
                label: escHtml(label),
                count: diag.count,
                rate: diag.rate,
                barW: Math.max(3, Math.round(((diag.count || 0) / maxCount) * 100)),
                barClr: barClr,
                desc: info.desc || '',
                rec: info.rec || ''
              };
            });
          },
          /* ── Branch summary ────────────────────── */
          branches: function () {
            var d = this.siData;
            if (!d || !d.branchSummary) return [];
            return d.branchSummary.map(function (b) {
              return {
                name: escHtml(b.name),
                score: b.avgScore,
                color: scoreColor(b.avgScore),
                count: b.count,
                uncommitted: b.avgUncommitted,
                uncommittedClr: b.avgUncommitted > 20 ? '#f59e0b' : 'inherit'
              };
            });
          },
          /* ── Score trend sparkline ──────────────── */
          scoreTrend: function () {
            var d = this.siData;
            if (!d || !d.scoreTrend || d.scoreTrend.length <= 1) return [];
            var trend = d.scoreTrend.slice(-80);
            return trend.map(function (p) {
              return {
                h: Math.max(2, Math.round((p.score / 100) * 38)),
                color: scoreColor(p.score),
                title:
                  p.date + ' ' + (p.time || '') + ': ' + p.score + '分 ' + (p.grade || '') + '级'
              };
            });
          },
          /* ── Signals ────────────────────────────── */
          signals: function () {
            var d = this.siData;
            if (!d || !d.signals) return [];
            return d.signals.map(function (s) {
              return { icon: s.icon || '', type: s.type, msg: escHtml(s.msg) };
            });
          },
          /* ── Component health ──────────────────── */
          componentHealth: function () {
            var d = this.siData;
            if (!d || !d.componentHealth) return null;
            var ch = d.componentHealth;
            var types = [
              { key: 'skills', icon: '🤖', label: 'Skills' },
              { key: 'agents', icon: '👥', label: 'Agents' },
              { key: 'rules', icon: '📏', label: 'Rules' },
              { key: 'scripts', icon: '📜', label: 'Scripts' }
            ];
            var items = [];
            types.forEach(function (t) {
              var data = ch[t.key];
              if (!data || data.count === 0) return;
              items.push({
                icon: t.icon,
                label: t.label,
                score: data.avgScore || 0,
                barW: Math.max(3, data.avgScore || 0),
                count: data.count,
                color: scoreColor(data.avgScore || 0)
              });
            });
            return {
              items: items,
              overallAvg: ch.overallAvg,
              totalComponents: ch.totalComponents || 0,
              overallColor: scoreColor(ch.overallAvg || 0)
            };
          },
          /* ── Period data (daily/weekly/monthly) ── */
          periodData: function () {
            var d = this.siData;
            if (!d) return null;
            var p = this.siPeriod;
            var buckets = p === 'daily' ? d.daily : p === 'weekly' ? d.weekly : d.monthly;
            if (!buckets || buckets.length === 0)
              return { empty: true, label: p === 'daily' ? '日' : p === 'weekly' ? '周' : '月' };
            var current = buckets[buckets.length - 1];
            var prev = buckets.length > 1 ? buckets[buckets.length - 2] : null;
            var pLabel =
              p === 'daily'
                ? current.date || ''
                : p === 'weekly'
                  ? (current.week || '') + ' ~ ' + (current.weekEnd || '')
                  : (current.month || '').replace('-', '年') + '月';
            var pTitle = p === 'daily' ? '日报' : p === 'weekly' ? '周报' : '月报';
            var delta = null;
            if (prev && current.avgScore !== prev.avgScore) {
              var dSign = current.avgScore > prev.avgScore ? '+' : '';
              delta = {
                text: dSign + (current.avgScore - prev.avgScore) + ' 分 vs 上期',
                up: current.avgScore > prev.avgScore
              };
            }
            var gradeDist = [];
            if (current.gradeDist) {
              ['A', 'B', 'C', 'D'].forEach(function (g) {
                var cnt = current.gradeDist[g] || 0;
                if (cnt > 0) gradeDist.push({ grade: g, count: cnt });
              });
            }
            var spark = [];
            if (this.siRaw.length > 1) {
              var sampled = this.siRaw.slice(-20);
              spark = sampled.map(function (e, i) {
                var last = i === sampled.length - 1;
                return {
                  color: GRADE_COLORS[e.grade] || '#555',
                  size: last ? '10px' : '5px',
                  title: (e.grade || '?') + '级 · ' + (e.composite || '?') + '分'
                };
              });
            }
            return {
              empty: false,
              score: current.avgScore,
              grade: current.topGrade,
              color: scoreColor(current.avgScore),
              label: pLabel,
              title: pTitle,
              entries: current.entries,
              delta: delta,
              minScore: current.minScore,
              maxScore: current.maxScore,
              branchCount: current.branches ? current.branches.length : 0,
              gradeDist: gradeDist,
              spark: spark,
              current: current,
              prev: prev
            };
          },
          /* ── Period score trend ────────────────── */
          periodScoreTrend: function () {
            var d = this.siData;
            if (!d || !d.scoreTrend || d.scoreTrend.length <= 1) return [];
            return d.scoreTrend.slice(-60).map(function (p) {
              return {
                h: Math.max(2, Math.round((p.score / 100) * 38)),
                color: scoreColor(p.score),
                title: p.date + ': ' + p.score + '分'
              };
            });
          },
          /* ── Period dims (top 9) ────────────────── */
          periodDims: function () {
            var d = this.siData;
            var pd = this.periodData;
            if (!d || !pd || pd.empty) return [];
            var buckets =
              this.siPeriod === 'daily'
                ? d.daily
                : this.siPeriod === 'weekly'
                  ? d.weekly
                  : d.monthly;
            if (!buckets || buckets.length === 0) return [];
            var current = buckets[buckets.length - 1];
            if (!current.dimScores) return [];
            var entries = Object.keys(current.dimScores).map(function (k) {
              return { name: k, score: current.dimScores[k] };
            });
            entries.sort(function (a, b) {
              return a.score - b.score;
            });
            return entries.slice(0, 9).map(function (dn) {
              return {
                label: escHtml(dn.name),
                score: dn.score,
                barW: Math.max(3, dn.score),
                color: scoreColor(dn.score),
                trendIcon: '',
                trendAbs: null,
                trendClr: ''
              };
            });
          },
          /* ── Period diagnostics ────────────────── */
          periodDiags: function () {
            var d = this.siData;
            var pd = this.periodData;
            if (!d || !pd || pd.empty || !pd.current.topDiags) return [];
            return pd.current.topDiags.map(function (diag) {
              var barClr = diag.rate >= 50 ? '#ef4444' : diag.rate >= 25 ? '#f59e0b' : '#60a5fa';
              var label =
                d.diagLabels && d.diagLabels[diag.id] ? d.diagLabels[diag.id] : diag.label;
              var info = DIAG_INFO[diag.id] || {};
              return {
                id: diag.id,
                label: escHtml(label),
                count: diag.count,
                rate: diag.rate,
                barClr: barClr,
                desc: info.desc || ''
              };
            });
          },
          /* ── Today entries ──────────────────────── */
          todayEntries: function () {
            var d = this.siData;
            var pd = this.periodData;
            if (!d || !pd || pd.empty || this.siPeriod !== 'daily') return [];
            var today = pd.current.date || '';
            return this.siRaw
              .filter(function (e) {
                return e.timestamp && e.timestamp.slice(0, 10) === today;
              })
              .sort(function (a, b) {
                return (b.timestamp || '').localeCompare(a.timestamp || '');
              })
              .map(function (e) {
                var t = e.timestamp ? e.timestamp.slice(11, 16) : '';
                var diagTags = (e.triggeredDiags || []).map(function (diag) {
                  var dinfo = DIAG_INFO[diag] || {};
                  return { id: diag, title: (dinfo.desc || '') + ' → ' + (dinfo.rec || '') };
                });
                return {
                  time: t,
                  score: e.composite,
                  color: scoreColor(e.composite),
                  grade: e.grade || '',
                  diagTags: diagTags,
                  gitBranch: e.gitBranch || '',
                  showUncommitted: e.gitUncommitted > 10,
                  uncommitted: e.gitUncommitted
                };
              });
          },
          /* ── Week days ──────────────────────────── */
          weekDays: function () {
            var d = this.siData;
            var pd = this.periodData;
            if (!d || !pd || pd.empty || this.siPeriod !== 'weekly') return [];
            var ws = pd.current.week || '',
              we = pd.current.weekEnd || '';
            var dn = ['日', '一', '二', '三', '四', '五', '六'];
            return d.daily
              .filter(function (day) {
                return day.date >= ws && day.date <= we;
              })
              .map(function (day) {
                var dayIdx = new Date(day.date).getDay();
                return {
                  name: '周' + dn[dayIdx],
                  score: day.avgScore,
                  color: scoreColor(day.avgScore),
                  entries: day.entries
                };
              });
          },
          /* ── Month weeks ────────────────────────── */
          monthWeeks: function () {
            var d = this.siData;
            var pd = this.periodData;
            if (!d || !pd || pd.empty || this.siPeriod !== 'monthly') return [];
            var mPrefix = (pd.current.month || '').replace(/-/g, '');
            return d.weekly
              .filter(function (w) {
                return (w.week || '').replace(/-/g, '').startsWith(mPrefix);
              })
              .map(function (w) {
                return {
                  name: 'W' + (w.week || '').replace(/.*W0?(\d+)$/, '$1'),
                  score: w.avgScore,
                  color: scoreColor(w.avgScore),
                  entries: w.entries
                };
              });
          },
          /* ── Period branches ────────────────────── */
          periodBranches: function () {
            var d = this.siData;
            var pd = this.periodData;
            if (!d || !pd || pd.empty || !pd.current.branches) return [];
            return pd.current.branches.map(function (b) {
              return {
                name: escHtml(typeof b === 'string' ? b : b.name || ''),
                count: typeof b === 'object' ? b.count : 0
              };
            });
          },
          /* ── Period history ─────────────────────── */
          periodHistory: function () {
            var d = this.siData;
            if (!d) return [];
            var p = this.siPeriod;
            var buckets = p === 'daily' ? d.daily : p === 'weekly' ? d.weekly : d.monthly;
            if (!buckets || buckets.length <= 1) return [];
            var maxBuckets = p === 'daily' ? 14 : p === 'weekly' ? 8 : 12;
            return buckets
              .slice(0, buckets.length - 1)
              .reverse()
              .slice(0, maxBuckets)
              .map(function (b) {
                var key = b.date || b.week || b.month;
                var label =
                  p === 'weekly'
                    ? (b.week || '') + ' ~ ' + (b.weekEnd || '')
                    : p === 'monthly'
                      ? (b.month || '').replace('-', '年') + '月'
                      : key;
                var deltaText =
                  b.delta && b.delta.score !== 0
                    ? (b.delta.score > 0 ? '+' : '') + b.delta.score + ' vs 上期'
                    : '';
                var topDiags = (b.topDiags || []).map(function (diag) {
                  return {
                    id: diag.id,
                    label: escHtml(diag.label),
                    count: diag.count,
                    hot: diag.rate >= 50
                  };
                });
                return {
                  label: escHtml(label),
                  score: b.avgScore,
                  grade: b.topGrade || '',
                  entries: b.entries,
                  deltaText: deltaText,
                  topDiags: topDiags
                };
              });
          }
        },
        methods: {
          setPeriod: function (p) {
            this.siPeriod = p;
          },
          isOverview: function () {
            return this.siPeriod === 'overview';
          },
          diagInfo: function (id) {
            return DIAG_INFO[id] || {};
          },
          fetchData: async function () {
            var paths = resolvePaths();
            this.loading = true;
            this.error = null;
            try {
              var results = await Promise.all([
                fetch(paths.summaryJson).then(function (r) {
                  return r.ok ? r.json() : null;
                }),
                fetch(paths.healthTrend)
                  .then(function (r) {
                    return r.ok ? r.text() : '';
                  })
                  .catch(function () {
                    return '';
                  }),
                fetch(diagInfoUrl)
                  .then(function (r) {
                    return r.ok ? r.json() : {};
                  })
                  .catch(function () {
                    return {};
                  })
              ]);
              var data = results[0];
              if (!data) throw new Error('summary.json 不可用');
              DIAG_INFO = results[2] || {};

              var jsonlText = results[1] || '';
              this.siRaw = jsonlText
                .trim()
                .split('\n')
                .filter(Boolean)
                .map(function (line) {
                  try {
                    return JSON.parse(line);
                  } catch (e) {
                    return null;
                  }
                })
                .filter(Boolean);

              this.siData = data;
              this.loading = false;
              this.$nextTick(this._syncExternalCounters);
            } catch (e) {
              this.loading = false;
              this.error = e.message || String(e);
              this.siData = null;
              this.siRaw = [];
            }
          },
          _syncExternalCounters: function () {
            var d = this.siData;
            var badge = document.getElementById('selfimproveBadge');
            var live = document.getElementById('siLiveGrade');
            var count = document.getElementById('siTotalCount');
            var footer = document.getElementById('siFooterTime');
            if (d && d.latest && badge) {
              var latest = d.latest;
              badge.textContent = latest.composite !== undefined ? String(latest.composite) : '';
              badge.className = 'badge';
              if (latest.grade) badge.classList.add('si-' + latest.grade);
              badge.title =
                '最新评分: ' +
                latest.composite +
                '分 ' +
                latest.grade +
                '级 | 共 ' +
                (d.totalEntries || 0) +
                ' 条记录';
            } else if (badge && d && d.totalEntries) {
              badge.textContent = d.totalEntries > 99 ? '99+' : String(d.totalEntries);
              badge.className = 'badge';
            }
            if (live && d && d.latest) {
              var lg = d.latest,
                lGrade = lg.grade || '',
                lScore = lg.composite;
              live.textContent = lScore + ' ' + lGrade;
              live.className = 'si-live-grade ' + (lGrade ? lGrade : 'loading');
            }
            if (count)
              count.textContent =
                d && d.dateRange
                  ? d.dateRange.from + ' → ' + d.dateRange.to
                  : ((d && d.totalEntries) || 0) + ' 条';
            if (footer) {
              var now = new Date();
              footer.textContent =
                '更新 ' +
                now.getHours().toString().padStart(2, '0') +
                ':' +
                now.getMinutes().toString().padStart(2, '0');
            }
          },
          onRefresh: function () {
            this.fetchData();
          },
          registerWithHub: function () {
            if (window.PanelHub) {
              var self = this;
              window.PanelHub.register(
                'selfimprove',
                null,
                'selfimprovePanel',
                'selfimproveOverlay',
                function () {
                  if (!self.siData && !self.loading) self.fetchData();
                }
              );
              return true;
            }
            return false;
          }
        },
        mounted: function () {
          var self = this;
          this._syncExternalCounters();
          if (!this.registerWithHub()) {
            var tries = 0,
              maxTries = 100;
            var t = setInterval(function () {
              tries++;
              if (self.registerWithHub() || tries >= maxTries) clearInterval(t);
            }, 50);
          }
          document.dispatchEvent(
            new CustomEvent(READY_EVENT, { detail: { component: 'YrySelfImprovePanel' } })
          );
        }
      };
    }
  });
})();
