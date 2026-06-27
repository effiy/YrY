/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCronPanel · 调度任务面板 (Vue 3 custom element, full)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-cron-panel/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-cron-panel/index.js"></script>
     <yry-cron-panel></yry-cron-panel>

   行为:
     1) 拉取 ../.claude/scheduled_tasks.json (路径可由 window.YRY_PATHS.scheduledTasks 覆盖)
     2) 渲染 cron 描述、状态、下次触发估算、原始 cron 表达式
     3) 自动注册到 window.PanelHub ('cron')
     4) 派发 yry-cron-panel-ready 事件
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryCronPanel] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TAG_NAME = 'yry-cron-panel';

  var TEMPLATE_ID = 'yry-cron-panel-tpl';

  var READY_EVENT = 'yry-cron-panel-ready';

  var LOAD_TIMEOUT_MS = 5000;

  var DEFAULT_SCHEDULED_TASKS_PATH = '../.claude/scheduled_tasks.json';

  function resolveScheduledTasksPath() {
    if (window.PanelHub && window.PanelHub.PATHS && window.PanelHub.PATHS.scheduledTasks) {
      return window.PanelHub.PATHS.scheduledTasks;
    }
    if (window.YRY_PATHS && window.YRY_PATHS.scheduledTasks) {
      return window.YRY_PATHS.scheduledTasks;
    }
    return DEFAULT_SCHEDULED_TASKS_PATH;
  }

  function cronDescription(expr) {
    var parts = String(expr || '')
      .trim()
      .split(/\s+/);
    if (parts.length !== 5) return expr;
    var m = parts[0],
      h = parts[1],
      dom = parts[2],
      mon = parts[3],
      dow = parts[4];
    if (m.indexOf(',') !== -1 && h === '*' && dom === '*' && mon === '*' && dow === '*')
      return '每小时第 ' + m + ' 分';
    if (m.indexOf('/') === 1 && h === '*' && dom === '*' && mon === '*' && dow === '*') {
      var n = parseInt(m.substring(2), 10);
      if (n) return '每 ' + n + ' 分钟';
    }
    if (/^\d+$/.test(m) && h === '*' && dom === '*' && mon === '*' && dow === '*')
      return '每小时第 ' + m + ' 分';
    if (/^\d+$/.test(m) && /^\d+$/.test(h) && dom === '*' && mon === '*' && dow === '*')
      return '每天 ' + h + ':' + m.padStart(2, '0');
    if (/^\d+$/.test(m) && /^\d+$/.test(h) && /^\d+$/.test(dom) && /^\d+$/.test(mon) && dow === '*')
      return mon + '月' + dom + '日 ' + h + ':' + m.padStart(2, '0');
    if (/^\d+$/.test(m) && /^\d+$/.test(h) && dom === '*' && mon === '*' && dow !== '*') {
      var days = { 0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };
      var dows = dow
        .split(',')
        .map(function (d) {
          return days[d] || d;
        })
        .join(',');
      return '每周' + dows + ' ' + h + ':' + m.padStart(2, '0');
    }
    return expr;
  }

  function cronStatus(item) {
    if (!item || !item.lastFiredAt) return 'idle';
    var now = Date.now();
    var diff = now - item.lastFiredAt;
    try {
      var parts = String(item.cron || '')
        .trim()
        .split(/\s+/);
      if (parts.length !== 5) return 'idle';
      if (parts[0].indexOf('/') === 1) {
        var intervalMin = parseInt(parts[0].substring(2), 10);
        if (intervalMin && diff < intervalMin * 60000 * 2) return 'active';
      }
      if (parts[0].indexOf(',') !== -1 && diff < 3600000) return 'active';
      if (/^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1]) && parts[2] === '*' && diff < 86400000)
        return 'active';
      return diff > 86400000 ? 'idle' : 'active';
    } catch (e) {
      return 'idle';
    }
  }

  function nextFireEstimate(cronExpr, lastFiredAt) {
    try {
      var parts = String(cronExpr || '')
        .trim()
        .split(/\s+/);
      if (parts.length !== 5) return '';
      var m = parts[0],
        h = parts[1],
        dom = parts[2],
        mon = parts[3],
        dow = parts[4];
      var now = new Date();
      var base = lastFiredAt ? new Date(lastFiredAt) : now;
      if (m.indexOf('/') === 1 && h === '*' && dom === '*' && mon === '*' && dow === '*') {
        var interval = parseInt(m.substring(2), 10) || 5;
        var next = new Date(base.getTime() + interval * 60000);
        return next.toISOString().slice(0, 16).replace('T', ' ');
      }
      if (m.indexOf(',') !== -1 && h === '*' && dom === '*' && mon === '*' && dow === '*') {
        var mins = m.split(',').map(Number);
        var curMin = now.getMinutes();
        var nextMin = mins.find(function (x) {
          return x > curMin;
        });
        if (nextMin === undefined) nextMin = mins[0];
        var nextA = new Date(now);
        nextA.setMinutes(nextMin, 0, 0);
        if (nextMin <= curMin) nextA.setHours(nextA.getHours() + 1);
        return nextA.toISOString().slice(0, 16).replace('T', ' ');
      }
      if (/^\d+$/.test(m) && h === '*' && dom === '*' && mon === '*' && dow === '*') {
        var fm = parseInt(m, 10);
        var nextB = new Date(now);
        nextB.setMinutes(fm, 0, 0);
        if (fm <= now.getMinutes()) nextB.setHours(nextB.getHours() + 1);
        return nextB.toISOString().slice(0, 16).replace('T', ' ');
      }
      if (/^\d+$/.test(m) && /^\d+$/.test(h) && dom === '*' && mon === '*' && dow === '*') {
        var nextC = new Date(now);
        nextC.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
        if (nextC <= now) nextC.setDate(nextC.getDate() + 1);
        return nextC.toISOString().slice(0, 16).replace('T', ' ');
      }
      if (/^\d+$/.test(m) && /^\d+$/.test(h) && dom === '*' && mon === '*' && dow !== '*') {
        var days = dow.split(',').map(Number);
        var nextD = new Date(now);
        nextD.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
        var curDay = now.getDay();
        for (var di = 0; di < 7; di++) {
          var checkDay = (curDay + di) % 7;
          if (days.indexOf(checkDay) !== -1) {
            nextD.setDate(nextD.getDate() + di);
            if (di === 0 && nextD <= now) continue;
            return nextD.toISOString().slice(0, 16).replace('T', ' ');
          }
        }
      }
      return '';
    } catch (e) {
      return '';
    }
  }

  function escHtml(s) {
    if (window.PanelHub && typeof window.PanelHub.escHtml === 'function')
      return window.PanelHub.escHtml(s);
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  window.YrYVueCE.define({
    componentName: 'YryCronPanel',
    templateId: 'yry-cron-panel-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryCronPanel',
        template: templateHTML,
        data: function () {
          return {
            cronData: [],
            loading: false,
            error: null
          };
        },
        computed: {
          tasks: function () {
            var self = this;
            return this.cronData.map(function (item) {
              var status = cronStatus(item);
              var isActive = status === 'active';
              var desc = cronDescription(item.cron);
              var created = item.createdAt
                ? new Date(item.createdAt).toISOString().slice(0, 16).replace('T', ' ')
                : '';
              var lastFired = item.lastFiredAt
                ? new Date(item.lastFiredAt).toISOString().slice(0, 16).replace('T', ' ')
                : '未触发';
              var recurring = item.recurring ? '循环' : '单次';
              var nextFire =
                isActive && item.recurring ? nextFireEstimate(item.cron, item.lastFiredAt) : '';
              var prompt = item.prompt || '';
              var promptLong = prompt.length > 80;
              var cdHtml = null;
              if (nextFire) {
                var diffMs = new Date(nextFire) - new Date();
                var diffMin = Math.floor(diffMs / 60000);
                var cdLabel =
                  diffMin < 1
                    ? '即将触发'
                    : diffMin < 60
                      ? diffMin + '分钟后'
                      : diffMin < 1440
                        ? Math.floor(diffMin / 60) + '小时后'
                        : Math.floor(diffMin / 1440) + '天后';
                cdHtml = { label: '⏱ ' + cdLabel, cls: diffMin < 5 ? 'soon' : 'later' };
              }
              return {
                desc: escHtml(desc),
                status: status,
                isActive: isActive,
                created: escHtml(created),
                lastFired: escHtml(lastFired),
                recurring: recurring,
                durable: !!item.durable,
                nextFire: nextFire ? escHtml(nextFire) : '',
                cdHtml: cdHtml,
                prompt: escHtml(prompt),
                promptLong: promptLong,
                cron: escHtml(item.cron)
              };
            });
          }
        },
        methods: {
          fetchCron: async function () {
            this.loading = true;
            this.error = null;
            try {
              var resp = await fetch(resolveScheduledTasksPath());
              if (!resp.ok) throw new Error('HTTP ' + resp.status);
              var data = await resp.json();
              this.cronData = (data.tasks || []).slice().sort(function (a, b) {
                var aAt = a.lastFiredAt || a.createdAt || 0;
                var bAt = b.lastFiredAt || b.createdAt || 0;
                return bAt - aAt;
              });
            } catch (e) {
              this.cronData = [];
              this.error = e.message || String(e);
            }
            this.loading = false;
            this.$nextTick(this._syncExternalCounters);
          },
          _syncExternalCounters: function () {
            var taskCount = document.getElementById('cronTaskCount');
            var badge = document.getElementById('cronBadge');
            if (taskCount)
              taskCount.textContent =
                this.cronData.length > 0 ? this.cronData.length + ' 个任务' : '0 个任务';
            if (badge)
              badge.textContent = this.cronData.length > 0 ? String(this.cronData.length) : '';
          },
          onRefresh: function () {
            this.fetchCron();
          },
          registerWithHub: function () {
            if (window.PanelHub) {
              var self = this;
              window.PanelHub.register('cron', null, 'cronPanel', 'cronOverlay', function () {
                if (self.cronData.length === 0 && !self.loading) self.fetchCron();
              });
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
            new CustomEvent(READY_EVENT, { detail: { component: 'YryCronPanel' } })
          );
        }
      };
    }
  });
})();
