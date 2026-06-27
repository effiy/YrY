/**
 * yry-notify-panel/index.js — 通知中心面板 (Vue 3 custom element + fetch template)
 *
 * 重构自旧版 IIFE (500+ 行字符串拼接式 Vue.createApp):
 *   - Template 从字符串拼接改为 fetch('index.html') + DOMParser 解析
 *   - 模板源: <script type="text/x-template" id="yry-notify-panel-tpl">
 *   - 改用 Vue 3 defineCustomElement,自动创建 #notifyPanel / #notifyOverlay DOM
 *   - 业务逻辑 (data / computed / methods / fetch) 1:1 保留
 *   - 派发事件: yry-notify-panel-ready
 *
 * 加载链:
 *   <link rel="stylesheet" href="../../../../cdn/yry-notify-panel/index.css">
 *   <script src="../../../../cdn/yry-panel-hub/index.js"></script>
 *   <script src="../shared/vue.global.prod.js"></script>
 *   <script src="../../../../cdn/yry-notify-panel/index.js"></script>
 *
 * 页面使用:
 *   <yry-notify-panel></yry-notify-panel>
 *
 * 兼容性:
 *   - 与 docs/index.html · cdn/index.html 的 panel-hub 按钮事件完全兼容
 *   - 模板/数据/方法 1:1 来自原 IIFE,行为不变
 */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryNotifyPanel] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TAG_NAME = 'yry-notify-panel';

  var TEMPLATE_ID = 'yry-notify-panel-tpl';

  var READY_EVENT = 'yry-notify-panel-ready';

  var LOAD_TIMEOUT_MS = 5000;

  function scoreClass(score) {
    return score >= 80 ? 'A' : score >= 60 ? 'C' : 'D';
  }

  function dotClass(score) {
    return score >= 80 ? 'ok' : score >= 60 ? 'warn' : 'bad';
  }

  function gradeMessage(g) {
    return { A: '系统健康', B: '需关注', C: '需修复', D: '需干预' }[g] || '';
  }

  function formatTimeId(timeId) {
    if (!timeId) return '';
    var s = String(timeId).replace(/\D/g, '');
    if (s.length < 4) return '';
    var hh = s.slice(0, 2),
      mm = s.slice(2, 4);
    if (!/^\d{2}$/.test(hh) || !/^\d{2}$/.test(mm)) return '';
    return hh + ':' + mm;
  }

  function getItemHref(item) {
    if (!item || !item.href) return '';
    var fileName = String(item.href).split('/').pop() || '';
    if (!fileName) return '';
    if (item.type === 'health') return '../docs/健康报告/' + fileName;
    return item.basePath ? item.basePath + item.href : item.href;
  }

  window.YrYVueCE.define({
    componentName: 'YryNotifyPanel',
    templateId: 'yry-notify-panel-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryNotifyPanel',
        template: templateHTML,
        data: function () {
          return {
            allItems: [],
            activeFilter: 'all',
            loading: false,
            error: null,
            _lastUpdate: 0
          };
        },
        computed: {
          filteredItems: function () {
            var list =
              this.activeFilter === 'all'
                ? this.allItems
                : this.allItems.filter(
                    function (it) {
                      return it.type === this.activeFilter;
                    }.bind(this)
                  );
            return list.map(function (item, i) {
              item._idx = i;
              return item;
            });
          },
          summaryBar: function () {
            var list = this.filteredItems;
            if (!list || list.length === 0) return null;
            var totalTriggers = 0,
              totalWarnFindings = 0,
              totalFailFindings = 0;
            var unreadWarn = 0,
              unreadFail = 0,
              unreachableTrends = 0;
            var latestScore = null,
              prevScore = null;
            list.forEach(function (it) {
              if (it.type === 'health' && it.meta && it.meta.triggers)
                totalTriggers += it.meta.triggers;
              if (it.type === 'loop' && it.meta && it.meta.findings) {
                totalWarnFindings += it.meta.findings.warn || 0;
                totalFailFindings += it.meta.findings.fail || 0;
                if (it.meta.status === 'warn') unreadWarn++;
                if (it.meta.status === 'fail') unreadFail++;
              }
              if (it.type === 'trend' && it.meta && it.meta.ok === false) unreachableTrends++;
            });
            var healthItems = list.filter(function (x) {
              return x.type === 'health' && x.meta && x.meta.score !== undefined;
            });
            if (healthItems.length >= 2) {
              latestScore = healthItems[0].meta.score;
              prevScore = healthItems[1].meta.score;
            } else if (healthItems.length === 1) {
              latestScore = healthItems[0].meta.score;
            }
            var stats = [];
            var GRADE_GUIDE = {
              A: '优秀，系统运行健康',
              B: '良好，少量维度需关注',
              C: '告警，多项指标异常需修复',
              D: '严重，需要立即干预'
            };
            if (latestScore !== null) {
              var g = healthItems[0].meta.grade || '';
              var scClr = latestScore >= 80 ? '#22c55e' : latestScore >= 60 ? '#f59e0b' : '#ef4444';
              stats.push({
                icon: '🩺',
                val: latestScore + '分 ' + g + '级',
                color: scClr,
                hint: GRADE_GUIDE[g] || ''
              });
              if (prevScore !== null && latestScore !== prevScore) {
                var d = latestScore - prevScore;
                stats.push({
                  val: (d > 0 ? '↑' : '↓') + Math.abs(d),
                  color: d > 0 ? '#22c55e' : '#ef4444'
                });
              }
            }
            if (totalTriggers > 0)
              stats.push({
                icon: '🔬',
                val: totalTriggers + '触发',
                color: '#f59e0b',
                title: 'D0-D7 诊断触发总数'
              });
            if (totalFailFindings > 0)
              stats.push({ icon: '🚫', val: totalFailFindings + '异常', color: '#ef4444' });
            if (totalWarnFindings > 0)
              stats.push({ icon: '⚠️', val: totalWarnFindings + '告警', color: '#f59e0b' });
            if (unreadFail > 0)
              stats.push({
                icon: '📋',
                val: unreadFail + '巡检异常',
                color: '#ef4444',
                title: '巡检报告中存在异常状态的技能数'
              });
            else if (unreadWarn > 0)
              stats.push({ icon: '📋', val: unreadWarn + '巡检告警', color: '#f59e0b' });
            if (unreachableTrends > 0)
              stats.push({ icon: '🔗', val: unreachableTrends + '源不可达', color: '#ef4444' });
            if (stats.length === 0) stats.push({ icon: '✅', val: '一切正常', color: '#22c55e' });
            return { stats: stats, total: list.length };
          },
          healthSparkline: function () {
            var scores = [];
            this.allItems.forEach(function (item) {
              if (item.type === 'health' && item.meta && item.meta.score !== undefined) {
                scores.push({ score: item.meta.score, grade: item.meta.grade, date: item.date });
              }
            });
            if (scores.length < 2) return null;
            scores.reverse();
            var lastN = scores.slice(-10);
            var minS = Math.min.apply(
              null,
              lastN.map(function (s) {
                return s.score;
              })
            );
            var maxS = Math.max.apply(
              null,
              lastN.map(function (s) {
                return s.score;
              })
            );
            var range = maxS - minS || 1;
            var firstS = lastN[0].score,
              lastS = lastN[lastN.length - 1].score;
            var trendIcon = lastS > firstS ? '↑' : lastS < firstS ? '↓' : '→';
            var trendClr =
              lastS > firstS ? '#22c55e' : lastS < firstS ? '#ef4444' : 'var(--text-muted)';
            var bars = lastN.map(function (s) {
              return {
                h: Math.max(3, Math.round(((s.score - minS) / range) * 28) + 2),
                color: s.score >= 80 ? '#22c55e' : s.score >= 60 ? '#f59e0b' : '#ef4444',
                title: s.date + ': ' + s.score + '分 ' + (s.grade || '') + '级'
              };
            });
            return {
              bars: bars,
              trendIcon: trendIcon,
              trendClr: trendClr,
              diff: Math.abs(lastS - firstS),
              from: lastN[0].date,
              to: lastN[lastN.length - 1].date,
              count: lastN.length
            };
          },
          dateGroups: function () {
            var list = this.filteredItems;
            var groups = [];
            var lastDate = '';
            list.forEach(
              function (item, i) {
                var curDate = item.date || '';
                if (curDate && this.activeFilter === 'all' && curDate !== lastDate) {
                  groups.push({ isDate: true, date: curDate });
                  lastDate = curDate;
                }
                groups.push({ isDate: false, item: item, isLatest: i === 0 });
              }.bind(this)
            );
            return groups;
          },
          counts: function () {
            return {
              all: this.allItems.length,
              health: this.allItems.filter(function (x) {
                return x.type === 'health';
              }).length,
              loop: this.allItems.filter(function (x) {
                return x.type === 'loop';
              }).length,
              trend: this.allItems.filter(function (x) {
                return x.type === 'trend';
              }).length,
              analysis: this.allItems.filter(function (x) {
                return x.type === 'analysis';
              }).length
            };
          },
          totalCountLabel: function () {
            if (this.loading && this.allItems.length === 0) return '加载中…';
            return '共 ' + this.allItems.length + ' 条';
          },
          updateTimeLabel: function () {
            if (!this._lastUpdate) return '';
            var d = new Date(this._lastUpdate);
            var hh = d.getHours().toString().padStart(2, '0');
            var mm = d.getMinutes().toString().padStart(2, '0');
            return '更新 ' + hh + ':' + mm + ' · ' + this.allItems.length + ' 条通知';
          }
        },
        methods: {
          /* ── Event handlers ─────────────────── */
          setFilter: function (f) {
            this.activeFilter = f;
          },
          onRefresh: function () {
            this.allItems = [];
            this.error = null;
            this.fetchAll();
          },
          openPanel: function (name) {
            if (window.PanelHub) window.PanelHub.open(name);
          },
          scoreClass: function (score) {
            return scoreClass(score);
          },
          escHtml: function (s) {
            return window.PanelHub
              ? window.PanelHub.escHtml(s)
              : window.YrY && window.YrY.escHtml
                ? window.YrY.escHtml(s)
                : String(s);
          },
          relativeTime: function (d) {
            return window.PanelHub ? window.PanelHub.relativeTime(d) : String(d || '');
          },
          getHref: function (item) {
            return getItemHref(item);
          },
          isExternal: function (href) {
            return (
              /^(https?:)?\/\//i.test(String(href).trim()) ||
              /^(mailto:|tel:)/i.test(String(href).trim())
            );
          },
          cardOnclick: function (item) {
            var href = getItemHref(item);
            if (!href) return;
            var rawHref = String(href).trim();
            var isExt = /^(https?:)?\/\//i.test(rawHref) || /^(mailto:|tel:)/i.test(rawHref);
            var finalHref = rawHref;
            try {
              finalHref = encodeURI(rawHref);
            } catch (_e) {
              finalHref = rawHref;
            }
            if (isExt) window.open(finalHref, '_blank', 'noopener');
            else window.location.href = finalHref;
          },
          /* ── Resolve helpers ────────────────── */
          resolveTypeLabel: function (item) {
            if (item.type === 'health') return { label: '🩺 健康', cls: 'health' };
            if (item.type === 'loop') return { label: '🔄 自循环', cls: 'loop' };
            if (item.type === 'analysis') return { label: '🔍 项目分析', cls: 'analysis' };
            var icons = {
              all: '🌐',
              'github-trending': '🐙',
              'oss-insight': '📊',
              trendshift: '🔥',
              'top-starred': '⭐'
            };
            return { label: (icons[item.source] || '📡') + ' 趋势', cls: 'trend' };
          },
          resolveDotClass: function (item) {
            if (item.type === 'health')
              return item.meta && item.meta.score !== undefined ? dotClass(item.meta.score) : 'ok';
            if (item.type === 'loop')
              return item.meta && item.meta.status
                ? item.meta.status === 'pass'
                  ? 'ok'
                  : item.meta.status === 'warn'
                    ? 'warn'
                    : 'bad'
                : 'ok';
            if (item.type === 'analysis')
              return item.meta && item.meta.overallScore !== undefined
                ? dotClass(item.meta.overallScore)
                : 'ok';
            return item.meta && item.meta.ok === false ? 'bad' : 'ok';
          },
          resolveTitle: function (item) {
            if (item.label) return String(item.label).trim();
            if (item.type === 'health') {
              if (item.date) return '🩺 ' + item.date;
              if (item.date && item.timeId) return 'health-' + item.date + '-' + item.timeId;
              return '健康报告(文件缺失)';
            }
            var fileName =
              String(item.href || '')
                .split('/')
                .pop() || '';
            try {
              fileName = decodeURIComponent(fileName).replace(/\.html$/, '');
            } catch (e) {
              fileName = fileName.replace(/\.html$/, '');
            }
            if (fileName) return fileName;
            if (item.type === 'loop')
              return item.meta && item.meta.pageTitle
                ? item.meta.pageTitle.replace('自循环报告 · ', '')
                : item.skill || '自循环报告';
            var srcLabels = {
              all: '全量扫描',
              'github-trending': 'GitHub Trending',
              'oss-insight': 'OSS Insight',
              trendshift: 'TrendShift',
              'top-starred': 'Top-Starred'
            };
            if (item.type === 'analysis')
              return '🔍 项目分析 · ' + (srcLabels[item.source] || item.source) + ' · ' + item.date;
          },
          renderTime: function (item) {
            if (!item.date) return '';
            if (item.type === 'health' && item.timeText) return this.escHtml(item.timeText);
            return this.escHtml(this.relativeTime(item.date));
          },
          renderTimeTitle: function (item) {
            if (!item.date) return '';
            if (item.type === 'health' && item.timeText)
              return this.escHtml(item.date + ' ' + item.timeText);
            return this.escHtml(item.date);
          },
          /* ── Health detail helpers ──────────── */
          healthScorePill: function (m) {
            if (m.score === undefined) return '';
            return {
              score: m.score,
              grade: m.grade || '',
              gradeLabel: gradeMessage(m.grade),
              cls: m.grade || ''
            };
          },
          healthDelta: function (item) {
            if (item.prevScore === undefined || item.meta.score === item.prevScore) return null;
            var d = item.meta.score - item.prevScore;
            return { up: d > 0, diff: Math.abs(d), text: (d > 0 ? '↑' : '↓') + Math.abs(d) };
          },
          healthDimScores: function (m) {
            if (!m.dimScores) return [];
            var entries = Object.keys(m.dimScores).map(function (k) {
              return { name: k, score: m.dimScores[k] };
            });
            entries.sort(function (a, b) {
              return a.score - b.score;
            });
            return entries.slice(0, 8).map(
              function (dn) {
                return {
                  name: this.escHtml(dn.name),
                  score: dn.score,
                  color: dn.score >= 80 ? '#22c55e' : dn.score >= 60 ? '#f59e0b' : '#ef4444',
                  cls: dn.score >= 80 ? 'pass' : dn.score >= 60 ? 'warn' : 'fail'
                };
              }.bind(this)
            );
          },
          healthDimOverflow: function (m) {
            if (!m.dimScores) return 0;
            var entries = Object.keys(m.dimScores);
            return entries.length > 8 ? entries.length - 8 : 0;
          },
          /* ── Loop detail helpers ────────────── */
          loopStatus: function (m) {
            if (!m || !m.status) return null;
            var labels = { pass: '✅ 通过', warn: '⚠️ 告警', fail: '🚫 异常' };
            return {
              label: labels[m.status] || m.status,
              cls: m.status === 'pass' ? 't-green' : m.status === 'warn' ? 't-yellow' : 't-red'
            };
          },
          loopFindings: function (m) {
            if (!m || !m.findings) return null;
            var f = m.findings;
            var items = [];
            if (f.fail) items.push({ icon: '🚫', val: f.fail, label: '异常', cls: 't-red' });
            if (f.warn) items.push({ icon: '⚠️', val: f.warn, label: '告警', cls: 't-yellow' });
            if (f.info) items.push({ icon: 'ℹ️', val: f.info, label: '信息', cls: '' });
            if (!f.fail && !f.warn && !f.info) items.push({ icon: '✅', val: '0', cls: 't-green' });
            return items;
          },
          loopFindingTitles: function (m) {
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
              result.push({ text: this.escHtml(m.findingTitles[i]), level: level });
            }
            return result;
          },
          loopFindingOverflow: function (m) {
            if (!m || !m.findingTitles) return 0;
            return m.findingTitles.length > 5 ? m.findingTitles.length - 5 : 0;
          },
          /* ── Trend detail helpers ───────────── */
          trendOk: function (m) {
            if (!m || m.ok === undefined) return null;
            return {
              ok: m.ok,
              label: m.ok ? '✅ 可达' : '🚫 不可达',
              cls: m.ok ? 't-green' : 't-red'
            };
          },
          trendReachability: function (m) {
            if (!m || m.reachable === undefined || m.total === undefined) return null;
            var pct = m.total > 0 ? Math.round((m.reachable / m.total) * 100) : 0;
            return {
              reachable: m.reachable,
              total: m.total,
              pct: pct,
              cls: pct >= 80 ? 't-green' : pct >= 50 ? 't-yellow' : 't-red'
            };
          },
          trendDirection: function (m) {
            if (!m || !m.trend) return null;
            var icon = m.trend === 'flat' ? '➡️' : m.trend === 'rise' ? '📈' : '📉';
            var label = m.trend === 'flat' ? '平稳' : m.trend === 'rise' ? '上升' : '下降';
            return {
              icon: icon,
              label: label,
              cls: m.trend === 'flat' ? '' : m.trend === 'rise' ? 't-green' : 't-red'
            };
          },
          trendKeywords: function (item) {
            if (!item.keywords || !item.keywords.length) return [];
            return item.keywords.slice(0, 8).map(
              function (k) {
                return this.escHtml(k);
              }.bind(this)
            );
          },
          trendKeywordOverflow: function (item) {
            if (!item.keywords) return 0;
            return item.keywords.length > 8 ? item.keywords.length - 8 : 0;
          },
          /* ── Analysis detail helpers ────────── */
          analysisScorePill: function (m) {
            if (m.overallScore === undefined) return null;
            return {
              score: m.overallScore,
              grade: m.overallGrade || '',
              cls: m.overallGrade || ''
            };
          },
          analysisDimScores: function (m) {
            if (!m.dimensions || !m.dimensions.length) return [];
            return m.dimensions.slice(0, 8).map(
              function (dn) {
                return {
                  name: this.escHtml(dn.name),
                  score: dn.score,
                  color: dn.score >= 80 ? '#22c55e' : dn.score >= 60 ? '#f59e0b' : '#ef4444',
                  cls: dn.score >= 80 ? 'pass' : dn.score >= 60 ? 'warn' : 'fail'
                };
              }.bind(this)
            );
          },
          analysisDimOverflow: function (m) {
            return m.dimensions && m.dimensions.length > 8 ? m.dimensions.length - 8 : 0;
          },
          analysisIssues: function (m) {
            if (!m.issues || !m.issues.length) return [];
            return m.issues.slice(0, 3).map(
              function (iss) {
                return {
                  text: this.escHtml(iss.msg),
                  level: iss.level === 'fail' ? 'fail' : iss.level === 'warn' ? 'warn' : 'info'
                };
              }.bind(this)
            );
          },
          analysisIssueOverflow: function (m) {
            return m.issues && m.issues.length > 3 ? m.issues.length - 3 : 0;
          },
          /* ── Empty state hints ──────────────── */
          emptyHint: function () {
            var map = {
              health: {
                desc: '生成最新健康报告并推送到通知中心',
                cmd: 'node skills/rui-bot/send.mjs health --html'
              },
              loop: {
                desc: '运行自循环巡检,生成各技能巡检报告',
                cmd: 'node skills/rui-bot/lib/loop-report.mjs'
              },
              trend: {
                desc: '扫描 GitHub / OSS Insight 等趋势源',
                cmd: 'node skills/rui-trends/rui-trends.mjs all --html'
              },
              analysis: {
                desc: '运行架构合规检查并生成项目分析报告',
                cmd: 'node lib/arch-check.mjs --json'
              },
              all: {
                desc: '运行健康检查生成首份报告',
                cmd: 'node skills/rui-bot/send.mjs health --html'
              }
            };
            return map[this.activeFilter] || map.all;
          },
          emptyMsg: function () {
            return this.activeFilter === 'all'
              ? '暂无通知 — 尚无可显示的报告或通知数据'
              : '该类型暂无报告数据';
          },
          /* ── Lifecycle: register with PanelHub ── */
          registerWithHub: function () {
            var self = this;
            if (window.PanelHub) {
              window.PanelHub.register('notify', null, 'notifyPanel', 'notifyOverlay', function () {
                if (self.allItems.length === 0 && !self.loading) self.fetchAll();
              });
              return true;
            }
            return false;
          },
          /* ── Data fetchers (async) ──────────── */
          fetchAll: async function () {
            this.loading = true;
            this.error = null;
            try {
              var results = await Promise.all([
                this.fetchHealthReports(),
                this.fetchLoopReports(),
                this.fetchTrendReports(),
                this.fetchAnalysisReports()
              ]);
              var healthData = results[0],
                loopData = results[1],
                trendData = results[2],
                analysisData = results[3];
              var unified = [];
              healthData.forEach(function (r) {
                unified.push({
                  type: 'health',
                  href: r.file,
                  basePath: '../docs/健康报告/',
                  label: '🩺 ' + r.date,
                  date: r.date,
                  timeText: r.time,
                  timeId: String(r.time || '').replace(/\D/g, ''),
                  meta: { score: r.score, grade: r.grade }
                });
              });
              loopData.forEach(function (lr) {
                unified.push({
                  type: 'loop',
                  href: lr.file,
                  basePath: './自循环报告/',
                  label: lr.label || '',
                  date: lr.date || '',
                  timeId: lr.timeId || '',
                  meta: lr.meta || null
                });
              });
              trendData.forEach(function (tr) {
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
              });
              analysisData.forEach(function (ar) {
                unified.push({
                  type: 'analysis',
                  href: ar.file,
                  basePath: './项目分析/',
                  label: ar.label || '',
                  date: ar.date || '',
                  meta: ar.meta || null
                });
              });
              this.allItems = unified.sort(function (a, b) {
                var aAt = (a.date || '') + (a.timeId || '');
                var bAt = (b.date || '') + (b.timeId || '');
                return bAt.localeCompare(aAt);
              });
              // Attach prevScore for health items
              var healthItems = this.allItems.filter(function (x) {
                return x.type === 'health';
              });
              for (var i = 0; i < healthItems.length; i++) {
                if (i + 1 < healthItems.length && healthItems[i + 1].meta) {
                  healthItems[i].prevScore = healthItems[i + 1].meta.score;
                }
              }
              this._lastUpdate = Date.now();
            } catch (e) {
              this.error = e;
              console.warn('[YryNotifyPanel] fetchAll 失败:', e && e.message);
            } finally {
              this.loading = false;
            }
          },
          fetchHealthReports: async function () {
            try {
              var resp = await fetch('../../docs/健康报告/reports.json');
              if (!resp.ok) throw new Error('HTTP ' + resp.status);
              var data = await resp.json();
              if (!Array.isArray(data) || data.length === 0) return [];
              var seen = {};
              var deduped = [];
              for (var i = 0; i < data.length; i++) {
                var d = data[i].date;
                if (!seen[d]) {
                  seen[d] = true;
                  deduped.push(data[i]);
                }
              }
              return deduped;
            } catch (e) {
              console.warn('[YryNotifyPanel] 健康报告 fetch 失败: ' + e.message);
              return [];
            }
          },
          fetchLoopReports: async function () {
            try {
              var resp = await fetch('../../docs/自循环报告/reports.json');
              if (!resp.ok) throw new Error('HTTP ' + resp.status);
              var data = await resp.json();
              if (!Array.isArray(data)) return [];
              return data.map(function (r) {
                return {
                  file: r.file,
                  date: r.date,
                  label: (r.icon || '🔄') + ' ' + (r.skillLabel || r.skill),
                  meta: {
                    status: r.status,
                    summary: r.summary,
                    findings: r.findings,
                    skill: r.skill
                  }
                };
              });
            } catch (e) {
              console.warn('[YryNotifyPanel] 自循环报告 fetch 失败: ' + e.message);
              return [];
            }
          },
          fetchTrendReports: async function () {
            try {
              var resp = await fetch('../../docs/趋势报告/reports.json');
              if (!resp.ok) throw new Error('HTTP ' + resp.status);
              var data = await resp.json();
              if (!Array.isArray(data)) return [];
              var iconMap = {
                all: '📡',
                'github-trending': '🐙',
                'oss-insight': '📊',
                trendshift: '📈',
                'top-starred': '⭐'
              };
              return data.map(function (r) {
                var src = r.source || '';
                return {
                  file: r.file,
                  date: r.date,
                  source: r.source,
                  label: (iconMap[src] || '📡') + ' ' + (src || 'trend') + ' · ' + r.date,
                  meta: { ok: r.ok, trend: r.trend, items: r.items }
                };
              });
            } catch (e) {
              console.warn('[YryNotifyPanel] 趋势报告 fetch 失败: ' + e.message);
              return [];
            }
          },
          fetchAnalysisReports: async function () {
            try {
              var resp = await fetch('../../docs/项目分析/reports.json');
              if (!resp.ok) throw new Error('HTTP ' + resp.status);
              var data = await resp.json();
              if (!Array.isArray(data)) return [];
              return data.map(function (r) {
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
              console.warn('[YryNotifyPanel] 项目分析 fetch 失败: ' + e.message);
              return [];
            }
          }
        },
        mounted: function () {
          var self = this;
          if (!this.registerWithHub()) {
            // PanelHub 还未加载(yry-panel-hub 还在前面异步 fetch 模板),每 50ms 重试,最多 5s
            var tries = 0,
              maxTries = 100;
            var t = setInterval(function () {
              tries++;
              if (self.registerWithHub() || tries >= maxTries) clearInterval(t);
            }, 50);
          }
        }
      };
    }
  });
})();
